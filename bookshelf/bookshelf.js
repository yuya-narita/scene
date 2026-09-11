(()=>{
'use strict';
const DB_NAME='ahako-local-bookshelf';
const DB_VERSION=2;
const WORKS='works';
const READER_BOOKS='readerBooks';
const HANDOFF='handoff';
const API_BASE='https://scene-studio-api.a-hako.workers.dev';
const td=new TextDecoder('utf-8');
const te=new TextEncoder();
const $=s=>document.querySelector(s);
let currentWorkId='';
const SHELF_TAB_KEY='ahako:bookshelf:last-tab';
const SHELF_ORDER_KEYS={owned:'ahako:bookshelf:order:owned',created:'ahako:bookshelf:order:created'};
const SHELF_ARCHIVE_KEYS={owned:'ahako:bookshelf:archive:owned',created:'ahako:bookshelf:archive:created'};
const MOBILE_COLUMNS_KEY='ahako:bookshelf:mobile-columns';
const SHELF_SCROLL_KEYS={owned:'ahako:bookshelf:scroll:owned',created:'ahako:bookshelf:scroll:created',official:'ahako:bookshelf:scroll:official'};
let currentShelfTab=null;
let shelfCounts={owned:0,created:0};
let coverUrls=[];
let currentJourneyData=null;
let currentJourneyTitle='';
let activeBooks=[];
let activeArchivedBooks=[];
let suppressBookClick=false;
let draggingBookId='';
let desktopReorderTarget='';
let touchReorderInstalled=false;
let touchBookReordering=false;
let archiveDockOpen=false;
let mobileShelfColumns=loadMobileColumns();
let pinchGesture=null;
let shelfDataCache={owned:[],created:[]};
const insightsCache=new Map();
const copyJourneyCache=new Map();
let officialShelfItems=[];
let officialShelfLoaded=false;
const OFFICIAL_READER_ID_KEY='ahako:official-reader-id';
let shelfScrollLockY=0;

function shelfScrollShouldLock(){
  return !!($('#bookshelfMenu')?.open||$('#detailDialog')?.open||$('#archiveDialog')?.open||$('#deleteArchiveDialog')?.open);
}
function syncShelfScrollLock(){
  const body=document.body;if(!body)return;
  const shouldLock=shelfScrollShouldLock();
  const locked=body.classList.contains('bookshelf-scroll-locked');
  if(shouldLock&&!locked){
    shelfScrollLockY=window.scrollY||window.pageYOffset||0;
    body.style.top=`-${shelfScrollLockY}px`;
    body.classList.add('bookshelf-scroll-locked');
    return;
  }
  if(!shouldLock&&locked){
    const restoreY=shelfScrollLockY;
    body.classList.remove('bookshelf-scroll-locked');
    body.style.top='';
    shelfScrollLockY=0;
    window.scrollTo(0,restoreY);
  }
}

function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(WORKS))db.createObjectStore(WORKS,{keyPath:'workId'});if(!db.objectStoreNames.contains(READER_BOOKS))db.createObjectStore(READER_BOOKS,{keyPath:'copyId'});if(!db.objectStoreNames.contains(HANDOFF))db.createObjectStore(HANDOFF,{keyPath:'key'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function tx(store,mode,fn){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(store,mode);const s=t.objectStore(store);let out;try{out=fn(s);}catch(e){db.close();reject(e);return;}t.oncomplete=()=>{db.close();resolve(out)};t.onerror=()=>{db.close();reject(t.error)};});}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function getAllWorks(){const db=await openDb();try{return await request(db.transaction(WORKS,'readonly').objectStore(WORKS).getAll());}finally{db.close();}}
async function putWork(rec){const db=await openDb();try{await request(db.transaction(WORKS,'readwrite').objectStore(WORKS).put(rec));}finally{db.close();}}
async function getWork(id){const db=await openDb();try{return await request(db.transaction(WORKS,'readonly').objectStore(WORKS).get(id));}finally{db.close();}}
async function deleteWork(id){const db=await openDb();try{await request(db.transaction(WORKS,'readwrite').objectStore(WORKS).delete(id));}finally{db.close();}}
async function getAllReaderBooks(){const db=await openDb();try{return await request(db.transaction(READER_BOOKS,'readonly').objectStore(READER_BOOKS).getAll());}finally{db.close();}}
async function putReaderBook(rec){const db=await openDb();try{await request(db.transaction(READER_BOOKS,'readwrite').objectStore(READER_BOOKS).put(rec));}finally{db.close();}}
async function getReaderBook(id){const db=await openDb();try{return await request(db.transaction(READER_BOOKS,'readonly').objectStore(READER_BOOKS).get(id));}finally{db.close();}}
async function deleteReaderBook(id){const db=await openDb();try{await request(db.transaction(READER_BOOKS,'readwrite').objectStore(READER_BOOKS).delete(id));}finally{db.close();}}
async function setHandoff(workId){const db=await openDb();try{await request(db.transaction(HANDOFF,'readwrite').objectStore(HANDOFF).put({key:'studio',workId,createdAt:new Date().toISOString()}));}finally{db.close();}}

async function inflateRaw(bytes){if(typeof DecompressionStream!=='function')throw new Error('このブラウザでは圧縮.sceneを展開できません。');const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return new Uint8Array(await new Response(stream).arrayBuffer());}
async function readZipEntries(file){const bytes=new Uint8Array(await file.arrayBuffer());const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const out=new Map();let p=0;while(p+4<=bytes.length){const sig=view.getUint32(p,true);if(sig===0x04034b50){if(p+30>bytes.length)throw new Error('ZIP header error');const flags=view.getUint16(p+6,true),method=view.getUint16(p+8,true),compSize=view.getUint32(p+18,true),uncompSize=view.getUint32(p+22,true),nameLen=view.getUint16(p+26,true),extraLen=view.getUint16(p+28,true);if(flags&8)throw new Error('このZIP形式には未対応です。');const ns=p+30,ds=ns+nameLen+extraLen,de=ds+compSize;if(de>bytes.length)throw new Error('ZIP overflow');const name=td.decode(bytes.slice(ns,ns+nameLen));let data=bytes.slice(ds,de);if(method===8)data=await inflateRaw(data);else if(method!==0)throw new Error('未対応のZIP圧縮方式です。');if(uncompSize&&data.length!==uncompSize)throw new Error('ZIP size error');if(name&&!name.endsWith('/'))out.set(name,data);p=de;continue;}if(sig===0x02014b50||sig===0x06054b50)break;p++;}if(!out.size)throw new Error('scene packageを読めませんでした。');return out;}
function mime(name){const n=String(name).toLowerCase();if(/\.jpe?g$/.test(n))return'image/jpeg';if(/\.png$/.test(n))return'image/png';if(/\.webp$/.test(n))return'image/webp';if(/\.gif$/.test(n))return'image/gif';return'application/octet-stream';}
function parseJson(bytes){return JSON.parse(td.decode(bytes).replace(/^\uFEFF/,''));}
async function inspectMaster(file){const entries=await readZipEntries(file);const sceneBytes=entries.get('scene.json');if(!sceneBytes)throw new Error('scene.json がありません。');const doc=parseJson(sceneBytes);const manifest=entries.get('manifest.json')?parseJson(entries.get('manifest.json')):{};const role=String(manifest.packageRole||doc?.package?.role||'').toLowerCase();if(role==='distribution')throw new Error('これは配布版です。本棚には作者の Master .scene を追加してください。');const workId=String(doc?.studio?.identity?.workId||doc?.workId||'').trim();if(!workId)throw new Error('Master の workId を確認できません。');if(!doc?.studio?.identity&&!entries.has('studio-state.json'))throw new Error('Master .scene と確認できないため追加を止めました。');let coverBlob=null;const coverPath=String(doc?.cover?.src||manifest?.cover?.image||'').replace(/^\.\//,'');if(coverPath&&entries.has(coverPath))coverBlob=new Blob([entries.get(coverPath)],{type:mime(coverPath)});return{workId,title:String(doc.title||manifest.title||'Untitled'),subtitle:String(doc?.metadata?.subtitle||doc?.subtitle||manifest?.subtitle||''),description:String(doc?.metadata?.description||doc?.description||manifest?.description||''),seriesTitle:String(doc?.metadata?.seriesTitle||manifest?.series?.title||''),episode:String(doc?.metadata?.episode||manifest?.series?.episode||''),episodeTitle:String(doc?.metadata?.episodeTitle||manifest?.episodeTitle||''),author:String(doc.author||manifest.author||''),sceneCount:Array.isArray(doc.scenes)?doc.scenes.length:0,revision:Number(doc?.studio?.identity?.revision||0)||0,masterCreatedAt:String(doc?.studio?.identity?.createdAt||''),coverPresentation:{fontFamily:String(doc?.cover?.fontFamily||''),styles:doc?.cover?.styles||{},visibility:doc?.cover?.visibility||{}},coverBlob,blob:new Blob([await file.arrayBuffer()],{type:'application/octet-stream'})};}
async function addMaster(file,{silent=false}={}){const info=await inspectMaster(file);const old=await getWork(info.workId);const now=new Date().toISOString();await putWork({...info,fileName:file.name||`${info.title}.scene`,addedAt:old?.addedAt||now,updatedAt:now});if(!silent)toast(old?'同じ作品のMasterを更新しました。':'Masterを本棚に追加しました。');return info.workId;}
async function inspectDistribution(file){const entries=await readZipEntries(file);const sceneBytes=entries.get('scene.json');if(!sceneBytes)throw new Error('scene.json がありません。');const doc=parseJson(sceneBytes);const manifest=entries.get('manifest.json')?parseJson(entries.get('manifest.json')):{};const role=String(manifest.packageRole||doc?.package?.role||'').toLowerCase();if(role!=='distribution')throw new Error('これは Distribution .scene ではありません。');const copyId=String(doc?.distribution?.copyId||manifest?.copyId||'').trim();const workId=String(doc?.distribution?.workId||manifest?.workId||doc?.workId||'').trim();const editionId=String(doc?.edition?.editionId||manifest?.editionId||'').trim();if(!/^copy_[a-f0-9]{32}$/i.test(copyId))throw new Error('Distribution の copyId を確認できません。');if(!/^[A-Za-z0-9_-]{12,80}$/.test(workId))throw new Error('Distribution の workId を確認できません。');let coverBlob=null;const coverPath=String(doc?.cover?.src||manifest?.cover?.image||'').replace(/^\.\//,'');if(coverPath&&entries.has(coverPath))coverBlob=new Blob([entries.get(coverPath)],{type:mime(coverPath)});const coverUrl=/^https?:\/\//i.test(String(doc?.cover?.src||''))?String(doc.cover.src):'';return{role:'distribution',copyId,workId,editionId,title:String(doc.title||manifest.title||'Untitled'),subtitle:String(doc?.metadata?.subtitle||doc?.subtitle||manifest?.subtitle||''),description:String(doc?.metadata?.description||doc?.description||manifest?.description||''),seriesTitle:String(doc?.metadata?.seriesTitle||manifest?.series?.title||''),episode:String(doc?.metadata?.episode||manifest?.series?.episode||''),episodeTitle:String(doc?.metadata?.episodeTitle||manifest?.episodeTitle||''),author:String(doc.author||manifest.author||''),sceneCount:Array.isArray(doc.scenes)?doc.scenes.length:0,relayEnabled:doc?.sharing?.relay?.enabled!==false,issuedAt:String(doc?.distribution?.issuedAt||doc?.edition?.issuedAt||''),coverPresentation:{fontFamily:String(doc?.cover?.fontFamily||''),styles:doc?.cover?.styles||{},visibility:doc?.cover?.visibility||{}},coverBlob,coverUrl,blob:new Blob([await file.arrayBuffer()],{type:'application/octet-stream'})};}
async function addDistribution(file,{silent=false}={}){const info=await inspectDistribution(file);const old=await getReaderBook(info.copyId);const now=new Date().toISOString();await putReaderBook({...info,fileName:file.name||`${info.title}_distribution.scene`,addedAt:old?.addedAt||now,updatedAt:now});if(!old){const order=readIdList(SHELF_ORDER_KEYS.owned).filter(id=>id!==info.copyId);writeIdList(SHELF_ORDER_KEYS.owned,[info.copyId,...order]);}if(!silent)toast(old?'同じ一冊を更新しました。':'自分の一冊を本棚に追加しました。');return info.copyId;}


async function hydrateStoredBookMetadata(w){
  if(!w?.blob||w.shelfMetaVersion===3)return w;
  try{
    const entries=await readZipEntries(w.blob);
    const sceneBytes=entries.get('scene.json');if(!sceneBytes)return w;
    const doc=parseJson(sceneBytes);
    const manifest=entries.get('manifest.json')?parseJson(entries.get('manifest.json')):{};
    const next={...w,
      subtitle:String(doc?.metadata?.subtitle||doc?.subtitle||manifest?.subtitle||w.subtitle||''),
      description:String(doc?.metadata?.description||doc?.description||manifest?.description||w.description||''),
      seriesTitle:String(doc?.metadata?.seriesTitle||manifest?.series?.title||w.seriesTitle||''),
      episode:String(doc?.metadata?.episode||manifest?.series?.episode||w.episode||''),
      episodeTitle:String(doc?.metadata?.episodeTitle||manifest?.episodeTitle||w.episodeTitle||''),
      coverPresentation:{fontFamily:String(doc?.cover?.fontFamily||''),styles:doc?.cover?.styles||{},visibility:doc?.cover?.visibility||{}},
      shelfMetaVersion:3
    };
    if(w.role==='distribution'||w.copyId)await putReaderBook(next);else await putWork(next);
    return next;
  }catch(error){console.warn('bookshelf metadata hydrate skipped',error);return w;}
}

function validBookshelfClaimToken(v){return /^[a-f0-9]{48}$/i.test(String(v||''));}
const BOOKSHELF_CLAIM_SOURCE_SESSION='ahako:bookshelf:claim-source';
const BOOKSHELF_CLAIM_RETURN_PREFIX='ahako:bookshelf:claim-return:';
function validBookshelfHandoffId(v){return /^handoff_[a-f0-9]{24}$/i.test(String(v||''));}
function bookshelfClaimTokenFromLocation(){
  try{return String(new URL(location.href).searchParams.get('claim')||'').trim();}catch(_){return '';}
}
function bookshelfHandoffIdFromLocation(){
  try{return String(new URL(location.href).searchParams.get('handoff')||'').trim();}catch(_){return '';}
}
function sameClaimSourceContext(){
  const token=bookshelfClaimTokenFromLocation();
  const handoffId=bookshelfHandoffIdFromLocation();
  if(!validBookshelfClaimToken(token)||!validBookshelfHandoffId(handoffId))return false;
  try{return sessionStorage.getItem(BOOKSHELF_CLAIM_SOURCE_SESSION)===`${handoffId}:${token}`;}catch(_){return false;}
}
function clearClaimSourceMarker(){
  try{sessionStorage.removeItem(BOOKSHELF_CLAIM_SOURCE_SESSION);}catch(_){}
}
function restoreClaimSourcePage(){
  const handoffId=bookshelfHandoffIdFromLocation();
  if(!validBookshelfHandoffId(handoffId))return false;
  try{
    const key=`${BOOKSHELF_CLAIM_RETURN_PREFIX}${handoffId}`;
    const raw=String(sessionStorage.getItem(key)||'').trim();
    if(!raw)return false;
    const target=new URL(raw,location.href);
    if(target.origin!==location.origin)return false;
    sessionStorage.removeItem(key);
    location.replace(target.href);
    return true;
  }catch(_){return false;}
}
function showClaimHandoff(){
  document.body.classList.add('x-claim-handoff-active');
  let panel=document.getElementById('xClaimHandoff');
  if(!panel){
    panel=document.createElement('section');
    panel.id='xClaimHandoff';
    panel.className='x-claim-handoff';
    panel.setAttribute('role','status');
    panel.innerHTML=`<div class="x-claim-handoff-card">
      <p class="eyebrow">MY COPY</p>
      <h1>Safariで受け取る</h1>
      <div class="x-claim-handoff-guide">
        <strong>Safariへ移動して、この一冊を受け取ります。</strong>
        <span>まずは下のボタンで直接Safariを開けるか試します。</span>
      </div>
      <button type="button" class="claim-open-safari" data-claim-open-safari>Safariで受け取る（実験）</button>
      <button type="button" class="claim-current-browser" data-claim-current>Safariで開いています → 受け取る</button>
      <p class="claim-experiment-note">開かなければ、右下のSafariボタンから開けば従来どおり受け取れます。</p>
    </div>`;
    document.body.appendChild(panel);
  }
  return true;
}
function safeClaimFileBase(v){return String(v||'book').replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,' ').trim().slice(0,80)||'book';}
async function distributionFileFromClaimScene(scene){
  const copyId=String(scene?.distribution?.copyId||'').trim();
  const workId=String(scene?.distribution?.workId||scene?.workId||'').trim();
  const editionId=String(scene?.edition?.editionId||'').trim();
  if(!/^copy_[a-f0-9]{32}$/i.test(copyId)||!/^[A-Za-z0-9_-]{12,80}$/.test(workId)||!/^edition_[a-f0-9]{32}$/i.test(editionId))throw new Error('受け取った一冊を確認できませんでした。');
  const manifest={
    package:'scene-package',packageVersion:'1.0',entry:'scene.json',packageRole:'distribution',
    workId,editionId,copyId,
    issuedAt:String(scene?.distribution?.issuedAt||scene?.edition?.issuedAt||new Date().toISOString()),
    relayEnabled:scene?.sharing?.relay?.enabled!==false,
    title:String(scene?.title||'Untitled'),author:String(scene?.author||'')
  };
  const blob=await makeStoreZip([
    {name:'scene.json',bytes:te.encode(JSON.stringify(scene,null,2))},
    {name:'manifest.json',bytes:te.encode(JSON.stringify(manifest,null,2))}
  ]);
  return new File([blob],`${safeClaimFileBase(scene?.title||'book')}_distribution.scene`,{type:'application/octet-stream'});
}
async function importBookshelfClaimFromLocation(){
  let u;try{u=new URL(location.href);}catch(_){return false;}
  const token=String(u.searchParams.get('claim')||'').trim();
  if(!token)return false;
  // Remove LINE's external-browser hint and the bearer token from visible URL
  // as soon as the page owns a copy of it in memory.
  u.searchParams.delete('claim');u.searchParams.delete('handoff');u.searchParams.delete('openExternalBrowser');
  const cleanUrl=u.pathname+(u.search||'')+(u.hash||'');
  if(!validBookshelfClaimToken(token)){history.replaceState(null,'',cleanUrl);throw new Error('本棚への受取リンクを確認できませんでした。');}
  const response=await fetch(`${API_BASE}/bookshelf-claim`,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({token})});
  const payload=await response.json().catch(()=>null);
  if(!response.ok||!payload?.ok||!payload?.scene){
    history.replaceState(null,'',cleanUrl);
    const code=String(payload?.code||'');
    if(code==='BOOKSHELF_CLAIM_EXPIRED')throw new Error('本棚への受取リンクの有効期限が切れました。もう一度「自分の一冊を受け取る」から開いてください。');
    if(code==='BOOKSHELF_CLAIM_NOT_FOUND')throw new Error('この本棚への受取リンクは、すでに使われたか見つかりませんでした。');
    throw new Error(String(payload?.error||'本棚へ一冊を受け取れませんでした。'));
  }
  const file=await distributionFileFromClaimScene(payload.scene);
  await addDistribution(file,{silent:true});
  applyShelfTab('owned');
  history.replaceState(null,'',cleanUrl);
  try{
    await fetch(`${API_BASE}/bookshelf-claim/consume`,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',keepalive:true,body:JSON.stringify({token})});
  }catch(_){}
  try{
    fetch(`${API_BASE}/bookshelf-event`,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',keepalive:true,body:JSON.stringify({event:'own_copy_saved',workId:String(payload.scene?.workId||payload.scene?.distribution?.workId||''),copyId:String(payload.scene?.distribution?.copyId||'')})}).catch(()=>{});
  }catch(_){}
  return true;
}


function clampMobileColumns(value){return Math.max(2,Math.min(4,Number(value)||2));}
function loadMobileColumns(){
  try{return clampMobileColumns(localStorage.getItem(MOBILE_COLUMNS_KEY)||2);}catch(_){return 2;}
}
function applyMobileColumns(value,{announce=false}={}){
  mobileShelfColumns=clampMobileColumns(value);
  const grid=$('#grid');
  if(grid)grid.dataset.mobileColumns=String(mobileShelfColumns);
  try{localStorage.setItem(MOBILE_COLUMNS_KEY,String(mobileShelfColumns));}catch(_){}
  if(announce)toast(`${mobileShelfColumns}列表示`);
}
function touchDistance(touches){
  if(!touches||touches.length<2)return 0;
  const a=touches[0],b=touches[1];return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
}
function installShelfPinch(){
  if(document.documentElement.dataset.shelfPinchInstalled==='1')return;
  document.documentElement.dataset.shelfPinchInstalled='1';
  applyMobileColumns(loadMobileColumns());
  const mobile=()=>matchMedia('(max-width:680px) and (pointer:coarse)').matches;
  const blockedTarget=target=>!!target?.closest?.('dialog[open]');
  window.addEventListener('touchstart',e=>{
    if(!mobile()||currentShelfTab==='official'||e.touches.length!==2||blockedTarget(e.target))return;
    const d=touchDistance(e.touches);if(!d)return;
    pinchGesture={startDistance:d,startColumns:mobileShelfColumns,lastColumns:mobileShelfColumns};
    // V63.23.1: two-finger shelf zoom works anywhere in the page/viewport,
    // including empty shelf space. It is never treated as book reorder.
    e.preventDefault();
  },{passive:false});
  window.addEventListener('touchmove',e=>{
    if(!pinchGesture||e.touches.length!==2)return;
    e.preventDefault();
    const d=touchDistance(e.touches);if(!d)return;
    const ratio=d/pinchGesture.startDistance;
    let next=pinchGesture.startColumns;
    // Pinch inward = zoom the shelf out (more books per row).
    if(ratio<0.68)next=pinchGesture.startColumns+2;
    else if(ratio<0.86)next=pinchGesture.startColumns+1;
    else if(ratio>1.47)next=pinchGesture.startColumns-2;
    else if(ratio>1.16)next=pinchGesture.startColumns-1;
    next=clampMobileColumns(next);
    if(next!==pinchGesture.lastColumns){pinchGesture.lastColumns=next;applyMobileColumns(next);if(navigator.vibrate)navigator.vibrate(10);}
  },{passive:false});
  const finish=()=>{
    if(!pinchGesture)return;
    const changed=pinchGesture.lastColumns!==pinchGesture.startColumns;
    const finalColumns=pinchGesture.lastColumns;pinchGesture=null;
    if(changed)toast(`${finalColumns}列表示`);
  };
  window.addEventListener('touchend',finish,{passive:true});
  window.addEventListener('touchcancel',finish,{passive:true});
  // iOS Safari may emit gesture events in addition to touch events.
  window.addEventListener('gesturestart',e=>{if(mobile()&&currentShelfTab!=='official'&&!blockedTarget(e.target))e.preventDefault();},{passive:false});
  window.addEventListener('gesturechange',e=>{if(mobile()&&pinchGesture)e.preventDefault();},{passive:false});
}

function readIdList(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'&&x):[];}catch(_){return[];}}
function writeIdList(key,list){try{localStorage.setItem(key,JSON.stringify([...new Set(list.filter(Boolean))]));}catch(_){}}
function shelfIdOf(w){return w?.role==='distribution'?String(w.copyId||''):String(w.workId||'');}
function orderedShelfBooks(books,tab){
  const archiveKey=SHELF_ARCHIVE_KEYS[tab],orderKey=SHELF_ORDER_KEYS[tab];
  const archived=new Set(readIdList(archiveKey));
  const visible=books.filter(w=>!archived.has(shelfIdOf(w)));
  const archivedBooks=books.filter(w=>archived.has(shelfIdOf(w)));
  const order=readIdList(orderKey),rank=new Map(order.map((id,i)=>[id,i]));
  visible.sort((a,b)=>{
    const ai=rank.has(shelfIdOf(a))?rank.get(shelfIdOf(a)):Number.MAX_SAFE_INTEGER;
    const bi=rank.has(shelfIdOf(b))?rank.get(shelfIdOf(b)):Number.MAX_SAFE_INTEGER;
    return ai-bi||String(b.updatedAt||b.addedAt||'').localeCompare(String(a.updatedAt||a.addedAt||''));
  });
  archivedBooks.sort((a,b)=>String(b.updatedAt||b.addedAt||'').localeCompare(String(a.updatedAt||a.addedAt||'')));
  return {visible,archived:archivedBooks};
}
function persistVisibleOrderFromDom(tab=currentShelfTab){
  if(!SHELF_ORDER_KEYS[tab])return;
  const ids=Array.from(document.querySelectorAll('#grid .book')).map(el=>el.dataset.id).filter(Boolean);
  writeIdList(SHELF_ORDER_KEYS[tab],ids);
}
function archiveBookId(tab,id){
  if(!SHELF_ARCHIVE_KEYS[tab]||!id)return;
  const archived=readIdList(SHELF_ARCHIVE_KEYS[tab]);
  if(!archived.includes(id))archived.push(id);
  writeIdList(SHELF_ARCHIVE_KEYS[tab],archived);
  writeIdList(SHELF_ORDER_KEYS[tab],readIdList(SHELF_ORDER_KEYS[tab]).filter(x=>x!==id));
}
function restoreBookId(tab,id){
  if(!SHELF_ARCHIVE_KEYS[tab]||!id)return;
  writeIdList(SHELF_ARCHIVE_KEYS[tab],readIdList(SHELF_ARCHIVE_KEYS[tab]).filter(x=>x!==id));
  const order=readIdList(SHELF_ORDER_KEYS[tab]);if(!order.includes(id))order.push(id);writeIdList(SHELF_ORDER_KEYS[tab],order);
}
async function permanentlyDeleteArchivedBook(tab,id){
  if(!id||!SHELF_ARCHIVE_KEYS[tab])return;
  if(tab==='owned')await deleteReaderBook(id);
  else if(tab==='created')await deleteWork(id);
  writeIdList(SHELF_ARCHIVE_KEYS[tab],readIdList(SHELF_ARCHIVE_KEYS[tab]).filter(x=>x!==id));
  writeIdList(SHELF_ORDER_KEYS[tab],readIdList(SHELF_ORDER_KEYS[tab]).filter(x=>x!==id));
}
function compactSeriesLine(w){
  const parts=[String(w.seriesTitle||'').trim(),String(w.episode||'').trim(),String(w.episodeTitle||'').trim()].filter(Boolean);
  return parts.join(' · ');
}
function coverTextStyle(w,key){
  const p=w?.coverPresentation||{},st=p.styles?.[key]||{};
  const out=[];
  if(st.color)out.push(`color:${String(st.color).replace(/[;<>]/g,'')}`);
  const fam=String(st.fontFamily||p.fontFamily||'').toLowerCase();
  if(fam==='sans')out.push('font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Yu Gothic",sans-serif');
  else if(fam==='mono')out.push('font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace');
  else if(fam==='serif')out.push('font-family:"Yu Mincho","Hiragino Mincho ProN",serif');
  return out.length?` style="${out.join(';')}"`:'';
}
function authoredCoverOverlayHtml(w){
  const v=w?.coverPresentation?.visibility||{};
  const fields=[];
  if(v.title!==false&&String(w.title||'').trim())fields.push(`<strong class="shelf-cover-title"${coverTextStyle(w,'title')}>${escapeHtml(w.title)}</strong>`);
  if(v.subtitle!==false&&String(w.subtitle||'').trim())fields.push(`<span class="shelf-cover-subtitle"${coverTextStyle(w,'subtitle')}>${escapeHtml(w.subtitle)}</span>`);
  if(v.author!==false&&String(w.author||'').trim())fields.push(`<small class="shelf-cover-author"${coverTextStyle(w,'author')}>${escapeHtml(w.author)}</small>`);
  const ep=v.episode!==false?String(w.episode||'').trim():'';
  const epTitle=v.episodeTitle!==false?String(w.episodeTitle||'').trim():'';
  if(ep||epTitle)fields.push(`<span class="shelf-cover-episode-line">${ep?`<span class="shelf-cover-episode">${escapeHtml(ep)}</span>`:''}${ep&&epTitle?'<span class="shelf-cover-episode-sep">　</span>':''}${epTitle?`<span class="shelf-cover-episode-title">${escapeHtml(epTitle)}</span>`:''}</span>`);
  return fields.length?`<span class="shelf-cover-authored">${fields.join('')}</span>`:'';
}
function bookCardHtml(w,{archived=false}={}){
  const badge=w.role==='distribution'?'MY COPY':'MASTER',id=shelfIdOf(w);
  const image=w.coverBlob?(()=>{const u=URL.createObjectURL(w.coverBlob);coverUrls.push(u);return`<img src="${u}" alt="" draggable="false">`})():(w.coverUrl?`<img src="${escapeHtml(w.coverUrl)}" alt="" draggable="false">`:`<div class="cover-fallback">□</div>`);
  if(archived)return`<label class="archive-item" data-role="${w.role}" data-id="${escapeHtml(id)}"><input class="archive-check" type="checkbox" aria-label="${escapeHtml(w.title)}を選択"><div class="archive-thumb">${image}</div><div class="archive-item-copy"><strong>${escapeHtml(w.title)}</strong><span>${escapeHtml(w.author||'作者未設定')} · ${w.sceneCount||0} Scene</span></div></label>`;
  const episode=String(w.episode||'').trim();
  const episodeTitle=String(w.episodeTitle||'').trim();
  return`<button class="book" data-role="${w.role}" data-id="${escapeHtml(id)}" draggable="true" type="button"><div class="cover">${image}${authoredCoverOverlayHtml(w)}<span class="badge ${w.role==='distribution'?'reader-badge':''}">${badge}</span></div><div class="book-meta"><h3>${escapeHtml(w.title)}</h3><div class="book-work-info">${episode?`<p class="book-series">${escapeHtml(episode)}</p>`:''}${episodeTitle?`<p class="book-subtitle">${escapeHtml(episodeTitle)}</p>`:''}</div><p class="book-facts">${escapeHtml(w.author||'作者未設定')}</p></div></button>`;
}

function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtDate(v){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);}
function coverHtml(w,cls=''){if(w.coverBlob){const u=URL.createObjectURL(w.coverBlob);coverUrls.push(u);return`<div class="${cls}"><img src="${u}" alt=""></div>`;}return`<div class="${cls}"><div class="cover-fallback">□</div></div>`;}
function shelfViewportTop(){
  const chrome=$('#shelfChrome');
  return Math.max(0,Math.round(chrome?.getBoundingClientRect?.().bottom||0));
}
function shelfMeaningfulMaxScroll(el=currentShelfBodyElement()){
  if(!el||el.hidden)return 0;
  const rect=el.getBoundingClientRect();
  const docTop=(window.scrollY||window.pageYOffset||0)+rect.top;
  // Only the actual shelf body should create vertical travel. Fixed chrome,
  // main bottom padding and Safari's 100vh bookkeeping must not create a
  // phantom few-dozen-pixel scroll range on short shelves.
  const bottomGap=18;
  const max=Math.max(0,docTop+rect.height+bottomGap-window.innerHeight);
  return max<6?0:Math.round(max);
}
function clampShelfScrollY(y,el=currentShelfBodyElement()){
  return Math.min(Math.max(0,Math.round(Number(y)||0)),shelfMeaningfulMaxScroll(el));
}
function saveShelfScroll(tab=currentShelfTab,y=window.scrollY||window.pageYOffset||0){
  const key=SHELF_SCROLL_KEYS[tab];if(!key)return;
  const value=tab===currentShelfTab?clampShelfScrollY(y):Math.max(0,Math.round(Number(y)||0));
  try{localStorage.setItem(key,String(value));}catch(_){}
}
function loadShelfScroll(tab){
  const key=SHELF_SCROLL_KEYS[tab];if(!key)return 0;
  try{return Math.max(0,Number(localStorage.getItem(key)||0)||0);}catch(_){return 0;}
}
function restoreShelfScroll(tab){
  const savedY=loadShelfScroll(tab);
  const body=document.body;
  // Keep the root in its normal scrolling mode while Safari settles a document
  // height change. Switching to overflow:hidden here can resurrect the old
  // Visual Viewport offset on the next frame.
  body?.classList.remove('shelf-no-vertical-scroll');
  body?.classList.add('shelf-scroll-restoring');
  return new Promise(resolve=>requestAnimationFrame(()=>{
    // Clamp to the shelf body's real travel, not document.scrollHeight. On iOS
    // a short shelf can otherwise inherit a bogus scroll range from 100vh/main
    // padding and then carry that offset into the next manga-viewer page.
    const y=clampShelfScrollY(savedY);
    try{localStorage.setItem(SHELF_SCROLL_KEYS[tab],String(y));}catch(_){}
    try{window.scrollTo({left:0,top:y,behavior:'instant'});}catch(_){window.scrollTo(0,y);}
    requestAnimationFrame(()=>{
      // iOS may apply scroll anchoring after the first successful scrollTo.
      // Correct once more while the swipe page still covers the live shelf,
      // then reveal only on the following frame.
      const actual=window.scrollY||window.pageYOffset||0;
      const visualOffset=window.visualViewport?.offsetTop||0;
      if(Math.abs(actual-y)>.5||(y===0&&Math.abs(visualOffset)>.5)){
        document.documentElement.scrollTop=y;
        body.scrollTop=y;
        try{window.scrollTo({left:0,top:y,behavior:'instant'});}catch(_){window.scrollTo(0,y);}
      }
      requestAnimationFrame(()=>{
        body?.classList.toggle('shelf-no-vertical-scroll',y===0&&shelfMeaningfulMaxScroll()===0);
        body?.classList.remove('shelf-scroll-restoring');
        resolve();
      });
    });
  }));
}



function officialReaderId(){
  let id='';try{id=String(localStorage.getItem(OFFICIAL_READER_ID_KEY)||'');}catch(_){}
  if(!/^reader_[a-f0-9]{32}$/i.test(id)){
    try{id=`reader_${crypto.randomUUID().replaceAll('-','')}`;}catch(_){const a=new Uint8Array(16);crypto.getRandomValues(a);id=`reader_${[...a].map(v=>v.toString(16).padStart(2,'0')).join('')}`;}
    try{localStorage.setItem(OFFICIAL_READER_ID_KEY,id);}catch(_){}
  }
  return id;
}
function officialReadUrl(shelfId){
  if(!/^shelf_[a-f0-9]{24}$/i.test(String(shelfId||'')))return '';
  const u=new URL('../local-player/',location.href);
  u.searchParams.set('officialShelf',String(shelfId));
  return u.href;
}

function officialCardHtml(item,claimed=false){
  const kind=item.kind==='bloom'?'bloom':'seed';
  const label=kind==='bloom'?'🌸 開花':'🌱';
  const remaining=Math.max(0,Number(item.remaining||0));
  const limit=Math.max(1,Number(item.issueLimit||1));
  const sold=remaining<=0;
  const received=!!claimed;
  const subtitle=String(item.subtitle||'').trim();
  const description=String(item.description||'').trim();
  const episode=String(item.episode||'').trim();
  const episodeTitle=String(item.episodeTitle||'').trim();
  const sceneCount=Math.max(0,Number(item.sceneCount||0));
  const cover=item.coverUrl?`<img src="${escapeHtml(item.coverUrl)}" alt="">`:`<div class="official-cover-fallback">あ□</div>`;
  const subtitleHtml=subtitle?`<p class="official-subtitle">${escapeHtml(subtitle)}</p>`:'';
  const episodeHtml=episode?`<p class="official-episode">${escapeHtml(episode)}</p>`:'';
  const episodeTitleHtml=episodeTitle?`<p class="official-episode-title">${escapeHtml(episodeTitle)}</p>`:'';
  const descriptionHtml=description?`<p class="official-description">${escapeHtml(description)}</p>`:'';
  const facts=[item.author||'作者未設定',sceneCount?`${sceneCount} Scene`:'',item.relayEnabled===false?'RELAY OFF':(item.relayEnabled===true?'RELAY ON':'')].filter(Boolean).join(' · ');
  const factsHtml=facts?`<div class="official-facts">${escapeHtml(facts)}</div>`:'';
  return `<article class="official-book-card ${kind}">
    <div class="official-book-cover" data-official-read="${escapeHtml(item.shelfId)}" tabindex="0" role="button" aria-label="${escapeHtml((item.title||'Untitled')+'を読む')}">${cover}<span class="official-kind">${label}</span></div>
    <div class="official-book-copy"><div class="official-book-meta"><h3>${escapeHtml(item.title||'Untitled')}</h3><div class="official-work-info">${subtitleHtml}${episodeHtml}${episodeTitleHtml}${descriptionHtml}</div>${factsHtml}</div><div class="official-book-footer"><strong class="official-remaining">${sold?'すべて旅立ちました':`残り ${remaining} / ${limit}冊`}</strong>
    <div class="official-actions"><button type="button" data-official-claim="${escapeHtml(item.shelfId)}" ${(sold||received)?'disabled':''}>${received?'受け取り済み':(sold?'旅立ちました':'一冊を受け取る')}</button></div></div></div>
  </article>`;
}
async function loadOfficialShelf({force=false}={}){
  if(officialShelfLoaded&&!force)return officialShelfItems;
  const response=await fetch(`${API_BASE}/official-shelf`,{cache:'no-store'});
  const payload=await response.json().catch(()=>null);
  if(!response.ok||!payload?.ok)throw new Error(String(payload?.error||'あ箱の本を読み込めませんでした。'));
  officialShelfItems=Array.isArray(payload.items)?payload.items:[];officialShelfLoaded=true;return officialShelfItems;
}
function bindOfficialShelfInteractions(host=$('#officialBooks')){
  if(!host)return;
  host.querySelectorAll('.official-book-cover[data-official-read]').forEach(cover=>{
    const open=()=>{const href=officialReadUrl(cover.dataset.officialRead);if(href)location.href=href;};
    cover.onclick=open;
    cover.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
  });
  host.querySelectorAll('[data-official-claim]').forEach(button=>button.onclick=e=>{e.stopPropagation();claimOfficialBook(button);});
}
async function renderOfficialShelf({force=true}={}){
  const host=$('#officialBooks');if(!host)return;
  try{
    const items=await loadOfficialShelf({force});
    const owned=await getAllReaderBooks();
    const claimedEditions=new Set(owned.map(book=>`${String(book.workId||'')}::${String(book.editionId||'')}`));
    host.innerHTML=items.length?items.map(item=>officialCardHtml(item,claimedEditions.has(`${String(item.workId||'')}::${String(item.editionId||'')}`))).join(''):`<div class="official-empty"><strong>まだ本はありません。</strong><span>最初の種本が置かれると、ここから一冊ずつ旅立ちます。</span></div>`;
    bindOfficialShelfInteractions(host);
  }catch(e){host.innerHTML=`<div class="official-empty"><strong>棚を読み込めませんでした。</strong><span>${escapeHtml(e?.message||String(e))}</span><button type="button" id="officialRetry">もう一度</button></div>`;$('#officialRetry')?.addEventListener('click',()=>renderOfficialShelf());}
}
async function claimOfficialBook(button){
  if(button.disabled)return;const shelfId=String(button.dataset.officialClaim||'');
  button.disabled=true;const before=button.textContent;button.textContent='受け取っています…';
  try{
    const response=await fetch(`${API_BASE}/official-shelf/claim`,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({shelfId,readerId:officialReaderId()})});
    const payload=await response.json().catch(()=>null);
    if(!response.ok||!payload?.ok||!payload?.scene){const code=String(payload?.code||'');throw new Error(code==='SHELF_SOLD_OUT'?'この種本はすべて旅立ちました。':code==='SHELF_ALREADY_CLAIMED'?'この種本はすでに受け取っています。':String(payload?.error||'一冊を受け取れませんでした。'));}
    const file=await distributionFileFromClaimScene(payload.scene);await addDistribution(file,{silent:true});
    officialShelfLoaded=false;await renderOfficialShelf();toast('あ箱から一冊を受け取りました。');
    setTimeout(()=>switchShelf('owned'),450);
  }catch(e){button.disabled=false;button.textContent=before;toast(e?.message||String(e));}
}

function chooseFirstShelf(){
  const saved=localStorage.getItem(SHELF_TAB_KEY);
  if(['owned','created','official'].includes(saved))return saved;
  if(shelfCounts.created>0&&shelfCounts.owned===0)return 'created';
  return 'owned';
}
function applyShelfTab(tab,{remember=true}={}){
  currentShelfTab=['owned','created','official'].includes(tab)?tab:'owned';
  if(remember)localStorage.setItem(SHELF_TAB_KEY,currentShelfTab);
  document.querySelectorAll('.shelf-tab').forEach(b=>{
    const on=b.dataset.shelf===currentShelfTab;
    b.classList.toggle('is-active',on);
    b.setAttribute('aria-selected',on?'true':'false');
  });
}
async function render({deferCoverRevoke=false,refreshOfficial=true}={}){
  const staleCoverUrls=coverUrls;coverUrls=[];
  if(!deferCoverRevoke)staleCoverUrls.forEach(URL.revokeObjectURL);
  const masters=await Promise.all((await getAllWorks()).map(async w=>({...await hydrateStoredBookMetadata({...w,role:'master'}),role:'master'})));
  const readers=await Promise.all((await getAllReaderBooks()).map(async w=>({...await hydrateStoredBookMetadata({...w,role:'distribution'}),role:'distribution'})));
  shelfCounts={owned:readers.length,created:masters.length};
  shelfDataCache={owned:readers,created:masters};
  if(!currentShelfTab)currentShelfTab=chooseFirstShelf();
  applyShelfTab(currentShelfTab,{remember:false});
  $('#ownedTab').textContent=`もっている本${readers.length?` ${readers.length}`:''}`;
  $('#createdTab').textContent=`つくった本${masters.length?` ${masters.length}`:''}`;
  const official=currentShelfTab==='official';
  const createdShelf=currentShelfTab==='created';
  const source=createdShelf?masters:readers;
  const arranged=official?{visible:[],archived:[]}:orderedShelfBooks(source,currentShelfTab);
  const books=arranged.visible;activeBooks=books;activeArchivedBooks=arranged.archived;
  $('#officialShelf').hidden=!official;
  $('#grid').hidden=official;
  $('#emptyState').hidden=official||books.length>0||arranged.archived.length>0;
  $('#countText').textContent=official?'あ箱の本':`${source.length}冊`;
  const shelfActions=$('#shelfHeadActions'),shelfAdd=$('#shelfAddIconButton'),studioCreate=$('#createStudioIconButton');
  shelfActions.hidden=official;
  if(!official){
    const owned=currentShelfTab==='owned';
    shelfAdd.setAttribute('aria-label',owned?'Distributionを追加':'Masterを追加');
    shelfAdd.title=owned?'Distributionを追加':'Masterを追加';
    shelfAdd.dataset.addRole=owned?'distribution':'master';
    studioCreate.hidden=owned;
  }
  const archiveVisible=!official;
  const archiveDrop=$('#archiveDropZone'),archiveLauncher=$('#archiveLauncher');
  archiveDrop.hidden=!archiveVisible;
  archiveLauncher.hidden=!archiveVisible;
  if(!archiveVisible) setArchiveDock(false);
  $('#archiveCount').textContent=`${arranged.archived.length}冊`;
  $('#archiveLauncherCount').textContent=String(arranged.archived.length);
  if(!official&&!books.length&&!arranged.archived.length){
    const created=currentShelfTab==='created';
    $('#emptyTitle').textContent=created?'まだ、つくった本はありません':'まだ、もっている本はありません';
    $('#emptyCopy').textContent=created?'Master .scene を追加すると、ここから作品を育てられます。':'自分が持っている Distribution .scene を追加すると、ここに並びます。';
    $('#emptyCreateButton').hidden=!created;
    $('#emptyAddButton').hidden=!created;
    $('#emptyDistributionButton').hidden=created;
  }
  $('#grid').innerHTML=official?'':books.map(w=>bookCardHtml(w)).join('');
  if(official)await renderOfficialShelf({force:refreshOfficial});
  // Re-read the persisted density on every render/reload before applying it.
  // This prevents the default 2-column value from briefly/incorrectly winning on Safari reload.
  mobileShelfColumns=loadMobileColumns();
  applyMobileColumns(mobileShelfColumns);
  installShelfPinch();
  bindBookInteractions();
  return staleCoverUrls;
}
async function switchShelf(tab,{deferCoverRevoke=false,refreshOfficial=true}={}){const from=currentShelfTab;if(from)saveShelfScroll(from);applyShelfTab(tab);const stale=await render({deferCoverRevoke,refreshOfficial});await restoreShelfScroll(currentShelfTab);return stale;}

function swipeShelfBodyHtml(tab){
  if(tab==='official'){
    const official=$('#officialShelf');
    return official?official.outerHTML.replace(/ hidden(?:=\"\")?/,''):'';
  }
  const source=tab==='created'?shelfDataCache.created:shelfDataCache.owned;
  const arranged=orderedShelfBooks(source,tab);
  if(arranged.visible.length){
    return `<section class="grid shelf-swipe-grid" data-mobile-columns="${mobileShelfColumns}">${arranged.visible.map(w=>bookCardHtml(w)).join('')}</section>`;
  }
  const created=tab==='created';
  const title=created?'まだ、つくった本はありません':'まだ、もっている本はありません';
  const copy=created?'Master .scene を追加すると、ここから作品を育てられます。':'自分が持っている Distribution .scene を追加すると、ここに並びます。';
  return `<section class="empty shelf-swipe-empty"><div class="empty-mark">□</div><h2>${title}</h2><p>${copy}</p></section>`;
}
function currentShelfBodyElement(){
  if(currentShelfTab==='official')return $('#officialShelf');
  if($('#emptyState')&&!$('#emptyState').hidden)return $('#emptyState');
  return $('#grid');
}
function makeShelfSwipeStage(nextTab,direction){
  const current=currentShelfBodyElement();
  if(!current)return null;
  const chrome=$('#shelfChrome');
  const chromeRect=chrome?.getBoundingClientRect();
  const stageTop=Math.max(0,Math.round(chromeRect?.bottom||current.getBoundingClientRect().top||0));
  const currentRect=current.getBoundingClientRect();
  const currentY=window.scrollY||window.pageYOffset||0;
  const bodyDocTop=currentY+currentRect.top;
  let targetY=loadShelfScroll(nextTab);
  const stage=document.createElement('div');
  stage.className='shelf-swipe-stage';
  stage.style.top=`${stageTop}px`;
  const currentPage=document.createElement('div');
  const nextPage=document.createElement('div');
  currentPage.className='shelf-swipe-page is-current';
  nextPage.className='shelf-swipe-page is-next';
  const currentInner=document.createElement('div');
  const nextInner=document.createElement('div');
  currentInner.className='shelf-swipe-page-inner';
  nextInner.className='shelf-swipe-page-inner';
  // V63.35.24: when leaving the official shelf, do not clone its live DOM.
  // Official cards contain network-backed cover images; cloning them makes iOS Safari
  // create a second image layer and can flash even when the original shelf is already
  // fully visible. Keep the real official shelf as the outgoing page instead.
  const useLiveCurrent=currentShelfTab==='official';
  if(useLiveCurrent){
    // V63.35.26: the official shelf itself remains the outgoing visual.
    // Mark the stage so its own background stays transparent; otherwise the
    // fixed stage paints an opaque cream layer over the live official DOM and
    // WebKit can flash that layer at creation/removal.
    stage.classList.add('uses-live-current');
    currentPage.style.visibility='hidden';
  }else{
    currentInner.append(current.cloneNode(true));
  }
  nextInner.innerHTML=swipeShelfBodyHtml(nextTab);
  // The official snapshot must not retain the live shelf IDs. During landing,
  // restoreShelfScroll() intentionally hides the live #officialShelf for two
  // animation frames. A duplicate ID made that rule hide the foreground swipe
  // snapshot as well, producing a direction-specific flash when swiping into
  // the official tab.
  if(nextTab==='official'){
    nextInner.querySelector('#officialShelf')?.removeAttribute('id');
    nextInner.querySelector('#officialBooks')?.removeAttribute('id');
  }
  currentPage.append(currentInner);nextPage.append(nextInner);
  stage.append(currentPage,nextPage);document.body.append(stage);
  const width=window.innerWidth;
  nextPage.style.transform=`translate3d(${direction==='left'?width:-width}px,0,0)`;
  // Clamp the remembered target position against the *snapshot's* actual body
  // height before it is ever shown. This also heals old saved offsets produced
  // by the previous short-shelf bug (e.g. official shelf remembered at 40px).
  const targetBody=nextInner.firstElementChild;
  const targetViewportHeight=Math.max(0,window.innerHeight-stageTop);
  const targetBodyHeight=Math.max(0,targetBody?.getBoundingClientRect?.().height||0);
  let targetMax=Math.max(0,targetBodyHeight+18-targetViewportHeight);
  if(targetMax<6)targetMax=0;
  targetY=Math.min(targetY,Math.round(targetMax));
  try{localStorage.setItem(SHELF_SCROLL_KEYS[nextTab],String(targetY));}catch(_){}
  // The fixed shelf chrome is outside the moving pages. Each page is therefore
  // positioned inside the same viewport using its own remembered document Y.
  // This prevents a short shelf from inheriting the previous shelf's Y.
  const currentOffset=(bodyDocTop-currentY)-stageTop;
  // V63.35.22: every shelf body now starts after the same shared 10px shell
  // gap. Per-tab margin compensation caused the incoming snapshot to sit
  // slightly low and then jump upward when the real shelf replaced it.
  const targetOffset=(bodyDocTop-targetY)-stageTop;
  currentInner.style.transform=`translate3d(0,${currentOffset}px,0)`;
  nextInner.style.transform=`translate3d(0,${targetOffset}px,0)`;
  return {stage,currentPage,nextPage,width,direction,nextTab,liveCurrent:useLiveCurrent?current:null};
}
function removeShelfSwipeStage(view){
  if(view?.liveCurrent){
    view.liveCurrent.style.transform='';
    view.liveCurrent.style.filter='';
  }
  if(view?.stage?.isConnected)view.stage.remove();
}
function positionShelfSwipeStage(view,dx){
  if(!view)return;
  view.currentPage.style.transform=`translate3d(${dx}px,0,0)`;
  if(view.liveCurrent)view.liveCurrent.style.transform=`translate3d(${dx}px,0,0)`;
  const base=view.direction==='left'?view.width:-view.width;
  view.nextPage.style.transform=`translate3d(${base+dx}px,0,0)`;
  const progress=Math.min(1,Math.abs(dx)/Math.max(1,view.width));
  view.currentPage.style.filter=`brightness(${1-progress*.045})`;
  if(view.liveCurrent)view.liveCurrent.style.filter=`brightness(${1-progress*.045})`;
  view.nextPage.style.boxShadow=view.direction==='left'?'-18px 0 28px rgba(35,28,20,.10)':'18px 0 28px rgba(35,28,20,.10)';
}
async function animateShelfSwipeStage(view,toX,duration=220){
  if(!view)return;
  const from=new DOMMatrixReadOnly(getComputedStyle(view.currentPage).transform).m41||0;
  const base=view.direction==='left'?view.width:-view.width;
  const easing='cubic-bezier(.22,.72,.18,1)';
  const a=view.currentPage.animate([{transform:`translate3d(${from}px,0,0)`},{transform:`translate3d(${toX}px,0,0)`}],{duration,easing,fill:'forwards'});
  const b=view.nextPage.animate([{transform:`translate3d(${base+from}px,0,0)`},{transform:`translate3d(${base+toX}px,0,0)`}],{duration,easing,fill:'forwards'});
  let liveAnimation=null;
  if(view.liveCurrent){
    const liveFrom=new DOMMatrixReadOnly(getComputedStyle(view.liveCurrent).transform).m41||from;
    liveAnimation=view.liveCurrent.animate([{transform:`translate3d(${liveFrom}px,0,0)`},{transform:`translate3d(${toX}px,0,0)`}],{duration,easing,fill:'forwards'});
  }
  await Promise.all([a.finished.catch(()=>{}),b.finished.catch(()=>{}),liveAnimation?.finished?.catch(()=>{})]);
  // Safari can finish the current-page animation a frame before the incoming page.
  // Commit both transforms synchronously so the new tab never shows the old shelf for one frame.
  view.currentPage.style.transform=`translate3d(${toX}px,0,0)`;
  view.nextPage.style.transform=`translate3d(${base+toX}px,0,0)`;
  if(view.liveCurrent)view.liveCurrent.style.transform=`translate3d(${toX}px,0,0)`;
  a.cancel();b.cancel();if(liveAnimation)liveAnimation.cancel();
}

function adoptLocalSwipeSnapshot(view,staleUrls=[]){
  // V63.35.27: the exact grid the user saw during the swipe becomes the live
  // local shelf. V63.35.25 moved only its card children into the pre-existing
  // #grid; that still changed the grid formatting/compositing context at the
  // landing frame and made WebKit re-layout small 3/4-column metadata.
  if(!view||view.nextTab==='official')return staleUrls;
  const snapshotGrid=view.nextPage?.querySelector?.('.shelf-swipe-grid');
  const liveGrid=$('#grid');
  if(!snapshotGrid||!liveGrid)return staleUrls;

  const snapshotBlobUrls=[...snapshotGrid.querySelectorAll('img[src^="blob:"]')].map(img=>img.src);
  const keep=new Set(snapshotBlobUrls);
  const unusedLiveUrls=coverUrls.filter(url=>!keep.has(url));

  // Preserve the already-laid-out grid itself, not only its card children.
  // The move and stage removal happen in the same task, so there is no frame
  // with a missing #grid and no second grid layout root for Safari to adopt.
  snapshotGrid.id='grid';
  snapshotGrid.classList.remove('shelf-swipe-grid');
  snapshotGrid.setAttribute('aria-live',liveGrid.getAttribute('aria-live')||'polite');
  snapshotGrid.hidden=false;
  liveGrid.replaceWith(snapshotGrid);

  // The render underneath created a second set of blob URLs. Its whole grid is
  // gone now, so revoke only that unused set and keep the adopted grid URLs.
  unusedLiveUrls.forEach(url=>{try{URL.revokeObjectURL(url);}catch(_){}});
  coverUrls=[...new Set(snapshotBlobUrls)];
  bindBookInteractions();

  const kept=new Set(snapshotBlobUrls);
  return staleUrls.filter(url=>!kept.has(url));
}

function adoptOfficialSwipeSnapshot(view){
  // V63.35.28: an incoming official swipe used to end by discarding the
  // visible clone and exposing a separately fetched/rendered official DOM.
  // If their content is identical, keep the DOM that is already on screen.
  const snapshot=view?.nextPage?.querySelector?.('.official-shelf');
  const live=$('#officialShelf');
  const snapshotBooks=snapshot?.querySelector?.('.official-books');
  const liveBooks=live?.querySelector?.('#officialBooks');
  if(!snapshot||!live||!snapshotBooks||!liveBooks)return false;
  // On the first visit the snapshot can still contain the loading state. The
  // freshly loaded/decoded card nodes are moved into that already-positioned
  // official page before it becomes the live shelf. A data refresh therefore
  // changes only the shelf contents, never the whole painted page at teardown.
  if(snapshotBooks.innerHTML!==liveBooks.innerHTML){
    snapshotBooks.replaceChildren(...liveBooks.childNodes);
  }
  snapshot.id='officialShelf';
  snapshotBooks.id='officialBooks';
  snapshot.hidden=false;
  live.replaceWith(snapshot);
  bindOfficialShelfInteractions(snapshotBooks);
  return true;
}

async function waitForLiveShelfVisualReady(){
  // The swipe snapshot stays on top until the newly rendered live shelf has
  // finished decoding its cover images. Two rAFs are not enough on iOS Safari
  // when moving from the official shelf to a local shelf whose object URLs were
  // not already on screen; removing the snapshot early produces a flash /
  // two-stage landing as live covers paint a moment later.
  const live=currentShelfBodyElement();
  if(!live)return;
  const imgs=[...live.querySelectorAll('img')];
  const jobs=imgs.map(img=>{
    if(img.complete&&img.naturalWidth>0)return Promise.resolve();
    if(typeof img.decode==='function')return img.decode().catch(()=>{});
    return new Promise(resolve=>{
      const done=()=>resolve();
      img.addEventListener('load',done,{once:true});
      img.addEventListener('error',done,{once:true});
    });
  });
  if(jobs.length){
    await Promise.race([
      Promise.all(jobs),
      new Promise(resolve=>setTimeout(resolve,500))
    ]);
  }
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
}

function installShelfScrollGuard(){
  if(document.documentElement.dataset.shelfScrollGuardInstalled==='1')return;
  document.documentElement.dataset.shelfScrollGuardInstalled='1';
  let raf=0;
  window.addEventListener('scroll',()=>{
    if(raf||document.body.classList.contains('bookshelf-scroll-locked')||document.body.classList.contains('shelf-scroll-restoring'))return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      if(!matchMedia('(max-width:680px) and (pointer:coarse)').matches)return;
      const max=shelfMeaningfulMaxScroll();
      const y=window.scrollY||window.pageYOffset||0;
      document.body.classList.toggle('shelf-no-vertical-scroll',max===0);
      if(y>max+1){
        try{window.scrollTo({left:0,top:max,behavior:'instant'});}catch(_){window.scrollTo(0,max);}
      }
      saveShelfScroll(currentShelfTab,Math.min(y,max));
    });
  },{passive:true});
}


function installDesktopShelfArrowKeys(){
  if(document.documentElement.dataset.desktopShelfArrowKeysInstalled==='1')return;
  document.documentElement.dataset.desktopShelfArrowKeysInstalled='1';
  const tabs=['owned','created','official'];
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented||!matchMedia('(min-width:681px)').matches)return;
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
    const target=e.target;
    if(target?.closest?.('input,textarea,select,[contenteditable="true"],dialog[open],details[open]'))return;
    if($('#bookshelfMenu')?.open||document.querySelector('dialog[open]'))return;
    const index=tabs.indexOf(currentShelfTab);if(index<0)return;
    const nextIndex=e.key==='ArrowRight'?index+1:index-1;
    if(nextIndex<0||nextIndex>=tabs.length)return;
    e.preventDefault();
    switchShelf(tabs[nextIndex]);
  });
}

function installShelfSwipe(){
  if(document.documentElement.dataset.shelfSwipeInstalled==='1')return;
  document.documentElement.dataset.shelfSwipeInstalled='1';
  const tabs=['owned','created','official'];
  let gesture=null;
  let settling=false;
  const mobile=()=>matchMedia('(max-width:680px) and (pointer:coarse)').matches;
  const blockedTarget=target=>!!target?.closest?.('dialog[open],button:not(.book),input,select,textarea,a,summary,[contenteditable="true"]');
  const cleanup=()=>{if(gesture?.view)removeShelfSwipeStage(gesture.view);gesture=null;};
  window.addEventListener('touchstart',e=>{
    if(!mobile()||settling||e.touches.length!==1||pinchGesture)return;
    if(document.querySelector('dialog[open]')||$('#bookshelfMenu')?.open||blockedTarget(e.target))return;
    const t=e.touches[0];
    if(t.clientX<22||t.clientX>window.innerWidth-22)return;
    gesture={x:t.clientX,y:t.clientY,lastX:t.clientX,lastY:t.clientY,lastAt:performance.now(),vx:0,horizontal:false,cancelled:false,view:null,direction:null};
  },{passive:true});
  window.addEventListener('touchmove',e=>{
    const g=gesture;if(!g||e.touches.length!==1||touchBookReordering){cleanup();return;}
    const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;
    const now=performance.now(),dt=Math.max(1,now-g.lastAt);g.vx=(t.clientX-g.lastX)/dt;g.lastX=t.clientX;g.lastY=t.clientY;g.lastAt=now;
    const ax=Math.abs(dx),ay=Math.abs(dy);
    if(!g.horizontal){
      if(ay>14&&ay>ax*1.15){g.cancelled=true;return;}
      if(ax>12&&ax>ay*1.25)g.horizontal=true;
    }
    if(!g.horizontal||g.cancelled)return;
    e.preventDefault();
    const index=tabs.indexOf(currentShelfTab);if(index<0)return;
    const direction=dx<0?'left':'right';
    const nextIndex=direction==='left'?index+1:index-1;
    if(nextIndex<0||nextIndex>=tabs.length){
      // Edge resistance, like a viewer reaching the first/last page.
      const resisted=Math.sign(dx)*Math.min(44,Math.abs(dx)*.22);
      if(g.view){removeShelfSwipeStage(g.view);g.view=null;}
      const current=currentShelfBodyElement();if(current)current.style.transform=`translate3d(${resisted}px,0,0)`;
      return;
    }
    if(!g.view||g.direction!==direction){
      if(g.view)removeShelfSwipeStage(g.view);
      g.direction=direction;g.view=makeShelfSwipeStage(tabs[nextIndex],direction);
      const current=currentShelfBodyElement();if(current)current.style.transform='';
    }
    positionShelfSwipeStage(g.view,dx);
  },{passive:false});
  window.addEventListener('touchend',async e=>{
    const g=gesture;gesture=null;if(!g)return;
    const live=currentShelfBodyElement();
    if(live&&g.view?.liveCurrent!==live)live.style.transform='';
    if(g.cancelled||!g.horizontal||!g.view){removeShelfSwipeStage(g.view);return;}
    const t=e.changedTouches?.[0];if(!t){removeShelfSwipeStage(g.view);return;}
    const dx=t.clientX-g.x;
    const commit=Math.abs(dx)>g.view.width*.28||Math.abs(g.vx)>.55;
    if(!commit){await animateShelfSwipeStage(g.view,0,190);removeShelfSwipeStage(g.view);return;}
    // V63.24.3: serialize page commits. A second swipe that starts while the
    // previous viewer animation/render is still settling can otherwise build a
    // new stage from the old tab and leave Safari with a half-translated snapshot.
    settling=true;
    suppressBookClick=true;setTimeout(()=>{suppressBookClick=false;},280);
    const toX=g.direction==='left'?-g.view.width:g.view.width;
    let staleUrls=[];
    try{
      await animateShelfSwipeStage(g.view,toX,175);
      // The incoming snapshot is now the only visible page while the live shelf renders underneath.
      g.view.currentPage.style.visibility='hidden';
      g.view.nextPage.style.transform='translate3d(0,0,0)';
      const next=g.view.nextTab;
      // Keep the completed viewer page covering the old live shelf while the real
      // next shelf is rendered underneath. Removing the stage first exposed the
      // previous shelf for a frame on iOS Safari and looked like an afterimage.
      // The official snapshot was built from the already-loaded hidden shelf.
      // Do not force a second network fetch/render inside the landing frame.
      staleUrls=await switchShelf(next,{deferCoverRevoke:true,refreshOfficial:next!=='official'});
      if(next==='official'){
        await waitForLiveShelfVisualReady();
        adoptOfficialSwipeSnapshot(g.view);
      }else{
        staleUrls=adoptLocalSwipeSnapshot(g.view,staleUrls);
      }
    }finally{
      removeShelfSwipeStage(g.view);
      // Defensive cleanup for interrupted WebKit animations / rapid direction changes.
      document.querySelectorAll('.shelf-swipe-stage').forEach(stage=>stage.remove());
      staleUrls.forEach(URL.revokeObjectURL);
      settling=false;
    }
  },{passive:true});
  window.addEventListener('touchcancel',()=>{const g=gesture;gesture=null;const live=currentShelfBodyElement();if(live)live.style.transform='';removeShelfSwipeStage(g?.view);},{passive:true});
}

function detailWorkInfoHtml(w){
  const description=String(w?.description||'').trim(),seriesTitle=String(w?.seriesTitle||'').trim();
  if(!description&&!seriesTitle)return'';
  return`<section class="detail-work-info"><p class="eyebrow">WORK INFO</p>${seriesTitle?`<p class="detail-series">${escapeHtml(seriesTitle)}</p>`:''}${description?`<p class="detail-description">${escapeHtml(description)}</p>`:''}</section>`;
}
function detailIdentityHtml(w,isReader){
  const subtitle=String(w?.subtitle||'').trim(),episode=String(w?.episode||'').trim(),episodeTitle=String(w?.episodeTitle||'').trim();
  const stamp=isReader?`本棚追加 ${escapeHtml(fmtDate(w.addedAt))}`:`本棚更新 ${escapeHtml(fmtDate(w.updatedAt))}`;
  return `<div class="detail-copy"><p class="eyebrow">${isReader?'MY COPY':'MASTER'}</p><h2>${escapeHtml(w.title)}</h2>${subtitle?`<p class="detail-hero-subtitle">${escapeHtml(subtitle)}</p>`:''}<p class="detail-hero-author">${escapeHtml(w.author||'作者未設定')}</p>${episode?`<p class="detail-hero-episode">${escapeHtml(episode)}</p>`:''}${episodeTitle?`<p class="detail-hero-episode-title">${escapeHtml(episodeTitle)}</p>`:''}<p class="detail-hero-facts">${w.sceneCount||0} Scene${!isReader&&w.revision?` · revision ${w.revision}`:''}</p><p class="detail-hero-date">${stamp}</p></div>`;
}

async function openDetail(role,id){const isReader=role==='distribution';let w=isReader?await getReaderBook(id):await getWork(id);if(!w)return;w=await hydrateStoredBookMetadata({...w,role:isReader?'distribution':'master'});currentWorkId=id;const cover=w.coverBlob?(()=>{const u=URL.createObjectURL(w.coverBlob);coverUrls.push(u);return`<div class="detail-cover"><img src="${u}" alt=""></div>`})():(w.coverUrl?`<div class="detail-cover"><img src="${escapeHtml(w.coverUrl)}" alt=""></div>`:`<div class="detail-cover"><div class="cover-fallback">□</div></div>`);if(isReader){const relayAction=w.relayEnabled===false?'':`<button id="relayDistribution" class="journey" type="button">次の一人へ</button>`;$('#detailContent').innerHTML=`<div class="detail-hero">${cover}${detailIdentityHtml(w,true)}</div>${detailWorkInfoHtml(w)}<div class="actions reader-primary-actions"><button id="readDistribution" class="edit" type="button">読む</button>${relayAction}</div><section id="copyJourneyPanel" class="copy-journey-panel is-compact"><div class="copy-journey-loading">この一冊の旅を確認しています…</div></section><div class="detail-management"><button id="removeWork" class="danger compact-danger" type="button">段ボール箱にしまう</button></div><p class="detail-note">${w.relayEnabled===false?'この一冊は「もっている本」に保存されています。作者の設定によりRELAYは無効です。':'この一冊は「もっている本」に保存されています。読むことも、そのまま次の一人へ送ることもできます。'}</p>`;$('#detailDialog').showModal();syncShelfScrollLock();loadCopyJourney(w);const openReaderCopy=(relayNow=false)=>{try{sessionStorage.setItem('ahako:bookshelf:open-copy',w.copyId);}catch(_){}const q=new URLSearchParams({bookshelfCopy:w.copyId});if(relayNow)q.set('relayNow','1');location.href=`../local-player/?${q.toString()}`;};$('#readDistribution').onclick=()=>openReaderCopy(false);if($('#relayDistribution'))$('#relayDistribution').onclick=()=>openReaderCopy(true);$('#removeWork').onclick=async()=>{if(!confirm(`「${w.title}」を段ボール箱にしまいますか？\n\n本そのものは削除されず、あとから本棚へ戻せます。`))return;archiveBookId('owned',id);$('#detailDialog').close();await render();toast('段ボール箱にしまいました。');};return;}$('#detailContent').innerHTML=`<div class="detail-hero">${cover}${detailIdentityHtml(w,false)}</div>${detailWorkInfoHtml(w)}<div class="actions master-primary-actions"><button id="readMaster" class="edit" type="button">読む</button><button id="editWork" class="edit" type="button">Studioで編集</button></div><section id="masterSignalPanel" class="master-signal-panel is-compact"><button id="toggleMasterSignal" class="master-signal-summary" type="button" aria-expanded="false"><span><small>WORK SIGNAL</small><strong>作品の力</strong><em>読者の行動から見る</em></span><b aria-hidden="true">›</b></button><div id="masterSignalDetails" class="master-signal-details" hidden><section id="strengthPanel" class="strength-panel"><div class="strength-loading">作品の力を観測しています…</div></section><section id="journeyPanel" class="journey-panel" hidden></section><button id="viewJourney" class="journey master-journey-button" type="button">旅を見る</button></div></section><div class="master-file-actions"><button id="exportMaster" type="button">Masterを書き出す</button><button id="replaceMaster" type="button">Masterを更新</button></div><div class="detail-management master-management"><button id="removeWork" class="danger compact-danger" type="button">段ボール箱にしまう</button></div><p class="detail-note">段ボール箱にしまっても、このブラウザ内のMaster本体は削除されません。あとから本棚へ戻せます。</p>`;$('#detailDialog').showModal();syncShelfScrollLock();loadStrengths(w);const signalToggle=$('#toggleMasterSignal'),signalDetails=$('#masterSignalDetails'),signalPanel=$('#masterSignalPanel');if(signalToggle&&signalDetails)signalToggle.onclick=()=>{const open=signalToggle.getAttribute('aria-expanded')==='true';signalToggle.setAttribute('aria-expanded',String(!open));signalDetails.hidden=open;signalPanel?.classList.toggle('is-open',!open);};$('#readMaster').onclick=()=>{try{sessionStorage.setItem('ahako:bookshelf:open-master',w.workId);}catch(_){}location.href=`../local-player/?bookshelfMaster=${encodeURIComponent(w.workId)}`;};$('#editWork').onclick=()=>editInStudio(w);$('#viewJourney').onclick=()=>loadJourney(w);$('#exportMaster').onclick=()=>downloadBlob(w.blob,w.fileName||`${w.title}.scene`);$('#replaceMaster').onclick=()=>{$('#fileInput').dataset.replace=id;$('#fileInput').click();};$('#removeWork').onclick=async()=>{if(!confirm(`「${w.title}」を段ボール箱にしまいますか？\n\nMaster本体は削除されず、あとから本棚へ戻せます。`))return;archiveBookId('created',id);$('#detailDialog').close();await render();toast('段ボール箱にしまいました。');};}
async function fetchCopyJourney(workId,copyId,{force=false}={}){const key=`${workId}|${copyId}`;if(!force&&copyJourneyCache.has(key))return copyJourneyCache.get(key);const res=await fetch(`${API_BASE}/copy-journey/${encodeURIComponent(workId)}/${encodeURIComponent(copyId)}`,{headers:{Accept:'application/json'},cache:'no-store'});const data=await res.json().catch(()=>null);if(!res.ok||!data?.ok)throw new Error(data?.error||`HTTP ${res.status}`);copyJourneyCache.set(key,data);return data;}
function copyJourneyStateCopy(summary){const people=Math.max(1,Number(summary?.peopleReached||1));if(summary?.state==='travelling')return`この一冊は、いま${people}人目。次の一人へ向かっています。`;if(Number(summary?.relayArrivals||0)>0)return`この一冊は、いま${people}人目まで届きました。`;return'この一冊は、いま1人目。まだ旅には出ていません。';}
function renderCopyJourney(panel,data,w){const s=data?.summary||{},j=data?.journey||null;const relayArrivals=Math.max(0,Number(s.relayArrivals||0)),generations=Math.max(0,Number(s.generations||0)),pending=Math.max(0,Number(s.pending||0)),completions=Math.max(0,Number(s.completions||0)),observedReaders=Math.max(0,Number(s.observedReaders||0));const hasJourney=generations>0||relayArrivals>0;const tree=hasJourney&&j?`<div class="copy-journey-preview">${workJourneyTreeSvg([j],{rootType:'copy',rootLabel:'この一冊'})}</div><button id="openCopyTreeView" class="copy-tree-button" type="button">この一冊の旅を見る</button>`:'';panel.innerHTML=`<button id="toggleCopyJourney" class="copy-journey-summary" type="button" aria-expanded="false"><span><small>MY COPY JOURNEY</small><strong>この一冊の旅</strong><em>${escapeHtml(copyJourneyStateCopy(s))}</em></span><b aria-hidden="true">›</b></button><div id="copyJourneyDetails" class="copy-journey-details" hidden><div class="copy-journey-stats"><div><small>届いた回数</small><strong>${relayArrivals}</strong></div><div><small>送り出し</small><strong>${generations}</strong></div><div><small>読了</small><strong>${completions}</strong></div></div>${pending?`<p class="copy-journey-now">○ ${pending}つのRELAYが、まだ次の到着を待っています。</p>`:''}${observedReaders?`<p class="copy-journey-note">この一冊は匿名で ${observedReaders} 人以上の読書端末から観測されています。</p>`:'<p class="copy-journey-note">読者名・送り先・位置情報は表示しません。</p>'}${tree}</div>`;const toggle=$('#toggleCopyJourney'),details=$('#copyJourneyDetails');if(toggle&&details)toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));details.hidden=open;panel.classList.toggle('is-open',!open);};const b=$('#openCopyTreeView');if(b)b.onclick=()=>openCopyTree(data,w);}
async function loadCopyJourney(w){const panel=$('#copyJourneyPanel');if(!panel)return;try{const data=await fetchCopyJourney(w.workId,w.copyId,{force:true});if(currentWorkId!==w.copyId)return;renderCopyJourney(panel,data,w);}catch(err){console.error(err);if(currentWorkId!==w.copyId)return;panel.innerHTML='<div class="copy-journey-error">この一冊の旅を読み込めませんでした。</div>';}}
function openCopyTree(data,w){const j=data?.journey;if(!j)return;const s=data?.summary||{};$('#treeDialogTitle').textContent=w?.title||'この一冊の旅';$('#treeDialogMeta').innerHTML=`<span>いま ${Math.max(1,Number(s.peopleReached||1))}人目</span><span>届いた回数 ${Math.max(0,Number(s.relayArrivals||0))}</span><span>送り出し ${Math.max(0,Number(s.generations||0))}</span><span>読了 ${Math.max(0,Number(s.completions||0))}</span>`;$('#treeDialogCanvas').innerHTML=workJourneyTreeSvg([j],{rootType:'copy',rootLabel:'この一冊'});$('#treeDialog').showModal();}

