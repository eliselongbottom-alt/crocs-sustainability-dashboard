// Emotion Intelligence — Data Layer
// Replicates Allison Worldwide "Emotion Gap Navigator" methodology
// Sources in production: Brandwatch, Sprinklr, Talkwalker + primary survey research

const EMOTION_LAST_UPDATED = "2026-03-24";

// ─── Methodology & Sourcing ─────────────────────────────────────────────────
const EMOTION_METHODOLOGY = {
  dataStatus: "modeled",  // "modeled" = representative estimates | "live" = real API feed
  dataStatusLabel: "Representative Model",
  dataStatusNote: "All scores below are modeled estimates based on publicly available research, analyst reports, and brand tracking studies. They are designed to replicate the Allison Worldwide methodology for comparison purposes. In production, these would be replaced by live social listening APIs.",

  sections: [
    {
      id: "kpis",
      title: "KPI Scores",
      method: "Composite index",
      source: "Modeled — weighted average of emotion, trust, and resonance sub-scores",
      production: "Brandwatch or Sprinklr social listening API, applied to ~30 days of Crocs brand mentions",
      framework: "Allison Worldwide Emotion Gap Navigator composite methodology",
    },
    {
      id: "radar",
      title: "Brand Emotion Profile",
      method: "Plutchik's Wheel of Emotions (8 primary emotions)",
      source: "Modeled — estimated share of brand conversation carrying each emotion, based on published brand sentiment studies for consumer footwear brands and Crocs-specific press/social coverage",
      production: "NLP emotion classification (e.g. IBM Watson Tone Analyzer, Symanto, or custom model) applied to social mentions, news, and reviews",
      framework: "Robert Plutchik's psychoevolutionary theory of emotion (1980) — the industry standard for brand emotion analysis",
    },
    {
      id: "perception",
      title: "Perception Gap Monitor",
      method: "Desired vs. Actual gap scoring per brand attribute",
      source: "Desired: based on publicly stated Crocs brand positioning (annual reports, investor decks, CMO interviews). Actual: estimated from Crocs consumer reviews (Trustpilot, Reddit, YouTube comments), YouGov brand tracker data, and Mintel footwear category reports",
      production: "Desired scores set internally by brand team. Actual scores from Harris Poll or YouGov quarterly brand perception survey + social listening attribute tagging",
      framework: "Standard brand perception gap analysis — used by Edelman, Ketchum, and Allison Worldwide. Gap > 20pts = material reputational risk.",
    },
    {
      id: "trend",
      title: "Emotion Trend (12 Weeks)",
      method: "Weekly emotion share indexed 0–100",
      source: "Modeled — trend shape based on known Crocs brand events (Punch the Monkey launch Mar 1, tariff news cycle Mar 10). Absolute values are representative estimates.",
      production: "Rolling 7-day emotion classification of all Crocs brand mentions. Refreshed weekly via Brandwatch or Talkwalker scheduled export.",
      framework: "Emotion share = (mentions carrying emotion X) / (total mentions) × 100, smoothed with 7-day rolling average",
    },
    {
      id: "audience",
      title: "Audience Emotion Map",
      method: "Segment-level emotion profiling across 6 dimensions",
      source: "Modeled — based on Crocs' own published audience research, GWI (Global Web Index) consumer data for footwear, and published Gen Z brand relationship studies (Morning Consult, YPulse)",
      production: "Survey-based: quarterly Harris Poll segmented by age/demographic, combined with social listening filtered by inferred audience segments",
      framework: "6 emotions selected for brand relevance: Joy, Trust, Pride, Excitement, Nostalgia, Anxiety — subset of Plutchik extended wheel",
    },
    {
      id: "competitor",
      title: "Competitor Emotion Positioning",
      method: "Radar comparison across 5 emotional dimensions",
      source: "Modeled — based on published brand equity studies (YouGov BrandIndex), consumer review sentiment analysis across Google, Trustpilot, and Reddit for each brand, and analyst reports (Euromonitor, Mintel footwear 2025)",
      production: "Same NLP pipeline as Crocs, applied to competitor brand mentions. Requires social listening tool with competitive tracking (Brandwatch, Sprinklr, or Mention).",
      framework: "5 dimensions chosen for competitive differentiation relevance: Joy, Trust, Excitement, Sustainability, Premium",
    },
    {
      id: "risk",
      title: "Emotional Risk & Opportunity Signals",
      method: "Two-axis scoring: Emotion Intensity (0–100) × Valence (−100 to +100)",
      source: "Modeled — Emotion Intensity estimated from social volume proxies (Google Trends, Reddit post counts, news coverage volume). Valence estimated from sentiment analysis of top-result content for each topic.",
      production: "Automated topic detection via Brandwatch queries or Talkwalker Boolean searches. Intensity = normalised mention volume. Valence = net sentiment score from NLP classifier.",
      framework: "Risk/Opportunity classification: Intensity > 70 + Valence < −30 = Risk. Intensity > 70 + Valence > +60 = Opportunity. All others = Watch.",
    },
    {
      id: "macro",
      title: "Macro Environmental Scan",
      method: "Qualitative signal identification with risk rating",
      source: "Based on publicly available sources: Reuters/AP tariff coverage (Mar 2026), Edelman Trust Barometer 2025, Mintel sustainability in apparel report 2025, McKinsey State of Fashion 2026, Pew Research consumer sentiment data",
      production: "Allison Worldwide Environmental Scan combines Harvard Harris Poll primary research + Mintel/Statista secondary research + proprietary social listening. This prototype replicates the output format using public sources.",
      framework: "PESTLE-adjacent scan (Political, Economic, Social, Technology, Legal, Environmental) filtered for Crocs' specific risk profile",
    },
    {
      id: "messaging",
      title: "Messaging Emotional Resonance",
      method: "Two scores per message: Emotional Intensity + Resonance",
      source: "Modeled — Intensity scored by analysing social reaction to posts using these taglines (likes, shares, comments as proxy). Resonance scored by net sentiment of responses and UGC inspired by each message. Sources: Crocs social accounts (Instagram, TikTok), Sprout Social industry benchmarks, YouGov brand messaging recall data.",
      production: "A/B message testing via Lucid or Pollfish panel. Alternatively: social listening filtered to posts containing each tagline, with emotion + sentiment scoring applied to reply threads.",
      framework: "Emotional Intensity ≠ Resonance. A message can trigger high intensity (e.g. controversy) but low resonance (negative conversion). Both dimensions required for full picture.",
    },
  ],
};

