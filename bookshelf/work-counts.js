(()=>{'use strict';
const instances=new Set(),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),number=n=>Math.max(0,Number(n)||0).toLocaleString('ja-JP');
window.AhakoAuthorCounts={reset(){for(const i of instances)i.reset();},mount({node,detailNode,workId,publicationId,request,hasAuth}){
 if(!node)return;for(const i of instances)if(!i.node.isConnected){i.reset();instances.delete(i);}
 let period='7',ticket=0,state={},offer=null,alive=true;
 const current=run=>run===ticket&&node.isConnected;
 const periods=()=>`<div class="work-count-period" role="group" aria-label="集計期間">${[['7','7日'],['30','30日'],['all','累計']].map(([v,label])=>`<button type="button" data-count-period="${v}" aria-pressed="${period===v}">${label}</button>`).join('')}</div>`;
 function paint(target,html){const wasOpen=target.querySelector('details')?.open,active=document.activeElement,inside=active&&target.contains(active),selector=inside?(active.hasAttribute('data-count-period')?`[data-count-period="${active.dataset.countPeriod}"]`:active.hasAttribute('data-count-refresh')?'[data-count-refresh]':active.tagName==='SUMMARY'?'summary':null):null;target.innerHTML=html;if(wasOpen&&target.querySelector('details'))target.querySelector('details').open=true;if(selector)target.querySelector(selector)?.focus?.({preventScroll:true});}
 const cell=(label,value,unit='')=>`<div class="work-count-card"><span>${label}</span><strong>${value}${unit&&/^[0-9,]+$/.test(value)?`<small>${unit}</small>`:''}</strong></div>`;
 const error=(prefix,e)=>`<p class="work-count-error">${esc(prefix)}${esc(e?.message||'通信状態を確認して再度更新してください。')}</p>`;
 const readingValue=key=>state.reading?state.reading.measured?number(state.reading.counts?.[key]):'未計測':state.readingError?'取得不可':'…';
 const received=()=>state.receipts?number(state.receipts.received):state.receiptError?'取得不可':'…';
 function salesLine(){const d=state.sales;if(state.salesError)return error('売上を取得できませんでした。',state.salesError);if(!d)return '<p class="work-count-note">購入と売上を確認しています…</p>';if(offer?.available&&offer.mode==='free'&&!d.purchases&&!d.gross)return `<div class="work-count-salesline"><span>現在は無料で配布しています</span><span>無料受取 <b>${state.receipts?number(state.receipts.freeReceived):state.receiptError?'取得不可':'…'}</b> 冊</span></div>`;return `<div class="work-count-salesline"><span>購入 <b>${number(d.purchases)}</b> 件</span><span>売上 <b>¥${number(d.gross)}</b><small>（返金前）</small></span></div>`;}
 function draw(){
  const head=`<div class="work-count-head"><h3>作品への反応</h3>${periods()}</div>`;
  if(state.login){paint(node,head+'<p class="work-count-note">件数を見るには、上部の作者ログインからこの作品の作者としてログインしてください。</p><button type="button" data-count-refresh class="work-count-refresh">更新</button>');if(detailNode)paint(detailNode,node.innerHTML);return;}
  const definitions=`「読みはじめ」「最後まで」は公開Playerの読書セッション数です。同じ人の再訪も含みます。「最後まで」は全文読了で、試し読み完了は別に集計します。${state.reading?.measured?` 計測開始：${esc(state.reading.firstDay)}。開始後、期間内の記録がない項目は0です。`:' この作品には新方式の記録がまだない場合があります。'} 従来のMY COPY集計は合算していません。`;
  paint(node,head+`<div class="work-count-grid">${cell('読みはじめ',readingValue('read_start'),'回')}${cell('最後まで',readingValue('full_complete'),'回')}${cell('本棚に届いた',received(),'冊')}</div>${salesLine()}${state.readingError?error('読書の件数を取得できませんでした。',state.readingError):''}${state.receiptError?error('受取数を取得できませんでした。',state.receiptError):''}${/^[A-Za-z0-9_-]{12,80}$/.test(workId||'')?`<a class="work-reading-link" href="reading-records.html?work=${encodeURIComponent(workId)}">詳しい読書記録を見る</a>`:''}<details class="work-count-definitions"><summary>数字の見方</summary><p>${definitions} 本棚に届いた冊数は保存を確認したMY COPYです。有料・無料・テスト配布を含みます。</p><button type="button" class="work-count-refresh" data-count-refresh>更新</button></details>`);
  if(!detailNode)return;
  const d=state.sales,r=state.receipts;
  const row=(label,value,unit='')=>`<div class="work-count-row"><span>${label}</span><b>${value}${unit&&/^[0-9,]+$/.test(value)?`<small>${unit}</small>`:''}</b></div>`;
  paint(detailNode,`<div class="work-count-head"><h3>読まれ方</h3>${periods()}</div><section class="work-count-reading">${row('読みはじめ',readingValue('read_start'),'回')}${row('試し読みの終わりまで',readingValue('preview_complete'),'回')}${row('全文を最後まで',readingValue('full_complete'),'回')}<p class="work-count-note">再訪を含む回数です。人数・読了率には換算しません。</p>${state.readingError?error('',state.readingError):''}</section><section class="work-count-receipt"><h3>自分の一冊に</h3>${row('本棚に届いた',received(),'冊')}${r?row('うち無料受取',number(r.freeReceived),'冊'):''}${d&&(!(offer?.available&&offer.mode==='free')||d.purchases||d.gross)?row('購入',number(d.purchases),'件')+row('売上（返金前）','¥'+number(d.gross)):''}${state.salesError?error('売上：',state.salesError):''}${state.receiptError?error('受取：',state.receiptError):''}</section><details class="work-count-definitions"><summary>計測範囲と数字の見方</summary><p>${definitions}</p><p>受取は保存確認済みの一冊です。有料・無料・テスト配布を含み、未送信の保存は含まれない場合があります。${r?` 購入経路の受取 ${number(r.paidReceived)}冊、経路を判別できない受取 ${number(r.unknownReceived)}冊。`:''}</p><p>購入は本番の決済確定記録のみ。決済日で集計する売上は返金前で、出金可能残高とは異なります。${d?` 作者分（返金前）：${d.authorGrossUnknown?'未確定':'¥'+number(d.authorGross)}。期間内の返金：${number(d.refunds)}件（返金日で集計）。テスト決済${number(d.testExcluded)}件${d.environmentUnknown?'・環境不明'+number(d.environmentUnknown)+'件':''}を除外。`:''}</p></details><button class="work-count-refresh" data-count-refresh type="button">件数を更新</button>`);
 }
 async function pages(kind,run,selected){let cursor='',totals={};for(let n=0;n<200;n++){const data=await request(`/author/work-counts/${encodeURIComponent(workId)}/${kind}?period=${selected}${cursor?'&cursor='+encodeURIComponent(cursor):''}`);if(!current(run))return null;for(const [k,v]of Object.entries(data.totals||{}))totals[k]=(totals[k]||0)+Number(v||0);if(!data.nextCursor)return totals;cursor=data.nextCursor;}throw Error('記録が多いため、集計を完了できませんでした。');}
 async function load(){const run=++ticket,selected=period;state={};if(!hasAuth()){state.login=true;draw();return;}draw();
 await Promise.allSettled([
 (async()=>{try{const d=await request(`/author/work-counts/${encodeURIComponent(workId)}?period=${selected}`);if(current(run))state.reading=d;}catch(e){if(current(run))state.readingError=e;}if(current(run))draw();})(),
 ...['sales','receipts'].map(kind=>(async()=>{try{const d=await pages(kind,run,selected);if(d&&current(run))state[kind]=d;}catch(e){if(current(run))state[kind==='sales'?'salesError':'receiptError']=e;}if(current(run))draw();})())
 ]);}
 function clicked(e){if(!node.isConnected)return;const b=e.target.closest('[data-count-period]');if(b){period=b.dataset.countPeriod;void load();}else if(e.target.closest('[data-count-refresh]'))void load();}
 node.addEventListener('click',clicked);detailNode?.addEventListener('click',clicked);
 const instance={node,reset(){ticket++;state={login:true};offer=null;draw();},destroy(){alive=false;ticket++;node.removeEventListener('click',clicked);detailNode?.removeEventListener('click',clicked);instances.delete(instance);}};
 for(const i of [...instances])if(i.node===node||!i.node.isConnected)i.destroy();instances.add(instance);
 if(publicationId)request('/bookstore2/offer?publicationId='+encodeURIComponent(publicationId)).then(d=>{if(alive&&node.isConnected){offer=d.offer||null;if(hasAuth())draw();}}).catch(()=>{});
 void load();return instance;
}};
})();
