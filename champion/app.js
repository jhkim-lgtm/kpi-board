/* Five production views of Champion Tower 21. No sample-data fallback. */
(() => {
  'use strict';
  const assetBase=new URL('.',document.currentScript.src);
  const rootBase=new URL('../',assetBase);
  const monitorMode=document.body.dataset.mode==='monitor';
  const monitorURL=v=>new URL('monitor/?view='+v+'&motion=on&v=growth3',rootBase).href;
  const variants = [
    {id:1, name:'라이트 바', en:'LIGHT & PACE', desc:'증가 폭에 따라 빨라지는 상승 빛. 타워 안에서 성장 에너지가 차오르는 무대.', speed:'전일 증감 · 막대 길이 = 증가·감소 인원', bg:'느리게 흐르는 보랏빛 조명', recommend:true},
    {id:2, name:'아크 게이지', en:'THE QUIET ARCH', desc:'증가 폭을 곡선으로, 성장 속도를 빛의 맥박으로. 목표를 향해 움직이는 아치.', speed:'전일 증감 · 호의 길이 = 증가·감소 인원', bg:'빛이 번갈아 번지는 아치'},
    {id:3, name:'스텝 미터', en:'STEP BY STEP', desc:'실제 증가 규모만큼 켜지는 계단. 아래에서 위로 이어지는 빛으로 성장감을 강조.', speed:'전일 증감 · 계단 높이 = 증가·감소 인원', bg:'격자를 가로지르는 느린 빛'},
    {id:4, name:'트렌드 라인', en:'A LINE OF GROWTH', desc:'실제 7일 성장 곡선과 오늘의 도착점. 연속 성장과 다음 구간까지의 거리를 한눈에.', speed:'최근 7일 팔로워 추이 · 변화의 방향을 확인', bg:'넓고 부드러운 빛의 흐름'},
    {id:5, name:'도트 매트릭스', en:'DAYLIGHT EDITION', desc:'증가한 만큼 켜진 점에 리듬을 더한 밝은 무대. 작은 성장이 모이는 모습을 표현.', speed:'전일 증감 · 점의 개수 = 증가·감소 인원', bg:'느리게 이동하는 따뜻한 햇살'}
  ];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => Number.isFinite(n) ? new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(n) : '—';
  const signed = n => Number.isFinite(n) ? (n>0?'+':n<0?'−':'') + fmt(Math.abs(n)) : '—';
  const pct = c => Number.isFinite(c.progress) ? `${fmt(c.progress)}%` : '—';
  const keys = {kr:'1club.kr',mfk:'myfirstkorea',jp:'1club.jp',rr:'rollsroycecarsseoul',plus:'pluskr_official',kef:'kef.korea',prov:'rollsroyceseoulprovenance',kakao:'rr_kakao',yt:'rr_youtube'};
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let motionPreference=new URLSearchParams(location.search).get('motion');
  if(!['on','off'].includes(motionPreference)){try{motionPreference=localStorage.getItem('kpi-champion-motion-v2');}catch{}}
  if(!['on','off'].includes(motionPreference))motionPreference='auto';
  function syncMotion(){
    const enabled=motionPreference==='on'||(motionPreference==='auto'&&!reducedMotion.matches);
    document.body.classList.toggle('motion-paused',!enabled);
    document.body.classList.toggle('force-motion',motionPreference==='on');
    $('#motion').setAttribute('aria-pressed',String(enabled));
    $('#motion').textContent=enabled?'성장 모션 켜짐':'성장 모션 꺼짐';
    $('#motion').disabled=false;
  }
  $('#motion').addEventListener('click',()=>{motionPreference=document.body.classList.contains('motion-paused')?'on':'off';try{localStorage.setItem('kpi-champion-motion-v2',motionPreference);}catch{}if(monitorMode){const url=new URL(location.href);url.searchParams.set('motion',motionPreference);history.replaceState(null,'',url);}syncMotion();});
  reducedMotion.addEventListener('change',syncMotion);
  syncMotion();
  const flags = {kr:'🇰🇷',mfk:'🌏',jp:'🇯🇵',xhs:'🇨🇳'};
  let data = null, fetching = false, pendingRender = false;
  const currentView = () => {
    if(monitorMode){const v=Number(new URLSearchParams(location.search).get('view'));return [1,2,3,4,5].includes(v)?v:1;}
    return location.hash === '#compare' ? 'compare' : ([1,2,3,4,5].includes(Number(location.hash.slice(1)))?Number(location.hash.slice(1)):1);
  };
  if(monitorMode){
    document.body.classList.add('presenting','monitor-mode');
    const controls=$('.app-actions');controls.classList.add('monitor-toolbar');
    const compare=controls.querySelector('a');compare.href=new URL('#compare',rootBase).href;compare.textContent='5개 시안 비교';compare.target='_blank';compare.rel='noopener';
    document.body.appendChild(controls);
  }
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
    const next=c.growth.nextPercent;
    return `<div class="tower-wrap"><div class="tower" role="meter" aria-label="${esc(c.name)} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${level}" aria-valuetext="${pct(c)}" style="--level:${level}%"><div class="tower-grid">${Array.from({length:11},(_,i)=>`<i style="bottom:${i*10}%">${i%5===0?`<span>${i*10}</span>`:''}</i>`).join('')}</div>${next?`<div class="tower-next" style="bottom:${next}%"><span>다음 ${next}%</span></div>`:''}<div class="tower-fill"><i class="rise-beam" aria-hidden="true"></i><i class="rise-beam second" aria-hidden="true"></i></div><div class="tower-marker"><b></b></div></div><div class="tower-caption"><span>목표 진척</span><strong>${pct(c)}</strong></div></div>`;
  }
  function milestone(c,hero) {
    const g=c.growth;
    if(g.surplus!==null)return `<div class="milestone complete"><span>목표 달성${g.surplus>0?' · 초과 달성':''}</span><strong>${g.surplus>0?'+'+fmt(g.surplus)+'명':'100%'}</strong></div>`;
    if(g.nextRemaining===null)return '';
    const forecast=hero&&g.mode==='growth'&&g.projectedDays!==null?`<small>7일 평균 ${signed(g.average7)}명/일 유지 시 약 ${fmt(g.projectedDays)}일</small>`:'';
    return `<div class="milestone"><span>다음 ${g.nextPercent}%까지</span><strong>${fmt(g.nextRemaining)}명</strong>${forecast}</div>`;
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
    if(variant===3) visual=`<div class="steps">${Array.from({length:12},(_,i)=>`<i class="${i<n?'lit':''}" style="height:${20+i*7}%;--step:${i}"></i>`).join('')}</div>`;
    if(variant===5) visual=`<div class="dots">${Array.from({length:24},(_,i)=>`<i class="${i<Math.ceil(ratio*24)?'lit':''}" style="--step:${i}"></i>`).join('')}</div>`;
    return `<div class="speed speed-${variant} ${c.delta<0?'negative':''}" aria-label="전일 ${signed(c.delta)}명, 공통 최대 눈금 ${fmt(max)}명">${visual}<span class="speed-note">전일 ${c.delta===0?'변동 없음':c.delta<0?'감소 규모':'증가 규모'}</span></div>`;
  }
  function card(c,variant,max,rank=0) {
    const s=status(c), hero=rank>0;
    const partHTML=(c.parts||[]).length?`<div class="parts">${c.parts.map(p=>`<span>${esc(p.name)} <b>${fmt(p.current ?? p.value)}</b></span>`).join('')}</div>`:'';
    return `<article class="channel ${hero?'hero':'compact'} rank-${rank} ${s.cls} momentum-${c.growth.mode}" data-channel="${c.id}" style="--growth-duration:${c.growth.duration||6}s"><div class="card-heading">${hero?`<span class="medal">${rank===1?trophy:`<b>${String(rank).padStart(2,'0')}</b>`}</span>`:''}<div class="channel-heading">${hero?`<span class="rank-label">${c.jointRank?'공동 ':''}전일 증가 ${c.growthRank||rank}위</span>`:''}<h3>${flags[c.id]?`<span class="flag">${flags[c.id]}</span>`:''}${esc(c.name.replace(/^[🇰🇷🇯🇵🇨🇳🌏]+\s*/u,''))}</h3><span class="sub">${esc(c.sub||'')}</span></div><span class="badge">${s.label}${!hero&&c.jointRank&&c.growthRank<=3?' · 공동 '+c.growthRank+'위':''}</span></div><div class="card-main"><div class="metrics"><strong class="current">${fmt(c.current)}</strong><div class="change ${c.delta<0?'negative':''}"><b>${signed(c.delta)}</b><span>${esc(c.period)}</span>${hero&&c.growth.mode==='growth'&&c.growth.streak>1?`<small class="streak">${c.growth.streak}일 연속 증가</small>`:''}</div>${speed(c,variant,max)}${partHTML}</div>${hero?tower(c):''}</div>${!hero?`<div class="compact-progress"><div class="goal-rail" role="meter" aria-label="${esc(c.name)} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.max(0,Math.min(100,c.progress||0))}"><i style="width:${Math.max(0,Math.min(100,c.progress||0))}%"></i></div><span>현재 <b>${pct(c)}</b></span></div>`:''}<div class="goal"><span>목표 ${fmt(c.goal)}</span><span>${c.current>=c.goal?'달성 완료':`남은 ${fmt(Number.isFinite(c.current)?Math.max(0,c.goal-c.current):null)}명`}</span></div>${milestone(c,hero)}${reasons(c)}<span class="row-date">${esc(c.dataDate||'집계일 확인 중')}${c.stale?' · 최신 집계 확인 필요':''}</span></article>`;
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
    const maxPositive=Math.max(1,...eligible.map(c=>c.delta));
    all.forEach(c=>c.growth=window.GrowthModel.describe(c,maxPositive));
    const max=Math.max(1,...daily.filter(c=>!c.stale&&Number.isFinite(c.delta)).map(c=>Math.abs(c.delta)));
    const own=all.filter(c=>c.group==='own'), total=own.every(c=>Number.isFinite(c.current))?own.reduce((s,c)=>s+c.current,0):null;
    const totalDelta=own.every(c=>Number.isFinite(c.delta)&&!c.stale)?own.reduce((s,c)=>s+c.delta,0):null;
    const weekly=own.every(c=>!c.stale&&Number.isFinite(c.growth.change7))?own.reduce((sum,c)=>sum+c.growth.change7,0):null;
    const nextUp=[...eligible].filter(c=>c.growth.nextRemaining!==null).sort((a,b)=>a.growth.nextRemaining-b.growth.nextRemaining)[0];
    const streakLeader=[...eligible].filter(c=>c.growth.streak>1).sort((a,b)=>b.growth.streak-a.growth.streak)[0];
    const headline=totalDelta>0?`어제보다 <em>${fmt(totalDelta)}명</em> 더 성장.`:totalDelta===0?'오늘의 기록, 다음 성장의 출발점.':totalDelta<0?'오늘의 변화를 보고, 다음 성장을 준비.':'오늘의 기록에서, 다음 성장으로.';
    const board=$('#board');board.className=`board theme-${v}`;
    board.innerHTML=`<div class="board-inner"><div class="background-art" aria-hidden="true"><i></i><i></i><i></i></div><header class="board-head"><div><div class="board-brand">1%CLUB <span>CHAMPION TOWER</span></div><h2>${headline}</h2><p class="board-date">${esc(newest||data.dataDate||'')} 일별 집계 기준 <span>· 월간 채널 별도 표기</span></p></div><div class="total"><span>자사 매체 팔로워 합계</span><strong>${fmt(total)}</strong><div class="total-change ${totalDelta<0?'negative':''}">${signed(totalDelta)} <small>전일</small></div></div></header><div class="momentum-strip"><div class="momentum-stat"><span>자사 매체 · 최근 7일 순증</span><strong class="${weekly<0?'negative':''}">${signed(weekly)}<small>명</small></strong><p>쌓여가는 우리의 성장</p></div><div class="momentum-stat"><span>일별 채널 · 최장 연속 성장</span><strong>${streakLeader?fmt(streakLeader.growth.streak):'—'}<small>일</small></strong><p>${streakLeader?esc(streakLeader.name):'연속 증가 기록 대기'}</p></div><div class="momentum-stat next-up"><span>성장 중인 채널 · 다음 구간까지 최소 인원</span><strong>${nextUp?fmt(nextUp.growth.nextRemaining):'—'}<small>명 남음</small></strong><p>${nextUp?esc(nextUp.name)+' · '+nextUp.growth.nextPercent+'% 구간':'집계 가능한 성장 채널 대기'}</p></div></div><div class="section-title"><h3>오늘의 성장 챔피언 <span>TOP 3</span></h3><p>전일 증가 인원순 · 상승 빛이 빠를수록 큰 증가 · 동률 이름순 · 월간 제외</p></div><div class="podium">${top.length===3?[1,0,2].map(i=>card(top[i],v,max,i+1)).join(''):top.length?[1,0,2].map(i=>top[i]?card(top[i],v,max,i+1):'<div class="empty-slot">집계 가능한 증가 채널 대기</div>').join(''):'<div class="no-winner">같은 기준일의 증가 채널이 없습니다.<span>아래에서 채널별 집계 상태를 확인하세요.</span></div>'}</div><div class="section-title rest-title"><h3>채널별 다음 목표 <span>${String(rest.length).padStart(2,'0')}</span></h3><p>${esc(variants[v-1].speed)}${v===4?'':` · 공통 최대 ${fmt(max)}명`}</p></div><div class="rest" style="--count:${rest.length}">${rest.map(c=>card(c,v,max)).join('')}</div><footer class="board-foot"><span>타워 높이 = 실제 목표 진척 · 다음 구간은 10% 간격 · 롤스 진척은 22,012명부터 30,000명까지</span><span>${String(v).padStart(2,'0')} / ${variants[v-1].en}</span></footer></div>`;
    board.querySelectorAll('[data-reason]').forEach(el=>{try{el.value=localStorage.getItem('kpi-follow-reason-v1:'+el.dataset.reason)||'';}catch{}});
    window.championReady=true;requestAnimationFrame(fitFullscreen);
  }
  function render() {
    const view=currentView(), gallery=view==='compare',v=gallery?1:view;
    document.title='1%CLUB · '+(gallery?'챔피언 타워 시안 5개':variants[v-1].name+(monitorMode?' · 모니터':''));
    $('#variants').innerHTML=`<a href="#compare" aria-current="${gallery?'page':'false'}">5개 시안 비교</a>`+variants.map(x=>`<a href="${monitorURL(x.id)}" target="_blank" rel="noopener" aria-label="0${x.id} ${x.name} 모니터 새 탭"><span>${String(x.id).padStart(2,'0')}</span>${x.name}${x.recommend?'<b>추천</b>':''}</a>`).join('');
    $('#variant-title').textContent=gallery?'같은 성과, 다섯 가지 표현.':variants[v-1].name;
    $('#variant-description').textContent=gallery?'시안을 누르면 새 탭에서 움직이는 모니터 화면이 바로 열립니다. 열린 주소를 저장해 그대로 사용하세요.':variants[v-1].desc;
    $('#gallery').hidden=!gallery;$('#board').hidden=gallery;
    if(gallery) $('#gallery').innerHTML=variants.map(x=>`<a class="preview" href="${monitorURL(x.id)}" target="_blank" rel="noopener"><div class="preview-image"><img src="${new URL('previews/'+x.id+'.png?v=20261006-growth3',assetBase).href}" alt="${x.name} 챔피언 타워 전체 화면" loading="lazy"><span>모니터 화면 새 탭 ↗</span></div><div class="preview-copy"><span class="preview-index">0${x.id}</span><div><h2>${x.name}${x.recommend?'<b>추천</b>':''}</h2><p>${x.desc}</p><span class="preview-bg">배경 · ${x.bg}</span></div></div></a>`).join('');
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
      const monitorStatus=$('#monitor-status');if(monitorStatus)monitorStatus.textContent='피드 '+source+' · 5분마다 갱신';
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
    if(document.body.classList.contains('presenting')&&innerWidth>640&&board.offsetHeight){const h=board.offsetHeight,scale=Math.min(innerWidth/1600,innerHeight/h);board.style.transform='scale('+scale+')';main.style.width=1600*scale+'px';main.style.height=h*scale+'px';}
    else{board.style.transform='';main.style.width='';main.style.height='';}
  }
  window.addEventListener('resize',fitFullscreen);
  async function exitFullscreen() {if(!monitorMode)document.body.classList.remove('presenting');$('#exit-fullscreen').hidden=true;if(document.fullscreenElement)await document.exitFullscreen();fitFullscreen();}
  $('#refresh').addEventListener('click',refresh);
  $('#fullscreen').addEventListener('click',async()=>{if(currentView()==='compare')location.hash='1';document.body.classList.add('presenting');$('#exit-fullscreen').hidden=false;try{await document.documentElement.requestFullscreen();}catch{}requestAnimationFrame(fitFullscreen);});
  $('#exit-fullscreen').addEventListener('click',exitFullscreen);
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){if(!monitorMode)document.body.classList.remove('presenting');$('#exit-fullscreen').hidden=true;}requestAnimationFrame(fitFullscreen);});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if(e.key==='Escape')exitFullscreen();if(document.body.classList.contains('presenting')&&['ArrowLeft','ArrowRight'].includes(e.key)){const v=Number(currentView())||1,next=String((v-1+(e.key==='ArrowRight'?1:4))%5+1);if(monitorMode){const url=new URL(location.href);url.searchParams.set('view',next);history.replaceState(null,'',url);render();}else location.hash=next;}});
  document.addEventListener('input',e=>{if(e.target.matches('[data-reason]')){try{localStorage.setItem('kpi-follow-reason-v1:'+e.target.dataset.reason,e.target.value);}catch{showNotice('이 브라우저에서 팔로우 이유를 저장할 수 없습니다.');}}});
  document.addEventListener('focusout',e=>{if(pendingRender&&e.target.matches('[data-reason]'))setTimeout(()=>{if(!document.activeElement?.matches('[data-reason]')){pendingRender=false;render();}},0);});
  window.addEventListener('hashchange',render);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  render();refresh();setInterval(refresh,300000);
})();
