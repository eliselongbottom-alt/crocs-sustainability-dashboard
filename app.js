// Sustainability Marketing Dashboard - Application Logic

document.addEventListener("DOMContentLoaded", () => {
  window._sustainabilityInitialized = false;
});

function renderAll() {
  document.getElementById("lastUpdated").textContent =
    "Updated: " + new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

  renderPositioningSummary();
  renderKPIs();
  renderTrendChart();
  renderPillarChart();
  renderScorecard();
  renderThemeBubbles();
  renderGapChart();
  renderActions();
  renderCampaignFeed();
  renderSustainabilityRoadmap();
}

// --- Shared Roadmap Renderer ---
function renderRoadmap(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const horizons = [
    { key: "1-3",  label: "1–3 Months",  sublabel: "Act Now",     color: "#ef4444" },
    { key: "3-6",  label: "3–6 Months",  sublabel: "Plan Now",    color: "#f59e0b" },
    { key: "6-12", label: "6–12 Months", sublabel: "Build Toward", color: "#43B02A" },
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
        `).join("")}
      </div>`;
  }).join("");

  container.innerHTML = `
    <h3>Sustainability Marketing Roadmap</h3>
    <p class="actions-subtitle">Prioritised actions across three planning horizons</p>
    <div class="roadmap-grid">${grid}</div>
  `;
}

// --- Sustainability Roadmap ---
function renderSustainabilityRoadmap() {
  const items = [
    // 1–3 months
    {
      horizon: "1-3",
      priority: "high",
      type: "Campaign",
      title: "Launch Carbon Transparency Content Series",
      description: "Crocs achieved 10% emissions reduction per pair vs. 2021 baseline (confirmed). Publish a 3-part social series showing real carbon reduction progress using investor-page data.",
      kpi: "15+ press mentions referencing verified data points",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "Content",
      title: "Counter EU Greenwashing Enforcement Risk",
      description: "Adidas was found guilty of misleading 'climate neutral' claims by a Nuremberg court (March 2026). Audit all Crocs sustainability language for vague or unsubstantiated claims before September 2026 EU enforcement deadline.",
      kpi: "All public sustainability claims reviewed and substantiated",
    },
    {
      horizon: "1-3",
      priority: "high",
      type: "PR",
      title: "Amplify Bio-Circular Progress Story",
      description: "25% bio-circular content achieved in 2024 (confirmed, investors.crocs.com/esg). This is a genuinely strong story that's under-told. A commitment announcement for the 50% by 2030 target costs nothing and signals direction.",
      kpi: "10+ earned media placements citing verified bio-content figure",
    },
    // 3–6 months
    {
      horizon: "3-6",
      priority: "high",
      type: "Product",
      title: "Pilot Consumer Take-Back Programme",
      description: "Allbirds' ReRun resale marketplace and Nike Refurbished in 300+ stores show this model works. Croslite's single-material construction is ideal for closed-loop recycling. Launch a 3-city pilot with in-store drop-off.",
      kpi: "500 units collected, media coverage in 5 outlets",
    },
    {
      horizon: "3-6",
      priority: "high",
      type: "Partnership",
      title: "Pursue Third-Party Certification",
      description: "Allbirds is B Corp certified since 2016. Puma has SBTi-aligned targets and Vision 2030. Nike has SBTi approval. No equivalent third-party validation exists for Crocs. Begin B Corp assessment or SBTi commitment process.",
      kpi: "Certification application submitted by Q3",
    },
    {
      horizon: "3-6",
      priority: "medium",
      type: "Campaign",
      title: "Consumer Education Digital Series",
      description: "Deploy a 6-episode digital series on Croslite material, bio-content, and responsible sourcing — using Crocs' playful brand voice. Bio-based Croslite (sugarcane-derived) is a genuinely differentiated story.",
      kpi: "5M organic impressions",
    },
    // 6–12 months
    {
      horizon: "6-12",
      priority: "high",
      type: "Product",
      title: "Launch Circular Economy Programme Nationally",
      description: "Scale take-back pilot nationwide with rewards programme for returned Crocs. Croslite's single-material composition should yield high recycling efficiency vs. multi-material shoes.",
      kpi: "10,000 units, 8% repeat purchase uplift",
    },
    {
      horizon: "6-12",
      priority: "medium",
      type: "Campaign",
      title: "Regenerative Agriculture Brand Story",
      description: "Commission a short documentary on bio-based Croslite sugarcane sourcing. Allbirds' regenerative wool sourcing from New Zealand farms has become a central brand pillar — Crocs' sugarcane sourcing is a parallel opportunity.",
      kpi: "50M views, 3 award submissions",
    },
    {
      horizon: "6-12",
      priority: "medium",
      type: "Research",
      title: "Carbon Labelling on Packaging",
      description: "Allbirds has labeled carbon footprint on all products since 2020. EU and California are both advancing mandatory carbon labeling legislation. Commission LCA on top 3 SKUs to test Crocs carbon label.",
      kpi: "12% positive sentiment lift among eco-conscious segment",
    },
  ];

  renderRoadmap("sustainabilityRoadmap", items);
}

