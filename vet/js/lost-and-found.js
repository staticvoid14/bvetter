const lfData = {
	filters: {
		types: ["All Types", "Lost", "Found"],
		sources: ["All Sources", "Owner", "Admin/Clinic"],
		barangays: ["Select Barangay", "Tangos", "Poblacion", "Sta. Cruz", "San Jose", "Tibig", "Sto. Cristo"]
	},
	tabs: [
		{ id: "pending", label: "Pending Review" },
		{ id: "active", label: "Active Reports" },
		{ id: "potential", label: "Potential Matches", badge: "NEW" },
		{ id: "resolved", label: "Resolved Cases" },
		{ id: "claims", label: "Claims" },
		{ id: "sighting", label: "Sighting" }
	],
	pendingReports: [
		{
			id: "P-991",
			caseId: "#RESC-99281",
			type: "Found",
			petName: "Found Pet Report",
			breed: "Cat - Persian",
			sex: "Male",
			size: "Small (Under 10kg)",
			markings: "White chest patch",
			notes: "Friendly but nervous, wearing a blue collar.",
			title: "Found Pet Report",
			uploader: "Sheena Ramos",
			contact: "09959210640",
			source: "Owner",
			barangay: "Sta. Cruz",
			date: "Feb 19, 2026",
			time: "10:24 AM",
			dateLost: "October 24, 2023",
			timeLost: "Approx. 4:30 PM",
			image: "https://images.pexels.com/photos/5731866/pexels-photo-5731866.jpeg?auto=compress&cs=tinysrgb&w=800"
		},
		{
			id: "P-992",
			caseId: "#RESC-99282",
			type: "Lost",
			petName: "Golden Retriever (Male)",
			breed: "Dog - Golden Retriever",
			sex: "Male",
			size: "Large (20kg+)",
			markings: "Blue neck bandana",
			notes: "Lost near park. Responds to his name, very social.",
			title: "Golden Retriever (Male)",
			uploader: "Ivan Maximo",
			contact: "09982415670",
			source: "Owner",
			barangay: "Tibig",
			date: "Feb 18, 2026",
			time: "08:12 PM",
			dateLost: "October 24, 2023",
			timeLost: "Approx. 4:30 PM",
			image: "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=800"
		}
	],
	activeReports: [
		{
			id: "A-101",
			caseId: "#ACT-1001",
			type: "Lost",
			title: "Pepper",
			breed: "Cat",
			sex: "Female",
			size: "Small",
			source: "Owner",
			barangay: "Tangos",
			date: "Feb 02, 2026",
			uploadedBy: "John Maximo",
			contact: "09959210640",
			markings: "Gray and White",
			notes: "Last seen near public market.",
			image: "https://images.pexels.com/photos/6869637/pexels-photo-6869637.jpeg?auto=compress&cs=tinysrgb&w=800",
			suggestMatches: []
		},
		{
			id: "A-102",
			caseId: "#ACT-1002",
			type: "Lost",
			title: "Copper",
			breed: "Dog - Golden Retriever",
			sex: "Male",
			size: "Large",
			source: "Owner",
			barangay: "Tibig",
			date: "Feb 22, 2026",
			uploadedBy: "John Maximo",
			contact: "09959210640",
			markings: "Golden coat",
			notes: "Friendly and responds to his name.",
			image: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800",
			suggestMatches: []
		},
		{
			id: "A-103",
			caseId: "#ACT-1003",
			type: "Found",
			title: "Found Cat #2",
			breed: "Cat - Persian",
			sex: "Male",
			size: "Small",
			source: "Admin/Clinic",
			barangay: "San Jose",
			date: "Feb 22, 2026",
			uploadedBy: "Clinic",
			contact: "09959320124",
			markings: "White chest patch",
			notes: "Found near clinic gate.",
			image: "https://images.pexels.com/photos/2180873/pexels-photo-2180873.jpeg?auto=compress&cs=tinysrgb&w=800",
			suggestMatches: [
				{
					candidateCase: "#F-201",
					confidence: 94,
					candidateName: "Ming",
					reasons: ["Same Color", "Same Location", "Same Sex"],
					image: "https://images.pexels.com/photos/6869637/pexels-photo-6869637.jpeg?auto=compress&cs=tinysrgb&w=300"
				}
			]
		},
		{
			id: "A-104",
			caseId: "#ACT-1004",
			type: "Lost",
			title: "Coco",
			breed: "Dog - Shih Tzu",
			sex: "Male",
			size: "Small",
			source: "Owner",
			barangay: "Poblacion",
			date: "Feb 22, 2026",
			uploadedBy: "Rosa Dela Cruz",
			contact: "09962317990",
			markings: "Black and white fur",
			notes: "Seen near old municipal hall.",
			image: "https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=800",
			suggestMatches: []
		}
	],
	potentialMatches: [
		{
			id: "M-1",
			confidence: 70,
			lost: {
				reportId: "A-101",
				name: "Ming",
				breed: "Cat",
				sex: "Female",
				location: "Barangay Tangos",
				owner: "John Maximo",
				image: "https://images.pexels.com/photos/6869637/pexels-photo-6869637.jpeg?auto=compress&cs=tinysrgb&w=400"
			},
			found: {
				reportId: "A-103",
				name: "Found Cat #1",
				breed: "Mixed",
				sex: "Male",
				location: "Barangay Tangos",
				source: "Clinic",
				image: "https://images.pexels.com/photos/2180873/pexels-photo-2180873.jpeg?auto=compress&cs=tinysrgb&w=400"
			},
			reasons: ["Same Breed Type", "Same Color", "Same Barangay"],
			status: "suggested"
		}
	],
	resolvedCases: [
		{
			id: "R-801",
			petName: "Jeferson",
			breed: "Dog / Golden Retriever",
			source: "Owner",
			submitter: "Sheena Ramos",
			location: "Verified locally",
			dateLost: "Feb 5, 2026",
			dateResolved: "Feb 10, 2026"
		},
		{
			id: "R-802",
			petName: "Kiko",
			breed: "Dog / Aspin",
			source: "Owner",
			submitter: "Rosa Dela Cruz",
			location: "Legazpi Memory",
			dateLost: "Feb 5, 2026",
			dateResolved: "Feb 10, 2026"
		},
		{
			id: "R-803",
			petName: "Found Dog #4",
			breed: "Dog / Aspin",
			source: "Admin",
			submitter: "Admin/Clinic",
			location: "System Owner Verified",
			dateLost: "Feb 3, 2026",
			dateResolved: "Feb 8, 2026"
		}
	],
	claims: [
		{
			id: "C-11",
			caseId: "#CLAIM-831",
			title: "Sheena Ramos",
			petName: "Found Pet #12",
			source: "Owner",
			barangay: "Sta. Cruz",
			uploadedAt: "Feb 19, 2026 - 10:24 AM",
			contact: "09959210640",
			image: "https://images.pexels.com/photos/5731866/pexels-photo-5731866.jpeg?auto=compress&cs=tinysrgb&w=600"
		}
	],
	sightings: [
		{
			id: "S-51",
			caseId: "#SIGHT-422",
			title: "Persian Cat Spotted near Public Market",
			source: "Owner",
			barangay: "Sto. Cristo",
			uploadedAt: "Feb 19, 2026 - 10:24 AM",
			dateLost: "October 24, 2023",
			timeLost: "Approx. 4:30 PM",
			uploader: "John Maximo",
			contact: "09959210640",
			image: "https://images.pexels.com/photos/6869637/pexels-photo-6869637.jpeg?auto=compress&cs=tinysrgb&w=800"
		}
	]
};

