#!/usr/bin/env python3
"""
fetch_trends.py — Cultural Pulse Trends Fetcher
Pulls GENERAL trending searches (what people are searching for right now)
across 8 markets and writes:
  1. crocs_trends_YYYY-MM-DD.xlsx  (one sheet per market, trending topics)
  2. google-trends-data.js         (updates the dashboard automatically)

This fetches TRENDING SEARCHES (not brand-specific) so the team can see
what's happening in culture across markets and spot Crocs activation moments.

HOW TO GET AROUND GOOGLE'S BLOCKING:
  Option A (recommended — free 100 searches/month):
    Sign up at serpapi.com, get your API key, then run:
      python3 fetch_trends.py --api serpapi --key YOUR_API_KEY

  Option B (pytrends — free but may get 429 blocked):
    python3 fetch_trends.py --api pytrends
    If blocked: add --cookies (copies cookies from your Chrome session)
    If still blocked: try a VPN or wait a few hours

  Option C (manual):
    1. Go to trends.google.com → "Trending Now" for each country
    2. Copy the top 20 trends into the Excel template (one sheet per market)
    3. Drag the completed file onto the dashboard upload zone

Usage:
  pip install pytrends openpyxl requests
  python3 fetch_trends.py --api pytrends
"""

import sys
import time
import json
import math
import random
import argparse
import datetime
import os

# ── Config ────────────────────────────────────────────────────────────────────
# Maps market names to pytrends country codes
MARKETS = [
    ("United States", "US"),
    ("United Kingdom", "GB"),
    ("Germany",        "DE"),
    ("France",         "FR"),
    ("South Korea",    "KR"),
    ("Japan",          "JP"),
    ("India",          "IN"),
    ("China",          "CN"),
]
# Pytrends country name map (used for trending_searches())
PYTRENDS_COUNTRY_NAMES = {
    "US": "united_states", "GB": "united_kingdom", "DE": "germany",
    "FR": "france",        "KR": "south_korea",    "JP": "japan",
    "IN": "india",
}
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Helpers ───────────────────────────────────────────────────────────────────
def log(msg): print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}")


def sleep_politely(min_s=4, max_s=9):
    """Random delay to avoid triggering Google's rate limiter."""
    delay = random.uniform(min_s, max_s)
    log(f"  waiting {delay:.1f}s …")
    time.sleep(delay)


# ── pytrends fetcher — TRENDING SEARCHES (not brand-specific) ─────────────────
def fetch_with_pytrends(market_name, geo, use_cookies=False):
    try:
        from pytrends.request import TrendReq
    except ImportError:
        print("ERROR: pytrends not installed. Run: pip install pytrends")
        sys.exit(1)

    kwargs = {"hl": "en-US", "tz": 0, "timeout": (10, 25), "retries": 3, "backoff_factor": 2}

    if use_cookies:
        try:
            import browser_cookie3
            cookies = browser_cookie3.chrome(domain_name=".google.com")
            kwargs["requests_args"] = {"cookies": cookies}
            log(f"  Using Chrome cookies for {market_name}")
        except Exception as e:
            log(f"  WARNING: Could not load Chrome cookies ({e}).")

    pt = TrendReq(**kwargs)
    country_name = PYTRENDS_COUNTRY_NAMES.get(geo, "united_states")
    log(f"  Fetching trending searches: {market_name} ({geo}) …")

    try:
        # trending_searches returns daily trending topics — no keyword needed
        trending_df = pt.trending_searches(pn=country_name)
        sleep_politely()

        trending = []
        for i, row in enumerate(trending_df.itertuples(), 1):
            trending.append({
                "rank": i,
                "term": str(row[1]),
                "searchVolume": "",  # pytrends doesn't return volume for trending
                "category": "Culture",  # category detection would need a separate API call
                "momentum": "up",
                "relatedTerms": [],
                "crocsAngle": "",
            })

        return {"geo": geo, "dailyTrending": trending, "categoryBreakdown": {}}

    except Exception as e:
        log(f"  ERROR for {market_name}: {e}")
        return {"geo": geo, "dailyTrending": [], "categoryBreakdown": {}, "error": str(e)}


