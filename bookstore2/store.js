(()=>{'use strict';
const API='https://scene-studio-api.a-hako.workers.dev';
const genres=[['fantasy','ファンタジー'],['romance','恋愛'],['horror','ホラー'],['mystery','ミステリ'],['sf','SF'],['everyday','日常'],['essay','エッセイ'],['other','その他']];
const genreArt={
 fantasy:'<g transform="rotate(35 18 18)"><path d="m18 3 5 6v15H13V9l5-6ZM9 24h18M18 24v7M18 8v12"/><circle cx="18" cy="33" r="2"/></g>',
 romance:'<path d="M18 30 5.5 18C-2 10 8 1 15 8l3 3 3-3c7-7 17 2 9.5 10L18 30Z"/>',
 horror:'<path d="M7 30V16a11 11 0 0 1 22 0v14l-5-3-6 3-6-3-5 3Z"/><path d="M14 16v2m8-2v2m-7 5q3 3 6 0"/>',
 mystery:'<circle cx="15" cy="15" r="10"/><path d="m22 22 9 9M10 14a5 5 0 0 1 5-5"/>',
 sf:'<circle cx="18" cy="18" r="10"/><ellipse cx="18" cy="18" rx="18" ry="5" transform="rotate(-28 18 18)"/><path d="m29 4 1 1M7 31l1 1"/>',
 everyday:'<path d="M7 11h19v11a8 8 0 0 1-8 8h-3a8 8 0 0 1-8-8V11Zm19 2h3a5 5 0 0 1 0 10h-3M4 32h28M12 3v4m6-4v4m6-4v4"/>',
 essay:'<path d="m7 25-2 7 7-2L30 12l-5-5L7 25Zm15-15 5 5M7 25l5 5M24 8l3-3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3l-3 3M18 32h14"/>',
 other:'<circle cx="7" cy="18" r="1.5" fill="currentColor"/><circle cx="18" cy="18" r="1.5" fill="currentColor"/><circle cx="29" cy="18" r="1.5" fill="currentColor"/>'
};
function genreIcon(id){return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${genreArt[id]||genreArt.other}</svg>`;}

const phone=()=>window.matchMedia?.('(max-width: 799px)').matches===true;
const pageSize=()=>phone()?12:24,homeSize=()=>phone()?6:10;
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search);
let works=[],pops=new Map(),shown=pageSize(),view=['home','all','new','pop','owned','later','features'].includes(params.get('view'))?params.get('view'):'home',genre=genres.some(g=>g[0]===params.get('genre'))?params.get('genre'):'',query=params.get('q')||'';
let popsReady=false,userMoved=false,renderAfterClose=false,returnState=null,heroIndex=0,heroIds=[],heroUserSelected=false,heroScrollTimer=null,heroClickUntil=0,heroAutoTimer=null,heroPaused=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true,heroHover=false,heroFocus=false,heroTouch=false,heroVisible=true,heroResizeObserver=null,heroIntersectionObserver=null;
try{const saved=JSON.parse(sessionStorage.getItem('ahako:popstore:return')||'null'),nav=window.performance?.getEntriesByType?.('navigation')?.[0]?.type;let fromPlayer=false;try{const ref=new URL(document.referrer),player=new URL('../',location.href);fromPlayer=ref.origin===player.origin&&ref.pathname===player.pathname;}catch{}if(saved?.url===location.href&&Date.now()-saved.at<7200000&&(nav==='back_forward'||(nav!=='reload'&&fromPlayer))){returnState=saved;shown=Math.max(pageSize(),Number(saved.shown)||pageSize());}else if(saved)sessionStorage.removeItem('ahako:popstore:return');}catch{}
let ownedBooks=[],ownedReady=false,ownedError='',detailTicket=0;
let detailWork=null,popWork=null,popIndex=0,turnTimer=null,scrollLock=null,opener=null,focusStack=[],popDismissTimer=null,popSuppressUntil=0;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function popDesignClasses(d={}){const pick=(key,values,fallback)=>values.includes(d?.[key])?d[key]:fallback;const tilt=Number(d?.tilt??-2);return ['pop-font-'+pick('font',['print','hand','serif'],'print'),'pop-ink-'+pick('ink',['black','blue','red'],'black'),'pop-range-mode','pop-doodle-'+pick('doodle',['none','stars','burst','smile','paws','heart','arrow','flower','book','cat','rays','circle','sparkle'],'none'),'pop-tilt-'+(Number.isInteger(tilt)&&tilt>=-4&&tilt<=4?tilt+4:2)].join(' ');}
function episodeText(w){return [...new Set([w?.episodeLabel,w?.episodeTitle,w?.subtitle].map(v=>String(v||'').trim()).filter(v=>v&&v!==w?.title))].join(' · ');}
function safeImage(raw){try{const u=new URL(raw,API);return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}}
function playerUrl(w){const u=new URL('../',location.href),raw=new URL(`${API}/work/${encodeURIComponent(w.publicationId)}`);raw.searchParams.set('raw','1');u.searchParams.set('src',raw.href);u.searchParams.set('returnTo',location.href);u.searchParams.set('via',['home','all','new','pop','features','later'].includes(view)?'shop2_'+view:'unknown');return u.href;}
function authorUrl(w){const a=w.author||{},u=new URL('../author/',location.href);if(a.slug)u.searchParams.set('u',a.slug);else u.searchParams.set('id',a.authorId||'');return u.href;}
function cover(w){const src=safeImage(w.coverUrl);return src?`<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:`<span class="cover-fallback">${esc(w.title||'あ箱の本')}</span>`;}
function popPreview(w,preferred,paperView='thumb'){const list=pops.get(w.publicationId)||[];if(!list.length)return '';const p=preferred||list[0];return `<button class="pop-preview pop-frame" data-paper-view="${paperView}" data-pop="${esc(w.publicationId)}" aria-label="${esc(w.title)}のPOPを開く（${list.length}枚）">${window.AhakoPopUI?.paperHTML?.(p)||esc(p.text)}</button>`;}

function card(w){return `<article class="book-card" data-work="${esc(w.publicationId)}"><div class="book-art"><button class="cover-button" data-detail="${esc(w.publicationId)}" aria-label="${esc(w.title)}の詳細を開く">${cover(w)}</button>${popPreview(w,undefined,'card')}</div><button class="book-title" data-detail="${esc(w.publicationId)}">${esc(w.title)}</button>${episodeText(w)?`<p class="book-episode">${esc(episodeText(w))}</p>`:''}<p class="book-author">${esc(w.author?.displayName||'作者')}</p><span class="genre-tag">${esc(genres.find(g=>g[0]===w.genre)?.[1]||'その他')}</span></article>`;}
function ownedCard(w){const href=window.AhakoStoreReader.ownedUrl(w.copyId),image=w.coverUrl?.startsWith('blob:')?`<img src="${esc(w.coverUrl)}" alt="" loading="lazy">`:cover(w);return `<article class="book-card"><div class="book-art"><a class="cover-button" data-read href="${esc(href)}">${image}</a></div><a class="book-title" data-read href="${esc(href)}">${esc(w.title||'MY COPY')}</a>${episodeText(w)?`<p class="book-episode">${esc(episodeText(w))}</p>`:''}<p class="book-author">${esc(w.author?.displayName||'作者')}</p><span class="genre-tag">MY COPY</span></article>`;}
function renderFeatures(home){const node=$('#features');if(!node)return;const pools=[{title:'まずは一話、冒険へ',copy:'違う世界へ連れていく、POPのある本。',genres:['fantasy','sf']},{title:'夜に開く本',copy:'静かな時間に、少し不穏な寄り道を。',genres:['horror','mystery']},{title:'日常から、ちょっと寄り道',copy:'恋も笑いも、店員のひと言から。',genres:['everyday','romance','essay','other']}];const rows=pools.map(theme=>({...theme,books:works.filter(w=>theme.genres.includes(w.genre||'other')&&pops.has(w.publicationId)).slice(0,4)})).filter(t=>t.books.length);node.hidden=!(home||view==='features')||!rows.length;$('#featureRows').innerHTML=rows.map(t=>`<section class="theme-shelf"><h3>${esc(t.title)}</h3><p class="muted">${esc(t.copy)}</p><div class="books feature-books ${home&&t.books.length>2&&t.books.length%2?'feature-odd':''}" style="--feature-cols:${t.books.length}">${t.books.map(card).join('')}</div></section>`).join('');$('#featureEmpty').hidden=rows.length>0||view!=='features';}
async function loadOwned(){ownedReady=false;ownedError='';try{ownedBooks=await window.AhakoStoreReader.owned();}catch(error){ownedBooks=[];ownedError=error.message||'本棚を読み込めませんでした。';}ownedReady=true;if(view==='owned')render();}
function measure(id,event){window.AhakoWorkMeasurement?.track(id,event,{surface:'bookstore2',entry:view});}
function purchaseUrl(w){const u=new URL(playerUrl(w));u.searchParams.set('shop','mycopy');return u.href;}
async function showSeries(w,seriesId,ticket){if(!/^series_[a-f0-9]{32}$/i.test(seriesId))return;try{const data=await request('/series/'+seriesId+'/navigation?workId='+encodeURIComponent(w.publicationId));if(ticket!==detailTicket)return;const links=[['前の話',data.series?.previous],['次の話',data.series?.next]].flatMap(([label,row])=>{const book=works.find(b=>b.publicationId===row?.workId);return book?[`<button type="button" class="text-button" data-detail="${esc(book.publicationId)}">${label}：${esc(episodeText(book)||book.title)} →</button>`]:[];});if(links.length&&$('#detailOffer'))$('#detailOffer').insertAdjacentHTML('afterend','<nav class="series-shop-links" aria-label="シリーズの前後の話">'+links.join('')+'</nav>');}catch{}}
function refreshLaterButton(){const button=$('#detailLater');if(!button||!detailWork)return;const saved=window.AhakoStoreReader?.later().some(w=>w.publicationId===detailWork.publicationId);button.textContent=saved?'✓ あとで読むに保存済み':'あとで読む';button.setAttribute('aria-pressed',String(saved));}
async function showOffer(w,ticket){try{const data=await request('/bookstore2/offer?publicationId='+encodeURIComponent(w.publicationId));if(ticket!==detailTicket||detailWork?.publicationId!==w.publicationId)return;const offer=data.offer,node=$('#detailOffer');if(!node)return;const payable=offer?.available&&['copy','purchase','reader_price'].includes(offer.mode)&&offer.status==='active'&&Number.isInteger(offer.amount)&&offer.amount>=100;const free=offer?.available&&offer.mode==='free';showSeries(w,offer?.seriesId,ticket);let text=payable?(offer.mode==='reader_price'?'100円から、価格を決めて購入':`¥${offer.amount.toLocaleString('ja-JP')}`):free?'無料でMY COPYを受け取れます':'この作品は公開Playerで読めます';node.innerHTML=`<strong>${esc(text)}</strong><p>${payable?'購入すると、この作品のMY COPYを自分の本棚に受け取れます。':free?'自分の本棚に入れて、また読み返せます。':'MY COPYの販売・受け取り設定は現在ありません。'}</p>${payable||free?`<a class="button primary" data-read data-measure-offer="${payable?'purchase_click':'receive_click'}" href="${esc(purchaseUrl(w))}">${payable?'この一冊を購入する':'MY COPYを受け取る'} →</a><small>次の画面で${payable?'金額・販売条件と支払方法':'受け取り内容'}を確認できます。</small>`:''}`;}catch{if(ticket===detailTicket&&$('#detailOffer'))$('#detailOffer').innerHTML='<p>価格・受け取り条件を確認できませんでした。公開Playerからも確認できます。</p>';}}
function render(preserve=false){
 preserve=preserve&&userMoved&&scrollY>8;
 const anchor=preserve?[...document.querySelectorAll('#books .book-card')].find(c=>{const r=c.getBoundingClientRect();return r.bottom>0&&r.top<(window.innerHeight||Infinity);}):null;
 const anchorId=anchor?.dataset.work,anchorTop=anchor?.getBoundingClientRect().top;
 const q=query.trim().normalize('NFKC').toLocaleLowerCase('ja');
 const laterIds=new Set(window.AhakoStoreReader?.later().map(w=>w.publicationId)||[]);
 const ownedFiltered=ownedBooks.filter(w=>!q||[w.title,w.episode,w.episodeTitle,w.subtitle,w.author?.displayName].join(' ').normalize('NFKC').toLocaleLowerCase('ja').includes(q));
 const isHome=view==='home'&&!q&&!genre,limit=isHome?homeSize():shown;
 const filtered=works.filter(w=>(view!=='later'||laterIds.has(w.publicationId))&&(!genre||w.genre===genre)&&(!q||[w.title,w.episodeLabel,w.episodeTitle,w.subtitle,w.description,w.author?.displayName].join(' ').normalize('NFKC').toLocaleLowerCase('ja').includes(q))&&(view!=='pop'||pops.has(w.publicationId)));
 $('#books').innerHTML=view==='owned'?ownedFiltered.slice(0,shown).map(ownedCard).join(''):filtered.slice(0,limit).map(card).join('');$('#resultCount').textContent=`${filtered.length}作品`;$('#empty').hidden=filtered.length>0;$('#more').hidden=limit>=filtered.length;$('#more').textContent=isHome?'作品一覧を見る →':'続きを見る';
 $('#listTitle').textContent=q?'検索結果':view==='pop'?'店員のおすすめ':genre?`${genres.find(g=>g[0]===genre)[1]}の本`:view==='all'?'作品一覧':'新しく届いた本';$('#catalogueEyebrow').textContent=view==='pop'?'STAFF PICKS':q||genre||view==='all'?'BROWSE BOOKS':'NEW ARRIVALS';
 if(view==='owned'||view==='later'){const count=view==='owned'?ownedFiltered.length:filtered.length;$('#listTitle').textContent=view==='owned'?'もっている本':'あとで読む';$('#catalogueEyebrow').textContent=view==='owned'?'MY BOOKS':'READ LATER';$('#resultCount').textContent=count+'冊';$('#empty').hidden=count>0;$('#empty').textContent=view==='owned'?(ownedReady?(ownedError||(q?'条件に合う本が見つかりませんでした。':'まだ本がありません。購入・受け取ったMY COPYがここに並びます。')):'本棚を読み込んでいます…'):'公開中の保存した作品はまだありません。作品詳細の「あとで読む」から追加できます。';$('#more').hidden=shown>=count;}else $('#empty').textContent='条件に合う作品が見つかりませんでした。';
 $('#ownedHelp').hidden=view!=='owned';const unavailable=window.AhakoStoreReader?.later().filter(w=>!works.some(p=>p.publicationId===w.publicationId))||[];$('#laterUnavailable').hidden=view!=='later'||!unavailable.length;$('#laterUnavailable').innerHTML=unavailable.map(w=>`<p>${esc(w.title||'保存した本')} <small>現在公開一覧にありません</small> <button type="button" class="text-button" data-remove-later="${esc(w.publicationId)}">保存を外す</button></p>`).join('');$('#genres').hidden=['owned','later','features','pop'].includes(view);$('#catalogue').hidden=view==='features';
 $('#activeFilter').textContent=[q?`「${query.trim()}」`:'',genre?genres.find(g=>g[0]===genre)[1]:''].filter(Boolean).join(' / ');
 document.querySelectorAll('[data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 document.querySelectorAll('[data-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.genre===genre)));
 const staffFilters=$('#staffGenreFilters');staffFilters.hidden=view!=='pop';if(view==='pop'){const available=new Set(works.filter(w=>pops.has(w.publicationId)).map(w=>w.genre));staffFilters.innerHTML=[['','すべて'],...genres.filter(([id])=>available.has(id))].map(([id,label])=>`<button type="button" data-staff-genre="${id}" aria-pressed="${String(genre===id)}" aria-controls="books">${label}</button>`).join('');}else staffFilters.replaceChildren();
 const home=view==='home'&&!q&&!genre,featured=works.filter(w=>pops.has(w.publicationId));
 $('#heroLoading').hidden=!home||popsReady;renderHero(home,featured);
 $('#recommendations').hidden=!home||!featured.length;$('#picks').innerHTML=featured.slice(0,phone()?4:5).map(card).join('');
 document.querySelectorAll('img').forEach(img=>{if(img.classList.contains('pop-stamp'))return;img.onerror=()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'cover-fallback',textContent:'あ箱の本'}));};});
 renderFeatures(home);window.AhakoPopUI?.fitAll?.();
 const url=new URL(location.href);for(const [k,v]of Object.entries({q:query,genre,view:view==='home'?'':view})){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}history.replaceState(null,'',url);
 if(anchorId&&!scrollLock){const next=[...document.querySelectorAll('#books .book-card')].find(c=>c.dataset.work===anchorId);if(next)window.scrollBy(0,next.getBoundingClientRect().top-anchorTop);}
}
function updateHeroControls(){
 document.querySelectorAll('[data-hero-index]').forEach((b,i)=>b.setAttribute('aria-current',i===heroIndex?'true':'false'));
}
function stopHeroAuto(){clearTimeout(heroAutoTimer);heroAutoTimer=null;}
function armHeroAuto(){
 stopHeroAuto();if(heroPaused||heroHover||heroFocus||heroTouch||!heroVisible||document.hidden||scrollLock||$('#hero').hidden||heroIds.length<2)return;
 heroAutoTimer=setTimeout(()=>{heroAutoTimer=null;moveHero(heroIndex+1,false);armHeroAuto();},6000);
}
function moveHero(index,manual=true){
 const n=heroIds.length;if(!n)return;heroIndex=((index%n)+n)%n;if(manual)heroUserSelected=true;
 const track=$('#heroTrack'),physical=n>1?(index<0?0:index>=n?n+1:heroIndex+1):0;
 if(track?.scrollTo)track.scrollTo({left:physical*track.clientWidth,behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 updateHeroControls();armHeroAuto();
}
function renderHero(home){
 stopHeroAuto();heroResizeObserver?.disconnect();heroIntersectionObserver?.disconnect();clearTimeout(heroScrollTimer);
 const hero=$('#hero'),oldId=heroIds[heroIndex];hero.classList.add('hero-compact');
 const slides=works.map(w=>{const selected=(pops.get(w.publicationId)||[]).filter(p=>(p.showcase??'staff')!=='none').sort((a,b)=>Number(a.showcaseOrder??0)-Number(b.showcaseOrder??0)||Number(a.order)-Number(b.order))[0];return selected?{...w,_showcasePop:selected}:null;}).filter(Boolean).sort((a,b)=>Number(a._showcasePop.showcaseOrder??0)-Number(b._showcasePop.showcaseOrder??0)||a.publicationId.localeCompare(b.publicationId)).slice(0,8);
 hero.hidden=!home||!slides.length;if(hero.hidden){heroIds=[];heroIndex=0;return;}
 heroIds=slides.map(w=>w.publicationId);heroIndex=heroUserSelected&&heroIds.includes(oldId)?heroIds.indexOf(oldId):0;heroHover=false;heroFocus=false;heroTouch=false;heroVisible=true;
 const slide=(w,i,clone=false)=>{const episode=[...new Set([w.episodeLabel,w.episodeTitle].map(v=>String(v||'').trim()).filter(Boolean))].join(' · ');return `<article class="hero-slide" ${clone?'aria-hidden="true" inert':`role="group" aria-roledescription="スライド" aria-label="${i+1} / ${slides.length}"`}><button class="hero-image" data-detail="${esc(w.publicationId)}" aria-label="${esc([w.title,episode].filter(Boolean).join(' ／ '))}の詳細を開く">${cover(w)}<span class="hero-kicker">${w._showcasePop.showcase==='new-series'?'NEW SERIAL / 新連載':'STAFF PICK / 店員が選ぶ一冊'}</span><span class="hero-caption"><strong class="hero-title">${esc(w.title)}</strong>${episode?`<span class="hero-episode">${esc(episode)}</span>`:''}${w.author?.displayName?`<span class="hero-author">${esc(w.author.displayName)}</span>`:''}</span></button><div class="hero-pop-wrap">${popPreview(w,w._showcasePop)}</div></article>`;};
 const looping=slides.length>1;
 hero.innerHTML=`<div id="heroTrack" class="hero-track" tabindex="0" role="region" aria-label="運営が選んだ作品。左右にスワイプして切り替え"><div class="hero-slides">${looping?slide(slides.at(-1),slides.length-1,true):''}${slides.map((w,i)=>slide(w,i)).join('')}${looping?slide(slides[0],0,true):''}</div></div><div class="hero-controls" ${looping?'':'hidden'}><div class="hero-dots" aria-label="紹介する作品を選ぶ">${slides.map((w,i)=>`<button data-hero-index="${i}" aria-label="${i+1}冊目：${esc([w.title,episodeText(w)].filter(Boolean).join(' ／ '))}" aria-current="false"></button>`).join('')}</div></div>`;
 const track=$('#heroTrack');let lastWidth=track.clientWidth;
 const jump=()=>{track.scrollLeft=(looping?heroIndex+1:0)*track.clientWidth;};jump();
 track.addEventListener('scroll',()=>{stopHeroAuto();clearTimeout(heroScrollTimer);heroScrollTimer=setTimeout(()=>{if(!track.clientWidth)return;const physical=Math.round(track.scrollLeft/track.clientWidth),n=heroIds.length;heroIndex=looping?((physical-1)%n+n)%n:0;if(looping&&(physical===0||physical===n+1))jump();updateHeroControls();armHeroAuto();},150);},{passive:true});
 track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveHero(heroIndex+(e.key==='ArrowRight'?1:-1));}});
 let gesture=null;track.addEventListener('pointerdown',e=>{heroTouch=true;stopHeroAuto();gesture={x:e.clientX,y:e.clientY};},{passive:true});
 track.addEventListener('pointerup',e=>{if(gesture&&Math.abs(e.clientX-gesture.x)>30&&Math.abs(e.clientX-gesture.x)>Math.abs(e.clientY-gesture.y)){heroClickUntil=Date.now()+350;heroUserSelected=true;}gesture=null;heroTouch=false;armHeroAuto();},{passive:true});
 track.addEventListener('pointercancel',()=>{gesture=null;heroTouch=false;armHeroAuto();});
 hero.onpointerenter=e=>{if(e.pointerType==='mouse'){heroHover=true;stopHeroAuto();}};hero.onpointerleave=()=>{heroHover=false;armHeroAuto();};
 document.querySelectorAll('[data-hero-index]').forEach(b=>b.onclick=()=>moveHero(Number(b.dataset.heroIndex)));
 if(typeof ResizeObserver!=='undefined'){heroResizeObserver=new ResizeObserver(()=>{if(track.clientWidth!==lastWidth){lastWidth=track.clientWidth;jump();}});heroResizeObserver.observe(track);}
 if(typeof IntersectionObserver!=='undefined'){heroIntersectionObserver=new IntersectionObserver(entries=>{heroVisible=entries[0]?.isIntersecting===true;armHeroAuto();},{threshold:.2});heroIntersectionObserver.observe(hero);}
 updateHeroControls();armHeroAuto();
}
async function request(path){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);try{const r=await fetch(API+path,{signal:controller.signal,cache:'no-store'}),data=await r.json();if(!r.ok||!data.ok)throw new Error('データを取得できませんでした');return data;}finally{clearTimeout(timer);}}
async function load(){ $('#retry').hidden=true;$('#loadStatus').textContent='本を並べています…';try{const d=await request('/discover');if(!Array.isArray(d.works))throw new Error('作品一覧の応答を確認できませんでした');works=d.works.filter(w=>/^[A-Za-z0-9_-]{6,80}$/.test(w.publicationId));render();$('#loadStatus').textContent=works.length?'':'公開中の作品はまだありません。';await loadPops();if(returnState){window.scrollTo(0,Math.max(0,Number(returnState.y)||0));returnState=null;try{sessionStorage.removeItem('ahako:popstore:return');}catch{}}else if(!userMoved&&!scrollLock)window.scrollTo(0,0);}catch(e){$('#loadStatus').textContent=e.name==='AbortError'?'接続に時間がかかっています。もう一度お試しください。':'本を読み込めませんでした。通信環境をご確認のうえ、もう一度お試しください。';$('#retry').hidden=false;}}
async function loadPops(){
 let failures=0;
 for(let i=0;i<works.length;i+=16){
  try{const d=await request('/bookstore2/pops?publicationIds='+encodeURIComponent(works.slice(i,i+16).map(w=>w.publicationId).join(',')));
   for(const [id,rows]of Object.entries(d.pops||{})){const valid=Array.isArray(rows)?rows.filter(p=>p&&typeof p.text==='string'&&['sticky-yellow','sticky-pink','sticky-blue','paper-cardboard','paper-kraft','paper-white','paper-grid','paper-transparent'].includes(p.style)):[];if(valid.length)pops.set(id,valid);else pops.delete(id);}
  }catch{failures++;}
 }
 popsReady=true;if(document.querySelector('dialog[open]'))renderAfterClose=true;else render(true);
 $('#popStatus').hidden=!failures;$('#popStatusText').textContent=failures?'店員POPを一部読み込めませんでした。作品はそのままお読みいただけます。':'';
}
function paintPop(){
 const rows=pops.get(popWork.publicationId)||[],p=rows[popIndex];if(!p)return;
 $('#popTitle').innerHTML='<span class="pop-work-title">'+esc(popWork.title)+'</span>'+(episodeText(popWork)?'<span class="pop-work-episode">'+esc(episodeText(popWork))+'</span>':'');
 const paper=$('#popPaper');paper.className='pop-paper pop-frame';paper.dataset.paperView='modal';paper.innerHTML=window.AhakoPopUI?.paperHTML?.(p,true)||esc(p.text);window.AhakoPopUI?.fitAll?.();
 $('#popPosition').textContent=`${popIndex+1} / ${rows.length} 枚`;
 paper.tabIndex=rows.length===1?-1:0;paper.setAttribute('aria-disabled',String(rows.length===1));paper.setAttribute('aria-label',rows.length===1?'店員POP':popIndex===rows.length-1?'最初のPOPへ戻る':'次のPOPをめくる');
}