const barangayCoordinates = {
	"Tangos": [14.9599, 120.9083],
	"Poblacion": [14.9621, 120.9017],
	"Sta. Cruz": [14.9578, 120.9066],
	"San Jose": [14.9542, 120.9099],
	"Tibig": [14.9518, 120.8992],
	"Sto. Cristo": [14.9498, 120.9038],
	"Select Barangay": [14.9577, 120.9055]
};

const lfState = {
	activeTab: "pending",
	search: "",
	typeFilter: "All Types",
	sourceFilter: "All Sources",
	barangayFilter: "Select Barangay",
	selectedMatchId: lfData.potentialMatches[0]?.id || null,
	modalMaps: []
};

function initLostFound() {
	populateFilterSelects();
	bindControls();
	renderEverything();
}

function bindControls() {
	document.getElementById("searchInput").addEventListener("input", (event) => {
		lfState.search = event.target.value.trim().toLowerCase();
		renderContent();
	});

	document.getElementById("typeFilter").addEventListener("change", (event) => {
		lfState.typeFilter = event.target.value;
		renderContent();
	});

	document.getElementById("sourceFilter").addEventListener("change", (event) => {
		lfState.sourceFilter = event.target.value;
		renderContent();
	});

	document.getElementById("barangayFilter").addEventListener("change", (event) => {
		lfState.barangayFilter = event.target.value;
		renderContent();
	});

	document.getElementById("uploadFoundBtn").addEventListener("click", () => {
		openModal(buildUploadModal());
	});

	document.getElementById("closeModalBtn").addEventListener("click", closeModal);
	document.getElementById("lfModalOverlay").addEventListener("click", (event) => {
		if (event.target.id === "lfModalOverlay") {
			closeModal();
		}
	});
}

function populateFilterSelects() {
	const type = document.getElementById("typeFilter");
	const source = document.getElementById("sourceFilter");
	const barangay = document.getElementById("barangayFilter");

	fillSelect(type, lfData.filters.types);
	fillSelect(source, lfData.filters.sources);
	fillSelect(barangay, lfData.filters.barangays);
}

