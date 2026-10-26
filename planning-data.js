/* Explicitly fabricated planning fixtures. Never an inference from production data.
   Original tables stay unchanged; these fixtures only demonstrate unavailable chart fields. */
const PLANNING_DEMO = (() => {
 const asOf='2026-10-26',month='2026-10',months=['2026-08','2026-09','2026-10'];
 const daysIn=m=>new Date(Date.UTC(+m.slice(0,4),+m.slice(5),0)).getUTCDate();
 const limits=m=>m===month?26:daysIn(m);
 const unique=(rows,key)=>[...new Map(rows.map(r=>[r[key],r])).values()];
 const master={
  inbound:unique(inboundRows,'ITEM').map((r,i)=>({id:r.ITEM,group:r.COMP_PRODGROUP,customer:['거래선 A','거래선 B','거래선 C'][i%3],site:['Site A','Site B','Site C'][i%3],plan:[350,305,430,270,392,208][i]})),
  outbound:unique(outboundRows,'COMPCODE').map((r,i)=>({id:r.COMPCODE,group:r.COMP_PRODUCT,site:['Site A','Site B','Site C'][i%3],required:[330,455,285,410,225,375,305][i],plan:[325,450,278,400,218,369,299][i]})),
  supply:supplyRows.map((r,i)=>({id:r['구분3'],group:r['구분1'],site:['Fab A','Fab B','Fab C'][i%3],plan:42+i*3}))
 };
 // Salescodes are explicit demo allocations; no Salescode exists in the source HTML.
 const statuses=['정상','주의','위험'];
 for(const [kind,items] of Object.entries(master))items.forEach((item,i)=>{
  const original=kind==='inbound'?inboundRows.find(r=>r.ITEM===item.id):kind==='outbound'?outboundRows.filter(r=>r.COMPCODE===item.id).sort((a,b)=>b.NOW_DATE.localeCompare(a.NOW_DATE))[0]:supplyRows.find(r=>r['구분3']===item.id);
  item.status=kind==='inbound'?original.STAUS:kind==='outbound'?original.STATUS:original['CHIP_10월_확보율']>=95?'정상':original['CHIP_10월_확보율']>=80?'주의':'위험';
  item.salescodes=[.5,.3,.2].map((weight,j)=>({code:`SC-${kind.slice(0,2).toUpperCase()}-${String(i+1).padStart(2,'0')}${j+1}`,weight}));
 });
 const daily=[];
 for(const m of months)for(const [kind,items] of Object.entries(master))for(const [i,item] of items.entries()){
  const monthPlan=Math.round((item.plan??item.required)*(m==='2026-08'?.9:m==='2026-09'?.95:1)),days=daysIn(m);const salesCumulative=[0,0,0];
  for(let day=1;day<=limits(m);day++){
   const pace=({정상:.98,주의:.86,위험:.7}[item.status])+(i%3)*.006+(m==='2026-08'?-.06:m==='2026-09'?-.025:.01)+(kind==='outbound'?-.025:kind==='supply'?.03:0)+.055*Math.sin(day*.47+i+(m==='2026-08'?-.4:m==='2026-09'?-.2:0)),quantity=monthPlan/days*pace,wf=Math.round(110+i*9+day*1.6+18*Math.sin(day*.3+i)+(m==='2026-08'?0:m==='2026-09'?12:26)),shares=[.5+.025*Math.sin(day*.3),.3+.02*Math.cos(day*.4)];shares.push(1-shares[0]-shares[1]);let allocatedWf=0;
   item.salescodes.forEach((sales,j)=>{const qty=quantity*shares[j],plan=monthPlan*sales.weight,available=j===2?wf-allocatedWf:Math.floor(wf*sales.weight);allocatedWf+=available;salesCumulative[j]+=qty;
    daily.push({kind,id:item.id,group:item.group,status:item.status,salescode:sales.code,site:item.site,date:`${m}-${String(day).padStart(2,'0')}`,month:m,day,monthPlan:plan,quantity:qty,cumulative:salesCumulative[j],progressDays:salesCumulative[j]/(plan/days),wfAvailable:available});
   });
  }
 }
 const flash=[
  {fam:'FLASH-A',product:'NAND',dr:'F1',ver:'V1',app:'스토리지',customer:'시연 A',item:'NAND 512Gb',weights:[70,23,7],stock:72,por:125,plan:120,actual:111,days:23,severity:1,stages:Array.from({length:7},(_,i)=>({normal:10,caution:i%2+1,risk:i===2?1:0}))},
  {fam:'FLASH-A',product:'NAND',dr:'F1',ver:'V2',app:'스토리지',customer:'시연 B',item:'NAND 1Tb',weights:[65,25,10],stock:48,por:108,plan:100,actual:89,days:22,severity:2,stages:Array.from({length:7},(_,i)=>({normal:8,caution:2,risk:i%3===0?2:0}))},
  {fam:'FLASH-B',product:'NOR',dr:'F2',ver:'V1',app:'산업기기',customer:'시연 C',item:'NOR 256Mb',weights:[79,17,4],stock:38,por:84,plan:80,actual:78,days:25,severity:0,stages:Array.from({length:7},()=>({normal:11,caution:0,risk:0}))}
 ];
 return {asOf,month,months,daysIn,master,daily,flash};
})();
