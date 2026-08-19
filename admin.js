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
    const allResolved=reports.every(x=>x.status==='resolved');
    const claims=reports.map((x,i)=>{
      const evidence=x.evidenceUrl||'';
      const details=x.details||'';
      const contact=x.contact||'';
      const legacy=!x.subject&&!x.details&&!x.evidenceUrl;
      return `<div class="claim-item ${x.status==='resolved'?'is-resolved-claim':''}" data-report-id="${escapeHtml(x.id)}">
        <div class="claim-item-head"><div><strong>${escapeHtml(reasonLabel(x.reason))}</strong><span class="subject-badge">${escapeHtml(subjectLabel(x.subject))}</span>${legacy?'<span class="legacy-badge">旧形式・情報不足</span>':''}${x.status==='resolved'?'<span class="resolved-badge">対応済み</span>':''}</div><time>${escapeHtml(new Date(x.createdAt).toLocaleString('ja-JP'))}</time></div>
        ${details?`<div class="claim-detail"><small>申立て内容</small><p>${escapeHtml(details)}</p></div>`:''}
        <div class="meta claim-meta"><span>原作品</span>${evidence?`<a class="inline-link" href="${escapeHtml(evidence)}" target="_blank" rel="noopener noreferrer">${escapeHtml(evidence)}</a>`:'<em>未提出</em>'}<span>連絡先</span>${contact?`<a class="inline-link" href="mailto:${escapeHtml(contact)}">${escapeHtml(contact)}</a>`:'<em>未提出</em>'}</div>
        ${evidence?`<div class="claim-links"><a class="evidence" href="${escapeHtml(evidence)}" target="_blank" rel="noopener noreferrer">原作品を見る</a></div>`:''}
      </div>`;
    }).join('');
    return `<article class="report-card work-group ${allResolved?'is-resolved':''}" data-work="${escapeHtml(workId)}">
      <div class="report-top group-top"><div><h3>workId ${escapeHtml(workId)}</h3>${reports.length>1?`<span class="duplicate-badge">報告 ${reports.length}件</span>`:''}</div><time>最新 ${escapeHtml(new Date(r.createdAt).toLocaleString('ja-JP'))}</time></div>
      <div class="meta group-meta"><span>対象URL</span><code>${escapeHtml(target)}</code></div>
      <div class="claim-stack">${claims}</div>
      <div class="actions evidence-actions"><a href="${escapeHtml(target)}" target="_blank" rel="noopener">対象作品を見る</a><button class="stop" data-group-action="suspend">一時停止</button><button data-group-action="republish">再公開</button><button data-group-action="${allResolved?'reopen':'resolve'}">${allResolved?'全件を未対応へ':'全件を対応済み'}</button><button class="delete" data-group-action="delete">完全削除</button></div>
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
    await loadReports();
  }catch(err){alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
async function inspect(){const id=els.workId.value.trim();if(!id)return;els.direct.textContent='確認中…';try{const d=await api(`/admin/work/${encodeURIComponent(id)}`);els.direct.innerHTML=`<div class="report-card"><div class="meta"><span>workId</span><code>${escapeHtml(d.id)}</code><span>状態</span><strong>${escapeHtml(d.state)}</strong><span>素材</span><span>${Number(d.assets?.length||0)}件</span></div><div class="actions"><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener">作品を見る</a><button data-direct="suspend" class="stop">一時停止</button><button data-direct="republish">再公開</button><button data-direct="delete" class="delete">完全削除</button></div></div>`;}catch(e){els.direct.textContent=`確認できません: ${e.message}`;}}
els.direct.addEventListener('click',async e=>{const b=e.target.closest('button[data-direct]');if(!b)return;const id=els.workId.value.trim();b.disabled=true;try{await moderate(id,b.dataset.direct);await inspect();await loadReports();}catch(err){alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}});
els.connect.addEventListener('click',connect);els.token.addEventListener('keydown',e=>{if(e.key==='Enter')connect();});els.refresh.addEventListener('click',loadReports);els.filter.addEventListener('change',loadReports);els.inspect.addEventListener('click',inspect);
if(token)connect();
})();
