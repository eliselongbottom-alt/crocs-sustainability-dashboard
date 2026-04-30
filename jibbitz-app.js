// Jibbitz Trends - Application Logic

// Merge live-fetched entries from fetch_jibbitz_news.py (if available)
if (typeof JIBBITZ_LIVE_TRENDS !== 'undefined' && JIBBITZ_LIVE_TRENDS.length > 0) {
  const existingIds = new Set(JIBBITZ_TRENDS.map(t => t.id));
  JIBBITZ_LIVE_TRENDS.forEach(t => { if (!existingIds.has(t.id)) JIBBITZ_TRENDS.push(t); });
}

let jbTrendsData = [];

// Maps qualitative momentum label to a numeric weight for sorting.
function momentumScore(t) {
  return { surging: 85, rising: 65, steady: 45, fading: 20, peaked: 8 }[t.momentum] ?? 45;
}

// Relevance score: weights momentum signal and search trend trajectory over static jibbitz score.
function calcRelevanceScore(t) {
  const trend = t.searchTrend || [];
  const last3avg = trend.length >= 3 ? trend.slice(-3).reduce((a, b) => a + b, 0) / 3 : 50;
  const prev3avg = trend.length >= 6 ? trend.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 : last3avg;
  const trendDelta = last3avg - prev3avg;
  const agePenalty = Math.min(40, Math.max(0, (t.daysTrending - 21) * 1.5));
  const stageBonus = { evaluation: 0, watching: -10, launched: -40 }[t.stage] ?? 0;
  return (momentumScore(t) * 0.40) + (trendDelta * 0.35) + (t.jibbitzScore * 0.10) - agePenalty + stageBonus;
}

function getTrendStatus(t) {
  const trend = t.searchTrend || [];
  const last3avg = trend.length >= 3 ? trend.slice(-3).reduce((a, b) => a + b, 0) / 3 : 50;
  const prev3avg = trend.length >= 6 ? trend.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 : last3avg;
  const trendDelta = last3avg - prev3avg;
  if (t.momentum === 'peaked' && trendDelta < -10) return 'missed';
  if (t.momentum === 'peaked' || t.momentum === 'fading') return 'downtrending';
  if (t.momentum === 'surging') return 'actnow';
  if (t.momentum === 'rising') return 'heating';
  return 'watching';
}

function initJibbitz() {
  jbTrendsData = [...JIBBITZ_TRENDS].sort((a, b) => calcRelevanceScore(b) - calcRelevanceScore(a));
  renderJbPipeline();
  renderJbTrends(jbTrendsData);
  renderJbVelocityChart();
  renderJbCategoryChart();
  renderJbPipelineBoard();
  renderJibbitzRoadmap();

  // Show last-updated timestamp
  const label = document.getElementById('jbLastUpdatedLabel');
  if (label && typeof JIBBITZ_LAST_UPDATED !== 'undefined') {
    const d = new Date(JIBBITZ_LAST_UPDATED);
    label.textContent = 'Feed updated ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialise whichever tab is active on load
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  if (activeTab === 'jibbitz' || !activeTab) {
    window._jbInitialized = true;
    initJibbitz();
  } else if (activeTab === 'trends') {
    window._trendsInitialized = true;
    initTrends();
  } else if (activeTab === 'sustainability') {
    window._sustainabilityInitialized = true;
    renderAll();
  }
});

// --- Tab Navigation ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-' + tab).classList.add('active');
    // Stop live feed when leaving trends tab
    if (tab !== 'trends' && typeof stopLiveFeed === 'function') {
      stopLiveFeed();
    }

    if (tab === 'jibbitz' && !window._jbInitialized) {
      window._jbInitialized = true;
      initJibbitz();
    } else if (tab === 'sustainability' && !window._sustainabilityInitialized) {
      window._sustainabilityInitialized = true;
      renderAll();
    } else if (tab === 'affinity' && !window._affinityInitialized) {
      window._affinityInitialized = true;
      initAffinity();
    } else if (tab === 'trends' && !window._trendsInitialized) {
      window._trendsInitialized = true;
      initTrends();
    } else if (tab === 'genz' && !window._genzInitialized) {
      window._genzInitialized = true;
      initGenZ();
    } else if (tab === 'emotion' && !window._emotionInitialized) {
      window._emotionInitialized = true;
      initEmotion();
    } else if (tab === 'gtrends' && !window._gtrendsInitialized) {
      window._gtrendsInitialized = true;
      initGoogleTrends();
    }
  });
});

