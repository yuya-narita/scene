(()=>{'use strict';
const API='https://scene-studio-api.a-hako.workers.dev';
const genres=[['fantasy','ファンタジー','⚔'],['romance','恋愛','♡'],['horror','ホラー','♧'],['mystery','ミステリ','⌕'],['sf','SF','♄'],['everyday','日常','☕'],['essay','エッセイ','✎'],['other','その他','…']];
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search);
let works=[],pops=new Map(),shown=24,view=['home','all','new','pop'].includes(params.get('view'))?params.get('view'):'home',genre=genres.some(g=>g[0]===params.get('genre'))?params.get('genre'):'',query=params.get('q')||'';
let renderAfterClose=false,returnState=null,heroIndex=0,heroIds=[],heroUserSelected=false,heroScrollTimer=null,heroClickUntil=0,heroAutoTimer=null,heroPaused=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true,heroHover=false,heroFocus=false,heroTouch=false,heroVisible=true,heroResizeObserver=null,heroIntersectionObserver=null;
try{const saved=JSON.parse(sessionStorage.getItem('ahako:popstore:return')||'null');if(saved?.url===location.href&&Date.now()-saved.at<7200000){returnState=saved;shown=Math.max(24,Number(saved.shown)||24);}}catch{}
let detailWork=null,popWork=null,popIndex=0,turnTimer=null,scrollLock=null,opener=null,focusStack=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function popDesignClasses(d={}){const pick=(key,values,fallback)=>values.includes(d?.[key])?d[key]:fallback;const tilt=Number(d?.tilt??-2);return ['pop-font-'+pick('font',['print','hand','serif'],'print'),'pop-ink-'+pick('ink',['black','blue','red'],'black'),'pop-accent-'+pick('accent',['none','underline','marker'],'none'),'pop-doodle-'+pick('doodle',['none','stars','burst','smile','paws'],'none'),'pop-tilt-'+(Number.isInteger(tilt)&&tilt>=-4&&tilt<=4?tilt+4:2)].join(' ');}
function episodeText(w){return [...new Set([w?.episodeLabel,w?.episodeTitle,w?.subtitle].map(v=>String(v||'').trim()).filter(v=>v&&v!==w?.title))].join(' · ');}
function safeImage(raw){try{const u=new URL(raw,API);return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}}
function playerUrl(w){const u=new URL('../',location.href),raw=new URL(`${API}/work/${encodeURIComponent(w.publicationId)}`);raw.searchParams.set('raw','1');u.searchParams.set('src',raw.href);u.searchParams.set('returnTo',location.href);return u.href;}
function authorUrl(w){const a=w.author||{},u=new URL('../author/',location.href);if(a.slug)u.searchParams.set('u',a.slug);else u.searchParams.set('id',a.authorId||'');return u.href;}
function cover(w){const src=safeImage(w.coverUrl);return src?`<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:`<span class="cover-fallback">${esc(w.title||'あ箱の本')}</span>`;}
function popPreview(w,preferred){const list=pops.get(w.publicationId)||[];if(!list.length)return '';const p=preferred||list[0];return `<button class="pop-preview ${esc(p.style)} ${popDesignClasses(p.design)}" data-pop="${esc(w.publicationId)}" aria-label="${esc(w.title)}のPOPを開く"><strong><span class="pop-words">${esc([...p.text].slice(0,45).join(''))}${[...p.text].length>45?'…':''}</span></strong><small>店員POP · ${list.length}枚をめくる ↗</small><span class="pop-doodle" aria-hidden="true"></span></button>`;}
function card(w){return `<article class="book-card" data-work="${esc(w.publicationId)}"><button class="cover-button" data-detail="${esc(w.publicationId)}" aria-label="${esc(w.title)}の詳細を開く">${cover(w)}</button><button class="book-title" data-detail="${esc(w.publicationId)}">${esc(w.title)}</button>${episodeText(w)?`<p class="book-episode">${esc(episodeText(w))}</p>`:''}<p class="book-author">${esc(w.author?.displayName||'作者')}</p><span class="genre-tag">${esc(genres.find(g=>g[0]===w.genre)?.[1]||'その他')}</span>${popPreview(w)}</article>`;}
function render(preserve=false){
 const anchor=preserve?[...document.querySelectorAll('#books .book-card')].find(c=>{const r=c.getBoundingClientRect();return r.bottom>0&&r.top<(window.innerHeight||Infinity);}):null;
 const anchorId=anchor?.dataset.work,anchorTop=anchor?.getBoundingClientRect().top;
 const q=query.trim().normalize('NFKC').toLocaleLowerCase('ja');
 const filtered=works.filter(w=>(!genre||w.genre===genre)&&(!q||[w.title,w.episodeLabel,w.episodeTitle,w.subtitle,w.description,w.author?.displayName].join(' ').normalize('NFKC').toLocaleLowerCase('ja').includes(q))&&(view!=='pop'||pops.has(w.publicationId)));
 $('#books').innerHTML=filtered.slice(0,shown).map(card).join('');$('#resultCount').textContent=`${filtered.length}作品`;$('#empty').hidden=filtered.length>0;$('#more').hidden=shown>=filtered.length;
 $('#listTitle').textContent=q?'検索結果':genre?`${genres.find(g=>g[0]===genre)[1]}の本`:view==='pop'?'店員のおすすめ':view==='all'?'作品一覧':'新しく届いた本';$('#catalogueEyebrow').textContent=view==='pop'?'STAFF PICKS':q||genre||view==='all'?'BROWSE BOOKS':'NEW ARRIVALS';
 $('#activeFilter').textContent=[q?`「${query.trim()}」`:'',genre?genres.find(g=>g[0]===genre)[1]:''].filter(Boolean).join(' / ');
 document.querySelectorAll('[data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 document.querySelectorAll('[data-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.genre===genre)));
 const home=view==='home'&&!q&&!genre,featured=works.filter(w=>pops.has(w.publicationId));
 renderHero(home,featured);
 $('#recommendations').hidden=!home||!featured.length;$('#picks').innerHTML=featured.slice(0,5).map(card).join('');
 document.querySelectorAll('img').forEach(img=>{img.onerror=()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'cover-fallback',textContent:'あ箱の本'}));};});
 const url=new URL(location.href);for(const [k,v]of Object.entries({q:query,genre,view:view==='home'?'':view})){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}history.replaceState(null,'',url);
 if(anchorId&&!scrollLock){const next=[...document.querySelectorAll('#books .book-card')].find(c=>c.dataset.work===anchorId);if(next)window.scrollBy(0,next.getBoundingClientRect().top-anchorTop);}
}
function updateHeroControls(){
 document.querySelectorAll('[data-hero-index]').forEach((b,i)=>b.setAttribute('aria-current',i===heroIndex?'true':'false'));
 const counter=$('#heroCount');if(counter){counter.textContent=`${heroIndex+1} / ${heroIds.length}`;counter.setAttribute('aria-live',heroPaused?'polite':'off');}
 for(const id of ['heroPrev','heroNext'])if($('#'+id))$('#'+id).disabled=heroIds.length<2;
 const play=$('#heroPlay');if(play){play.textContent=heroPaused?'自動再生':'一時停止';play.setAttribute('aria-label',heroPaused?'紹介欄の自動再生を開始':'紹介欄の自動再生を一時停止');}
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
 const hero=$('#hero'),oldId=heroIds[heroIndex];
 const slides=works.map(w=>{const selected=(pops.get(w.publicationId)||[]).filter(p=>(p.showcase??'staff')!=='none').sort((a,b)=>Number(a.showcaseOrder??0)-Number(b.showcaseOrder??0)||Number(a.order)-Number(b.order))[0];return selected?{...w,_showcasePop:selected}:null;}).filter(Boolean).sort((a,b)=>Number(a._showcasePop.showcaseOrder??0)-Number(b._showcasePop.showcaseOrder??0)||a.publicationId.localeCompare(b.publicationId)).slice(0,8);
 hero.hidden=!home||!slides.length;if(hero.hidden){heroIds=[];heroIndex=0;return;}
 heroIds=slides.map(w=>w.publicationId);heroIndex=heroUserSelected&&heroIds.includes(oldId)?heroIds.indexOf(oldId):0;heroHover=false;heroFocus=false;heroTouch=false;heroVisible=true;
 const slide=(w,i,clone=false)=>`<article class="hero-slide" ${clone?'aria-hidden="true" inert':`role="group" aria-roledescription="スライド" aria-label="${i+1} / ${slides.length}"`}><button class="hero-image" data-detail="${esc(w.publicationId)}" aria-label="${esc([w.title,episodeText(w)].filter(Boolean).join(' ／ '))}の詳細を開く">${cover(w)}</button><div class="hero-copy"><p class="eyebrow">${w._showcasePop.showcase==='new-series'?'NEW SERIAL / 新連載':'STAFF PICK / 店員が選ぶ一冊'}</p><h2>${esc(w.title)}</h2>${episodeText(w)?`<p class="hero-episode">${esc(episodeText(w))}</p>`:''}<p class="book-author">${esc(w.author?.displayName||'作者')}</p><p class="hero-description">${esc(w.description||'あ箱で、新しい物語との出会いを。')}</p>${popPreview(w,w._showcasePop)}<button class="button primary" data-detail="${esc(w.publicationId)}">作品を見る →</button></div></article>`;
 const looping=slides.length>1;
 hero.innerHTML=`<div id="heroTrack" class="hero-track" tabindex="0" role="region" aria-label="運営が選んだ作品。左右にスワイプして切り替え"><div class="hero-slides">${looping?slide(slides.at(-1),slides.length-1,true):''}${slides.map((w,i)=>slide(w,i)).join('')}${looping?slide(slides[0],0,true):''}</div></div><div class="hero-controls" ${looping?'':'hidden'}><button id="heroPrev" class="hero-arrow" aria-label="前のおすすめ作品">←</button><div class="hero-dots" aria-label="紹介する作品を選ぶ">${slides.map((w,i)=>`<button data-hero-index="${i}" aria-label="${i+1}冊目：${esc([w.title,episodeText(w)].filter(Boolean).join(' ／ '))}" aria-current="false"></button>`).join('')}</div><span id="heroCount" class="muted"></span><button id="heroNext" class="hero-arrow" aria-label="次のおすすめ作品">→</button><button id="heroPlay" class="hero-play">一時停止</button></div>`;
 const track=$('#heroTrack');let lastWidth=track.clientWidth;
 const jump=()=>{track.scrollLeft=(looping?heroIndex+1:0)*track.clientWidth;};jump();
 track.addEventListener('scroll',()=>{stopHeroAuto();clearTimeout(heroScrollTimer);heroScrollTimer=setTimeout(()=>{if(!track.clientWidth)return;const physical=Math.round(track.scrollLeft/track.clientWidth),n=heroIds.length;heroIndex=looping?((physical-1)%n+n)%n:0;if(looping&&(physical===0||physical===n+1))jump();updateHeroControls();armHeroAuto();},150);},{passive:true});
 track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveHero(heroIndex+(e.key==='ArrowRight'?1:-1));}});
 let gesture=null;track.addEventListener('pointerdown',e=>{heroTouch=true;stopHeroAuto();gesture={x:e.clientX,y:e.clientY};},{passive:true});
 track.addEventListener('pointerup',e=>{if(gesture&&Math.abs(e.clientX-gesture.x)>30&&Math.abs(e.clientX-gesture.x)>Math.abs(e.clientY-gesture.y)){heroClickUntil=Date.now()+350;heroUserSelected=true;}gesture=null;heroTouch=false;armHeroAuto();},{passive:true});
 track.addEventListener('pointercancel',()=>{gesture=null;heroTouch=false;armHeroAuto();});
 hero.onpointerenter=e=>{if(e.pointerType==='mouse'){heroHover=true;stopHeroAuto();}};hero.onpointerleave=()=>{heroHover=false;armHeroAuto();};
 $('#heroPrev').onclick=()=>moveHero(heroIndex-1);$('#heroNext').onclick=()=>moveHero(heroIndex+1);
 $('#heroPlay').onclick=()=>{heroPaused=!heroPaused;heroFocus=false;heroHover=false;updateHeroControls();armHeroAuto();};
 document.querySelectorAll('[data-hero-index]').forEach(b=>b.onclick=()=>moveHero(Number(b.dataset.heroIndex)));
 if(typeof ResizeObserver!=='undefined'){heroResizeObserver=new ResizeObserver(()=>{if(track.clientWidth!==lastWidth){lastWidth=track.clientWidth;jump();}});heroResizeObserver.observe(track);}
 if(typeof IntersectionObserver!=='undefined'){heroIntersectionObserver=new IntersectionObserver(entries=>{heroVisible=entries[0]?.isIntersecting===true;armHeroAuto();},{threshold:.2});heroIntersectionObserver.observe(hero);}
 updateHeroControls();armHeroAuto();
}
async function request(path){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);try{const r=await fetch(API+path,{signal:controller.signal,cache:'no-store'}),data=await r.json();if(!r.ok||!data.ok)throw new Error('データを取得できませんでした');return data;}finally{clearTimeout(timer);}}
async function load(){ $('#retry').hidden=true;$('#loadStatus').textContent='本を並べています…';try{const d=await request('/discover');if(!Array.isArray(d.works))throw new Error('作品一覧の応答を確認できませんでした');works=d.works.filter(w=>/^[A-Za-z0-9_-]{6,80}$/.test(w.publicationId));render();$('#loadStatus').textContent=works.length?'':'公開中の作品はまだありません。';await loadPops();if(returnState){window.scrollTo(0,Math.max(0,Number(returnState.y)||0));returnState=null;try{sessionStorage.removeItem('ahako:popstore:return');}catch{}}}catch(e){$('#loadStatus').textContent=e.name==='AbortError'?'接続に時間がかかっています。もう一度お試しください。':'本を読み込めませんでした。通信環境をご確認のうえ、もう一度お試しください。';$('#retry').hidden=false;}}
async function loadPops(){
 let failures=0;
 for(let i=0;i<works.length;i+=16){
  try{const d=await request('/bookstore2/pops?publicationIds='+encodeURIComponent(works.slice(i,i+16).map(w=>w.publicationId).join(',')));
   for(const [id,rows]of Object.entries(d.pops||{})){const valid=Array.isArray(rows)?rows.filter(p=>p&&typeof p.text==='string'&&['sticky-yellow','sticky-pink','sticky-blue'].includes(p.style)):[];if(valid.length)pops.set(id,valid);else pops.delete(id);}
  }catch{failures++;}
 }
 if(document.querySelector('dialog[open]'))renderAfterClose=true;else render(true);
 $('#popStatus').hidden=!failures;$('#popStatusText').textContent=failures?'店員POPを一部読み込めませんでした。作品はそのままお読みいただけます。':'';
}
function paintPop(){
 const rows=pops.get(popWork.publicationId)||[],p=rows[popIndex];if(!p)return;
 $('#popTitle').textContent=[popWork.title,episodeText(popWork)].filter(Boolean).join(' ／ ');$('#popText').innerHTML='<span class="pop-words">'+esc(p.text)+'</span>';$('#popByline').textContent=p.displayName||'あ箱書店 店員';$('#popPaper').className='pop-paper '+p.style+' '+popDesignClasses(p.design);
 $('#popPosition').textContent=`${popIndex+1} / ${rows.length} 枚`;
 $('#popPrev').disabled=popIndex===0;$('#popNext').hidden=rows.length===1;$('#popPrev').hidden=rows.length===1;
 $('#popNext').textContent=popIndex===rows.length-1?'最初のPOPへ戻る ↺':'次のPOPをめくる →';
 $('#popPaper').setAttribute('aria-label',rows.length===1?'店員POP':popIndex===rows.length-1?'最初のPOPへ戻る':'次のPOPをめくる');
}
function openPop(id){const w=works.find(w=>w.publicationId===id);if(!w||!pops.get(id)?.length)return;popWork=w;popIndex=0;paintPop();openDialog($('#popDialog'));}
function flipPop(delta){if(turnTimer||!popWork)return;const rows=pops.get(popWork.publicationId)||[];if(rows.length<2)return;popIndex=(popIndex+delta+rows.length)%rows.length;
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){paintPop();return;}
 $('#popPaper').classList.add('turning');turnTimer=setTimeout(()=>{paintPop();turnTimer=null;},240);
}
function lockScroll(){stopHeroAuto();if(scrollLock)return;scrollLock={y:scrollY,style:document.body.getAttribute('style')};document.body.style.cssText+=`;position:fixed;top:-${scrollY}px;left:0;right:0;width:100%;`;}
function unlockScroll(){if(!scrollLock)return;const saved=scrollLock;scrollLock=null;if(saved.style===null)document.body.removeAttribute('style');else document.body.setAttribute('style',saved.style);window.scrollTo(0,saved.y);opener?.focus({preventScroll:true});armHeroAuto();}
function openDialog(dialog){if(!scrollLock)opener=document.activeElement;focusStack.push(document.activeElement);lockScroll();dialog.showModal();}
function detail(id){const w=works.find(w=>w.publicationId===id);if(!w)return;detailWork=w;$('#detailContent').innerHTML=`<div class="detail-layout"><div class="detail-cover">${cover(w)}</div><div><h2 id="detailTitle">${esc(w.title)}</h2><p class="book-author"><a href="${esc(authorUrl(w))}">${esc(w.author?.displayName||'作者')} →</a></p><p class="muted">${esc([w.episodeLabel,w.episodeTitle,w.subtitle].filter(Boolean).join(' · '))}</p></div></div><p class="detail-description">${esc(w.description||'この本を開いて、物語をお楽しみください。')}</p><div class="detail-actions"><a class="button primary" data-read href="${esc(playerUrl(w))}">作品を読む →</a>${pops.has(id)?`<button class="button" data-pop="${esc(id)}">店員POPを見る</button>`:''}</div><p class="muted">購入・MY COPYは、作品内の案内からご利用いただけます。</p>`;openDialog($('#detailDialog'));}
$('#genreButtons').innerHTML=genres.map(([id,label,icon])=>`<button data-genre="${id}" aria-pressed="false"><span aria-hidden="true">${icon}</span><small>${label}</small></button>`).join('');
$('#search').value=query;$('#search').addEventListener('input',e=>{query=e.target.value;shown=24;render();});$('#retry').onclick=load;$('#more').onclick=()=>{shown+=24;render();};
$('#popRetry').onclick=loadPops;$('#popNext').onclick=()=>flipPop(1);$('#popPrev').onclick=()=>flipPop(-1);$('#popPaper').onclick=()=>flipPop(1);$('#popRead').onclick=()=>{const id=popWork.publicationId;$('#popDialog').close();if(!$('#detailDialog').open)detail(id);};
$('#menuToggle').onclick=()=>{const open=$('#menu').hidden;$('#menu').hidden=!open;$('#menuToggle').setAttribute('aria-expanded',String(open));};
 document.addEventListener('click',e=>{if(e.target.closest('#heroTrack')&&Date.now()<heroClickUntil){e.preventDefault();return;}if(e.target.closest('[data-read]')){try{sessionStorage.setItem('ahako:popstore:return',JSON.stringify({url:location.href,y:scrollLock?.y??scrollY,shown,at:Date.now()}));}catch{}document.querySelectorAll('dialog[open]').forEach(d=>d.close());unlockScroll();focusStack=[];return;}const vb=e.target.closest('[data-view]'),gb=e.target.closest('[data-genre]'),db=e.target.closest('[data-detail]'),pb=e.target.closest('[data-pop]');if(pb){e.preventDefault();openPop(pb.dataset.pop);return;}if(vb){view=vb.dataset.view;genre='';query='';$('#search').value='';shown=24;render();}if(gb){genre=gb.dataset.genre;view='all';shown=24;render();$('#catalogue').scrollIntoView({block:'start'});}if(db)detail(db.dataset.detail);});
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{if(d.id==='popDialog'){clearTimeout(turnTimer);turnTimer=null;}const prior=focusStack.pop();if(!document.querySelector('dialog[open]')){unlockScroll();if(renderAfterClose){renderAfterClose=false;render(true);}}else prior?.focus({preventScroll:true});});});
 $('#hero').addEventListener('focusin',()=>{heroFocus=true;stopHeroAuto();});$('#hero').addEventListener('focusout',()=>{setTimeout(()=>{heroFocus=!!document.activeElement?.closest?.('#hero');armHeroAuto();},0);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHeroAuto();else armHeroAuto();});
 window.addEventListener?.('pagehide',stopHeroAuto);window.addEventListener?.('pageshow',armHeroAuto);
 load();
})();
