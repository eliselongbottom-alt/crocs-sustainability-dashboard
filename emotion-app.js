// Emotion Intelligence — Application Logic

function initEmotion() {
  renderEmotionRadar();
  renderMacroSignals();
  renderMessagingResonance();
  renderCapabilityStatus();
  renderMethodologyTable();

  const label = document.getElementById('emotionLastUpdated');
  if (label) {
    const d = new Date(EMOTION_LAST_UPDATED);
    label.textContent = 'Data as of ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

// ─── Methodology Table ───────────────────────────────────────────────────────
function renderMethodologyTable() {
  const el = document.getElementById('emotionMethodologyTable');
  if (!el || typeof EMOTION_METHODOLOGY === 'undefined') return;

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

// ─── Brand Emotion Profile (Plutchik's Wheel) ────────────────────────────────
function renderEmotionRadar() {
  const ctx = document.getElementById('emotionRadarChart');
  if (!ctx) return;

  const labels = Object.keys(EMOTION_BREAKDOWN.current);
  const values = Object.values(EMOTION_BREAKDOWN.current);

  if (window._emotionRadarChart) window._emotionRadarChart.destroy();
  window._emotionRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Crocs — rubric estimate',
          data: values,
          borderColor: '#43B02A',
          backgroundColor: '#43B02A20',
          borderWidth: 2.5,
          pointRadius: 4,
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

  container.innerHTML = `
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:0.78rem;color:#6b7280;line-height:1.5;">
      <strong style="color:#374151;">Scoring methodology</strong> — 5-dimension Gen Z messaging rubric:
      Authenticity + Identity signal + Memorability + Emotional specificity + Cultural fit (each 0–20).
      Resonance weights authenticity and cultural fit more heavily than raw intensity.
      These are rubric estimates — not from primary research.
    </div>
  ` + MESSAGING_RESONANCE.map(m => {
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

// ─── Measurement Capability Status ───────────────────────────────────────────
function renderCapabilityStatus() {
  const el = document.getElementById('capabilityStatus');
  if (!el || typeof CAPABILITY_STATUS === 'undefined') return;

  const statusConfig = {
    confirmed:  { label: '✓ Confirmed',        color: '#43B02A', bg: '#f0fdf4' },
    partial:    { label: '◑ Partial',           color: '#f59e0b', bg: '#fffbeb' },
    needed:     { label: '✕ Needs structure',   color: '#ef4444', bg: '#fef2f2' },
    investment: { label: '$ Investment needed', color: '#8b5cf6', bg: '#f5f3ff' },
  };

  const priorityLabel = {
    extend:    'Extend →',
    leverage:  'Leverage →',
    scale:     'Scale →',
    immediate: 'Do immediately',
    upgrade:   'Upgrade',
    phase3:    'Phase 3',
  };

  el.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:0.83rem;">
        <thead>
          <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
            <th style="text-align:left;padding:10px 12px;font-weight:700;color:#374151;">Capability</th>
            <th style="text-align:center;padding:10px 12px;font-weight:700;color:#374151;">Status</th>
            <th style="text-align:center;padding:10px 12px;font-weight:700;color:#374151;">Priority</th>
            <th style="text-align:left;padding:10px 12px;font-weight:700;color:#374151;">Note</th>
          </tr>
        </thead>
        <tbody>
          ${CAPABILITY_STATUS.map((c, i) => {
            const cfg = statusConfig[c.status];
            return `
            <tr style="border-bottom:1px solid #f3f4f6;background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
              <td style="padding:10px 12px;font-weight:600;">${c.capability}</td>
              <td style="padding:10px 12px;text-align:center;">
                <span style="font-size:0.75rem;font-weight:700;background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}40;border-radius:4px;padding:2px 8px;white-space:nowrap;">${cfg.label}</span>
              </td>
              <td style="padding:10px 12px;text-align:center;font-size:0.75rem;font-weight:600;color:#6b7280;">${priorityLabel[c.priority] || c.priority}</td>
              <td style="padding:10px 12px;color:#6b7280;">${c.note}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}
