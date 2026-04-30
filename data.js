// Sustainability Marketing Dashboard - Data Layer
// All competitor facts sourced from public ESG reports, investor pages, and press.
// No composite scores assigned — editorial descriptions only. Source URLs noted per brand.

const BRANDS = {
  crocs: {
    name: "Crocs",
    isSelf: true,
    trend: "up",
    pillars: ["Bio-Based Materials", "Circularity", "Carbon Reduction"],
    recentInitiative: "Bio-based Croslite expansion — 25% bio-circular content achieved in 2024, targeting 50% by 2030",
    confirmedFacts: [
      "25% bio-circular content achieved across product portfolio in 2024",
      "Net zero Scope 1, 2, and 3 emissions target by 2040",
      "50% carbon footprint reduction target for Classic Clog vs. 2021 baseline by 2030",
      "10% emissions reduction per pair achieved vs. 2021 baseline",
      "771,067 MT CO2e total Scope 1+2+3 emissions (2024)",
      "100% Tier 1 and Tier 2 supplier social compliance audits completed",
      "ESG reporting aligned with SASB, TCFD, and UN SDG frameworks",
    ],
    source: "investors.crocs.com/esg",
  },
  nike: {
    name: "Nike",
    trend: "up",
    pillars: ["Circularity", "Renewable Energy", "Water Stewardship", "Community"],
    recentInitiative: "Nike Refurbished program — reselling lightly worn returns in 300+ stores globally",
    confirmedFacts: [
      "Nike Refurbished program active in 300+ store locations",
      "Move to Zero sustainability initiative spanning product lines",
      "SBTi-approved climate targets submitted",
      "Fair Labor Association accredited",
    ],
    source: "nike.com/a/nike-zero-carbon-emissions-goal",
  },
  adidas: {
    name: "Adidas",
    trend: "up",
    pillars: ["Ocean Plastic", "Circularity", "Sustainable Cotton"],
    recentInitiative: "Made to Be Remade circular product line with QR-code return system",
    confirmedFacts: [
      "Made to Be Remade circular product line with QR-code return system",
      "Parley for the Oceans partnership — ocean plastic materials in product lines",
      "Nuremberg-Fürth court (March 2026) ruled Adidas misled consumers with vague 'climate neutral' claims — verdict under appeal",
    ],
    source: "adidas-group.com/sustainability",
  },
  birkenstock: {
    name: "Birkenstock",
    trend: "up",
    pillars: ["Natural Materials", "Longevity", "Repair Programs", "Responsible Sourcing"],
    recentInitiative: "Repair and resoling program available for most styles; cork sourced from renewable bark harvest",
    confirmedFacts: [
      "Cork materials sourced from renewable cork oak bark harvest — bark regrows without felling trees",
      "Repair and resoling program available for most styles",
      "Natural latex alternatives and natural footbed materials offered",
    ],
    source: "birkenstock.com/gb/responsibility",
  },
  skechers: {
    name: "Skechers",
    trend: "flat",
    pillars: ["Recycled Materials", "Energy Efficiency"],
    recentInitiative: "Recycled polyester integration in select product lines",
    confirmedFacts: [
      "Recycled materials used in select product lines",
      "Energy efficiency initiatives in distribution centers",
    ],
    source: "skechers.com/en-us/corporate-responsibility",
  },
  newBalance: {
    name: "New Balance",
    trend: "up",
    pillars: ["Domestic Manufacturing", "Responsible Sourcing", "Renewable Energy"],
    recentInitiative: "US domestic manufacturing maintained in Massachusetts and Maine factories",
    confirmedFacts: [
      "US domestic manufacturing maintained in Massachusetts and Maine factories",
      "Annual corporate responsibility report published",
    ],
    source: "newbalance.com/us/en/nb-sustainability",
  },
  puma: {
    name: "Puma",
    trend: "up",
    pillars: ["Biodiversity", "Fair Wages", "Circularity", "Climate Targets"],
    recentInitiative: "RE:SUEDE biodegradable sneaker — 18-month composting trial results published",
    confirmedFacts: [
      "100% renewable electricity achieved in own operations in 2024",
      "75% recycled polyester in polyester-based products",
      "RE:SUEDE biodegradable sneaker 18-month composting trial results published",
      "Vision 2030 sustainability strategy with SBTi-aligned targets",
    ],
    source: "about.puma.com/en/sustainability",
  },
  vans: {
    name: "Vans",
    trend: "flat",
    pillars: ["Organic Materials", "Packaging Reduction"],
    recentInitiative: "Eco Theory collection with organic canvas and natural dyes",
    confirmedFacts: [
      "Eco Theory collection uses organic canvas and natural dyes",
      "Packaging reduction commitments in progress",
    ],
    source: "vans.com/en-us/sustainability",
  },
  allbirds: {
    name: "Allbirds",
    trend: "up",
    pillars: ["Carbon Labeling", "Regenerative Ag", "Bio-Based Materials", "Transparency"],
    recentInitiative: "Flight Status public carbon dashboard — real-time per-product lifecycle emissions",
    confirmedFacts: [
      "B Corp certified since 2016",
      "Carbon footprint labeled on all products since 2020",
      "ReRun resale marketplace for used Allbirds launched",
      "Flight Status: public carbon dashboard tracking company-wide emissions progress",
      "Regenerative wool sourcing program with verified soil carbon data from New Zealand farms",
    ],
    source: "allbirds.com/our-footprint",
  },
  hoka: {
    name: "Hoka",
    trend: "up",
    pillars: ["Recycled Materials", "Sustainable Packaging"],
    recentInitiative: "Recycled EVA midsole materials piloted in select trail running styles",
    confirmedFacts: [
      "Recycled materials usage in select product lines",
      "Sustainable packaging commitments in progress",
    ],
    source: "hoka.com/hoka-cares",
  },
};