async function fetchInsights(workId,{force=false}={}){if(!force&&insightsCache.has(workId))return insightsCache.get(workId);const res=await fetch(`${API_BASE}/bookshelf-insights/${encodeURIComponent(workId)}?days=7`,{headers:{Accept:'application/json'},cache:'no-store'});const data=await res.json().catch(()=>null);if(!res.ok||!data?.ok)throw new Error(data?.error||`HTTP ${res.status}`);insightsCache.set(workId,data);return data;}
function strengthCard(label,ratio,sample,minimum,formula,{provisional=false}={}){const enough=sample>=minimum;const pct=Number.isFinite(Number(ratio))?Math.round(Math.max(0,Number(ratio))*100):0;const shownPct=Math.min(999,pct);return`<div class="strength-card${enough?'':' is-observing'}"><div class="strength-label"><strong>${label}</strong><span>${formula}</span></div>${enough?`<div class="strength-value">${shownPct}<small>%</small></div><div class="strength-meter"><i style="width:${Math.min(100,shownPct)}%"></i></div>`:`<div class="strength-observing">まだ観測中</div><div class="strength-sample">${Math.max(0,sample)} / ${minimum}</div>`}${provisional?'<p>「自分の一冊」はV63.15以降の保存から計測しています。</p>':''}</div>`;}
function renderStrengths(panel,data){const all=data?.allTime||{},strength=data?.strengths?.allTime||{},minimum=Math.max(1,Number(data?.strengths?.minimumSample||10));panel.innerHTML=`<div class="strength-head"><div><p class="eyebrow">WORK SIGNAL</p><h3>作品の力</h3></div><span>匿名集計</span></div><div class="strength-grid">${strengthCard('旅する力',strength.journey,Math.max(0,Number(all.completions||0)),minimum,'次の一人へ ÷ 読了')}${strengthCard('本棚に残る力',strength.bookshelf,Math.max(0,Number(all.completions||0)),minimum,'自分の一冊 ÷ 読了',{provisional:true})}${strengthCard('最後まで読まれる力',strength.completion,Math.max(0,Number(all.observedReaders||0)),minimum,'読了 ÷ 観測読者')}</div><p class="strength-note">数字が少ない間は評価を固定せず「まだ観測中」と表示します。作品ごとの強さを、人気順ではなく読者の行動から見ます。</p>`;}
async function loadStrengths(w){const panel=$('#strengthPanel');if(!panel)return;try{const data=await fetchInsights(w.workId);if(currentWorkId!==w.workId)return;renderStrengths(panel,data);}catch(err){console.error(err);if(currentWorkId!==w.workId)return;panel.innerHTML='<div class="strength-error">作品の力を読み込めませんでした。</div>';}}
async function loadJourney(w){const panel=$('#journeyPanel'),button=$('#viewJourney');if(!panel||!button)return;panel.hidden=false;panel.innerHTML='<div class="journey-loading">旅の記録を読み込んでいます…</div>';button.disabled=true;button.textContent='読み込み中…';try{const data=await fetchInsights(w.workId,{force:true});currentJourneyData=data;currentJourneyTitle=w.title||'作品の木';renderStrengths($('#strengthPanel'),data);renderJourney(panel,data);button.textContent='旅を更新';}catch(err){console.error(err);panel.innerHTML=`<div class="journey-error"><strong>旅の記録を読み込めませんでした。</strong><span>通信状態またはWorkerの更新を確認してください。</span></div>`;button.textContent='もう一度読み込む';}finally{button.disabled=false;}}
function workJourneyTreeSvg(journeys,{rootType='work',rootLabel='作品'}={}){
  if(!Array.isArray(journeys)||!journeys.length)return'';
  // workId を植木鉢＝一本の根として、copyId / RELAY の旅を上方向へ育てる。
  // 内部IDは表示せず、各一冊は「発行」の節、到達は●、未到達は○として描画する。
  const root={type:rootType,rootLabel,children:journeys.map(j=>j&&j.tree).filter(Boolean)};
  const nodes=[],edges=[];let leaf=0,maxLevel=0;
  const X_GAP=58,Y_GAP=68,LEFT=34,TOP=28,BOTTOM=48;
  function levelOf(node){
    if(node.type==='work'||node.type==='copy')return 0;
    if(node.type==='issue')return 1;
    return Math.max(2,Math.max(0,Number(node.depth||0))+2);
  }
  function measure(node,parent=null){
    const children=Array.isArray(node.children)?node.children:[];
    const level=levelOf(node);maxLevel=Math.max(maxLevel,level);
    let x;
    if(children.length){
      const xs=children.map(c=>measure(c,node));
      x=xs.reduce((a,b)=>a+b,0)/xs.length;
    }else{x=LEFT+(leaf++*X_GAP);}
    node.__x=x;node.__level=level;nodes.push(node);if(parent)edges.push([parent,node]);return x;
  }
  measure(root);
  const width=Math.max(330,(Math.max(1,leaf)-1)*X_GAP+LEFT*2);
  const height=Math.max(230,TOP+BOTTOM+(maxLevel+1)*Y_GAP);
  // 根を下、深いRELAYほど上へ。作品が読まれるほど木が上方向へ伸びる。
  nodes.forEach(n=>{n.__y=height-BOTTOM-(n.__level*Y_GAP);});
  const paths=edges.map(([a,b])=>{
    const x1=a.__x,y1=a.type==='work'?a.__y-18:a.__y,x2=b.__x,y2=b.__y;
    const mid=(y1+y2)/2;
    return`<path d="M${x1} ${y1} C${x1} ${mid},${x2} ${mid},${x2} ${y2}"/>`;
  }).join('');
  const marks=nodes.map(n=>{
    if(n.type==='work'||n.type==='copy')return`<g class="work-root ${n.type==='copy'?'copy-root':''}"><path d="M${n.__x-9} ${n.__y-5}h18l-3 12h-12z"/><line class="work-trunk" x1="${n.__x}" y1="${n.__y-18}" x2="${n.__x}" y2="${n.__y-5}"/><text x="${n.__x}" y="${n.__y+21}" text-anchor="middle">${escapeHtml(n.rootLabel||rootLabel)}</text></g>`;
    if(n.type==='issue')return`<g class="issue"><circle cx="${n.__x}" cy="${n.__y}" r="5"/><text x="${n.__x+9}" y="${n.__y+3}">発行</text></g>`;
    if(n.type==='pending')return`<circle class="pending" cx="${n.__x}" cy="${n.__y}" r="5"/>`;
    return`<circle class="reader" cx="${n.__x}" cy="${n.__y}" r="5"/>`;
  }).join('');
  return`<div class="journey-tree-scroll"><svg class="journey-tree-svg work-tree" viewBox="0 0 ${width} ${height}" role="img" aria-label="作品を根に、読者へ届くほど上へ育つ旅の木"><g class="branches">${paths}</g>${marks}</svg></div>`;
}
function renderJourney(panel,data){
  const all=data.allTime||{},recent=data.period||{},journeys=Array.isArray(data.journeys)?data.journeys:[];
  const activeCopies=journeys.length;
  const treeBlock=journeys.length?`<div class="journey-list"><div class="journey-list-head"><div><strong>作品の木</strong><small>ここでは全体像だけ。育った木は大きな画面で見られます</small></div><span>● 到達　○ 送り出し中</span></div><div class="work-tree-meta"><span>動いている一冊 ${activeCopies}</span><span>最長 ${Math.max(0,Number(all.maxHop||0))}人</span></div><div class="tree-preview">${workJourneyTreeSvg(journeys)}</div><button id="openTreeView" class="open-tree-view" type="button">木を大きく見る</button></div>`:`<div class="journey-empty">まだ木は育っていません。「この作品を回す」で送り出したRELAY.sceneが次のLocal Playerで開かれると、作品から枝が伸びます。</div>`;
  panel.innerHTML=`<div class="journey-head"><div><p class="eyebrow">OUTSIDE THE BOX</p><h3>外で起きていること</h3></div><span>匿名集計</span></div><div class="journey-section-label"><strong>これまで</strong><span>作品が外で動いた累計</span></div><div class="journey-stats"><div><small>観測された読者+</small><strong>${Math.max(0,Number(all.observedReaders||0))}+</strong></div><div><small>読了</small><strong>${Math.max(0,Number(all.completions||0))}</strong></div><div><small>観測された一冊</small><strong>${Math.max(0,Number(all.observedCopies||0))}</strong></div><div><small>旅に出た一冊</small><strong>${Math.max(0,Number(all.relayedCopies||0))}</strong></div><div><small>届いた回数</small><strong>${Math.max(0,Number(all.relayArrivals||0))}</strong></div><div><small>最長の旅</small><strong>${Math.max(0,Number(all.maxHop||0))}人</strong></div></div><div class="journey-recent"><div><strong>最近7日間</strong><span>いまも動いているかを見る</span></div><p><b>${Math.max(0,Number(recent.observedReaders||0))}+</b> 読者 <b>${Math.max(0,Number(recent.completions||0))}</b> 読了 <b>${Math.max(0,Number(recent.relayArrivals||0))}</b> 届いた <small>（送り出し ${Math.max(0,Number(recent.relayGenerations||0))}）</small></p></div>${treeBlock}<p class="journey-note">作品を根に、正規に発行された一冊ごとの旅を枝としてまとめています。● はRELAY.sceneが次のLocal Playerで実際に観測された到達、○ は送り出されたもののまだ次で観測されていない枝です。内部では一冊ごとのcopyIdを分けたまま保持します。Master本体・氏名・送受信相手は送信しません。</p>`;
  const openTree=$('#openTreeView');if(openTree)openTree.onclick=()=>openFullTree(data);
}
function openFullTree(data=currentJourneyData){
  if(!data)return;
  const journeys=Array.isArray(data.journeys)?data.journeys:[],all=data.allTime||{};if(!journeys.length)return;
  $('#treeDialogTitle').textContent=currentJourneyTitle||'作品の木';
  $('#treeDialogMeta').innerHTML=`<span>観測された読者 ${Math.max(0,Number(all.observedReaders||0))}+</span><span>動いている一冊 ${journeys.length}</span><span>届いた回数 ${Math.max(0,Number(all.relayArrivals||0))}</span><span>最長 ${Math.max(0,Number(all.maxHop||0))}人</span>`;
  $('#treeDialogCanvas').innerHTML=workJourneyTreeSvg(journeys);
  $('#treeDialog').showModal();
}

