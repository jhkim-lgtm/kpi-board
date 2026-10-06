/* Directions 19–20: the measured values and their positions never animate. */
(function (root) {
  'use strict';
  const views = root.GrowthDirections = root.GrowthDirections || {};
  const valid = n => typeof n === 'number' && Number.isFinite(n);
  const clamp = n => valid(n) ? Math.max(0, Math.min(100, n)) : 0;
  const own = ctx => Array.isArray(ctx.own) ? ctx.own : [];
  const daily = ctx => Array.isArray(ctx.daily) ? ctx.daily : [];
  const f = (ctx,n) => valid(n) ? ctx.f(n) : '—';
  const s = (ctx,n) => valid(n) ? ctx.s(n) : '—';
  const e = (ctx,value) => ctx.e(String(value == null ? '' : value));
  const live = c => !c.stale && valid(c.current) && valid(c.delta);
  const grows = c => live(c) && c.delta > 0 && c.growth && c.growth.mode === 'growth';
  const short = c => ({kr:'1%CLUB 코리아',mfk:'MyFirstKorea',jp:'1%CLUB 재팬',xhs:'샤오홍슈'}[c.id] || c.name);
  const code = index => String(index + 1).padStart(2,'0');
  function next(ctx,c) {
    const g = c.growth || {};
    if (valid(g.nextRemaining)) return `다음 ${g.nextPercent}%까지 ${f(ctx,g.nextRemaining)}명`;
    if (valid(c.current) && valid(c.goal) && c.current >= c.goal) return '목표 달성 · 다음 장을 준비합니다';
    return '목표 진척 집계 대기';
  }
  function paper(ctx,c,index) {
    const known = valid(c.progress), p = clamp(c.progress), active = grows(c), id = 'gd19-paper-' + index;
    const points = '20,55 218,19 300,80 256,255 32,226';
    return `<article class="gd19-sheet">
      <div class="gd19-name"><span>${code(index)}</span><h3>${e(ctx,short(c))}</h3></div>
      <div class="gd19-object"><svg viewBox="0 0 320 284" role="img" aria-label="${e(ctx,short(c))}, 청색 가로폭이 목표 진척 ${known?p.toFixed(1)+'%':'미집계'}를 나타내는 종이 조형">
        <defs><clipPath id="${id}"><polygon points="${points}"/></clipPath><clipPath id="${id}-ink"><rect x="20" y="0" width="${280*p/100}" height="284"/></clipPath><linearGradient id="${id}-shine"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".46"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
        <ellipse cx="164" cy="267" rx="119" ry="8" fill="#1749aa" opacity=".07"/>
        <polygon points="28,64 223,27 307,88 261,262 38,234" fill="#112f68" opacity=".055"/>
        <polygon points="${points}" fill="#fbfcff" stroke="#c5cfdf" stroke-width="1"/>
        <g clip-path="url(#${id})"><g clip-path="url(#${id}-ink)"><rect x="20" y="0" width="280" height="284" fill="#225bdd"/>${active?`<rect class="gd19-glint motion" x="-100" y="0" width="90" height="284" fill="url(#${id}-shine)" style="--gd19-speed:${valid(c.growth.duration)?c.growth.duration+2:6}s;--gd19-delay:${-index*.7}s"/>`:''}</g></g>
        <polygon points="20,55 158,139 32,226" fill="#153f91" opacity=".10"/>
        <polygon points="218,19 158,139 300,80" fill="#fff" opacity=".39"/>
        <polygon points="158,139 300,80 256,255" fill="#113883" opacity=".07"/>
        <path d="M20 55L158 139L256 255M218 19L158 139L300 80M32 226L158 139" fill="none" stroke="#8ba8e0" stroke-opacity=".42" stroke-width="1"/>
        <path d="M218 19L221 78L300 80" fill="#f9fbff" stroke="#bccbe5" stroke-width=".8"/>
        <path d="M218 19L221 78L250 53Z" fill="#d9e3f5"/>
      </svg><div class="gd19-percent">${known?p.toFixed(1):'—'}<small>${known?'%':'미집계'}</small></div></div>
      <div class="gd19-reading"><strong>${f(ctx,c.current)}<small>명</small></strong><span class="${live(c)&&c.delta<0?'down':''}">${live(c)?s(ctx,c.delta):'—'}<small>${c.stale?'이전 집계':'전일'}</small></span></div>
      <div class="gd19-target"><span>목표 ${f(ctx,c.goal)}명</span><b>${e(ctx,next(ctx,c))}</b></div>
    </article>`;
  }
  views[19] = {render(ctx) {
    return `<div class="gd19-layout"><header class="gd19-header"><div><span class="gd19-kicker">PAPER FOLD / A NEW CHAPTER</span><h2>오늘의 한 장이,<br>다음 목표를 펼칩니다.</h2></div><div class="gd19-header-note"><span>자사 미디어 · 최근 7일 순증</span><strong class="${valid(ctx.week)&&ctx.week<0?'down':''}">${s(ctx,ctx.week)}<small>명</small></strong></div></header><div class="gd19-panorama">${own(ctx).map((c,i)=>paper(ctx,c,i)).join('')}</div><footer class="gd19-caption"><span>같은 폭의 종이 · 청색으로 채워진 가로폭 = 실제 목표 진척</span><span>종이의 접힘과 그림자는 장식입니다.</span></footer></div>`;
  }};

  function niceCeiling(value) {
    const n = Math.max(1,value), power = 10 ** Math.floor(Math.log10(n)), scaled = n/power;
    return (scaled<=1?1:scaled<=2?2:scaled<=5?5:10)*power;
  }
  function separateLabels(points, bounds) {
    const placed = [], halfWidth = 15, halfHeight = 12;
    const overlaps = (x,y,label) => Math.abs(x-label.lx)<halfWidth*2+7 && Math.abs(y-label.ly)<halfHeight*2+6;
    return points.map(point => {
      const candidates=[];
      for(const radius of [27,47,68,91,120]) for(const angle of [-Math.PI/4,-3*Math.PI/4,Math.PI/4,3*Math.PI/4,0,Math.PI,-Math.PI/2,Math.PI/2]) {
        candidates.push({x:Math.max(bounds.left+halfWidth,Math.min(bounds.right-halfWidth,point.x+Math.cos(angle)*radius)),y:Math.max(bounds.top+halfHeight,Math.min(bounds.bottom-halfHeight,point.y+Math.sin(angle)*radius))});
      }
      for(let x=bounds.left+halfWidth+4;x<=bounds.right-halfWidth;x+=38) for(let y=bounds.top+halfHeight+4;y<=bounds.bottom-halfHeight;y+=31) candidates.push({x,y});
      candidates.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
      const chosen=candidates.find(p=>!placed.some(label=>overlaps(p.x,p.y,label))&&!points.some(dot=>Math.abs(p.x-dot.x)<halfWidth+8&&Math.abs(p.y-dot.y)<halfHeight+8))||candidates[candidates.length-1];
      const label={...point,lx:chosen.x,ly:chosen.y};placed.push(label);return label;
    });
  }
  views[20] = {render(ctx) {
    const rows=daily(ctx),available=rows.filter(c=>live(c)&&valid(c.progress));
    const limit=niceCeiling(Math.max(1,...available.map(c=>Math.abs(c.delta))));
    const makePlot = mobile => {
    const b=mobile?{left:64,right:476,top:46,bottom:360}:{left:76,right:952,top:46,bottom:338},mid=(b.top+b.bottom)/2;
    const clip='gd20-field-clip-'+(mobile?'mobile':'wide'),gradient='gd20-scan-ink-'+(mobile?'mobile':'wide');
    const points=rows.map((c,index)=>({c,index})).filter(({c})=>live(c)&&valid(c.progress)).map(({c,index})=>({c,index,x:b.left+clamp(c.progress)/100*(b.right-b.left),y:mid-c.delta/limit*(b.bottom-b.top)/2}));
    const labels=separateLabels(points,b);
    const gridX=[0,25,50,75,100].map(n=>{const x=b.left+(b.right-b.left)*n/100;return `<path d="M${x} ${b.top}V${b.bottom}" class="gd20-grid ${n===50?'gd20-middle':''}"/><text x="${x}" y="${b.bottom+25}" text-anchor="middle" class="gd20-axis">${n}%</text>`;}).join('');
    const gridY=[-1,-.5,0,.5,1].map(n=>{const y=mid-n*(b.bottom-b.top)/2;return `<path d="M${b.left} ${y}H${b.right}" class="gd20-grid ${n===0?'gd20-zero':''}"/><text x="${b.left-14}" y="${y+5}" text-anchor="end" class="gd20-axis">${s(ctx,n*limit)}</text>`;}).join('');
    return `<svg class="gd20-chart ${mobile?'gd20-chart-mobile':'gd20-chart-wide'}" viewBox="0 0 ${mobile?'510 430':'1000 400'}" role="img" aria-label="일별 ${rows.length}개 채널. 가로축 목표 진척 0부터 100퍼센트, 세로축 실제 전일 증감 ${f(ctx,-limit)}명부터 ${f(ctx,limit)}명까지. 점은 실제 좌표이며 번호만 겹치지 않게 배치합니다."><defs><clipPath id="${clip}"><rect x="${b.left}" y="${b.top}" width="${b.right-b.left}" height="${b.bottom-b.top}"/></clipPath><linearGradient id="${gradient}"><stop stop-color="#54816e" stop-opacity="0"/><stop offset=".7" stop-color="#54816e" stop-opacity=".045"/><stop offset="1" stop-color="#54816e" stop-opacity="0"/></linearGradient></defs>
      <rect x="${b.left}" y="${b.top}" width="${b.right-b.left}" height="${b.bottom-b.top}" fill="#f5f2e7"/>
      <rect x="${(b.left+b.right)/2}" y="${b.top}" width="${(b.right-b.left)/2}" height="${(b.bottom-b.top)/2}" fill="#e5eddc"/>
      <rect x="${b.left}" y="${mid}" width="${b.right-b.left}" height="${(b.bottom-b.top)/2}" fill="#f2e8dc" opacity=".55"/>
      ${gridX}${gridY}<g clip-path="url(#${clip})"><rect class="gd20-scan motion" x="-200" y="${b.top}" width="200" height="${b.bottom-b.top}" fill="url(#${gradient})"/></g>
      <text x="${b.left}" y="24" class="gd20-axis-title">전일 증감 · 명</text><text x="${b.right}" y="${b.bottom+50}" text-anchor="end" class="gd20-axis-title">목표 진척 · %</text>
      <text x="${b.right-18}" y="${b.top+25}" text-anchor="end" class="gd20-direction">더 높은 진척과 증가 ↗</text>
      ${labels.map(p=>`<g class="gd20-point ${p.c.delta<0?'gd20-down':p.c.delta===0?'gd20-flat':''}"><path d="M${p.x} ${p.y}L${p.lx} ${p.ly}" class="gd20-leader"/>${grows(p.c)?`<circle class="gd20-beacon motion" cx="${p.x}" cy="${p.y}" r="11" style="--gd20-speed:${valid(p.c.growth.duration)?p.c.growth.duration:5}s;--gd20-delay:${-p.index*.31}s"/>`:''}<circle class="gd20-dot" cx="${p.x}" cy="${p.y}" r="4.5"/><rect x="${p.lx-15}" y="${p.ly-12}" width="30" height="24" rx="5" class="gd20-label-plate"/><text x="${p.lx}" y="${p.ly+4.5}" text-anchor="middle" class="gd20-code">${code(p.index)}</text></g>`).join('')}
      ${points.length?'':`<text x="${(b.left+b.right)/2}" y="${mid-20}" text-anchor="middle" class="gd20-empty">같은 집계일의 실측 데이터를 기다립니다.</text>`}
      </svg>`;
    };
    return `<div class="gd20-layout"><header class="gd20-header"><div><span class="gd20-kicker">MOMENTUM MAP / DAILY CHANNELS</span><h2>지금의 위치를 알고,<br>다음 성장을 향해.</h2></div><div class="gd20-key"><span><i></i>증가</span><span><i></i>감소</span><small>점의 크기는 동일합니다.</small></div></header><div class="gd20-main"><div class="gd20-field">${makePlot(false)}${makePlot(true)}</div><aside class="gd20-legend"><div class="gd20-legend-title"><span>일별 ${rows.length}개 채널</span><span>전일 증감</span></div>${rows.map((c,i)=>`<div class="gd20-legend-row ${live(c)&&c.delta<0?'gd20-negative':''}"><span class="gd20-legend-code">${code(i)}</span><div class="gd20-channel"><h3>${e(ctx,c.name)}</h3><span>${f(ctx,c.current)}<small>명 · ${valid(c.progress)?clamp(c.progress).toFixed(1)+'%':'진척 미집계'}</small></span></div><div class="gd20-change"><strong>${live(c)?s(ctx,c.delta):'—'}</strong><small>${c.stale?'이전 집계':!live(c)?'미집계':'명'}</small></div></div>`).join('')}</aside></div><footer class="gd20-caption"><span>점 = 실제 좌표 · 연결선 끝 번호 = 채널 · 월간 채널 제외</span><span>집계일이 다르거나 증감이 미집계된 데이터는 좌표 표시를 보류합니다.</span></footer></div>`;
  }};
})(window);
