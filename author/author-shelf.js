const API_BASE='https://scene-studio-api.a-hako.workers.dev';
const $=selector=>document.querySelector(selector);
let shelfData=null;
let allWorks=[];
let workById=new Map();
let toastTimer=0;

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function authorIdFromUrl(){return String(new URLSearchParams(location.search).get('id')||new URLSearchParams(location.search).get('author')||'').trim().toLowerCase();}
function validAuthorId(value){return /^author_[a-f0-9]{32}$/.test(value);}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},2400);}
function coverHtml(work,className='book-cover'){return `<span class="${className}">${work?.coverUrl?`<img src="${escapeHtml(work.coverUrl)}" alt="" loading="lazy">`:'<span class="book-cover-fallback">□</span>'}</span>`;}
function workLabel(work){return [work?.episodeLabel,work?.episodeTitle].filter(Boolean).join(' ')||'';}
function bookCardHtml(work,{position=0}={}){return `<button class="book-card" type="button" data-publication-id="${escapeHtml(work.publicationId)}">${coverHtml(work)}${position?`<span class="book-number">${position}冊目</span>`:''}<span class="book-copy"><h3>${escapeHtml(work.title||'Untitled')}</h3><p>${escapeHtml(workLabel(work)||work.byline||'')}</p></span></button>`;}
function seriesCoverHtml(work){return `<span class="series-cover">${work?.coverUrl?`<img src="${escapeHtml(work.coverUrl)}" alt="" loading="lazy">`:'<span>□</span>'}</span>`;}

function publicPlayerUrl(work){
  try{
    const playerUrl=new URL('../',location.href);
    const rawWorkUrl=new URL(work.url,location.href);
    rawWorkUrl.searchParams.set('raw','1');
    playerUrl.searchParams.set('src',rawWorkUrl.toString());
    playerUrl.searchParams.set('returnTo',location.href);
    return playerUrl.toString();
  }catch(_){
    return work.url||'#';
  }
}

function applyFutureTheme(theme){
  if(!theme||typeof theme!=='object')return;
  const safeColor=value=>/^#[0-9a-f]{6}$/i.test(String(value||''))?value:'';
  const root=document.documentElement;
  const mapping=[['background','--shelf-bg'],['ink','--shelf-ink'],['accent','--shelf-accent']];
  for(const [key,variable] of mapping){const value=safeColor(theme[key]);if(value)root.style.setProperty(variable,value);}
}

async function fetchJson(path){
  const response=await fetch(`${API_BASE}${path}`,{headers:{Accept:'application/json'},cache:'no-store'});
  const payload=await response.json().catch(()=>null);
  if(!response.ok||!payload?.ok)throw new Error(payload?.error||`HTTP ${response.status}`);
  return payload;
}

async function loadShelf(){
  const authorId=authorIdFromUrl();
  $('#loadingState').hidden=false;$('#errorState').hidden=true;$('#shelfContent').hidden=true;
  if(!validAuthorId(authorId)){showError('作者本棚のURLが正しくありません。');return;}
  try{
    const [bookshelf,worksPayload]=await Promise.all([
      fetchJson(`/authors/${encodeURIComponent(authorId)}/bookshelf`),
      fetchJson(`/authors/${encodeURIComponent(authorId)}/works`)
    ]);
    shelfData=bookshelf;allWorks=Array.isArray(worksPayload.works)?worksPayload.works:[];
    workById=new Map(allWorks.map(work=>[work.publicationId,work]));
    applyFutureTheme(bookshelf.author?.theme);
    renderShelf();
  }catch(error){showError(error.message||'本棚を読み込めませんでした。');}
}

function showError(message){
  $('#loadingState').hidden=true;$('#shelfContent').hidden=true;$('#errorState').hidden=false;$('#errorMessage').textContent=message;
}