async function editInStudio(w){await setHandoff(w.workId);location.href='../studio/?from=bookshelf';}
function downloadBlob(blob,name){const a=document.createElement('a');const u=URL.createObjectURL(blob);a.href=u;a.download=name||'master.scene';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2500);}
function zipU16(v,o,x){v.setUint16(o,x,true)}function zipU32(v,o,x){v.setUint32(o,x>>>0,true)}function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
async function makeStoreZip(entries){const locals=[],centrals=[];let offset=0;for(const e of entries){const nb=te.encode(e.name),data=e.bytes instanceof Uint8Array?e.bytes:new Uint8Array(e.bytes),crc=crc32(data);const l=new Uint8Array(30+nb.length+data.length),lv=new DataView(l.buffer);zipU32(lv,0,0x04034b50);zipU16(lv,4,20);zipU16(lv,6,0x0800);zipU16(lv,8,0);zipU32(lv,14,crc);zipU32(lv,18,data.length);zipU32(lv,22,data.length);zipU16(lv,26,nb.length);l.set(nb,30);l.set(data,30+nb.length);locals.push(l);const c=new Uint8Array(46+nb.length),cv=new DataView(c.buffer);zipU32(cv,0,0x02014b50);zipU16(cv,4,20);zipU16(cv,6,20);zipU16(cv,8,0x0800);zipU32(cv,16,crc);zipU32(cv,20,data.length);zipU32(cv,24,data.length);zipU16(cv,28,nb.length);zipU32(cv,42,offset);c.set(nb,46);centrals.push(c);offset+=l.length;}const centralOffset=offset,centralSize=centrals.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);zipU32(ev,0,0x06054b50);zipU16(ev,8,entries.length);zipU16(ev,10,entries.length);zipU32(ev,12,centralSize);zipU32(ev,16,centralOffset);return new Blob([...locals,...centrals,end],{type:'application/zip'});}
async function backupShelf(){const works=await getAllWorks(),readerBooks=await getAllReaderBooks();if(!works.length&&!readerBooks.length){toast('バックアップする本がありません。');return;}const meta={format:'ahako-local-bookshelf-backup',version:'3',privateBackup:true,exportedAt:new Date().toISOString(),works:works.map(w=>({workId:w.workId,title:w.title,fileName:w.fileName})),readerBooks:readerBooks.map(w=>({copyId:w.copyId,title:w.title,fileName:w.fileName})),layout:{createdOrder:readIdList(SHELF_ORDER_KEYS.created),ownedOrder:readIdList(SHELF_ORDER_KEYS.owned),archivedCreated:readIdList(SHELF_ARCHIVE_KEYS.created),archivedOwned:readIdList(SHELF_ARCHIVE_KEYS.owned)}};const entries=[{name:'bookshelf.json',bytes:te.encode(JSON.stringify(meta,null,2))}];for(const w of works)entries.push({name:`masters/${w.workId}.scene`,bytes:new Uint8Array(await w.blob.arrayBuffer())});for(const w of readerBooks)entries.push({name:`distributions/${w.copyId}.scene`,bytes:new Uint8Array(await w.blob.arrayBuffer())});downloadBlob(await makeStoreZip(entries),`ahako_bookshelf_backup_${new Date().toISOString().slice(0,10)}.zip`);toast(`${works.length+readerBooks.length}冊をバックアップしました。`);}
async function restoreShelf(file){const entries=await readZipEntries(file);const metaBytes=entries.get('bookshelf.json');if(!metaBytes)throw new Error('あ箱 本棚のバックアップではありません。');const meta=parseJson(metaBytes);if(meta.format!=='ahako-local-bookshelf-backup')throw new Error('バックアップ形式が違います。');let n=0;for(const item of meta.works||[]){const bytes=entries.get(`masters/${item.workId}.scene`);if(!bytes)continue;await addMaster(new File([bytes],item.fileName||`${item.title||item.workId}.scene`),{silent:true});n++;}for(const item of meta.readerBooks||[]){const bytes=entries.get(`distributions/${item.copyId}.scene`);if(!bytes)continue;await addDistribution(new File([bytes],item.fileName||`${item.title||item.copyId}_distribution.scene`),{silent:true});n++;}if(meta.layout&&typeof meta.layout==='object'){writeIdList(SHELF_ORDER_KEYS.created,Array.isArray(meta.layout.createdOrder)?meta.layout.createdOrder:[]);writeIdList(SHELF_ORDER_KEYS.owned,Array.isArray(meta.layout.ownedOrder)?meta.layout.ownedOrder:[]);writeIdList(SHELF_ARCHIVE_KEYS.created,Array.isArray(meta.layout.archivedCreated)?meta.layout.archivedCreated:[]);writeIdList(SHELF_ARCHIVE_KEYS.owned,Array.isArray(meta.layout.archivedOwned)?meta.layout.archivedOwned:[]);}await render();toast(`${n}冊を復元しました。`);}

