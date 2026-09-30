/* Additional review directions; no changes to the live dashboard. */
(() => {
  const smallGoal = (c, ctx) => `<div class="n67-goal"><span>목표 ${ctx.fmt(c.goal)}</span><b>${ctx.pct(c)}</b></div>`;
  const ruler = (c, ctx) => `<div class="n6-ruler">${ctx.meter(c)}<div class="n6-ticks" aria-hidden="true">${Array.from({length:11},(_,i)=>`<i${i%5===0?' class="major"':''}></i>`).join('')}</div></div>`;
  function typeBoard(ctx) {
    return `<div class="n6-intro"><span>현재 팔로워</span><span>10개 채널 · 증감 · 목표 진척</span></div><div class="n6-grid">${ctx.all.map((c,i)=>`<article class="n6-cell"><div class="n6-index"><span>${String(i+1).padStart(2,'0')}</span><span>${c.group==='own'?'자사 매체':'운영대행'}</span></div><h3>${c.name}</h3><div class="platform">${c.sub}</div><strong class="n6-current num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}<div class="n6-detail">${ctx.parts(c)}${c.baseline?`<span>시작 ${ctx.fmt(c.baseline)}명 기준</span>`:''}</div>${ruler(c,ctx)}${smallGoal(c,ctx)}</article>`).join('')}</div>`;
  }
  function vertical(c,ctx) {
    return `<article class="n7-column"><h3>${c.name}</h3><strong class="n7-current num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}<div class="n7-chart" style="--progress:${Math.min(100,Math.max(0,c.progress))}%" role="meter" aria-label="${c.name} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress.toFixed(1)}">${Array.from({length:11},(_,i)=>`<div class="n7-gridline" style="bottom:${i*10}%"><span>${i*10}%</span></div>`).join('')}<div class="n7-bar"><div></div></div><div class="n7-position"><b>${ctx.pct(c)}</b><i></i></div></div><div class="n7-goal">목표 <b>${ctx.fmt(c.goal)}</b></div><div class="n7-parts">${ctx.parts(c)}</div></article>`;
  }
  function columns(ctx) {
    return `<div class="n7-section"><h3>자사 매체</h3><span>목표를 향해 쌓이는 성장</span></div><div class="n7-columns">${ctx.own.map(c=>vertical(c,ctx)).join('')}</div><div class="n7-section n7-agency-head"><h3>운영대행</h3><span>현재 팔로워 / 증감 / 목표</span></div><div class="n7-agency">${ctx.agency.map(c=>`<article><div class="n7-agency-title"><h3>${c.name}</h3><span>${ctx.pct(c)}</span></div><div class="n7-agency-numbers"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div><div class="n7-agency-goal">${ctx.meter(c)}<span>목표 ${ctx.fmt(c.goal)}</span></div></article>`).join('')}</div>`;
  }
  window.extraConcepts = {...window.extraConcepts,6:typeBoard,7:columns};
})();
