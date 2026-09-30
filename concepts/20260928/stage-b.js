(() => {
  const state=(ctx,c)=>`m-${ctx.M.status(c).key}`;
  const dailyWinners=ctx=>ctx.all.filter(c=>c.period==='전일'&&c.delta>0).sort((a,b)=>b.delta-a.delta).slice(0,3);
  const rankMap=ctx=>new Map(dailyWinners(ctx).map((c,i)=>[c.id,i+1]));
  const medal=n=>n?['','🥇','🥈','🥉'][n]:'';
  const delta=(ctx,c)=>`<div class="sb-delta ${c.delta>0?'sb-up':c.delta<0?'sb-down':'sb-flat'}"><strong>${ctx.signed(c.delta)}</strong><small>${c.period}</small></div>`;
  const goal=(ctx,c)=>`<div class="sb-goal"><span>목표</span><b>${ctx.fmt(c.goal)}</b></div>`;
  const parts=(ctx,c)=>`<div class="sb-parts">${ctx.parts(c)}</div>`;
  const reason=(ctx,c)=>`<div class="sb-reason">${ctx.M.reason(c)}</div>`;
  function chart(ctx,c,i=0){
    return `<div class="sb-tower-chart ${state(ctx,c)}" role="meter" aria-label="${c.name} 현재 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress.toFixed(1)}" style="--level:${c.progress}%;--label-level:${Math.max(12,Math.min(88,c.progress))}%;--phase:${-i*.87}s"><div class="sb-tower-grid" aria-hidden="true">${Array.from({length:11},(_,j)=>`<i style="bottom:${j*10}%"><span>${j*10}</span></i>`).join('')}</div><div class="sb-tower-liquid"><i></i></div><div class="sb-tower-point"><i></i></div><b class="sb-level-value">${ctx.pct(c)}</b><div class="sb-rise" aria-hidden="true">${ctx.M.icon(c.id==='rr'?'car':'rocket')}</div></div>`;
  }
  function arena(ctx){
    const ranks=rankMap(ctx);
    return `<div class="sb-arena"><div class="sb-section-head"><h3>목표를 향한 10개의 타워</h3><span>🥇🥈🥉 전일 증가 인원 상위 3개 · 월간 집계 제외</span></div><div class="sb-arena-floor" aria-hidden="true"></div><div class="sb-arena-towers">${ctx.all.map((c,i)=>{const rank=ranks.get(c.id)||0;return `<article data-channel="${c.id}" class="sb-arena-tower ${state(ctx,c)} sb-rank-${rank}" style="--rank:${rank}">${ctx.M.confetti(c)}<div class="sb-arena-name"><span>${rank?`${medal(rank)} 전일 증가 ${rank}위`:(c.group==='own'?'자사 매체':'운영대행')}</span><h3>${c.name}</h3></div><strong class="sb-value num">${ctx.fmt(c.current)}</strong>${delta(ctx,c)}${ctx.M.badge(c)}${chart(ctx,c,i)}${goal(ctx,c)}${parts(ctx,c)}${reason(ctx,c)}<div class="sb-pedestal" aria-hidden="true">${rank?medal(rank):'<i></i>'}</div></article>`;}).join('')}</div></div>`;
  }
  function flagName(c){
    const found=c.name.match(/^(\p{Regional_Indicator}{2}|🌏)\s*/u);
    return found?{flag:found[1],name:c.name.slice(found[0].length)}:{flag:'',name:c.name};
  }
  function nationalCard(ctx,c,i,small){
    const name=flagName(c);
    return `<article data-channel="${c.id}" class="sb-nation-card ${small?'sb-nation-small':''} ${state(ctx,c)}">${ctx.M.confetti(c)}<div class="sb-nation-info"><header>${name.flag?`<span class="sb-national-flag" aria-hidden="true">${name.flag}</span> `:''}<h3>${name.name}</h3></header><strong class="sb-value num">${ctx.fmt(c.current)}</strong>${delta(ctx,c)}${ctx.M.badge(c)}${parts(ctx,c)}</div><div class="sb-nation-tower">${chart(ctx,c,i)}${goal(ctx,c)}</div>${reason(ctx,c)}<div class="sb-nation-platform" aria-hidden="true"></div></article>`;
  }
  function nations(ctx){
    return `<div class="sb-nations"><section class="sb-nations-own"><div class="sb-section-head"><h3>자사 매체</h3><span>각 채널의 목표까지</span></div><div>${ctx.own.map((c,i)=>nationalCard(ctx,c,i,false)).join('')}</div></section><section class="sb-nations-agency"><div class="sb-section-head"><h3>운영대행</h3><span>매일 쌓이는 성장</span></div><div>${ctx.agency.map((c,i)=>nationalCard(ctx,c,i+4,true)).join('')}</div></section></div>`;
  }
  function podiumCard(ctx,c,rank){
    return `<article data-channel="${c.id}" class="sb-champion sb-place-${rank} ${state(ctx,c)}">${ctx.M.confetti(c)}<div class="sb-champion-medal" aria-hidden="true">${medal(rank)}</div><span class="sb-champion-rank">전일 증가 ${rank}위</span><h3>${c.name}</h3><strong class="sb-value num">${ctx.fmt(c.current)}</strong>${delta(ctx,c)}${parts(ctx,c)}${chart(ctx,c,rank)}${goal(ctx,c)}${reason(ctx,c)}<div class="sb-champion-base" aria-hidden="true">${rank===1?ctx.M.icon('trophy'):ctx.M.icon('star')}</div></article>`;
  }
  function restCard(ctx,c,i){
    return `<article data-channel="${c.id}" class="sb-dual-rest-card ${state(ctx,c)}">${ctx.M.confetti(c)}<h3>${c.name}</h3><strong class="sb-value num">${ctx.fmt(c.current)}</strong>${delta(ctx,c)}${chart(ctx,c,i)}${goal(ctx,c)}${parts(ctx,c)}${reason(ctx,c)}</article>`;
  }
  function dual(ctx){
    const ranked=dailyWinners(ctx),ids=new Set(ranked.map(c=>c.id));
    const arranged=ranked.length===3?[ranked[1],ranked[0],ranked[2]]:ranked;
    const others=ctx.all.filter(c=>!ids.has(c.id));
    return `<div class="sb-dual ${ranked.length?'':'sb-dual-no-winners'}"><section class="sb-dual-champions"><div class="sb-section-head"><h3>오늘의 챔피언</h3><span>전일 증가 · 월간 제외</span></div><div class="sb-dual-podium">${arranged.length?arranged.map(c=>podiumCard(ctx,c,ranked.findIndex(r=>r.id===c.id)+1)).join(''):'<p class="sb-no-champion">전일 대비 증가한 채널이 없습니다.</p>'}</div></section><section class="sb-dual-others"><div class="sb-section-head"><h3>다음 목표를 향해</h3><span>${others.length}개 채널의 현재 진척</span></div><div class="sb-dual-rest" style="--rest-cols:${others.length>8?5:4}">${others.map((c,i)=>restCard(ctx,c,i)).join('')}</div></section></div>`;
  }
  window.extraConcepts={...window.extraConcepts,24:arena,25:nations,26:dual};
})();
