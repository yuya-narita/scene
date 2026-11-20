(()=>{'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const genres=[['fantasy','ファンタジー'],['romance','恋愛'],['horror','ホラー'],['mystery','ミステリ'],['sf','SF'],['everyday','日常'],['essay','エッセイ'],['other','その他']];
const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('ja');
const safeImage=s=>{try{const u=new URL(s,location.href);return u.protocol==='https:'||u.protocol==='http:'?u.href:'';}catch{return '';}};
window.AhakoAdminPicker={cover(w){const src=w?.coverUrl&&safeImage(w.coverUrl);return src?`<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:'<span class="picker-cover-fallback">表紙なし</span>';},create({api,getWorks,choose,getCurrent,episode}){
 const dialog=$('#workPicker'),scroll=$('#pickerScroll');let genre='',status='',shown=24,summary=new Map(),loading=false,failed=false,generation=0,scrollTop=0,previousOverflow='',opener=null;
 const label=id=>genres.find(g=>g[0]===id)?.[1]||'その他';
 const state=(id)=>summary.get(id);
 function render(){
  const works=getWorks(),q=normalize($('#pickerSearch').value.trim());
  const filtered=works.filter(w=>(!genre||(w.genre||'other')===genre)&&(!q||normalize([w.title,w.episodeLabel,w.episodeTitle,w.subtitle,w.author?.displayName,w.publicationId].join(' ')).includes(q))&&(!status||(state(w.publicationId)&&(status==='empty'?state(w.publicationId).draft+state(w.publicationId).published===0:state(w.publicationId)[status]>0))));
  $('#pickerGenres').innerHTML=[['','すべてのジャンル'],...genres].map(([id,text])=>`<button type="button" data-picker-genre="${id}" aria-pressed="${genre===id}" aria-controls="pickerBooks">${text}</button>`).join('');
  $('#pickerStatuses').innerHTML=[['','すべて'],['empty','POP未作成'],['draft','下書きあり'],['published','公開中']].map(([id,text])=>`<button type="button" data-picker-status="${id}" aria-pressed="${status===id}" aria-controls="pickerBooks" ${id&&(loading||failed)?'disabled':''}>${text}</button>`).join('');
  $('#pickerBooks').innerHTML=filtered.slice(0,shown).map(w=>{const st=state(w.publicationId),badges=st?[(st.published?`公開中 ${st.published}枚`:''),(st.draft?`下書き ${st.draft}枚`:'')].filter(Boolean).join(' / ')||'POP未作成':loading?'状態を確認中…':'状態未確認';return `<button type="button" class="picker-book" data-picker-work="${esc(w.publicationId)}" aria-pressed="${getCurrent()===w.publicationId}"><span class="picker-cover">${window.AhakoAdminPicker.cover(w)}</span><strong>${esc(w.title||'無題')}</strong><span class="picker-episode">${esc(episode(w)||'話数・各話タイトル未設定')}</span><span class="picker-author">${esc(w.author?.displayName||'作者')}</span><span class="picker-genre">${esc(label(w.genre))}</span><span class="picker-badge">${esc(badges)}</span></button>`;}).join('');
  $('#pickerCount').textContent=`${filtered.length}作品中、${Math.min(shown,filtered.length)}作品を表示`;
  $('#pickerEmpty').hidden=filtered.length>0;$('#pickerMore').hidden=shown>=filtered.length;
  $('#pickerStatus').textContent=loading?'POPの状態を読み込んでいます…':failed?'POPの状態を取得できませんでした。作品は選べます。WorkerをV1.25へ更新して再読み込みしてください。':'';$('#pickerRetry').hidden=!failed;
  for(const img of $('#pickerBooks').querySelectorAll('img'))img.onerror=()=>{img.replaceWith(Object.assign(document.createElement('span'),{className:'picker-cover-fallback',textContent:'表紙なし'}));};
 }
 async function refresh(){const run=++generation;loading=true;failed=false;status='';summary=new Map();render();try{const ids=getWorks().map(w=>w.publicationId);for(let i=0;i<ids.length;i+=50){const d=await api('/admin/bookstore2/pop-summary?publicationIds='+encodeURIComponent(ids.slice(i,i+50).join(',')));if(run!==generation)return;for(const id of ids.slice(i,i+50)){const st=d.summary?.[id];if(!st||!Number.isInteger(st.draft)||!Number.isInteger(st.published))throw Error('POPの状態を確認できませんでした。');summary.set(id,st);}}}catch{if(run!==generation)return;failed=true;}finally{if(run===generation){loading=false;render();}}}
 function open(){if(dialog.open)return;opener=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';render();dialog.showModal();scroll.scrollTop=scrollTop;$('#workPickerTitle').focus({preventScroll:true});}
 function close(){if(dialog.open)dialog.close();}
 dialog.addEventListener('close',()=>{scrollTop=scroll.scrollTop;document.body.style.overflow=previousOverflow;opener?.focus?.({preventScroll:true});});
 $('#openWorkPicker').onclick=open;$('#closeWorkPicker').onclick=close;
 $('#pickerSearch').addEventListener('input',()=>{shown=24;render();});
 for(const [container,key]of [['#pickerGenres','genre'],['#pickerStatuses','status']])$(container).addEventListener('click',e=>{const b=e.target.closest(`[data-picker-${key}]`);if(!b||b.disabled)return;if(key==='genre')genre=b.dataset.pickerGenre;else status=b.dataset.pickerStatus;shown=24;render();[...$(container).querySelectorAll('button')].find(x=>x.getAttribute('data-picker-'+key)===b.getAttribute('data-picker-'+key))?.focus({preventScroll:true});});
 let choosing=false;$('#pickerBooks').addEventListener('click',async e=>{const b=e.target.closest('[data-picker-work]');if(!b||choosing)return;choosing=true;try{if(await choose(b.dataset.pickerWork))close();}finally{choosing=false;}});
 $('#pickerMore').onclick=()=>{shown+=24;render();};$('#pickerRetry').onclick=refresh;
 return {open,close,refresh,render,update(id,rows){summary.set(id,{draft:rows.filter(r=>r.status==='draft').length,published:rows.filter(r=>r.status==='published').length});if(dialog.open)render();},clear(){generation++;close();summary.clear();genre='';status='';shown=24;scrollTop=0;$('#pickerSearch').value='';loading=false;failed=false;}};
}};
})();
