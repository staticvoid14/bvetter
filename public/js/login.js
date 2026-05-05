/* =============================================
   BVETTER — Login Page JS
   File: public/js/login.js
   Depends: ../../shared/js/auth.js

   SCRIPT ORDER on login.html:
     <script src="../../shared/js/auth.js"></script>
     <script src="../js/login.js"></script>

   Test credentials:
   owner@test.com  → pet owner → public/pages/landing.html
   vet@test.com    → vet staff → vet/html/index.html
   admin@test.com  → admin     → admin/pages/dashboard.html
   ============================================= */

/* ── Password visibility toggle ─────────────── */
function togglePassword() {
  var pw = document.getElementById('loginPassword');
  if (!pw) return;
  pw.type = pw.type === 'password' ? 'text' : 'password';
}

/* ── Login handler ─────────────────────────── */
function handleLogin() {
  const email    = document.getElementById('loginEmail')?.value.trim() || '';
  const password = document.getElementById('loginPassword')?.value || '';

  if (!email || !password) {
    alert('Please enter your email and password.');
    return;
  }

  // Roles MUST match what auth.js ROLE_ROUTES expects:
  // 'owner' → /public/pages/landing.html
  // 'vet'   → /vet/html/index.html
  // 'admin' → /admin/pages/dashboard.html
  const mockUsers = {
    'owner@test.com': { userId: 1, name: 'Mark Depa',   role: 'owner', token: 'mock-token-owner' },
    'vet@test.com':   { userId: 2, name: 'Dr. Aris V.', role: 'vet',   token: 'mock-token-vet'   },
    'admin@test.com': { userId: 3, name: 'Admin User',  role: 'admin', token: 'mock-token-admin' },
  };

  const user = mockUsers[email.toLowerCase()];

  if (user) {
    // Save session the same way auth.js expects it
    sessionStorage.setItem('vbetter_session', JSON.stringify(user));
    // Then redirect based on role
    VBetterAuth.redirectToDashboard(user.role);
  } else {
    alert('Invalid credentials. Try owner@test.com, vet@test.com, or admin@test.com');
  }
}