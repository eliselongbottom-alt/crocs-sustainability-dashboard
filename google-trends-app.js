// Google Trends Tab — Application Logic

let _gtMarket = 'United States';
let _gtTimeframe = '90d';
let _gtChartInstance = null;
let _gtUploadedData = null; // overrides GTRENDS_DATA when an Excel is uploaded

function initGoogleTrends() {
  renderGtSummaryTable();
  renderGtMarketTabs();
  renderGtMarketView();
  renderGtMetaBanner();
  initGtExcelUpload();
}

// ─── Data accessor ────────────────────────────────────────────────────────────
function _gtData() {
  const src = _gtUploadedData || GTRENDS_DATA;
  return src[_gtMarket]?.[_gtTimeframe] || {};
}

// ─── Meta banner ─────────────────────────────────────────────────────────────
function renderGtMetaBanner() {
  const el = document.getElementById('gtMetaBanner');
  if (!el) return;
  const ts = new Date(GTRENDS_META.pulledAt);
  const label = ts.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
  el.innerHTML = `
    <span style="font-size:1.05rem;flex-shrink:0;">📊</span>
    <div>
      <strong>Google Trends — "${GTRENDS_META.keyword}"</strong> &nbsp;&bull;&nbsp;
      Snapshot pulled: <strong>${label}</strong> &nbsp;&bull;&nbsp;
      ${GTRENDS_META.note}
      &nbsp;&bull;&nbsp; <button class="gt-upload-btn" onclick="document.getElementById('gtExcelInput').click()">Upload new Excel snapshot</button>
    </div>
  `;
}

// ─── Summary Table ────────────────────────────────────────────────────────────
function renderGtSummaryTable() {
  const tbody = document.getElementById('gtSummaryBody');
  if (!tbody) return;
  const rows = getGtrendsSummary();
  tbody.innerHTML = rows.map(r => {
    if (r.blocked) {
      return `
        <tr>
          <td><strong>${r.market}</strong> <span class="gt-geo-tag">${r.geo}</span></td>
          <td colspan="8" style="color:#9ca3af;font-style:italic;text-align:center;">Google not available in market</td>
        </tr>`;
    }
    const breakoutBadge = n => n > 0 ? `<span class="gt-breakout-badge">${n} Breakout</span>` : `<span style="color:#9ca3af;">—</span>`;
    const risingBadge = n => n > 0 ? `<span class="gt-rising-badge">${n} Rising</span>` : `<span style="color:#9ca3af;">—</span>`;
    const bar = v => v != null
      ? `<div class="gt-summary-bar-wrap"><div class="gt-summary-bar-fill" style="width:${v}%;"></div><span class="gt-summary-bar-val">${v}</span></div>`
      : `<span style="color:#9ca3af;">—</span>`;
    return `
      <tr class="gt-summary-row" onclick="selectGtMarket('${r.market}')" title="Click to view ${r.market}">
        <td><strong>${r.market}</strong> <span class="gt-geo-tag">${r.geo}</span></td>
        <td>${bar(r.avg90d)}</td>
        <td>${r.peak90d ?? '—'}</td>
        <td>${risingBadge(r.rising90d)}</td>
        <td>${breakoutBadge(r.breakout90d)}</td>
        <td>${bar(r.avg30d)}</td>
        <td>${r.peak30d ?? '—'}</td>
        <td>${risingBadge(r.rising30d)}</td>
        <td>${breakoutBadge(r.breakout30d)}</td>
      </tr>`;
  }).join('');
}

// ─── Market Tabs ─────────────────────────────────────────────────────────────
function renderGtMarketTabs() {
  const container = document.getElementById('gtMarketTabs');
  if (!container) return;
  container.innerHTML = GTRENDS_MARKETS.map(m => {
    const mdata = ((_gtUploadedData || GTRENDS_DATA)[m] || {});
    const blocked = mdata['90d']?.blocked;
    return `
      <button class="gt-market-tab ${m === _gtMarket ? 'active' : ''} ${blocked ? 'gt-market-tab-blocked' : ''}"
              onclick="selectGtMarket('${m}')">
        ${m}${blocked ? ' <span class="gt-blocked-dot">✕</span>' : ''}
      </button>`;
  }).join('');
}

