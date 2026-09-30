/* 17–19 · Continuous motion with stationary, data-backed progress markers. */
(() => {
  const key = (ctx, c) => ctx.M.status(c).key.replace(/^m-/, '');
  const reason = (ctx, c) => ctx.M.reason(c);
  const card = (ctx, c, extra = '') => `<article class="c-metric m-${key(ctx, c)} ${extra}" data-channel="${c.id}"><div class="c-metric-head"><h3>${c.name}</h3>${ctx.M.badge(c)}</div><div class="c-metric-numbers"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div>${ctx.parts(c)}${ctx.M.bar(c)}${reason(ctx,c)}${ctx.M.confetti(c)}</article>`;

  function mission(ctx) {
    const attention = ctx.all.filter(c => ['emergency','watch'].includes(key(ctx,c)));
    const rest = ctx.all.filter(c => !attention.includes(c));
    const hasEmergency = attention.some(c => key(ctx,c) === 'emergency');
    const signal = attention.length ? (hasEmergency ? 'emergency' : 'watch') : 'clear';
    const rows = Math.max(1, Math.ceil(rest.length / 3));
    return `<div class="c-mission c-signal-${signal}"><aside class="c-watch-panel"><div class="c-watch-title"><div class="c-beacon" aria-hidden="true"><i></i>${ctx.M.icon('alert')}</div><div><small>CHANNEL WATCH</small><h3>${hasEmergency ? '비상 · 감소 확인' : attention.length ? '확인이 필요한 채널' : '확인할 경보 없음'}</h3></div><b>${attention.length}</b></div><div class="c-watch-list" style="--c-watch-count:${Math.max(1, attention.length)}">${attention.length ? attention.map(c=>card(ctx,c,'c-watch-card')).join('') : `<div class="c-all-clear"><div class="c-clear-radar" aria-hidden="true"><i></i><i></i><i></i><b>✓</b></div><strong>지금은 경보가 없어요</strong><p>감소·주의 기준에 해당하는<br>채널이 없습니다.</p></div>`}</div></aside><section class="c-flight-panel"><div class="c-zone-title"><h3>성장 · 목표 현황</h3><span><i class="c-signal-dot"></i> ${rest.length}개 채널</span></div><div class="c-flight-grid" style="--c-flight-rows:${rows}">${rest.map(c=>card(ctx,c,'c-flight-card')).join('')}</div></section></div>`;
  }

  function podium(ctx) {
    const daily = ctx.all.filter(c => c.period === '전일' && c.delta != null && c.delta > 0).sort((a,b)=>b.delta-a.delta);
    const top = daily.slice(0,3);
    const remaining = ctx.all.filter(c => !top.includes(c));
    const visualOrder = [1,0,2].filter(i=>top[i]);
    const winners = visualOrder.map(i=>{
      const c=top[i], rank=i+1;
      return `<article class="c-winner c-rank-${rank} m-${key(ctx,c)}" data-channel="${c.id}"><div class="c-podium-medal" aria-hidden="true">${ctx.M.icon(rank===1?'trophy':'star')}<b>${rank}</b></div><div class="c-winner-copy"><div class="c-winner-title"><h3>${c.name}</h3><span>전일 증가 ${rank}위</span></div><div class="c-winner-numbers"><strong class="num">${ctx.fmt(c.current)}</strong>${ctx.change(c)}</div>${ctx.parts(c)}${ctx.M.bar(c)}${reason(ctx,c)}</div><div class="c-podium-confetti" aria-hidden="true">${Array.from({length:12},(_,j)=>`<i style="--j:${j}"></i>`).join('')}</div>${ctx.M.confetti(c)}</article>`;
    }).join('');
    return `<div class="c-championship"><div class="c-zone-title"><h3>오늘의 성장 챔피언</h3><span>전일 증가 인원 기준 · 월간 집계 제외</span></div><div class="c-podium">${winners || '<div class="c-no-winner">오늘은 전일 대비 증가한 채널이 없습니다.</div>'}</div><div class="c-zone-title c-other-title"><h3>함께 보는 채널</h3><span>${remaining.length}개 채널의 현재와 목표</span></div><div class="c-podium-rest" style="--c-rest-count:${remaining.length}">${remaining.map(c=>card(ctx,c,'c-small-card')).join('')}</div></div>`;
  }

  function mosaic(ctx) {
    const ownDelta = ctx.own.every(c=>c.delta!=null) ? ctx.own.reduce((n,c)=>n+c.delta,0) : null;
    const total = ctx.own.reduce((n,c)=>n+c.current,0);
    return `<div class="c-mosaic"><section class="c-mosaic-own"><div class="c-zone-title"><h3>자사 매체</h3><span>OWN CHANNELS / 04</span></div><div class="c-own-tiles"><div class="c-total-tile"><div><span>함께 쌓아가는 팔로워</span><strong class="num">${ctx.fmt(total)}</strong><div class="c-total-change">${ctx.change({delta:ownDelta,period:'전일'})}</div></div><div class="c-sunset" aria-hidden="true"><i></i><i></i><i></i>${ctx.M.icon('star')}</div></div>${ctx.own.map((c,i)=>card(ctx,c,`c-mosaic-card c-color-${i}`)).join('')}</div></section><section class="c-mosaic-agency"><div class="c-zone-title"><h3>운영대행</h3><span>MANAGED CHANNELS / 06</span></div><div class="c-agency-tiles">${ctx.agency.map((c,i)=>card(ctx,c,`c-mosaic-card c-color-${i+4}`)).join('')}</div><div class="c-mosaic-ribbon"><div class="c-ribbon-rocket" aria-hidden="true">${ctx.M.icon('rocket')}</div><div><strong>각자의 속도로, 같은 목표를 향해.</strong><span>고정된 현재점과 계속 달리는 아이콘</span></div><div class="c-ribbon-stars" aria-hidden="true">✦ <span>✧</span> ✦</div></div></section></div>`;
  }
  window.extraConcepts = {...window.extraConcepts, 17:mission, 18:podium, 19:mosaic};
})();