# ── SerpAPI fetcher — TRENDING SEARCHES ──────────────────────────────────────
def fetch_with_serpapi(market_name, geo, api_key):
    import requests

    log(f"  Fetching trending searches: {market_name} ({geo}) via SerpAPI …")

    # SerpAPI Google Trends Trending Now endpoint
    params = {
        "engine": "google_trends_trending_now",
        "geo": geo,
        "hours": "168",  # past 7 days (168h) for broader picture
        "api_key": api_key,
    }

    try:
        r = requests.get("https://serpapi.com/search", params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        sleep_politely(1, 3)

        trending = []
        for i, item in enumerate(data.get("trending_searches", []), 1):
            queries = item.get("queries", [{}])
            term = queries[0].get("query", "") if queries else item.get("title", {}).get("query", "")
            vol = item.get("formattedTraffic", "") or item.get("traffic", "")
            related = [q.get("query", "") for q in queries[1:4]]
            trending.append({
                "rank": i,
                "term": term,
                "searchVolume": str(vol),
                "category": item.get("categories", [{}])[0].get("name", "Culture") if item.get("categories") else "Culture",
                "momentum": "breakout" if i <= 3 else "up",
                "relatedTerms": related,
                "crocsAngle": "",
            })

        return {"geo": geo, "dailyTrending": trending, "categoryBreakdown": {}}

    except Exception as e:
        log(f"  ERROR for {market_name}: {e}")
        return {"geo": geo, "dailyTrending": [], "categoryBreakdown": {}, "error": str(e)}


# ── Excel writer ──────────────────────────────────────────────────────────────
def write_excel(all_data, pulled_at, output_path):
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill
        from openpyxl.utils import get_column_letter
    except ImportError:
        log("WARNING: openpyxl not installed — skipping Excel output. Run: pip install openpyxl")
        return

    wb = openpyxl.Workbook()
    pulled_str = pulled_at.strftime("%Y-%m-%d %H:%M")

    # ── Summary sheet ──
    ws_sum = wb.active
    ws_sum.title = "Summary"
    ws_sum["A1"] = "Cultural Pulse — Google Trending Searches"
    ws_sum["A2"] = f"Pulled: {pulled_str} | General trending topics, not brand-specific"
    ws_sum["A3"] = "Use this to spot cultural moments across markets that Crocs can activate on."
    ws_sum.append([])

    headers = ["Market", "Geo", "Trending Topics", "Top Trend", "Search Volume"]
    ws_sum.append(headers)
    for col_num, h in enumerate(headers, 1):
        cell = ws_sum.cell(row=5, column=col_num)
        cell.fill = PatternFill("solid", fgColor="1D1D1B")
        cell.font = Font(bold=True, color="FFFFFF")

    row = 6
    for market_name, geo in MARKETS:
        d = all_data.get(market_name, {})
        if d.get("blocked"):
            ws_sum.cell(row=row, column=1, value=market_name)
            ws_sum.cell(row=row, column=2, value=geo)
            ws_sum.cell(row=row, column=3, value="Google blocked in this market")
        else:
            trending = d.get("dailyTrending", [])
            top = trending[0] if trending else {}
            ws_sum.cell(row=row, column=1, value=market_name)
            ws_sum.cell(row=row, column=2, value=geo)
            ws_sum.cell(row=row, column=3, value=len(trending))
            ws_sum.cell(row=row, column=4, value=top.get("term", ""))
            ws_sum.cell(row=row, column=5, value=top.get("searchVolume", ""))
        row += 1

    for col in ws_sum.columns:
        max_len = max((len(str(c.value or "")) for c in col), default=0)
        ws_sum.column_dimensions[get_column_letter(col[0].column)].width = min(max_len + 4, 50)

    # ── Per-market sheets — one row per trending topic ──
    TRENDING_HEADERS = ["Rank", "Term", "Search Volume", "Category", "Momentum", "Related Terms", "Crocs Angle"]
    for market_name, geo in MARKETS:
        ws = wb.create_sheet(title=market_name)
        ws["A1"] = f"{market_name} — Trending Searches"
        ws["A2"] = f"Geo: {geo} | Pulled: {pulled_str}"
        ws.append([])
        ws.append(TRENDING_HEADERS)
        for col_num, h in enumerate(TRENDING_HEADERS, 1):
            cell = ws.cell(row=4, column=col_num)
            cell.fill = PatternFill("solid", fgColor="43B02A")
            cell.font = Font(bold=True, color="FFFFFF")

        d = all_data.get(market_name, {})
        if d.get("blocked"):
            ws.append(["—", d.get("blockedNote", "Google unavailable"), "", "", "", "", ""])
        else:
            for t in d.get("dailyTrending", []):
                ws.append([
                    t.get("rank", ""), t.get("term", ""), t.get("searchVolume", ""),
                    t.get("category", ""), t.get("momentum", ""),
                    ", ".join(t.get("relatedTerms", [])), t.get("crocsAngle", ""),
                ])

        for col in ws.columns:
            max_len = max((len(str(c.value or "")) for c in col), default=0)
            ws.column_dimensions[get_column_letter(col[0].column)].width = min(max_len + 4, 60)

    wb.save(output_path)
    log(f"Excel saved → {output_path}")


# ── JS writer ─────────────────────────────────────────────────────────────────
def write_js(all_data, pulled_at, js_path):
    now_iso = pulled_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    date_str = pulled_at.strftime("%Y-%m-%d")

    # Read existing file to preserve GT_CAT_COLORS, GTRENDS_GLOBAL_MOMENTS etc.
    # We only replace the GTRENDS_TRENDING block and GTRENDS_META
    trending_js = json.dumps(all_data, ensure_ascii=False, indent=2)

    output = f"""// Google Trends — Cultural Pulse Data
// Auto-generated by fetch_trends.py on {date_str}
// DO NOT EDIT MANUALLY — re-run fetch_trends.py to update

const GTRENDS_META = {{
  pulledAt: "{now_iso}",
  source: "Google Trends — Daily Trending Searches",
  note: "Rankings reflect relative search volume within each market on the snapshot date.",
  sampleData: false,
}};

// Category colour map (used across charts and badges)
const GT_CAT_COLORS = {{
  "Sports":        {{ bg: "#eff6ff", text: "#1d4ed8", bar: "#3b82f6" }},
  "Entertainment": {{ bg: "#fdf4ff", text: "#7e22ce", bar: "#a855f7" }},
  "Music":         {{ bg: "#fce7f3", text: "#be185d", bar: "#ec4899" }},
  "Fashion":       {{ bg: "#fff7ed", text: "#c2410c", bar: "#f97316" }},
  "Technology":    {{ bg: "#f0fdf4", text: "#166534", bar: "#22c55e" }},
  "Gaming":        {{ bg: "#e0f2fe", text: "#0369a1", bar: "#0ea5e9" }},
  "Film & TV":     {{ bg: "#f5f3ff", text: "#5b21b6", bar: "#8b5cf6" }},
  "Culture":       {{ bg: "#fef9c3", text: "#854d0e", bar: "#eab308" }},
  "Health":        {{ bg: "#f0fdfa", text: "#065f46", bar: "#10b981" }},
  "Food":          {{ bg: "#fff1f2", text: "#9f1239", bar: "#f43f5e" }},
  "News":          {{ bg: "#f8fafc", text: "#334155", bar: "#64748b" }},
  "Travel":        {{ bg: "#ecfdf5", text: "#064e3b", bar: "#059669" }},
}};

const GTRENDS_MARKETS = [{", ".join(f'"{m}"' for m, _ in MARKETS)}];

// NOTE: GTRENDS_GLOBAL_MOMENTS is defined manually in the original data file
// and is not overwritten by fetch_trends.py — edit it in google-trends-data.js directly.

const GTRENDS_TRENDING = {trending_js};
"""

    with open(js_path, "w", encoding="utf-8") as f:
        f.write(output)
    log(f"JS data file saved → {js_path}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Fetch Google Trends data for Crocs")
    parser.add_argument("--api", choices=["pytrends", "serpapi"], default="pytrends",
                        help="Which API to use (default: pytrends)")
    parser.add_argument("--key", default=None,
                        help="SerpAPI key (required if --api serpapi)")
    parser.add_argument("--cookies", action="store_true",
                        help="Use Chrome cookies to help bypass pytrends blocking")
    parser.add_argument("--out-dir", default=OUTPUT_DIR,
                        help="Output directory (default: same as this script)")
    args = parser.parse_args()

    if args.api == "serpapi" and not args.key:
        print("ERROR: --key is required when using --api serpapi")
        print("  Sign up free at serpapi.com (100 free searches/month)")
        sys.exit(1)

    pulled_at = datetime.datetime.utcnow()
    all_data = {}

    log(f"Starting cultural trending fetch via {args.api.upper()}")
    log(f"Markets: {len(MARKETS)} | Fetching: daily trending searches (general, not brand-specific)")
    log("")

    for market_name, geo in MARKETS:
        if geo == "CN":
            log(f"Skipping {market_name} (CN) — Google Trends not available in mainland China")
            all_data[market_name] = {
                "blocked": True,
                "blockedNote": "Google services are blocked in mainland China. Use Baidu Index or Weibo.",
                "geo": "CN",
            }
            continue

        log(f"Market: {market_name} ({geo})")
        if args.api == "serpapi":
            result = fetch_with_serpapi(market_name, geo, args.key)
        else:
            result = fetch_with_pytrends(market_name, geo, use_cookies=args.cookies)

        all_data[market_name] = result
        log(f"  → {len(result.get('dailyTrending', []))} trending topics fetched")
        sleep_politely(3, 6)

    date_str = pulled_at.strftime("%Y-%m-%d")
    xlsx_path = os.path.join(args.out_dir, f"crocs_trends_{date_str}.xlsx")
    js_path = os.path.join(args.out_dir, "google-trends-data.js")

    log("")
    log("Writing outputs …")
    write_excel(all_data, pulled_at, xlsx_path)
    write_js(all_data, pulled_at, js_path)

    log("")
    log("Done! Next steps:")
    log("  1. Upload the Excel to the dashboard (drag & drop) — or")
    log("  2. git add google-trends-data.js && git commit -m 'Update Google Trends data' && git push")
    log("  3. The dashboard at GitHub Pages will reflect updated data within ~60 seconds")


if __name__ == "__main__":
    main()