function selectGtMarket(market) {
  _gtMarket = market;
  renderGtMarketTabs();
  renderGtMarketView();
}

// ─── Timeframe Toggle ─────────────────────────────────────────────────────────
function setGtTimeframe(tf) {
  _gtTimeframe = tf;
  document.querySelectorAll('.gt-tf-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tf === tf);
  });
  renderGtMarketView();
}

// ─── Full Market View ─────────────────────────────────────────────────────────
function renderGtMarketView() {
  const d = _gtData();
  const mdata = (_gtUploadedData || GTRENDS_DATA)[_gtMarket] || {};
  const header = document.getElementById('gtMarketHeader');
  if (header) {
    header.textContent = `${_gtMarket} — ${_gtTimeframe === '90d' ? 'Last 90 Days' : 'Last 30 Days'}`;
  }

  if (d.blocked) {
    document.getElementById('gtMarketContent').innerHTML = `
      <div class="gt-blocked-notice">
        <div class="gt-blocked-icon">🚫</div>
        <div class="gt-blocked-text">${d.blockedNote || 'Data unavailable for this market.'}</div>
      </div>`;
    if (_gtChartInstance) { _gtChartInstance.destroy(); _gtChartInstance = null; }
    return;
  }

  document.getElementById('gtMarketContent').innerHTML = `
    <div class="gt-kpi-row">
      <div class="gt-kpi-card">
        <div class="gt-kpi-label">Avg Interest</div>
        <div class="gt-kpi-value">${d.avgInterest ?? '—'}<span class="gt-kpi-unit">/100</span></div>
      </div>
      <div class="gt-kpi-card">
        <div class="gt-kpi-label">Peak Interest</div>
        <div class="gt-kpi-value">${d.peakInterest ?? '—'}<span class="gt-kpi-unit">/100</span></div>
      </div>
      <div class="gt-kpi-card">
        <div class="gt-kpi-label">Rising Terms</div>
        <div class="gt-kpi-value" style="color:#f59e0b;">${(d.risingQueries || []).filter(q => q.type === 'rising').length}</div>
      </div>
      <div class="gt-kpi-card">
        <div class="gt-kpi-label">Breakout Terms</div>
        <div class="gt-kpi-value" style="color:#ef4444;">${(d.risingQueries || []).filter(q => q.type === 'breakout').length}</div>
      </div>
    </div>
    <div class="gt-chart-section">
      <div class="card chart-card" style="flex:1;min-width:0;">
        <h4>Interest Over Time</h4>
        <canvas id="gtInterestChart" height="90"></canvas>
      </div>
      <div class="card gt-queries-card" style="flex:1;min-width:0;">
        <h4>Top Related Queries</h4>
        <div id="gtTopQueries"></div>
      </div>
    </div>
    <div class="card" style="margin-top:1rem;">
      <h4>Rising &amp; Breakout Queries</h4>
      <p class="actions-subtitle">"Breakout" = &gt;5000% growth flagged by Google. Otherwise % is rise vs prior period.</p>
      <div id="gtRisingQueries"></div>
    </div>
  `;

  renderGtInterestChart(d);
  renderGtTopQueries(d);
  renderGtRisingQueries(d);
}

// ─── Interest Over Time Chart ─────────────────────────────────────────────────
function renderGtInterestChart(d) {
  const ctx = document.getElementById('gtInterestChart');
  if (!ctx) return;
  if (_gtChartInstance) { _gtChartInstance.destroy(); _gtChartInstance = null; }

  if (!d.interestOverTime || d.interestOverTime.length === 0) {
    ctx.parentElement.innerHTML += '<p style="color:#9ca3af;text-align:center;padding:2rem 0;">No interest-over-time data available.</p>';
    return;
  }

  const labels = d.interestOverTime.map(p => {
    const dt = new Date(p.date);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const values = d.interestOverTime.map(p => p.value);

  _gtChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Search Interest',
        data: values,
        borderColor: '#43B02A',
        backgroundColor: 'rgba(67,176,42,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` Interest: ${ctx.raw}` } },
      },
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: 'Interest (0–100)' } },
        x: { ticks: { maxTicksLimit: 8, font: { size: 10 } } },
      },
    },
  });
}

