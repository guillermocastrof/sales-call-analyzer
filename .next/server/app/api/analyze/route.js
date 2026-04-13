"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},57147:e=>{e.exports=require("fs")},71017:e=>{e.exports=require("path")},21604:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>y,patchFetch:()=>g,requestAsyncStorage:()=>E,routeModule:()=>m,serverHooks:()=>_,staticGenerationAsyncStorage:()=>T});var a={};r.r(a),r.d(a,{POST:()=>d});var n=r(49303),s=r(88716),o=r(60670),i=r(87070),l=r(34603);let u=process.env.CLAUDE_GATEWAY_URL||"http://127.0.0.1:18789/v1/chat/completions",c=process.env.CLAUDE_GATEWAY_TOKEN||"2e1656ba4816d3df2e137e81c99705619596ce0922824c24";async function p(e){let t=`You are an expert sales coach analyzing a sales call transcript for Guillermo, founder of a video production studio. Analyze this transcript and return a JSON object.

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

Return ONLY the JSON object, no markdown, no explanation.`,r=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:2e3,messages:[{role:"user",content:t}]})});if(!r.ok)throw Error(`Claude API error: ${r.status} ${r.statusText}`);let a=(await r.json()).choices[0].message.content.match(/\{[\s\S]*\}/);if(!a)throw Error("No JSON found in Claude response");return JSON.parse(a[0])}async function d(e){try{let{id:t}=await e.json();if(!t)return i.NextResponse.json({error:"Call ID required"},{status:400});let r=(0,l.Z)(),a=r.prepare("SELECT * FROM calls WHERE id = ?").get(t);if(!a)return i.NextResponse.json({error:"Call not found"},{status:404});return r.prepare("UPDATE calls SET analysis_status = 'processing' WHERE id = ?").run(t),p(a.transcript).then(e=>{(0,l.Z)().prepare(`
          UPDATE calls SET
            analysis_json = ?,
            analysis_status = 'done',
            talk_ratio_guillermo = ?
          WHERE id = ?
        `).run(JSON.stringify(e),e.talk_ratio_guillermo,t)}).catch(e=>{console.error("Analysis failed:",e),(0,l.Z)().prepare("UPDATE calls SET analysis_status = 'error' WHERE id = ?").run(t)}),i.NextResponse.json({message:"Analysis started",id:t})}catch(e){return i.NextResponse.json({error:"Failed to start analysis"},{status:500})}}let m=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/guillermo/Projects/sales-call-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:E,staticGenerationAsyncStorage:T,serverHooks:_}=m,y="/api/analyze/route";function g(){return(0,o.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:T})}},34603:(e,t,r)=>{r.d(t,{Z:()=>d});let a=require("better-sqlite3");var n=r.n(a),s=r(71017),o=r.n(s),i=r(57147),l=r.n(i);let u=process.env.DATA_DIR||"./data";l().existsSync(u)||l().mkdirSync(u,{recursive:!0});let c=o().join(u,"calls.db"),p=global,d=function(){return p.db||(p.db=new(n())(c),p.db.pragma("journal_mode = WAL"),p.db.exec(`
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)),p.db}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,972],()=>r(21604));module.exports=a})();