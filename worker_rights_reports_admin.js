const PLAYER_BASE="https://yuya-narita.github.io/scene/";

export default{
  async fetch(request,env){
    const url=new URL(request.url);
    const cors={
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type, X-File-Name, Authorization, X-Admin-Key",
      "Access-Control-Max-Age":"86400"
    };

    if(request.method==="OPTIONS"){
      return new Response(null,{status:204,headers:cors});
    }

    try{
      if(url.pathname==="/"&&request.method==="GET"){
        return Response.json({
          ok:true,
          service:"Scene Studio API",
          storage:"R2",
          assets:true,
          publicationState:true,
          rightsMvp:true,
          reportInbox:true,
          assetManifests:true,
          adminModeration:Boolean(env.ADMIN_TOKEN),
          ogp:true,
          ogpMode:"html-by-default",
          player:PLAYER_BASE
        },{headers:cors});
      }

      // ----------------------------------------------------------
      // Asset upload
      // ----------------------------------------------------------
      if(url.pathname==="/asset"&&request.method==="POST"){
        const ct=request.headers.get("Content-Type")||"application/octet-stream";
        const name=request.headers.get("X-File-Name")||"asset";
        const ext=getExtension(ct,name);
        const id=crypto.randomUUID().replaceAll("-","").slice(0,16);
        const fn=ext?`${id}.${ext}`:id;

        if(!request.body){
          return Response.json(
            {ok:false,error:"Missing asset body"},
            {status:400,headers:cors}
          );
        }

        await env.BUCKET.put(
          `assets/${fn}`,
          request.body,
          {
            httpMetadata:{
              contentType:ct,
              cacheControl:"public, max-age=31536000, immutable"
            },
            customMetadata:{originalName:name}
          }
        );

        return Response.json({
          ok:true,
          id,
          key:`assets/${fn}`,
          url:`${url.origin}/asset/${encodeURIComponent(fn)}`,
          contentType:ct
        },{headers:cors});
      }

      // Asset delivery
      if(url.pathname.startsWith("/asset/")&&request.method==="GET"){
        const fn=decodeURIComponent(url.pathname.slice(7));
        const o=await env.BUCKET.get(`assets/${fn}`);

        if(!o){
          return Response.json(
            {ok:false,error:"Asset not found"},
            {status:404,headers:cors}
          );
        }

        const h=new Headers(cors);
        o.writeHttpMetadata(h);
        h.set("etag",o.httpEtag);

        return new Response(o.body,{headers:h});
      }

      // ----------------------------------------------------------
      // Public rights report intake
      // ----------------------------------------------------------
      if(url.pathname==="/report"&&request.method==="POST"){
        const payload=await request.json().catch(()=>null);
        const workId=String(payload?.workId||"").trim();
        const reason=String(payload?.reason||"other").trim();
        const publicUrl=String(payload?.url||"").trim().slice(0,1200);
        const sourceUrl=String(payload?.sourceUrl||"").trim().slice(0,1200);

        if(!isValidWorkId(workId)){
          return Response.json({ok:false,error:"Bad work ID"},{status:400,headers:cors});
        }
        if(!["copyright","unauthorized","other"].includes(reason)){
          return Response.json({ok:false,error:"Bad report reason"},{status:400,headers:cors});
        }
        const exists=await env.BUCKET.head(`works/${workId}.scene`);
        if(!exists){
          return Response.json({ok:false,error:"Work not found"},{status:404,headers:cors});
        }

        const reportId=makeReportId();
        const report={
          id:reportId,
          workId,
          reason,
          url:publicUrl,
          sourceUrl,
          status:"open",
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString()
        };
        await putJson(env,`reports/${reportId}.json`,report);
        return Response.json({ok:true,id:reportId,workId,status:"open"},{headers:cors});
      }

      // ----------------------------------------------------------
      // Publish / update
      // ----------------------------------------------------------
      if(url.pathname==="/publish"&&request.method==="POST"){
        const scene=await request.json();
        const rid=(url.searchParams.get("id")||"").trim();
        const id=/^[A-Za-z0-9_-]{6,80}$/.test(rid)
          ? rid
          : crypto.randomUUID().replaceAll("-","").slice(0,12);

        const oldScene=await getScene(env,id);
        const oldAssets=oldScene?extractOwnedAssetKeys(oldScene,url.origin):[];
        const newAssets=extractOwnedAssetKeys(scene,url.origin);

        await env.BUCKET.put(
          `works/${id}.scene`,
          JSON.stringify(scene),
          {httpMetadata:{contentType:"application/json; charset=utf-8"}}
        );

        await putManifest(env,id,newAssets);
        await setState(env,id,"public");

        // Clean assets removed by an update, but ONLY when no other work uses them.
        const removed=oldAssets.filter(key=>!newAssets.includes(key));
        const cleanup=await deleteUnreferencedAssets(env,removed,{excludeWorkId:id});

        return Response.json({
          ok:true,
          id,
          path:`/work/${id}`,
          url:`${url.origin}/work/${id}`,
          state:"public",
          assets:{tracked:newAssets.length,cleaned:cleanup.deleted.length,preserved:cleanup.preserved.length}
        },{headers:cors});
      }

      // ----------------------------------------------------------
      // Existing Studio publication controls (kept for compatibility)
      // ----------------------------------------------------------
      const a=url.pathname.match(/^\/work\/([^/]+)\/(unpublish|republish)$/);

      if(a&&request.method==="POST"){
        const id=decodeURIComponent(a[1]);
        const exists=await env.BUCKET.head(`works/${id}.scene`);

        if(!exists){
          return Response.json(
            {ok:false,error:"Work not found"},
            {status:404,headers:cors}
          );
        }

        const state=a[2]==="unpublish"?"stopped":"public";
        await setState(env,id,state);

        return Response.json({
          ok:true,
          id,
          state,
          url:`${url.origin}/work/${id}`
        },{headers:cors});
      }

      // ----------------------------------------------------------
      // Admin report inbox
      // Requires ADMIN_TOKEN secret in Worker settings.
      // ----------------------------------------------------------
      if(url.pathname==="/admin/reports"&&request.method==="GET"){
        const denied=await requireAdmin(request,env,cors);
        if(denied)return denied;
        const wanted=(url.searchParams.get("status")||"open").trim();
        const reports=await listReports(env,wanted);
        return Response.json({ok:true,count:reports.length,reports},{headers:cors});
      }

      const adminReport=url.pathname.match(/^\/admin\/report\/([^/]+)\/(resolve|reopen)$/);
      if(adminReport&&request.method==="POST"){
        const denied=await requireAdmin(request,env,cors);
        if(denied)return denied;
        const reportId=decodeURIComponent(adminReport[1]);
        if(!isValidReportId(reportId)){
          return Response.json({ok:false,error:"Bad report ID"},{status:400,headers:cors});
        }
        const key=`reports/${reportId}.json`;
        const report=await getJson(env,key);
        if(!report){
          return Response.json({ok:false,error:"Report not found"},{status:404,headers:cors});
        }
        report.status=adminReport[2]==="resolve"?"resolved":"open";
        report.updatedAt=new Date().toISOString();
        await putJson(env,key,report);
        return Response.json({ok:true,report},{headers:cors});
      }

      // ----------------------------------------------------------
      // Admin moderation API
      // Requires ADMIN_TOKEN secret in Worker settings.
      // ----------------------------------------------------------
      const admin=url.pathname.match(/^\/admin\/work\/([^/]+)(?:\/(suspend|republish))?$/);
      if(admin){
        const denied=await requireAdmin(request,env,cors);
        if(denied)return denied;

        const id=decodeURIComponent(admin[1]).trim();
        if(!isValidWorkId(id)){
          return Response.json({ok:false,error:"Bad work ID"},{status:400,headers:cors});
        }

        if(request.method==="GET"&&!admin[2]){
          const scene=await getScene(env,id);
          const state=await getState(env,id);
          const manifest=await getManifest(env,id);
          const tombstone=await getJson(env,`deleted/${id}.json`);
          return Response.json({
            ok:true,
            id,
            exists:Boolean(scene),
            state:normalizePublicState(state,Boolean(scene),Boolean(tombstone)),
            assets:manifest?.assets|| (scene?extractOwnedAssetKeys(scene,url.origin):[]),
            deleted:tombstone||null,
            url:`${url.origin}/work/${id}`
          },{headers:cors});
        }

        if(request.method==="POST"&&admin[2]){
          const exists=await env.BUCKET.head(`works/${id}.scene`);
          if(!exists){
            return Response.json({ok:false,error:"Work not found"},{status:404,headers:cors});
          }
          const state=admin[2]==="suspend"?"stopped":"public";
          await setState(env,id,state,{reason:"admin"});
          return Response.json({
            ok:true,
            id,
            state:state==="stopped"?"suspended":"published",
            url:`${url.origin}/work/${id}`
          },{headers:cors});
        }

        if(request.method==="DELETE"&&!admin[2]){
          const result=await deleteWorkCompletely(env,id,url.origin,{admin:true});
          return Response.json({ok:true,...result},{headers:cors});
        }
      }

      // ----------------------------------------------------------
      // Published work
      // ----------------------------------------------------------
      if(url.pathname.startsWith("/work/")&&request.method==="GET"){
        const id=url.pathname.slice(6).trim();

        if(!id||id.includes("/")){
          return Response.json(
            {ok:false,error:"Bad work ID"},
            {status:400,headers:cors}
          );
        }

        const o=await env.BUCKET.get(`works/${id}.scene`);

        if(!o){
          return gone(
            request,
            cors,
            404,
            "この作品は削除されています。",
            "Work not found"
          );
        }

        if(await getState(env,id)==="stopped"){
          return gone(
            request,
            cors,
            410,
            "この作品は現在、公開を停止しています。",
            "Work is unpublished"
          );
        }

        const wantsRaw =
          url.searchParams.get("raw")==="1" ||
          (request.headers.get("Accept")||"").includes("application/json");

        if(wantsRaw){
          return new Response(o.body,{
            headers:{
              ...cors,
              "Content-Type":"application/json; charset=utf-8",
              "Cache-Control":"no-cache"
            }
          });
        }

        const scene=await o.json();
        return workPage(scene,id,url,cors);
      }

      // ----------------------------------------------------------
      // Existing DELETE route, upgraded to safe complete deletion.
      // Kept at the same URL so the current Studio flow does not break.
      // NOTE: this legacy route is not authenticated; see deployment note.
      // ----------------------------------------------------------
      if(url.pathname.startsWith("/work/")&&request.method==="DELETE"){
        const id=url.pathname.slice(6).trim();
        if(!isValidWorkId(id)){
          return Response.json({ok:false,error:"Bad work ID"},{status:400,headers:cors});
        }

        const result=await deleteWorkCompletely(env,id,url.origin,{admin:false});
        return Response.json({ok:true,...result},{headers:cors});
      }

      return Response.json(
        {ok:false,error:"Not found"},
        {status:404,headers:cors}
      );

    }catch(e){
      return Response.json(
        {ok:false,error:e?.message||"Internal Server Error"},
        {status:500,headers:cors}
      );
    }
  }
};


