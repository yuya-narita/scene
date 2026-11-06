/* V2.34.5 — stable public reader links that update when the profile is saved. */
(()=>{
 'use strict';
 const BASE='https://scene-studio-api.a-hako.workers.dev';
 const $=id=>document.getElementById(id);
 const text=(v,max=400)=>typeof v==='string'?v.slice(0,max):'';
 function imageUrl(v){
  if(typeof v!=='string'||v.length>180000)return '';
  if(/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(v))return v;
  try{const u=new URL(v);return u.protocol==='https:'||u.protocol==='http:'?u.href:'';}catch(_){return '';}
 }
 async function portableImage(src){
  if(!src)return '';
  if(!src.startsWith('blob:'))return imageUrl(src);
  return new Promise((resolve,reject)=>{
   const image=new Image(),timer=setTimeout(()=>{image.src='';reject(new Error('表紙の準備がタイムアウトしました。もう一度お試しください。'));},10000);
   image.onload=()=>{clearTimeout(timer);try{
    const ratio=Math.min(1,360/image.naturalWidth,540/image.naturalHeight),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    const data=canvas.toDataURL('image/jpeg',.8);if(data.length>180000)throw new Error('表紙画像が大きすぎます。');resolve(data);
   }catch(e){reject(e);}};
   image.onerror=()=>{clearTimeout(timer);reject(new Error('表紙を読み込めませんでした。ステータスを開き直してください。'));};image.src=src;
  });
 }
 async function request(url,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const headers=new Headers(options.headers||{});headers.set('Accept','application/json');const r=await fetch(url,{...options,headers,signal:controller.signal});
   const raw=await r.text();if(raw.length>650000)throw new Error('共有データが大きすぎます。');
   let data;try{data=JSON.parse(raw);}catch(_){throw new Error('通信に失敗しました。時間をおいてお試しください。');}
   if(!r.ok){if(data.code==='AUTHOR_LOGIN_REQUIRED'||r.status===401)throw new Error('共有先を更新するには、アカウントからログインしてください。');if(data.code==='AUTHOR_MISMATCH')throw new Error('別のアカウントで作成された共有リンクです。');if(data.code==='READER_STATUS_SHARE_NOT_FOUND')throw new Error('共有リンクが見つかりません。あらためてリンクを作成してください。');throw new Error(data.error||'通信に失敗しました。時間をおいてお試しください。');}return data;
  }catch(e){if(e.name==='AbortError')throw new Error('通信がタイムアウトしました。もう一度お試しください。');throw e;}
  finally{clearTimeout(timer);}
 }
 function authorHeaders(){
  const headers={'Content-Type':'application/json'};
  try{const token=JSON.parse(localStorage.getItem('ahako-author-session-v1')||'null')?.token;if(token)headers.Authorization='Bearer '+token;}catch(_){}
  return headers;
 }
 function shareUrl(id){if(!/^[a-f0-9]{32}$/i.test(String(id||'')))return'';return new URL('/reader-status-share/'+encodeURIComponent(id),BASE).href;}
 async function updateExisting(id,snapshot){
  if(!/^[a-f0-9]{32}$/i.test(String(id||'')))throw new Error('共有リンクの情報を確認できません。');
  const data=await snapshot(),body=JSON.stringify(data);if(body.length>600000)throw new Error('画像が大きすぎるため共有できません。');
  const response=await request(BASE+'/reader-status-share/'+encodeURIComponent(id),{method:'PUT',headers:authorHeaders(),body});
  if(!response.ok)throw new Error('共有先を更新できませんでした。');
  return response;
 }
 function bindCreator(snapshot,rememberShare){
  const create=$('readerStatusShareCreate');if(!create)return;
  const message=$('readerStatusShareMessage'),result=$('readerStatusShareResult'),input=$('readerStatusShareUrl');
  const open=$('readerStatusShareOpen');
  const stored=()=>{try{return JSON.parse(localStorage.getItem('ahako:reader-status:v1')||'{}')?.shareId||'';}catch(_){return '';}};
  const savedId=stored();
  if(/^[a-f0-9]{32}$/i.test(savedId)){input.value=shareUrl(savedId);open.href=input.value;result.hidden=false;message.textContent='プロフィールを保存すると、この共有先にも自動で反映されます。';}
  create.addEventListener('click',async()=>{
   create.disabled=true;message.textContent=stored()?'共有先を更新しています…':'共有リンクを作成しています…';
   try{
    const id=stored();
    if(id){await updateExisting(id,snapshot);input.value=shareUrl(id);open.href=input.value;}
    else{
     const data=await snapshot(),body=JSON.stringify(data);if(body.length>600000)throw new Error('画像が大きすぎるため共有できません。');
     const response=await request(BASE+'/reader-status-share',{method:'POST',headers:authorHeaders(),body});
     if(!response.ok||!(/^[a-f0-9]{32}$/i.test(String(response.id||''))))throw new Error('共有リンクを作成できませんでした。');
     await rememberShare(response.id);input.value=shareUrl(response.id);open.href=input.value;
    }
    result.hidden=false;message.textContent='共有先を更新しました。プロフィール保存時にも自動で反映されます。';
   }catch(e){message.textContent=e.message||'共有リンクを作成できませんでした。';}
   finally{create.disabled=false;}
  });
  $('readerStatusShareCopy').addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText(input.value);message.textContent='リンクをコピーしました。';}
   catch(_){input.focus();input.select();input.setSelectionRange(0,input.value.length);message.textContent='リンクを長押ししてコピーしてください。';}
  });
  const native=$('readerStatusShareNative');native.hidden=!navigator.share;
  native.addEventListener('click',async()=>{
   try{await navigator.share({title:'あ箱の読者ステータス',url:input.value});message.textContent='共有しました。';}
   catch(e){if(e.name!=='AbortError')message.textContent='共有できませんでした。「リンクをコピー」をお使いください。';}
  });
 }
 function node(tag,className,value){const el=document.createElement(tag);el.className=className;if(value!==undefined)el.textContent=value;return el;}
 function cover(src,className){const el=node('span',className),safe=imageUrl(src);el.textContent='あ□';if(safe){const img=new Image();img.alt='';img.referrerPolicy='no-referrer';img.onload=()=>el.replaceChildren(img);img.src=safe;}return el;}
 function publicationId(value){return typeof value==='string'&&/^[a-z0-9_-]{1,160}$/i.test(value)?value:'';}
 function publicPlayerUrl(id){
  if(!publicationId(id))return '';
  const player=new URL('../',location.href),raw=new URL(BASE+'/work/'+encodeURIComponent(id));
  raw.searchParams.set('raw','1');player.searchParams.set('src',raw.href);player.searchParams.set('returnTo',new URL('./',location.href).href);return player.href;
 }
 async function resolvePublication(value){
  const known=publicationId(value?.publicationId)||publicationId(value?.publicId);if(known)return known;
  const workId=publicationId(value?.workId);if(!workId)return '';
  const data=await request(BASE+'/publication/'+encodeURIComponent(workId));
  return data?.ok&&data.exists?publicationId(data.id):'';
 }
 function book(value,featured){
  if(!value||typeof value!=='object')return null;
  const href=publicPlayerUrl(value.publicationId);
  const row=node(href?'a':'div','reader-status-book '+(featured?'reader-share-featured':'reader-share-recommended'));
  if(href){row.href=href;row.setAttribute('aria-label',(text(value.title,300)||'無題')+'を読む');}
  row.append(node('small','reader-share-slot',featured?'飾っている一冊':'おすすめの一冊'));
  row.append(cover(value.cover,'reader-status-cover'));
  const copy=node('span','reader-status-book-copy');copy.append(node('strong','',text(value.title,300)||'無題'));
  if(text(value.detail))copy.append(node('p','reader-share-detail',text(value.detail)));
  if(text(value.author)&&value.author!=='作者')copy.append(node('p','reader-share-author',text(value.author,100)));
  row.append(copy,node('span','reader-share-read',href?'タップして読む':'公開リンクなし'));
  return row;
 }
 function render(card,data){
  if(!data||data.kind!=='ahako-reader-status'||data.version!==1)throw new Error('この共有データは表示できません。');
  const identity=node('div','reader-status-identity'),avatar=cover(data.avatar,'reader-status-avatar');if(!imageUrl(data.avatar))avatar.textContent=Array.from(text(data.name,80))[0]||'読';
  const identityCopy=node('div','reader-share-identity-copy');identityCopy.append(node('strong','reader-status-name',text(data.name,80)||'読者'),node('h1','reader-status-role',text(data.role,80)||'物語の旅人'));const crest=new Image();crest.className='reader-status-crest';crest.src='./reader-status-crest.webp';crest.alt='あ箱の紋章';crest.width=48;crest.height=58;crest.decoding='async';identity.append(avatar,identityCopy,crest);
  card.replaceChildren(identity,node('p','reader-status-motto',text(data.motto,100)||'自分らしい読書のかたちを選ぶ。'));
  const tags=node('div','reader-status-genres');(Array.isArray(data.genres)?data.genres:[]).slice(0,3).forEach(g=>tags.append(node('span','reader-status-genre',text(g,40))));card.append(tags);
  const gauges=node('div','reader-status-gauges');gauges.title='所蔵本のジャンルと「あとで読む」の冊数から算出';gauges.setAttribute('aria-label',gauges.title);
  ['ジャンルの広がり','最多ジャンルの割合','次の一冊への準備'].forEach((label,i)=>{
   const pair=Array.isArray(data.gauges?.[i])?data.gauges[i]:[0,1];
   const max=Math.max(1,Math.min(1000000,Number(pair[1])||1)),value=Math.max(0,Math.min(max,Number(pair[0])||0));
   const row=node('div','reader-status-gauge');row.append(node('span','reader-status-gauge-label',label),node('span','reader-status-gauge-value',value+' / '+max));
   const track=node('span','reader-status-gauge-track'),fill=node('span','reader-status-gauge-fill');fill.style.setProperty('--reader-gauge',Math.round(value/max*100)+'%');track.append(fill);row.append(track);gauges.append(row);
  });card.append(gauges);
  const stats=node('div','reader-status-stats');[['MY BOOKS',data.ownedCount],['READ LATER',data.laterCount]].forEach(([label,count])=>{const el=node('div','reader-status-stat');el.append(node('small','',label),node('strong','',Math.max(0,Math.min(1000000,Math.floor(Number(count)||0)))+(label==='READ LATER'?' / 12冊':'冊')));stats.append(el);});card.append(stats);
  const books=node('div','reader-status-books reader-share-books');[book(data.featured,true),book(data.recommendation,false)].filter(Boolean).forEach(el=>books.append(el));if(books.childElementCount){books.classList.toggle('reader-share-single',books.childElementCount===1);card.append(books);}
 }
 let loadRevision=0;
 async function loadShared(){
  const card=$('readerSharedCard');if(!card)return;
  const status=$('readerSharedMessage'),revision=++loadRevision;
  card.hidden=true;status.textContent='読者ステータスを読み込んでいます…';
  try{
   const id=decodeURIComponent(location.hash.slice(1));if(!/^(?:[a-f0-9]{32}|[a-f0-9]{16}\.[a-z0-9]{1,8})$/i.test(id))throw new Error('共有リンクが正しくありません。');
   const data=await request(BASE+'/reader-status-share/'+encodeURIComponent(id),{cache:'no-store'});if(revision!==loadRevision)return;render(card,data);card.hidden=false;
   status.textContent='最新の読者ステータスを表示しています。';document.title=(text(data.name,80)||'読者')+'の読者ステータス｜あ箱';
  }catch(e){if(revision!==loadRevision)return;card.hidden=true;status.textContent=e.message||'共有データを読み込めませんでした。';}
 }
 window.ReaderStatusShare={portableImage,bindCreator,render,resolvePublication,updateExisting};
 window.addEventListener('hashchange',loadShared);
 loadShared();
})();
