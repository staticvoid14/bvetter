/**
 * VBetter – Contact Verification & Forgot Password
 * File: admin/js/contact-verification.js
 *
 * Handles:
 *   1. Email OTP verification (triggered from Create Account modal)
 *   2. Phone OTP verification (triggered from Create Account modal)
 *   3. Forgot Password modal (triggered from login page or anywhere)
 *
 * Requires: verify-contact.php at /backend/api/verify-contact.php
 */

/* ══════════════════════════════════════════════════════════
   0.  CONSTANTS & STATE
══════════════════════════════════════════════════════════ */

const VERIFY_API = 'FINAL-BACKEND(VBETTER)/Final-Backend/backend/admin/verify-contact.php';

const verifyState = {
    email: { verified: false, timerInterval: null },
    phone: { verified: false, timerInterval: null },
};

/* ══════════════════════════════════════════════════════════
   1.  BOOTSTRAP — wire everything once the DOM is ready
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    injectVerifyButtonsIntoCreateModal();
    wireOtpModal('email');
    wireOtpModal('phone');
    wireForgotPasswordModal();
    wireCreateModalSubmitGuard();
});

/* ══════════════════════════════════════════════════════════
   2.  INJECT "VERIFY" BUTTONS INTO THE EXISTING CREATE MODAL
      (adds a small Verify button next to Email and Phone inputs)
══════════════════════════════════════════════════════════ */

function injectVerifyButtonsIntoCreateModal() {
    /* --- Email --- */
    const emailInput = document.getElementById('add-email');
    if (emailInput && !document.getElementById('verify-email-btn')) {
        const wrap = emailInput.closest('.am-input-icon-wrap') || emailInput.parentElement;
        const btn  = makeVerifyBtn('verify-email-btn', 'Verify Email');
        wrap.after(btn);

        btn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailInput.focus();
                showInputError(emailInput, 'Please enter a valid email first.');
                return;
            }
            openOtpModal('email', email);
        });
    }

    /* --- Phone --- */
    const phoneInput = document.getElementById('add-phone');
    if (phoneInput && !document.getElementById('verify-phone-btn')) {
        const wrap = phoneInput.closest('.am-input-icon-wrap') || phoneInput.parentElement;
        const btn  = makeVerifyBtn('verify-phone-btn', 'Verify Phone');
        wrap.after(btn);

        btn.addEventListener('click', () => {
            const phone = phoneInput.value.trim();
            if (!phone) {
                phoneInput.focus();
                showInputError(phoneInput, 'Please enter a phone number first.');
                return;
            }
            openOtpModal('phone', phone);
        });
    }
}

function makeVerifyBtn(id, label) {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.id        = id;
    btn.className = 'am-verify-btn-inline';
    btn.style.marginTop = '6px';
    btn.textContent = label;
    return btn;
}

/* ══════════════════════════════════════════════════════════
   3.  OTP MODAL — open, send, verify, resend, countdown
══════════════════════════════════════════════════════════ */

/**
 * @param {'email'|'phone'} type
 * @param {string} value  – the email address or phone number
 */
async function openOtpModal(type, value) {
    /* Show the contact value in the modal */
    const displayEl = document.getElementById(`otp-${type}-display`);
    if (displayEl) displayEl.textContent = value;

    /* Clear digits + errors */
    clearOtpInputs(type);
    hideOtpError(type);

    /* Open modal */
    const modal = document.getElementById(`modal-verify-${type}`);
    if (modal) modal.hidden = false;

    /* Send OTP immediately on open */
    await sendOtp(type, value);

    /* Focus first digit */
    const firstDigit = document.querySelector(`#otp-${type}-inputs .am-otp-digit`);
    if (firstDigit) firstDigit.focus();
}

