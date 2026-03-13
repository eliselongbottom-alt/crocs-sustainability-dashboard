// Consumer Trends Intelligence — Application Logic

// ─── State ─────────────────────────────────────────────────────────────────
let _trendsYearFilter = 'all';
let _trendsSourceFilter = 'all';
let _trendsCatFilter = 'all';
let _trendsSortBy = 'relevance';
let _trendsFeedIndex = 0;
let _trendsLiveInterval = null;
let _freshItemIds = new Set();
let _trendsLastUpdated = null;

// ─── Init ───────────────────────────────────────────────────────────────────
function initTrends() {
  _trendsLastUpdated = new Date();
  renderTrendsLiveBanner();
  renderTrendsStats();
  renderTrendsBreaking();
  renderSourcePills();
  renderCatPills();
  renderTrendsFeed();
  renderSourcesGrid();
  startLiveFeed();
}

// ─── Live Feed Banner ───────────────────────────────────────────────────────
function renderTrendsLiveBanner() {
  const banner = document.getElementById('trendsLiveBanner');
  if (!banner) return;
  const timeStr = _trendsLastUpdated
    ? _trendsLastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  banner.innerHTML = `
    <div class="trends-live-banner-inner">
      <div class="trends-live-banner-left">
        <span class="trends-live-dot"></span>
        <span class="trends-live-banner-text">Live Feed Active</span>
        <span class="trends-live-banner-sep">—</span>
        <span class="trends-live-banner-sub">Tracking trends from <strong>12</strong> global intelligence sources</span>
      </div>
      <div class="trends-live-banner-right">
        <span class="trends-live-banner-time">Last refreshed: <strong id="trendsLastUpdated">${timeStr}</strong></span>
        <span class="trends-live-banner-interval">Auto-refresh every 45s</span>
      </div>
    </div>
  `;
}

// ─── Stats Row ──────────────────────────────────────────────────────────────
function renderTrendsStats() {
  const container = document.getElementById('trendsStatsRow');
  if (!container) return;
  const total = TREND_ITEMS.length;
  const sourcesActive = TREND_SOURCES.length;
  const highRelevance = TREND_ITEMS.filter(t => t.crocsRelevance >= 85).length;
  const breaking = TREND_ITEMS.filter(t => t.isBreaking).length;

  const stats = [
    { value: total, label: 'Trends Tracked', icon: '📊', color: '#43B02A', detail: 'Across 2026–2028' },
    { value: sourcesActive, label: 'Sources Active', icon: '🔍', color: '#3b82f6', detail: 'Tier 1 & 2 intelligence' },
    { value: highRelevance, label: 'High Relevance', icon: '🎯', color: '#8b5cf6', detail: 'Crocs relevance ≥ 85' },
    { value: breaking, label: 'Breaking Now', icon: '⚡', color: '#ef4444', detail: 'Top priority signals' },
  ];

  container.innerHTML = stats.map(s => `
    <div class="trends-stat-card" style="border-top: 3px solid ${s.color};">
      <div class="trends-stat-icon">${s.icon}</div>
      <div class="trends-stat-value" style="color:${s.color};">${s.value}</div>
      <div class="trends-stat-label">${s.label}</div>
      <div class="trends-stat-detail">${s.detail}</div>
    </div>
  `).join('');
}

