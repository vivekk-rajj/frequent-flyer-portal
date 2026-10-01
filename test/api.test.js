const statsContainer = document.getElementById('stats');
const travelerList = document.getElementById('travelerList');
const workflowList = document.getElementById('workflowList');
const travelerForm = document.getElementById('travelerForm');
const workflowForm = document.getElementById('workflowForm');
const refreshButton = document.getElementById('refreshButton');

async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Request failed.');
  }

  return response.json();
}

function renderStats(summary) {
  const cards = [
    { label: 'Travelers', value: summary.totalTravelers },
    { label: 'Active', value: summary.activeTravelers },
    { label: 'Platinum', value: summary.platinumMembers },
    { label: 'Total points', value: summary.totalPoints.toLocaleString() }
  ];

  statsContainer.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join('');
}

function renderTravelers(travelers) {
  travelerList.innerHTML = travelers
    .map(
      (traveler) => `
        <article class="traveler-card">
          <h3>${traveler.name}</h3>
          <p>${traveler.memberNumber}</p>
          <p>${traveler.email}</p>
          <div class="badge status-${traveler.status.toLowerCase()}">${traveler.tier} · ${traveler.status}</div>
          <p><strong>Home airport:</strong> ${traveler.homeAirport}</p>
          <p><strong>Points:</strong> ${traveler.totalPoints.toLocaleString()}</p>
          <p><strong>Preferences:</strong> ${traveler.travelPreferences.join(', ') || 'N/A'}</p>
        </article>
      `
    )
    .join('');
}

function renderWorkflows(workflows) {
  workflowList.innerHTML = workflows
    .map(
      (workflow) => `
        <article class="workflow-item">
          <h3>${workflow.title}</h3>
          <p>${workflow.assignee}</p>
          <div class="badge">${workflow.priority}</div>
          <div class="workflow-meta">
            <span>${workflow.status}</span>
            <span>${workflow.travelerId}</span>
          </div>
        </article>
      `
    )
    .join('');
}

async function refreshPortal() {
  const [summaryResponse, travelersResponse, workflowsResponse] = await Promise.all([
    apiFetch('/api/summary'),
    apiFetch('/api/travelers'),
    apiFetch('/api/workflows')
  ]);

  renderStats(summaryResponse.summary);
  renderTravelers(travelersResponse);
  renderWorkflows(workflowsResponse);
}

travelerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(travelerForm);
  const payload = {
    name: formData.get('name'),
    memberNumber: formData.get('memberNumber'),
    tier: formData.get('tier'),
    status: formData.get('status'),
    email: formData.get('email'),
    homeAirport: formData.get('homeAirport'),
    travelPreferences: (formData.get('travelPreferences') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  };

  await apiFetch('/api/travelers', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  travelerForm.reset();
  refreshPortal();
});

workflowForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(workflowForm);
  const payload = {
    title: formData.get('title'),
    assignee: formData.get('assignee'),
    priority: formData.get('priority'),
    travelerId: formData.get('travelerId')
  };

  await apiFetch('/api/workflows', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  workflowForm.reset();
  refreshPortal();
});

refreshButton.addEventListener('click', refreshPortal);
refreshPortal().catch((error) => {
  console.error(error);
  statsContainer.innerHTML = '<article class="stat-card"><p>Portal status</p><strong>Unavailable</strong></article>';
});