async function sendOtp(type, value) {
    const action = type === 'email' ? 'send_email_otp' : 'send_phone_otp';
    const key    = type === 'email' ? 'email' : 'phone';

    try {
        const body = new FormData();
        body.append('action', action);
        body.append(key, value);

        // Pass user_id if we have one (for existing accounts — optional)
        const userId = document.getElementById('edit-user-id')?.value;
        if (userId) body.append('user_id', userId);

        const res  = await fetch(VERIFY_API, { method: 'POST', body });
        const data = await res.json();

        if (!data.success) {
            showOtpError(type, data.message || 'Failed to send code.');
            return;
        }

        startCountdown(type, 600); // 10 minutes
    } catch {
        showOtpError(type, 'Network error. Please try again.');
    }
}

/* ── countdown timer ── */

function startCountdown(type, seconds) {
    const timerEl = document.getElementById(`otp-${type}-timer`);
    if (!timerEl) return;

    clearInterval(verifyState[type].timerInterval);
    let remaining = seconds;

    const tick = () => {
        const m = String(Math.floor(remaining / 60)).padStart(2, '0');
        const s = String(remaining % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
        timerEl.classList.toggle('expiring', remaining <= 60);

        if (remaining === 0) {
            clearInterval(verifyState[type].timerInterval);
            showOtpError(type, 'Code expired. Please request a new one.');
        } else {
            remaining--;
        }
    };

    tick();
    verifyState[type].timerInterval = setInterval(tick, 1000);
}

/* ── wire a single OTP modal ── */

function wireOtpModal(type) {
    /* Digit inputs — auto-advance & backspace */
    const container = document.getElementById(`otp-${type}-inputs`);
    if (container) {
        const digits = [...container.querySelectorAll('.am-otp-digit')];

        digits.forEach((input, idx) => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/\D/, '').slice(-1);
                input.classList.toggle('filled', input.value !== '');
                if (input.value && idx < digits.length - 1) digits[idx + 1].focus();
            });

            input.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !input.value && idx > 0) {
                    digits[idx - 1].value = '';
                    digits[idx - 1].classList.remove('filled');
                    digits[idx - 1].focus();
                }
            });

            /* Handle paste of full 6-digit code */
            input.addEventListener('paste', e => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
                [...text.slice(0, 6)].forEach((ch, i) => {
                    if (digits[i]) {
                        digits[i].value = ch;
                        digits[i].classList.add('filled');
                    }
                });
                const nextEmpty = digits.findIndex(d => !d.value);
                (digits[nextEmpty] || digits[digits.length - 1]).focus();
            });
        });
    }

    /* Verify button */
    document.getElementById(`otp-${type}-verify-btn`)?.addEventListener('click', () => verifyOtp(type));

    /* Resend button */
    const resendBtn = document.getElementById(`otp-${type}-resend-btn`);
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            const display = document.getElementById(`otp-${type}-display`)?.textContent || '';
            resendBtn.disabled = true;
            await sendOtp(type, display);
            clearOtpInputs(type);
            hideOtpError(type);

            /* Cooldown: disable resend for 30 s */
            let cd = 30;
            const orig = resendBtn.textContent;
            const cdInterval = setInterval(() => {
                resendBtn.textContent = `Resend Code (${cd}s)`;
                if (--cd < 0) {
                    clearInterval(cdInterval);
                    resendBtn.disabled = false;
                    resendBtn.textContent = orig;
                }
            }, 1000);
        });
    }
}