function fillSelect(element, values) {
	element.innerHTML = values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function renderEverything() {
	renderStats();
	renderTabs();
	renderContent();
}

function renderStats() {
	const stats = [
		{
			label: "Pending Review",
			value: lfData.pendingReports.length,
			foot: "Submissions",
			featured: true
		},
		{
			label: "Active Lost Pets",
			value: lfData.activeReports.length,
			foot: "Currently visible"
		},
		{
			label: "Admin Uploaded",
			value: lfData.activeReports.filter((item) => item.source === "Admin/Clinic").length,
			foot: "From clinics"
		},
		{
			label: "Suggested Matches",
			value: lfData.potentialMatches.filter((item) => item.status === "suggested").length,
			foot: "AI candidates"
		},
		{
			label: "Resolved",
			value: lfData.resolvedCases.length,
			foot: "Closed reports"
		}
	];

	document.getElementById("statsRow").innerHTML = stats
		.map(
			(stat) => `
			<article class="stat-card ${stat.featured ? "featured" : ""}">
				<h5>${stat.label}</h5>
				<strong>${stat.value}</strong>
				<small>${stat.foot}</small>
			</article>
		`
		)
		.join("");
}

function renderTabs() {
	const tabRoot = document.getElementById("tabBar");
	tabRoot.innerHTML = lfData.tabs
		.map((tab) => {
			const activeClass = lfState.activeTab === tab.id ? "active" : "";
			const badge = tab.badge ? `<span class="tab-pill">${tab.badge}</span>` : "";
			return `<button class="tab-btn ${activeClass}" data-tab-id="${tab.id}">${tab.label}${badge}</button>`;
		})
		.join("");

	tabRoot.querySelectorAll(".tab-btn").forEach((button) => {
		button.addEventListener("click", () => {
			lfState.activeTab = button.dataset.tabId;
			renderTabs();
			renderContent();
		});
	});
}

function renderContent() {
	const content = document.getElementById("lfContent");

	if (lfState.activeTab === "pending") {
		renderPending(content);
		return;
	}
	if (lfState.activeTab === "active") {
		renderActive(content);
		return;
	}
	if (lfState.activeTab === "potential") {
		renderPotential(content);
		return;
	}
	if (lfState.activeTab === "resolved") {
		renderResolved(content);
		return;
	}
	if (lfState.activeTab === "claims") {
		renderClaims(content);
		return;
	}
	renderSighting(content);
}

function applyCommonFilters(items, mapFn) {
	return items.filter((item) => {
		const model = mapFn(item);
		const searchable = `${model.title} ${model.breed} ${model.barangay} ${model.source}`.toLowerCase();
		const searchMatch = lfState.search ? searchable.includes(lfState.search) : true;
		const typeMatch = lfState.typeFilter === "All Types" || model.type === lfState.typeFilter;
		const sourceMatch = lfState.sourceFilter === "All Sources" || model.source === lfState.sourceFilter;
		const barangayMatch = lfState.barangayFilter === "Select Barangay" || model.barangay === lfState.barangayFilter;
		return searchMatch && typeMatch && sourceMatch && barangayMatch;
	});
}

function renderPending(root) {
	const list = applyCommonFilters(lfData.pendingReports, (item) => ({
		title: item.title,
		breed: item.breed,
		barangay: item.barangay,
		source: item.source,
		type: item.type
	}));

	root.innerHTML = `
		<div class="list-note">Notice: these are submitted by pet owners. Review details carefully before approving. Approved posts will be visible publicly.</div>
		${list
			.map(
				(report) => `
				<article class="report-card ${report.type === "Found" ? "pending-found" : "pending-lost"}">
					<div class="report-image">
						<img src="${report.image}" alt="${report.petName}">
						<span class="tag-chip ${report.type.toLowerCase()}">${report.type.toUpperCase()}</span>
					</div>
					<div class="report-body">
						<h3>${report.title}</h3>
						<p class="meta-line">Submitted by ${report.uploader} • ${report.date}</p>
						<p class="desc-line">${report.notes}</p>
						<div class="card-actions">
							<button class="btn btn-success" data-action="approve-pending" data-id="${report.id}">Approve</button>
							<button class="btn btn-danger" data-action="reject-pending" data-id="${report.id}">Reject</button>
							<button class="btn btn-secondary" data-action="view-pending" data-id="${report.id}">View</button>
						</div>
					</div>
					<div class="report-side">
						<span class="pill">${report.barangay}</span>
						<span class="pill">${report.size}</span>
					</div>
				</article>
			`
			)
			.join("")}
	`;

	bindRootActions(root);
}

function renderActive(root) {
	const list = applyCommonFilters(lfData.activeReports, (item) => ({
		title: item.title,
		breed: item.breed,
		barangay: item.barangay,
		source: item.source,
		type: item.type
	}));

	root.innerHTML = `
		<div class="active-grid">
			${list
				.map(
					(item) => `
					<article class="active-card" data-action="view-active" data-id="${item.id}">
						<img src="${item.image}" alt="${item.title}">
						<div class="active-overlay">
							<h4>${item.title}</h4>
							<small>Lost at ${item.barangay} • ${item.date}</small>
							<div class="mini-row">
								<span class="mini-chip">${item.breed}</span>
								<span class="mini-chip">${item.sex}</span>
								<span class="mini-chip">${item.size}</span>
							</div>
                        <div class="foot">
                            <div class="uploader-info">
                            <p>Uploaded By:</p>
                            <h4>${item.source}</h4>
                            </div>
							<button class="btn btn-success resolve-btn" data-action="resolve-active" data-id="${item.id}">Resolve</button>
                         </div>
                        </div>
					</article>
				`
				)
				.join("")}
		</div>
	`;

	bindRootActions(root);
}

function renderPotential(root) {
	const selectedMatch = lfData.potentialMatches.find((item) => item.id === lfState.selectedMatchId) || lfData.potentialMatches[0];
	if (!selectedMatch && lfData.potentialMatches.length) {
		lfState.selectedMatchId = lfData.potentialMatches[0].id;
	}

	root.innerHTML = `
		<div class="potential-layout">
			<div class="potential-main">
				<div class="suggested-banner">Suggested matches are generated from breed, color, and barangay similarity. Approve to mark both cases resolved and notify uploader.</div>
				${lfData.potentialMatches
					.map(
						(match) => `
						<article class="match-card" data-action="select-match" data-id="${match.id}">
							<div class="match-pair">
								<div class="match-side">
									<img src="${match.lost.image}" alt="${match.lost.name}">
									<h4>${match.lost.name}</h4>
									<small>${match.lost.breed}</small>
								</div>
								<div class="score-pill">${match.confidence}%</div>
								<div class="match-side">
									<img src="${match.found.image}" alt="${match.found.name}">
									<h4>${match.found.name}</h4>
									<small>${match.found.breed}</small>
								</div>
							</div>
							<div class="reason-row">${match.reasons.map((reason) => `<span class="reason-chip">${reason}</span>`).join("")}</div>
							<button class="btn btn-success" data-action="approve-match" data-id="${match.id}">Approve Match</button>
						</article>
					`
					)
					.join("")}
			</div>
			<aside class="approval-card">
				<h3>Approve The Match</h3>
				${
					selectedMatch
						? `
						<p>By approving, both reports are marked resolved and submitter receives notification.</p>
						<div class="summary-box"><strong>Owner Name:</strong> ${selectedMatch.lost.owner}<br><strong>Pet Name:</strong> ${selectedMatch.lost.name}</div>
						<div class="summary-box"><strong>Date & Time:</strong> Mar 20, 2026 - 10:00 AM<br><strong>Type:</strong> Follow-up</div>
						<button class="btn btn-primary" data-action="approve-match" data-id="${selectedMatch.id}">Approve Match</button>
					`
						: "<p>No suggested matches right now.</p>"
				}
			</aside>
		</div>
	`;

	bindRootActions(root);
}

function renderResolved(root) {
	root.innerHTML = `
		<table class="resolved-table">
			<thead>
				<tr>
					<th>Pet Name</th>
					<th>Type/Breed</th>
					<th>Source</th>
					<th>Owner/Submitter</th>
					<th>Date Lost/Found</th>
					<th>Date Resolved</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				${lfData.resolvedCases
					.map(
						(item) => `
						<tr>
							<td>${item.petName}</td>
							<td>${item.breed}</td>
							<td>${item.source}</td>
							<td>${item.submitter}<br><small>${item.location}</small></td>
							<td>${item.dateLost}</td>
							<td>${item.dateResolved}</td>
							<td><span class="pill">Resolved</span></td>
						</tr>
					`
					)
					.join("")}
			</tbody>
		</table>
	`;
}

function renderClaims(root) {
	const list = applyCommonFilters(lfData.claims, (item) => ({
		title: item.title,
		breed: item.petName,
		barangay: item.barangay,
		source: item.source,
		type: "Found"
	}));

	root.innerHTML = list
		.map(
			(claim) => `
			<article class="report-card pending-found">
				<div class="report-image">
					<img src="${claim.image}" alt="${claim.petName}">
					<span class="tag-chip found">CLAIM</span>
				</div>
				<div class="report-body">
					<h3>Claimant: ${claim.title}</h3>
					<p class="meta-line">Uploaded: ${claim.uploadedAt}</p>
					<p class="desc-line">Contact Number: ${claim.contact}</p>
					<div class="card-actions">
						<button class="btn btn-success" data-action="approve-claim" data-id="${claim.id}">Approve</button>
						<button class="btn btn-danger" data-action="reject-claim" data-id="${claim.id}">Reject</button>
						<button class="btn btn-secondary" data-action="view-claim" data-id="${claim.id}">View</button>
					</div>
				</div>
				<div class="report-side"><span class="pill">${claim.barangay}</span></div>
			</article>
		`
		)
		.join("");

	bindRootActions(root);
}

function renderSighting(root) {
	const list = applyCommonFilters(lfData.sightings, (item) => ({
		title: item.title,
		breed: "Sighting",
		barangay: item.barangay,
		source: item.source,
		type: "Found"
	}));

	root.innerHTML = list
		.map(
			(sighting) => `
			<article class="report-card pending-found">
				<div class="report-image">
					<img src="${sighting.image}" alt="${sighting.title}">
					<span class="tag-chip found">SIGHTING</span>
				</div>
				<div class="report-body">
					<h3>${sighting.title}</h3>
					<p class="meta-line">Uploaded: ${sighting.uploadedAt}</p>
					<p class="desc-line">${sighting.barangay}, Baliwag, Bulacan</p>
					<div class="card-actions">
						<button class="btn btn-success" data-action="resolve-sighting" data-id="${sighting.id}">Approve</button>
						<button class="btn btn-danger" data-action="reject-sighting" data-id="${sighting.id}">Reject</button>
						<button class="btn btn-secondary" data-action="view-sighting" data-id="${sighting.id}">View</button>
					</div>
				</div>
				<div class="report-side"><span class="pill">${sighting.barangay}</span></div>
			</article>
		`
		)
		.join("");

	bindRootActions(root);
}

function bindRootActions(root) {
	root.querySelectorAll("[data-action]").forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			const action = button.dataset.action;
			const id = button.dataset.id;
			handleAction(action, id);
		});
	});
}

