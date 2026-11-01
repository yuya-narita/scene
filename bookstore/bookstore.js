const API='https://scene-studio-api.a-hako.workers.dev';
const READ_LATER_STORAGE_KEY='ahako:read-later:v1';
const stage=document.querySelector('#stage'),picked=document.querySelector('#picked'),store=document.querySelector('#store');
let books=[],allBooks=[],index=0,drag=null,dragUnits=0,suppressClickUntil=0,currentPicked=null,detailDrag=null,spinToken=0,detailPreview=null;
let viewMode='ring',pathProgress=0,pathYaw=0,pathDrag=null,motionOn=false,lastAccelMag=0;
let introReady=false,hallYaw=0,hallPreview=0,hallDrag=null,hallMotionOn=false,hallMotionLastAlpha=null,hallShelfRing=false,hallShelfKind='new';
let pathVelocity=0,pathRaf=0,pathLastFrame=0,pathMotionEnergy=0,pathMotionLast=0;
let pathBookHold=null;
let roomId='new',routeTransitioning=false,dataReady=false;
let roomShelfMode=false,roomShelfAllBooks=[],roomShelfScrollRaf=0;
let fantasyGateTimer=0,fantasyGateVisible=false;
const roomHistory=[];
const PATH_DRAG_PX_PER_BOOK=150;
const PATH_MAX_VELOCITY=.008;
const PATH_EXIT_PAD=1.0;
const PATH_GATE_REVEAL_PAD=.12;
const FOREST_TRAVEL=5.5; // reserved for future side-branch routes with % progress
// V2.3: shelf is now an explicit axis. Today there is one public shelf; future genres can be added here.
let shelfIndex=0;
// V2.15.0 — each Room is a circular ring of tall shelf faces.
// Only the front shelf is rendered at full detail; horizontal swipes rotate shelves.
const ROOM_SHELF_CAPACITY=12;
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
const ROOM_BG_ASSETS={fantasy:'./fantasy-room-360-v2165.webp'};
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
function updateFocusPanel(){if(!books.length)return;const w=books[index],a=w.author||{};document.querySelector('#focusTitle').textContent=w.title||'Untitled';document.querySelector('#focusAuthor').textContent=a.displayName||'作者';document.querySelector('#focusShelf').textContent=shelves[shelfIndex]?.label||'';}
function render(){stage.innerHTML='';if(!books.length)return;books.forEach((w,i)=>{const slot=signedOffset(i);if(Math.abs(slot)>5)return;const b=document.createElement('button');b.className='book';b.dataset.slot=slot;b.dataset.index=i;b.setAttribute('aria-label',`${w.title||'Untitled'} ${w.author?.displayName||''}`);b.innerHTML=bookMarkup(w);setBookPose(b,slot+dragUnits);b.onclick=()=>{if(Date.now()<suppressClickUntil)return;const off=signedOffset(i);if(off===0)pick(w);else glideToOffset(-off);};stage.appendChild(b);});hydrateCoverLoadState(stage);updateFocusPanel();}
// V2.11.3: commit a settled ring without rebuilding the visible cover DOM.
// Recreating the centered image at the exact landing frame can make its rasterized transform
// look like it briefly "tightens" even when the numeric scale is unchanged.
function commitRingSettle(step){
  index=norm(index+step);dragUnits=0;
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
  const ih=document.querySelector('#introHint');if(ih)ih.hidden=true;
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
    const ih=document.querySelector('#introHint');if(ih)ih.hidden=false;
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
function readLaterRecord(w){const a=w.author||{},readUrl=playerUrl(w);return{publicationId:w.publicationId,title:w.title||'Untitled',coverUrl:w.coverUrl||'',detail:[w.episodeLabel,w.episodeTitle,w.subtitle].filter(Boolean).join(' '),authorName:a.displayName||'作者',authorId:a.authorId||'',authorSlug:a.slug||'',workUrl:readUrl,readUrl,savedAt:Date.now()};}
function syncLater(){const b=document.querySelector('#saveLater');if(!currentPicked)return;const saved=readLaterItems().some(x=>x.publicationId===currentPicked.publicationId);b.classList.toggle('is-saved',saved);b.textContent=saved?'✓ 保存済み':'あとで読む';b.setAttribute('aria-pressed',saved?'true':'false');}
function toggleLater(){if(!currentPicked)return;const items=readLaterItems(),i=items.findIndex(x=>x.publicationId===currentPicked.publicationId);if(i>=0)items.splice(i,1);else items.unshift(readLaterRecord(currentPicked));try{localStorage.setItem(READ_LATER_STORAGE_KEY,JSON.stringify(items.slice(0,200)));syncLater();}catch(_){}}
function fillPicked(w){currentPicked=w;document.querySelector('#pickedCover').innerHTML=bookMarkup(w);hydrateCoverLoadState(document.querySelector('#pickedCover'));document.querySelector('#pickedTitle').textContent=w.title||'Untitled';document.querySelector('#pickedContext').textContent=[w.episodeLabel,w.episodeTitle].filter(Boolean).join(' ')||'PUBLIC BOOK';document.querySelector('#pickedDetail').textContent=w.description||w.subtitle||'';document.querySelector('#pickedAuthor').textContent=w.author?.displayName?`著者　${w.author.displayName}`:'';document.querySelector('#readBook').href=playerUrl(w);syncLater();}
function pick(w){
  // V2.10.2: opening detail is a modal state. Motion/path animation must not keep
  // mutating the passage underneath while the user is trying to dismiss the detail.
  pathVelocity=0;pathBookHold=null;pathDrag=null;
  fillPicked(w);picked.hidden=false;document.body.classList.add('book-detail-open');document.body.style.overflow='hidden';
}
function detailCardMarkup(w){const a=w.author||{};return `<div class="detail-book">${bookMarkup(w)}</div><div class="detail-copy"><small>${esc([w.episodeLabel,w.episodeTitle].filter(Boolean).join(' ')||'PUBLIC BOOK')}</small><h1>${esc(w.title||'Untitled')}</h1><p>${esc(w.description||w.subtitle||'')}</p><p class="author">${a.displayName?`著者　${esc(a.displayName)}`:''}</p></div><div class="picked-actions detail-actions-placeholder" aria-hidden="true"><span>あとで読む</span><span>ひらく</span></div>`;}
function removeDetailPreview(){if(detailPreview){detailPreview.remove();detailPreview=null;}}
function detailTargetFromDrag(dx,dy){const horizontal=Math.abs(dx)>=Math.abs(dy);const amount=horizontal?dx:dy;return{horizontal,amount,delta:amount<0?1:-1};}
function canMoveShelf(delta){return shelfIndex+delta>=0&&shelfIndex+delta<shelves.length;}
function ensureDetailPreview(delta,horizontal){if(!horizontal&&!canMoveShelf(delta))return null;const target=horizontal?books[norm(index+delta)]:books[index];if(detailPreview&&Number(detailPreview.dataset.delta)===delta&&detailPreview.dataset.axis===(horizontal?'x':'y'))return detailPreview;removeDetailPreview();detailPreview=document.createElement('article');detailPreview.className='detail-card detail-preview';detailPreview.dataset.delta=delta;detailPreview.dataset.axis=horizontal?'x':'y';detailPreview.innerHTML=detailCardMarkup(target);picked.appendChild(detailPreview);return detailPreview;}
function applyDetailDrag(dx,dy){const card=document.querySelector('.detail-card:not(.detail-preview)');const t=detailTargetFromDrag(dx,dy),size=t.horizontal?Math.max(1,picked.clientWidth):Math.max(1,picked.clientHeight);if(!t.horizontal&&!canMoveShelf(t.delta)){// One shelf today: keep vertical axis alive with rubber-band feedback.
  const rubber=t.amount*.18;card.style.transform=`translate3d(0,${rubber}px,0) scale(.995)`;card.style.opacity='1';document.querySelector('#axisHint').textContent='上下は棚を移動（ジャンル棚は準備中）';return;
 }
 const progress=Math.min(1,Math.abs(t.amount)/size),preview=ensureDetailPreview(t.delta,t.horizontal),start=t.amount<0?size:-size;if(!preview)return;
 if(t.horizontal){card.style.transform=`translate3d(${t.amount}px,0,0) scale(${1-progress*.025})`;preview.style.transform=`translate3d(${start+t.amount}px,0,0) scale(${.975+progress*.025})`;}else{card.style.transform=`translate3d(0,${t.amount}px,0) scale(${1-progress*.025})`;preview.style.transform=`translate3d(0,${start+t.amount}px,0) scale(${.975+progress*.025})`;}
 card.style.opacity=String(1-progress*.18);preview.style.opacity=String(.82+progress*.18);
}
function resetDetailDrag(animate=true){const card=document.querySelector('.detail-card:not(.detail-preview)');if(card){if(animate)card.classList.add('detail-settling');card.style.transform='';card.style.opacity='';setTimeout(()=>card.classList.remove('detail-settling'),260);}if(detailPreview){if(animate){detailPreview.classList.add('detail-settling');detailPreview.style.opacity='0';}setTimeout(removeDetailPreview,animate?250:0);}document.querySelector('#axisHint').textContent='左右：同じ棚の本　／　上下：棚を移動';}
function commitDetailHorizontal(delta,dx,dy){const card=document.querySelector('.detail-card:not(.detail-preview)'),preview=detailPreview;if(!preview){resetDetailDrag();return;}const horizontal=Math.abs(dx)>=Math.abs(dy),size=horizontal?picked.clientWidth:picked.clientHeight,sign=(horizontal?dx:dy)<0?-1:1;card.classList.add('detail-settling');preview.classList.add('detail-settling');if(horizontal){card.style.transform=`translate3d(${sign*size}px,0,0) scale(.97)`;preview.style.transform='translate3d(0,0,0) scale(1)';}else{card.style.transform=`translate3d(0,${sign*size}px,0) scale(.97)`;preview.style.transform='translate3d(0,0,0) scale(1)';}card.style.opacity='0';preview.style.opacity='1';setTimeout(()=>{index=norm(index+delta);render();fillPicked(books[index]);card.style.transform='';card.style.opacity='';card.classList.remove('detail-settling');removeDetailPreview();},245);}
function closePick(){
  picked.hidden=true;currentPicked=null;detailDrag=null;removeDetailPreview();
  document.body.classList.remove('book-detail-open');
  document.body.style.overflow=viewMode==='path'?'hidden':'';
  resetDetailDrag(false);
}
document.querySelector('#detailDismiss').onclick=closePick;document.querySelector('#saveLater').onclick=toggleLater;document.querySelector('#focusPick').onclick=()=>books.length&&pick(books[index]);
const detailCard=document.querySelector('.detail-card');
detailCard.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;detailDrag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,lastT:performance.now(),vx:0,vy:0,moved:false};detailCard.setPointerCapture?.(e.pointerId);});
detailCard.addEventListener('pointermove',e=>{if(!detailDrag||e.pointerId!==detailDrag.id)return;const dx=e.clientX-detailDrag.x,dy=e.clientY-detailDrag.y;if(!detailDrag.moved&&Math.max(Math.abs(dx),Math.abs(dy))<5)return;detailDrag.moved=true;e.preventDefault();const now=performance.now(),dt=Math.max(1,now-detailDrag.lastT);detailDrag.vx=(e.clientX-detailDrag.lastX)/dt;detailDrag.vy=(e.clientY-detailDrag.lastY)/dt;detailDrag.lastX=e.clientX;detailDrag.lastY=e.clientY;detailDrag.lastT=now;applyDetailDrag(dx,dy);},{passive:false});
detailCard.addEventListener('pointerup',e=>{if(!detailDrag||e.pointerId!==detailDrag.id)return;const d=detailDrag,dx=e.clientX-d.x,dy=e.clientY-d.y;detailDrag=null;if(!d.moved){resetDetailDrag();return;}const t=detailTargetFromDrag(dx,dy),speed=t.horizontal?Math.abs(d.vx):Math.abs(d.vy),size=t.horizontal?picked.clientWidth:picked.clientHeight;if(!t.horizontal&&!canMoveShelf(t.delta)){resetDetailDrag();return;}if(Math.abs(t.amount)>size*.20||speed>.52){if(t.horizontal)commitDetailHorizontal(t.delta,dx,dy);else resetDetailDrag();}else resetDetailDrag();});
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
  pathProgress=Math.max(0,candidate);
}
function fantasyBooks(){
  const keys=['ファンタジ','異世界','魔法','魔王','勇者','冒険','剣','ドラゴン','fantasy','magic','rpg'];
  const hit=allBooks.filter(w=>keys.some(k=>`${w.title||''} ${w.subtitle||''} ${w.description||''} ${w.episodeLabel||''} ${w.episodeTitle||''}`.toLowerCase().includes(k)));
  return hit.length?hit:allBooks;
}
function setRoomVisual(id){
  const fantasy=id==='fantasy';
  store.classList.toggle('room-fantasy',fantasy);
  document.querySelector('.sign small').textContent=fantasy?'FANTASY FOREST':'NEW ARRIVALS';
  document.querySelector('.sign strong').textContent=fantasy?'ファンタジーの本棚':'新しく入った本';
  shelfIndex=fantasy?1:0;
}
function pathEnd(){
  if(!dataReady||!books.length)return 0;
  if(roomId==='forest')return FOREST_TRAVEL; // future side branch
  return Math.max(0,books.length-1+PATH_EXIT_PAD);
}
function atFantasyGate(){return dataReady&&books.length>0&&roomId==='path'&&pathProgress>=books.length-1+PATH_GATE_REVEAL_PAD}
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
  document.querySelector('#pathStatus').textContent='本の道の終点';
  document.querySelector('#pathSub').textContent='ファンタジーの森へ';
}
function updateFantasyGate(){
  if(!atFantasyGate()){hideFantasyGate();return;}
  if(fantasyGateVisible||fantasyGateTimer)return;
  // The pause is temporal, not another stretch of road: finish the last swipe,
  // breathe on the scenery, then let the destination surface slowly.
  document.querySelector('#pathStatus').textContent='本の道を抜けた';
  document.querySelector('#pathSub').textContent='';
  fantasyGateTimer=setTimeout(()=>{fantasyGateTimer=0;if(atFantasyGate())revealFantasyGate();},780);
}
// Kept as a route primitive for future missable side branches. A side branch may
// set roomId='forest' and use FOREST_TRAVEL / percentage progress before reaching a shelf.
async function enterForest(){
  if(routeTransitioning||!dataReady)return;
  roomHistory.push({id:'path',progress:pathProgress});
  roomId='forest';books=fantasyBooks();pathProgress=0;pathYaw=0;
  setRoomVisual('fantasy');hideFantasyGate();
  document.querySelector('#motionStart').hidden=true;
  document.querySelector('#pathStatus').textContent='ファンタジーの森　0%';
  document.querySelector('#pathSub').textContent='上スワイプ＝前進 ／ 下スワイプ＝後退';
  renderPath();
}