// ─── Top Queries ──────────────────────────────────────────────────────────────
function renderGtTopQueries(d) {
  const container = document.getElementById('gtTopQueries');
  if (!container) return;
  const queries = d.topQueries || [];
  if (queries.length === 0) {
    container.innerHTML = '<p style="color:#9ca3af;">No top query data available.</p>';
    return;
  }
  container.innerHTML = queries.map((q, i) => `
    <div class="gt-query-row">
      <span class="gt-query-rank">${i + 1}</span>
      <span class="gt-query-term">${q.term}</span>
      <div class="gt-query-bar-wrap">
        <div class="gt-query-bar-fill" style="width:${q.score}%;"></div>
      </div>
      <span class="gt-query-score">${q.score}</span>
    </div>
  `).join('');
}

// ─── Rising / Breakout Queries ────────────────────────────────────────────────
function renderGtRisingQueries(d) {
  const container = document.getElementById('gtRisingQueries');
  if (!container) return;
  const queries = d.risingQueries || [];
  if (queries.length === 0) {
    container.innerHTML = '<p style="color:#9ca3af;">No rising query data available for this period.</p>';
    return;
  }
  container.innerHTML = `
    <div class="gt-rising-grid">
      ${queries.map(q => `
        <div class="gt-rising-item ${q.type === 'breakout' ? 'gt-rising-breakout' : 'gt-rising-up'}">
          <span class="gt-rising-term">${q.term}</span>
          <span class="gt-rising-growth ${q.type === 'breakout' ? 'gt-badge-breakout' : 'gt-badge-rising'}">
            ${q.growth}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Excel Upload ─────────────────────────────────────────────────────────────
function initGtExcelUpload() {
  const dropzone = document.getElementById('gtDropzone');
  const input = document.getElementById('gtExcelInput');
  if (!dropzone || !input) return;

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('gt-dropzone-hover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('gt-dropzone-hover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('gt-dropzone-hover');
    const file = e.dataTransfer.files[0];
    if (file) handleGtExcelFile(file);
  });
  dropzone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    if (input.files[0]) handleGtExcelFile(input.files[0]);
  });
}