function handleAction(action, id) {
	if (action === "view-pending") {
		const report = lfData.pendingReports.find((item) => item.id === id);
		if (report) {
			openModal(buildReviewModal(report));
		}
		return;
	}

	if (action === "approve-pending") {
		approvePendingReport(id);
		return;
	}

	if (action === "reject-pending") {
		lfData.pendingReports = lfData.pendingReports.filter((item) => item.id !== id);
		refreshAfterDataChange();
		return;
	}

	if (action === "view-active") {
		const report = lfData.activeReports.find((item) => item.id === id);
		if (report) {
			openModal(buildActiveModal(report));
		}
		return;
	}

	if (action === "resolve-active") {
		resolveActiveReport(id);
		return;
	}

	if (action === "select-match") {
		lfState.selectedMatchId = id;
		renderContent();
		return;
	}

	if (action === "approve-match") {
		approveSuggestedMatch(id);
		return;
	}

	if (action === "view-claim") {
		const claim = lfData.claims.find((item) => item.id === id);
		if (claim) {
			openModal(buildClaimModal(claim));
		}
		return;
	}

	if (action === "approve-claim") {
		lfData.claims = lfData.claims.filter((item) => item.id !== id);
		refreshAfterDataChange();
		return;
	}

	if (action === "reject-claim") {
		lfData.claims = lfData.claims.filter((item) => item.id !== id);
		refreshAfterDataChange();
		return;
	}

	if (action === "view-sighting") {
		const sighting = lfData.sightings.find((item) => item.id === id);
		if (sighting) {
			openModal(buildSightingModal(sighting));
		}
		return;
	}

	if (action === "resolve-sighting") {
		lfData.sightings = lfData.sightings.filter((item) => item.id !== id);
		refreshAfterDataChange();
		return;
	}

	if (action === "reject-sighting") {
		lfData.sightings = lfData.sightings.filter((item) => item.id !== id);
		refreshAfterDataChange();
	}
}

