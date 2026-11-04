const API='https://scene-studio-api.a-hako.workers.dev';
const READ_LATER_STORAGE_KEY='ahako:read-later:v1';
const stage=document.querySelector('#stage'),picked=document.querySelector('#picked'),store=document.querySelector('#store');
let books=[],allBooks=[],ownedBooks=[],ownedCoverUrls=[],index=0,drag=null,dragUnits=0,suppressClickUntil=0,currentPicked=null,detailDrag=null,spinToken=0,detailPreview=null;
let viewMode='ring',pathProgress=0,pathYaw=0,pathDrag=null,motionOn=false,lastAccelMag=0;
let introReady=false,hallYaw=0,hallPreview=0,hallDrag=null,hallMotionOn=false,hallMotionLastAlpha=null,hallShelfRing=false,hallShelfKind='new',hallLibraryKind='mine';
let pathVelocity=0,pathRaf=0,pathLastFrame=0,pathMotionEnergy=0,pathMotionLast=0;
let pathBookHold=null;
// V2.19.8 — remember both the outer circular road and the straight genre approach.
let lastOuterPathProgress=0,lastForestPathProgress=0,lastFantasyEntryRoute='path';
let roomId='new',routeTransitioning=false,dataReady=false,activeGenreId='fantasy';
let approachOriginRoom=null;
let roomShelfMode=false,roomShelfAllBooks=[],roomShelfScrollRaf=0;
let fantasyGateTimer=0,fantasyGateVisible=false;
const roomHistory=[];
const PATH_DRAG_PX_PER_BOOK=150;
const PATH_MAX_VELOCITY=.008;
const PATH_EXIT_PAD=1.0;
// V2.20.0 — eight continuous genre sections around the circular Book Road.
// Backgrounds are independent WebP assets; labels/branch guidance stay in HTML/UI.
const PATH_BOOKS_PER_ZONE_TEST=12; // V2.20.3 TEST: hold each genre background for 12 book positions
const SHARED_GENRE_APPROACH_BG='./bookstore-path-fantasy-v2113.webp';
const SHARED_GENRE_ROOM_BG='./fantasy-room-360-v2165.webp';
const PATH_ZONES=[
 {id:'fantasy',label:'FANTASY',jp:'ファンタジー',bg:'./book-road-straight-01-fantasy-v2315.webp',approachBg:SHARED_GENRE_APPROACH_BG,roomBg:SHARED_GENRE_ROOM_BG,pos:'50% 50%',gate:'ファンタジー'},
 {id:'romance',label:'ROMANCE',jp:'恋愛',bg:'./book-road-straight-02-romance-v2315.webp',approachBg:'./genre-approach-romance-v2314.webp',roomBg:'./genre-room-romance-v2312.webp',pos:'50% 50%',gate:'恋愛'},
 {id:'horror',label:'HORROR',jp:'ホラー',bg:'./book-road-straight-03-horror-v2315.webp',approachBg:'./genre-approach-horror-v2314.webp',roomBg:'./genre-room-horror-v2312.webp',pos:'50% 50%',gate:'ホラー'},
 {id:'mystery',label:'MYSTERY',jp:'ミステリ',bg:'./book-road-straight-04-mystery-v2315.webp',approachBg:'./genre-approach-mystery-v2314.webp',roomBg:'./genre-room-mystery-v2312.webp',pos:'50% 50%',gate:'ミステリ'},
 {id:'sf',label:'SF',jp:'SF',bg:'./book-road-straight-05-sf-v2315.webp',approachBg:'./genre-approach-sf-v2314.webp',roomBg:'./genre-room-sf-v2312.webp',pos:'50% 50%',gate:'SF'},
 {id:'everyday',label:'EVERYDAY',jp:'日常',bg:'./book-road-straight-06-everyday-v2315.webp',approachBg:'./genre-approach-everyday-v2314.webp',roomBg:'./genre-room-everyday-v2312.webp',pos:'50% 50%',gate:'日常'},
 {id:'essay',label:'ESSAY',jp:'エッセイ',bg:'./book-road-straight-07-essay-v2315.webp',approachBg:'./genre-approach-essay-v2314.webp',roomBg:'./genre-room-essay-v2312.webp',pos:'50% 50%',gate:'エッセイ'},
 {id:'other',label:'OTHER',jp:'その他',bg:'./book-road-straight-08-other-v2315.webp',approachBg:'./genre-approach-other-v2314.webp',roomBg:'./genre-room-other-v2312.webp',pos:'50% 50%',gate:'その他'}
];
const PATH_ZONE_COUNT=PATH_ZONES.length;
function outerPathLength(){return PATH_BOOKS_PER_ZONE_TEST*PATH_ZONE_COUNT;}
let pathZoneId='',pathZoneBgFront='a',pathZoneEntryProgress=0,pathZoneSignTimer=0;
const pathZonePreloadJobs=new Map();let pathZonePaintToken=0;
function preloadPathZone(src){if(pathZonePreloadJobs.has(src))return pathZonePreloadJobs.get(src);const job=new Promise(resolve=>{const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve();};img.decoding='async';img.onload=async()=>{try{if(img.decode)await img.decode();}catch(_){}finish();};img.onerror=finish;img.src=src;if(img.complete&&img.naturalWidth>0){Promise.resolve(img.decode?.()).catch(()=>{}).finally(finish);}setTimeout(finish,5000);});pathZonePreloadJobs.set(src,job);return job;}
PATH_ZONES.forEach(z=>preloadPathZone(z.bg));
const PATH_GATE_REVEAL_PAD=.12;
const FOREST_TRAVEL=5.5; // straight approach distance; percentage is only a route-progress indicator
const FOREST_APPROACH_BOOKS=4; // let a finite set of covers pass, then leave a clear view before the entrance card
// V2.3: shelf is now an explicit axis. Today there is one public shelf; future genres can be added here.
let shelfIndex=0;
// V2.15.0 — each Room is a circular ring of tall shelf faces.
// Only the front shelf is rendered at full detail; horizontal swipes rotate shelves.
const ROOM_SHELF_CAPACITY=12;
function roomShelfColumns(){return 4;}
function roomShelfCapacity(){return roomShelfColumns()*6;}
let roomShelfFace=0;
// V2.16.0 — shared Room camera: shelf ring + background + optional device yaw.
let roomCameraYaw=0,roomCameraPreview=0,roomMotionOn=false,roomMotionBaseAlpha=null,roomMotionLastAlpha=null;
// V2.16.12 — shared Room camera + offscreen shelf exit. Shelf faces stay mounted until fully beyond the viewport.
let roomCameraInputLock=false,roomCameraSettleRaf=0,roomMotionLatestAlpha=null,roomMotionRenderRaf=0;
// V2.16.15 — the background follows the true camera immediately, while the shelf gets a tiny
// compositor-only visual buffer. This evens out 2–6px frame jumps that are especially visible
// on cover edges/text in iPhone Safari without changing the actual camera or snap logic.
let roomShelfVisualYaw=null,roomShelfVisualTargetYaw=0,roomShelfVisualRaf=0,roomShelfVisualLastTs=0;
let roomVisibleFace=0; // V2.16.5: shelf faces live at fixed world angles; null means scenery-only view.
const ROOM_SHELF_SNAP_DEG=24,ROOM_SHELF_SHOW_DEG=58,ROOM_SWIPE_DEG_PER_PX=.22,ROOM_VIEW_SLOT_DEG=90;
const shelves=[{id:'new',label:'新しく入った本'},{id:'fantasy',label:'ファンタジーの本棚'}];
// V2.18.19 — Room Preloader. Decode the next room background before entry so the
// CSS fade always owns a real, paintable image and can never be outrun by the ring.
const ROOM_BG_ASSETS=Object.fromEntries(PATH_ZONES.map(z=>[z.id,z.roomBg]));
const roomBgPreloadJobs=new Map();
function preloadRoomBackground(id){
  const src=ROOM_BG_ASSETS[id];if(!src)return Promise.resolve();
  if(roomBgPreloadJobs.has(id))return roomBgPreloadJobs.get(id);
  const job=new Promise(resolve=>{
    const img=new Image();let done=false;
    const finish=()=>{if(done)return;done=true;resolve();};
    img.decoding='async';
    img.onload=async()=>{try{if(img.decode)await img.decode();}catch(_){}finish();};
    img.onerror=finish;img.src=src;
    if(img.complete&&img.naturalWidth>0){Promise.resolve(img.decode?.()).catch(()=>{}).finally(finish);}
    // Never deadlock room entry on a broken/very slow asset.
    setTimeout(finish,6000);
  });
  roomBgPreloadJobs.set(id,job);return job;
}
function primeNextRoomBackground(id){preloadRoomBackground(id).catch(()=>{});}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function playerUrl(work){const player=new URL('../',location.href),raw=new URL(`${API}/work/${encodeURIComponent(work.publicationId)}`);raw.searchParams.set('raw','1');player.searchParams.set('src',raw);player.searchParams.set('returnTo',location.href);return player.toString();}
// V2.21.0 — Bookstore and Bookshelf share the same reader-copy IndexedDB.
// The bookstore never duplicates MY COPY data; it only presents the existing shelf rows.
const BOOKSHELF_DB_NAME='ahako-local-bookshelf',BOOKSHELF_DB_VERSION=3,BOOKSHELF_READER_STORE='readerBooks';
const OWNED_ORDER_KEY='ahako:bookshelf:order:owned',OWNED_ARCHIVE_KEY='ahako:bookshelf:archive:owned';
function readLocalIdList(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v.map(String):[];}catch(_){return[];}}
function openBookshelfDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(BOOKSHELF_DB_NAME,BOOKSHELF_DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(BOOKSHELF_READER_STORE))db.createObjectStore(BOOKSHELF_READER_STORE,{keyPath:'copyId'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function getOwnedReaderRows(){const db=await openBookshelfDb();try{return await new Promise((resolve,reject)=>{const r=db.transaction(BOOKSHELF_READER_STORE,'readonly').objectStore(BOOKSHELF_READER_STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}finally{db.close();}}
function ownedCoverBlob(w){const value=w?.coverBytes;if(value instanceof ArrayBuffer||ArrayBuffer.isView(value))return new Blob([value],{type:w.coverMime||'application/octet-stream'});return w?.coverBlob instanceof Blob?w.coverBlob:null;}
function ownedPlayerUrl(w){const q=new URLSearchParams({bookshelfCopy:w.copyId});const returnUrl=new URL(location.href);if(viewMode==='reading-room')returnUrl.hash='reading-room';q.set('returnTo',returnUrl.href);return `../local-player/?${q.toString()}`;}
function normalizeOwnedBook(w){const blob=ownedCoverBlob(w);let coverUrl=w.coverUrl||'';if(blob){coverUrl=URL.createObjectURL(blob);ownedCoverUrls.push(coverUrl);}const authorName=w.author?.displayName||w.authorName||w.byline||w.creator||'';return {...w,_ownedCopy:true,publicationId:w.publicationId||`owned:${w.copyId}`,coverUrl,author:{...(w.author||{}),displayName:authorName||'作者'}};}
async function syncOwnedBooks(){try{ownedCoverUrls.forEach(u=>URL.revokeObjectURL(u));ownedCoverUrls=[];const rows=await getOwnedReaderRows(),archived=new Set(readLocalIdList(OWNED_ARCHIVE_KEY)),order=readLocalIdList(OWNED_ORDER_KEY),rank=new Map(order.map((id,i)=>[id,i]));ownedBooks=rows.filter(w=>w?.copyId&&!archived.has(String(w.copyId))).sort((a,b)=>(rank.get(String(a.copyId))??999999)-(rank.get(String(b.copyId))??999999)||String(b.updatedAt||b.addedAt||'').localeCompare(String(a.updatedAt||a.addedAt||''))).map(normalizeOwnedBook);const label=document.querySelector('#hallMyShelf .hall-my-shelf-label span');if(label)label.textContent=ownedBooks.length?`${ownedBooks.length}冊`:'まだ本がありません';return ownedBooks;}catch(e){console.warn('MY BOOKS sync failed',e);ownedBooks=[];return ownedBooks;}}
function detailReadUrl(w){if(!w)return '#';if(w._ownedCopy)return ownedPlayerUrl(w);return playerUrl(w);}
function norm(n){return books.length?((n%books.length)+books.length)%books.length:0;}
function signedOffset(i){let d=i-index;if(d>books.length/2)d-=books.length;if(d<-books.length/2)d+=books.length;return d;}
function bookMarkup(w){return `<span class="book-shell"><span class="book-spine"></span><span class="book-pages"></span><span class="book-bottom"></span><span class="book-face">${w.coverUrl?`<span class="cover-loading">あ□</span><img src="${esc(w.coverUrl)}" alt="" decoding="async">`:'<span class="fallback">あ□</span>'}</span></span>`;}
function hydrateCoverLoadState(root=document){root.querySelectorAll('.book-face img').forEach(img=>{const face=img.closest('.book-face');const done=()=>face?.classList.add('is-cover-loaded');if(img.complete&&img.naturalWidth>0)done();else{img.addEventListener('load',done,{once:true});img.addEventListener('error',()=>face?.classList.add('is-cover-error'),{once:true});}});}
// V2.4 — continuous circular ring. Every book owns a live angular position;
// the centered book is never replaced at rest, it simply arrives at angle 0.
const RING_STEP_DEG=27;
function setBookPose(b,pos,introDepth=1){
  const angle=pos*RING_STEP_DEG,rad=angle*Math.PI/180;
  const radius=Math.min(430,Math.max(320,stage.clientWidth*.52));
  const intro=Math.max(.08,Math.min(1,introDepth));
  const x=Math.sin(rad)*radius*intro;
  const depth=1-Math.cos(rad); // 0 at the viewer, grows continuously toward the back
  // V2.5: keep the ring, but make the viewing position a pronounced focal crest.
  // The non-linear falloff keeps neighbours visibly behind instead of almost the same size.
  const focus=Math.exp(-Math.pow(Math.abs(angle)/23,2));
  // V2.6: focal strength sits between V2.4 and V2.5 — clear centre without billboard dominance.
  const z=-55 + focus*190 - depth*145 - (1-intro)*250;
  const y=depth*14;
  const scale=Math.max(.08,(.64 + focus*.46 - depth*.07)*(.22 + .78*intro));
  const bright=Math.max(.44,.74 + focus*.30 - depth*.11);
  const opacity=Math.max(.10,(.70 + focus*.28 - depth*.18)*(.30 + .70*intro));
  b.style.setProperty('--ring-x',`${x}px`);
  b.style.setProperty('--ring-y',`${y}px`);
  b.style.setProperty('--ring-z',`${z}px`);
  b.style.setProperty('--ring-rot',`${angle*-0.72}deg`);
  b.style.setProperty('--ring-scale',scale.toFixed(4));
  b.style.setProperty('--ring-bright',bright.toFixed(4));
  b.style.setProperty('--ring-opacity',opacity.toFixed(4));
  b.style.zIndex=String(1000-Math.round(depth*100));
  b.classList.toggle('is-far',Math.abs(angle)>105);
}
function setIntroHintVisible(visible){document.querySelector('#introHint')?.classList.toggle('is-visible',!!visible)}
function updateFocusPanel(){
  if(!books.length)return;
  const w=books[index],a=w.author||{};
  const label=hallShelfRing
    ? (hallShelfKind==='mine'?'MY COPY':hallShelfKind==='later'?'READ LATER':'NEW ARRIVALS')
    : (roomId==='fantasy'?'FANTASY FOREST':'NEW ARRIVALS');
  const meta=[w.episodeLabel,w.episodeTitle].filter(Boolean).join(' ・ ');
  const title=document.querySelector('#focusTitle'),author=document.querySelector('#focusAuthor'),shelf=document.querySelector('#focusShelf'),metaEl=document.querySelector('#focusMeta');
  if(title&&title.textContent!==(w.title||'Untitled'))title.textContent=w.title||'Untitled';
  if(author&&author.textContent!==(a.displayName||'作者'))author.textContent=a.displayName||'作者';
  if(shelf&&shelf.textContent!==label)shelf.textContent=label;
  if(metaEl){if(metaEl.textContent!==meta)metaEl.textContent=meta;metaEl.hidden=!meta;}
}
function render(){stage.innerHTML='';if(!books.length)return;books.forEach((w,i)=>{const slot=signedOffset(i);if(Math.abs(slot)>5)return;const b=document.createElement('button');b.className='book';b.dataset.slot=slot;b.dataset.index=i;b.setAttribute('aria-label',`${w.title||'Untitled'} ${w.author?.displayName||''}`);b.innerHTML=bookMarkup(w);setBookPose(b,slot+dragUnits);b.onclick=()=>{if(Date.now()<suppressClickUntil)return;const off=signedOffset(i);if(off===0)pick(w);else glideToOffset(-off);};stage.appendChild(b);});hydrateCoverLoadState(stage);updateFocusPanel();}
// V2.11.3: commit a settled ring without rebuilding the visible cover DOM.
// Recreating the centered image at the exact landing frame can make its rasterized transform
// look like it briefly "tightens" even when the numeric scale is unchanged.
function commitRingSettle(step){
  index=norm(index+step);dragUnits=0;
  requestNextCataloguePage();
  const live=new Map();
  stage.querySelectorAll('.book').forEach(b=>{
    const i=Number(b.dataset.index),slot=signedOffset(i);
    if(Math.abs(slot)>5){b.remove();return;}
    b.dataset.slot=String(slot);setBookPose(b,slot);live.set(i,b);
  });
  books.forEach((w,i)=>{
    const slot=signedOffset(i);if(Math.abs(slot)>5||live.has(i))return;
    const b=document.createElement('button');b.className='book';b.dataset.slot=slot;b.dataset.index=i;
    b.setAttribute('aria-label',`${w.title||'Untitled'} ${w.author?.displayName||''}`);b.innerHTML=bookMarkup(w);setBookPose(b,slot);
    b.onclick=()=>{if(Date.now()<suppressClickUntil)return;const off=signedOffset(i);if(off===0)pick(w);else glideToOffset(-off);};
    stage.appendChild(b);hydrateCoverLoadState(b);
  });
  updateFocusPanel();
}
// V2.11.4: first-view shelf spin. It uses the same ring coordinates and the same
// cover DOM from start to finish, so the final landing does not rebuild or "tighten" the cover.
let firstViewSpinPlayed=false;
let firstViewIntroReady=false;
function wrappedOffsetFrom(center,i){
  let d=i-center,n=books.length;
  if(!n)return 0;
  while(d>n/2)d-=n;
  while(d<-n/2)d+=n;
  return d;
}
function renderFirstViewRing(center){
  stage.innerHTML='';
  // V2.18.5: intro readiness is granted only after the opening spin fully completes.
  // Do not expose a false ready state while the ring is still assembling.
  stage.classList.remove('is-intro-ready');
  books.forEach((w,i)=>{
    const b=document.createElement('button');b.className='book';b.dataset.index=i;
    b.setAttribute('aria-label',`${w.title||'Untitled'} ${w.author?.displayName||''}`);
    b.innerHTML=bookMarkup(w);setBookPose(b,wrappedOffsetFrom(center,i),.10);
    b.onclick=()=>{if(Date.now()<suppressClickUntil||stage.classList.contains('is-intro-spinning'))return;const off=signedOffset(i);if(off===0)pick(w);else glideToOffset(-off);};
    stage.appendChild(b);
  });
  hydrateCoverLoadState(stage);updateFocusPanel();
}
function firstViewTravel(){return Math.min(10,Math.max(5.5,books.length*.42));}
// V2.11.6: decode the covers that will actually cross the focal zone before the intro starts.
// This keeps the opening animation from outrunning image decode on iPhone/slow networks.
async function preloadFirstViewCovers(){
  if(!books.length)return;
  const travel=firstViewTravel(),steps=Math.max(1,Math.ceil(travel));
  const ids=new Set();
  // Covers that become the focal/near-focal book while the ring travels from the distant start to index 0.
  for(let n=0;n<=steps;n++){
    const center=index-travel+(travel*n/steps);
    const c=Math.round(center);
    [-1,0,1].forEach(d=>ids.add(norm(c+d)));
  }
  // Cap network work while keeping the full focal path represented.
  const ordered=[...ids].slice(0,14);
  const jobs=ordered.map(i=>new Promise(resolve=>{
    const url=books[i]?.coverUrl;if(!url)return resolve();
    const img=new Image();let done=false;
    const finish=()=>{if(done)return;done=true;resolve();};
    img.decoding='async';img.onload=async()=>{try{if(img.decode)await img.decode();}catch(_){}finish();};
    img.onerror=finish;img.src=url;
    if(img.complete&&img.naturalWidth>0){Promise.resolve(img.decode?.()).catch(()=>{}).finally(finish);}
    setTimeout(finish,3200);
  }));
  await Promise.all(jobs);
}
function playFirstViewSpin(){
  if(firstViewSpinPlayed||!books.length||viewMode!=='ring')return;
  firstViewSpinPlayed=true;
  const token=++spinToken;
  const travel=firstViewTravel();
  const duration=2350;
  const start=index-travel;
  suppressClickUntil=Date.now()+duration+250;
  stage.classList.add('is-intro-spinning');
  introReady=false;
  setIntroHintVisible(false);
  renderFirstViewRing(start);
  const t0=performance.now();
  function frame(now){
    if(token!==spinToken){stage.classList.remove('is-intro-spinning');return;}
    const t=Math.min(1,(now-t0)/duration);
    // V2.11.8: the first visible frame is a tiny 'eye of the storm' deep in the shop.
    // It opens continuously while the angular velocity decays, so no full-size cover appears before the vortex.
    const e=1-Math.pow(1-t,4.6);
    const approach=1-Math.pow(1-t,1.72);
    const introDepth=.10+.90*approach;
    const center=start+(index-start)*e;
    stage.querySelectorAll('.book').forEach(b=>setBookPose(b,wrappedOffsetFrom(center,Number(b.dataset.index)),introDepth));
    if(t<1){requestAnimationFrame(frame);return;}
    dragUnits=0;
    stage.querySelectorAll('.book').forEach(b=>{
      const i=Number(b.dataset.index),slot=signedOffset(i);
      if(Math.abs(slot)>5){b.remove();return;}
      b.dataset.slot=String(slot);setBookPose(b,slot);
    });
    stage.classList.remove('is-intro-spinning');
    stage.classList.add('is-intro-ready');introReady=true;roomId='intro';store.classList.add('intro-mode');
    setIntroHintVisible(true);
    updateFocusPanel();
  }
  requestAnimationFrame(frame);
}
function snapTo(i){index=norm(i);dragUnits=0;render();}
function move(delta){
  // V2.18.5: all ring navigation is locked during the opening spin.
  // Prev/next buttons live outside .stage, so they must be guarded here too.
  if(stage.classList.contains('is-intro-spinning'))return;
  if(books.length)glideToOffset(-delta);
}
function applyDrag(units){dragUnits=units;stage.querySelectorAll('.book').forEach(b=>{const slot=Number(b.dataset.slot||0);setBookPose(b,slot+units);});}
function beginDrag(e){if(e.button!=null&&e.button!==0)return;/* V2.18.4: while the opening NEW ARRIVALS spin is running, taps must not cancel its RAF token. Cancelling here left introReady=false forever, so the ring still scrolled horizontally but could never accept the upward enter gesture. */if(roomId==='intro'&&stage.classList.contains('is-intro-spinning'))return;spinToken++;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastT:performance.now(),vx:0,moved:false,axis:null};stage.classList.add('is-dragging');stage.setPointerCapture?.(e.pointerId);}
function dragMove(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dx)<5&&Math.abs(dy)<5)return;
  if(!drag.axis){if(roomId==='intro'&&introReady&&Math.abs(dy)>Math.abs(dx)*1.05)drag.axis='intro-enter';else drag.axis=(((roomId==='fantasy'&&!roomShelfMode)||hallShelfRing)&&Math.abs(dy)>Math.abs(dx)*1.15)?'shelf-return':'ring';}
  if(drag.axis==='intro-enter'){drag.moved=true;e.preventDefault();const lift=Math.min(1,Math.max(0,-dy/150));stage.style.transform=`translateX(-50%) translateY(${Math.min(0,dy*.55)}px) scale(${1-lift*.12})`;stage.style.opacity=String(1-lift*.62);return;}
  if(drag.axis==='shelf-return'){
    drag.moved=true;e.preventDefault();const lift=Math.min(1,Math.max(0,-dy/180));stage.style.setProperty('--shelf-return-y',`${Math.min(0,dy*.62)}px`);stage.style.setProperty('--shelf-return-scale',String(1-lift*.18));stage.style.opacity=String(1-lift*.48);return;
  }
  drag.moved=true;e.preventDefault();const now=performance.now(),dt=Math.max(1,now-drag.lastT);drag.vx=(e.clientX-drag.lastX)/dt;drag.lastX=e.clientX;drag.lastT=now;const spacing=Math.min(210,Math.max(145,stage.clientWidth*.39));applyDrag(dx/spacing);}
function easeOutCubic(t){return 1-Math.pow(1-t,3);}
function animateOffset(from,to,duration,token){return new Promise(resolve=>{const t0=performance.now();function frame(now){if(token!==spinToken)return resolve(false);const p=Math.min(1,(now-t0)/duration),e=easeOutCubic(p);applyDrag(from+(to-from)*e);if(p<1)requestAnimationFrame(frame);else resolve(true);}requestAnimationFrame(frame);});}
async function glideToOffset(target){if(!books.length)return;const token=++spinToken;const from=dragUnits;target=Math.max(-4,Math.min(4,target));const dist=Math.abs(target-from);const ok=await animateOffset(from,target,190+dist*72,token);if(!ok)return;const step=-Math.round(target);commitRingSettle(step);}
async function coastAndSnap(initialUnits,velocityUnitsMs){
  const token=++spinToken;let pos=initialUnits,v=velocityUnitsMs,last=performance.now();
  // V2.5: velocity is allowed to decay naturally. Only a soft safety envelope prevents runaway spins.
  // There is no hard clamp/brake in the visible part of the coast.
  const origin=initialUnits;
  const speed=Math.abs(v);
  const softTravel=Math.min(5.6,2.2+speed*210);
  await new Promise(resolve=>{function frame(now){if(token!==spinToken)return resolve();const dt=Math.min(32,now-last);last=now;pos+=v*dt;const travel=Math.abs(pos-origin);const edge=Math.max(0,(travel-softTravel*.82)/(softTravel*.18));const friction=.974-(Math.min(1,edge)*.010);v*=Math.pow(friction,dt/16.67);applyDrag(pos);if(Math.abs(v)>.00115&&travel<softTravel)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
  if(token!==spinToken)return;
  const target=Math.round(pos);
  // Magnetic capture starts only after the coast is already slow, so it feels like settling, not braking.
  const ok=await animateOffset(pos,target,280+Math.abs(target-pos)*240,token);if(!ok)return;
  commitRingSettle(-Math.round(target));
}
function endDrag(e,cancel=false){if(!drag)return;const d=drag;drag=null;stage.classList.remove('is-dragging');
  if(d.axis==='intro-enter'){const dy=e.clientY-d.y;stage.style.transform='';stage.style.opacity='';if(!cancel&&dy<-62){showCentralHall(true);}return;}
  if(d.axis==='shelf-return'){
    const dy=e.clientY-d.y;stage.style.opacity='';
    if(!cancel&&dy<-72){stage.classList.add('is-shelf-returning');stage.style.setProperty('--shelf-return-y','-120px');stage.style.setProperty('--shelf-return-scale','.76');setTimeout(()=>hallShelfRing?backToHallShelf():backToRoomShelf(),180)}
    else{stage.style.setProperty('--shelf-return-y','0px');stage.style.setProperty('--shelf-return-scale','1')}
    return;
  }
  if(cancel){glideToOffset(0);return;}if(d.moved){suppressClickUntil=Date.now()+360;const spacing=Math.min(210,Math.max(145,stage.clientWidth*.39));const velocity=d.vx/spacing;coastAndSnap(dragUnits,velocity*.66);}else{dragUnits=0;/* V2.11.1: desktop pointer capture can swallow the button click. Resolve the visible cover directly on pointerup. */const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.book');if(hit&&stage.contains(hit)){suppressClickUntil=Date.now()+220;const i=Number(hit.dataset.index),off=signedOffset(i);if(off===0)pick(books[i]);else glideToOffset(-off);}}}
function readLaterItems(){try{const v=JSON.parse(localStorage.getItem(READ_LATER_STORAGE_KEY)||'[]');return Array.isArray(v)?v.filter(x=>x&&x.publicationId).slice(0,200):[];}catch(_){return[];}}
function normalizeReadLater(w){return {...w,_readLater:true,author:{displayName:w.authorName||w.author?.displayName||'作者'},description:w.description||w.detail||'',subtitle:w.subtitle||w.detail||'',readUrl:w.readUrl||w.workUrl||''};}
function readLaterBooks(){return readLaterItems().map(normalizeReadLater);}
function readLaterRecord(w){const a=w.author||{},readUrl=playerUrl(w);return{publicationId:w.publicationId,title:w.title||'Untitled',coverUrl:w.coverUrl||'',detail:[w.episodeLabel,w.episodeTitle,w.subtitle].filter(Boolean).join(' '),authorName:a.displayName||'作者',authorId:a.authorId||'',authorSlug:a.slug||'',workUrl:readUrl,readUrl,savedAt:Date.now()};}
function syncLater(){const b=document.querySelector('#saveLater');if(!currentPicked||!b)return;if(currentPicked._ownedCopy){b.classList.add('is-saved');b.textContent='✓ もっている本';b.setAttribute('aria-pressed','true');b.disabled=true;return;}b.disabled=false;const saved=readLaterItems().some(x=>x.publicationId===currentPicked.publicationId);b.classList.toggle('is-saved',saved);b.textContent=saved?'✓ 保存済み':'あとで読む';b.setAttribute('aria-pressed',saved?'true':'false');}
function toggleLater(){if(!currentPicked||currentPicked._ownedCopy)return;const items=readLaterItems(),i=items.findIndex(x=>x.publicationId===currentPicked.publicationId);if(i>=0)items.splice(i,1);else items.unshift(readLaterRecord(currentPicked));try{localStorage.setItem(READ_LATER_STORAGE_KEY,JSON.stringify(items.slice(0,200)));syncLater();renderHallMyShelf();}catch(_){}}
function genreLabel(w){
  const raw=String(w?.genre||w?.metadata?.genre||'').trim().toLowerCase();
  const labels={fantasy:'ファンタジー',romance:'恋愛',horror:'ホラー',mystery:'ミステリ',sf:'SF',everyday:'日常',essay:'エッセイ',other:'その他'};
  return labels[raw]||raw||'';
}
function detailContext(w){
  const genre=genreLabel(w), episode=[w?.episodeLabel,w?.episodeTitle].filter(Boolean).join(' ・ ');
  return [genre,episode].filter(Boolean).join('　／　')||(w?._ownedCopy?'MY COPY':'PUBLIC BOOK');
}
function fillPicked(w){currentPicked=w;document.querySelector('#pickedCover').innerHTML=bookMarkup(w);hydrateCoverLoadState(document.querySelector('#pickedCover'));document.querySelector('#pickedTitle').textContent=w.title||'Untitled';document.querySelector('#pickedContext').textContent=detailContext(w);document.querySelector('#pickedDetail').textContent=w.description||w.subtitle||'';document.querySelector('#pickedAuthor').textContent=w.author?.displayName?`著者　${w.author.displayName}`:'';document.querySelector('#readBook').href=detailReadUrl(w);document.querySelector('#pickedContext').textContent=detailContext(w);syncLater();}
function pick(w){
  // V2.10.2: opening detail is a modal state. Motion/path animation must not keep
  // mutating the passage underneath while the user is trying to dismiss the detail.
  pathVelocity=0;pathBookHold=null;pathDrag=null;
  fillPicked(w);picked.hidden=false;document.body.classList.add('book-detail-open');document.body.style.overflow='hidden';
}
function detailCardMarkup(w){const a=w.author||{},saved=w._ownedCopy||readLaterItems().some(x=>x.publicationId===w.publicationId);return `<div class="detail-book">${bookMarkup(w)}</div><div class="detail-copy"><small>${esc(detailContext(w))}</small><h1>${esc(w.title||'Untitled')}</h1><p>${esc(w.description||w.subtitle||'')}</p><p class="author">${a.displayName?`著者　${esc(a.displayName)}`:''}</p></div><div class="picked-actions detail-actions-placeholder" aria-hidden="true"><span class="${saved?'is-saved':''}">${w._ownedCopy?'✓ もっている本':saved?'✓ 保存済み':'あとで読む'}</span><span>ひらく</span></div>`;}
function removeDetailPreview(){if(detailPreview){detailPreview.remove();detailPreview=null;}}
function detailTargetFromDrag(dx,dy){const horizontal=Math.abs(dx)>=Math.abs(dy);const amount=horizontal?dx:dy;return{horizontal,amount,delta:amount<0?1:-1};}
function canMoveShelf(delta){return shelfIndex+delta>=0&&shelfIndex+delta<shelves.length;}
function ensureDetailPreview(delta,horizontal){if(!horizontal&&!canMoveShelf(delta))return null;const target=horizontal?books[norm(index+delta)]:books[index];if(detailPreview&&Number(detailPreview.dataset.delta)===delta&&detailPreview.dataset.axis===(horizontal?'x':'y'))return detailPreview;removeDetailPreview();detailPreview=document.createElement('article');detailPreview.className='detail-card detail-preview';detailPreview.dataset.delta=delta;detailPreview.dataset.axis=horizontal?'x':'y';detailPreview.innerHTML=detailCardMarkup(target);picked.appendChild(detailPreview);return detailPreview;}
function applyDetailDrag(dx,dy){const card=document.querySelector('.detail-card:not(.detail-preview)');const t=detailTargetFromDrag(dx,dy),size=t.horizontal?Math.max(1,picked.clientWidth):Math.max(1,picked.clientHeight);if(!t.horizontal&&!canMoveShelf(t.delta)){// One shelf today: keep vertical axis alive with rubber-band feedback.
  const rubber=t.amount*.18;card.style.transform=`translate3d(0,${rubber}px,0) scale(.995)`;card.style.opacity='1';document.querySelector('#axisHint').textContent='左右：同じ棚の本';return;
 }
 const progress=Math.min(1,Math.abs(t.amount)/size),preview=ensureDetailPreview(t.delta,t.horizontal),start=t.amount<0?size:-size;if(!preview)return;
 if(t.horizontal){card.style.transform=`translate3d(${t.amount}px,0,0) scale(${1-progress*.025})`;preview.style.transform=`translate3d(${start+t.amount}px,0,0) scale(${.975+progress*.025})`;}else{card.style.transform=`translate3d(0,${t.amount}px,0) scale(${1-progress*.025})`;preview.style.transform=`translate3d(0,${start+t.amount}px,0) scale(${.975+progress*.025})`;}
 card.style.opacity=String(1-progress*.18);preview.style.opacity=String(.82+progress*.18);
}
function resetDetailDrag(animate=true){const card=document.querySelector('.detail-card:not(.detail-preview)');if(card){if(animate)card.classList.add('detail-settling');card.style.transform='';card.style.opacity='';setTimeout(()=>card.classList.remove('detail-settling'),260);}if(detailPreview){if(animate){detailPreview.classList.add('detail-settling');detailPreview.style.opacity='0';}setTimeout(removeDetailPreview,animate?250:0);}document.querySelector('#axisHint').textContent='左右：同じ棚の本';}
function commitDetailHorizontal(delta,dx,dy){const card=document.querySelector('.detail-card:not(.detail-preview)'),preview=detailPreview;if(!preview){resetDetailDrag();return;}const horizontal=Math.abs(dx)>=Math.abs(dy),size=horizontal?picked.clientWidth:picked.clientHeight,sign=(horizontal?dx:dy)<0?-1:1;card.classList.add('detail-settling');preview.classList.add('detail-settling');if(horizontal){card.style.transform=`translate3d(${sign*size}px,0,0) scale(.97)`;preview.style.transform='translate3d(0,0,0) scale(1)';}else{card.style.transform=`translate3d(0,${sign*size}px,0) scale(.97)`;preview.style.transform='translate3d(0,0,0) scale(1)';}card.style.opacity='0';preview.style.opacity='1';setTimeout(()=>{index=norm(index+delta);render();fillPicked(books[index]);card.style.transform='';card.style.opacity='';card.classList.remove('detail-settling');removeDetailPreview();},245);}
function closePick(){
  picked.hidden=true;currentPicked=null;detailDrag=null;removeDetailPreview();
  document.body.classList.remove('book-detail-open');
  document.body.style.overflow=viewMode==='path'?'hidden':'';
  resetDetailDrag(false);
}
document.querySelector('#detailDismiss').onclick=closePick;document.querySelector('#saveLater').onclick=toggleLater;document.querySelector('#focusPick')?.addEventListener('click',()=>books.length&&pick(books[index]));
const readBookButton=document.querySelector('#readBook');if(readBookButton)readBookButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const url=currentPicked&&detailReadUrl(currentPicked);if(!url||url==='#')return;location.assign(url);});
document.querySelector('#hallOwnedTab')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();hallLibraryKind='mine';renderHallMyShelf();});
document.querySelector('#hallLaterTab')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();hallLibraryKind='later';renderHallMyShelf();});
const detailCard=document.querySelector('.detail-card');
detailCard.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;detailDrag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,lastT:performance.now(),vx:0,vy:0,moved:false};detailCard.setPointerCapture?.(e.pointerId);});
detailCard.addEventListener('pointermove',e=>{if(!detailDrag||e.pointerId!==detailDrag.id)return;const dx=e.clientX-detailDrag.x,dy=e.clientY-detailDrag.y;if(!detailDrag.moved&&Math.max(Math.abs(dx),Math.abs(dy))<5)return;detailDrag.moved=true;e.preventDefault();const now=performance.now(),dt=Math.max(1,now-detailDrag.lastT);detailDrag.vx=(e.clientX-detailDrag.lastX)/dt;detailDrag.vy=(e.clientY-detailDrag.lastY)/dt;detailDrag.lastX=e.clientX;detailDrag.lastY=e.clientY;detailDrag.lastT=now;applyDetailDrag(dx,dy);},{passive:false});
detailCard.addEventListener('pointerup',e=>{if(!detailDrag||e.pointerId!==detailDrag.id)return;const d=detailDrag,dx=e.clientX-d.x,dy=e.clientY-d.y;detailDrag=null;if(!d.moved){resetDetailDrag();return;}const t=detailTargetFromDrag(dx,dy),speed=t.horizontal?Math.abs(d.vx):Math.abs(d.vy),size=t.horizontal?picked.clientWidth:picked.clientHeight;
  // V2.22.5: detail is one level deeper than the ring. An upward swipe always
  // returns to the exact ring that opened it; it must not be interpreted as a
  // future vertical shelf-navigation gesture.
  if(!t.horizontal&&dy<0&&(Math.abs(dy)>Math.max(58,size*.10)||Math.abs(d.vy)>.42)){resetDetailDrag(false);closePick();return;}
  if(!t.horizontal){resetDetailDrag();return;}
  if(Math.abs(t.amount)>size*.20||speed>.52)commitDetailHorizontal(t.delta,dx,dy);else resetDetailDrag();
});
detailCard.addEventListener('pointercancel',()=>{detailDrag=null;resetDetailDrag();});
document.querySelector('#prev').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
stage.addEventListener('pointerdown',beginDrag);stage.addEventListener('pointermove',dragMove,{passive:false});stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',e=>endDrag(e,true));
// V2.11.2: mouse wheel is a continuous input first, then settles once after input stops.
// Never magnet-snap between wheel notches; that was fighting the next notch and causing bounce-back.
let ringWheelTimer=0,ringWheelLast=0,ringWheelV=0,lastMouseNotch=0;
function settleRingWheel(delay=150){
  clearTimeout(ringWheelTimer);
  ringWheelTimer=setTimeout(async()=>{
    if(viewMode!=='ring'||!picked.hidden||!books.length)return;
    const token=++spinToken;
    const from=dragUnits;
    const target=Math.round(from);
    // If the gesture did not cross half a book, return gently to the current book.
    const ok=await animateOffset(from,target,210+Math.abs(target-from)*150,token);
    if(!ok)return;
    commitRingSettle(-Math.round(target));
  },delay);
}
store.addEventListener('wheel',e=>{
  if(viewMode!=='ring'||!picked.hidden)return;
  const raw=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  if(Math.abs(raw)<.25)return;
  e.preventDefault();
  const now=performance.now();
  const mouseLike=e.deltaMode!==0||Math.abs(raw)>=38;
  if(mouseLike){
    // Cancel only an old settle animation. While the wheel is still rolling, just accumulate position.
    if(now-lastMouseNotch<52)return;
    lastMouseNotch=now;
    spinToken++;
    const step=Math.sign(raw)*.56; // roughly one deliberate notch = one neighbouring book after settle
    applyDrag(dragUnits-step);
    settleRingWheel(155);
    return;
  }
  // Precision trackpads keep the existing continuous/inertial feel.
  spinToken++;
  const dt=Math.max(8,Math.min(50,now-(ringWheelLast||now-16)));ringWheelLast=now;
  const units=Math.max(-.16,Math.min(.16,raw*.00155));
  applyDrag(dragUnits-units);
  ringWheelV=(-units)/dt;
  clearTimeout(ringWheelTimer);
  ringWheelTimer=setTimeout(()=>{const v=ringWheelV;ringWheelV=0;ringWheelLast=0;coastAndSnap(dragUnits,v*.34);},90);
},{passive:false});

