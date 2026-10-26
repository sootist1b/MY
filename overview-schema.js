/* Requested executive summary schema. New metrics are explicit illustrative data;
   MGb from the old source is never relabelled as 억EQ. */
const OVERVIEW_SCHEMA=(()=>{
 const statuses=['정상','주의','위험'],stages=['입고','공출','WF 공급','Substrate','PCB','PMIC','RCD'];
 const keyColumns=['FAM1','PRODUCT','DR','VER','응용','거래선','ITEM'];
 const columns=[...keyColumns,'총 제품수','MYD 제품수',...['M0','M1','M2','M3'].map(m=>`생산계획 (억EQ) / ${m}`),...['M0','M1','M2','M3'].map(m=>`STATUS / 계획수립 / (MYD 비중) / ${m}`),'STATUS / 당월실행 / M0 / TTL',...stages.flatMap((stage,i)=>statuses.map(status=>`STATUS / ${i<3?'당월실행 / M0':'자재확보'} / ${stage} / ${status}`))];
 function build(source,demo){const groups=new Map();for(const member of source){const key=JSON.stringify([member.fam,member.product,member.dr,member.ver,member.app,member.customer,member.item]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(member);}
  return [...groups.values()].map((members,i)=>{const first=members[0],total=demo?18+(i%5)*3:new Set(members.map(r=>r.item)).size,myd=demo?total-3-(i%3):null,production=demo?Array.from({length:4},(_,m)=>Number((.72+i*.08+m*.06).toFixed(2))):Array(4).fill(null),share=demo?Array.from({length:4},(_,m)=>Number((100*myd/total+m*.5).toFixed(1))):Array(4).fill(null),progress=stages.map((_,stage)=>{if(!demo)return [null,null,null];const risk=i%3===2&&(i+stage)%4===0?2:0,caution=i%3===0?0:(i+stage)%3===0?3:1;return [myd-risk-caution,caution,risk];}),values=[first.fam,first.product,first.dr,first.ver,first.app,first.customer,first.item,total,myd,...production,...share,myd,...progress.flat()];
   return {FAM1:first.fam,PRODUCT:first.product,DR:first.dr,VER:first.ver,응용:first.app,거래선:first.customer,ITEM:first.item,values,members,demo,progress,status:demo?(progress.some(v=>v[2]>0)?'위험':progress.some(v=>v[1]>0)?'주의':'정상'):'미제공'};
  });
 }
 function header(){const metadata=[...keyColumns,'총<br>제품수','MYD<br>제품수'].map((name,i)=>`<th rowspan="5" scope="col" data-field="${i}" class="${i<7?'summary-key':''} ${i===6?'key-end':''}">${name}</th>`).join(''),months=['M0','M1','M2','M3'];return `<tr>${metadata}<th rowspan="4" colspan="4" scope="colgroup" class="summary-production">생산계획 (억EQ)</th><th colspan="26" scope="colgroup" class="summary-status">STATUS</th></tr>
 <tr><th colspan="4" scope="colgroup" class="summary-planning">계획수립</th><th colspan="10" scope="colgroup" class="summary-execution">당월실행</th><th colspan="12" scope="colgroup" class="summary-material">자재확보</th></tr>
 <tr><th rowspan="2" colspan="4" scope="colgroup" class="summary-planning">(MYD 비중)</th><th colspan="10" scope="colgroup" class="summary-execution">M0</th>${stages.slice(3).map(name=>`<th rowspan="2" colspan="3" scope="colgroup" class="summary-material">${name}</th>`).join('')}</tr>
 <tr><th rowspan="2" scope="col" data-field="17" class="summary-execution">TTL</th>${stages.slice(0,3).map(name=>`<th colspan="3" scope="colgroup" class="summary-execution">${name}</th>`).join('')}</tr>
 <tr>${months.map((m,i)=>`<th scope="col" data-field="${9+i}" class="summary-production">${m}</th>`).join('')}${months.map((m,i)=>`<th scope="col" data-field="${13+i}" class="summary-planning">${m}</th>`).join('')}${stages.flatMap((_,stage)=>statuses.map((status,j)=>`<th scope="col" data-field="${18+stage*3+j}" class="summary-${status}">${status}</th>`)).join('')}</tr>`;}
 const widths=[4.5,5,3,4,4,4,9.5,3,3,...Array(8).fill(3.5),...Array(22).fill(32/22)];
 return {columns,keyColumns,stages,statuses,build,header,widths,totalIndex:7,mydIndex:8,productionStart:9,shareStart:13,ttlIndex:17,statusStart:18};
})();
