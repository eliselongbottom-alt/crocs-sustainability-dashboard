#!/usr/bin/env python3
"""
fetch_jibbitz_news.py — Jibbitz Opportunity Scanner
Queries NewsAPI for trending cultural moments, scores each for Jibbitz
potential using Claude, and writes jibbitz-live-data.js for the dashboard.

Setup:
  pip install anthropic requests
  export NEWSAPI_KEY=your_key        # free at newsapi.org (100 req/day)
  export ANTHROPIC_API_KEY=your_key  # from console.anthropic.com
  python3 fetch_jibbitz_news.py

GitHub Actions runs this daily — see .github/workflows/fetch-jibbitz.yml
"""

import os, sys, json, time, re, hashlib, datetime, requests

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic not installed. Run: pip install anthropic")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────
NEWSAPI_KEY    = os.environ.get("NEWSAPI_KEY", "")
ANTHROPIC_KEY  = os.environ.get("ANTHROPIC_API_KEY", "")
OUTPUT_PATH    = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jibbitz-live-data.js")
EXISTING_PATH  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jibbitz-data.js")
MIN_SCORE      = 65   # drop anything Claude rates below this
MAX_ENTRIES    = 20   # cap on live entries written to file
MODEL          = "claude-opus-4-7"

# Search queries — broad cultural moment signals, not Crocs-specific
QUERIES = [
    "went viral TikTok meme 2026",
    "trending social media internet moment",
    "viral food trend 2026",
    "internet obsessed pop culture",
    "viral animal moment",
    "meme trending Gen Z",
    "viral moment celebrity 2026",
]

CATEGORIES = ["memes", "food", "pop-culture", "animals", "sports", "fashion", "gaming", "entertainment"]

def log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}")


# ── NewsAPI fetch ─────────────────────────────────────────────────────────────
def fetch_articles():
    if not NEWSAPI_KEY:
        print("ERROR: NEWSAPI_KEY not set. Get a free key at newsapi.org")
        sys.exit(1)

    seen_urls = set()
    articles = []

    for query in QUERIES:
        log(f"Querying NewsAPI: {query!r}")
        try:
            r = requests.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 10,
                    "apiKey": NEWSAPI_KEY,
                },
                timeout=15,
            )
            r.raise_for_status()
            data = r.json()

            for a in data.get("articles", []):
                url = a.get("url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    articles.append(a)

            time.sleep(0.5)

        except Exception as e:
            log(f"  WARNING: NewsAPI error for {query!r}: {e}")

    log(f"Fetched {len(articles)} unique articles")
    return articles


# ── Extract existing IDs so we don't duplicate ───────────────────────────────
def load_existing_ids():
    ids = set()
    if not os.path.exists(EXISTING_PATH):
        return ids
    with open(EXISTING_PATH, encoding="utf-8") as f:
        for line in f:
            m = re.search(r'id:\s*["\']([^"\']+)["\']', line)
            if m:
                ids.add(m.group(1))

    # Also load from existing live file if present
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, encoding="utf-8") as f:
            for line in f:
                m = re.search(r'id:\s*["\']([^"\']+)["\']', line)
                if m:
                    ids.add(m.group(1))

    return ids


# ── Article → Jibbitz opportunity scorer (Claude) ────────────────────────────
SCORE_PROMPT = """You are a cultural trend analyst for Crocs, evaluating whether a news story represents a Jibbitz charm opportunity.

Jibbitz are small shoe charms. The best opportunities are:
- A clear, iconic visual that works at 2cm scale (simple silhouette, recognisable object)
- Driven by irony, self-expression, Gen Z/Millennial humour, or "ugly-cool" energy
- No or minimal licensing risk (generic concepts > named IP)
- Still culturally active (not fully over)

Evaluate the article below. Return ONLY valid JSON, no other text:

{
  "isOpportunity": true/false,
  "jibbitzScore": 0-100,
  "name": "Short punchy name for the trend (max 4 words)",
  "category": one of: "memes" | "food" | "pop-culture" | "animals" | "sports" | "fashion" | "gaming" | "entertainment",
  "description": "2-3 sentence description of the cultural moment and why it works as a Jibbitz. Write like a trend brief — concrete, specific, no fluff.",
  "charmConcept": "One sentence describing the actual charm object/shape. Must be specific and visual.",
  "stageDetail": "One sentence on licensing risk and timing window.",
  "estimatedVelocity": 0-100,
  "estimatedSentiment": 0-100,
  "estimatedSocialVolume": integer (estimated total social mentions/views — e.g. 5000000),
  "confidence": "verified" or "modeled",
  "confidenceNote": "Brief note on why verified or modeled — cite article source if verified"
}

If isOpportunity is false, still return the full JSON with low jibbitzScore.

ARTICLE:
Title: {title}
Source: {source}
Published: {published}
Description: {description}
"""

