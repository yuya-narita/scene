/* Store navigation is independent of the shelf's gestures and camera. */
(()=>{
 'use strict';
 const icons={home:'<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',book:'<path d="M12 5v16M12 5C8 2 3 4 3 4v15s5-2 9 2c4-4 9-2 9-2V4s-5-2-9 1Z"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',event:'<path d="m3 7 4 4 5-7 5 7 4-4-2 13H5Z"/>',settings:'<path d="m10 3-1 3-3 1-3 3 2 2-1 4 3 1 2 4h5l1-3 3-1 3-3-2-2 1-4-3-1-2-4Z"/><circle cx="12" cy="12" r="3"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',arrow:'<path d="m9 5 7 7-7 7"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;
 const entries=[['home','ホーム','home'],['book','本棚','shelf'],['compass','発見','discover'],['event','イベント','events'],['settings','設定','settings']];
 const nav=entries.map(([i,label,action])=>`<button type="button" data-store-action="${action}" class="store-nav-item${action==='home'?' is-active':''}"${action==='home'?' aria-current="page"':''}>${icon(i)}<span>${label}</span></button>`).join('');
 const head=document.querySelector('.shop-head');
 head.querySelector('.back')?.remove();
 head.insertAdjacentHTML('beforeend',`<div class="store-head-actions"><button type="button" class="store-icon-button" data-store-action="search" aria-label="本を検索">${icon('search')}</button><button type="button" class="store-account-button" data-store-action="account" aria-label="ゲストのアカウント"><span class="store-avatar">${icon('user')}</span><span id="storeAccountName">ゲスト</span></button><button type="button" class="store-icon-button" id="storeMenuToggle" data-store-action="menu" aria-label="メニューを開く" aria-expanded="false" aria-controls="storeMenuDialog">${icon('menu')}</button></div>`);
 document.body.insertAdjacentHTML('beforeend',`
 <nav class="store-side-nav" aria-label="書店ナビゲーション">${nav}</nav>
 <dialog class="store-ui-dialog store-menu-dialog" id="storeMenuDialog" aria-labelledby="storeMenuTitle"><div class="store-dialog-heading"><div><small>BOOK STORE</small><h2 id="storeMenuTitle">あ箱書店</h2></div><button type="button" class="store-icon-button" data-store-close aria-label="メニューを閉じる">${icon('close')}</button></div><nav class="store-menu-nav" aria-label="メニュー">${nav}</nav><div class="store-menu-links"><a href="../bookshelf/">自分の本棚を開く ${icon('arrow')}</a><a href="../studio/">Studioでつくる ${icon('arrow')}</a></div><p class="store-menu-footnote">ここから、次の一冊へ。</p></dialog>
 <dialog class="store-ui-dialog store-search-dialog" id="storeSearchDialog" aria-labelledby="storeSearchTitle"><div class="store-dialog-heading"><div><small>DISCOVER YOUR NEXT BOOK</small><h2 id="storeSearchTitle">本を探す</h2></div><button type="button" class="store-icon-button" data-store-close aria-label="検索を閉じる">${icon('close')}</button></div><form id="storeSearchForm" class="store-search-field" role="search">${icon('search')}<input id="storeSearchInput" type="search" autocomplete="off" placeholder="タイトル、作者、ジャンル" aria-label="本の検索キーワード"><button type="submit">検索</button></form><div class="store-search-caption"><span id="storeSearchCount" role="status" aria-live="polite"></span><span>表紙を選んで詳細へ</span></div><div id="storeSearchResults" class="store-search-results"></div></dialog>
 <dialog class="store-ui-dialog store-account-dialog" id="storeAccountDialog" aria-labelledby="storeAccountTitle"><div class="store-dialog-heading"><div><small>MY ACCOUNT</small><h2 id="storeAccountTitle">アカウント</h2></div><button type="button" class="store-icon-button" data-store-close aria-label="アカウントを閉じる">${icon('close')}</button></div><div class="store-profile"><span class="store-avatar store-avatar-large">${icon('user')}</span><div><strong>ゲスト</strong><span>ログインしていません</span></div></div><div class="store-menu-links"><a href="../bookshelf/">自分の本棚を開く ${icon('arrow')}</a><a href="../studio/">Studioを開く ${icon('arrow')}</a></div></dialog>
 <dialog class="store-ui-dialog store-small-dialog" id="storeInfoDialog" aria-labelledby="storeInfoTitle"><div class="store-dialog-heading"><div><small id="storeInfoEyebrow"></small><h2 id="storeInfoTitle"></h2></div><button type="button" class="store-icon-button" data-store-close aria-label="閉じる">${icon('close')}</button></div><div id="storeInfoBody"></div></dialog>`);
 const dialogs=[...document.querySelectorAll('.store-ui-dialog')];
 const menu=document.querySelector('#storeMenuDialog');
 let priorFocus=null,priorOverflow='',activeDialog=null,searchBooks=[],detailContextSnapshot=null;
 function restoreDialog(d){if(activeDialog!==d)return;activeDialog=null;document.body.style.overflow=priorOverflow;document.querySelector('#storeMenuToggle').setAttribute('aria-expanded','false');priorFocus?.focus({preventScroll:true});}
 function closeDialog(d){if(d.open)d.close();restoreDialog(d);}
 function closeDialogs(){dialogs.forEach(d=>{if(d.open)closeDialog(d)});}
 function openDialog(id){
   closeDialogs();priorFocus=document.activeElement;priorOverflow=document.body.style.overflow;
   activeDialog=document.querySelector(id);document.body.style.overflow='hidden';activeDialog.showModal();
   document.querySelector('#storeMenuToggle').setAttribute('aria-expanded',String(id==='#storeMenuDialog'));
 }
 dialogs.forEach(d=>{
   d.addEventListener('close',()=>{if(!d.open)restoreDialog(d);});
   d.addEventListener('click',e=>{if(e.target.closest('[data-store-close]'))closeDialog(d);else if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});
 });
 function normalized(value){return String(value??'').normalize('NFKC').toLocaleLowerCase().trim();}
 function matchesBook(w,query){const haystack=normalized([w.title,w.author?.displayName,w.authorName,w.genre,genreLabel(w),w.episodeLabel,w.episodeTitle].filter(Boolean).join(' '));return normalized(query).split(/\s+/).filter(Boolean).every(word=>haystack.includes(word));}
 function renderSearch(){
   const query=document.querySelector('#storeSearchInput').value;
   searchBooks=allBooks.filter(w=>matchesBook(w,query));
   const results=document.querySelector('#storeSearchResults');results.replaceChildren();
   document.querySelector('#storeSearchCount').textContent=`${searchBooks.length}冊`;
   if(!searchBooks.length){const p=document.createElement('p');p.className='store-empty-message';p.textContent=dataReady?'見つかりませんでした。別の言葉で探してみてください。':'本を読み込んでいます。少し待ってから検索してください。';results.append(p);return;}
   searchBooks.forEach((w,i)=>{
     const b=document.createElement('button');b.type='button';b.className='store-search-book';b.dataset.result=String(i);
     const cover=document.createElement('span');cover.className='store-search-cover';
     if(w.coverUrl){const img=document.createElement('img');img.src=w.coverUrl;img.alt='';img.loading='lazy';img.addEventListener('error',()=>{img.remove();cover.textContent='あ箱';},{once:true});cover.append(img);}else cover.textContent='あ箱';
     const copy=document.createElement('span');copy.className='store-search-copy';
     const title=document.createElement('strong');title.textContent=w.title||'無題';
     const author=document.createElement('span');author.textContent=w.author?.displayName||w.authorName||'作者';
     const genre=document.createElement('small');genre.textContent=genreLabel(w)||'PUBLIC BOOK';
     copy.append(genre,title,author);b.append(cover,copy);results.append(b);
   });
 }
 function selectResult(i){
   const w=searchBooks[i];if(!w)return;
   closeDialogs();
   detailContextSnapshot={books,index};books=searchBooks.slice();index=i;pick(w);
 }
 // Returning from search restores the previous browsing collection and focused book.
 new MutationObserver(()=>{
   if(picked.hidden&&detailContextSnapshot){const saved=detailContextSnapshot;detailContextSnapshot=null;books=saved.books;index=saved.index;if(viewMode==='ring'&&!stage.hidden)render();}
 }).observe(picked,{attributes:true,attributeFilter:['hidden']});
 document.querySelector('#storeSearchInput').addEventListener('input',renderSearch);
 document.querySelector('#storeSearchForm').addEventListener('submit',e=>{e.preventDefault();renderSearch();});
 document.querySelector('#storeSearchResults').addEventListener('click',e=>{const b=e.target.closest('[data-result]');if(b)selectResult(Number(b.dataset.result));});
 function openSearch(){openDialog('#storeSearchDialog');renderSearch();document.querySelector('#storeSearchInput').focus();}
 function setActive(action){document.querySelectorAll('.store-nav-item').forEach(b=>{const active=b.dataset.storeAction===action;b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
 function info(kind){
   const settings=kind==='settings';
   document.querySelector('#storeInfoEyebrow').textContent=settings?'PREFERENCES':'EVENTS';
   document.querySelector('#storeInfoTitle').textContent=settings?'設定':'イベント';
   document.querySelector('#storeInfoBody').innerHTML=settings?'<div class="store-setting-row"><div><strong>360°モーション</strong><p>端末の動きに合わせた視点移動を停止します。</p></div><button type="button" id="storeStopMotion">すべて停止</button></div><p class="store-muted">再開する時は、店内の「360°モーション」ボタンからONにできます。</p>':'<div class="store-empty-message"><p>次の出会いを準備中。</p><span>現在、ご案内できるイベントはありません。</span></div>';
   if(settings)document.querySelector('#storeStopMotion').onclick=async()=>{if(roomMotionOn)await toggleRoomMotion();if(hallMotionOn)await toggleHallMotion();if(motionOn)disableMotion();document.querySelector('#storeStopMotion').textContent='停止しました';};
   openDialog('#storeInfoDialog');
 }
 document.addEventListener('click',e=>{
   const b=e.target.closest('[data-store-action]');if(!b)return;
   switch(b.dataset.storeAction){
     case 'menu':if(menu.open)closeDialog(menu);else openDialog('#storeMenuDialog');break;
     case 'search':case 'discover':openSearch();break;
     case 'account':openDialog('#storeAccountDialog');break;
     case 'shelf':location.assign(new URL('../bookshelf/',location.href));break;
     case 'home':closeDialogs();if(!dataReady)return;closePick();showCentralHall(true);setActive('home');break;
     case 'events':info('events');break;
     case 'settings':info('settings');break;
   }
 });
 // Keep search current when the existing async book loader completes.
 new MutationObserver(()=>{if(document.querySelector('#storeSearchDialog').open)renderSearch();}).observe(document.querySelector('#bookCount'),{childList:true});
})();
