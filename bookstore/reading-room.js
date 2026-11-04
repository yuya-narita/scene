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
  if(opening||!room.hidden||routeTransitioning||!dataReady)return;opening=true;const token=++epoch;
  await Promise.all([syncOwnedBooks(),preloadPathZone('./reading-room-v2319.webp')]);
  if(token!==epoch){opening=false;return;}
  closePick();spinToken++;pathVelocity=0;pathDrag=null;hallDrag=null;viewMode='reading-room';roomId='reading-room';hallShelfRing=false;
  renderOwnedRoom();room.hidden=false;store.classList.add('reading-room-active');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===epoch)room.classList.add('is-visible');}));opening=false;
  room.querySelector('#leaveReadingRoom').focus({preventScroll:true});
 };
 window.closeReadingRoom=()=>{
  ++epoch;opening=false;closePick();books=allBooks.slice();showCentralHall(false);store.classList.remove('reading-room-active');room.classList.remove('is-visible');
  setTimeout(()=>{if(!room.classList.contains('is-visible'))room.hidden=true;},960);
 };
 room.querySelector('#leaveReadingRoom').addEventListener('click',window.closeReadingRoom);
 room.addEventListener('click',e=>{const hit=e.target.closest('[data-reading-index]');if(hit){index=Number(hit.dataset.readingIndex);pick(books[index]);}});
 for(const type of ['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend'])room.addEventListener(type,e=>e.stopPropagation());
 document.getElementById('enterReadingRoom')?.addEventListener('click',e=>{e.stopPropagation();window.openReadingRoom();});
 document.addEventListener('click',e=>{const link=e.target.closest('a[href="../bookshelf/"]');if(!link||link.classList.contains('brand'))return;e.preventDefault();document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.style.overflow='';window.openReadingRoom();});
 window.addEventListener('keydown',e=>{if(!room.hidden&&e.key==='Escape'&&picked.hidden)window.closeReadingRoom();});
 window.addEventListener('pageshow',()=>{if(!room.hidden)syncOwnedBooks().then(renderOwnedRoom);});
 function resumeReadingRoom(){if(location.hash==='#reading-room'&&dataReady){window.openReadingRoom();history.replaceState(null,'',location.pathname+location.search);}}
 new MutationObserver(resumeReadingRoom).observe(document.getElementById('bookCount'),{childList:true,subtree:true});
 window.addEventListener('pageshow',resumeReadingRoom);resumeReadingRoom();
})();
