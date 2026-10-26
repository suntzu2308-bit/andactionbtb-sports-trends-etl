// Editorial prioritization by freshness and league-level trend overlap.
// This is NOT a view-count or verified viral ranking.
function buildSportsTop5() {
  const ss = SpreadsheetApp.openById(aaSpreadsheetId_());
  const media = ss.getSheetByName('Instagram Reels');
  if (!media) throw new Error('Instagram Reels sheet missing');
  const live = ss.getSheetByName('Live Trends');
  const activeLeagues = new Set();
  if (live && live.getLastRow() > 1) {
    live.getRange(2, 3, live.getLastRow() - 1, 1).getValues()
      .forEach(row => activeLeagues.add(String(row[0]).toUpperCase()));
  }
  const leagueMap = {
    nfl: 'NFL', nba: 'NBA', nhl: 'NHL', ufc: 'UFC',
    mlb: 'MLB', collegefootball: 'NCAAF', ncaaf: 'NCAAF',
    soccer: 'Soccer', tennis: 'Tennis'
  };
  const cutoff = Date.now() - 48 * 3600000;
  const seen = new Set();
  const candidates = media.getLastRow() > 1
    ? media.getRange(2, 1, media.getLastRow() - 1, 7).getValues()
      .map(row => {
        const tag = String(row[1]).toLowerCase();
        const published = new Date(row[4]).getTime();
        const league = leagueMap[tag] || tag.toUpperCase();
        return {
          id: String(row[2]), type: String(row[3]).toUpperCase(),
          published: row[4], timestamp: published, url: String(row[5]),
          league: league, match: activeLeagues.has(league.toUpperCase())
        };
      }).filter(item => {
        if (!item.id || !item.url || seen.has(item.id) ||
            !['VIDEO', 'REEL'].includes(item.type) ||
            !Number.isFinite(item.timestamp) ||
            item.timestamp < cutoff || item.timestamp > Date.now()) return false;
        seen.add(item.id);
        return true;
      })
    : [];
  candidates.sort((a, b) =>
    (Number(b.match) - Number(a.match)) || (b.timestamp - a.timestamp));
  const selected = [];
  const used = new Set();
  candidates.forEach(item => {
    if (selected.length < 5 && !used.has(item.league)) {
      selected.push(item); used.add(item.league);
    }
  });
  candidates.forEach(item => {
    if (selected.length < 5 && !selected.some(x => x.id === item.id)) selected.push(item);
  });
  const sheet = aaEnsureSheet_(ss, 'Top 5 Opportunities', [
    'Report ET', 'Rank', 'League', 'Media Type', 'Published',
    'Instagram URL', 'Google Trends Match', 'Priority', 'Editorial Status'
  ]);
  sheet.clearContents();
  sheet.appendRow([
    'Report ET', 'Rank', 'League', 'Media Type', 'Published',
    'Instagram URL', 'Google Trends Match', 'Priority', 'Editorial Status'
  ]);
  if (selected.length) {
    sheet.getRange(2, 1, selected.length, 9).setValues(selected.map((x, i) => [
      aaEt_(new Date()), i + 1, x.league, x.type, x.published,
      x.url, x.match ? 'League-level overlap' : 'No league-level overlap',
      x.match ? 'Review first' : 'Review', 'Pending editorial verification'
    ]));
  }
  console.log('Top 5 candidates: ' + candidates.length + '; selected: ' + selected.length);
}
