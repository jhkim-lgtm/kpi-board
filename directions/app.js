/* Independent monitor concepts; the existing Champion Tower URLs stay intact. */
(() => {
  'use strict';
  const meta=[
    {id:1,name:'그로스 레이스',en:'GROWTH RACE',tag:'경쟁과 속도',desc:'같은 결승선을 향해 달리는 채널들. 누가 얼마나 가까워졌는지 트랙 위에서 비교합니다.',motion:'성장한 채널의 레인에 속도감 있는 빛이 흐릅니다.',fit:'매일 성과를 비교하며 팀에 긴장감을 주고 싶을 때',recommend:true},
    {id:2,name:'서밋 루트',en:'SUMMIT ROUTE',tag:'도전과 여정',desc:'목표를 정상으로, 현재를 등반 위치로. 다음 구간까지 남은 거리를 지도처럼 봅니다.',motion:'성장한 채널의 현재 위치에 빛이 번집니다.',fit:'큰 목표를 작은 이정표로 나누어 보여주고 싶을 때'},
    {id:3,name:'스타디움',en:'THE STADIUM',tag:'순위와 성취',desc:'오늘의 성장 상위 채널을 경기장 전광판처럼. 큰 점수와 순위가 화면을 채웁니다.',motion:'성장 챔피언 주변 조명과 전광판의 빛이 움직입니다.',fit:'멀리서도 보이는 강한 동기부여 화면이 필요할 때',recommend:true},
    {id:4,name:'오비탈 골',en:'ORBITAL GOALS',tag:'몰입과 균형',desc:'채널별 목표를 네 개의 궤도로. 각자의 진척과 성장 리듬을 하나의 우주로 엮습니다.',motion:'진척 호는 고정하고, 성장한 채널의 궤도에 빛이 순환합니다.',fit:'미래적인 분위기와 차분한 역동성을 함께 원할 때'},
    {id:5,name:'그로스 타이드',en:'GROWTH TIDE',tag:'누적과 흐름',desc:'실제 7일 기록을 하나의 큰 파도로. 오늘까지 쌓인 성장을 선명하게 드러냅니다.',motion:'실측 곡선 아래로 흐름이 지나고 마지막 관측점이 호흡합니다.',fit:'하루의 등락보다 지속되는 성장 추세를 강조할 때'},
    {id:6,name:'그로스 가든',en:'GROWTH GARDEN',tag:'축적과 보람',desc:'채널을 각기 다른 식물로. 목표 진척이 정원의 크기와 풍성함이 됩니다.',motion:'성장한 채널에만 잎의 움직임과 빛을 더합니다.',fit:'경쟁보다 함께 키워가는 감각과 따뜻한 분위기를 원할 때'},
    {id:7,name:'마일스톤 메트로',en:'MILESTONE METRO',tag:'다음 목표',desc:'10%마다 도착하는 역. 현재 위치와 다음 역까지 남은 인원을 노선도처럼 보여줍니다.',motion:'현재 위치는 고정하고, 성장 노선 위로 빛이 진행합니다.',fit:'지금 팀이 달성할 다음 작은 목표를 명확히 할 때',recommend:true},
    {id:8,name:'선라이즈',en:'SUNRISE HORIZON',tag:'상승과 기대',desc:'목표를 향해 떠오르는 태양. 자사 전체 진척을 하나의 큰 지평선으로 표현합니다.',motion:'태양의 실제 진척 위치를 유지하며 빛이 지평선으로 퍼집니다.',fit:'하루의 시작에 어울리는 크고 긍정적인 화면을 원할 때'},
    {id:9,name:'모멘텀 스튜디오',en:'MOMENTUM STUDIO',tag:'리듬과 에너지',desc:'일별 증감을 음량처럼 비교하는 이퀄라이저. 증가와 감소를 같은 기준선에서 읽습니다.',motion:'양수 막대의 고정된 높이 안에서 빛이 리듬을 만듭니다.',fit:'음악 스튜디오 같은 역동적인 분위기를 원할 때'},
    {id:10,name:'레코드 월',en:'THE RECORD WALL',tag:'집중과 임팩트',desc:'성과 숫자 자체가 포스터가 되는 화면. 이번 주의 성장과 오늘의 기록에 집중합니다.',motion:'숫자는 고정하고 대형 타이포 뒤의 조명과 기록 띠가 움직입니다.',fit:'복잡한 그래픽보다 큰 숫자와 명확한 메시지가 좋을 때'}
  ];
  const $=s=>document.querySelector(s);
  const f=n=>Number.isFinite(n)?new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(n):'—';
  const s=n=>Number.isFinite(n)?(n>0?'+':n<0?'−':'')+f(Math.abs(n)):'—';
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors={kr:'#94beff',mfk:'#a6ee75',jp:'#d1acff',xhs:'#ffb274',rr:'#91e1dd',plus:'#f1d676',kef:'#c4cbdf',prov:'#e9a4bd',kakao:'#f5e684',yt:'#ff9f95'};
  const url=id=>new URL('?view='+id+'&motion=on&v=lab1',location.href).href;
  const view=()=>{const n=Number(new URLSearchParams(location.search).get('view'));return Number.isInteger(n)&&n>=1&&n<=10?n:0;};
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let motion=new URLSearchParams(location.search).get('motion')||'auto',data=null,busy=false;
  function applyMotion(){const on=motion==='on'||(motion==='auto'&&!reduced.matches);document.body.classList.toggle('paused',!on);document.body.classList.toggle('motion-on',motion==='on');$('#motion').textContent=on?'모션 켜짐':'모션 꺼짐';$('#motion').setAttribute('aria-pressed',String(on));}
  function context(d){
    const rows=d.rows,daily=rows.filter(c=>c.period==='전일'),date=daily.map(c=>c.dataDate).filter(Boolean).sort().at(-1);
    const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
    rows.forEach(c=>c.stale=c.period==='전일'&&(c.dataDate!==date||c.dataDate<today));
    const positive=daily.filter(c=>!c.stale&&c.delta>0),maxDelta=Math.max(1,...positive.map(c=>c.delta));
    rows.forEach(c=>c.growth=GrowthModel.describe(c,maxDelta));
    const top=[...positive].sort((a,b)=>b.delta-a.delta||a.name.localeCompare(b.name,'ko')),own=rows.filter(c=>c.group==='own');
    const sum=key=>own.length===4&&own.every(c=>Number.isFinite(c[key]))?own.reduce((n,c)=>n+c[key],0):null;
    const total=own.every(c=>c.dataDate&&c.dataDate===date)?sum('current'):null,delta=own.every(c=>!c.stale)?sum('delta'):null;
    const week=own.every(c=>!c.stale&&Number.isFinite(c.growth.change7))?own.reduce((n,c)=>n+c.growth.change7,0):null;
    const maps=own.map(c=>new Map((c.history||[]).map(p=>[p.date,p.value])));
    const end=Date.parse(date+'T00:00:00Z');
    const series=(own[0]?.history||[]).filter(p=>Date.parse(p.date+'T00:00:00Z')>=end-6*86400000&&Date.parse(p.date+'T00:00:00Z')<=end&&maps.every(m=>Number.isFinite(m.get(p.date)))).map(p=>({date:p.date,value:maps.reduce((n,m)=>n+m.get(p.date),0)}));
    return{rows,own,daily,positive,top,maxDelta,total,delta,week,date,source:d.sourceUpdatedAt,f,s,e,colors,series};
  }
  function gallery(){
    document.body.classList.remove('monitor-mode');$('#monitor').hidden=true;$('#controls').hidden=true;$('#gallery').hidden=false;
    document.title='1%CLUB · 새로운 성장 대시보드 10';
    $('#gallery').innerHTML=`<header class="gallery-nav"><a class="brand" href="../">1%CLUB</a><span>GROWTH DIRECTIONS / 10</span><a href="../?v=growth3#compare">기존 챔피언 타워 보기 ↗</a></header><section class="gallery-intro"><div><span class="eyebrow">A DIFFERENT WAY TO SEE GROWTH</span><h1>성장이 보이는,<br>열 가지 다른 장면.</h1><p>레이스부터 정원까지. 우리 팀을 움직이게 할 화면을 골라보세요.<br>시안을 누르면 새 탭에서 모니터 화면이 바로 시작됩니다.</p></div><div class="gallery-note"><b>실제 팔로워 데이터 연결</b><span>10개 채널 · 화면 5분마다 갱신</span><span>모든 시안에 독립 모니터 주소 제공</span><small>먼저 보기 추천: 01 레이스 · 03 스타디움 · 07 메트로</small></div></section><div class="directions-grid">${meta.map(m=>`<a class="direction-card" href="${url(m.id)}" target="_blank" rel="noopener"><div class="direction-image"><img src="previews/${m.id}.png?v=lab1" alt="${e(m.name)} 실제 대시보드 미리보기" loading="${m.id<=2?'eager':'lazy'}"><span class="open-label">새 탭에서 움직임 보기 ↗</span></div><div class="direction-copy"><div class="direction-title"><span class="direction-number">${String(m.id).padStart(2,'0')}</span><h2>${m.name}</h2>${m.recommend?'<b>추천</b>':''}<span class="direction-tag">${m.tag}</span></div><p>${m.desc}</p><div class="motion-copy"><span>움직임</span>${m.motion}</div><div class="fit-copy">${m.fit}</div></div></a>`).join('')}</div><footer class="gallery-footer"><span>1%CLUB · 실제 기록을 바탕으로 성장의 다음 장면을 만듭니다.</span><span id="gallery-source">공식 데이터 확인 중</span></footer>`;
    if(data)$('#gallery-source').textContent='데이터 기준 '+data.dataDate;
  }
  function rollcall(c){return `<article class="roll-item ${c.delta<0?'negative':''}" data-channel="${c.id}"><div class="roll-name">${e(c.name)}</div><strong>${f(c.current)}</strong><div><b>${s(c.delta)}</b><span>${e(c.period)}</span></div><small>${c.stale?'이전 집계 · ':''}${e(c.dataDate||'미집계')}</small></article>`;}
  function render(){
    const id=view();if(!id){gallery();return;}
    const m=meta[id-1];document.body.classList.add('monitor-mode');$('#gallery').hidden=true;$('#monitor').hidden=false;$('#controls').hidden=false;
    document.title='1%CLUB · '+m.name+' · 모니터';$('#view-select').innerHTML=meta.map(x=>`<option value="${x.id}" ${x.id===id?'selected':''}>${String(x.id).padStart(2,'0')} ${x.name}</option>`).join('');
    if(!data)return;
    const c=context(data);window.labContext=c;
    const screen=$('#screen');screen.className='screen palette-'+id;
    const renderer=window.GrowthDirections?.[id];if(!renderer)throw new Error('시안 '+id+'를 불러오지 못했습니다.');
    screen.innerHTML=`<header class="screen-header"><div class="screen-title"><div class="brand">1%CLUB <span>${String(id).padStart(2,'0')} / ${m.en}</span></div><h1>${m.name}</h1><p>${e(c.date||'집계일 확인 중')} 일별 집계 기준 · 월간 채널은 별도 표시</p></div><div class="screen-total"><span>자사 매체 팔로워 합계</span><strong>${f(c.total)}</strong><b class="${c.delta<0?'negative':''}">${s(c.delta)}<small>명 · 전일</small></b></div></header><section class="scene design-${id}" aria-label="${m.name}">${renderer.render(c)}</section><section class="rollcall" aria-label="전체 10개 채널 실제 수치">${c.rows.map(rollcall).join('')}</section><footer class="screen-footer"><span>일별 10시 실측 · 화면 5분 갱신 · 롤스 진척: 22,012명부터 30,000명까지</span><span>피드 ${e(String(c.source||'').replace('T',' ').slice(0,16))}</span></footer>`;
    window.labReady=true;applyMotion();requestAnimationFrame(fit);
  }
  function fit(){if(!view())return;const screen=$('#screen'),outer=$('#monitor');if(innerWidth>800){const scale=Math.min(innerWidth/1600,innerHeight/900);screen.style.transform=`scale(${scale})`;outer.style.width=1600*scale+'px';outer.style.height=900*scale+'px';}else{screen.style.transform='';outer.style.width='';outer.style.height='';}}
  async function refresh(){if(busy)return;busy=true;try{const next=await ChampionData.load();if(!next.rows?.length)throw Error('빈 데이터');data=next;window.labData=data;$('#notice').textContent=(next.warnings||[]).join(' · ');$('#notice').hidden=!next.warnings?.length;render();}catch(err){$('#notice').hidden=false;$('#notice').textContent=(data?'갱신 실패 · 이전 조회값 표시. ':'데이터 연결 실패. ')+'5분 후 다시 확인합니다. '+err.message;}finally{busy=false;}}
  function switchView(id){const u=new URL(location.href);u.searchParams.set('view',id);u.searchParams.set('motion',motion==='off'?'off':'on');history.replaceState(null,'',u);render();}
  $('#view-select').addEventListener('change',ev=>switchView(Number(ev.target.value)));
  $('#motion').addEventListener('click',()=>{motion=document.body.classList.contains('paused')?'on':'off';const u=new URL(location.href);u.searchParams.set('motion',motion);history.replaceState(null,'',u);applyMotion();});
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}requestAnimationFrame(fit);});
  addEventListener('resize',fit);addEventListener('popstate',render);reduced.addEventListener('change',applyMotion);
  addEventListener('keydown',ev=>{if(ev.target.matches('input,select,textarea,button'))return;if(view()&&['ArrowLeft','ArrowRight'].includes(ev.key)){ev.preventDefault();switchView((view()-1+(ev.key==='ArrowRight'?1:9))%10+1);}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  applyMotion();render();refresh();setInterval(refresh,300000);
})();
