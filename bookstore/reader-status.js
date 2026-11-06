/* V2.35.8 — branching reader roles, growth and equipped-book tie breakers. */
(()=>{
 'use strict';
/* Reader role rules v2.35.8. Pure data and deterministic classification. */
const ReaderRoleRules = (()=>{
 const ids=['fantasy','romance','horror','mystery','sf','everyday','essay','other'];
 const thresholds=[0,3,8,16,30,60];
 const solo={
  fantasy:['幻想の訪問者','異界の旅人','星を巡る司書','竜の書架の守り手','幾千世界の継承者','果てなき幻想の編纂者'],
  romance:['恋文の拾い手','心を結ぶ読者','想いの渡し守','恋の書架の守り手','幾千の縁の継承者','永遠の恋物語の編纂者'],
  horror:['夜の訪問者','闇を歩く読者','怪異の蒐集家','禁書の書架の守り手','深淵の語りの継承者','終わらない夜の編纂者'],
  mystery:['謎の拾い手','手がかりの探訪者','謎を編む探究者','迷宮書架の守り手','幾重の真相の継承者','解かれぬ謎の編纂者'],
  sf:['未来の訪問者','星間の読書家','未来を読む航行士','銀河書架の守り手','遥かな未来の継承者','時空の物語の編纂者'],
  everyday:['日々の拾い手','街角の読書家','日常を拾う観測者','小さな書架の守り手','名もなき日々の継承者','かけがえない日常の編纂者'],
  essay:['言葉の拾い手','思索の散歩者','言葉を灯す思索家','思索書架の守り手','幾千の声の継承者','生きた言葉の編纂者'],
  other:['余白の訪問者','自由な読書家','境界の探訪者','名もなき書架の守り手','まだ見ぬ物語の継承者','枠なき世界の編纂者']
 };
 // All unordered pairs have a hand-written path; no name-based lottery.
 const pairs={
  'fantasy|romance':['星と恋の旅人','月下の恋文使い','誓いの書架の守り手','星降る恋物語の継承者'],
  'fantasy|horror':['影の森の旅人','幽幻の探訪者','魔境書架の守り手','光と闇の物語の継承者'],
  'fantasy|mystery':['迷宮の旅人','魔導の謎解き人','封印書架の守り手','失われた伝承の継承者'],
  'fantasy|sf':['星界の旅人','魔法と科学の航行士','星界書架の守り手','異界と宇宙の継承者'],
  'fantasy|everyday':['不思議な街の旅人','日常の魔法の拾い手','夢見る街の司書','小さな奇跡の継承者'],
  'fantasy|essay':['伝承の旅人','神話の思索家','叡智の書架の守り手','夢と思想の継承者'],
  'fantasy|other':['異境の旅人','名もなき魔導書の探訪者','未知の書架の守り手','未踏世界の継承者'],
  'romance|horror':['夜想の旅人','秘めた想いの語り手','紅い書架の守り手','愛と戦慄の継承者'],
  'romance|mystery':['秘密の恋の旅人','心の暗号の探究者','秘密書架の守り手','恋と真相の継承者'],
  'romance|sf':['星待ちの旅人','時空を結ぶ恋文使い','星恋書架の守り手','銀河を越える想いの継承者'],
  'romance|everyday':['木漏れ日の旅人','街角の恋文使い','陽だまり書架の守り手','何気ない愛の継承者'],
  'romance|essay':['想いの拾い手','心の余白の思索家','想いの書架の守り手','心と言葉の継承者'],
  'romance|other':['縁の旅人','名もなき恋の探訪者','縁の書架の守り手','形なき想いの継承者'],
  'horror|mystery':['夜霧の旅人','怪異の謎を追う人','怪奇書架の守り手','恐怖と真相の継承者'],
  'horror|sf':['虚空の旅人','宇宙の怪異の探訪者','暗黒星雲の司書','未知なる恐怖の継承者'],
  'horror|everyday':['夕暮れの旅人','日常の裏側の観測者','黄昏書架の守り手','隣り合う怪異の継承者'],
  'horror|essay':['夜更けの思索者','闇の言葉の拾い手','夜話書架の守り手','畏れと思索の継承者'],
  'horror|other':['境の夜の旅人','名もなき怪異の蒐集家','異聞書架の守り手','語られぬ夜の継承者'],
  'mystery|sf':['時の迷宮の旅人','未来の謎の探究者','時空迷宮の司書','因果と真相の継承者'],
  'mystery|everyday':['路地裏の旅人','日々の謎の拾い手','街角探偵の司書','日常に潜む真相の継承者'],
  'mystery|essay':['問いの旅人','言葉の迷宮の思索家','問いの書架の守り手','謎と思想の継承者'],
  'mystery|other':['未解の旅人','枠なき謎の探究者','未解書架の守り手','名もなき真相の継承者'],
  'sf|everyday':['明日の街の旅人','未来の日常の観測者','明日書架の守り手','遠い日常の継承者'],
  'sf|essay':['未来への思索者','星を仰ぐ哲学者','星思書架の守り手','未来と思想の継承者'],
  'sf|other':['未踏宙域の旅人','未知の星の航行士','未踏星図の司書','枠なき未来の継承者'],
  'everyday|essay':['散歩道の読書家','日々を綴る思索家','暮らしの書架の守り手','日々と言葉の継承者'],
  'everyday|other':['寄り道の旅人','日常の余白の拾い手','寄り道書架の守り手','名もなき景色の継承者'],
  'essay|other':['余白の思索者','自由な言葉の拾い手','自由思想の司書','枠なき言葉の継承者']
 };
 const broad={
  balanced:['書架の散歩者','多彩な物語の旅人','境界を渡る読者','交差する書架の司書','幾つもの世界の継承者','万象の物語の編纂者'],
  explorer:['寄り道の読書家','新しい棚の探訪者','未踏の書架の冒険者','物語の地図を描く人','果てなき書架の航行士','まだ見ぬ世界の編纂者'],
  curator:['一冊を飾る読者','物語の紹介人','書架を彩る選書家','出会いを結ぶ司書','物語の灯台守','世界を結ぶ大選書家']
 };
 const starter=['はじまりの読者'];
 function genre(book){const id=String(book?.genre||book?.metadata?.genre||'').trim().toLowerCase();return ids.includes(id)?id:'';}
 function unique(books){const seen=new Set();return (Array.isArray(books)?books:[]).filter(b=>{
  if(!b)return false;
  const key=(String(b.publicationId||'').startsWith('owned:')?'':b.publicationId)||b.workId||b.bookId||[b.title,b.episodeLabel,b.episodeTitle,b.author?.authorId||b.author?.displayName||b.authorName||''].join('|');
  if(seen.has(key))return false;seen.add(key);return true;
 });}
 function classify({books=[],preferences=[],featured=null,recommendation=null,later=[]}={}){
  const library=unique(books),count=library.length;
  let growthThresholds=thresholds,stage=thresholds.reduce((v,n,i)=>count>=n?i:v,0);
  const counts=new Map();library.forEach(b=>{const g=genre(b);if(g)counts.set(g,(counts.get(g)||0)+1);});
  const pref=[...new Set(preferences.filter(g=>ids.includes(g)))];
  if(!counts.size&&count)pref.forEach(g=>counts.set(g,1));
  const signals=[genre(featured),genre(recommendation),...pref,...ids].filter(Boolean);
  const ranked=[...counts].sort((a,b)=>b[1]-a[1]||signals.indexOf(a[0])-signals.indexOf(b[0]));
  const total=ranked.reduce((n,p)=>n+p[1],0),breadth=ranked.length;
  let branch,title;
  if(!count&&!pref.length){
   // No genre signals yet: keep the entry title stable.
   return {title:starter[0],branch:'starter',stage:0,count:0,next:3,breadth:0};
  }
  if(breadth>=4&&ranked[0][1]/total<.5){
   const ownedGenres=new Set(ranked.map(p=>p[0]));
   const exploring=(Array.isArray(later)?later:[]).some(b=>genre(b)&&!ownedGenres.has(genre(b)));
   const curated=featured&&recommendation&&genre(featured)&&genre(recommendation)&&genre(featured)!==genre(recommendation);
   growthThresholds=[4,8,16,30,60,100];stage=growthThresholds.reduce((v,n,i)=>count>=n?i:v,0);
   branch=exploring?'explorer':curated?'curator':'balanced';title=broad[branch][stage];
  }else if(ranked.length>=2&&ranked[1][1]/total>=.25&&(ranked[0][1]+ranked[1][1])/total>=.65){
   const pair=ranked.slice(0,2).map(p=>p[0]).sort((a,b)=>ids.indexOf(a)-ids.indexOf(b)).join('|');
   branch=pair;title=pairs[pair][[0,0,1,2,3,3][stage]];
  }else{
   const g=ranked[0]?.[0]||pref[0]||'other';branch=g;title=solo[g][stage];
  }
  return {title,branch,stage,count,next:growthThresholds[stage+1]??null,breadth};
 }
 return {classify,solo,pairs,broad,starter,thresholds};
})();

 const KEY='ahako:reader-status:v1';
 const dialog=document.getElementById('readerStatusDialog');
 const card=document.getElementById('readerStatusCard');
 const editor=document.getElementById('readerStatusEditor');
 const editButton=document.getElementById('readerStatusEdit');
 const rolePreview=document.getElementById('readerRolePreview');
 const mottoInput=document.getElementById('readerMottoInput');
 const genreChoices=document.getElementById('readerGenreChoices');
 const featuredSelect=document.getElementById('readerFeaturedSelect');
 const recommendSelect=document.getElementById('readerRecommendSelect');
 const featuredPicker=document.getElementById('readerFeaturedPicker');
 const recommendPicker=document.getElementById('readerRecommendPicker');
 const bookPickerDialog=document.getElementById('readerBookPickerDialog');
 const bookPickerTitle=document.getElementById('readerBookPickerTitle');
 const bookPickerSearch=document.getElementById('readerBookPickerSearch');
 const bookPickerOptions=document.getElementById('readerBookPickerOptions');
 const bookPickerNoResults=document.getElementById('readerBookPickerNoResults');
 const fileInput=document.getElementById('readerAvatarFile');
 const avatarPreview=document.getElementById('readerAvatarPreview');
 const FALLBACK_GENRES=[
  {id:'fantasy',jp:'ファンタジー',role:'星を巡る司書'},
  {id:'romance',jp:'恋愛',role:'心を結ぶ読者'},
  {id:'horror',jp:'ホラー',role:'闇を歩く読者'},
  {id:'mystery',jp:'ミステリ',role:'謎を編む探究者'},
  {id:'sf',jp:'SF',role:'未来を読む航行士'},
  {id:'everyday',jp:'日常',role:'日常を拾う観測者'},
  {id:'essay',jp:'エッセイ',role:'言葉を灯す思索家'},
  {id:'other',jp:'その他',role:'物語の旅人'}
 ];
 let profile=load(),pendingAvatar=profile.avatarData||'';
 const defaultAvatarMarkup=new WeakMap();
 function load(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'?value:{};}catch(_){return {};}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(profile));return true;}catch(_){return false;}}
 function safeText(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function genres(){return (typeof PATH_ZONES!=='undefined'&&Array.isArray(PATH_ZONES)&&PATH_ZONES.length?PATH_ZONES:FALLBACK_GENRES).map(g=>({id:g.id,jp:g.jp,role:(FALLBACK_GENRES.find(x=>x.id===g.id)||{}).role||'物語の旅人'}));}
 function currentName(){const el=document.querySelector('.store-account-button>span:last-child');return (el?.textContent||'').trim()||'読者';}
 function initial(){return Array.from(currentName().replace(/…/g,'').trim())[0]||'読';}
 function iconMarkup(sizeClass){return profile.avatarData?'<span class=\"'+sizeClass+'\"><img src=\"'+safeText(profile.avatarData)+'\" alt=\"\"></span>':'<span class=\"'+sizeClass+'\">'+safeText(initial())+'</span>';}
 function owned(){return Array.isArray(ownedBooks)?ownedBooks.filter(w=>w&&w.copyId):[];}
 function later(){try{return typeof readLaterBooks==='function'?readLaterBooks():[];}catch(_){return [];}}
 function byCopyId(id){return owned().find(w=>String(w.copyId)===String(id))||null;}
 function recommendedOwnedBook(){return byCopyId(profile.recommendCopyId)||(profile.recommendPublicationId?owned().find(w=>String(w.publicationId)===String(profile.recommendPublicationId)):null)||null;}
 function coverMarkup(book){return '<span class=\"reader-status-cover\">'+(book?.coverUrl?'<img src=\"'+safeText(book.coverUrl)+'\" alt=\"\">':'あ□')+'</span>';}
 function selectedGenres(){
  const chosen=Array.isArray(profile.genres)?profile.genres.filter(id=>genres().some(g=>g.id===id)).slice(0,3):[];
  if(chosen.length)return chosen;
  const counts=new Map();
  owned().forEach(book=>{const id=String(book.genre||book.metadata?.genre||'').toLowerCase();if(genres().some(g=>g.id===id))counts.set(id,(counts.get(id)||0)+1);});
  return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>id);
 }
 function ownedGenreCounts(){
  const counts=new Map();
  owned().forEach(book=>{const id=String(book.genre||book.metadata?.genre||'').trim().toLowerCase();if(genres().some(g=>g.id===id))counts.set(id,(counts.get(id)||0)+1);});
  return counts;
 }
 function roleState(){
  return ReaderRoleRules.classify({books:owned(),preferences:selectedGenres(),featured:byCopyId(profile.featuredCopyId),recommendation:recommendedOwnedBook(),later:later()});
 }
 function chosenRole(){return roleState().title;}
 function gauge(label,value,max){
  const limit=Math.max(1,max),ratio=Math.max(0,Math.min(100,Math.round(value/limit*100)));
  return '<div class=\"reader-status-gauge\"><span class=\"reader-status-gauge-label\">'+label+'</span><span class=\"reader-status-gauge-value\">'+value+' / '+limit+'</span><span class=\"reader-status-gauge-track\" role=\"img\" aria-label=\"'+label+' '+value+' / '+limit+'\"><span class=\"reader-status-gauge-fill\" style=\"--reader-gauge:'+ratio+'%\"></span></span></div>';
 }
 function renderBook(label,book){
  if(!book)return '';
  return '<div class=\"reader-status-book\">'+coverMarkup(book)+'<span class=\"reader-status-book-copy\"><small>'+label+'</small><strong>'+safeText(book.title||'無題')+'</strong></span></div>';
 }
 function render(){
  if(!card)return;
  const ownedCount=owned().length,laterCount=later().length;
  const tags=selectedGenres().map(id=>genres().find(g=>g.id===id)?.jp).filter(Boolean);
  const featured=byCopyId(profile.featuredCopyId);
  const recommendation=recommendedOwnedBook();
  const stats='<div class=\"reader-status-stats\"><div class=\"reader-status-stat\"><small>MY BOOKS</small><strong>'+ownedCount+'冊</strong></div><div class=\"reader-status-stat\"><small>READ LATER</small><strong>'+laterCount+' / 12冊</strong></div></div>';
  const genreCounts=ownedGenreCounts(),dominantCount=Math.max(0,...genreCounts.values());
  const taggedOwnedCount=[...genreCounts.values()].reduce((sum,count)=>sum+count,0);
  const gaugeMarkup='<div class=\"reader-status-gauges\" aria-label=\"読書ステータス\">'+gauge('ジャンルの広がり',genreCounts.size,genres().length)+gauge('最多ジャンルの割合',dominantCount,taggedOwnedCount||1)+gauge('次の一冊への準備',Math.min(laterCount,12),12)+'</div><p class=\"reader-status-gauge-note\">所蔵本のジャンルと「あとで読む」の冊数から算出</p>';
  const booksMarkup=(featured||recommendation)?'<div class=\"reader-status-books\">'+renderBook('飾っている一冊',featured)+renderBook('おすすめの一冊',recommendation)+'</div>':'<p class=\"reader-status-empty\">飾る本やおすすめの本を選ぶと、ここに並びます。</p>';
  card.innerHTML='<div class=\"reader-status-identity\">'+iconMarkup('reader-status-avatar')+'<strong class=\"reader-status-name\">'+safeText(currentName())+'</strong><img class="reader-status-crest" src="./reader-status-crest.webp" alt="あ箱の紋章" width="48" height="58" decoding="async"></div>'+
   '<h3 class=\"reader-status-role\">'+safeText(chosenRole())+'</h3>'+
   (profile.motto?'<p class=\"reader-status-motto\">'+safeText(profile.motto)+'</p>':'<p class=\"reader-status-motto\">自分らしい読書のかたちを選ぶ。</p>')+
   '<div class=\"reader-status-genres\">'+(tags.length?tags.map(tag=>'<span class=\"reader-status-genre\">'+safeText(tag)+'</span>').join(''):'<span class=\"reader-status-genre\">好きなジャンルを選ぶ</span>')+'</div>'+gaugeMarkup+stats+booksMarkup;
  if(rolePreview)rolePreview.textContent=chosenRole();
  updateHeaderAvatars();
 }
 function updateHeaderAvatars(){
  document.querySelectorAll('.store-avatar').forEach(el=>{
   if(!defaultAvatarMarkup.has(el))defaultAvatarMarkup.set(el,{html:el.innerHTML,hasInitial:el.classList.contains('has-initial')});
   if(profile.avatarData){
    const current=el.querySelector('img')?.getAttribute('src');
    if(current!==profile.avatarData)el.innerHTML='<img src=\"'+safeText(profile.avatarData)+'\" alt=\"\">';
    el.classList.remove('has-initial');
   }else{
    const original=defaultAvatarMarkup.get(el);
    if(original&&el.innerHTML!==original.html)el.innerHTML=original.html||safeText(initial());
    if(original?.hasInitial)el.classList.add('has-initial');else el.classList.remove('has-initial');
   }
  });
 }
 function fillSelect(select,items,placeholder,selected,identity){
  if(!select)return;
  select.replaceChildren();
  const empty=document.createElement('option');empty.value='';empty.textContent=placeholder;select.appendChild(empty);
  const labelKey=book=>`${book.title||'無題'}\u0000${book.author?.displayName||''}`;
  const totals=new Map(),seen=new Map();
  items.forEach(book=>totals.set(labelKey(book),(totals.get(labelKey(book))||0)+1));
  items.forEach(book=>{
   const key=labelKey(book),number=(seen.get(key)||0)+1;seen.set(key,number);
   const option=document.createElement('option');option.value=String(book[identity]||'');
   option.textContent=(book.title||'無題')+(book.author?.displayName?' — '+book.author.displayName:'')+(totals.get(key)>1?'（所蔵'+number+'）':'');
   select.appendChild(option);
  });
  select.value=selected||'';
 }
 function pickerMeta(book){
  const episode=[book.episodeLabel,book.episodeTitle].filter(Boolean).join(' ・ ');
  return episode||book.subtitle||'話数・話タイトル未設定';
 }
 function pickerRow(book,placeholder){
  const row=document.createElement('span');row.className='reader-status-book-picker-row';
  const cover=document.createElement('span');cover.className='reader-status-book-picker-cover';
  if(book?.coverUrl){const image=document.createElement('img');image.src=book.coverUrl;image.alt='';cover.appendChild(image);}
  else cover.textContent='あ□';
  row.appendChild(cover);
  const copy=document.createElement('span');copy.className='reader-status-book-picker-copy';
  const title=document.createElement('strong');title.textContent=book?.title||placeholder;copy.appendChild(title);
  if(book){const episode=document.createElement('small');episode.textContent=pickerMeta(book);copy.appendChild(episode);
   const author=book.author?.displayName||book.authorName||book.byline||'';
   if(author){const by=document.createElement('small');by.className='reader-status-book-picker-author';by.textContent=author;copy.appendChild(by);}
  }
  row.appendChild(copy);return row;
 }
 function buildBookPicker(select,container,items,identity,placeholder){
  if(!select||!container)return;
  container.replaceChildren();
  const trigger=document.createElement('button');trigger.type='button';trigger.className='reader-status-book-picker-trigger';
  trigger.setAttribute('aria-haspopup','dialog');
  const refreshCurrent=()=>{
   trigger.replaceChildren();
   const book=items.find(item=>String(item[identity]||'')===String(select.value));
   trigger.appendChild(pickerRow(book,'選択しない'));
   const arrow=document.createElement('span');arrow.className='reader-status-book-picker-arrow';arrow.textContent='⌄';trigger.appendChild(arrow);
   trigger.setAttribute('aria-label',book?`${book.title||'無題'}、${pickerMeta(book)}を選択中`:`${placeholder}。本を選ぶ`);
  };
  trigger.addEventListener('click',()=>openBookPicker({select,items,identity,placeholder,refreshCurrent,trigger}));
  container.append(trigger);refreshCurrent();
 }
 function openBookPicker(context){
  if(!bookPickerDialog||!bookPickerOptions)return;
  bookPickerTitle.textContent=context.placeholder==='飾っている一冊'?'飾る一冊を選ぶ':'おすすめする一冊を選ぶ';
  bookPickerOptions.replaceChildren();
  const options=[];
  const addOption=book=>{
   const button=document.createElement('button');button.type='button';button.className='reader-status-book-picker-option';button.setAttribute('role','option');
   button.dataset.search=[book?.title,book?.episodeLabel,book?.episodeTitle,book?.subtitle,book?.author?.displayName,book?.authorName,book?.byline].filter(Boolean).join(' ').toLocaleLowerCase();
   button.setAttribute('aria-selected',String(String(book?.[context.identity]||'')===String(context.select.value)));
   button.appendChild(pickerRow(book,'選択しない'));
   button.addEventListener('click',()=>{context.select.value=String(book?.[context.identity]||'');context.refreshCurrent();bookPickerDialog.close();context.trigger.focus();});
   options.push(button);bookPickerOptions.appendChild(button);
  };
  addOption(null);context.items.forEach(addOption);
  const filter=()=>{const query=bookPickerSearch.value.trim().toLocaleLowerCase();let visible=0;options.forEach(button=>{button.hidden=!!query&&!button.dataset.search.includes(query);if(!button.hidden)visible++;});bookPickerNoResults.hidden=visible>0;};
  bookPickerSearch.value='';bookPickerSearch.oninput=filter;filter();
  bookPickerDialog.showModal();requestAnimationFrame(()=>bookPickerSearch.focus());
 }
 function buildEditor(){
  if(rolePreview)rolePreview.textContent=chosenRole();
  mottoInput.value=profile.motto||'';
  pendingAvatar=profile.avatarData||'';
  avatarPreview.innerHTML=pendingAvatar?'<img src=\"'+safeText(pendingAvatar)+'\" alt=\"\">':safeText(initial());
  genreChoices.replaceChildren();
  const selected=selectedGenres();
  genres().forEach(g=>{
   const label=document.createElement('label'),input=document.createElement('input');
   input.type='checkbox';input.value=g.id;input.checked=selected.includes(g.id);
   const text=document.createElement('span');text.textContent=g.jp;
   label.append(input,text);genreChoices.appendChild(label);
  });
  fillSelect(featuredSelect,owned(),'選択しない',profile.featuredCopyId,'copyId');
  buildBookPicker(featuredSelect,featuredPicker,owned(),'copyId','飾っている一冊');
  const ownedCandidates=owned();
  const previousRecommendation=recommendedOwnedBook();
  fillSelect(recommendSelect,ownedCandidates,'選択しない',previousRecommendation?.copyId||'','copyId');
  buildBookPicker(recommendSelect,recommendPicker,ownedCandidates,'copyId','おすすめの一冊');
 }
 function openEditor(){document.getElementById('readerStatusShareControls').hidden=true;buildEditor();card.hidden=true;editButton.hidden=true;editor.hidden=false;}
 function cancelEditor(){document.getElementById('readerStatusShareControls').hidden=false;editor.hidden=true;card.hidden=false;editButton.hidden=false;pendingAvatar=profile.avatarData||'';}
 function open(){
  if(!dialog||!window.HTMLDialogElement||dialog.open)return;
  render();cancelEditor();dialog.showModal();
 }
 function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{
    try{
     const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
     const ctx=canvas.getContext('2d'),side=Math.min(img.naturalWidth,img.naturalHeight);
     const sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;
     ctx.drawImage(img,sx,sy,side,side,0,0,256,256);URL.revokeObjectURL(url);
     let data=canvas.toDataURL('image/webp',.82);
     if(data.length>120000)data=canvas.toDataURL('image/jpeg',.72);
     resolve(data);
    }catch(error){URL.revokeObjectURL(url);reject(error);}
   };
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('画像を読み込めませんでした。'));};
   img.src=url;
  });
 }
 dialog?.querySelector('[data-reader-close]')?.addEventListener('click',()=>dialog.close());
 dialog?.querySelector('[data-reader-cancel]')?.addEventListener('click',cancelEditor);
 dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 bookPickerDialog?.querySelector('[data-book-picker-close]')?.addEventListener('click',()=>bookPickerDialog.close());
 bookPickerDialog?.addEventListener('click',e=>{if(e.target===bookPickerDialog)bookPickerDialog.close();});
 editButton?.addEventListener('click',openEditor);
 genreChoices?.addEventListener('change',e=>{
  const checked=[...genreChoices.querySelectorAll('input:checked')];
  if(checked.length>3){e.target.checked=false;return;}
 });
 fileInput?.addEventListener('change',async()=>{
  const file=fileInput.files?.[0];if(!file)return;
  try{pendingAvatar=await fileToDataUrl(file);avatarPreview.innerHTML='<img src=\"'+safeText(pendingAvatar)+'\" alt=\"\">';}
  catch(_){window.alert?.('画像を読み込めませんでした。別の画像を選んでください。');}
 });
 document.getElementById('readerAvatarReset')?.addEventListener('click',()=>{pendingAvatar='';fileInput.value='';avatarPreview.textContent=initial();});
 editor?.addEventListener('submit',e=>{
  e.preventDefault();
  profile={...profile,role:'',motto:mottoInput.value.trim().slice(0,100),genres:[...genreChoices.querySelectorAll('input:checked')].map(input=>input.value).slice(0,3),avatarData:pendingAvatar,featuredCopyId:featuredSelect.value||'',recommendPublicationId:'',recommendCopyId:recommendSelect.value||''};
  if(!save()){window.alert?.('プロフィールを保存できませんでした。端末の保存容量を確認してください。');return;}
  render();cancelEditor();
  if(profile.shareId&&window.ReaderStatusShare){
   const result=document.getElementById('readerStatusShareResult'),message=document.getElementById('readerStatusShareMessage');
   if(result)result.hidden=false;
   window.ReaderStatusShare.updateExisting(profile.shareId,shareSnapshot).then(()=>{
    if(message)message.textContent='プロフィールを保存し、共有先にも反映しました。';
   }).catch(error=>{if(message)message.textContent='プロフィールは保存しましたが、共有先を更新できませんでした。'+(error?.message?' '+error.message:'');});
  }
 });
 async function shareSnapshot(){
  const counts=ownedGenreCounts(),laterCount=later().length;
  const book=async value=>value?{
   title:String(value.title||'無題').slice(0,300),
   detail:String([value.episodeLabel,value.episodeTitle].filter(Boolean).join(' ・ ')||value.subtitle||'').slice(0,400),
   author:String(value.author?.displayName||value.authorName||value.byline||'').slice(0,100),
   publicationId:await ReaderStatusShare.resolvePublication(value),
   cover:await ReaderStatusShare.portableImage(value.coverUrl)
  }:null;
  return {version:1,kind:'ahako-reader-status',createdAt:new Date().toISOString(),
   name:currentName().slice(0,80),role:chosenRole(),motto:profile.motto||'',avatar:profile.avatarData||'',
   genres:selectedGenres().map(id=>genres().find(g=>g.id===id)?.jp).filter(Boolean),
   ownedCount:owned().length,laterCount,
   gauges:[[counts.size,genres().length],[Math.max(0,...counts.values()),[...counts.values()].reduce((a,b)=>a+b,0)||1],[Math.min(laterCount,12),12]],
   featured:await book(byCopyId(profile.featuredCopyId)),recommendation:await book(recommendedOwnedBook())};
 }
 ReaderStatusShare.bindCreator(shareSnapshot,id=>{profile={...profile,shareId:id};if(!save())throw new Error('共有リンクを端末に保存できませんでした。');});
 window.openReaderStatus=open;
 window.addEventListener('storage',e=>{if(e.key===KEY){profile=load();render();}});
 window.addEventListener('pageshow',()=>{profile=load();render();});
 const avatarObserver=new MutationObserver(updateHeaderAvatars);
 avatarObserver.observe(document.body,{childList:true,subtree:true});
 render();
})(); 
