// Affinity Brand Tracking — Application Logic
// Tracks Sport, Style, and Entertainment affinities for Crocs brand alignment

let _affinityActiveCategory = 'all';
let _affinityActiveType = 'all';

function initAffinity() {
  renderAffinityCategoryCards();
  renderAffinityTopHighlights();
  renderAffinityFeed();
  renderAffinityRoadmap();
}

// ─── Category Summary Cards ────────────────────────────────────────────────

function renderAffinityCategoryCards() {
  const container = document.getElementById('affinityCategoryCards');

  container.innerHTML = AFFINITY_CATEGORIES.map(cat => {
    const items = AFFINITY_ITEMS.filter(item => item.category === cat.id);
    const avgRelevance = items.length
      ? Math.round(items.reduce((sum, i) => sum + i.relevanceScore, 0) / items.length)
      : 0;
    const avgTrend = items.length
      ? Math.round(items.reduce((sum, i) => sum + i.trendStrength, 0) / items.length)
      : 0;
    const topItem = [...items].sort((a, b) => b.relevanceScore - a.relevanceScore)[0];

    return `
      <div class="affinity-cat-card" style="border-top: 4px solid ${cat.color}; background: ${cat.colorLight}; border-color-secondary: ${cat.colorBorder};">
        <div class="affinity-cat-card-header">
          <span class="affinity-cat-icon">${cat.icon}</span>
          <span class="affinity-cat-label" style="color: ${cat.color};">${cat.label}</span>
        </div>
        <div class="affinity-cat-stats">
          <div class="affinity-cat-stat">
            <span class="affinity-cat-stat-value" style="color: ${cat.color};">${items.length}</span>
            <span class="affinity-cat-stat-label">Tracked Items</span>
          </div>
          <div class="affinity-cat-stat">
            <span class="affinity-cat-stat-value" style="color: ${cat.color};">${avgRelevance}</span>
            <span class="affinity-cat-stat-label">Avg Relevance</span>
          </div>
          <div class="affinity-cat-stat">
            <span class="affinity-cat-stat-value" style="color: ${cat.color};">${avgTrend}</span>
            <span class="affinity-cat-stat-label">Avg Trend Str.</span>
          </div>
        </div>
        <div class="affinity-cat-top">
          <span class="affinity-cat-top-label">Top signal:</span>
          <span class="affinity-cat-top-name">${topItem ? topItem.name : '—'}</span>
          ${topItem ? `<span class="affinity-cat-top-score" style="color:${cat.color};">${topItem.relevanceScore}</span>` : ''}
        </div>
        <p class="affinity-cat-desc">${cat.description}</p>
      </div>`;
  }).join('');
}

// ─── Top Affinities Highlight Section ─────────────────────────────────────