function syncRingFromPath(){
  if(!books.length)return;
  index=norm(Math.round(pathProgress));
  dragUnits=0;
}
function syncPathFromRing(){
  if(!books.length)return;
  // Keep the current lap where possible, but align the road to the book selected in the ring.
  const lap=Math.floor(pathProgress/Math.max(1,books.length))*books.length;
  let candidate=lap+index;
  const span=Math.max(1,books.length);
  while(candidate-pathProgress>span/2)candidate-=span;
  while(pathProgress-candidate>span/2)candidate+=span;
  pathProgress=clampPath(candidate);
}
function genreBooks(id=activeGenreId){
  return allBooks.filter(w=>w&&String(w.genre||'').toLowerCase()===id);
}
function currentGenre(){return PATH_ZONES.find(z=>z.id===activeGenreId)||PATH_ZONES[0];}
function clearGenreApproachTheme(){const path=document.querySelector('#bookPath');if(!path)return;path.classList.remove('genre-approach');path.removeAttribute('data-genre');path.style.removeProperty('--approach-bg');}

function setRoomVisual(id){
  const fantasy=id==='fantasy',zone=currentGenre();
  store.classList.toggle('room-fantasy',fantasy);
  store.dataset.activeGenre=fantasy?zone.id:'';
  if(fantasy)store.style.setProperty('--genre-room-bg',`url('${zone.roomBg}')`);
  document.querySelector('.sign small').textContent=fantasy?zone.label+' ROOM':'NEW ARRIVALS';
  document.querySelector('.sign strong').textContent=fantasy?zone.jp+'の本棚':'新しく入った本';
  shelfIndex=fantasy?1:0;
}
function pathEnd(){
  if(roomId==='forest')return FOREST_TRAVEL;
  if(!dataReady)return 0;
  return outerPathLength(); // Eight genre sections, independent of available book count.
}
function atFantasyGate(){return dataReady&&roomId==='forest'&&pathProgress>=FOREST_TRAVEL-.08}
function hideFantasyGate(){
  clearTimeout(fantasyGateTimer);fantasyGateTimer=0;fantasyGateVisible=false;
  const gate=document.querySelector('#fantasyGate');if(gate)gate.hidden=true;
  document.querySelector('#bookPath')?.classList.remove('at-fantasy-gate');
}
function revealFantasyGate(){
  if(!atFantasyGate()||fantasyGateVisible)return;
  fantasyGateVisible=true;
  const gate=document.querySelector('#fantasyGate');if(gate)gate.hidden=false;
  document.querySelector('#bookPath')?.classList.add('at-fantasy-gate');
  document.querySelector('#pathStatus').textContent=currentGenre().jp+'の入口';
  document.querySelector('#pathSub').textContent='入口カードをタップ';
}
function updateFantasyGate(){
  if(!atFantasyGate()){hideFantasyGate();return;}
  if(fantasyGateVisible||fantasyGateTimer)return;
  // The pause is temporal, not another stretch of road: finish the last swipe,
  // breathe on the scenery, then let the destination surface slowly.
  document.querySelector('#pathStatus').textContent=currentGenre().jp+'への道を抜けた';
  document.querySelector('#pathSub').textContent='';
  fantasyGateTimer=setTimeout(()=>{fantasyGateTimer=0;if(atFantasyGate())revealFantasyGate();},780);
}
// Kept as a route primitive for future missable side branches. A side branch may
// set roomId='forest' and use FOREST_TRAVEL / percentage progress before reaching a shelf.
async function enterForest(genreId=currentPathZone()?.id||'fantasy'){
  if(routeTransitioning||!dataReady)return;
  const selected=PATH_ZONES.find(z=>z.id===genreId);if(!selected)return;
  const fromRoom=roomId==='fantasy';
  routeTransitioning=true;pathVelocity=0;
  await preloadPathZone(selected.approachBg);
  activeGenreId=selected.id;
  store.style.setProperty('--active-approach-bg',`url('${selected.approachBg}')`);
  // V2.19.9: outer curve -> straight genre approach uses the same crossfade grammar
  // as the other room/route handoffs. The old layer captures the live curved zone.
  const routeFade=startRouteCrossfade(fromRoom?'fantasy':'path','path');
  routeFade?.newLayer?.style.setProperty('background-image',`linear-gradient(rgba(7,5,3,.06),rgba(7,5,3,.13)),url('${selected.approachBg}')`);
  // Every NEW branch entry starts at the mouth of the straight approach.
  // The outer circular-road position is remembered independently.
  if(!fromRoom){approachOriginRoom=null;lastOuterPathProgress=pathProgress;roomHistory.push({id:'path',progress:pathProgress});}
  else{lastOuterPathProgress=PATH_ZONES.findIndex(z=>z.id===selected.id)*PATH_BOOKS_PER_ZONE_TEST;spinToken++;if(roomCameraSettleRaf)cancelAnimationFrame(roomCameraSettleRaf);roomCameraSettleRaf=0;roomCameraInputLock=false;roomShelfMode=false;}
  viewMode='path';document.body.classList.add('book-path-active');stage.hidden=true;
  document.querySelector('#roomShelf').hidden=true;document.querySelector('#roomExitNav').hidden=true;
  document.querySelector('#bookPath').hidden=false;
  for(const id of ['prev','next','hint'])document.getElementById(id).hidden=true;
  lastForestPathProgress=0;
  pathVelocity=0;pathMotionEnergy=0;lastAccelMag=0;pathMotionLast=0;
  roomId='forest';books=genreBooks(activeGenreId);pathProgress=0;pathYaw=0;
  const path=document.querySelector('#bookPath');path?.classList.add('genre-approach');path?.setAttribute('data-genre',activeGenreId);path?.style.setProperty('--approach-bg',`url(\"${selected.approachBg}\")`);
  setRoomVisual('fantasy');hideFantasyGate();
  const gate=document.querySelector('#fantasyGate');if(gate){gate.querySelector('small').textContent=selected.label.toUpperCase();gate.querySelector('strong').textContent=selected.jp+'の本棚へ';gate.querySelector('span').textContent='入口をタップ';}
  document.querySelector('#motionStart').hidden=false;setPathMotionButton();
  document.querySelector('#pathStatus').textContent=selected.jp+'への道';
  document.querySelector('#pathSub').textContent='上＝前進 ／ 下＝後退';
  renderPath();ensurePathLoop();
  fadeRouteLayers(routeFade);
  routeTransitioning=false;
}