async function exportStorageBox(){
  const archivedCreated=readIdList(SHELF_ARCHIVE_KEYS.created),archivedOwned=readIdList(SHELF_ARCHIVE_KEYS.owned);
  const masters=[],distributions=[];
  for(const workId of archivedCreated){const w=await getWork(workId);if(w)masters.push(w);}
  for(const copyId of archivedOwned){const w=await getReaderBook(copyId);if(w)distributions.push(w);}
  if(!masters.length&&!distributions.length){toast('箱の中は空です。');return;}
  const meta={
    format:'ahako-storage-box',version:'1',privateBackup:true,exportedAt:new Date().toISOString(),
    works:masters.map(w=>({workId:w.workId,title:w.title,fileName:w.fileName})),
    readerBooks:distributions.map(w=>({copyId:w.copyId,title:w.title,fileName:w.fileName})),
    layout:{archivedCreated:masters.map(w=>w.workId),archivedOwned:distributions.map(w=>w.copyId)}
  };
  const entries=[{name:'box.json',bytes:te.encode(JSON.stringify(meta,null,2))}];
  for(const w of masters)entries.push({name:`masters/${w.workId}.scene`,bytes:new Uint8Array(await w.blob.arrayBuffer())});
  for(const w of distributions)entries.push({name:`distributions/${w.copyId}.scene`,bytes:new Uint8Array(await w.blob.arrayBuffer())});
  downloadBlob(await makeStoreZip(entries),`ahako_box_${new Date().toISOString().slice(0,10)}.zip`);
  toast(`${masters.length+distributions.length}冊を箱に詰めました。`);
}
async function importStorageBox(file){
  const entries=await readZipEntries(file),metaBytes=entries.get('box.json');
  if(!metaBytes)throw new Error('あ箱の段ボールZIPではありません。');
  const meta=parseJson(metaBytes);if(meta.format!=='ahako-storage-box')throw new Error('段ボールZIPの形式が違います。');
  let added=0,skipped=0;
  const createdToArchive=[],ownedToArchive=[];
  for(const item of meta.works||[]){
    if(await getWork(item.workId)){skipped++;continue;}
    const bytes=entries.get(`masters/${item.workId}.scene`);if(!bytes)continue;
    const id=await addMaster(new File([bytes],item.fileName||`${item.title||item.workId}.scene`),{silent:true});
    createdToArchive.push(id);added++;
  }
  for(const item of meta.readerBooks||[]){
    if(await getReaderBook(item.copyId)){skipped++;continue;}
    const bytes=entries.get(`distributions/${item.copyId}.scene`);if(!bytes)continue;
    const id=await addDistribution(new File([bytes],item.fileName||`${item.title||item.copyId}_distribution.scene`),{silent:true});
    ownedToArchive.push(id);added++;
  }
  for(const id of createdToArchive)archiveBookId('created',id);
  for(const id of ownedToArchive)archiveBookId('owned',id);
  await render();
  if($('#archiveDialog')?.open)openArchiveBox();
  const parts=[];if(added)parts.push(`${added}冊を箱に入れました`);if(skipped)parts.push(`${skipped}冊は既にあるためスキップ`);
  toast(parts.join('・')||'読み込める本がありませんでした。');
}

