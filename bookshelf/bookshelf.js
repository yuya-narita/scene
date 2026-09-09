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
let archiveDockOpen=false;
let mobileShelfColumns=loadMobileColumns();
let pinchGesture=null;
const insightsCache=new Map();

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
async function inspectMaster(file){const entries=await readZipEntries(file);const sceneBytes=entries.get('scene.json');if(!sceneBytes)throw new Error('scene.json がありません。');const doc=parseJson(sceneBytes);const manifest=entries.get('manifest.json')?parseJson(entries.get('manifest.json')):{};const role=String(manifest.packageRole||doc?.package?.role||'').toLowerCase();if(role==='distribution')throw new Error('これは配布版です。本棚には作者の Master .scene を追加してください。');const workId=String(doc?.studio?.identity?.workId||doc?.workId||'').trim();if(!workId)throw new Error('Master の workId を確認できません。');if(!doc?.studio?.identity&&!entries.has('studio-state.json'))throw new Error('Master .scene と確認できないため追加を止めました。');let coverBlob=null;const coverPath=String(doc?.cover?.src||manifest?.cover?.image||'').replace(/^\.\//,'');if(coverPath&&entries.has(coverPath))coverBlob=new Blob([entries.get(coverPath)],{type:mime(coverPath)});return{workId,title:String(doc.title||manifest.title||'Untitled'),author:String(doc.author||manifest.author||''),sceneCount:Array.isArray(doc.scenes)?doc.scenes.length:0,revision:Number(doc?.studio?.identity?.revision||0)||0,masterCreatedAt:String(doc?.studio?.identity?.createdAt||''),coverBlob,blob:new Blob([await file.arrayBuffer()],{type:'application/octet-stream'})};}
async function addMaster(file,{silent=false}={}){const info=await inspectMaster(file);const old=await getWork(info.workId);const now=new Date().toISOString();await putWork({...info,fileName:file.name||`${info.title}.scene`,addedAt:old?.addedAt||now,updatedAt:now});if(!silent)toast(old?'同じ作品のMasterを更新しました。':'Masterを本棚に追加しました。');return info.workId;}
async function inspectDistribution(file){const entries=await readZipEntries(file);const sceneBytes=entries.get('scene.json');if(!sceneBytes)throw new Error('scene.json がありません。');const doc=parseJson(sceneBytes);const manifest=entries.get('manifest.json')?parseJson(entries.get('manifest.json')):{};const role=String(manifest.packageRole||doc?.package?.role||'').toLowerCase();if(role!=='distribution')throw new Error('これは Distribution .scene ではありません。');const copyId=String(doc?.distribution?.copyId||manifest?.copyId||'').trim();const workId=String(doc?.distribution?.workId||manifest?.workId||doc?.workId||'').trim();const editionId=String(doc?.edition?.editionId||manifest?.editionId||'').trim();if(!/^copy_[a-f0-9]{32}$/i.test(copyId))throw new Error('Distribution の copyId を確認できません。');if(!/^[A-Za-z0-9_-]{12,80}$/.test(workId))throw new Error('Distribution の workId を確認できません。');let coverBlob=null;const coverPath=String(doc?.cover?.src||manifest?.cover?.image||'').replace(/^\.\//,'');if(coverPath&&entries.has(coverPath))coverBlob=new Blob([entries.get(coverPath)],{type:mime(coverPath)});const coverUrl=/^https?:\/\//i.test(String(doc?.cover?.src||''))?String(doc.cover.src):'';return{role:'distribution',copyId,workId,editionId,title:String(doc.title||manifest.title||'Untitled'),author:String(doc.author||manifest.author||''),sceneCount:Array.isArray(doc.scenes)?doc.scenes.length:0,relayEnabled:doc?.sharing?.relay?.enabled!==false,issuedAt:String(doc?.distribution?.issuedAt||doc?.edition?.issuedAt||''),coverBlob,coverUrl,blob:new Blob([await file.arrayBuffer()],{type:'application/octet-stream'})};}
async function addDistribution(file,{silent=false}={}){const info=await inspectDistribution(file);const old=await getReaderBook(info.copyId);const now=new Date().toISOString();await putReaderBook({...info,fileName:file.name||`${info.title}_distribution.scene`,addedAt:old?.addedAt||now,updatedAt:now});if(!silent)toast(old?'同じ一冊を更新しました。':'自分の一冊を本棚に追加しました。');return info.copyId;}


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
  const grid=$('#grid');if(!grid||grid.dataset.pinchInstalled==='1')return;grid.dataset.pinchInstalled='1';
  applyMobileColumns(loadMobileColumns());
  const mobile=()=>matchMedia('(max-width:680px) and (pointer:coarse)').matches;
  grid.addEventListener('touchstart',e=>{
    if(!mobile()||e.touches.length!==2)return;
    const d=touchDistance(e.touches);if(!d)return;
    pinchGesture={startDistance:d,startColumns:mobileShelfColumns,lastColumns:mobileShelfColumns};
    // Two fingers are always shelf zoom, never book long-press/reorder.
    e.preventDefault();
  },{passive:false});
  grid.addEventListener('touchmove',e=>{
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
  grid.addEventListener('touchend',finish,{passive:true});
  grid.addEventListener('touchcancel',finish,{passive:true});
  // iOS Safari may emit gesture events in addition to touch events.
  grid.addEventListener('gesturestart',e=>{if(mobile())e.preventDefault();},{passive:false});
  grid.addEventListener('gesturechange',e=>{if(mobile())e.preventDefault();},{passive:false});
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
function bookCardHtml(w,{archived=false}={}){
  const badge=w.role==='distribution'?'MY COPY':'MASTER',id=shelfIdOf(w);
  const image=w.coverBlob?(()=>{const u=URL.createObjectURL(w.coverBlob);coverUrls.push(u);return`<img src="${u}" alt="" draggable="false">`})():(w.coverUrl?`<img src="${escapeHtml(w.coverUrl)}" alt="" draggable="false">`:`<div class="cover-fallback">□</div>`);
  if(archived)return`<div class="archive-item" data-role="${w.role}" data-id="${escapeHtml(id)}"><div class="archive-thumb">${image}</div><div class="archive-item-copy"><strong>${escapeHtml(w.title)}</strong><span>${escapeHtml(w.author||'作者未設定')} · ${w.sceneCount||0} Scene</span></div><button class="archive-restore" type="button">本棚へ戻す</button></div>`;
  return`<button class="book" data-role="${w.role}" data-id="${escapeHtml(id)}" draggable="true" type="button"><div class="cover">${image}<span class="badge ${w.role==='distribution'?'reader-badge':''}">${badge}</span></div><div class="book-meta"><h3>${escapeHtml(w.title)}</h3><p>${escapeHtml(w.author||'作者未設定')} · ${w.sceneCount||0} Scene</p></div></button>`;
}

function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtDate(v){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);}
function coverHtml(w,cls=''){if(w.coverBlob){const u=URL.createObjectURL(w.coverBlob);coverUrls.push(u);return`<div class="${cls}"><img src="${u}" alt=""></div>`;}return`<div class="${cls}"><div class="cover-fallback">□</div></div>`;}
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
async function render(){
  coverUrls.forEach(URL.revokeObjectURL);coverUrls=[];
  const masters=(await getAllWorks()).map(w=>({...w,role:'master'}));
  const readers=(await getAllReaderBooks()).map(w=>({...w,role:'distribution'}));
  shelfCounts={owned:readers.length,created:masters.length};
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
  const archiveVisible=!official&&source.length>0;
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
  // Re-read the persisted density on every render/reload before applying it.
  // This prevents the default 2-column value from briefly/incorrectly winning on Safari reload.
  mobileShelfColumns=loadMobileColumns();
  applyMobileColumns(mobileShelfColumns);
  installShelfPinch();
  bindBookInteractions();
}
async function switchShelf(tab){applyShelfTab(tab);await render();}
async function openDetail(role,id){const isReader=role==='distribution',w=isReader?await getReaderBook(id):await getWork(id);if(!w)return;currentWorkId=id;const cover=w.coverBlob?(()=>{const u=URL.createObjectURL(w.coverBlob);coverUrls.push(u);return`<div class="detail-cover"><img src="${u}" alt=""></div>`})():(w.coverUrl?`<div class="detail-cover"><img src="${escapeHtml(w.coverUrl)}" alt=""></div>`:`<div class="detail-cover"><div class="cover-fallback">□</div></div>`);if(isReader){const relayAction=w.relayEnabled===false?'':`<button id="relayDistribution" class="journey" type="button">次の一人へ</button>`;$('#detailContent').innerHTML=`<div class="detail-hero">${cover}<div class="detail-copy"><p class="eyebrow">MY COPY</p><h2>${escapeHtml(w.title)}</h2><p>${escapeHtml(w.author||'作者未設定')}</p><p>${w.sceneCount||0} Scene</p><p>本棚追加 ${escapeHtml(fmtDate(w.addedAt))}</p></div></div><div class="actions"><button id="readDistribution" class="edit" type="button">読む</button>${relayAction}<button id="removeWork" class="danger" type="button">本棚から外す</button></div><p class="detail-note">${w.relayEnabled===false?'この一冊は「もっている本」に保存されています。作者の設定によりRELAYは無効です。':'この一冊は「もっている本」に保存されています。読むことも、そのまま次の一人へ送ることもできます。'}</p>`;$('#detailDialog').showModal();const openReaderCopy=(relayNow=false)=>{try{sessionStorage.setItem('ahako:bookshelf:open-copy',w.copyId);}catch(_){}const q=new URLSearchParams({bookshelfCopy:w.copyId});if(relayNow)q.set('relayNow','1');location.href=`../local-player/?${q.toString()}`;};$('#readDistribution').onclick=()=>openReaderCopy(false);if($('#relayDistribution'))$('#relayDistribution').onclick=()=>openReaderCopy(true);$('#removeWork').onclick=async()=>{if(!confirm(`「${w.title}」を本棚から外しますか？`))return;await deleteReaderBook(id);$('#detailDialog').close();await render();toast('本棚から外しました。');};return;}$('#detailContent').innerHTML=`<div class="detail-hero">${cover}<div class="detail-copy"><p class="eyebrow">MASTER</p><h2>${escapeHtml(w.title)}</h2><p>${escapeHtml(w.author||'作者未設定')}</p><p>${w.sceneCount||0} Scene · revision ${w.revision||0}</p><p>本棚更新 ${escapeHtml(fmtDate(w.updatedAt))}</p></div></div><section id="strengthPanel" class="strength-panel"><div class="strength-loading">作品の力を観測しています…</div></section><section id="journeyPanel" class="journey-panel" hidden></section><div class="actions"><button id="editWork" class="edit" type="button">Studioで編集</button><button id="viewJourney" class="journey" type="button">旅を見る</button><button id="exportMaster" type="button">Masterを書き出す</button><button id="replaceMaster" type="button">Masterを更新</button><button id="removeWork" class="danger" type="button">本棚から外す</button></div><p class="detail-note">「本棚から外す」は、このブラウザ内の本棚コピーだけを削除します。手元に書き出した .scene ファイルまでは削除しません。</p>`;$('#detailDialog').showModal();loadStrengths(w);$('#editWork').onclick=()=>editInStudio(w);$('#viewJourney').onclick=()=>loadJourney(w);$('#exportMaster').onclick=()=>downloadBlob(w.blob,w.fileName||`${w.title}.scene`);$('#replaceMaster').onclick=()=>{$('#fileInput').dataset.replace=id;$('#fileInput').click();};$('#removeWork').onclick=async()=>{if(!confirm(`「${w.title}」を本棚から外しますか？`))return;await deleteWork(id);$('#detailDialog').close();await render();toast('本棚から外しました。');};}
async function fetchInsights(workId,{force=false}={}){if(!force&&insightsCache.has(workId))return insightsCache.get(workId);const res=await fetch(`${API_BASE}/bookshelf-insights/${encodeURIComponent(workId)}?days=7`,{headers:{Accept:'application/json'},cache:'no-store'});const data=await res.json().catch(()=>null);if(!res.ok||!data?.ok)throw new Error(data?.error||`HTTP ${res.status}`);insightsCache.set(workId,data);return data;}
function strengthCard(label,ratio,sample,minimum,formula,{provisional=false}={}){const enough=sample>=minimum;const pct=Number.isFinite(Number(ratio))?Math.round(Math.max(0,Number(ratio))*100):0;const shownPct=Math.min(999,pct);return`<div class="strength-card${enough?'':' is-observing'}"><div class="strength-label"><strong>${label}</strong><span>${formula}</span></div>${enough?`<div class="strength-value">${shownPct}<small>%</small></div><div class="strength-meter"><i style="width:${Math.min(100,shownPct)}%"></i></div>`:`<div class="strength-observing">まだ観測中</div><div class="strength-sample">${Math.max(0,sample)} / ${minimum}</div>`}${provisional?'<p>「自分の一冊」はV63.15以降の保存から計測しています。</p>':''}</div>`;}
function renderStrengths(panel,data){const all=data?.allTime||{},strength=data?.strengths?.allTime||{},minimum=Math.max(1,Number(data?.strengths?.minimumSample||10));panel.innerHTML=`<div class="strength-head"><div><p class="eyebrow">WORK SIGNAL</p><h3>作品の力</h3></div><span>匿名集計</span></div><div class="strength-grid">${strengthCard('旅する力',strength.journey,Math.max(0,Number(all.completions||0)),minimum,'次の一人へ ÷ 読了')}${strengthCard('本棚に残る力',strength.bookshelf,Math.max(0,Number(all.completions||0)),minimum,'自分の一冊 ÷ 読了',{provisional:true})}${strengthCard('最後まで読まれる力',strength.completion,Math.max(0,Number(all.observedReaders||0)),minimum,'読了 ÷ 観測読者')}</div><p class="strength-note">数字が少ない間は評価を固定せず「まだ観測中」と表示します。作品ごとの強さを、人気順ではなく読者の行動から見ます。</p>`;}
async function loadStrengths(w){const panel=$('#strengthPanel');if(!panel)return;try{const data=await fetchInsights(w.workId);if(currentWorkId!==w.workId)return;renderStrengths(panel,data);}catch(err){console.error(err);if(currentWorkId!==w.workId)return;panel.innerHTML='<div class="strength-error">作品の力を読み込めませんでした。</div>';}}
async function loadJourney(w){const panel=$('#journeyPanel'),button=$('#viewJourney');if(!panel||!button)return;panel.hidden=false;panel.innerHTML='<div class="journey-loading">旅の記録を読み込んでいます…</div>';button.disabled=true;button.textContent='読み込み中…';try{const data=await fetchInsights(w.workId,{force:true});currentJourneyData=data;currentJourneyTitle=w.title||'作品の木';renderStrengths($('#strengthPanel'),data);renderJourney(panel,data);button.textContent='旅を更新';}catch(err){console.error(err);panel.innerHTML=`<div class="journey-error"><strong>旅の記録を読み込めませんでした。</strong><span>通信状態またはWorkerの更新を確認してください。</span></div>`;button.textContent='もう一度読み込む';}finally{button.disabled=false;}}
function workJourneyTreeSvg(journeys){
  if(!Array.isArray(journeys)||!journeys.length)return'';
  // workId を植木鉢＝一本の根として、copyId / RELAY の旅を上方向へ育てる。
  // 内部IDは表示せず、各一冊は「発行」の節、到達は●、未到達は○として描画する。
  const root={type:'work',children:journeys.map(j=>j&&j.tree).filter(Boolean)};
  const nodes=[],edges=[];let leaf=0,maxLevel=0;
  const X_GAP=58,Y_GAP=68,LEFT=34,TOP=28,BOTTOM=48;
  function levelOf(node){
    if(node.type==='work')return 0;
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
    if(n.type==='work')return`<g class="work-root"><path d="M${n.__x-9} ${n.__y-5}h18l-3 12h-12z"/><line class="work-trunk" x1="${n.__x}" y1="${n.__y-18}" x2="${n.__x}" y2="${n.__y-5}"/><text x="${n.__x}" y="${n.__y+21}" text-anchor="middle">作品</text></g>`;
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
async function animateBookIntoBox(id){
  const book=$(`#grid .book[data-id="${CSS.escape(id)}"]`),box=$('#archiveDropZone');
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
async function sendBookToBox(id){if(!id||!SHELF_ARCHIVE_KEYS[currentShelfTab])return;await animateBookIntoBox(id);archiveBookId(currentShelfTab,id);await render();$('#archiveDropZone')?.animate?.([{transform:'scale(.96)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});toast('段ボール箱にしまいました。');}
function bindBookInteractions(){
  const books=Array.from(document.querySelectorAll('#grid .book')),box=$('#archiveDropZone');
  books.forEach(book=>{
    book.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();});
    book.addEventListener('selectstart',e=>e.preventDefault());
    book.addEventListener('click',e=>{if(suppressBookClick){e.preventDefault();e.stopPropagation();return;}openDetail(book.dataset.role,book.dataset.id);});
    book.addEventListener('dragstart',e=>{if(matchMedia('(pointer:coarse)').matches){e.preventDefault();return;}draggingBookId=book.dataset.id;desktopReorderTarget='';suppressBookClick=true;book.classList.add('is-dragging');e.dataTransfer?.setData('text/ahako-book-id',book.dataset.id);if(e.dataTransfer)e.dataTransfer.effectAllowed='move';});
    book.addEventListener('dragend',()=>{draggingBookId='';desktopReorderTarget='';book.classList.remove('is-dragging');box?.classList.remove('is-drag-over');document.querySelectorAll('.book.is-drag-target').forEach(x=>x.classList.remove('is-drag-target'));persistVisibleOrderFromDom();setTimeout(()=>{suppressBookClick=false;},80);});
    book.addEventListener('dragover',e=>{const id=draggingBookId;if(!id||id===book.dataset.id)return;e.preventDefault();book.classList.add('is-drag-target');if(desktopReorderTarget!==book.dataset.id){desktopReorderTarget=book.dataset.id;moveBookBefore(id,book.dataset.id);}});
    book.addEventListener('dragleave',()=>book.classList.remove('is-drag-target'));
    book.addEventListener('drop',e=>{const id=draggingBookId||e.dataTransfer?.getData('text/ahako-book-id');if(!id)return;e.preventDefault();desktopReorderTarget='';book.classList.remove('is-drag-target');persistVisibleOrderFromDom();});
  });
  if(box){box.ondragover=e=>{if(!draggingBookId)return;e.preventDefault();box.classList.add('is-drag-over');if(e.dataTransfer)e.dataTransfer.dropEffect='move';};box.ondragleave=()=>box.classList.remove('is-drag-over');box.ondrop=async e=>{const id=draggingBookId||e.dataTransfer?.getData('text/ahako-book-id');if(!id)return;e.preventDefault();box.classList.remove('is-drag-over');await sendBookToBox(id);};}
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
  const clear=()=>{if(!state)return;clearTimeout(state.timer);state.ghost?.remove();state.book?.classList.remove('is-touch-dragging');$('#archiveDropZone')?.classList.remove('is-drag-over');document.querySelectorAll('.book.is-drag-target').forEach(x=>x.classList.remove('is-drag-target'));state=null;};
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
      st.dragging=true;suppressBookClick=true;book.classList.add('is-touch-dragging');
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
    const target=document.elementFromPoint(t.clientX,t.clientY);const liveBox=$('#archiveDropZone');const overBox=target?.closest?.('#archiveDropZone');liveBox?.classList.toggle('is-drag-over',!!overBox);
    document.querySelectorAll('.book.is-drag-target').forEach(x=>x.classList.remove('is-drag-target'));
    const targetBook=target?.closest?.('#grid .book');if(targetBook&&targetBook!==st.book){targetBook.classList.add('is-drag-target');if(st.lastTarget!==targetBook.dataset.id){st.lastTarget=targetBook.dataset.id;moveBookBefore(st.id,targetBook.dataset.id);}}
  },{passive:false});

  const finish=async e=>{
    const st=state;if(!st)return;const t=pointFor(e,st.touchId);clearTimeout(st.timer);
    if(!st.dragging){state=null;return;}
    const x=t?.clientX??st.lastX,y=t?.clientY??st.lastY;const target=document.elementFromPoint(x,y),toBox=!!target?.closest?.('#archiveDropZone');
    persistVisibleOrderFromDom();clear();setTimeout(()=>{suppressBookClick=false;},100);if(toBox){await sendBookToBox(st.id);setArchiveDock(false);}
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
  const list=$('#archiveList');
  list.innerHTML=activeArchivedBooks.length?activeArchivedBooks.map(w=>bookCardHtml(w,{archived:true})).join(''):'<div class="archive-empty">箱の中は空です。</div>';
  list.querySelectorAll('.archive-restore').forEach(btn=>btn.onclick=async()=>{
    const item=btn.closest('.archive-item'),id=item?.dataset.id;if(!id)return;
    const boxRect=$('#archiveDropZone')?.getBoundingClientRect?.();
    if(item&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const a=item.animate([{transform:'scale(1)',opacity:1},{transform:'scale(.92)',opacity:0}],{duration:140,easing:'ease-in',fill:'forwards'});await waitAnimation(a,170);}
    restoreBookId(currentShelfTab,id);$('#archiveDialog').close();await render();animateBookOutOfBox(id,boxRect);toast('本棚へ戻しました。');
  });
  $('#archiveDialog').showModal();
}
function closeBookshelfMenu(){const menu=$('#bookshelfMenu');if(menu)menu.open=false;}
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

document.addEventListener('click',e=>{const menu=$('#bookshelfMenu');if(menu?.open&&!menu.contains(e.target))menu.open=false;});
$('#archiveLauncher').onclick=()=>setArchiveDock(!archiveDockOpen);
$('#archiveDockClose').onclick=e=>{e.preventDefault();e.stopPropagation();setArchiveDock(false);};
$('#archiveDropZone').onclick=()=>{if(matchMedia('(pointer:coarse)').matches&&!archiveDockOpen){setArchiveDock(true);return;}openArchiveBox();};
$('#closeArchive').onclick=()=>$('#archiveDialog').close();
$('#closeDetail').onclick=()=>$('#detailDialog').close();
$('#closeTree').onclick=()=>$('#treeDialog').close();
installSceneDrop();
render().catch(e=>{console.error(e);alert('本棚を開けませんでした。');});
})();
