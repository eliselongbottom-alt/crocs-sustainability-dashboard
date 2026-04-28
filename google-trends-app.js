// Google Trends — Cultural Pulse Dashboard
// Shows what people are generally searching for across key markets,
// not brand-specific — used to spot cultural moments for Crocs to activate on.

let _gtMarket = 'United States';
let _gtCatFilter = 'all';
let _gtCategoryChartInstance = null;
let _gtUploadedData = null;

function initGoogleTrends() {
  renderGtMetaBanner();
  renderGtGlobalMoments();
  renderGtMarketTabs();
  renderGtMarketView();
  initGtExcelUpload();
}

// ─── Data accessor ────────────────────────────────────────────────────────────
function _gtSrc() { return _gtUploadedData || GTRENDS_TRENDING; }
function _gtMarketData() { return _gtSrc()[_gtMarket] || {}; }

// ─── Meta Banner ─────────────────────────────────────────────────────────────
function renderGtMetaBanner() {
  const el = document.getElementById('gtMetaBanner');
  if (!el) return;
  const ts = new Date(GTRENDS_META.pulledAt);
  const label = ts.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const sampleBadge = GTRENDS_META.sampleData
    ? `<span style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:8px;">SAMPLE DATA</span>`
    : `<span style="background:#f0fdf4;border:1px solid #86efac;color:#166534;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:8px;">LIVE DATA</span>`;
  el.innerHTML = `
    <span style="font-size:1.1rem;flex-shrink:0;">🌍</span>
    <div style="flex:1;">
      <strong>Cultural Pulse — What people are searching for</strong> ${sampleBadge}
      <span style="color:#6b7280;margin:0 6px;">·</span>
      Snapshot: <strong>${label}</strong>
      <span style="color:#6b7280;margin:0 6px;">·</span>
      ${GTRENDS_META.note}
    </div>
    <button class="gt-upload-btn" onclick="document.getElementById('gtExcelInput').click()">↑ Upload snapshot</button>
  `;
}

