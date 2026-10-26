// One coordinated time-based trigger. Manual run before setup is recommended.
function runAndActionMaster() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log('Another run is active; skipping');
    return;
  }
  try {
    console.log('Master run started');
    runSportsTrends();
    collectInstagramReels();
    buildSportsTop5();
    console.log('Master run completed');
  } finally {
    lock.releaseLock();
  }
}

function setupAndActionMaster() {
  const old = ['runSportsTrends', 'collectInstagramReels', 'buildSportsTop5'];
  const triggers = ScriptApp.getProjectTriggers();
  if (!triggers.some(t => t.getHandlerFunction() === 'runAndActionMaster')) {
    ScriptApp.newTrigger('runAndActionMaster').timeBased().everyHours(6).create();
  }
  ScriptApp.getProjectTriggers().forEach(t => {
    if (old.includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  console.log('Master trigger installed: every six hours');
}
