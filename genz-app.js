// Gen Z Intelligence — Application Logic

function initGenZ() {
  renderGenZStats();
  renderGenZMediaChart();
  renderGenZTimeChart();
  renderGenZSpendChart();
  renderGenZValuesChart();
  renderGenZCrocsAngles();
  renderGenZInfluenceChart();
  renderGenZFormatsChart();
  renderGenZInfluenceCards();
  renderGenZGlobalLocal();
  renderGenZTakeaways();
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

// ─── Influence Sources Chart ────────────────────────────────────────────────

function renderGenZInfluenceChart() {
  const ctx = document.getElementById('genzInfluenceChart');
  if (!ctx) return;
  if (window._genzInfluenceChart) window._genzInfluenceChart.destroy();

  const data = [...GENZ_DATA.influenceSources].sort((a, b) => b.score - a.score);
  window._genzInfluenceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.source),
      datasets: [{
        label: 'Influence Score',
        data: data.map(d => d.score),
        backgroundColor: data.map(d => d.color),
        borderRadius: 5,
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
            afterLabel: c => ` ${data[c.dataIndex].crocs}`,
          },
        },
      },
      scales: {
        x: { min: 0, max: 100, title: { display: true, text: 'Influence score' }, grid: { color: '#f0f0f0' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

// ─── Content Formats Chart ──────────────────────────────────────────────────

function renderGenZFormatsChart() {
  const ctx = document.getElementById('genzFormatsChart');
  if (!ctx) return;
  if (window._genzFormatsChart) window._genzFormatsChart.destroy();

  const data = [...GENZ_DATA.contentFormats].sort((a, b) => b.effectiveness - a.effectiveness);
  window._genzFormatsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.format),
      datasets: [{
        label: 'Effectiveness',
        data: data.map(d => d.effectiveness),
        backgroundColor: data.map(d => d.color),
        borderRadius: 5,
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
            label: c => ` Effectiveness: ${c.parsed.x}/100`,
            afterLabel: c => ` ${data[c.dataIndex].note}`,
          },
        },
      },
      scales: {
        x: { min: 0, max: 100, title: { display: true, text: 'Effectiveness score' }, grid: { color: '#f0f0f0' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

// ─── Influence Source Detail Cards ──────────────────────────────────────────

function renderGenZInfluenceCards() {
  const container = document.getElementById('genzInfluenceCards');
  if (!container) return;

  const tierColors = { high: '#43B02A', medium: '#f59e0b', low: '#9ca3af' };
  const tierLabels = { high: 'High Impact', medium: 'Medium Impact', low: 'Lower Impact' };

  container.innerHTML = GENZ_DATA.influenceSources.map(item => {
    const color = tierColors[item.tier];
    return `
      <div class="genz-influence-card" style="border-top: 3px solid ${color};">
        <div class="genz-influence-card-top">
          <span class="genz-influence-source">${item.source}</span>
          <span class="genz-influence-score" style="color:${color}; background:${color}15;">${item.score}</span>
        </div>
        <div class="genz-influence-tier" style="color:${color};">${tierLabels[item.tier]}</div>
        <div class="genz-influence-crocs">${item.crocs}</div>
      </div>`;
  }).join('');
}

// ─── Global vs Local ────────────────────────────────────────────────────────

function renderGenZGlobalLocal() {
  const glData = GENZ_DATA.globalVsLocal;

  // Stat cards
  const statsContainer = document.getElementById('genzGLStats');
  if (statsContainer) {
    statsContainer.innerHTML = glData.stats.map(s => `
      <div class="genz-gl-stat-card">
        <div class="genz-gl-stat-icon">${s.icon}</div>
        <div class="genz-gl-stat-value">${s.value}</div>
        <div class="genz-gl-stat-label">${s.label}</div>
        <div class="genz-gl-stat-detail">${s.detail}</div>
      </div>`).join('');
  }

  // Grouped bar chart
  const ctx = document.getElementById('genzGLChart');
  if (ctx) {
    if (window._genzGLChart) window._genzGLChart.destroy();
    const comp = glData.comparison;
    window._genzGLChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: comp.map(c => c.dimension),
        datasets: [
          {
            label: 'Global',
            data: comp.map(c => c.global),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
          },
          {
            label: 'Local',
            data: comp.map(c => c.local),
            backgroundColor: '#43B02A',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
          tooltip: {
            callbacks: {
              afterBody: items => {
                const i = items[0].dataIndex;
                return `\n${comp[i].note}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { min: 0, max: 100, title: { display: true, text: 'Score' }, grid: { color: '#f0f0f0' } },
        },
      },
    });
  }

  // Insight callout
  const insightEl = document.getElementById('genzGLInsight');
  if (insightEl) {
    insightEl.innerHTML = `
      <div class="genz-gl-insight-inner">
        <span class="genz-gl-insight-label">Crocs Implication</span>
        <p>${glData.crocsInsight}</p>
      </div>`;
  }
}

// ─── Key Takeaways ──────────────────────────────────────────────────────────

function renderGenZTakeaways() {
  const container = document.getElementById('genzTakeaways');
  if (!container) return;

  container.innerHTML = GENZ_DATA.keyTakeaways.map(t => `
    <div class="genz-takeaway-card" style="border-left: 5px solid ${t.color};">
      <div class="genz-takeaway-header">
        <span class="genz-takeaway-num" style="color:${t.color};">${t.num}</span>
        <span class="genz-takeaway-icon">${t.icon}</span>
      </div>
      <div class="genz-takeaway-title">${t.title}</div>
      <div class="genz-takeaway-insight">${t.insight}</div>
      <div class="genz-takeaway-action">
        <span class="genz-takeaway-action-label">Crocs Action</span>
        <span>${t.action}</span>
      </div>
    </div>`).join('');
}