function openPop(id){const w=works.find(w=>w.publicationId===id);if(!w||!pops.get(id)?.length)return;measure(id,'pop_open');popWork=w;popIndex=0;paintPop();openDialog($('#popDialog'));}
function resetPopMotion(){const stage=$('#popStage');stage.classList.remove('pop-leave','pop-arrive');}
function flipPop(delta){if(turnTimer||popDismissTimer||!popWork)return;const rows=pops.get(popWork.publicationId)||[];if(rows.length<2)return;
 const next=(popIndex+delta+rows.length)%rows.length;
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){popIndex=next;paintPop();return;}
 const stage=$('#popStage');resetPopMotion();stage.classList.add('pop-leave');turnTimer=setTimeout(()=>{popIndex=next;paintPop();stage.classList.remove('pop-leave');stage.classList.add('pop-arrive');turnTimer=setTimeout(()=>{resetPopMotion();turnTimer=null;},250);},130);
}
function dismissPop(){const dialog=$('#popDialog');if(popDismissTimer||!dialog.open)return;clearTimeout(turnTimer);turnTimer=null;resetPopMotion();popSuppressUntil=Date.now()+450;
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){dialog.close();return;}
 dialog.classList.add('pop-dismissing');popDismissTimer=setTimeout(()=>{popDismissTimer=null;dialog.close();},160);
}
function installPopSwipe(){const dialog=$('#popDialog');let gesture=null;
 dialog.addEventListener('pointerdown',e=>{if(e.isPrimary===false||(e.button!==undefined&&e.button!==0)||e.target.closest?.('[data-close],#popRead'))return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:false};});
 dialog.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(dy< -10&&Math.abs(dy)>Math.abs(dx)*1.2){gesture.dragging=true;popSuppressUntil=Date.now()+450;if(e.cancelable)e.preventDefault();dialog.style.setProperty('--pop-drag-y',Math.max(-180,dy*.65)+'px');dialog.classList.add('pop-dragging');}},{passive:false});
 const release=e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,up=gesture.dragging&&dy< -60&&Math.abs(dy)>Math.abs(dx)*1.2;gesture=null;dialog.classList.remove('pop-dragging');dialog.style.removeProperty('--pop-drag-y');if(up)dismissPop();};
 dialog.addEventListener('pointerup',release);dialog.addEventListener('pointercancel',()=>{gesture=null;dialog.classList.remove('pop-dragging');dialog.style.removeProperty('--pop-drag-y');});
 dialog.addEventListener('keydown',e=>{if(e.target!==$('#popPaper')&&e.target!==dialog)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();flipPop(e.key==='ArrowRight'?1:-1);}});
 dialog.addEventListener('close',()=>{gesture=null;dialog.classList.remove('pop-dragging','pop-dismissing');dialog.style.removeProperty('--pop-drag-y');clearTimeout(popDismissTimer);popDismissTimer=null;resetPopMotion();});
}
function lockScroll(){stopHeroAuto();if(scrollLock)return;scrollLock={y:scrollY,style:document.body.getAttribute('style')};document.body.style.cssText+=`;position:fixed;top:-${scrollY}px;left:0;right:0;width:100%;`;}
function unlockScroll(){if(!scrollLock)return;const saved=scrollLock;scrollLock=null;if(saved.style===null)document.body.removeAttribute('style');else document.body.setAttribute('style',saved.style);window.scrollTo(0,saved.y);opener?.focus({preventScroll:true});armHeroAuto();}
function openDialog(dialog){if(!scrollLock)opener=document.activeElement;focusStack.push(document.activeElement);lockScroll();dialog.showModal();window.AhakoPopUI?.fitAll?.();}
function detail(id){const ticket=++detailTicket;const w=works.find(w=>w.publicationId===id);if(!w)return;measure(id,'detail_open');detailWork=w;$('#detailContent').innerHTML=`<div class="detail-layout"><div class="detail-cover">${cover(w)}</div><div><h2 id="detailTitle">${esc(w.title)}</h2><p class="book-author"><a href="${esc(authorUrl(w))}">${esc(w.author?.displayName||'作者')} →</a></p><p class="muted">${esc([w.episodeLabel,w.episodeTitle,w.subtitle].filter(Boolean).join(' · '))}</p></div></div><p class="detail-description">${esc(w.description||'この本を開いて、物語をお楽しみください。')}</p><div class="detail-actions"><a class="button" data-read href="${esc(playerUrl(w))}">まず読んでみる →</a><button class="button" id="detailLater" type="button" aria-pressed="false">あとで読む</button>${pops.has(id)?`<button class="button" data-pop="${esc(id)}">店員POPを見る</button>`:''}</div><section id="detailOffer" class="detail-offer" aria-live="polite"><p>価格・受け取り条件を確認しています…</p></section><p id="detailMessage" class="muted" role="status"></p>`;refreshLaterButton();showOffer(w,ticket);if(!$('#detailDialog').open)openDialog($('#detailDialog'));}
$('#genreButtons').innerHTML=genres.map(([id,label])=>`<button data-genre="${id}" aria-pressed="false"><span class="genre-icon" aria-hidden="true">${genreIcon(id)}</span><small>${label}</small></button>`).join('');
$('#search').value=query;$('#search').addEventListener('input',e=>{userMoved=true;if(view==='features')view='all';query=e.target.value;shown=pageSize();render();});$('#retry').onclick=load;$('#more').onclick=()=>{if(view==='home'&&!query&&!genre){view='all';shown=pageSize();render();$('#catalogue').scrollIntoView({block:'start'});}else{shown+=pageSize();render();}};
$('#staffGenreFilters').addEventListener('click',e=>{const button=e.target.closest('[data-staff-genre]');if(!button||view!=='pop')return;userMoved=true;genre=button.dataset.staffGenre;shown=pageSize();render();[...$('#staffGenreFilters').querySelectorAll('button')].find(b=>b.dataset.staffGenre===genre)?.focus({preventScroll:true});});
$('#popRetry').onclick=loadPops;$('#popPaper').onclick=()=>{if(Date.now()>=popSuppressUntil)flipPop(1);};installPopSwipe();$('#popRead').onclick=()=>{const id=popWork.publicationId;$('#popDialog').close();measure(id,'pop_to_detail');if(!$('#detailDialog').open)detail(id);};
$('#detailContent').addEventListener('click',e=>{if(!e.target.closest('#detailLater')||!detailWork)return;try{const saved=window.AhakoStoreReader.toggleLater(detailWork);measure(detailWork.publicationId,saved?'later_add':'later_remove');$('#detailMessage').textContent=saved?'あとで読むに保存しました。':'あとで読むから外しました。';refreshLaterButton();if(view==='later')renderAfterClose=true;}catch(error){$('#detailMessage').textContent=error.message||'保存できませんでした。';}});
 document.addEventListener('click',e=>{if(e.target.closest('[data-owned-shelf]'))try{localStorage.setItem('ahako:bookshelf:last-tab','owned');}catch{}});
 window.addEventListener?.('storage',e=>{if(e.key==='ahako:read-later:v1'){refreshLaterButton();if(view==='later')render(true);}if(e.key?.startsWith('ahako:bookshelf:')&&view==='owned')loadOwned();});
