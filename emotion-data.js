// Emotion Intelligence — Data Layer

const EMOTION_LAST_UPDATED = "2026-04-18";

// ─── Brand Emotion Profile (Plutchik's Wheel) ───────────────────────────────
// Rubric-estimated: directional scores based on qualitative review of
// Crocs' social content tone (TikTok, Instagram, Reddit), press coverage
// sentiment, and product reviews. Not from a paid social listening tool.
// Score = estimated share of brand conversation carrying this emotion (0–100).
const EMOTION_BREAKDOWN = {
  current: {
    Joy:          75,  // overwhelmingly positive, playful, fun social content
    Trust:        65,  // reliable product; sustainability skepticism drags this
    Anticipation: 58,  // collab drops, new colorways, Jibbitz culture
    Surprise:     45,  // ugly-cool positioning inherently creates surprise
    Anger:        16,  // haters + tariff/pricing concerns
    Fear:         14,  // pricing anxiety from tariff exposure
    Sadness:       8,  // minimal
    Disgust:      10,  // aesthetic detractors ("they're ugly")
  },
};

// ─── Methodology & Sourcing ─────────────────────────────────────────────────
const EMOTION_METHODOLOGY = {
  sections: [
    {
      id: "radar",
      title: "Brand Emotion Profile",
      method: "Plutchik's Wheel of Emotions (8 primary emotions)",
      source: "Rubric-estimated — directional scores based on qualitative review of Crocs social content tone (TikTok, Instagram, Reddit), press coverage sentiment, and product reviews. Not from a paid social listening tool.",
      production: "NLP emotion classification (e.g. IBM Watson Tone Analyzer, Symanto, or custom model) applied to social mentions, news, and reviews",
      framework: "Robert Plutchik's psychoevolutionary theory of emotion (1980) — the industry standard for brand emotion analysis",
    },
    {
      id: "macro",
      title: "Macro Environmental Scan",
      method: "Qualitative signal identification with risk rating",
      source: "Based on publicly available sources: Reuters/AP tariff coverage (Mar 2026), Edelman Trust Barometer 2025, Mintel sustainability in apparel report 2025, McKinsey State of Fashion 2026, Pew Research consumer sentiment data",
      production: "Environmental Scan combines Harvard Harris Poll primary research + Mintel/Statista secondary research + proprietary social listening. This prototype replicates the output format using public sources.",
      framework: "PESTLE-adjacent scan (Political, Economic, Social, Technology, Legal, Environmental) filtered for Crocs' specific risk profile",
    },
    {
      id: "messaging",
      title: "Messaging Emotional Resonance",
      method: "Two scores per message: Emotional Intensity + Resonance",
      source: "Rubric-based — no primary research. Scored using a 5-dimension Gen Z messaging framework (Authenticity + Identity signal + Memorability + Emotional specificity + Cultural fit). Not based on live social data.",
      production: "A/B message testing via Lucid or Pollfish panel. Alternatively: social listening filtered to posts containing each tagline, with emotion + sentiment scoring applied to reply threads.",
      framework: "Emotional Intensity ≠ Resonance. A message can trigger high intensity (e.g. controversy) but low resonance (negative conversion). Both dimensions required for full picture.",
    },
  ],
};

