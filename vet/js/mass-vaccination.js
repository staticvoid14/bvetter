document.addEventListener('DOMContentLoaded', () => {
	if (window.Chart && Chart.defaults) {
		Chart.defaults.animation = false;
		if (Chart.defaults.transitions && Chart.defaults.transitions.active && Chart.defaults.transitions.active.animation) {
			Chart.defaults.transitions.active.animation.duration = 0;
		}
		if (Chart.defaults.transitions && Chart.defaults.transitions.resize && Chart.defaults.transitions.resize.animation) {
			Chart.defaults.transitions.resize.animation.duration = 0;
		}
	}

	const state = {
		events: [
			{
				id: 'evt-001',
				date: '2025-02-24',
				dateLabel: 'February 24, 2025',
				barangay: 'Tangos',
				vaccine: 'Anti-Rabies',
				status: 'Completed',
				totalVaccinated: 87,
				breakdown: { dogs: 48, cats: 29, others: 10 },
				comparison: { event: 87, average: 72, highest: 100 }
			},
			{
				id: 'evt-002',
				date: '2025-02-24',
				dateLabel: 'February 24, 2025',
				barangay: 'Poblacion',
				vaccine: 'Anti-Rabies',
				status: 'Pending Report',
				totalVaccinated: '',
				breakdown: { dogs: 0, cats: 0, others: 0 },
				comparison: { event: 87, average: 72, highest: 100 }
			},
			{
				id: 'evt-003',
				date: '2025-02-16',
				dateLabel: 'February 16, 2025',
				barangay: 'San Jose',
				vaccine: '5-in-1',
				status: 'Pending Report',
				totalVaccinated: '',
				breakdown: { dogs: 0, cats: 0, others: 0 },
				comparison: { event: 64, average: 58, highest: 100 }
			}
		]
	};

	const dashboardPanel = document.getElementById('mass-vacc-dashboard');
	const detailPanel = document.getElementById('mass-vacc-detail');
	const tableBody = document.getElementById('event-table-body');

	const backToDashboardBtn = document.getElementById('back-to-dashboard');
	const detailTitle = document.getElementById('detail-title');
	const detailDate = document.getElementById('detail-date');
	const detailStatus = document.getElementById('detail-status');

	const infoDate = document.getElementById('info-date');
	const infoBarangay = document.getElementById('info-barangay');
	const infoVaccine = document.getElementById('info-vaccine');
	const infoStatus = document.getElementById('info-status');

	const postEventForm = document.getElementById('post-event-form');
	const totalVaccinatedInput = document.getElementById('total-vaccinated');
	const includeBreakdownCheckbox = document.getElementById('include-breakdown');
	const speciesBreakdown = document.getElementById('species-breakdown');
	const dogsCount = document.getElementById('dogs-count');
	const catsCount = document.getElementById('cats-count');
	const othersCount = document.getElementById('others-count');

	const eventProgress = document.getElementById('event-progress');
	const averageProgress = document.getElementById('average-progress');
	const highestProgress = document.getElementById('highest-progress');
	const eventProgressValue = document.getElementById('event-progress-value');
	const averageProgressValue = document.getElementById('average-progress-value');
	const highestProgressValue = document.getElementById('highest-progress-value');
	const comparisonNote = document.getElementById('comparison-note');

	const createEventModal = document.getElementById('create-event-modal');
	const openCreateEventBtn = document.getElementById('open-create-event');
	const closeCreateEventBtn = document.getElementById('close-create-event');
	const cancelCreateEventBtn = document.getElementById('cancel-create-event');
	const createEventForm = document.getElementById('create-event-form');

	const pendingReportsMetric = document.querySelector('[data-metric="pendingReports"]');

	const sanitize = (value) => String(value).replace(/[&<>"']/g, (char) => {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return map[char] || char;
	});

	const formatNumber = (value) => {
		if (value === '' || value === null || value === undefined) return '-';
		return Number(value).toLocaleString();
	};

	const setPanel = (panelName) => {
		const showDashboard = panelName === 'dashboard';
		dashboardPanel.classList.toggle('active-panel', showDashboard);
		detailPanel.classList.toggle('active-panel', !showDashboard);
	};

	const statusClass = (status) => (status.toLowerCase().includes('completed') ? 'completed' : 'pending');

	const updatePendingMetric = () => {
		const pendingCount = state.events.filter((eventItem) => eventItem.status === 'Pending Report').length;
		pendingReportsMetric.textContent = pendingCount;
	};

	const renderTable = () => {
		tableBody.innerHTML = state.events.map((eventItem) => {
			return `
				<tr data-event-id="${sanitize(eventItem.id)}">
					<td>${sanitize(eventItem.dateLabel)}</td>
					<td>${sanitize(eventItem.barangay)}</td>
					<td>${sanitize(eventItem.vaccine)}</td>
					<td>${formatNumber(eventItem.totalVaccinated)}</td>
					<td>
						<span class="status-pill ${statusClass(eventItem.status)}">${sanitize(eventItem.status)}</span>
					</td>
				</tr>
			`;
		}).join('');
	};

	const setProgress = (element, value, max) => {
		const safeMax = max || 100;
		const width = Math.max(0, Math.min(100, (value / safeMax) * 100));
		element.style.width = `${width}%`;
	};

	const hydrateDetail = (eventId) => {
		const eventItem = state.events.find((item) => item.id === eventId);
		if (!eventItem) return;

		detailTitle.textContent = `${eventItem.barangay} - ${eventItem.vaccine}`;
		detailDate.textContent = eventItem.dateLabel;
		detailStatus.textContent = eventItem.status;
		detailStatus.className = `pill ${statusClass(eventItem.status)}`;

		infoDate.textContent = eventItem.dateLabel;
		infoBarangay.textContent = eventItem.barangay;
		infoVaccine.textContent = eventItem.vaccine;
		infoStatus.textContent = eventItem.status;

		totalVaccinatedInput.value = eventItem.totalVaccinated === '' ? '' : eventItem.totalVaccinated;
		dogsCount.value = eventItem.breakdown.dogs;
		catsCount.value = eventItem.breakdown.cats;
		othersCount.value = eventItem.breakdown.others;

		const withBreakdown = eventItem.breakdown.dogs + eventItem.breakdown.cats + eventItem.breakdown.others > 0;
		includeBreakdownCheckbox.checked = withBreakdown;
		speciesBreakdown.classList.toggle('hidden', !withBreakdown);
		speciesBreakdown.setAttribute('aria-hidden', String(!withBreakdown));

		eventProgressValue.textContent = eventItem.comparison.event;
		averageProgressValue.textContent = eventItem.comparison.average;
		highestProgressValue.textContent = eventItem.comparison.highest;

		setProgress(eventProgress, eventItem.comparison.event, eventItem.comparison.highest);
		setProgress(averageProgress, eventItem.comparison.average, eventItem.comparison.highest);
		setProgress(highestProgress, eventItem.comparison.highest, eventItem.comparison.highest);

		const delta = Math.round(((eventItem.comparison.event - eventItem.comparison.average) / eventItem.comparison.average) * 100);
		const direction = delta >= 0 ? 'above' : 'below';
		comparisonNote.textContent = `${delta >= 0 ? '↑' : '↓'} ${Math.abs(delta)}% ${direction} barangay average - ${delta >= 0 ? 'good turnout' : 'needs follow up'}!`;

		postEventForm.dataset.activeEventId = eventItem.id;
		setPanel('detail');
	};

	tableBody.addEventListener('click', (event) => {
		const row = event.target.closest('tr[data-event-id]');
		if (!row) return;
		hydrateDetail(row.dataset.eventId);
	});

	backToDashboardBtn.addEventListener('click', () => {
		setPanel('dashboard');
	});

	includeBreakdownCheckbox.addEventListener('change', () => {
		const show = includeBreakdownCheckbox.checked;
		speciesBreakdown.classList.toggle('hidden', !show);
		speciesBreakdown.setAttribute('aria-hidden', String(!show));
	});

	postEventForm.addEventListener('submit', (event) => {
		event.preventDefault();

		const activeId = postEventForm.dataset.activeEventId;
		const eventItem = state.events.find((item) => item.id === activeId);
		if (!eventItem) return;

		eventItem.totalVaccinated = Number(totalVaccinatedInput.value || 0);

		if (includeBreakdownCheckbox.checked) {
			eventItem.breakdown = {
				dogs: Number(dogsCount.value || 0),
				cats: Number(catsCount.value || 0),
				others: Number(othersCount.value || 0)
			};
		} else {
			eventItem.breakdown = { dogs: 0, cats: 0, others: 0 };
		}

		eventItem.status = 'Completed';
		renderTable();
		updatePendingMetric();
		hydrateDetail(eventItem.id);
		alert('Report saved locally. Backend integration can be connected later.');
	});

	const openModal = () => {
		createEventModal.classList.remove('hidden');
	};

	const closeModal = () => {
		createEventModal.classList.add('hidden');
		createEventForm.reset();
	};

	openCreateEventBtn.addEventListener('click', openModal);
	closeCreateEventBtn.addEventListener('click', closeModal);
	cancelCreateEventBtn.addEventListener('click', closeModal);

	createEventModal.addEventListener('click', (event) => {
		if (event.target === createEventModal) closeModal();
	});

	createEventForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const formData = new FormData(createEventForm);

		const date = formData.get('date');
		const barangay = formData.get('barangay');
		const vaccine = formData.get('vaccine');

		const id = `evt-${Date.now()}`;
		const dateObj = new Date(date);
		const dateLabel = dateObj.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		state.events.unshift({
			id,
			date,
			dateLabel,
			barangay,
			vaccine,
			status: 'Pending Report',
			totalVaccinated: '',
			breakdown: { dogs: 0, cats: 0, others: 0 },
			comparison: { event: 0, average: 65, highest: 100 }
		});

		renderTable();
		updatePendingMetric();
		closeModal();
	});

	const buildCharts = () => {
		const axisLabel = ['Poblacion', 'San Jose', 'Tangos', 'Matangtubig', 'Makinabang', 'Tipacan', 'Santo Cristo', 'Sta. Cruz'];

		new Chart(document.getElementById('vaccinatedPerBarangayChart'), {
			type: 'bar',
			data: {
				labels: axisLabel,
				datasets: [
					{ label: 'Anti-Rabies', data: [4, 3, 6, 5, 5, 3, 2, 8], backgroundColor: '#0f2a6d' },
					{ label: '5-in-1', data: [2, 1, 4, 4, 3, 2, 1, 5], backgroundColor: '#2f9df0' },
					{ label: 'Others', data: [1, 0, 2, 1, 1, 1, 0, 2], backgroundColor: '#1728d9' }
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: { beginAtZero: true, ticks: { color: '#456084' }, grid: { color: '#edf2f9' } },
					x: { ticks: { color: '#456084' }, grid: { display: false } }
				},
				plugins: { legend: { position: 'bottom' } }
			}
		});

		new Chart(document.getElementById('predictedAnimalsChart'), {
			type: 'bar',
			data: {
				labels: axisLabel,
				datasets: [
					{ label: 'Anti-Rabies', data: [45, 64, 75, 67, 80, 56, 70, 90], backgroundColor: '#0f2a6d' },
					{ label: '5-in-1', data: [28, 53, 32, 41, 66, 25, 54, 86], backgroundColor: '#2f9df0' },
					{ label: 'Others', data: [19, 22, 21, 25, 34, 12, 41, 52], backgroundColor: '#1728d9' }
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: { ticks: { color: '#456084' }, grid: { display: false } },
					x: { beginAtZero: true, ticks: { color: '#456084' }, grid: { color: '#edf2f9' } }
				},
				plugins: { legend: { position: 'bottom' } }
			}
		});

		new Chart(document.getElementById('vaccineTypesChart'), {
			type: 'doughnut',
			data: {
				labels: ['Anti-rabies', '5-in-1', 'Others'],
				datasets: [
					{
						data: [79, 79, 79],
						backgroundColor: ['#2f9df0', '#072f6b', '#1825d8'],
						borderWidth: 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '45%',
				plugins: { legend: { position: 'right' } }
			}
		});

		new Chart(document.getElementById('vaccinesNeededChart'), {
			type: 'bar',
			data: {
				labels: ['Pob', 'Tangos', 'SJ', 'SC', 'MB', 'Tipacan', 'Santo Cristo', 'Makinabang'],
				datasets: [
					{ label: 'Others', data: [30, 70, 35, 95, 60, 55, 42, 52], backgroundColor: '#364e6e' },
					{ label: '5-in-1', data: [42, 22, 26, 56, 48, 44, 30, 40], backgroundColor: '#2f9df0' },
					{ label: 'Anti-Rabies', data: [58, 40, 68, 90, 74, 65, 52, 75], backgroundColor: '#3137d8' }
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: { beginAtZero: true, stacked: true, ticks: { color: '#456084' }, grid: { color: '#edf2f9' } },
					x: { stacked: true, ticks: { color: '#456084' }, grid: { display: false } }
				},
				plugins: { legend: { position: 'bottom' } }
			}
		});
	};

	renderTable();
	updatePendingMetric();
	setPanel('dashboard');
	closeModal();
	buildCharts();
});