// ─── Global Moments Strip ─────────────────────────────────────────────────────
function renderGtGlobalMoments() {
  const el = document.getElementById('gtGlobalMoments');
  if (!el) return;

  const urgencyConfig = {
    'Act Now':  { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', dot: '#dc2626' },
    'Plan Now': { bg: '#fefce8', border: '#fde68a', text: '#ca8a04', dot: '#f59e0b' },
    'Sustain':  { bg: '#f0fdf4', border: '#86efac', text: '#166534', dot: '#43B02A' },
  };

  el.innerHTML = GTRENDS_GLOBAL_MOMENTS.map(m => {
    const uc = urgencyConfig[m.urgency] || urgencyConfig['Sustain'];
    const cc = GT_CAT_COLORS[m.category] || { bg: '#f3f4f6', text: '#374151', bar: '#9ca3af' };
    return `
      <div class="gt-moment-card" style="border-top:3px solid ${uc.dot};">
        <div class="gt-moment-top">
          <span class="gt-moment-cat" style="background:${cc.bg};color:${cc.text};">${m.category}</span>
          <span class="gt-moment-urgency" style="background:${uc.bg};color:${uc.text};border:1px solid ${uc.border};">
            <span style="width:6px;height:6px;border-radius:50%;background:${uc.dot};display:inline-block;margin-right:4px;"></span>${m.urgency}
          </span>
        </div>
        <div class="gt-moment-theme">${m.theme}</div>
        <div class="gt-moment-markets">${m.markets.map(mk => `<span class="gt-moment-market-tag">${mk}</span>`).join('')}</div>
        <div class="gt-moment-summary">${m.summary}</div>
        <div class="gt-moment-angle">
          <span class="gt-moment-angle-label">Crocs angle</span>
          <span class="gt-moment-angle-text">${m.crocsAngle}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Market Tabs ─────────────────────────────────────────────────────────────
function renderGtMarketTabs() {
  const container = document.getElementById('gtMarketTabs');
  if (!container) return;
  container.innerHTML = GTRENDS_MARKETS.map(m => {
    const mdata = _gtSrc()[m] || {};
    const blocked = mdata.blocked;
    return `
      <button class="gt-market-tab ${m === _gtMarket ? 'active' : ''} ${blocked ? 'gt-market-tab-blocked' : ''}"
              onclick="selectGtMarket('${m}')">
        ${m}${blocked ? ' <span style="font-size:0.65rem;opacity:0.7;">✕</span>' : ''}
      </button>`;
  }).join('');
}

function selectGtMarket(market) {
  _gtMarket = market;
  _gtCatFilter = 'all';
  renderGtMarketTabs();
  renderGtMarketView();
}

// ─── Market View ──────────────────────────────────────────────────────────────
function renderGtMarketView() {
  const mdata = _gtMarketData();

  // Update header
  const header = document.getElementById('gtMarketHeader');
  if (header) header.textContent = `${_gtMarket} — What's Trending`;

  const content = document.getElementById('gtMarketContent');
  if (!content) return;

  if (mdata.blocked) {
    content.innerHTML = `
      <div class="gt-blocked-notice">
        <div class="gt-blocked-icon">🚫</div>
        <div class="gt-blocked-text">${mdata.blockedNote || 'Data unavailable.'}</div>
        ${mdata.alternativeSources ? `
          <div class="gt-alt-sources">
            <div class="gt-alt-sources-label">Alternative sources for China market intelligence:</div>
            ${mdata.alternativeSources.map(s => `
              <a href="${s.url}" target="_blank" rel="noopener" class="gt-alt-source-card">
                <strong>${s.name}</strong><br><span>${s.note}</span>
              </a>
            `).join('')}
          </div>` : ''}
      </div>`;
    return;
  }

  const trending = mdata.dailyTrending || [];
  const cats = [...new Set(trending.map(t => t.category))].sort();
  const withAngle = trending.filter(t => t.crocsAngle);

  content.innerHTML = `
    <div class="gt-market-stats">
      <div class="gt-stat-pill"><span class="gt-stat-num">${trending.length}</span><span class="gt-stat-lbl">Trending Topics</span></div>
      <div class="gt-stat-pill"><span class="gt-stat-num" style="color:#43B02A;">${withAngle.length}</span><span class="gt-stat-lbl">Crocs Opportunities</span></div>
      <div class="gt-stat-pill"><span class="gt-stat-num" style="color:#ef4444;">${trending.filter(t=>t.momentum==='breakout').length}</span><span class="gt-stat-lbl">Breakout Trends</span></div>
      <div class="gt-stat-pill"><span class="gt-stat-num" style="color:#8b5cf6;">${cats.length}</span><span class="gt-stat-lbl">Categories</span></div>
    </div>

    <div class="gt-market-body">
      <!-- Trend Rankings -->
      <div class="gt-rankings-col">
        <div class="gt-rankings-header">
          <h4>Trending Searches</h4>
          <div class="gt-cat-filter-row">
            <button class="gt-cat-pill ${_gtCatFilter==='all'?'active':''}" onclick="setGtCatFilter('all')">All</button>
            ${cats.map(c => {
              const cc = GT_CAT_COLORS[c] || {};
              return `<button class="gt-cat-pill ${_gtCatFilter===c?'active':''}"
                style="${_gtCatFilter===c ? `background:${cc.bar||'#43B02A'};color:#fff;border-color:${cc.bar||'#43B02A'};` : ''}"
                onclick="setGtCatFilter('${c}')">${c}</button>`;
            }).join('')}
          </div>
        </div>
        <div id="gtRankingsList"></div>
      </div>

      <!-- Category Chart -->
      <div class="gt-chart-col">
        <div class="card chart-card" style="height:fit-content;">
          <h4>Category Breakdown</h4>
          <p class="actions-subtitle">Share of trending topics by category</p>
          <canvas id="gtCategoryChart" height="220"></canvas>
        </div>
        <div class="card" style="margin-top:1rem;">
          <h4>Crocs Opportunities <span style="font-size:0.75rem;font-weight:400;color:#6b7280;">— topics with an activation angle</span></h4>
          <div id="gtOpportunityList"></div>
        </div>
      </div>
    </div>
  `;

  renderGtRankings(trending);
  renderGtCategoryChart(mdata.categoryBreakdown || {});
  renderGtOpportunities(withAngle);
}

// ─── Category Filter ──────────────────────────────────────────────────────────
function setGtCatFilter(cat) {
  _gtCatFilter = cat;
  const mdata = _gtMarketData();
  renderGtMarketView();
}

// ─── Rankings List ────────────────────────────────────────────────────────────
function renderGtRankings(trending) {
  const container = document.getElementById('gtRankingsList');
  if (!container) return;

  const filtered = _gtCatFilter === 'all' ? trending : trending.filter(t => t.category === _gtCatFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:#9ca3af;padding:1rem 0;">No trends in this category.</p>`;
    return;
  }

  container.innerHTML = filtered.map(t => {
    const cc = GT_CAT_COLORS[t.category] || { bg: '#f3f4f6', text: '#374151', bar: '#9ca3af' };
    const momentumIcon = t.momentum === 'breakout' ? '🔥' : t.momentum === 'up' ? '↑' : '→';
    const momentumColor = t.momentum === 'breakout' ? '#dc2626' : t.momentum === 'up' ? '#43B02A' : '#9ca3af';
    const hasAngle = !!t.crocsAngle;

    return `
      <div class="gt-rank-row ${hasAngle ? 'gt-rank-row-opportunity' : ''}">
        <div class="gt-rank-num">${t.rank}</div>
        <div class="gt-rank-body">
          <div class="gt-rank-top">
            <span class="gt-rank-term">${t.term}</span>
            <span class="gt-rank-momentum" style="color:${momentumColor};">${momentumIcon} ${t.momentum === 'breakout' ? 'BREAKOUT' : t.momentum === 'up' ? 'Rising' : 'Stable'}</span>
          </div>
          <div class="gt-rank-meta">
            <span class="gt-rank-vol">${t.searchVolume}</span>
            <span class="gt-rank-cat" style="background:${cc.bg};color:${cc.text};">${t.category}</span>
            ${hasAngle ? `<span class="gt-rank-crocs-badge">Crocs opportunity →</span>` : ''}
          </div>
          ${t.relatedTerms && t.relatedTerms.length ? `
            <div class="gt-rank-related">${t.relatedTerms.slice(0, 3).map(r => `<span class="gt-related-tag">${r}</span>`).join('')}</div>
          ` : ''}
          ${hasAngle ? `<div class="gt-rank-angle">${t.crocsAngle}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ─── Category Donut Chart ─────────────────────────────────────────────────────
function renderGtCategoryChart(breakdown) {
  const ctx = document.getElementById('gtCategoryChart');
  if (!ctx) return;
  if (_gtCategoryChartInstance) { _gtCategoryChartInstance.destroy(); _gtCategoryChartInstance = null; }

  const cats = Object.keys(breakdown);
  const vals = Object.values(breakdown);
  const colors = cats.map(c => (GT_CAT_COLORS[c] || { bar: '#9ca3af' }).bar);

  _gtCategoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: vals, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 5 }],
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { position: 'right', labels: { usePointStyle: true, padding: 10, font: { size: 10 }, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}% of trending` } },
      },
    },
  });
}

// ─── Opportunities Panel ──────────────────────────────────────────────────────
function renderGtOpportunities(items) {
  const container = document.getElementById('gtOpportunityList');
  if (!container) return;
  if (items.length === 0) {
    container.innerHTML = `<p style="color:#9ca3af;font-size:0.82rem;">No specific Crocs angles identified for this market's current trends.</p>`;
    return;
  }
  container.innerHTML = items.map(t => {
    const cc = GT_CAT_COLORS[t.category] || { bg: '#f3f4f6', text: '#374151' };
    return `
      <div class="gt-opp-row">
        <div class="gt-opp-header">
          <span class="gt-opp-rank">#${t.rank}</span>
          <span class="gt-opp-term">${t.term}</span>
          <span class="gt-opp-cat" style="background:${cc.bg};color:${cc.text};">${t.category}</span>
        </div>
        <div class="gt-opp-angle">${t.crocsAngle}</div>
      </div>
    `;
  }).join('');
}

// ─── Excel Upload ─────────────────────────────────────────────────────────────
function initGtExcelUpload() {
  const dropzone = document.getElementById('gtDropzone');
  const input = document.getElementById('gtExcelInput');
  if (!dropzone || !input) return;

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('gt-dropzone-hover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('gt-dropzone-hover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('gt-dropzone-hover');
    const file = e.dataTransfer.files[0];
    if (file) handleGtExcelFile(file);
  });
  dropzone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files[0]) handleGtExcelFile(input.files[0]); });
}