// ─── Macro Environmental Signals ────────────────────────────────────────────
const MACRO_SIGNALS = [
  {
    signal: "US Tariffs on Footwear",
    area: "Business / Economy",
    risk: "high",
    trend: "rising",
    description: "New tariff proposals targeting Asian-manufactured goods could increase Crocs COGS significantly. Consumer price sensitivity is already elevated. This is the #1 near-term reputational and business risk.",
    emotionDriver: "Fear / Anger",
    recommendation: "Proactively communicate pricing strategy and value narrative before tariffs hit headlines.",
  },
  {
    signal: "Sustainability Scrutiny & Greenwashing Risk",
    area: "Society / Regulation",
    risk: "high",
    trend: "rising",
    description: "Consumer and regulatory scrutiny of brand sustainability claims is intensifying globally. The gap between Crocs' desired and actual sustainability perception is a significant liability.",
    emotionDriver: "Distrust / Anger",
    recommendation: "Substantiate sustainability claims with third-party verification. Closing the sustainability perception gap is the single largest emotion risk in the portfolio.",
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
// Scoring methodology: 5-dimension Gen Z messaging rubric
//   Authenticity (0-20) + Identity signal (0-20) + Memorability (0-20)
//   + Emotional specificity (0-20) + Cultural fit (0-20) = emotion score
//   Resonance weights authenticity and cultural fit more heavily (positive conversion vs. raw intensity)
//   These are rubric estimates — not from primary research.
const MESSAGING_RESONANCE = [
  { message: '"Wonderfully Unordinary"', emotionScore: 90, resonance: 89, primaryEmotion: "Pride / Delight",    audience: "Gen Z + Millennials",       flag: false, insight: "Strongest brand identity message in the portfolio. Owns the brand's contradiction — turns the biggest perceived weakness into its biggest strength." },
  { message: '"Come As You Are"',        emotionScore: 88, resonance: 86, primaryEmotion: "Joy / Acceptance",   audience: "Gen Z + Millennials",       flag: false, insight: "High-resonance inclusivity message. Emotional authenticity drives sharing and lowers acquisition barriers." },
  { message: '"Do Your Thing"',          emotionScore: 85, resonance: 83, primaryEmotion: "Freedom / Joy",      audience: "Gen Z",                     flag: false, insight: "Permission-based messaging that resonates with Gen Z's self-expression values. Short, ownable, high-virality format." },
  { message: '"Glad You Noticed"',       emotionScore: 88, resonance: 86, primaryEmotion: "Confidence / Wit",   audience: "Gen Z + Millennials",       flag: false, insight: "Best-in-class message for earned media and social. The wink at haters converts detractors into brand conversation — net positive even from negative attention." },
  { message: '"Let Them Talk"',          emotionScore: 92, resonance: 91, primaryEmotion: "Defiance / Pride",   audience: "Gen Z",                     flag: false, insight: "Highest resonance score in the set. Taps directly into Gen Z's anti-conformity identity. Transforms brand polarisation into a cultural badge of honour." },
  { message: '"Play Hard. Rest Easy"',   emotionScore: 74, resonance: 70, primaryEmotion: "Energy / Relief",    audience: "Active Millennials + Gen Z", flag: false, insight: "Conventional dual-benefit structure reads more sportswear (Nike/UA) than Crocs. Low identity signal for Gen Z — comfort is the payoff but there's no self-expression handle. Strong in product/performance contexts but limited virality potential." },
  { message: '"That Crocs Feeling"',     emotionScore: 83, resonance: 81, primaryEmotion: "Joy / Nostalgia",    audience: "All segments",              flag: false, insight: "Brand-specific and experience-led — 'That feeling' is an open invitation that consumers fill with personal meaning. High UGC potential. The definite article makes it ownable in a way generic benefit messages aren't." },
];

// ─── Measurement Capability Status ──────────────────────────────────────────
const CAPABILITY_STATUS = [
  { capability: "Marketing Mix Model (MMM)", status: "confirmed", crocs: "Confirmed", priority: "extend", note: "Most valuable existing asset. Opportunity: extend MMM with brand health score as input variable — turns a media planning tool into a brand equity valuation instrument." },
  { capability: "50%+ Digital Revenue (Closed Loop)", status: "confirmed", crocs: "Confirmed", priority: "leverage", note: "For majority of revenue, the full attribution chain is observable — campaign exposure → purchase → repeat behaviour. This is a rare competitive measurement advantage." },
  { capability: "Jibbitz Attach Rate Tracking", status: "confirmed", crocs: "Confirmed (unique to Crocs)", priority: "scale", note: "Uniquely Crocs measurement signal. Should be a primary KPI in every brand and product review." },
  { capability: "Brand Tracking Surveys (Quarterly)", status: "needed", crocs: "Needs structure", priority: "immediate", note: "Design quarterly survey instrument. Commission Harris Poll or YouGov. First survey in field by Q2 2026. This feeds directly into brand resonance scoring." },
  { capability: "Sentiment Listening Pipeline", status: "partial", crocs: "Partial", priority: "upgrade", note: "Social listening exists but not structured for brand health scoring. Brandwatch or Sprinklr enterprise setup needed to feed brand resonance systematically." },
  { capability: "Unified Customer ID / CDP", status: "investment", crocs: "Investment needed", priority: "phase3", note: "Most important long-term infrastructure. Enables full cross-channel LTV model and connects brand health movements to revenue outcomes. Evaluate Segment, mParticle, or Salesforce CDP in Q2–Q3 2026." },
];