function renderShelf(){
  const author=shelfData.author||{},series=Array.isArray(shelfData.series)?shelfData.series:[],unboxed=Array.isArray(shelfData.unboxedWorks)?shelfData.unboxedWorks:[];
  document.title=`${author.displayName||'作者'}の本棚｜あ箱`;
  $('#authorName').textContent=author.displayName||'作者名未設定';
  $('#workCount').textContent=String(shelfData.counts?.works??allWorks.length);
  $('#seriesCount').textContent=String(series.length);
  const seriesSection=$('#seriesSection');seriesSection.hidden=!series.length;
  $('#seriesBoxes').innerHTML=series.map(box=>{
    const books=box.episodes.map(episode=>workById.get(episode.publicationId)||episode);
    const covers=books.slice(0,3);while(covers.length<3)covers.push(null);
    return `<button class="series-box" type="button" data-series-id="${escapeHtml(box.seriesId)}"><span class="series-cover-stack">${covers.slice().reverse().map(seriesCoverHtml).join('')}</span><span class="series-box-copy"><small>SERIES BOX</small><strong>${escapeHtml(box.title||'無題のシリーズ')}</strong><em>${Number(box.episodeCount)||books.length}冊・開いて読む</em></span></button>`;
  }).join('');
  const unboxedSection=$('#unboxedSection');unboxedSection.hidden=!unboxed.length;
  $('#unboxedCount').textContent=`${unboxed.length}冊`;
  $('#unboxedBooks').innerHTML=unboxed.map(work=>bookCardHtml(work)).join('');
  $('#emptyShelf').hidden=Boolean(series.length||unboxed.length);
  bindShelfActions();
  $('#loadingState').hidden=true;$('#errorState').hidden=true;$('#shelfContent').hidden=false;
}

function bindShelfActions(){
  document.querySelectorAll('.series-box').forEach(button=>button.onclick=()=>openSeries(button.dataset.seriesId));
  document.querySelectorAll('.book-card').forEach(button=>button.onclick=()=>openWork(button.dataset.publicationId));
}

function openSeries(seriesId){
  const series=shelfData?.series?.find(item=>item.seriesId===seriesId);if(!series)return;
  $('#seriesDialogTitle').textContent=series.title||'無題のシリーズ';
  $('#seriesDialogMeta').textContent=`全${series.episodes.length}冊。上から順番に並んでいます。`;
  $('#seriesDialogBooks').innerHTML=series.episodes.map((episode,index)=>{
    const work=workById.get(episode.publicationId)||episode;
    return `<button class="series-dialog-row" type="button" data-publication-id="${escapeHtml(episode.publicationId)}">${coverHtml(work,'series-dialog-thumb')}<span class="series-dialog-copy"><small>${index+1}冊目${episode.episodeLabel?`・${escapeHtml(episode.episodeLabel)}`:''}</small><strong>${escapeHtml(work.title||episode.title||'Untitled')}</strong><em>${escapeHtml(episode.episodeTitle||work.episodeTitle||work.byline||'')}</em></span><span class="series-dialog-arrow">›</span></button>`;
  }).join('');
  document.querySelectorAll('#seriesDialogBooks .series-dialog-row').forEach(button=>button.onclick=()=>{closeDialog('seriesDialog');setTimeout(()=>openWork(button.dataset.publicationId),80);});
  openDialog('seriesDialog');
}

function openWork(publicationId){
  const work=workById.get(publicationId);if(!work)return;
  const series=shelfData?.series?.find(box=>box.episodes.some(episode=>episode.publicationId===publicationId));
  const episode=series?.episodes.find(item=>item.publicationId===publicationId);
  const context=[series?.title,episode?.episodeLabel||work.episodeLabel,episode?.episodeTitle||work.episodeTitle].filter(Boolean).join(' ／ ');
  $('#workDialogContent').innerHTML=`<div class="work-dialog-layout">${coverHtml(work,'work-dialog-cover')}<div class="work-dialog-body"><div class="work-dialog-info"><p class="eyebrow">${escapeHtml(context||'PUBLIC BOOK')}</p><h2>${escapeHtml(work.title||'Untitled')}</h2><p class="work-byline">${escapeHtml(work.byline||shelfData.author?.displayName||'')}</p></div>${work.description?`<p class="work-description">${escapeHtml(work.description)}</p>`:''}<a class="read-link" href="${escapeHtml(publicPlayerUrl(work))}">この本を読む</a></div></div>`;
  openDialog('workDialog');
}

function openDialog(id){const dialog=$(`#${id}`);if(!dialog)return;dialog.showModal();document.body.classList.add('dialog-open');}
function closeDialog(id){const dialog=$(`#${id}`);if(dialog?.open)dialog.close();if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');}

async function shareShelf(){
  const data={title:document.title,text:`${shelfData.author?.displayName||'作者'}の公開本棚`,url:location.href};
  if(navigator.share){try{await navigator.share(data);return;}catch(error){if(error?.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(location.href);showToast('本棚URLをコピーしました。');}catch(_){showToast('URLをコピーできませんでした。');}
}

document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>closeDialog(button.dataset.close));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('cancel',()=>setTimeout(()=>document.body.classList.remove('dialog-open'),0));dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog(dialog.id);});});
$('#retryButton').onclick=loadShelf;
$('#shareShelfButton').onclick=shareShelf;
loadShelf();
