/* Store navigation is independent of the shelf's gestures and camera. */
(()=>{
 'use strict';
 const icons={home:'<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',book:'<path d="M12 5v16M12 5C8 2 3 4 3 4v15s5-2 9 2c4-4 9-2 9-2V4s-5-2-9 1Z"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',notice:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',settings:'<path d="m10 3-1 3-3 1-3 3 2 2-1 4 3 1 2 4h5l1-3 3-1 3-3-2-2 1-4-3-1-2-4Z"/><circle cx="12" cy="12" r="3"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',arrow:'<path d="m9 5 7 7-7 7"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;
 const entries=[['home','ホーム','home'],['book','自分の本棚','shelf'],['compass','発見','discover'],['notice','お知らせ','notices']];
 const nav=entries.map(([i,label,action])=>`<button type="button" data-store-action="${action}" class="store-nav-item${action==='home'?' is-active':''}"${action==='home'?' aria-current="page"':''}>${icon(i)}<span>${label}</span></button>`).join('');
 const head=document.querySelector('.shop-head');
 head.querySelector('.back')?.remove();
 head.insertAdjacentHTML('beforeend',`<div class="store-head-actions"><button type="button" class="store-icon-button" data-store-action="search" aria-label="本を検索">${icon('search')}</button><button type="button" class="store-account-button" data-store-action="account" aria-label="ゲストのアカウント"><span class="store-avatar">${icon('user')}</span><span id="storeAccountName">ゲスト</span></button><button type="button" class="store-icon-button" id="storeMenuToggle" data-store-action="menu" aria-label="メニューを開く" aria-expanded="false" aria-controls="storeMenuDialog">${icon('menu')}</button></div>`);
 document.body.insertAdjacentHTML('beforeend',`
 <nav class="store-side-nav" aria-label="書店ナビゲーション">${nav}</nav>
 <dialog class="store-ui-dialog store-menu-dialog" id="storeMenuDialog" aria-labelledby="storeMenuTitle"><div class="store-dialog-heading"><div><small>BOOK STORE</small><h2 id="storeMenuTitle">あ箱書店</h2></div><button type="button" class="store-icon-button" data-store-close aria-label="メニューを閉じる">${icon('close')}</button></div><nav class="store-menu-nav" aria-label="メニュー">${nav}</nav><div class="store-menu-links"><a href="#reading-room" data-store-action="shelf">自分の本棚を開く ${icon('arrow')}</a><a href="../studio/">Studioでつくる ${icon('arrow')}</a></div><p class="store-menu-footnote">ここから、次の一冊へ。</p></dialog>
 <dialog class="store-ui-dialog store-search-dialog" id="storeSearchDialog" aria-labelledby="storeSearchTitle"><div class="store-dialog-heading"><div><small>DISCOVER YOUR NEXT BOOK</small><h2 id="storeSearchTitle">本を探す</h2></div><button type="button" class="store-icon-button" data-store-close aria-label="検索を閉じる">${icon('close')}</button></div><form id="storeSearchForm" class="store-search-field" role="search">${icon('search')}<input id="storeSearchInput" type="search" autocomplete="off" placeholder="タイトル、作者、ジャンル" aria-label="本の検索キーワード"><button type="submit">検索</button></form><div class="store-search-caption"><span id="storeSearchCount" role="status" aria-live="polite"></span><span>表紙を選んで詳細へ</span></div><div id="storeSearchResults" class="store-search-results"></div></dialog>
 <dialog class="store-ui-dialog store-account-dialog" id="storeAccountDialog" aria-labelledby="storeAccountTitle"><div class="store-dialog-heading"><div><small>MY ACCOUNT</small><h2 id="storeAccountTitle">アカウント設定</h2></div><button type="button" class="store-icon-button" data-store-close aria-label="アカウントを閉じる">${icon('close')}</button></div><div class="store-profile"><span class="store-avatar store-avatar-large">${icon('user')}</span><div><strong id="storeProfileName">ゲスト</strong><span id="storeProfileState" role="status" aria-live="polite">ログイン状態を確認中…</span></div></div><div class="store-menu-links"><a href="#reading-room" data-store-action="shelf">自分の本棚を開く ${icon('arrow')}</a><a href="../studio/">Studioを開く ${icon('arrow')}</a></div></dialog>
 <dialog class="store-ui-dialog store-small-dialog" id="storeInfoDialog" aria-labelledby="storeInfoTitle"><div class="store-dialog-heading"><div><small id="storeInfoEyebrow"></small><h2 id="storeInfoTitle"></h2></div><button type="button" class="store-icon-button" data-store-close aria-label="閉じる">${icon('close')}</button></div><div id="storeInfoBody"></div></dialog>`);
 const dialogs=[...document.querySelectorAll('.store-ui-dialog')];
 const menu=document.querySelector('#storeMenuDialog');
 let priorFocus=null,priorOverflow='',activeDialog=null,searchBooks=[],searchVisibleCount=24,detailContextSnapshot=null;
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
   const query=document.querySelector('#storeSearchInput').value.trim();
   searchBooks=query?allBooks.filter(w=>matchesBook(w,query)):[];
   searchVisibleCount=24;
   const results=document.querySelector('#storeSearchResults');results.replaceChildren();
   const count=document.querySelector('#storeSearchCount');
   count.textContent=query?`${searchBooks.length}冊${catalogue.hasMore?'（読み込み済みの作品から検索）':''}`:'作品名や作者名を入力してください';
   if(!query){const prompt=document.createElement('p');prompt.className='store-empty-message';prompt.textContent='作品名・作者名・ジャンルから探せます。';results.append(prompt);if(catalogue.hasMore)results.append(catalogueMoreButton());return;}
   if(!searchBooks.length){const p=document.createElement('p');p.className='store-empty-message';p.textContent='見つかりませんでした。別の言葉で探してみてください。';results.append(p);if(catalogue.hasMore)results.append(catalogueMoreButton());return;}
   function appendResults(){
     const end=Math.min(searchVisibleCount,searchBooks.length);
     for(let i=results.querySelectorAll('[data-result]').length;i<end;i++){
       const w=searchBooks[i];
       const b=document.createElement('button');b.type='button';b.className='store-search-book';b.dataset.result=String(i);
       const cover=document.createElement('span');cover.className='store-search-cover';
       if(w.coverUrl){const img=document.createElement('img');img.src=w.coverUrl;img.alt='';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{img.remove();cover.textContent='あ箱';},{once:true});cover.append(img);}else cover.textContent='あ箱';
       const copy=document.createElement('span');copy.className='store-search-copy';
       const title=document.createElement('strong');title.textContent=w.title||'無題';
       const author=document.createElement('span');author.textContent=w.author?.displayName||w.authorName||'作者';
       const genre=document.createElement('small');genre.textContent=genreLabel(w)||'PUBLIC BOOK';
       copy.append(genre,title,author);b.append(cover,copy);results.append(b);
     }
     if(end<searchBooks.length){const more=document.createElement('button');more.type='button';more.className='store-catalogue-more';more.textContent=`検索結果をさらに表示（${end}/${searchBooks.length}）`;more.onclick=()=>{searchVisibleCount=Math.min(end+24,searchBooks.length);more.remove();appendResults()};results.append(more);}
     else if(catalogue.hasMore)results.append(catalogueMoreButton());
   }
   appendResults();
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
 window.addEventListener('bookstore-catalogue-updated',()=>{if(document.querySelector('#storeSearchDialog').open)renderSearch();});
 function openSearch(){openDialog('#storeSearchDialog');renderSearch();document.querySelector('#storeSearchInput').focus();}
 function setActive(action){document.querySelectorAll('.store-nav-item').forEach(b=>{const active=b.dataset.storeAction===action;b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
 window.setStoreNavigationActive=setActive;
 const NOTICE_READ_KEY='ahako:bookstore-notices-read:v1';
 let notices=[],noticeError='',noticeLoading=false;
 function readNoticeIds(){try{const ids=JSON.parse(localStorage.getItem(NOTICE_READ_KEY)||'[]');return new Set(Array.isArray(ids)?ids.map(String):[]);}catch(_){return new Set();}}
 function markNoticeRead(ids){const read=readNoticeIds();ids.forEach(id=>read.add(id));try{localStorage.setItem(NOTICE_READ_KEY,JSON.stringify([...read].slice(-500)));}catch(_){}updateNoticeBadges();}
 function updateNoticeBadges(){const read=readNoticeIds(),count=notices.filter(n=>!read.has(n.id)).length;document.querySelectorAll('[data-store-action="notices"]').forEach(b=>{let dot=b.querySelector('.store-notice-dot');if(!dot){dot=document.createElement('span');dot.className='store-notice-dot';dot.setAttribute('aria-hidden','true');b.append(dot);}dot.hidden=!count;b.setAttribute('aria-label',count?`お知らせ（未読${count}件）`:'お知らせ');});}
 function safeNoticeLink(value){try{const u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch(_){return '';}}
 function renderNotices(){
   const body=document.querySelector('#storeInfoBody');body.replaceChildren();
   if(noticeLoading||noticeError||!notices.length){const p=document.createElement('p');p.className='store-empty-message';p.textContent=noticeLoading?'お知らせを読み込んでいます…':noticeError||'新しいお知らせはありません。';body.append(p);if(noticeError){const retry=document.createElement('button');retry.type='button';retry.className='store-notice-read-all';retry.textContent='もう一度読み込む';retry.onclick=loadNotices;body.append(retry);}return;}
   const allRead=document.createElement('button');allRead.type='button';allRead.className='store-notice-read-all';allRead.textContent='すべて既読にする';allRead.onclick=()=>{markNoticeRead(notices.map(n=>n.id));renderNotices();};body.append(allRead);
   const read=readNoticeIds();notices.forEach((n,i)=>{
     const item=document.createElement('article');item.className='store-notice-item';
     const button=document.createElement('button');button.type='button';button.className='store-notice-title';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',`storeNoticeBody${i}`);
     const date=document.createElement('small');date.textContent=n.date||'お知らせ';
     const title=document.createElement('strong');title.textContent=n.title;
     const badge=document.createElement('span');badge.className='store-notice-new';badge.textContent='NEW';badge.hidden=read.has(n.id);
     button.append(date,title,badge);
     const content=document.createElement('div');content.className='store-notice-body';content.id=`storeNoticeBody${i}`;content.hidden=true;
     const text=document.createElement('p');text.textContent=n.body||'';content.append(text);
     const href=n.href?safeNoticeLink(n.href):'';if(href){const link=document.createElement('a');link.href=href;link.textContent=n.linkLabel||'詳しく見る';content.append(link);}
     button.onclick=()=>{content.hidden=!content.hidden;button.setAttribute('aria-expanded',String(!content.hidden));if(!content.hidden){markNoticeRead([n.id]);badge.hidden=true;}};
     item.append(button,content);body.append(item);
   });
 }
 async function loadNotices(){
   if(noticeLoading)return;noticeLoading=true;noticeError='';if(document.querySelector('#storeInfoDialog').open)renderNotices();
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
   try{const r=await fetch(`${API}/notices`,{cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error();const payload=await r.json();const rows=payload?.notices;if(!payload?.ok||!Array.isArray(rows))throw new Error();const ids=new Set();notices=rows.filter(n=>{if(!n||typeof n.id!=='string'||!n.id||typeof n.title!=='string'||ids.has(n.id))return false;ids.add(n.id);return true;}).map(n=>({id:n.id,title:n.title,date:String(n.date||''),body:String(n.body||''),href:typeof n.href==='string'?n.href:'',linkLabel:String(n.linkLabel||'')}));}
   catch(_){noticeError='お知らせを読み込めませんでした。時間をおいてお試しください。';}
   finally{clearTimeout(timer);noticeLoading=false;updateNoticeBadges();if(document.querySelector('#storeInfoDialog').open)renderNotices();}
 }
 function openNotices(){document.querySelector('#storeInfoEyebrow').textContent='INFORMATION';document.querySelector('#storeInfoTitle').textContent='お知らせ';openDialog('#storeInfoDialog');renderNotices();loadNotices();}
 window.addEventListener('storage',e=>{if(e.key===NOTICE_READ_KEY||e.key===null){updateNoticeBadges();if(document.querySelector('#storeInfoDialog').open)renderNotices();}});
 loadNotices();
 // Own touch activation while sensor-driven path repainting is paused.
 let headPress=null,headActivation=null;
 head.addEventListener('pointerdown',e=>{
   const button=e.target.closest('[data-store-action]');
   if(!button||!['touch','pen'].includes(e.pointerType))return;
   headPress={id:e.pointerId,button,x:e.clientX,y:e.clientY};
   pathUiInteracting=true;pathVelocity=0;pathMotionEnergy=0;lastAccelMag=0;
   button.setPointerCapture?.(e.pointerId);
 });
 head.addEventListener('pointerup',e=>{
   if(!headPress||headPress.id!==e.pointerId)return;
   const press=headPress;headPress=null;
   if(Math.hypot(e.clientX-press.x,e.clientY-press.y)<12){e.preventDefault();headActivation={button:press.button,until:performance.now()+700};press.button.click();}
   pathUiInteracting=false;
 });
 head.addEventListener('click',e=>{if(e.isTrusted&&e.detail>0&&headActivation&&performance.now()<headActivation.until&&e.target.closest('[data-store-action]')===headActivation.button){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
 const cancelHeadPress=()=>{headPress=null;pathUiInteracting=false;};
 head.addEventListener('pointercancel',cancelHeadPress);
 head.addEventListener('lostpointercapture',cancelHeadPress);
 window.addEventListener('blur',cancelHeadPress);
 document.addEventListener('click',e=>{
   const b=e.target.closest('[data-store-action]');if(!b)return;
   switch(b.dataset.storeAction){
     case 'menu':if(menu.open)closeDialog(menu);else openDialog('#storeMenuDialog');break;
     case 'search':case 'discover':openSearch();break;
     case 'account':openDialog('#storeAccountDialog');break;
     case 'shelf':closeDialogs();window.openReadingRoom();setActive('shelf');break;
     case 'home':closeDialogs();if(!dataReady)return;if(window.readingRoomIsOpen?.()){window.closeReadingRoom();setActive('home');break;}closePick();showCentralHall(true);setActive('home');break;
     case 'notices':openNotices();break;
   }
 });
 // Keep search current when the existing async book loader completes.
 new MutationObserver(()=>{if(document.querySelector('#storeSearchDialog').open)renderSearch();}).observe(document.querySelector('#bookCount'),{childList:true});
})();