async function addDroppedScene(file){
  const entries=await readZipEntries(file);
  const sceneBytes=entries.get('scene.json');if(!sceneBytes)throw new Error('scene.json がありません。');
  const doc=parseJson(sceneBytes);
  const manifest=entries.get('manifest.json')?parseJson(entries.get('manifest.json')):{};
  const role=String(manifest.packageRole||doc?.package?.role||'').toLowerCase();
  if(role==='distribution'){
    await addDistribution(file);
    applyShelfTab('owned');
    return 'owned';
  }
  await addMaster(file);
  applyShelfTab('created');
  return 'created';
}
function installSceneDrop(){
  if(!matchMedia('(pointer:fine)').matches)return;
  const overlay=$('#sceneDropOverlay');let depth=0;
  const hasFiles=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');
  window.addEventListener('dragenter',e=>{if(draggingBookId||!hasFiles(e))return;e.preventDefault();depth++;document.body.classList.add('scene-drag-active');overlay?.setAttribute('aria-hidden','false');});
  window.addEventListener('dragover',e=>{if(draggingBookId||!hasFiles(e))return;e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';});
  window.addEventListener('dragleave',e=>{if(draggingBookId||!hasFiles(e))return;depth=Math.max(0,depth-1);if(depth===0){document.body.classList.remove('scene-drag-active');overlay?.setAttribute('aria-hidden','true');}});
  window.addEventListener('drop',async e=>{
    if(draggingBookId||!hasFiles(e))return;e.preventDefault();depth=0;document.body.classList.remove('scene-drag-active');overlay?.setAttribute('aria-hidden','true');
    const files=Array.from(e.dataTransfer?.files||[]).filter(f=>/\.(scene|zip)$/i.test(f.name||''));
    if(!files.length){alert('.scene ファイルをドロップしてください。');return;}
    let added=0;
    for(const file of files){try{await addDroppedScene(file);added++;}catch(err){console.error(err);alert(`${file.name||'ファイル'}\n${err.message||'本棚に追加できませんでした。'}`);}}
    if(added){$('#detailDialog').close();await render();}
  });
}

function moveBookBefore(dragId,targetId){
  if(!dragId||!targetId||dragId===targetId)return;
  const grid=$('#grid'),drag=grid?.querySelector(`.book[data-id="${CSS.escape(dragId)}"]`),target=grid?.querySelector(`.book[data-id="${CSS.escape(targetId)}"]`);
  if(!drag||!target)return;
  const books=Array.from(grid.querySelectorAll('.book')),before=new Map(books.map(el=>[el,el.getBoundingClientRect()]));
  const dragIndex=books.indexOf(drag),targetIndex=books.indexOf(target);
  if(dragIndex<targetIndex)grid.insertBefore(drag,target.nextSibling);else grid.insertBefore(drag,target);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    Array.from(grid.querySelectorAll('.book')).forEach(el=>{const a=before.get(el),b=el.getBoundingClientRect();if(!a)return;const dx=a.left-b.left,dy=a.top-b.top;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;el.animate([{transform:`translate3d(${dx}px,${dy}px,0)`},{transform:'translate3d(0,0,0)'}],{duration:190,easing:'cubic-bezier(.2,.8,.2,1)'});});
  }
  persistVisibleOrderFromDom();
}
function waitAnimation(animation,fallback=240){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve();};if(animation){animation.addEventListener?.('finish',finish,{once:true});animation.addEventListener?.('cancel',finish,{once:true});}setTimeout(finish,fallback);});}
async function animateBookIntoBox(id,targetEl=null){
  const book=$(`#grid .book[data-id="${CSS.escape(id)}"]`),box=targetEl||$('#archiveDropZone');
  if(!book||!box||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const a=book.getBoundingClientRect(),b=box.getBoundingClientRect();
  if(!a.width||!a.height||!b.width||!b.height)return;
  const ghost=book.cloneNode(true);ghost.classList.remove('is-dragging','is-drag-target','is-touch-dragging');ghost.classList.add('book-box-flight');ghost.removeAttribute('draggable');
  Object.assign(ghost.style,{left:`${a.left}px`,top:`${a.top}px`,width:`${a.width}px`,height:`${a.height}px`});document.body.appendChild(ghost);
  book.style.visibility='hidden';
  const dx=(b.left+b.width/2)-(a.left+a.width/2),dy=(b.top+b.height/2)-(a.top+a.height/2);
  const anim=ghost.animate([{transform:'translate3d(0,0,0) scale(1)',opacity:1},{transform:`translate3d(${dx}px,${dy}px,0) scale(.2) rotate(2deg)`,opacity:.08}],{duration:240,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
  await waitAnimation(anim,280);ghost.remove();book.style.visibility='';
}
function animateBookOutOfBox(id,fromRect){
  const book=$(`#grid .book[data-id="${CSS.escape(id)}"]`);if(!book||!fromRect||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const r=book.getBoundingClientRect();if(!r.width||!r.height)return;
  const dx=(fromRect.left+fromRect.width/2)-(r.left+r.width/2),dy=(fromRect.top+fromRect.height/2)-(r.top+r.height/2);
  book.animate([{transform:`translate3d(${dx}px,${dy}px,0) scale(.2)`,opacity:.08},{transform:'translate3d(0,0,0) scale(1)',opacity:1}],{duration:280,easing:'cubic-bezier(.16,.84,.26,1)',fill:'both'});
}
async function sendBookToBox(id,targetEl=null){if(!id||!SHELF_ARCHIVE_KEYS[currentShelfTab])return;const target=targetEl||$('#archiveDropZone')||$('#archiveLauncher');await animateBookIntoBox(id,target);archiveBookId(currentShelfTab,id);await render();const liveTarget=target?.id==='archiveLauncher'?$('#archiveLauncher'):$('#archiveDropZone');liveTarget?.animate?.([{transform:'scale(.96)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});toast('段ボール箱にしまいました。');}
function bindBookInteractions(){
  const books=Array.from(document.querySelectorAll('#grid .book')),box=$('#archiveDropZone'),launcher=$('#archiveLauncher');
  books.forEach(book=>{
    book.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();});
    book.addEventListener('selectstart',e=>e.preventDefault());
    book.addEventListener('click',e=>{if(suppressBookClick){e.preventDefault();e.stopPropagation();return;}openDetail(book.dataset.role,book.dataset.id);});
    book.addEventListener('dragstart',e=>{if(matchMedia('(pointer:coarse)').matches){e.preventDefault();return;}draggingBookId=book.dataset.id;desktopReorderTarget='';suppressBookClick=true;book.classList.add('is-dragging');e.dataTransfer?.setData('text/ahako-book-id',book.dataset.id);if(e.dataTransfer)e.dataTransfer.effectAllowed='move';});
    book.addEventListener('dragend',()=>{draggingBookId='';desktopReorderTarget='';book.classList.remove('is-dragging');box?.classList.remove('is-drag-over');launcher?.classList.remove('is-drag-over');document.querySelectorAll('.book.is-drag-target').forEach(x=>x.classList.remove('is-drag-target'));persistVisibleOrderFromDom();setTimeout(()=>{suppressBookClick=false;},80);});
    book.addEventListener('dragover',e=>{const id=draggingBookId;if(!id||id===book.dataset.id)return;e.preventDefault();book.classList.add('is-drag-target');if(desktopReorderTarget!==book.dataset.id){desktopReorderTarget=book.dataset.id;moveBookBefore(id,book.dataset.id);}});
    book.addEventListener('dragleave',()=>book.classList.remove('is-drag-target'));
    book.addEventListener('drop',e=>{const id=draggingBookId||e.dataTransfer?.getData('text/ahako-book-id');if(!id)return;e.preventDefault();desktopReorderTarget='';book.classList.remove('is-drag-target');persistVisibleOrderFromDom();});
  });
  const installArchiveDropTarget=target=>{if(!target)return;target.ondragover=e=>{if(!draggingBookId)return;e.preventDefault();target.classList.add('is-drag-over');if(e.dataTransfer)e.dataTransfer.dropEffect='move';};target.ondragleave=()=>target.classList.remove('is-drag-over');target.ondrop=async e=>{const id=draggingBookId||e.dataTransfer?.getData('text/ahako-book-id');if(!id)return;e.preventDefault();e.stopPropagation();target.classList.remove('is-drag-over');await sendBookToBox(id,target);};};
  installArchiveDropTarget(box);installArchiveDropTarget(launcher);
  installTouchReorder(books,box);
}
function installTouchReorder(_books,box){
  if(touchReorderInstalled||!matchMedia('(pointer:coarse)').matches)return;touchReorderInstalled=true;
  let state=null;
  const pointFor=(e,id)=>{
    const list=e.touches?.length?e.touches:e.changedTouches;
    if(!list)return null;
    for(const t of list)if(t.identifier===id)return t;
    return null;
  };
  const clear=()=>{if(!state){touchBookReordering=false;return;}clearTimeout(state.timer);state.ghost?.remove();state.book?.classList.remove('is-touch-dragging');$('#archiveDropZone')?.classList.remove('is-drag-over');$('#archiveLauncher')?.classList.remove('is-drag-over');document.querySelectorAll('.book.is-drag-target').forEach(x=>x.classList.remove('is-drag-target'));state=null;touchBookReordering=false;};
  window.addEventListener('contextmenu',e=>{if(e.target?.closest?.('#grid .book'))e.preventDefault();},{capture:true});

  // V63.21.4: use touch events instead of pointer capture for iPhone reorder.
  // A normal swipe is left entirely to Safari. Only a finger that remains still
  // through the long-press delay arms reorder; after that, touchmove is cancelled
  // so vertical and horizontal movement both belong to the bookshelf.
  window.addEventListener('touchstart',e=>{
    if(e.touches.length!==1){if(state){clearTimeout(state.timer);state=null;}return;}
    const book=e.target?.closest?.('#grid .book');if(!book)return;
    const t=e.touches[0];
    const st={book,id:book.dataset.id,touchId:t.identifier,x:t.clientX,y:t.clientY,lastX:t.clientX,lastY:t.clientY,lastTarget:'',dragging:false,timer:null,ghost:null};state=st;
    st.timer=setTimeout(()=>{
      if(state!==st||!document.body.contains(book))return;
      st.dragging=true;touchBookReordering=true;suppressBookClick=true;book.classList.add('is-touch-dragging');
      const r=book.getBoundingClientRect();const ghost=book.cloneNode(true);ghost.classList.add('book-drag-ghost');ghost.removeAttribute('draggable');ghost.style.width=`${r.width}px`;ghost.style.left=`${st.x-r.width/2}px`;ghost.style.top=`${st.y-42}px`;document.body.appendChild(ghost);st.ghost=ghost;
      if(navigator.vibrate)navigator.vibrate(18);
    },260);
  },{passive:true});

  window.addEventListener('touchmove',e=>{
    const st=state;if(!st)return;const t=pointFor(e,st.touchId);if(!t)return;
    if(!st.dragging){
      const dx=t.clientX-st.x,dy=t.clientY-st.y;
      // Real scrolling wins immediately when the finger starts moving before
      // the long press has armed. This prevents the shelf from "twitching".
      if(Math.hypot(dx,dy)>9){clearTimeout(st.timer);state=null;}
      return;
    }
    e.preventDefault();
    st.lastX=t.clientX;st.lastY=t.clientY;
    if(t.clientY<105)window.scrollBy(0,-12);else if(t.clientY>window.innerHeight-115)window.scrollBy(0,12);
    if(st.ghost){const r=st.ghost.getBoundingClientRect();st.ghost.style.left=`${t.clientX-r.width/2}px`;st.ghost.style.top=`${t.clientY-42}px`;}
    const target=document.elementFromPoint(t.clientX,t.clientY);const liveBox=$('#archiveDropZone'),liveLauncher=$('#archiveLauncher');const overBox=target?.closest?.('#archiveDropZone'),overLauncher=target?.closest?.('#archiveLauncher');liveBox?.classList.toggle('is-drag-over',!!overBox);liveLauncher?.classList.toggle('is-drag-over',!!overLauncher);
    document.querySelectorAll('.book.is-drag-target').forEach(x=>x.classList.remove('is-drag-target'));
    const targetBook=target?.closest?.('#grid .book');if(targetBook&&targetBook!==st.book){targetBook.classList.add('is-drag-target');if(st.lastTarget!==targetBook.dataset.id){st.lastTarget=targetBook.dataset.id;moveBookBefore(st.id,targetBook.dataset.id);}}
  },{passive:false});

  const finish=async e=>{
    const st=state;if(!st)return;const t=pointFor(e,st.touchId);clearTimeout(st.timer);
    if(!st.dragging){state=null;touchBookReordering=false;return;}
    const x=t?.clientX??st.lastX,y=t?.clientY??st.lastY;const target=document.elementFromPoint(x,y),boxTarget=target?.closest?.('#archiveDropZone,#archiveLauncher');
    persistVisibleOrderFromDom();clear();setTimeout(()=>{suppressBookClick=false;},100);if(boxTarget){await sendBookToBox(st.id,boxTarget);/* Small launcher and open dock both accept consecutive packing. */}
  };
  window.addEventListener('touchend',finish,{passive:true});
  window.addEventListener('touchcancel',e=>{if(state){const was=state.dragging;clear();if(was)setTimeout(()=>{suppressBookClick=false;},100);}},{passive:true});
}

function setArchiveDock(open){
  archiveDockOpen=!!open;
  const launcher=$('#archiveLauncher'),drop=$('#archiveDropZone');
  launcher?.classList.toggle('is-open',archiveDockOpen);launcher?.setAttribute('aria-expanded',archiveDockOpen?'true':'false');
  drop?.classList.toggle('is-dock-open',archiveDockOpen);document.body.classList.toggle('archive-dock-open',archiveDockOpen);
}
function openArchiveBox(){
  if(currentShelfTab==='official')return;
  const list=$('#archiveList'),restoreSelected=$('#restoreSelectedButton'),deleteSelected=$('#deleteSelectedButton'),selectedCount=$('#archiveSelectedCount');
  list.innerHTML=activeArchivedBooks.length?activeArchivedBooks.map(w=>bookCardHtml(w,{archived:true})).join(''):'<div class="archive-empty">箱の中は空です。</div>';
  const checks=()=>Array.from(list.querySelectorAll('.archive-check:checked'));
  const selectedItems=()=>checks().map(ch=>{const item=ch.closest('.archive-item');return item?{id:item.dataset.id||'',title:item.querySelector('.archive-item-copy strong')?.textContent||'この本'}:null;}).filter(x=>x?.id);
  const syncSelection=()=>{
    const n=checks().length;
    if(restoreSelected){restoreSelected.disabled=n===0;restoreSelected.hidden=activeArchivedBooks.length===0;}
    if(deleteSelected){deleteSelected.disabled=n===0;deleteSelected.hidden=activeArchivedBooks.length===0;}
    if(selectedCount)selectedCount.textContent=n?`${n}冊選択`:'本を選択してください';
  };
  list.querySelectorAll('.archive-check').forEach(ch=>ch.addEventListener('change',syncSelection));
  syncSelection();
  if(restoreSelected)restoreSelected.onclick=async()=>{
    const ids=selectedItems().map(x=>x.id);if(!ids.length)return;
    const boxRect=($('#archiveLauncher')&&!$('#archiveLauncher').hidden?$('#archiveLauncher'):$('#archiveDropZone'))?.getBoundingClientRect?.();
    ids.forEach(id=>restoreBookId(currentShelfTab,id));
    $('#archiveDialog').close();
    await render();
    ids.slice(0,8).forEach((id,i)=>setTimeout(()=>animateBookOutOfBox(id,boxRect),i*36));
    toast(`${ids.length}冊を本棚へ戻しました。`);
  };
  if(deleteSelected)deleteSelected.onclick=()=>{
    const items=selectedItems();if(!items.length)return;
    const dialog=$('#deleteArchiveDialog'),summary=$('#deleteArchiveSummary');
    dialog.dataset.tab=currentShelfTab;
    dialog.dataset.ids=JSON.stringify(items.map(x=>x.id));
    if(summary){
      const first=items[0]?.title||'この本';
      summary.textContent=items.length===1?`「${first}」を完全に削除します。`:`選択した${items.length}冊を完全に削除します。`;
    }
    if(!dialog.open)dialog.showModal();
    syncShelfScrollLock();
  };
  if(!$('#archiveDialog').open)$('#archiveDialog').showModal();
  syncShelfScrollLock();
}
function closeBookshelfMenu(){const menu=$('#bookshelfMenu');if(menu)menu.open=false;syncShelfScrollLock();}
function openStudioFromBookshelf(){closeBookshelfMenu();location.href='../studio/?from=bookshelf';}
$('#createStudioIconButton').onclick=$('#emptyCreateButton').onclick=openStudioFromBookshelf;
$('#shelfAddIconButton').onclick=()=>{const role=$('#shelfAddIconButton').dataset.addRole;if(role==='distribution'){$('#distributionInput').dataset.replace='';$('#distributionInput').click();return;}$('#fileInput').dataset.replace='';$('#fileInput').click();};
$('#addButton').onclick=$('#emptyAddButton').onclick=()=>{closeBookshelfMenu();$('#fileInput').dataset.replace='';$('#fileInput').click();};
$('#addDistributionButton').onclick=$('#emptyDistributionButton').onclick=()=>{closeBookshelfMenu();$('#distributionInput').dataset.replace='';$('#distributionInput').click();};
$('#ownedTab').onclick=()=>switchShelf('owned');
$('#createdTab').onclick=()=>switchShelf('created');
$('#officialTab').onclick=()=>switchShelf('official');
$('#distributionInput').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const expected=e.target.dataset.replace||'';const id=await addDistribution(file);if(expected&&expected!==id)toast('別の一冊だったため、新しい一冊として追加しました。');applyShelfTab('owned');$('#detailDialog').close();await render();}catch(err){alert(err.message||'Distributionを追加できませんでした。');}finally{e.target.value='';e.target.dataset.replace='';}};
$('#fileInput').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const expected=e.target.dataset.replace||'';const id=await addMaster(file);if(expected&&expected!==id)toast('別作品のMasterだったため、その作品として追加しました。');applyShelfTab('created');$('#detailDialog').close();await render();}catch(err){alert(err.message||'Masterを追加できませんでした。');}finally{e.target.value='';e.target.dataset.replace='';}};
$('#backupButton').onclick=()=>{closeBookshelfMenu();backupShelf().catch(e=>alert(e.message));};
$('#restoreButton').onclick=()=>{closeBookshelfMenu();$('#restoreInput').click();};
$('#restoreInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{await restoreShelf(f);}catch(err){alert(err.message||'復元できませんでした。');}finally{e.target.value='';}};
$('#exportBoxButton')?.addEventListener('click',()=>exportStorageBox().catch(e=>alert(e.message||'箱を書き出せませんでした。')));
$('#importBoxButton')?.addEventListener('click',()=>$('#boxImportInput')?.click());
$('#boxImportInput')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importStorageBox(f);}catch(err){alert(err.message||'箱を読み込めませんでした。');}finally{e.target.value='';}});

