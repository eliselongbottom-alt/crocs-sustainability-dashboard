// Gen Z Intelligence — Application Logic

function initGenZ() {
  renderGenZStats();
  renderGenZMediaChart();
  renderGenZTimeChart();
  renderGenZSpendChart();
  renderGenZValuesList();
  renderGenZCrocsAngles();
  renderGenZInfluenceCards();
  renderGenZFormatsList();
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
          title: { display: true, text: 'Hours per day (editorial estimate)' },
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
        tooltip: { callbacks: { label: c => ` ${c.label}: ~${c.parsed}% of waking hours` } },
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
        tooltip: { callbacks: { label: c => ` ${c.label}: ~${c.parsed}% of spend` } },
      },
    },
  });
}

// ─── Core Values — Ranked List (no fabricated scores) ──────────────────────

function renderGenZValuesList() {
  const container = document.getElementById('genzValuesChart');
  if (!container) return;

  const parent = container.closest('.card') || container.parentElement;
  parent.innerHTML = `
    <h3>What They Value</h3>
    <p class="actions-subtitle" style="margin-bottom:0.5rem;">Core values ranked by relative importance — editorial ranking based on published Gen Z behavioral research. No numeric scoring.</p>
    <div style="display:flex;flex-direction:column;gap:0.6rem;margin-top:1rem;">
      ${GENZ_DATA.values.map(v => `
        <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.7rem 0.9rem;background:#f9fafb;border-radius:8px;border-left:4px solid ${v.rank <= 3 ? '#43B02A' : v.rank <= 6 ? '#f59e0b' : '#3b82f6'};">
          <span style="font-size:0.72rem;font-weight:700;color:#9ca3af;min-width:1.5rem;">#${v.rank}</span>
          <div>
            <div style="font-weight:700;font-size:0.92rem;color:#1f2937;">${v.value}</div>
            <div style="font-size:0.81rem;color:#6b7280;margin-top:0.15rem;">${v.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Crocs × Gen Z Relevance Cards ─────────────────────────────────────────

function renderGenZCrocsAngles() {
  const container = document.getElementById('genzCrocsAngles');
  if (!container) return;

  const tierConfig = {
    high:   { color: '#43B02A', label: 'Strong fit' },
    medium: { color: '#f59e0b', label: 'Opportunity' },
    low:    { color: '#9ca3af', label: 'Lower fit' },
  };

  container.innerHTML = GENZ_DATA.crocsAngles.map(a => {
    const cfg = tierConfig[a.tier] || tierConfig.medium;
    return `
      <div class="genz-angle-card" style="border-top: 4px solid ${cfg.color};">
        <div class="genz-angle-top">
          <span class="genz-angle-icon">${a.icon}</span>
          <span class="genz-angle-score" style="color:${cfg.color}; background:${cfg.color}15; border:1px solid ${cfg.color}30; font-size:0.72rem; padding: 2px 8px;">${cfg.label}</span>
        </div>
        <div class="genz-angle-title">${a.title}</div>
        <div class="genz-angle-detail">${a.detail}</div>
      </div>`;
  }).join('');
}

// ─── Influence Source Detail Cards (tier-based, no scores) ──────────────────

function renderGenZInfluenceCards() {
  const container = document.getElementById('genzInfluenceCards');
  if (!container) return;

  const tierColors = { high: '#43B02A', medium: '#f59e0b', low: '#9ca3af' };
  const tierLabels = { high: 'High Impact', medium: 'Medium Impact', low: 'Lower Impact' };

  // Also replace the chart canvas above with a ranked list
  const chartCtx = document.getElementById('genzInfluenceChart');
  if (chartCtx) {
    const chartCard = chartCtx.closest('.card') || chartCtx.parentElement;
    chartCard.innerHTML = `
      <h3>What Influences Their Purchases</h3>
      <p class="actions-subtitle" style="margin-bottom:0.5rem;">Ranked by editorial tier — no numeric scores. Based on broad Gen Z behavioral research patterns.</p>
      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;">
        ${GENZ_DATA.influenceSources.map(item => {
          const color = tierColors[item.tier];
          const label = tierLabels[item.tier];
          return `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;background:#f9fafb;border-radius:8px;">
            <span style="min-width:90px;font-size:0.72rem;font-weight:700;color:${color};background:${color}15;border:1px solid ${color}30;border-radius:20px;padding:2px 8px;text-align:center;">${label}</span>
            <div>
              <div style="font-weight:600;font-size:0.88rem;color:#1f2937;">${item.source}</div>
              <div style="font-size:0.78rem;color:#6b7280;">${item.crocs}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  // Legacy card container — hide if present (now rendered above)
  container.style.display = 'none';
}

// ─── Content Formats — Ranked List (no fabricated scores) ──────────────────

function renderGenZFormatsList() {
  const ctx = document.getElementById('genzFormatsChart');
  if (!ctx) return;

  const tierColors = { high: '#43B02A', medium: '#f59e0b', low: '#9ca3af' };
  const tierLabels = { high: 'High', medium: 'Medium', low: 'Lower' };

  const parent = ctx.closest('.card') || ctx.parentElement;
  parent.innerHTML = `
    <h3>Content Format Effectiveness</h3>
    <p class="actions-subtitle" style="margin-bottom:0.5rem;">Ranked by editorial tier — no numeric scores. Based on broad Gen Z content behavior research.</p>
    <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;">
      ${GENZ_DATA.contentFormats.map(f => {
        const color = tierColors[f.tier] || '#9ca3af';
        const label = tierLabels[f.tier] || 'Lower';
        return `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;background:#f9fafb;border-radius:8px;border-left:3px solid ${f.color};">
          <span style="min-width:64px;font-size:0.72rem;font-weight:700;color:${color};text-align:center;">${label}</span>
          <div>
            <div style="font-weight:600;font-size:0.88rem;color:#1f2937;">${f.format}</div>
            <div style="font-size:0.78rem;color:#6b7280;">${f.note}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// ─── Global vs Local ────────────────────────────────────────────────────────

function renderGenZGlobalLocal() {
  const glData = GENZ_DATA.globalVsLocal;

  const statsContainer = document.getElementById('genzGLStats');
  if (statsContainer) {
    statsContainer.innerHTML = (glData.insights || []).map(s => `
      <div class="genz-gl-stat-card">
        <div class="genz-gl-stat-icon">${s.icon}</div>
        <div class="genz-gl-stat-label" style="font-weight:700;font-size:0.9rem;">${s.label}</div>
        <div class="genz-gl-stat-detail">${s.detail}</div>
      </div>`).join('');
  }

  // Bar chart removed — scores were not sourced. Replace canvas with notice.
  const ctx = document.getElementById('genzGLChart');
  if (ctx) {
    const parent = ctx.closest('.card') || ctx.parentElement;
    if (parent && parent !== statsContainer) {
      ctx.style.display = 'none';
    }
  }

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
