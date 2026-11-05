/* V2.33.6 — reader status book selection with cover and episode details. */
(()=>{
 'use strict';
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
 function chosenRole(){
  const counts=ownedGenreCounts(),preferences=selectedGenres();
  const favorite=[...counts].sort((a,b)=>b[1]-a[1]||(preferences.indexOf(a[0])<0?999:preferences.indexOf(a[0]))-(preferences.indexOf(b[0])<0?999:preferences.indexOf(b[0])))[0]?.[0]||preferences[0];
  return genres().find(g=>g.id===favorite)?.role||'物語の旅人';
 }
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
  card.innerHTML='<div class=\"reader-status-identity\">'+iconMarkup('reader-status-avatar')+'<strong class=\"reader-status-name\">'+safeText(currentName())+'</strong></div>'+
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
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
  const panel=document.createElement('div');panel.className='reader-status-book-picker-panel';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-label',placeholder+'から選ぶ');
  const search=document.createElement('input');search.type='search';search.className='reader-status-book-picker-search';
  search.placeholder='タイトル・話数・話タイトルで検索';search.setAttribute('aria-label','本を検索');
  const options=document.createElement('div');options.className='reader-status-book-picker-options';options.setAttribute('role','group');
  const noResults=document.createElement('p');noResults.className='reader-status-book-picker-no-results';noResults.textContent='該当する本がありません';noResults.hidden=true;
  const optionButtons=[];
  const refreshCurrent=()=>{
   trigger.replaceChildren();
   const book=items.find(item=>String(item[identity]||'')===String(select.value));
   trigger.appendChild(pickerRow(book,placeholder));
   const arrow=document.createElement('span');arrow.className='reader-status-book-picker-arrow';arrow.textContent='⌄';trigger.appendChild(arrow);
   trigger.setAttribute('aria-label',book?`${book.title||'無題'}、${pickerMeta(book)}を選択中`:`${placeholder}。本を選ぶ`);
  };
  const close=()=>{panel.hidden=true;trigger.setAttribute('aria-expanded','false');container.classList.remove('is-open');};
  const addOption=(book)=>{
   const button=document.createElement('button');button.type='button';button.className='reader-status-book-picker-option';
   button.dataset.search=[book.title,book.episodeLabel,book.episodeTitle,book.subtitle,book.author?.displayName,book.authorName,book.byline].filter(Boolean).join(' ').toLocaleLowerCase();
   button.setAttribute('aria-pressed',String(String(book[identity]||'')===String(select.value)));
   button.appendChild(pickerRow(book,''));
   button.addEventListener('click',()=>{select.value=String(book[identity]||'');refreshCurrent();optionButtons.forEach(option=>option.setAttribute('aria-pressed',String(option===button)));close();trigger.focus();});
   optionButtons.push(button);options.appendChild(button);
  };
  const emptyButton=document.createElement('button');emptyButton.type='button';emptyButton.className='reader-status-book-picker-option reader-status-book-picker-empty';
  emptyButton.dataset.search=placeholder.toLocaleLowerCase();emptyButton.setAttribute('aria-pressed',String(!select.value));emptyButton.appendChild(pickerRow(null,placeholder));
  emptyButton.addEventListener('click',()=>{select.value='';refreshCurrent();optionButtons.forEach(option=>option.setAttribute('aria-pressed',String(option===emptyButton)));close();trigger.focus();});
  optionButtons.push(emptyButton);options.appendChild(emptyButton);
  items.forEach(addOption);
  search.addEventListener('input',()=>{const query=search.value.trim().toLocaleLowerCase();let visible=0;optionButtons.forEach(button=>{button.hidden=!!query&&!button.dataset.search.includes(query);if(!button.hidden)visible++;});noResults.hidden=visible>0;});
  trigger.addEventListener('click',()=>{
   document.querySelectorAll('.reader-status-book-picker.is-open').forEach(other=>{if(other!==container){other.classList.remove('is-open');other.querySelector('.reader-status-book-picker-panel').hidden=true;other.querySelector('.reader-status-book-picker-trigger').setAttribute('aria-expanded','false');}});
   const opening=panel.hidden;panel.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));container.classList.toggle('is-open',opening);if(opening){search.value='';search.dispatchEvent(new Event('input'));search.focus();}
  });
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();trigger.focus();}});
  panel.append(search,options,noResults);container.append(trigger,panel);refreshCurrent();
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
  buildBookPicker(featuredSelect,featuredPicker,owned(),'copyId','選択しない');
  const ownedCandidates=owned();
  const previousRecommendation=recommendedOwnedBook();
  fillSelect(recommendSelect,ownedCandidates,'選択しない',previousRecommendation?.copyId||'','copyId');
  buildBookPicker(recommendSelect,recommendPicker,ownedCandidates,'copyId','選択しない');
 }
 function openEditor(){buildEditor();card.hidden=true;editButton.hidden=true;editor.hidden=false;}
 function cancelEditor(){editor.hidden=true;card.hidden=false;editButton.hidden=false;pendingAvatar=profile.avatarData||'';}
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
  render();editor.hidden=true;card.hidden=false;editButton.hidden=false;
 });
 window.openReaderStatus=open;
 window.addEventListener('storage',e=>{if(e.key===KEY){profile=load();render();}});
 window.addEventListener('pageshow',()=>{profile=load();render();});
 const avatarObserver=new MutationObserver(updateHeaderAvatars);
 avatarObserver.observe(document.body,{childList:true,subtree:true});
 render();
})(); 