function beginRoomGenreApproach(id){
  if(roomId!=='fantasy'||routeTransitioning||id===activeGenreId)return;
  finishPhoneShelfSlide();
  const scroller=document.querySelector('#roomShelfScroll');
  if(roomShelfMode&&matchMedia('(max-width:680px)').matches)phoneShelfScrollPositions.set(roomShelfFace,scroller.scrollTop);
  const face=scroller.querySelector(`.room-shelf-face[data-face="${roomShelfFace}"]`);
  approachOriginRoom={genre:activeGenreId,books:books.slice(),index,shelf:roomShelfMode,face:roomShelfFace,yaw:roomCameraYaw,preview:roomCameraPreview,positions:[...phoneShelfScrollPositions],desktopScroll:face?.scrollTop||0,outer:lastOuterPathProgress};
  enterForest(id);
}
function restoreApproachOriginRoom(){
  const origin=approachOriginRoom;if(!origin)return;approachOriginRoom=null;
  activeGenreId=origin.genre;
  const fade=startRouteCrossfade('path','fantasy');
  roomId='fantasy';viewMode='ring';pathVelocity=0;lastOuterPathProgress=origin.outer;spinToken++;
  document.body.classList.remove('book-path-active');document.querySelector('#bookPath').hidden=true;clearGenreApproachTheme();
  document.querySelector('#motionStart').hidden=true;document.querySelector('#roomExitNav').hidden=false;
  books=origin.books;index=origin.index;roomShelfAllBooks=genreBooks();roomShelfFace=origin.face;roomCameraYaw=origin.yaw;roomCameraPreview=origin.preview;
  phoneShelfScrollPositions.clear();origin.positions.forEach(([face,top])=>phoneShelfScrollPositions.set(face,top));
  setRoomVisual('fantasy');document.querySelector('#roomBgLayer').style.display='block';
  stage.classList.remove('is-intro-spinning');stage.style.opacity='1';stage.style.transform='';
  document.querySelector('.sign').classList.toggle('shelf-back-sign',!origin.shelf);
  if(origin.shelf){renderRoomShelf();requestAnimationFrame(()=>{const face=document.querySelector(`#roomShelfScroll .room-shelf-face[data-face="${origin.face}"]`);if(face)face.scrollTop=origin.desktopScroll;});}
  else{roomShelfMode=false;document.querySelector('#roomShelf').hidden=true;stage.hidden=false;for(const id of ['prev','next','focusPanel','hint'])document.getElementById(id).hidden=false;document.querySelector('#hint').textContent='左右にスワイプしてこの棚の本を見る　／　上スワイプで棚へ戻る';render();}
  rebaseRoomMotion();applyRoomCamera(origin.preview,true);fadeRouteLayers(fade);
}

