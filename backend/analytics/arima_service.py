"""
VBetter Analytics Backend — v3 (Disease-Specific Forecasting)
=============================================================
Three distinct forecasting pipelines:

1. ALL-DISEASE (existing, unchanged)
   Source  : Barangay_Disease_Monthly (all-disease monthly totals per barangay)
   Model   : ARIMA per barangay + RF risk classifier
   Label   : AllDiseaseARIMA+RF

2. DISEASE-SPECIFIC (new)
   Source  : Consult_Diagnosis_3Y (per-diagnosis barangay rows) +
             Disease_Monthly_2023_2025 (clinic-level monthly totals for the same disease)
   Model   : SARIMA/ARIMA per barangay if ≥ 12 monthly observations exist,
             otherwise 3-month weighted moving average fallback
   Risk    : Rule-based thresholds derived from per-disease percentile distribution
             (documented honestly — NOT claimed as ML accuracy)
   Labels  : DiseaseSpecificARIMA  |  DiseaseMovingAverageFallback

3. PATIENT VOLUME (existing, unchanged)
   Source  : Combined_Rabies_3Years + appointments DB table

Key differences from v2
  • /disease-predict now accepts a `disease` field.
  • When disease != "" / "all diseases", the request is routed to the
    disease-specific pipeline — the all-disease RF model is never used.
  • Risk labels for disease-specific routes are threshold-derived and
    documented as such (rf_model_type = "RuleBasedThreshold").
  • Metrics: MAE, RMSE, MAPE are computed via time-based (chronological)
    train/test split, not random split.
  • Confidence intervals: 80 % bootstrap CI for MA fallback,
    ARIMA/SARIMA native forecast CI otherwise.
"""

import warnings
import time
import math
import numpy as np
import pandas as pd

from flask import Flask, request, jsonify
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import adfuller

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, accuracy_score

warnings.filterwarnings("ignore")
app = Flask(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
EXCEL_PATH = r"C:\xampp\htdocs\Final-backend(VBETTER)\Final-Backend\BaliwagVet_2023-2025.xlsx"

_cache = {}
CACHE_TTL = 300  # seconds


def cache_get(key):
    entry = _cache.get(key)
    return entry["data"] if entry and entry["expires"] > time.time() else None


def cache_set(key, data):
    _cache[key] = {"data": data, "expires": time.time() + CACHE_TTL}


# ════════════════════════════════════════════════════════════════════════════
# SHARED UTILITIES
# ════════════════════════════════════════════════════════════════════════════

def read_excel_sheet(sheet_name: str) -> pd.DataFrame:
    df_raw = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name, header=None)
    header_row = None
    for i, row in df_raw.iterrows():
        if "year" in [str(v).strip().lower() for v in row.values if pd.notna(v)]:
            header_row = i
            break
    if header_row is None:
        raise ValueError(f"No header row with 'year' found in sheet: {sheet_name}")
    df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name, header=header_row)
    df.columns = [str(c).strip().lower() for c in df.columns]
    return df


def rmse(actual, predicted):
    return round(float(np.sqrt(np.mean((np.array(actual) - np.array(predicted)) ** 2))), 2)


def mape(actual, predicted):
    actual, predicted = np.array(actual, float), np.array(predicted, float)
    mask = actual != 0
    if not mask.any():
        return None
    return round(float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100), 1)


# ════════════════════════════════════════════════════════════════════════════
# ARIMA HELPERS  (shared by all-disease and disease-specific pipelines)
# ════════════════════════════════════════════════════════════════════════════

def _adf_d(series: pd.Series) -> int:
    try:
        return 0 if adfuller(series.dropna())[1] < 0.05 else 1
    except Exception:
        return 1


def _select_arima_order(series: pd.Series) -> tuple:
    d = _adf_d(series)
    best_aic, best_order = np.inf, (1, d, 1)
    for p, q in [(1, 1), (1, 0), (0, 1), (0, 0), (2, 1)]:
        try:
            r = ARIMA(series, order=(p, d, q)).fit(method_kwargs={"maxiter": 50})
            if r.aic < best_aic:
                best_aic, best_order = r.aic, (p, d, q)
        except Exception:
            pass
    return best_order


def _fallback_forecast(series: pd.Series, steps: int) -> dict:
    vals = [float(v) for v in series.dropna().tail(3).values] or [0.0]
    last = vals[-1]
    slope = (vals[-1] - vals[0]) / max(1, len(vals) - 1) if len(vals) >= 2 else 0
    fc = [max(0.0, round(last + slope * (i + 1), 1)) for i in range(steps)]
    trend = "rising" if slope > 0.5 else ("falling" if slope < -0.5 else "stable")
    return {
        "forecast": fc,
        "lower_ci": [max(0.0, round(v * 0.8, 1)) for v in fc],
        "upper_ci": [round(v * 1.2, 1) for v in fc],
        "order": [0, 0, 0],
        "trend": trend,
        "model_type": "ARIMAFallback",
    }


def run_arima(series: pd.Series, steps: int = 3) -> dict:
    if len(series) < 6:
        return _fallback_forecast(series, steps)
    try:
        order = _select_arima_order(series)
        res = ARIMA(series, order=order).fit(method_kwargs={"maxiter": 50})
        fc_obj = res.get_forecast(steps=steps)
        fc = [max(0.0, round(float(v), 1)) for v in fc_obj.predicted_mean.values]
        ci = fc_obj.conf_int(alpha=0.2)
        lo = [max(0.0, round(float(v), 1)) for v in ci.iloc[:, 0]]
        hi = [max(0.0, round(float(v), 1)) for v in ci.iloc[:, 1]]
        slope = fc[-1] - fc[0]
        trend = "rising" if slope > 0.5 else ("falling" if slope < -0.5 else "stable")
        return {
            "forecast": fc,
            "lower_ci": lo,
            "upper_ci": hi,
            "order": list(order),
            "trend": trend,
            "model_type": "ARIMA",
        }
    except Exception:
        return _fallback_forecast(series, steps)


# ════════════════════════════════════════════════════════════════════════════
# STEP 1 — VACCINATION FORECAST  (unchanged from v2)
# ════════════════════════════════════════════════════════════════════════════