function approvePendingReport(id) {
	const record = lfData.pendingReports.find((item) => item.id === id);
	if (!record) {
		return;
	}

	lfData.pendingReports = lfData.pendingReports.filter((item) => item.id !== id);
	lfData.activeReports.unshift({
		id: `A-${Date.now()}`,
		caseId: record.caseId,
		type: record.type,
		title: record.petName,
		breed: record.breed,
		sex: record.sex,
		size: record.size,
		source: record.source,
		barangay: record.barangay,
		date: record.date,
		uploadedBy: record.uploader,
		contact: record.contact,
		markings: record.markings,
		notes: record.notes,
		image: record.image,
		suggestMatches: []
	});
	refreshAfterDataChange();
}

function resolveActiveReport(id) {
	const record = lfData.activeReports.find((item) => item.id === id);
	if (!record) {
		return;
	}

	lfData.activeReports = lfData.activeReports.filter((item) => item.id !== id);
	lfData.resolvedCases.unshift({
		id: `R-${Date.now()}`,
		petName: record.title,
		breed: record.breed,
		source: record.source,
		submitter: record.uploadedBy,
		location: record.barangay,
		dateLost: record.date,
		dateResolved: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
	});
	refreshAfterDataChange();
}

function approveSuggestedMatch(matchId) {
	const match = lfData.potentialMatches.find((item) => item.id === matchId);
	if (!match) {
		return;
	}

	lfData.potentialMatches = lfData.potentialMatches.filter((item) => item.id !== matchId);

	lfData.resolvedCases.unshift({
		id: `R-${Date.now()}`,
		petName: `${match.lost.name} <> ${match.found.name}`,
		breed: `${match.lost.breed} / ${match.found.breed}`,
		source: "System Match",
		submitter: match.lost.owner,
		location: match.found.location,
		dateLost: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
		dateResolved: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
	});

	lfData.activeReports = lfData.activeReports.filter((item) => item.id !== match.lost.reportId && item.id !== match.found.reportId);
	lfState.selectedMatchId = lfData.potentialMatches[0]?.id || null;
	refreshAfterDataChange();
}

function refreshAfterDataChange() {
	closeModal();
	renderStats();
	renderContent();
}

function openModal(content) {
	document.getElementById("lfModalBody").innerHTML = content;
	document.getElementById("lfModalOverlay").hidden = false;
	setupModalMaps();
	wireUploadFormIfPresent();

	document.querySelectorAll("[data-modal-action]").forEach((button) => {
		button.addEventListener("click", () => {
			const action = button.dataset.modalAction;
			const id = button.dataset.id;
			if (action === "approve-pending") {
				approvePendingReport(id);
			} else if (action === "reject-pending") {
				lfData.pendingReports = lfData.pendingReports.filter((item) => item.id !== id);
				refreshAfterDataChange();
			} else if (action === "resolve-active") {
				resolveActiveReport(id);
			} else if (action === "approve-claim") {
				lfData.claims = lfData.claims.filter((item) => item.id !== id);
				refreshAfterDataChange();
			} else if (action === "resolve-sighting") {
				lfData.sightings = lfData.sightings.filter((item) => item.id !== id);
				refreshAfterDataChange();
			} else if (action === "view-active-reports") {
				closeModal();
				lfState.activeTab = "active";
				renderTabs();
				renderContent();
			} else if (action === "open-match-panel") {
				lfState.selectedMatchId = button.dataset.matchId;
				closeModal();
				lfState.activeTab = "potential";
				renderTabs();
				renderContent();
			} else {
				closeModal();
			}
		});
	});
}

