/* =============================================
   BVETTER — Book Appointment Page JS
   File: js/book-appointment.js
   Depends: nav.js, api.js

   Functions:
   - showPage(page)       — switch between 3 page views
   - goStep(n)            — navigate booking form steps 1-5
   - updateStepper(n)     — update header step dots
   - populateReview()     — fill step 4 review from form inputs

   TODO backend:
   - populateReview / goStep(5): replace with
     api.bookAppointment(data)
   - pageHistory: replace static rows with
     api.getAppointments()
   ============================================= */

(function () {
  'use strict';

  /* ── Page references ─────────────────────── */
  const pageVet     = document.getElementById('pageVet');
  const pageBooking = document.getElementById('pageBooking');
  const pageHistory = document.getElementById('pageHistory');

  /* ── Switch between 3 main page views ───────
     pageVet     → vet selection + calendar
     pageBooking → multi-step booking form
     pageHistory → appointment history           */
  
  function showPage(page) {
  [pageVet, pageBooking, pageHistory].forEach(p => p.classList.remove('active'));
  page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // When navigating to history, always show the list
  if (page === pageHistory) {
    document.getElementById('histEmpty').style.display = 'none';
    document.getElementById('histList').style.display  = 'flex';
  }
}

  /* ── Page navigation wiring ─────────────── */
  document.getElementById('btnBook')            .addEventListener('click', () => { showPage(pageBooking); goStep(1); });
  document.getElementById('btnViewAll')         .addEventListener('click', (e) => { e.preventDefault(); showPage(pageHistory); });
  document.getElementById('btnBackToVet')       .addEventListener('click', (e) => { e.preventDefault(); showPage(pageVet); });
  document.getElementById('btnBackHome')        .addEventListener('click', () => showPage(pageVet));
  document.getElementById('btnViewHistory')     .addEventListener('click', () => showPage(pageHistory));
  document.getElementById('btnHistBack')        .addEventListener('click', () => showPage(pageVet));
  document.getElementById('btnBookFromHistory') .addEventListener('click', () => { showPage(pageBooking); goStep(1); });

  /* ── Step navigation wiring ─────────────── */
  document.getElementById('s1Next')   .addEventListener('click', () => goStep(2));
  document.getElementById('s2Back')   .addEventListener('click', () => goStep(1));
  document.getElementById('s2Next')   .addEventListener('click', () => goStep(3));
  document.getElementById('s3Back')   .addEventListener('click', () => goStep(2));
  document.getElementById('s3Next')   .addEventListener('click', () => goStep(4));
  document.getElementById('s4Back')   .addEventListener('click', () => goStep(3));
  document.getElementById('s4Confirm').addEventListener('click', () => goStep(5));
  /* TODO backend: s4Confirm → api.bookAppointment(data) first, then goStep(5) */

  /* ── Core step switcher ──────────────────── */
  function goStep(n) {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('step' + i);
      if (el) el.style.display = (i === n) ? 'block' : 'none';
    }
    updateStepper(n);
    if (n === 4) populateReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Header stepper update ───────────────── */
  function updateStepper(active) {
    const eyebrow = document.getElementById('bookingEyebrow');
    if (eyebrow) eyebrow.textContent = 'Step ' + Math.min(active, 4) + ' of 4';

    for (let i = 1; i <= 4; i++) {
      const dot   = document.getElementById('sc' + i);
      const label = document.getElementById('sl' + i);
      const bar   = i < 4 ? document.getElementById('line' + i) : null;
      if (!dot) continue;

      const isDone   = (active === 5 || i < active);
      const isActive = (i === active);

      dot.className   = 'hstep-dot '   + (isDone ? 'done' : isActive ? 'active' : 'todo');
      dot.textContent = isDone ? '\u2713' : i;
      if (label) label.className = 'hstep-label ' + (isDone ? 'done' : isActive ? 'active' : '');
      if (bar)   bar.className   = 'hstep-bar '   + (isDone ? 'done' : '');
    }
  }

  /* ── Slot button selection ───────────────── */
  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  /* ── Calendar time slots ─────────────────── */
  document.querySelectorAll('.time-slot.available').forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
    });
  });

  /* ── Calendar day selection ──────────────── */
  document.querySelectorAll('.cal-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('today'));
      day.classList.add('today');
    });
  });

  /* ── Vet sidebar switching ───────────────── */
  document.querySelectorAll('.vet-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.vet-item').forEach(v => v.classList.remove('active'));
      item.classList.add('active');
    });
  });

  /* ── History filter pills ────────────────── */
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  /* ── Populate review step from form inputs ──
     TODO backend: these values will come from
     api.getProfile() for owner info             */
  function populateReview() {
    const val     = id => (document.getElementById(id)?.value.trim() || '—');
    const selText = id => {
      const el = document.getElementById(id);
      return el?.options[el.selectedIndex]?.text || '—';
    };

    document.getElementById('rv-name')     .textContent = val('ownerName');
    document.getElementById('rv-contact')  .textContent = val('ownerContact');
    document.getElementById('rv-barangay') .textContent = selText('ownerBarangay');
    document.getElementById('rv-petname')  .textContent = val('petName');
    document.getElementById('rv-pettype')  .textContent = selText('petType');
    document.getElementById('rv-ageSex')   .textContent = val('petAge') + ' / ' + selText('petSex');
    document.getElementById('rv-visitType').textContent = selText('visitType');

    const rawDate = val('apptDate');
    if (rawDate && rawDate !== '—') {
      const parts = rawDate.split('-');
      document.getElementById('rv-date').textContent = parts[1] + '/' + parts[2] + '/' + parts[0].slice(2);
    } else {
      document.getElementById('rv-date').textContent = '—';
    }

    const selSlot = document.querySelector('.slot-btn.selected');
    document.getElementById('rv-time').textContent = selSlot ? selSlot.dataset.slot : '—';
  }

})();
