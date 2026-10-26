// Instagram hashtag video discovery — sanitized reference implementation.
const AA_HASHTAGS = [
  'mlb', 'ufc', 'collegefootball', 'ncaaf',
  'nfl', 'nhl', 'nba', 'soccer', 'tennis'
];

function collectInstagramReels() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('INSTAGRAM_ACCESS_TOKEN');
  const igId = props.getProperty('INSTAGRAM_ACCOUNT_ID');
  if (!token || !igId) throw new Error('Instagram Script Properties missing');

  const ss = SpreadsheetApp.openById(aaSpreadsheetId_());
  const sheet = aaEnsureSheet_(ss, 'Instagram Reels', [
    'Collected ET', 'Sport Hashtag', 'Media ID',
    'Media Type', 'Published', 'Instagram URL', 'Discovery Status'
  ]);
  const existing = new Set(sheet.getLastRow() > 1
    ? sheet.getRange(2, 3, sheet.getLastRow() - 1, 1)
      .getValues().flat().map(String) : []);
  const rows = [];
  let failures = 0;

  function get(path) {
    const res = UrlFetchApp.fetch('https://graph.facebook.com/v26.0/' + path, {
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });
    let json;
    try { json = JSON.parse(res.getContentText()); }
    catch (_) { throw new Error('Instagram response was not JSON; HTTP ' + res.getResponseCode()); }
    if (res.getResponseCode() !== 200 || json.error) {
      const e = json.error || {};
      throw new Error('Instagram HTTP ' + res.getResponseCode() + '; code ' + (e.code || 'unknown'));
    }
    return json;
  }

  AA_HASHTAGS.forEach(tag => {
    try {
      const found = get('ig_hashtag_search?user_id=' + encodeURIComponent(igId) +
        '&q=' + encodeURIComponent(tag));
      if (!found.data || !found.data.length) return;
      const media = get(found.data[0].id + '/recent_media?user_id=' +
        encodeURIComponent(igId) +
        '&fields=id,media_type,media_product_type,permalink,timestamp&limit=10');
      (media.data || []).forEach(item => {
        const id = String(item.id || '');
        const reel = item.media_product_type === 'REELS';
        const video = item.media_type === 'VIDEO';
        if (!id || !item.permalink || existing.has(id) || (!reel && !video)) return;
        rows.push([
          aaEt_(new Date()), tag, id, reel ? 'REEL' : 'VIDEO',
          item.timestamp || '', item.permalink, 'Virality unverified'
        ]);
        existing.add(id);
      });
      console.log('Instagram #' + tag + ': checked');
    } catch (e) {
      failures++;
      console.error('Instagram #' + tag + ' failed: ' + e.message);
    }
  });
  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
  }
  console.log('Instagram new links: ' + rows.length + '; failed hashtags: ' + failures);
  if (failures) throw new Error('Instagram discovery had ' + failures + ' failed hashtag requests');
}