async function verifyOtp(type) {
    const container = document.getElementById(`otp-${type}-inputs`);
    const digits    = [...container.querySelectorAll('.am-otp-digit')];
    const code      = digits.map(d => d.value).join('');

    if (code.length < 6) {
        shakeDigits(digits);
        showOtpError(type, 'Please enter all 6 digits.');
        return;
    }

    hideOtpError(type);

    const display = document.getElementById(`otp-${type}-display`)?.textContent || '';

    try {
        const body = new FormData();
        body.append('action', 'verify_otp');
        body.append('type',   type);
        body.append('value',  display);
        body.append('code',   code);

        const res  = await fetch(VERIFY_API, { method: 'POST', body });
        const data = await res.json();

        if (!data.success) {
            shakeDigits(digits);
            showOtpError(type, data.message || 'Incorrect code.');
            return;
        }

        /* ── success ── */
        verifyState[type].verified = true;
        clearInterval(verifyState[type].timerInterval);

        /* Close modal */
        const modal = document.getElementById(`modal-verify-${type}`);
        if (modal) modal.hidden = true;

        /* Update the inline verify button */
        markVerified(type);

        /* Show toast */
        showToast(`${type === 'email' ? 'Email' : 'Phone'} verified successfully!`, 'success');

    } catch {
        showOtpError(type, 'Network error. Please try again.');
    }
}

/* ══════════════════════════════════════════════════════════
   4.  GUARD THE CREATE ACCOUNT BUTTON
      — require verification for Pet Owner role
══════════════════════════════════════════════════════════ */

function wireCreateModalSubmitGuard() {
    const original = window.createAccount; // defined in account-management.js

    // We wrap by listening for the submit button click BEFORE account-management.js
    const submitBtn = document.getElementById('add-submit');
    if (!submitBtn) return;

    // Insert a pre-check listener (fires before the one in account-management.js
    // because we run after DOMContentLoaded – both run on click, order matters).
    // Simplest reliable approach: replace the button click in account-management.js
    // by removing and re-adding the button's listener here.
    // Instead we add an early-capture listener:
    submitBtn.addEventListener('click', checkVerificationBeforeCreate, true /* capture */);
}

function checkVerificationBeforeCreate(event) {
    const roleSelect = document.getElementById('add-role');
    const selected   = roleSelect?.selectedOptions[0];
    const roleName   = selected?.dataset.roleName || '';

    // Only enforce verification for pet_owner
    if (roleName !== 'pet_owner') return;

    const missing = [];
    if (!verifyState.email.verified) missing.push('Email');
    if (!verifyState.phone.verified) missing.push('Phone Number');

    if (missing.length > 0) {
        event.stopImmediatePropagation(); // prevent account-management.js handler
        alert(`Please verify the following before creating a Pet Owner account:\n• ${missing.join('\n• ')}`);
    }
}

/* ══════════════════════════════════════════════════════════
   5.  FORGOT PASSWORD MODAL
══════════════════════════════════════════════════════════ */

function wireForgotPasswordModal() {
    /* Open trigger — works whether on the login page or elsewhere */
    document.querySelectorAll('[data-open-forgot-password]').forEach(trigger => {
        trigger.addEventListener('click', openForgotPasswordModal);
    });

    /* Send reset link button */
    document.getElementById('forgot-send-btn')?.addEventListener('click', sendForgotPassword);

    /* Allow Enter key in email field */
    document.getElementById('forgot-email')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendForgotPassword();
    });
}

function openForgotPasswordModal() {
    const modal = document.getElementById('modal-forgot-password');
    if (!modal) return;

    /* Reset to step 1 */
    document.getElementById('forgot-step-1').hidden = false;
    document.getElementById('forgot-step-2').hidden = true;
    document.getElementById('forgot-email').value   = '';
    hideForgotError();

    modal.hidden = false;
    setTimeout(() => document.getElementById('forgot-email')?.focus(), 80);
}

async function sendForgotPassword() {
    const email  = document.getElementById('forgot-email')?.value.trim() || '';
    const btn    = document.getElementById('forgot-send-btn');

    hideForgotError();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showForgotError('Please enter a valid email address.');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
        const body = new FormData();
        body.append('action', 'forgot_password');
        body.append('email',  email);

        const res  = await fetch(VERIFY_API, { method: 'POST', body });
        const data = await res.json();

        if (!data.success) {
            showForgotError(data.message || 'Failed to send reset link.');
            return;
        }

        /* Move to success state */
        document.getElementById('forgot-step-1').hidden = true;
        document.getElementById('forgot-step-2').hidden = false;
        const sentEl = document.getElementById('forgot-email-sent');
        if (sentEl) sentEl.textContent = email;

    } catch {
        showForgotError('Network error. Please try again.');
    } finally {
        btn.disabled    = false;
        btn.textContent = 'SEND RESET LINK';
    }
}

