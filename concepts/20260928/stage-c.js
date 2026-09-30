/* 27–29 · Skyline, shared finish line, and a theatrical awards stage. */
(() => {
  const rankList = ctx => ctx.all.filter(c=>c.period==='전일'&&c.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,3);
  const status = (ctx,c) => ctx.M.status(c).key;
  const vertical = (ctx,c,extra='') => `<div class="sc-chart ${extra}" role="meter" aria-label="${c.name} 현재 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress.toFixed(1)}" style="--sc-level:${c.progress}%"><div class="sc-chart-grid" aria-hidden="true">${Array.from({length:11},(_,i)=>`<i style="bottom:${i*10}%"><span>${i*10}</span></i>`).join('')}</div><div class="sc-building"><div class="sc-building-fill"><i></i></div></div><div class="sc-current-line"><i></i></div><b class="sc-current-label">${ctx.pct(c)}</b><div class="sc-climber" aria-hidden="true">${ctx.M.icon(c.id==='rr'?'car':'rocket')}</div></div>`;
  const goal = (ctx,c) => `<div class="sc-goal"><span>목표</span><b>${ctx.fmt(c.goal)}</b></div>`;
  const medal = (ctx,n) => `<span class="sc-medal sc-medal-${n}" aria-label="전일 증가 ${n}위">${ctx.M.icon(n===1?'trophy':'star')}<b>${n}</b></span>`;
  const headline=(ctx,c)=>`<h3>${c.name}</h3>${ctx.parts(c)}`;

  function skyline(ctx) {
    const top=rankList(ctx);
    return `<div class="sc-skyline"><div class="sc-title-row"><h3>도시처럼 자라는 열 개의 채널</h3><span>메달 = 전일 증가 상위 3개 · 모든 타워 0–100%</span></div><div class="sc-sky-grid">${ctx.all.map((c,i)=>{const rank=top.indexOf(c)+1;return `<article class="sc-sky-tower m-${status(ctx,c)} ${rank?'sc-ranked':''}" data-channel="${c.id}" style="--sc-phase:${-i*.83}s"><div class="sc-tower-name">${headline(ctx,c)}${rank?medal(ctx,rank):''}</div>${ctx.M.badge(c)}<strong class="sc-value num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}${vertical(ctx,c,'sc-city-chart')}${goal(ctx,c)}<div class="sc-tower-caption">${rank?`전일 증가 ${rank}위`:'현재 위치를 확인하세요'}</div>${ctx.M.reason(c)}${ctx.M.confetti(c)}</article>`}).join('')}</div><div class="sc-city-floor" aria-hidden="true"><i></i><i></i><i></i></div></div>`;
  }

  function finish(ctx) {
    const done=ctx.all.filter(c=>c.current>=c.goal).length;
    return `<div class="sc-festival"><div class="sc-title-row"><h3>하나의 결승선, 열 개의 레이스</h3><span>${done}개 채널 목표 달성 · 고정점 = 현재 진척</span></div><div class="sc-finish-race"><div class="sc-finish-stripe" aria-hidden="true"><b>100% FINISH</b></div><div class="sc-finish-lanes">${ctx.all.map((c,i)=>`<article class="sc-finish-lane m-${status(ctx,c)} ${c.current>=c.goal?'sc-finished':''}" data-channel="${c.id}" style="--sc-phase:${-i*.69}s"><div class="sc-lane-info"><div class="sc-tower-name">${headline(ctx,c)}</div><strong class="sc-value num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}${ctx.M.badge(c)}</div><div class="sc-lane-chart">${vertical(ctx,c,'sc-race-chart')}${c.current>=c.goal?`<div class="sc-finish-trophy" aria-hidden="true">${ctx.M.icon('trophy')}</div>`:''}</div><div class="sc-lane-tail">${goal(ctx,c)}<span class="sc-finish-caption">${c.current>=c.goal?'목표 달성! 계속 성장 중':`현재 ${ctx.pct(c)}`}</span>${ctx.M.reason(c)}</div>${ctx.M.confetti(c)}</article>`).join('')}</div></div></div>`;
  }

  function ceremony(ctx) {
    const top=rankList(ctx),rest=ctx.all.filter(c=>!top.includes(c));
    const lead=top[0];
    const leadHtml=lead?`<article class="sc-lead-award m-${status(ctx,lead)}" data-channel="${lead.id}"><div class="sc-lead-trophy" aria-hidden="true">${ctx.M.icon('trophy')}<b>1</b></div><div class="sc-lead-content"><span class="sc-award-kicker">DAILY GROWTH CHAMPION</span><h3>${lead.name}</h3><div class="sc-lead-numbers"><strong class="num">${ctx.fmt(lead.current)}</strong>${ctx.change(lead)}</div>${ctx.parts(lead)}${ctx.M.bar(lead)}${ctx.M.reason(lead)}</div>${ctx.M.confetti(lead)}</article>`:`<div class="sc-no-award">전일 대비 증가한 채널이 없습니다.</div>`;
    const secondary=top.slice(1).map((c,i)=>`<article class="sc-side-award m-${status(ctx,c)}" data-channel="${c.id}">${medal(ctx,i+2)}<div class="sc-side-copy"><span class="sc-award-kicker">전일 증가 ${i+2}위</span><h3>${c.name}</h3>${ctx.parts(c)}${ctx.M.reason(c)}</div><div class="sc-side-numbers"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div><div class="sc-side-progress">${ctx.M.bar(c)}</div>${ctx.M.confetti(c)}</article>`).join('');
    return `<div class="sc-ceremony"><div class="sc-stage-lights" aria-hidden="true"><i></i><i></i></div><div class="sc-award-stage">${leadHtml}<div class="sc-support-awards">${secondary}</div></div><div class="sc-title-row sc-rest-title"><h3>목표를 향해 성장하는 모든 채널</h3><span>시상 순위는 전일 증가 인원 기준 · 월간 집계 제외</span></div><div class="sc-rest-towers" style="--sc-rest:${rest.length}">${rest.map((c,i)=>`<article class="sc-rest-tower m-${status(ctx,c)}" data-channel="${c.id}" style="--sc-phase:${-i*.6}s"><div class="sc-tower-name">${headline(ctx,c)}</div><strong class="sc-value num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}${ctx.M.badge(c)}${vertical(ctx,c,'sc-stage-chart')}${goal(ctx,c)}${ctx.M.reason(c)}${ctx.M.confetti(c)}</article>`).join('')}</div></div>`;
  }
  window.extraConcepts={...window.extraConcepts,27:skyline,28:finish,29:ceremony};
})();