function handleGtExcelFile(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) { alert('Please upload an .xlsx or .xls file.'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      if (typeof XLSX === 'undefined') { showGtUploadStatus('Excel parser not loaded — refresh and try again.', false); return; }
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      const parsed = parseGtTrendingExcel(wb);
      if (parsed) {
        _gtUploadedData = parsed.data;
        if (parsed.pulledAt) GTRENDS_META.pulledAt = parsed.pulledAt;
        GTRENDS_META.sampleData = false;
        showGtUploadStatus(`Loaded: ${file.name} — dashboard updated.`, true);
        renderGtMetaBanner();
        renderGtMarketTabs();
        renderGtMarketView();
      }
    } catch (err) {
      showGtUploadStatus('Could not parse: ' + err.message, false);
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseGtTrendingExcel(wb) {
  // Parses the boss's Excel format: each market sheet has a trending topics table
  // Expected columns: Rank, Term, Search Volume, Category, Momentum, Related Terms, Crocs Angle
  const result = {};
  let pulledAt = null;

  const summarySheet = wb.Sheets['Summary'] || wb.Sheets[wb.SheetNames[0]];
  if (summarySheet) {
    const rows = XLSX.utils.sheet_to_json(summarySheet, { header: 1, defval: null });
    for (const row of rows.slice(0, 5)) {
      if (row[0] && typeof row[0] === 'string' && row[0].includes('Pulled:')) {
        const match = row[0].match(/Pulled:\s*([^\|]+)/);
        if (match) { const d = new Date(match[1].trim()); if (!isNaN(d)) pulledAt = d.toISOString(); }
      }
    }
  }

  for (const market of GTRENDS_MARKETS) {
    const sheet = wb.Sheets[market];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const geo = GTRENDS_TRENDING[market]?.geo || '??';

    // Find header row
    let headerRow = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i].some(c => typeof c === 'string' && c.toLowerCase().includes('term'))) {
        headerRow = i; break;
      }
    }
    if (headerRow === -1) continue;

    const headers = (rows[headerRow] || []).map(h => (h || '').toLowerCase().trim());
    const colOf = name => headers.findIndex(h => h.includes(name));
    const rankCol = colOf('rank'); const termCol = colOf('term');
    const volCol = colOf('volume'); const catCol = colOf('categor');
    const momCol = colOf('moment'); const relCol = colOf('related');
    const angleCol = colOf('crocs');

    const trending = [];
    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[termCol]) break;
      const term = String(row[termCol] || '');
      if (!term || term === '(none)') break;
      trending.push({
        rank: parseInt(row[rankCol]) || (i - headerRow),
        term,
        searchVolume: String(row[volCol] || ''),
        category: String(row[catCol] || 'Culture'),
        momentum: String(row[momCol] || 'stable').toLowerCase(),
        relatedTerms: relCol >= 0 ? String(row[relCol] || '').split(',').map(s => s.trim()).filter(Boolean) : [],
        crocsAngle: angleCol >= 0 ? String(row[angleCol] || '') : '',
      });
    }

    const catCounts = {};
    trending.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const total = trending.length || 1;
    const catBreakdown = {};
    Object.entries(catCounts).forEach(([k, v]) => { catBreakdown[k] = Math.round((v / total) * 100); });

    result[market] = { geo, dailyTrending: trending, categoryBreakdown: catBreakdown };
  }

  return { data: result, pulledAt };
}

function showGtUploadStatus(msg, success) {
  const el = document.getElementById('gtUploadStatus');
  if (!el) return;
  el.innerHTML = `<span style="color:${success ? '#15803d' : '#dc2626'};">${success ? '✓' : '✗'} ${msg}</span>`;
  el.style.display = 'block';
  if (success) setTimeout(() => { el.style.display = 'none'; }, 6000);
}