/* ══════════════════════════════════════════════════════════
   6.  PUBLIC API  (called from login page / elsewhere)
══════════════════════════════════════════════════════════ */

window.openForgotPasswordModal = openForgotPasswordModal;

/* ══════════════════════════════════════════════════════════
   7.  HELPERS
══════════════════════════════════════════════════════════ */

function clearOtpInputs(type) {
    document.querySelectorAll(`#otp-${type}-inputs .am-otp-digit`).forEach(d => {
        d.value = '';
        d.classList.remove('filled', 'error');
    });
}

function shakeDigits(digits) {
    digits.forEach(d => {
        d.classList.add('error');
        setTimeout(() => d.classList.remove('error'), 600);
    });
}

function showOtpError(type, msg) {
    const el = document.getElementById(`otp-${type}-error`);
    if (!el) return;
    el.textContent = msg;
    el.hidden      = false;
}

function hideOtpError(type) {
    const el = document.getElementById(`otp-${type}-error`);
    if (el) el.hidden = true;
}

function showForgotError(msg) {
    const el = document.getElementById('forgot-error');
    if (!el) return;
    el.textContent = msg;
    el.hidden      = false;
}

function hideForgotError() {
    const el = document.getElementById('forgot-error');
    if (el) el.hidden = true;
}

function markVerified(type) {
    const btnId = type === 'email' ? 'verify-email-btn' : 'verify-phone-btn';
    const btn   = document.getElementById(btnId);
    if (!btn) return;

    btn.textContent = type === 'email' ? '✓ Email Verified' : '✓ Phone Verified';
    btn.classList.add('verified');
    btn.disabled = true;
}

function showInputError(input, msg) {
    let tip = input.parentElement.querySelector('.am-inline-tip');
    if (!tip) {
        tip = document.createElement('p');
        tip.className = 'am-inline-tip';
        tip.style.cssText = 'color:#c0392b;font-size:11px;font-weight:600;margin-top:4px;';
        input.parentElement.appendChild(tip);
    }
    tip.textContent = msg;
    setTimeout(() => tip.remove(), 3000);
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('am-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'am-toast';
        toast.style.cssText = `
            position:fixed;bottom:28px;right:28px;z-index:9999;
            padding:14px 20px;border-radius:10px;
            font-family:'Manrope',sans-serif;font-size:13px;font-weight:700;
            box-shadow:0 4px 20px rgba(0,0,0,.15);
            transition:opacity .3s, transform .3s;
            opacity:0;transform:translateY(8px);
        `;
        document.body.appendChild(toast);
    }

    toast.style.background = type === 'success' ? '#00B928' : '#e53e3e';
    toast.style.color      = '#fff';
    toast.textContent      = message;
    toast.style.opacity    = '1';
    toast.style.transform  = 'translateY(0)';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateY(8px)';
    }, 3500);
}

/* ── reset verification state when the Add modal closes ── */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-close="modal-add"]').forEach(btn => {
        btn.addEventListener('click', resetVerifyState);
    });
});

function resetVerifyState() {
    verifyState.email.verified = false;
    verifyState.phone.verified = false;

    ['email', 'phone'].forEach(type => {
        clearInterval(verifyState[type].timerInterval);
        const btnId = type === 'email' ? 'verify-email-btn' : 'verify-phone-btn';
        const btn   = document.getElementById(btnId);
        if (btn) {
            btn.textContent = type === 'email' ? 'Verify Email' : 'Verify Phone';
            btn.classList.remove('verified');
            btn.disabled = false;
        }
    });
}