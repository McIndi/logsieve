const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'logsieve-empty-tests-'));
try {
  for (const name of ['run_tests.js','shared.js']) fs.copyFileSync(path.join(root,name),path.join(temp,name));
  fs.mkdirSync(path.join(temp,'tests'));
  for (const mode of ['no files','zero test cases']) {
    if (mode === 'zero test cases') fs.writeFileSync(path.join(temp,'tests','test_empty.js'),'// no cases\n');
    const result = spawnSync(process.execPath,[path.join(temp,'run_tests.js')],{encoding:'utf8'});
    assert.equal(result.status,1,mode+' must fail');
    assert.match(result.stderr,/No tests executed/);
  }
  console.log('2 empty-runner rejection cases passed');
} finally { fs.rmSync(temp,{recursive:true,force:true}); }
