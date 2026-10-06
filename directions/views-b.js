(function (root) {
  'use strict';
  const views = root.GrowthDirections = root.GrowthDirections || {};
  const valid = n => typeof n === 'number' && Number.isFinite(n);
  const pct = n => valid(n) ? Math.max(0, Math.min(100, n)) : 0;
  const fmt = (ctx, n) => valid(n) ? ctx.f(n) : '—';
  const signed = (ctx, n) => valid(n) ? ctx.s(n) : '—';
  const text = (ctx, s) => ctx.e(String(s == null ? '' : s));
  const positive = c => c && !c.stale && c.delta > 0 && c.growth && c.growth.mode === 'growth';
  const tone = c => c.stale || !valid(c.delta) ? 'quiet' : c.delta > 0 ? 'up' : c.delta < 0 ? 'down' : 'quiet';
  const color = (ctx, c) => ctx.colors && ctx.colors[c.id] || '#80cebb';
  const short = c => ({kr:'1%CLUB 코리아', mfk:'MyFirstKorea', jp:'1%CLUB 재팬', xhs:'샤오홍슈'}[c.id] || c.name);
  const flag = c => ({kr:'🇰🇷', mfk:'🌏', jp:'🇯🇵', xhs:'🇨🇳'}[c.id] || '');
  function own(ctx) { return Array.isArray(ctx.own) ? ctx.own : []; }
  function totals(ctx) {
    const rows = own(ctx), complete = rows.length === 4 && rows.every(c => valid(c.current));
    const dailyRows = Array.isArray(ctx.daily) ? ctx.daily : Array.isArray(ctx.rows) ? ctx.rows.filter(c => c.period === '전일') : rows;
    const dates = dailyRows.map(c => c.dataDate).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date || '')).sort();
    const latestDate = /^\d{4}-\d{2}-\d{2}$/.test(ctx.date || '') ? ctx.date : dates[dates.length - 1] || null;
    const sameDate = rows.length === 4 && latestDate && rows.every(c => c.dataDate === latestDate);
    const fresh = sameDate && rows.every(c => !c.stale);
    const sum = key => fresh && rows.every(c => valid(c[key])) ? rows.reduce((n,c) => n+c[key],0) : null;
    const current = complete && sameDate ? rows.reduce((n,c) => n+c.current,0) : null;
    const goal = rows.length === 4 && rows.every(c => valid(c.goal) && c.goal > 0) ? rows.reduce((n,c) => n+c.goal,0) : null;
    const week = fresh && rows.every(c => c.growth && valid(c.growth.change7)) ? rows.reduce((n,c)=>n+c.growth.change7,0) : null;
    const delta = sum('delta');
    return {current,goal,week,delta,progress:valid(current)&&goal ? current/goal*100 : null,live:rows.length===4&&rows.every(c=>!c.stale)&&valid(delta)&&delta>0};
  }
  function delta(ctx,c) {
    return `<span class="gd-b-delta ${tone(c)}">${c.stale?'최근 기록':valid(c.delta)?'전일 '+signed(ctx,c.delta):'증감 미집계'}</span>`;
  }
  function series(ctx) {
    return (Array.isArray(ctx.series)?ctx.series:[]).filter(p=>p&&valid(p.value)&&p.value>=0&&/^\d{4}-\d{2}-\d{2}$/.test(p.date||'')).slice(-7);
  }

  views[5] = {render(ctx) {
    const t=totals(ctx),points=series(ctx),W=980,H=320,left=72,right=952,top=40,bottom=268;
    let chart='<div class="gd5-no-series">일별 실측 기록을 모으고 있습니다.</div>';
    if(points.length>=2) {
      const values=points.map(p=>p.value),min=Math.min(...values),max=Math.max(...values),spread=Math.max(max-min,20),low=Math.max(0,min-spread*.2),high=max+spread*.25;
      const times=points.map(p=>Date.parse(p.date+'T00:00:00Z')),span=Math.max(86400000,times[times.length-1]-times[0]);
      const coords=points.map((p,i)=>({x:left+(right-left)*(times[i]-times[0])/span,y:bottom-(bottom-top)*(p.value-low)/(high-low),...p}));
      const line=coords.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' '),last=coords[coords.length-1];
      chart=`<svg class="gd5-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="자사 4개 미디어 실측 합계 추이. ${text(ctx,points[0].date)} ${fmt(ctx,points[0].value)}명부터 ${text(ctx,last.date)} ${fmt(ctx,last.value)}명까지">
        <defs><linearGradient id="gd5-area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#92f6cc" stop-opacity=".35"/><stop offset="1" stop-color="#42b9ab" stop-opacity=".015"/></linearGradient><linearGradient id="gd5-line"><stop stop-color="#3e9f94"/><stop offset="1" stop-color="#c2ffda"/></linearGradient></defs>
        ${[.05,.5,.95].map(v=>{const y=bottom-v*(bottom-top);return `<path class="gd5-grid" d="M${left} ${y}H${right}"/><text class="gd5-axis" x="${left-12}" y="${y+4}" text-anchor="end">${fmt(ctx,Math.round(low+(high-low)*v))}</text>`;}).join('')}
        <path d="${line} L${last.x} ${bottom} L${coords[0].x} ${bottom} Z" fill="url(#gd5-area)"/>
        <path d="${line}" fill="none" stroke="url(#gd5-line)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
        ${coords.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#9ee5c5"/><text class="gd5-axis" x="${p.x}" y="${bottom+24}" text-anchor="middle">${text(ctx,p.date.slice(5).replace('-','.'))}</text>`).join('')}
        ${t.live?`<circle class="gd5-arrival motion" cx="${last.x}" cy="${last.y}" r="15" fill="none" stroke="#c2ffda" stroke-width="1.5"/>`:''}<circle cx="${last.x}" cy="${last.y}" r="6" fill="#dcffe8"/><text class="gd5-last" x="${last.x-13}" y="${last.y-18}" text-anchor="end">${fmt(ctx,last.value)}</text>
      </svg>`;
    }
    return `<div class="gd5-layout">
      <div class="gd5-current"><span class="gd5-kicker">GROWTH TIDE / 자사 미디어</span><h2>작은 성장이 모여<br>더 큰 물결이 됩니다.</h2><div class="gd5-total">${fmt(ctx,t.current)}<small>명</small></div><div class="gd5-week ${valid(t.week)&&t.week<0?'down':''}"><span>지난 7일</span><b>${signed(ctx,t.week)}</b><span>명</span></div><p>실제 팔로워 기록이 그린 우리의 흐름</p></div>
      <div class="gd5-water"><div class="gd5-water-title"><span>자사 4개 미디어 · 팔로워 합계</span><span>${points.length>=2?'일별 실측 추이':'집계 중'}</span></div><div class="gd5-plot">${chart}</div><svg class="gd5-wave motion" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 35 Q150 0 300 35 T600 35 T900 35 T1200 35 V90H0Z" fill="#57cdb013"/><path d="M0 55 Q150 15 300 55 T600 55 T900 55 T1200 55" fill="none" stroke="#8cebc820" stroke-width="2"/></svg></div>
      <div class="gd5-channels">${own(ctx).map(c=>`<div class="gd5-channel" style="--channel:${color(ctx,c)}"><span class="gd5-name">${flag(c)} ${text(ctx,short(c))}</span><strong>${fmt(ctx,c.current)}</strong>${delta(ctx,c)}<small>목표 ${fmt(ctx,c.goal)}명 · ${valid(c.progress)?c.progress.toFixed(1)+'%':'—'}</small></div>`).join('')}</div>
    </div>`;
  }};

  function plant(ctx,c,index) {
    const p=pct(c.progress)/100,base=241,height=190*p,stemTop=base-height,stem=`M140 ${base} C${130+index*3} ${base-height*.36} ${147-index*3} ${base-height*.73} 140 ${stemTop}`;
    const green=['#456b37','#618f4d','#7e943d','#9a9f56'][index%4],leaves=Math.floor(p*10),alive=positive(c);
    const foliage=Array.from({length:leaves},(_,i)=>{
      const side=i%2?1:-1,y=base-height*((i+1)/(leaves+1)),x=140+Math.sin(i)*3,length=21+18*p;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${side} 1)"><path d="M0 0 C14 -5 23 -17 ${length.toFixed(1)} -18 C${(length-1).toFixed(1)} -1 18 11 0 0Z" fill="${green}" opacity="${(.62+i/(Math.max(1,leaves))* .35).toFixed(2)}"/><path d="M0 0 Q18 -8 ${length-5} -14" fill="none" stroke="#f4f2c8" stroke-opacity=".38" stroke-width="1"/></g>`;
    }).join('');
    const blossom=p>=1?`<g transform="translate(140 ${stemTop})">${Array.from({length:8},(_,i)=>`<ellipse transform="rotate(${i*45})" cy="-10" rx="6" ry="13" fill="#eec869"/>`).join('')}<circle r="8" fill="#775531"/></g>`:p>0?`<ellipse cx="140" cy="${stemTop-4}" rx="${4+4*p}" ry="${7+7*p}" fill="${green}"/>`:`<ellipse cx="140" cy="241" rx="5" ry="3" fill="#817957"/>`;
    return `<div class="gd6-specimen"><div class="gd6-identity"><span>${flag(c)} ${text(ctx,short(c))}</span><strong>${fmt(ctx,c.current)}</strong>${delta(ctx,c)}</div><svg class="gd6-plant" viewBox="0 0 280 282" role="img" aria-label="${text(ctx,short(c))} 목표 진척 ${valid(c.progress)?c.progress.toFixed(1):'미집계'}퍼센트에 비례하는 식물">
      <ellipse cx="140" cy="246" rx="88" ry="13" fill="#4762440b"/><path d="M25 244 Q83 239 140 244 T255 244" fill="none" stroke="#9caa8c" stroke-width="1"/>
      <g class="${alive?'gd6-living motion':''}" style="--gd6-duration:${valid(c.growth&&c.growth.duration)?c.growth.duration+3:7}s"><path d="${stem}" fill="none" stroke="${green}" stroke-width="${3+p*3}" stroke-linecap="round"/>${foliage}${blossom}${alive?`<path class="gd6-stem-light motion" d="${stem}" fill="none" stroke="#cfebb0" stroke-width="2" stroke-linecap="round"/>`:''}</g>
      <path d="M121 254 Q142 259 158 254 M129 261 Q142 264 151 260" stroke="#b3b7a0" fill="none" stroke-width="1"/>
      </svg><div class="gd6-growth"><b>${valid(c.progress)?c.progress.toFixed(1)+'%':'—'}</b><span>목표 ${fmt(ctx,c.goal)}명</span></div><div class="gd6-next">${c.growth&&valid(c.growth.nextRemaining)?`다음 ${c.growth.nextPercent}%까지 <strong>${fmt(ctx,c.growth.nextRemaining)}명</strong>`:valid(c.current)&&c.current>=c.goal?'목표를 넘어 자라는 중':'실측 기록을 기다리는 중'}</div></div>`;
  }
  views[6] = {render(ctx) {
    const t=totals(ctx);
    return `<div class="gd6-layout"><div class="gd6-heading"><div><span class="gd6-kicker">GROWTH GARDEN / 자사 미디어</span><h2>매일의 관심이,<br>우리의 숲이 됩니다.</h2></div><div class="gd6-total"><small>함께 모인 팔로워</small><strong>${fmt(ctx,t.current)}<i>명</i></strong><span>지난 7일 <b>${signed(ctx,t.week)}명</b></span></div></div><div class="gd6-garden">${own(ctx).map((c,i)=>plant(ctx,c,i)).join('')}</div><div class="gd6-caption"><span>각 식물은 현재 목표 진척만큼 자라 있습니다.</span><span>서로 다른 속도, 함께 만드는 성장.</span></div></div>`;
  }};

  views[7] = {render(ctx) {
    const t=totals(ctx);
    return `<div class="gd7-layout"><div class="gd7-heading"><div><span class="gd7-kicker">MILESTONE METRO / 자사 미디어</span><h2>다음 역은, 한 단계 더.</h2></div><div class="gd7-summary"><span>오늘의 자사 합계</span><strong>${fmt(ctx,t.current)}</strong><small>전일 ${signed(ctx,t.delta)}명</small></div></div><div class="gd7-routes">${own(ctx).map((c,i)=>{
      const p=pct(c.progress),g=c.growth||{},next=valid(g.nextPercent),active=positive(c),known=valid(c.progress);
      return `<div class="gd7-route" style="--route:${['#c77a24','#527166','#3c607b','#a46446'][i%4]};--position:${p}%"><div class="gd7-identity"><div><span class="gd7-line-number">${String(i+1).padStart(2,'0')}</span><span>${flag(c)} ${text(ctx,short(c))}</span></div><strong>${fmt(ctx,c.current)}</strong>${delta(ctx,c)}</div><div class="gd7-map"><div class="gd7-track"><i style="width:${p}%"></i>${active?`<b class="gd7-signal motion" style="--gd7-speed:${valid(g.duration)?g.duration:5}s"></b>`:''}</div>${Array.from({length:11},(_,station)=>`<span class="gd7-station ${known&&station*10<=p?'passed':''} ${next&&station*10===g.nextPercent?'next':''}" style="left:${station*10}%"><i></i><small>${station*10}%</small></span>`).join('')}${known?`<div class="gd7-position"><b>${p.toFixed(1)}%</b><span><i></i><i></i></span></div>`:''}</div><div class="gd7-destination">${next?`<span>다음 역 <b>${g.nextPercent}%</b></span><strong>${fmt(ctx,g.nextRemaining)}<small>명 남음</small></strong><em>${fmt(ctx,g.nextTarget)}명 도착</em>`:valid(c.current)&&c.current>=c.goal?`<span>목표역 도착</span><strong>GOAL</strong><em>목표 ${fmt(ctx,c.goal)}명</em>`:'<span>실측 기록 대기</span><strong>—</strong>'}</div></div>`;
    }).join('')}</div><div class="gd7-caption"><span>현재 위치는 실제 목표 진척입니다.</span><span>작은 역을 하나씩, 목표까지.</span></div></div>`;
  }};

  views[8] = {render(ctx) {
    const t=totals(ctx),p=pct(t.progress)/100,cx=440,cy=309,r=245,angle=Math.PI*(1-p),sx=cx+r*Math.cos(angle),sy=cy-r*Math.sin(angle),remaining=valid(t.current)&&valid(t.goal)?Math.max(0,t.goal-t.current):null;
    return `<div class="gd8-layout"><div class="gd8-ray motion" aria-hidden="true"></div><div class="gd8-story"><span class="gd8-kicker">SUNRISE HORIZON / 자사 미디어</span><h2>우리가 쌓은 성장,<br>더 넓어진 지평선.</h2><span class="gd8-total-label">자사 미디어 전체 팔로워</span><strong class="gd8-total">${fmt(ctx,t.current)}</strong><div class="gd8-week"><span>지난 7일</span><b>${signed(ctx,t.week)}</b><small>명</small></div><p>목표 ${fmt(ctx,t.goal)}명까지<br><b>${fmt(ctx,remaining)}명</b>의 새로운 만남.</p></div><div class="gd8-sky"><svg viewBox="0 0 880 395" role="img" aria-label="자사 합계 ${fmt(ctx,t.current)}명, 합계 목표 ${fmt(ctx,t.goal)}명 대비 ${valid(t.progress)?t.progress.toFixed(1):'미집계'}퍼센트의 고정된 태양 위치"><defs><linearGradient id="gd8-atmosphere" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ef9e53" stop-opacity=".18"/><stop offset="1" stop-color="#e8a263" stop-opacity=".015"/></linearGradient><linearGradient id="gd8-arc"><stop stop-color="#b8774c"/><stop offset="1" stop-color="#ffd597"/></linearGradient></defs><path d="M${cx-r} ${cy}A${r} ${r} 0 0 1 ${cx+r} ${cy}Z" fill="url(#gd8-atmosphere)"/><path d="M${cx-r} ${cy}A${r} ${r} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="#ccaa893b" stroke-width="1.5"/>
      ${Array.from({length:11},(_,i)=>{const a=Math.PI*(1-i/10),x=cx+r*Math.cos(a),y=cy-r*Math.sin(a),x2=cx+(r+6)*Math.cos(a),y2=cy-(r+6)*Math.sin(a);return `<path d="M${x} ${y}L${x2} ${y2}" stroke="#ceac8060" stroke-width="1"/>`;}).join('')}
      ${valid(t.progress)?`<path d="M${cx-r} ${cy}A${r} ${r} 0 0 1 ${cx+r} ${cy}" pathLength="100" fill="none" stroke="url(#gd8-arc)" stroke-width="3" stroke-dasharray="${p*100} 100"/>${t.live?`<circle class="gd8-sun-ring motion" cx="${sx}" cy="${sy}" r="30" fill="none" stroke="#ffdca0" stroke-width="1"/>`:''}<circle cx="${sx}" cy="${sy}" r="18" fill="#ffcf80"/><circle cx="${sx}" cy="${sy}" r="10" fill="#ffe7b3"/>`:''}<path d="M54 ${cy}H826" stroke="#d6a37468" stroke-width="1"/>
      <text class="gd8-progress" x="${cx}" y="237" text-anchor="middle">${valid(t.progress)?t.progress.toFixed(1)+'%':'—'}</text><text class="gd8-progress-label" x="${cx}" y="266" text-anchor="middle">자사 합계 목표 진척</text><text class="gd8-axis" x="${cx-r}" y="${cy+25}" text-anchor="middle">0%</text><text class="gd8-axis" x="${cx+r}" y="${cy+25}" text-anchor="middle">100%</text><text class="gd8-goal-label" x="${cx}" y="${cy+55}" text-anchor="middle">${fmt(ctx,t.current)} / ${fmt(ctx,t.goal)}명</text></svg></div><div class="gd8-channels">${own(ctx).map(c=>`<div class="gd8-chip"><span>${flag(c)} ${text(ctx,short(c))}</span><div><strong>${fmt(ctx,c.current)}</strong><b>${valid(c.progress)?c.progress.toFixed(1)+'%':'—'}</b></div><div class="gd8-mini-track"><i style="width:${pct(c.progress)}%"></i></div><small>${c.stale?'최근 기록':`전일 ${signed(ctx,c.delta)}명`} · 목표 ${fmt(ctx,c.goal)}명</small></div>`).join('')}</div></div>`;
  }};
})(window);