// V2.15.0 — Room shelf ring. A Room is surrounded by tall shelf faces.
// Each face contains 4 columns x 3 rows for now; horizontal swipes rotate the
// shelf ring, while vertical scrolling remains available inside a taller face later.
// V2.24.1 — Genre Room geometry is permanently four-sided.
// 0° / 90° / 180° / 270° always exist, even when some faces are empty.
// Each physical face owns 24 books (4 columns x 6 rows). The room always keeps
// the fixed 0° / 90° / 180° / 270° four-face skeleton; capacity is 96 books per tier.
function roomShelfFaces(){
  const all=roomShelfAllBooks;
  const capacity=roomShelfCapacity();
  const faces=Array.from({length:4},(_,face)=>({face,start:face*capacity,books:[],indices:[]}));
  for(let tier=0;tier*capacity*4<all.length;tier++){
    const tierBase=tier*capacity*4;
    for(let face=0;face<4;face++){
      const start=tierBase+face*capacity;
      const end=Math.min(start+capacity,all.length);
      for(let i=start;i<end;i++){faces[face].books.push(all[i]);faces[face].indices.push(i);}
    }
  }
  return faces;
}
// Only the currently visible wall can supply a clicked book. Hidden walls can
// have identical bounding boxes even though Safari/Chrome do not paint them.
function roomShelfBookAtPoint(target,x,y){
  const scroller=document.querySelector('#roomShelfScroll');
  const layer=scroller?.querySelector(`.room-shelf-face[data-face="${roomShelfFace}"]`);
  if(!layer)return null;
  const style=getComputedStyle(layer);
  if(style.visibility==='hidden'||style.display==='none'||style.pointerEvents==='none')return null;
  const direct=target?.closest?.('.room-shelf-book, .legacy-shelf-card');
  const candidates=direct&&layer.contains(direct)?[direct]:[...layer.querySelectorAll('.room-shelf-book, .legacy-shelf-card')];
  for(const book of candidates){
    const r=book.getBoundingClientRect(),index=Number(book.dataset.bookIndex);
    if(r.width>0&&r.height>0&&Number.isInteger(index)&&index>=0&&book.dataset.bookIndex!==undefined&&x>=r.left-5&&x<=r.right+5&&y>=r.top-5&&y<=r.bottom+5)return index;
  }
  return null;
}
function buildRoomShelfFaceLayer(face,f){
  const layer=document.createElement('div');layer.className='room-shelf-face';layer.dataset.face=String(face);
  const cols=roomShelfColumns();
  for(let local=0;local<f.books.length;local+=cols){
    const slice=f.books.slice(local,local+cols),indexSlice=f.indices.slice(local,local+cols);
    const globalStart=indexSlice[0]??0;
    const row=document.createElement('button');row.type='button';row.className='room-shelf-row';row.dataset.start=String(globalStart);
    row.setAttribute('aria-label',`${Math.floor(local/cols)+1}段目の本を見る`);
    const mobileShelf=window.matchMedia('(max-width:680px)').matches;
    // Original phone shelf markup; retain v2267 desktop cards and book indices.
    row.innerHTML=mobileShelf
      ? `<span class="room-shelf-books">${slice.map((w,offset)=>`<span class="room-shelf-book" data-book-offset="${offset}" data-book-index="${indexSlice[offset]??globalStart+offset}" role="button" tabindex="0" aria-label="${esc(w.title||'この本')}を中心に見る">${bookMarkup(w)}</span>`).join('')}</span><span class="room-shelf-board" aria-hidden="true"></span>`
      : `<span class="room-shelf-books">${slice.map((w,offset)=>`<span class="room-shelf-book" data-book-offset="${offset}" data-book-index="${indexSlice[offset]??globalStart+offset}" role="button" tabindex="0" aria-label="${esc(w.title||'この本')}を中心に見る">${bookMarkup(w)}<span class="room-book-info"><strong>${esc(w.title||'無題')}</strong><small class="room-book-episode">${esc([w.episodeLabel,w.episodeTitle].filter(Boolean).join(' ・ ')||'')}</small><small class="room-book-author">${esc(w.author?.displayName||w.authorName||w.byline||'')}</small></span></span>`).join('')}</span><span class="room-shelf-board" aria-hidden="true"></span>`;
    row.addEventListener('click',e=>{const hit=e.target.closest('.room-shelf-book, .legacy-shelf-card');if(!hit)return;openShelfRow(Number(hit.dataset.bookIndex)||0,0)});
    row.addEventListener('keydown',e=>{const hit=e.target.closest('.room-shelf-book, .legacy-shelf-card');if(hit&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openShelfRow(Number(hit.dataset.bookIndex)||0,0)}});
    layer.appendChild(row);hydrateCoverLoadState(row);
  }
  return layer;
}
// Phone walls retain independent vertical browsing positions.
const phoneShelfScrollPositions=new Map();
function syncPhoneShelfOffsets(){
  const scroller=document.querySelector('#roomShelfScroll');
  if(!scroller||!window.matchMedia('(max-width:680px)').matches)return;
  phoneShelfScrollPositions.set(roomShelfFace,scroller.scrollTop);
  const layer=scroller.querySelector(`.room-shelf-face[data-face="${roomShelfFace}"]`);
  const rows=layer?[...layer.querySelectorAll('.room-shelf-row')]:[];
  const last=rows[rows.length-1];
  const top=parseFloat(getComputedStyle(scroller).paddingTop)||0;
  const bottom=Number(scroller.dataset.phoneClipBottom)||0;
  const end=last?top+last.offsetTop+last.offsetHeight:0;
  scroller.dataset.phoneMaxScroll=String(Math.max(0,end-(scroller.clientHeight-bottom)));
}
function layoutPhoneShelfViewport(){
  const wrap=document.querySelector('#roomShelf'),scroller=document.querySelector('#roomShelfScroll');
  if(!wrap?.classList.contains('phone-original')||wrap.hidden||!scroller)return;
  const rect=scroller.getBoundingClientRect();
  const controls=['#roomExitNav','#roomMotion'].map(q=>document.querySelector(q)).filter(el=>el&&!el.hidden);
  const top=Math.max(0,...controls.map(el=>el.getBoundingClientRect().bottom-rect.top+12));
  const hint=wrap.querySelector('.room-shelf-hint');
  const bottom=Math.max(0,hint?rect.bottom-hint.getBoundingClientRect().top+12:32);
  scroller.dataset.phoneClipBottom=String(bottom);
  scroller.style.clipPath=`inset(${top}px 0 ${bottom}px 0)`;
  // Leave the upper clipping edge fixed; add breathing room before the first row.
  const startGap=Math.max(44,Math.min(68,window.innerHeight*.067));
  scroller.dataset.phoneStartGap=String(startGap);
  scroller.style.paddingTop=`${top+startGap}px`;
  scroller.style.paddingBottom=`${bottom+12}px`;
  syncPhoneShelfOffsets();updateRoomShelfPerspective();
}
window.addEventListener('resize',()=>requestAnimationFrame(layoutPhoneShelfViewport));
function renderRoomShelf(){
  finishPhoneShelfSlide();
  roomShelfVisualYaw=null;roomShelfVisualTargetYaw=roomCameraYaw+roomCameraPreview;roomShelfVisualLastTs=0;if(roomShelfVisualRaf){cancelAnimationFrame(roomShelfVisualRaf);roomShelfVisualRaf=0;}
  const wrap=document.querySelector('#roomShelf'),scroller=document.querySelector('#roomShelfScroll'),grid=document.querySelector('#roomShelfGrid');
  if(!wrap||!grid)return;
  wrap.classList.toggle('phone-original',window.matchMedia('(max-width:680px)').matches);
  roomShelfMode=true;roomShelfAllBooks=genreBooks(activeGenreId);
  const empty=document.querySelector('#roomShelfEmpty');if(empty)empty.hidden=roomShelfAllBooks.length>0;
  // Defensive lifecycle guard: a room shelf must never inherit the path-only overlay.
  const pathMotion=document.querySelector('#motionStart');if(pathMotion)pathMotion.hidden=true;
  const faces=roomShelfFaces();roomShelfFace=((roomShelfFace%faces.length)+faces.length)%faces.length;
  grid.innerHTML='';faces.forEach((f,i)=>grid.appendChild(buildRoomShelfFaceLayer(i,f)));
  // V2.24.5: all four walls occupy the SAME physical shelf plane.  They must
  // never participate in normal document flow together (that stacked all 48
  // dummy covers into one wall). Give the shared grid only the height needed
  // by the longest physical wall so vertical wheel browsing still works.
  const cols=roomShelfColumns();
  const maxRows=Math.max(1,...faces.map(f=>Math.ceil(f.books.length/cols)));
  grid.style.setProperty('--room-shelf-rows',String(maxRows));
  // V2.25.0: each of the four physical shelf pages owns its own vertical scroll.
  // The shared page stage must stay exactly viewport-sized; making the shared grid
  // as tall as every row was what broke cover geometry on PC/iPhone.
  // V2.25.7: desktop keeps a viewport-sized stage; iPhone restores the original tall, frameless shelf plane.
  if(window.matchMedia('(max-width:680px)').matches){
    grid.style.height=`calc(${maxRows} * 125px)`;
  }else{
    grid.style.height='100%';
  }
  wrap.hidden=false;stage.hidden=true;wrap.dataset.shelfFace=String(roomShelfFace);
  const counter=document.querySelector('#roomShelfCounter');if(counter)counter.textContent=`${roomShelfFace+1} / ${faces.length}`;
  document.querySelector('#prev').hidden=true;document.querySelector('#next').hidden=true;document.querySelector('#focusPanel').hidden=true;document.querySelector('#hint').hidden=true;
  scroller.scrollTop=window.matchMedia('(max-width:680px)').matches?(phoneShelfScrollPositions.get(roomShelfFace)||0):0;roomVisibleFace=roomShelfFace;requestAnimationFrame(()=>{layoutPhoneShelfViewport();updateRoomShelfPerspective();applyRoomCamera(roomCameraPreview,true)});
}
function roomFaceAngle(){const n=Math.max(1,roomShelfFaces().length);return 360/n;}
function wrapDeg(v){return ((v%360)+540)%360-180;}
function shelfWorldAngle(face){return face*ROOM_VIEW_SLOT_DEG;}
function nearestShelfForYaw(yaw){
  const faces=roomShelfFaces();let best=0,bestDist=Infinity;
  for(let i=0;i<faces.length;i++){const d=Math.abs(wrapDeg(shelfWorldAngle(i)-yaw));if(d<bestDist){best=i;bestDist=d;}}
  return {face:best,dist:bestDist,delta:wrapDeg(shelfWorldAngle(best)-yaw)};
}
// V2.16.8: shelf faces are persistent world objects. Never rebuild a face while turning.
function renderRoomShelfFace(face,keepScroll=false){
  const faces=roomShelfFaces();face=((face%faces.length)+faces.length)%faces.length;
  const phone=window.matchMedia('(max-width:680px)').matches;
  const scroller=document.querySelector('#roomShelfScroll');
  if(phone&&face!==roomShelfFace&&scroller){
    phoneShelfScrollPositions.set(roomShelfFace,scroller.scrollTop);
    // Restore after changing the active face so the scroll event cannot record
    // the incoming wall's position under the outgoing wall's index.
    roomShelfFace=face;roomVisibleFace=face;
    scroller.scrollTop=phoneShelfScrollPositions.get(face)||0;
  }else{roomShelfFace=face;roomVisibleFace=face;}
  const wrap=document.querySelector('#roomShelf');if(wrap)wrap.dataset.shelfFace=String(face);
  const counter=document.querySelector('#roomShelfCounter');if(counter)counter.textContent=`${face+1} / ${faces.length}`;
  updateRoomShelfPerspective();
}
// V2.28.4: drag the neighbouring wall with the finger, preserving both heights.
let phoneShelfSlide=null;
function finishPhoneShelfSlide(commit=true){
  const slide=phoneShelfSlide;if(!slide)return;
  cancelAnimationFrame(slide.raf);phoneShelfSlide=null;
  roomCameraYaw=commit?slide.targetYaw:slide.fromYaw;roomCameraPreview=0;
  if(commit)renderRoomShelfFace(slide.next,true);
  paintRoomShelfAtYaw(roomCameraYaw);
  syncPhoneShelfOffsets();applyRoomCamera(0,true);rebaseRoomMotion();
}
function beginPhoneShelfSlide(dir){
  const scroller=document.querySelector('#roomShelfScroll');
  const faces=roomShelfFaces(),next=((roomShelfFace+dir)%faces.length+faces.length)%faces.length;
  if(!scroller||next===roomShelfFace)return null;
  syncPhoneShelfOffsets();
  const outgoing=scroller.querySelector(`.room-shelf-face[data-face="${roomShelfFace}"]`);
  const incoming=scroller.querySelector(`.room-shelf-face[data-face="${next}"]`);
  if(!outgoing||!incoming)return null;
  const width=Math.max(window.innerWidth,document.querySelector('#roomShelfGrid').clientWidth)*1.18;
  const incomingY=scroller.scrollTop-(phoneShelfScrollPositions.get(next)||0);
  const fromYaw=roomCameraYaw+roomCameraPreview;
  const targetYaw=fromYaw+wrapDeg(next*ROOM_VIEW_SLOT_DEG-fromYaw);
  const startX=roomMotionOn?wrapDeg(roomShelfFace*ROOM_VIEW_SLOT_DEG-fromYaw)/ROOM_VIEW_SLOT_DEG*width:0;
  const travel=Math.max(1,width+dir*startX);
  const slide=phoneShelfSlide={next,dir,width,travel,fromYaw,targetYaw,progress:0,raf:0};
  // Hide other gyro-visible walls before this two-wall gesture takes ownership.
  scroller.querySelectorAll('.room-shelf-face').forEach(layer=>{
    layer.style.visibility=layer===outgoing||layer===incoming?'visible':'hidden';
    layer.style.pointerEvents='none';
  });
  incoming.style.opacity='1';outgoing.style.opacity='1';
  slide.paint=progress=>{
    slide.progress=progress;
    roomCameraYaw=fromYaw+(targetYaw-fromYaw)*progress;roomCameraPreview=0;applyRoomCamera(0,true);
    outgoing.style.setProperty('transform',`translate3d(${startX-dir*travel*progress}px,0,0)`,'important');
    incoming.style.setProperty('transform',`translate3d(${dir*travel*(1-progress)}px,${incomingY}px,0)`,'important');
  };
  slide.paint(0);return slide;
}
function previewPhoneShelfDrag(dx){
  const dir=dx<0?1:-1;
  if(phoneShelfSlide&&phoneShelfSlide.dir!==dir)finishPhoneShelfSlide(false);
  const slide=phoneShelfSlide||beginPhoneShelfSlide(dir);if(!slide)return;
  // Pixel-for-pixel horizontal response; the shared vertical viewport stays put.
  slide.paint(Math.min(1,Math.abs(dx)/slide.travel));
}
function settlePhoneShelfSlide(commit){
  const slide=phoneShelfSlide;if(!slide)return;
  cancelAnimationFrame(slide.raf);
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){finishPhoneShelfSlide(commit);return;}
  const from=slide.progress,to=commit?1:0,start=performance.now();
  const duration=Math.max(120,280*Math.abs(to-from));
  const tick=now=>{
    if(phoneShelfSlide!==slide)return;
    const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3);
    slide.paint(from+(to-from)*ease);
    if(t<1)slide.raf=requestAnimationFrame(tick);else finishPhoneShelfSlide(commit);
  };
  slide.raf=requestAnimationFrame(tick);
}
function slidePhoneShelf(dir){
  if(phoneShelfSlide&&phoneShelfSlide.dir!==dir)finishPhoneShelfSlide(false);
  if(!phoneShelfSlide)beginPhoneShelfSlide(dir);
  settlePhoneShelfSlide(true);
}
function paintRoomShelfAtYaw(yaw){
  const grid=document.querySelector('#roomShelfGrid');if(!grid)return;
  const near=nearestShelfForYaw(yaw);
  // V2.26.5 — iPhone uses the original V2.16 persistent-world shelf motion.
  // Do not hard-swap faces: neighbouring physical shelves travel through the
  // viewport continuously while the finger turns the shared Room camera.
  if(window.matchMedia('(max-width:680px)').matches){
    if(phoneShelfSlide)return;
    if(roomMotionOn||roomCameraSettleRaf){
      // All walls share the horizontal camera, while keeping independent heights.
      if(roomVisibleFace!==near.face&&near.dist<8)renderRoomShelfFace(near.face,true);
      const scroller=document.querySelector('#roomShelfScroll');
      const width=Math.max(window.innerWidth,grid.clientWidth)*1.18;
      grid.querySelectorAll('.room-shelf-face').forEach(layer=>{
        const face=Number(layer.dataset.face),delta=wrapDeg(shelfWorldAngle(face)-yaw),dist=Math.abs(delta);
        const x=Math.sign(delta)*Math.min(1.30,dist/ROOM_VIEW_SLOT_DEG)*width;
        const saved=face===roomShelfFace?scroller.scrollTop:(phoneShelfScrollPositions.get(face)||0);
        const y=scroller.scrollTop-saved;
        layer.style.visibility=dist<112?'visible':'hidden';
        layer.style.pointerEvents=dist<18?'auto':'none';layer.style.opacity='1';
        layer.style.setProperty('transform',`translate3d(${x}px,${y}px,0)`,'important');
        layer.style.zIndex=String(100-Math.round(dist));
      });
      return;
    }
    // iPhone genre room is stationary outside explicit horizontal navigation.
    // Horizontal navigation changes walls discretely; it never translates the room.
    grid.querySelectorAll('.room-shelf-face').forEach(layer=>{
      const active=Number(layer.dataset.face)===roomShelfFace;
      layer.style.visibility=active?'visible':'hidden';
      layer.style.pointerEvents=active?'auto':'none';
      layer.style.opacity='1';
      layer.style.setProperty('transform','none','important');
      layer.style.zIndex=active?'2':'0';
    });
    roomVisibleFace=roomShelfFace;
    return;
  }
  // Desktop keeps the current framed-page implementation.
  const viewport=document.querySelector('#roomShelfScroll');
  const travelPx=Math.max(1,viewport?.clientWidth||grid.clientWidth||window.innerWidth);
  grid.querySelectorAll('.room-shelf-face').forEach(layer=>{
    const face=Number(layer.dataset.face)||0,delta=wrapDeg(shelfWorldAngle(face)-yaw),dist=Math.abs(delta);
    const travel=Math.min(1.30,dist/ROOM_VIEW_SLOT_DEG),side=Math.sign(delta)||1;
    const xPx=side*travel*travelPx;
    const visible=dist<89.9;
    layer.style.visibility=visible?'visible':'hidden';
    layer.style.pointerEvents=dist<18?'auto':'none';
    layer.style.opacity=visible?'1':'0';
    layer.style.setProperty('transform',`translate3d(${xPx}px,0,0)`,'important');
    layer.style.zIndex=String(100-Math.round(dist));
  });
  if(roomVisibleFace!==near.face&&near.dist<8)renderRoomShelfFace(near.face,true);
}
function scheduleRoomShelfVisualYaw(targetYaw,force=false){
  roomShelfVisualTargetYaw=targetYaw;
  if(force||roomShelfVisualYaw==null){
    roomShelfVisualYaw=targetYaw;roomShelfVisualLastTs=0;
    if(roomShelfVisualRaf){cancelAnimationFrame(roomShelfVisualRaf);roomShelfVisualRaf=0;}
    paintRoomShelfAtYaw(roomShelfVisualYaw);return;
  }
  if(roomShelfVisualRaf)return;
  const tick=ts=>{
    roomShelfVisualRaf=0;
    const dt=roomShelfVisualLastTs?Math.min(34,ts-roomShelfVisualLastTs):16.67;roomShelfVisualLastTs=ts;
    // ~42 ms time constant: enough to hide Safari's visible stepping, short enough to feel attached to the finger.
    const k=1-Math.exp(-dt/42);
    const d=roomShelfVisualTargetYaw-roomShelfVisualYaw;
    roomShelfVisualYaw+=d*k;
    if(Math.abs(d)<0.025){roomShelfVisualYaw=roomShelfVisualTargetYaw;paintRoomShelfAtYaw(roomShelfVisualYaw);roomShelfVisualLastTs=0;return;}
    paintRoomShelfAtYaw(roomShelfVisualYaw);
    roomShelfVisualRaf=requestAnimationFrame(tick);
  };
  roomShelfVisualRaf=requestAnimationFrame(tick);
}
function applyRoomCamera(previewDeg=0,instant=false){
  if(roomId!=='fantasy')return;
  roomCameraPreview=previewDeg;const yaw=roomCameraYaw+previewDeg;
  // Keep the panoramic background directly attached to the true shared camera.
  const panoW=Math.max(2,store.clientHeight*2);
  const bg=document.querySelector('#roomBgLayer');
  store.style.setProperty('--room-yaw',`${yaw}deg`);
  if(bg){
    bg.style.transition='none';bg.style.backgroundSize=`${panoW}px 100%`;
    if(window.matchMedia('(min-width:681px)').matches){
      // V2.24.6: desktop room scenery is a fixed architectural backdrop.
      // Only the shelf wall slides when changing 0/90/180/270 faces.
      bg.style.transform='translate3d(0,0,0)';
    }else{
      const phase=wrapDeg(yaw)/360;
      bg.style.transform=`translate3d(${-phase*panoW}px,0,0)`;
    }
  }
  // Shelf-only visual smoothing. `instant` means input is current, not that the shelf should bypass smoothing.
  // Force only the first paint so entering the room never animates from an old session angle.
  scheduleRoomShelfVisualYaw(yaw,roomShelfVisualYaw==null||window.matchMedia('(max-width:680px)').matches);
}
function scheduleRoomMotionRender(){
  if(roomMotionRenderRaf)return;
  roomMotionRenderRaf=requestAnimationFrame(()=>{roomMotionRenderRaf=0;applyRoomCamera(0,true);});
}
// V2.16.9 — four stable 90° viewing slots. Shelf 1 is at 0°, shelf 2 at 90°.
// The empty quarter-turns are intentional scenery gaps. Every completed horizontal swipe
// settles to a 90° slot while device motion remains free between slots.
function nearestRoomViewSlot(yaw){return Math.round(yaw/ROOM_VIEW_SLOT_DEG)*ROOM_VIEW_SLOT_DEG;}
function settleRoomYaw(){
  if(!roomShelfMode)return;
  const current=roomCameraYaw+roomCameraPreview,target=nearestRoomViewSlot(current),from=current,start=performance.now(),dur=240;
  function tick(now){const t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3),v=from+(target-from)*e;roomCameraYaw=v;roomCameraPreview=0;applyRoomCamera(0,true);if(t<1)requestAnimationFrame(tick);else{roomCameraYaw=target;applyRoomCamera(0,true);}}
  requestAnimationFrame(tick);
}
function rotateRoomShelf(delta){roomCameraYaw=nearestRoomViewSlot(roomCameraYaw)+delta*ROOM_VIEW_SLOT_DEG;roomCameraPreview=0;settleRoomYaw();}
function onRoomOrientation(e){
  if(!roomMotionOn||!roomShelfMode||roomId!=='fantasy'||document.querySelector('#genreRoomDialog[open]')||typeof e.alpha!=='number')return;
  const a=e.alpha;roomMotionLatestAlpha=a;
  // While touch or snap animation owns the camera, only remember the newest sensor angle.
  // Never write yaw here: this prevents the sensor and finger/RAF from pulling the same camera back and forth.
  if(roomCameraInputLock||roomShelfTap||roomCameraSettleRaf||phoneShelfSlide){roomMotionLastAlpha=a;return;}
  if(roomMotionLastAlpha==null){roomMotionBaseAlpha=a;roomMotionLastAlpha=a;return;}
  let d=a-roomMotionLastAlpha;if(d>180)d-=360;if(d<-180)d+=360;roomMotionLastAlpha=a;
  roomCameraYaw-=d*.72;roomCameraPreview=0;scheduleRoomMotionRender();
}
function rebaseRoomMotion(){
  if(!roomMotionOn)return;
  const a=roomMotionLatestAlpha;roomMotionBaseAlpha=(typeof a==='number'?a:null);roomMotionLastAlpha=(typeof a==='number'?a:null);
}
function animateRoomYaw(from,target,dur=280){
  if(roomCameraSettleRaf)cancelAnimationFrame(roomCameraSettleRaf);
  roomCameraInputLock=true;roomCameraPreview=0;const start=performance.now();
  const tick=now=>{
    const t=Math.min(1,(now-start)/dur),ease=1-Math.pow(1-t,3);
    roomCameraYaw=from+(target-from)*ease;applyRoomCamera(0,true);
    if(t<1){roomCameraSettleRaf=requestAnimationFrame(tick);return;}
    roomCameraSettleRaf=0;roomCameraYaw=target;if(window.matchMedia('(max-width:680px)').matches&&roomShelfMode){renderRoomShelfFace(nearestShelfForYaw(target).face,true);paintRoomShelfAtYaw(target);}applyRoomCamera(0,true);rebaseRoomMotion();roomCameraInputLock=false;
  };
  roomCameraSettleRaf=requestAnimationFrame(tick);
}
async function toggleRoomMotion(){
  const b=document.querySelector('#roomMotion');
  if(roomMotionOn){
    // V2.18.10: turning motion OFF is a deliberate landing action.
    // Never leave the reader stranded between physical shelf faces: glide to the nearest real shelf.
    const current=roomCameraYaw+roomCameraPreview,near=nearestShelfForYaw(current),target=current+near.delta;
    roomMotionOn=false;window.removeEventListener('deviceorientation',onRoomOrientation);roomMotionBaseAlpha=roomMotionLastAlpha=roomMotionLatestAlpha=null;roomCameraPreview=0;
    if(b){b.classList.remove('is-on');b.textContent='◎ 360°モーション OFF';}
    animateRoomYaw(current,target,260);return;
  }
  try{
    if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('denied');}
    roomMotionOn=true;roomMotionBaseAlpha=roomMotionLastAlpha=roomMotionLatestAlpha=null;window.addEventListener('deviceorientation',onRoomOrientation,{passive:true});if(b){b.classList.add('is-on');b.textContent='◉ 360°モーション ON';}
  }catch(_){if(b)b.textContent='◎ モーション許可なし';}
}
function updateRoomShelfPerspective(){
  const scroller=document.querySelector('#roomShelfScroll');if(!roomShelfMode||!scroller)return;
  if(window.matchMedia('(max-width:680px)').matches){
    scroller.querySelectorAll('.room-shelf-row').forEach(row=>{
      row.style.setProperty('--shelf-tilt','0deg');
      row.style.setProperty('--shelf-scale','1');
      row.style.setProperty('--shelf-z','0px');
      row.style.transform='none';row.style.opacity='1';row.style.zIndex='1';
    });
    return;
  }
  // V2.24.9: all Genre Room shelf pages stay flat on desktop and iPhone.
  scroller.querySelectorAll('.room-shelf-row').forEach(row=>{row.style.setProperty('--shelf-tilt','0deg');row.style.setProperty('--shelf-scale','1');row.style.setProperty('--shelf-z','0px');row.style.opacity='1';row.style.zIndex='1';});
}
function roomShelfRingSelection(tappedIndex){
  const face=roomShelfFaces().find(face=>face.indices.includes(tappedIndex));
  return face?{books:face.books.slice(),index:face.indices.indexOf(tappedIndex)}:null;
}
async function openShelfRow(start,focusOffset=0,forceRing=false){
  // Mobile opens only the tapped physical wall, preserving its book order.
  const selected=roomShelfAllBooks;if(!selected.length)return;
  const tappedIndex=Math.max(0,Math.min(selected.length-1,(Number(start)||0)+(Number(focusOffset)||0)));
  // PC opens the existing detail overlay over the unchanged shelf.
  if(!forceRing&&window.matchMedia('(min-width:681px)').matches){
    books=selected;index=tappedIndex;dragUnits=0;
    pick(selected[tappedIndex]);return;
  }
  const ring=roomShelfRingSelection(tappedIndex);if(!ring?.books.length)return;
  const token=++spinToken;
  roomShelfMode=false;document.querySelector('#roomShelf').hidden=true;books=ring.books;index=ring.index;dragUnits=0;stage.hidden=false;
  stage.classList.add('room-shelf-ring');
  document.querySelector('#prev').hidden=false;document.querySelector('#next').hidden=false;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=false;
  document.querySelector('#hint').textContent='左右にスワイプしてこの棚の本を見る　／　上スワイプで棚へ戻る';
  document.querySelector('.sign').classList.add('shelf-back-sign');
  stage.innerHTML='';await preloadFirstViewCovers();if(token!==spinToken||roomShelfMode||roomId!=='fantasy')return;renderFirstViewRing(index-4.2);stage.classList.add('is-intro-spinning');
  const startTime=performance.now(),dur=1450;
  await new Promise(resolve=>{function frame(now){if(token!==spinToken||roomShelfMode||roomId!=='fantasy'){resolve();return;}const t=Math.min(1,(now-startTime)/dur),ease=1-Math.pow(1-t,3.4),center=index-4.2*(1-ease),depth=.12+.88*(1-Math.pow(1-t,1.8));stage.querySelectorAll('.book').forEach(b=>setBookPose(b,wrappedOffsetFrom(center,Number(b.dataset.index)),depth));if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
  if(token!==spinToken||roomShelfMode||roomId!=='fantasy')return;
  stage.classList.remove('is-intro-spinning');render();updateFocusPanel();
}
function openActiveShelfRing(){
  const face=roomShelfFaces()[roomShelfFace];if(!face?.books.length)return;
  const focused=document.activeElement?.closest?.('[data-book-index]');
  const selected=focused?Number(focused.dataset.bookIndex):NaN;
  openShelfRow(face.indices.includes(selected)?selected:face.indices[0],0,true);
}
function backToRoomShelf(){
  if(roomId!=='fantasy'||roomShelfMode)return;
  spinToken++;stage.classList.remove('is-intro-spinning');
  // V2.16.15R1: always hand the shared camera back to motion when the shelf returns.
  roomShelfTap=null;roomCameraInputLock=false;roomCameraPreview=0;rebaseRoomMotion();
  books=roomShelfAllBooks;stage.classList.remove('room-shelf-ring','is-shelf-returning');stage.style.removeProperty('--shelf-return-y');stage.style.removeProperty('--shelf-return-scale');document.querySelector('.sign').classList.remove('shelf-back-sign');renderRoomShelf();
  requestAnimationFrame(()=>{rebaseRoomMotion();applyRoomCamera(0,true);});
}


function wrapDeg(v){while(v>180)v-=360;while(v<-180)v+=360;return v;}
function hallGates(){return [...document.querySelectorAll('.hall-gate[data-angle]')];}
function hallSpatialItems(){return [...document.querySelectorAll('.hall-gate[data-angle],.hall-my-shelf[data-angle]')];}
function hallShelfBooks(kind){return (kind==='mine'?ownedBooks:kind==='later'?readLaterBooks():allBooks.slice(0,8)).filter(Boolean);}
function renderHallShelf(rootId,kind){const root=document.querySelector(rootId);if(!root)return;const sample=hallShelfBooks(kind).slice(0,8);root.innerHTML=sample.map((w,i)=>`<button class="hall-my-book" type="button" data-hall-book="${i}" aria-label="${esc(w.title||'本')}">${bookMarkup(w)}</button>`).join('');hydrateCoverLoadState(root);root.querySelectorAll('.hall-my-book').forEach((b,i)=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const w=sample[i];if(w)openHallShelfRing(kind,i,false);}));}
function renderHallMyShelf(){renderHallShelf('#hallNewShelfBooks','new');renderHallShelf('#hallMyShelfBooks',hallLibraryKind);const later=readLaterBooks(),mine=ownedBooks;const title=document.querySelector('#hallLibraryTitle'),count=document.querySelector('#hallLibraryCount'),ownedTab=document.querySelector('#hallOwnedTab'),laterTab=document.querySelector('#hallLaterTab');if(title)title.textContent=hallLibraryKind==='later'?'あとで読む':'もっている本';if(count)count.textContent=hallLibraryKind==='later'?(later.length?`${later.length}冊`:'まだ保存した本がありません'):(mine.length?`${mine.length}冊`:'まだ本がありません');ownedTab?.classList.toggle('is-active',hallLibraryKind==='mine');laterTab?.classList.toggle('is-active',hallLibraryKind==='later');ownedTab?.setAttribute('aria-selected',hallLibraryKind==='mine'?'true':'false');laterTab?.setAttribute('aria-selected',hallLibraryKind==='later'?'true':'false');}
async function openHallShelfRing(kind,selectedIndex=0,openDetailAfterSpin=false){
  const selected=hallShelfBooks(kind);if(!selected.length)return;
  hallShelfRing=true;hallShelfKind=kind;hallPreview=0;hallDrag=null;rebaseHallMotion();
  const hallBg=document.querySelector('#roomBgLayer');
  document.querySelector('#centralHall').hidden=true;if(hallBg){hallBg.style.display='block';hallBg.style.removeProperty('background-size');hallBg.style.backgroundPosition=`calc(50% + ${hallBackgroundOffsetPx(hallYaw,hallBg).toFixed(2)}px) center`;}
  // V2.22.4: Hall shelf/ring keeps the exact Hall panorama geometry. Removing
  // hall-mode used to fall back to generic background-size:cover on desktop,
  // which looked like the room suddenly zoomed when a shelf became a ring.
  store.classList.remove('hall-mode','intro-mode');store.classList.add('hall-ring-mode');roomId='hall-shelf-ring';viewMode='ring';roomShelfMode=false;books=selected;index=norm(selectedIndex);dragUnits=0;
  stage.hidden=false;stage.style.transform='';stage.style.opacity='';stage.classList.add('room-shelf-ring');stage.classList.remove('is-shelf-returning','is-intro-spinning','is-intro-ready');
  document.querySelector('.sign small').textContent=kind==='mine'?'MY BOOKS':kind==='later'?'READ LATER':'NEW ARRIVALS';document.querySelector('.sign strong').textContent=kind==='mine'?'もっている本':kind==='later'?'あとで読む':'新しく入った本';document.querySelector('.sign').classList.add('shelf-back-sign');
  document.querySelector('#prev').hidden=false;document.querySelector('#next').hidden=false;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=false;document.querySelector('#hint').textContent='左右で円環を見る　／　上スワイプで棚へ戻る';
  // V2.18.8: Hall shelves use the exact same thumbnail -> spinning ring entrance as Fantasy Forest.
  // Keep the tapped thumbnail as the focal book and let the ring grow out of the distant vortex before landing.
  stage.innerHTML='';await preloadFirstViewCovers();
  if(!hallShelfRing||roomId!=='hall-shelf-ring')return;
  renderFirstViewRing(index-4.2);stage.classList.add('is-intro-spinning');
  const startTime=performance.now(),dur=1450;
  await new Promise(resolve=>{function frame(now){
    if(!hallShelfRing||roomId!=='hall-shelf-ring'){resolve();return;}
    const t=Math.min(1,(now-startTime)/dur),ease=1-Math.pow(1-t,3.4),center=index-4.2*(1-ease),depth=.12+.88*(1-Math.pow(1-t,1.8));
    stage.querySelectorAll('.book').forEach(b=>setBookPose(b,wrappedOffsetFrom(center,Number(b.dataset.index)),depth));
    if(t<1)requestAnimationFrame(frame);else resolve();
  }requestAnimationFrame(frame)});
  if(!hallShelfRing||roomId!=='hall-shelf-ring')return;
  stage.classList.remove('is-intro-spinning');render();updateFocusPanel();
  // V2.21.8: shelf cover -> ring -> stop on the selected cover.
  // Detail is intentionally NOT opened here; the reader taps the centered ring cover
  // to open it, matching the genre-room interaction. The ring collection/index stays
  // aligned so detail left/right follows the same shelf order.
}
function backToHallShelf(){
  if(!hallShelfRing)return;hallShelfRing=false;store.classList.remove('hall-ring-mode');stage.classList.remove('room-shelf-ring','is-shelf-returning');stage.style.removeProperty('--shelf-return-y');stage.style.removeProperty('--shelf-return-scale');document.querySelector('.sign').classList.remove('shelf-back-sign');showCentralHall(false);
}

// V2.18.31 — Hall background camera is normalized to the actual repeated tile width.
// bookstore-v211-bg.webp is 1536x1024 (3:2) and Hall paints it at auto 100%,
// so one complete 360deg turn must move exactly one rendered image tile (height * 1.5).
function hallBackgroundOffsetPx(yaw,bgEl=document.querySelector('#roomBgLayer')){
  const h=Math.max(1,bgEl?.clientHeight||store.clientHeight||window.innerHeight||1);
  const tileW=h*1.5;
  return -(yaw/360)*tileW;
}
function renderHall(){
  if(viewMode!=='hall')return;
  const yaw=hallYaw+hallPreview,w=Math.max(320,store.clientWidth||390);
  const bg=document.querySelector('#roomBgLayer');if(bg){
    // V2.18.2: keep the hall background layer fixed and loop the texture itself.
    // Moving the oversized layer eventually exposed its edge as a black wall.
    // V2.18.3: keep the texture coordinate continuous across ±180°.
    // The source art is not a seamless equirectangular 360 image, so its own left/right
    // content seam can still be visible, but the camera itself no longer snaps at the boundary.
    bg.style.transform='none';
    bg.style.backgroundPosition=`calc(50% + ${hallBackgroundOffsetPx(yaw,bg).toFixed(2)}px) center`;
  }
  hallSpatialItems().forEach(g=>{const a=Number(g.dataset.angle||0),d=wrapDeg(a-yaw),x=Math.sin(d*Math.PI/180)*w*.78,depth=Math.cos(d*Math.PI/180),scale=.72+.28*Math.max(0,depth),op=.18+.82*Math.max(0,depth);g.style.transform=`translate3d(calc(-50% + ${x.toFixed(2)}px),0,0) scale(${scale.toFixed(3)})`;g.style.opacity=String(op);g.style.zIndex=String(20+Math.round(depth*10));g.style.pointerEvents=Math.abs(d)<42?'auto':'none';});
}
function rebaseHallMotion(){hallMotionLastAlpha=null;}
function onHallOrientation(e){if(!hallMotionOn||viewMode!=='hall'||hallDrag||routeTransitioning||typeof e.alpha!=='number')return;const a=e.alpha;if(hallMotionLastAlpha==null){hallMotionLastAlpha=a;return;}let d=a-hallMotionLastAlpha;if(d>180)d-=360;if(d<-180)d+=360;hallMotionLastAlpha=a;hallYaw-=d*.72;hallPreview=0;requestAnimationFrame(renderHall);}
async function toggleHallMotion(){const b=document.querySelector('#hallMotion');if(hallMotionOn){hallMotionOn=false;window.removeEventListener('deviceorientation',onHallOrientation);hallMotionLastAlpha=null;b?.classList.remove('is-on');if(b){b.textContent='◎ 360°モーション OFF';b.setAttribute('aria-pressed','false');}
  // V2.18.10: Hall uses the same landing rule — OFF settles to the nearest 0/90/180/270 storefront.
  hallPreview=0;settleHall();return;}try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted')return;}hallMotionOn=true;hallMotionLastAlpha=null;window.addEventListener('deviceorientation',onHallOrientation,{passive:true});b?.classList.add('is-on');if(b){b.textContent='◉ 360°モーション ON';b.setAttribute('aria-pressed','true');}}catch(_){}}
function settleHall(){const from=hallYaw+hallPreview,target=Math.round(from/90)*90,start=performance.now(),dur=230;hallYaw=from;hallPreview=0;function tick(now){const t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3);hallYaw=from+(target-from)*e;renderHall();if(t<1)requestAnimationFrame(tick);else{hallYaw=target;rebaseHallMotion();renderHall();}}requestAnimationFrame(tick);}
function showNewArrivalsFromHall(){
  // NEW ARRIVALS is the home face of Central Sakura Hall, not a separate page.
  hallPreview=0;hallDrag=null;rebaseHallMotion();
  document.querySelector('#centralHall').hidden=true;
  store.classList.remove('hall-mode','room-fantasy');store.classList.add('intro-mode');
  document.body.classList.remove('book-path-active');document.body.classList.add('intro-entry-active');
  document.querySelector('#roomBgLayer').style.display='none';document.querySelector('#roomExitNav').hidden=true;
  document.querySelector('#bookPath').hidden=true;document.querySelector('#roomShelf').hidden=true;document.querySelector('#motionStart').hidden=true;
  roomId='intro';viewMode='ring';roomShelfMode=false;books=allBooks.slice();introReady=true;
  // V2.23.0: NEW ARRIVALS owns the shared ring sign. A previous MY BOOKS ring
  // could leave its label behind because Hall itself hides this sign.
  const sharedSign=document.querySelector('.sign');
  if(sharedSign){sharedSign.querySelector('small').textContent='NEW ARRIVALS';sharedSign.querySelector('strong').textContent='新しく入った本';sharedSign.classList.remove('shelf-back-sign');}
  stage.hidden=false;stage.style.transform='';stage.style.opacity='';stage.classList.remove('room-shelf-ring','is-shelf-returning','is-intro-spinning');stage.classList.add('is-intro-ready');
  document.querySelector('#prev').hidden=false;document.querySelector('#next').hidden=false;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=false;
  document.querySelector('#ringMode')?.classList.add('is-active');document.querySelector('#pathMode')?.classList.remove('is-active');
  const ih=document.querySelector('#introHint');if(ih)ih.textContent='↑ 上にスワイプして中央ホールへ';setIntroHintVisible(true);
  render();updateFocusPanel();window.scrollTo(0,0);
}
function makeRouteCrossfadeLayer(kind, role='old'){
  const layer=document.createElement('div');
  const paintKind=kind==='outerpath'?'path':kind;
  layer.className=`route-crossfade-layer route-crossfade-${paintKind} route-crossfade-${role}`;
  layer.setAttribute('aria-hidden','true');
  // Preserve the live 360 camera only for the OLD room being painted out.
  // Never copy #roomBgLayer into a NEW destination layer: during Fantasy -> Hall
  // #roomBgLayer still contains Fantasy, which made the new Hall overlay paint Fantasy
  // over Fantasy and then pop to Hall after cleanup instead of visibly crossfading.
  if(role==='old'&&kind==='path'){
    // Capture the currently visible curved section or genre approach before handoff.
    const src=document.querySelector('.path-zone-bg.is-visible')||document.querySelector('#pathZoneBgA');
    if(src){
      const cs=getComputedStyle(src);
      layer.style.backgroundImage=cs.backgroundImage;
      layer.style.backgroundSize=cs.backgroundSize;
      layer.style.backgroundPosition=cs.backgroundPosition;
      layer.style.backgroundRepeat=cs.backgroundRepeat;
    }
  }
  if(role==='old'&&(kind==='hall'||kind==='fantasy')){
    const src=document.querySelector('#roomBgLayer');
    if(src){
      const cs=getComputedStyle(src);
      layer.style.backgroundImage=cs.backgroundImage;
      layer.style.backgroundSize=cs.backgroundSize;
      layer.style.backgroundRepeat=cs.backgroundRepeat;
      layer.style.backgroundPosition=cs.backgroundPosition;
    }
  }
  // V2.18.29: when Fantasy returns to Hall, the destination overlay must
  // already paint the Hall at the same 180deg camera angle as the live Hall.
  // Otherwise the crossfade shows Hall 0deg and pops to 180deg on cleanup.
  // V2.20.2: Hall/genre-room -> OUTER Book Road must never use the generic
  // .route-crossfade-path image (that image is the straight Fantasy approach).
  // Paint the exact current outer-road genre background before the fade begins.
  if(role==='new'&&kind==='outerpath'){
    const span=outerPathLength();
    const lap=((lastOuterPathProgress%span)+span)%span;
    const zi=Math.min(PATH_ZONE_COUNT-1,Math.floor(lap/PATH_BOOKS_PER_ZONE_TEST));
    const z=PATH_ZONES[zi]||PATH_ZONES[0];
    layer.style.backgroundImage=`linear-gradient(rgba(7,5,3,.06),rgba(7,5,3,.13)),url('${z.bg}')`;
    layer.style.backgroundSize='cover';layer.style.backgroundPosition=z.pos||'50% 50%';layer.style.backgroundRepeat='no-repeat';
  }
  if(role==='new'&&kind==='path'){
    layer.style.backgroundImage=`linear-gradient(rgba(7,5,3,.06),rgba(7,5,3,.13)),url('${currentGenre().approachBg}')`;
  }
  if(role==='new'&&kind==='fantasy'){
    layer.style.backgroundImage=`linear-gradient(rgba(5,12,6,.12),rgba(4,8,5,.24)),url('${currentGenre().roomBg}')`;
  }
  if(role==='new'&&kind==='hall'){
    layer.style.backgroundPosition=`calc(50% + ${hallBackgroundOffsetPx(hallYaw+hallPreview,layer).toFixed(2)}px) center`;
  }
  store.appendChild(layer);
  return layer;
}
function startRouteCrossfade(fromKind,toKind){
  // V2.18.23: true route crossfade. Two temporary painted layers own the
  // transition, rather than relying on the destination DOM becoming visible
  // underneath one fading layer. This is deterministic on iPhone Safari.
  const oldLayer=makeRouteCrossfadeLayer(fromKind,'old');
  const newLayer=makeRouteCrossfadeLayer(toKind,'new');
  return {oldLayer,newLayer};
}
function fadeRouteLayers(pair){
  if(!pair)return;
  const {oldLayer,newLayer}=pair;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    oldLayer?.classList.add('is-crossfade-out');
    newLayer?.classList.add('is-crossfade-in');
  }));
  setTimeout(()=>{oldLayer?.remove();newLayer?.remove();},1100);
}
function showCentralHall(fromIntro=false){
  const returningFromPath=viewMode==='path'&&roomId==='path';
  if(returningFromPath)lastOuterPathProgress=pathProgress;
  const returningFromFantasy=roomId==='fantasy';
  // V2.18.29: Fantasy's Hall exit lands facing the Fantasy entrance (180deg).
  // Commit that camera BEFORE the destination crossfade layer is created, so
  // there is no intermediate Hall 0deg frame and no post-fade camera jump.
  if(returningFromFantasy){hallYaw=180;hallPreview=0;hallDrag=null;rebaseHallMotion();}
  // V2.18.26: Fantasy -> Central Hall uses the same deterministic two-layer
  // crossfade as the other room/route handoffs. Capture the live Fantasy
  // background before roomId/viewMode are reset below.
  // V2.18.30: Fantasy -> Hall is special: keep ONLY a frozen Fantasy layer
  // above the real Hall. Then mount/render the real Hall at 180deg underneath it
  // before fading Fantasy away. This removes the temporary synthetic Hall frame
  // that could show 0deg before the live Hall settled to 180deg on iPhone Safari.
  const routeFade=returningFromPath
    ? startRouteCrossfade('path','hall')
    : returningFromFantasy
      ? {oldLayer:makeRouteCrossfadeLayer('fantasy','old'),newLayer:null}
      : null;
  hallShelfRing=false;pathVelocity=0;pathDrag=null;pathBookHold=null;hideFantasyGate();roomId='hall';viewMode='hall';roomShelfMode=false;introReady=false;
  store.classList.remove('intro-mode','room-fantasy','hall-ring-mode');store.classList.add('hall-mode');document.body.classList.remove('book-path-active','intro-entry-active');
  stage.hidden=true;stage.classList.remove('is-intro-ready');setIntroHintVisible(false);
  document.querySelector('#bookPath').hidden=true;document.querySelector('#roomShelf').hidden=true;document.querySelector('#motionStart').hidden=true;
  document.querySelector('#prev').hidden=true;document.querySelector('#next').hidden=true;document.querySelector('#focusPanel').hidden=true;document.querySelector('#hint').hidden=true;
  document.querySelector('#centralHall').hidden=false;
  const hallBg=document.querySelector('#roomBgLayer');
  if(hallBg){
    // V2.18.32: Fantasy's shared camera writes an inline pixel background-size
    // (panoW x 100%) onto this same layer. That inline value survived the room
    // switch and overrode Hall's `auto 100%`, so Hall 180deg used a different
    // physical tile width after returning from Fantasy. Reset room-owned camera
    // styles before the first Hall paint so normal Hall and returned Hall share
    // exactly the same yaw -> texture mapping.
    hallBg.style.removeProperty('background-size');
    hallBg.style.removeProperty('transition');
    hallBg.style.transform='none';
    hallBg.style.display='block';
  }
  document.querySelector('#roomExitNav').hidden=true;
  renderHallMyShelf();if(fromIntro){hallYaw=0;document.querySelector('#hallTutorial').hidden=false;} renderHall();
  // For Fantasy -> Hall, commit the REAL 180deg Hall for two paints while the
  // frozen Fantasy layer still fully covers it, then fade that cover away.
  // Other already-working routes keep their existing crossfade timing untouched.
  if(routeFade){
    if(returningFromFantasy){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(viewMode==='hall'&&roomId==='hall'){renderHall();fadeRouteLayers(routeFade);}
        else routeFade.oldLayer?.remove();
      }));
    }else fadeRouteLayers(routeFade);
  }
}
function enterBookPathFromHall(){if(!dataReady)return;clearGenreApproachTheme();const routeFade=startRouteCrossfade('hall','outerpath');document.querySelector('#centralHall').hidden=true;store.classList.remove('hall-mode');roomId='path';viewMode='path';books=allBooks.slice();pathProgress=lastOuterPathProgress;pathYaw=0;pathVelocity=0;pathZoneId='';setRoomVisual('new');document.body.classList.add('book-path-active');stage.hidden=true;document.querySelector('#bookPath').hidden=false;document.querySelector('#motionStart').hidden=false;document.querySelector('#prev').hidden=true;document.querySelector('#next').hidden=true;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=true;document.querySelector('#roomExitNav').hidden=true;renderPath();ensurePathLoop();primeNextRoomBackground('fantasy');fadeRouteLayers(routeFade);}
function returnToPathFromRoom(){
  spinToken++;hideRingUiForPath();
  // V2.19.8: the room's "本の道" exit means the OUTER circular Book Path,
  // not the private straight approach used to enter the room.
  const routeFade=roomId==='fantasy'?startRouteCrossfade('fantasy','outerpath'):null;
  roomMotionOn&&toggleRoomMotion();roomShelfMode=false;store.classList.remove('room-fantasy');
  document.querySelector('#roomShelf').hidden=true;document.querySelector('#roomExitNav').hidden=true;
  viewMode='path';document.body.classList.add('book-path-active');document.querySelector('#bookPath').hidden=false;
  roomId='path';activeGenreId='fantasy';books=allBooks.slice();pathProgress=lastOuterPathProgress;
  clearGenreApproachTheme();setRoomVisual('new');
  document.querySelector('#motionStart').hidden=false;
  pathYaw=0;pathVelocity=0;pathZoneId='';hideFantasyGate();renderPath();ensurePathLoop();if(routeFade)fadeRouteLayers(routeFade);
}