// ------------------------------------------------------------
// Report helpers
// ------------------------------------------------------------

function makeReportId(){
  const stamp=new Date().toISOString().replace(/[-:.TZ]/g,"");
  const rand=crypto.randomUUID().replaceAll("-","").slice(0,10);
  return `${stamp}_${rand}`;
}

function isValidReportId(id){
  return /^[A-Za-z0-9_-]{8,80}$/.test(String(id||""));
}

async function putJson(env,key,value){
  await env.BUCKET.put(
    key,
    JSON.stringify(value),
    {httpMetadata:{contentType:"application/json; charset=utf-8"}}
  );
}

async function listReports(env,status="open"){
  const rows=[];
  let cursor=undefined;
  do{
    const page=await env.BUCKET.list({prefix:"reports/",cursor});
    for(const obj of page.objects){
      if(!obj.key.endsWith(".json"))continue;
      const row=await getJson(env,obj.key);
      if(!row)continue;
      if(status!=="all"&&row.status!==status)continue;
      rows.push(row);
    }
    cursor=page.truncated?page.cursor:undefined;
  }while(cursor);
  rows.sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  return rows.slice(0,200);
}

// ------------------------------------------------------------
// Rights / deletion helpers
// ------------------------------------------------------------

function isValidWorkId(id){
  return /^[A-Za-z0-9_-]{6,80}$/.test(String(id||""));
}

