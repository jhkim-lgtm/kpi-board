const META={
  1:{name:'핵심 카드',desc:'현재 규모와 증감을 가장 익숙하고 간결하게.',title:'채널 성장 현황',recommend:true},
  2:{name:'한눈에 비교',desc:'열 개 채널을 같은 기준으로 빠르게 비교.',title:'숫자로 보는 채널'},
  3:{name:'목표 트랙',desc:'목표까지 얼마나 왔는지, 얼마나 남았는지.',title:'목표까지의 거리'},
  4:{name:'증감 보드',desc:'어디에서 늘고, 어디에서 줄었는지 먼저.',title:'오늘의 변화'},
  5:{name:'TV 전광판',desc:'멀리서도 읽히는 큰 숫자와 최소한의 정보.',title:'채널 현황.'},
  6:{name:'타이포 보드',desc:'채널마다 같은 공간. 큰 팔로워 숫자에 집중.',title:'팔로워, 한눈에.',recommend:true},
  7:{name:'목표 컬럼',desc:'위로 채워지는 그래프로 목표까지의 높이를 비교.',title:'목표를 향해, 한 칸씩.'},
  8:{name:'롤스로이스 집중',desc:'3만 명까지의 진척을 화면의 중심에.',title:'롤스로이스, 30,000까지.'},
  9:{name:'변화 분류',desc:'증가·유지·감소를 나눠 오늘 확인할 채널부터.',title:'오늘, 무엇이 달라졌나.'},
  10:{name:'한 장 리포트',desc:'여백과 숫자로 정리한 간결한 운영 보고서.',title:'채널 운영 리포트'}
};
const fmt=n=>Number(n).toLocaleString('ko-KR');
const signed=n=>n==null?'—':(n>0?'+':n<0?'−':'')+fmt(Math.abs(n));
const pct=c=>c.progress.toFixed(1)+'%';
const change=c=>`<span class="delta ${c.delta>0?'up':c.delta<0?'down':'flat'}">${signed(c.delta)}<small>${c.period}</small></span>`;
const meter=c=>`<div class="meter" style="--pct:${c.progress}%" role="meter" aria-label="${c.name} 목표 달성률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress.toFixed(1)}"><i class="meter-fill"></i><b class="meter-dot"></b></div>`;
const parts=c=>c.parts.length?`<div class="parts">${c.parts.map(p=>`<span>${p.name}<b>${fmt(p.current)}</b></span>`).join('')}</div>`:'';
const goal=c=>`<div class="goal-line"><b>${pct(c)}</b><span>목표 ${fmt(c.goal)}</span></div>`;
const heading=(title,sub)=>`<div class="section-head"><h3>${title}</h3><span>${sub}</span></div>`;
function core(ctx){
  return heading('자사 매체','팔로워 · 전일 증감')+`<div class="core-own">${ctx.own.map(c=>`<article class="core-card"><div class="channel-name">${c.name}</div><div class="platform">${c.sub}</div><div class="core-current num">${fmt(c.current)}</div>${change(c)}${parts(c)}${meter(c)}${goal(c)}</article>`).join('')}</div>`
    +heading('운영대행','목표 대비 성장')+`<div class="core-agency">${ctx.agency.map(c=>`<article class="agency-card"><div class="channel-name">${c.name}</div><div class="agency-row"><strong class="num">${fmt(c.current)}</strong>${change(c)}</div>${meter(c)}${goal(c)}</article>`).join('')}</div>`;
}
function comparison(ctx){
  const rows=cs=>cs.map(c=>`<tr><td><span class="channel-name">${c.name}</span><span class="platform">${c.sub}</span>${parts(c)}</td><td class="table-current num">${fmt(c.current)}</td><td>${change(c)}</td><td>${goal(c)}${meter(c)}</td></tr>`).join('');
  return `<table class="comparison"><thead><tr><th scope="col">매체</th><th scope="col">현재 팔로워</th><th scope="col">증감</th><th scope="col">목표 진척</th></tr></thead><tbody><tr class="group-row"><th colspan="4">자사 매체</th></tr>${rows(ctx.own)}<tr class="group-row"><th colspan="4">운영대행</th></tr>${rows(ctx.agency)}</tbody></table>`;
}
function television(ctx){
  const cell=c=>`<article class="tv-cell"><div class="channel-name">${c.name}</div><div class="tv-current num">${fmt(c.current)}</div>${change(c)}${meter(c)}${goal(c)}${parts(c)}</article>`;
  return heading('자사 매체','OWN CHANNELS')+`<div class="tv-own">${ctx.own.map(cell).join('')}</div>`+heading('운영대행','MANAGED CHANNELS')+`<div class="tv-agency">${ctx.agency.map(cell).join('')}</div>`;
}
let DATA,ctx,SNAPSHOTS;
const number=n=>String(n).padStart(2,'0');
function context(data){
  const own=data.rows.filter(r=>r.group==='own'),agency=data.rows.filter(r=>r.group==='agency');
  return {own,agency,all:data.rows,total:own.reduce((s,r)=>s+r.current,0),totalDelta:own.every(r=>r.delta!=null)?own.reduce((s,r)=>s+r.delta,0):null,fmt,signed,change,meter,pct,parts,dateLabel:data.fetchedAt.slice(0,16).replace('T',' ')};
}
function render(view){
  view=Object.hasOwn(META,view)?String(view):view==='overview'?'overview':'more';
  const isNew=view==='more'||Number(view)>5, isGallery=view==='more'||view==='overview';
  DATA=SNAPSHOTS[isNew?1:0];ctx=context(DATA);
  const group=isNew?'more':'overview';
  const entries=Object.entries(META).filter(([n])=>isNew?Number(n)>5:Number(n)<=5);
  document.querySelectorAll('.collections [data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===group)));
  document.querySelector('.tabs').innerHTML=`<button data-view="${group}" aria-pressed="${isGallery}">5개 비교</button>`+entries.map(([n,m])=>`<button data-view="${n}" aria-pressed="${view===n}"><span>${number(n)}</span>${m.name}</button>`).join('');
  document.getElementById('gallery').hidden=!isGallery;
  document.getElementById('detail').hidden=isGallery;
  if(isGallery){
    document.getElementById('gallery').innerHTML=entries.map(([n,m])=>`<article class="preview"><button data-concept="${n}" aria-label="${n}번 ${m.name} 시안 열기"><img loading="lazy" src="previews/${number(n)}.png" alt="${n}번 ${m.name} 대시보드 시안" width="1440" height="850"><div class="preview-meta"><span class="preview-index">${number(n)}</span><div><h2>${m.name}${m.recommend?'<span class="recommend">추천</span>':''}</h2><p>${m.desc}</p></div></div></button></article>`).join('');
    return;
  }
  const m=META[view], renderers={1:core,2:comparison,5:television,...window.extraConcepts};
  document.getElementById('concept-number').textContent=number(view);
  document.getElementById('concept-title').textContent=m.name;
  document.getElementById('concept-description').textContent=m.desc;
  document.getElementById('image-link').href=`previews/${number(view)}.png`;
  const board=document.getElementById('board');board.className='board concept-'+view;
  const month=ctx.all.find(r=>r.id==='kakao').period;
  board.innerHTML=`<div class="board-inner"><header class="board-head"><div><div class="brand">1%CLUB</div><h2>${m.title}</h2><div class="asof">${DATA.dataDate.replaceAll('-','.')} 기준</div></div><div class="overview"><span>자사 매체 팔로워 합계</span><strong class="num">${fmt(ctx.total)}</strong>${change({delta:ctx.totalDelta,period:'전일'})}</div></header><div class="content">${renderers[view](ctx)}</div><footer class="board-foot"><span>롤스로이스 서울 0% = 운영 시작월 말(2026.02) 22,012명 · 카카오·유튜브 증감 = ${month}</span><span>데이터 조회 ${ctx.dateLabel} · 시안 ${number(view)}</span></footer></div>`;
}
function select(view){location.hash=view;render(view);}
document.addEventListener('click',e=>{
  const tab=e.target.closest('[data-view]'),preview=e.target.closest('[data-concept]');
  if(tab)select(tab.dataset.view);
  if(preview){select(preview.dataset.concept);window.scrollTo({top:0,behavior:'instant'});}
});
window.addEventListener('hashchange',()=>{if(SNAPSHOTS)render(location.hash.slice(1));});
Promise.all(['data.json','data-20260930.json'].map(path=>fetch(path).then(r=>{if(!r.ok)throw Error(r.status);return r.json();}))).then(data=>{
  SNAPSHOTS=data;render(location.hash.slice(1));window.conceptsReady=true;
}).catch(()=>{document.getElementById('gallery').textContent='시안 데이터를 불러오지 못했습니다. 새로고침해주세요.';});
