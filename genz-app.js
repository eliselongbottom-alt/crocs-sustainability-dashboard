// Gen Z Intelligence — Application Logic

function initGenZ() {
  renderGenZStats();
  renderGenZPlatformChart();
  renderGenZTimeChart();
  renderGenZSpendChart();
  renderGenZValuesList();
  renderGenZCrocsAngles();
  renderGenZInfluenceList();
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
      <div class="genz-stat-source" style="font-size:0.68rem;color:#9ca3af;margin-top:0.4rem;font-style:italic;">
        ${stat.sourceUrl
          ? `<a href="${stat.sourceUrl}" target="_blank" rel="noopener" style="color:#9ca3af;text-decoration:underline dotted;">${stat.source}</a>`
          : stat.source}
      </div>
    </div>
  `).join('');
}

// ─── Platform Usage Chart (Pew Research data) ───────────────────────────────

function renderGenZPlatformChart() {
  const ctx = document.getElementById('genzMediaChart');
  if (!ctx) return;

  const parent = ctx.closest('.card') || ctx.parentElement;
  const data = GENZ_DATA.platformUsage;

  parent.innerHTML = `
    <h3>Platform Reach — US Teens</h3>
    <p class="actions-subtitle">% of US teens who use each platform &bull; bars show total reach; darker segment = daily users</p>
    <div style="margin:1rem 0;">
      ${data.map(p => {
        const dailyPct = p.daily ? Math.round((p.daily / p.reach) * 100) : null;
        return `
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem;">
            <div style="min-width:72px;font-size:0.82rem;font-weight:600;color:#374151;text-align:right;">${p.platform}</div>
            <div style="flex:1;background:#f3f4f6;border-radius:6px;height:22px;position:relative;overflow:hidden;">
              <div style="position:absolute;left:0;top:0;height:100%;width:${p.reach}%;background:${p.color};opacity:0.25;border-radius:6px;"></div>
              ${p.daily ? `<div style="position:absolute;left:0;top:0;height:100%;width:${p.daily}%;background:${p.color};border-radius:6px;"></div>` : `<div style="position:absolute;left:0;top:0;height:100%;width:${p.reach}%;background:${p.color};opacity:0.5;border-radius:6px;"></div>`}
            </div>
            <div style="min-width:80px;font-size:0.8rem;color:#374151;">
              <strong>${p.reach}%</strong> reach${p.daily ? ` · <span style="color:#6b7280;">${p.daily}% daily</span>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>
    <div style="font-size:0.72rem;color:#9ca3af;font-style:italic;margin-top:0.5rem;">
      Source: <a href="${GENZ_DATA.platformUrl}" target="_blank" rel="noopener" style="color:#9ca3af;text-decoration:underline dotted;">${GENZ_DATA.platformSource}</a>
    </div>
  `;
}

// ─── Time Spending Chart (doughnut — modeled) ──────────────────────────────

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
        tooltip: { callbacks: { label: c => ` ${c.label}: ~${c.parsed}% of waking hours (modeled)` } },
      },
    },
  });

  // Add "modeled" note below
  const note = document.createElement('div');
  note.style.cssText = 'font-size:0.68rem;color:#9ca3af;font-style:italic;text-align:center;margin-top:0.35rem;';
  note.textContent = 'Modeled distribution — proportions consistent with GWI / eMarketer qualitative framing; no free primary source publishes exact splits';
  ctx.parentElement.appendChild(note);
}

// ─── Spend Breakdown Chart (doughnut — modeled) ──────────────────────────────

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
        tooltip: { callbacks: { label: c => ` ${c.label}: ~${c.parsed}% of spend (modeled)` } },
      },
    },
  });

  const note = document.createElement('div');
  note.style.cssText = 'font-size:0.68rem;color:#9ca3af;font-style:italic;text-align:center;margin-top:0.35rem;';
  note.textContent = 'Modeled distribution — category order consistent with NRF / eMarketer patterns; exact proportions are editorial estimates';
  ctx.parentElement.appendChild(note);
}

// ─── Core Values — Multi-Source Cited List ──────────────────────────────────

function renderGenZValuesList() {
  const container = document.getElementById('genzValuesChart');
  if (!container) return;

  const parent = container.closest('.card') || container.parentElement;
  const tierColor = (rank) => rank <= 2 ? '#43B02A' : rank <= 5 ? '#f59e0b' : '#3b82f6';

  parent.innerHTML = `
    <h3>What They Value</h3>
    <p class="actions-subtitle" style="margin-bottom:0.25rem;">Synthesised from Deloitte (n=22,841), Pew Research 2024, GWI, eMarketer, and Morning Consult.
    Deloitte-anchored entries show survey percentages. Others are editorial consensus ranking based on citation frequency across sources.
    <a href="https://www.deloitte.com/global/en/issues/work/content/genz-millennialsurvey.html" target="_blank" rel="noopener" style="color:#9ca3af;font-size:0.72rem;">Deloitte 2024 report ↗</a></p>
    <div style="display:flex;flex-direction:column;gap:0.55rem;margin-top:0.9rem;">
      ${GENZ_DATA.values.map(v => `
        <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem 0.9rem;background:#f9fafb;border-radius:8px;border-left:4px solid ${tierColor(v.rank)};">
          <span style="font-size:0.7rem;font-weight:700;color:#9ca3af;min-width:1.6rem;padding-top:2px;">#${v.rank}</span>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <span style="font-weight:700;font-size:0.92rem;color:#1f2937;">${v.value}</span>
              ${v.methodology === 'survey-data'
                ? `<span style="font-size:0.68rem;font-weight:600;color:#43B02A;background:#43B02A15;border:1px solid #43B02A30;border-radius:10px;padding:1px 7px;">Survey data</span>`
                : `<span style="font-size:0.68rem;font-weight:600;color:#6b7280;background:#6b728015;border:1px solid #6b728030;border-radius:10px;padding:1px 7px;">Editorial consensus</span>`}
            </div>
            ${v.dataPoint ? `<div style="font-size:0.82rem;font-weight:600;color:#374151;margin-top:0.2rem;">${v.dataPoint}</div>` : ''}
            <div style="font-size:0.79rem;color:#6b7280;margin-top:0.15rem;">${v.desc}</div>
            <div style="font-size:0.68rem;color:#9ca3af;margin-top:0.25rem;">Sources: ${v.sources.join(' · ')}</div>
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
    high:   { color: '#43B02A', label: 'Strong alignment' },
    medium: { color: '#f59e0b', label: 'Opportunity' },
    low:    { color: '#9ca3af', label: 'Lower fit' },
  };

  container.innerHTML = GENZ_DATA.crocsAngles.map(a => {
    const cfg = tierConfig[a.tier] || tierConfig.medium;
    return `
      <div class="genz-angle-card" style="border-top: 4px solid ${cfg.color};">
        <div class="genz-angle-top">
          <span class="genz-angle-icon">${a.icon}</span>
          <span style="font-size:0.7rem;font-weight:600;color:${cfg.color};background:${cfg.color}15;border:1px solid ${cfg.color}30;border-radius:12px;padding:2px 9px;">${cfg.label}</span>
        </div>
        <div class="genz-angle-title">${a.title}</div>
        <div class="genz-angle-detail">${a.detail}</div>
      </div>`;
  }).join('');
}

// ─── Influence Sources — Full cited list ────────────────────────────────────

function renderGenZInfluenceList() {
  const container = document.getElementById('genzInfluenceCards');
  if (!container) return;

  // Replace the chart canvas too
  const chartCtx = document.getElementById('genzInfluenceChart');
  if (chartCtx) {
    const chartParent = chartCtx.closest('.card') || chartCtx.parentElement;
    if (chartParent) chartParent.style.display = 'none';
  }

  const tierColors = { high: '#43B02A', medium: '#f59e0b', low: '#9ca3af' };
  const tierLabels = { high: 'High impact', medium: 'Medium impact', low: 'Lower impact' };

  container.innerHTML = `
    <h3>What Influences Their Purchases</h3>
    <p class="actions-subtitle" style="margin-bottom:0.75rem;">Ranked by editorial tier. Key entries anchored to survey data — cited per source below.</p>
    <div style="display:flex;flex-direction:column;gap:0.65rem;">
      ${GENZ_DATA.influenceSources.map(item => {
        const color = tierColors[item.tier] || '#9ca3af';
        const label = tierLabels[item.tier] || 'Lower impact';
        return `
          <div style="padding:0.8rem 1rem;background:#f9fafb;border-radius:8px;border-left:4px solid ${color};">
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.35rem;flex-wrap:wrap;">
              <span style="font-weight:700;font-size:0.9rem;color:#1f2937;">${item.source}</span>
              <span style="font-size:0.68rem;font-weight:600;color:${color};background:${color}15;border:1px solid ${color}30;border-radius:10px;padding:1px 8px;">${label}</span>
            </div>
            <div style="font-size:0.8rem;color:#374151;margin-bottom:0.3rem;">${item.stat}</div>
            <div style="font-size:0.68rem;color:#9ca3af;font-style:italic;margin-bottom:0.4rem;">Source: ${item.statSource}</div>
            <div style="font-size:0.79rem;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:0.35rem;"><strong style="color:#43B02A;">Crocs angle:</strong> ${item.crocs}</div>
          </div>`;
      }).join('')}
    </div>
  `;
}

// ─── Content Formats — Ranked List ─────────────────────────────────────────

function renderGenZFormatsList() {
  const ctx = document.getElementById('genzFormatsChart');
  if (!ctx) return;

  const tierColors = { high: '#43B02A', medium: '#f59e0b', low: '#9ca3af' };
  const tierLabels = { high: 'High', medium: 'Medium', low: 'Lower' };

  const parent = ctx.closest('.card') || ctx.parentElement;
  parent.innerHTML = `
    <h3>Content Format Effectiveness</h3>
    <p class="actions-subtitle" style="margin-bottom:0.75rem;">Editorial tier ranking — based on platform reach data (Pew 2024) and qualitative framing from GWI, eMarketer, and Morning Consult. No numeric scores.</p>
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      ${GENZ_DATA.contentFormats.map(f => {
        const color = tierColors[f.tier] || '#9ca3af';
        const label = tierLabels[f.tier] || 'Lower';
        return `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.9rem;background:#f9fafb;border-radius:8px;border-left:3px solid ${f.color};">
            <span style="min-width:62px;font-size:0.7rem;font-weight:700;color:${color};text-align:center;">${label}</span>
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

  const ctx = document.getElementById('genzGLChart');
  if (ctx) { ctx.style.display = 'none'; }

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