document.addEventListener('click',e=>{const menu=$('#bookshelfMenu');if(menu?.open&&!menu.contains(e.target)){menu.open=false;syncShelfScrollLock();}});
$('#bookshelfMenu')?.addEventListener('toggle',syncShelfScrollLock);
$('#detailDialog')?.addEventListener('close',syncShelfScrollLock);
$('#archiveDialog')?.addEventListener('close',syncShelfScrollLock);
$('#deleteArchiveDialog')?.addEventListener('close',syncShelfScrollLock);
$('#cancelArchiveDelete')?.addEventListener('click',()=>$('#deleteArchiveDialog')?.close());
$('#confirmArchiveDelete')?.addEventListener('click',async()=>{const dialog=$('#deleteArchiveDialog');if(!dialog)return;let ids=[];try{ids=JSON.parse(dialog.dataset.ids||'[]');}catch(_){ids=[];}const tab=dialog.dataset.tab||currentShelfTab;if(!Array.isArray(ids)||!ids.length){dialog.close();return;}const button=$('#confirmArchiveDelete');if(button){button.disabled=true;button.textContent='削除中…';}try{for(const id of ids)await permanentlyDeleteArchivedBook(tab,id);dialog.close();await render();if($('#archiveDialog')?.open)openArchiveBox();toast(`${ids.length}冊を削除しました。`);}catch(err){console.error(err);alert(err?.message||'削除できませんでした。');}finally{if(button){button.disabled=false;button.textContent='削除する';}dialog.dataset.ids='';}});
$('#bookshelfMenu')?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.currentTarget.open=false;syncShelfScrollLock();}});
$('#archiveLauncher').onclick=()=>setArchiveDock(!archiveDockOpen);
$('#archiveDockClose').onclick=e=>{e.preventDefault();e.stopPropagation();setArchiveDock(false);};
$('#archiveDropZone').onclick=()=>{if(matchMedia('(pointer:coarse)').matches&&!archiveDockOpen){setArchiveDock(true);return;}openArchiveBox();};
$('#closeArchive').onclick=()=>$('#archiveDialog').close();
$('#closeDetail').onclick=()=>$('#detailDialog').close();
$('#closeTree').onclick=()=>$('#treeDialog').close();
installSceneDrop();
installShelfScrollGuard();
installDesktopShelfArrowKeys();
installShelfSwipe();
(async()=>{
  // V63.33 — context handoff guard. The source page stores a nonce in
  // sessionStorage and carries the same nonce in the claim URL. If the claim
  // opens in that same browsing context, do NOT consume it. When Safari (or a
  // different normal browser) opens the URL, the source nonce is absent and
  // the claim can be imported safely. No X/LINE user-agent guessing required.
  if(sameClaimSourceContext()){
    // V63.34.2 — clean up the source WebView after Safari handoff.
    if(restoreClaimSourcePage())return;
    showClaimHandoff();
    document.querySelector('[data-claim-open-safari]')?.addEventListener('click',()=>{
      // V63.33.2 EXPERIMENT — ask iOS to hand the exact claim URL to Safari.
      // x-safari-https is intentionally treated as experimental/undocumented;
      // if the host WebView refuses it, the existing native Safari button remains the fallback.
      try{
        const target=new URL(location.href);
        if(target.protocol!=='https:')return;
        const safariUrl=`x-safari-https://${target.host}${target.pathname}${target.search}${target.hash}`;
        location.href=safariUrl;
      }catch(e){console.error(e);}
    });
    document.querySelector('[data-claim-current]')?.addEventListener('click',async()=>{
      const button=document.querySelector('[data-claim-current]');
      if(button)button.disabled=true;
      clearClaimSourceMarker();
      document.body.classList.remove('x-claim-handoff-active');
      document.getElementById('xClaimHandoff')?.remove();
      let claimed=false;
      try{claimed=await importBookshelfClaimFromLocation();}
      catch(e){console.error(e);alert(e?.message||'本棚へ一冊を受け取れませんでした。');}
      await render();
      await restoreShelfScroll(currentShelfTab);
      if(claimed)toast('自分の一冊を本棚に受け取りました。');
    },{once:true});
    return;
  }
  let claimed=false;
  try{claimed=await importBookshelfClaimFromLocation();}
  catch(e){console.error(e);alert(e?.message||'本棚へ一冊を受け取れませんでした。');}
  await render();
  await restoreShelfScroll(currentShelfTab);
  if(claimed)toast('自分の一冊を本棚に受け取りました。');
})().catch(e=>{console.error(e);alert('本棚を開けませんでした。');});
})();