// ─── Breaking Ticker ────────────────────────────────────────────────────────
function renderTrendsBreaking() {
  const card = document.getElementById('trendsBreakingCard');
  if (!card) return;
  const breaking = TREND_ITEMS.filter(t => t.isBreaking);
  if (breaking.length === 0) { card.style.display = 'none'; return; }

  card.innerHTML = `
    <div class="trends-breaking-header">
      <span class="trends-breaking-label">
        <span class="trends-breaking-dot"></span>
        Breaking Trends
      </span>
      <span class="trends-breaking-count">${breaking.length} signals</span>
    </div>
    <div class="trends-breaking-strip">
      ${breaking.map(t => {
        const src = TREND_SOURCES.find(s => s.id === t.source);
        const yearColor = t.year === 2026 ? '#43B02A' : t.year === 2027 ? '#f59e0b' : '#8b5cf6';
        return `
        <div class="trends-breaking-item" style="border-top: 3px solid ${yearColor};">
          <div class="trends-breaking-item-top">
            <span class="trend-source-badge" style="background:${yearColor}15;color:${yearColor};border:1px solid ${yearColor}33;">${src ? src.name : t.source}</span>
            <span class="trend-year-pill" style="background:${yearColor};color:#fff;">${t.year}</span>
          </div>
          <div class="trends-breaking-item-title">${t.title}</div>
          <div class="trends-breaking-item-summary">${t.summary.substring(0, 120)}…</div>
          <div class="trends-breaking-item-rel">
            <span class="trends-breaking-rel-label">Crocs Relevance</span>
            <span class="trends-breaking-rel-score" style="color:${yearColor};">${t.crocsRelevance}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// ─── Source Pills ───────────────────────────────────────────────────────────
function renderSourcePills() {
  const container = document.getElementById('trendsSourcePills');
  if (!container) return;
  container.innerHTML = `
    <button class="trends-filter-pill ${_trendsSourceFilter === 'all' ? 'active' : ''}" onclick="setTrendsSourceFilter('all')">All</button>
    ${TREND_SOURCES.map(s => `
      <button class="trends-filter-pill ${_trendsSourceFilter === s.id ? 'active' : ''}" onclick="setTrendsSourceFilter('${s.id}')">${s.name}</button>
    `).join('')}
  `;
}

// ─── Category Pills ─────────────────────────────────────────────────────────
function renderCatPills() {
  const container = document.getElementById('trendsCatPills');
  if (!container) return;
  const cats = [...new Set(TREND_ITEMS.map(t => t.category))].sort();
  container.innerHTML = `
    <button class="trends-filter-pill ${_trendsCatFilter === 'all' ? 'active' : ''}" onclick="setTrendsCatFilter('all')">All</button>
    ${cats.map(c => `
      <button class="trends-filter-pill ${_trendsCatFilter === c ? 'active' : ''}" onclick="setTrendsCatFilter('${c}')">${c}</button>
    `).join('')}
  `;
}

// ─── Filter & Sort Handlers ─────────────────────────────────────────────────
function setTrendsYearFilter(year) {
  _trendsYearFilter = year;
  document.querySelectorAll('.trends-year-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.year === year);
  });
  renderTrendsFeed();
}

function setTrendsSourceFilter(source) {
  _trendsSourceFilter = source;
  renderSourcePills();
  renderTrendsFeed();
}

function setTrendsCatFilter(cat) {
  _trendsCatFilter = cat;
  renderCatPills();
  renderTrendsFeed();
}

function sortTrendsFeed() {
  _trendsSortBy = document.getElementById('trendsSortSelect').value;
  renderTrendsFeed();
}

