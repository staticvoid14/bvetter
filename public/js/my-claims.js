/* =============================================
   BVETTER — my-claims.js
   Page: my-claims.html

   KEY FIX:
   Detail panels are position:fixed overlays.
   When a panel opens we lock body scroll so the
   page behind (including navbar + hero) stays
   perfectly still and fully visible.
   The panel header is sticky inside the panel's
   own scroll container — it never disappears.

   TODO backend:
   - filterClaims:    api.getClaims({ status })
   - openClaimDetail: api.getClaimById(id)
   - handleResolved:  api.resolveClaim(claimId)
   ============================================= */

/* ── Nav user menu ─────────────────────────── */
function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('open');
}

document.addEventListener('click', function (e) {
  const pill = document.querySelector('.nav-user-pill');
  const dd   = document.getElementById('userDropdown');
  if (dd && !pill?.contains(e.target) && !dd.contains(e.target)) {
    dd.classList.remove('open');
  }
});

function logout() {
  if (window.VBetterAuth) window.VBetterAuth.logout();
  else window.location.href = 'login.html';
}

/* ── Filter claims by status ─────────────────
   TODO backend: replace with api.getClaims({ status })
   then re-render the table rows.
─────────────────────────────────────────────── */
function filterClaims(status) {
  const rows   = document.querySelectorAll('.mc-table-row');
  let visible  = 0;
  const total  = rows.length;

  rows.forEach(row => {
    const match = status === 'all' || row.dataset.status === status;
    row.classList.toggle('hidden', !match);
    if (match) visible++;
  });

  // Update footer count
  const showing = document.getElementById('claimsShowing');
  if (showing) {
    showing.textContent = visible > 0
      ? `Showing 1 to ${visible} of ${total} result${total !== 1 ? 's' : ''}`
      : `No results for "${status}"`;
  }
}

/* ── Open claim detail panel ─────────────────
   claimKey = 'jefferson' | 'charlie' | ...
   Maps to element IDs like detail + PascalCase
─────────────────────────────────────────────── */
function openClaimDetail(claimKey) {
  const panelId = 'detail' + claimKey.charAt(0).toUpperCase() + claimKey.slice(1);
  const overlay = document.getElementById(panelId);
  if (!overlay) return;

  overlay.classList.add('open');

  // Lock page scroll — hero and navbar stay fully visible
  document.body.style.overflow = 'hidden';

  // Scroll panel body back to top every time it opens
  const body = overlay.querySelector('.mc-detail-body');
  if (body) body.scrollTop = 0;
}

/* ── Close panel ──────────────────────────── */
function closeDetail(panelId) {
  const overlay = document.getElementById(panelId);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close when clicking the dark backdrop (not the panel itself)
function closeDetailOutside(event, panelId) {
  // The overlay IS the backdrop — the panel is a child inside it.
  // We only close if the click landed directly on the overlay, not
  // on anything inside .mc-detail-panel.
  if (event.target === document.getElementById(panelId)) {
    closeDetail(panelId);
  }
}

/* ── Keyboard: Escape closes open panel ─────── */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  // Close any open detail panel
  document.querySelectorAll('.mc-detail-overlay.open').forEach(el => {
    el.classList.remove('open');
  });
  // Close any open modal
  document.querySelectorAll('.modal-overlay.open').forEach(el => {
    el.classList.remove('open');
  });
  document.body.style.overflow = '';
});

/* ── Modal helpers (resolved success modal) ── */
function openModalById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(event, id) {
  if (event.target === document.getElementById(id)) closeModal(id);
}

/* ── Mark as Resolved ─────────────────────────
   TODO backend: api.resolveClaim(claimId)
─────────────────────────────────────────────── */
function handleResolved(claimKey) {
  const panelId = 'detail' + claimKey.charAt(0).toUpperCase() + claimKey.slice(1);

  // Close the detail panel first
  closeDetail(panelId);

  // Show the success modal after a brief pause
  setTimeout(() => openModalById('resolvedModal'), 220);

  // Update row visually to show resolved state
  setTimeout(() => {
    const row = document.querySelector(`.mc-table-row[data-claim="${claimKey}"]`);
    if (!row) return;

    // Dim the row
    row.style.opacity       = '0.55';
    row.style.pointerEvents = 'none';

    // Update badge
    const badge = row.querySelector('.mc-status-badge');
    if (badge) {
      badge.className          = 'mc-status-badge';
      badge.textContent        = 'Resolved';
      badge.style.background   = '#E8EAED';
      badge.style.color        = '#424750';
    }

    // Hide action button
    const btn = row.querySelector('.mc-action-btn');
    if (btn) btn.style.display = 'none';

    // Update footer count
    const showing = document.getElementById('claimsShowing');
    if (showing) {
      const total   = document.querySelectorAll('.mc-table-row').length;
      const visible = document.querySelectorAll('.mc-table-row:not(.hidden)').length;
      showing.textContent = `Showing 1 to ${visible} of ${total} results`;
    }
  }, 440);
}

/* ── Init: handle URL param ?open=jefferson ── */
document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const openId = params.get('open');
  if (openId) openClaimDetail(openId);
});
