/* Directions 11–14: fixed real values, distinct visual structures. */
(() => {
  'use strict';
  const registry=window.GrowthDirections=window.GrowthDirections||{};
  const finite=n=>typeof n==='number'&&Number.isFinite(n);
  const bounded=n=>finite(n)?Math.max(0,Math.min(100,n)):0;
  const active=ctx=>finite(ctx.delta)&&ctx.delta>0&&validDay(ctx.date)&&ctx.own.length===4&&ctx.own.every(c=>c.dataDate===ctx.date&&!c.stale&&finite(c.current)&&c.current>=0);
  const progressText=(ctx,n)=>finite(n)?ctx.f(Math.round(n*10)/10):'—';
  const validDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
  const dayShift=(s,n)=>new Date(Date.parse(s+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
  const shortDay=s=>s?s.slice(5).replace('-','.'):'—';
  function totals(ctx) {
    const valid=validDay(ctx.date)&&ctx.own.length===4&&ctx.own.every(c=>c.dataDate===ctx.date&&finite(c.current)&&c.current>=0&&finite(c.goal)&&c.goal>0);
    if(!valid)return {current:null,goal:null,progress:null,remaining:null,nextPercent:null,nextRemaining:null,surplus:null};
    const current=ctx.own.reduce((sum,c)=>sum+c.current,0),goal=ctx.own.reduce((sum,c)=>sum+c.goal,0);
    const progress=bounded(current/goal*100),remaining=Math.max(0,goal-current),surplus=Math.max(0,current-goal);
    let nextPercent=null,nextRemaining=null;
    if(current<goal)for(let step=1;step<=10;step++){const target=Math.ceil(goal*step/10);if(target>current){nextPercent=step*10;nextRemaining=target-current;break;}}
    return {current,goal,progress,remaining,nextPercent,nextRemaining,surplus};
  }

  registry[11]={render(ctx){
    const {e,f,s}=ctx;
    return `<div class="gd11-root"><header class="gd11-header"><div><span class="gd11-kicker">MISSION MOSAIC / FOUR CHANNELS</span><h2>성장의 조각이, 목표를 완성합니다.</h2></div><p>100개의 타일 = 목표 100%<br>부분 타일도 실제 진척만큼 채웁니다.</p></header><div class="gd11-panels">${ctx.own.slice(0,4).map((c,i)=>{
      const level=finite(c.progress)?bounded(c.progress):null;
      const cells=Array.from({length:100},(_,cell)=>{const logical=(9-Math.floor(cell/10))*10+cell%10,amount=level===null?0:Math.max(0,Math.min(1,level-logical));return `<i class="gd11-cell${amount>0?' filled':''}">${amount>0?`<b style="width:${amount*100}%"></b>`:''}</i>`;}).join('');
      const live=c.growth?.mode==='growth'&&!c.stale;
      return `<article class="gd11-panel gd11-tone-${i+1}"><div class="gd11-name"><span>${String(i+1).padStart(2,'0')}</span><h3>${e(c.name)}</h3><b class="${c.delta<0?'negative':''}">${c.stale?'—':s(c.delta)}<small> ${c.stale?'이전 집계':'전일'}</small></b></div><div class="gd11-mosaic" role="img" aria-label="${e(c.name)} 목표 진척 ${level===null?'집계 대기':progressText(ctx,level)+'%'}"><div class="gd11-cells">${cells}</div>${live?'<div class="gd11-scan motion" aria-hidden="true"></div>':''}${level===null?'<span class="gd11-missing">진척 집계 대기</span>':''}</div><div class="gd11-progress"><strong>${progressText(ctx,level)}<small>%</small></strong><span>${f(c.current)}명<b>목표 ${f(c.goal)}명</b></span></div><p class="gd11-next">${c.growth?.surplus!=null?'목표 달성'+(c.growth.surplus>0?' · '+f(c.growth.surplus)+'명 초과':''):c.growth?.nextRemaining!=null?'다음 '+c.growth.nextPercent+'%까지 '+f(c.growth.nextRemaining)+'명':'다음 구간 집계 대기'}</p></article>`;
    }).join('')}</div></div>`;
  }};

  registry[12]={render(ctx){
    const {e,f,s}=ctx,t=totals(ctx),done=t.current!==null&&t.remaining===0,live=t.current!==null&&active(ctx);
    return `<div class="gd12-root"><header class="gd12-header"><div><span class="gd12-kicker">NEXT GATE / ONE SHARED DESTINATION</span><h2>다음 관문이, 눈앞에 있습니다.</h2></div><span class="gd12-rule">자사 4개 매체 합산 목표 · 관문당 10%</span></header><div class="gd12-layout"><aside class="gd12-status"><span>지금 통과한 거리</span><strong>${progressText(ctx,t.progress)}<small>%</small></strong><div class="gd12-total"><b>${f(t.current)}</b><span>현재 자사 팔로워</span></div><div class="gd12-total"><b>${f(t.goal)}</b><span>자사 매체 합산 목표</span></div><p class="gd12-delta ${ctx.delta<0?'negative':''}">${s(ctx.delta)}<small>명 / 전일</small></p><div class="gd12-key"><i></i>현재 진척은 고정됩니다.<br>움직이는 빛은 증가 흐름입니다.</div></aside><section class="gd12-portal"><svg class="gd12-frames" viewBox="0 0 1100 420" preserveAspectRatio="none" aria-hidden="true">${Array.from({length:10},(_,i)=>{const scale=Math.pow(.88,i),w=1050*scale,h=390*scale,x=(1100-w)/2,y=(420-h)/2,p=(i+1)*10;return `<rect class="gd12-gate${t.progress!==null&&t.progress>=p?' crossed':''}${t.nextPercent===p?' next':''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><text class="gd12-gate-label" x="${x+8}" y="${y+16}">${p}</text>`;}).join('')}<path class="gd12-perspective" d="M25 15L550 210M1075 15L550 210M25 405L550 210M1075 405L550 210"/></svg>${live?'<div class="gd12-traveler motion" aria-hidden="true"></div>':''}<div class="gd12-center"><span>${done?'ALL GATES COMPLETE':t.nextPercent!==null?'NEXT GATE / '+t.nextPercent+'%':'NEXT GATE'}</span><h3>${done?'목표 달성':t.nextPercent!==null?'다음 '+t.nextPercent+'% 구간까지':'집계 대기'}</h3><strong>${done?(t.surplus>0?'+'+f(t.surplus):'100'):f(t.nextRemaining)}<small>${done?(t.surplus>0?'명 초과':'%'):'명 남음'}</small></strong><p>${done?'자사 매체 합산 목표를 달성했습니다.':t.nextPercent!==null?'다음 문을 여는 데 필요한 실제 인원':'네 채널의 현재 수치를 확인하고 있습니다.'}</p></div><footer class="gd12-foot">10개의 고정 관문 · 100% = ${f(t.goal)}명</footer></section></div></div>`;
  }};

  registry[13]={render(ctx){
    const {e,f,s}=ctx,history=(ctx.historySeries||[]).filter(p=>validDay(p.date)&&finite(p.value)&&p.value>=0);
    const end=validDay(ctx.date)?ctx.date:history.map(p=>p.date).sort().at(-1);
    if(!end)return '<div class="gd13-root"><header class="gd13-header"><div><span class="gd13-kicker">GROWTH CALENDAR / 28 DAYS</span><h2>하루의 변화가, 한 달의 기록으로.</h2></div></header><div class="gd13-empty">같은 날짜의 자사 매체 기록을 기다립니다.</div></div>';
    const values=new Map(history.filter(p=>p.date<=end).map(p=>[p.date,p.value]));
    const days=Array.from({length:28},(_,i)=>{const date=dayShift(end,i-27),prior=dayShift(date,-1);return {date,delta:values.has(date)&&values.has(prior)?values.get(date)-values.get(prior):null};});
    const observed=days.filter(d=>finite(d.delta)),peak=observed.reduce((best,d)=>!best||d.delta>best.delta?d:best,null),max=Math.max(1,...observed.map(d=>Math.abs(d.delta))),start=days[0].date;
    const weekdays=['일','월','화','수','목','금','토'],firstWeekday=new Date(start+'T00:00:00Z').getUTCDay();
    const live=active(ctx);
    return `<div class="gd13-root"><header class="gd13-header"><div><span class="gd13-kicker">GROWTH CALENDAR / 28 DAYS</span><h2>하루의 변화가, 한 달의 기록으로.</h2></div><span class="gd13-range">${shortDay(start)}—${shortDay(end)} · 날짜순 28일</span></header><div class="gd13-layout"><aside class="gd13-summary"><span>최근 7일 자사 매체 순증</span><strong class="${ctx.week<0?'negative':''}">${s(ctx.week)}<small>명</small></strong><p>정확히 7일 전과 현재의 차이</p><div class="gd13-best"><span>28일 중 최대 일별 증감</span><b class="${peak?.delta<0?'negative':''}">${peak?s(peak.delta):'—'}<small>명</small></b><p>${peak?shortDay(peak.date)+' · 관측 가능한 날짜 기준':'비교 가능한 기록 대기'}</p></div><div class="gd13-legend"><div><i class="positive"></i>증가<i class="negative"></i>감소<i class="flat"></i>유지</div><span>빈 칸 = 전일 비교 기록 없음</span></div></aside><section class="gd13-calendar"><div class="gd13-weekdays">${Array.from({length:7},(_,i)=>`<span>${weekdays[(firstWeekday+i)%7]}</span>`).join('')}</div><div class="gd13-days">${days.map(d=>{const kind=d.delta===null?'missing':d.delta>0?'up':d.delta<0?'down':'flat',recent=d.date===end;return `<article class="gd13-day ${kind}${recent?' today':''}" style="--heat:${d.delta===null?0:(.11+Math.abs(d.delta)/max*.39).toFixed(3)}"><time datetime="${d.date}">${shortDay(d.date)}</time><strong>${s(d.delta)}</strong>${recent?'<span class="gd13-today">기준일</span>':''}${recent&&live&&d.delta>0?'<i class="gd13-live motion" aria-hidden="true"></i>':''}</article>`;}).join('')}</div><p class="gd13-note">단위: 명 · 연속된 날짜의 실제 기록만 비교 · 28일 중 ${observed.length}일 비교 가능</p></section></div></div>`;
  }};

  registry[14]={render(ctx){
    const {f,s}=ctx,t=totals(ctx),known=t.current!==null,done=known&&t.remaining===0;
    const ratio=known?t.current/(t.current+t.remaining||1):.5,angle=known?Math.max(-11,Math.min(11,(1-2*ratio)*11)):0;
    const depth=Math.sin(angle*Math.PI/180)*310,ly=58-depth,ry=58+depth,lp=198-depth,rp=198+depth;
    const leftBowl=`M105,${lp} Q240,${lp+83} 375,${lp} Z`,rightBowl=`M725,${rp} Q860,${rp+83} 995,${rp} Z`;
    return `<div class="gd14-root"><header class="gd14-header"><div><span class="gd14-kicker">BALANCE POINT / OWN CHANNEL GOAL</span><h2>우리가 쌓은 만큼,<br>남은 목표는 가벼워집니다.</h2></div><div class="gd14-next"><span>${done?'자사 매체 합산 목표 달성':t.nextPercent!==null?'다음 '+t.nextPercent+'% 구간까지':'다음 구간 집계 대기'}</span><b>${done?(t.surplus>0?'+'+f(t.surplus):'100'):f(t.nextRemaining)}<small>${done?(t.surplus>0?'명 초과':'%'):'명'}</small></b></div></header><div class="gd14-scale"><div class="gd14-value-row"><div><span>현재 자사 팔로워</span><strong>${f(t.current)}<small>명</small></strong></div><div><span>전체 목표까지 남음</span><strong>${f(t.remaining)}<small>명</small></strong></div></div><svg class="gd14-machine" viewBox="0 0 1100 305" role="img" aria-label="현재 팔로워 ${f(t.current)}명과 목표까지 남은 ${f(t.remaining)}명을 비교하는 저울"><defs><clipPath id="gd14-current-clip"><path d="${leftBowl}"/></clipPath><clipPath id="gd14-remaining-clip"><path d="${rightBowl}"/></clipPath></defs><path class="gd14-floor" d="M95 291H1005"/><path class="gd14-stand" d="M550 57L452 279H648Z"/><path class="gd14-stand-detail" d="M550 95L480 265H620Z"/><line class="gd14-beam" x1="240" y1="${ly}" x2="860" y2="${ry}"/><circle class="gd14-pivot" cx="550" cy="58" r="13"/><path class="gd14-cables" d="M240 ${ly}L105 ${lp}M240 ${ly}L375 ${lp}M860 ${ry}L725 ${rp}M860 ${ry}L995 ${rp}"/><path class="gd14-bowl" d="${leftBowl}"/><path class="gd14-bowl gd14-bowl-rest" d="${rightBowl}"/>${known?`<rect class="gd14-weight" x="105" y="${lp+42-ratio*42}" width="270" height="43" clip-path="url(#gd14-current-clip)"/><rect class="gd14-weight gd14-weight-rest" x="725" y="${rp+42-(1-ratio)*42}" width="270" height="43" clip-path="url(#gd14-remaining-clip)"/>`:''}<text class="gd14-percent" text-anchor="middle" x="550" y="221">${progressText(ctx,t.progress)}<tspan class="gd14-percent-unit">%</tspan></text><text class="gd14-percent-label" text-anchor="middle" x="550" y="244">${done?'목표 달성':'목표 진척'}</text>${active(ctx)?`<path class="gd14-flow motion" d="M240 ${ly}L550 58L860 ${ry}"/>`:''}</svg><footer class="gd14-footer"><span>합산 목표 ${f(t.goal)}명 · 기울기는 현재 인원과 남은 인원의 비율</span><strong class="${ctx.delta<0?'negative':''}">전일 ${s(ctx.delta)}명</strong></footer></div></div>`;
  }};
})();