function renderAffinityTopHighlights() {
  const container = document.getElementById('affinityTopHighlights');
  const top3 = [...AFFINITY_ITEMS].sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 3);

  container.innerHTML = top3.map((item, idx) => {
    const cat = AFFINITY_CATEGORIES.find(c => c.id === item.category);
    const rank = ['#1', '#2', '#3'][idx];

    return `
      <div class="affinity-highlight-card" style="border-left: 5px solid ${cat.color};">
        <div class="affinity-highlight-rank" style="background: ${cat.color}; color: white;">${rank}</div>
        <div class="affinity-highlight-body">
          <div class="affinity-highlight-meta">
            <span class="affinity-badge-cat" style="background:${cat.color}20; color:${cat.color}; border:1px solid ${cat.color}40;">${cat.icon} ${cat.label}</span>
            <span class="affinity-badge-type">${affinityTypeLabel(item.type)}</span>
          </div>
          <div class="affinity-highlight-name">${item.name}</div>
          <div class="affinity-highlight-desc">${item.description.slice(0, 140)}…</div>
          <div class="affinity-highlight-scores">
            <div class="affinity-highlight-score-item">
              <span class="affinity-score-label">Relevance to Crocs</span>
              <div class="affinity-score-bar-wrap">
                <div class="affinity-score-bar-fill" style="width:${item.relevanceScore}%; background:${cat.color};"></div>
              </div>
              <span class="affinity-score-num" style="color:${cat.color};">${item.relevanceScore}</span>
            </div>
            <div class="affinity-highlight-score-item">
              <span class="affinity-score-label">Trend Strength</span>
              <div class="affinity-score-bar-wrap">
                <div class="affinity-score-bar-fill" style="width:${item.trendStrength}%; background:${affinityTrendColor(item.trendStrength)};"></div>
              </div>
              <span class="affinity-score-num">${item.trendStrength}</span>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ─── Affinity Feed ─────────────────────────────────────────────────────────

function renderAffinityFeed() {
  const container = document.getElementById('affinityFeedGrid');
  const filtered = getFilteredAffinityItems();

  if (filtered.length === 0) {
    container.innerHTML = `<div class="affinity-empty">No items match the selected filters.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const cat = AFFINITY_CATEGORIES.find(c => c.id === item.category);
    const dateStr = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const relevanceClass = item.relevanceScore >= 90 ? 'high' : item.relevanceScore >= 75 ? 'medium' : 'low';

    return `
      <div class="affinity-card">
        <div class="affinity-card-header">
          <div class="affinity-card-badges">
            <span class="affinity-badge-cat" style="background:${cat.color}20; color:${cat.color}; border:1px solid ${cat.color}40;">${cat.icon} ${cat.label}</span>
            <span class="affinity-badge-type">${affinityTypeLabel(item.type)}</span>
          </div>
          <div class="affinity-relevance-pill relevance-${relevanceClass}" title="Relevance to Crocs brand">
            ${item.relevanceScore}
          </div>
        </div>

        <div class="affinity-card-name">${item.name}</div>
        <div class="affinity-card-desc">${item.description}</div>

        <div class="affinity-scores-block">
          <div class="affinity-score-row">
            <span class="affinity-score-label">Crocs Relevance</span>
            <div class="affinity-score-bar-wrap">
              <div class="affinity-score-bar-fill" style="width:${item.relevanceScore}%; background:${cat.color};"></div>
            </div>
            <span class="affinity-score-num" style="color:${cat.color}; font-weight:800;">${item.relevanceScore}</span>
          </div>
          <div class="affinity-score-row">
            <span class="affinity-score-label">Trend Strength</span>
            <div class="affinity-score-bar-wrap">
              <div class="affinity-score-bar-fill" style="width:${item.trendStrength}%; background:${affinityTrendColor(item.trendStrength)};"></div>
            </div>
            <span class="affinity-score-num">${item.trendStrength}</span>
          </div>
        </div>

        <div class="affinity-card-tags">
          ${item.tags.map(tag => `<span class="affinity-tag">${tag}</span>`).join('')}
        </div>

        <div class="affinity-card-footer">
          <span class="affinity-card-source">${item.source}</span>
          <span class="affinity-card-date">${dateStr}</span>
        </div>
      </div>`;
  }).join('');
}

// ─── Filters ───────────────────────────────────────────────────────────────

function getFilteredAffinityItems() {
  return AFFINITY_ITEMS.filter(item => {
    const catMatch = _affinityActiveCategory === 'all' || item.category === _affinityActiveCategory;
    const typeMatch = _affinityActiveType === 'all' || item.type === _affinityActiveType;
    return catMatch && typeMatch;
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function setAffinityFilter(category) {
  _affinityActiveCategory = category;
  document.querySelectorAll('.affinity-filter-cat').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === category);
  });
  renderAffinityFeed();
}

function setAffinityTypeFilter(type) {
  _affinityActiveType = type;
  document.querySelectorAll('.affinity-filter-type').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  renderAffinityFeed();
}

// ─── Affinity Roadmap ──────────────────────────────────────────────────────