function closeModal() {
	destroyModalMaps();
	document.getElementById("lfModalOverlay").hidden = true;
	document.getElementById("lfModalBody").innerHTML = "";
}

function buildReviewModal(report) {
	return buildDetailModal({
		heading: `Review ${report.type} Pet Report`,
		report,
		primaryLabel: "Approve",
		primaryAction: "approve-pending",
		secondaryLabel: "Reject Report",
		secondaryAction: "reject-pending"
	});
}

function buildActiveModal(report) {
	const relatedMatch = lfData.potentialMatches.find((match) => match.found.reportId === report.id) || null;
	const matchBlock =
		report.type === "Found" && relatedMatch
			? `
			<div class="potential-match-section">
				<h3>Potential Matches</h3>
				<div class="potential-match-card">
					<div class="potential-confidence">
						<span>CONFIDENCE</span>
						<strong>${relatedMatch.confidence}%</strong>
					</div>
					<div class="potential-media">
						<div class="potential-pair">
							<div class="potential-photo lost">
								<span class="potential-tag lost">LOST</span>
								<img src="${relatedMatch.lost.image}" alt="${relatedMatch.lost.name}">
							</div>
							<div class="potential-photo found">
								<span class="potential-tag found">MATCH</span>
								<img src="${relatedMatch.found.image}" alt="${relatedMatch.found.name}">
							</div>
						</div>
					</div>
					<div class="potential-copy">
						<h4>Case ${relatedMatch.found.reportId} - ${relatedMatch.found.name}</h4>
						<p>${relatedMatch.reasons.join(", ")}</p>
						<small>Found ${relatedMatch.found.location} • 12 mins after report</small>
					</div>
					<button type="button" class="compare-btn" data-modal-action="open-match-panel" data-match-id="${relatedMatch.id}">View Comparison</button>
				</div>
			</div>
		`
			: "";

	return `
		<div class="modal-layout modal-layout-report">
			<aside class="modal-media modal-media-report">
				<img src="${report.image}" alt="${report.title}">
				<div id="mapActive${report.id}" class="map-api" data-map-lat="${getCoords(report.barangay)[0]}" data-map-lng="${getCoords(report.barangay)[1]}" data-map-zoom="14"></div>
			</aside>
			<section class="modal-content modal-content-report">
				<header class="modal-head">
					<h2 id="lfModalTitle">${report.type} Pet Report</h2>
					<p>Case ID: ${report.caseId} • Submitted ${report.date}</p>
				</header>
				<span class="section-title">01. Pet Details</span>
				<div class="modal-grid">
					<div class="field"><label>Pet Name</label><p>${report.title}</p></div>
					<div class="field"><label>Species / Breed</label><p>${report.breed}</p></div>
					<div class="field"><label>Size</label><p>${report.size}</p></div>
					<div class="field"><label>Sex</label><p>${report.sex}</p></div>
				</div>
				<div class="field"><label>Current Status / Notes</label><p>${report.notes}</p></div>
				<span class="section-title">02. Uploader Information</span>
				<div class="uploader"><img src="https://i.pravatar.cc/80?img=5" alt="Uploader"><div><strong>${report.uploadedBy}</strong><br><small>${report.contact}</small></div></div>
				${matchBlock}
				<footer class="modal-footer">
					<button class="btn btn-danger" data-modal-action="close">Cancel</button>
					<button class="btn btn-success" data-modal-action="resolve-active" data-id="${report.id}">Resolved</button>
				</footer>
			</section>
		</div>
	`;
}

function buildClaimModal(claim) {
	return `
		<div class="modal-layout">
			<aside class="modal-media" style="grid-template-rows: 1fr; min-height: 360px;"><img src="${claim.image}" alt="${claim.title}"></aside>
			<section class="modal-content">
				<header class="modal-head">
					<h2 id="lfModalTitle">Pet Claim Request</h2>
					<p>Case ID: ${claim.caseId} • Submitted ${claim.uploadedAt}</p>
				</header>
				<span class="section-title">02. Date Submitted</span>
				<div class="modal-grid">
					<div class="field"><label>Date Submitted</label><p>${claim.uploadedAt.split("-")[0].trim()}</p></div>
					<div class="field"><label>Time Submitted</label><p>${claim.uploadedAt.split("-")[1].trim()}</p></div>
				</div>
				<span class="section-title">03. Uploader Information</span>
				<div class="uploader"><img src="https://i.pravatar.cc/80?img=4" alt="Uploader"><div><strong>${claim.title}</strong><br><small>${claim.contact}</small></div></div>
				<footer class="modal-footer">
					<button class="btn btn-danger" data-modal-action="close">Reject</button>
					<button class="btn btn-success" data-modal-action="approve-claim" data-id="${claim.id}">Approve</button>
				</footer>
			</section>
		</div>
	`;
}