document.addEventListener('click',e=>{const remove=e.target.closest('[data-remove-later]');if(remove){const work=window.AhakoStoreReader?.later().find(w=>w.publicationId===remove.dataset.removeLater);if(work){try{window.AhakoStoreReader.toggleLater(work);render(true);}catch{}}}if(!e.target.closest('#menu,#menuToggle')){$('#menu').hidden=true;$('#menuToggle').setAttribute('aria-expanded','false');}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#menu').hidden=true;$('#menuToggle').setAttribute('aria-expanded','false');}});
document.addEventListener('click',e=>{if(!e.target.closest('[data-browse-genres]'))return;e.preventDefault();userMoved=true;view='all';genre='';query='';$('#search').value='';shown=pageSize();render();$('#genres').scrollIntoView({block:'start'});});
$('#menuToggle').onclick=()=>{const open=$('#menu').hidden;$('#menu').hidden=!open;$('#menuToggle').setAttribute('aria-expanded',String(open));};
 document.addEventListener('click',e=>{if(e.target.closest('#heroTrack')&&Date.now()<heroClickUntil){e.preventDefault();return;}if(e.target.closest('[data-read]')){if(detailWork&&e.target.closest('#detailContent'))measure(detailWork.publicationId,e.target.closest('[data-measure-offer]')?.dataset.measureOffer||'read_click');try{sessionStorage.setItem('ahako:popstore:return',JSON.stringify({url:location.href,y:scrollLock?.y??scrollY,shown,at:Date.now()}));}catch{}document.querySelectorAll('dialog[open]').forEach(d=>d.close());unlockScroll();focusStack=[];return;}const vb=e.target.closest('[data-view]'),gb=e.target.closest('[data-genre]'),db=e.target.closest('[data-detail]'),pb=e.target.closest('[data-pop]');if(pb){e.preventDefault();openPop(pb.dataset.pop);return;}if(vb){$('#menu').hidden=true;$('#menuToggle').setAttribute('aria-expanded','false');userMoved=true;view=vb.dataset.view;genre='';query='';$('#search').value='';shown=pageSize();render();if(view==='owned')loadOwned();window.scrollTo(0,0);}if(gb){userMoved=true;genre=gb.dataset.genre;view='all';shown=pageSize();render();$('#catalogue').scrollIntoView({block:'start'});}if(db)detail(db.dataset.detail);});
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{if(d.id==='popDialog'){clearTimeout(turnTimer);turnTimer=null;}const prior=focusStack.pop();if(!document.querySelector('dialog[open]')){unlockScroll();if(renderAfterClose){renderAfterClose=false;render(true);}}else prior?.focus({preventScroll:true});});});
 $('#hero').addEventListener('focusin',()=>{heroFocus=true;stopHeroAuto();});$('#hero').addEventListener('focusout',()=>{setTimeout(()=>{heroFocus=!!document.activeElement?.closest?.('#hero');armHeroAuto();},0);});
 document.addEventListener('error',e=>{if(e.target?.classList?.contains('pop-stamp'))e.target.remove();},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHeroAuto();else armHeroAuto();});
 window.addEventListener?.('pagehide',stopHeroAuto);window.addEventListener?.('pageshow',()=>{armHeroAuto();if(view==='owned')loadOwned();});
 try{history.scrollRestoration='manual';}catch{}
 $('#heroLoading').hidden=view!=='home'||!!genre||!!query;
 if(!returnState)window.scrollTo(0,0);
 for(const event of ['wheel','touchmove'])document.addEventListener(event,()=>{userMoved=true;},{passive:true});
 document.addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key))userMoved=true;});
 window.addEventListener?.('resize',()=>window.AhakoPopUI?.fitAll?.());document.fonts?.ready?.then(()=>window.AhakoPopUI?.fitAll?.());
 load();loadOwned();
})();
