const assert = require('node:assert/strict');
function allowed(base, head, headRepo, baseRepo) {
  if (!headRepo || headRepo !== baseRepo) return false;
  if (base === 'dev') return /^(feature|fix)\/.+/.test(head);
  return ({qa: 'dev', prod: 'qa', main: 'prod'})[base] === head;
}
if (require.main === module) {
  const [base, head, headRepo, baseRepo] = process.argv.slice(2);
  assert.ok(allowed(base, head, headRepo, baseRepo), `Invalid promotion: ${head} -> ${base}`);
  console.log(`Promotion allowed: ${head} -> ${base}`);
}
module.exports = { allowed };
