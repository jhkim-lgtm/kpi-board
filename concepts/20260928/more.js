/* 10 · A compact editorial report. */
(() => {
  function report(ctx) {
    const row=c=>`<article class="report-row" data-channel="${c.id}"><div class="report-name"><h4>${c.name}</h4><span>${c.sub}</span>${ctx.parts(c)}</div><div class="report-figures"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div><div class="report-progress">${ctx.meter(c)}<span>목표 ${ctx.fmt(c.goal)}<b>${ctx.pct(c)}</b></span></div></article>`;
    return `<div class="report-layout"><section class="report-own"><div class="report-section"><h3>자사 매체</h3><span>OWN MEDIA / 04</span></div>${ctx.own.map(row).join('')}</section><section class="report-agency"><div class="report-section"><h3>운영대행</h3><span>MANAGED / 06</span></div>${ctx.agency.map(row).join('')}</section></div>`;
  }
  window.extraConcepts={...window.extraConcepts,10:report};
})();
