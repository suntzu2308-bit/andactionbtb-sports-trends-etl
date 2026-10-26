// Google Trends RSS collector — sanitized reference implementation.
const AA_SPORTS = [
  { league: 'NFL', pattern: /\b(nfl|super bowl|chiefs|steelers|cowboys|eagles|49ers)\b/i },
  { league: 'NBA', pattern: /\b(nba|lakers|celtics|knicks|warriors)\b/i },
  { league: 'NHL', pattern: /\b(nhl|stanley cup|hockey|rangers|bruins)\b/i },
  { league: 'MLB', pattern: /\b(mlb|world series|baseball|yankees|dodgers)\b/i },
  { league: 'UFC', pattern: /\b(ufc|mma|fight night)\b/i },
  { league: 'NCAAF', pattern: /\b(ncaaf|college football|cfb|ncaa football)\b/i },
  { league: 'Soccer', pattern: /\b(soccer|premier league|champions league|fifa)\b/i },
  { league: 'Tennis', pattern: /\b(tennis|atp|wta|wimbledon|us open tennis)\b/i }
];

function runSportsTrends() {
  const ss = SpreadsheetApp.openById(aaSpreadsheetId_());
  const sheet = aaEnsureSheet_(ss, 'Live Trends', [
    'Last Seen ET', 'Trend', 'League', 'Traffic Label',
    'Sightings', 'First Seen ET', 'Article URL', 'Search Status'
  ]);
  const response = UrlFetchApp.fetch('https://trends.google.com/trending/rss?geo=US', {
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    throw new Error('Google Trends RSS HTTP ' + response.getResponseCode());
  }
  const xml = XmlService.parse(response.getContentText());
  const channel = xml.getRootElement().getChild('channel');
  if (!channel) throw new Error('Google Trends RSS channel missing');
  const items = channel.getChildren('item');
  const now = aaEt_(new Date());
  const existing = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues() : [];
  const byKey = {};
  existing.forEach((row, i) => {
    byKey[String(row[1]).toLowerCase() + '|' + row[2]] = { index: i + 2, row: row };
  });
  let inserted = 0;
  items.forEach(item => {
    const title = item.getChildText('title') || '';
    const sport = AA_SPORTS.find(s => s.pattern.test(title));
    if (!sport) return;
    const key = title.toLowerCase() + '|' + sport.league;
    const trafficNode = item.getChildren().find(x => x.getName() === 'approx_traffic');
    const traffic = trafficNode ? trafficNode.getText() : '';
    const url = item.getChildText('link') || '';
    if (byKey[key]) {
      const record = byKey[key];
      sheet.getRange(record.index, 1).setValue(now);
      sheet.getRange(record.index, 4).setValue(traffic);
      sheet.getRange(record.index, 5).setValue((Number(record.row[4]) || 0) + 1);
    } else {
      sheet.appendRow([now, title, sport.league, traffic, 1, now, url, 'RSS sighting only']);
      inserted++;
    }
  });
  console.log('Google Trends processed: ' + items.length + '; new sports topics: ' + inserted);
}

function aaSpreadsheetId_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID Script Property missing');
  return id;
}
function aaEt_(date) {
  return Utilities.formatDate(date, 'America/New_York', 'yyyy-MM-dd HH:mm:ss');
}
function aaEnsureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
