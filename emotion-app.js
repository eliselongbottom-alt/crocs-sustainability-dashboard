// Emotion Intelligence — Application Logic

function initEmotion() {
  renderDataStatusBanner();
  renderEmotionKPIs();
  renderEmotionRadar();
  renderPerceptionGaps();
  renderEmotionTrend();
  renderAudienceEmotionChart();
  renderCompetitorChart();
  renderRiskOpportunityGrid();
  renderMacroSignals();
  renderMessagingResonance();
  renderMethodologyTable();

  const label = document.getElementById('emotionLastUpdated');
  if (label) {
    const d = new Date(EMOTION_LAST_UPDATED);
    label.textContent = 'Data as of ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

// ─── Data Status Banner ──────────────────────────────────────────────────────
function renderDataStatusBanner() {
  const el = document.getElementById('emotionDataStatusBanner');
  if (!el) return;
  const isLive = EMOTION_METHODOLOGY.dataStatus === 'live';
  const color  = isLive ? '#43B02A' : '#f59e0b';
  const icon   = isLive ? '🟢' : '🟡';
  el.innerHTML = `
    <div class="em-status-banner" style="border-color:${color};background:${color}12">
      <span class="em-status-dot" style="background:${color}"></span>
      <strong style="color:${color}">${icon} ${EMOTION_METHODOLOGY.dataStatusLabel}</strong>
      <span class="em-status-note">${EMOTION_METHODOLOGY.dataStatusNote}</span>
    </div>`;
}

// ─── Methodology Table ───────────────────────────────────────────────────────
function renderMethodologyTable() {
  const el = document.getElementById('emotionMethodologyTable');
  if (!el) return;

  el.innerHTML = EMOTION_METHODOLOGY.sections.map(s => `
    <div class="em-method-row">
      <div class="em-method-section">${s.title}</div>
      <div class="em-method-body">
        <div class="em-method-block">
          <span class="em-method-tag em-method-tag-method">Method</span>
          ${s.method}
        </div>
        <div class="em-method-block">
          <span class="em-method-tag em-method-tag-source">Current Source</span>
          ${s.source}
        </div>
        <div class="em-method-block">
          <span class="em-method-tag em-method-tag-prod">In Production</span>
          ${s.production}
        </div>
        <div class="em-method-block">
          <span class="em-method-tag em-method-tag-framework">Framework</span>
          ${s.framework}
        </div>
      </div>
    </div>
  `).join('');
}

// ─── KPI Row ────────────────────────────────────────────────────────────────
function renderEmotionKPIs() {
  const container = document.getElementById('emotionKPIs');
  if (!container) return;

  const riskColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#43B02A' };
  const momentum = EMOTION_KPIS.brandMomentumScore;

  const kpis = [
    {
      label: 'Brand Emotion Score',
      value: EMOTION_KPIS.brandEmotionScore,
      suffix: '/100',
      color: EMOTION_KPIS.brandEmotionScore >= 70 ? '#43B02A' : '#f59e0b',
      icon: '💚',
      sub: 'Composite positive emotion index',
    },
    {
      label: 'Avg Perception Gap',
      value: EMOTION_KPIS.perceptionGapScore + ' pts',
      suffix: '',
      color: EMOTION_KPIS.perceptionGapScore <= 20 ? '#43B02A' : EMOTION_KPIS.perceptionGapScore <= 35 ? '#f59e0b' : '#ef4444',
      icon: '🎯',
      sub: 'Lower is better — desired vs. actual',
    },
    {
      label: 'Emotional Risk Level',
      value: EMOTION_KPIS.emotionalRiskLevel,
      suffix: '',
      color: riskColor[EMOTION_KPIS.emotionalRiskLevel] || '#6b7280',
      icon: '⚠️',
      sub: 'Driven by sustainability gap + tariff exposure',
    },
    {
      label: 'Messaging Resonance',
      value: EMOTION_KPIS.resonanceIndex,
      suffix: '/100',
      color: EMOTION_KPIS.resonanceIndex >= 70 ? '#43B02A' : '#f59e0b',
      icon: '📡',
      sub: 'How well comms emotionally land',
    },
    {
      label: 'Trust Index',
      value: EMOTION_KPIS.trustIndex,
      suffix: '/100',
      color: EMOTION_KPIS.trustIndex >= 70 ? '#43B02A' : '#f59e0b',
      icon: '🤝',
      sub: 'Audience trust in Crocs brand',
    },
    {
      label: 'Brand Momentum',
      value: momentum,
      suffix: '/100',
      color: momentum >= 75 ? '#43B02A' : '#f59e0b',
      icon: momentum >= 75 ? '🚀' : '📊',
      sub: 'Emotional velocity — trending up',
    },
  ];

  container.innerHTML = kpis.map(k => `
    <div class="emotion-kpi-card" style="border-top: 3px solid ${k.color}">
      <div class="emotion-kpi-icon">${k.icon}</div>
      <div class="emotion-kpi-value" style="color:${k.color}">${k.value}${k.suffix}</div>
      <div class="emotion-kpi-label">${k.label}</div>
      <div class="emotion-kpi-sub">${k.sub}</div>
    </div>
  `).join('');
}

// ─── Emotion Radar Chart ─────────────────────────────────────────────────────
function renderEmotionRadar() {
  const ctx = document.getElementById('emotionRadarChart');
  if (!ctx) return;

  const labels = Object.keys(EMOTION_BREAKDOWN.current);
  const current   = Object.values(EMOTION_BREAKDOWN.current);
  const previous  = Object.values(EMOTION_BREAKDOWN.previous);
  const benchmark = Object.values(EMOTION_BREAKDOWN.benchmark);

  if (window._emotionRadarChart) window._emotionRadarChart.destroy();
  window._emotionRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Crocs (Current)',
          data: current,
          borderColor: '#43B02A',
          backgroundColor: '#43B02A25',
          borderWidth: 2.5,
          pointRadius: 4,
        },
        {
          label: 'Crocs (Prior Period)',
          data: previous,
          borderColor: '#6b7280',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 2,
        },
        {
          label: 'Category Benchmark',
          data: benchmark,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f610',
          borderWidth: 1.5,
          borderDash: [2, 3],
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 25, font: { size: 10 } },
          pointLabels: { font: { size: 11 } },
        },
      },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
      },
    },
  });
}

