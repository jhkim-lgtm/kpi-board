/* Preview concepts 3 and 4. All values are supplied by the shared snapshot. */
(function () {
  'use strict';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const trendClass = (row) => row.delta == null || row.delta === 0 ? 'flat' : row.delta > 0 ? 'up' : 'down';
  const changeValue = (row, fmt) => row.delta == null ? '—' : `${row.delta > 0 ? '+' : row.delta < 0 ? '−' : ''}${fmt(Math.abs(row.delta))}`;
  const partLine = (row, fmt) => row.parts?.length ? `<div class="alt-parts">${row.parts.map((part) => `<span>${esc(part.name)} <b class="num">${fmt(part.current)}</b></span>`).join('')}</div>` : '';

  function tracks(ctx) {
    const row = (item) => `<article class="track-row">
      <div class="track-name"><strong>${esc(item.name)}</strong>${item.sub ? `<span>${esc(item.sub)}</span>` : ''}${partLine(item, ctx.fmt)}</div>
      <div class="track-current num">${ctx.fmt(item.current)}</div>
      <div class="track-change">${ctx.change(item)}</div>
      <div class="track-graphic">${ctx.meter(item)}</div>
      <div class="track-target"><strong class="num">${ctx.pct(item)}</strong><span>목표 ${ctx.fmt(item.goal)}명</span></div>
    </article>`;
    const group = (name, rows) => `<section class="track-group"><h2>${name}<span>${rows.length}개 채널</span></h2>${rows.map(row).join('')}</section>`;
    return `<div class="tracks-view">
      <div class="track-columns"><span>채널</span><span>현재 팔로워</span><span>증감</span><div class="track-scale"><b>0%</b><span>목표 진척</span><b>100%</b></div><span>달성률 · 목표</span></div>
      ${group('자사 매체', ctx.own)}${group('운영 대행', ctx.agency)}
    </div>`;
  }

  function changes(ctx) {
    const tile = (item) => `<article class="change-tile">
      <div class="change-name"><h3>${esc(item.name)}</h3>${item.sub ? `<span>${esc(item.sub)}</span>` : ''}</div>
      <div class="change-hero ${trendClass(item)}"><strong class="num">${changeValue(item, ctx.fmt)}</strong><span>${item.delta == null ? `${esc(item.period)} · 비교 없음` : `${esc(item.period)} · 명`}</span></div>
      <div class="change-follower"><span>팔로워</span><b class="num">${ctx.fmt(item.current)}</b></div>
      ${partLine(item, ctx.fmt)}
      <div class="change-goal">${ctx.meter(item)}<div><span>목표 ${ctx.fmt(item.goal)}명</span><b class="num">${ctx.pct(item)}</b></div></div>
    </article>`;
    const agencyRow = (item) => `<article class="change-agency-row">
      <div class="change-agency-name"><h3>${esc(item.name)}</h3>${item.sub ? `<span>${esc(item.sub)}</span>` : ''}</div>
      <div class="change-agency-delta ${trendClass(item)}"><strong class="num">${changeValue(item, ctx.fmt)}</strong><span>${item.delta == null ? `${esc(item.period)} · 비교 없음` : `${esc(item.period)} · 명`}</span></div>
      <div class="change-agency-current"><strong class="num">${ctx.fmt(item.current)}</strong><span>팔로워</span></div>
      <div class="change-agency-goal">${ctx.meter(item)}<span>목표 ${ctx.fmt(item.goal)}명 <b>${ctx.pct(item)}</b></span></div>
    </article>`;
    return `<div class="change-view">
      <section class="change-own"><div class="change-section-title"><h2>자사 매체</h2><span>팔로워 변화</span></div><div class="change-tiles">${ctx.own.map(tile).join('')}</div></section>
      <section class="change-agency"><div class="change-section-title"><h2>운영 대행</h2><span>팔로워 변화</span></div><div class="change-agency-list">${ctx.agency.map(agencyRow).join('')}</div></section>
    </div>`;
  }
  window.extraConcepts = {3: tracks, 4: changes};
}());
