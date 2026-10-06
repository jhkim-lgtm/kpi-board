/* Five production views of Champion Tower 21. No sample-data fallback. */
(() => {
  'use strict';
  const variants = [
    {id:1, name:'라이트 바', en:'LIGHT & PACE', desc:'전일 증감을 빛의 길이로. 넓은 조명이 천천히 흐르는 무대.', speed:'전일 증감 · 막대 길이 = 증가·감소 인원', bg:'느리게 흐르는 보랏빛 조명', recommend:true},
    {id:2, name:'아크 게이지', en:'THE QUIET ARCH', desc:'전일 증감을 하나의 곡선으로. 아치의 빛이 은은하게 밝아지는 무대.', speed:'전일 증감 · 호의 길이 = 증가·감소 인원', bg:'빛이 번갈아 번지는 아치'},
    {id:3, name:'스텝 미터', en:'STEP BY STEP', desc:'전일 증감을 채워지는 계단으로. 격자 위로 잔잔하게 지나는 빛.', speed:'전일 증감 · 계단 높이 = 증가·감소 인원', bg:'격자를 가로지르는 느린 빛'},
    {id:4, name:'트렌드 라인', en:'A LINE OF GROWTH', desc:'최근 7일의 실제 기록을 선으로. 차콜 위를 부드럽게 흐르는 광택.', speed:'최근 7일 팔로워 추이 · 변화의 방향을 확인', bg:'넓고 부드러운 빛의 흐름'},
    {id:5, name:'도트 매트릭스', en:'DAYLIGHT EDITION', desc:'전일 증감을 작은 점의 밀도로. 종이 위에 햇살이 천천히 머무는 무대.', speed:'전일 증감 · 점의 개수 = 증가·감소 인원', bg:'느리게 이동하는 따뜻한 햇살'}
  ];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => Number.isFinite(n) ? new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(n) : '—';
  const signed = n => Number.isFinite(n) ? (n>0?'+':n<0?'−':'') + fmt(Math.abs(n)) : '—';
  const pct = c => Number.isFinite(c.progress) ? `${fmt(c.progress)}%` : '—';
  const keys = {kr:'1club.kr',mfk:'myfirstkorea',jp:'1club.jp',rr:'rollsroycecarsseoul',plus:'pluskr_official',kef:'kef.korea',prov:'rollsroyceseoulprovenance',kakao:'rr_kakao',yt:'rr_youtube'};
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=true;
  try{motion=localStorage.getItem('kpi-champion-ambient-v1')!=='off';}catch{}
  function syncMotion(){
    const enabled=motion&&!reducedMotion.matches;
    document.body.classList.toggle('motion-paused',!enabled);
    $('#motion').setAttribute('aria-pressed',String(enabled));
    $('#motion').textContent=reducedMotion.matches?'배경 정지 · 기기 설정':enabled?'배경 움직임 켜짐':'배경 움직임 꺼짐';
    $('#motion').disabled=reducedMotion.matches;
  }
  $('#motion').addEventListener('click',()=>{motion=!motion;try{localStorage.setItem('kpi-champion-ambient-v1',motion?'on':'off');}catch{}syncMotion();});
  reducedMotion.addEventListener('change',syncMotion);
  syncMotion();
  const flags = {kr:'🇰🇷',mfk:'🌏',jp:'🇯🇵',xhs:'🇨🇳'};
  let data = null, fetching = false, pendingRender = false;
  const currentView = () => location.hash === '#compare' ? 'compare' : ([1,2,3,4,5].includes(Number(location.hash.slice(1)))?Number(location.hash.slice(1)):1);
  const trophy = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M10 5h12v8a6 6 0 0 1-12 0V5Zm0 3H5v4a5 5 0 0 0 6 5m11-9h5v4a5 5 0 0 1-6 5M16 19v7m-6 1h12"/></svg>';
  function status(c) {
    if (!Number.isFinite(c.current)) return {cls:'unknown',label:'집계 확인'};
    if (c.stale) return {cls:'unknown',label:'이전 집계'};
    if (c.delta < 0) return {cls:'down',label:'감소 확인'};
    if (c.current >= c.goal) return {cls:'achieved',label:'목표 달성'};
    if (c.delta > 0) return {cls:'up',label:'성장 중'};
    return {cls:'neutral',label:c.delta===0?'변동 없음':'비교 대기'};
  }
  function reasons(c) {
    const fields=c.id==='xhs'?[['xhs_1club','1%CLUB'],['xhs_mfk','MyFirstKorea']]:[[keys[c.id]||c.id,c.name]];
    return `<div class="reasons">${fields.map(([key,name])=>`<input data-reason="${esc(key)}" aria-label="${esc(name)} 팔로우 이유" placeholder="${c.id==='xhs'?esc(name)+' · ':''}팔로우 이유 입력" maxlength="100">`).join('')}</div>`;
  }
  function tower(c) {
    const level = Math.max(0,Math.min(100,c.progress||0));
    return `<div class="tower-wrap"><div class="tower" role="meter" aria-label="${esc(c.name)} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${level}" aria-valuetext="${pct(c)}" style="--level:${level}%"><div class="tower-grid">${Array.from({length:11},(_,i)=>`<i style="bottom:${i*10}%">${i%5===0?`<span>${i*10}</span>`:''}</i>`).join('')}</div><div class="tower-fill"></div><div class="tower-marker"><b></b></div></div><div class="tower-caption"><span>목표 진척</span><strong>${pct(c)}</strong></div></div>`;
  }
  function sparkline(c) {
    const raw=(c.history||[]).filter(p=>Number.isFinite(p.value)&&p.date);
    const end = c.dataDate ? Date.parse(c.dataDate+'T00:00:00Z') : NaN;
    const points=raw.filter(p=>!Number.isFinite(end)||(Date.parse(p.date+'T00:00:00Z')>=end-6*86400000&&Date.parse(p.date+'T00:00:00Z')<=end));
    if(points.length<2) return '<span class="speed-missing">7일 추이 · 기록 부족</span>';
    const min=Math.min(...points.map(p=>p.value)), max=Math.max(...points.map(p=>p.value));
    const first=Date.parse(points[0].date+'T00:00:00Z'), last=Date.parse(points[points.length-1].date+'T00:00:00Z');
    const coords=points.map(p=>[4+(Date.parse(p.date+'T00:00:00Z')-first)/Math.max(86400000,last-first)*192,32-(p.value-min)/(max-min||1)*27]);
    return `<svg class="sparkline" viewBox="0 0 200 40" preserveAspectRatio="none" role="img" aria-label="${esc(c.name)} 최근 7일 팔로워 추이, ${points.length}개 관측"><path class="spark-base" d="M0 36H200"/><polyline points="${coords.map(p=>p.join(',')).join(' ')}"/>${coords.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</svg><span class="speed-note">${points[0].date.slice(5).replace('-','.')}–${points[points.length-1].date.slice(5).replace('-','.')} · ${points.length}회 관측</span>`;
  }
  function speed(c, variant, max) {
    if(c.period!=='전일') return `<div class="speed monthly-speed"><span>월간 집계</span><b>${esc(c.period)}</b></div>`;
    if(variant===4) return `<div class="speed speed-4 ${c.delta<0?'negative':''}">${sparkline(c)}</div>`;
    if(!Number.isFinite(c.delta))return '<div class="speed"><span class="speed-missing">전일 비교값 없음</span></div>';
    const ratio=Math.min(1,Math.abs(c.delta)/(max||1)), n=Math.ceil(ratio*12);
    let visual='';
    if(variant===1) visual=`<div class="pace-rail"><i style="width:${ratio*100}%"></i></div>`;
    if(variant===2) visual=`<svg class="arc" viewBox="0 0 120 58" aria-hidden="true"><path class="arc-base" d="M8 50A52 42 0 0 1 112 50" pathLength="100"/><path class="arc-value" d="M8 50A52 42 0 0 1 112 50" pathLength="100" stroke-dasharray="${ratio*100} 100"/><text x="60" y="48">${c.delta>0?'증가':c.delta<0?'감소':'유지'}</text></svg>`;
    if(variant===3) visual=`<div class="steps">${Array.from({length:12},(_,i)=>`<i class="${i<n?'lit':''}" style="height:${20+i*7}%"></i>`).join('')}</div>`;
    if(variant===5) visual=`<div class="dots">${Array.from({length:24},(_,i)=>`<i class="${i<Math.ceil(ratio*24)?'lit':''}"></i>`).join('')}</div>`;
    return `<div class="speed speed-${variant} ${c.delta<0?'negative':''}" aria-label="전일 ${signed(c.delta)}명, 공통 최대 눈금 ${fmt(max)}명">${visual}<span class="speed-note">전일 ${c.delta===0?'변동 없음':c.delta<0?'감소 규모':'증가 규모'}</span></div>`;
  }
  function card(c,variant,max,rank=0) {
    const s=status(c), hero=rank>0;
    const partHTML=(c.parts||[]).length?`<div class="parts">${c.parts.map(p=>`<span>${esc(p.name)} <b>${fmt(p.current ?? p.value)}</b></span>`).join('')}</div>`:'';
    return `<article class="channel ${hero?'hero':'compact'} rank-${rank} ${s.cls}" data-channel="${c.id}"><div class="card-heading">${hero?`<span class="medal">${rank===1?trophy:`<b>${String(rank).padStart(2,'0')}</b>`}</span>`:''}<div class="channel-heading">${hero?`<span class="rank-label">${c.jointRank?'공동 ':''}전일 증가 ${c.growthRank||rank}위</span>`:''}<h3>${flags[c.id]?`<span class="flag">${flags[c.id]}</span>`:''}${esc(c.name.replace(/^[🇰🇷🇯🇵🇨🇳🌏]+\s*/u,''))}</h3><span class="sub">${esc(c.sub||'')}</span></div><span class="badge">${s.label}${!hero&&c.jointRank&&c.growthRank<=3?' · 공동 '+c.growthRank+'위':''}</span></div><div class="card-main"><div class="metrics"><strong class="current">${fmt(c.current)}</strong><div class="change ${c.delta<0?'negative':''}"><b>${signed(c.delta)}</b><span>${esc(c.period)}</span></div>${speed(c,variant,max)}${partHTML}</div>${hero?tower(c):''}</div>${!hero?`<div class="compact-progress"><div class="goal-rail" role="meter" aria-label="${esc(c.name)} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.max(0,Math.min(100,c.progress||0))}"><i style="width:${Math.max(0,Math.min(100,c.progress||0))}%"></i></div><span>현재 <b>${pct(c)}</b></span></div>`:''}<div class="goal"><span>목표 ${fmt(c.goal)}</span><span>${c.current>=c.goal?'달성 완료':`남은 ${fmt(Number.isFinite(c.current)?Math.max(0,c.goal-c.current):null)}명`}</span></div>${reasons(c)}<span class="row-date">${esc(c.dataDate||'집계일 확인 중')}${c.stale?' · 최신 집계 확인 필요':''}</span></article>`;
  }
  function renderBoard(v) {
    if(!data) return;
    const all=data.rows, daily=all.filter(c=>c.period==='전일');
    const newest=daily.map(c=>c.dataDate).filter(Boolean).sort().at(-1);
    all.forEach(c=>c.stale=c.period==='전일'&&c.dataDate!==newest);
    const eligible=daily.filter(c=>c.delta>0&&!c.stale);
    const sorted=[...eligible].sort((a,b)=>b.delta-a.delta||a.name.localeCompare(b.name,'ko'));
    all.forEach(c=>{c.growthRank=null;c.jointRank=false;});
    sorted.forEach(c=>{c.growthRank=1+sorted.filter(o=>o.delta>c.delta).length;c.jointRank=sorted.filter(o=>o.delta===c.delta).length>1;});
    const top=sorted.slice(0,3), rest=all.filter(c=>!top.includes(c));
    const max=Math.max(1,...daily.filter(c=>!c.stale&&Number.isFinite(c.delta)).map(c=>Math.abs(c.delta)));
    const own=all.filter(c=>c.group==='own'), total=own.every(c=>Number.isFinite(c.current))?own.reduce((s,c)=>s+c.current,0):null;
    const totalDelta=own.every(c=>Number.isFinite(c.delta)&&!c.stale)?own.reduce((s,c)=>s+c.delta,0):null;
    const counts={up:0,down:0,achieved:0};all.forEach(c=>{const k=status(c).cls;if(k in counts)counts[k]++;});
    const board=$('#board');board.className=`board theme-${v}`;
    board.innerHTML=`<div class="board-inner"><div class="background-art" aria-hidden="true"><i></i><i></i><i></i></div><header class="board-head"><div><div class="board-brand">1%CLUB <span>CHAMPION TOWER</span></div><h2>성장을 쌓고,<br class="mobile-break"> 성과를 축하하다.</h2><p class="board-date">${esc(newest||data.dataDate||'')} 일별 집계 기준 <span>· 월간 채널 별도 표기</span></p></div><div class="total"><span>자사 매체 팔로워 합계</span><strong>${fmt(total)}</strong><div class="total-change ${totalDelta<0?'negative':''}">${signed(totalDelta)} <small>전일</small></div></div></header><div class="board-legend"><div><span><i class="green"></i>성장 ${counts.up}</span><span><i class="red"></i>감소 ${counts.down}</span><span><i class="gold"></i>목표 달성 ${counts.achieved}</span></div><span>타워 높이 = 목표 진척</span></div><div class="section-title"><h3>오늘의 성장 챔피언 <span>TOP 3</span></h3><p>전일 증가 인원순 · 동률은 이름순 3개 표시 · 월간 제외</p></div><div class="podium">${top.length===3?[1,0,2].map(i=>card(top[i],v,max,i+1)).join(''):top.length?[1,0,2].map(i=>top[i]?card(top[i],v,max,i+1):'<div class="empty-slot">집계 가능한 증가 채널 대기</div>').join(''):'<div class="no-winner">같은 기준일의 증가 채널이 없습니다.<span>아래에서 채널별 집계 상태를 확인하세요.</span></div>'}</div><div class="section-title rest-title"><h3>함께 오르는 채널 <span>${String(rest.length).padStart(2,'0')}</span></h3><p>${esc(variants[v-1].speed)}${v===4?'':` · 공통 최대 ${fmt(max)}명`}</p></div><div class="rest" style="--count:${rest.length}">${rest.map(c=>card(c,v,max)).join('')}</div><footer class="board-foot"><span>롤스로이스 서울 진척: 22,012명(2026.02 말)부터 30,000명까지</span><span>${String(v).padStart(2,'0')} / ${variants[v-1].en}</span></footer></div>`;
    board.querySelectorAll('[data-reason]').forEach(el=>{try{el.value=localStorage.getItem('kpi-follow-reason-v1:'+el.dataset.reason)||'';}catch{}});
    window.championReady=true;requestAnimationFrame(fitFullscreen);
  }
  function render() {
    const view=currentView(), gallery=view==='compare',v=gallery?1:view;
    $('#variants').innerHTML=`<a href="#compare" aria-current="${gallery?'page':'false'}">5개 시안 비교</a>`+variants.map(x=>`<a href="#${x.id}" aria-current="${view===x.id?'page':'false'}"><span>${String(x.id).padStart(2,'0')}</span>${x.name}${x.recommend?'<b>추천</b>':''}</a>`).join('');
    $('#variant-title').textContent=gallery?'같은 성과, 다섯 가지 표현.':variants[v-1].name;
    $('#variant-description').textContent=gallery?'모두 실제 데이터로 작동합니다. 시안을 열면 잔잔하게 움직이는 배경까지 확인할 수 있습니다.':variants[v-1].desc;
    $('#gallery').hidden=!gallery;$('#board').hidden=gallery;
    if(gallery) $('#gallery').innerHTML=variants.map(x=>`<a class="preview" href="#${x.id}"><div class="preview-image"><img src="${new URL("previews/"+x.id+".png",document.querySelector("script[src$=\"app.js\"]").src).href}" alt="${x.name} 챔피언 타워 전체 화면" loading="lazy"><span>시안 열기 ↗</span></div><div class="preview-copy"><span class="preview-index">0${x.id}</span><div><h2>${x.name}${x.recommend?'<b>추천</b>':''}</h2><p>${x.desc}</p><span class="preview-bg">배경 · ${x.bg}</span></div></div></a>`).join('');
    else renderBoard(v);
  }
  function showNotice(message) {$('#notice').hidden=!message;$('#notice').textContent=message;}
  async function refresh() {
    if(fetching)return;fetching=true;$('#refresh').disabled=true;$('#refresh').textContent='갱신 중';
    try {
      const incoming=await window.ChampionData.load();
      if(!incoming?.rows?.length)throw new Error('데이터가 비어 있습니다.');
      data=incoming;window.championData=data;
      const source=String(data.sourceUpdatedAt||data.fetchedAt||'').replace('T',' ').slice(0,16);
      $('#data-status').innerHTML=`<i></i> 실제 데이터 연결 <span>피드 갱신 ${esc(source)} · 화면 5분마다 갱신</span>`;
      showNotice((data.warnings||[]).join(' · '));
      // Avoid interrupting typing during the automatic refresh.
      if(!document.activeElement?.matches('[data-reason]')){pendingRender=false;render();}else pendingRender=true;
    } catch(error) {
      $('#data-status').textContent=data?'갱신 실패 · 이전 조회값 표시':'데이터 연결 실패';
      showNotice('최신 데이터를 불러오지 못했습니다. '+(data?'이전 조회값을 표시하고 5분 뒤 다시 시도합니다.':'새로고침을 눌러 다시 시도해 주세요.'));
      if(!data)$('#board').innerHTML='<div class="loading">데이터를 확인한 후 표시합니다.<br>상단의 새로고침을 눌러 주세요.</div>';
    } finally {fetching=false;$('#refresh').disabled=false;$('#refresh').textContent='새로고침';}
  }
  function fitFullscreen() {
    const board=$('#board'),main=$('main');
    if(document.body.classList.contains('presenting')&&innerWidth>640){const h=board.offsetHeight,scale=Math.min(innerWidth/1600,innerHeight/h);board.style.transform='scale('+scale+')';main.style.width=1600*scale+'px';main.style.height=h*scale+'px';}
    else{board.style.transform='';main.style.width='';main.style.height='';}
  }
  window.addEventListener('resize',fitFullscreen);
  async function exitFullscreen() {document.body.classList.remove('presenting');$('#exit-fullscreen').hidden=true;if(document.fullscreenElement)await document.exitFullscreen();fitFullscreen();}
  $('#refresh').addEventListener('click',refresh);
  $('#fullscreen').addEventListener('click',async()=>{if(currentView()==='compare')location.hash='1';document.body.classList.add('presenting');$('#exit-fullscreen').hidden=false;try{await document.documentElement.requestFullscreen();}catch{}requestAnimationFrame(fitFullscreen);});
  $('#exit-fullscreen').addEventListener('click',exitFullscreen);
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){document.body.classList.remove('presenting');$('#exit-fullscreen').hidden=true;}requestAnimationFrame(fitFullscreen);});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if(e.key==='Escape')exitFullscreen();if(document.body.classList.contains('presenting')&&['ArrowLeft','ArrowRight'].includes(e.key)){const v=Number(currentView())||1;location.hash=String((v-1+(e.key==='ArrowRight'?1:4))%5+1);}});
  document.addEventListener('input',e=>{if(e.target.matches('[data-reason]')){try{localStorage.setItem('kpi-follow-reason-v1:'+e.target.dataset.reason,e.target.value);}catch{showNotice('이 브라우저에서 팔로우 이유를 저장할 수 없습니다.');}}});
  document.addEventListener('focusout',e=>{if(pendingRender&&e.target.matches('[data-reason]'))setTimeout(()=>{if(!document.activeElement?.matches('[data-reason]')){pendingRender=false;render();}},0);});
  window.addEventListener('hashchange',render);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  render();refresh();setInterval(refresh,300000);
})();