// ─── Perception Gap Monitor ──────────────────────────────────────────────────
function renderPerceptionGaps() {
  const container = document.getElementById('perceptionGapViz');
  if (!container) return;

  container.innerHTML = PERCEPTION_GAPS.map(g => {
    const gap = g.desired - g.actual;
    const gapColor = gap <= 8 ? '#43B02A' : gap <= 20 ? '#f59e0b' : '#ef4444';
    const trendIcon = g.trend === 'up' ? '↑' : g.trend === 'down' ? '↓' : '→';
    const trendColor = g.trend === 'up' ? '#43B02A' : g.trend === 'down' ? '#ef4444' : '#6b7280';

    return `
    <div class="pgap-row">
      <div class="pgap-label">
        <span class="pgap-attr">${g.attribute}</span>
        <span class="pgap-trend" style="color:${trendColor}">${trendIcon}</span>
      </div>
      <div class="pgap-bars">
        <div class="pgap-bar-wrap">
          <div class="pgap-bar pgap-desired" style="width:${g.desired}%"></div>
          <span class="pgap-bar-label">Desired ${g.desired}</span>
        </div>
        <div class="pgap-bar-wrap">
          <div class="pgap-bar pgap-actual" style="width:${g.actual}%"></div>
          <span class="pgap-bar-label">Actual ${g.actual}</span>
        </div>
      </div>
      <div class="pgap-gap-badge" style="background:${gapColor}20;color:${gapColor};border:1px solid ${gapColor}40">
        ${gap > 0 ? '-' : '+'}${Math.abs(gap)} pts
      </div>
    </div>`;
  }).join('');
}