function handleGtExcelFile(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    alert('Please upload an .xlsx or .xls file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      if (typeof XLSX === 'undefined') {
        showGtUploadError('Excel parsing library not loaded. Please refresh the page.');
        return;
      }
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      const parsed = parseGtExcel(wb);
      if (parsed) {
        _gtUploadedData = parsed.data;
        GTRENDS_META.pulledAt = parsed.pulledAt;
        GTRENDS_META.keyword = parsed.keyword || 'Crocs';
        showGtUploadSuccess(file.name);
        renderGtMetaBanner();
        renderGtSummaryTable();
        renderGtMarketTabs();
        renderGtMarketView();
      }
    } catch (err) {
      showGtUploadError('Could not parse the Excel file: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseGtExcel(wb) {
  // Parses the boss's Excel format into GTRENDS_DATA structure
  const result = {};
  let pulledAt = new Date().toISOString();
  let keyword = 'Crocs';

  // Read Summary sheet for metadata
  const summarySheet = wb.Sheets['Summary'];
  if (summarySheet) {
    const rows = XLSX.utils.sheet_to_json(summarySheet, { header: 1, defval: null });
    for (const row of rows.slice(0, 5)) {
      if (row[0] && typeof row[0] === 'string' && row[0].includes('Pulled:')) {
        const match = row[0].match(/Pulled:\s*([^\|]+)/);
        if (match) {
          const parsed = new Date(match[1].trim());
          if (!isNaN(parsed)) pulledAt = parsed.toISOString();
        }
        const kwMatch = row[0].match(/Keyword:\s*([^\s,]+)/);
        if (kwMatch) keyword = kwMatch[1];
      }
    }
  }

  // Parse each market sheet
  const marketNames = GTRENDS_MARKETS;
  for (const market of marketNames) {
    const sheet = wb.Sheets[market];
    if (!sheet) {
      result[market] = GTRENDS_DATA[market]; // fallback to built-in
      continue;
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const geo = (() => {
      for (const r of rows.slice(0, 4)) {
        if (r[0] && typeof r[0] === 'string' && r[0].startsWith('Geo:')) return r[0].replace('Geo:', '').trim();
      }
      return GTRENDS_DATA[market]?.geo || '??';
    })();

    const parsed90 = _parseMarketTimeframe(rows, '90D');
    const parsed30 = _parseMarketTimeframe(rows, '30D');
    result[market] = { geo, '90d': parsed90, '30d': parsed30 };
  }

  return { data: result, pulledAt, keyword };
}

function _parseMarketTimeframe(rows, prefix) {
  // Find section headers for this timeframe
  let iotStart = -1, topStart = -1, risingStart = -1;
  let iotCol = 0, topCol = 0, risingCol = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let c = 0; c < (row || []).length; c++) {
      const cell = row[c];
      if (typeof cell === 'string') {
        if (cell.includes(prefix + ' — Interest over time')) { iotStart = i + 1; iotCol = c; }
        else if (cell.includes(prefix + ' — Top related queries')) { topStart = i + 1; topCol = c; }
        else if (cell.includes(prefix + ' — Rising / Breakout queries')) { risingStart = i + 1; risingCol = c; }
      }
    }
  }

  const readSection = (startRow, col, maxRows = 20) => {
    const out = [];
    for (let i = startRow + 1; i < Math.min(startRow + maxRows, rows.length); i++) {
      const row = rows[i];
      if (!row || !row[col]) break;
      const a = row[col], b = row[col + 1];
      if (a === '(none)' || a === '(no data)' || a === null) break;
      out.push([a, b]);
    }
    return out;
  };

  // Interest over time
  const iotRaw = readSection(iotStart, iotCol, 100);
  const interestOverTime = iotRaw.map(([date, val]) => ({
    date: date instanceof Date ? date.toISOString().slice(0, 10) : String(date),
    value: typeof val === 'number' ? Math.round(val) : null,
  })).filter(p => p.value !== null);

  // Top queries
  const topRaw = readSection(topStart, topCol, 20);
  const topQueries = topRaw.map(([term, score]) => ({
    term: String(term),
    score: typeof score === 'number' ? Math.round(score) : (score === 'Breakout' ? 999 : 0),
  })).filter(q => q.term && q.score > 0);

  // Rising queries
  const risingRaw = readSection(risingStart, risingCol, 20);
  const risingQueries = risingRaw.map(([term, growth]) => ({
    term: String(term),
    growth: String(growth || ''),
    type: String(growth || '').toLowerCase() === 'breakout' ? 'breakout' : 'rising',
  })).filter(q => q.term);

  const vals = interestOverTime.map(p => p.value).filter(v => v != null);
  const avgInterest = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  const peakInterest = vals.length ? Math.max(...vals) : null;

  return { avgInterest, peakInterest, interestOverTime, topQueries, risingQueries };
}

function showGtUploadSuccess(filename) {
  const banner = document.getElementById('gtUploadStatus');
  if (!banner) return;
  banner.innerHTML = `<span style="color:#15803d;">✓ Loaded: <strong>${filename}</strong> — dashboard updated with your latest data.</span>`;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 6000);
}

function showGtUploadError(msg) {
  const banner = document.getElementById('gtUploadStatus');
  if (!banner) return;
  banner.innerHTML = `<span style="color:#dc2626;">✗ ${msg}</span>`;
  banner.style.display = 'block';
}