// ─── KPIs ──────────────────────────────────────────────────────────────────
const EMOTION_KPIS = {
  brandEmotionScore:   74,   // 0-100 composite positive emotion index
  perceptionGapScore:  28,   // avg gap pts between desired & actual (lower = better)
  emotionalRiskLevel:  "Medium",
  resonanceIndex:      68,   // how well Crocs messaging emotionally lands
  trustIndex:          71,
  brandMomentumScore:  82,   // trending up/down signal
};

// ─── Primary Emotion Breakdown (Plutchik's 8) ──────────────────────────────
// Score = share of brand conversation carrying this emotion (0-100)
const EMOTION_BREAKDOWN = {
  current:  { Joy: 72, Trust: 68, Anticipation: 61, Surprise: 45, Anger: 15, Fear: 18, Sadness: 12, Disgust: 8 },
  previous: { Joy: 65, Trust: 70, Anticipation: 55, Surprise: 38, Anger: 20, Fear: 22, Sadness: 15, Disgust: 10 },
  // What a healthy consumer brand looks like at benchmark
  benchmark:{ Joy: 68, Trust: 72, Anticipation: 58, Surprise: 40, Anger: 12, Fear: 14, Sadness: 10, Disgust: 6 },
};

// ─── Perception Gap Monitor ─────────────────────────────────────────────────
// Desired = what Crocs wants to be perceived as (internal brand aspiration)
// Actual  = what consumers actually perceive (social listening + survey)
const PERCEPTION_GAPS = [
  { attribute: "Fun & Playful",        desired: 92, actual: 85, trend: "stable" },
  { attribute: "Comfortable",          desired: 95, actual: 93, trend: "up" },
  { attribute: "Sustainable / Green",  desired: 82, actual: 34, trend: "down" },
  { attribute: "Fashionable / Stylish",desired: 72, actual: 54, trend: "up" },
  { attribute: "Inclusive",            desired: 88, actual: 74, trend: "stable" },
  { attribute: "Innovative",           desired: 76, actual: 57, trend: "up" },
  { attribute: "Value for Money",      desired: 80, actual: 78, trend: "stable" },
  { attribute: "Premium Quality",      desired: 65, actual: 43, trend: "stable" },
  { attribute: "Culturally Relevant",  desired: 85, actual: 80, trend: "up" },
];

