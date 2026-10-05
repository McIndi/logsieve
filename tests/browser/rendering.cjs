// Real-browser regression: import untrusted files through the actual UI and worker.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = process.env.LOGSIEVE_ROOT || path.resolve(__dirname, '../..');
const types = {'.js':'application/javascript','.html':'text/html','.css':'text/css'};
const server = http.createServer((req,res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(target, (error,data) => {
    if(error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', types[path.extname(target)] || 'text/plain'); res.end(data);
  });
});
const cases = [
  {name:'JSON hostile level text', file:'case.json', data:JSON.stringify([{id:1,level:'<img src=x onerror=ALERT(1)>',message:'test'}]), level:'<IMG SRC=X ONERROR=ALERT(1)>'},
  {name:'JSON quoted class attribute', file:'case.json', data:JSON.stringify([{id:1,level:'" onmouseover="ALERT(1)" data-probe="',message:'test'}]), level:'" ONMOUSEOVER="ALERT(1)" DATA-PROBE="'},
  {name:'JSON hostile ID', file:'case.json', data:JSON.stringify([{id:'<img src=x onerror=ALERT(1)>',level:'INFO',message:'test'}]), id:'<img src=x onerror=ALERT(1)>',level:'INFO'},
  {name:'CSV hostile level text', file:'case.csv', data:'id,level,message\n1,<img src=x onerror=ALERT(1)>,test\n',level:'<IMG SRC=X ONERROR=ALERT(1)>'},
  {name:'CSV quoted class attribute', file:'case.csv', data:'id,level,message\n1,""" onmouseover=""ALERT(1)"" data-probe=""",test\n',level:'" ONMOUSEOVER="ALERT(1)" DATA-PROBE="'},
  {name:'JSON hostile timestamp',file:'case.json',data:JSON.stringify([{id:1,ts:'<img src=x onerror=ALERT(1)>',level:'INFO',message:'test'}]),level:'INFO',timestamp:'<img src=x onerror=ALERT(1)>'},
  {name:'CSV hostile timestamp',file:'case.csv',data:'id,ts,level,message\n1,<img src=x onerror=ALERT(1)>,INFO,test\n',level:'INFO',timestamp:'<img src=x onerror=ALERT(1)>'},
  {name:'valid timestamp formatting',file:'case.json',data:JSON.stringify([{id:1,ts:'2026-10-04T12:00:00Z',level:'INFO',message:'test'}]),level:'INFO',timestamp:'10/04/2026 12:00:00 PM UTC'},
  {name:'plain invalid timestamp fallback',file:'case.json',data:JSON.stringify([{id:1,ts:'not-a-date',level:'INFO',message:'test'}]),level:'INFO',timestamp:'not-a-date'},
  {name:'normal IDs and styled levels',file:'case.json',data:JSON.stringify([{id:42,level:'ERROR',message:'<b>message</b>',raw:'<i>raw</i>',custom:'<em>field</em>'}]),id:'42',level:'ERROR',normal:true}
];
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let failures=0;
  try {
    for(const mode of ["active", "legacy"]) for(const test of cases) {
      const context=await browser.newContext({locale:"en-US",timezoneId:"UTC"}); const page=await context.newPage(); const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(() => {window.__executed=0;window.ALERT=()=>{window.__executed++;};});
      try {
        await page.goto(process.env.LOGSIEVE_URL ? process.env.LOGSIEVE_URL.replace(/\/+$/, '') + '/' : `http://127.0.0.1:${server.address().port}/`);
        if(mode === 'legacy') {
          const original=fs.readFileSync(path.join(root,'logsieve.js'),'utf8').match(/function renderPage\(pageData\) \{[\s\S]*?\n\}/)[0];
          await page.evaluate(source => { renderPage = (0,eval)('(' + source + ')'); }, original);
        }
        await page.setInputFiles('#file',{name:test.file,mimeType:test.file.endsWith('.csv')?'text/csv':'application/json',buffer:Buffer.from(test.data)});
        await page.waitForFunction(()=>document.querySelectorAll('#tbody tr').length===1,{},{timeout:15000});
        const row=page.locator('#tbody tr'); const level=mode==='active'?row.locator('td[data-col="level"]'):row.locator('td').nth(2);
        assert.equal(await level.textContent(),test.level);
        if(test.timestamp!==undefined) assert.equal(await row.locator('td').nth(1).textContent(),test.timestamp);
        assert.equal((await row.locator('td[data-col]').count())>0,mode==='active','renderer mode did not match the exercised DOM');
        if(test.id!==undefined) assert.equal(await row.locator('td').nth(0).textContent(),test.id);
        assert.equal(await row.locator('img,svg,script,iframe,object').count(),0,'log data created executable elements');
        assert.equal(await row.locator('[onerror],[onload],[onmouseover],[data-probe]').count(),0,'log data created attributes');
        await level.hover(); await page.waitForTimeout(50);
        assert.equal(await page.evaluate(()=>window.__executed),0,'log payload executed');
        assert.deepEqual(errors,[],'unexpected browser errors');
        if(test.normal) {
          assert.equal(await level.locator('span').getAttribute('class'),'lvl-ERROR');
          assert.equal(await row.locator('td').nth(3).locator(':scope > pre').textContent(),'<b>message</b>');
          assert.equal(await row.locator('td').nth(3).locator('details pre').textContent(),'<i>raw</i>');
          assert.equal(await row.locator('td').nth(4).textContent(),'<em>field</em>');
        }
        console.log('PASS',mode,test.name);
      } catch(e) {failures++;console.error('FAIL',mode,test.name,e.message);}
      await context.close();
    }
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log(`${cases.length*2-failures}/${cases.length*2} browser cases passed`);process.exitCode=failures?1:0;
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
