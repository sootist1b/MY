/* Live executive views reuse the source HTML's illustrative datasets. No external dependencies. */
(() => {
 const $=id=>document.getElementById(id), esc=escapeHtml;
 const names=['통합현황','입고 실적·진척','공출 실적·재공','공급·CHIP 진척','자재 확보·리스크','차트라이브러리'];
 const inKeys=['WORKDATE','COMP_PRODGROUP','COMP_DESIGN_RULE','COMP_DENSITY','VERSION','APPLICATION','DENSITYB','MODEL','PKGTYPE','ITEM','MONTH','STAUS','PLANQTY','ACTUALQTY','STD_DAY_PLAN','ACT_DATE','ACT_DAY_PROGRESS','MYD_PLAN','MYD_ACTUALQTY','STD_MYD_DAY_PLAN','MYD_ACT_DATE','MYD_ACT_DAY_PROGRESS'];
 const chartChoices=names.map(()=>[]);let chartIndex=0;
 const sources=[exRows,inboundRows,outboundRows,supplyRows,materialRows];
 const keys=[exFlatTitles,inKeys,opsDefs.outbound.keys,supplyKeys,materialKeys];
 const labels=[['PRODUCT','상태','ITEM'],['제품군','상태','월'],['제품군','상태','기준일'],['구분1','확보 상태','구분3'],['자재군','상태','GEO RISK']];
 const detailLabels=['응용','응용','패키지','구분2','FAM1'];
 const descriptions=['품목별 계획·입고·진척·부품 수급을 전체 열 기준으로 확인합니다.','전체 월·제품군의 입고 계획, 실제 입고 및 MYD 진척을 비교합니다.','모든 기준일의 공출 실적과 MCS·MOD 재공을 함께 확인합니다.','입고 계획·잔여 물량부터 CHIP 확보율, B/E·EDS 재공까지 확인합니다.','자재별 안전재고 목표, 월별 보유·입고·소진 및 지정학 리스크를 확인합니다.'];
 const state=names.map(()=>({q:'',group:'',status:'',period:'',detail:''}));
 let active=Math.max(0,detailTabs.findIndex(d=>d.id===location.hash.slice(1))),librarySource=0;
 const host=document.createElement('main');host.id='live-dashboard';document.querySelector('.shell').append(host);
 const project=r=>({group:r.product,status:exHasRisk(r)?'위험':exHasWarn(r)?'주의':'정상',period:r.item,detail:r.app,raw:r,plan:r.plan,actual:r.actual,values:exAllCells(r)});
 function normalize(r,t){
  if(t===0)return project(r);
  if(t===1)return {group:r.COMP_PRODGROUP,status:r.STAUS,period:r.MONTH,detail:r.APPLICATION,raw:r,plan:r.PLANQTY,actual:r.ACTUALQTY,values:inKeys.map(k=>r[k])};
  if(t===2)return {group:r.COMP_PRODUCT,status:r.STATUS,period:r.NOW_DATE,detail:r.PKGTYPE,raw:r,plan:r.ALL_PKG_M0_WHPLAN,actual:r.ALL_PKG_ACTQTY,values:keys[t].map(k=>r[k])};
  if(t===3)return {group:r['구분1'],status:r['CHIP_10월_확보율']>=95?'정상':r['CHIP_10월_확보율']>=80?'주의':'위험',period:r['구분3'],detail:r['구분2'],raw:r,plan:r['10월_계획'],actual:r['10월_실적'],values:keys[t].map(k=>r[k])};
  return {group:r.MAT_CATG1,status:r.STATUS,period:r.GEO_RISK,detail:r.FAM1,raw:r,plan:r.SS_TARGET,actual:r.M0_BOH,values:keys[t].map(k=>r[k])};
 }
 const type=()=>active===5?librarySource:active;
 function all(){return sources[type()].map(r=>normalize(r,type()));}
 function rows(ignore=''){const s=state[active];return all().filter(r=>(!s.q||r.values.some(v=>String(v).toLowerCase().includes(s.q.toLowerCase())))&&['group','status','period','detail'].every(k=>ignore===k||!s[k]||r[k]===s[k]));}
 const total=(rs,k)=>rs.reduce((n,r)=>n+r[k],0);
 const ratio=(a,b)=>b?`${(100*a/b).toFixed(1)}%`:'—';
 const colors={정상:'#08783e',주의:'#d3a800',위험:'#cc2335'};
 function mark(dim,value,body,tag='g') {return `<${tag} class="chart-mark ${state[active][dim]===value?'chosen':''}" data-dim="${dim}" data-value="${esc(value)}" role="button" tabindex="0" aria-label="${esc(labels[type()][['group','status','period'].indexOf(dim)])} ${esc(value)} 필터" aria-pressed="${state[active][dim]===value}">${body}<title>${esc(value)} · 클릭하여 필터 / 다시 클릭하여 해제</title></${tag}>`;}
 const text=(x,y,v,extra='')=>`<text x="${x}" y="${y}" ${extra}>${esc(v)}</text>`;
 function svg(body,label){return `<svg viewBox="0 0 460 190" role="group" aria-label="${label}">${body}</svg>`;}
 function compare(){const rs=rows('group'),groups=[...new Set(rs.map(r=>r.group))],max=Math.max(1,...groups.flatMap(g=>[total(rs.filter(r=>r.group===g),'plan'),total(rs.filter(r=>r.group===g),'actual')]));return svg(groups.map((g,i)=>{const subset=rs.filter(r=>r.group===g),p=total(subset,'plan'),a=total(subset,'actual'),y=12+i*164/Math.max(1,groups.length),h=Math.min(10,58/Math.max(1,groups.length));return mark('group',g,text(0,y+9,g)+`<rect x="93" y="${y}" width="${p/max*275}" height="${h}" rx="2" fill="#CED3E3"/><rect x="93" y="${y+h+2}" width="${a/max*275}" height="${h}" rx="2" fill="#5362CA"/>`+text(453,y+12,ratio(a,p),'text-anchor="end"'));}).join(''),'분류별 계획과 실적 비교');}
 function distribution(){const rs=rows('status'),counts=['정상','주의','위험'].map(s=>rs.filter(r=>r.status===s).length),n=rs.length,C=2*Math.PI*61;let offset=0;return svg(`<circle cx="103" cy="94" r="61" fill="none" stroke="#EFF0F5" stroke-width="25"/>`+counts.map((v,i)=>{const status=['정상','주의','위험'][i],len=n?v/n*C:0,part=mark('status',status,`<circle cx="103" cy="94" r="61" fill="none" stroke="${colors[status]}" stroke-width="25" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-offset}" transform="rotate(-90 103 94)"/>`);offset+=len;return part+mark('status',status,`<rect x="237" y="${36+i*46}" width="211" height="35" rx="6" fill="${state[active].status===status?'#ECEEFB':'#F8F9FB'}"/><circle cx="252" cy="${54+i*46}" r="4" fill="${colors[status]}"/>`+text(265,58+i*46,status)+text(430,58+i*46,`${v}행`,'text-anchor="end"'));}).join('')+text(103,94,n,'text-anchor="middle" class="donut-number"')+text(103,114,'행 · 상태 분포','text-anchor="middle"'),'상태별 행 수 분포');}
 function breakdown(){const rs=rows('period'),groups=[...new Set(rs.map(r=>r.period))].sort(),max=Math.max(1,...groups.map(g=>total(rs.filter(r=>r.period===g),'actual'))),w=400/Math.max(1,groups.length);return svg(groups.map((g,i)=>{const a=total(rs.filter(r=>r.period===g),'actual'),x=40+i*w,h=a/max*123;return mark('period',g,`<rect x="${x+5}" y="${145-h}" width="${Math.max(2,w-13)}" height="${h}" rx="3" fill="#638B9A"/>`+text(x+w/2,136-h,fmt(a),'text-anchor="middle"')+`<text x="${x+w/2}" y="159" text-anchor="middle" class="axis-label">${(g.match(/.{1,8}/g)||['']).map((part,j)=>`<tspan x="${x+w/2}" dy="${j?9:0}">${esc(part)}</tspan>`).join('')}</text>`);}).join(''),`${labels[type()][2]}별 실적`);}
 function scatter(){const rs=rows('group'),max=Math.max(1,...rs.flatMap(r=>[r.plan,r.actual]));return svg(`<path d="M40 10 V155 H440 M40 155 L420 15" fill="none" stroke="#DDE1EA" stroke-dasharray="4 3"/>`+rs.map(r=>mark('group',r.group,`<circle cx="${40+r.plan/max*370}" cy="${155-r.actual/max*135}" r="6" fill="${colors[r.status]}" opacity=".8"/>`)).join('')+text(50,180,'가로: 계획 / 세로: 실적 · 점 클릭 → 제품군'),'계획 실적 산점도');}
 function heat(){const rs=rows('group'),groups=[...new Set(rs.map(r=>r.group))];return svg(groups.map((g,i)=>{const y=10+i*165/Math.max(groups.length,1);return text(0,y+13,g)+['정상','주의','위험'].map((s,j)=>{const n=rs.filter(r=>r.group===g&&r.status===s).length;return mark('group',g,`<rect x="${110+j*109}" y="${y}" width="100" height="${Math.min(22,145/Math.max(groups.length,1))}" rx="3" fill="${colors[s]}" opacity="${n?.85:.12}"/>`+text(160+j*109,y+13,n,'text-anchor="middle" fill="white"'));}).join('');}).join('')+text(160,184,'정상','text-anchor="middle"')+text(269,184,'주의','text-anchor="middle"')+text(378,184,'위험','text-anchor="middle"'),'제품군 상태 히트맵');}
 function gap(){const rs=rows('group'),groups=[...new Set(rs.map(r=>r.group))],vals=groups.map(g=>total(rs.filter(r=>r.group===g),'actual')-total(rs.filter(r=>r.group===g),'plan')),max=Math.max(1,...vals.map(Math.abs));return svg(`<path d="M275 5 V175" stroke="#CCD1DE"/>`+groups.map((g,i)=>{const v=vals[i],y=10+i*165/Math.max(groups.length,1),w=Math.abs(v)/max*125;return mark('group',g,text(0,y+12,g)+`<rect x="${v<0?275-w:275}" y="${y}" width="${w}" height="14" rx="2" fill="${v<0?'#cc2335':'#08783e'}"/>`+text(450,y+12,`${v>0?'+':''}${fmt(v)}`,'text-anchor="end"'));}).join(''),'계획 대비 실적 차이');}
 function trend(){
  const t=type(),rs=rows('period');
  if(![1,2,4].includes(t))return gap();
  const periods=t===4?['M0','M1','M2']:[...new Set(rs.map(r=>r.period))].sort();
  const series=t===4?['BOH','RTP','OUT'].map((k,i)=>({name:{BOH:'보유량 BOH',RTP:'입고 RTP',OUT:'소진 OUT'}[k],color:['#5362CA','#08783e','#d3a800'][i],v:periods.map(p=>rs.reduce((n,r)=>n+r.raw[p+'_'+k],0))})):[{name:'계획',color:'#A4ADC2',v:periods.map(p=>total(rs.filter(r=>r.period===p),'plan'))},{name:'실적',color:'#5362CA',v:periods.map(p=>total(rs.filter(r=>r.period===p),'actual'))}];
  const max=Math.max(1,...series.flatMap(s=>s.v))*1.15,x=i=>48+i*365/Math.max(1,periods.length-1),y=v=>148-v/max*118;
  const grid=[0,.5,1].map(v=>`<path d="M48 ${y(max*v)} H432" stroke="#E6EAF2" stroke-dasharray="3 4"/>`+text(40,y(max*v)+3,fmt(max*v),'text-anchor="end"')).join('');
  const lines=series.map(s=>`<path d="${s.v.map((v,i)=>`${i?'L':'M'}${x(i)} ${y(v)}`).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.7"/>`+s.v.map((v,i)=>{const dot=`<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="white" stroke="${s.color}" stroke-width="2"/>`+text(x(i),y(v)-10,fmt(v),'text-anchor="middle"');return t===4?`<g><title>${s.name} ${periods[i]}: ${fmt(v)}</title>${dot}</g>`:mark('period',periods[i],dot);}).join('')).join('');
  return svg(grid+lines+periods.map((p,i)=>text(x(i),170,p,'text-anchor="middle"')).join(''),t===4?'월별 보유·입고·소진 추이':'전체 기간 계획·실적 추이')+`<div class="chart-key">${series.map(s=>`<span><i style="background:${s.color}"></i>${s.name}</span>`).join('')}</div>`;
 }
 function operations(){const t=type(),rs=rows();
  if(t===0)return distribution();
  if(t===1){const a=rs.reduce((n,r)=>n+r.raw.STD_DAY_PLAN,0),b=rs.reduce((n,r)=>n+r.raw.ACT_DATE,0),c=rs.reduce((n,r)=>n+r.raw.STD_MYD_DAY_PLAN,0),d=rs.reduce((n,r)=>n+r.raw.MYD_ACT_DATE,0);return bullet([['전체 당일 진척',b,a],['MYD 당일 진척',d,c]],'기준 일계획 대비 실적');}
  if(t===2)return wipChart();
  if(t===3)return bullet([['CHIP 10월 확보율',rs.length?rs.reduce((n,r)=>n+r.raw['CHIP_10월_확보율'],0)/rs.length:0,100],['CHIP 11월 확보율',rs.length?rs.reduce((n,r)=>n+r.raw['CHIP_11월_확보율'],0)/rs.length:0,100]],'확보율 단순 평균 · 100% 기준');
  return distribution();
 }
 function wipChart(){const rs=rows('group'),groups=[...new Set(rs.map(r=>r.group))],vals=groups.map(g=>{const group=rs.filter(r=>r.group===g);return [group.reduce((n,r)=>n+r.raw.ALL_MCS_WIP,0),group.reduce((n,r)=>n+r.raw.ALL_MOD_WIP,0)];}),max=Math.max(1,...vals.map(v=>v[0]+v[1]));return svg(groups.map((g,i)=>{const y=12+i*150/Math.max(1,groups.length),h=Math.min(16,110/Math.max(1,groups.length)),a=vals[i][0],b=vals[i][1];return mark('group',g,text(0,y+11,g)+`<rect x="98" y="${y}" width="${a/max*270}" height="${h}" fill="#4358C4" rx="2"/><rect x="${98+a/max*270}" y="${y}" width="${b/max*270}" height="${h}" fill="#42A793" rx="2"/>`+text(451,y+11,`${fmt(a)} / ${fmt(b)}`,'text-anchor="end"'));}).join(''),'제품군별 MCS·MOD 누적 재공')+'<div class="chart-key"><span><i style="background:#4358C4"></i>MCS WIP</span><span><i style="background:#42A793"></i>MOD WIP</span></div>';}
 function bullet(items,label){const max=Math.max(1,...items.map(x=>x[2]??x[1]));return svg(items.map(([n,v,target],i)=>{const y=28+i*76,w=Math.min(330,v/(target||max)*330);return text(15,y,n)+text(443,y,target?ratio(v,target):fmt(v),'text-anchor="end" class="bullet-value"')+`<rect x="15" y="${y+13}" width="330" height="18" fill="#EDF0F6" rx="4"/><rect x="15" y="${y+13}" width="${w}" height="18" fill="${target?(v/target>=.95?'#08783e':v/target>=.8?'#d3a800':'#cc2335'):'#5362CA'}" rx="4"/>`+text(443,y+28,target?`${fmt(v)} / ${fmt(target)}`:'행 합계','text-anchor="end"');}).join(''),label);}
 function filterBar(){const t=type(),s=state[active];return `<section class="executive-filters" aria-label="상단 전체 데이터 필터"><div class="filter-fields"><label>통합 검색<input id="live-search" type="search" placeholder="전체 열에서 검색" value="${esc(s.q)}"></label>${['group','detail','period','status'].map(k=>{const label=k==='detail'?detailLabels[t]:labels[t][['group','status','period'].indexOf(k)],values=k==='status'?['정상','주의','위험']:[...new Set(all().map(r=>r[k]))].sort();return `<label>${label}<select id="live-${k}" data-filter="${k}"><option value="">전체 ${esc(label)}</option>${values.map(v=>`<option value="${esc(v)}" ${s[k]===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`;}).join('')}<button id="live-reset">전체 데이터 ↺</button><div class="filter-count"><strong>${rows().length}</strong> / ${all().length}행<span>전체 ${keys[t].length}열 표시</span></div></div><div class="live-filters" aria-live="polite">${['group','detail','status','period'].filter(k=>s[k]).map(k=>`<button data-remove="${k}">${k==='detail'?detailLabels[t]:labels[t][['group','status','period'].indexOf(k)]}: ${esc(s[k])} ×</button>`).join('')||'<span>전체 데이터 조회 중 · 상단 조건과 차트 선택을 함께 적용할 수 있습니다.</span>'}</div></section>`;}
 function card(title,subtitle,content){const index=chartIndex++,choice=chartChoices[active][index]||'',options=[['','업무별 기본 차트'],['compare','계획·실적 비교 막대'],['distribution','상태 도넛'],['breakdown','항목별 수직 막대'],['scatter','계획·실적 산점도'],['heat','상태 히트맵'],['gap','부족·초과 발산 막대']],draws={compare,distribution,breakdown,scatter,heat,gap};if(choice){content=draws[choice]();title=options.find(o=>o[0]===choice)[1];subtitle='차트 항목 클릭 → 해당 데이터 교차 필터';}return `<article class="live-card"><header><div class="chart-title-row"><h2>${title}</h2><select data-chart="${index}" aria-label="${index+1}번 그래프 유형">${options.map(([k,n])=>`<option value="${k}" ${choice===k?'selected':''}>${n}</option>`).join('')}</select></div><span>${subtitle}</span></header>${content}</article>`;}
 function cellTone(r,i,t){
  const v=r.values[i],k=keys[t][i];
  if(['정상','낮음'].includes(v))return 'cell-good';
  if(['주의','중간'].includes(v))return 'cell-warning';
  if(['위험','높음'].includes(v))return 'cell-danger';
  if(t===0&&i>=15&&v>0){const group=Math.floor((i-15)/3),pos=(i-15)%3;return (group<3?['cell-good','cell-warning','cell-danger']:['cell-good','cell-danger','cell-warning'])[pos];}
  if(typeof v==='number'&&(k.includes('PROGRESS')||k.endsWith('확보율')))return v>=95?'cell-good':v>=80?'cell-warning':'cell-danger';
  const actualKeys=['ACTUALQTY','MYD_ACTUALQTY','ALL_PKG_ACTQTY','MYD_PKG_ACTQTY','10월_실적','M0_BOH'];
  if(t===0&&i===13||actualKeys.includes(k)){const p=['MYD_ACTUALQTY','MYD_PKG_ACTQTY'].includes(k)?(r.raw.MYD_PLAN??r.raw.MYD_PKG_M0_WHPLAN):r.plan;return p?(v/p>=.95?'cell-good':v/p>=.8?'cell-warning':'cell-danger'):'';}
  return '';
 }
 function table(rs){const t=type(),cols=keys[t];let head;
 if(t===0)head=exFullMatrixHeader();
 else {
  // Reuse the exact full-data dialog header, including all source field names
  // and the three-level supply header. Only the container moves into the body.
  const template=document.createElement('template');
  template.innerHTML=t===1?inboundTable([]):opTable(['overview','inbound','outbound','supply','material'][t],[]);
  const sourceHead=template.content.querySelector('thead');
  [...sourceHead.rows[sourceHead.rows.length-1].cells].forEach((cell,i)=>cell.title=cols[i]);
  head=sourceHead.innerHTML;
 }
 return `<table class="live-table" aria-label="${names[t]} 전체 데이터 ${cols.length}열"><colgroup>${cols.map((k,i)=>`<col style="width:${t===0?exColumnPercents[i]:100/cols.length}%">`).join('')}</colgroup><thead>${head}</thead><tbody>${rs.length?rs.map(r=>'<tr>'+r.values.map((v,i)=>{const title=cols[i],value=typeof v==='number'?(title.includes('PROGRESS')||title.endsWith('확보율')?pct(v):fmt(v)):v;return `<td title="${esc(title)}: ${esc(value)}" class="${cellTone(r,i,t)}" ${colors[v]?`style="color:${colors[v]}"`:''}>${esc(value)}</td>`;}).join('')+'</tr>').join(''):`<tr><td colspan="${cols.length}" class="no-results">일치하는 데이터가 없습니다. 조건을 해제해 주세요.</td></tr>`}</tbody></table>`;
 }
 function fitTable(){
  const frame=host.querySelector('.live-table-frame'), table=frame?.querySelector('table');if(!table)return;
  table.style.removeProperty('font-size');table.style.removeProperty('--cell-pad');
  let font=parseFloat(getComputedStyle(table).fontSize);
  for(let n=0;n<24&&frame.scrollHeight>frame.clientHeight+1;n++){font-=.2;table.style.fontSize=font+'px';table.style.setProperty('--cell-pad',font<7?'0px':'1px');}
 }
 window.addEventListener('resize',fitTable);
 function paint(){
  selected=active;const t=type(),s=state[active],rs=rows(),plan=total(rs,'plan'),actual=total(rs,'actual');
  ['main','exec-overview','showroom'].forEach(id=>$(id).hidden=true);
  $('tabs').innerHTML=names.map((n,i)=>`<button type="button" class="tab ${i===active?'on':''}" role="tab" aria-selected="${i===active}" data-live-tab="${i}"><span class="tab-num">0${i+1}</span>${n}</button>`).join('');
  chartIndex=0;
  const chartTitles=[['제품별 계획·실적','진척·수급 위험 분포','품목별 입고 실적'],['제품군별 입고 달성','전체·MYD 당일 진척','월별 계획·입고 추이'],['제품군별 공출 달성','MCS·MOD 재공 구성','기준일별 공출 추이'],['제품군별 입고 달성','CHIP 확보 수준','계획 대비 부족·초과'],['자재군별 목표·보유','자재 위험 분포','월별 자재 흐름']][t];
  const charts=card(chartTitles[0],'회색: 계획 · 남색: 실적 · 클릭하여 분류 선택',compare())+card(chartTitles[1],t===3?'10월·11월 확보율 · 단순 평균':t===2?'전체 기준일의 원본 행 합계':'현재 조회 조건 기준',operations())+card(chartTitles[2],[1,2].includes(t)?'시점 클릭 → 기간 필터':t===4?'BOH · RTP · OUT':'항목 클릭 → 데이터 필터',[1,2,4].includes(t)?trend():t===3?gap():breakdown());
  host.classList.toggle('library-mode',active===5);
  host.innerHTML=`<header class="live-heading"><div><div class="live-eyebrow">MYD / EXECUTIVE OPERATIONS</div><h1>${names[active]} <span>${descriptions[t]}</span></h1></div><div class="live-heading-actions">${active===5?`<label>데이터 <select id="live-source">${names.slice(0,5).map((n,i)=>`<option value="${i}" ${t===i?'selected':''}>${n}</option>`).join('')}</select></label><button id="live-atlas">50종 참고 차트 ↗</button>`:''}<span class="live-sample">샘플 데이터 · 실제 실적 아님</span><button id="live-export">CSV 내보내기 ↓</button></div></header>
  ${filterBar()}
  <section class="live-kpis" aria-label="선택 데이터 지표">${[['조회 행',`${rs.length} / ${all().length}`,'전체 원본 행 기준'],[t===4?'확보 목표':'계획 합계',fmt(plan),t===2?'전체 기준일 포함 · 행 합계':'현재 필터 기준'],[t===4?'M0 보유량':'실적 합계',fmt(actual),'현재 필터 기준'],['계획 대비',ratio(actual,plan),'실적 ÷ 계획'],['계획 대비 차이',`${actual-plan>0?'+':''}${fmt(actual-plan)}`,'실적 − 계획 · 현재 조회 행 기준'],['위험 분류',`${rs.filter(r=>r.status==='위험').length}행`,t===3?'CHIP 10월 확보율 80% 미만':'기존 상태 분류 기준']].map(([l,v,n])=>`<article><span>${l}</span><strong>${v}</strong><small>${n}</small></article>`).join('')}</section>
  <section class="live-charts" aria-label="데이터와 연결된 차트">${charts}${active===5?card('계획·실적 상관','점 클릭 → 제품군',scatter())+card('상태 히트맵','셀 클릭 → 제품군',heat())+card('계획 대비 차이','막대 클릭 → 제품군',gap()):''}</section>
  <section class="live-data"><div class="live-toolbar"><div><h2>${names[t]} · 전체 데이터 보기 <span>${rs.length} / ${all().length}행 · ${keys[t].length}열</span></h2></div><span class="table-scope">${s.q||s.group||s.status||s.period||s.detail?'상단 선택 조건 적용 중':'필터 없음 · 전체 원본 데이터'} · 행/열 생략 없음</span></div><div class="live-table-frame">${table(rs)}</div><footer><span class="status-legend"><i class="legend-green"></i>정상 <i class="legend-yellow"></i>주의 <i class="legend-red"></i>위험</span> 행·열 생략 및 페이지 분할 없음 <span>${t===0?'상태는 7개 진척·수급 중 위험 우선 분류':t===3?'파생 상태: CHIP 확보율 ≥95% 정상 / ≥80% 주의 / 그 외 위험':t===2?'전체 일자 원본 행 표시 · 계획의 날짜 간 합산은 기간 계획을 의미하지 않음':'원본 샘플 데이터 전체 표시'} · 단위는 원본 기준</span></footer></section>`;
  fitTable();
  history.replaceState(null,'','#'+detailTabs[active].id);
 }
 $('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-live-tab]');if(b){active=+b.dataset.liveTab;state[active]={q:'',group:'',status:'',period:'',detail:''};host.hidden=false;paint();}});
 host.addEventListener('click',e=>{const m=e.target.closest('[data-dim]');if(m){const s=state[active];s[m.dataset.dim]=s[m.dataset.dim]===m.dataset.value?'':m.dataset.value;paint();return;}const rm=e.target.closest('[data-remove]');if(rm){state[active][rm.dataset.remove]='';paint();return;}if(e.target.id==='live-reset'){state[active]={q:'',group:'',status:'',period:'',detail:''};paint();}if(e.target.id==='live-export'){const csv='\uFEFF'+[keys[type()],...rows().map(r=>r.values)].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`MYD_${names[type()]}_샘플.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}if(e.target.id==='live-atlas'){host.hidden=true;$('showroom').hidden=false;renderGallery();$('atlas-back')?.remove();const b=document.createElement('button');b.id='atlas-back';b.className='action';b.textContent='데이터 연동 차트로 돌아가기';b.onclick=()=>{host.hidden=false;paint();};$('showroom').querySelector('.showroom-topright').prepend(b);}});
 host.addEventListener('keydown',e=>{const m=e.target.closest('[data-dim]');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();m.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 host.addEventListener('input',e=>{if(e.target.id==='live-search'){const pos=e.target.selectionStart;state[active].q=e.target.value;paint();$('live-search').focus();$('live-search').setSelectionRange(pos,pos);}});
 host.addEventListener('change',e=>{if(e.target.dataset.chart!==undefined){chartChoices[active][+e.target.dataset.chart]=e.target.value;paint();return;}if(e.target.dataset.filter){const id=e.target.id;state[active][e.target.dataset.filter]=e.target.value;paint();$(id)?.focus();}if(e.target.id==='live-source'){librarySource=+e.target.value;state[active]={q:'',group:'',status:'',period:'',detail:''};paint();}});
 // Keep all navigation on the live rendering path, including legacy calls.
 render=i=>{active=i;host.hidden=false;paint();};
 paint();
})();
