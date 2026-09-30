/* 21–23 · Podium × vertical goal tower variations. */
(() => {
  const state=(c,ctx)=>`m-${ctx.M.status(c).key.replace(/^m-/,'')}`;
  const level=c=>Math.max(0,Math.min(100,Number(c.progress)||0));
  function tower(c,ctx,phase=0) {
    return `<div class="sa-tower" style="--sa-level:${level(c)}%;--sa-phase:${-phase*1.1}s" role="meter" aria-label="${c.name} 현재 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${level(c).toFixed(1)}"><div class="sa-grid" aria-hidden="true">${Array.from({length:11},(_,i)=>`<i style="bottom:${i*10}%">${i===0||i===5||i===10?`<span>${i*10}%</span>`:''}</i>`).join('')}</div><div class="sa-fill"><i></i></div><div class="sa-rise-window" aria-hidden="true"><div class="sa-rise">${ctx.M.icon(c.id==='rr'?'car':'rocket')}</div></div><div class="sa-fixed"><i></i><b>${ctx.pct(c)}</b></div></div>`;
  }
  const parts=(c,ctx)=>`<div class="sa-parts">${ctx.parts(c)}</div>`;
  const goal=(c,ctx)=>`<div class="sa-goal"><span>목표</span><b>${ctx.fmt(c.goal)}</b></div>`;
  const medal=(rank,ctx)=>`<div class="sa-medal sa-medal-${rank}" aria-label="전일 증가 ${rank}위">${ctx.M.icon(rank===1?'trophy':'star')}<b>${rank}</b></div>`;
  function podiumHero(c,ctx,rank,extra='') {
    return `<article data-channel="${c.id}" class="sa-hero ${state(c,ctx)} sa-rank-${rank} ${extra}">${ctx.M.confetti(c)}<div class="sa-hero-head">${medal(rank,ctx)}<div><span>전일 증가 ${rank}위</span><h3>${c.name}</h3></div>${ctx.M.badge(c)}</div><div class="sa-hero-main"><div class="sa-hero-numbers"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}${parts(c,ctx)}${goal(c,ctx)}</div>${tower(c,ctx,rank)}</div>${ctx.M.reason(c)}</article>`;
  }
  function compact(c,ctx) {
    return `<article data-channel="${c.id}" class="sa-compact ${state(c,ctx)}">${ctx.M.confetti(c)}<h3>${c.name}</h3>${ctx.M.badge(c)}<div class="sa-compact-number"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div>${parts(c,ctx)}${ctx.M.bar(c)}${ctx.M.reason(c)}</article>`;
  }
  function towerCard(c,ctx,i,extra='') {
    return `<article data-channel="${c.id}" class="sa-column ${state(c,ctx)} ${extra}">${ctx.M.confetti(c)}<div class="sa-column-heading"><span>${String(i+1).padStart(2,'0')}</span><h3>${c.name}</h3></div>${ctx.M.badge(c)}<strong class="sa-column-value num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}${tower(c,ctx,i)}${goal(c,ctx)}${parts(c,ctx)}${ctx.M.reason(c)}</article>`;
  }
  function ranking(ctx){return ctx.all.filter(c=>c.period==='전일'&&c.delta!=null&&c.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,3);}
  function champion(ctx) {
    const top=ranking(ctx),rest=ctx.all.filter(c=>!top.includes(c));
    return `<div class="a21"><div class="sa-section"><h3>오늘의 성장 챔피언</h3><span>전일 증가 인원 기준 · 월간 집계 제외</span></div><div class="a21-podium">${[1,0,2].filter(i=>top[i]).map(i=>podiumHero(top[i],ctx,i+1)).join('')}</div><div class="sa-section a21-rest-title"><h3>함께 오르는 채널</h3><span>현재 수치와 목표 진척</span></div><div class="a21-rest" style="--sa-count:${rest.length}">${rest.map(c=>compact(c,ctx)).join('')}</div></div>`;
  }
  function league(ctx) {
    const ordered=[...ctx.all].sort((a,b)=>b.progress-a.progress||b.current-a.current);
    return `<div class="a22"><div class="sa-section"><h3>목표 진척순</h3><span>0% → 100% · 각 채널의 목표 기준</span></div><div class="a22-columns">${ordered.map((c,i)=>towerCard(c,ctx,i)).join('')}</div></div>`;
  }
  function aurora(ctx) {
    const top=ranking(ctx),rest=ctx.all.filter(c=>!top.includes(c));
    return `<div class="a23"><div class="a23-feature">${top[0]?podiumHero(top[0],ctx,1,'a23-winner'):'<div class="sa-no-winner">전일 대비 증가한 채널이 없습니다.</div>'}</div><div class="a23-field"><div class="sa-section"><h3>오늘의 성장 포디움</h3><span>전일 증가 인원 기준 · 월간 집계 제외</span></div><div class="a23-runners">${top.slice(1).map((c,i)=>podiumHero(c,ctx,i+2,'a23-runner')).join('')}</div><div class="sa-section a23-rest-title"><h3>다음 목표를 향해</h3><span>${rest.length}개 채널</span></div><div class="a23-rest" style="--sa-count:${rest.length}">${rest.map((c,i)=>towerCard(c,ctx,i,'a23-small')).join('')}</div></div></div>`;
  }
  window.extraConcepts={...window.extraConcepts,21:champion,22:league,23:aurora};
})();