const EMERGING_THEMES = [
  { label: "Carbon Labeling", color: "#2e8b57" },
  { label: "Regenerative Agriculture", color: "#3b82f6" },
  { label: "Biodegradable Materials", color: "#8b5cf6" },
  { label: "Circular Take-Back", color: "#f59e0b" },
  { label: "Supply Chain Transparency", color: "#ef4444" },
  { label: "Water Stewardship", color: "#06b6d4" },
  { label: "Bio-Based Polymers", color: "#10b981" },
  { label: "Living Wages", color: "#ec4899" },
  { label: "Microplastic Reduction", color: "#6366f1" },
  { label: "Repair & Longevity", color: "#84cc16" },
  { label: "Nature-Positive Targets", color: "#14b8a6" },
  { label: "Digital Product Passports", color: "#a855f7" },
];

const RECENT_CAMPAIGNS = [
  {
    brand: "Adidas",
    title: "Greenwashing Ruling — Climate Claims Banned",
    description: "Nuremberg-Fürth Regional Court (March 25, 2026) found Adidas guilty of misleading consumers with vague 'climate neutral by 2050' claims. Court ordered the company to stop using the phrase without detailing how the goal would be achieved. Adidas had already quietly adjusted its website in Aug 2024. Verdict is not yet final but signals tightening enforcement across EU. Implication for Crocs: any sustainability claims must be specific, time-bound, and substantiated — not aspirational.",
    date: "2026-03-25",
    channel: "Legal / PR",
    engagement: "Very High",
  },
  {
    brand: "Industry",
    title: "EU Green Claims Enforcement — September 2026 Deadline",
    description: "EU Member States must transpose the Empowering Consumers for the Green Transition Directive by March 2026, with rules applying from September 2026. Bans vague claims like 'eco-friendly', carbon-offset-only claims, and unverified sustainability labels. Separately, from July 2026, large brands are prohibited from destroying unsold footwear on the EU market. Note: the broader Green Claims Directive has been paused, but existing Unfair Commercial Practices rules still apply and are being enforced (see Adidas ruling above). All competitors selling in EU are affected.",
    date: "2026-03-01",
    channel: "Regulatory",
    engagement: "High",
  },
];

// Pillar categories for competitive analysis
const GAP_DIMENSIONS = [
  "Carbon Transparency",
  "Circular Programs",
  "Bio-Based Materials",
  "Supply Chain Ethics",
  "Consumer Education",
  "Third-Party Certs",
];