// --- Pipeline KPI Row ---
function renderJbPipeline() {
  const container = document.getElementById('jbPipeline');
  const counts = {};
  JIBBITZ_PIPELINE.forEach(p => counts[p.stage] = 0);
  JIBBITZ_TRENDS.forEach(t => counts[t.stage] = (counts[t.stage] || 0) + 1);

  const urgentCount = JIBBITZ_TRENDS.filter(t => t.momentum === 'surging' && t.stage === 'evaluation').length;

  container.innerHTML = JIBBITZ_PIPELINE.map(p => `
    <div class="jb-pipeline-card" style="border-top:3px solid ${p.color}">
      <div class="jb-pipeline-icon">${p.icon}</div>
      <div class="jb-pipeline-count">${counts[p.stage]}</div>
      <div class="jb-pipeline-label">${p.label}</div>
    </div>
  `).join('') + `
    <div class="jb-pipeline-card jb-urgent" style="border-top:3px solid #ef4444">
      <div class="jb-pipeline-icon">⚡</div>
      <div class="jb-pipeline-count">${urgentCount}</div>
      <div class="jb-pipeline-label">Urgent Action</div>
    </div>
  `;
}

// --- Trend Cards ---
function renderJbTrends(data) {
  const grid = document.getElementById('jbTrendsGrid');
  grid.innerHTML = data.map(t => {
    const stageInfo = JIBBITZ_PIPELINE.find(p => p.stage === t.stage) || {};
    const trendStatus = getTrendStatus(t);
    const statusMap = {
      missed:       { cls: 'jb-missed-badge',       label: '⚠ MISSED IT' },
      downtrending: { cls: 'jb-downtrend-badge',    label: '↓ DOWNTRENDING' },
      actnow:       { cls: 'jb-urgent-badge',        label: '🔥 ACT NOW' },
      heating:      { cls: 'jb-warm-badge',          label: '↑ HEATING UP' },
      watching:     { cls: 'jb-watch-badge',         label: 'WATCHING' },
    };
    const { cls: urgencyClass, label: urgencyLabel } = statusMap[trendStatus];
    const momentumLabels = { surging: '⚡ Surging', rising: '↑ Rising', steady: '→ Steady', fading: '↓ Fading', peaked: '● Peaked' };
    const momentumLabel = momentumLabels[t.momentum] || t.momentum;

    return `
    <div class="jb-trend-card">
      <div class="jb-trend-header">
        <span class="jb-badge ${urgencyClass}">${urgencyLabel}</span>
        <span class="jb-category-tag">${formatCategory(t.category)}</span>
      </div>
      <div class="jb-trend-name">${t.name}</div>
      ${t.confidence ? `<div style="margin-bottom:6px;"><span title="${t.confidenceNote || ''}" style="font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:4px;cursor:help;${t.confidence === 'verified' ? 'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;' : 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;'}">${t.confidence === 'verified' ? '✓ VERIFIED' : '⚠ MODELED'}</span> <span style="font-size:0.72rem;color:#9ca3af;">${t.confidenceNote || ''}</span></div>` : ''}
      <div class="jb-trend-desc">${t.description}</div>
      <div class="jb-trend-metrics">
        <div class="jb-metric">
          <div class="jb-metric-value">${t.jibbitzScore}</div>
          <div class="jb-metric-label">Jibbitz Score</div>
          <div class="jb-score-bar"><div class="jb-score-fill" style="width:${t.jibbitzScore}%;background:${scoreColor(t.jibbitzScore)}"></div></div>
        </div>
        <div class="jb-metric">
          <div class="jb-metric-value" style="font-size:0.85rem;">${momentumLabel}</div>
          <div class="jb-metric-label">Momentum</div>
        </div>
        <div class="jb-metric">
          <div class="jb-metric-value">${t.daysTrending}d</div>
          <div class="jb-metric-label">Trending</div>
        </div>
      </div>
      <div class="jb-trend-footer">
        <span class="jb-source">${t.source}</span>
        <span class="jb-days">${t.daysTrending}d trending</span>
      </div>
      ${t.audience ? `
      <div class="jb-audience">
        <div class="jb-regional-title">Audience Relevance</div>
        <div class="jb-audience-grid">
          ${Object.entries(t.audience).map(([seg, score]) => `
            <div class="jb-audience-item">
              <div class="jb-audience-label">${seg}</div>
              <div class="jb-audience-bar-wrap">
                <div class="jb-audience-bar" style="width:${score}%;background:${score >= 80 ? '#43B02A' : score >= 55 ? '#f59e0b' : '#e0e0e0'}"></div>
              </div>
              <div class="jb-audience-score">${score}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
      ${t.regional ? (() => {
        const hasData = Object.values(t.regional).some(v => v > 0);
        return hasData ? `
      <div class="jb-regional">
        <div class="jb-regional-title">Regional Relevance <span class="jb-source-tag">Google Trends</span></div>
        <div class="jb-regional-grid">
          ${Object.entries(t.regional).map(([region, score]) => `
            <div class="jb-regional-item">
              <div class="jb-regional-bar-wrap">
                <div class="jb-regional-bar" style="height:${score}%;background:${score >= 80 ? '#43B02A' : score >= 55 ? '#f59e0b' : '#e0e0e0'}"></div>
              </div>
              <div class="jb-regional-score">${score}</div>
              <div class="jb-regional-label">${region}</div>
            </div>
          `).join('')}
        </div>
      </div>` : `
      <div class="jb-regional">
        <div class="jb-regional-title">Regional Relevance</div>
        <div class="jb-no-data">Insufficient Google search volume to show regional breakdown — trend is spreading via social media, not search.</div>
      </div>`;
      })() : ''}
      <div class="jb-stage-banner" style="background:${stageInfo.color}15;border-left:3px solid ${stageInfo.color};color:${stageInfo.color}">
        ${stageInfo.icon || ''} ${t.stageDetail}
      </div>
      <button class="jb-design-brief-btn" onclick="openDesignModal('${t.id}')">🎨 Generate Design Brief</button>
    </div>`;
  }).join('');
}

function formatCategory(cat) {
  const labels = { 'animals': '🐾 Animals', 'pop-culture': '⭐ Pop Culture', 'food': '🍕 Food & Drink', 'memes': '😂 Memes', 'sports': '🏆 Sports', 'characters': '🎭 Characters' };
  return labels[cat] || cat;
}

function scoreColor(score) {
  if (score >= 90) return '#43B02A';
  if (score >= 75) return '#f59e0b';
  return '#6b7280';
}

function filterTrends() {
  const cat = document.getElementById('jbCategoryFilter').value;
  const filtered = cat === 'all' ? [...JIBBITZ_TRENDS] : JIBBITZ_TRENDS.filter(t => t.category === cat);
  jbTrendsData = filtered;
  sortTrends();
}

function sortTrends() {
  const sortBy = document.getElementById('jbSortSelect').value;
  const sorted = [...jbTrendsData];
  switch (sortBy) {
    case 'momentum': sorted.sort((a, b) => momentumScore(b) - momentumScore(a)); break;
    case 'age': sorted.sort((a, b) => a.daysTrending - b.daysTrending); break;
    default: sorted.sort((a, b) => b.jibbitzScore - a.jibbitzScore);
  }
  renderJbTrends(sorted);
}

// --- Search Interest Trajectory Chart ---
function renderJbVelocityChart() {
  const ctx = document.getElementById('jbVelocityChart').getContext('2d');
  const days = Array.from({length: 14}, (_, i) => `Day ${i + 1}`);

  // Show top 5 by current relevance score (most actionable right now)
  const top5 = [...JIBBITZ_TRENDS].sort((a, b) => calcRelevanceScore(b) - calcRelevanceScore(a)).slice(0, 5);
  const colors = ['#43B02A', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const datasets = top5.map((t, i) => ({
    label: t.name,
    data: t.searchTrend,
    borderColor: colors[i],
    backgroundColor: i === 0 ? colors[i] + '20' : 'transparent',
    borderWidth: i === 0 ? 3 : 1.5,
    pointRadius: i === 0 ? 4 : 2,
    fill: i === 0,
    tension: 0.3,
  }));

  if (window._jbVelocityChart) window._jbVelocityChart.destroy();
  window._jbVelocityChart = new Chart(ctx, {
    type: 'line',
    data: { labels: days, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw} relative interest` } },
      },
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Relative Interest (directional)' } },
      },
    },
  });
}

// --- Momentum Distribution Chart ---
function renderJbCategoryChart() {
  const ctx = document.getElementById('jbCategoryChart').getContext('2d');

  const order = ['surging', 'rising', 'steady', 'fading', 'peaked'];
  const labels = ['⚡ Surging', '↑ Rising', '→ Steady', '↓ Fading', '● Peaked'];
  const colors = ['#43B02A', '#86efac', '#f59e0b', '#fb923c', '#9ca3af'];

  const counts = order.map(m => JIBBITZ_TRENDS.filter(t => t.momentum === m).length);

  if (window._jbCategoryChart) window._jbCategoryChart.destroy();
  window._jbCategoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      cutout: '58%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} trend${c.raw !== 1 ? 's' : ''}` } },
      },
    },
  });
}

