/* =============================================
   BVETTER — Public Nav JS
   File: public/js/nav.js
   Depends: ../../shared/js/auth.js (loaded first)

   INCLUDE ORDER on every public auth page:
     <script src="../../shared/js/auth.js"></script>
     <script src="../js/nav.js"></script>
     <script src="../js/api.js"></script>
     <script src="../js/[page].js"></script>

   Functions:
   - toggleUserMenu()  — opens/closes user dropdown
   NOTE: logout() and loginAs() live in auth.js
   ============================================= */

function toggleUserMenu() {
  var dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('open');
}

/* Close dropdown when clicking outside */
document.addEventListener('click', function (e) {
  var pill = document.querySelector('.nav-user-pill');
  var dd   = document.getElementById('userDropdown');
  if (dd && !dd.contains(e.target) && (!pill || !pill.contains(e.target))) {
    dd.classList.remove('open');
  }
});
