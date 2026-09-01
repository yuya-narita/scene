(()=>{
'use strict';
const API='https://scene-studio-api.a-hako.workers.dev';
const $=s=>document.querySelector(s);
let token=sessionStorage.getItem('ahako-admin-token')||'';
let lastStats=null;
const els={login:$('#loginPanel'),content:$('#adminContent'),token:$('#tokenInput'),connect:$('#connectButton'),loginStatus:$('#loginStatus'),refresh:$('#refreshButton'),filter:$('#reportFilter'),list:$('#reportList'),openCount:$('#openCount'),shownCount:$('#shownCount'),workCount:$('#workCount'),publishedCount:$('#publishedCount'),suspendedCount:$('#suspendedCount'),r2Usage:$('#r2Usage'),assetCount:$('#assetCount'),heavyWorks:$('#heavyWorks'),orphanSummary:$('#orphanSummary'),orphanNote:$('#orphanNote'),cleanupOrphans:$('#cleanupOrphansButton'),todayViews:$('#todayViews'),todayCompletions:$('#todayCompletions'),todaySceneAdvances:$('#todaySceneAdvances'),todayCompletionRate:$('#todayCompletionRate'),popularWorks:$('#popularWorks'),readerTodayViews:$('#readerTodayViews'),readerTodayCompletions:$('#readerTodayCompletions'),readerTodaySceneAdvances:$('#readerTodaySceneAdvances'),readerTodayCompletionRate:$('#readerTodayCompletionRate'),readerTodayStudio:$('#readerTodayStudio'),readerTodayOfficial:$('#readerTodayOfficial'),readerSites:$('#readerSites'),readerModes:$('#readerModes'),workId:$('#workIdInput'),inspect:$('#inspectButton'),direct:$('#directResult')};
if(token)els.token.value=token;
function headers(){return {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'};}
async function api(path,options={}){const r=await fetch(API+path,{...options,headers:{...headers(),...(options.headers||{})},cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok||!data.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;throw e;}return data;}
function toast(text){const n=document.createElement('div');n.className='toast';n.textContent=text;document.body.append(n);setTimeout(()=>n.remove(),1800);}
const reasonLabel=r=>({copyright:'第三者の著作物・権利侵害',unauthorized:'自分の作品が無断で使用されている',other:'その他'})[r]||r;
const subjectLabel=s=>({text:'本文・文章',cover:'表紙',image:'背景・画像',audio:'BGM・SE・音声',other:'その他'})[s]||s||'不明';
async function connect(){token=els.token.value.trim();if(!token){els.loginStatus.textContent='ADMIN_TOKENを入力してください。';return;}els.connect.disabled=true;try{await api('/admin/stats');sessionStorage.setItem('ahako-admin-token',token);els.loginStatus.textContent='';els.login.hidden=true;els.content.hidden=false;els.refresh.disabled=false;await loadDashboard();}catch(e){els.loginStatus.textContent=e.status===401?'ADMIN_TOKENが違います。':`接続できません: ${e.message}`;}finally{els.connect.disabled=false;}}

function formatBytes(bytes){
  const n=Number(bytes||0);
  if(n<1024)return `${n} B`;
  const units=['KB','MB','GB','TB'];
  let v=n/1024,i=0;
  while(v>=1024&&i<units.length-1){v/=1024;i++;}
  const digits=v>=100?0:v>=10?1:2;
  return `${v.toFixed(digits)} ${units[i]}`;
}
async function loadStats(){
  if(els.heavyWorks)els.heavyWorks.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const d=await api('/admin/stats');
    lastStats=d;
    els.workCount.textContent=Number(d.works?.total||0).toLocaleString('ja-JP');
    els.publishedCount.textContent=Number(d.works?.published||0).toLocaleString('ja-JP');
    els.suspendedCount.textContent=Number(d.works?.suspended||0).toLocaleString('ja-JP');
    els.r2Usage.textContent=formatBytes(d.storage?.totalBytes||0);
    els.assetCount.textContent=Number(d.storage?.assetCount||0).toLocaleString('ja-JP');
    els.openCount.textContent=Number(d.reports?.open||0).toLocaleString('ja-JP');
    const orphanCount=Number(d.storage?.orphanAssetCount||0);
    const orphanBytes=Number(d.storage?.orphanAssetBytes||0);
    const recentCount=Number(d.storage?.recentUnreferencedCount||0);
    if(els.orphanSummary)els.orphanSummary.textContent=orphanCount?`${orphanCount.toLocaleString('ja-JP')}素材 · ${formatBytes(orphanBytes)}`:'0素材';
    if(els.orphanNote)els.orphanNote.textContent=recentCount?`ほかに公開処理保護中 ${recentCount.toLocaleString('ja-JP')}素材（24時間未満）`:'現存作品から参照されていない古い素材だけが対象です。';
    if(els.cleanupOrphans){els.cleanupOrphans.disabled=orphanCount===0;els.cleanupOrphans.textContent=orphanCount?'お掃除':'きれい';}
    renderWorkSizes(d.heaviestWorks||[]);
  }catch(e){
    if(els.heavyWorks)els.heavyWorks.innerHTML=`<div class="empty">容量情報を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
  }
}
function renderWorkSizes(rows){
  if(!els.heavyWorks)return;
  if(!rows.length){els.heavyWorks.innerHTML='<div class="empty">公開作品はありません。</div>';return;}
  els.heavyWorks.innerHTML=rows.map((w,i)=>`<div class="work-size-row">
    <span class="rank">${i+1}</span>
    <div class="work-size-main"><strong>${escapeHtml(w.title||'無題')}</strong><code>${escapeHtml(w.id)}</code></div>
    <div class="work-size-meta"><span class="state ${w.state==='suspended'?'stopped':''}">${w.state==='suspended'?'停止中':'公開中'}</span><small>${Number(w.assetCount||0)}素材</small></div>
    <strong class="bytes">${escapeHtml(formatBytes(w.approxBytes||0))}</strong>
  </div>`).join('');
}
async function cleanupOrphans(){
  const count=Number(lastStats?.storage?.orphanAssetCount||0);
  const bytes=Number(lastStats?.storage?.orphanAssetBytes||0);
  if(!count){toast('お掃除対象はありません');return;}
  if(!confirm(`未参照素材 ${count.toLocaleString('ja-JP')}件（${formatBytes(bytes)}）をR2から完全削除します。\n\n現存作品が参照している素材と、アップロードから24時間未満の素材は削除しません。\nこの操作は元に戻せません。`))return;
  els.cleanupOrphans.disabled=true;
  els.cleanupOrphans.textContent='掃除中…';
  try{
    const d=await api('/admin/orphans/cleanup',{method:'POST'});
    toast(`${Number(d.deletedCount||0).toLocaleString('ja-JP')}素材・${formatBytes(d.deletedBytes||0)}を削除しました`);
    if(d.errors?.length)alert(`一部の素材を削除できませんでした（${d.errors.length}件）。安全のため残しています。`);
    await loadDashboard();
  }catch(e){
    alert(`お掃除できませんでした: ${e.message}`);
    await loadStats();
  }
}
function formatRate(done,views){
  const v=Number(views||0);
  if(!v)return '–';
  return `${((Number(done||0)/v)*100).toFixed(1)}%`;
}
function renderPopularWorks(rows){
  if(!els.popularWorks)return;
  if(!rows.length){els.popularWorks.innerHTML='<div class="empty">まだ閲覧データはありません。</div>';return;}
  els.popularWorks.innerHTML=rows.map((w,i)=>`<div class="popular-work-row">
    <span class="rank">${i+1}</span>
    <div class="popular-work-main"><strong>${escapeHtml(w.title||'無題')}</strong><code>${escapeHtml(w.workId||'')}</code></div>
    <div class="popular-metrics"><span><b>${Number(w.views||0).toLocaleString('ja-JP')}</b><small>閲覧</small></span><span><b>${Number(w.completions||0).toLocaleString('ja-JP')}</b><small>読了</small></span><span><b>${escapeHtml(formatRate(w.completions,w.views))}</b><small>読了率</small></span><span><b>${Number(w.sceneAdvances||0).toLocaleString('ja-JP')}</b><small>Scene</small></span></div>
  </div>`).join('');
}
async function loadAnalytics(){
  if(els.popularWorks)els.popularWorks.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const d=await api('/admin/analytics?days=7');
    const t=d.today||{};
    els.todayViews.textContent=Number(t.views||0).toLocaleString('ja-JP');
    els.todayCompletions.textContent=Number(t.completions||0).toLocaleString('ja-JP');
    els.todaySceneAdvances.textContent=Number(t.sceneAdvances||0).toLocaleString('ja-JP');
    els.todayCompletionRate.textContent=formatRate(t.completions,t.views);
    renderPopularWorks(d.popularWorks||[]);
  }catch(e){
    if(els.popularWorks)els.popularWorks.innerHTML=`<div class="empty">閲覧情報を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
  }
}

const readerSiteLabel=s=>({note:'note',narou:'小説家になろう',kakuyomu:'カクヨム',alphapolis:'アルファポリス',pixiv:'pixiv',hameln:'ハーメルン',other:'その他'})[s]||s||'その他';
const readerModeLabel=m=>({selection:'選択範囲',auto:'本文自動抽出','page-fallback':'ページ全文',other:'その他'})[m]||m||'その他';
function renderReaderBreakdown(node,rows,labeler){
  if(!node)return;
  if(!rows?.length){node.innerHTML='<div class="empty">まだデータはありません。</div>';return;}
  node.innerHTML=rows.map((row,i)=>`<div class="reader-stat-row"><span class="rank">${i+1}</span><strong>${escapeHtml(labeler(row.key))}</strong><span><b>${Number(row.views||0).toLocaleString('ja-JP')}</b><small>起動</small></span><span><b>${Number(row.completions||0).toLocaleString('ja-JP')}</b><small>読了</small></span><span><b>${escapeHtml(formatRate(row.completions,row.views))}</b><small>読了率</small></span></div>`).join('');
}
async function loadReaderAnalytics(){
  if(els.readerSites)els.readerSites.innerHTML='<div class="empty">読み込み中…</div>';
  if(els.readerModes)els.readerModes.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const d=await api('/admin/reader-analytics?days=7');
    const t=d.today||{};
    els.readerTodayViews.textContent=Number(t.views||0).toLocaleString('ja-JP');
    els.readerTodayCompletions.textContent=Number(t.completions||0).toLocaleString('ja-JP');
    els.readerTodaySceneAdvances.textContent=Number(t.sceneAdvances||0).toLocaleString('ja-JP');
    els.readerTodayCompletionRate.textContent=formatRate(t.completions,t.views);
    els.readerTodayStudio.textContent=Number(t.outbound?.studio||0).toLocaleString('ja-JP');
    els.readerTodayOfficial.textContent=Number(t.outbound?.official||0).toLocaleString('ja-JP');
    renderReaderBreakdown(els.readerSites,d.sites||[],readerSiteLabel);
    renderReaderBreakdown(els.readerModes,d.modes||[],readerModeLabel);
  }catch(e){
    if(els.readerSites)els.readerSites.innerHTML=`<div class="empty">Reader情報を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
    if(els.readerModes)els.readerModes.innerHTML='';
  }
}

async function loadDashboard(){await Promise.all([loadStats(),loadReports(),loadAnalytics(),loadReaderAnalytics()]);}

async function loadReports(){const status=els.filter.value;els.list.innerHTML='<div class="empty">読み込み中…</div>';try{const [shown,open]=await Promise.all([api(`/admin/reports?status=${encodeURIComponent(status)}`),api('/admin/reports?status=open')]);els.openCount.textContent=open.count;els.shownCount.textContent=shown.count;renderReports(shown.reports);}catch(e){els.list.innerHTML=`<div class="empty">読み込めませんでした: ${escapeHtml(e.message)}</div>`;}}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderReports(rows){
  if(!rows.length){els.list.innerHTML='<div class="empty">報告はありません。</div>';return;}
  const groups=new Map();
  for(const r of rows){
    const key=r.workId||r.id;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(r);
  }
  els.list.innerHTML=[...groups.entries()].map(([workId,reports])=>{
    reports.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const r=reports[0];
    const target=r.url||r.sourceUrl||`${API}/work/${encodeURIComponent(workId)}`;
    const allDeleted=reports.every(x=>x.status==='deleted');
    const allResolved=!allDeleted&&reports.every(x=>x.status==='resolved');
    const claims=reports.map((x,i)=>{
      const evidence=x.evidenceUrl||'';
      const details=x.details||'';
      const contact=x.contact||'';
      const legacy=!x.subject&&!x.details&&!x.evidenceUrl;
      return `<div class="claim-item ${x.status==='deleted'?'is-deleted-claim':x.status==='resolved'?'is-resolved-claim':''}" data-report-id="${escapeHtml(x.id)}">
        <div class="claim-item-head"><div><strong>${escapeHtml(reasonLabel(x.reason))}</strong><span class="subject-badge">${escapeHtml(subjectLabel(x.subject))}</span>${legacy?'<span class="legacy-badge">旧形式・情報不足</span>':''}${x.status==='deleted'?'<span class="deleted-badge">作品削除済み</span>':x.status==='resolved'?'<span class="resolved-badge">対応済み</span>':''}</div><time>${escapeHtml(new Date(x.createdAt).toLocaleString('ja-JP'))}</time></div>
        ${details?`<div class="claim-detail"><small>申立て内容</small><p>${escapeHtml(details)}</p></div>`:''}
        <div class="meta claim-meta"><span>原作品</span>${evidence?`<a class="inline-link" href="${escapeHtml(evidence)}" target="_blank" rel="noopener noreferrer">${escapeHtml(evidence)}</a>`:'<em>未提出</em>'}<span>連絡先</span>${contact?`<a class="inline-link" href="mailto:${escapeHtml(contact)}">${escapeHtml(contact)}</a>`:'<em>未提出</em>'}</div>
        ${evidence?`<div class="claim-links"><a class="evidence" href="${escapeHtml(evidence)}" target="_blank" rel="noopener noreferrer">原作品を見る</a></div>`:''}
      </div>`;
    }).join('');
    const deletedAt=reports.find(x=>x.workDeletedAt)?.workDeletedAt||'';
    const actions=allDeleted
      ? `<div class="actions evidence-actions deleted-actions"><span class="deleted-state">作品削除済み${deletedAt?` · ${escapeHtml(new Date(deletedAt).toLocaleString('ja-JP'))}`:''}</span></div>`
      : `<div class="actions evidence-actions"><a href="${escapeHtml(target)}" target="_blank" rel="noopener">対象作品を見る</a><button class="stop" data-group-action="suspend">一時停止</button><button data-group-action="republish">再公開</button><button data-group-action="${allResolved?'reopen':'resolve'}">${allResolved?'全件を未対応へ':'全件を対応済み'}</button><button class="delete" data-group-action="delete">完全削除</button></div>`;
    return `<article class="report-card work-group ${allDeleted?'is-deleted':allResolved?'is-resolved':''}" data-work="${escapeHtml(workId)}">
      <div class="report-top group-top"><div><h3>workId ${escapeHtml(workId)}</h3>${reports.length>1?`<span class="duplicate-badge">報告 ${reports.length}件</span>`:''}${allDeleted?'<span class="deleted-badge">作品削除済み</span>':''}</div><time>最新 ${escapeHtml(new Date(r.createdAt).toLocaleString('ja-JP'))}</time></div>
      <div class="meta group-meta"><span>対象URL</span><code>${escapeHtml(target)}</code></div>
      <div class="claim-stack">${claims}</div>
      ${actions}
    </article>`;
  }).join('');
}
async function moderate(workId,action){if(action==='delete'){if(!confirm(`【完全削除】\nworkId ${workId} の作品本体と、他作品が使用していない関連素材をR2から削除します。\nこの操作は元に戻せません。`))return false;const typed=prompt(`誤操作防止のため、削除する workId を入力してください。\n\n${workId}`,'');if(typed===null)return false;if(typed.trim()!==workId){alert('workIdが一致しないため削除を中止しました。');return false;}await api(`/admin/work/${encodeURIComponent(workId)}`,{method:'DELETE'});toast('完全削除しました');return true;}await api(`/admin/work/${encodeURIComponent(workId)}/${action}`,{method:'POST'});toast(action==='suspend'?'一時停止しました':'再公開しました');return true;}
els.list.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-group-action]');if(!b)return;
  const card=b.closest('.work-group');const action=b.dataset.groupAction;const workId=card.dataset.work;
  b.disabled=true;
  try{
    if(action==='resolve'||action==='reopen'){
      const ids=[...card.querySelectorAll('.claim-item')].map(n=>n.dataset.reportId).filter(Boolean);
      await Promise.all(ids.map(id=>api(`/admin/report/${encodeURIComponent(id)}/${action}`,{method:'POST'})));
      toast(action==='resolve'?`${ids.length}件を対応済みにしました`:`${ids.length}件を未対応へ戻しました`);
    }else{
      const done=await moderate(workId,action);if(done===false)return;
    }
    await loadDashboard();
  }catch(err){alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
async function inspect(){const id=els.workId.value.trim();if(!id)return;els.direct.textContent='確認中…';try{const d=await api(`/admin/work/${encodeURIComponent(id)}`);els.direct.innerHTML=`<div class="report-card"><div class="meta"><span>workId</span><code>${escapeHtml(d.id)}</code><span>状態</span><strong>${escapeHtml(d.state)}</strong><span>素材</span><span>${Number(d.assets?.length||0)}件</span></div><div class="actions"><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener">作品を見る</a><button data-direct="suspend" class="stop">一時停止</button><button data-direct="republish">再公開</button><button data-direct="delete" class="delete">完全削除</button></div></div>`;}catch(e){els.direct.textContent=`確認できません: ${e.message}`;}}
els.direct.addEventListener('click',async e=>{const b=e.target.closest('button[data-direct]');if(!b)return;const id=els.workId.value.trim();b.disabled=true;try{await moderate(id,b.dataset.direct);await inspect();await loadDashboard();}catch(err){alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}});
if(els.cleanupOrphans)els.cleanupOrphans.addEventListener('click',cleanupOrphans);
els.connect.addEventListener('click',connect);els.token.addEventListener('keydown',e=>{if(e.key==='Enter')connect();});els.refresh.addEventListener('click',loadDashboard);els.filter.addEventListener('change',loadReports);els.inspect.addEventListener('click',inspect);
if(token)connect();
})();
