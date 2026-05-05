/* =============================================
   BVETTER — Landing Page JS
   File: public/js/landing.js
   Depends: ../../shared/js/auth.js, nav.js

   Functions:
   - slideEvents(dir)  — carousel prev/next
   - goToEvent(index)  — jump to dot index
   - updateCarousel()  — sync position + dots

   TODO backend:
   - Replace totalEvents with api.getEvents().length
   - Nav state: replace sessionStorage with auth.js
   ============================================= */

/* ── Events Carousel ──────────────────────── */
let currentEvent  = 0;
const totalEvents = 2; /* TODO backend: api.getEvents().length */

function slideEvents(dir) {
  currentEvent = (currentEvent + dir + totalEvents) % totalEvents;
  updateCarousel();
}

function goToEvent(index) {
  currentEvent = index;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('eventsTrack');
  if (!track || !track.children.length) return;
  const cardWidth = track.children[0].offsetWidth + 20;
  track.style.transform = `translateX(-${currentEvent * cardWidth}px)`;
  document.querySelectorAll('.events-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentEvent);
  });
}

/* ── Guest vs Auth Nav ────────────────────────
   Uses auth.js getCurrentUser() to decide
   which nav to show.                           */
(function () {
  const user     = getCurrentUser(); /* from shared/js/auth.js */
  const navGuest = document.getElementById('navGuest');
  const navAuth  = document.getElementById('navAuth');

  if (navGuest) navGuest.style.display = user ? 'none' : 'flex';
  if (navAuth)  navAuth.style.display  = user ? 'flex' : 'none';

  /* Populate user name from session */
  if (user) {
    const nameEl = document.querySelector('.nav-user-name');
    if (nameEl) nameEl.textContent = user.name;
  }
})();
