// Gen Z Intelligence — Application Logic

function initGenZ() {
  renderGenZStats();
  renderGenZMediaChart();
  renderGenZTimeChart();
  renderGenZSpendChart();
  renderGenZValuesChart();
  renderGenZCrocsAngles();
}

// ─── Key Stats ──────────────────────────────────────────────────────────────

function renderGenZStats() {
  const container = document.getElementById('genzStatsRow');
  if (!container) return;
  container.innerHTML = GENZ_DATA.keyStats.map(stat => `
    <div class="genz-stat-card">
      <div class="genz-stat-value">${stat.value}</div>
      <div class="genz-stat-label">${stat.label}</div>
      <div class="genz-stat-sub">${stat.sub}</div>
    </div>
  `).join('');
}

// ─── Media Consumption Chart (horizontal bar) ───────────────────────────────

function renderGenZMediaChart() {
  const ctx = document.getElementById('genzMediaChart');
  if (!ctx) return;
  if (window._genzMediaChart) window._genzMediaChart.destroy();

  const data = GENZ_DATA.mediaConsumption;
  window._genzMediaChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.platform),
      datasets: [{
        label: 'Hours per day',
        data: data.map(d => d.hoursPerDay),
        backgroundColor: data.map(d => d.color),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.parsed.x}h / day` } },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 5,
          title: { display: true, text: 'Hours per day' },
          grid: { color: '#f0f0f0' },
        },
        y: { grid: { display: false } },
      },
    },
  });
}

// ─── Time Spending Chart (doughnut) ────────────────────────────────────────

function renderGenZTimeChart() {
  const ctx = document.getElementById('genzTimeChart');
  if (!ctx) return;
  if (window._genzTimeChart) window._genzTimeChart.destroy();

  const data = GENZ_DATA.timeSpending;
  window._genzTimeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.activity),
      datasets: [{
        data: data.map(d => d.pct),
        backgroundColor: data.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed}% of waking hours` } },
      },
    },
  });
}

// ─── Spend Breakdown Chart (doughnut) ──────────────────────────────────────

function renderGenZSpendChart() {
  const ctx = document.getElementById('genzSpendChart');
  if (!ctx) return;
  if (window._genzSpendChart) window._genzSpendChart.destroy();

  const data = GENZ_DATA.spending;
  window._genzSpendChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        data: data.map(d => d.pct),
        backgroundColor: data.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed}% of spend` } },
      },
    },
  });
}

// ─── Core Values Chart (horizontal bar) ────────────────────────────────────

function renderGenZValuesChart() {
  const ctx = document.getElementById('genzValuesChart');
  if (!ctx) return;
  if (window._genzValuesChart) window._genzValuesChart.destroy();

  const data = [...GENZ_DATA.values].sort((a, b) => b.score - a.score);
  const colors = data.map(d =>
    d.score >= 90 ? '#43B02A' : d.score >= 80 ? '#f59e0b' : '#3b82f6'
  );

  window._genzValuesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.value),
      datasets: [{
        label: 'Importance Score',
        data: data.map(d => d.score),
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => ` Score: ${c.parsed.x}/100`,
            afterLabel: c => ` ${data[c.dataIndex].desc}`,
          },
        },
      },
      scales: {
        x: {
          min: 60,
          max: 100,
          title: { display: true, text: 'Importance score' },
          grid: { color: '#f0f0f0' },
        },
        y: { grid: { display: false } },
      },
    },
  });
}

// ─── Crocs × Gen Z Relevance Cards ─────────────────────────────────────────

function renderGenZCrocsAngles() {
  const container = document.getElementById('genzCrocsAngles');
  if (!container) return;

  container.innerHTML = GENZ_DATA.crocsAngles.map(a => {
    const color = a.relevance >= 90 ? '#43B02A' : a.relevance >= 85 ? '#f59e0b' : '#3b82f6';
    return `
      <div class="genz-angle-card" style="border-top: 4px solid ${color};">
        <div class="genz-angle-top">
          <span class="genz-angle-icon">${a.icon}</span>
          <span class="genz-angle-score" style="color:${color}; background:${color}15; border:1px solid ${color}30;">${a.relevance}</span>
        </div>
        <div class="genz-angle-title">${a.title}</div>
        <div class="genz-angle-detail">${a.detail}</div>
        <div class="genz-angle-bar-wrap">
          <div class="genz-angle-bar-fill" style="width:${a.relevance}%; background:${color};"></div>
        </div>
      </div>`;
  }).join('');
}
