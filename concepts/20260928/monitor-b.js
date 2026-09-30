(function(){
  const state=(c,ctx)=>`m-${ctx.M.status(c).key}`;
  const reason=(c,ctx)=>`<div class="b-reason">${ctx.M.reason(c)}</div>`;
  const track=(c,ctx)=>`<div class="b-track">${ctx.M.bar(c)}</div>`;
  const delta=(c,ctx)=>`<span class="b-delta ${c.delta>0?'positive':c.delta<0?'negative':'neutral'}"><strong>${ctx.signed(c.delta)}</strong><small>${c.period}</small></span>`;
  const identity=(c,ctx)=>`<div class="b-identity"><h3>${c.name}</h3>${ctx.M.badge(c)}</div>`;
  const extras=(c,ctx)=>`<div class="b-parts">${ctx.parts(c)}</div>`;
  function scoreCard(c,ctx,small){
    return `<article data-channel="${c.id}" class="b-score ${small?'b-score-small':''} ${state(c,ctx)}">${ctx.M.confetti(c)}<div class="b-score-light" aria-hidden="true"></div>${identity(c,ctx)}<div class="b-score-numbers"><strong class="b-current num">${ctx.fmt(c.current)}</strong>${delta(c,ctx)}</div>${extras(c,ctx)}${track(c,ctx)}${reason(c,ctx)}<span class="b-score-corner" aria-hidden="true">${ctx.M.icon(c.progress>=100?'trophy':c.delta<0?'alert':'star')}</span></article>`;
  }
  function stadium(ctx){
    return `<div class="b-stadium"><div class="b-stadium-beams" aria-hidden="true"><i></i><i></i><i></i></div><section class="b-score-section"><div class="b-section-title"><h3>자사 매체</h3><span>${ctx.M.icon('trophy')} 목표를 향해</span></div><div class="b-score-own">${ctx.own.map(c=>scoreCard(c,ctx,false)).join('')}</div></section><section class="b-score-section"><div class="b-section-title"><h3>운영대행</h3><span>현재 팔로워 · 증감 · 목표 진척</span></div><div class="b-score-agency">${ctx.agency.map(c=>scoreCard(c,ctx,true)).join('')}</div></section></div>`;
  }
  function radarTile(c,ctx){
    return `<article data-channel="${c.id}" class="b-radar-tile ${state(c,ctx)}">${ctx.M.confetti(c)}${identity(c,ctx)}<div class="b-radar-numbers"><strong class="b-current num">${ctx.fmt(c.current)}</strong>${delta(c,ctx)}</div>${extras(c,ctx)}${track(c,ctx)}${reason(c,ctx)}</article>`;
  }
  function radar(ctx){
    const rr=ctx.all.find(c=>c.id==='rr'), rest=ctx.all.filter(c=>c.id!=='rr');
    const angle=(rr.progress*3.6-90)*Math.PI/180;
    const x=50+45*Math.cos(angle),y=50+45*Math.sin(angle);
    return `<div class="b-radar-layout"><div class="b-radar-side b-radar-left">${rest.slice(0,3).map(c=>radarTile(c,ctx)).join('')}</div><article data-channel="${rr.id}" class="b-radar-hero ${state(rr,ctx)}">${ctx.M.confetti(rr)}${identity(rr,ctx)}<div class="b-radar-scene"><div class="b-radar-screen" aria-hidden="true"><div class="b-radar-grid"></div><div class="b-radar-arc" style="--radar-progress:${rr.progress}%"></div><div class="b-radar-sweep"></div><i class="b-radar-position" style="left:${x}%;top:${y}%"></i><div class="b-radar-core">${ctx.M.icon('car')}</div></div><div class="b-radar-readout"><span>30,000명까지</span><strong class="num">${rr.progress.toFixed(1)}<small>%</small></strong><span>시작 ${ctx.fmt(rr.baseline)}명</span></div></div><div class="b-radar-hero-stats"><div><span>현재 팔로워</span><strong class="b-current num">${ctx.fmt(rr.current)}</strong></div>${delta(rr,ctx)}<div><span>목표까지</span><strong class="num">${ctx.fmt(Math.max(0,rr.goal-rr.current))}<small>명</small></strong></div></div>${track(rr,ctx)}${reason(rr,ctx)}</article><div class="b-radar-side b-radar-right">${rest.slice(3,6).map(c=>radarTile(c,ctx)).join('')}</div><div class="b-radar-bottom">${rest.slice(6).map(c=>radarTile(c,ctx)).join('')}</div></div>`;
  }
  function flowRow(c,ctx,compact){
    return `<article data-channel="${c.id}" class="b-flow-row ${compact?'b-flow-compact':''} ${state(c,ctx)}">${ctx.M.confetti(c)}<div class="b-flow-shimmer" aria-hidden="true"></div><div class="b-flow-identity">${identity(c,ctx)}${extras(c,ctx)}${reason(c,ctx)}</div><div class="b-flow-numbers"><strong class="b-current num">${ctx.fmt(c.current)}</strong>${delta(c,ctx)}</div>${track(c,ctx)}</article>`;
  }
  function waves(ctx){
    return `<div class="b-flow"><div class="b-flow-waves" aria-hidden="true"><i></i><i></i><i></i></div><section class="b-flow-own"><div class="b-section-title"><h3>자사 매체</h3><span>성장의 흐름</span></div><div>${ctx.own.map(c=>flowRow(c,ctx,false)).join('')}</div></section><section class="b-flow-agency"><div class="b-section-title"><h3>운영대행</h3><span>채널별 현재 지점</span></div><div>${ctx.agency.map(c=>flowRow(c,ctx,true)).join('')}</div></section></div>`;
  }
  window.extraConcepts={...window.extraConcepts,14:stadium,15:radar,16:waves};
})();
