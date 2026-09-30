/* Monitor studies 11–13. Animated accents never encode actual progress. */
(() => {
  const statusClass = (c, ctx) => {
    const key = ctx.M.status(c).key;
    return key.startsWith('m-') ? key : `m-${key}`;
  };
  const pct = c => Math.min(100, Math.max(0, Number(c.progress) || 0));
  const reason = (c, ctx) => `<div class="a-reason">${ctx.M.reason(c)}</div>`;
  const parts = (c, ctx) => c.parts.length ? `<div class="a-parts">${ctx.parts(c)}</div>` : '';
  const cardHeader = (c, ctx) => `<div class="a-channel-line"><h3>${c.name}</h3>${ctx.M.badge(c)}</div>`;
  function auroraCard(c, ctx, compact) {
    return `<article data-channel="${c.id}" class="a11-card ${compact?'a11-compact':''} ${statusClass(c,ctx)}">${ctx.M.confetti(c)}${cardHeader(c,ctx)}<div class="a11-value"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div>${parts(c,ctx)}<div class="a11-progress">${ctx.M.bar(c)}</div>${reason(c,ctx)}</article>`;
  }
  function aurora(ctx) {
    return `<div class="a11-wall"><div class="a11-label"><span>자사 매체</span><span>지금의 성장, 한눈에.</span></div><div class="a11-own">${ctx.own.map(c=>auroraCard(c,ctx,false)).join('')}</div><div class="a11-label a11-second"><span>운영대행</span><span>6 CHANNELS</span></div><div class="a11-agency">${ctx.agency.map(c=>auroraCard(c,ctx,true)).join('')}</div></div>`;
  }
  function road(c, ctx, i) {
    return `<div class="a12-road" style="--a-pct:${pct(c)}%;--a-duration:${5.8+(i%4)*1.3}s;--a-delay:${-i*1.7}s" role="meter" aria-label="${c.name} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(c).toFixed(1)}"><div class="a12-road-top"><span>목표 ${ctx.fmt(c.goal)}</span>${ctx.M.badge(c)}<b>현재 ${ctx.pct(c)}</b></div><div class="a12-road-line"><i class="a12-distance"></i><b class="a12-fixed" aria-hidden="true"></b><div class="a12-travel" aria-hidden="true"><i>${ctx.M.icon('car')}</i></div></div><div class="a12-road-ticks" aria-hidden="true">${Array.from({length:11},(_,n)=>`<span><i></i>${n*10}</span>`).join('')}</div></div>`;
  }
  function race(ctx) {
    return `<div class="a12-grid">${ctx.all.map((c,i)=>`<article data-channel="${c.id}" class="a12-lane ${statusClass(c,ctx)}">${ctx.M.confetti(c)}<div class="a12-identity"><div class="a12-channel">${c.name}</div><div class="a12-numbers"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div>${parts(c,ctx)}</div><div class="a12-journey">${road(c,ctx,i)}${reason(c,ctx)}</div></article>`).join('')}</div><div class="a12-caption"><span>● 고정된 점이 실제 달성률</span><span>움직이는 차는 매체별 주행 애니메이션</span></div>`;
  }
  function ring(c, ctx, i) {
    const progress=pct(c), angle=progress/100*Math.PI*2;
    const mx=(80+68*Math.sin(angle)).toFixed(3), my=(80-68*Math.cos(angle)).toFixed(3);
    const ticks=Array.from({length:10},(_,j)=>{
      const a=j/10*Math.PI*2;
      return `<line x1="${80+76*Math.sin(a)}" y1="${80-76*Math.cos(a)}" x2="${80+73*Math.sin(a)}" y2="${80-73*Math.cos(a)}"/>`;
    }).join('');
    return `<div class="a13-gauge" role="meter" aria-label="${c.name} 목표 진척" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.toFixed(1)}"><svg viewBox="0 0 160 160" aria-hidden="true"><g class="a13-ticks">${ticks}</g><circle class="a13-track" cx="80" cy="80" r="68"/><circle class="a13-arc" cx="80" cy="80" r="68" pathLength="100" stroke-dasharray="${progress} 100" transform="rotate(-90 80 80)"/><circle class="a13-marker" cx="${mx}" cy="${my}" r="4"/><g class="a13-orbit" style="--a-orbit:${13+i*1.3}s;--a-delay:${-i*2.3}s"><circle class="a13-orbit-track" cx="80" cy="80" r="77"/><circle class="a13-satellite" cx="80" cy="3" r="3"/></g></svg><div class="a13-center"><strong class="num">${ctx.fmt(c.current)}</strong><b>${ctx.pct(c)}</b></div></div>`;
  }
  function orbit(ctx) {
    return `<div class="a13-grid">${ctx.all.map((c,i)=>`<article data-channel="${c.id}" class="a13-card ${statusClass(c,ctx)}">${cardHeader(c,ctx)}<div class="a13-main">${ring(c,ctx,i)}<div class="a13-side">${ctx.change(c)}<span>목표</span><b class="num">${ctx.fmt(c.goal)}</b>${parts(c,ctx)}</div></div>${reason(c,ctx)}${ctx.M.confetti(c)}</article>`).join('')}</div>`;
  }
  window.extraConcepts={...window.extraConcepts,11:aurora,12:race,13:orbit};
})();