// ─── Emotion Trend Chart ─────────────────────────────────────────────────────
function renderEmotionTrend() {
  const ctx = document.getElementById('emotionTrendChart');
  if (!ctx) return;

  const { weeks, Joy, Trust, Anger, Anticipation } = EMOTION_TREND;

  if (window._emotionTrendChart) window._emotionTrendChart.destroy();
  window._emotionTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [
        { label: 'Joy', data: Joy, borderColor: '#43B02A', backgroundColor: '#43B02A15', borderWidth: 2.5, fill: true, tension: 0.3, pointRadius: 3 },
        { label: 'Trust', data: Trust, borderColor: '#3b82f6', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3, pointRadius: 2 },
        { label: 'Anticipation', data: Anticipation, borderColor: '#f59e0b', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3, pointRadius: 2 },
        { label: 'Anger', data: Anger, borderColor: '#ef4444', backgroundColor: '#ef444415', borderWidth: 2, fill: true, tension: 0.3, pointRadius: 2 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
        annotation: {}, // future: add event markers
      },
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Emotion Share (%)' } },
        x: { ticks: { font: { size: 10 } } },
      },
    },
  });

  // Render event annotations below chart
  const eventsEl = document.getElementById('emotionTrendEvents');
  if (eventsEl) {
    eventsEl.innerHTML = EMOTION_TREND.events.map(e => `
      <span class="emotion-event-tag" style="border-color:${e.color};color:${e.color}">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${e.color};margin-right:4px;"></span>
        ${e.week}: ${e.label}
      </span>
    `).join('');
  }
}

// ─── Audience Emotion Map ────────────────────────────────────────────────────
function renderAudienceEmotionChart() {
  const ctx = document.getElementById('audienceEmotionChart');
  if (!ctx) return;

  const dimensions = ['Joy', 'Trust', 'Pride', 'Excitement', 'Nostalgia', 'Anxiety'];
  const colors = ['#43B02A', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const datasets = AUDIENCE_EMOTIONS.map((seg, i) => ({
    label: seg.segment,
    data: dimensions.map(d => seg[d] || 0),
    borderColor: colors[i],
    backgroundColor: colors[i] + '20',
    borderWidth: i === 0 ? 2.5 : 1.5,
    pointRadius: 3,
    fill: true,
  }));

  if (window._audienceEmotionChart) window._audienceEmotionChart.destroy();
  window._audienceEmotionChart = new Chart(ctx, {
    type: 'radar',
    data: { labels: dimensions, datasets },
    options: {
      responsive: true,
      scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, font: { size: 9 } }, pointLabels: { font: { size: 10 } } } },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 10 } } } },
    },
  });
}

// ─── Competitor Emotion Positioning ─────────────────────────────────────────
function renderCompetitorChart() {
  const ctx = document.getElementById('competitorEmotionChart');
  if (!ctx) return;

  const { brands, dimensions } = COMPETITOR_EMOTIONS;
  const dimNames = Object.keys(dimensions);
  const colors = ['#43B02A', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  const datasets = brands.map((brand, i) => ({
    label: brand,
    data: dimNames.map(d => dimensions[d][i]),
    borderColor: colors[i],
    backgroundColor: colors[i] + (i === 0 ? '25' : '10'),
    borderWidth: i === 0 ? 2.5 : 1.5,
    pointRadius: i === 0 ? 4 : 2,
    fill: i === 0,
  }));

  if (window._competitorEmotionChart) window._competitorEmotionChart.destroy();
  window._competitorEmotionChart = new Chart(ctx, {
    type: 'radar',
    data: { labels: dimNames, datasets },
    options: {
      responsive: true,
      scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, font: { size: 9 } }, pointLabels: { font: { size: 10 } } } },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 10 } } } },
    },
  });
}

