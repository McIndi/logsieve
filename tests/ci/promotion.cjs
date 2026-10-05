const assert = require('node:assert/strict');
const { allowed } = require('../../.github/scripts/promotion.cjs');
const repo = 'McIndi/logsieve';
const cases = [['dev','feature/sdlc-ci',true],['dev','fix/rendering',true],['qa','dev',true],['prod','qa',true],['main','prod',true],['main','feature/x',false],['prod','dev',false],['qa','main',false],['dev','main',false],['dev','feature/',false],['other','dev',false]];
for (const [base, head, result] of cases) assert.equal(allowed(base, head, repo, repo), result);
assert.equal(allowed('dev','feature/x','Other/logsieve',repo), false);
assert.equal(allowed('qa','dev','',repo), false);
console.log('13 promotion-policy cases passed');