// ─── Main Feed Renderer ──────────────────────────────────────────────────────
function renderTrendsFeed() {
  const grid = document.getElementById('trendsFeedGrid');
  const subtitle = document.getElementById('trendsFeedSubtitle');
  if (!grid) return;

  let items = [...TREND_ITEMS];

  // Apply filters
  if (_trendsYearFilter !== 'all') {
    items = items.filter(t => t.year === parseInt(_trendsYearFilter));
  }
  if (_trendsSourceFilter !== 'all') {
    items = items.filter(t => t.source === _trendsSourceFilter);
  }
  if (_trendsCatFilter !== 'all') {
    items = items.filter(t => t.category === _trendsCatFilter);
  }

  // Sort
  switch (_trendsSortBy) {
    case 'trend-strength':
      items.sort((a, b) => b.trendStrength - a.trendStrength);
      break;
    case 'year':
      items.sort((a, b) => a.year - b.year || b.crocsRelevance - a.crocsRelevance);
      break;
    case 'source':
      items.sort((a, b) => a.source.localeCompare(b.source) || b.crocsRelevance - a.crocsRelevance);
      break;
    default:
      items.sort((a, b) => b.crocsRelevance - a.crocsRelevance);
  }

  // Fresh items bubble to top
  const fresh = items.filter(t => _freshItemIds.has(t.id));
  const rest = items.filter(t => !_freshItemIds.has(t.id));
  items = [...fresh, ...rest];

  // Update subtitle
  const yearLabel = _trendsYearFilter === 'all' ? 'all years' : _trendsYearFilter;
  const sourceLabel = _trendsSourceFilter === 'all' ? 'all sources' : (TREND_SOURCES.find(s => s.id === _trendsSourceFilter)?.name || _trendsSourceFilter);
  const sortLabel = { relevance: 'Crocs relevance', 'trend-strength': 'trend strength', year: 'forecast year', source: 'source' }[_trendsSortBy] || _trendsSortBy;
  if (subtitle) subtitle.textContent = `Showing ${items.length} trend${items.length !== 1 ? 's' : ''} · ${yearLabel} · ${sourceLabel} · sorted by ${sortLabel}`;

  if (items.length === 0) {
    grid.innerHTML = `<div class="trends-empty">No trends match the current filters. <button onclick="resetTrendsFilters()">Reset filters</button></div>`;
    return;
  }

  grid.innerHTML = items.map(t => renderTrendCard(t)).join('');
}

function resetTrendsFilters() {
  _trendsYearFilter = 'all';
  _trendsSourceFilter = 'all';
  _trendsCatFilter = 'all';
  document.querySelectorAll('.trends-year-pill').forEach(b => b.classList.toggle('active', b.dataset.year === 'all'));
  renderSourcePills();
  renderCatPills();
  renderTrendsFeed();
}