function renderAffinityRoadmap() {
  const caitlin = AFFINITY_ITEMS.find(i => i.id === 'caitlin-clark-wnba') || { relevanceScore: 96 };
  const sabrinaEnt = AFFINITY_ITEMS.find(i => i.id === 'sabrina-carpenter-entertainment') || { relevanceScore: 93 };
  const wickedPart2 = AFFINITY_ITEMS.find(i => i.id === 'wicked-part-2') || { relevanceScore: 91 };

  const items = [
    // 1–3 months
    {
      horizon: "1-3",
      priority: "high",
      type: "Campaign",
      title: "Coachella 2026 — Own Festival Footwear",
      description: "Seed product to top 30 Coachella influencers across fashion, music, and lifestyle. Create a dedicated Coachella Jibbitz pack.",
      kpi: "15M organic impressions, featured in 5 major festival fashion roundups",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "PR",
      title: "Awards Season Celebrity Seeding",
      description: "Oscars/awards season happening now. Deliver product to 20 celebrity stylists and talent with authentic Crocs affinity.",
      kpi: "3+ high-profile organic moments, 500M potential reach",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "Campaign",
      title: "March Madness NIL Athlete Moment",
      description: "Activate college athlete NIL partners for real-time March Madness content.",
      kpi: "8M reach, 300K engagements across athlete posts",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "Content",
      title: "Chappell Roan Maximalism Campaign",
      description: "Her aesthetic maps directly to Crocs' boldest products. Commission a creator campaign inspired by her visual world.",
      kpi: "20M impressions, top-performing Q1 content",
    },
    // 3–6 months
    {
      horizon: "3-6",
      priority: "high",
      type: "Partnership",
      title: "Open Caitlin Clark Partnership Conversation",
      description: `Highest-relevance sport signal (${caitlin.relevanceScore}). Her Nike deal covers performance but not lifestyle. Approach for a Crocs lifestyle campaign.`,
      kpi: "Formal proposal submitted, deal term sheet agreed",
    },
    {
      horizon: "3-6",
      priority: "high",
      type: "Partnership",
      title: "Sabrina Carpenter Collab Outreach",
      description: `${sabrinaEnt.relevanceScore} relevance score, photographed in comfort shoes, active brand deal portfolio. Initiate conversation with her team.`,
      kpi: "Collab agreement signed by Q2",
    },
    {
      horizon: "3-6",
      priority: "high",
      type: "Campaign",
      title: "Women's Sports Amplification Campaign",
      description: "Invest in content across WNBA, NWSL, and gymnastics featuring Crocs.",
      kpi: "40M impressions, 15% brand consideration lift among women 18–34",
    },
    {
      horizon: "3-6",
      priority: "high",
      type: "Product",
      title: "Wicked: For Good — Extend the Collab Now",
      description: `Already launched Nov 2025 (relevance ${wickedPart2.relevanceScore}). Post-launch momentum window is live — expand SKU range, plan a restock, and capitalise before the cultural wave fades.`,
      kpi: "Contract in place by June",
    },
    // 6–12 months
    {
      horizon: "6-12",
      priority: "high",
      type: "Partnership",
      title: "Taylor Swift New Era Partnership",
      description: "Timing a collab with her next album cycle would be a cultural earthquake. Begin relationship-building with her team now.",
      kpi: "Collab announcement to generate 1B+ impressions",
    },
    {
      horizon: "6-12",
      priority: "high",
      type: "Campaign",
      title: "LA 2028 Athlete Ambassador Programme",
      description: "Begin signing 10–15 athletes across gymnastics, basketball, swimming, and track ahead of LA 2028.",
      kpi: "Programme announced Q4 2026, 8 athletes signed",
    },
    {
      horizon: "6-12",
      priority: "medium",
      type: "Partnership",
      title: "Beyoncé Premium Collab",
      description: "Her lifestyle brand expansion opens a window for a premium limited-edition Crocs x Beyoncé drop.",
      kpi: "Limited edition sellout in 24 hours, 500M earned media impressions",
    },
  ];

  const container = document.getElementById('affinityRoadmap');
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
    <h3>Affinity &amp; Partnerships Roadmap</h3>
    <p class="actions-subtitle">Prioritised actions across three planning horizons</p>
    <div class="roadmap-grid">${grid}</div>
  `;
}

// ─── Utility ───────────────────────────────────────────────────────────────

function affinityTypeLabel(type) {
  const map = {
    celebrity:  '⭐ Celebrity',
    campaign:   '📣 Campaign',
    trend:      '📈 Trend',
    news:       '📰 News',
    event:      '📅 Event',
    activation: '🚀 Activation',
    moment:     '🛍️ Moment',
  };
  return map[type] || type;
}

function affinityTrendColor(score) {
  if (score >= 85) return '#43B02A';
  if (score >= 65) return '#f59e0b';
  return '#6b7280';
}
