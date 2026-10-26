/* Additional independently drawn chart examples for the visual catalog. */
(() => {
 const additions=[
 ['pie','파이 차트','구성','사업별 매출 비중','항목별 값과 전체 합계'],
 ['icicle','아이시클 차트','구성','제품 계층별 매출 구성','계층, 상위 분류, 매출'],
 ['dendrogram','덴드로그램','고급 분석','유사 제품의 군집 구조','항목 간 거리와 병합 단계'],
 ['network','네트워크 그래프','고급 분석','협력사와 공급 거점의 연결','노드와 연결 관계'],
 ['chord','코드 다이어그램','구성','사업부 간 물량 이동','사업부 간 양방향 이동량'],
 ['arcdiagram','아크 다이어그램','고급 분석','공정 사이 의존 관계','순서 있는 노드와 연결'],
 ['streamgraph','스트림 그래프','추이·예측','제품별 수요 구성의 변화','기간별 제품 수요'],
 ['ridgeline','리지라인 차트','고급 분석','월별 납기 분포 변화','기간별 개별 납기 관측치'],
 ['violin','바이올린 플롯','고급 분석','품목군별 리드타임 분포','품목군별 개별 측정값'],
 ['ecdf','누적분포 ECDF','고급 분석','납기 기준 이내 완료 비율','전체 관측값'],
 ['qqplot','Q–Q 플롯','고급 분석','측정 분포와 기준 분포 비교','표본 분위수와 기준 분위수'],
 ['errorbar','오차 막대 차트','고급 분석','추정 실적과 신뢰구간','추정값, 구간 하한·상한'],
 ['rangebar','범위 막대 차트','비교','거점별 최소·최대 리드타임','범주별 최솟값과 최댓값'],
 ['candlestick','캔들스틱 차트','추이·예측','원자재 일별 가격 변동','시가·고가·저가·종가'],
 ['ohlc','OHLC 차트','추이·예측','시점별 가격 범위 비교','시가·고가·저가·종가'],
 ['hexbin','육각 빈도 맵','고급 분석','대량 관측치의 집중 구간','두 변수별 관측 건수'],
 ['contour','등고선 차트','고급 분석','조건별 품질 지표의 수준','격자 좌표별 연속 측정값'],
 ['correlation','상관계수 행렬','고급 분석','운영 지표 사이 상관관계','동일 관측 대상의 다변량 수치'],
 ['wordcloud','워드 클라우드','고급 분석','VOC 주요 키워드 빈도','키워드와 발생 빈도'],
 ['venn','벤 다이어그램','구성','위험 요인의 중복 영역','집합별 항목과 교집합']
 ];
 additions.forEach(([id,name,cat,use,data])=>chartCatalog.push({id,name,cat,use,data,desc:use,best:use+'는 어떻게 나타나는가?',why:'서로 다른 항목의 패턴과 관계를 샘플로 비교합니다.',caveat:'가상 데이터로 그린 형식 예시입니다. 통계 구간·관계·업무 기준은 실제 원본으로 별도 산출해야 합니다.',recommend:false,idx:chartCatalog.length+1}));
 const baseDraw=drawChart;
 const cols=['#4358C4','#25A18C','#D8AD18','#8768B9','#E05066','#6C8DAA'];
 const tx=(x,y,s,size=10,fill='#61718C',anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-family="sans-serif">${escapeHtml(s)}</text>`;
 const line=(a,b,c,d,color='#DCE3EF',width=1)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${color}" stroke-width="${width}"/>`;
 const circle=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
 const rect=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}"/>`;
 const path=(d,stroke,fill='none',width=2,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
 const axes=(xLabel='X',yLabel='Y')=>line(40,15,40,145)+line(40,145,340,145)+tx(190,174,xLabel,9,'#61718C','middle')+tx(12,16,yLabel,9);
 function sample(key){let s='';
 switch(key){
 case 'pie':{const vs=[40,28,20,12];let angle=-Math.PI/2;vs.forEach((v,i)=>{let end=angle+v/100*Math.PI*2,x1=114+66*Math.cos(angle),y1=88+66*Math.sin(angle),x2=114+66*Math.cos(end),y2=88+66*Math.sin(end);s+=path(`M114 88 L${x1} ${y1} A66 66 0 ${v>50?1:0} 1 ${x2} ${y2} Z`,'white',cols[i],2)+rect(220,35+i*29,9,9,cols[i])+tx(236,44+i*29,`${['서버','모바일','차량','기타'][i]} ${v}%`);angle=end;});break;}
 case 'icicle':{s=rect(15,20,330,30,cols[0])+tx(180,40,'전체 매출 100%',11,'white','middle');let x=15;[.45,.35,.2].forEach((v,i)=>{s+=rect(x,54,330*v-3,40,cols[i+1])+tx(x+8,77,['서버 45','모바일 35','차량 20'][i],10,'white');for(let j=0;j<2;j++)s+=rect(x+j*330*v/2,98,330*v/2-3,47,cols[(i+j+2)%6]);x+=v*330});s+=tx(180,167,'위 → 아래: 사업부 → 제품 → 품목',9,'#61718C','middle');break;}
 case 'dendrogram':{const ys=[27,57,97,137];s=line(160,42,160,117,cols[0],2)+line(160,79,66,79,cols[0],2);[0,1].forEach((_,g)=>{s+=line(240,ys[g*2],240,ys[g*2+1],cols[g],2)+line(160,g?117:42,240,g?117:42,cols[g],2);for(let j=0;j<2;j++)s+=line(240,ys[g*2+j],294,ys[g*2+j],cols[g],2)+tx(303,ys[g*2+j]+4,['A','B','C','D'][g*2+j]);});s+=tx(42,166,'큰 거리에서 결합 ← → 유사 품목',10);break;}
 case 'network':{const pts=[[180,88],[83,36],[64,123],[267,30],[300,106],[219,150]];[[0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[3,4],[4,5]].forEach(([a,b])=>s+=line(...pts[a],...pts[b],'#BCC8E3',2));pts.forEach(([x,y],i)=>s+=circle(x,y,i?15:24,cols[i])+tx(x,y+4,i?'거점 '+i:'허브',10,'white','middle'));break;}
 case 'chord':{const pts=Array.from({length:6},(_,i)=>[180+70*Math.cos(i*Math.PI/3),88+70*Math.sin(i*Math.PI/3)]);[[0,2,12],[0,3,8],[1,4,17],[2,5,6],[3,5,10]].forEach(([a,b,w],i)=>s+=path(`M${pts[a]} Q180 88 ${pts[b]}`,cols[i],'none',w,'opacity=".45"'));pts.forEach(([x,y],i)=>s+=circle(x,y,11,cols[i])+tx(x,y+3,String.fromCharCode(65+i),9,'white','middle'));break;}
 case 'arcdiagram':{const xs=[35,93,151,209,267,325];[[0,3],[1,2],[1,5],[3,5]].forEach(([a,b],i)=>s+=path(`M${xs[a]} 131 Q${(xs[a]+xs[b])/2} ${131-(b-a)*41} ${xs[b]} 131`,cols[i],'none',2));xs.forEach((x,i)=>s+=circle(x,131,7,cols[i])+tx(x,153,`공정${i+1}`,9,'#61718C','middle'));break;}
 case 'streamgraph':{const n=12,vals=Array.from({length:3},(_,j)=>Array.from({length:n},(_,i)=>15+10*Math.sin(i*.6+j)+j*2)),baseline=Array.from({length:n},(_,i)=>92-vals.reduce((a,v)=>a+v[i],0)/2);let lo=baseline.slice();vals.forEach((v,j)=>{const hi=v.map((a,i)=>lo[i]+a),points=hi.map((y,i)=>`${i?'L':'M'}${20+i*29} ${y}`).join(' ')+lo.map((_,i)=>` L${20+(n-1-i)*29} ${lo[n-1-i]}`).join(' ')+' Z';s+=path(points,'white',cols[j],1);lo=hi;});s+=tx(24,165,'1월')+tx(322,165,'12월',10,'#61718C','end');break;}
 case 'ridgeline':{for(let k=0;k<4;k++){const base=45+k*33,pts=Array.from({length:41},(_,i)=>[65+i*6.5,base-28*Math.exp(-(((i-14-k*3)/7)**2))]);s+=path(`M65 ${base} `+pts.map(([x,y])=>`L${x} ${y}`).join(' ')+` L325 ${base} Z`,cols[k],cols[k],1,'fill-opacity=".25"')+tx(14,base-3,`${k+7}월`);}break;}
 case 'violin':{s=axes('제품군','일수');for(let k=0;k<4;k++){const x=90+k*68,ys=Array.from({length:35},(_,i)=>24+i*3.2),width=i=>4+19*Math.exp(-(((i-12-k*2)/7)**2))+5*Math.exp(-(((i-28)/4)**2)),d=ys.map((y,i)=>`${i?'L':'M'}${x-width(i)} ${y}`).join(' ')+ys.slice().reverse().map((y,i)=>`L${x+width(34-i)} ${y}`).join(' ')+' Z';s+=path(d,cols[k],cols[k],1,'fill-opacity=".3"')+line(x,55,x,113,cols[k],3)+circle(x,85,3,'white');}break;}
 case 'ecdf':{s=axes('납期 일수','누적 비율');let d='M40 145';[2,4,5,8,11,12,15,19,23,27].forEach((v,i)=>d+=` H${40+v*10} V${145-(i+1)*12}`);s+=path(d,cols[0])+line(40,49,330,49,cols[2])+tx(45,43,'80% 기준',9);break;}
 case 'qqplot':{s=axes('기준 분포 분위수','표본 분위수')+line(60,133,318,26,'#ADB9CE',1);for(let i=0;i<20;i++){let x=60+i*13,y=133-i*5.4+(i>14?-((i-14)**1.7):Math.sin(i)*3);s+=circle(x,y,3.5,cols[0]);}break;}
 case 'errorbar':{s=axes('사업부','추정치');[63,90,72,111,82].forEach((v,i)=>{let x=77+i*53,y=150-v,w=10+i*2;s+=line(x,y-w,x,y+w,cols[0],2)+line(x-7,y-w,x+7,y-w,cols[0],2)+line(x-7,y+w,x+7,y+w,cols[0],2)+circle(x,y,4,cols[0])+tx(x,160,'ABCDE'[i],9,'#61718C','middle');});break;}
 case 'rangebar':{[34,53,25,67].forEach((v,i)=>{let y=32+i*32;s+=tx(12,y+7,'거점 '+'ABCD'[i])+rect(80+v, y-4,110+i*17,13,cols[i])+circle(80+v,y+2,3,'white')+circle(187+v+i*17,y+2,3,'white');});s+=tx(100,171,'최솟값 ━━━━━ 최댓값',10);break;}
 case 'candlestick':case 'ohlc':{s=axes('일자','가격');for(let i=0;i<10;i++){let x=59+i*28,open=86+18*Math.sin(i*.9),close=open+14*Math.cos(i*1.8),hi=Math.min(open,close)-13,lo=Math.max(open,close)+15,c=close<open?cols[1]:cols[4];s+=line(x,hi,x,lo,c,1.7);if(key==='candlestick')s+=rect(x-7,Math.min(open,close),14,Math.max(2,Math.abs(open-close)),c);else s+=line(x-7,open,x,open,c,2)+line(x,close,x+7,close,c,2);}break;}
 case 'hexbin':{s=axes('투입량','산출량');for(let r=0;r<6;r++)for(let c=0;c<12;c++){let x=65+c*22+(r%2)*11,y=29+r*19,intensity=Math.exp(-((c-5)**2+(r-3)**2)/12),points=Array.from({length:6},(_,k)=>`${x+12*Math.cos(k*Math.PI/3)},${y+12*Math.sin(k*Math.PI/3)}`).join(' ');s+=`<polygon points="${points}" fill="${cols[0]}" opacity="${.08+intensity*.85}" stroke="white" stroke-width="1"/>`;}break;}
 case 'contour':{s=axes('온도','압력');for(let i=5;i>0;i--)s+=`<ellipse cx="192" cy="86" rx="${i*26}" ry="${i*12}" transform="rotate(-18 192 86)" fill="${cols[0]}" fill-opacity=".13" stroke="${cols[0]}" stroke-opacity=".5"/>`;s+=tx(194,90,'최적 구간',9,'white','middle');break;}
 case 'correlation':{const ls=['입고','공출','재공','납기'];ls.forEach((l,i)=>{s+=tx(85+i*59,18,l,9,'#61718C','middle')+tx(12,44+i*32,l,9);for(let j=0;j<4;j++){const v=i===j?1:Math.cos((i+j+1)*1.4)*.85;s+=rect(56+j*59,25+i*32,55,29,v>0?'#4358C4':'#E05066')+tx(83+j*59,44+i*32,v.toFixed(2),10,'white','middle');}});break;}
 case 'wordcloud':{[['납기',49,96,34],['품질',168,67,27],['수급',235,119,23],['가격',104,145,18],['지원',48,42,16],['신뢰',261,45,20],['개선',171,142,14],['납품',264,156,13]].forEach(([v,x,y,z],i)=>s+=tx(x,y,v,z,cols[i%6]));break;}
 case 'venn':{s=circle(140,76,57,cols[0],'opacity=".35"')+circle(213,76,57,cols[1],'opacity=".35"')+circle(177,122,57,cols[4],'opacity=".3"')+tx(112,68,'납기',11,'#263859')+tx(229,68,'수급',11,'#263859')+tx(176,147,'품질',11,'#263859','middle')+tx(177,94,'3종 중복',10,'#263859','middle');break;}
 }
 return wrapSvg(s,chartCatalog.find(c=>c.id===key)?.name||key);
 }
 drawChart=key=>additions.some(c=>c[0]===key)?sample(key):baseDraw(key);
})();
