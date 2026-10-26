const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const output=path.join(require('node:os').tmpdir(),'my-dashboard-test');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.DASHBOARD_URL||'http://127.0.0.1:8000');await page.waitForSelector('.live-table');const reports=[];
 for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
  await page.setViewportSize({width,height});
  for(let tab=0;tab<5;tab++){
   await page.locator(`[data-live-tab="${tab}"]`).click();
   const result=await page.evaluate(tab=>{
    const source=[[...exRows,...PLANNING_DEMO.flash],inboundRows,outboundRows,supplyRows,materialRows][tab],t=tab;
    const table=document.querySelector('.live-table'),frame=table.parentElement,tr=[...table.tBodies[0].rows],matrix=tr.map(()=>[]);
    tr.forEach((row,i)=>{let c=0;for(const cell of row.cells){while(matrix[i][c]!==undefined)c++;for(let j=0;j<cell.rowSpan;j++)matrix[i+j][c]=cell.textContent;c++;}});
    const expected=t===0?source.map(exAllCells):source.map(r=>(t===2?opsDefs.outbound.keys:t===3?supplyKeys:t===4?materialKeys:Object.keys(r)).map(k=>r[k]));
    let mismatches=0;expected.forEach((row,i)=>row.forEach((v,j)=>{const value=typeof v==='number'?Number(matrix[i]?.[j]?.replaceAll(',','').replace('%','')):matrix[i]?.[j];if(value!==v)mismatches++;}));
    return {tab,rows:matrix.length,expected:source.length,cols:matrix[0].length,mismatches,overflow:frame.scrollHeight>frame.clientHeight+1||frame.scrollWidth>frame.clientWidth+1,docOverflow:document.documentElement.scrollHeight>innerHeight+1,charts:document.querySelectorAll('#live-dashboard .live-card').length};
   },tab);
   assert.equal(result.rows,result.expected);assert.equal(result.cols,[36,22,23,30,18][tab]);assert.equal(result.charts,tab===0?0:3);assert(!result.mismatches&&!result.overflow&&!result.docOverflow,JSON.stringify({width,height,...result}));reports.push({width,height,...result});
  }
 }
 await page.setViewportSize({width:1440,height:900});
 // Both original and explicit demo data have a clean source boundary.
 await page.locator('[data-live-tab="0"]').click();assert((await page.locator('.table-scope').innerText()).includes('추가 시연'));
 await page.locator('#planning-mode').selectOption('source');
 assert.equal(await page.locator('.live-table tbody tr').count(),12);
 await page.locator('#planning-mode').selectOption('demo');assert.equal(await page.locator('.live-table tbody tr').count(),15);
 await page.locator('[data-live-tab="0"]').click();await page.locator('.live-table td[rowspan]').first().click();assert(await page.locator('#cell-detail').isVisible());await page.locator('#cell-detail-row').selectOption('1');assert.equal(await page.locator('.cell-detail-grid article').count(),36);await page.locator('#close-cell-detail').click();
 await page.screenshot({path:path.join(output,'dram-overview.png')});
 // Inbound: requested shapes, chart-to-master linkage, sorting and exact source records.
 await page.locator('[data-live-tab="1"]').click();
 assert.deepEqual(await page.locator('.live-card h2').allTextContents(),['당월 생산 계획','당월 입고 진척일 일별 추이','당월 거래선별 계획']);
 const plan=await page.evaluate(()=>({expected:PLANNING_DEMO.master.inbound.reduce((n,r)=>n+r.plan,0),shown:[...document.querySelectorAll('[data-analysis="production-plan"] svg .tile-white:not(.tile-percent)')].filter((_,i)=>i%2===1).reduce((n,t)=>n+Number(t.textContent.replaceAll(',','')),0)}));assert.equal(plan.shown,plan.expected);
 const allocated=await page.evaluate(()=>{const all=PLANNING_DEMO.master.inbound,svg=document.querySelector('[data-analysis="customer-plan"] svg'),totals=[...svg.querySelectorAll('text')].filter(e=>e.getAttribute('text-anchor')==='middle'&&e.getAttribute('y')!=='168').map(e=>Number(e.textContent.replaceAll(',','')));return {sum:totals.reduce((a,b)=>a+b,0),expected:all.reduce((n,r)=>n+r.plan,0)};});assert.equal(allocated.sum,allocated.expected);
 const progression=await page.evaluate(()=>{const daily=PLANNING_DEMO.daily.filter(d=>d.kind==='inbound'&&d.month===PLANNING_DEMO.month&&d.day===26),qty=daily.reduce((n,r)=>n+r.cumulative,0),plan=daily.reduce((n,r)=>n+r.monthPlan,0),days=qty/(plan/31);return {expected:`10月 ${days.toFixed(1)}`,content:document.querySelector('[data-analysis="inbound-days"]').textContent,needle:`10월 ${days.toFixed(1)}일`};});assert(progression.content.includes(progression.needle));
 await page.locator('[data-analysis="customer-plan"] [data-graph-key]').first().click();assert(await page.locator('#clear-graph-filter').isVisible());const filtered=await page.locator('.live-table tbody tr').count();assert(filtered>0&&filtered<12);await page.locator('#live-reset').click();
 await page.locator('th[data-sort="12"]').click();let numbers=await page.locator('td[data-colindex="12"]').allTextContents();assert.deepEqual(numbers.map(Number),numbers.map(Number).slice().sort((a,b)=>a-b));await page.locator('#open-column-config').click();await page.locator('#column-key').selectOption('12');await page.locator('#column-op').selectOption('gte');await page.locator('#column-value').fill('350');await page.locator('#column-form button[type="submit"]').click();numbers=await page.locator('td[data-colindex="12"]').allTextContents();assert(numbers.length>0&&numbers.every(v=>Number(v)>=350));await page.locator('#live-reset').click();
 await page.locator('#live-search').fill('Automotive');assert.equal(await page.locator('.live-table tbody tr').count(),2);const download=page.waitForEvent('download');await page.locator('#live-export').click();await (await download).saveAs(path.join(output,'filtered.csv'));assert.equal(fs.readFileSync(path.join(output,'filtered.csv'),'utf8').trim().split('\r\n').length,3);await page.locator('#live-reset').click();
 await page.locator('#planning-mode').selectOption('source');assert.equal(await page.locator('.missing-chart').count(),3);assert.equal(await page.locator('.live-table tbody tr').count(),12);await page.locator('#planning-mode').selectOption('demo');
 await page.screenshot({path:path.join(output,'inbound-requested.png')});
 await page.locator('[data-live-tab="2"]').click();assert.deepEqual(await page.locator('.live-card h2').allTextContents(),['당월 공출 필요량','당월 공출 진척일 일별 추이','당월 Site별 계획']);assert.equal(await page.locator('.live-table tbody tr').count(),21);
 await page.locator('[data-live-tab="3"]').click();assert.deepEqual(await page.locator('.live-card h2').allTextContents(),['당월 FABOUT 생산계획','최근 3개월 FABOUT 진척 일별 추이','최근 3개월 WF가용 재공 추이']);
 assert.equal(await page.locator('[data-analysis="fabout-days"] .chart-key span').count(),4);const wf=await page.locator('[data-analysis="wf-trend"] [data-graph-key="site"]').count();assert.equal(wf,87*3);const profiles=await page.evaluate(()=>PLANNING_DEMO.months.map(month=>PLANNING_DEMO.daily.filter(d=>d.kind==='supply'&&d.month===month&&d.day===26).reduce((n,d)=>n+d.progressDays,0).toFixed(3)));assert.equal(new Set(profiles).size,3);
 await page.locator('[data-live-tab="4"]').click();assert.deepEqual(await page.locator('.live-card h2').allTextContents(),['Substrate','PCB','PMIC']);
 const pieCheck=await page.evaluate(()=>['SUBSTRATE','PCB','PMIC'].every(category=>{const element=document.querySelector(`[data-analysis="pie-${category}"]`);return ['정상','주의','위험'].every(status=>{const expected=materialRows.filter(r=>r.MAT_CATG1===category&&r.STATUS===status).length;return element.querySelector(`[data-material-status="${status}"]`)?.textContent.includes(`${expected}종`);});}));assert(pieCheck);
 await page.locator('[data-analysis="pie-PMIC"] [data-material-status="위험"]').first().click();assert.equal(await page.locator('#live-group').inputValue(),'PMIC');assert.equal(await page.locator('#live-status').inputValue(),'위험');assert.equal(await page.locator('.live-table tbody tr').count(),await page.evaluate(()=>materialRows.filter(r=>r.MAT_CATG1==='PMIC'&&r.STATUS==='위험').length));await page.locator('#live-reset').click();await page.screenshot({path:path.join(output,'material-requested.png')});
 await page.locator('[data-live-tab="5"]').click();assert(await page.locator('#showroom').isVisible());assert.equal(await page.locator('.chart-tile').count(),70);await page.locator('#gallery-search').fill('바이올린');await page.locator('[data-detail="violin"]').click();assert(await page.locator('#gallery-overlay').evaluate(e=>e.classList.contains('open')));await page.locator('#dialog-close').click();await page.locator('[data-live-tab="0"]').click();assert.equal(await page.locator('.live-card').count(),0);assert.equal(await page.title(),'demo');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({reports,errors,checks:'6 tabs, full source cells, table-only overviews, labelled demo fixtures, exact requested charts, source mode, pie totals, filtering, sorting, details, CSV and gallery'},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
