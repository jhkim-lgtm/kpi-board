/* Four independent layouts. Data values and progress positions remain fixed. */
(() => {
  'use strict';
  const registry = window.GrowthDirections = window.GrowthDirections || {};
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const clamp = n => finite(n) ? Math.max(0, Math.min(100, n)) : 0;
  const color = (ctx, c, fallback='#b8ef65') => ctx.colors?.[c.id] || fallback;
  const moving = c => c.growth?.mode === 'growth';
  const duration = c => finite(c.growth?.duration) ? c.growth.duration : 6;
  const progress = (ctx,c) => finite(c.progress) ? ctx.f(Math.round(c.progress * 10) / 10) + '%' : '—';
  const nextText = (ctx,c) => c.growth?.surplus != null
    ? '목표 달성' + (c.growth.surplus > 0 ? ' · ' + ctx.f(c.growth.surplus) + '명 초과' : '')
    : c.growth?.nextRemaining != null
      ? '다음 ' + c.growth.nextPercent + '%까지 ' + ctx.f(c.growth.nextRemaining) + '명'
      : '다음 구간 집계 대기';
  const sameRank = (top,c) => 1 + top.filter(p => p.delta > c.delta).length;
  const empty = text => `<div class="gd-empty">${text}</div>`;

  registry[1] = {
    render(ctx) {
      const {e,f,s}=ctx, lanes=[...ctx.daily].sort((a,b)=>clamp(b.progress)-clamp(a.progress));
      const fastest=ctx.top[0];
      return `<div class="gd1-root"><header class="gd1-header"><div><span class="gd1-kicker">GROWTH RACE / DAILY CHANNELS</span><h2>목표를 향해,<br>각자의 속도로.</h2></div><div class="gd1-lead"><span>오늘 가장 큰 증가 · ${fastest?e(fastest.name):'집계 대기'}</span><strong>${fastest?s(fastest.delta):'—'}<small>명 / 전일</small></strong></div></header><div class="gd1-lanes" style="--lanes:${Math.max(1,lanes.length)}"><div class="gd1-columns"><span>일별 채널</span><span>고정 지점 = 실제 목표 진척</span><span>현재 팔로워</span><span>전일 증감</span></div>${lanes.map((c,i)=>`<article class="gd1-lane ${moving(c)?'gd1-growing':''}" style="--lane:${color(ctx,c)};--level:${clamp(c.progress)}%;--speed:${duration(c)}s"><div class="gd1-name"><span>${String(i+1).padStart(2,'0')}</span><h3>${e(c.name)}</h3></div><div class="gd1-course"><div class="gd1-track"><i class="gd1-fill"></i>${moving(c)?'<i class="gd1-light motion" aria-hidden="true"></i>':''}${finite(c.progress)?`<b class="gd1-marker" style="left:${clamp(c.progress)}%" aria-label="목표 진척 ${progress(ctx,c)}"></b>`:''}</div><div class="gd1-track-meta"><b>${progress(ctx,c)}</b><span>목표 ${f(c.goal)}명</span></div></div><strong class="gd1-current">${f(c.current)}</strong><div class="gd1-change ${c.delta<0?'negative':''}"><strong>${s(c.delta)}</strong><small>${c.stale?'이전 집계':'명 / 전일'}</small></div></article>`).join('')}</div><footer class="gd1-footer"><span>레인은 목표 진척순 · 각 채널의 목표는 다릅니다.</span><span>상승 빛의 빠르기 = 실제 전일 증가 규모</span></footer></div>`;
    }
  };

  const routes=[
    [[86,380],[146,325],[99,269],[193,222],[142,151],[205,81]],
    [[295,380],[373,323],[332,247],[430,199],[394,126],[450,64]],
    [[530,380],[610,324],[568,265],[653,224],[627,162],[690,91]],
    [[770,380],[852,335],[812,270],[903,222],[874,140],[930,48]]
  ];
  function onRoute(points, percent) {
    const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    let remaining=lengths.reduce((a,b)=>a+b,0)*clamp(percent)/100;
    for(let i=0;i<lengths.length;i++) {
      if(remaining<=lengths[i]) {const t=remaining/lengths[i];return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];}
      remaining-=lengths[i];
    }
    return points.at(-1);
  }
  function contour(index) {
    const rx=70+index*69,ry=32+index*31;
    return Array.from({length:73},(_,i)=>{
      const a=i/72*Math.PI*2,wobble=1+.08*Math.sin(a*3+index*.23)+.04*Math.cos(a*5);
      return `${i?'L':'M'}${(520+Math.cos(a)*rx*wobble).toFixed(1)},${(235+Math.sin(a)*ry*wobble).toFixed(1)}`;
    }).join(' ')+'Z';
  }
  registry[2] = {
    render(ctx) {
      const {e,f,s}=ctx,own=ctx.own.slice(0,4),terrain=['#ae663d','#698062','#bb903f','#557c80'];
      const next=own.filter(c=>c.growth?.nextRemaining!=null).sort((a,b)=>a.growth.nextRemaining-b.growth.nextRemaining)[0];
      return `<div class="gd2-root"><header class="gd2-header"><div><span class="gd2-kicker">SUMMIT ROUTE / OWN CHANNELS</span><h2>한 구간씩, 더 높은 목표로.</h2></div><span class="gd2-guide">고정 지점 = 현재 진척<br>빈 원 = 다음 10% 구간</span></header><div class="gd2-layout"><div class="gd2-map"><svg viewBox="0 0 1000 440" role="img" aria-label="자사 네 채널의 목표 진척 경로"><g class="gd2-contours">${Array.from({length:9},(_,i)=>`<path d="${contour(i)}"/>`).join('')}</g>${own.map((c,i)=>{
        const route=routes[i],p=onRoute(route,c.progress),n=c.growth?.nextPercent!=null?onRoute(route,c.growth.nextPercent):null,top=route.at(-1),d=route.map((p,j)=>(j?'L':'M')+p.join(',')).join(' ');
        return `<g class="gd2-route" style="--route:${terrain[i]};--speed:${duration(c)}s"><path class="gd2-route-base" d="${d}"/><path class="gd2-route-done" d="${d}" pathLength="100" stroke-dasharray="${clamp(c.progress)} 100"/><path class="gd2-flag" d="M${top[0]},${top[1]}v-25l20,6-20,7"/><text class="gd2-summit-label" x="${top[0]+27}" y="${top[1]-13}">${String(i+1).padStart(2,'0')}</text>${n?`<circle class="gd2-next-point" cx="${n[0]}" cy="${n[1]}" r="8"/>`:''}${moving(c)?`<circle class="gd2-pulse motion" cx="${p[0]}" cy="${p[1]}" r="14"/>`:''}<circle class="gd2-point" cx="${p[0]}" cy="${p[1]}" r="7"/><rect class="gd2-point-plate" x="${p[0]-29}" y="${p[1]+15}" width="58" height="23" rx="5"/><text class="gd2-point-label" text-anchor="middle" x="${p[0]}" y="${p[1]+31}">${progress(ctx,c)}</text><text class="gd2-start" text-anchor="middle" x="${route[0][0]}" y="416">${e(c.name)}</text></g>`;
      }).join('')}</svg><div class="gd2-map-note"><span>0% 출발점</span><span>100% 정상 · 채널별 설정 목표</span></div></div><aside class="gd2-stations">${own.map((c,i)=>`<article style="--route:${terrain[i]}"><div class="gd2-station-head"><span>${String(i+1).padStart(2,'0')}</span><h3>${e(c.name)}</h3><b class="${c.delta<0?'negative':''}">${s(c.delta)}<small> 전일</small></b></div><strong class="gd2-current">${f(c.current)}<small>명</small></strong><div class="gd2-next">${e(nextText(ctx,c))}</div></article>`).join('')}</aside></div><footer class="gd2-footer"><span>자사 매체 4개 · 경로 위 위치는 각 채널의 목표 진척입니다.</span><strong>${next?e(next.name)+' · 다음 구간까지 '+f(next.growth.nextRemaining)+'명':'현재 집계 기준으로 경로를 표시합니다.'}</strong></footer></div>`;
    }
  };

  function seriesChart(ctx) {
    const points=(ctx.series||[]).filter(p=>finite(p.value)&&p.date).slice(-7);
    if(points.length<2)return {html:empty('같은 날짜의 자사 매체 기록이 더 쌓이면 추이를 표시합니다.'),start:'기록 대기',end:'실제 관측만 표시'};
    const min=Math.min(...points.map(p=>p.value)),max=Math.max(...points.map(p=>p.value));
    const stamps=points.map(p=>Date.parse(p.date+'T00:00:00Z'));
    const range=stamps.at(-1)-stamps[0];
    const coords=points.map((p,i)=>[12+(range>0?(stamps[i]-stamps[0])/range:i/(points.length-1))*676,finite(max-min)&&max!==min?142-(p.value-min)/(max-min)*115:85]);
    return {html:`<svg class="gd3-chart" viewBox="0 0 700 170" preserveAspectRatio="none" role="img" aria-label="자사 매체 합계 실제 ${points.length}회 관측"><path class="gd3-grid" d="M0 30H700M0 85H700M0 142H700"/><path class="gd3-area" d="M${coords[0][0]},160 L${coords.map(p=>p.join(',')).join(' L')} L${coords.at(-1)[0]},160Z"/><polyline points="${coords.map(p=>p.join(',')).join(' ')}"/>${coords.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===coords.length-1?5:3}"/>`).join('')}</svg>`,start:points[0].date.slice(5).replace('-','.')+' · '+ctx.f(points[0].value)+'명',end:points.at(-1).date.slice(5).replace('-','.')+' · '+ctx.f(points.at(-1).value)+'명'};
  }
  registry[3] = {
    render(ctx) {
      const {e,f,s}=ctx,top=ctx.top.slice(0,3),leader=top[0],chart=seriesChart(ctx);
      const tiedOutside=ctx.top.slice(3).filter(c=>c.delta===top.at(-1)?.delta);
      const tieNote=tiedOutside.length?`<div class="gd3-tie-note">${tiedOutside.map(c=>e(c.name)).join(' · ')}도 ${s(tiedOutside[0].delta)}명 · 공동 ${sameRank(ctx.top,tiedOutside[0])}위 (상위 3개 채널 표시)</div>`:'';
      return `<div class="gd3-root"><header class="gd3-top"><div><span class="gd3-kicker">DAILY LEAGUE / LIVE RECORDS</span><h2>오늘의 성장, 오늘의 기록.</h2></div><span class="gd3-rule">전일 증가 인원 · 같은 집계일 · 월간 제외</span></header><div class="gd3-main"><section class="gd3-leader" style="--team:${leader?color(ctx,leader,'#b9f274'):'#b9f274'}"><div class="gd3-rank">01 <span>${leader&&ctx.top.filter(c=>c.delta===leader.delta).length>1?'공동 1위 · GROWTH LEADER':'GROWTH LEADER'}</span></div><h3>${leader?e(leader.name):'성장 기록 대기'}</h3><div class="gd3-score">${leader?s(leader.delta):'—'}<small>명 / 전일</small></div><div class="gd3-record"><span>현재 팔로워<b>${leader?f(leader.current):'—'}</b></span><span>최근 7일<b>${leader?s(leader.growth?.change7):'—'}</b></span><span>연속 증가<b>${leader&&finite(leader.growth?.streak)?f(leader.growth.streak)+'일':'—'}</b></span></div>${leader&&moving(leader)?'<i class="gd3-court motion" aria-hidden="true"></i>':''}</section><section class="gd3-field"><div class="gd3-runners">${top.slice(1).map(c=>`<article class="gd3-runner"><span class="gd3-place">${String(sameRank(ctx.top,c)).padStart(2,'0')}</span><div><h3>${e(c.name)}</h3><small>현재 ${f(c.current)}명${ctx.top.filter(p=>p.delta===c.delta).length>1?' · 공동 순위':''}</small></div><strong>${s(c.delta)}<small>명 / 전일</small></strong></article>`).join('')}${tieNote}${top.length<3?empty('비교 가능한 일별 증가 채널을 기다립니다.'):''}</div><div class="gd3-history"><header><div><span>OWN CHANNELS / LAST 7 OBSERVATIONS</span><h3>자사 매체의 실제 기록</h3></div><strong class="${ctx.week<0?'negative':''}">${s(ctx.week)}<small>최근 7일 순증</small></strong></header>${chart.html}<div class="gd3-axis"><span>${chart.start}</span><span>${chart.end}</span></div></div></section></div></div>`;
    }
  };

  registry[4] = {
    render(ctx) {
      const {e,f,s}=ctx;
      return `<div class="gd4-root"><header class="gd4-header"><div><span class="gd4-kicker">FOUR CHANNELS / ONE ORBIT</span><h2>각자의 궤도에서, 다음 목표로.</h2></div><span class="gd4-guide">호의 길이 = 실제 목표 진척<br>회전하는 빛 = 전일 증가 채널</span></header><div class="gd4-orbits">${ctx.own.slice(0,4).map((c,i)=>{
        const p=clamp(c.progress),angle=p/100*Math.PI*2-Math.PI/2,x=140+108*Math.cos(angle),y=140+108*Math.sin(angle);
        return `<article class="gd4-orbit" style="--orbit:${color(ctx,c,'#71ded9')};--speed:${duration(c)}s"><div class="gd4-name"><span class="gd4-index">${String(i+1).padStart(2,'0')}</span><h3>${e(c.name)}</h3></div><div class="gd4-dial"><svg viewBox="0 0 280 280" role="img" aria-label="${e(c.name)} 목표 진척 ${progress(ctx,c)}"><circle class="gd4-outer" cx="140" cy="140" r="128"/><circle class="gd4-track" cx="140" cy="140" r="108"/><circle class="gd4-progress" cx="140" cy="140" r="108" pathLength="100" stroke-dasharray="${p} 100" transform="rotate(-90 140 140)"/><circle class="gd4-point" cx="${x}" cy="${y}" r="5"/></svg><div class="gd4-center"><strong>${finite(c.progress)?f(Math.round(c.progress*10)/10):'—'}<small>%</small></strong><span>목표 진척</span></div>${moving(c)?'<div class="gd4-satellite motion" aria-hidden="true"><i></i></div>':''}</div><div class="gd4-metrics"><strong>${f(c.current)}<small>명</small></strong><span class="gd4-delta ${c.delta<0?'negative':''}">${s(c.delta)}<small>전일</small></span></div><div class="gd4-next"><span>목표 ${f(c.goal)}명</span><b>${e(nextText(ctx,c))}</b></div></article>`;
      }).join('')}</div></div>`;
    }
  };
})();