// ─── Emotion Trend (12 weeks) ───────────────────────────────────────────────
const EMOTION_TREND = {
  weeks: ["Jan W1","Jan W2","Jan W3","Jan W4","Feb W1","Feb W2","Feb W3","Feb W4","Mar W1","Mar W2","Mar W3","Mar W4"],
  Joy:         [62, 65, 68, 70, 72, 69, 74, 76, 72, 75, 78, 72],
  Trust:       [72, 70, 68, 72, 74, 71, 69, 70, 72, 68, 65, 68],
  Anger:       [20, 18, 22, 25, 20, 18, 15, 14, 16, 15, 12, 15],
  Anticipation:[45, 50, 52, 55, 58, 60, 62, 65, 60, 62, 64, 61],
  // Key events to annotate
  events: [
    { week: "Feb W1", label: "Punch the Monkey launch", color: "#43B02A" },
    { week: "Mar W2", label: "Tariff news spike", color: "#ef4444" },
  ],
};

// ─── Audience Emotion Segmentation ─────────────────────────────────────────
const AUDIENCE_EMOTIONS = [
  { segment: "Gen Z",      Joy: 88, Trust: 62, Pride: 80, Excitement: 84, Nostalgia: 28, Anxiety: 22 },
  { segment: "Millennials",Joy: 76, Trust: 74, Pride: 65, Excitement: 62, Nostalgia: 70, Anxiety: 30 },
  { segment: "Parents",    Joy: 72, Trust: 84, Pride: 56, Excitement: 44, Nostalgia: 75, Anxiety: 28 },
  { segment: "Boomers+",   Joy: 44, Trust: 60, Pride: 28, Excitement: 26, Nostalgia: 55, Anxiety: 40 },
];

// ─── Competitor Emotion Positioning ─────────────────────────────────────────
const COMPETITOR_EMOTIONS = {
  brands: ["Crocs", "UGG", "Birkenstock", "Vans", "New Balance"],
  dimensions: {
    Joy:           [72, 64, 56, 70, 54],
    Trust:         [68, 74, 82, 66, 80],
    Excitement:    [76, 60, 50, 74, 58],
    Sustainability:[34, 52, 78, 46, 54],
    Premium:       [43, 80, 84, 56, 68],
  },
};