async function requireAdmin(request,env,cors){
  const expected=String(env.ADMIN_TOKEN||"");
  if(!expected){
    return Response.json(
      {ok:false,error:"Admin moderation is not configured"},
      {status:503,headers:cors}
    );
  }

  const auth=request.headers.get("Authorization")||"";
  const bearer=auth.startsWith("Bearer ")?auth.slice(7):"";
  const direct=request.headers.get("X-Admin-Key")||"";
  const supplied=bearer||direct;

  if(!supplied||!safeEqual(supplied,expected)){
    return Response.json({ok:false,error:"Unauthorized"},{status:401,headers:cors});
  }
  return null;
}

function safeEqual(a,b){
  a=String(a); b=String(b);
  if(a.length!==b.length)return false;
  let diff=0;
  for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}

async function deleteWorkCompletely(env,id,origin,{admin=false}={}){
  const scene=await getScene(env,id);
  const manifest=await getManifest(env,id);
  const candidates=unique([
    ...(manifest?.assets||[]),
    ...(scene?extractOwnedAssetKeys(scene,origin):[])
  ]).filter(isOwnedAssetKey);

  // Suspend first, so public access stops before destructive work begins.
  if(scene)await setState(env,id,"stopped",{reason:admin?"admin-delete":"delete"});

  // A candidate is removed only if no other remaining work references it.
  const cleanup=await deleteUnreferencedAssets(env,candidates,{excludeWorkId:id});

  await env.BUCKET.delete([
    `works/${id}.scene`,
    `states/${id}.json`,
    `manifests/${id}.json`
  ]);

  const deletionRecord={
    id,
    state:"deleted",
    deletedAt:new Date().toISOString(),
    deletedAssets:cleanup.deleted,
    preservedSharedAssets:cleanup.preserved,
    assetErrors:cleanup.errors,
    source:admin?"admin":"legacy-delete"
  };
  await env.BUCKET.put(
    `deleted/${id}.json`,
    JSON.stringify(deletionRecord),
    {httpMetadata:{contentType:"application/json; charset=utf-8"}}
  );

  return {
    deleted:id,
    state:"deleted",
    workDeleted:true,
    assetsDeleted:cleanup.deleted,
    assetsPreserved:cleanup.preserved,
    assetErrors:cleanup.errors
  };
}