// --- Pipeline Board ---
function renderJbPipelineBoard() {
  const board = document.getElementById('jbPipelineBoard');
  board.innerHTML = JIBBITZ_PIPELINE.map(p => {
    const items = JIBBITZ_TRENDS.filter(t => t.stage === p.stage);
    return `
    <div class="jb-board-column">
      <div class="jb-board-header" style="background:${p.color}15;border-bottom:2px solid ${p.color}">
        <span>${p.icon} ${p.label}</span>
        <span class="jb-board-count">${items.length}</span>
      </div>
      <div class="jb-board-items">
        ${items.map(t => `
          <div class="jb-board-item">
            <div class="jb-board-item-name">${t.name}</div>
            <div class="jb-board-item-score">Score: ${t.jibbitzScore} · ${{ surging: '⚡', rising: '↑', steady: '→', fading: '↓', peaked: '●' }[t.momentum] || ''} ${t.momentum}</div>
            <div class="jb-board-item-detail">${t.stageDetail}</div>
          </div>
        `).join('')}
        ${items.length === 0 ? '<div class="jb-board-empty">No items</div>' : ''}
      </div>
    </div>`;
  }).join('');
}

// --- Jibbitz Roadmap ---
function renderJibbitzRoadmap() {
  const mooDeng = JIBBITZ_TRENDS.find(t => t.id === 'moo-deng-2') || { momentum: 'fading' };
  const pandaTwins = JIBBITZ_TRENDS.find(t => t.id === 'panda-twins') || { momentum: 'surging' };
  const pedro = JIBBITZ_TRENDS.find(t => t.id === 'pedro-raccoon') || { daysTrending: 30 };
  const capybara = JIBBITZ_TRENDS.find(t => t.id === 'capybara-hot-spring') || {};

  const items = [
    // 1–3 months
    {
      horizon: "1-3",
      priority: "high",
      type: "Product",
      title: "Fast-Track Moo Deng Baby & Panda Twins",
      description: `Moo Deng is ${mooDeng.momentum}, Panda Twins are ${pandaTwins.momentum}. Rush to production — window closes fast.`,
      kpi: "Launch within 45 days, target 50K units sell-through in week 1",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "Campaign",
      title: "Coachella 2026 Influencer Seeding",
      description: "Festival starts April. Seed existing catalog to 50 festival influencers.",
      kpi: "10M organic impressions, 500+ pieces of UGC",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "Campaign",
      title: "March Madness NIL Athlete Content",
      description: "Real-time moment right now. Activate NIL athlete partners for bracket content featuring Jibbitz.",
      kpi: "5M reach, 200K engagements",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "Product",
      title: "Pedro Raccoon & Stanley Jibbitz — Evaluation to Design",
      description: `Both ${pedro.daysTrending}+ days trending with strong scores. Move from evaluation to design immediately.`,
      kpi: "Designs approved within 3 weeks",
    },
    // 3–6 months
    {
      horizon: "3-6",
      priority: "high",
      type: "Partnership",
      title: "Wicked: For Good Jibbitz — Extend While Momentum is Live",
      description: "Part 2 launched November 2025 — the cultural wave is active now. First collab sold out in 2 hours. Plan an expanded SKU restock before post-launch momentum fades.",
      kpi: "Contract signed by June, 3x SKU count vs Part 1",
    },
    {
      horizon: "3-6",
      priority: "high",
      type: "Campaign",
      title: "Pickle & Bluey Launch Celebration",
      description: "Both currently in production. Plan launch campaign with creator seeding.",
      kpi: "Sell-out within 7 days of launch",
    },
    {
      horizon: "3-6",
      priority: "medium",
      type: "Product",
      title: "Onsen Capybara Seasonal Limited Edition",
      description: "High Japan/Korea relevance. Plan for Q4 winter seasonal release.",
      kpi: "15K units, strong APAC market performance",
    },
    // 6–12 months
    {
      horizon: "6-12",
      priority: "high",
      type: "Product",
      title: "Wicked: For Good — Extended Collection Drop",
      description: "Film launched Nov 2025. Expand the original collab with 10+ charms, Elphaba vs. Glinda pack, and a global BFCM 2026 restock drop.",
      kpi: "200K units, $4M revenue",
    },
    {
      horizon: "6-12",
      priority: "medium",
      type: "Research",
      title: "Predictive Trend Detection System",
      description: "Build social listening pipeline to flag trends 2 weeks earlier than current process.",
      kpi: "Average 10-day improvement in trend detection lead time",
    },
    {
      horizon: "6-12",
      priority: "medium",
      type: "Campaign",
      title: "Holiday 2026 Jibbitz Gift Sets",
      description: "Build curated themed 3-pack gift sets for holiday.",
      kpi: "30% of holiday Crocs purchases include Jibbitz",
    },
  ];

  // Reuse the shared roadmap renderer with a custom title override
  const container = document.getElementById('jibbitzRoadmap');
  if (!container) return;

  const horizons = [
    { key: "1-3",  label: "1–3 Months",  sublabel: "Act Now",      color: "#ef4444" },
    { key: "3-6",  label: "3–6 Months",  sublabel: "Plan Now",     color: "#f59e0b" },
    { key: "6-12", label: "6–12 Months", sublabel: "Build Toward",  color: "#43B02A" },
  ];

  const grid = horizons.map(h => {
    const cards = items.filter(item => item.horizon === h.key);
    return `
      <div class="roadmap-column">
        <div class="roadmap-column-header" style="background:${h.color};">
          <span class="roadmap-column-header-label">${h.label} &mdash; ${h.sublabel}</span>
          <span class="roadmap-column-count">${cards.length}</span>
        </div>
        ${cards.map(card => `
          <div class="roadmap-card" data-priority="${card.priority}">
            <div class="roadmap-card-top">
              <span class="roadmap-priority roadmap-priority-${card.priority}">${card.priority}</span>
              <span class="roadmap-type">${card.type}</span>
            </div>
            <div class="roadmap-title">${card.title}</div>
            <div class="roadmap-desc">${card.description}</div>
            <div class="roadmap-kpi">Expected: ${card.kpi}</div>
          </div>
        `).join('')}
      </div>`;
  }).join('');

  container.innerHTML = `
    <h3>Jibbitz Launch Roadmap</h3>
    <p class="actions-subtitle">Prioritised actions across three planning horizons</p>
    <div class="roadmap-grid">${grid}</div>
  `;
}

