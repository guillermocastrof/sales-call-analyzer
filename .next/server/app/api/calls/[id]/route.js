"use strict";(()=>{var t={};t.id=703,t.ids=[703],t.modules={20399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},68689:(t,a,e)=>{e.r(a),e.d(a,{originalPathname:()=>_,patchFetch:()=>m,requestAsyncStorage:()=>d,routeModule:()=>E,serverHooks:()=>p,staticGenerationAsyncStorage:()=>T});var n={};e.r(n),e.d(n,{GET:()=>c,PATCH:()=>u});var l=e(49303),i=e(88716),r=e(60670),s=e(87070),o=e(9487);async function c(t,{params:a}){try{await (0,o.Dv)();let t=await (0,o.wj)(a.id);if(!t)return s.NextResponse.json({error:"Call not found"},{status:404});return s.NextResponse.json(t)}catch(t){return console.error("GET /api/calls/[id] error:",t),s.NextResponse.json({error:"Failed to fetch call"},{status:500})}}async function u(t,{params:a}){try{await (0,o.Dv)();let e=await t.json(),n=await (0,o.Ak)(a.id,e);if(!n)return s.NextResponse.json({error:"No valid fields to update or call not found"},{status:400});return s.NextResponse.json(n)}catch(t){return console.error("PATCH /api/calls/[id] error:",t),s.NextResponse.json({error:"Failed to update call"},{status:500})}}let E=new l.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/calls/[id]/route",pathname:"/api/calls/[id]",filename:"route",bundlePath:"app/api/calls/[id]/route"},resolvedPagePath:"/Users/guillermo/Projects/sales-call-analyzer/app/api/calls/[id]/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:d,staticGenerationAsyncStorage:T,serverHooks:p}=E,_="/api/calls/[id]/route";function m(){return(0,r.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:T})}},9487:(t,a,e)=>{e.d(a,{Ak:()=>u,Dv:()=>l,TT:()=>s,Tm:()=>o,qW:()=>i,qn:()=>c,wj:()=>r});let n=(0,e(62237).qn)(process.env.DATABASE_URL);async function l(){await n`
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      client_name TEXT,
      client_company TEXT,
      call_date TEXT,
      duration_minutes INTEGER,
      outcome TEXT DEFAULT 'Unclear',
      transcript TEXT,
      analysis_json TEXT,
      analysis_status TEXT DEFAULT 'pending',
      talk_ratio_guillermo REAL,
      word_count_total INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `}async function i(){return n`SELECT * FROM calls ORDER BY created_at DESC`}async function r(t){return(await n`SELECT * FROM calls WHERE id = ${t}`)[0]||null}async function s(t){return(await n`
    INSERT INTO calls (id, client_name, client_company, call_date, duration_minutes, outcome, transcript, analysis_status, talk_ratio_guillermo, word_count_total)
    VALUES (${t.id}, ${t.client_name}, ${t.client_company}, ${t.call_date}, ${t.duration_minutes}, ${t.outcome}, ${t.transcript}, ${t.analysis_status}, ${t.talk_ratio_guillermo}, ${t.word_count_total})
    RETURNING *
  `)[0]}async function o(t,a){await n`UPDATE calls SET analysis_status = ${a} WHERE id = ${t}`}async function c(t,a,e){await n`
    UPDATE calls SET
      analysis_json = ${a},
      analysis_status = 'done',
      talk_ratio_guillermo = ${e}
    WHERE id = ${t}
  `}async function u(t,a){let e=["outcome","client_name","client_company","call_date","duration_minutes"],l=Object.entries(a).filter(([t])=>e.includes(t));if(!l.length)return null;n`UPDATE calls SET `;for(let t=0;t<l.length;t++){let[a,e]=l[t];0===t&&n`UPDATE calls SET ${n.unsafe(a)} = ${e}`}for(let[a,e]of l)"outcome"===a&&await n`UPDATE calls SET outcome = ${e} WHERE id = ${t}`,"client_name"===a&&await n`UPDATE calls SET client_name = ${e} WHERE id = ${t}`,"client_company"===a&&await n`UPDATE calls SET client_company = ${e} WHERE id = ${t}`,"call_date"===a&&await n`UPDATE calls SET call_date = ${e} WHERE id = ${t}`,"duration_minutes"===a&&await n`UPDATE calls SET duration_minutes = ${e} WHERE id = ${t}`;return r(t)}}};var a=require("../../../../webpack-runtime.js");a.C(t);var e=t=>a(a.s=t),n=a.X(0,[948,972,237],()=>e(68689));module.exports=n})();