(() => {
  'use strict';
  const views=window.GrowthDirections=window.GrowthDirections||{};
  views[9]={render(c){
    const max=Math.max(1,...c.daily.filter(r=>!r.stale&&Number.isFinite(r.delta)).map(r=>Math.abs(r.delta)));
    const growing=c.daily.filter(r=>r.growth.mode==='growth').length;
    return `<div class="eq-layout"><div class="eq-title"><div><span class="eyebrow">FIND YOUR MOMENTUM</span><h2>각자의 리듬이,<br>우리의 성장을 만듭니다.</h2></div><div class="eq-count"><b>${growing}</b><span>/ ${c.daily.length} 일별 채널<br>오늘 성장 중</span></div></div><div class="eq-stage"><div class="eq-guide"><span>+${c.f(max)}</span><span>0</span><span>−${c.f(max)}</span></div><div class="eq-columns">${c.daily.map((r,i)=>{
      const known=Number.isFinite(r.delta)&&!r.stale,h=known?Math.abs(r.delta)/max*120:0,positive=r.growth.mode==='growth';
      return `<article class="eq-channel ${r.delta<0?'eq-down':''}" style="--tone:${c.colors[r.id]};--duration:${r.growth.duration||6}s;--phase:${i*-.45}s"><div class="eq-well"><span class="eq-zero"></span><div class="eq-bar ${positive?'eq-positive':''}" style="height:${h}px;${r.delta<0?'top:50%':'bottom:50%'}">${positive?'<i class="eq-stream motion"></i><i class="eq-tip motion"></i>':''}</div></div><strong>${known?c.s(r.delta):'—'}</strong><h3>${c.e(r.name)}</h3><span>${r.stale?'이전 집계':'전일 증감 · 명'}</span></article>`;
    }).join('')}</div></div><div class="eq-caption"><span>막대 높이 = 전일 변화 인원 · 공통 눈금 ±${c.f(max)}명</span><span>기준선 위는 증가 · 아래는 감소 · 월간 제외</span></div></div>`;
  }};
  views[10]={render(c){
    const streak=[...c.positive].filter(r=>r.growth.streak>1).sort((a,b)=>b.growth.streak-a.growth.streak)[0];
    const ticker=c.daily.filter(r=>!r.stale&&Number.isFinite(r.delta)).map(r=>`<span>${c.e(r.name)} <b>${c.s(r.delta)}</b><small>전일</small></span>`).join('');
    return `<div class="record-layout"><div class="record-main"><div class="record-spot motion" aria-hidden="true"></div><span class="eyebrow">THE LAST 7 DAYS / 자사 매체</span><h2>우리의 성장은<br>기록으로 남습니다.</h2><div class="record-number ${c.week<0?'record-negative':''}">${c.s(c.week)}<span>명</span></div><p>최근 7일 팔로워 순증</p><div class="record-own">${c.own.map(r=>`<div><span>${c.e(r.name)}</span><b class="${r.growth.change7<0?'negative':''}">${c.s(r.stale?null:r.growth.change7)}<small>명</small></b></div>`).join('')}</div></div><aside class="record-side"><div class="record-today"><span>자사 매체 · 오늘의 순증</span><strong>${c.s(c.delta)}<small>명</small></strong><p>어제와 비교한 오늘의 기록</p></div><div class="record-streak"><span>일별 채널 · 최장 연속 증가</span><strong>${streak?c.f(streak.growth.streak):'—'}<small>일</small></strong><p>${streak?c.e(streak.name):'연속 증가 기록 대기'}</p></div></aside><div class="record-ticker" aria-label="일별 채널의 실제 전일 증감"><div class="record-run motion"><div>${ticker}</div><div aria-hidden="true">${ticker}</div></div></div></div>`;
  }};
})();
