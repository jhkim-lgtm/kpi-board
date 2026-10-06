(function (root) {
  'use strict';
  const views = root.GrowthDirections = root.GrowthDirections || {};
  const valid = value => typeof value === 'number' && Number.isFinite(value);
  const f = (ctx, n) => valid(n) ? ctx.f(n) : '—';
  const s = (ctx, n) => valid(n) ? ctx.s(n) : '—';
  const e = (ctx, value) => ctx.e(String(value == null ? '' : value));
  const rows = ctx => Array.isArray(ctx.rows) ? ctx.rows : [];
  const own = ctx => Array.isArray(ctx.own) ? ctx.own : rows(ctx).filter(c => c.group === 'own');
  const percent = value => valid(value) ? Math.max(0, Math.min(100, value)) : 0;
  const isDaily = c => c.period === '전일';
  const rising = c => isDaily(c) && !c.stale && valid(c.current) && valid(c.delta) && c.delta > 0 && (!c.growth || c.growth.mode === 'growth');
  const mood = c => !isDaily(c) || c.stale || !valid(c.delta) ? 'quiet' : c.delta > 0 ? 'up' : c.delta < 0 ? 'down' : 'flat';
  const name = c => ({kr:'1%CLUB 코리아',mfk:'MyFirstKorea',jp:'1%CLUB 재팬',xhs:'샤오홍슈',rr:'롤스로이스 서울',prov:'RR 프로비넌스',kakao:'RR 카카오',yt:'RR 유튜브',plus:'한화 PLUS',kef:'KEF'}[c.id] || c.name);
  const flag = c => ({kr:'🇰🇷',mfk:'🌏',jp:'🇯🇵',xhs:'🇨🇳'}[c.id] || '');
  const stateLabel = c => c.stale ? '이전 기록' : !valid(c.delta) ? '미집계' : c.delta > 0 ? '증가' : c.delta < 0 ? '감소' : '변화 없음';
  const day = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10) === value;
  const shift = (date, days) => new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
  const freshOwn = ctx => own(ctx).length === 4 && own(ctx).every(c => !c.stale && c.dataDate === ctx.date && valid(c.current));

  views[15] = {render(ctx) {
    const all=rows(ctx),daily=all.filter(isDaily),growth=daily.filter(rising),measured=daily.filter(c=>!c.stale&&c.dataDate===ctx.date&&valid(c.current)&&valid(c.delta)),positions={kr:[132,61],mfk:[196,214],jp:[130,363],xhs:[415,80],rr:[738,49],plus:[1030,91],kef:[824,214],prov:[1071,257],kakao:[743,362],yt:[1054,380]},hub={x:527,y:244};
    const links=all.map((c,index)=>{
      const position=positions[c.id]||[120+index*98,190],x=position[0],y=position[1],mx=(x+hub.x)/2,path=`M${x} ${y}C${mx} ${y} ${mx} ${hub.y} ${hub.x} ${hub.y}`;
      return `<path class="gd15-wire" d="${path}"/>${rising(c)?`<path class="gd15-current motion" d="${path}" pathLength="100" style="animation-duration:${valid(c.growth&&c.growth.duration)?c.growth.duration+1:5}s"/>`:''}`;
    }).join('');
    return `<div class="gd15-layout"><div class="gd15-story"><span class="gd15-kicker">SPARK NETWORK / 10 CHANNELS</span><h2>서로 다른 성장,<br>하나의 팀 에너지.</h2><p>오늘 늘어난 채널의 연결선에<br>빛이 흐릅니다.</p><div class="gd15-own-total"><small>자사 4개 미디어 합계</small><strong>${f(ctx,ctx.total)}</strong><span>명 · 운영대행 채널과 별도 집계</span></div><div class="gd15-legend"><span><i class="up"></i>오늘 증가</span><span><i></i>감소·보합·월간 기록</span></div></div><div class="gd15-network"><svg class="gd15-connections" viewBox="0 0 1200 430" preserveAspectRatio="none" aria-hidden="true">${links}</svg><div class="gd15-hub" style="left:${hub.x/12}%;top:${hub.y/4.3}%"><span>오늘 성장한 채널</span><div><strong>${measured.length?growth.length:'—'}</strong><i>/ ${daily.length}</i></div><small>${measured.length===daily.length?'일별 집계 채널 기준':`오늘 집계 ${measured.length}개 확인`}</small><b>GROWING TOGETHER</b></div>${all.map((c,index)=>{
      const position=positions[c.id]||[120+index*98,190];
      return `<article class="gd15-node ${mood(c)}" data-channel="${e(ctx,c.id)}" style="left:${position[0]/12}%;top:${position[1]/4.3}%"><span><i></i>${e(ctx,name(c))}</span><strong>${f(ctx,c.current)}</strong><small>${c.stale?'이전 기록':e(ctx,c.period)} <b>${s(ctx,c.delta)}</b></small></article>`;
    }).join('')}</div></div>`;
  }};

  function terminalRow(ctx,c) {
    return `<div class="gd16-record ${mood(c)}" data-channel="${e(ctx,c.id)}"><span class="gd16-route-code">${e(ctx,c.id.toUpperCase())}</span><span class="gd16-channel">${e(ctx,name(c))}</span><strong class="gd16-amount">${f(ctx,c.current)}</strong><b class="gd16-change">${s(ctx,c.stale?null:c.delta)}</b><span class="gd16-status">${rising(c)?'<i class="gd16-lamp motion"></i>':'<i></i>'}${e(ctx,stateLabel(c))}</span></div>`;
  }
  views[16] = {render(ctx) {
    const daily=rows(ctx).filter(isDaily),monthly=rows(ctx).filter(c=>!isDaily(c));
    return `<div class="gd16-layout"><div class="gd16-heading"><div><span class="gd16-kicker">THE RECORD TERMINAL</span><h2>오늘의 기록, 다음 성장의 출발점.</h2></div><div class="gd16-date"><span>DATA DATE / KST</span><b>${e(ctx,ctx.date||'집계 중')}</b></div></div><div class="gd16-body"><section class="gd16-daily"><div class="gd16-group-title"><span>DAILY / 일별 기록</span><b>${daily.length} CHANNELS</b></div><div class="gd16-panel"><div class="gd16-scan motion" aria-hidden="true"></div><div class="gd16-table-head"><span>CODE</span><span>CHANNEL</span><span>FOLLOWERS</span><span>전일 증감</span><span>상태</span></div>${daily.map(c=>terminalRow(ctx,c)).join('')}</div><div class="gd16-note"><span>실측 수치 고정 표시</span><span>단위: 명 · 전일 대비</span></div></section><section class="gd16-monthly"><div class="gd16-group-title"><span>MONTHLY / 월간 기록</span></div><div class="gd16-month-panel">${monthly.map(c=>`<article class="gd16-month-row" data-channel="${e(ctx,c.id)}"><div><span class="gd16-route-code">${e(ctx,c.id.toUpperCase())}</span><span>${e(ctx,name(c))}</span></div><strong>${f(ctx,c.current)}</strong><div class="gd16-month-change"><b>${s(ctx,c.delta)}</b><small>${e(ctx,c.period)}</small></div><span class="gd16-month-date">기준월 ${e(ctx,c.dataDate||'미집계')}</span></article>`).join('')}</div><div class="gd16-month-note"><b>기록은 정확하게.</b><span>월간 수치는 전월과 비교합니다.<br>일별 증감에 합산하지 않습니다.</span></div></section></div></div>`;
  }};

  function quest(ctx,c,index) {
    const g=c.growth||{},hasNext=valid(g.nextTarget)&&valid(g.nextRemaining)&&valid(g.nextPercent),week=!c.stale&&valid(g.change7)?g.change7:null,achieved=valid(c.current)&&valid(c.goal)&&c.current>=c.goal;
    return `<article class="gd17-quest ${rising(c)?'active':''}" data-channel="${e(ctx,c.id)}">${rising(c)?'<div class="gd17-edge-light motion" aria-hidden="true"></div>':''}<header><span class="gd17-quest-code">QUEST ${String(index+1).padStart(2,'0')}</span><span class="gd17-week ${valid(week)&&week<0?'down':''}">지난 7일 ${s(ctx,week)}명</span></header><h3>${flag(c)} ${e(ctx,name(c))}</h3><div class="gd17-mission"><div><span>${hasNext?`다음 ${g.nextPercent}% 구간까지`:achieved?'승인 목표 달성':'다음 구간 확인 중'}</span><strong>${hasNext?f(ctx,g.nextRemaining):achieved?'COMPLETE':'—'}${hasNext?'<small>명 남음</small>':''}</strong></div><div class="gd17-seal"><span>DATA</span><b>${achieved?'목표 도달':'실측 기준'}</b><i>VERIFIED</i></div></div><div class="gd17-progress"><i style="width:${percent(c.progress)}%"></i></div><div class="gd17-mission-foot"><span>현재 ${f(ctx,c.current)}명 · ${valid(c.progress)?c.progress.toFixed(1)+'%':'—'}</span><b>${hasNext?`다음 ${f(ctx,g.nextTarget)}명`:`목표 ${f(ctx,c.goal)}명`}</b></div></article>`;
  }
  views[17] = {render(ctx) {
    const achieved=rows(ctx).filter(c=>c.group==='agency'&&valid(c.current)&&valid(c.goal)&&c.goal>0&&c.current>=c.goal);
    return `<div class="gd17-layout"><div class="gd17-heading"><div><span class="gd17-kicker">QUEST BOARD / NEXT MILESTONES</span><h2>다음 성장을, 함께 완료해 볼까요?</h2></div><div class="gd17-week-total"><span>자사 미디어 지난 7일</span><b>${s(ctx,freshOwn(ctx)?ctx.week:null)}<small>명</small></b></div></div><div class="gd17-content"><div class="gd17-quests">${own(ctx).map((c,i)=>quest(ctx,c,i)).join('')}</div><aside class="gd17-achievements"><span class="gd17-side-kicker">AGENCY ACHIEVEMENTS</span><h3>목표에 도착한<br>우리의 성과.</h3><div class="gd17-completed"><b>${achieved.length}</b><span>개 운영대행 채널<br>승인 목표 달성</span></div><div class="gd17-achievement-list">${achieved.length?achieved.map(c=>`<article><span>${e(ctx,name(c))}</span><strong>${f(ctx,c.current)}<small>명</small></strong><b>목표보다 ${f(ctx,c.current-c.goal)}명 더</b><small>목표 ${f(ctx,c.goal)}명 · ${e(ctx,c.dataDate||'미집계')}${c.stale?' · 이전 기록':''}</small></article>`).join(''):'<p>각 채널의 다음 구간을<br>차근차근 완성하고 있습니다.</p>'}</div><div class="gd17-side-foot"><span>MISSION LOG</span><b>도달한 목표는 그대로 기록합니다.</b></div></aside></div><p class="gd17-note">각 미션은 기존 승인 목표 안의 다음 10% 구간입니다.</p></div>`;
  }};

  views[18] = {render(ctx) {
    const date=day(ctx.date)?ctx.date:null,source=Array.isArray(ctx.historySeries)?ctx.historySeries:[],history=new Map();
    source.forEach(p=>{if(p&&day(p.date)&&valid(p.value)&&p.value>=0)history.set(p.date,p.value);});
    // A feed measurement can correct the same-day history; it never fills another date.
    if(date&&valid(ctx.total)&&own(ctx).length===4&&own(ctx).every(c=>c.dataDate===date&&valid(c.current)))history.set(date,ctx.total);
    const points=Array.from({length:8},(_,i)=>({date:date?shift(date,i-7):null,value:date&&history.has(shift(date,i-7))?history.get(shift(date,i-7)):null}));
    const start=points[0].value,current=points[7].value,rawWeek=valid(start)&&valid(current)?current-start:null;
    const discrepancy=valid(rawWeek)&&valid(ctx.week)&&rawWeek!==ctx.week,week=freshOwn(ctx)&&!discrepancy?rawWeek:null;
    const deltas=points.slice(1).map((p,i)=>valid(p.value)&&valid(points[i].value)?p.value-points[i].value:null),available=points.map(p=>p.value).filter(valid);
    const min=available.length?Math.min(...available):0,max=available.length?Math.max(...available):1,padding=Math.max(35,(max-min)*.17),low=Math.max(0,min-padding),high=max+padding;
    const top=38,bottom=265,x0=111,gap=170,width=96,Y=value=>bottom-(value-low)/(high-low)*(bottom-top),fresh=freshOwn(ctx)&&!discrepancy;
    let marks='';
    for(let i=0;i<8;i++) {
      const p=points[i],x=x0+i*gap,known=valid(p.value),y=known?Y(p.value):null,delta=i?deltas[i-1]:null;
      if(!i) {
        marks+=known?`<rect class="gd18-anchor" x="${x-width/2}" y="${y-4}" width="${width}" height="8" rx="2"/><path class="gd18-foundation" d="M${x-29} ${y+4}V${bottom+2}M${x+29} ${y+4}V${bottom+2}"/><text class="gd18-anchor-value" x="${x}" y="${y-14}" text-anchor="middle">${f(ctx,p.value)}</text>`:`<rect class="gd18-missing" x="${x-width/2}" y="${bottom-39}" width="${width}" height="34" rx="3"/><text class="gd18-missing-text" x="${x}" y="${bottom-17}" text-anchor="middle">시작값 미집계</text>`;
      }else if(valid(delta)) {
        const previous=Y(points[i-1].value),barTop=Math.min(y,previous),barHeight=Math.max(2,Math.abs(previous-y)),path=`M${x-gap+width/2} ${previous}H${x-width/2}V${y}H${x+width/2}`,up=delta>0;
        marks+=`<path class="gd18-connector" d="M${x-gap+width/2} ${previous}H${x-width/2}"/><rect class="gd18-block ${up?'up':delta<0?'down':'flat'}" x="${x-width/2}" y="${barTop}" width="${width}" height="${barHeight}" rx="2"/><path class="gd18-deck" d="M${x-width/2} ${y}H${x+width/2}"/><path class="gd18-foundation" d="M${x-27} ${Math.max(y,previous)}V${bottom+2}M${x+27} ${Math.max(y,previous)}V${bottom+2}"/>${up&&fresh?`<path class="gd18-progress-light motion" d="${path}" pathLength="100"/>`:''}<text class="gd18-delta ${up?'up':delta<0?'down':'flat'}" x="${x}" y="${barTop-13}" text-anchor="middle">${s(ctx,delta)}</text>`;
      }else {
        marks+=`<rect class="gd18-missing" x="${x-width/2}" y="${bottom-39}" width="${width}" height="34" rx="3"/><text class="gd18-missing-text" x="${x}" y="${bottom-17}" text-anchor="middle">구간 미집계</text>${known?`<circle cx="${x}" cy="${y}" r="3.5" fill="#8794a0"/>`:''}`;
      }
      marks+=`<text class="gd18-day" x="${x}" y="${bottom+29}" text-anchor="middle">${p.date?e(ctx,p.date.slice(5).replace('-','.')):'—'}</text><text class="gd18-day-label" x="${x}" y="${bottom+49}" text-anchor="middle">${!i?'7일 전':i===7?'현재':known?f(ctx,p.value)+'명':'관측값 없음'}</text>`;
    }
    const axes=available.length?Array.from({length:4},(_,i)=>{const value=low+(high-low)*i/3,y=Y(value);return `<path class="gd18-grid" d="M60 ${y}H1365"/><text class="gd18-axis" x="49" y="${y+4}" text-anchor="end">${f(ctx,Math.round(value))}</text>`;}).join(''):'';
    return `<div class="gd18-layout"><div class="gd18-heading"><div class="gd18-title"><span class="gd18-kicker">GROWTH BRIDGE / 7 DAYS</span><h2>하루의 변화가,<br>오늘에 닿는 다리.</h2></div><div class="gd18-overview"><div><span>7일 전 자사 합계</span><b>${f(ctx,start)}</b></div><div class="gd18-now"><span>현재 자사 합계</span><strong>${f(ctx,current)}</strong></div><div class="gd18-net"><span>최근 7일 순증</span><strong>${s(ctx,week)}</strong><small>명</small></div></div></div><div class="gd18-chart-head"><span>자사 4개 미디어 · 팔로워 합계 / 명</span><span>${date?e(ctx,shift(date,-7))+' – '+e(ctx,date):'기준일 확인 중'}</span></div><div class="gd18-viewport"><svg class="gd18-chart" viewBox="0 0 1410 330" role="img" aria-label="최근 7일 자사 팔로워 변화. 시작 ${f(ctx,start)}명, 현재 ${f(ctx,current)}명, 순증 ${s(ctx,week)}명. ${deltas.filter(d=>!valid(d)).length}개 구간 미집계.">${axes}${marks}</svg></div><div class="gd18-caption"><span><i class="up"></i>증가 <i class="down"></i>감소 <i class="missing"></i>구간 미집계</span><span>${discrepancy?'주간 비교 기준 확인 중':deltas.some(d=>!valid(d))?'일치하는 날짜의 기록이 없는 구간은 연결하지 않습니다.':'매일의 실제 증감이 현재 팔로워에 연결됩니다.'}</span><small>가로로 넘겨 7일 다리 보기</small></div></div>`;
  }};
})(window);
