/* =============================================
   BVETTER — Create Account JS
   File: js/signup.js
   Depends: api.js (for registration submit)

   Functions:
   - goTo(step)        — navigate between steps 1-4
   - updateStepper()   — update visual step circles
   - reviewStep()      — populate step 3 review fields
   - togglePw(id)      — show/hide password field
   - copyRef()         — copy reference number to clipboard

   TODO backend:
   - goTo(4): replace mock with api.register(data)
   - copyRef(): ref number comes from api.register() response
   ============================================= */

let currentStep = 1;

/* ── Step navigation ─────────────────────────── */
function goTo(step) {
  document.getElementById('step-' + currentStep).classList.remove('active');
  currentStep = step;
  document.getElementById('step-' + currentStep).classList.add('active');

  if (step === 3) reviewStep();
  updateStepper(step);
}

/* ── Stepper visual update ───────────────────── */
function updateStepper(step) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById('circle-' + i);
    if (!circle) continue;
    circle.classList.remove('active', 'done');

    if (i < step) {
      circle.classList.add('done');
      circle.innerHTML = '&#10003;';
    } else if (i === step) {
      circle.classList.add('active');
      circle.textContent = i;
    } else {
      circle.textContent = i;
    }

    if (i < 3) {
      const line = document.getElementById('line-' + i);
      if (line) line.classList.toggle('active', i < step);
    }
  }
}

/* ── Populate review step from earlier inputs ─── */
function reviewStep() {
  const fullname  = document.getElementById('reg_fullname')?.value  || '';
  const email     = document.getElementById('reg_email')?.value     || '';
  const pw1       = document.getElementById('reg_pw1')?.value       || '';
  const pw2       = document.getElementById('reg_pw2')?.value       || '';
  const barangay  = document.getElementById('reg_barangay');
  const proofFile = document.getElementById('reg_proof');

  document.getElementById('rv_fullname').value = fullname;
  document.getElementById('rv_email').value    = email;
  document.getElementById('rv_pw').value       = pw1;
  document.getElementById('rv_pw2').value      = pw2;

  if (barangay) {
    document.getElementById('rv_barangay').value =
      barangay.options[barangay.selectedIndex]?.text || '';
  }

  document.getElementById('rv_proof_name').textContent =
    (proofFile && proofFile.files.length > 0)
      ? proofFile.files[0].name
      : 'No file selected';
}

/* ── Password visibility toggle ─────────────── */
function togglePw(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
}

/* ── Copy reference number to clipboard ─────────
   TODO backend: ref number from api.register() response,
   not hardcoded. Replace #ACC-2025-0000 dynamically.  */
function copyRef() {
  const ref = document.getElementById('reg_ref_number')?.textContent || '';
  navigator.clipboard.writeText(ref).catch(() => {});
}

/* ── Initialize stepper on page load ─────────── */
updateStepper(1);