// ─── Emotional Risk & Opportunity Topics ────────────────────────────────────
// emotionIntensity: how strongly people feel about it (0-100)
// valence: positive (+) or negative (-), -100 to +100
const RISK_OPPORTUNITY_TOPICS = [
  { topic: "US Tariff Impact on Pricing",  category: "Macro",   emotionIntensity: 82, valence: -68, volume: "45K",  type: "risk",        primaryEmotion: "Fear / Anger" },
  { topic: "Sustainability Credibility",   category: "Brand",   emotionIntensity: 75, valence: -42, volume: "38K",  type: "risk",        primaryEmotion: "Distrust" },
  { topic: "Jibbitz Self-Expression",      category: "Product", emotionIntensity: 90, valence: 84,  volume: "125K", type: "opportunity", primaryEmotion: "Joy / Pride" },
  { topic: "Collab Culture (Punch Monkey)",category: "Brand",   emotionIntensity: 88, valence: 80,  volume: "98K",  type: "opportunity", primaryEmotion: "Delight" },
  { topic: "Comfort-First Consumer Shift", category: "Culture", emotionIntensity: 80, valence: 82,  volume: "110K", type: "opportunity", primaryEmotion: "Trust / Relief" },
  { topic: "Gen Z Identity & Individuality",category:"Culture", emotionIntensity: 78, valence: 72,  volume: "92K",  type: "opportunity", primaryEmotion: "Pride / Joy" },
  { topic: "Fast Fashion Backlash",        category: "Macro",   emotionIntensity: 68, valence: -38, volume: "58K",  type: "watch",       primaryEmotion: "Anger / Disgust" },
  { topic: "Price Sensitivity / Inflation",category: "Macro",   emotionIntensity: 72, valence: -58, volume: "44K",  type: "risk",        primaryEmotion: "Anxiety" },
  { topic: "China Manufacturing Concerns", category: "Macro",   emotionIntensity: 62, valence: -44, volume: "30K",  type: "watch",       primaryEmotion: "Uncertainty" },
  { topic: "Ugly-Cool Aesthetic Resurgence",category:"Culture", emotionIntensity: 84, valence: 78,  volume: "87K",  type: "opportunity", primaryEmotion: "Surprise / Delight" },
  { topic: "WNBA & Women in Sports",       category: "Culture", emotionIntensity: 76, valence: 74,  volume: "80K",  type: "opportunity", primaryEmotion: "Excitement / Pride" },
  { topic: "DEI Fatigue Among Brands",     category: "Macro",   emotionIntensity: 60, valence: -28, volume: "32K",  type: "watch",       primaryEmotion: "Ambivalence" },
];

// ─── Macro Environmental Signals ────────────────────────────────────────────
const MACRO_SIGNALS = [
  {
    signal: "US Tariffs on Footwear",
    area: "Business / Economy",
    risk: "high",
    trend: "rising",
    description: "New tariff proposals targeting Asian-manufactured goods could increase Crocs COGS by 15–25%. Consumer price sensitivity is already elevated. This is the #1 near-term reputational and business risk.",
    emotionDriver: "Fear / Anger",
    recommendation: "Proactively communicate pricing strategy and value narrative before tariffs hit headlines.",
  },
  {
    signal: "Sustainability Scrutiny & Greenwashing Risk",
    area: "Society / Regulation",
    risk: "high",
    trend: "rising",
    description: "Consumer and regulatory scrutiny of brand sustainability claims is intensifying globally. The 34-pt gap between Crocs' desired and actual sustainability perception is a significant liability.",
    emotionDriver: "Distrust / Anger",
    recommendation: "Substantiate sustainability claims with third-party verification. The perception gap here is the single largest emotion risk in the portfolio.",
  },
  {
    signal: "Comfort-First Consumer Culture",
    area: "Culture / Industry",
    risk: "low",
    trend: "growing",
    description: "Post-pandemic comfort culture is structurally entrenched, not a trend. Crocs is uniquely positioned as the defining brand of this shift. This tailwind should be actively amplified.",
    emotionDriver: "Joy / Trust / Relief",
    recommendation: "Double down on 'Comfort is Culture' messaging. This is the highest-resonance emotional territory Crocs owns.",
  },
  {
    signal: "Affordability Pressure",
    area: "Economy",
    risk: "medium",
    trend: "stable",
    description: "Consumer discretionary spending under pressure. Crocs' mid-price positioning is a relative strength vs. premium competitors, but any price increases from tariffs will amplify existing anxiety.",
    emotionDriver: "Anxiety / Relief",
    recommendation: "Strengthen value narrative and lean into entry-level price points in comms.",
  },
  {
    signal: "AI & Hyper-Personalisation",
    area: "Technology",
    risk: "low",
    trend: "growing",
    description: "Brands winning Gen Z loyalty are offering hyper-personalised experiences. Jibbitz customisation is a natural and defensible extension — this is a structural opportunity.",
    emotionDriver: "Excitement / Anticipation",
    recommendation: "Position Jibbitz as the original personalisation platform. Beat AI-native brands to this narrative.",
  },
  {
    signal: "Supply Chain Geopolitical Risk",
    area: "Business",
    risk: "medium",
    trend: "stable",
    description: "Ongoing geopolitical uncertainty in APAC manufacturing regions. Consumer awareness of supply chain issues is at an all-time high, creating reputational exposure if disruptions occur.",
    emotionDriver: "Uncertainty / Fear",
    recommendation: "Develop a proactive supply chain resilience narrative for stakeholder and media use.",
  },
];