async function putManifest(env,id,assets){
  const data={
    id,
    assets:unique(assets).filter(isOwnedAssetKey),
    updatedAt:new Date().toISOString()
  };
  await env.BUCKET.put(
    `manifests/${id}.json`,
    JSON.stringify(data),
    {httpMetadata:{contentType:"application/json; charset=utf-8"}}
  );
}

async function getManifest(env,id){
  return getJson(env,`manifests/${id}.json`);
}

async function getScene(env,id){
  const o=await env.BUCKET.get(`works/${id}.scene`);
  if(!o)return null;
  try{return await o.json();}catch{return null;}
}

async function getJson(env,key){
  const o=await env.BUCKET.get(key);
  if(!o)return null;
  try{return await o.json();}catch{return null;}
}

function extractOwnedAssetKeys(value,origin=""){
  const out=new Set();
  const seen=new WeakSet();

  const visit=v=>{
    if(typeof v==="string"){
      const key=ownedAssetKeyFromString(v,origin);
      if(key)out.add(key);
      return;
    }
    if(!v||typeof v!=="object")return;
    if(seen.has(v))return;
    seen.add(v);
    if(Array.isArray(v)){
      for(const x of v)visit(x);
      return;
    }
    for(const x of Object.values(v))visit(x);
  };

  visit(value);
  return [...out].sort();
}

