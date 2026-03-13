// Jibbitz Trends - Application Logic

let jbTrendsData = [];

function initJibbitz() {
  jbTrendsData = [...JIBBITZ_TRENDS].sort((a, b) => b.jibbitzScore - a.jibbitzScore);
  renderJbPipeline();
  renderJbTrends(jbTrendsData);
  renderJbVelocityChart();
  renderJbCategoryChart();
  renderJbPipelineBoard();
  renderJbWins();
  renderJibbitzRoadmap();
}

document.addEventListener("DOMContentLoaded", () => {
  window._jbInitialized = true;
  initJibbitz();
});

// --- Tab Navigation ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-' + tab).classList.add('active');
    if (tab === 'jibbitz' && !window._jbInitialized) {
      window._jbInitialized = true;
      initJibbitz();
    } else if (tab === 'sustainability' && !window._sustainabilityInitialized) {
      window._sustainabilityInitialized = true;
      renderAll();
    } else if (tab === 'affinity' && !window._affinityInitialized) {
      window._affinityInitialized = true;
      initAffinity();
    }
  });
});

// --- Pipeline KPI Row ---
function renderJbPipeline() {
  const container = document.getElementById('jbPipeline');
  const counts = {};
  JIBBITZ_PIPELINE.forEach(p => counts[p.stage] = 0);
  JIBBITZ_TRENDS.forEach(t => counts[t.stage] = (counts[t.stage] || 0) + 1);

  const urgentCount = JIBBITZ_TRENDS.filter(t => t.velocity >= 80 && t.stage === 'evaluation').length;

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
    const urgencyClass = t.velocity >= 80 ? 'jb-urgent-badge' : t.velocity >= 60 ? 'jb-warm-badge' : 'jb-watch-badge';
    const urgencyLabel = t.velocity >= 80 ? 'ACT NOW' : t.velocity >= 60 ? 'HEATING UP' : 'WATCHING';
    const volumeStr = t.socialVolume >= 1000000 ? (t.socialVolume / 1000000).toFixed(1) + 'M' : (t.socialVolume / 1000).toFixed(0) + 'K';

    return `
    <div class="jb-trend-card">
      <div class="jb-trend-header">
        <span class="jb-badge ${urgencyClass}">${urgencyLabel}</span>
        <span class="jb-category-tag">${formatCategory(t.category)}</span>
      </div>
      <div class="jb-trend-name">${t.name}</div>
      <div class="jb-trend-desc">${t.description}</div>
      <div class="jb-trend-metrics">
        <div class="jb-metric">
          <div class="jb-metric-value">${t.jibbitzScore}</div>
          <div class="jb-metric-label">Jibbitz Score</div>
          <div class="jb-score-bar"><div class="jb-score-fill" style="width:${t.jibbitzScore}%;background:${scoreColor(t.jibbitzScore)}"></div></div>
        </div>
        <div class="jb-metric">
          <div class="jb-metric-value">${volumeStr}</div>
          <div class="jb-metric-label">Social Volume</div>
        </div>
        <div class="jb-metric">
          <div class="jb-metric-value">${t.velocity}</div>
          <div class="jb-metric-label">Velocity</div>
        </div>
        <div class="jb-metric">
          <div class="jb-metric-value">${t.sentiment}%</div>
          <div class="jb-metric-label">Sentiment</div>
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
      ${t.regional ? `
      <div class="jb-regional">
        <div class="jb-regional-title">Regional Relevance</div>
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
      </div>` : ''}
      <div class="jb-stage-banner" style="background:${stageInfo.color}15;border-left:3px solid ${stageInfo.color};color:${stageInfo.color}">
        ${stageInfo.icon || ''} ${t.stageDetail}
      </div>
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
    case 'velocity': sorted.sort((a, b) => b.velocity - a.velocity); break;
    case 'volume': sorted.sort((a, b) => b.socialVolume - a.socialVolume); break;
    case 'sentiment': sorted.sort((a, b) => b.sentiment - a.sentiment); break;
    default: sorted.sort((a, b) => b.jibbitzScore - a.jibbitzScore);
  }
  renderJbTrends(sorted);
}

// --- Velocity Chart ---
function renderJbVelocityChart() {
  const ctx = document.getElementById('jbVelocityChart').getContext('2d');
  const days = Array.from({length: 14}, (_, i) => `Day ${i + 1}`);

  const top5 = [...JIBBITZ_TRENDS].sort((a, b) => b.jibbitzScore - a.jibbitzScore).slice(0, 5);
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
      },
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Relative Search Interest' } },
      },
    },
  });
}

// --- Category Chart ---
function renderJbCategoryChart() {
  const ctx = document.getElementById('jbCategoryChart').getContext('2d');

  const catCounts = {};
  const catScores = {};
  JIBBITZ_TRENDS.forEach(t => {
    catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    catScores[t.category] = (catScores[t.category] || 0) + t.jibbitzScore;
  });

  const cats = Object.keys(catCounts);
  const avgScores = cats.map(c => Math.round(catScores[c] / catCounts[c]));
  const counts = cats.map(c => catCounts[c]);

  const catColors = {
    'animals': '#43B02A', 'pop-culture': '#8b5cf6', 'food': '#f59e0b',
    'memes': '#ef4444', 'sports': '#3b82f6', 'characters': '#ec4899'
  };

  if (window._jbCategoryChart) window._jbCategoryChart.destroy();
  window._jbCategoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cats.map(c => formatCategory(c).replace(/^.+? /, '')),
      datasets: [
        {
          label: 'Avg Jibbitz Score',
          data: avgScores,
          backgroundColor: cats.map(c => catColors[c] || '#999'),
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Trend Count',
          data: counts,
          type: 'line',
          borderColor: '#1D1D1B',
          backgroundColor: '#1D1D1B',
          pointRadius: 5,
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
      },
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Avg Jibbitz Score' } },
        y1: { beginAtZero: true, position: 'right', grid: { display: false }, title: { display: true, text: 'Count' } },
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
            <div class="jb-board-item-score">Score: ${t.jibbitzScore} · ${t.velocity >= 80 ? '⚡' : t.velocity >= 60 ? '🔥' : '👁️'} ${t.velocity}</div>
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
  const mooDeng = JIBBITZ_TRENDS.find(t => t.id === 'moo-deng-2') || { velocity: 96 };
  const pandaTwins = JIBBITZ_TRENDS.find(t => t.id === 'panda-twins') || { velocity: 85 };
  const pedro = JIBBITZ_TRENDS.find(t => t.id === 'pedro-raccoon') || { daysTrending: 30 };
  const capybara = JIBBITZ_TRENDS.find(t => t.id === 'capybara-hot-spring') || {};

  const items = [
    // 1–3 months
    {
      horizon: "1-3",
      priority: "high",
      type: "Product",
      title: "Fast-Track Moo Deng Baby & Panda Twins",
      description: `Both are in design with velocity ${mooDeng.velocity} and ${pandaTwins.velocity}. Rush to production — window closes fast.`,
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
      title: "Begin Wicked Part 2 Collab Planning",
      description: "Part 2 releases November 2026. First collab sold out in 2 hours. Negotiate expanded range now (8+ months lead time).",
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
      title: "Wicked Part 2 Jibbitz Collection Launch",
      description: "Largest licensed collab of the year. Plan 10+ charms, global simultaneous drop.",
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

// --- Wins ---
function renderJbWins() {
  const grid = document.getElementById('jbWinsGrid');
  grid.innerHTML = JIBBITZ_WINS.map(w => `
    <div class="jb-win-card">
      <div class="jb-win-header">
        <div class="jb-win-name">🏆 ${w.name}</div>
        <div class="jb-win-date">${new Date(w.launchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div class="jb-win-highlight">${w.highlight}</div>
      <div class="jb-win-stats">
        <div class="jb-win-stat"><strong>${w.socialLikes}</strong><span>Social Likes</span></div>
        <div class="jb-win-stat"><strong>${w.prPickups}</strong><span>PR Pickups</span></div>
      </div>
      <div class="jb-win-impact">${w.salesImpact}</div>
      <div class="jb-win-lesson"><strong>Lesson:</strong> ${w.lessonsLearned}</div>
    </div>
  `).join('');
}
