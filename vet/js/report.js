document.addEventListener('DOMContentLoaded', () => {
	const reportMonth = new Date(2024, 1, 23);

	const state = {
		rows: createRows(),
		filters: {
			dateType: 'month',
			category: 'all'
		},
		draftFilters: {
			dateType: 'month',
			category: 'all'
		},
		sortDirection: 'asc',
		page: 1,
		pageSize: 6,
		filterOpen: false,
		exportOpen: false,
		exportFormat: 'pdf'
	};

	const ui = {
		tableBody: document.getElementById('report-table-body'),
		summary: document.getElementById('report-summary'),
		pagination: document.getElementById('pagination'),
		totalMetric: document.getElementById('metric-total'),
		diseaseMetric: document.getElementById('metric-disease'),
		barangayMetric: document.getElementById('metric-barangay'),
		filterButton: document.getElementById('filter-button'),
		filterPopover: document.getElementById('filter-popover'),
		filterDone: document.getElementById('filter-done'),
		dateType: document.getElementById('date-type'),
		reportCategory: document.getElementById('report-category'),
		sortButton: document.getElementById('sort-button'),
		exportButton: document.getElementById('export-button'),
		exportModalOverlay: document.getElementById('export-modal-overlay'),
		exportClose: document.getElementById('export-close'),
		exportCancel: document.getElementById('export-cancel'),
		exportDownload: document.getElementById('export-download')
	};

	function createRows() {
		const owners = [
			{ name: 'Sheena Ramos', contact: '09959210140' },
			{ name: 'Ricardo Dalay', contact: '09123456789' },
			{ name: 'Elena J. Hite', contact: '09228887798' },
			{ name: 'Mark Anthony', contact: '09459990011' },
			{ name: 'Sarah Miller', contact: '09057774433' },
			{ name: 'Josefine Cruz', contact: '09176662211' },
			{ name: 'Daniel Reyes', contact: '09328887710' },
			{ name: 'Mia Santos', contact: '09112223344' }
		];

		const canine = [
			{ petName: 'Bella', petType: 'Dog (Golden Retriever)', disease: 'Canine Parvovirus' },
			{ petName: 'Max', petType: 'Dog (German Shepherd)', disease: 'Canine Parvovirus' },
			{ petName: 'Rocky', petType: 'Dog (Beagle)', disease: 'Canine Distemper' },
			{ petName: 'Coco', petType: 'Dog (Poodle)', disease: 'Canine Parvovirus' },
			{ petName: 'Bruno', petType: 'Dog (Mixed Breed)', disease: 'Canine Parvovirus' }
		];

		const feline = [
			{ petName: 'Luna', petType: 'Cat (Siamese)', disease: 'Feline Panleukopenia' },
			{ petName: 'Daisy', petType: 'Cat (Persian)', disease: 'Feline Calicivirus' },
			{ petName: 'Milo', petType: 'Cat (Maine Coon)', disease: 'Feline Panleukopenia' },
			{ petName: 'Nala', petType: 'Cat (British Shorthair)', disease: 'Feline Herpesvirus' }
		];

		const livestock = [
			{ petName: 'Maya', petType: 'Goat (Native)', disease: 'Bacterial Infection' },
			{ petName: 'Bessie', petType: 'Cow (Dairy)', disease: 'Hoof Injury' },
			{ petName: 'Sunny', petType: 'Chicken (Layer)', disease: 'Respiratory Infection' }
		];

		const barangays = [
			'Tangos',
			'Tangos',
			'Tangos',
			'Tangos',
			'Tangos',
			'San Pedro',
			'San Pedro',
			'San Pedro',
			'San Jose',
			'San Jose',
			'Matang Tubig',
			'Matang Tubig'
		];

		const rows = [];
		for (let index = 0; index < 120; index += 1) {
			const day = (index % 28) + 1;
			const date = new Date(reportMonth.getFullYear(), reportMonth.getMonth(), day);
			const owner = owners[index % owners.length];
			const group = index < 72 ? 'canine' : index < 102 ? 'feline' : 'livestock';
			const template = group === 'canine'
				? canine[index % canine.length]
				: group === 'feline'
					? feline[index % feline.length]
					: livestock[index % livestock.length];

			rows.push({
				id: String(index + 1).padStart(7, '0'),
				ownerName: owner.name,
				contactNumber: owner.contact,
				petName: template.petName,
				petType: template.petType,
				category: group,
				barangay: barangays[index % barangays.length],
				sex: index % 2 === 0 ? 'F' : 'M',
				date,
				disease: template.disease
			});
		}

		return rows;
	}

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function formatDate(value) {
		return new Intl.DateTimeFormat('en-US', {
			month: '2-digit',
			day: '2-digit',
			year: 'numeric'
		}).format(value);
	}

	function sameDay(left, right) {
		return left.getFullYear() === right.getFullYear()
			&& left.getMonth() === right.getMonth()
			&& left.getDate() === right.getDate();
	}

	function getWeekStart(reference) {
		const start = new Date(reference);
		start.setDate(start.getDate() - 6);
		start.setHours(0, 0, 0, 0);
		return start;
	}

	function matchesDateType(rowDate) {
		if (state.filters.dateType === 'all') return true;
		if (state.filters.dateType === 'today') return sameDay(rowDate, reportMonth);
		if (state.filters.dateType === 'week') {
			const start = getWeekStart(reportMonth);
			return rowDate >= start && rowDate <= reportMonth;
		}
		return rowDate.getFullYear() === reportMonth.getFullYear()
			&& rowDate.getMonth() === reportMonth.getMonth();
	}

	function matchesCategory(row) {
		if (state.filters.category === 'all') return true;
		return row.category === state.filters.category;
	}

	function getFilteredRows() {
		return state.rows
			.filter((row) => matchesDateType(row.date) && matchesCategory(row))
			.sort((left, right) => {
				const direction = state.sortDirection === 'asc' ? 1 : -1;
				if (left.date.getTime() !== right.date.getTime()) {
					return (left.date.getTime() - right.date.getTime()) * direction;
				}
				return left.id.localeCompare(right.id) * direction;
			});
	}

	function renderMetrics() {
		const monthRows = state.rows.filter((row) => row.date.getFullYear() === reportMonth.getFullYear()
			&& row.date.getMonth() === reportMonth.getMonth());
		const diseaseCounts = new Map();
		const barangayCounts = new Map();

		monthRows.forEach((row) => {
			diseaseCounts.set(row.disease, (diseaseCounts.get(row.disease) || 0) + 1);
			barangayCounts.set(row.barangay, (barangayCounts.get(row.barangay) || 0) + 1);
		});

		let topDisease = 'Canine Parvovirus';
		let topDiseaseCount = 0;
		diseaseCounts.forEach((count, disease) => {
			if (count > topDiseaseCount) {
				topDisease = disease;
				topDiseaseCount = count;
			}
		});

		let topBarangay = 'Tangos';
		let topBarangayCount = 0;
		barangayCounts.forEach((count, barangay) => {
			if (count > topBarangayCount) {
				topBarangay = barangay;
				topBarangayCount = count;
			}
		});

		if (ui.totalMetric) ui.totalMetric.textContent = String(monthRows.length);
		if (ui.diseaseMetric) ui.diseaseMetric.textContent = topDisease;
		if (ui.barangayMetric) ui.barangayMetric.textContent = topBarangay;
	}

	function renderPagination(totalPages) {
		if (!ui.pagination) return;

		const items = [];
		items.push(`<button type="button" class="page-btn" data-page="${Math.max(1, state.page - 1)}" ${state.page <= 1 ? 'disabled' : ''} aria-label="Previous page">&lsaquo;</button>`);

		const start = Math.max(1, state.page - 1);
		const end = Math.min(totalPages, start + 2);
		for (let page = start; page <= end; page += 1) {
			items.push(`<button type="button" class="page-btn ${page === state.page ? 'active' : ''}" data-page="${page}">${page}</button>`);
		}

		if (end < totalPages) {
			items.push('<span class="page-ellipsis">...</span>');
		}

		items.push(`<button type="button" class="page-btn" data-page="${Math.min(totalPages, state.page + 1)}" ${state.page >= totalPages ? 'disabled' : ''} aria-label="Next page">&rsaquo;</button>`);
		ui.pagination.innerHTML = items.join('');
	}

	function renderTable() {
		const filteredRows = getFilteredRows();
		const totalPages = Math.max(1, Math.ceil(filteredRows.length / state.pageSize));
		state.page = Math.min(state.page, totalPages);

		const startIndex = (state.page - 1) * state.pageSize;
		const pageRows = filteredRows.slice(startIndex, startIndex + state.pageSize);

		if (pageRows.length) {
			ui.tableBody.innerHTML = pageRows.map((row) => `
				<tr>
					<td><span class="patient-id">${escapeHtml(row.id)}</span></td>
					<td>${escapeHtml(row.ownerName)}</td>
					<td>${escapeHtml(row.contactNumber)}</td>
					<td>${escapeHtml(row.petName)}</td>
					<td>${escapeHtml(row.petType)}</td>
					<td>${escapeHtml(row.barangay)}</td>
					<td>${escapeHtml(row.sex)}</td>
					<td>${escapeHtml(formatDate(row.date))}</td>
				</tr>
			`).join('');
		} else {
			ui.tableBody.innerHTML = '<tr><td colspan="8">No report rows match the selected filters.</td></tr>';
		}

		if (ui.summary) {
			ui.summary.textContent = `Displaying ${pageRows.length} of ${filteredRows.length} Patients`;
		}

		renderPagination(totalPages);
	}

	function renderAll() {
		renderMetrics();
		renderTable();
	}

	function openFilterPopover() {
		if (!ui.filterPopover) return;
		state.filterOpen = true;
		state.draftFilters = { ...state.filters };
		ui.dateType.value = state.draftFilters.dateType;
		ui.reportCategory.value = state.draftFilters.category;
		ui.filterPopover.hidden = false;
		ui.filterButton.setAttribute('aria-expanded', 'true');
	}

	function closeFilterPopover(commit = false) {
		if (!ui.filterPopover) return;
		if (commit) {
			state.filters = { ...state.draftFilters };
			state.page = 1;
			renderAll();
		}
		state.filterOpen = false;
		ui.filterPopover.hidden = true;
		ui.filterButton.setAttribute('aria-expanded', 'false');
	}

	function openExportModal() {
		state.exportOpen = true;
		ui.exportModalOverlay.hidden = false;
		document.body.style.overflow = 'hidden';
		syncExportSelection();
	}

	function closeExportModal() {
		state.exportOpen = false;
		ui.exportModalOverlay.hidden = true;
		document.body.style.overflow = '';
	}

	function syncExportSelection() {
		document.querySelectorAll('.export-option').forEach((option) => {
			const isSelected = option.dataset.format === state.exportFormat;
			option.classList.toggle('active', isSelected);
			option.setAttribute('aria-pressed', String(isSelected));
		});
	}

	function escapePdfText(value) {
		return String(value ?? '')
			.replace(/\\/g, '\\\\')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)');
	}

	function buildPdfBlob(rows) {
		const lines = [
			'VBETTER REPORT EXPORT',
			`Month: ${reportMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
			`Filter: ${state.filters.dateType.toUpperCase()} / ${state.filters.category.toUpperCase()}`,
			`Rows: ${rows.length}`,
			''
		];

		rows.slice(0, 18).forEach((row) => {
			lines.push(`${row.id} | ${row.ownerName} | ${row.petName} | ${row.petType} | ${row.barangay} | ${formatDate(row.date)}`);
		});

		const content = lines.map((line, index) => `BT /F1 10 Tf 48 ${760 - (index * 16)} Td (${escapePdfText(line)}) Tj ET`).join('\n');
		const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream\n`;

		const objects = [
			'%PDF-1.4\n',
			'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
			'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
			'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
			'4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
			`5 0 obj\n${stream}endobj\n`
		];

		let body = '';
		const offsets = [0];
		objects.forEach((object) => {
			offsets.push(body.length);
			body += object;
		});

		const xrefOffset = body.length;
		const xref = [
			'xref\n',
			'0 6\n',
			'0000000000 65535 f \n',
			...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`),
			'trailer\n',
			'<< /Size 6 /Root 1 0 R >>\n',
			'startxref\n',
			`${xrefOffset}\n`,
			'%%EOF'
		].join('');

		return new Blob([body + xref], { type: 'application/pdf' });
	}

	function downloadText(content, fileName, mimeType) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}

	function exportCsv(rows) {
		const header = ['Patient ID', 'Owner Name', 'Contact Number', 'Pet Name', 'Pet Type', 'Barangay', 'Sex', 'Date'];
		const csvRows = [header.join(',')];
		rows.forEach((row) => {
			csvRows.push([
				row.id,
				row.ownerName,
				row.contactNumber,
				row.petName,
				row.petType,
				row.barangay,
				row.sex,
				formatDate(row.date)
			].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
		});
		downloadText(csvRows.join('\n'), 'vbetter-report-export.csv', 'text/csv;charset=utf-8');
	}

	function exportPdf(rows) {
		const blob = buildPdfBlob(rows);
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'vbetter-report-export.pdf';
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}

	function handleExport() {
		const filteredRows = getFilteredRows();
		if (state.exportFormat === 'csv') {
			exportCsv(filteredRows);
		} else {
			exportPdf(filteredRows);
		}
		closeExportModal();
	}

	ui.filterButton.addEventListener('click', (event) => {
		event.stopPropagation();
		if (state.filterOpen) {
			closeFilterPopover(false);
			return;
		}
		openFilterPopover();
	});

	ui.filterDone.addEventListener('click', () => {
		closeFilterPopover(true);
	});

	ui.dateType.addEventListener('change', () => {
		state.draftFilters.dateType = ui.dateType.value;
	});

	ui.reportCategory.addEventListener('change', () => {
		state.draftFilters.category = ui.reportCategory.value;
	});

	ui.sortButton.addEventListener('click', () => {
		state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
		state.page = 1;
		renderTable();
	});

	ui.exportButton.addEventListener('click', openExportModal);
	ui.exportClose.addEventListener('click', closeExportModal);
	ui.exportCancel.addEventListener('click', closeExportModal);
	ui.exportDownload.addEventListener('click', handleExport);

	ui.exportModalOverlay.addEventListener('click', (event) => {
		if (event.target === ui.exportModalOverlay) {
			closeExportModal();
		}
	});

	document.querySelectorAll('.export-option').forEach((option) => {
		option.addEventListener('click', () => {
			state.exportFormat = option.dataset.format;
			syncExportSelection();
		});
	});

	ui.pagination.addEventListener('click', (event) => {
		const button = event.target.closest('.page-btn');
		if (!button || button.disabled) return;
		const nextPage = Number(button.dataset.page);
		if (!Number.isNaN(nextPage)) {
			state.page = nextPage;
			renderTable();
		}
	});

	document.addEventListener('click', (event) => {
		if (!state.filterOpen) return;
		const clickedInsideFilter = event.target.closest('#filter-popover') || event.target.closest('#filter-button');
		if (!clickedInsideFilter) {
			closeFilterPopover(false);
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			if (state.exportOpen) closeExportModal();
			if (state.filterOpen) closeFilterPopover(false);
		}
	});

	renderAll();
});
