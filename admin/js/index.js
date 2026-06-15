document.addEventListener('DOMContentLoaded', async function () {
    const [dashboardData, users] = await Promise.all([
        loadAdminDashboard(),
        loadAdminUsers()
    ]);
    applyAdminDashboard(dashboardData, users);
    renderAdminOperationalPanels(dashboardData, users);

    // ===========================
    // REGISTRATION CHART
    // ===========================
    const regCtx = document.getElementById('registrationChart');
    if (regCtx) {
        const registrationRows = dashboardData?.registrationChart || [];
        new Chart(regCtx, {
            type: 'bar',
            data: {
                labels: registrationRows.map((item) => item.label),
                datasets: [
                    {
                        label: 'New Accounts',
                        data: registrationRows.map((item) => item.newAccounts),
                        backgroundColor: '#002A58',
                        borderRadius: 6,
                        borderSkipped: false
                    },
                    {
                        label: 'Deactivated',
                        data: registrationRows.map((item) => item.deactivated || 0),
                        backgroundColor: 'rgba(147,0,10,0.25)',
                        borderRadius: 6,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#002A58',
                            font: { size: 12, weight: '600' },
                            padding: 14,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(216,216,255,0.1)',
                            drawBorder: false
                        },
                        ticks: { color: '#737781', stepSize: 2 }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#737781' }
                    }
                }
            }
        });
    }

    // ===========================
    // CARD FADE-IN ANIMATIONS
    // ===========================
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeIn 0.5s ease-in-out ${index * 0.08}s forwards`;
    });

    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `slideUp 0.5s ease-in-out ${index * 0.08}s forwards`;
    });

    // ===========================
    // PENDING APPROVE / REJECT
    // ===========================
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', async function () {
            const item = btn.closest('.pending-item');
            const name = item.querySelector('.pending-name')?.textContent || 'Account';
            const userId = btn.dataset.userId;
            if (!userId) return;
            try {
                const result = await api.approveUser(userId);
                if (!result.success) throw new Error(result.message || 'Approval failed.');
                item.style.transition = 'opacity 0.3s ease';
                item.style.opacity = '0';
                setTimeout(() => {
                    item.remove();
                    updatePendingCount(-1);
                    showToast(`${name} approved successfully.`, 'success');
                }, 300);
            } catch (error) {
                showToast(error.message || `${name} could not be approved.`, 'error');
            }
        });
    });

    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', async function () {
            const item = btn.closest('.pending-item');
            const name = item.querySelector('.pending-name')?.textContent || 'Account';
            const userId = btn.dataset.userId;
            if (!userId) return;
            try {
                const result = await api.rejectUser(userId, 'Rejected from admin dashboard.');
                if (!result.success) throw new Error(result.message || 'Rejection failed.');
                item.style.transition = 'opacity 0.3s ease';
                item.style.opacity = '0';
                setTimeout(() => {
                    item.remove();
                    updatePendingCount(-1);
                    showToast(`${name} was rejected.`, 'error');
                }, 300);
            } catch (error) {
                showToast(error.message || `${name} could not be rejected.`, 'error');
            }
        });
    });

    function updatePendingCount(delta) {
        const badge = document.querySelector('.pending-count');
        const kpiPending = document.querySelector('.KPI .kpi-card:nth-child(2) .kpi-value');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            const next = Math.max(0, current + delta);
            badge.textContent = next;
        }
        if (kpiPending) {
            const current = parseInt(kpiPending.textContent) || 0;
            const next = Math.max(0, current + delta);
            kpiPending.textContent = String(next).padStart(2, '0');
        }
    }

    // ===========================
    // HEADER BUTTONS (stubs)
    // ===========================
    const addAccountBtn = document.getElementById('add-account-btn');
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', function () {
            window.location.href = '/Final-backend(VBETTER)/Final-Backend/admin/pages/account-management.html';
        });
    }

    const manageAccountsBtn = document.getElementById('manage-accounts-btn');
    if (manageAccountsBtn) {
        manageAccountsBtn.addEventListener('click', function () {
            window.location.href = '/admin/pages/account-management.html';
        });
    }

    document.querySelector('.btn-view-all-pending')?.addEventListener('click', function () {
        window.location.href = '/admin/pages/account-management.html';
    });

    document.getElementById('admin-create-announcement-btn')?.addEventListener('click', async function () {
        const title = window.prompt('Announcement title');
        if (!title) return;
        const description = window.prompt('Announcement description');
        if (!description) return;
        const location = window.prompt('Location or barangay', 'Baliwag City Veterinary Services') || '';
        const date = window.prompt('Event date (YYYY-MM-DD), optional', '') || '';
        try {
            const result = await api.saveAnnouncement({
                title,
                description,
                location,
                date,
                category: 'Community Advisory',
                status: 'published',
                role: 'admin'
            });
            if (!result.success) throw new Error(result.message || 'Announcement could not be saved.');
            showToast('Announcement posted to the landing page.', 'success');
        } catch (error) {
            showToast(error.message || 'Announcement could not be saved.', 'error');
        }
    });

    document.getElementById('admin-manage-announcement-btn')?.addEventListener('click', function () {
        window.location.href = '/Final-backend(VBETTER)/Final-Backend/public/pages/landing.html#events';
    });

    document.getElementById('notification-icon-btn')?.addEventListener('click', function () {
        showToast('Notifications are generated from pending account and clinic data on this dashboard.', 'info');
    });

    document.querySelectorAll('.icon-btn[aria-label="Settings"]').forEach((button) => {
        button.addEventListener('click', () => {
            window.location.href = '/Final-backend(VBETTER)/Final-Backend/public/pages/account-settings.html';
        });
    });

    // ===========================
    // CHART TABS (Monthly / Quarterly)
    // ===========================
    const tabs = document.querySelectorAll('.card-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    console.log('Admin dashboard initialized successfully');
});

// ===========================
// TOAST NOTIFICATION
// ===========================
function showToast(message, type = 'info') {
    const colors = {
        success: '#1B6D24',
        error: '#93000A',
        info: '#002A58'
    };
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 22px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        font-family: 'Manrope', sans-serif;
        font-size: 13px;
        font-weight: 600;
        animation: slideIn 0.3s ease-in-out;
        max-width: 320px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function loadAdminDashboard() {
    try {
        const result = await api.getAdminDashboard();
        return result.success ? result.data : null;
    } catch (error) {
        console.warn('Unable to load admin dashboard backend data:', error);
        return null;
    }
}

async function loadAdminUsers() {
    try {
        const result = await api.allUsers();
        return result.success && Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.warn('Unable to load admin users:', error);
        return [];
    }
}

function applyAdminDashboard(data, users = []) {
    if (!data?.kpis) return;
    const userTotals = summarizeUsers(users);
    const greetStats = document.querySelectorAll('.greet-stat-val');
    if (greetStats[0]) greetStats[0].textContent = String(data.kpis.totalAccounts || userTotals.total);
    if (greetStats[1]) greetStats[1].textContent = String(data.kpis.activeAccounts || userTotals.active);
    if (greetStats[2]) greetStats[2].textContent = String(data.kpis.pendingApprovals || userTotals.pending).padStart(2, '0');

    const kpis = document.querySelectorAll('.KPI .kpi-value');
    if (kpis[0]) kpis[0].textContent = String(data.kpis.totalAccounts || userTotals.total);
    if (kpis[1]) kpis[1].textContent = String(data.kpis.pendingApprovals || userTotals.pending).padStart(2, '0');
    if (kpis[2]) kpis[2].textContent = String(data.kpis.systemAlerts || 0).padStart(2, '0');
    if (kpis[3]) kpis[3].textContent = `${data.kpis.clinicVaccinationRate || 0}%`;

    const progress = document.querySelector('.vaccination-progress .progress-fill');
    if (progress) progress.style.width = `${Math.min(100, data.kpis.clinicVaccinationRate || 0)}%`;

    renderRecentAccounts(data.recentAccounts?.length ? data.recentAccounts : users);
}

function summarizeUsers(users) {
    return {
        total: users.length,
        active: users.filter((user) => String(user.status || user.accountStatus).toLowerCase() === 'active').length,
        pending: users.filter((user) => String(user.status || user.accountStatus).toLowerCase() === 'pending').length,
    };
}

function initialsFor(name) {
    return (name || 'NA').split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

function normalizeRoleClass(role) {
    const value = String(role || '').toLowerCase();
    if (value.includes('admin')) return 'admin';
    if (value.includes('vet') || value.includes('veterinarian')) return 'vet';
    return 'vet';
}

function renderRecentAccounts(accounts) {
    const tableBody = document.querySelector('.accounts-table tbody');
    if (!tableBody) return;
    const rows = (accounts || []).slice(0, 6);
    if (!rows.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="date-cell">No account records found.</td></tr>';
        return;
    }

    tableBody.innerHTML = rows.map((account) => {
        const name = account.name || account.full_name || 'N/A';
        const role = account.roleLabel || account.role || 'User';
        const status = account.status || account.accountStatus || 'pending';
        const joined = account.joined || account.created || account.created_at || '';
        const roleClass = normalizeRoleClass(role);
        return `
            <tr>
                <td class="user-cell">
                    <div class="user-avatar ${roleClass === 'admin' ? 'admin-av' : ''}">${escapeHtml(initialsFor(name))}</div>
                    <span>${escapeHtml(name)}</span>
                </td>
                <td><span class="role-badge ${roleClass}">${escapeHtml(role)}</span></td>
                <td class="email-cell">${escapeHtml(account.email || '')}</td>
                <td><span class="status-pill ${String(status).toLowerCase()}">${escapeHtml(status)}</span></td>
                <td class="date-cell">${escapeHtml(String(joined).slice(0, 10))}</td>
            </tr>
        `;
    }).join('');
}

function renderAdminOperationalPanels(data, users) {
    renderPendingAccounts(users);
    renderClinicSnapshot(data);
    renderRecentActivity(users);
    renderModuleUsage(data);
}

function renderPendingAccounts(users) {
    const pendingUsers = users.filter((user) => String(user.status || user.accountStatus).toLowerCase() === 'pending').slice(0, 6);
    const list = document.querySelector('.pending-list');
    const badge = document.querySelector('.pending-count');
    const viewAll = document.querySelector('.btn-view-all-pending');
    if (badge) badge.textContent = String(pendingUsers.length);
    if (viewAll) viewAll.textContent = `View All ${pendingUsers.length} Pending`;
    if (!list) return;

    if (!pendingUsers.length) {
        list.innerHTML = '<p class="activity-time">No accounts are awaiting review.</p>';
        return;
    }

    list.innerHTML = pendingUsers.map((user) => `
        <div class="pending-item">
            <div class="user-avatar small ${normalizeRoleClass(user.roleLabel || user.role) === 'admin' ? 'admin-av' : ''}">${escapeHtml(initialsFor(user.name))}</div>
            <div class="pending-info">
                <p class="pending-name">${escapeHtml(user.name || 'N/A')}</p>
                <p class="pending-role">${escapeHtml(user.roleLabel || user.role || 'User')} - Applied ${escapeHtml(String(user.created || '').slice(0, 10) || 'recently')}</p>
            </div>
            <div class="pending-actions">
                <button class="btn-approve" data-user-id="${escapeHtml(user.id)}" type="button" aria-label="Approve ${escapeHtml(user.name || 'account')}">✓</button>
                <button class="btn-reject" data-user-id="${escapeHtml(user.id)}" type="button" aria-label="Reject ${escapeHtml(user.name || 'account')}">×</button>
            </div>
        </div>
    `).join('');
}

function renderClinicSnapshot(data) {
    const items = document.querySelectorAll('.snapshot-item');
    const ops = data?.operations?.kpis || {};
    const snapshot = [
        ['Appointments Today', ops.appointmentsToday ?? 0, 'Live from appointment records'],
        ['Active Lost Reports', ops.activeLostReports ?? 0, 'Live from lost and found'],
        ['Chatbot Queries', data?.operations?.chatbotQueries ?? 0, 'Live from chatbot logs'],
        ['Pending Actions', ops.pendingActions ?? 0, 'Appointments needing action'],
    ];

    snapshot.forEach((entry, index) => {
        const item = items[index];
        if (!item) return;
        const label = item.querySelector('.snapshot-label');
        const value = item.querySelector('.snapshot-val');
        const trend = item.querySelector('.snapshot-trend');
        if (label) label.textContent = entry[0];
        if (value) value.textContent = String(entry[1]).padStart(index === 1 ? 2 : 1, '0');
        if (trend) trend.textContent = entry[2];
    });
}

function renderRecentActivity(users) {
    const feed = document.querySelector('.activity-feed');
    if (!feed) return;
    const recentUsers = [...users]
        .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
        .slice(0, 5);

    if (!recentUsers.length) {
        feed.innerHTML = '<p class="activity-time">No recent account activity found.</p>';
        return;
    }

    feed.innerHTML = recentUsers.map((user) => {
        const status = String(user.status || user.accountStatus || '').toLowerCase();
        const dot = status === 'active' ? 'green' : (status === 'pending' ? 'blue' : 'red');
        return `
            <div class="activity-item">
                <div class="activity-dot ${dot}"></div>
                <div class="activity-body">
                    <p class="activity-text"><strong>${escapeHtml(user.name || 'Account')}</strong> is ${escapeHtml(status || 'listed')} as ${escapeHtml(user.roleLabel || user.role || 'User')}.</p>
                    <span class="activity-time">${escapeHtml(String(user.created || '').slice(0, 10) || 'Recent')}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderModuleUsage(data) {
    const bars = document.querySelector('.module-bars');
    if (!bars) return;
    const ops = data?.operations?.kpis || {};
    const modules = [
        ['Appointment Management', ops.totalAppointments || 0],
        ['Lost and Found', ops.activeLostReports || 0],
        ['Mass Vaccination', data?.operations?.vaccinated?.total || 0],
        ['Disease Analytics', data?.operations?.diseaseCasesByBarangay?.reduce((sum, row) => sum + Number(row.actual || 0), 0) || 0],
        ['Chatbot Management', data?.operations?.chatbotQueries || 0],
    ];
    const max = Math.max(1, ...modules.map((item) => item[1]));
    bars.innerHTML = modules.map(([name, value], index) => {
        const pct = Math.round((value / max) * 100);
        const cls = index < 2 ? '' : (index < 4 ? 'blue' : 'muted');
        return `
            <div class="module-bar-item">
                <div class="module-bar-label">
                    <span class="module-name">${escapeHtml(name)}</span>
                    <span class="module-pct">${escapeHtml(formatCompact(value))}</span>
                </div>
                <div class="module-track"><div class="module-fill ${cls}" style="width:${pct}%"></div></div>
            </div>
        `;
    }).join('');
}

function formatCompact(value) {
    return Number(value || 0).toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===========================
// CSS ANIMATIONS
// ===========================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
