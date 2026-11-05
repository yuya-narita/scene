/* V2.33.2 — local-first reader identity profile. */
(()=>{
 'use strict';
 const KEY='ahako:reader-status:v1';
 const dialog=document.getElementById('readerStatusDialog');
 const card=document.getElementById('readerStatusCard');
 const editor=document.getElementById('readerStatusEditor');
 const editButton=document.getElementById('readerStatusEdit');
 const roleInput=document.getElementById('readerRoleInput');
 const mottoInput=document.getElementById('readerMottoInput');
 const genreChoices=document.getElementById('readerGenreChoices');
 const featuredSelect=document.getElementById('readerFeaturedSelect');
 const recommendSelect=document.getElementById('readerRecommendSelect');
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
 let profile=load(),pendingAvatar=profile.avatarData||'',defaultAvatarMarkup=null;
 function load(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return value&&typeof value==='object'?value:{};}catch(_){return {};}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(profile));return true;}catch(_){return false;}}
 function safeText(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function genres(){return (typeof PATH_ZONES!=='undefined'&&Array.isArray(PATH_ZONES)&&PATH_ZONES.length?PATH_ZONES:FALLBACK_GENRES).map(g=>({id:g.id,jp:g.jp,role:(FALLBACK_GENRES.find(x=>x.id===g.id)||{}).role||'物語の旅人'}));}
 function currentName(){const el=document.querySelector('.store-account-button>span:last-child');return (el?.textContent||'').trim()||'読者';}
 function initial(){return Array.from(currentName().replace(/…/g,'').trim())[0]||'読';}
 function iconMarkup(sizeClass){return profile.avatarData?'<span class=\"'+sizeClass+'\"><img src=\"'+safeText(profile.avatarData)+'\" alt=\"\"></span>':'<span class=\"'+sizeClass+'\">'+safeText(initial())+'</span>';}
 function owned(){return Array.isArray(ownedBooks)?ownedBooks.filter(w=>w&&w.copyId):[];}
 function later(){try{return typeof readLaterBooks==='function'?readLaterBooks():[];}catch(_){return [];}}
 function publicBooks(){return Array.isArray(allBooks)?allBooks.filter(w=>w&&!w._ownedCopy&&w.publicationId):[];}
 function byCopyId(id){return owned().find(w=>String(w.copyId)===String(id))||null;}
 function byPublicationId(id){return publicBooks().find(w=>String(w.publicationId)===String(id))||null;}
 function coverMarkup(book){return '<span class=\"reader-status-cover\">'+(book?.coverUrl?'<img src=\"'+safeText(book.coverUrl)+'\" alt=\"\">':'あ□')+'</span>';}
 function selectedGenres(){
  const chosen=Array.isArray(profile.genres)?profile.genres.filter(id=>genres().some(g=>g.id===id)).slice(0,3):[];
  if(chosen.length)return chosen;
  const counts=new Map();
  owned().forEach(book=>{const id=String(book.genre||book.metadata?.genre||'').toLowerCase();if(genres().some(g=>g.id===id))counts.set(id,(counts.get(id)||0)+1);});
  return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>id);
 }
 function chosenRole(){
  const role=String(profile.role||'').trim();
  if(role)return role;
  const favorite=selectedGenres()[0];
  return genres().find(g=>g.id===favorite)?.role||'物語の旅人';
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
  const recommendation=byPublicationId(profile.recommendPublicationId)||byCopyId(profile.recommendCopyId);
  const stats='<div class=\"reader-status-stats\"><div class=\"reader-status-stat\"><small>MY BOOKS</small><strong>'+ownedCount+'冊</strong></div><div class=\"reader-status-stat\"><small>READ LATER</small><strong>'+laterCount+' / 12冊</strong></div></div>';
  const booksMarkup=(featured||recommendation)?'<div class=\"reader-status-books\">'+renderBook('飾っている一冊',featured)+renderBook('おすすめの一冊',recommendation)+'</div>':'<p class=\"reader-status-empty\">飾る本やおすすめの本を選ぶと、ここに並びます。</p>';
  card.innerHTML='<div class=\"reader-status-identity\">'+iconMarkup('reader-status-avatar')+'<strong class=\"reader-status-name\">'+safeText(currentName())+'</strong></div>'+
   '<h3 class=\"reader-status-role\">'+safeText(chosenRole())+'</h3>'+
   (profile.motto?'<p class=\"reader-status-motto\">'+safeText(profile.motto)+'</p>':'<p class=\"reader-status-motto\">自分らしい読書のかたちを選ぶ。</p>')+
   '<div class=\"reader-status-genres\">'+(tags.length?tags.map(tag=>'<span class=\"reader-status-genre\">'+safeText(tag)+'</span>').join(''):'<span class=\"reader-status-genre\">好きなジャンルを選ぶ</span>')+'</div>'+stats+booksMarkup;
  updateHeaderAvatars();
 }
 function updateHeaderAvatars(){
  document.querySelectorAll('.store-avatar').forEach(el=>{
   if(defaultAvatarMarkup===null)defaultAvatarMarkup=el.innerHTML;
   if(profile.avatarData){
    const current=el.querySelector('img')?.getAttribute('src');
    if(current!==profile.avatarData)el.innerHTML='<img src=\"'+safeText(profile.avatarData)+'\" alt=\"\">';
    el.classList.remove('has-initial');
   }else if(el.innerHTML!==defaultAvatarMarkup){el.innerHTML=defaultAvatarMarkup||safeText(initial());}
  });
 }
 function fillSelect(select,items,placeholder,selected,identity){
  if(!select)return;
  select.replaceChildren();
  const empty=document.createElement('option');empty.value='';empty.textContent=placeholder;select.appendChild(empty);
  items.forEach(book=>{const option=document.createElement('option');option.value=String(book[identity]||'');option.textContent=(book.title||'無題')+(book.author?.displayName?' — '+book.author.displayName:'');select.appendChild(option);});
  select.value=selected||'';
 }
 function buildEditor(){
  roleInput.value=profile.role||chosenRole();
  mottoInput.value=profile.motto||'';
  pendingAvatar=profile.avatarData||'';
  avatarPreview.innerHTML=pendingAvatar?'<img src=\"'+safeText(pendingAvatar)+'\" alt=\"\">':safeText(initial());
  genreChoices.replaceChildren();
  const selected=selectedGenres();
  genres().forEach(g=>{
   const label=document.createElement('label'),input=document.createElement('input');
   input.type='checkbox';input.value=g.id;input.checked=selected.includes(g.id);
   label.append(input,document.createTextNode(g.jp));genreChoices.appendChild(label);
  });
  fillSelect(featuredSelect,owned(),'選択しない',profile.featuredCopyId,'copyId');
  const candidates=publicBooks();
  const publicSelection=candidates.some(w=>String(w.publicationId)===String(profile.recommendPublicationId));
  if(candidates.length)fillSelect(recommendSelect,candidates,'選択しない',publicSelection?profile.recommendPublicationId,'publicationId');
  else fillSelect(recommendSelect,owned().filter(w=>w.publicationId&&!String(w.publicationId).startsWith('owned:')),'選択しない',profile.recommendCopyId,'copyId');
 }
 function openEditor(){buildEditor();card.hidden=true;editButton.hidden=true;editor.hidden=false;}
 function cancelEditor(){editor.hidden=true;card.hidden=false;editButton.hidden=false;pendingAvatar=profile.avatarData||'';}
 function open(){
  if(!dialog||!window.HTMLDialogElement)return;
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
  const preferred=checked.map(input=>input.value);
  if(!roleInput.value.trim())roleInput.value=genres().find(g=>g.id===preferred[0])?.role||'物語の旅人';
 });
 fileInput?.addEventListener('change',async()=>{
  const file=fileInput.files?.[0];if(!file)return;
  try{pendingAvatar=await fileToDataUrl(file);avatarPreview.innerHTML='<img src=\"'+safeText(pendingAvatar)+'\" alt=\"\">';}
  catch(_){window.alert?.('画像を読み込めませんでした。別の画像を選んでください。');}
 });
 document.getElementById('readerAvatarReset')?.addEventListener('click',()=>{pendingAvatar='';fileInput.value='';avatarPreview.textContent=initial();});
 editor?.addEventListener('submit',e=>{
  e.preventDefault();
  profile={...profile,role:roleInput.value.trim().slice(0,30)||chosenRole(),motto:mottoInput.value.trim().slice(0,100),genres:[...genreChoices.querySelectorAll('input:checked')].map(input=>input.value).slice(0,3),avatarData:pendingAvatar,featuredCopyId:featuredSelect.value||'',recommendPublicationId:publicBooks().some(w=>String(w.publicationId)===recommendSelect.value)?recommendSelect.value:'',recommendCopyId:''};
  if(!publicBooks().length){profile.recommendCopyId=recommendSelect.value||'';}
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