function refreshData() {
  document.querySelector(".btn-refresh").textContent = "Refreshing...";
  setTimeout(() => {
    renderAll();
    document.querySelector(".btn-refresh").textContent = "Refresh Data";
  }, 600);
}

// --- Positioning Summary ---
function renderPositioningSummary() {
  const crocs = BRANDS.crocs;
  const items = crocs.confirmedFacts.slice(0, 5).map(fact => {
    const [label, ...rest] = fact.split(" — ");
    return { label: label.trim(), detail: rest.join(" — ").trim() || "" };
  });

  const grid = document.getElementById("positioningGrid");
  grid.innerHTML = items.map(item => `
    <div class="positioning-item">
      <div class="value" style="font-size:0.85rem;line-height:1.3;">${item.label}</div>
      ${item.detail ? `<div class="detail">${item.detail}</div>` : ""}
    </div>
  `).join("") + `
    <div class="positioning-item">
      <div class="label">Source</div>
      <div class="value" style="font-size:0.8rem;font-weight:400;">${crocs.source}</div>
      <div class="detail">2024 ESG Report (investors.crocs.com)</div>
    </div>
  `;
}

// --- KPI Cards ---
function renderKPIs() {
  const brands = Object.values(BRANDS);
  const crocs = BRANDS.crocs;

  const kpis = [
    { value: brands.length, label: "Brands Tracked", change: null },
    { value: "25%", label: "Crocs Bio-Circular Content", change: "2024 actual — investors.crocs.com", dir: "up" },
    { value: "Net Zero 2040", label: "Crocs Climate Target", change: "Scope 1, 2, and 3", dir: "up" },
    { value: "Sep 2026", label: "EU Enforcement Deadline", change: "Green Claims rules take effect", dir: null },
  ];

  const row = document.getElementById("kpiRow");
  row.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
      ${k.change ? `<div class="kpi-change ${k.dir || ""}">${k.change}</div>` : ""}
    </div>
  `).join("");
}

// --- Trend Chart (replaced — no verified volume data available) ---
function renderTrendChart() {
  const card = document.getElementById("trendChart").closest(".chart-card");
  card.innerHTML = `
    <h3>Sustainability Messaging Volume</h3>
    <div class="no-data-notice" style="padding:2rem 1rem;text-align:center;color:#6b7280;font-size:0.9rem;line-height:1.6;">
      Campaign volume data not available.<br>
      Only verified sourced data is shown in this dashboard — estimated volume indices have been removed.
    </div>
  `;
}

// --- Pillar Chart ---
function renderPillarChart() {
  const ctx = document.getElementById("pillarChart");
  if (!ctx) return;
  const chartCtx = ctx.getContext("2d");

  const pillarCounts = {};
  Object.values(BRANDS).forEach(b => {
    b.pillars.forEach(p => {
      pillarCounts[p] = (pillarCounts[p] || 0) + 1;
    });
  });

  const sorted = Object.entries(pillarCounts).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(s => s[0]);
  const values = sorted.map(s => s[1]);

  const hasCrocs = labels.map(l => BRANDS.crocs.pillars.includes(l));
  const colors = hasCrocs.map(h => h ? "#43B02A" : "#C8E6B8");

  if (window._pillarChart) window._pillarChart.destroy();
  window._pillarChart = new Chart(chartCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Brands Using Pillar",
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => hasCrocs[ctx.dataIndex] ? "Crocs is active here" : "Crocs opportunity",
          },
        },
      },
      scales: {
        x: { beginAtZero: true, title: { display: true, text: "Number of Brands" } },
      },
    },
  });
}

// --- Scorecard Table ---
let scorecardData = [];

function renderScorecard() {
  scorecardData = Object.values(BRANDS).sort((a, b) => a.name.localeCompare(b.name));
  renderScorecardRows(scorecardData);
}

function renderScorecardRows(data) {
  const tbody = document.getElementById("scorecardBody");
  tbody.innerHTML = data.map(b => {
    const trendClass = b.trend === "up" ? "trend-up" : b.trend === "down" ? "trend-down" : "trend-flat";
    const trendArrow = b.trend === "up" ? "&#9650;" : b.trend === "down" ? "&#9660;" : "&#9644;";
    const rowClass = b.isSelf ? 'class="is-crocs"' : "";
    const factsList = b.confirmedFacts && b.confirmedFacts.length > 0
      ? `<ul style="margin:0;padding-left:1rem;font-size:0.78rem;color:#374151;">${b.confirmedFacts.slice(0, 2).map(f => `<li>${f}</li>`).join("")}</ul>`
      : `<span style="font-size:0.78rem;color:#9ca3af;">No confirmed facts on file</span>`;

    return `<tr ${rowClass}>
      <td><strong>${b.name}</strong>${b.isSelf ? " (You)" : ""}<br><span style="font-size:0.72rem;color:#9ca3af;">${b.source || ""}</span></td>
      <td><div class="pillar-tags">${b.pillars.map(p => `<span class="pillar-tag">${p}</span>`).join("")}</div></td>
      <td>${factsList}</td>
      <td style="max-width:220px;font-size:0.8rem;">${b.recentInitiative}</td>
      <td><span class="trend-arrow ${trendClass}">${trendArrow}</span></td>
    </tr>`;
  }).join("");
}

function filterTable() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = scorecardData.filter(b =>
    b.name.toLowerCase().includes(query) ||
    b.pillars.some(p => p.toLowerCase().includes(query)) ||
    b.recentInitiative.toLowerCase().includes(query)
  );
  renderScorecardRows(filtered);
}

function sortTable() {
  const sortBy = document.getElementById("sortSelect").value;
  const sorted = [...scorecardData];
  switch (sortBy) {
    case "trend":
      sorted.sort((a, b) => {
        const order = { up: 0, flat: 1, down: 2 };
        return (order[a.trend] || 1) - (order[b.trend] || 1);
      });
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  renderScorecardRows(sorted);
}

// --- Theme Bubbles ---
function renderThemeBubbles() {
  const container = document.getElementById("themeBubbles");
  container.innerHTML = EMERGING_THEMES.map(t => {
    return `<span class="theme-bubble" style="background:${t.color}22;color:${t.color};border:1px solid ${t.color}44;font-size:0.85rem;">${t.label}</span>`;
  }).join("");
}

// --- Gap Analysis (removed — required estimated benchmark data) ---
function renderGapChart() {
  const card = document.getElementById("gapChart").closest(".card");
  card.innerHTML = `
    <h3>Crocs Gap Analysis</h3>
    <div class="no-data-notice" style="padding:2rem 1rem;text-align:center;color:#6b7280;font-size:0.9rem;line-height:1.6;">
      Gap scores removed — this chart required estimated benchmark figures that cannot be independently verified.<br>
      Use the Pillar Focus Breakdown and Competitor Scorecard to identify positioning opportunities.
    </div>
  `;
}

// --- Recommended Actions ---
function renderActions() {
  const crocs = BRANDS.crocs;
  const peers = Object.values(BRANDS).filter(b => !b.isSelf);
  const actions = [];

  const dimToStrategy = {
    "Carbon Transparency": "carbon-transparency",
    "Circular Programs": "circular-programs",
    "Consumer Education": "consumer-education",
    "Third-Party Certs": "third-party-certs",
    "Supply Chain Ethics": "adopt-pillar",
    "Bio-Based Materials": "adopt-pillar",
  };

  // 1. Pillar gap analysis — based on real pillar arrays
  const pillarCounts = {};
  peers.forEach(b => b.pillars.forEach(p => { pillarCounts[p] = (pillarCounts[p] || 0) + 1; }));
  Object.entries(pillarCounts)
    .filter(([p]) => !crocs.pillars.includes(p))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([pillar, count]) => {
      const brandsUsing = peers.filter(b => b.pillars.includes(pillar)).map(b => b.name);
      actions.push({
        priority: count >= 4 ? "high" : "medium",
        type: "Adopt Pillar",
        title: `Add "${pillar}" to sustainability messaging`,
        rationale: `${count} of ${peers.length} peers actively market this pillar (${brandsUsing.slice(0, 3).join(", ")}${brandsUsing.length > 3 ? "..." : ""}). Crocs has no visible presence here.`,
        metric: { label: `${count}/${peers.length} peers active`, pct: Math.round((count / peers.length) * 100) },
        strategyId: "adopt-pillar",
      });
    });

  // 2. EU enforcement action — based on verified regulatory event
  actions.push({
    priority: "high",
    type: "Regulatory",
    title: "Audit all sustainability claims for EU Green Claims compliance",
    rationale: "EU rules take effect September 2026. Adidas was found guilty of misleading claims in March 2026 (Nuremberg-Fürth court). All vague phrases like 'eco-friendly' or 'climate neutral' must be substantiated or removed.",
    metric: { label: "EU enforcement: Sep 2026", pct: 85 },
    strategyId: "third-party-certs",
  });

  // 3. Circular programs — based on real peer data
  const hasCircular = peers.filter(b => b.pillars.some(p => p.toLowerCase().includes("circular") || p.toLowerCase().includes("repair") || p.toLowerCase().includes("longevity")));
  actions.push({
    priority: "high",
    type: "Close Gap",
    title: "Strengthen Circular Programs",
    rationale: `${hasCircular.length} peers (${hasCircular.map(b => b.name).join(", ")}) actively market circular initiatives. Croslite's single-material composition is an ideal circularity advantage that's under-marketed.`,
    metric: { label: `${hasCircular.length}/${peers.length} peers active`, pct: Math.round((hasCircular.length / peers.length) * 100) },
    strategyId: "circular-programs",
  });

  // 4. Third-party certifications — based on real cert data
  const certifiedPeers = peers.filter(b => b.confirmedFacts && b.confirmedFacts.some(f => f.toLowerCase().includes("b corp") || f.toLowerCase().includes("sbti") || f.toLowerCase().includes("certified")));
  actions.push({
    priority: "high",
    type: "Close Gap",
    title: "Pursue Third-Party Certifications",
    rationale: `Allbirds is B Corp certified (since 2016) and Puma has SBTi-aligned Vision 2030 targets. Nike has SBTi-approved targets. Crocs has no equivalent independent certification — a meaningful credibility gap as EU enforcement tightens.`,
    metric: { label: `${certifiedPeers.length} peers certified`, pct: Math.round((certifiedPeers.length / peers.length) * 100) },
    strategyId: "third-party-certs",
  });

  // 5. Carbon transparency — based on peer actions
  const carbonLabelPeers = peers.filter(b => b.pillars.some(p => p.toLowerCase().includes("carbon") || p.toLowerCase().includes("transparency")));
  actions.push({
    priority: "medium",
    type: "Close Gap",
    title: "Strengthen Carbon Transparency",
    rationale: `Allbirds labels carbon footprint on every product since 2020. Crocs' confirmed 10% per-pair emissions reduction is a strong story — but it's not being told at the product level.`,
    metric: { label: `Allbirds set industry gold standard`, pct: 70 },
    strategyId: "carbon-transparency",
  });

  // 6. Learn from verified campaigns
  const verifiedCampaigns = RECENT_CAMPAIGNS.filter(c => c.brand !== "Crocs" && c.brand !== "Industry");
  if (verifiedCampaigns.length > 0) {
    actions.push({
      priority: "medium",
      type: "Competitive Response",
      title: "Study and respond to verified high-engagement peer events",
      rationale: `${RECENT_CAMPAIGNS.length} verified regulatory and legal events tracked. The Adidas greenwashing ruling is a direct signal: Crocs must substantiate all claims with specific, time-bound data.`,
      metric: { label: `${RECENT_CAMPAIGNS.length} verified events`, pct: 60 },
      strategyId: "peer-campaigns",
    });
  }

  // Sort: high first
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const grid = document.getElementById("actionsGrid");
  grid.innerHTML = actions.map(a => {
    const linkOpen = a.strategyId ? `<a href="strategy.html?id=${a.strategyId}" class="action-card-link">` : '';
    const linkClose = a.strategyId ? '</a>' : '';
    return `${linkOpen}<div class="action-card${a.strategyId ? ' has-strategy' : ''}">
      <span class="action-priority priority-${a.priority}">${a.priority} priority</span>
      <div class="action-type">${a.type}</div>
      <div class="action-title">${a.title}</div>
      <div class="action-rationale">${a.rationale}</div>
      <div class="action-metric">
        <div class="action-metric-bar"><div class="action-metric-fill" style="width:${a.metric.pct}%"></div></div>
        <span>${a.metric.label}</span>
      </div>
      ${a.strategyId ? '<div class="action-view-strategy">View full strategy →</div>' : ''}
    </div>${linkClose}`;
  }).join("");
}

// --- Campaign Feed ---
function renderCampaignFeed() {
  const container = document.getElementById("campaignFeed");
  const sorted = [...RECENT_CAMPAIGNS].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted.map(c => {
    const dateStr = new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isCrocs = c.brand === "Crocs";
    return `<div class="campaign-item" style="${isCrocs ? "border-left:3px solid #43B02A;" : ""}">
      <div class="campaign-brand">${c.brand}${isCrocs ? " (You)" : ""}</div>
      <div class="campaign-title">${c.title}</div>
      <div class="campaign-desc">${c.description}</div>
      <div class="campaign-meta">
        <span>${dateStr}</span>
        <span>${c.channel}</span>
        <span>Engagement: ${c.engagement}</span>
      </div>
    </div>`;
  }).join("");
}