// ─── Messaging Emotional Resonance ──────────────────────────────────────────
// emotionScore: raw emotional intensity the message provokes (0-100)
// resonance: how positively/favorably that emotion converts (0-100)
const MESSAGING_RESONANCE = [
  { message: '"Come As You Are"',        emotionScore: 88, resonance: 86, primaryEmotion: "Joy / Acceptance",    audience: "Gen Z + Millennials", flag: false, insight: "Highest-resonance platform message. Emotional authenticity drives sharing." },
  { message: '"Feel The Difference"',    emotionScore: 76, resonance: 72, primaryEmotion: "Trust / Comfort",     audience: "All segments",        flag: false, insight: "Strong rational-emotional bridge. Performs best in product context." },
  { message: '"Sustainability First"',   emotionScore: 44, resonance: 32, primaryEmotion: "Skepticism",          audience: "All segments",        flag: true,  insight: "WARNING: Consumers don't believe it. Triggers distrust, not pride. Retire until substantiated." },
  { message: '"Express Yourself"',       emotionScore: 84, resonance: 82, primaryEmotion: "Pride / Joy",         audience: "Gen Z",               flag: false, insight: "Strong with Gen Z. Tied directly to Jibbitz behavior — reinforce the connection." },
  { message: '"Comfort for Everyone"',   emotionScore: 78, resonance: 75, primaryEmotion: "Trust / Warmth",      audience: "Parents + Millennials",flag: false, insight: "Inclusive warmth resonates with family purchasers. Good for back-to-school context." },
  { message: '"The Ugly-Cool Icon"',     emotionScore: 92, resonance: 88, primaryEmotion: "Surprise / Delight",  audience: "Gen Z",               flag: false, insight: "Highest raw emotion score. Leans into the brand's identity dissonance — a competitive moat." },
  { message: '"Born to Be Comfortable"', emotionScore: 72, resonance: 68, primaryEmotion: "Relief / Trust",      audience: "Millennials + Boomers",flag: false, insight: "Functional credibility message. Works for conversion but low virality." },
  { message: '"Wonderfully Unordinary"', emotionScore: 90, resonance: 89, primaryEmotion: "Pride / Delight",      audience: "Gen Z + Millennials",  flag: false, insight: "Strongest brand identity message in the portfolio. Owns the 'ugly-cool' contradiction — turns the brand's biggest weakness into its biggest strength." },
  { message: '"Do Your Thing"',          emotionScore: 85, resonance: 83, primaryEmotion: "Freedom / Joy",        audience: "Gen Z",                flag: false, insight: "Permission-based messaging that resonates with Gen Z's self-expression values. Short, ownable, high-virality format." },
  { message: '"Glad You Noticed"',       emotionScore: 88, resonance: 86, primaryEmotion: "Confidence / Wit",     audience: "Gen Z + Millennials",  flag: false, insight: "Best-in-class message for earned media and social. The wink at haters converts detractors into brand conversation — net positive even from negative attention." },
  { message: '"Let Them Talk"',          emotionScore: 92, resonance: 91, primaryEmotion: "Defiance / Pride",     audience: "Gen Z",                flag: false, insight: "Highest resonance score in the set. Taps directly into Gen Z's anti-conformity identity. Transforms brand polarisation into a cultural badge of honour." },
];