async function enterFantasyRoom(){
  if(routeTransitioning||!dataReady)return;
  routeTransitioning=true;
  const backgroundReady=preloadRoomBackground(activeGenreId);
  try{await ensureCatalogueGenre(activeGenreId);}catch(error){routeTransitioning=false;alert(error.message);return;}
  approachOriginRoom=null;
  lastFantasyEntryRoute=roomId;
  if(roomId==='forest')lastForestPathProgress=pathProgress;
  else if(roomId==='path')lastOuterPathProgress=pathProgress;
  routeTransitioning=true;pathVelocity=0;
  // V2.18.19: strict room-entry order:
  // 1) decode background, 2) mount it transparent, 3) start background fade,
  // 4) only then prepare/start the ring. This makes the fade deterministic on iPhone Safari.
  spinToken++;drag=null;hallShelfRing=false;stage.hidden=true;stage.style.opacity='0';stage.innerHTML='';
  stage.classList.remove('is-intro-ready','is-intro-spinning','room-shelf-ring','is-shelf-returning');
  const path=document.querySelector('#bookPath');path?.classList.add('route-leaving');
  const oldFx=document.querySelector('#roomTransitionFx');if(oldFx)oldFx.remove();
  const roomBg=document.querySelector('#roomBgLayer');

  // Wait for the actual room image to be loaded + decoded before changing visual ownership.
  await backgroundReady;
  if(!routeTransitioning)return;

  // V2.18.21: keep a lightweight copy of the path background alive during the handoff.
  // The destination room fades in underneath while this layer fades out, so Safari never
  // has to "replace then fade" a background in the same paint.
  const oldRoomLayer=document.createElement('div');
  oldRoomLayer.className='room-crossfade-old room-crossfade-old-path';
  oldRoomLayer.setAttribute('aria-hidden','true');
  const outgoingBg=store.classList.contains('hall-mode')?roomBg:(document.querySelector('.path-zone-bg.is-visible')||document.querySelector('#pathZoneBgA'));
  if(outgoingBg){const cs=getComputedStyle(outgoingBg);for(const prop of ['backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat'])oldRoomLayer.style[prop]=cs[prop];}
  store.appendChild(oldRoomLayer);

  roomHistory.push({id:lastFantasyEntryRoute,progress:pathProgress});clearGenreApproachTheme();roomId='fantasy';roomShelfAllBooks=genreBooks(activeGenreId);books=roomShelfAllBooks.slice();index=0;dragUnits=0;roomShelfMode=false;document.querySelector('#centralHall').hidden=true;store.classList.remove('hall-mode','intro-mode');
  setRoomVisual('fantasy');viewMode='ring';document.body.classList.remove('book-path-active');
  if(roomBg){
    roomBg.style.display='block';
    roomBg.classList.remove('is-room-visible');
    roomBg.classList.add('room-enter-fade');
    void roomBg.offsetWidth;
  }
  roomCameraYaw=0;roomCameraPreview=0;rebaseRoomMotion();applyRoomCamera(0,true);
  const pathMotion=document.querySelector('#motionStart');if(pathMotion)pathMotion.hidden=true;
  document.querySelector('#ringMode')?.classList.add('is-active');document.querySelector('#pathMode')?.classList.remove('is-active');
  path.hidden=true;path?.classList.remove('route-leaving');document.querySelector('#roomShelf').hidden=true;
  stage.hidden=true;stage.style.transform='';stage.style.opacity='0';stage.classList.add('room-shelf-ring');stage.classList.remove('is-shelf-returning','is-intro-ready');
  document.querySelector('.sign').classList.add('shelf-back-sign');
  document.querySelector('#prev').hidden=false;document.querySelector('#next').hidden=false;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=false;
  document.querySelector('#hint').textContent='左右にスワイプしてRoomの本を見る　／　上スワイプで棚へ';
  document.querySelector('#roomExitNav').hidden=false;

  // Commit the transparent decoded background, then start the fade on a later paint.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(roomId!=='fantasy'){routeTransitioning=false;return;}
  // Start both sides of the real crossfade on the same committed frame.
  roomBg?.classList.add('is-room-visible');
  oldRoomLayer.classList.add('is-crossfade-out');
  const fadeStarted=performance.now();
  if(!books.length){
    stage.innerHTML='';stage.hidden=true;renderRoomShelf();
    const fadeRemain=1220-(performance.now()-fadeStarted);if(fadeRemain>0)await new Promise(r=>setTimeout(r,fadeRemain));
    if(roomBg)roomBg.classList.remove('room-enter-fade','is-room-visible');oldRoomLayer.remove();routeTransitioning=false;return;
  }

  // Prepare covers only after the background fade has actually started.
  stage.innerHTML='';
  const coverJob=preloadFirstViewCovers();
  const minHeadStart=new Promise(r=>setTimeout(r,300));
  await Promise.all([coverJob,minHeadStart]);
  if(roomId!=='fantasy'){routeTransitioning=false;return;}

  renderFirstViewRing(index-4.2);stage.classList.add('is-intro-spinning');
  stage.hidden=false;stage.style.opacity='1';
  const startTime=performance.now(),dur=1450;
  await new Promise(resolve=>{function frame(now){
    if(roomId!=='fantasy'){resolve();return;}
    const t=Math.min(1,(now-startTime)/dur),ease=1-Math.pow(1-t,3.4),center=index-4.2*(1-ease),depth=.12+.88*(1-Math.pow(1-t,1.8));
    stage.querySelectorAll('.book').forEach(b=>setBookPose(b,wrappedOffsetFrom(center,Number(b.dataset.index)),depth));
    if(t<1)requestAnimationFrame(frame);else resolve();
  }requestAnimationFrame(frame)});
  if(roomId==='fantasy'){stage.classList.remove('is-intro-spinning');render();updateFocusPanel();}
  // Let the CSS fade complete independently; cleanup only after its nominal duration.
  const fadeRemain=1220-(performance.now()-fadeStarted);if(fadeRemain>0)await new Promise(r=>setTimeout(r,fadeRemain));
  if(roomBg){roomBg.classList.remove('room-enter-fade','is-room-visible');}
  oldRoomLayer.remove();
  routeTransitioning=false;
}
function setViewMode(mode){
  const next=mode==='path'?'path':'ring';
  if(next===viewMode)return;
  if(next==='ring')syncRingFromPath();else syncPathFromRing();
  viewMode=next;
  if(next==='path'&&roomId==='new')roomId='path';else if(next==='ring'&&roomId==='path')roomId='new';
  setRoomVisual(roomId==='fantasy'?'fantasy':'new');
  document.body.classList.toggle('book-path-active',viewMode==='path');
  document.querySelector('#ringMode')?.classList.toggle('is-active',viewMode==='ring');
  document.querySelector('#pathMode')?.classList.toggle('is-active',viewMode==='path');
  stage.hidden=viewMode!=='ring';
  document.querySelector('#bookPath').hidden=viewMode!=='path';
  document.querySelector('#motionStart').hidden=viewMode!=='path';
  document.querySelector('#prev').hidden=viewMode!=='ring';document.querySelector('#next').hidden=viewMode!=='ring';
  document.querySelector('#focusPanel').hidden=viewMode!=='ring';document.querySelector('#hint').hidden=viewMode!=='ring';
  if(viewMode==='path'){
    if(!dataReady){document.querySelector('#pathStatus').textContent='本を準備しています';document.querySelector('#pathSub').textContent='読み込みが終わるまで少しお待ちください';}
    renderPath();
  }else render();
}
function updatePathFocusPanel(){
  if(!books.length){if(roomId==='forest')document.querySelector('#focusPanel').hidden=true;return;}
  let i;
  if(roomId==='forest')i=Math.max(0,Math.min(books.length-1,Math.round(pathProgress)));
  else i=((Math.round(pathProgress)%books.length)+books.length)%books.length;
  index=i;
  const w=books[i],a=w.author||{};
  const shelf=document.querySelector('#focusShelf'),title=document.querySelector('#focusTitle'),metaEl=document.querySelector('#focusMeta'),author=document.querySelector('#focusAuthor');
  const zone=roomId==='path'?currentPathZone():null;
  if(shelf)shelf.textContent=roomId==='forest'?currentGenre().label+' APPROACH':(zone?.label||'BOOK PATH');
  if(title&&title.textContent!==(w.title||'Untitled'))title.textContent=w.title||'Untitled';
  if(metaEl){const meta=[w.episodeLabel,w.episodeTitle].filter(Boolean).join(' ・ ');metaEl.textContent=meta;metaEl.hidden=!meta;}
  if(author&&author.textContent!==(a.displayName||'作者'))author.textContent=a.displayName||'作者';
}
function hideRingUiForPath(){
  stage.hidden=true;
  for(const id of ['prev','next','hint']){const el=document.getElementById(id);if(el)el.hidden=true;}
  setIntroHintVisible(false);
}
function renderPath(){
  if(viewMode==='path')hideRingUiForPath();
  const root=document.querySelector('#pathBooks');if(!root)return;root.innerHTML='';
  if(!dataReady){document.querySelector('#fantasyGate').hidden=true;return;}
  // V2.8: the road is genuinely bidirectional. Keep a few already-passed books alive
  // long enough to streak out through the left/right edges instead of popping away.
  const base=Math.floor(pathProgress),from=-3,to=10;
  for(let k=from;k<=to;k++){
    const raw=base+k;
    // V2.19.9: the straight approach is finite. Do not wrap new covers in forever;
    // after the last approach cover passes, the background is allowed to clear.
    if(roomId==='forest'&&(raw<0||raw>=Math.min(FOREST_APPROACH_BOOKS,books.length)))continue;
    if(!books.length)continue;
    const w=books[norm(raw)],phase=raw-pathProgress;
    if(phase<-2.35||phase>9.5)continue;
    const el=document.createElement('button');el.className='path-item';el.type='button';el.setAttribute('aria-label',w.title||'本');el.innerHTML=bookMarkup(w);
    const side=(raw%2===0?-1:1);
    const future=Math.max(0,phase),passed=Math.max(0,-phase);
    // Future books sit down the road. Once they pass the viewer they accelerate toward
    // a screen edge, grow slightly, blur and fade: a visual "rush past" rather than a cut.
    const spread=Math.min(178,50+future*19);
    const exit=Math.min(innerWidth*.72,passed*(innerWidth*.34+70));
    // V2.31.3: road and genre approaches share the same straight cover trajectory.
    const x=side*(spread+exit)-pathYaw*1.25;
    const y=future*13-passed*7;
    const z=-future*145+70+passed*245;
    const scale=passed>0?Math.min(1.34,1+passed*.18):Math.max(.28,1-future*.105);
    const opacity=passed>0?Math.max(0,1-passed*.58):Math.max(.16,1-future*.095);
    const blur=passed>0?Math.min(8,passed*3.2):0;
    const rot=side*(-14-passed*9);
    el.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${z}px) rotateY(${rot}deg) scale(${scale})`;
    el.style.opacity=opacity;el.style.filter=`blur(${blur}px)`;el.style.zIndex=String(1000-Math.round(phase*30));
    el.dataset.raw=String(raw);
    // V2.10: path covers do not own pointer hit-testing. In perspective, a large
    // foreground button can geometrically cover a smaller book that is visibly behind it.
    // The path surface resolves the intended cover from the actual projected rectangles.
    el.style.pointerEvents='none';
    el.dataset.raw=String(raw);
    root.appendChild(el);hydrateCoverLoadState(el);
  }
  if(roomId==='forest'){
    const pct=Math.min(100,Math.round(pathProgress/FOREST_TRAVEL*100));
    const gate=document.querySelector('#fantasyGate'),zone=currentGenre();
    const atEntrance=pathProgress>=FOREST_TRAVEL-.08;
    document.querySelector('#pathStatus').textContent=atEntrance?zone.jp+'・入口':`${zone.jp}への道　${pct}%`;
    document.querySelector('#pathSub').textContent=atEntrance?'入口をタップ':'上＝前進 ／ 下＝後退';
    // V2.19.9: reveal only at the true endpoint, after all finite approach covers
    // have already flowed out and the background has become visually clear.
    if(gate){gate.hidden=!atEntrance;gate.setAttribute('aria-label',zone.jp+'の本棚へ');gate.querySelector('small').textContent=zone.label.toUpperCase();gate.querySelector('strong').textContent=zone.jp+'の本棚へ';gate.querySelector('span').textContent='入口をタップ';}
  }else{
    const span=outerPathLength(),n=((Math.floor(pathProgress)%span)+span)%span+1;
    document.querySelector('#pathStatus').textContent=`本の道　${n} / ${span}`;
    document.querySelector('#pathSub').textContent='上＝前進 ／ 下＝後退 ／ ジャンル区画では横＝売場へ';
    updatePathZone();
  }
  updatePathFocusPanel();
  const fp=document.querySelector('#focusPanel');if(fp)fp.hidden=!books.length;
}
function clampPath(v){
  if(roomId==='forest')return Math.max(0,Math.min(pathEnd(),v));
  const span=outerPathLength();
  return ((v%span)+span)%span;
}
function currentPathZone(){
  const span=outerPathLength(),lap=((pathProgress%span)+span)%span;
  const idx=Math.min(PATH_ZONE_COUNT-1,Math.floor(lap/PATH_BOOKS_PER_ZONE_TEST));
  return PATH_ZONES[idx];
}
function updatePathZone(){
  if(roomId!=='path')return;const zone=currentPathZone();if(!zone)return;
  const label=document.querySelector('#pathZoneLabel');
  const zoneChanged=pathZoneId!==zone.id;
  // V2.19.10: keep the branch sign DOM stable while live motion is repainting the path.
  // Replacing its children every motion frame destroys the original pointer target on iOS,
  // so pointerup cannot synthesize the click. Refresh the sign only when the zone changes.
  if(label){
    if(zoneChanged){
      label.innerHTML=`<small>${zone.label}</small><strong>${zone.jp}</strong><span>タップで売場への道へ</span>`;
    }
    label.dataset.genre=zone.id;label.classList.add('has-branch');label.setAttribute('role','button');label.setAttribute('tabindex','0');label.setAttribute('aria-label',`${zone.jp}の売場への道へ`);
  }
  if(zoneChanged)pathZoneEntryProgress=pathProgress;
  const gate=document.querySelector('#fantasyGate');
  // Outer-road sections never use the large center card. The right-side
  // branch sign is the only genre cue; the large card is reserved for the straight approach.
  if(gate)gate.hidden=true;
  if(!zoneChanged)return;pathZoneId=zone.id;
  preloadPathZone(zone.approachBg);
  // V2.19.5: branch sign stays compact; no expand/shrink animation on zone entry.
  if(label){clearTimeout(pathZoneSignTimer);label.classList.remove('is-expanded');}
  // V2.20.1: never expose an unpainted/intermediate route layer. Decode the new
  // zone first, paint it while hidden, then crossfade on the following frames.
  // A token prevents a late decode from an already-passed zone winning the race.
  const token=++pathZonePaintToken;
  preloadPathZone(zone.bg).then(()=>{
    if(token!==pathZonePaintToken||roomId!=='path'||pathZoneId!==zone.id)return;
    const nextKey=pathZoneBgFront==='a'?'b':'a',next=document.querySelector(nextKey==='a'?'#pathZoneBgA':'#pathZoneBgB'),old=document.querySelector(pathZoneBgFront==='a'?'#pathZoneBgA':'#pathZoneBgB');
    if(!next)return;
    next.style.backgroundImage=`linear-gradient(rgba(7,5,3,.08),rgba(7,5,3,.16)),url('${zone.bg}')`;next.style.backgroundPosition=zone.pos;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(token!==pathZonePaintToken)return;
      next.classList.add('is-visible');if(old)old.classList.remove('is-visible');pathZoneBgFront=nextKey;
    }));
  });
}
function renderPathFrame(now){
  if(!pathLastFrame)pathLastFrame=now;
  const dt=Math.min(34,Math.max(1,now-pathLastFrame));pathLastFrame=now;
  if(pathMotionBlocked()||pathBookHold||!picked.hidden){pathRaf=requestAnimationFrame(renderPathFrame);return;}
  if(Math.abs(pathVelocity)>.00005){
    pathProgress=clampPath(pathProgress+pathVelocity*dt);
    // circular road intentionally has no end-stop
    // Long, smooth coast. Backward velocity uses the exact same physics as forward velocity.
    pathVelocity*=Math.pow(.94,dt/16.67);
    renderPath();
  }else pathVelocity=0;
  pathRaf=requestAnimationFrame(renderPathFrame);
}
function ensurePathLoop(){if(!pathRaf){pathLastFrame=performance.now();pathRaf=requestAnimationFrame(renderPathFrame)}}
function addPathVelocity(v){pathVelocity=Math.max(-PATH_MAX_VELOCITY,Math.min(PATH_MAX_VELOCITY,pathVelocity+v));ensurePathLoop()}
function advancePath(amount){pathProgress=clampPath(pathProgress+amount);renderPath();}
function findPathBookAt(x,y){
  const nodes=[...document.querySelectorAll('#pathBooks .path-item')];
  let best=null,bestScore=Infinity;
  for(const el of nodes){
    const r=el.getBoundingClientRect();
    if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
    const cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2;
    const nx=(x-cx)/Math.max(1,r.width),ny=(y-cy)/Math.max(1,r.height);
    const score=nx*nx+ny*ny;
    if(score<bestScore){bestScore=score;best=el}
  }
  return best;
}
function onPathPointerDown(e){
  if(!dataReady||routeTransitioning)return;
  if(e.target.closest('#motionStart'))return;
  // V2.19.8: the center gate must not consume pointerdown. Let a downward
  // swipe move away from the endpoint; only a stationary tap enters the room.
  const gateTap=!!e.target.closest('#fantasyGate');
  pathVelocity=0;
  const hit=findPathBookAt(e.clientX,e.clientY);
  pathBookHold=hit?{raw:Number(hit.dataset.raw),x:e.clientX,y:e.clientY,moved:false}:null;
  pathDrag={id:e.pointerId,y:e.clientY,x:e.clientX,start:pathProgress,lastY:e.clientY,lastT:performance.now(),vy:0,moved:false,gateTap};
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function onPathPointerMove(e){
  if(!pathDrag||e.pointerId!==pathDrag.id)return;
  const dy=e.clientY-pathDrag.y,dx=e.clientX-pathDrag.x;
  if(Math.hypot(dx,dy)>8){pathDrag.moved=true;if(pathBookHold)pathBookHold.moved=true}
  if(Math.abs(dy)>3)e.preventDefault();
  const now=performance.now(),dt=Math.max(1,now-pathDrag.lastT);pathDrag.vy=(e.clientY-pathDrag.lastY)/dt;pathDrag.lastY=e.clientY;pathDrag.lastT=now;
  const dir=-1; // all passages: up swipe = forward, down swipe = backward
  pathProgress=clampPath(pathDrag.start+dir*dy/PATH_DRAG_PX_PER_BOOK);renderPath()
}
function onPathPointerEnd(e){
  if(!pathDrag||e.pointerId!==pathDrag.id)return;
  const d=pathDrag,h=pathBookHold,dx=e.clientX-d.x,dy=e.clientY-d.y;pathDrag=null;pathBookHold=null;
  if(!d.moved&&d.gateTap&&roomId==='forest'){enterFantasyRoom();return;}
  if(d.moved&&dx>54&&Math.abs(dx)>Math.abs(dy)*1.15&&roomId==='path'){
    // The straight balcony road returns inward to Central Sakura Hall on a right swipe.
    pathVelocity=0;showCentralHall(false);return;
  }
  if(roomId==='forest'&&d.moved&&dy>54&&Math.abs(dy)>Math.abs(dx)*1.05&&d.start<.22){
    if(approachOriginRoom){restoreApproachOriginRoom();return;}
    // Back out of the straight genre approach to the exact outer-road branch point.
    const prev=[...roomHistory].reverse().find(x=>x.id==='path');
    lastForestPathProgress=0;roomId='path';books=allBooks.slice();pathProgress=prev?.progress??lastOuterPathProgress;lastOuterPathProgress=pathProgress;pathYaw=0;pathVelocity=0;
    clearGenreApproachTheme();setRoomVisual('new');document.querySelector('#motionStart').hidden=false;pathZoneId='';renderPath();return;
  }
  if(!d.moved&&h&&!h.moved&&Number.isFinite(h.raw)){
    const raw=h.raw,w=books[norm(raw)];
    pathVelocity=0;pathProgress=Math.max(0,raw);index=norm(raw);renderPath();pick(w);return;
  }
  const dir=-1; // all passages: up swipe = forward, down swipe = backward
  const launch=Math.max(-PATH_MAX_VELOCITY,Math.min(PATH_MAX_VELOCITY,dir*d.vy/PATH_DRAG_PX_PER_BOOK*.82));
  addPathVelocity(launch)
}
let pathUiInteracting=false;
function pathMotionBlocked(){return pathUiInteracting||!!document.querySelector('dialog[open]');}
function onOrientation(e){if(pathMotionBlocked()||!motionOn||viewMode!=='path'||pathDrag||!picked.hidden||typeof e.gamma!=='number')return;const next=Math.max(-75,Math.min(75,e.gamma));pathYaw+=(next-pathYaw)*.18;renderPath()}
function onMotion(e){
  if(pathMotionBlocked()||!motionOn||viewMode!=='path'||pathDrag||!picked.hidden)return;
  const g=e.accelerationIncludingGravity||e.acceleration;if(!g)return;
  const mag=Math.sqrt((g.x||0)**2+(g.y||0)**2+(g.z||0)**2);
  if(!lastAccelMag){lastAccelMag=mag;return;}
  const delta=Math.abs(mag-lastAccelMag);lastAccelMag=mag;
  const now=performance.now();
  // Forward-only motion. V2.9 fore/aft estimation was intentionally removed: iPhone
  // acceleration cannot reliably distinguish walking backward and could reverse while
  // walking forward. A larger dead-zone also prevents a resting phone from creeping.
  // V2.10.3: keep V2.10.2 forward-only safety/detail guards, but restore V2.8 motion sensitivity.
  pathMotionEnergy=pathMotionEnergy*.80+Math.max(0,delta-.28)*.20;
  if(now-pathMotionLast>28&&pathMotionEnergy>.13){
    pathMotionLast=now;
    const impulse=Math.min(.00185,.00018+pathMotionEnergy*.00055);
    addPathVelocity(impulse);
  }
}
function onPathWheel(e){
  if(viewMode!=='path')return;
  const d=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;if(Math.abs(d)<1)return;
  e.preventDefault();
  // Wheel down = forward, wheel up = backward. Trackpads get the same continuous feel.
  const dir=1;
  addPathVelocity(Math.max(-.0038,Math.min(.0038,dir*d*.000012)));
}
function setPathMotionButton(){
  const b=document.querySelector('#motionStart');if(!b)return;
  b.classList.toggle('is-on',motionOn);
  b.textContent=motionOn?'◉ モーション ON':'◎ モーション OFF';
  b.setAttribute('aria-pressed',motionOn?'true':'false');
}
function disableMotion(){
  motionOn=false;pathMotionEnergy=0;lastAccelMag=0;pathMotionLast=0;
  window.removeEventListener('devicemotion',onMotion);window.removeEventListener('deviceorientation',onOrientation);
  setPathMotionButton();
  const sub=document.querySelector('#pathSub');if(sub&&viewMode==='path')sub.textContent='上スワイプ＝前進 ／ 下スワイプ＝後退';
}
async function togglePathMotion(){
  if(motionOn){disableMotion();return;}
  try{
    if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){const r=await DeviceMotionEvent.requestPermission();if(r!=='granted')throw new Error('denied')}
    if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('denied')}
    motionOn=true;lastAccelMag=0;pathMotionEnergy=0;pathMotionLast=0;ensurePathLoop();
    window.removeEventListener('devicemotion',onMotion);window.removeEventListener('deviceorientation',onOrientation);
    window.addEventListener('devicemotion',onMotion,{passive:true});window.addEventListener('deviceorientation',onOrientation,{passive:true});
    setPathMotionButton();
    const sub=document.querySelector('#pathSub');if(sub)sub.textContent='モーション＝前進のみ ／ 上スワイプ＝前進 ／ 下スワイプ＝後退';
  }catch(_){disableMotion();const sub=document.querySelector('#pathSub');if(sub)sub.textContent='モーションを許可できませんでした。スワイプで移動できます';}
}
const pathZoneLabel=document.querySelector('#pathZoneLabel');
// V2.20.2: live DeviceMotion can cancel Safari's synthesized click. Treat the
// branch sign like the motion toggle: own pointerup and stop the path surface.
if(pathZoneLabel){
  pathZoneLabel.addEventListener('pointerdown',(e)=>{if(pathZoneLabel.classList.contains('has-branch'))e.stopPropagation();});
  pathZoneLabel.addEventListener('pointerup',(e)=>{if(roomId==='path'&&currentPathZone()){e.preventDefault();e.stopPropagation();enterForest(currentPathZone().id);}});
  pathZoneLabel.addEventListener('click',(e)=>{if(roomId==='path'&&currentPathZone()){e.preventDefault();e.stopPropagation();}});
  pathZoneLabel.addEventListener('keydown',(e)=>{if(roomId==='path'&&currentPathZone()&&(e.key==='Enter'||e.key===' ')){e.preventDefault();enterForest(currentPathZone().id);}});
}

document.querySelector('#ringMode')?.addEventListener('click',()=>setViewMode('ring'));document.querySelector('#pathMode')?.addEventListener('click',()=>setViewMode('path'));
const roomShelfScroller=document.querySelector('#roomShelfScroll');
let roomShelfTap=null;
// V2.16.13 — low-speed drag is rendered once per animation frame from the latest pointer sample.
// This keeps slow iPhone drags continuous instead of rendering at irregular pointer-event intervals.
let roomShelfDragRaf=0,roomShelfPendingPreview=null;
function queueRoomShelfPreview(previewDeg){
  roomShelfPendingPreview=previewDeg;
  if(roomShelfDragRaf)return;
  roomShelfDragRaf=requestAnimationFrame(()=>{
    roomShelfDragRaf=0;
    if(roomShelfPendingPreview==null)return;
    const v=roomShelfPendingPreview;roomShelfPendingPreview=null;applyRoomCamera(v,true);
  });
}
function flushRoomShelfPreview(){
  if(roomShelfDragRaf){cancelAnimationFrame(roomShelfDragRaf);roomShelfDragRaf=0;}
  if(roomShelfPendingPreview!=null){const v=roomShelfPendingPreview;roomShelfPendingPreview=null;applyRoomCamera(v,true);}
}
roomShelfScroller?.addEventListener('pointerdown',e=>{if(!roomShelfMode)return;
  if(window.matchMedia('(max-width:680px)').matches)finishPhoneShelfSlide();
  // Touch becomes the sole owner of the shared camera until release + snap completes.
  if(roomCameraSettleRaf){cancelAnimationFrame(roomCameraSettleRaf);roomCameraSettleRaf=0;}
  roomCameraInputLock=true;
  const currentYaw=roomCameraYaw+roomCameraPreview;roomCameraYaw=currentYaw;roomCameraPreview=0;rebaseRoomMotion();
  roomShelfTap={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,dx:0,dy:0,startYaw:currentYaw};
},{capture:true,passive:true});
roomShelfScroller?.addEventListener('pointermove',e=>{
  const tap=roomShelfTap;if(!tap||e.pointerId!==tap.id||window.matchMedia('(min-width:681px)').matches)return;
  const samples=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null;
  const last=samples?.length?samples[samples.length-1]:e;
  tap.dx=last.clientX-tap.x;tap.dy=last.clientY-tap.y;
  if(Math.hypot(tap.dx,tap.dy)>5)tap.moved=true;
  if(!tap.axis&&Math.hypot(tap.dx,tap.dy)>8)tap.axis=Math.abs(tap.dx)>Math.abs(tap.dy)*1.15?'horizontal':'vertical';
  if(tap.axis==='horizontal')previewPhoneShelfDrag(tap.dx);
},{capture:true,passive:true});
roomShelfScroller?.addEventListener('pointerup',e=>{
  if(!roomShelfTap||e.pointerId!==roomShelfTap.id)return;flushRoomShelfPreview();const tap=roomShelfTap;roomShelfTap=null;
  if(!roomShelfMode){roomCameraInputLock=false;rebaseRoomMotion();return;}
  if(tap.moved){
    if(tap.axis==='horizontal'&&Math.abs(tap.dx)>18){
      e.preventDefault();e.stopPropagation();const dir=tap.dx<0?1:-1;
      slidePhoneShelf(dir);
      roomCameraInputLock=false;rebaseRoomMotion();
    }else{
      if(phoneShelfSlide)settlePhoneShelfSlide(false);
      else{roomCameraYaw=tap.startYaw;roomCameraPreview=0;applyRoomCamera(0,false);}
      rebaseRoomMotion();roomCameraInputLock=false;
    }
    return;
  }
  // Preserve Safari's geometric fallback, scoped to the active wall.
  const chosen=roomShelfBookAtPoint(e.target,e.clientX,e.clientY);
  if(chosen!==null){
    e.preventDefault();e.stopPropagation();
    // V2.16.15R1: opening the ring must release touch ownership. Otherwise the
    // 360° sensor remains logically ON but its camera writes stay locked after returning.
    roomCameraInputLock=false;roomCameraPreview=0;rebaseRoomMotion();
    openShelfRow(chosen,0);
  }
},{capture:true,passive:false});
roomShelfScroller?.addEventListener('pointercancel',()=>{if(roomShelfDragRaf){cancelAnimationFrame(roomShelfDragRaf);roomShelfDragRaf=0;}roomShelfPendingPreview=null;roomShelfTap=null;if(phoneShelfSlide)settlePhoneShelfSlide(false);roomCameraPreview=0;rebaseRoomMotion();roomCameraInputLock=false;},{capture:true});
roomShelfScroller?.addEventListener('scroll',()=>{if(roomShelfScrollRaf)return;roomShelfScrollRaf=requestAnimationFrame(()=>{roomShelfScrollRaf=0;syncPhoneShelfOffsets();updateRoomShelfPerspective();if(roomMotionOn&&window.matchMedia('(max-width:680px)').matches)paintRoomShelfAtYaw(roomCameraYaw)})},{passive:true});
roomShelfScroller?.addEventListener('scrollend',()=>{if(!window.matchMedia('(max-width:680px)').matches)return;const max=Number(roomShelfScroller.dataset.phoneMaxScroll)||0;roomShelfScroller.scrollTop=Math.max(0,Math.min(max,roomShelfScroller.scrollTop));},{passive:true});
// V2.24.3 — desktop wheel ownership follows the pointer.
// Over the shelf panel, the wheel belongs to the shelf and scrolls vertically
// through its rows. Over the Genre Room background, the same wheel rotates the
// room horizontally by one fixed 90° face. This mirrors the spatial controls:
// inside = browse the current shelf, outside = turn to the next wall.
let roomShelfWheelLock=false;
store?.addEventListener('wheel',e=>{
  if(!roomShelfMode||roomId!=='fantasy'||!window.matchMedia('(min-width:681px)').matches)return;
  if(e.target instanceof Element && e.target.closest('#roomShelf')){
    // V2.24.4: the panel itself is not the scrolling element, so relying on the
    // browser's native wheel routing was unreliable. Explicitly give the wheel
    // to the shelf scroller while the pointer is anywhere inside the dark panel.
    if(!roomShelfScroller)return;
    const dy=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
    if(Math.abs(dy)<1)return;
    e.preventDefault();e.stopPropagation();
    const activeFace=roomShelfScroller.querySelector(`.room-shelf-face[data-face="${roomShelfFace}"]`);if(activeFace)activeFace.scrollTop+=dy;
    return;
  }
  const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  if(Math.abs(delta)<4)return;
  e.preventDefault();
  if(roomShelfWheelLock)return;
  roomShelfWheelLock=true;
  const faces=roomShelfFaces();
  const nextFace=((roomShelfFace+(delta>0?1:-1))%faces.length+faces.length)%faces.length;
  const from=roomCameraYaw+roomCameraPreview,target=nextFace*ROOM_VIEW_SLOT_DEG;
  roomCameraPreview=0;roomCameraInputLock=true;rebaseRoomMotion();
  // V2.24.5: background-wheel turns are real camera turns, not hard swaps.
  // animateRoomYaw drives paintRoomShelfAtYaw every frame so the neighbouring
  // wall visibly travels in from the side.
  animateRoomYaw(from,target,360);
  setTimeout(()=>{roomShelfWheelLock=false;},390);
},{passive:false});
document.querySelector('.sign')?.addEventListener('click',()=>{if(roomId==='fantasy'&&!roomShelfMode)backToRoomShelf();});
const pathEl=document.querySelector('#bookPath');pathEl.addEventListener('pointerdown',onPathPointerDown);pathEl.addEventListener('pointermove',onPathPointerMove,{passive:false});pathEl.addEventListener('pointerup',onPathPointerEnd);pathEl.addEventListener('pointercancel',()=>{pathDrag=null;pathBookHold=null});pathEl.addEventListener('wheel',onPathWheel,{passive:false});const pathMotionButton=document.querySelector('#motionStart');
// R3: iPhone Safari can cancel the synthetic click while live DeviceMotion keeps the
// path repainting. Toggle on pointerup instead, and keep the event completely out of
// the path drag surface so ON can always be turned OFF with one tap.
if(pathMotionButton){
  pathMotionButton.onclick=null;
  pathMotionButton.addEventListener('pointerdown',(e)=>{e.stopPropagation();});
  pathMotionButton.addEventListener('pointerup',(e)=>{e.preventDefault();e.stopPropagation();togglePathMotion();});
  pathMotionButton.addEventListener('pointercancel',(e)=>{e.stopPropagation();});
}
setPathMotionButton();document.querySelector('#roomMotion')?.addEventListener('click',toggleRoomMotion);
// V2.22.3 — desktop keyboard navigation. Arrow keys mirror the spatial gestures
// without changing the touch model: left/right browse/rotate, up/down enter/return/walk.
function keyboardHallStep(dir){hallPreview=0;hallYaw=Math.round(hallYaw/90)*90+dir*90;rebaseHallMotion();renderHall();settleHall();}
function keyboardHallVertical(dir){
  if(dir<0){ // Up = enter the currently facing Hall destination/shelf.
    const yaw=((Math.round(hallYaw/90)*90)%360+360)%360;
    if(yaw===0){showNewArrivalsFromHall();return;}
    if(yaw===90){enterBookPathFromHall();return;}
    if(yaw===180){document.querySelector('#hallGenreGrid button')?.focus();return;}
    if(yaw===270&&hallShelfBooks(hallLibraryKind).length){openHallShelfRing(hallLibraryKind,0);return;}
  }else{ // Down = NEW ARRIVALS ring, matching the Hall's return gesture.
    showNewArrivalsFromHall();
  }
}
window.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
  if(document.querySelector('dialog[open]'))return;
  if(e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  // Detail owns left/right browsing; vertical keys intentionally do nothing there.
  if(!picked.hidden){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();commitDetailHorizontal(e.key==='ArrowRight'?1:-1,e.key==='ArrowRight'?-picked.clientWidth:picked.clientWidth,0);}return;}
  if(viewMode==='hall'&&roomId==='hall'){e.preventDefault();if(routeTransitioning)return;if(e.key==='ArrowLeft')keyboardHallStep(-1);else if(e.key==='ArrowRight')keyboardHallStep(1);else keyboardHallVertical(e.key==='ArrowUp'?-1:1);return;}
  // V2.23.1: the Genre Room shelf also uses viewMode='ring', so it must own
  // keyboard input BEFORE the generic ring handler. Previously Arrow keys were
  // sent to the hidden cover ring behind the shelf and appeared to do nothing.
  if(roomId==='fantasy'&&roomShelfMode){
    e.preventDefault();
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      const faces=roomShelfFaces();
      if(faces.length>1){
        const nextFace=((roomShelfFace+(e.key==='ArrowRight'?1:-1))%faces.length+faces.length)%faces.length;
        const from=roomCameraYaw+roomCameraPreview,target=nextFace*ROOM_VIEW_SLOT_DEG;
        roomCameraPreview=0;roomCameraInputLock=true;rebaseRoomMotion();animateRoomYaw(from,target,360);
      }
    }else if(e.key==='ArrowDown'){
      if(!e.repeat)openActiveShelfRing();
    }else if(roomShelfScroller){
      roomShelfScroller.scrollBy({top:-Math.max(180,innerHeight*.45),behavior:'smooth'});
    }
    return;
  }
  if(viewMode==='ring'){
    e.preventDefault();
    if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);
    else if(e.key==='ArrowUp'){if(hallShelfRing)backToHallShelf();else if(roomId==='fantasy'&&!roomShelfMode)backToRoomShelf();else if(roomId==='intro')showCentralHall(true);}
    return;
  }
  if(viewMode==='path'&&(roomId==='path'||roomId==='forest')){
    e.preventDefault();
    if(e.key==='ArrowUp')pathProgress+=.72;else if(e.key==='ArrowDown')pathProgress-=.72;else if(e.key==='ArrowLeft')pathYaw-=18;else if(e.key==='ArrowRight')pathYaw+=18;
    if(roomId==='forest')pathProgress=Math.max(0,Math.min(pathEnd(),pathProgress));
    else pathProgress=clampPath(pathProgress);
    renderPath();return;
  }
});
document.querySelector('#hallMotion')?.addEventListener('click',toggleHallMotion);document.querySelector('#hallBookPath')?.addEventListener('click',enterBookPathFromHall);document.querySelector('#exitHall')?.addEventListener('click',()=>showCentralHall(false));document.querySelector('#exitPath')?.addEventListener('click',returnToPathFromRoom);
// One board uses the same genre configuration and room entry as the Book Road.
async function openHallGenre(id){
  if(viewMode!=='hall'||routeTransitioning||!PATH_ZONES.some(z=>z.id===id))return;
  const board=document.querySelector('#hallGenreBoard'),heading=board.querySelector('.hall-genre-heading');
  const zone=PATH_ZONES.find(z=>z.id===id);
  board.setAttribute('aria-busy','true');board.classList.add('is-entering');heading.textContent=zone.jp+'の本棚へ移動しています…';
  board.querySelectorAll('[data-hall-genre]').forEach(button=>button.classList.toggle('is-entering',button.dataset.hallGenre===id));
  activeGenreId=id;lastOuterPathProgress=PATH_ZONES.findIndex(z=>z.id===id)*PATH_BOOKS_PER_ZONE_TEST;
  try{await enterFantasyRoom();}
  finally{board.removeAttribute('aria-busy');board.classList.remove('is-entering');heading.textContent='ジャンルの入口';board.querySelectorAll('[data-hall-genre]').forEach(button=>button.classList.remove('is-entering'));}
}
function buildGenreSigns(root,onChoose,currentId=''){
  root.innerHTML='';const colors=['#bdd59e','#efb0c5','#d48989','#adc3e4','#8bd8e4','#c2d5a3','#dfbc86','#c5a9e5'];
  PATH_ZONES.forEach((zone,i)=>{
    const button=document.createElement('button');button.type='button';button.dataset.hallGenre=zone.id;
    button.style.setProperty('--genre-accent',colors[i]);button.setAttribute('aria-label',zone.jp+'の本棚へ');button.disabled=zone.id===currentId;
    button.innerHTML=`<small>${esc(zone.label)}</small><strong>${esc(zone.jp)}</strong>${button.disabled?'<span class="genre-current">現在地</span>':''}`;
    button.addEventListener('pointerenter',()=>primeNextRoomBackground(zone.id));
    button.addEventListener('focus',()=>primeNextRoomBackground(zone.id));
    button.addEventListener('pointerdown',()=>{if(!button.disabled&&!routeTransitioning){primeNextRoomBackground(zone.id);ensureCatalogueGenre(zone.id).catch(()=>{});}});
    button.addEventListener('click',e=>{e.stopPropagation();if(Date.now()<suppressClickUntil)return;onChoose(zone.id);});root.appendChild(button);
  });
}
const hallGenreGrid=document.querySelector('#hallGenreGrid');if(hallGenreGrid)buildGenreSigns(hallGenreGrid,openHallGenre);
const genreDialog=document.querySelector('#genreRoomDialog');let genrePriorOverflow='';
document.querySelector('#chooseRoomGenre')?.addEventListener('click',()=>{
  if(roomId!=='fantasy'||routeTransitioning||genreDialog.open)return;
  buildGenreSigns(document.querySelector('#roomGenreGrid'),id=>{genreDialog.close();beginRoomGenreApproach(id);},activeGenreId);
  genrePriorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';genreDialog.showModal();
});
genreDialog.addEventListener('close',()=>{document.body.style.overflow=genrePriorOverflow;});
genreDialog.querySelector('[data-genre-close]').addEventListener('click',()=>genreDialog.close());
genreDialog.addEventListener('click',e=>{if(e.target===genreDialog)genreDialog.close();});
const hallEl=document.querySelector('#centralHall');
hallEl?.addEventListener('pointerdown',e=>{
  if(routeTransitioning)return;
  /* V2.22.4: mouse clicks on covers stay native, but touch starting on a cover
     must still own the Hall swipe. V2.22.3 excluded covers for every pointer type,
     which fixed desktop click but created a dead swipe zone on iPhone. */
  if(e.target.closest('#hallMotion,.hall-library-tabs,#enterReadingRoom'))return;
  const cover=e.target.closest('.hall-my-book'),genre=e.target.closest('[data-hall-genre]');
  if((cover||genre||e.target.closest('#hallBookPath'))&&e.pointerType==='mouse')return;
  hallDrag={id:e.pointerId,x:e.clientX,y:e.clientY,start:hallYaw,lastX:e.clientX,t:performance.now(),axis:null,cover,genre};
  hallEl.setPointerCapture?.(e.pointerId);rebaseHallMotion();
});
hallEl?.addEventListener('pointermove',e=>{if(!hallDrag||e.pointerId!==hallDrag.id)return;const dx=e.clientX-hallDrag.x,dy=e.clientY-hallDrag.y;if(!hallDrag.axis&&Math.hypot(dx,dy)>7)hallDrag.axis=Math.abs(dy)>Math.abs(dx)*1.12?'vertical':'horizontal';if(hallDrag.axis==='vertical'){if(dy>0)e.preventDefault();return;}if(Math.abs(dx)>2)e.preventDefault();hallDrag.lastX=e.clientX;hallPreview=-dx/Math.max(320,store.clientWidth)*135;renderHall();},{passive:false});
hallEl?.addEventListener('pointerup',e=>{if(!hallDrag||e.pointerId!==hallDrag.id)return;const d=hallDrag,dx=e.clientX-d.x,dy=e.clientY-d.y,dt=Math.max(1,performance.now()-d.t),vx=dx/dt;hallDrag=null;
  if(d.genre){
    if(!d.axis&&Math.hypot(dx,dy)<9){e.preventDefault();openHallGenre(d.genre.dataset.hallGenre);return;}
    suppressClickUntil=Date.now()+450;
  }
  // A touch tap on a shelf cover still opens that cover; a drag from the same
  // pixels remains a Hall swipe. This keeps both gestures without competition.
  if(d.cover&&!d.axis&&Math.hypot(dx,dy)<9){
    const idx=Number(d.cover.dataset.hallBook)||0;
    const kind=d.cover.closest('#hallNewShelfBooks')?'new':hallLibraryKind;
    openHallShelfRing(kind,idx,false);return;
  }
  if(d.axis==='vertical'){hallPreview=0;if(dy>58){const facingNew=Math.abs(wrapDeg(hallYaw))<42;if(facingNew){showNewArrivalsFromHall();return;}/* V2.21.2: MY LIBRARY gets the same shelf <-> ring vertical route as NEW ARRIVALS. The 270deg hall face can show either owned books or Read Later; open the currently visible collection. */const facingLibrary=Math.abs(wrapDeg(hallYaw-270))<42;if(facingLibrary&&hallShelfBooks(hallLibraryKind).length){openHallShelfRing(hallLibraryKind,0);return;}}settleHall();return;}const base=Math.round(d.start/90)*90;hallYaw=d.start+hallPreview;hallPreview=0;
  // A normal deliberate swipe advances one entrance; no hard flick required.
  if(Math.abs(dx)>=34||Math.abs(vx)>=.24){const dir=dx<0?1:-1;const from=hallYaw,target=base+dir*90,start=performance.now(),dur=250;function tick(now){const t=Math.min(1,(now-start)/dur),q=1-Math.pow(1-t,3);hallYaw=from+(target-from)*q;renderHall();if(t<1)requestAnimationFrame(tick);else{hallYaw=target;rebaseHallMotion();renderHall();}}requestAnimationFrame(tick);}else settleHall();
});hallEl?.addEventListener('pointercancel',()=>{hallPreview=0;hallDrag=null;settleHall();});

// One page on entry; subsequent pages require navigation or an explicit request.
const catalogue={cursor:null,hasMore:true,total:null,pending:null,seen:new Set(),error:''};
function paintCatalogueControls(){
  const count=document.querySelector('#bookCount');
  if(count)count.textContent=Number.isInteger(catalogue.total)?`${catalogue.total}冊が店内にあります`:`${allBooks.length}冊を読み込みました`;
  document.querySelectorAll('[data-catalogue-more]').forEach(b=>{
    b.hidden=!catalogue.hasMore&&!catalogue.error;b.disabled=!!catalogue.pending;
    b.textContent=catalogue.pending?'読み込み中…':catalogue.error?'続きを再試行する':`次の60作品を読み込む（現在${allBooks.length}作品）`;
  });
}
// Retry transient catalogue failures without changing the requested page/cursor.
async function fetchPublicCatalogue(url,onRetry=()=>{}){
  for(let attempt=1;attempt<=3;attempt++){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    let retryable=false,code='INVALID_RESPONSE';
    try{
      const response=await fetch(url,{cache:'no-store',signal:controller.signal});
      if(!response.ok){
        code=`HTTP_${response.status}`;retryable=response.status===408||response.status===429||response.status>=500;
        throw new Error(`公開一覧を取得できませんでした。（HTTP ${response.status}）`);
      }
      const data=await response.json();
      if(!data?.ok||!Array.isArray(data.works))throw new Error('公開一覧の応答を読み取れませんでした。');
      return data;
    }catch(cause){
      if(cause.name==='AbortError'){retryable=true;code='TIMEOUT';}
      else if(cause instanceof TypeError){retryable=true;code='NETWORK';}
      console.warn('Bookstore catalogue request failed',{code,attempt,genre:url.searchParams.get('genre')||'all'});
      if(!retryable||attempt===3){
        const message=code==='TIMEOUT'?'公開一覧の取得に時間がかかっています。少し待って再試行してください。（時間切れ）':code==='NETWORK'?'公開一覧に接続できませんでした。少し待って再試行してください。（通信接続）':code==='INVALID_RESPONSE'?'公開一覧の応答を読み取れませんでした。':cause.message;
        const error=new Error(message);error.code=code;error.cause=cause;throw error;
      }
    }finally{clearTimeout(timer);}
    onRetry(attempt+1);
    await new Promise(resolve=>setTimeout(resolve,attempt===1?450:1200));
  }
}
const catalogueGenres=new Set(),catalogueGenreRequests=new Map();
function ensureCatalogueGenre(genre){
  if(catalogueGenres.has(genre))return Promise.resolve();
  if(dataReady&&!catalogue.hasMore){catalogueGenres.add(genre);return Promise.resolve();}
  if(catalogueGenreRequests.has(genre))return catalogueGenreRequests.get(genre);
  const job=(async()=>{
  const url=new URL(`${API}/discover`);url.searchParams.set('limit','60');url.searchParams.set('genre',genre);
  const data=await fetchPublicCatalogue(url);
  const ids=new Set(allBooks.map(w=>w.publicationId));
  data.works.forEach(w=>{if(w?.publicationId&&!ids.has(w.publicationId)){ids.add(w.publicationId);allBooks.push(w);}});
  catalogueGenres.add(genre);window.dispatchEvent(new Event('bookstore-catalogue-updated'));paintCatalogueControls();
  })();
  const pending=job.finally(()=>catalogueGenreRequests.delete(genre));catalogueGenreRequests.set(genre,pending);return pending;
}
function catalogueMoreButton(){
  const button=document.createElement('button');button.type='button';button.dataset.catalogueMore='';button.className='store-catalogue-more';
  button.addEventListener('click',()=>loadBookstorePublicBooks().catch(()=>{}));return button;
}
function loadBookstorePublicBooks(){
  if(catalogue.pending)return catalogue.pending;
  if(!catalogue.hasMore)return Promise.resolve(allBooks);
  catalogue.error='';
  const task=(async()=>{
    const url=new URL(`${API}/discover`);url.searchParams.set('limit','60');
    if(catalogue.cursor)url.searchParams.set('cursor',catalogue.cursor);
    const data=await fetchPublicCatalogue(url,attempt=>{
      const status=document.querySelector('#catalogueLoadStatus');
      if(status)status.textContent=`公開一覧を再取得しています…（${attempt} / 3）`;
    });
    const cursor=data.nextCursor||null;
    if(cursor&&(typeof cursor!=='string'||catalogue.seen.has(cursor)))throw new Error('公開一覧の続きが取得できませんでした。');
    if(!cursor&&data.hasMore===true)throw new Error('公開一覧の続きが取得できませんでした。');
    const ids=new Set(allBooks.map(w=>w.publicationId)),added=[];
    data.works.forEach(w=>{if(w?.publicationId&&!ids.has(w.publicationId)){ids.add(w.publicationId);added.push(w);}});
    // Extend the new-arrivals collection only; a selected genre/search/detail stays intact.
    const extendRing=dataReady&&roomId==='intro'&&!hallShelfRing&&!currentPicked;
    allBooks.push(...added);if(extendRing)books.push(...added);
    catalogue.cursor=cursor;catalogue.hasMore=!!cursor;catalogue.total=Number.isInteger(data.total)?data.total:null;
    if(cursor)catalogue.seen.add(cursor);
    window.dispatchEvent(new Event('bookstore-catalogue-updated'));
    return allBooks;
  })();
  catalogue.pending=task;paintCatalogueControls();
  return task.catch(error=>{catalogue.error=error.message;throw error;}).finally(()=>{catalogue.pending=null;paintCatalogueControls();});
}
function requestNextCataloguePage(){
  if(dataReady&&roomId==='intro'&&!hallShelfRing&&!currentPicked&&catalogue.hasMore&&!catalogue.pending&&index>=books.length-6)
    loadBookstorePublicBooks().catch(()=>{});
}

let initialCatalogueLoading=false;
async function init(){
  if(initialCatalogueLoading)return;initialCatalogueLoading=true;
  stage.classList.remove('is-intro-waiting');
  stage.innerHTML='<div class="catalogue-load-state" role="status"><p id="catalogueLoadStatus">本を読み込んでいます…</p></div>';
  for(const id of ['prev','next','focusPanel','hint'])document.getElementById(id).hidden=true;
  try{
    books=await loadBookstorePublicBooks();allBooks=books.slice();await syncOwnedBooks();dataReady=true;
    roomId='intro';store.classList.add('intro-mode');document.body.classList.add('intro-entry-active');window.scrollTo(0,0);
    const count=document.querySelector('#bookCount');if(!count.parentElement.querySelector('[data-catalogue-more]'))count.after(catalogueMoreButton());paintCatalogueControls();
    if(!books.length){stage.innerHTML='<div class="catalogue-load-state"><p>まだ本がありません。</p></div>';return;}
    for(const id of ['prev','next','focusPanel','hint'])document.getElementById(id).hidden=false;
    stage.innerHTML='';stage.classList.add('is-intro-waiting');updateFocusPanel();await preloadFirstViewCovers();
    stage.classList.remove('is-intro-waiting');requestAnimationFrame(()=>requestAnimationFrame(playFirstViewSpin));
  }catch(error){
    stage.classList.remove('is-intro-waiting');document.querySelector('#bookCount').textContent='棚を読み込めませんでした';
    stage.innerHTML=`<div class="catalogue-load-state" role="alert"><strong>本を読み込めませんでした</strong><p>${esc(error.message)}</p><button type="button" id="retryCatalogue">もう一度読み込む</button></div>`;
    const retry=document.querySelector('#retryCatalogue');
    retry?.addEventListener('pointerdown',event=>event.stopPropagation());
    retry?.addEventListener('click',event=>{event.stopPropagation();init();});
  }finally{initialCatalogueLoading=false;}
}
// Keep Central Hall in sync when Bookshelf changes in another tab or after returning from Player.
window.addEventListener('storage',e=>{if(e.key===OWNED_ORDER_KEY||e.key===OWNED_ARCHIVE_KEY){syncOwnedBooks().then(()=>{renderHallMyShelf();if(viewMode==='hall')renderHall();});}});
window.addEventListener('pageshow',()=>{if(dataReady)syncOwnedBooks().then(()=>{renderHallMyShelf();if(viewMode==='hall')renderHall();});});
init();

// V2.32.0: reading room ships with the core, avoiding a missing optional script.
(()=>{
 const room=document.createElement('section');room.id='readingRoom';room.hidden=true;room.setAttribute('aria-label','自分の読書室');
 room.innerHTML='<div class="reading-room-heading"><small>MY READING ROOM</small><h1>自分の読書室</h1><p>もっている本</p><button type="button" id="leaveReadingRoom">中央ホールへ戻る</button></div><div id="readingRoomBooks" aria-live="polite"></div>';
 store.append(room);let opening=false,epoch=0;
 function renderOwnedRoom(){
  const grid=room.querySelector('#readingRoomBooks');books=ownedBooks.slice();index=0;
  grid.innerHTML=books.length?books.map((w,i)=>`<button type="button" class="reading-room-book" data-reading-index="${i}" aria-label="${esc(w.title||'本')}"><span class="reading-room-cover">${bookMarkup(w)}</span><span class="reading-room-info"><strong>${esc(w.title||'Untitled')}</strong><small>${esc(w.author?.displayName||'')}</small></span></button>`).join(''):'<p class="reading-room-empty">まだ本がありません。<br>受け取った本や購入した本が、ここに並びます。</p>';
  hydrateCoverLoadState(grid);
 }
 window.readingRoomIsOpen=()=>!room.hidden;
 window.openReadingRoom=async()=>{
  if(opening||!room.hidden)return;opening=true;const token=++epoch;
  closePick();spinToken++;pathVelocity=0;pathDrag=null;hallDrag=null;viewMode='reading-room';roomId='reading-room';hallShelfRing=false;
  renderOwnedRoom();room.hidden=false;store.classList.add('reading-room-active');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===epoch)room.classList.add('is-visible');}));opening=false;
  // Refresh after showing cached books, so a pending IDB request cannot swallow entry.
  syncOwnedBooks().then(()=>{if(token===epoch&&!room.hidden)renderOwnedRoom();}).catch(error=>console.warn('Reading room refresh failed',error));
  preloadPathZone('./reading-room-v2319.webp');
  room.querySelector('#leaveReadingRoom').focus({preventScroll:true});
 };
 window.closeReadingRoom=()=>{
  ++epoch;opening=false;closePick();books=allBooks.slice();showCentralHall(false);store.classList.remove('reading-room-active');room.classList.remove('is-visible');
  setTimeout(()=>{if(!room.classList.contains('is-visible'))room.hidden=true;},960);
 };
 room.querySelector('#leaveReadingRoom').addEventListener('click',window.closeReadingRoom);
 room.addEventListener('click',e=>{const hit=e.target.closest('[data-reading-index]');if(hit){index=Number(hit.dataset.readingIndex);pick(books[index]);}});
 for(const type of ['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend'])room.addEventListener(type,e=>e.stopPropagation());
 document.getElementById('enterReadingRoom')?.addEventListener('pointerdown',e=>e.stopPropagation());
 document.getElementById('enterReadingRoom')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.openReadingRoom();});
 document.addEventListener('click',e=>{const link=e.target.closest('a[href="../bookshelf/"]');if(!link||link.classList.contains('brand'))return;e.preventDefault();document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.style.overflow='';window.openReadingRoom();});
 window.addEventListener('keydown',e=>{if(!room.hidden&&e.key==='Escape'&&picked.hidden)window.closeReadingRoom();});
 window.addEventListener('pageshow',()=>{if(!room.hidden)syncOwnedBooks().then(renderOwnedRoom);});
 function resumeReadingRoom(){if(location.hash==='#reading-room'&&dataReady){window.openReadingRoom();history.replaceState(null,'',location.pathname+location.search);}}
 new MutationObserver(resumeReadingRoom).observe(document.getElementById('bookCount'),{childList:true,subtree:true});
 window.addEventListener('pageshow',resumeReadingRoom);resumeReadingRoom();
})();
