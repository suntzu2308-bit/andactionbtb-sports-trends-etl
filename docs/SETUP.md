# Setup

1. Create a Google Sheet with tabs named `Live Trends`, `Instagram Reels`, and `Top 5 Opportunities`.
2. Open **Extensions → Apps Script** and create four script files matching the files under `src/`.
3. Under **Project Settings → Script Properties**, add:
   - `SPREADSHEET_ID`: the target spreadsheet ID
   - `INSTAGRAM_ACCOUNT_ID`: your authorized Instagram professional account ID
   - `INSTAGRAM_ACCESS_TOKEN`: your private Meta user/Page access token with appropriate permissions
4. In Apps Script, run `runSportsTrends`, then `collectInstagramReels`, then `buildSportsTop5` manually. Inspect the execution log and Sheets output.
5. Run `runAndActionMaster` manually to validate the full ordered pipeline.
6. Only after validation, run `setupAndActionMaster` once. It installs one six-hour trigger and removes individual-stage triggers.

**Do not run stage-specific trigger setup functions after installing the master trigger.**

## Sheet schemas

- **Live Trends:** Last Seen ET, Trend, League, Traffic Label, Sightings, First Seen ET, Article URL, Search Status
- **Instagram Reels:** Collected ET, Sport Hashtag, Media ID, Media Type, Published, Instagram URL, Discovery Status
- **Top 5 Opportunities:** Report ET, Rank, League, Media Type, Published, Instagram URL, Google Trends Match, Priority, Editorial Status

## Permissions and API constraints

Instagram hashtag discovery is subject to Meta's API permissions and limits. A successful account metadata test does **not** guarantee hashtag-search access. Test the relevant endpoints with your own authorized account. The API may omit Reel-specific classification and public engagement metrics.

Time-based triggers are approximate, not exact-clock schedules. Inspect **Executions** periodically and refresh/rotate tokens before expiration.
