(()=>{
'use strict';
const API='https://scene-studio-api.a-hako.workers.dev';
const $=s=>document.querySelector(s);
let token=sessionStorage.getItem('ahako-admin-token')||'';
const els={login:$('#loginPanel'),content:$('#adminContent'),token:$('#tokenInput'),connect:$('#connectButton'),loginStatus:$('#loginStatus'),refresh:$('#refreshButton'),filter:$('#reportFilter'),list:$('#reportList'),openCount:$('#openCount'),shownCount:$('#shownCount'),workId:$('#workIdInput'),inspect:$('#inspectButton'),direct:$('#directResult')};
if(token)els.token.value=token;
function headers(){return {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'};}
async function api(path,options={}){const r=await fetch(API+path,{...options,headers:{...headers(),...(options.headers||{})},cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok||!data.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;throw e;}return data;}
function toast(text){const n=document.createElement('div');n.className='toast';n.textContent=text;document.body.append(n);setTimeout(()=>n.remove(),1800);}
const reasonLabel=r=>({copyright:'第三者の著作物・権利侵害',unauthorized:'自分の作品が無断で使用されている',other:'その他'})[r]||r;
const subjectLabel=s=>({text:'本文・文章',cover:'表紙',image:'背景・画像',audio:'BGM・SE・音声',other:'その他'})[s]||s||'不明';
async function connect(){token=els.token.value.trim();if(!token){els.loginStatus.textContent='ADMIN_TOKENを入力してください。';return;}els.connect.disabled=true;try{await api('/admin/reports?status=open');sessionStorage.setItem('ahako-admin-token',token);els.loginStatus.textContent='';els.login.hidden=true;els.content.hidden=false;els.refresh.disabled=false;await loadReports();}catch(e){els.loginStatus.textContent=e.status===401?'ADMIN_TOKENが違います。':`接続できません: ${e.message}`;}finally{els.connect.disabled=false;}}
async function loadReports(){const status=els.filter.value;els.list.innerHTML='<div class="empty">読み込み中…</div>';try{const [shown,open]=await Promise.all([api(`/admin/reports?status=${encodeURIComponent(status)}`),api('/admin/reports?status=open')]);els.openCount.textContent=open.count;els.shownCount.textContent=shown.count;renderReports(shown.reports);}catch(e){els.list.innerHTML=`<div class="empty">読み込めませんでした: ${escapeHtml(e.message)}</div>`;}}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderReports(rows){
  if(!rows.length){els.list.innerHTML='<div class="empty">報告はありません。</div>';return;}
  els.list.innerHTML=rows.map(r=>{
    const target=r.url||r.sourceUrl||`${API}/work/${encodeURIComponent(r.workId)}`;
    const evidence=r.evidenceUrl||'';
    const details=r.details||'';
    const contact=r.contact||'';
    const legacy=!r.subject&&!r.details&&!r.evidenceUrl;
    return `<article class="report-card ${r.status==='resolved'?'is-resolved':''}" data-report="${escapeHtml(r.id)}" data-work="${escapeHtml(r.workId)}">
      <div class="report-top"><div><h3>${escapeHtml(reasonLabel(r.reason))}</h3><span class="subject-badge">${escapeHtml(subjectLabel(r.subject))}</span>${legacy?'<span class="legacy-badge">旧形式・情報不足</span>':''}</div><time>${escapeHtml(new Date(r.createdAt).toLocaleString('ja-JP'))}</time></div>
      ${details?`<div class="claim-detail"><small>申立て内容</small><p>${escapeHtml(details)}</p></div>`:''}
      <div class="meta">
        <span>workId</span><code>${escapeHtml(r.workId)}</code>
        <span>対象URL</span><code>${escapeHtml(target)}</code>
        <span>原作品</span>${evidence?`<a class="inline-link" href="${escapeHtml(evidence)}" target="_blank" rel="noopener noreferrer">${escapeHtml(evidence)}</a>`:'<em>未提出</em>'}
        <span>連絡先</span>${contact?`<a class="inline-link" href="mailto:${escapeHtml(contact)}">${escapeHtml(contact)}</a>`:'<em>未提出</em>'}
      </div>
      <div class="actions evidence-actions"><a href="${escapeHtml(target)}" target="_blank" rel="noopener">対象作品を見る</a>${evidence?`<a class="evidence" href="${escapeHtml(evidence)}" target="_blank" rel="noopener noreferrer">原作品を見る</a>`:''}<button class="stop" data-action="suspend">一時停止</button><button data-action="republish">再公開</button><button data-action="${r.status==='resolved'?'reopen':'resolve'}">${r.status==='resolved'?'未対応へ戻す':'対応済み'}</button><button class="delete" data-action="delete">完全削除</button></div>
    </article>`;
  }).join('');
}
async function moderate(workId,action){if(action==='delete'){if(!confirm(`workId ${workId} を完全削除します。作品本体と、他作品が使用していない関連素材がR2から削除されます。続けますか？`))return;await api(`/admin/work/${encodeURIComponent(workId)}`,{method:'DELETE'});toast('完全削除しました');return;}await api(`/admin/work/${encodeURIComponent(workId)}/${action}`,{method:'POST'});toast(action==='suspend'?'一時停止しました':'再公開しました');}
els.list.addEventListener('click',async e=>{const b=e.target.closest('button[data-action]');if(!b)return;const card=b.closest('.report-card');const action=b.dataset.action;const workId=card.dataset.work;const reportId=card.dataset.report;b.disabled=true;try{if(action==='resolve'||action==='reopen'){await api(`/admin/report/${encodeURIComponent(reportId)}/${action}`,{method:'POST'});toast(action==='resolve'?'対応済みにしました':'未対応へ戻しました');}else{await moderate(workId,action);}await loadReports();}catch(err){alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}});
async function inspect(){const id=els.workId.value.trim();if(!id)return;els.direct.textContent='確認中…';try{const d=await api(`/admin/work/${encodeURIComponent(id)}`);els.direct.innerHTML=`<div class="report-card"><div class="meta"><span>workId</span><code>${escapeHtml(d.id)}</code><span>状態</span><strong>${escapeHtml(d.state)}</strong><span>素材</span><span>${Number(d.assets?.length||0)}件</span></div><div class="actions"><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener">作品を見る</a><button data-direct="suspend" class="stop">一時停止</button><button data-direct="republish">再公開</button><button data-direct="delete" class="delete">完全削除</button></div></div>`;}catch(e){els.direct.textContent=`確認できません: ${e.message}`;}}
els.direct.addEventListener('click',async e=>{const b=e.target.closest('button[data-direct]');if(!b)return;const id=els.workId.value.trim();b.disabled=true;try{await moderate(id,b.dataset.direct);await inspect();await loadReports();}catch(err){alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}});
els.connect.addEventListener('click',connect);els.token.addEventListener('keydown',e=>{if(e.key==='Enter')connect();});els.refresh.addEventListener('click',loadReports);els.filter.addEventListener('change',loadReports);els.inspect.addEventListener('click',inspect);
if(token)connect();
})();