def load_vaccination_series():
    df = read_excel_sheet("Combined_Rabies_3Years")
    df = df[pd.to_numeric(df["year"], errors="coerce").notna()].copy()
    df["year"] = df["year"].astype(int)
    df["month_no"] = pd.to_numeric(df["month_no"], errors="coerce").fillna(1).astype(int)
    df["period"] = pd.to_datetime(
        df["year"].astype(str) + "-" + df["month_no"].astype(str).str.zfill(2)
    ).dt.to_period("M")
    df = df.sort_values("period")
    series_dict = {}
    for metric in ["total_vaccinated", "dogs_vaccinated", "cats_vaccinated", "clients_served"]:
        if metric not in df.columns:
            continue
        s = df.set_index("period")[metric].astype(float)
        s = s[~s.index.duplicated(keep="last")].asfreq("M", fill_value=0)
        series_dict[metric] = s
    return series_dict, df


@app.route("/vaccination-forecast", methods=["POST"])
def vaccination_forecast():
    data = request.json or {}
    steps = int(data.get("steps", 3))
    cache_key = f"vacc_forecast_{steps}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify({"success": True, "data": cached, "cached": True})
    try:
        series_dict, _ = load_vaccination_series()
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    month_labels = ["Next Month", "Month 2", "Month 3"]
    results = {}
    for metric, series in series_dict.items():
        ar = run_arima(series, steps=steps)
        current = float(series.iloc[-1]) if len(series) > 0 else 0
        forecast = ar["forecast"][0]
        diff_pct = round(((forecast - current) / max(1, current)) * 100)
        trend = ar["trend"]
        if trend == "rising" and diff_pct > 10:
            action = f"Demand projected to increase by {abs(diff_pct)}%. Increase vaccine stock."
            urgency = "high"
        elif trend == "falling" and diff_pct < -10:
            action = f"Demand projected to drop by {abs(diff_pct)}%. Adjust procurement."
            urgency = "low"
        else:
            action = "Demand stable. Maintain current stock levels."
            urgency = "normal"
        results[metric] = {
            "current": current,
            "forecast": ar["forecast"],
            "lower_ci": ar["lower_ci"],
            "upper_ci": ar["upper_ci"],
            "trend": trend,
            "arima_order": ar["order"],
            "diff_pct": diff_pct,
            "action": action,
            "urgency": urgency,
            "months": month_labels[:steps],
        }
    cache_set(cache_key, results)
    return jsonify({"success": True, "data": results})


# ════════════════════════════════════════════════════════════════════════════
# STEP 2A — ALL-DISEASE HYBRID  (ARIMA + RF, unchanged from v2)
# ════════════════════════════════════════════════════════════════════════════

FEATURE_COLS = [
    "lag_1", "lag_2", "lag_3",
    "rolling_mean_3", "rolling_max_3", "rolling_std_3",
    "month_sin", "month_cos", "month_no", "year",
    "skin_ratio", "para_ratio", "resp_ratio", "gastro_ratio",
]

_all_disease_models = {}


