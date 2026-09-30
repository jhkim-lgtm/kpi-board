/* Shared state, honest signal rules and display controls for monitor concepts. */
(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths={star:'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',trophy:'M7 3h10v6a5 5 0 0 1-10 0V3zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4M12 14v6m-5 1h10',alert:'M12 3L2 21h20L12 3zm0 6v6m0 3v1',arrow:'M5 16L12 9l4 4 5-8m-6 0h6v6',car:'M3 12l3-6h12l3 6v6H3v-6zm0 0h18M6 18v3m12-3v3M6 15h2m8 0h2',rocket:'M8 16l-4 4m2-8l-3 1 3 4 4 4 1-3M8 14C9 7 15 3 21 3c0 6-4 12-11 13l-2-2zm7-5h1',pause:'M8 4v16M16 4v16',check:'M4 12l5 5L20 6'};
  const icon=name=>`<svg class="m-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.star}"/></svg>`;
  const state={demo:false,rule:'one-percent',motion:true,playing:false};
  try{const savedRule=localStorage.getItem('kpi-monitor-rule-v1');if(['one-percent','any-drop','three-days'].includes(savedRule))state.rule=savedRule;}catch{}
  document.getElementById('monitor-rule').value=state.rule;
  const feedKeys={kr:'1club.kr',mfk:'myfirstkorea',jp:'1club.jp',rr:'rollsroycecarsseoul',plus:'pluskr_official',kef:'kef.korea',prov:'rollsroyceseoulprovenance',kakao:'rr_kakao',yt:'rr_youtube'};
  const status=c=>{
    if(c.delta==null)return {key:'unknown',label:'비교 없음',icon:'alert'};
    const prior=c.current-c.delta, drop=prior>0?-c.delta/prior:0;
    const emergency=c.period==='전일'&&c.delta<0&&(state.rule==='any-drop'||(state.rule==='three-days'?(c.declineDays||0)>=3:drop>=.01));
    if(emergency)return {key:'emergency',label:'비상',icon:'alert'};
    if(c.delta<0)return {key:'watch',label:'감소 확인',icon:'alert'};
    if(c.current>=c.goal)return {key:'goal',label:'목표 달성',icon:'trophy'};
    if(c.delta>0)return {key:'growing',label:'성장 중',icon:'star'};
    return {key:'steady',label:'변동 없음',icon:'pause'};
  };
  const ruleLabel=()=>state.rule==='any-drop'?'전일 감소 = 비상':state.rule==='three-days'?'3일 연속 감소 = 비상':'전일 1% 이상 감소 = 비상';
  function make(ctx){
    const badge=c=>{const s=status(c);return `<span class="m-badge m-${s.key}">${icon(s.icon)}${s.label}</span>`;};
    const bar=c=>`<div class="m-track m-${status(c).key}" role="meter" aria-label="${esc(c.name)} 현재 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress.toFixed(1)}"><div class="m-track-line"><div class="m-track-fill" style="width:${c.progress}%"></div><span class="m-traveler" aria-hidden="true">${icon(c.id==='rr'?'car':'rocket')}</span><b class="m-track-point" style="left:${c.progress}%" title="현재 ${ctx.pct(c)}"></b></div><div class="m-track-ticks" aria-hidden="true">${Array.from({length:11},(_,i)=>`<i${i%5===0?' class="major"':''}></i>`).join('')}</div><div class="m-track-meta"><b>현재 ${ctx.pct(c)}</b><span>목표 ${ctx.fmt(c.goal)}</span></div></div>`;
    const reason=c=>`<div class="m-reasons">${(c.id==='xhs'?[{key:'xhs_1club',name:'1%CLUB'},{key:'xhs_mfk',name:'MyFirstKorea'}]:[{key:c.id,name:c.name}]).map(r=>`<input class="m-reason" data-reason="${r.key}" aria-label="${esc(r.name)} 팔로우 이유" placeholder="${c.id==='xhs'?esc(r.name)+' · ':''}팔로우 이유 입력" maxlength="100">`).join('')}</div>`;
    const confetti=c=>{const s=status(c);if(!['goal','growing'].includes(s.key))return '';return `<span class="m-confetti ${s.key==='goal'?'m-party':'m-sparkles'}" aria-hidden="true">${Array.from({length:s.key==='goal'?12:4},(_,i)=>`<i style="--i:${i};--x:${(i*29+11)%100}%;--delay:${-(i%6)*.7}s">${s.key==='growing'?'✦':''}</i>`).join('')}</span>`;};
    const tile=(c,opt={})=>`<article class="m-card m-${status(c).key}${opt.compact?' m-compact':''}" data-channel="${c.id}">${confetti(c)}<div class="m-card-top"><h3>${c.name}</h3>${badge(c)}</div><strong class="m-value num">${ctx.fmt(c.current)}</strong><div class="m-change">${ctx.change(c)}</div>${ctx.parts(c)}${bar(c)}${opt.reason===false?'':reason(c)}</article>`;
    return {status,badge,bar,reason,confetti,icon,tile,ruleLabel};
  }
  function prepare(data){
    const d=JSON.parse(JSON.stringify(data));
    if(state.demo){
      const kr=d.rows.find(c=>c.id==='kr'),mfk=d.rows.find(c=>c.id==='mfk');
      for(const [c,delta] of [[kr,-5000],[mfk,2500]]){const prev=c.current-c.delta;c.current=prev+delta;c.delta=delta;c.declineDays=c.id==='kr'?3:0;c.progress=Math.min(100,Math.max(0,(c.current-c.baseline)/(c.goal-c.baseline)*100));}
    }
    return d;
  }
  function legend(ctx){
    const counts={};ctx.all.forEach(c=>{const k=status(c).key;counts[k]=(counts[k]||0)+1;});
    return `<div class="m-legend"><div>${[['emergency','비상'],['watch','감소'],['growing','성장'],['steady','변동 없음'],['goal','목표 달성']].map(([k,l])=>`<span class="m-legend-item m-${k}"><i></i>${l} <b>${counts[k]||0}</b></span>`).join('')}</div><span class="m-rule">${ruleLabel()} · 고정점 = 현재 진척</span></div>`;
  }
  let resizeObserver,timer;
  function fit(){
    const board=document.getElementById('board');if(!board?.classList.contains('monitor-board'))return;
    const presenting=document.body.classList.contains('presenting');
    const width=presenting?innerWidth:board.clientWidth;
    const scale=Math.min(width/1600,presenting?innerHeight/900:Infinity);
    board.style.height=900*scale+'px';
    if(presenting)board.style.width=1600*scale+'px';else board.style.width='';
    board.querySelector('.board-inner').style.transform=`scale(${scale})`;
  }
  function hydrate(){
    document.querySelectorAll('#board [data-reason]').forEach(el=>{const key=feedKeys[el.dataset.reason]||el.dataset.reason;try{el.value=localStorage.getItem('kpi-follow-reason-v1:'+key)||'';}catch{};});
    document.getElementById('board').classList.toggle('motion-paused',!state.motion);
    resizeObserver?.disconnect();resizeObserver=new ResizeObserver(fit);resizeObserver.observe(document.getElementById('board'));fit();
  }
  function cleanup(){resizeObserver?.disconnect();const board=document.getElementById('board');board.style.height='';board.style.width='';}
  function current(){const n=Number(location.hash.slice(1));return n>=11&&n<=20?n:11;}
  function rerender(){window.renderConcept?.(String(current()));}
  function playback(){
    clearInterval(timer);timer=null;
    if(state.playing)timer=setInterval(()=>{location.hash=String(current()===20?11:current()+1);},20000);
    const b=document.getElementById('monitor-play');if(b)b.textContent=state.playing?'자동 순환 중 · 20초':'자동 순환';
  }
  async function present(){
    if(Number(location.hash.slice(1))<11||Number.isNaN(Number(location.hash.slice(1)))){location.hash='11';window.renderConcept?.('11');}
    document.body.classList.add('presenting');fit();
    try{await document.documentElement.requestFullscreen();}catch{}fit();
  }
  async function exitPresent(){document.body.classList.remove('presenting');if(document.fullscreenElement)await document.exitFullscreen();fit();}
  document.addEventListener('input',e=>{const el=e.target;if(el.matches('[data-reason]')){try{localStorage.setItem('kpi-follow-reason-v1:'+(feedKeys[el.dataset.reason]||el.dataset.reason),el.value);}catch{document.getElementById('monitor-notice').textContent='문구 저장 불가 · 브라우저 저장 설정을 확인해주세요';}}});
  document.addEventListener('click',e=>{
    if(e.target.closest('#monitor-demo')){state.demo=!state.demo;document.getElementById('monitor-demo').setAttribute('aria-pressed',String(state.demo));document.getElementById('monitor-demo').textContent=state.demo?'현재 데이터로 복귀':'비상·축하 효과 데모';rerender();}
    if(e.target.closest('#monitor-motion')){state.motion=!state.motion;document.getElementById('monitor-motion').textContent=state.motion?'움직임 일시정지':'움직임 재생';document.querySelector('#board')?.classList.toggle('motion-paused',!state.motion);}
    if(e.target.closest('#monitor-play')){state.playing=!state.playing;if(state.playing&&!(Number(location.hash.slice(1))>=11&&Number(location.hash.slice(1))<=20)){location.hash='11';}playback();}
    if(e.target.closest('#monitor-fullscreen'))present();
    if(e.target.closest('#monitor-exit'))exitPresent();
  });
  document.addEventListener('change',e=>{if(e.target.id==='monitor-rule'){state.rule=e.target.value;try{localStorage.setItem('kpi-monitor-rule-v1',state.rule);}catch{}rerender();}});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if(e.key==='Escape')exitPresent();if(document.body.classList.contains('presenting')&&['ArrowRight','ArrowLeft'].includes(e.key)){const n=current();location.hash=String(e.key==='ArrowRight'?(n===20?11:n+1):(n===11?20:n-1));}});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('presenting');fit();});
  addEventListener('resize',fit);
  addEventListener('hashchange',()=>{if(!['monitor',...Array.from({length:10},(_,i)=>String(i+11))].includes(location.hash.slice(1))){state.playing=false;playback();if(document.body.classList.contains('presenting'))exitPresent();}});
  window.Monitor={state,make,status,prepare,legend,hydrate,cleanup,fit,icon,ruleLabel};
})();