function ownedAssetKeyFromString(value,origin=""){
  let s=String(value||"").trim();
  if(!s)return"";

  // Scene package / relative Worker forms.
  s=s.replace(/^\.\//,"");
  if(s.startsWith("assets/")){
    const fn=s.slice(7).split(/[?#]/)[0];
    return safeAssetFile(fn)?`assets/${decodeSafe(fn)}`:"";
  }
  if(s.startsWith("/asset/")){
    const fn=s.slice(7).split(/[?#]/)[0];
    return safeAssetFile(fn)?`assets/${decodeSafe(fn)}`:"";
  }

  // Public Worker URL. External URLs are never candidates for deletion.
  try{
    const u=new URL(s,origin||"https://invalid.local");
    if(origin&&u.origin!==origin)return"";
    if(!u.pathname.startsWith("/asset/"))return"";
    const fn=u.pathname.slice(7);
    return safeAssetFile(fn)?`assets/${decodeSafe(fn)}`:"";
  }catch{
    return"";
  }
}

function decodeSafe(s){
  try{return decodeURIComponent(s);}catch{return s;}
}

function safeAssetFile(fn){
  const x=decodeSafe(String(fn||""));
  return Boolean(x) && !x.includes("/") && !x.includes("\\") && x!=="." && x!=="..";
}

function isOwnedAssetKey(key){
  return /^assets\/[^/\\]+$/.test(String(key||""));
}

function unique(items){
  return [...new Set((items||[]).filter(Boolean))];
}

async function deleteUnreferencedAssets(env,keys,{excludeWorkId=""}={}){
  const result={deleted:[],preserved:[],errors:[]};
  for(const key of unique(keys).filter(isOwnedAssetKey)){
    try{
      const used=await isAssetReferencedByAnyOtherWork(env,key,excludeWorkId);
      if(used){
        result.preserved.push(key);
      }else{
        await env.BUCKET.delete(key);
        result.deleted.push(key);
      }
    }catch(e){
      // Safety first: on uncertainty, preserve the object.
      result.preserved.push(key);
      result.errors.push({key,error:e?.message||String(e)});
    }
  }
  return result;
}

async function isAssetReferencedByAnyOtherWork(env,key,excludeWorkId=""){
  let cursor=undefined;
  do{
    const page=await env.BUCKET.list({prefix:"works/",cursor});
    for(const obj of page.objects){
      const m=obj.key.match(/^works\/(.+)\.scene$/);
      if(!m)continue;
      const id=m[1];
      if(id===excludeWorkId)continue;
      const scene=await getScene(env,id);
      if(!scene)continue;
      const refs=extractOwnedAssetKeys(scene);
      if(refs.includes(key))return true;
    }
    cursor=page.truncated?page.cursor:undefined;
  }while(cursor);
  return false;
}


// ------------------------------------------------------------
// Publication state
// ------------------------------------------------------------

async function getState(env,id){
  const o=await env.BUCKET.get(`states/${id}.json`);
  if(!o)return"public";
  try{
    const state=(await o.json())?.state;
    return state==="stopped"||state==="suspended"?"stopped":"public";
  }catch{
    return"public";
  }
}

async function setState(env,id,state,extra={}){
  const normalized=state==="stopped"||state==="suspended"?"stopped":"public";
  await env.BUCKET.put(
    `states/${id}.json`,
    JSON.stringify({
      id,
      state:normalized,
      updatedAt:new Date().toISOString(),
      ...extra
    }),
    {httpMetadata:{contentType:"application/json; charset=utf-8"}}
  );
}

function normalizePublicState(state,exists,deleted){
  if(deleted&&!exists)return"deleted";
  if(!exists)return"missing";
  return state==="stopped"?"suspended":"published";
}


// ------------------------------------------------------------
// Navigation / OGP
// ------------------------------------------------------------

function isNav(r){
  const a=r.headers.get("Accept")||"";
  const m=r.headers.get("Sec-Fetch-Mode")||"";
  const d=r.headers.get("Sec-Fetch-Dest")||"";

  return (
    m==="navigate" ||
    d==="document" ||
    a.includes("text/html")
  );
}

function workPage(scene,id,url,cors){
  const meta=scene?.metadata||{};

  const workTitle=cleanText(scene?.title)||"Untitled";
  const episode=cleanText(meta?.episode);
  const episodeTitle=cleanText(meta?.episodeTitle);
  const description=cleanText(meta?.description);

  const ogTitle=composeOgTitle(workTitle,episode,episodeTitle);

  const workUrl=`${url.origin}/work/${encodeURIComponent(id)}`;
  const rawWorkUrl=`${workUrl}?raw=1`;

  const playerUrl=new URL(PLAYER_BASE);
  playerUrl.searchParams.set("src",rawWorkUrl);

  const imageUrl=resolvePublicAssetUrl(scene?.cover?.src,url.origin);

  const titleEsc=escapeHtml(ogTitle);
  const descEsc=escapeHtml(description);
  const workUrlEsc=escapeHtml(workUrl);
  const playerUrlEsc=escapeHtml(playerUrl.toString());
  const imageEsc=escapeHtml(imageUrl);

  const descriptionMeta=description
    ? `\n  <meta name="description" content="${descEsc}">\n  <meta property="og:description" content="${descEsc}">\n  <meta name="twitter:description" content="${descEsc}">`
    : "";

  const imageMeta=imageUrl
    ? `\n  <meta property="og:image" content="${imageEsc}">\n  <meta property="og:image:alt" content="${titleEsc}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${imageEsc}">`
    : `\n  <meta name="twitter:card" content="summary">`;

  const html=`<!doctype html>
<html lang="${escapeHtml(scene?.language||"ja")}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>${titleEsc}</title>
  <link rel="canonical" href="${workUrlEsc}">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${titleEsc}">
  <meta property="og:url" content="${workUrlEsc}">
  <meta property="og:site_name" content="あ□">${descriptionMeta}${imageMeta}

  <meta name="twitter:title" content="${titleEsc}">

  <style>
    html,body{
      margin:0;
      min-height:100%;
      background:#fbfaf5;
      color:#26221e;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    body{
      min-height:100vh;
      display:grid;
      place-items:center;
    }
    main{
      padding:32px;
      text-align:center;
      opacity:.7;
    }
    small{
      letter-spacing:.22em;
    }
    a{
      display:block;
      margin-top:22px;
      color:inherit;
    }
  </style>

  <script>
    location.replace(${JSON.stringify(playerUrl.toString())});
  </script>
</head>
<body>
  <main>
    <small>SCENE PLAYER</small>
    <a href="${playerUrlEsc}">作品を開く</a>
  </main>
</body>
</html>`;

  return new Response(html,{
    headers:{
      ...cors,
      "Content-Type":"text/html; charset=utf-8",
      "Cache-Control":"no-cache, no-store, must-revalidate",
      "X-Robots-Tag":"index, follow"
    }
  });
}

function composeOgTitle(workTitle,episode,episodeTitle){
  const detail=[episode,episodeTitle].filter(Boolean).join(" ");
  if(!detail)return workTitle;
  return `${workTitle}｜${detail}`;
}

function resolvePublicAssetUrl(src,origin){
  const value=cleanText(src);
  if(!value)return"";
  if(/^https?:\/\//i.test(value))return value;
  if(/^blob:/i.test(value)||/^data:/i.test(value))return"";
  if(value.startsWith("/"))return `${origin}${value}`;
  if(value.startsWith("assets/")){
    return `${origin}/asset/${encodeURIComponent(value.slice("assets/".length))}`;
  }
  return `${origin}/asset/${encodeURIComponent(value)}`;
}

function cleanText(value){
  return String(value??"").replace(/\s+/g," ").trim();
}

function escapeHtml(value){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}


// ------------------------------------------------------------
// Gone / unpublished page
// ------------------------------------------------------------

function gone(r,cors,status,ja,api){
  if(isNav(r)){
    return new Response(
      `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Scene Player</title>
<style>
  html,body{
    margin:0;
    min-height:100%;
    background:#0d1117;
    color:#eee;
    font-family:system-ui;
  }
  body{
    min-height:100vh;
    display:grid;
    place-items:center;
  }
  main{
    text-align:center;
    padding:32px;
  }
  small{
    letter-spacing:.25em;
    opacity:.45;
  }
  p{
    margin-top:24px;
    line-height:1.9;
    opacity:.8;
  }
</style>
<main>
  <small>SCENE PLAYER</small>
  <p>${escapeHtml(ja)}</p>
</main>`,
      {
        status,
        headers:{
          ...cors,
          "Content-Type":"text/html; charset=utf-8",
          "Cache-Control":"no-store"
        }
      }
    );
  }

  return Response.json(
    {ok:false,error:api},
    {status,headers:cors}
  );
}


// ------------------------------------------------------------
// Asset extension
// ------------------------------------------------------------

function getExtension(ct,n=""){
  const x=n.split(".").pop()?.toLowerCase();

  if(
    x &&
    x!==n.toLowerCase() &&
    /^[a-z0-9]{1,8}$/.test(x)
  ){
    return x;
  }

  return ({
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/webp":"webp",
    "image/gif":"gif",
    "image/avif":"avif",
    "audio/mpeg":"mp3",
    "audio/mp3":"mp3",
    "audio/wav":"wav",
    "audio/x-wav":"wav",
    "audio/ogg":"ogg",
    "audio/mp4":"m4a",
    "audio/aac":"aac",
    "video/mp4":"mp4",
    "video/webm":"webm"
  })[
    ct.split(";")[0].trim().toLowerCase()
  ]||"";
}