// ─── Individual Trend Card ───────────────────────────────────────────────────
function renderTrendCard(t) {
  const src = TREND_SOURCES.find(s => s.id === t.source);
  const yearColor = t.year === 2026 ? '#43B02A' : t.year === 2027 ? '#f59e0b' : '#8b5cf6';
  const isFresh = _freshItemIds.has(t.id);

  const relColor = t.crocsRelevance >= 85 ? '#43B02A' : t.crocsRelevance >= 70 ? '#f59e0b' : '#6b7280';
  const tsColor = t.trendStrength >= 85 ? '#43B02A' : t.trendStrength >= 70 ? '#f59e0b' : '#6b7280';

  const publishDate = new Date(t.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `
    <div class="trend-card ${isFresh ? 'trend-card-fresh' : ''}">
      <div class="trend-card-header">
        <div class="trend-card-badges">
          <span class="trend-source-badge" style="background:#43B02A;color:#fff;">${src ? src.name : t.source}</span>
          <span class="trend-year-pill" style="background:${yearColor};color:#fff;">${t.year}</span>
          <span class="trend-cat-badge">${t.category}</span>
          ${t.isBreaking ? '<span class="trend-breaking-badge">BREAKING</span>' : ''}
          ${isFresh ? '<span class="trend-new-badge">NEW</span>' : ''}
        </div>
      </div>
      <div class="trend-card-title">${t.title}</div>
      <div class="trend-card-summary">${t.summary}</div>
      <div class="trend-crocs-angle">
        <div class="trend-crocs-angle-label">Why it matters for Crocs</div>
        <div class="trend-crocs-angle-text">${t.crocsAngle}</div>
      </div>
      <div class="trend-scores-block">
        <div class="trend-score-row">
          <span class="trend-score-label">Crocs Relevance</span>
          <div class="trend-score-bar-wrap">
            <div class="trend-score-bar-fill" style="width:${t.crocsRelevance}%;background:${relColor};"></div>
          </div>
          <span class="trend-score-num" style="color:${relColor};">${t.crocsRelevance}</span>
        </div>
        <div class="trend-score-row">
          <span class="trend-score-label">Trend Strength</span>
          <div class="trend-score-bar-wrap">
            <div class="trend-score-bar-fill" style="width:${t.trendStrength}%;background:${tsColor};"></div>
          </div>
          <span class="trend-score-num" style="color:${tsColor};">${t.trendStrength}</span>
        </div>
      </div>
      <div class="trend-card-tags">
        ${t.tags.map(tag => `<span class="trend-tag">#${tag}</span>`).join('')}
      </div>
      <div class="trend-card-footer">
        <a href="${t.reportUrl}" target="_blank" rel="noopener" class="trend-report-link">
          <span class="trend-report-source">${src ? src.name : t.source}</span>
          <span class="trend-report-sep">·</span>
          <span class="trend-report-title">${t.reportTitle}</span>
          <span class="trend-report-arrow">→</span>
        </a>
        <span class="trend-card-date">${publishDate}</span>
      </div>
    </div>
  `;
}

// ─── Source Directory Grid ───────────────────────────────────────────────────
function renderSourcesGrid() {
  const container = document.getElementById('trendsSourcesGrid');
  if (!container) return;
  const typeColors = {
    'trend-forecasting': { bg: '#e5f5e0', color: '#006A4E', label: 'Trend Forecasting' },
    'consulting': { bg: '#eff6ff', color: '#1d4ed8', label: 'Consulting' },
    'analytics': { bg: '#fdf4ff', color: '#7e22ce', label: 'Analytics' },
    'research': { bg: '#fff7ed', color: '#c2410c', label: 'Research' },
  };
  const tierLabel = { 1: 'Tier 1', 2: 'Tier 2' };

  container.innerHTML = TREND_SOURCES.map(s => {
    const tc = typeColors[s.type] || { bg: '#f3f4f6', color: '#374151', label: s.type };
    const itemCount = TREND_ITEMS.filter(t => t.source === s.id).length;
    return `
      <div class="trends-source-card">
        <div class="trends-source-card-top">
          <div class="trends-source-name">${s.name}</div>
          <div class="trends-source-meta">
            <span class="trends-source-type-badge" style="background:${tc.bg};color:${tc.color};">${tc.label}</span>
            <span class="trends-source-tier">${tierLabel[s.tier] || 'Tier ' + s.tier}</span>
          </div>
        </div>
        <div class="trends-source-desc">${s.description}</div>
        <div class="trends-source-card-footer">
          <span class="trends-source-count">${itemCount} trend${itemCount !== 1 ? 's' : ''} tracked</span>
          <a href="${s.url}" target="_blank" rel="noopener" class="trends-source-link">View Reports →</a>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Live Feed Simulation ────────────────────────────────────────────────────
function startLiveFeed() {
  stopLiveFeed();
  _trendsLiveInterval = setInterval(() => {
    // Cycle through items
    const item = TREND_ITEMS[_trendsFeedIndex % TREND_ITEMS.length];
    _trendsFeedIndex++;

    // Mark as fresh (only keep last 3 fresh)
    _freshItemIds.add(item.id);
    if (_freshItemIds.size > 3) {
      const firstKey = _freshItemIds.values().next().value;
      _freshItemIds.delete(firstKey);
    }

    _trendsLastUpdated = new Date();
    renderTrendsLiveBanner();
    renderTrendsFeed();

    // Auto-clear the NEW badge after 30 seconds
    setTimeout(() => {
      _freshItemIds.delete(item.id);
    }, 30000);
  }, 45000);
}

function stopLiveFeed() {
  if (_trendsLiveInterval) {
    clearInterval(_trendsLiveInterval);
    _trendsLiveInterval = null;
  }
}