function buildSightingModal(report) {
	return `
		<div class="modal-layout">
			<aside class="modal-media" style="grid-template-rows: 1fr; min-height: 580px;"><img src="${report.image}" alt="${report.title}"></aside>
			<section class="modal-content">
				<header class="modal-head">
					<h2 id="lfModalTitle">Sighting Report</h2>
					<p>Case ID: ${report.caseId} • Submitted ${report.uploadedAt}</p>
				</header>
				<span class="section-title">02. Location & Date</span>
				<div class="modal-grid">
					<div class="field"><label>Date Lost</label><p>${report.dateLost}</p></div>
					<div class="field"><label>Time Lost</label><p>${report.timeLost}</p></div>
				</div>
				<div id="mapSighting${report.id}" class="map-api" data-map-lat="${getCoords(report.barangay)[0]}" data-map-lng="${getCoords(report.barangay)[1]}" data-map-zoom="14" style="height:220px;"></div>
				<span class="section-title">03. Uploader Information</span>
				<div class="uploader"><img src="https://i.pravatar.cc/80?img=5" alt="Uploader"><div><strong>${report.uploader}</strong><br><small>${report.contact}</small></div></div>
				<footer class="modal-footer">
					<button class="btn btn-danger" data-modal-action="close">Cancel</button>
					<button class="btn btn-success" data-modal-action="resolve-sighting" data-id="${report.id}">Resolved</button>
				</footer>
			</section>
		</div>
	`;
}

function buildDetailModal({ heading, report, primaryLabel, primaryAction, secondaryLabel, secondaryAction }) {
	return `
		<div class="modal-layout">
			<aside class="modal-media">
				<img src="${report.image}" alt="${report.petName}">
				<div id="mapDetail${report.id}" class="map-api" data-map-lat="${getCoords(report.barangay)[0]}" data-map-lng="${getCoords(report.barangay)[1]}" data-map-zoom="14"></div>
			</aside>
			<section class="modal-content">
				<header class="modal-head">
					<h2 id="lfModalTitle">${heading}</h2>
					<p>Case ID: ${report.caseId} • Submitted ${report.date} ${report.time}</p>
				</header>
				<span class="section-title">01. Pet Details</span>
				<div class="modal-grid">
					<div class="field"><label>Pet Name</label><p>${report.petName}</p></div>
					<div class="field"><label>Species / Breed</label><p>${report.breed}</p></div>
					<div class="field"><label>Size</label><p>${report.size}</p></div>
					<div class="field"><label>Sex</label><p>${report.sex}</p></div>
				</div>
				<div class="field"><label>Color / Markings</label><p>${report.markings}</p></div>
				<div class="field"><label>Additional Details</label><p>${report.notes}</p></div>
				<span class="section-title">02. Location & Date</span>
				<div class="modal-grid">
					<div class="field"><label>Date Lost</label><p>${report.dateLost}</p></div>
					<div class="field"><label>Time Lost</label><p>${report.timeLost}</p></div>
				</div>
				<span class="section-title">03. Uploader Information</span>
				<div class="uploader"><img src="https://i.pravatar.cc/80?img=6" alt="Uploader"><div><strong>${report.uploader}</strong><br><small>${report.contact}</small></div></div>
				<footer class="modal-footer">
					<button class="btn btn-danger" data-modal-action="${secondaryAction}" data-id="${report.id}">${secondaryLabel}</button>
					<button class="btn btn-success" data-modal-action="${primaryAction}" data-id="${report.id}">${primaryLabel}</button>
				</footer>
			</section>
		</div>
	`;
}

function buildUploadModal() {
	return `
		<form id="uploadPetForm" class="upload-modal">
			<header class="upload-head">
				<h2 id="lfModalTitle">Report Lost or Found Pet</h2>
				<p>Create a clinical entry for the Lost & Found database.</p>
			</header>
			<div class="upload-grid">
				<section class="upload-left">
					<span class="section-title">Pet Identification Photo</span>
					<label class="upload-photo-box" for="uploadPhotoInput">
						<div id="uploadPhotoPreviewText">Upload clear portrait<br><small>JPG or PNG preferred</small></div>
						<img id="uploadPhotoPreview" alt="Preview" hidden>
					</label>
					<input id="uploadPhotoInput" name="photo" type="file" accept="image/*" hidden>
					<span class="section-title">Animals Details</span>
					<div class="modal-grid">
						<div class="field"><label>Type</label><select name="reportType" id="reportType"><option value="Found">Found</option><option value="Lost">Lost</option></select></div>
						<div class="field"><label>Breed</label><input name="breed" placeholder="e.g. Golden Retriever" required></div>
						<div class="field"><label>Pet Name</label><input name="petName" placeholder="Pet Name" required></div>
						<div class="field"><label>Sex</label><select name="sex"><option>Male</option><option>Female</option></select></div>
						<div class="field"><label>Size</label><select name="size"><option>Small (Under 10kg)</option><option>Medium (10-25kg)</option><option>Large (25kg+)</option></select></div>
						<div class="field"><label>Barangay</label><select name="barangay" id="uploadBarangay">${lfData.filters.barangays.map((b) => `<option value="${b}">${b}</option>`).join("")}</select></div>
					</div>
					<div class="field"><label>Color/Markings</label><input name="markings" placeholder="e.g. White chest patch"></div>
				</section>

				<section class="upload-right">
					<span class="section-title">Where and When Found</span>
					<div class="modal-grid">
						<div class="field"><label>Date</label><input name="dateLost" type="date" required></div>
						<div class="field"><label>Time</label><input name="timeLost" type="time" required></div>
					</div>
					<div class="field"><label>Current Status/Notes</label><textarea name="notes" rows="4" placeholder="Last behavior, collar color, chip ID if known..." required></textarea></div>
					<div class="upload-map-wrap">
						<span class="section-title">Map Location</span>
						<div id="uploadMap" class="map-api" data-map-lat="14.9577" data-map-lng="120.9055" data-map-editable="true" style="height:210px;"></div>
						<div class="coords-row">
							<div class="field"><label>Latitude</label><input id="uploadLat" name="lat" value="14.9577" readonly></div>
							<div class="field"><label>Longitude</label><input id="uploadLng" name="lng" value="120.9055" readonly></div>
						</div>
					</div>
					<div class="contact-panel">
						<h4>Your Contact Info</h4>
						<input name="uploader" placeholder="Full Name" required>
						<input name="contact" placeholder="Mobile Number" required>
						<input name="email" type="email" placeholder="Email Address">
					</div>
				</section>
			</div>
			<footer class="modal-footer">
				<button type="button" class="btn btn-secondary" data-modal-action="close">Cancel</button>
				<button type="submit" class="btn btn-success">Submit Pet Report</button>
			</footer>
		</form>
	`;
}