// V2.15.0 — Room shelf ring. A Room is surrounded by tall shelf faces.
// Each face contains 4 columns x 3 rows for now; horizontal swipes rotate the
// shelf ring, while vertical scrolling remains available inside a taller face later.
function roomShelfFaces(){
  const all=roomShelfAllBooks.length?roomShelfAllBooks:fantasyBooks();
  const out=[];for(let i=0;i<all.length;i+=ROOM_SHELF_CAPACITY)out.push({start:i,books:all.slice(i,i+ROOM_SHELF_CAPACITY)});
  return out.length?out:[{start:0,books:[]}];
}
function buildRoomShelfFaceLayer(face,f){
  const layer=document.createElement('div');layer.className='room-shelf-face';layer.dataset.face=String(face);
  for(let local=0;local<f.books.length;local+=4){
    const globalStart=f.start+local;
    const row=document.createElement('button');row.type='button';row.className='room-shelf-row';row.dataset.start=String(globalStart);
    const slice=f.books.slice(local,local+4);
    row.setAttribute('aria-label',`${Math.floor(globalStart/4)+1}段目の本を見る`);
    row.innerHTML=`<span class="room-shelf-books">${slice.map((w,offset)=>`<span class="room-shelf-book" data-book-offset="${offset}" role="button" tabindex="0" aria-label="${esc(w.title||'この本')}を中心に見る">${bookMarkup(w)}</span>`).join('')}</span><span class="room-shelf-board" aria-hidden="true"></span>`;
    row.addEventListener('click',e=>{const hit=e.target.closest('.room-shelf-book');openShelfRow(globalStart,hit?Number(hit.dataset.bookOffset):0)});
    row.addEventListener('keydown',e=>{const hit=e.target.closest('.room-shelf-book');if(hit&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openShelfRow(globalStart,Number(hit.dataset.bookOffset)||0)}});
    layer.appendChild(row);hydrateCoverLoadState(row);
  }
  return layer;
}
function renderRoomShelf(){
  roomShelfVisualYaw=null;roomShelfVisualTargetYaw=roomCameraYaw+roomCameraPreview;roomShelfVisualLastTs=0;if(roomShelfVisualRaf){cancelAnimationFrame(roomShelfVisualRaf);roomShelfVisualRaf=0;}
  const wrap=document.querySelector('#roomShelf'),scroller=document.querySelector('#roomShelfScroll'),grid=document.querySelector('#roomShelfGrid');
  if(!wrap||!grid)return;
  roomShelfMode=true;roomShelfAllBooks=fantasyBooks();
  // Defensive lifecycle guard: a room shelf must never inherit the path-only overlay.
  const pathMotion=document.querySelector('#motionStart');if(pathMotion)pathMotion.hidden=true;
  const faces=roomShelfFaces();roomShelfFace=((roomShelfFace%faces.length)+faces.length)%faces.length;
  grid.innerHTML='';faces.forEach((f,i)=>grid.appendChild(buildRoomShelfFaceLayer(i,f)));
  wrap.hidden=false;stage.hidden=true;wrap.dataset.shelfFace=String(roomShelfFace);
  const counter=document.querySelector('#roomShelfCounter');if(counter)counter.textContent=`${roomShelfFace+1} / ${faces.length}`;
  document.querySelector('#prev').hidden=true;document.querySelector('#next').hidden=true;document.querySelector('#focusPanel').hidden=true;document.querySelector('#hint').hidden=true;
  scroller.scrollTop=0;roomVisibleFace=roomShelfFace;requestAnimationFrame(()=>{updateRoomShelfPerspective();applyRoomCamera(roomCameraPreview,true)});
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
  const faces=roomShelfFaces();face=((face%faces.length)+faces.length)%faces.length;roomShelfFace=face;roomVisibleFace=face;
  const wrap=document.querySelector('#roomShelf');if(wrap)wrap.dataset.shelfFace=String(face);
  const counter=document.querySelector('#roomShelfCounter');if(counter)counter.textContent=`${face+1} / ${faces.length}`;
}
function paintRoomShelfAtYaw(yaw){
  const grid=document.querySelector('#roomShelfGrid');if(!grid)return;
  const near=nearestShelfForYaw(yaw);
  const travelPx=Math.max(window.innerWidth,grid.clientWidth)*1.18;
  grid.querySelectorAll('.room-shelf-face').forEach(layer=>{
    const face=Number(layer.dataset.face)||0,delta=wrapDeg(shelfWorldAngle(face)-yaw),dist=Math.abs(delta);
    const travel=Math.min(1.30,dist/ROOM_VIEW_SLOT_DEG),side=Math.sign(delta)||1;
    const xPx=side*travel*travelPx;
    const visible=dist<112;
    layer.style.visibility=visible?'visible':'hidden';
    layer.style.pointerEvents=dist<18?'auto':'none';
    layer.style.opacity=visible?'1':'0';
    layer.style.transform=`translate3d(${xPx}px,0,0)`;
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
  const panoW=Math.max(store.clientHeight*2,window.innerWidth*2);
  const bg=document.querySelector('#roomBgLayer');
  store.style.setProperty('--room-yaw',`${yaw}deg`);
  if(bg){
    const phase=wrapDeg(yaw)/360;
    bg.style.transition='none';bg.style.backgroundSize=`${panoW}px 100%`;
    bg.style.transform=`translate3d(${-phase*panoW}px,0,0)`;
  }
  // Shelf-only visual smoothing. `instant` means input is current, not that the shelf should bypass smoothing.
  // Force only the first paint so entering the room never animates from an old session angle.
  scheduleRoomShelfVisualYaw(yaw,roomShelfVisualYaw==null);
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
  if(!roomMotionOn||!roomShelfMode||roomId!=='fantasy'||typeof e.alpha!=='number')return;
  const a=e.alpha;roomMotionLatestAlpha=a;
  // While touch or snap animation owns the camera, only remember the newest sensor angle.
  // Never write yaw here: this prevents the sensor and finger/RAF from pulling the same camera back and forth.
  if(roomCameraInputLock||roomShelfTap||roomCameraSettleRaf){roomMotionLastAlpha=a;return;}
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
    roomCameraSettleRaf=0;roomCameraYaw=target;applyRoomCamera(0,true);rebaseRoomMotion();roomCameraInputLock=false;
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
  const h=Math.max(1,scroller.clientHeight),scrollTop=scroller.scrollTop;
  scroller.querySelectorAll('.room-shelf-row').forEach(row=>{
    const cy=row.offsetTop-scrollTop+row.offsetHeight/2,rel=cy/h;
    const top=Math.max(0,Math.min(1,(.42-rel)/.42));
    const bottom=Math.max(0,Math.min(1,(rel-.78)/.22));
    // V2.16.15R1: keep the tall-shelf perspective, but do not make the upper row look disabled.
    const tilt=top*58-bottom*8,scale=1-top*.16-bottom*.05,z=-top*120;
    row.style.setProperty('--shelf-tilt',`${tilt.toFixed(1)}deg`);row.style.setProperty('--shelf-scale',scale.toFixed(3));row.style.setProperty('--shelf-z',`${z.toFixed(0)}px`);row.style.opacity=String(Math.max(.76,1-top*.20-bottom*.16));
    row.style.zIndex=String(100-Math.round(top*20+bottom*5));
  });
}
async function openShelfRow(start,focusOffset=0){
  // Thumbnail -> whole Room book ring. The tapped thumbnail is still the front book.
  const selected=roomShelfAllBooks.length?roomShelfAllBooks:fantasyBooks();if(!selected.length)return;
  const tappedIndex=Math.max(0,Math.min(selected.length-1,(Number(start)||0)+(Number(focusOffset)||0)));
  roomShelfMode=false;document.querySelector('#roomShelf').hidden=true;books=selected;index=tappedIndex;dragUnits=0;stage.hidden=false;
  stage.classList.add('room-shelf-ring');
  document.querySelector('#prev').hidden=false;document.querySelector('#next').hidden=false;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=false;
  document.querySelector('#hint').textContent='左右にスワイプしてRoomの本を見る　／　上スワイプで棚へ戻る';
  document.querySelector('.sign').classList.add('shelf-back-sign');
  stage.innerHTML='';await preloadFirstViewCovers();renderFirstViewRing(index-4.2);stage.classList.add('is-intro-spinning');
  const startTime=performance.now(),dur=1450;
  await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-startTime)/dur),ease=1-Math.pow(1-t,3.4),center=index-4.2*(1-ease),depth=.12+.88*(1-Math.pow(1-t,1.8));stage.querySelectorAll('.book').forEach(b=>setBookPose(b,wrappedOffsetFrom(center,Number(b.dataset.index)),depth));if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
  stage.classList.remove('is-intro-spinning');render();updateFocusPanel();
}
function backToRoomShelf(){
  if(roomId!=='fantasy'||roomShelfMode)return;
  // V2.16.15R1: always hand the shared camera back to motion when the shelf returns.
  roomShelfTap=null;roomCameraInputLock=false;roomCameraPreview=0;rebaseRoomMotion();
  books=roomShelfAllBooks.length?roomShelfAllBooks:fantasyBooks();stage.classList.remove('room-shelf-ring','is-shelf-returning');stage.style.removeProperty('--shelf-return-y');stage.style.removeProperty('--shelf-return-scale');document.querySelector('.sign').classList.remove('shelf-back-sign');renderRoomShelf();
  requestAnimationFrame(()=>{rebaseRoomMotion();applyRoomCamera(0,true);});
}


