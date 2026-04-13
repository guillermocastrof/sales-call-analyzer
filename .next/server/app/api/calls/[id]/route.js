"use strict";(()=>{var e={};e.id=703,e.ids=[703],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},57147:e=>{e.exports=require("fs")},71017:e=>{e.exports=require("path")},68689:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>R,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>T,staticGenerationAsyncStorage:()=>E});var a={};r.r(a),r.d(a,{GET:()=>u,PATCH:()=>d});var s=r(49303),n=r(88716),o=r(60670),i=r(87070),l=r(34603);async function u(e,{params:t}){try{let e=(0,l.Z)().prepare("SELECT * FROM calls WHERE id = ?").get(t.id);if(!e)return i.NextResponse.json({error:"Call not found"},{status:404});return i.NextResponse.json(e)}catch(e){return i.NextResponse.json({error:"Failed to fetch call"},{status:500})}}async function d(e,{params:t}){try{let r=await e.json(),a=(0,l.Z)(),s=[],n=[];for(let e of["outcome","client_name","client_company","call_date","duration_minutes"])void 0!==r[e]&&(s.push(`${e} = ?`),n.push(r[e]));if(0===s.length)return i.NextResponse.json({error:"No valid fields to update"},{status:400});n.push(t.id),a.prepare(`UPDATE calls SET ${s.join(", ")} WHERE id = ?`).run(...n);let o=a.prepare("SELECT * FROM calls WHERE id = ?").get(t.id);return i.NextResponse.json(o)}catch(e){return i.NextResponse.json({error:"Failed to update call"},{status:500})}}let c=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/calls/[id]/route",pathname:"/api/calls/[id]",filename:"route",bundlePath:"app/api/calls/[id]/route"},resolvedPagePath:"/Users/guillermo/Projects/sales-call-analyzer/app/api/calls/[id]/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:p,staticGenerationAsyncStorage:E,serverHooks:T}=c,m="/api/calls/[id]/route";function R(){return(0,o.patchFetch)({serverHooks:T,staticGenerationAsyncStorage:E})}},34603:(e,t,r)=>{r.d(t,{Z:()=>p});let a=require("better-sqlite3");var s=r.n(a),n=r(71017),o=r.n(n),i=r(57147),l=r.n(i);let u=process.env.DATA_DIR||"./data";l().existsSync(u)||l().mkdirSync(u,{recursive:!0});let d=o().join(u,"calls.db"),c=global,p=function(){return c.db||(c.db=new(s())(d),c.db.pragma("journal_mode = WAL"),c.db.exec(`
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
    `)),c.db}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,972],()=>r(68689));module.exports=a})();