// ─── Design Brief Modal ────────────────────────────────────────────────────

function openDesignModal(trendId) {
  const trend = JIBBITZ_TRENDS.find(t => t.id === trendId);
  if (!trend) return;

  document.getElementById('designModalTitle').textContent = trend.name;
  document.getElementById('designModalBody').innerHTML = buildDesignBriefHTML(trend);
  document.getElementById('designBriefModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDesignModal(e) {
  if (e && e.target !== document.getElementById('designBriefModal')) return;
  document.getElementById('designBriefModal').style.display = 'none';
  document.body.style.overflow = '';
}

function buildDesignBriefHTML(trend) {
  const concepts = getCharmConcepts(trend);
  const palette  = getCharmPalette(trend);
  const packFmt  = getPackFormat(trend);

  const topRegions = Object.entries(trend.regional)
    .sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topAudience = Object.entries(trend.audience)
    .sort((a, b) => b[1] - a[1]).slice(0, 2);

  const urgency = trend.momentum === 'surging'
    ? { label: 'Rush — Act Now', rec: 'Target 30-day concept-to-brief window. This trend has a short cultural shelf life.', bg: '#fef2f2', border: '#ef4444', color: '#b91c1c' }
    : trend.momentum === 'rising'
    ? { label: 'Fast-track', rec: 'Target 60-day window. Trend is still accelerating — prioritise over standard pipeline.', bg: '#fffbeb', border: '#f59e0b', color: '#92400e' }
    : { label: 'Standard timeline', rec: 'No urgency. Re-evaluate in 3–4 weeks before committing resources.', bg: '#f3f4f6', border: '#9ca3af', color: '#6b7280' };

  const pricing = trend.jibbitzScore >= 90
    ? '$7.99–$9.99 (premium / limited edition)'
    : trend.jibbitzScore >= 75
    ? '$5.99–$7.99 (standard retail)'
    : '$4.99–$5.99 (entry-level)';

  return `
    <div class="design-modal-body">

      <div class="design-brief-section">
        <div class="design-brief-section-title">Charm Concept Ideas</div>
        <div class="design-brief-concepts">
          ${concepts.map(c => `<div class="design-brief-concept">${c}</div>`).join('')}
        </div>
      </div>

      <div class="design-brief-section">
        <div class="design-brief-section-title">Suggested Colour Palette</div>
        <div class="design-brief-palette-row">
          ${palette.map(p => `
            <div style="display:flex;align-items:center;gap:0.35rem;">
              <div class="design-brief-swatch" style="background:${p.hex};" title="${p.name}"></div>
              <span class="design-brief-swatch-label">${p.name}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="design-brief-row" style="margin-bottom:1.25rem;">
        <div class="design-brief-stat">
          <div class="design-brief-stat-label">Pack Format</div>
          <div class="design-brief-stat-value">${packFmt}</div>
        </div>
        <div class="design-brief-stat">
          <div class="design-brief-stat-label">Suggested Retail</div>
          <div class="design-brief-stat-value">${pricing}</div>
        </div>
      </div>

      <div class="design-brief-section">
        <div class="design-brief-section-title">Priority Markets</div>
        <div class="design-brief-markets">
          ${topRegions.map(([region, score]) => `
            <div class="design-brief-market-pill">
              ${region} <span class="pill-score">${score}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="design-brief-section">
        <div class="design-brief-section-title">Primary Audience</div>
        <div class="design-brief-markets">
          ${topAudience.map(([seg, score]) => `
            <div class="design-brief-market-pill">
              ${seg} <span class="pill-score">${score}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="design-brief-section">
        <div class="design-brief-section-title">Launch Timing Recommendation</div>
        <div class="design-brief-urgency" style="background:${urgency.bg};border-left:4px solid ${urgency.border};color:${urgency.color}">
          <strong>${urgency.label}</strong> — ${urgency.rec}
        </div>
      </div>

    </div>`;
}

// ─── Design Brief Helpers ──────────────────────────────────────────────────

function getCharmConcepts(trend) {
  const conceptMap = {
    'punch-monkey':        ['Hero charm: baby spider monkey clutching mini stuffed animal — 3D sculpted, high detail', 'Expression variant: zoomed-in face with wide eyes for maximum emotional reaction', 'Duo pack: monkey + tiny stuffed toy as a collectible pair'],
    'moo-deng-2':          ['Hero charm: baby pygmy hippo full-body in playful pose, rounded proportions', 'Matching set: Moo Deng baby + Moo Deng original — creates a mother/baby collectible pair', 'Mini splash charm: hippo half-submerged in water, perfect for pool-themed styling'],
    'capybara-hot-spring': ['Hero charm: capybara sitting in hot spring with yuzu orange on head — instantly iconic', 'Winter seasonal variant: capybara in tiny towel, white steam details', 'Duo set: capybara + mini yuzu orange as separate wearable companion charm'],
    'dubai-chocolate':     ['Cross-section charm: the iconic green pistachio kunafa interior view — bold and recognisable', 'Bar wrapper charm: full chocolate bar in branded gold foil style', '3-pack: chocolate bar + pistachio + kunafa swirl — covers the full visual story'],
    'pedro-raccoon':       ['Hero charm: Pedro raccoon mid-dance silhouette — the pose that launched a million remixes', 'Expression close-up: raccoon face with signature ear tufts in flat 2D style', 'Duo set: raccoon + musical note as a pair, nods to the Carrà audio'],
    'pickle-everything':   ['3-pack: whole pickle, pickle slice, and pickle jar — the complete pickle universe', 'Hero charm: oversized pickle with cartoonish face for shareability', 'Brine jar charm: the jar label with "Pickled" branding — nostalgia meets meme culture'],
    'caitlin-clark':       ['Silhouette charm: Clark in signature goggles celebration pose (check licensing)', 'Number charm: #22 in WNBA Fever orange — simple, iconic, collectible', 'Basketball + goggles duo set — avoids likeness rights while staying on-trend'],
    'bluey-season4':       ['3-pack: Bluey + Bingo + Muffin — the three most-requested characters on socials', 'Bluey hero charm: faithful to S4 character design, rounded for charm scale', 'Heeler family house charm: the iconic house as a collectible set centrepiece'],
    'cottage-cheese':      ['Punny hero charm: cottage cheese tub with tiny fork — leans into the food TikTok aesthetic', 'Macro texture charm: the lumpy surface rendered in 3D — surprisingly charming', 'Wellness pack: cottage cheese + protein shake + fruit — targets the health crowd'],
    'grimace-shake':       ['Hero charm: Grimace purple blob full-body — faithful to McDonald\'s character', 'Grimace shake cup charm: the purple milkshake that broke the internet', 'Duo restock: Grimace + golden arch charm — collab pack (requires McDonald\'s licensing)'],
    'panda-twins':         ['Twin set: Bao Li + Qing Bao twin panda cubs — sold as an inseparable pair', 'Bamboo accessory charm: mini bamboo stalk companions to the twin set', 'Sleepy panda variant: cub curled up asleep — taps into the "cute resting" content format'],
    'stanley-cup':         ['Mini Stanley cup charm: the iconic handle + colour-match lid, in multiple colourways', 'Colour-match pack: Stanley charm + matching Jibbitz in 5 popular Stanley colours', 'Collab set: "Crocs x Stanley" co-branded pack (approach Stanley for partnership)'],
  };
  return conceptMap[trend.id] || [
    `Hero ${trend.name} charm — 3D sculpted, key recognisable feature as focal point`,
    `Expression/detail variant — close-up of the element that made this trend shareable`,
    `Multi-pack — 2–3 related items that tell the full story of the trend`,
  ];
}

function getCharmPalette(trend) {
  const palettes = {
    'animals':     [{ hex: '#8B6914', name: 'Warm Brown' }, { hex: '#A8D5A2', name: 'Sage' }, { hex: '#F5DEB3', name: 'Wheat' }, { hex: '#1D1D1B', name: 'Outline Black' }],
    'food':        [{ hex: '#F5A623', name: 'Saffron' }, { hex: '#4CAF50', name: 'Fresh Green' }, { hex: '#E84C3D', name: 'Tomato' }, { hex: '#FFF9C4', name: 'Cream' }],
    'memes':       [{ hex: '#9B59B6', name: 'Meme Purple' }, { hex: '#F39C12', name: 'Pop Amber' }, { hex: '#2ECC71', name: 'Kermit Green' }, { hex: '#ECF0F1', name: 'Off White' }],
    'sports':      [{ hex: '#2563EB', name: 'Court Blue' }, { hex: '#EF4444', name: 'Sport Red' }, { hex: '#F59E0B', name: 'Gold' }, { hex: '#1D1D1B', name: 'Pitch Black' }],
    'characters':  [{ hex: '#EC4899', name: 'Character Pink' }, { hex: '#8B5CF6', name: 'Violet' }, { hex: '#F59E0B', name: 'Sunshine' }, { hex: '#43B02A', name: 'Crocs Green' }],
    'pop-culture': [{ hex: '#06B6D4', name: 'Viral Cyan' }, { hex: '#8B5CF6', name: 'Trend Purple' }, { hex: '#F59E0B', name: 'Moment Amber' }, { hex: '#EF4444', name: 'Hot Red' }],
  };
  return palettes[trend.category] || palettes['pop-culture'];
}

function getPackFormat(trend) {
  const formats = {
    'animals':     '1-pack hero charm + optional companion accessory',
    'food':        '3-pack (3 related food items from the trend)',
    'memes':       '1-pack hero silhouette charm',
    'sports':      '2-pack (athlete reference + signature gear)',
    'characters':  '3-pack (main + 2 supporting characters)',
    'pop-culture': '1-pack with 3–4 colourway variants',
  };
  return formats[trend.category] || '1-pack hero charm';
}