function buildUploadSuccessModal(report) {
	return `
		<section class="upload-success" id="lfModalTitle">
			<div class="success-icon">✓</div>
			<h2>${report.type} Report Has Been Uploaded</h2>
			<p>Your report was added to pending review and is now ready for vet validation.</p>
			<div class="summary-box"><strong>Owner Name:</strong> ${report.uploader}<br><strong>Pet Name:</strong> ${report.petName}<br><strong>Date & Time:</strong> ${report.date} - ${report.time}<br><strong>Type:</strong> ${report.type}</div>
			<button class="btn btn-primary" data-modal-action="view-active-reports">View Active Reports</button>
		</section>
	`;
}

function wireUploadFormIfPresent() {
	const form = document.getElementById("uploadPetForm");
	if (!form) {
		return;
	}

	const photoInput = document.getElementById("uploadPhotoInput");
	const preview = document.getElementById("uploadPhotoPreview");
	const previewText = document.getElementById("uploadPhotoPreviewText");

	photoInput.addEventListener("change", () => {
		const file = photoInput.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			preview.src = reader.result;
			preview.hidden = false;
			previewText.hidden = true;
		};
		reader.readAsDataURL(file);
	});

	const barangaySelect = document.getElementById("uploadBarangay");
	barangaySelect.addEventListener("change", () => {
		const [lat, lng] = getCoords(barangaySelect.value);
		setUploadMapCenter(lat, lng);
	});

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const payload = Object.fromEntries(new FormData(form).entries());

		const generated = {
			id: `P-${Date.now()}`,
			caseId: `#RESC-${Math.floor(10000 + Math.random() * 89999)}`,
			type: payload.reportType,
			petName: payload.petName,
			breed: payload.breed,
			sex: payload.sex,
			size: payload.size,
			markings: payload.markings || "N/A",
			notes: payload.notes,
			title: payload.petName,
			uploader: payload.uploader,
			contact: payload.contact,
			source: "Admin/Clinic",
			barangay: payload.barangay,
			date: new Date(payload.dateLost).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
			time: payload.timeLost,
			dateLost: new Date(payload.dateLost).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
			timeLost: payload.timeLost,
			lat: Number(payload.lat),
			lng: Number(payload.lng),
			image: preview.src || "https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=800"
		};

		lfData.pendingReports.unshift(generated);
		renderStats();
		renderContent();
		openModal(buildUploadSuccessModal(generated));
	});
}

function setupModalMaps() {
	if (typeof L === "undefined") {
		return;
	}

	destroyModalMaps();
	document.querySelectorAll(".map-api").forEach((element) => {
		const lat = Number(element.dataset.mapLat || 14.9577);
		const lng = Number(element.dataset.mapLng || 120.9055);
		const zoom = Number(element.dataset.mapZoom || 14);
		const editable = element.dataset.mapEditable === "true";

		const map = L.map(element, { zoomControl: true }).setView([lat, lng], zoom);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "&copy; OpenStreetMap contributors"
		}).addTo(map);

		const marker = L.marker([lat, lng]).addTo(map);

		if (editable) {
			map.on("click", (evt) => {
				const { lat: clickLat, lng: clickLng } = evt.latlng;
				marker.setLatLng([clickLat, clickLng]);
				const latInput = document.getElementById("uploadLat");
				const lngInput = document.getElementById("uploadLng");
				if (latInput && lngInput) {
					latInput.value = clickLat.toFixed(6);
					lngInput.value = clickLng.toFixed(6);
				}
			});
		}

		lfState.modalMaps.push(map);
	});
}

function destroyModalMaps() {
	if (!lfState.modalMaps.length) {
		return;
	}
	lfState.modalMaps.forEach((map) => map.remove());
	lfState.modalMaps = [];
}

function setUploadMapCenter(lat, lng) {
	const map = lfState.modalMaps.find((item) => item.getContainer().id === "uploadMap");
	if (!map) {
		return;
	}
	map.setView([lat, lng], 14);
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
			layer.setLatLng([lat, lng]);
		}
	});
	const latInput = document.getElementById("uploadLat");
	const lngInput = document.getElementById("uploadLng");
	if (latInput && lngInput) {
		latInput.value = lat.toFixed(6);
		lngInput.value = lng.toFixed(6);
	}
}

function getCoords(barangay) {
	return barangayCoordinates[barangay] || barangayCoordinates["Select Barangay"];
}

document.addEventListener("DOMContentLoaded", initLostFound);