// ─── Risk & Opportunity Grid ─────────────────────────────────────────────────
function renderRiskOpportunityGrid() {
  const container = document.getElementById('riskOpportunityGrid');
  if (!container) return;

  const typeConfig = {
    risk:        { label: 'RISK',        bg: '#fef2f2', border: '#ef4444', color: '#b91c1c', icon: '🔴' },
    opportunity: { label: 'OPPORTUNITY', bg: '#f0fdf4', border: '#43B02A', color: '#166534', icon: '🟢' },
    watch:       { label: 'WATCH',       bg: '#fffbeb', border: '#f59e0b', color: '#92400e', icon: '🟡' },
  };

  container.innerHTML = `
    <div class="ro-grid">
      ${RISK_OPPORTUNITY_TOPICS.map(t => {
        const cfg = typeConfig[t.type];
        const intensityWidth = t.emotionIntensity;
        const valenceAbs = Math.abs(t.valence);
        const valencePositive = t.valence > 0;

        return `
        <div class="ro-card" style="border-left:4px solid ${cfg.border};background:${cfg.bg}">
          <div class="ro-card-top">
            <span class="ro-type-badge" style="background:${cfg.border}20;color:${cfg.color};border:1px solid ${cfg.border}40">${cfg.icon} ${cfg.label}</span>
            <span class="ro-category">${t.category}</span>
          </div>
          <div class="ro-topic">${t.topic}</div>
          <div class="ro-emotion-tag">${t.primaryEmotion}</div>
          <div class="ro-metrics">
            <div class="ro-metric-row">
              <span class="ro-metric-label">Emotion Intensity</span>
              <div class="ro-bar-wrap"><div class="ro-bar" style="width:${intensityWidth}%;background:${cfg.border}"></div></div>
              <span class="ro-metric-val">${t.emotionIntensity}</span>
            </div>
            <div class="ro-metric-row">
              <span class="ro-metric-label">Valence</span>
              <div class="ro-bar-wrap"><div class="ro-bar" style="width:${valenceAbs}%;background:${valencePositive ? '#43B02A' : '#ef4444'}"></div></div>
              <span class="ro-metric-val" style="color:${valencePositive ? '#43B02A' : '#ef4444'}">${t.valence > 0 ? '+' : ''}${t.valence}</span>
            </div>
          </div>
          <div class="ro-volume">Social volume: ${t.volume} mentions</div>
        </div>`;
      }).join('')}
    </div>`;
}

// ─── Macro Environmental Signals ────────────────────────────────────────────
function renderMacroSignals() {
  const container = document.getElementById('macroSignalsGrid');
  if (!container) return;

  const riskConfig = {
    high:   { color: '#ef4444', bg: '#fef2f2', label: 'HIGH RISK' },
    medium: { color: '#f59e0b', bg: '#fffbeb', label: 'MEDIUM' },
    low:    { color: '#43B02A', bg: '#f0fdf4', label: 'OPPORTUNITY' },
  };

  const trendIcon = { rising: '↑ Rising', growing: '↑ Growing', stable: '→ Stable', falling: '↓ Falling' };

  container.innerHTML = MACRO_SIGNALS.map(s => {
    const cfg = riskConfig[s.risk];
    return `
    <div class="macro-card">
      <div class="macro-card-header">
        <div class="macro-signal-title">${s.signal}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
          <span class="macro-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}40">${cfg.label}</span>
          <span class="macro-trend">${trendIcon[s.trend] || s.trend}</span>
        </div>
      </div>
      <div class="macro-area-tag">${s.area}</div>
      <div class="macro-desc">${s.description}</div>
      <div class="macro-emotion"><strong>Emotion driver:</strong> ${s.emotionDriver}</div>
      <div class="macro-rec"><strong>Recommended action:</strong> ${s.recommendation}</div>
    </div>`;
  }).join('');
}

// ─── Messaging Resonance ─────────────────────────────────────────────────────
function renderMessagingResonance() {
  const container = document.getElementById('messagingResonanceGrid');
  if (!container) return;

  container.innerHTML = MESSAGING_RESONANCE.map(m => {
    const resonanceColor = m.resonance >= 75 ? '#43B02A' : m.resonance >= 55 ? '#f59e0b' : '#ef4444';
    return `
    <div class="msg-card ${m.flag ? 'msg-card-flagged' : ''}">
      ${m.flag ? '<div class="msg-flag-banner">⚠️ RETIRE THIS MESSAGE — triggering skepticism, not resonance</div>' : ''}
      <div class="msg-text">${m.message}</div>
      <div class="msg-emotion-tag">${m.primaryEmotion}</div>
      <div class="msg-audience">Audience: ${m.audience}</div>
      <div class="msg-bars">
        <div class="msg-bar-row">
          <span class="msg-bar-label">Emotion Intensity</span>
          <div class="msg-bar-wrap"><div class="msg-bar" style="width:${m.emotionScore}%;background:#3b82f6"></div></div>
          <span class="msg-bar-val">${m.emotionScore}</span>
        </div>
        <div class="msg-bar-row">
          <span class="msg-bar-label">Resonance Score</span>
          <div class="msg-bar-wrap"><div class="msg-bar" style="width:${m.resonance}%;background:${resonanceColor}"></div></div>
          <span class="msg-bar-val" style="color:${resonanceColor}">${m.resonance}</span>
        </div>
      </div>
      <div class="msg-insight">${m.insight}</div>
    </div>`;
  }).join('');
}