function wrapDeg(v){while(v>180)v-=360;while(v<-180)v+=360;return v;}
function hallGates(){return [...document.querySelectorAll('.hall-gate[data-angle]')];}
function hallSpatialItems(){return [...document.querySelectorAll('.hall-gate[data-angle],.hall-my-shelf[data-angle]')];}
function hallShelfBooks(kind){
  // Trial: both shelves use live public-book data. MY BOOKS can be swapped to owned-copy data later.
  return (kind==='mine'?allBooks.slice(4,8):allBooks.slice(0,8)).filter(Boolean);
}
function renderHallShelf(rootId,kind){const root=document.querySelector(rootId);if(!root)return;const sample=hallShelfBooks(kind);root.innerHTML=sample.map((w,i)=>`<button class="hall-my-book" type="button" data-hall-book="${i}" aria-label="${esc(w.title||'本')}">${bookMarkup(w)}</button>`).join('');hydrateCoverLoadState(root);root.querySelectorAll('.hall-my-book').forEach((b,i)=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openHallShelfRing(kind,i);}));}
function renderHallMyShelf(){renderHallShelf('#hallNewShelfBooks','new');renderHallShelf('#hallMyShelfBooks','mine');}
async function openHallShelfRing(kind,selectedIndex=0){
  const selected=hallShelfBooks(kind);if(!selected.length)return;
  hallShelfRing=true;hallShelfKind=kind;hallPreview=0;hallDrag=null;rebaseHallMotion();
  document.querySelector('#centralHall').hidden=true;document.querySelector('#roomBgLayer').style.display='block';
  store.classList.remove('hall-mode','intro-mode');roomId='hall-shelf-ring';viewMode='ring';roomShelfMode=false;books=selected;index=norm(selectedIndex);dragUnits=0;
  stage.hidden=false;stage.style.transform='';stage.style.opacity='';stage.classList.add('room-shelf-ring');stage.classList.remove('is-shelf-returning','is-intro-spinning','is-intro-ready');
  document.querySelector('.sign small').textContent=kind==='mine'?'MY BOOKS':'NEW ARRIVALS';document.querySelector('.sign strong').textContent=kind==='mine'?'もっている本':'新しく入った本';document.querySelector('.sign').classList.add('shelf-back-sign');
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
}
function backToHallShelf(){
  if(!hallShelfRing)return;hallShelfRing=false;stage.classList.remove('room-shelf-ring','is-shelf-returning');stage.style.removeProperty('--shelf-return-y');stage.style.removeProperty('--shelf-return-scale');document.querySelector('.sign').classList.remove('shelf-back-sign');showCentralHall(false);
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
function onHallOrientation(e){if(!hallMotionOn||viewMode!=='hall'||hallDrag||typeof e.alpha!=='number')return;const a=e.alpha;if(hallMotionLastAlpha==null){hallMotionLastAlpha=a;return;}let d=a-hallMotionLastAlpha;if(d>180)d-=360;if(d<-180)d+=360;hallMotionLastAlpha=a;hallYaw-=d*.72;hallPreview=0;requestAnimationFrame(renderHall);}
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
  stage.hidden=false;stage.style.transform='';stage.style.opacity='';stage.classList.remove('room-shelf-ring','is-shelf-returning','is-intro-spinning');stage.classList.add('is-intro-ready');
  document.querySelector('#prev').hidden=false;document.querySelector('#next').hidden=false;document.querySelector('#focusPanel').hidden=false;document.querySelector('#hint').hidden=false;
  document.querySelector('#ringMode').classList.add('is-active');document.querySelector('#pathMode').classList.remove('is-active');
  const ih=document.querySelector('#introHint');if(ih){ih.hidden=false;ih.textContent='↑ 上にスワイプして中央ホールへ';}
  render();updateFocusPanel();window.scrollTo(0,0);
}
function makeRouteCrossfadeLayer(kind, role='old'){
  const layer=document.createElement('div');
  layer.className=`route-crossfade-layer route-crossfade-${kind} route-crossfade-${role}`;
  layer.setAttribute('aria-hidden','true');
  // Preserve the live 360 camera only for the OLD room being painted out.
  // Never copy #roomBgLayer into a NEW destination layer: during Fantasy -> Hall
  // #roomBgLayer still contains Fantasy, which made the new Hall overlay paint Fantasy
  // over Fantasy and then pop to Hall after cleanup instead of visibly crossfading.
  if(role==='old'&&(kind==='hall'||kind==='fantasy')){
    const src=document.querySelector('#roomBgLayer');
    if(src){
      const cs=getComputedStyle(src);
      // Keep only the live camera position for viewport-sized overlays.
      // The CSS class owns the correct room image/size/repeat.
      layer.style.backgroundPosition=cs.backgroundPosition;
    }
  }
  // V2.18.29: when Fantasy returns to Hall, the destination overlay must
  // already paint the Hall at the same 180deg camera angle as the live Hall.
  // Otherwise the crossfade shows Hall 0deg and pops to 180deg on cleanup.
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
  store.classList.remove('intro-mode','room-fantasy');store.classList.add('hall-mode');document.body.classList.remove('book-path-active','intro-entry-active');
  stage.hidden=true;stage.classList.remove('is-intro-ready');const ih=document.querySelector('#introHint');if(ih)ih.hidden=true;
  document.querySelector('#bookPath').hidden=true;document.querySelector('#roomShelf').hidden=true;document.querySelector('#motionStart').hidden=true;
  document.querySelector('#prev').hidden=true;document.querySelector('#next').hidden=true;document.querySelector('#focusPanel').hidden=true;document.querySelector('#hint').hidden=true;
  document.querySelector('#centralHall').hidden=false;document.querySelector('#roomBgLayer').style.display='block';document.querySelector('#roomExitNav').hidden=true;
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
function enterBookPathFromHall(){if(!dataReady)return;const routeFade=startRouteCrossfade('hall','path');document.querySelector('#centralHall').hidden=true;store.classList.remove('hall-mode');roomId='path';viewMode='path';books=allBooks.slice();pathProgress=0;pathYaw=0;pathVelocity=0;setRoomVisual('new');document.body.classList.add('book-path-active');stage.hidden=true;document.querySelector('#bookPath').hidden=false;document.querySelector('#motionStart').hidden=false;document.querySelector('#prev').hidden=true;document.querySelector('#next').hidden=true;document.querySelector('#focusPanel').hidden=true;document.querySelector('#hint').hidden=true;document.querySelector('#roomExitNav').hidden=true;renderPath();ensurePathLoop();primeNextRoomBackground('fantasy');fadeRouteLayers(routeFade);}
function returnToPathFromRoom(){const routeFade=roomId==='fantasy'?startRouteCrossfade('fantasy','path'):null;roomMotionOn&&toggleRoomMotion();roomShelfMode=false;store.classList.remove('room-fantasy');document.querySelector('#roomShelf').hidden=true;document.querySelector('#roomExitNav').hidden=true;roomId='path';viewMode='path';books=allBooks.slice();pathProgress=Math.max(0,books.length-1);setRoomVisual('new');document.body.classList.add('book-path-active');document.querySelector('#bookPath').hidden=false;document.querySelector('#motionStart').hidden=false;renderPath();ensurePathLoop();if(routeFade)fadeRouteLayers(routeFade);}

async function enterFantasyRoom(){
  if(routeTransitioning||!dataReady)return;routeTransitioning=true;pathVelocity=0;
  // V2.18.19: strict room-entry order:
  // 1) decode background, 2) mount it transparent, 3) start background fade,
  // 4) only then prepare/start the ring. This makes the fade deterministic on iPhone Safari.
  spinToken++;drag=null;hallShelfRing=false;stage.hidden=true;stage.style.opacity='0';stage.innerHTML='';
  stage.classList.remove('is-intro-ready','is-intro-spinning','room-shelf-ring','is-shelf-returning');
  const path=document.querySelector('#bookPath');path?.classList.add('route-leaving');
  const oldFx=document.querySelector('#roomTransitionFx');if(oldFx)oldFx.remove();
  const roomBg=document.querySelector('#roomBgLayer');

  // Wait for the actual room image to be loaded + decoded before changing visual ownership.
  await preloadRoomBackground('fantasy');
  if(!routeTransitioning)return;

  // V2.18.21: keep a lightweight copy of the path background alive during the handoff.
  // The destination room fades in underneath while this layer fades out, so Safari never
  // has to "replace then fade" a background in the same paint.
  const oldRoomLayer=document.createElement('div');
  oldRoomLayer.className='room-crossfade-old room-crossfade-old-path';
  oldRoomLayer.setAttribute('aria-hidden','true');
  store.appendChild(oldRoomLayer);

  roomHistory.push({id:'path',progress:pathProgress});roomId='fantasy';roomShelfAllBooks=fantasyBooks();books=roomShelfAllBooks.slice();index=0;dragUnits=0;roomShelfMode=false;document.querySelector('#centralHall').hidden=true;store.classList.remove('hall-mode','intro-mode');
  setRoomVisual('fantasy');viewMode='ring';document.body.classList.remove('book-path-active');
  if(roomBg){
    roomBg.style.display='block';
    roomBg.classList.remove('is-room-visible');
    roomBg.classList.add('room-enter-fade');
    void roomBg.offsetWidth;
  }
  roomCameraYaw=0;roomCameraPreview=0;applyRoomCamera(0,true);
  const pathMotion=document.querySelector('#motionStart');if(pathMotion)pathMotion.hidden=true;
  document.querySelector('#ringMode').classList.add('is-active');document.querySelector('#pathMode').classList.remove('is-active');
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
  document.querySelector('#ringMode').classList.toggle('is-active',viewMode==='ring');
  document.querySelector('#pathMode').classList.toggle('is-active',viewMode==='path');
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
function renderPath(){
  const root=document.querySelector('#pathBooks');if(!root)return;root.innerHTML='';
  if(!dataReady||!books.length){document.querySelector('#fantasyGate').hidden=true;return;}
  // V2.8: the road is genuinely bidirectional. Keep a few already-passed books alive
  // long enough to streak out through the left/right edges instead of popping away.
  const base=Math.floor(pathProgress),from=-3,to=10;
  for(let k=from;k<=to;k++){
    const raw=base+k;if(raw<0||raw>=books.length)continue;
    const w=books[raw],phase=raw-pathProgress;
    if(phase<-2.35||phase>9.5)continue;
    const el=document.createElement('button');el.className='path-item';el.type='button';el.setAttribute('aria-label',w.title||'本');el.innerHTML=bookMarkup(w);
    const side=(raw%2===0?-1:1);
    const future=Math.max(0,phase),passed=Math.max(0,-phase);
    // Future books sit down the road. Once they pass the viewer they accelerate toward
    // a screen edge, grow slightly, blur and fade: a visual "rush past" rather than a cut.
    const spread=Math.min(178,50+future*19);
    const exit=Math.min(innerWidth*.72,passed*(innerWidth*.34+70));
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
    document.querySelector('#pathStatus').textContent=pathProgress>=FOREST_TRAVEL-.08?'森の奥に本棚が見える':`ファンタジーの森　${pct}%`;
    document.querySelector('#pathSub').textContent=pathProgress>=FOREST_TRAVEL-.08?'タップすると本棚へ':'上スワイプ＝前進 ／ 下スワイプ＝後退';
    document.querySelector('#fantasyGate').hidden=true;
  }else{
    const n=Math.min(books.length,Math.max(1,Math.round(pathProgress)+1));
    if(pathProgress>books.length-.25){document.querySelector('#pathStatus').textContent='本の道を抜けた';document.querySelector('#pathSub').textContent='';}
    else {document.querySelector('#pathStatus').textContent=`本の道　${n} / ${books.length}`;document.querySelector('#pathSub').textContent='上スワイプ＝前進 ／ 下スワイプ＝後退';}
    updateFantasyGate();
  }
}
function clampPath(v){return Math.max(0,Math.min(pathEnd(),v))}
function renderPathFrame(now){
  if(!pathLastFrame)pathLastFrame=now;
  const dt=Math.min(34,Math.max(1,now-pathLastFrame));pathLastFrame=now;
  if(pathBookHold||!picked.hidden){pathRaf=requestAnimationFrame(renderPathFrame);return;}
  if(Math.abs(pathVelocity)>.00005){
    pathProgress=clampPath(pathProgress+pathVelocity*dt);
    if((pathProgress<=0&&pathVelocity<0)||(pathProgress>=pathEnd()&&pathVelocity>0))pathVelocity=0;
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
  if(!dataReady||!books.length||routeTransitioning)return;
  if(e.target.closest('#motionStart'))return;
  if(e.target.closest('#fantasyGate')){enterFantasyRoom();return;}
  if(roomId==='forest'&&pathProgress>=FOREST_TRAVEL-.08){enterFantasyRoom();return;}
  pathVelocity=0;
  const hit=findPathBookAt(e.clientX,e.clientY);
  pathBookHold=hit?{raw:Number(hit.dataset.raw),x:e.clientX,y:e.clientY,moved:false}:null;
  pathDrag={id:e.pointerId,y:e.clientY,x:e.clientX,start:pathProgress,lastY:e.clientY,lastT:performance.now(),vy:0,moved:false};
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
  if(d.moved&&d.start<=.12&&dy>58){pathVelocity=0;showCentralHall(false);return;}
  if(!d.moved&&h&&!h.moved&&Number.isFinite(h.raw)){
    const raw=h.raw,w=books[norm(raw)];
    pathVelocity=0;pathProgress=Math.max(0,raw);index=norm(raw);renderPath();pick(w);return;
  }
  const dir=-1; // all passages: up swipe = forward, down swipe = backward
  const launch=Math.max(-PATH_MAX_VELOCITY,Math.min(PATH_MAX_VELOCITY,dir*d.vy/PATH_DRAG_PX_PER_BOOK*.82));
  addPathVelocity(launch)
}
function onOrientation(e){if(!motionOn||viewMode!=='path'||pathDrag||!picked.hidden||typeof e.gamma!=='number')return;const next=Math.max(-75,Math.min(75,e.gamma));pathYaw+=(next-pathYaw)*.18;renderPath()}
function onMotion(e){
  if(!motionOn||viewMode!=='path'||roomId==='forest'||pathDrag||!picked.hidden)return;
  const g=e.accelerationIncludingGravity||e.acceleration;if(!g)return;
  const mag=Math.sqrt((g.x||0)**2+(g.y||0)**2+(g.z||0)**2),delta=Math.abs(mag-lastAccelMag);lastAccelMag=mag;
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
document.querySelector('#ringMode').onclick=()=>setViewMode('ring');document.querySelector('#pathMode').onclick=()=>setViewMode('path');
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
  // Touch becomes the sole owner of the shared camera until release + snap completes.
  if(roomCameraSettleRaf){cancelAnimationFrame(roomCameraSettleRaf);roomCameraSettleRaf=0;}
  roomCameraInputLock=true;
  const currentYaw=roomCameraYaw+roomCameraPreview;roomCameraYaw=currentYaw;roomCameraPreview=0;rebaseRoomMotion();
  roomShelfTap={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,dx:0,dy:0,startYaw:currentYaw};
},{capture:true,passive:true});
roomShelfScroller?.addEventListener('pointermove',e=>{if(!roomShelfTap||e.pointerId!==roomShelfTap.id)return;const samples=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null,last=samples&&samples.length?samples[samples.length-1]:e;roomShelfTap.dx=last.clientX-roomShelfTap.x;roomShelfTap.dy=last.clientY-roomShelfTap.y;if(Math.hypot(roomShelfTap.dx,roomShelfTap.dy)>5)roomShelfTap.moved=true;if(roomShelfTap.moved&&Math.abs(roomShelfTap.dx)>Math.abs(roomShelfTap.dy)*1.05){queueRoomShelfPreview(-roomShelfTap.dx*ROOM_SWIPE_DEG_PER_PX);}},{capture:true,passive:true});
roomShelfScroller?.addEventListener('pointerup',e=>{
  if(!roomShelfTap||e.pointerId!==roomShelfTap.id)return;flushRoomShelfPreview();const tap=roomShelfTap;roomShelfTap=null;
  if(!roomShelfMode){roomCameraInputLock=false;rebaseRoomMotion();return;}
  if(tap.moved){
    if(Math.abs(tap.dx)>Math.abs(tap.dy)*1.15&&Math.abs(tap.dx)>18){
      e.preventDefault();e.stopPropagation();const dir=tap.dx<0?1:-1;
      // Commit the exact dragged view first, then animate from there to the next 90° slot.
      const draggedYaw=tap.startYaw-tap.dx*ROOM_SWIPE_DEG_PER_PX;
      roomCameraYaw=draggedYaw;roomCameraPreview=0;applyRoomCamera(0,true);
      const target=nearestRoomViewSlot(tap.startYaw)+dir*ROOM_VIEW_SLOT_DEG;animateRoomYaw(draggedYaw,target,280);
    }else{
      roomCameraYaw=tap.startYaw;roomCameraPreview=0;applyRoomCamera(0,false);rebaseRoomMotion();roomCameraInputLock=false;
    }
    return;
  }
  // iPhone Safari can lose hit-testing on perspective-transformed rows. Resolve the
  // visible cover geometrically instead of trusting event.target.
  let chosen=null;
  for(const row of roomShelfScroller.querySelectorAll('.room-shelf-row')){
    const booksInRow=[...row.querySelectorAll('.room-shelf-book')];
    for(let offset=0;offset<booksInRow.length;offset++){
      const r=booksInRow[offset].getBoundingClientRect();
      if(e.clientX>=r.left-5&&e.clientX<=r.right+5&&e.clientY>=r.top-5&&e.clientY<=r.bottom+5){chosen={start:Number(row.dataset.start)||0,offset};break;}
    }
    if(chosen)break;
  }
  if(chosen){
    e.preventDefault();e.stopPropagation();
    // V2.16.15R1: opening the ring must release touch ownership. Otherwise the
    // 360° sensor remains logically ON but its camera writes stay locked after returning.
    roomCameraInputLock=false;roomCameraPreview=0;rebaseRoomMotion();
    openShelfRow(chosen.start,chosen.offset);
  }
},{capture:true,passive:false});
roomShelfScroller?.addEventListener('pointercancel',()=>{if(roomShelfDragRaf){cancelAnimationFrame(roomShelfDragRaf);roomShelfDragRaf=0;}roomShelfPendingPreview=null;roomShelfTap=null;roomCameraPreview=0;rebaseRoomMotion();roomCameraInputLock=false;},{capture:true});
roomShelfScroller?.addEventListener('scroll',()=>{if(roomShelfScrollRaf)return;roomShelfScrollRaf=requestAnimationFrame(()=>{roomShelfScrollRaf=0;updateRoomShelfPerspective()})},{passive:true});
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
document.querySelector('#hallMotion')?.addEventListener('click',toggleHallMotion);document.querySelector('#hallBookPath')?.addEventListener('click',enterBookPathFromHall);document.querySelector('#hallFantasy')?.addEventListener('click',enterFantasyRoom);document.querySelector('#exitHall')?.addEventListener('click',()=>showCentralHall(false));document.querySelector('#exitPath')?.addEventListener('click',returnToPathFromRoom);
const hallEl=document.querySelector('#centralHall');
hallEl?.addEventListener('pointerdown',e=>{/* V2.18.4: the large 0/90/180/270 gate cards are buttons, but they also occupy the natural swipe surface. Only the motion toggle is excluded; swiping on a gate must still allow the down-swipe back to NEW ARRIVALS. */if(e.target.closest('#hallMotion'))return;hallDrag={id:e.pointerId,x:e.clientX,y:e.clientY,start:hallYaw,lastX:e.clientX,t:performance.now(),axis:null};hallEl.setPointerCapture?.(e.pointerId);rebaseHallMotion();});
hallEl?.addEventListener('pointermove',e=>{if(!hallDrag||e.pointerId!==hallDrag.id)return;const dx=e.clientX-hallDrag.x,dy=e.clientY-hallDrag.y;if(!hallDrag.axis&&Math.hypot(dx,dy)>7)hallDrag.axis=Math.abs(dy)>Math.abs(dx)*1.12?'vertical':'horizontal';if(hallDrag.axis==='vertical'){if(dy>0)e.preventDefault();return;}if(Math.abs(dx)>2)e.preventDefault();hallDrag.lastX=e.clientX;hallPreview=-dx/Math.max(320,store.clientWidth)*135;renderHall();},{passive:false});
hallEl?.addEventListener('pointerup',e=>{if(!hallDrag||e.pointerId!==hallDrag.id)return;const d=hallDrag,dx=e.clientX-d.x,dy=e.clientY-d.y,dt=Math.max(1,performance.now()-d.t),vx=dx/dt;hallDrag=null;if(d.axis==='vertical'){hallPreview=0;if(dy>58){const facingNew=Math.abs(wrapDeg(hallYaw))<42;if(facingNew){showNewArrivalsFromHall();return;}}settleHall();return;}const base=Math.round(d.start/90)*90;hallYaw=d.start+hallPreview;hallPreview=0;
  // A normal deliberate swipe advances one entrance; no hard flick required.
  if(Math.abs(dx)>=34||Math.abs(vx)>=.24){const dir=dx<0?1:-1;const from=hallYaw,target=base+dir*90,start=performance.now(),dur=250;function tick(now){const t=Math.min(1,(now-start)/dur),q=1-Math.pow(1-t,3);hallYaw=from+(target-from)*q;renderHall();if(t<1)requestAnimationFrame(tick);else{hallYaw=target;rebaseHallMotion();renderHall();}}requestAnimationFrame(tick);}else settleHall();
});hallEl?.addEventListener('pointercancel',()=>{hallPreview=0;hallDrag=null;settleHall();});

async function init(){try{const r=await fetch(`${API}/discover`,{cache:'no-store'}),data=await r.json();if(!r.ok||!data?.ok)throw new Error(data?.error||'本を読み込めませんでした。');books=Array.isArray(data.works)?data.works.filter(w=>w?.publicationId):[];allBooks=books.slice();dataReady=true;roomId='intro';store.classList.add('intro-mode');document.body.classList.add('intro-entry-active');window.scrollTo(0,0);document.querySelector('#bookCount').textContent=`${books.length}冊が店内にあります`;if(!books.length){stage.innerHTML='<p style="text-align:center;margin-top:30%;color:#bbb">まだ本がありません。</p>';return;}/* V2.11.7: do not render the resting shelf before preload. Keep only the bookstore visible, then reveal the already-spinning distant ring once the focal covers are decoded. */stage.innerHTML='';stage.classList.add('is-intro-waiting');updateFocusPanel();await preloadFirstViewCovers();stage.classList.remove('is-intro-waiting');requestAnimationFrame(()=>requestAnimationFrame(playFirstViewSpin));}catch(e){stage.classList.remove('is-intro-waiting');document.querySelector('#bookCount').textContent='棚を読み込めませんでした';stage.innerHTML=`<p style="text-align:center;margin-top:30%;color:#bbb">${esc(e.message)}</p>`;}}
init();
