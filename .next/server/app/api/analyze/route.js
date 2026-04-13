"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},21604:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>y,patchFetch:()=>f,requestAsyncStorage:()=>E,routeModule:()=>p,serverHooks:()=>_,staticGenerationAsyncStorage:()=>T});var n={};a.r(n),a.d(n,{POST:()=>m});var o=a(49303),r=a(88716),i=a(60670),s=a(87070),l=a(9487);let c=process.env.CLAUDE_GATEWAY_URL||"http://127.0.0.1:18789/v1/chat/completions",u=process.env.CLAUDE_GATEWAY_TOKEN||"2e1656ba4816d3df2e137e81c99705619596ce0922824c24";async function d(e){let t=`You are an expert sales coach analyzing a sales call transcript for Guillermo, founder of a video production studio. Analyze this transcript and return a JSON object.

TRANSCRIPT:
${e}

Analyze the transcript and return ONLY valid JSON with these exact keys:
{
  "whats_good": ["bullet point 1", "bullet point 2", ...],
  "whats_wrong": ["bullet point 1", "bullet point 2", ...],
  "client_sentiment": "Positive" | "Neutral" | "Negative",
  "sentiment_moments": ["key emotional moment 1", "key emotional moment 2", ...],
  "objections": ["objection 1", "objection 2", ...],
  "buying_signals": ["signal 1", "signal 2", ...],
  "follow_up_actions": ["action 1", "action 2", ...],
  "talk_ratio_guillermo": <number 0-100 representing % of words Guillermo spoke>
}

For talk_ratio_guillermo:
- If transcript has "G:" / "Guillermo:" / "Interviewer:" prefixes, count words per speaker
- Otherwise estimate: questions typically come from Guillermo, answers from client
- Return a number between 0 and 100

Return ONLY the JSON object, no markdown, no explanation.`,a=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2e3,messages:[{role:"user",content:t}]})});if(!a.ok)throw Error(`Claude API error: ${a.status} ${a.statusText}`);let n=(await a.json()).choices[0].message.content.match(/\{[\s\S]*\}/);if(!n)throw Error("No JSON found in Claude response");return JSON.parse(n[0])}async function m(e){try{await (0,l.Dv)();let{id:t}=await e.json();if(!t)return s.NextResponse.json({error:"Call ID required"},{status:400});let a=await (0,l.wj)(t);if(!a)return s.NextResponse.json({error:"Call not found"},{status:404});return await (0,l.Tm)(t,"processing"),d(a.transcript).then(async e=>{await (0,l.qn)(t,JSON.stringify(e),e.talk_ratio_guillermo)}).catch(async e=>{console.error("Analysis failed:",e),await (0,l.Tm)(t,"error")}),s.NextResponse.json({message:"Analysis started",id:t})}catch(e){return console.error("POST /api/analyze error:",e),s.NextResponse.json({error:"Failed to start analysis"},{status:500})}}let p=new o.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/guillermo/Projects/sales-call-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:E,staticGenerationAsyncStorage:T,serverHooks:_}=p,y="/api/analyze/route";function f(){return(0,i.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:T})}},9487:(e,t,a)=>{a.d(t,{Ak:()=>u,Dv:()=>o,TT:()=>s,Tm:()=>l,qW:()=>r,qn:()=>c,wj:()=>i});let n=(0,a(62237).qn)(process.env.DATABASE_URL);async function o(){await n`
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
  `}async function r(){return n`SELECT * FROM calls ORDER BY created_at DESC`}async function i(e){return(await n`SELECT * FROM calls WHERE id = ${e}`)[0]||null}async function s(e){return(await n`
    INSERT INTO calls (id, client_name, client_company, call_date, duration_minutes, outcome, transcript, analysis_status, talk_ratio_guillermo, word_count_total)
    VALUES (${e.id}, ${e.client_name}, ${e.client_company}, ${e.call_date}, ${e.duration_minutes}, ${e.outcome}, ${e.transcript}, ${e.analysis_status}, ${e.talk_ratio_guillermo}, ${e.word_count_total})
    RETURNING *
  `)[0]}async function l(e,t){await n`UPDATE calls SET analysis_status = ${t} WHERE id = ${e}`}async function c(e,t,a){await n`
    UPDATE calls SET
      analysis_json = ${t},
      analysis_status = 'done',
      talk_ratio_guillermo = ${a}
    WHERE id = ${e}
  `}async function u(e,t){let a=["outcome","client_name","client_company","call_date","duration_minutes"],o=Object.entries(t).filter(([e])=>a.includes(e));if(!o.length)return null;n`UPDATE calls SET `;for(let e=0;e<o.length;e++){let[t,a]=o[e];0===e&&n`UPDATE calls SET ${n.unsafe(t)} = ${a}`}for(let[t,a]of o)"outcome"===t&&await n`UPDATE calls SET outcome = ${a} WHERE id = ${e}`,"client_name"===t&&await n`UPDATE calls SET client_name = ${a} WHERE id = ${e}`,"client_company"===t&&await n`UPDATE calls SET client_company = ${a} WHERE id = ${e}`,"call_date"===t&&await n`UPDATE calls SET call_date = ${a} WHERE id = ${e}`,"duration_minutes"===t&&await n`UPDATE calls SET duration_minutes = ${a} WHERE id = ${e}`;return i(e)}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),n=t.X(0,[948,972,237],()=>a(21604));module.exports=n})();