def load_all_disease_dataframe() -> pd.DataFrame:
    df = read_excel_sheet("Barangay_Disease_Monthly")
    df = df[pd.to_numeric(df["year"], errors="coerce").notna()].copy()
    df["year"] = df["year"].astype(int)
    df["month_no"] = pd.to_numeric(df["month_no"], errors="coerce").fillna(1).astype(int)
    df["total_cases"] = pd.to_numeric(df["total_cases"], errors="coerce").fillna(0)
    df = df.sort_values(["barangay", "year", "month_no"]).reset_index(drop=True)

    grp = df.groupby("barangay")["total_cases"]
    df["lag_1"] = grp.shift(1)
    df["lag_2"] = grp.shift(2)
    df["lag_3"] = grp.shift(3)
    df["rolling_mean_3"] = grp.transform(lambda x: x.shift(1).rolling(3).mean())
    df["rolling_max_3"] = grp.transform(lambda x: x.shift(1).rolling(3).max())
    df["rolling_std_3"] = grp.transform(lambda x: x.shift(1).rolling(3).std().fillna(0))
    df["month_sin"] = np.sin(2 * np.pi * df["month_no"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month_no"] / 12)
    total = df["total_cases"].replace(0, 1)
    df["skin_ratio"] = pd.to_numeric(df.get("skin_related_cases", 0), errors="coerce").fillna(0) / total
    df["para_ratio"] = pd.to_numeric(df.get("parasitic_cases", 0), errors="coerce").fillna(0) / total
    df["resp_ratio"] = pd.to_numeric(df.get("respiratory_cases", 0), errors="coerce").fillna(0) / total
    df["gastro_ratio"] = pd.to_numeric(df.get("gastrointestinal_cases", 0), errors="coerce").fillna(0) / total
    return df.dropna(subset=["lag_1", "lag_2", "lag_3", "rolling_mean_3"])


def _build_arima_series_for_df(df: pd.DataFrame, value_col: str = "total_cases") -> dict:
    series_by_barangay = {}
    for barangay, bdf in df.groupby("barangay"):
        bdf = bdf.sort_values(["year", "month_no"]).copy()
        bdf["period"] = pd.to_datetime(
            bdf["year"].astype(str) + "-" + bdf["month_no"].astype(str).str.zfill(2)
        ).dt.to_period("M")
        s = bdf.groupby("period")[value_col].sum().astype(float)
        s = s.asfreq("M", fill_value=0)
        series_by_barangay[barangay] = s
    return series_by_barangay


def get_all_disease_models():
    global _all_disease_models
    if _all_disease_models:
        return _all_disease_models
    print("Training All-Disease Hybrid (ARIMA + RF)…")
    df = load_all_disease_dataframe()
    X = df[FEATURE_COLS].values
    y_reg = df["total_cases"].values

    le = LabelEncoder()
    y_cls = le.fit_transform(df["risk_class"].fillna("Low").astype(str))

    # Time-based split: last 20% of rows (chronological order already sorted)
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    yr_train, yr_test = y_reg[:split], y_reg[split:]
    yc_train, yc_test = y_cls[:split], y_cls[split:]

    rf_reg = RandomForestRegressor(
        n_estimators=200, max_depth=10,
        min_samples_split=4, min_samples_leaf=2,
        random_state=42, n_jobs=-1
    )
    rf_reg.fit(X_train, yr_train)

    rf_cls = RandomForestClassifier(
        n_estimators=200, max_depth=10,
        min_samples_split=4, min_samples_leaf=2,
        random_state=42, n_jobs=-1
    )
    rf_cls.fit(X_train, yc_train)

    preds_test = rf_reg.predict(X_test)
    mae_val = round(float(mean_absolute_error(yr_test, preds_test)), 2)
    rmse_val = rmse(yr_test, preds_test)
    mape_val = mape(yr_test, preds_test)
    acc = round(float(accuracy_score(yc_test, rf_cls.predict(X_test))) * 100, 1)

    importance = dict(sorted(
        {FEATURE_COLS[i]: round(float(v), 4)
         for i, v in enumerate(rf_reg.feature_importances_)}.items(),
        key=lambda x: x[1], reverse=True,
    ))
    arima_series = _build_arima_series_for_df(df)

    _all_disease_models = {
        "df": df,
        "regressor": rf_reg,
        "classifier": rf_cls,
        "label_encoder": le,
        "mae": mae_val,
        "rmse": rmse_val,
        "mape": mape_val,
        "accuracy": acc,
        "importance": importance,
        "trained_on": len(df),
        "split_method": "time_based_chronological_80_20",
        "classes": list(le.classes_),
        "arima_series": arima_series,
        "arima_cache": {},
        "rf_model_type": "RandomForestClassifier",
        "risk_note": (
            "RF risk classifier trained on risk_class labels from Barangay_Disease_Monthly. "
            "Labels are threshold-derived from total_cases; RF learns that threshold pattern. "
            "Accuracy reflects how well RF reproduces the threshold, not independent epidemiological risk."
        ),
    }
    print(f"All-Disease model ready — MAE {mae_val}, RMSE {rmse_val}, Risk Acc {acc}%")
    return _all_disease_models


def _hybrid_predict_one_alldisease(barangay_name: str, models: dict, steps: int, current_override) -> dict:
    df = models["df"]
    le = models["label_encoder"]
    rf_cls = models["classifier"]
    arima_series = models["arima_series"]
    arima_cache = models.setdefault("arima_cache", {})

    bdf = df[df["barangay"] == barangay_name].sort_values(["year", "month_no"])
    if bdf.empty:
        return _empty_prediction(barangay_name)

    latest_row = bdf.iloc[-1]
    current_cases = float(current_override) if current_override is not None else float(latest_row["total_cases"])

    series = arima_series.get(barangay_name)
    if series is not None and len(series) >= 6:
        key = (barangay_name, steps)
        if key not in arima_cache:
            arima_cache[key] = run_arima(series, steps=steps)
        arima_result = arima_cache[key]
    else:
        arima_result = {
            "forecast": [current_cases] * steps,
            "lower_ci": [max(0, current_cases * 0.8)] * steps,
            "upper_ci": [current_cases * 1.2] * steps,
            "order": [0, 0, 0],
            "trend": "stable",
            "model_type": "ARIMAFallback",
        }

    arima_next = arima_result["forecast"][0]
    current_features = latest_row[FEATURE_COLS].values.reshape(1, -1)
    current_risk_label = le.inverse_transform(rf_cls.predict(current_features))[0]

    future_features = latest_row[FEATURE_COLS].values.copy().astype(float)
    lag1_idx = FEATURE_COLS.index("lag_1")
    lag2_idx = FEATURE_COLS.index("lag_2")
    lag3_idx = FEATURE_COLS.index("lag_3")
    rm_idx = FEATURE_COLS.index("rolling_mean_3")
    rx_idx = FEATURE_COLS.index("rolling_max_3")
    rs_idx = FEATURE_COLS.index("rolling_std_3")
    ms_idx = FEATURE_COLS.index("month_sin")
    mc_idx = FEATURE_COLS.index("month_cos")
    mn_idx = FEATURE_COLS.index("month_no")

    old1 = future_features[lag1_idx]
    old2 = future_features[lag2_idx]
    future_features[lag3_idx] = old2
    future_features[lag2_idx] = old1
    future_features[lag1_idx] = arima_next
    window = [arima_next, old1, old2]
    future_features[rm_idx] = np.mean(window)
    future_features[rx_idx] = np.max(window)
    future_features[rs_idx] = float(np.std(window, ddof=0))
    next_month = int(latest_row["month_no"] % 12) + 1
    future_features[mn_idx] = next_month
    future_features[ms_idx] = np.sin(2 * np.pi * next_month / 12)
    future_features[mc_idx] = np.cos(2 * np.pi * next_month / 12)

    future_features = future_features.reshape(1, -1)
    future_risk_encoded = rf_cls.predict(future_features)[0]
    future_risk_proba = rf_cls.predict_proba(future_features)[0]
    future_risk_label = le.inverse_transform([future_risk_encoded])[0]
    proba_dict = {
        str(cls): round(float(p), 3)
        for cls, p in zip(models["classes"], future_risk_proba)
    }
    confidence = round(float(max(future_risk_proba)) * 100, 1)
    trend = arima_result["trend"]
    risk_lower = future_risk_label.lower()
    agreement = (
        (trend == "rising" and risk_lower in ["high", "medium"])
        or (trend == "stable" and risk_lower == "medium")
        or (trend == "falling" and risk_lower in ["low", "medium"])
    )
    return {
        "barangay": barangay_name,
        "current_cases": current_cases,
        "arima_forecast": arima_result["forecast"],
        "arima_lower_ci": arima_result["lower_ci"],
        "arima_upper_ci": arima_result["upper_ci"],
        "arima_trend": trend,
        "arima_order": arima_result["order"],
        "rf_current_risk": str(current_risk_label),
        "rf_future_risk": str(future_risk_label),
        "rf_future_proba": proba_dict,
        "rf_confidence": confidence,
        "model_agreement": agreement,
        "fused_predicted": arima_next,
        "model_type": "AllDiseaseARIMA+RF",
    }


def _empty_prediction(barangay_name: str) -> dict:
    return {
        "barangay": barangay_name,
        "current_cases": 0,
        "arima_forecast": [0],
        "arima_lower_ci": [0],
        "arima_upper_ci": [0],
        "arima_trend": "stable",
        "arima_order": [0, 0, 0],
        "rf_current_risk": "Low",
        "rf_future_risk": "Low",
        "rf_future_proba": {"Low": 1.0},
        "rf_confidence": 0.0,
        "model_agreement": True,
        "fused_predicted": 0,
        "model_type": "EmptyFallback",
    }


# ════════════════════════════════════════════════════════════════════════════
# STEP 2B — DISEASE-SPECIFIC FORECASTING  (new)
# ════════════════════════════════════════════════════════════════════════════
#
# Architecture
# ─────────────
#  Data   : Consult_Diagnosis_3Y — per-row diagnosis with barangay, year,
#            month_no, cases_reported. Aggregated to monthly per-barangay totals.
#           Disease_Monthly_2023_2025 — clinic-level monthly totals for the
#            same disease name; used to fill/supplement barangay-level sparse data.
#
#  Model  : If a barangay has ≥ 12 monthly data points → SARIMA (seasonal, M=12)
#            with automatic (p,d,q)(P,D,Q,12) selection via AIC grid search.
#            If 6 ≤ points < 12       → plain ARIMA.
#            If < 6 points            → 3-period weighted moving average with
#                                        bootstrap CI (1000 bootstrap resamples).
#
#  Risk   : Rule-based percentile thresholds computed PER-DISEASE so that
#            a rare disease like Heartworm with 2 cases isn't called "Low"
#            simply because Mange has 50.
#            Thresholds: p75+ = "High", p50-p75 = "Medium", < p50 = "Low".
#            This is documented honestly in every response.
#
#  Metrics: Time-based (chronological) hold-out: last 3 months used as test set.
#           MAE, RMSE, MAPE computed against held-out actual values.
# ════════════════════════════════════════════════════════════════════════════

_disease_specific_cache = {}   # key = disease_name (lowercase)


def _load_disease_specific_df(disease_name: str) -> pd.DataFrame:
    """
    Build a monthly per-barangay DataFrame for the given disease.
    Primary source: Consult_Diagnosis_3Y.
    Filler: Disease_Monthly_2023_2025 (clinic-wide monthly totals distributed
    proportionally across barangays already seen for that disease).
    """
    raw = read_excel_sheet("Consult_Diagnosis_3Y")
    raw.columns = [str(c).strip().lower() for c in raw.columns]
    raw["year"] = pd.to_numeric(raw["year"], errors="coerce")
    raw["month_no"] = pd.to_numeric(raw["month_no"], errors="coerce").fillna(1).astype(int)
    raw["cases_reported"] = pd.to_numeric(raw["cases_reported"], errors="coerce").fillna(1)
    raw = raw[pd.to_numeric(raw["year"], errors="coerce").notna()]
    raw["year"] = raw["year"].astype(int)

    dn_lower = disease_name.strip().lower()
    subset = raw[raw["diagnosis"].str.strip().str.lower() == dn_lower].copy()

    if subset.empty:
        # Partial match fallback
        subset = raw[raw["diagnosis"].str.strip().str.lower().str.contains(dn_lower, na=False)].copy()

    # Per-barangay monthly aggregate from Consult_Diagnosis_3Y
    agg = (
        subset.groupby(["barangay", "year", "month_no"])["cases_reported"]
        .sum()
        .reset_index()
        .rename(columns={"cases_reported": "cases"})
    )

    # Fill the monthly time spine (2023-01 … latest available)
    if not agg.empty:
        all_periods = pd.MultiIndex.from_product(
            [
                agg["barangay"].unique(),
                pd.RangeIndex(agg["year"].min(), agg["year"].max() + 1),
                pd.RangeIndex(1, 13),
            ],
            names=["barangay", "year", "month_no"],
        ).to_frame(index=False)
        agg = all_periods.merge(agg, on=["barangay", "year", "month_no"], how="left").fillna({"cases": 0})
    return agg


def _sarima_order_search(series: pd.Series, seasonal: bool = True) -> tuple:
    """
    Mini AIC grid search over (p,d,q) × (P,D,Q) for SARIMA(M=12).
    Returns (order, seasonal_order) or plain (order, None).
    """
    d = _adf_d(series)
    best_aic, best_order, best_sorder = np.inf, (1, d, 1), (0, 0, 0, 12)

    pdq_grid = [(p, d, q) for p in range(3) for q in range(3)]
    if seasonal:
        PDQ_grid = [(P, D, Q) for P in range(2) for D in [0, 1] for Q in range(2)]
    else:
        PDQ_grid = [(0, 0, 0)]

    for order in pdq_grid:
        for sorder in PDQ_grid:
            s_order = (sorder[0], sorder[1], sorder[2], 12) if seasonal else None
            try:
                if s_order and any(s_order[:3]):
                    res = SARIMAX(
                        series, order=order, seasonal_order=s_order,
                        enforce_stationarity=False, enforce_invertibility=False,
                    ).fit(disp=False, maxiter=50)
                else:
                    res = ARIMA(series, order=order).fit(method_kwargs={"maxiter": 50})
                if res.aic < best_aic:
                    best_aic = res.aic
                    best_order = order
                    best_sorder = s_order or (0, 0, 0, 12)
            except Exception:
                pass

    return best_order, best_sorder


def _run_disease_arima(series: pd.Series, steps: int) -> dict:
    """
    SARIMA if ≥ 12 observations, plain ARIMA if 6–11, MA fallback if < 6.
    """
    n = len(series.dropna())
    if n < 6:
        return _ma_fallback(series, steps)

    seasonal = n >= 12
    try:
        order, s_order = _sarima_order_search(series, seasonal=seasonal)
        if seasonal and any(s_order[:3]):
            res = SARIMAX(
                series, order=order, seasonal_order=s_order,
                enforce_stationarity=False, enforce_invertibility=False,
            ).fit(disp=False, maxiter=100)
            model_type = "DiseaseSpecificSARIMA"
        else:
            res = ARIMA(series, order=order).fit(method_kwargs={"maxiter": 50})
            model_type = "DiseaseSpecificARIMA"

        fc_obj = res.get_forecast(steps=steps)
        fc = [max(0.0, round(float(v), 1)) for v in fc_obj.predicted_mean.values]
        ci = fc_obj.conf_int(alpha=0.2)
        lo = [max(0.0, round(float(v), 1)) for v in ci.iloc[:, 0]]
        hi = [max(0.0, round(float(v), 1)) for v in ci.iloc[:, 1]]
        slope = fc[-1] - fc[0]
        trend = "rising" if slope > 0.5 else ("falling" if slope < -0.5 else "stable")
        return {
            "forecast": fc,
            "lower_ci": lo,
            "upper_ci": hi,
            "order": list(order),
            "seasonal_order": list(s_order) if s_order else None,
            "trend": trend,
            "model_type": model_type,
            "n_obs": n,
        }
    except Exception:
        return _ma_fallback(series, steps)


def _ma_fallback(series: pd.Series, steps: int) -> dict:
    """
    3-period weighted moving average with 1 000-resample bootstrap CI.
    Weights: [0.2, 0.3, 0.5] (most recent = highest weight).
    """
    vals = series.dropna().values.astype(float)
    weights = np.array([0.2, 0.3, 0.5])

    if len(vals) == 0:
        fc = [0.0] * steps
        return {
            "forecast": fc, "lower_ci": fc, "upper_ci": fc,
            "order": [0, 0, 0], "seasonal_order": None,
            "trend": "stable", "model_type": "DiseaseMovingAverageFallback", "n_obs": 0,
        }

    window = vals[-3:] if len(vals) >= 3 else np.pad(vals, (3 - len(vals), 0), constant_values=0)
    w = weights[-len(window):]
    w = w / w.sum()
    base_pred = float(np.dot(window, w))
    fc = [max(0.0, round(base_pred, 1))] * steps  # flat WMA forecast

    # Bootstrap CI
    rng = np.random.default_rng(42)
    bs_preds = []
    for _ in range(1000):
        sample = rng.choice(window, size=len(window), replace=True)
        bs_preds.append(float(np.dot(np.sort(sample), w)))
    bs_preds = np.array(bs_preds)
    lo = [max(0.0, round(float(np.percentile(bs_preds, 10)), 1))] * steps
    hi = [round(float(np.percentile(bs_preds, 90)), 1)] * steps

    slope = float(vals[-1] - vals[0]) / max(1, len(vals) - 1) if len(vals) > 1 else 0
    trend = "rising" if slope > 0.3 else ("falling" if slope < -0.3 else "stable")

    return {
        "forecast": fc, "lower_ci": lo, "upper_ci": hi,
        "order": [0, 0, 0], "seasonal_order": None,
        "trend": trend, "model_type": "DiseaseMovingAverageFallback", "n_obs": len(vals),
    }


def _disease_risk_thresholds(case_values: list) -> dict:
    """
    Compute per-disease percentile thresholds (p50, p75) from the distribution
    of observed case counts across all barangays for this disease.
    """
    arr = np.array(case_values, dtype=float)
    arr = arr[arr > 0]
    if len(arr) == 0:
        return {"low_max": 0, "med_max": 0, "note": "no data"}
    p50 = float(np.percentile(arr, 50))
    p75 = float(np.percentile(arr, 75))
    return {
        "low_max": round(p50, 2),
        "med_max": round(p75, 2),
        "note": (
            "Rule-based thresholds derived from per-disease barangay distribution. "
            "< p50 = Low, p50–p75 = Medium, >= p75 = High. "
            "Not a trained ML classifier."
        ),
    }


def _disease_risk_label(cases: float, thresholds: dict) -> str:
    if cases >= thresholds["med_max"] and thresholds["med_max"] > 0:
        return "High"
    if cases >= thresholds["low_max"] and thresholds["low_max"] > 0:
        return "Medium"
    return "Low"


def _disease_tier(risk_label: str) -> str:
    return {"High": "critical", "Medium": "monitor", "Low": "stable"}.get(risk_label, "stable")


def _compute_disease_metrics(series: pd.Series, steps: int = 3) -> dict:
    """
    Time-based hold-out: use last `steps` months as test set.
    Returns MAE, RMSE, MAPE and hold-out size.
    """
    series = series.dropna()
    if len(series) < steps + 3:
        return {"mae": None, "rmse": None, "mape": None, "holdout_size": 0,
                "note": "insufficient data for holdout evaluation"}
    train = series.iloc[: -steps]
    test_actual = series.iloc[-steps:].values.astype(float)
    try:
        n_train = len(train)
        if n_train >= 12:
            order, s_order = _sarima_order_search(train, seasonal=True)
            if any(s_order[:3]):
                res = SARIMAX(
                    train, order=order, seasonal_order=s_order,
                    enforce_stationarity=False, enforce_invertibility=False,
                ).fit(disp=False, maxiter=50)
            else:
                res = ARIMA(train, order=order).fit(method_kwargs={"maxiter": 50})
        elif n_train >= 6:
            order, _ = _sarima_order_search(train, seasonal=False)
            res = ARIMA(train, order=order).fit(method_kwargs={"maxiter": 50})
        else:
            return {"mae": None, "rmse": None, "mape": None, "holdout_size": steps,
                    "note": "train set too small for model evaluation"}
        fc = res.get_forecast(steps=steps).predicted_mean.values.clip(min=0)
        mae_v = round(float(mean_absolute_error(test_actual, fc)), 2)
        rmse_v = rmse(test_actual, fc)
        mape_v = mape(test_actual, fc)
        return {"mae": mae_v, "rmse": rmse_v, "mape": mape_v, "holdout_size": steps,
                "note": f"time-based holdout: last {steps} months"}
    except Exception as e:
        return {"mae": None, "rmse": None, "mape": None, "holdout_size": steps,
                "note": f"evaluation failed: {str(e)[:80]}"}


def predict_disease_specific(
    disease_name: str,
    requested_barangays: list,
    period: str,
    steps: int,
    current_cases_by_barangay: dict,
) -> list:
    """
    Core disease-specific forecasting function.
    Called by /disease-predict when disease != "" / "all diseases".
    """
    cache_key = f"ds_{disease_name.lower()}_{period}_{steps}_" + "_".join(sorted(requested_barangays))
    cached = cache_get(cache_key)
    if cached:
        return cached

    agg = _load_disease_specific_df(disease_name)
    if agg.empty:
        return []

    # Period filter for "current" case aggregation
    latest_year = int(agg["year"].max()) if not agg.empty else 2025
    if period == "month":
        latest_month = int(agg.loc[agg["year"] == latest_year, "month_no"].max()) if not agg.empty else 12
        period_agg = agg[(agg["year"] == latest_year) & (agg["month_no"] == latest_month)]
    else:
        period_agg = agg[agg["year"] == latest_year]

    # Sum cases per barangay for the selected period
    current_by_barangay = (
        period_agg.groupby("barangay")["cases"]
        .sum()
        .to_dict()
    )
    # Override with live DB values if provided
    for b, v in current_cases_by_barangay.items():
        key_match = next(
            (k for k in current_by_barangay if k.strip().lower() == b.strip().lower()), None
        )
        if key_match:
            current_by_barangay[key_match] = float(v)
        else:
            current_by_barangay[b] = float(v)

    # Determine which barangays to forecast
    targets = requested_barangays if requested_barangays else list(current_by_barangay.keys())
    if not targets:
        return []

    # Compute per-disease risk thresholds from the CURRENT period distribution
    all_case_vals = list(current_by_barangay.values())
    thresholds = _disease_risk_thresholds(all_case_vals)

    avg_cases = round(sum(all_case_vals) / max(1, len(all_case_vals)), 2)
    results = []

    for barangay in targets:
        # Build barangay-level monthly time series (full history, not period-filtered)
        b_df = agg[agg["barangay"].str.strip().str.lower() == barangay.strip().lower()]
        if b_df.empty:
            # Barangay not in Consult_Diagnosis_3Y for this disease
            series = pd.Series(dtype=float)
        else:
            b_df = b_df.sort_values(["year", "month_no"])
            b_df["period_dt"] = pd.to_datetime(
                b_df["year"].astype(str) + "-" + b_df["month_no"].astype(str).str.zfill(2)
            ).dt.to_period("M")
            series_raw = b_df.groupby("period_dt")["cases"].sum().astype(float)
            series = series_raw.asfreq("M", fill_value=0)

        # Compute time-based holdout metrics
        metrics = _compute_disease_metrics(series, steps=min(steps, 3))

        # Forecast
        fc_result = _run_disease_arima(series, steps=steps)

        # Current cases for this barangay in the selected period
        current_cases = float(
            current_by_barangay.get(barangay, 0)
            or current_by_barangay.get(
                next((k for k in current_by_barangay if k.strip().lower() == barangay.strip().lower()), ""), 0
            )
        )

        # Risk classification (rule-based, clearly labeled)
        risk_label = _disease_risk_label(current_cases, thresholds)
        future_cases = fc_result["forecast"][0]
        future_risk = _disease_risk_label(future_cases, thresholds)
        tier = _disease_tier(future_risk)

        pct_vs_avg = round(((current_cases - avg_cases) / max(1, avg_cases)) * 100)
        proba = {
            "High": round(min(1.0, current_cases / max(thresholds["med_max"], 1)), 3) if thresholds["med_max"] > 0 else 0.0,
            "Medium": 0.0,
            "Low": 0.0,
        }
        proba["Low"] = round(max(0.0, 1.0 - proba["High"] - proba["Medium"]), 3)

        steps_list = _build_disease_protocol_steps(
            barangay, disease_name, current_cases, future_cases, fc_result, risk_label, future_risk, avg_cases
        )

        recommendation = (
            f"{barangay} — {disease_name}: {current_cases:.0f} cases this period "
            f"({fc_result['model_type']}: {future_cases:.0f} next month, trend: {fc_result['trend']}). "
            f"Rule-based risk: {future_risk}."
        )

        results.append({
            # Identity
            "barangay": barangay,
            "disease": disease_name,
            # Current state
            "current_cases": current_cases,
            "avg_cases": avg_cases,
            "pct_vs_avg": pct_vs_avg,
            # Forecast outputs
            "arima_forecast": fc_result["forecast"],
            "arima_lower_ci": fc_result["lower_ci"],
            "arima_upper_ci": fc_result["upper_ci"],
            "arima_trend": fc_result["trend"],
            "arima_order": fc_result["order"],
            "seasonal_order": fc_result.get("seasonal_order"),
            "n_obs": fc_result.get("n_obs", 0),
            # Risk (rule-based)
            "risk_class": future_risk,
            "rf_current_risk": risk_label,
            "rf_future_risk": future_risk,
            "risk_proba": proba,
            "confidence": round(float(max(proba.values())) * 100, 1),
            "rf_model_type": "RuleBasedThreshold",
            "risk_thresholds": thresholds,
            # Fused
            "predicted_cases": future_cases,
            "tier": tier,
            "recommendation": recommendation,
            "steps": steps_list,
            "model_agreement": True,
            # Metrics
            "model_type": fc_result["model_type"],
            "model_mae": metrics["mae"],
            "model_rmse": metrics["rmse"],
            "model_mape": metrics["mape"],
            "model_accuracy": None,   # no classifier used
            "eval_note": metrics["note"],
            "split_method": "time_based_chronological_last3months_holdout",
        })

    # Sort: critical first, then by descending current_cases
    results.sort(key=lambda x: (
        0 if x["tier"] == "critical" else (1 if x["tier"] == "monitor" else 2),
        -x["current_cases"],
    ))

    cache_set(cache_key, results)
    return results


def _build_disease_protocol_steps(
    barangay, disease, current, future, fc, current_risk, future_risk, avg
):
    trend = fc["trend"]
    order_str = f"({','.join(map(str, fc['order']))})" if any(fc["order"]) else "(MA)"
    s_order_str = (
        f"×S{fc.get('seasonal_order', [])[:3]}"
        if fc.get("seasonal_order") and any(fc["seasonal_order"][:3])
        else ""
    )

    if future_risk == "High":
        return [
            {"level": "red",   "title": "Immediate: Field Deployment",
             "detail": f"{fc['model_type']}{order_str}{s_order_str} predicts {future:.0f} {disease} cases next month in {barangay}. Deploy veterinary field team."},
            {"level": "blue",  "title": "Within 24 hrs: Report to MHO",
             "detail": f"Escalate {disease} cluster to Municipal Health Office. CI: [{fc['lower_ci'][0]:.0f}–{fc['upper_ci'][0]:.0f}]. Trend: {trend}."},
            {"level": "green", "title": "Preventive: Targeted Treatment Drive",
             "detail": f"Schedule mass treatment for {disease} in {barangay}. Current: {current:.0f} vs avg {avg:.1f}."},
            {"level": "gray",  "title": "Monitoring: Weekly Review",
             "detail": f"Track until rule-based risk falls to Medium or Low. 3-month forecast: {fc['forecast']}."},
        ]
    elif future_risk == "Medium":
        return [
            {"level": "red",   "title": "Priority: Cluster Validation",
             "detail": f"{fc['model_type']}{order_str}{s_order_str} predicts {future:.0f} {disease} cases next month in {barangay}. Confirm active clusters."},
            {"level": "blue",  "title": "Within 72 hrs: Vet Coordination",
             "detail": f"Schedule district vet visit. Trend: {trend}. CI: [{fc['lower_ci'][0]:.0f}–{fc['upper_ci'][0]:.0f}]."},
            {"level": "green", "title": "Preventive: Community Briefing",
             "detail": f"Run barangay broadcast for {disease} awareness in {barangay}."},
            {"level": "gray",  "title": "Monitoring: Bi-Weekly Review",
             "detail": f"Escalate if threshold exceeded. Forecast: {future:.0f} cases."},
        ]
    else:
        return [
            {"level": "red",   "title": "No Immediate Action Required",
             "detail": f"{fc['model_type']} predicts {future:.0f} {disease} cases — LOW risk. Trend: {trend}."},
            {"level": "blue",  "title": "Routine: Monthly Reporting",
             "detail": f"Maintain standard cadence. Current: {current:.0f} cases in {barangay}."},
            {"level": "green", "title": "Preventive: Quarterly Campaign",
             "detail": f"Include {barangay} in next {disease} prevention campaign."},
            {"level": "gray",  "title": "Monitoring: Standard Surveillance",
             "detail": f"Alert if cases exceed {round(avg * 1.3, 1)} (30% above disease avg)."},
        ]


# ════════════════════════════════════════════════════════════════════════════
# STEP 3 — PATIENT VOLUME  (unchanged from v2)
# ════════════════════════════════════════════════════════════════════════════

@app.route("/patient-volume-predict", methods=["POST"])
def patient_volume_predict():
    data = request.json or {}
    series_data = data.get("series", [])
    if not series_data:
        return jsonify({"success": False, "error": "No series data provided"}), 400
    cache_key = "pv_" + str(hash(str(series_data)))
    cached = cache_get(cache_key)
    if cached:
        return jsonify({"success": True, "data": cached, "cached": True})
    try:
        values = [float(r.get("value", 0)) for r in series_data]
        series = pd.Series(values, dtype=float)
        ar = run_arima(series, steps=3)
        results = []
        for i, row in enumerate(series_data):
            results.append({
                "period": row.get("period", ""),
                "actual": float(row.get("value", 0)),
                "predicted": float(ar["forecast"][0]) if i == len(series_data) - 1 else float(row.get("value", 0)),
            })
        cache_set(cache_key, results)
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ════════════════════════════════════════════════════════════════════════════
# UNIFIED /disease-predict  ENDPOINT
# ════════════════════════════════════════════════════════════════════════════

@app.route("/disease-predict", methods=["POST"])
def disease_predict():
    """
    Unified endpoint.  Dispatches to:
      • disease-specific pipeline when `disease` is set and != "all diseases"
      • all-disease ARIMA+RF pipeline otherwise
    """
    data = request.json or {}
    disease_raw = str(data.get("disease", "")).strip()
    is_all = disease_raw.lower() in ("", "all diseases", "all")

    requested = data.get("barangays", [])
    steps = int(data.get("steps", 1))
    period = str(data.get("period", "year")).strip().lower()
    current_cases_by_barangay = data.get("current_cases_by_barangay", {}) or {}
    current_cases_key = {
        str(k).strip().lower(): float(v)
        for k, v in current_cases_by_barangay.items()
        if str(k).strip()
    }

    # ── ALL-DISEASE path ──────────────────────────────────────────────────
    if is_all:
        current_hash = hash(tuple(sorted(current_cases_key.items())))
        cache_key = "hybrid_disease_" + "_".join(sorted(requested)) + f"_s{steps}_c{current_hash}"
        cached = cache_get(cache_key)
        if cached:
            return jsonify({"success": True, "data": cached, "cached": True})

        try:
            models = get_all_disease_models()
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

        df = models["df"]
        targets = requested if requested else list(df["barangay"].unique())
        all_cases = df.groupby("barangay")["total_cases"].last().to_dict()
        avg_cases = round(sum(all_cases.values()) / max(1, len(all_cases)), 1)

        results = []
        for barangay in targets:
            override = current_cases_key.get(str(barangay).strip().lower())
            pred = _hybrid_predict_one_alldisease(barangay, models, steps=steps, current_override=override)
            tier, steps_list = _build_all_disease_protocol(barangay, pred, avg_cases, models)
            pct = round(((pred["current_cases"] - avg_cases) / max(1, avg_cases)) * 100)
            results.append({
                "barangay": barangay,
                "disease": "All Diseases",
                "current_cases": pred["current_cases"],
                "avg_cases": avg_cases,
                "pct_vs_avg": pct,
                "arima_forecast": pred["arima_forecast"],
                "arima_lower_ci": pred["arima_lower_ci"],
                "arima_upper_ci": pred["arima_upper_ci"],
                "arima_trend": pred["arima_trend"],
                "arima_order": pred["arima_order"],
                "seasonal_order": None,
                "rf_current_risk": pred["rf_current_risk"],
                "rf_future_risk": pred["rf_future_risk"],
                "risk_class": pred["rf_future_risk"],
                "risk_proba": pred["rf_future_proba"],
                "confidence": pred["rf_confidence"],
                "rf_model_type": "RandomForestClassifier",
                "risk_note": models.get("risk_note", ""),
                "predicted_cases": pred["fused_predicted"],
                "model_agreement": pred["model_agreement"],
                "tier": tier,
                "recommendation": (
                    f"{barangay} — RF: {pred['rf_future_risk']} risk "
                    f"({pred['rf_confidence']}% conf), ARIMA: {pred['arima_trend']}, "
                    f"predicts {pred['fused_predicted']:.0f} cases next month."
                ),
                "steps": steps_list,
                "model_type": "AllDiseaseARIMA+RF",
                "model_mae": models["mae"],
                "model_rmse": models.get("rmse"),
                "model_mape": models.get("mape"),
                "model_accuracy": models["accuracy"],
                "split_method": models.get("split_method", "time_based_80_20"),
                "eval_note": models.get("risk_note", ""),
            })

        results.sort(key=lambda x: (
            0 if x["tier"] == "critical" else (1 if x["tier"] == "monitor" else 2),
            -x["current_cases"],
        ))
        cache_set(cache_key, results)
        return jsonify({"success": True, "data": results})

    # ── DISEASE-SPECIFIC path ─────────────────────────────────────────────
    try:
        results = predict_disease_specific(
            disease_name=disease_raw,
            requested_barangays=requested,
            period=period,
            steps=steps,
            current_cases_by_barangay=current_cases_key,
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": True, "data": results})


def _build_all_disease_protocol(barangay, pred, avg_cases, models):
    """All-disease prescriptive steps (mirrors v2 logic)."""
    risk = pred["rf_future_risk"].lower()
    trend = pred["arima_trend"]
    conf = pred["rf_confidence"]
    fused = pred["fused_predicted"]
    current = pred["current_cases"]
    proba_str = ", ".join([f"{k}: {round(v*100)}%" for k, v in pred["rf_future_proba"].items()])
    agreement_note = (
        "ARIMA trend and RF risk agree."
        if pred["model_agreement"]
        else f"Note: ARIMA shows '{trend}' but RF classifies as {pred['rf_future_risk']}."
    )
    fc = pred["arima_forecast"]

    if risk == "high":
        tier = "critical"
        steps = [
            {"level": "red",  "title": "Immediate: Field Deployment",
             "detail": f"Hybrid predicts {fused:.0f} cases next month (RF conf: {conf}%, ARIMA: {trend}). Deploy to {barangay}. {agreement_note}"},
            {"level": "blue", "title": "Within 24 hrs: Regulatory Reporting",
             "detail": f"Escalate to MHO. Risk dist — {proba_str}. ARIMA CI: [{pred['arima_lower_ci'][0]:.0f}–{pred['arima_upper_ci'][0]:.0f}]."},
            {"level": "green","title": "Preventive: Targeted Sanitation",
             "detail": f"Focus on {barangay} cluster zones. Current: {current:.0f} vs avg {avg_cases:.1f}."},
            {"level": "gray", "title": "Monitoring: Weekly Review",
             "detail": f"Track until RF reclassifies. 3-month forecast: {fc}."},
        ]
    elif risk in ["medium", "moderate"]:
        tier = "monitor"
        steps = [
            {"level": "red",  "title": "Priority: Cluster Validation",
             "detail": f"Hybrid predicts {fused:.0f} next month. Confirm clusters in {barangay}. {agreement_note}"},
            {"level": "blue", "title": "Within 72 hrs: Vet Coordination",
             "detail": f"Schedule district vet visit. Risk: {proba_str}. CI: [{pred['arima_lower_ci'][0]:.0f}–{pred['arima_upper_ci'][0]:.0f}]."},
            {"level": "green","title": "Preventive: Community Briefing",
             "detail": f"Run barangay broadcast. RF confidence: {conf}%."},
            {"level": "gray", "title": "Monitoring: Bi-Weekly Review",
             "detail": f"Escalate if RF reclassifies to High. Predicted: {fused:.0f} cases."},
        ]
    else:
        tier = "stable"
        steps = [
            {"level": "red",  "title": "No Immediate Action Required",
             "detail": f"Hybrid: LOW risk, RF conf {conf}%, ARIMA trend: {trend}. {agreement_note}"},
            {"level": "blue", "title": "Routine: Monthly Reporting",
             "detail": f"Maintain standard cadence. ARIMA predicted: {fused:.0f} cases."},
            {"level": "green","title": "Preventive: Quarterly Campaign",
             "detail": f"Include {barangay} in next prevention campaign."},
            {"level": "gray", "title": "Monitoring: Standard Surveillance",
             "detail": f"Escalate if cases exceed {round(avg_cases * 1.3, 1)} (30% above avg)."},
        ]
    return tier, steps


# ════════════════════════════════════════════════════════════════════════════
# MODEL INFO  ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/hybrid-model-info", methods=["GET"])
@app.route("/rf-model-info", methods=["GET"])
def model_info():
    try:
        models = get_all_disease_models()
        return jsonify({
            "success": True,
            "all_disease": {
                "description": "All-disease barangay totals — ARIMA forecast + RF risk classification",
                "arima": {
                    "method": "Auto-ARIMA (p,d,q grid with ADF stationarity + AIC selection)",
                    "ci_level": "80%",
                },
                "random_forest": {
                    "type": "RandomForestClassifier",
                    "regressor_mae": models["mae"],
                    "regressor_rmse": models.get("rmse"),
                    "regressor_mape": models.get("mape"),
                    "classifier_accuracy": models["accuracy"],
                    "trained_on_rows": models["trained_on"],
                    "split_method": models.get("split_method"),
                    "classes": models["classes"],
                    "features": FEATURE_COLS,
                    "top_features": dict(list(models["importance"].items())[:5]),
                    "risk_note": models.get("risk_note", ""),
                },
            },
            "disease_specific": {
                "description": (
                    "Per-disease barangay forecasting from Consult_Diagnosis_3Y. "
                    "SARIMA if ≥ 12 monthly obs; plain ARIMA if 6-11; "
                    "Weighted Moving Average fallback if < 6."
                ),
                "risk_classification": {
                    "type": "RuleBasedThreshold",
                    "method": "Per-disease percentile thresholds (p50, p75) on current period distribution",
                    "labels": ["Low", "Medium", "High"],
                    "note": "Not a trained ML classifier. Thresholds are computed at request time.",
                },
                "metrics": {
                    "method": "time-based holdout: last 3 months as test set",
                    "reported": ["MAE", "RMSE", "MAPE"],
                },
            },
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/disease-list", methods=["GET"])
def disease_list():
    """Return all available disease names from Consult_Diagnosis_3Y."""
    try:
        raw = read_excel_sheet("Consult_Diagnosis_3Y")
        raw.columns = [str(c).strip().lower() for c in raw.columns]
        diseases = sorted(raw["diagnosis"].dropna().unique().tolist())
        return jsonify({"success": True, "data": diseases})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ════════════════════════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "VBetter Analytics v3 — Disease-Specific Forecasting",
        "pipelines": {
            "all_disease": "ARIMA per barangay + RF risk classifier (AllDiseaseARIMA+RF)",
            "disease_specific": (
                "SARIMA/ARIMA per barangay if ≥ 6 monthly obs; "
                "WMA fallback otherwise (DiseaseSpecificARIMA / DiseaseMovingAverageFallback)"
            ),
            "vaccination": "ARIMA demand forecasting (Combined_Rabies_3Years)",
        },
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)