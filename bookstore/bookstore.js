const API='https://scene-studio-api.a-hako.workers.dev';
const READ_LATER_STORAGE_KEY='ahako:read-later:v1';
const stage=document.querySelector('#stage'),picked=document.querySelector('#picked'),store=document.querySelector('#store');
let books=[],index=0,drag=null,dragUnits=0,suppressClickUntil=0,currentPicked=null,detailDrag=null,spinToken=0,detailPreview=null;
let viewMode='ring',pathProgress=0,pathYaw=0,pathDrag=null,motionOn=false,lastAccelMag=0;
let pathVelocity=0,pathRaf=0,pathLastFrame=0,pathMotionEnergy=0,pathMotionLast=0,pathDirection=1,pathDirectionUntil=0;
// V2.3: shelf is now an explicit axis. Today there is one public shelf; future genres can be added here.
let shelfIndex=0;
const shelves=[{id:'new',label:'新しく入った本'}];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function playerUrl(work){const player=new URL('../',location.href),raw=new URL(`${API}/work/${encodeURIComponent(work.publicationId)}`);raw.searchParams.set('raw','1');player.searchParams.set('src',raw);player.searchParams.set('returnTo',location.href);return player.toString();}
function norm(n){return books.length?((n%books.length)+books.length)%books.length:0;}
function signedOffset(i){let d=i-index;if(d>books.length/2)d-=books.length;if(d<-books.length/2)d+=books.length;return d;}
function bookMarkup(w){return `<span class="book-shell"><span class="book-spine"></span><span class="book-pages"></span><span class="book-bottom"></span><span class="book-face">${w.coverUrl?`<img src="${esc(w.coverUrl)}" alt="">`:'<span class="fallback">あ□</span>'}</span></span>`;}
// V2.4 — continuous circular ring. Every book owns a live angular position;
// the centered book is never replaced at rest, it simply arrives at angle 0.
const RING_STEP_DEG=27;
function setBookPose(b,pos){
  const angle=pos*RING_STEP_DEG,rad=angle*Math.PI/180;
  const radius=Math.min(430,Math.max(320,stage.clientWidth*.52));
  const x=Math.sin(rad)*radius;
  const depth=1-Math.cos(rad); // 0 at the viewer, grows continuously toward the back
  // V2.5: keep the ring, but make the viewing position a pronounced focal crest.
  // The non-linear falloff keeps neighbours visibly behind instead of almost the same size.
  const focus=Math.exp(-Math.pow(Math.abs(angle)/23,2));
  // V2.6: focal strength sits between V2.4 and V2.5 — clear centre without billboard dominance.
  const z=-55 + focus*190 - depth*145;
  const y=depth*14;
  const scale=Math.max(.40,.64 + focus*.46 - depth*.07);
  const bright=Math.max(.44,.74 + focus*.30 - depth*.11);
  const opacity=Math.max(.22,.70 + focus*.28 - depth*.18);
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
function render(){stage.innerHTML='';if(!books.length)return;books.forEach((w,i)=>{const slot=signedOffset(i);if(Math.abs(slot)>5)return;const b=document.createElement('button');b.className='book';b.dataset.slot=slot;b.dataset.index=i;b.setAttribute('aria-label',`${w.title||'Untitled'} ${w.author?.displayName||''}`);b.innerHTML=bookMarkup(w);setBookPose(b,slot+dragUnits);b.onclick=()=>{if(Date.now()<suppressClickUntil)return;const off=signedOffset(i);if(off===0)pick(w);else glideToOffset(-off);};stage.appendChild(b);});updateFocusPanel();}
function snapTo(i){index=norm(i);dragUnits=0;render();}
function move(delta){if(books.length)glideToOffset(-delta);}
function applyDrag(units){dragUnits=units;stage.querySelectorAll('.book').forEach(b=>{const slot=Number(b.dataset.slot||0);setBookPose(b,slot+units);});}
function beginDrag(e){if(e.button!=null&&e.button!==0)return;spinToken++;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastT:performance.now(),vx:0,moved:false};stage.classList.add('is-dragging');stage.setPointerCapture?.(e.pointerId);}
function dragMove(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dx)<5&&Math.abs(dy)<5)return;if(Math.abs(dy)>Math.abs(dx)*1.35&&!drag.moved){endDrag(e,true);return;}drag.moved=true;e.preventDefault();const now=performance.now(),dt=Math.max(1,now-drag.lastT);drag.vx=(e.clientX-drag.lastX)/dt;drag.lastX=e.clientX;drag.lastT=now;const spacing=Math.min(210,Math.max(145,stage.clientWidth*.39));applyDrag(dx/spacing);}
function easeOutCubic(t){return 1-Math.pow(1-t,3);}
function animateOffset(from,to,duration,token){return new Promise(resolve=>{const t0=performance.now();function frame(now){if(token!==spinToken)return resolve(false);const p=Math.min(1,(now-t0)/duration),e=easeOutCubic(p);applyDrag(from+(to-from)*e);if(p<1)requestAnimationFrame(frame);else resolve(true);}requestAnimationFrame(frame);});}
async function glideToOffset(target){if(!books.length)return;const token=++spinToken;const from=dragUnits;target=Math.max(-4,Math.min(4,target));const dist=Math.abs(target-from);const ok=await animateOffset(from,target,190+dist*72,token);if(!ok)return;const step=-Math.round(target);index=norm(index+step);dragUnits=0;render();}
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
  index=norm(index-Math.round(target));dragUnits=0;render();
}
function endDrag(e,cancel=false){if(!drag)return;const d=drag;drag=null;stage.classList.remove('is-dragging');if(cancel){glideToOffset(0);return;}if(d.moved){suppressClickUntil=Date.now()+360;const spacing=Math.min(210,Math.max(145,stage.clientWidth*.39));const velocity=d.vx/spacing;coastAndSnap(dragUnits,velocity*.66);}else glideToOffset(0);}
function readLaterItems(){try{const v=JSON.parse(localStorage.getItem(READ_LATER_STORAGE_KEY)||'[]');return Array.isArray(v)?v.filter(x=>x&&x.publicationId).slice(0,200):[];}catch(_){return[];}}
function readLaterRecord(w){const a=w.author||{},readUrl=playerUrl(w);return{publicationId:w.publicationId,title:w.title||'Untitled',coverUrl:w.coverUrl||'',detail:[w.episodeLabel,w.episodeTitle,w.subtitle].filter(Boolean).join(' '),authorName:a.displayName||'作者',authorId:a.authorId||'',authorSlug:a.slug||'',workUrl:readUrl,readUrl,savedAt:Date.now()};}
function syncLater(){const b=document.querySelector('#saveLater');if(!currentPicked)return;const saved=readLaterItems().some(x=>x.publicationId===currentPicked.publicationId);b.classList.toggle('is-saved',saved);b.textContent=saved?'✓ 保存済み':'あとで読む';b.setAttribute('aria-pressed',saved?'true':'false');}
function toggleLater(){if(!currentPicked)return;const items=readLaterItems(),i=items.findIndex(x=>x.publicationId===currentPicked.publicationId);if(i>=0)items.splice(i,1);else items.unshift(readLaterRecord(currentPicked));try{localStorage.setItem(READ_LATER_STORAGE_KEY,JSON.stringify(items.slice(0,200)));syncLater();}catch(_){}}
function fillPicked(w){currentPicked=w;document.querySelector('#pickedCover').innerHTML=bookMarkup(w);document.querySelector('#pickedTitle').textContent=w.title||'Untitled';document.querySelector('#pickedContext').textContent=[w.episodeLabel,w.episodeTitle].filter(Boolean).join(' ')||'PUBLIC BOOK';document.querySelector('#pickedDetail').textContent=w.description||w.subtitle||'';document.querySelector('#pickedAuthor').textContent=w.author?.displayName?`著者　${w.author.displayName}`:'';document.querySelector('#readBook').href=playerUrl(w);syncLater();}
function pick(w){fillPicked(w);picked.hidden=false;document.body.style.overflow='hidden';}
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
function closePick(){picked.hidden=true;currentPicked=null;document.body.style.overflow='';resetDetailDrag(false);}
document.querySelector('#detailDismiss').onclick=closePick;document.querySelector('#saveLater').onclick=toggleLater;document.querySelector('#focusPick').onclick=()=>books.length&&pick(books[index]);
const detailCard=document.querySelector('.detail-card');
detailCard.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;detailDrag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,lastT:performance.now(),vx:0,vy:0,moved:false};detailCard.setPointerCapture?.(e.pointerId);});
detailCard.addEventListener('pointermove',e=>{if(!detailDrag||e.pointerId!==detailDrag.id)return;const dx=e.clientX-detailDrag.x,dy=e.clientY-detailDrag.y;if(!detailDrag.moved&&Math.max(Math.abs(dx),Math.abs(dy))<5)return;detailDrag.moved=true;e.preventDefault();const now=performance.now(),dt=Math.max(1,now-detailDrag.lastT);detailDrag.vx=(e.clientX-detailDrag.lastX)/dt;detailDrag.vy=(e.clientY-detailDrag.lastY)/dt;detailDrag.lastX=e.clientX;detailDrag.lastY=e.clientY;detailDrag.lastT=now;applyDetailDrag(dx,dy);},{passive:false});
detailCard.addEventListener('pointerup',e=>{if(!detailDrag||e.pointerId!==detailDrag.id)return;const d=detailDrag,dx=e.clientX-d.x,dy=e.clientY-d.y;detailDrag=null;if(!d.moved){resetDetailDrag();return;}const t=detailTargetFromDrag(dx,dy),speed=t.horizontal?Math.abs(d.vx):Math.abs(d.vy),size=t.horizontal?picked.clientWidth:picked.clientHeight;if(!t.horizontal&&!canMoveShelf(t.delta)){resetDetailDrag();return;}if(Math.abs(t.amount)>size*.20||speed>.52){if(t.horizontal)commitDetailHorizontal(t.delta,dx,dy);else resetDetailDrag();}else resetDetailDrag();});
detailCard.addEventListener('pointercancel',()=>{detailDrag=null;resetDetailDrag();});
document.querySelector('#prev').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
stage.addEventListener('pointerdown',beginDrag);stage.addEventListener('pointermove',dragMove,{passive:false});stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',e=>endDrag(e,true));
store.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>12){e.preventDefault();move(e.deltaX>0?1:-1)}},{passive:false});

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
function setViewMode(mode){
  const next=mode==='path'?'path':'ring';
  if(next===viewMode)return;
  if(next==='ring')syncRingFromPath();else syncPathFromRing();
  viewMode=next;
  document.querySelector('#ringMode').classList.toggle('is-active',viewMode==='ring');
  document.querySelector('#pathMode').classList.toggle('is-active',viewMode==='path');
  stage.hidden=viewMode!=='ring';
  document.querySelector('#bookPath').hidden=viewMode!=='path';
  document.querySelector('#prev').hidden=viewMode!=='ring';document.querySelector('#next').hidden=viewMode!=='ring';
  document.querySelector('#focusPanel').hidden=viewMode!=='ring';document.querySelector('#hint').hidden=viewMode!=='ring';
  if(viewMode==='path')renderPath();else render();
}
function renderPath(){
  const root=document.querySelector('#pathBooks');if(!root||!books.length)return;root.innerHTML='';
  // V2.8: the road is genuinely bidirectional. Keep a few already-passed books alive
  // long enough to streak out through the left/right edges instead of popping away.
  const base=Math.floor(pathProgress),from=-3,to=10;
  for(let k=from;k<=to;k++){
    const raw=base+k,w=books[norm(raw)],phase=raw-pathProgress;
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
    el.onclick=e=>{e.stopPropagation();pathVelocity=0;pathProgress=Math.max(0,raw);index=norm(raw);renderPath();pick(w)};
    root.appendChild(el);
  }
  const n=norm(Math.round(pathProgress))+1;
  document.querySelector('#pathStatus').textContent=`本の道　${n} / ${books.length}`;
}
function clampPath(v){return Math.max(0,v)}
function renderPathFrame(now){
  if(!pathLastFrame)pathLastFrame=now;
  const dt=Math.min(34,Math.max(1,now-pathLastFrame));pathLastFrame=now;
  if(Math.abs(pathVelocity)>.00005){
    pathProgress=clampPath(pathProgress+pathVelocity*dt);
    if(pathProgress<=0&&pathVelocity<0)pathVelocity=0;
    // Long, smooth coast. Backward velocity uses the exact same physics as forward velocity.
    pathVelocity*=Math.pow(.968,dt/16.67);
    renderPath();
  }else pathVelocity=0;
  pathRaf=requestAnimationFrame(renderPathFrame);
}
function ensurePathLoop(){if(!pathRaf){pathLastFrame=performance.now();pathRaf=requestAnimationFrame(renderPathFrame)}}
function addPathVelocity(v){pathVelocity=Math.max(-.026,Math.min(.026,pathVelocity+v));ensurePathLoop()}
function advancePath(amount){pathProgress=clampPath(pathProgress+amount);renderPath();}
function onPathPointerDown(e){
  if(e.target.closest('button.path-item,#motionStart'))return;
  pathVelocity=0;
  pathDrag={id:e.pointerId,y:e.clientY,start:pathProgress,lastY:e.clientY,lastT:performance.now(),vy:0};
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function onPathPointerMove(e){
  if(!pathDrag||e.pointerId!==pathDrag.id)return;
  const dy=e.clientY-pathDrag.y;if(Math.abs(dy)>3)e.preventDefault();
  const now=performance.now(),dt=Math.max(1,now-pathDrag.lastT);pathDrag.vy=(e.clientY-pathDrag.lastY)/dt;pathDrag.lastY=e.clientY;pathDrag.lastT=now;
  // Larger denominator than V2.7: direct manipulation is controllable while release inertia supplies speed.
  pathProgress=clampPath(pathDrag.start-dy/102);renderPath()
}
function onPathPointerEnd(e){
  if(!pathDrag||e.pointerId!==pathDrag.id)return;
  const d=pathDrag;pathDrag=null;
  const launch=-d.vy/102*1.34;
  if(Math.abs(launch)>.00015){
    pathDirection=launch<0?-1:1;
    // A deliberate backward swipe owns the direction briefly, so walking vibration cannot
    // instantly cancel the user's attempt to return to a book they just passed.
    pathDirectionUntil=performance.now()+1500;
  }
  addPathVelocity(launch)
}
function onOrientation(e){if(!motionOn||viewMode!=='path'||typeof e.gamma!=='number')return;const next=Math.max(-75,Math.min(75,e.gamma));pathYaw+=(next-pathYaw)*.18;renderPath()}
function onMotion(e){
  if(!motionOn||viewMode!=='path')return;
  const a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;
  const mag=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2),delta=Math.abs(mag-lastAccelMag);lastAccelMag=mag;
  const now=performance.now();
  pathMotionEnergy=pathMotionEnergy*.80+Math.max(0,delta-.28)*.20;
  if(now-pathMotionLast>28&&pathMotionEnergy>.13){
    pathMotionLast=now;
    const impulse=Math.min(.00185,.00018+pathMotionEnergy*.00055);
    const dir=now<pathDirectionUntil?pathDirection:1;
    addPathVelocity(impulse*dir);
  }
}
async function enableMotion(){
  try{
    if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function'){const r=await DeviceMotionEvent.requestPermission();if(r!=='granted')throw new Error('denied')}
    if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('denied')}
    motionOn=true;ensurePathLoop();window.addEventListener('devicemotion',onMotion);window.addEventListener('deviceorientation',onOrientation);
    const b=document.querySelector('#motionStart');b.classList.add('is-on');b.textContent='モーション ON';document.querySelector('#pathSub').textContent='歩くと前進。上スワイプで進む／下スワイプで本当に戻る';
  }catch(_){document.querySelector('#pathSub').textContent='上スワイプで進む／下スワイプで戻れます';}
}
document.querySelector('#ringMode').onclick=()=>setViewMode('ring');document.querySelector('#pathMode').onclick=()=>setViewMode('path');
const pathEl=document.querySelector('#bookPath');pathEl.addEventListener('pointerdown',onPathPointerDown);pathEl.addEventListener('pointermove',onPathPointerMove,{passive:false});pathEl.addEventListener('pointerup',onPathPointerEnd);pathEl.addEventListener('pointercancel',()=>pathDrag=null);document.querySelector('#motionStart').onclick=enableMotion;

async function init(){try{const r=await fetch(`${API}/discover`,{cache:'no-store'}),data=await r.json();if(!r.ok||!data?.ok)throw new Error(data?.error||'本を読み込めませんでした。');books=Array.isArray(data.works)?data.works.filter(w=>w?.publicationId):[];document.querySelector('#bookCount').textContent=`${books.length}冊が店内にあります`;if(!books.length){stage.innerHTML='<p style="text-align:center;margin-top:30%;color:#bbb">まだ本がありません。</p>';return;}render();}catch(e){document.querySelector('#bookCount').textContent='棚を読み込めませんでした';stage.innerHTML=`<p style="text-align:center;margin-top:30%;color:#bbb">${esc(e.message)}</p>`;}}
init();
