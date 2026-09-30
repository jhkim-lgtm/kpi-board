(function(){
  const goalLine=(c,ctx)=>`<div class="goal-line"><b>${ctx.pct(c)}</b><span>목표 ${ctx.fmt(c.goal)}</span></div>`;
  function focus(ctx){
    const rr=ctx.all.find(c=>c.id==='rr');
    const others=ctx.agency.filter(c=>c.id!=='rr');
    const compact=(c,type)=>`<article class="focus-card ${type}"><div class="channel-name">${c.name}</div><div class="focus-stat"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div>${ctx.parts(c)}${ctx.meter(c)}${goalLine(c,ctx)}</article>`;
    return `<div class="focus-main"><article class="focus-hero"><div class="focus-eyebrow">운영 시작부터 목표까지</div><h3>${rr.name}</h3><div class="focus-progress num">${rr.progress.toFixed(1)}<span>%</span></div><div class="focus-hero-stats"><div><span>현재 팔로워</span><strong class="num">${ctx.fmt(rr.current)}</strong></div><div><span>전일 증감</span>${ctx.change(rr)}</div><div><span>목표까지</span><strong class="num">${ctx.fmt(Math.max(0,rr.goal-rr.current))}<small>명</small></strong></div></div><div class="focus-ruler">${ctx.meter(rr)}<div class="focus-ticks" aria-hidden="true">${Array.from({length:11},(_,i)=>`<span><i></i>${i*10}%</span>`).join('')}</div></div><div class="focus-baseline"><span>운영 시작월 말 <b>${ctx.fmt(rr.baseline)}</b></span><span>목표 <b>${ctx.fmt(rr.goal)}</b></span></div></article><section class="focus-own"><h3>자사 매체</h3><div>${ctx.own.map(c=>compact(c,'focus-own-card')).join('')}</div></section></div><section class="focus-others"><h3>함께 운영하는 채널</h3><div>${others.map(c=>compact(c,'focus-small-card')).join('')}</div></section>`;
  }
  function movements(ctx){
    const daily=ctx.all.filter(c=>c.period==='전일');
    const monthly=ctx.all.filter(c=>c.period!=='전일');
    const groups=[{name:'증가',symbol:'↑',key:'rising',test:c=>c.delta>0},{name:'유지',symbol:'—',key:'steady',test:c=>c.delta===0},{name:'감소',symbol:'↓',key:'falling',test:c=>c.delta<0}];
    const unknown=daily.filter(c=>c.delta==null);
    const tile=c=>`<article class="movement-tile"><div class="movement-top"><span class="channel-name">${c.name}</span><strong class="num">${ctx.fmt(c.current)}</strong></div><div class="movement-bottom">${ctx.change(c)}<span class="movement-goal">목표 ${ctx.fmt(c.goal)} <b>${ctx.pct(c)}</b></span></div>${ctx.meter(c)}${ctx.parts(c)}</article>`;
    return `<div class="movement-columns">${groups.map(g=>{const channels=daily.filter(c=>c.delta!=null&&g.test(c));return `<section class="movement-column ${g.key}"><header><h3><span>${g.symbol}</span>${g.name}</h3><span>${channels.length}개 채널</span></header><div class="movement-stack">${channels.map(tile).join('')||'<div class="movement-empty">해당 채널 없음</div>'}</div></section>`;}).join('')}</div>${unknown.length?`<section class="movement-unknown"><h3>증감 확인 중</h3><div>${unknown.map(tile).join('')}</div></section>`:''}<section class="movement-monthly"><header><h3>월간 집계</h3><span>각 채널의 집계 기간 기준</span></header><div>${monthly.map(tile).join('')}</div></section>`;
  }
  window.extraConcepts={...window.extraConcepts,8:focus,9:movements};
})();