def score_article(client, article, existing_ids):
    title       = article.get("title") or ""
    description = article.get("description") or article.get("content") or ""
    source      = (article.get("source") or {}).get("name", "Unknown")
    published   = article.get("publishedAt", "")[:10]

    if not title or len(title) < 10:
        return None

    prompt = SCORE_PROMPT.format(
        title=title,
        source=source,
        published=published,
        description=description[:800],
    )

    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()

        # Extract JSON even if Claude wrapped it in ```
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if not json_match:
            return None

        result = json.loads(json_match.group())

        if not result.get("isOpportunity"):
            return None
        if result.get("jibbitzScore", 0) < MIN_SCORE:
            return None

        # Build ID from name slug
        name = result.get("name", title[:30])
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        if slug in existing_ids:
            return None

        # Build a 14-point flat search trend (rising curve)
        score = result.get("jibbitzScore", 70)
        velocity = result.get("estimatedVelocity", 60)
        trend = _make_trend_curve(score, velocity)

        return {
            "id": slug,
            "name": name,
            "category": result.get("category", "pop-culture"),
            "confidence": result.get("confidence", "modeled"),
            "confidenceNote": result.get("confidenceNote", f"Sourced from: {source}, {published}"),
            "description": result.get("description", ""),
            "source": source,
            "daysTrending": 7,
            "socialVolume": result.get("estimatedSocialVolume", 1000000),
            "velocity": velocity,
            "sentiment": result.get("estimatedSentiment", 75),
            "jibbitzScore": score,
            "stage": "evaluation" if velocity >= 60 else "watching",
            "stageDetail": result.get("stageDetail", ""),
            "searchTrend": trend,
            "regional": {"US": 80, "JP": 55, "CN": 50, "KR": 60, "IN": 55, "UK": 78, "FR": 72, "DE": 70},
            "audience": {"Gen Z": 88, "Millennials": 72, "Parents": 38, "Kids": 30},
        }

    except Exception as e:
        log(f"  Claude error: {e}")
        return None


def _make_trend_curve(score, velocity):
    """Generate a plausible 14-point rising search trend."""
    peak = min(100, score + 5)
    ramp_start = max(1, 100 - velocity)
    curve = []
    for i in range(14):
        if i < 8:
            val = 0
        elif i < 11:
            val = round(ramp_start + (peak - ramp_start) * ((i - 8) / 3))
        else:
            val = round(peak - (i - 11) * 3)
        curve.append(max(0, min(100, val)))
    return curve


# ── JS writer ─────────────────────────────────────────────────────────────────
def write_js(entries, pulled_at):
    date_str = pulled_at.strftime("%Y-%m-%d")
    now_iso  = pulled_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    data_js  = json.dumps(entries, ensure_ascii=False, indent=2)

    output = f"""// Jibbitz Live Opportunities — auto-generated by fetch_jibbitz_news.py
// Generated: {date_str} | DO NOT EDIT MANUALLY
// These entries are merged into JIBBITZ_TRENDS at dashboard load time.

const JIBBITZ_LIVE_META = {{
  pulledAt: "{now_iso}",
  entryCount: {len(entries)},
  source: "NewsAPI + Claude scoring",
}};

const JIBBITZ_LIVE_TRENDS = {data_js};
"""
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(output)
    log(f"Wrote {len(entries)} entries → {OUTPUT_PATH}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not ANTHROPIC_KEY:
        print("ERROR: ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    pulled_at = datetime.datetime.utcnow()

    log("Fetching articles from NewsAPI …")
    articles = fetch_articles()

    log("Loading existing Jibbitz IDs …")
    existing_ids = load_existing_ids()
    log(f"  {len(existing_ids)} existing entries to avoid duplicating")

    log("Scoring articles with Claude …")
    entries = []
    for i, article in enumerate(articles):
        if len(entries) >= MAX_ENTRIES:
            break
        log(f"  [{i+1}/{len(articles)}] {(article.get('title') or '')[:60]}")
        entry = score_article(client, article, existing_ids)
        if entry:
            existing_ids.add(entry["id"])
            entries.append(entry)
            log(f"    ✓ Added: {entry['name']} (score: {entry['jibbitzScore']})")
        time.sleep(0.5)

    entries.sort(key=lambda e: e["jibbitzScore"], reverse=True)
    log(f"\n{len(entries)} opportunities found")

    write_js(entries, pulled_at)
    log("Done.")


if __name__ == "__main__":
    main()
