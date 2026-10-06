/* Public follower data only. Credentials stay in the existing private collector. */
(function (root) {
  'use strict';
  const SHEET = '1mki_nVRs7Rf7Dw6OZRdYCE2ODVnoXXlGfYIQ2ddEGP0';
  const ENDPOINT = 'https://docs.google.com/spreadsheets/d/' + SHEET + '/gviz/tq?tqx=out:csv&headers=1&sheet=';
  const CHANNELS = [
    {id:'kr', key:'1club.kr', name:'1%CLUB 코리아', sub:'Instagram', group:'own', goal:500000},
    {id:'mfk', key:'myfirstkorea', name:'MyFirstKorea', sub:'Instagram', group:'own', goal:300000},
    {id:'jp', key:'1club.jp', name:'1%CLUB 재팬', sub:'Instagram', group:'own', goal:50000},
    {id:'xhs', name:'샤오홍슈', sub:'2개 계정 합계', group:'own', goal:50000},
    {id:'rr', key:'rollsroycecarsseoul', name:'롤스로이스 서울', sub:'Instagram', group:'agency', goal:30000, baseline:22012},
    {id:'plus', key:'pluskr_official', name:'한화 PLUS', sub:'Instagram', group:'agency', goal:10000},
    {id:'kef', key:'kef.korea', name:'KEF', sub:'Instagram', group:'agency', goal:15000},
    {id:'prov', key:'rollsroyceseoulprovenance', name:'롤스로이스 프로비넌스', sub:'Instagram', group:'agency', goal:5000},
    {id:'kakao', key:'rr_kakao', name:'롤스로이스 카카오', sub:'Kakao', group:'agency', goal:2000, monthly:true},
    {id:'yt', key:'rr_youtube', name:'롤스로이스 유튜브', sub:'YouTube', group:'agency', goal:2000, monthly:true}
  ];
  const number = value => {
    const clean = String(value == null ? '' : value).trim().replace(/,/g, '');
    if (!clean || !/^[+-]?\d+(?:\.\d+)?$/.test(clean)) return null;
    const n = Number(clean);
    return Number.isFinite(n) ? n : null;
  };
  const count = value => {const n = number(value); return n != null && n >= 0 && Number.isInteger(n) ? n : null;};
  const day = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
  const shift = (date, days) => new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
  const monthBefore = month => {
    const [y,m] = month.split('-').map(Number);
    return m === 1 ? (y-1) + '-12' : y + '-' + String(m-1).padStart(2,'0');
  };
  const timestamp = value => {
    const text = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text)) return null;
    return Number.isFinite(Date.parse(text.replace(' ', 'T') + ':00+09:00')) ? text.replace(' ', 'T') + ':00+09:00' : null;
  };
  const kstDate = value => new Date(new Date(value).getTime() + 9 * 3600000).toISOString().slice(0,10);
  function csv(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i=0;i<text.length;i++) {
      const c=text[i];
      if(c==='"') {if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
      else if(c===','&&!quoted){row.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}
      else cell+=c;
    }
    row.push(cell);if(row.some(Boolean))rows.push(row);
    if(quoted)throw new Error('피드 CSV가 완전하지 않습니다.');
    return rows;
  }
  function table(text, required) {
    const rows=csv(text), header=(rows.shift()||[]).map(h=>h.replace(/^\uFEFF/,'').trim());
    if(!required.every(key=>header.includes(key)))throw new Error('공개 피드의 열 구성을 확인할 수 없습니다.');
    return rows.map(row=>Object.fromEntries(header.map((key,i)=>[key,row[i]||''])));
  }
  function build(feedText, historyText, fetchedAt = new Date().toISOString()) {
    const warnings=[],today=kstDate(fetchedAt), feed=Object.fromEntries(table(feedText,['key','date','value']).map(row=>[row.key,row]));
    if(!Object.values(feed).some(row=>count(row.value)!=null))throw new Error('공개 피드에 유효한 팔로워 수치가 없습니다.');
    const histories={};
    if(historyText) {
      try {table(historyText,['date','key','value']).forEach(row=>{
        const value=count(row.value);
        if(day(row.date)&&row.date<=today&&value!=null)(histories[row.key]||(histories[row.key]=new Map())).set(row.date,value);
      });}catch(_){warnings.push('일별 이력을 읽지 못해 일부 증감을 표시하지 못했습니다.');}
    }else warnings.push('일별 이력을 읽지 못해 일부 증감을 표시하지 못했습니다.');
    function daily(key,name) {
      const source=feed[key]||{},validDate=day(source.date)&&source.date<=today,values=new Map(histories[key]||[]);
      const current=validDate?count(source.value):null,dataDate=validDate?source.date:null;
      if(current!=null)values.set(dataDate,current);
      const history=[...values].filter(([date])=>!dataDate||date<=dataDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,value}));
      const deltaAt=days=>current!=null&&values.has(shift(dataDate,-days))?current-values.get(shift(dataDate,-days)):null;
      // d1 is the official 1club_data change, not an intraday estimate.
      const delta=current!=null&&source.note==='1club_data'&&number(source.d1)!=null?number(source.d1):deltaAt(1);
      const change7=deltaAt(7),updatedAt=timestamp(source.ts);
      if(current==null)warnings.push(name+' 현재 수치 미집계');
      else if(dataDate<today)warnings.push(name+' 기준일 '+dataDate);
      let declineDays=0;
      if(dataDate&&current!=null){let cursor=dataDate;while(values.has(cursor)&&values.has(shift(cursor,-1))&&values.get(cursor)<values.get(shift(cursor,-1))){declineDays++;cursor=shift(cursor,-1);}}
      return {key,name,current,delta,period:'전일',dataDate,asOf:dataDate,updatedAt,dailyAvg7:change7==null?null:change7/7,history,declineDays,parts:[]};
    }
    const rows=CHANNELS.map(config=>{
      let result;
      if(config.id==='xhs') {
        const parts=[daily('xhs_1club','1%CLUB'),daily('xhs_mfk','MyFirstKorea')];
        const sameDate=parts.every(part=>part.dataDate&&part.dataDate===parts[0].dataDate);
        const sum=key=>sameDate&&parts.every(part=>part[key]!=null)?parts.reduce((n,part)=>n+part[key],0):null;
        const other=new Map(parts[1].history.map(p=>[p.date,p.value]));
        const history=parts[0].history.filter(p=>other.has(p.date)).map(p=>({date:p.date,value:p.value+other.get(p.date)}));
        if(!sameDate)warnings.push('샤오홍슈 두 계정의 기준일이 달라 합계와 증감을 보류했습니다.');
        let declineDays=0;
        if(sameDate&&sum('current')!=null){const values=new Map(history.map(p=>[p.date,p.value]));let cursor=parts[0].dataDate;while(values.has(cursor)&&values.has(shift(cursor,-1))&&values.get(cursor)<values.get(shift(cursor,-1))){declineDays++;cursor=shift(cursor,-1);}}
        result={current:sum('current'),delta:sum('delta'),dailyAvg7:sum('dailyAvg7'),period:'전일',dataDate:sameDate?parts[0].dataDate:null,history,declineDays,parts,updatedAt:parts.map(p=>p.updatedAt).filter(Boolean).sort()[0]||null};
      }else if(config.monthly) {
        const source=feed[config.key]||{},current=count(source.value);
        const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(source.month||'')&&source.month<=today.slice(0,7)?source.month:null;
        const comparable=month&&source.previous_month===monthBefore(month);
        if(current==null)warnings.push(config.name+' 현재 수치 미집계');
        if(!month)warnings.push(config.name+' 월간 기준일 확인 중');
        result={current,delta:current!=null&&comparable?number(source.monthly_delta):null,period:month?Number(month.slice(5))+'월 전월 대비':'월간 · 기준월 확인 중',dataDate:month,updatedAt:timestamp(source.ts),dailyAvg7:null,history:[],declineDays:0,parts:[]};
      }else result=daily(config.key,config.name);
      const baseline=config.baseline||0;
      return {...config,...result,name:config.name,baseline,baselineDate:config.baseline?'2026-02':null,
        asOf:result.dataDate,progress:result.current==null?null:Math.max(0,Math.min(100,(result.current-baseline)/(config.goal-baseline)*100))};
    });
    const updated=rows.map(row=>row.updatedAt).filter(Boolean).sort(),sourceUpdatedAt=updated[updated.length-1]||null;
    if(!sourceUpdatedAt||Date.parse(fetchedAt)-Date.parse(sourceUpdatedAt)>45*60000)warnings.push('피드 동기화가 지연되었습니다. 마지막 수집값을 표시합니다.');
    const dates=rows.filter(row=>!row.monthly).map(row=>row.dataDate).filter(Boolean).sort();
    return {rows,fetchedAt,sourceUpdatedAt,dataDate:dates[dates.length-1]||null,warnings:[...new Set(warnings)],source:'1club_data · 롤스로이스 월간 시트 · 샤오홍슈 공개 피드'};
  }
  async function get(tab) {
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try {const response=await fetch(ENDPOINT+tab+'&_='+Date.now(),{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error(tab+' HTTP '+response.status);return await response.text();}
    finally{clearTimeout(timeout);}
  }
  async function load() {
    const [feed,history]=await Promise.allSettled([get('feed'),get('history')]);
    if(feed.status!=='fulfilled')throw new Error('공개 피드 연결 실패: '+feed.reason.message);
    return build(feed.value,history.status==='fulfilled'?history.value:'');
  }
  const api={load,build,parseCsv:csv};
  root.ChampionData=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
