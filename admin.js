(()=>{
'use strict';
const API='https://scene-studio-api.a-hako.workers.dev';
const $=s=>document.querySelector(s);
let token=sessionStorage.getItem('ahako-admin-token')||'';
let lastStats=null;
let verifiedStats=null;
let commerceRuntime=null;
let currentRefundAudit=null;
async function loadCommerceRuntime(){
  commerceRuntime=await api('/commerce/status');
  let badge=document.getElementById('commerceEnvironmentBadge');
  if(!badge){badge=document.createElement('p');badge.id='commerceEnvironmentBadge';els.auditOrdersList?.parentNode.prepend(badge);}
  let riskText='';
  try{const risk=await api('/admin/commerce/risk');const held=(risk.disputes||[]).filter(x=>x.blocked).length;riskText=held?` / 異議申立て内部保留：${held}件`:'';}catch(_){riskText=' / Risk情報：未確認';}
  badge.textContent=`決済環境：${commerceRuntime.environment==='live'?'本番 LIVE':'Sandbox TEST'} / 新規購入：${commerceRuntime.paymentsEnabled?'有効':'停止'} / 売上残高購入：${commerceRuntime.balancePurchaseEnabled?'有効':'停止'}${riskText}`;
  badge.style.cssText='padding:12px;border-radius:8px;background:#fff3cd;color:#333;font-weight:bold';
}
function liveRefundPayload(orderId){
  if(commerceRuntime?.environment!=='live')return {};
  if(currentRefundAudit?.orderId!==orderId)throw new Error('返金対象の詳細を再取得してください');
  return {confirmEnvironment:'live',confirmOrderId:orderId,confirmAmount:Number(currentRefundAudit.amount)};
}
const els={login:$('#loginPanel'),content:$('#adminContent'),token:$('#tokenInput'),connect:$('#connectButton'),loginStatus:$('#loginStatus'),refresh:$('#refreshButton'),filter:$('#reportFilter'),list:$('#reportList'),openCount:$('#openCount'),shownCount:$('#shownCount'),contactFilter:$('#contactFilter'),contactList:$('#contactList'),openContactCount:$('#openContactCount'),shownContactCount:$('#shownContactCount'),contactTabBadge:$('#contactTabBadge'),authorCount:$('#authorCount'),authorList:$('#authorList'),workCount:$('#workCount'),publishedCount:$('#publishedCount'),suspendedCount:$('#suspendedCount'),r2Usage:$('#r2Usage'),assetCount:$('#assetCount'),heavyWorks:$('#heavyWorks'),orphanSummary:$('#orphanSummary'),orphanNote:$('#orphanNote'),cleanupOrphans:$('#cleanupOrphansButton'),todayViews:$('#todayViews'),todayCompletions:$('#todayCompletions'),todaySceneAdvances:$('#todaySceneAdvances'),todayCompletionRate:$('#todayCompletionRate'),popularWorks:$('#popularWorks'),readerTodayViews:$('#readerTodayViews'),readerTodayCompletions:$('#readerTodayCompletions'),readerTodaySceneAdvances:$('#readerTodaySceneAdvances'),readerTodayCompletionRate:$('#readerTodayCompletionRate'),readerTodayStudio:$('#readerTodayStudio'),readerTodayOfficial:$('#readerTodayOfficial'),readerSites:$('#readerSites'),readerModes:$('#readerModes'),distTodayReaders:$('#distTodayReaders'),distTodayCompletions:$('#distTodayCompletions'),distPeriodReaders:$('#distPeriodReaders'),distObservedCopies:$('#distObservedCopies'),distObservedWorks:$('#distObservedWorks'),distPeriodOpens:$('#distPeriodOpens'),distTopCopies:$('#distTopCopies'),distWorks:$('#distWorks'),relayPeriodCount:$('#relayPeriodCount'),relayCopies:$('#relayCopies'),relayWorks:$('#relayWorks'),relayMaxHop:$('#relayMaxHop'),relayTopCopies:$('#relayTopCopies'),relayWorksList:$('#relayWorksList'),workId:$('#workIdInput'),inspect:$('#inspectButton'),direct:$('#directResult'),reportTabBadge:$('#reportTabBadge'),reloadSelection:$('#reloadSelectionButton'),selectionStatus:$('#selectionStatus'),publishedWorksStatus:$('#publishedWorksStatus'),publishedWorks:$('#publishedWorks'),editionCandidates:$('#editionCandidates'),officialShelfItems:$('#officialShelfItems'),auditOrderId:$('#auditOrderIdInput'),auditOrderButton:$('#auditOrderButton'),auditOrderStatus:$('#auditOrderStatus'),auditOrderResult:$('#auditOrderResult'),auditOrdersList:$('#auditOrdersList'),auditOrdersStatus:$('#auditOrdersStatus'),auditOrdersReload:$('#auditOrdersReloadButton'),auditOkCount:$('#auditOkCount'),auditAlertCount:$('#auditAlertCount'),auditPendingCount:$('#auditPendingCount'),auditTabBadge:$('#auditTabBadge'),dailyReconDay:$('#dailyReconDay'),dailyReconButton:$('#dailyReconButton'),dailyReconStatus:$('#dailyReconStatus'),dailyReconResult:$('#dailyReconResult')};
if(token)els.token.value=token;
function headers(){return {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'};}
async function api(path,options={}){
  const method=String(options.method||'GET').toUpperCase();let r;
  for(let attempt=0;;attempt++){
    try{r=await fetch(API+path,{...options,headers:{...headers(),...(options.headers||{})},cache:'no-store'});break;}
    catch(error){
      if(method!=='GET'||attempt>=1||!(error instanceof TypeError)||options.signal?.aborted)throw error;
      await new Promise(resolve=>setTimeout(resolve,450));
    }
  }
  const data=await r.json().catch(()=>({}));if(!r.ok||!data.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;throw e;}return data;
}
async function apiWithTimeout(path,options={},timeoutMs=12000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await api(path,{...options,signal:controller.signal});}catch(e){if(e?.name==='AbortError')throw new Error('通信がタイムアウトしました');throw e;}finally{clearTimeout(timer);}}
function toast(text){const n=document.createElement('div');n.className='toast';n.textContent=text;document.body.append(n);setTimeout(()=>n.remove(),1800);}

function yen(value){return `¥${Math.max(0,Number(value)||0).toLocaleString('ja-JP')}`;}
function auditValue(value){
  if(value===true)return 'true';if(value===false)return 'false';if(value===null||value===undefined||value==='')return '–';
  return String(value);
}
function renderPaymentAudit(audit){
  currentRefundAudit=audit;
  if(!els.auditOrderResult)return;
  const ok=audit?.status==='ok';
  const checks=Array.isArray(audit?.checks)?audit.checks:[];
  const mismatches=checks.filter(row=>row?.ok===false);
  const errors=Array.isArray(audit?.errors)?audit.errors:[];
  const rows=checks.map(row=>`<div class="audit-check ${row.ok===false?'is-mismatch':'is-ok'}"><span>${row.ok===false?'×':'✓'}</span><code>${escapeHtml(row.name||'check')}</code><div><small>期待</small><b>${escapeHtml(auditValue(row.expected))}</b></div><div><small>実際</small><b>${escapeHtml(auditValue(row.actual))}</b></div></div>`).join('');
  const errorHtml=errors.length?`<div class="audit-errors"><strong>取得エラー</strong>${errors.map(e=>`<p>${escapeHtml(typeof e==='string'?e:JSON.stringify(e))}</p>`).join('')}</div>`:'';
  let recoveryHtml='';
  const isPaid=String(audit?.orderStatus||'')==='paid';
  const rail=String(audit?.paymentRail||'');
  const canCardRefund=ok&&isPaid&&rail==='card';
  const canBalanceRefund=ok&&isPaid&&rail==='connected_balance';
  const sandboxTestHtml=ok&&isPaid&&commerceRuntime?.environment==='test'?`<div class="audit-test-tools"><strong>Sandbox破壊テスト / 管理者非常口</strong><span>試験操作です。返金成功後はMY COPYを失効させます。</span><button type="button" data-test-missing-entitlement="${escapeHtml(audit.orderId||'')}">MY COPY欠損を発生</button>${canCardRefund?`<button type="button" data-test-full-refund="${escapeHtml(audit.orderId||'')}">カード全額返金テスト</button>`:''}${canBalanceRefund?`<button type="button" data-test-balance-refund="${escapeHtml(audit.orderId||'')}">残高全額返金（非常口）</button>`:''}</div>`:ok&&isPaid&&commerceRuntime?.environment==='live'?`<div class="audit-test-tools"><strong>本番決済</strong><span>${commerceRuntime.adminRefundEnabled?'全額返金は実資金を動かします。金額・注文を確認して実行してください。':'本番返金はまだ有効化されていません。'}</span>${commerceRuntime.adminRefundEnabled&&canCardRefund?`<button type="button" data-test-full-refund="${escapeHtml(audit.orderId||'')}">本番カード全額返金 ${yen(audit.amount)}</button>`:''}</div>`:'';
  if(!ok&&audit?.safeRecoveryAction==='REISSUE_ENTITLEMENT'){
    recoveryHtml=`<div class="audit-recovery is-safe"><strong>MY COPY権利だけが不足しています</strong><span>Stripeの金銭照合は正常です。再実行時にも再監査してから権利だけを発行します。</span><button type="button" data-recover-entitlement="${escapeHtml(audit.orderId||'')}">MY COPYを再発行</button></div>`;
  }else if(!ok){
    recoveryHtml=`<div class="audit-recovery is-blocked"><strong>RECOVERY_REQUIRED</strong><span>金銭系または原因不明の不一致です。自動で返金・送金・reversalは行いません。</span></div>`;
  }
  els.auditOrderResult.innerHTML=`<div class="audit-verdict ${ok?'is-ok':'is-mismatch'}"><small>${ok?'AUDIT OK':'MISMATCH'}</small><strong>${ok?'✓ 一致しています':'⚠ 不一致を検出'}</strong><span>${escapeHtml(audit.orderId||'')}</span></div><div class="audit-summary"><div><small>注文額</small><strong>${yen(audit.amount)}</strong></div><div><small>作者</small><strong>${yen(audit.expectedSellerAmount)}</strong></div><div><small>あ箱</small><strong>${yen(audit.expectedPlatformFee)}</strong></div><div><small>決済経路</small><strong>${escapeHtml(audit.paymentRail||'–')}</strong></div><div><small>Order状態</small><strong>${escapeHtml(audit.orderStatus||'–')}</strong></div><div><small>不一致</small><strong>${mismatches.length}</strong></div></div>${sandboxTestHtml}${recoveryHtml}${errorHtml}<div class="audit-checks">${rows||'<div class="empty">照合項目がありません。</div>'}</div><small class="audit-time">監査日時 ${escapeHtml(formatJstDate(audit.checkedAt))}</small>`;
  els.auditOrderResult.querySelectorAll('[data-recover-entitlement]').forEach(button=>button.addEventListener('click',()=>recoverEntitlement(button.dataset.recoverEntitlement,button)));
  els.auditOrderResult.querySelectorAll('[data-test-missing-entitlement]').forEach(button=>button.addEventListener('click',()=>injectMissingEntitlement(button.dataset.testMissingEntitlement,button)));
  els.auditOrderResult.querySelectorAll('[data-test-full-refund]').forEach(button=>button.addEventListener('click',()=>testFullCardRefund(button.dataset.testFullRefund,button)));
  els.auditOrderResult.querySelectorAll('[data-test-balance-refund]').forEach(button=>button.addEventListener('click',()=>testFullBalanceRefund(button.dataset.testBalanceRefund,button)));
}
function paymentRailLabel(value){const v=String(value||'card');return (v==='balance'||v==='connected_balance')?'残高':'カード';}
function auditOrderCard(row,{kind='alert',audit=null,error=''}={}){
  const mismatchCount=Array.isArray(audit?.mismatches)?audit.mismatches.length:0;
  const reason=error?error:(audit?.recoveryClass==='ENTITLEMENT_ONLY'?'MY COPY権利のみ要修復':(mismatchCount?`不一致 ${mismatchCount}件`:(audit?.errors?.length?`取得エラー ${audit.errors.length}件`:'')));
  return `<div class="audit-order-row is-${escapeHtml(kind)}" data-order-id="${escapeHtml(row.orderId||'')}"><div class="audit-order-main"><strong>${yen(row.amount)}</strong><span class="audit-order-status is-${escapeHtml(row.status||'unknown')}">${escapeHtml(row.status||'unknown')}</span><span>${escapeHtml(row.mode||'–')}</span><span>${escapeHtml(paymentRailLabel(row.paymentRail))}</span>${reason?`<span class="audit-reason">${escapeHtml(reason)}</span>`:''}</div><code>${escapeHtml(row.orderId||'')}</code><div class="audit-order-meta"><span>${escapeHtml(formatJstDate(row.paidAt||row.updatedAt||row.createdAt))}</span><span>${escapeHtml(row.workId||'')}</span></div><button class="audit-order-run" type="button" data-audit-order="${escapeHtml(row.orderId||'')}">再取得して詳細</button>${audit?`<button class="audit-order-run" type="button" data-audit-snapshot="${escapeHtml(row.orderId||'')}">一覧時の結果</button>`:''}</div>`;
}
let automaticAuditSnapshots=new Map();
function bindAuditDetailButtons(){
  els.auditOrdersList?.querySelectorAll('[data-audit-order]').forEach(button=>button.addEventListener('click',()=>{
    if(els.auditOrderId)els.auditOrderId.value=button.dataset.auditOrder||'';
    runPaymentAudit();
  }));
  els.auditOrdersList?.querySelectorAll('[data-audit-snapshot]').forEach(button=>button.addEventListener('click',()=>{
    const orderId=button.dataset.auditSnapshot||'';
    const audit=automaticAuditSnapshots.get(orderId);
    if(!audit){toast('一覧時の監査結果が見つかりません');return;}
    if(els.auditOrderId)els.auditOrderId.value=orderId;
    renderPaymentAudit(audit);
    if(els.auditOrderStatus)els.auditOrderStatus.textContent=`一覧取得時の結果：${audit.status==='ok'?'一致':'不一致があります'}（再取得していません）`;
    els.auditOrderResult?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
}
async function fetchPaymentAudit(orderId){
  if(!commerceRuntime)await loadCommerceRuntime();
  const r=await fetch(API+`/admin/commerce/order/${encodeURIComponent(orderId)}/audit`,{method:'GET',headers:headers(),cache:'no-store'});
  const data=await r.json().catch(()=>({}));
  if(data?.audit)return {audit:data.audit,httpStatus:r.status};
  throw new Error(data?.error||`HTTP ${r.status}`);
}
async function injectMissingEntitlement(orderId,button){
  if(!/^order_[a-f0-9]{32}$/.test(String(orderId||'')))return;
  if(!confirm('Sandbox破壊テストです。お金は動かさず、この注文のMY COPY参照だけを欠損させます。続けますか？'))return;
  const original=button?.textContent||'MY COPY欠損を発生';
  if(button){button.disabled=true;button.textContent='事故発生中…';}
  try{
    await api(`/admin/commerce/order/${encodeURIComponent(orderId)}/test-missing-entitlement`,{method:'POST',body:'{}'});
    toast('MY COPY欠損を発生させました。監査します');
    if(els.auditOrderId)els.auditOrderId.value=orderId;
    await runPaymentAudit();
    await loadAuditOrders();
  }catch(e){
    toast(`破壊テスト失敗: ${e.message}`);
  }finally{if(button){button.disabled=false;button.textContent=original;}}
}
async function testFullCardRefund(orderId,button){
  if(!/^order_[a-f0-9]{32}$/.test(String(orderId||'')))return;
  if(!confirm((commerceRuntime?.environment==='live'?`【本番・実資金】注文 ${orderId} / 全額 ${yen(currentRefundAudit?.amount)} を返金します。\n作者への送金取消とあ箱手数料の返金、MY COPY失効を伴います。\n続けますか？`:'Stripe Sandboxでこのカード注文を全額返金します。作者への送金取消とあ箱のapplication fee返金も実行されます。返金成功後はMY COPYも失効します。\n\nこの操作は元に戻せません。続けますか？')))return;
  const original=button?.textContent||'カード全額返金';
  if(button){button.disabled=true;button.textContent='返金処理中…';}
  try{
    const data=await api(`/admin/commerce/order/${encodeURIComponent(orderId)}/refund`,{method:'POST',body:JSON.stringify(liveRefundPayload(orderId))});
    toast(data.reused?'すでに返金済みです':'Stripeへ全額返金を送信しました');
    if(els.auditOrderId)els.auditOrderId.value=orderId;
    if(els.auditOrderStatus)els.auditOrderStatus.textContent='返金Webhookの反映を確認しています…';
    await new Promise(resolve=>setTimeout(resolve,1800));
    await runPaymentAudit();
    await loadAuditOrders();
  }catch(e){
    toast(`返金失敗: ${e.message}`);
    if(els.auditOrderStatus)els.auditOrderStatus.textContent=`返金失敗：${e.message}`;
  }finally{if(button){button.disabled=false;button.textContent=original;}}
}
async function testFullBalanceRefund(orderId,button){
  if(!/^order_[a-f0-9]{32}$/.test(String(orderId||'')))return;
  if(!confirm('管理者非常口です。Stripe上でこの売上残高注文を全額返金します。\n\n作者への送金を先に取り消し、その成功後に購入者のAccount Debitを返金します。返金成功後はMY COPYも失効します。\n\n「作品の価値が期待と違った」等の通常返金用ではありません。この操作は元に戻せません。続けますか？'))return;
  const original=button?.textContent||'残高全額返金（非常口）';
  if(button){button.disabled=true;button.textContent='返金処理中…';}
  try{
    const data=await api(`/admin/commerce/order/${encodeURIComponent(orderId)}/refund`,{method:'POST',body:JSON.stringify(liveRefundPayload(orderId))});
    toast(data.reused?'すでに返金済みです':'残高返金をStripeへ送信しました');
    if(els.auditOrderId)els.auditOrderId.value=orderId;
    if(els.auditOrderStatus)els.auditOrderStatus.textContent='返金Webhookの反映を確認しています…';
    await new Promise(resolve=>setTimeout(resolve,1800));
    await runPaymentAudit();
    await loadAuditOrders();
  }catch(e){
    toast(`残高返金失敗: ${e.message}`);
    if(els.auditOrderStatus)els.auditOrderStatus.textContent=`残高返金失敗：${e.message}`;
  }finally{if(button){button.disabled=false;button.textContent=original;}}
}
async function recoverEntitlement(orderId,button){
  if(!/^order_[a-f0-9]{32}$/.test(String(orderId||'')))return;
  const original=button?.textContent||'MY COPYを再発行';
  if(button){button.disabled=true;button.textContent='再確認中…';}
  try{
    const data=await api(`/admin/commerce/order/${encodeURIComponent(orderId)}/recover-entitlement`,{method:'POST',body:'{}'});
    toast(data.status==='recovered'?'MY COPYを再発行しました':'権利はすでに正常です');
    if(els.auditOrderId)els.auditOrderId.value=orderId;
    await runPaymentAudit();
    await loadAuditOrders();
  }catch(e){
    toast(`自動修復を停止しました: ${e.message}`);
    if(els.auditOrderStatus)els.auditOrderStatus.textContent=`自動修復を停止：${e.message}`;
  }finally{if(button){button.disabled=false;button.textContent=original;}}
}
async function mapWithConcurrency(items,limit,fn){
  const results=new Array(items.length);let next=0;
  async function worker(){while(true){const i=next++;if(i>=items.length)return;try{results[i]=await fn(items[i],i);}catch(error){results[i]={error};}}}
  await Promise.all(Array.from({length:Math.min(limit,Math.max(1,items.length))},()=>worker()));
  return results;
}
// This is an Order-state grouping, not proof of non-payment on Stripe.
// Keep payment/recovery evidence in the existing audit or unaudited groups.
function isIncompletePurchaseOrder(row){
  return String(row.status||'').toLowerCase()==='pending_payment'
    &&['','card'].includes(String(row.paymentRail||''))
    &&!row.providerPaymentIntentId&&!row.balanceDebitCapturedAt&&!row.paidAt
    &&!row.recoveryState&&!row.recoveryReason&&!row.transferSettlementState;
}
function ensureIncompletePurchaseCounter(){
  if(document.getElementById('auditIncompleteCount'))return;
  const dashboard=els.auditPendingCount?.closest('.audit-dashboard');
  if(!dashboard)return;
  const card=document.createElement('div');
  card.style.gridColumn='1 / -1';
  card.innerHTML='<small>購入手続き未完了</small><strong id="auditIncompleteCount">–</strong>';
  dashboard.appendChild(card);
}
function renderAutomaticAudit(rows,results,skipped){
  // V9 diagnostic: preserve the exact audit payload used to build this list.
  // Opening "一覧時の結果" never calls Stripe again, so intermittent mismatches cannot disappear.
  automaticAuditSnapshots=new Map();
  rows.forEach((row,i)=>{const audit=results[i]?.audit;if(audit&&row?.orderId)automaticAuditSnapshots.set(String(row.orderId),audit);});
  const ok=[];const alerts=[];
  rows.forEach((row,i)=>{
    const result=results[i]||{};
    if(result.error){alerts.push({row,error:String(result.error?.message||result.error)});return;}
    if(result.audit?.status==='ok')ok.push({row,audit:result.audit});
    else alerts.push({row,audit:result.audit,error:''});
  });
  const incomplete=skipped.filter(isIncompletePurchaseOrder);
  const unaudited=skipped.filter(row=>!isIncompletePurchaseOrder(row));
  ensureIncompletePurchaseCounter();
  const incompleteCount=document.getElementById('auditIncompleteCount');
  if(incompleteCount)incompleteCount.textContent=String(incomplete.length);
  if(els.auditOkCount)els.auditOkCount.textContent=String(ok.length);
  if(els.auditAlertCount)els.auditAlertCount.textContent=String(alerts.length);
  if(els.auditPendingCount)els.auditPendingCount.textContent=String(unaudited.length);
  if(els.auditTabBadge){els.auditTabBadge.textContent=String(alerts.length);els.auditTabBadge.hidden=alerts.length===0;}
  const alertHtml=alerts.length
    ?`<div class="audit-alert-section"><div class="audit-list-title"><strong>要確認</strong><span>${alerts.length}件</span></div>${alerts.map(x=>auditOrderCard(x.row,{kind:'alert',audit:x.audit,error:x.error})).join('')}</div>`
    :`<div class="audit-all-clear"><strong>✓ 要確認なし</strong><span>確定済み注文はすべて一致しています。</span></div>`;
  const okHtml=ok.length?`<details class="audit-normal"><summary>正常 ${ok.length}件を表示</summary><div class="audit-normal-list">${ok.map(x=>auditOrderCard(x.row,{kind:'ok',audit:x.audit})).join('')}</div></details>`:'';
  const skippedHtml=unaudited.length?`<details class="audit-normal"><summary>未監査 ${unaudited.length}件を表示</summary><div class="audit-normal-list">${unaudited.map(row=>auditOrderCard(row,{kind:'pending'})).join('')}</div></details>`:'';
  const incompleteHtml=incomplete.length?`<details class="audit-normal"><summary>購入手続き未完了 ${incomplete.length}件を表示</summary><p>あ箱で購入確定前の注文です。確認画面で中断した注文などを含みます。Stripeでの未払いを保証する表示ではありません。支払状況は「再取得して詳細」で確認してください。</p><div class="audit-normal-list">${incomplete.map(row=>auditOrderCard(row,{kind:'pending'})).join('')}</div></details>`:'';
  els.auditOrdersList.innerHTML=alertHtml+okHtml+skippedHtml+incompleteHtml;
  bindAuditDetailButtons();
  return {ok:ok.length,alerts:alerts.length,skipped:unaudited.length,incomplete:incomplete.length};
}
function localJstDay(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;
}
function renderDailyReconciliation(r){
  if(!els.dailyReconResult)return;const ok=r?.status==='ok',t=r?.totals||{},checks=Array.isArray(r?.checks)?r.checks:[],bad=checks.filter(x=>x?.ok===false),orphans=Array.isArray(r?.stripe?.orphanObjects)?r.stripe.orphanObjects:[],unexplained=Array.isArray(r?.stripe?.unexplainedBalanceDebits)?r.stripe.unexplainedBalanceDebits:[],recovered=Array.isArray(r?.stripe?.recoveredFailedDebits)?r.stripe.recoveredFailedDebits:[],orders=Array.isArray(r?.mismatchedOrders)?r.mismatchedOrders:[];
  const checkHtml=checks.map(x=>`<div class="daily-recon-check ${x.ok?'is-ok':'is-alert'}"><span>${x.ok?'✓':'×'}</span><code>${escapeHtml(x.name||'')}</code><b>${escapeHtml(auditValue(x.actual))}</b><small>期待 ${escapeHtml(auditValue(x.expected))}</small></div>`).join('');
  const problemHtml=(orphans.length||unexplained.length||orders.length)?`<div class="daily-recon-problems">${unexplained.map(x=>`<div><strong>⚠ 未説明の残高Debit ${yen(x.amount)}</strong><code>${escapeHtml(x.id||'')}</code><span>${escapeHtml(x.orderId||'')}</span><button type="button" data-recover-debit-order="${escapeHtml(x.orderId||'')}" data-recover-debit-charge="${escapeHtml(x.id||'')}" data-recover-debit-amount="${Number(x.amount||0)}">安全に返金</button><button type="button" data-daily-order="${escapeHtml(x.orderId||'')}">詳細</button></div>`).join('')}${orphans.map(x=>`<div><strong>Stripe孤立取引</strong><code>${escapeHtml(x.id||'')}</code><span>${escapeHtml(x.orderId||'')}</span></div>`).join('')}${orders.map(x=>`<div><strong>注文監査 要確認</strong><code>${escapeHtml(x.orderId||'')}</code><button type="button" data-daily-order="${escapeHtml(x.orderId||'')}">詳細</button></div>`).join('')}</div>`:'';
  const recoveredHtml=recovered.length?`<details class="daily-recon-details" open><summary>復旧済みの未説明Debit ${recovered.length}件 / ${yen(recovered.reduce((n,x)=>n+Number(x.refundAmount||x.amount||0),0))}</summary><div class="daily-recon-problems">${recovered.map(x=>`<div><strong>✓ 復旧済み ${yen(x.refundAmount||x.amount)}</strong><code>Debit ${escapeHtml(x.chargeId||'')}</code><code>Refund ${escapeHtml(x.refundId||'')}</code><span>Stripe返金状態: ${escapeHtml(x.refundStatus||'不明')} / Stripe照合: ${x.stripeRefundFound?'確認済み':'未確認'}</span><span>元Connected Account: ${escapeHtml(x.sourceConnectedAccountId||'取得不可')} / buyerAuthorId: ${escapeHtml(x.buyerAuthorId||'取得不可')}</span>${x.refundBalanceTransactionId?`<code>Balance transaction ${escapeHtml(x.refundBalanceTransactionId)}</code>`:''}<span>${escapeHtml(x.orderId||'')} / 復旧 ${escapeHtml(formatJstDate(x.recoveredAt||''))}</span><button type="button" data-daily-order="${escapeHtml(x.orderId||'')}">詳細</button></div>`).join('')}</div></details>`:'';
  els.dailyReconResult.innerHTML=`<div class="daily-recon-verdict ${ok?'is-ok':'is-alert'}"><small>${escapeHtml(r.day||'')} · JST</small><strong>${ok?'✓ 日次照合 一致':'⚠ 日次照合 要確認'}</strong><span>差異 ${bad.length}項目</span></div><div class="daily-recon-grid"><div><small>注文</small><strong>${Number(t.orderCount||0)}件</strong></div><div><small>売上総額</small><strong>${yen(t.grossAmount)}</strong></div><div><small>カード</small><strong>${yen(t.cardAmount)}</strong></div><div><small>売上残高</small><strong>${yen(t.balanceAmount)}</strong></div><div><small>作者配分</small><strong>${yen(t.sellerGross)}</strong></div><div><small>あ箱取り分</small><strong>${yen(t.platformGross)}</strong></div><div><small>返金</small><strong>${yen(t.refundAmount)}</strong></div><div><small>純額</small><strong>${yen(t.netAmount)}</strong></div><div><small>MY COPY</small><strong>${Number(t.entitlementCount||0)}件</strong></div></div>${problemHtml}${recoveredHtml}<details class="daily-recon-details" ${ok?'':'open'}><summary>照合項目 ${checks.length}件</summary><div class="daily-recon-checks">${checkHtml}</div></details><small class="audit-time">照合日時 ${escapeHtml(formatJstDate(r.checkedAt))}</small>`;
  els.dailyReconResult.querySelectorAll('[data-daily-order]').forEach(b=>b.addEventListener('click',()=>{if(els.auditOrderId)els.auditOrderId.value=b.dataset.dailyOrder||'';runPaymentAudit();}));
  els.dailyReconResult.querySelectorAll('[data-recover-debit-order]').forEach(b=>b.addEventListener('click',async()=>{
    const orderId=String(b.dataset.recoverDebitOrder||''),chargeId=String(b.dataset.recoverDebitCharge||''),amount=Number(b.dataset.recoverDebitAmount||0);
    if(!orderId||!chargeId)return;
    if(commerceRuntime?.environment==='live'){alert('本番の未説明Debit復旧は専用確認導線の準備後に実行します。');return;}
    if(!confirm(`未説明の残高Debit ${yen(amount)} を購入者へ返金します。\n\nOrder: ${orderId}\nStripe: ${chargeId}\n\nStripe実績を再確認し、安全条件を満たす場合だけ実行します。`))return;
    const original=b.textContent;b.disabled=true;b.textContent='確認・返金中…';
    try{
      const res=await fetch(API+`/admin/commerce/order/${encodeURIComponent(orderId)}/recover-unexplained-debit`,{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({chargeId})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data?.ok){
        const detail=[
          `HTTP ${res.status}`,
          data?.code ? `code: ${data.code}` : '',
          data?.error ? `error: ${data.error}` : '',
          data?.reason ? `reason: ${data.reason}` : '',
          data?.message ? `message: ${data.message}` : '',
          data?.stripeCode ? `Stripe code: ${data.stripeCode}` : '',
          data?.stripeMessage ? `Stripe: ${data.stripeMessage}` : '',
          data?.refundId ? `Refund: ${data.refundId}` : '',
          data?.refundStatus ? `Refund status: ${data.refundStatus}` : '',
          data?.chargeAmountRefunded != null ? `Debit amount_refunded: ${yen(data.chargeAmountRefunded)}` : '',
          data?.verifiedBy?.chargeAmountRefunded != null ? `Debit amount_refunded: ${yen(data.verifiedBy.chargeAmountRefunded)}` : ''
        ].filter(Boolean).join('\n');
        throw new Error(detail||`HTTP ${res.status}`);
      }
      alert(`Stripe確認済み返金: ${yen(amount)}\nRefund: ${data?.refundId||'取得不可'}\nDebit返金済額: ${yen(data?.verifiedBy?.chargeAmountRefunded||amount)}`);
      await runDailyReconciliation();
      if(typeof loadAuditOrders==='function')loadAuditOrders();
    }catch(e){alert(`復旧できませんでした: ${e.message}`);b.disabled=false;b.textContent=original;}
  }));
}
async function runDailyReconciliation(){
  if(!els.dailyReconDay||!els.dailyReconResult)return;const day=String(els.dailyReconDay.value||localJstDay());els.dailyReconDay.value=day;if(els.dailyReconButton){els.dailyReconButton.disabled=true;els.dailyReconButton.textContent='照合中…';}els.dailyReconStatus.textContent='Order全体とStripe実績を照合しています…';els.dailyReconResult.innerHTML='<div class="empty">日次照合中…</div>';
  try{
    const r=await fetch(API+`/admin/commerce/daily-reconciliation?day=${encodeURIComponent(day)}`,{headers:headers(),cache:'no-store'});const data=await r.json().catch(()=>({}));
    if(data?.reconciliation){renderDailyReconciliation(data.reconciliation);els.dailyReconStatus.textContent=data.reconciliation.status==='ok'?'日次照合完了：1円単位で一致':'日次照合完了：差異があります';return;}
    throw new Error(data?.error||`HTTP ${r.status}`);
  }catch(e){els.dailyReconStatus.textContent=`日次照合できませんでした: ${e.message}`;els.dailyReconResult.innerHTML='<div class="empty">照合に失敗しました。</div>';}
  finally{if(els.dailyReconButton){els.dailyReconButton.disabled=false;els.dailyReconButton.textContent='日次照合';}}
}

async function loadAuditOrders(){
  if(!els.auditOrdersList)return;
  ensureIncompletePurchaseCounter();
  const incompleteCount=document.getElementById('auditIncompleteCount');
  if(incompleteCount)incompleteCount.textContent='…';
  if(els.auditOrdersReload)els.auditOrdersReload.disabled=true;
  if(els.auditOkCount)els.auditOkCount.textContent='…';if(els.auditAlertCount)els.auditAlertCount.textContent='…';if(els.auditPendingCount)els.auditPendingCount.textContent='…';
  els.auditOrdersStatus.textContent='最近の注文を取得しています…';
  els.auditOrdersList.innerHTML='<div class="empty">監査を開始しています…</div>';
  try{
    await loadCommerceRuntime();
    const data=await api('/admin/commerce/orders?limit=30');
    const all=Array.isArray(data.orders)?data.orders:[];
    const shouldAudit=row=>['paid','refunded'].includes(String(row.status||'').toLowerCase())||String(row.paymentRail||'')==='connected_balance'||Boolean(row.balanceDebitCapturedAt)||String(row.recoveryState||'')==='RECOVERY_REQUIRED';
    const auditable=all.filter(shouldAudit);
    const skipped=all.filter(row=>!shouldAudit(row));
    els.auditOrdersStatus.textContent=`決済痕跡あり ${auditable.length}件を自動監査中…`;
    const results=await mapWithConcurrency(auditable,4,async row=>await fetchPaymentAudit(row.orderId));
    const summary=renderAutomaticAudit(auditable,results,skipped);
    els.auditOrdersStatus.textContent=`監査完了：正常 ${summary.ok}件 / 要確認 ${summary.alerts}件 / 未監査 ${summary.skipped}件 / 購入手続き未完了 ${summary.incomplete}件`;
  }catch(e){
    if(incompleteCount)incompleteCount.textContent='–';
    els.auditOrdersStatus.textContent=`自動監査できませんでした: ${e.message}`;
    els.auditOrdersList.innerHTML='<div class="empty">読み込みに失敗しました。</div>';
    if(els.auditOkCount)els.auditOkCount.textContent='–';if(els.auditAlertCount)els.auditAlertCount.textContent='–';if(els.auditPendingCount)els.auditPendingCount.textContent='–';if(els.auditTabBadge)els.auditTabBadge.hidden=true;
  }finally{if(els.auditOrdersReload)els.auditOrdersReload.disabled=false;}
}
function renderCheckoutStatus(checkout){
  const good=checkout.state==='expired_unpaid'||checkout.state==='open_unpaid';
  const details=[['Session',checkout.sessionId],['Stripe Session状態',checkout.sessionStatus],['Stripe支払状態',checkout.paymentStatus],['PaymentIntent',checkout.paymentIntentId],['環境',checkout.environment],['照会エラー',checkout.errorCode],['不一致',(checkout.issues||[]).join(', ')]];
  const rows=details.filter(x=>x[1]).map(x=>`<p>${escapeHtml(x[0])}：<code style="overflow-wrap:anywhere">${escapeHtml(String(x[1]))}</code></p>`).join('');
  const panel=document.createElement('div');panel.className=`audit-verdict ${good?'is-ok':'is-alert'}`;
  panel.innerHTML=`<small>CHECKOUT 照会 · 読取専用</small><strong>${escapeHtml(checkout.message||'状態不明')}</strong>${rows}<p>注文・購入権・資金は変更していません。</p><small>${escapeHtml(formatJstDate(checkout.checkedAt))}</small>`;
  els.auditOrderResult.prepend(panel);
}
async function runPaymentAudit(){
  const orderId=String(els.auditOrderId?.value||'').trim().toLowerCase();
  if(!/^order_[a-f0-9]{32}$/.test(orderId)){els.auditOrderStatus.textContent='Order IDを確認してください。';return;}
  els.auditOrderButton.disabled=true;els.auditOrderButton.textContent='監査中…';els.auditOrderStatus.textContent='Stripeと照合しています…';els.auditOrderResult.innerHTML='';
  try{
    const {audit}=await fetchPaymentAudit(orderId);
    renderPaymentAudit(audit);
    if(audit.orderStatus==='pending_payment'&&audit.paymentRail!=='connected_balance'){
      let checkout;
      try{checkout=(await apiWithTimeout(`/admin/commerce/order/${encodeURIComponent(orderId)}/checkout-status`,{},12000)).checkout;}
      catch(error){checkout={state:'lookup_failed',message:'Checkout照会失敗。未払いとは断定できません',errorCode:error.message,checkedAt:new Date().toISOString()};}
      renderCheckoutStatus(checkout);
    }
    els.auditOrderStatus.textContent=audit.status==='ok'?'監査完了：一致':'監査完了：不一致があります';
    // FINAL: the detail audit is live Stripe evidence. Rebuild the automatic-audit
    // list immediately so stale cards/counters cannot continue showing an old result.
    await loadAuditOrders();
  }catch(e){els.auditOrderStatus.textContent=`監査できませんでした: ${e.message}`;}
  finally{els.auditOrderButton.disabled=false;els.auditOrderButton.textContent='監査する';}
}

// v63.35.1 — one admin, four workspaces
function setAdminTab(name,{remember=true}={}){
  const valid=['status','selection','reports','contacts','authors','audit','maintenance'];
  if(!valid.includes(name))name='status';
  document.querySelectorAll('[data-admin-tab]').forEach(b=>{const on=b.dataset.adminTab===name;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false');});
  document.querySelectorAll('[data-admin-panel]').forEach(p=>p.classList.toggle('is-active',p.dataset.adminPanel===name));
  if(remember)sessionStorage.setItem('ahako-admin-tab',name);
  if(name==='selection'&&token)loadOfficialShelfAdmin();
  if(name==='reports'&&token)loadReports();
  if(name==='contacts'&&token)loadContacts();
  if(name==='authors'&&token)loadAuthors();
  if(name==='audit'&&token)loadAuditOrders();
}
function formatJstDate(value){
  if(!value)return '発行日時不明';
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '発行日時不明';
  return d.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
}
function groupLatestEditions(rows){
  const groups=new Map();
  for(const row of rows||[]){
    const key=String(row.workId||'');if(!key)continue;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);
  }
  return [...groups.values()].map(items=>items.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))).sort((a,b)=>new Date(b[0]?.createdAt||0)-new Date(a[0]?.createdAt||0));
}
function renderPublishedWorks(rows){
  if(!els.publishedWorks)return;
  if(!rows?.length){els.publishedWorks.innerHTML='<div class="empty">公開中の作品はありません。</div>';return;}
  els.publishedWorks.innerHTML=rows.map(x=>{
    const relayOn=x.relayEnabled!==false;
    const cover=x.coverUrl?`<img src="${escapeHtml(x.coverUrl)}" alt="" loading="lazy">`:'あ□';
    return `<article class="edition-candidate operator-work" data-work-id="${escapeHtml(x.workId)}">
      <div class="edition-cover-placeholder ${x.coverUrl?'has-cover':''}">${cover}</div>
      <div class="edition-candidate-main">
        <div class="edition-candidate-head"><div><small>公開中</small><h3>${escapeHtml(x.title||'無題')}</h3><p>${escapeHtml(x.author||'作者未設定')}</p></div><span class="edition-count">${relayOn?'RELAY ON':'RELAY OFF'}</span></div>
        <div class="edition-choice-row"><span class="work-updated">更新 · ${escapeHtml(formatJstDate(x.updatedAt))}</span><button class="review-link" type="button" data-review-work>読む</button></div>
        <div class="seed-controls"><label>種類<select data-shelf-kind><option value="seed">🌱 種本</option><option value="bloom">🌸 開花</option></select></label><label>発行冊数<input data-issue-limit type="number" min="1" max="100000" value="10" inputmode="numeric"></label><button class="primary" type="button" data-add-work-shelf ${relayOn?'':'disabled'}>あ箱の本に追加</button></div>
        <small class="candidate-note">${relayOn?'追加時点の公開版を新しいEditionとして凍結し、そのEditionから一冊ずつ発行します。':'この作品はRELAYがOFFのため、種本・開花には追加できません。'}</small>
      </div>
    </article>`;
  }).join('');
}
function renderEditionCandidates(rows){
  if(!els.editionCandidates)return;
  const groups=groupLatestEditions(rows);
  if(!groups.length){els.editionCandidates.innerHTML='<div class="empty">発行済みEditionはありません。</div>';return;}
  els.editionCandidates.innerHTML=groups.map((items,idx)=>{
    const latest=items[0],workId=String(latest.workId||'');
    const opts=items.map((x,i)=>`<option value="${escapeHtml(x.editionId)}">${i===0?'最新 · ':''}${escapeHtml(formatJstDate(x.createdAt))}</option>`).join('');
    return `<article class="edition-candidate" data-work-id="${escapeHtml(workId)}">
      <div class="edition-cover-placeholder">あ□</div>
      <div class="edition-candidate-main">
        <div class="edition-candidate-head"><div><small>発行済み作品</small><h3>${escapeHtml(latest.title||'無題')}</h3><p>${escapeHtml(latest.author||'作者未設定')}</p></div><span class="edition-count">${items.length} Edition</span></div>
        <div class="edition-choice-row"><label>Edition<select data-edition-choice>${opts}</select></label><button class="review-link" type="button" data-review-edition>読む</button></div>
        <div class="seed-controls"><label>種類<select data-shelf-kind><option value="seed">🌱 種本</option><option value="bloom">🌸 開花</option></select></label><label>発行冊数<input data-issue-limit type="number" min="1" max="100000" value="10" inputmode="numeric"></label><button class="primary" type="button" data-put-shelf>あ箱の本に置く</button></div>
        <small class="candidate-note">「読む」は選択した凍結Editionを審査モードで開きます。審査閲覧は観測・読了・RELAYの数字に入りません。</small>
      </div>
    </article>`;
  }).join('');
}
function renderOfficialShelfAdmin(items){
  if(!els.officialShelfItems)return;
  if(!items?.length){els.officialShelfItems.innerHTML='<div class="empty">まだありません。</div>';return;}
  els.officialShelfItems.innerHTML=items.map(x=>`<article class="official-shelf-row">
    <div><small>${x.kind==='bloom'?'🌸 開花':'🌱 種本'} · ${escapeHtml(x.status==='active'?'公開中':'停止中')}</small><strong>${escapeHtml(x.title||'無題')}</strong><span>${escapeHtml(x.author||'作者未設定')}</span></div>
    <div class="shelf-count"><strong>${Number(x.issuedCount||0).toLocaleString('ja-JP')} / ${Number(x.issueLimit||0).toLocaleString('ja-JP')}</strong><small>発行</small></div>
    <div class="shelf-actions"><button type="button" data-shelf-id="${escapeHtml(x.shelfId)}" data-shelf-action="${x.status==='active'?'stop':'resume'}">${x.status==='active'?'停止':'再開'}</button><button class="delete" type="button" data-shelf-id="${escapeHtml(x.shelfId)}" data-shelf-delete>削除</button></div>
  </article>`).join('');
}
let officialShelfLoading=false;
async function loadOfficialShelfAdmin(){
  if(officialShelfLoading)return;officialShelfLoading=true;
  if(els.selectionStatus)els.selectionStatus.textContent='読み込み中…';
  if(els.publishedWorksStatus)els.publishedWorksStatus.textContent='読み込み中…';
  try{
    const [works,editions,shelf]=await Promise.all([api('/admin/official-shelf/works'),api('/admin/official-shelf/editions'),api('/admin/official-shelf')]);
    renderPublishedWorks(works.items||[]);renderEditionCandidates(editions.items||[]);renderOfficialShelfAdmin(shelf.items||[]);
    if(els.publishedWorksStatus)els.publishedWorksStatus.textContent=`${Number((works.items||[]).length).toLocaleString('ja-JP')}作品`;
    if(els.selectionStatus)els.selectionStatus.textContent=`${groupLatestEditions(editions.items||[]).length}作品`;
  }catch(e){
    if(els.publishedWorks)els.publishedWorks.innerHTML=`<div class="empty">公開作品を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
    if(els.editionCandidates)els.editionCandidates.innerHTML=`<div class="empty">作品候補を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
    if(els.publishedWorksStatus)els.publishedWorksStatus.textContent='';
    if(els.selectionStatus)els.selectionStatus.textContent='';
  }finally{officialShelfLoading=false;}
}
const reasonLabel=r=>({copyright:'第三者の著作物・権利侵害',unauthorized:'自分の作品が無断で使用されている',other:'その他'})[r]||r;
const subjectLabel=s=>({text:'本文・文章',cover:'表紙',image:'背景・画像',audio:'BGM・SE・音声',other:'その他'})[s]||s||'不明';
async function connect(){token=els.token.value.trim();if(!token){els.loginStatus.textContent='ADMIN_TOKENを入力してください。';return;}els.connect.disabled=true;try{verifiedStats=await api('/admin/stats');sessionStorage.setItem('ahako-admin-token',token);els.loginStatus.textContent='';els.login.hidden=true;els.content.hidden=false;els.refresh.disabled=false;await loadDashboard();}catch(e){verifiedStats=null;els.loginStatus.textContent=e.status===401?'ADMIN_TOKENが違います。':`接続できません: ${e.message}`;}finally{els.connect.disabled=false;}}

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
    const d=verifiedStats||(await api('/admin/stats'));
    verifiedStats=null;
    lastStats=d;
    els.workCount.textContent=Number(d.works?.total||0).toLocaleString('ja-JP');
    els.publishedCount.textContent=Number(d.works?.published||0).toLocaleString('ja-JP');
    els.suspendedCount.textContent=Number(d.works?.suspended||0).toLocaleString('ja-JP');
    els.r2Usage.textContent=formatBytes(d.storage?.totalBytes||0);
    els.assetCount.textContent=Number(d.storage?.assetCount||0).toLocaleString('ja-JP');
    els.openCount.textContent=Number(d.reports?.open||0).toLocaleString('ja-JP');if(els.reportTabBadge){const n=Number(d.reports?.open||0);els.reportTabBadge.textContent=n.toLocaleString('ja-JP');els.reportTabBadge.hidden=n===0;}
    if(els.openContactCount)els.openContactCount.textContent=Number(d.contacts?.open||0).toLocaleString('ja-JP');if(els.contactTabBadge){const n=Number(d.contacts?.open||0);els.contactTabBadge.textContent=n.toLocaleString('ja-JP');els.contactTabBadge.hidden=n===0;}
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
  if(!await AhakoDialog.confirm(`未参照素材 ${count.toLocaleString('ja-JP')}件（${formatBytes(bytes)}）をR2から完全削除します。\n\n現存作品が参照している素材と、アップロードから24時間未満の素材は削除しません。\nこの操作は元に戻せません。`,{title:'未参照素材を削除',kicker:'CLEANUP',danger:true,confirmLabel:'完全削除する'}))return;
  els.cleanupOrphans.disabled=true;
  els.cleanupOrphans.textContent='掃除中…';
  try{
    const d=await api('/admin/orphans/cleanup',{method:'POST'});
    toast(`${Number(d.deletedCount||0).toLocaleString('ja-JP')}素材・${formatBytes(d.deletedBytes||0)}を削除しました`);
    if(d.errors?.length)AhakoDialog.alert(`一部の素材を削除できませんでした（${d.errors.length}件）。安全のため残しています。`);
    await loadDashboard();
  }catch(e){
    AhakoDialog.alert(`お掃除できませんでした: ${e.message}`);
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
function jstDayKeyClient(date=new Date()){
  const jst=new Date(date.getTime()+9*60*60*1000);
  return jst.toISOString().slice(0,10);
}
function recentJstDaysClient(count){
  const out=[];const now=Date.now();
  for(let i=0;i<count;i++)out.push(jstDayKeyClient(new Date(now-i*24*60*60*1000)));
  return out;
}
async function loadAnalyticsPaged(days=7){
  const dayKeys=recentJstDaysClient(days);
  const byWork=new Map();
  let today={views:0,completions:0,sceneAdvances:0};
  for(let di=0;di<dayKeys.length;di++){
    let cursor='';
    do{
      const qs=new URLSearchParams({day:dayKeys[di],limit:'50',_:String(Date.now())});
      if(cursor)qs.set('cursor',cursor);
      const page=await apiWithTimeout(`/admin/analytics-page?${qs.toString()}`,{},12000);
      const t=page.totals||{};
      if(di===0){
        today.views+=Number(t.views||0);
        today.completions+=Number(t.completions||0);
        today.sceneAdvances+=Number(t.sceneAdvances||0);
      }
      for(const row of page.works||[]){
        const id=String(row.workId||'');if(!id)continue;
        if(!byWork.has(id))byWork.set(id,{workId:id,title:row.title||'無題',views:0,completions:0,sceneAdvances:0});
        const w=byWork.get(id);
        if(row.title)w.title=row.title;
        w.views+=Number(row.views||0);w.completions+=Number(row.completions||0);w.sceneAdvances+=Number(row.sceneAdvances||0);
      }
      cursor=String(page.nextCursor||'');
    }while(cursor);
  }
  const popularWorks=[...byWork.values()].sort((x,y)=>y.views-x.views||y.completions-x.completions||y.sceneAdvances-x.sceneAdvances).slice(0,10);
  return {today,popularWorks};
}
async function loadAnalytics(){
  if(els.popularWorks)els.popularWorks.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const d=await loadAnalyticsPaged(7);
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
function renderReaderBreakdown(node,rows,labeler,{otherHosts=[]}={}){
  if(!node)return;
  if(!rows?.length){node.innerHTML='<div class="empty">まだデータはありません。</div>';return;}
  node.innerHTML=rows.map((row,i)=>{
    const base=`<div class="reader-stat-row"><span class="rank">${i+1}</span><strong>${escapeHtml(labeler(row.key))}</strong><span><b>${Number(row.views||0).toLocaleString('ja-JP')}</b><small>起動</small></span><span><b>${Number(row.completions||0).toLocaleString('ja-JP')}</b><small>読了</small></span><span><b>${escapeHtml(formatRate(row.completions,row.views))}</b><small>読了率</small></span></div>`;
    if(row.key!=='other'||!otherHosts?.length)return base;
    const hosts=otherHosts.map(h=>`<div class="reader-host-row"><code>${escapeHtml(h.key||'')}</code><span><b>${Number(h.views||0).toLocaleString('ja-JP')}</b><small>起動</small></span><span><b>${Number(h.completions||0).toLocaleString('ja-JP')}</b><small>読了</small></span></div>`).join('');
    return `${base}<details class="reader-other-hosts"><summary>その他の内訳 ${otherHosts.length.toLocaleString('ja-JP')}ドメイン</summary>${hosts}</details>`;
  }).join('');
}
async function loadReaderAnalytics(){
  if(els.readerSites)els.readerSites.innerHTML='<div class="empty">読み込み中…</div>';
  if(els.readerModes)els.readerModes.innerHTML='<div class="empty">読み込み中…</div>';
  const setSummary=v=>{
    els.readerTodayViews.textContent=v;
    els.readerTodayCompletions.textContent=v;
    els.readerTodaySceneAdvances.textContent=v;
    els.readerTodayCompletionRate.textContent=v;
    els.readerTodayStudio.textContent=v;
    els.readerTodayOfficial.textContent=v;
  };
  try{
    let d;
    try{d=await apiWithTimeout(`/admin/reader-analytics?days=7&_=${Date.now()}`,{},12000);}
    catch(first){d=await apiWithTimeout(`/admin/reader-analytics?days=7&_=${Date.now()}`,{},12000);}
    const t=d.today||{};
    els.readerTodayViews.textContent=Number(t.views||0).toLocaleString('ja-JP');
    els.readerTodayCompletions.textContent=Number(t.completions||0).toLocaleString('ja-JP');
    els.readerTodaySceneAdvances.textContent=Number(t.sceneAdvances||0).toLocaleString('ja-JP');
    els.readerTodayCompletionRate.textContent=formatRate(t.completions,t.views);
    els.readerTodayStudio.textContent=Number(t.outbound?.studio||0).toLocaleString('ja-JP');
    els.readerTodayOfficial.textContent=Number(t.outbound?.official||0).toLocaleString('ja-JP');
    renderReaderBreakdown(els.readerSites,d.sites||[],readerSiteLabel,{otherHosts:d.otherHosts||[]});
    renderReaderBreakdown(els.readerModes,d.modes||[],readerModeLabel);
  }catch(e){
    setSummary('–');
    if(els.readerSites)els.readerSites.innerHTML=`<div class="empty">Reader情報を読み込めませんでした: ${escapeHtml(e.message)}<br><button type="button" id="readerRetryButton">再読み込み</button></div>`;
    if(els.readerModes)els.readerModes.innerHTML='';
    document.querySelector('#readerRetryButton')?.addEventListener('click',loadReaderAnalytics,{once:true});
  }
}

function renderDistributionCopies(node,rows,{byWork=false}={}){
  if(!node)return;
  if(!rows?.length){node.innerHTML='<div class="empty">まだ観測データはありません。</div>';return;}
  node.innerHTML=rows.map((row,i)=>{
    const primary=byWork?row.workId:row.copyId;
    const secondary=byWork?`${Number(row.observedCopies||0).toLocaleString('ja-JP')}冊を観測`:row.workId;
    return `<div class="distribution-copy-row"><span class="rank">${i+1}</span><div class="distribution-copy-main"><code>${escapeHtml(primary||'')}</code><small>${escapeHtml(secondary||'')}</small></div><span><b>${Number(row.observedReaders||0).toLocaleString('ja-JP')}+</b><small>観測読者</small></span><span><b>${Number(row.completions||0).toLocaleString('ja-JP')}</b><small>読了</small></span><span><b>${Number(row.opens||0).toLocaleString('ja-JP')}</b><small>起動</small></span></div>`;
  }).join('');
}
async function loadDistributionObservation(){
  if(els.distTopCopies)els.distTopCopies.innerHTML='<div class="empty">読み込み中…</div>';
  if(els.distWorks)els.distWorks.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const d=await apiWithTimeout(`/admin/distribution-observation?days=7&_=${Date.now()}`,{},12000);
    const t=d.today||{},p=d.period||{};
    els.distTodayReaders.textContent=`${Number(t.observedReaders||0).toLocaleString('ja-JP')}+`;
    els.distTodayCompletions.textContent=Number(t.completions||0).toLocaleString('ja-JP');
    els.distPeriodReaders.textContent=`${Number(p.observedReaders||0).toLocaleString('ja-JP')}+`;
    els.distObservedCopies.textContent=Number(p.observedCopies||0).toLocaleString('ja-JP');
    els.distObservedWorks.textContent=Number(p.observedWorks||0).toLocaleString('ja-JP');
    els.distPeriodOpens.textContent=Number(p.opens||0).toLocaleString('ja-JP');
    renderDistributionCopies(els.distTopCopies,d.topCopies||[]);
    renderDistributionCopies(els.distWorks,d.works||[],{byWork:true});
  }catch(e){
    ['distTodayReaders','distTodayCompletions','distPeriodReaders','distObservedCopies','distObservedWorks','distPeriodOpens'].forEach(k=>{if(els[k])els[k].textContent='–';});
    if(els.distTopCopies)els.distTopCopies.innerHTML=`<div class="empty">配布版観測を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
    if(els.distWorks)els.distWorks.innerHTML='';
  }
}


function renderRelayRows(node,rows,{byWork=false}={}){
  if(!node)return;
  if(!rows?.length){node.innerHTML='<div class="empty">まだRELAYはありません。</div>';return;}
  node.innerHTML=rows.map((row,i)=>{
    const primary=byWork?row.workId:row.copyId;
    const secondary=byWork?`${Number(row.relayedCopies||0).toLocaleString('ja-JP')}冊が旅中`:row.workId;
    return `<div class="distribution-copy-row"><span class="rank">${i+1}</span><div class="distribution-copy-main"><code>${escapeHtml(primary||'')}</code><small>${escapeHtml(secondary||'')}</small></div><span><b>${Number(row.relays||0).toLocaleString('ja-JP')}</b><small>RELAY</small></span><span><b>${Number(row.maxHop||0).toLocaleString('ja-JP')}</b><small>hop</small></span></div>`;
  }).join('');
}
async function loadRelayAnalytics(){
  if(els.relayTopCopies)els.relayTopCopies.innerHTML='<div class="empty">読み込み中…</div>';
  if(els.relayWorksList)els.relayWorksList.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const d=await apiWithTimeout(`/admin/distribution-relay?days=7&_=${Date.now()}`,{},12000),p=d.period||{};
    els.relayPeriodCount.textContent=Number(p.relays||0).toLocaleString('ja-JP');
    els.relayCopies.textContent=Number(p.relayedCopies||0).toLocaleString('ja-JP');
    els.relayWorks.textContent=Number(p.relayedWorks||0).toLocaleString('ja-JP');
    els.relayMaxHop.textContent=Number(p.maxHop||0).toLocaleString('ja-JP');
    renderRelayRows(els.relayTopCopies,d.topCopies||[]);
    renderRelayRows(els.relayWorksList,d.works||[],{byWork:true});
  }catch(e){
    ['relayPeriodCount','relayCopies','relayWorks','relayMaxHop'].forEach(k=>{if(els[k])els[k].textContent='–';});
    if(els.relayTopCopies)els.relayTopCopies.innerHTML=`<div class="empty">RELAY情報を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
    if(els.relayWorksList)els.relayWorksList.innerHTML='';
  }
}

async function loadAuthors(){
  if(!els.authorList)return;
  els.authorList.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const data=await api('/admin/authors');
    const rows=data.authors||[];
    if(els.authorCount)els.authorCount.textContent=`${rows.length.toLocaleString('ja-JP')}人`;
    els.authorList.innerHTML=rows.length?rows.map(author=>{const active=author.accountStatus!=='suspended';return `<article class="contact-card${active?'':' is-resolved'}" data-author-id="${escapeHtml(author.authorId||'')}"><div class="meta"><span>作者名</span><strong>${escapeHtml(author.displayName||'未設定')}</strong><span>メール</span><a class="inline-link" href="mailto:${escapeHtml(author.email||'')}">${escapeHtml(author.email||'')}</a><span>authorId</span><code>${escapeHtml(author.authorId||'')}</code><span>状態</span><strong>${active?'利用中':'停止中'}</strong><span>登録</span><span>${escapeHtml(formatJstDate(author.createdAt))}</span></div><div class="actions"><button type="button" data-author-action="${active?'suspend':'activate'}" class="${active?'stop':''}">${active?'利用を停止':'利用を再開'}</button></div></article>`;}).join(''):'<div class="empty">作者アカウントはまだありません。</div>';
  }catch(error){
    if(els.authorCount)els.authorCount.textContent='–';
    els.authorList.innerHTML=`<div class="empty">作者を読み込めませんでした: ${escapeHtml(error.message)}</div>`;
  }
}
async function loadDashboard(){await Promise.all([loadStats(),loadReports(),loadContacts(),loadAuthors(),loadAnalytics(),loadReaderAnalytics(),loadDistributionObservation(),loadRelayAnalytics()]);}

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

function contactCategoryLabel(value){return ({general:'一般',bug:'不具合',request:'要望',other:'その他'})[value]||'その他';}
async function loadContacts(){
  if(!els.contactList||!els.contactFilter)return;
  const status=els.contactFilter.value;
  els.contactList.innerHTML='<div class="empty">読み込み中…</div>';
  try{
    const [shown,open]=await Promise.all([api(`/admin/contacts?status=${encodeURIComponent(status)}`),api('/admin/contacts?status=open')]);
    if(els.openContactCount)els.openContactCount.textContent=Number(open.count||0).toLocaleString('ja-JP');
    if(els.shownContactCount)els.shownContactCount.textContent=Number(shown.count||0).toLocaleString('ja-JP');
    if(els.contactTabBadge){const n=Number(open.count||0);els.contactTabBadge.textContent=n.toLocaleString('ja-JP');els.contactTabBadge.hidden=n===0;}
    renderContacts(shown.contacts||[]);
  }catch(e){els.contactList.innerHTML=`<div class="empty">読み込めませんでした: ${escapeHtml(e.message)}</div>`;}
}
function renderContacts(rows){
  if(!rows.length){els.contactList.innerHTML='<div class="empty">お問い合わせはありません。</div>';return;}
  els.contactList.innerHTML=rows.map(x=>{
    const resolved=x.status==='resolved';
    const page=x.pageUrl||'';
    return `<article class="contact-card ${resolved?'is-resolved':''}" data-contact-id="${escapeHtml(x.id)}">
      <div class="contact-card-head"><div><h3>${escapeHtml(x.subject||'件名なし')}</h3><span class="contact-category">${escapeHtml(contactCategoryLabel(x.category))}</span>${resolved?'<span class="resolved-badge">対応済み</span>':''}</div><time>${escapeHtml(new Date(x.createdAt).toLocaleString('ja-JP'))}</time></div>
      <div class="contact-message"><p>${escapeHtml(x.message||'')}</p></div>
      <div class="meta"><span>名前</span><strong>${escapeHtml(x.name||'未入力')}</strong><span>返信先</span><a class="inline-link" href="mailto:${escapeHtml(x.email||'')}">${escapeHtml(x.email||'')}</a><span>送信元</span>${page?`<a class="inline-link" href="${escapeHtml(page)}" target="_blank" rel="noopener noreferrer">${escapeHtml(page)}</a>`:'<em>記録なし</em>'}<span>ID</span><code>${escapeHtml(x.id)}</code></div>
      <div class="actions"><a href="mailto:${escapeHtml(x.email||'')}?subject=${encodeURIComponent(`Re: ${x.subject||'お問い合わせ'}`)}">メールで返信</a><button data-contact-action="${resolved?'reopen':'resolve'}">${resolved?'未対応へ戻す':'対応済みにする'}</button><button class="delete" data-contact-action="delete">削除</button></div>
    </article>`;
  }).join('');
}
async function moderate(workId,action){if(action==='delete'){if(!await AhakoDialog.confirm(`workId ${workId} の作品本体と、他作品が使用していない関連素材をR2から削除します。\nこの操作は元に戻せません。`,{title:'作品を完全削除',kicker:'DELETE WORK',danger:true,confirmLabel:'入力確認へ'}))return false;const typed=await AhakoDialog.prompt(`誤操作防止のため、削除する workId を入力してください。\n\n${workId}`,'',{title:'workIdを確認',kicker:'DELETE WORK',inputLabel:'workId',confirmLabel:'完全削除する',danger:true});if(typed===null)return false;if(typed.trim()!==workId){AhakoDialog.alert('workIdが一致しないため削除を中止しました。');return false;}await api(`/admin/work/${encodeURIComponent(workId)}`,{method:'DELETE'});toast('完全削除しました');return true;}await api(`/admin/work/${encodeURIComponent(workId)}/${action}`,{method:'POST'});toast(action==='suspend'?'一時停止しました':'再公開しました');return true;}
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
  }catch(err){AhakoDialog.alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
if(els.contactList)els.contactList.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-contact-action]');if(!b)return;
  const card=b.closest('.contact-card'),id=card?.dataset.contactId||'',action=b.dataset.contactAction;
  if(!id)return;
  if(action==='delete'&&!await AhakoDialog.confirm('このお問い合わせを完全に削除しますか？\nこの操作は元に戻せません。',{title:'お問い合わせを削除',danger:true,confirmLabel:'完全削除する'}))return;
  b.disabled=true;
  try{
    if(action==='delete')await api(`/admin/contact/${encodeURIComponent(id)}`,{method:'DELETE'});
    else await api(`/admin/contact/${encodeURIComponent(id)}/${action}`,{method:'POST'});
    toast(action==='delete'?'削除しました':action==='resolve'?'対応済みにしました':'未対応へ戻しました');
    await Promise.all([loadContacts(),loadStats()]);
  }catch(err){AhakoDialog.alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
if(els.authorList)els.authorList.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-author-action]');if(!b)return;
  const card=b.closest('[data-author-id]'),authorId=card?.dataset.authorId||'',action=b.dataset.authorAction;
  if(!authorId)return;
  if(action==='suspend'&&!await AhakoDialog.confirm('この作者アカウントの利用を停止しますか？\n新規公開・更新・RELAY元登録ができなくなります。',{title:'作者アカウントを停止',danger:true,confirmLabel:'利用を停止する'}))return;
  b.disabled=true;
  try{
    await api(`/admin/author/${encodeURIComponent(authorId)}/${action}`,{method:'POST'});
    toast(action==='suspend'?'作者アカウントを停止しました':'作者アカウントを再開しました');
    await loadAuthors();
  }catch(err){AhakoDialog.alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
async function inspect(){const id=els.workId.value.trim();if(!id)return;els.direct.textContent='確認中…';try{const d=await api(`/admin/work/${encodeURIComponent(id)}`);els.direct.innerHTML=`<div class="report-card"><div class="meta"><span>workId</span><code>${escapeHtml(d.id)}</code><span>状態</span><strong>${escapeHtml(d.state)}</strong><span>素材</span><span>${Number(d.assets?.length||0)}件</span></div><div class="actions"><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener">作品を見る</a><button data-direct="suspend" class="stop">一時停止</button><button data-direct="republish">再公開</button><button data-direct="delete" class="delete">完全削除</button></div></div>`;}catch(e){els.direct.textContent=`確認できません: ${e.message}`;}}
els.direct.addEventListener('click',async e=>{const b=e.target.closest('button[data-direct]');if(!b)return;const id=els.workId.value.trim();b.disabled=true;try{await moderate(id,b.dataset.direct);await inspect();await loadDashboard();}catch(err){AhakoDialog.alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}});
if(els.cleanupOrphans)els.cleanupOrphans.addEventListener('click',cleanupOrphans);
async function openSelectionReview({workId,editionId=''}){
  if(!workId)return;
  // Open the tab on the explicit click first, so Safari/Chrome popup blockers
  // do not reject it while the review ticket is being created.
  const popup=window.open('about:blank','_blank');
  if(popup){
    try{popup.document.title='あ箱 審査';popup.document.body.innerHTML='<p style="font-family:system-ui;padding:24px">審査用の一冊を準備しています…</p>';}catch(_){}
  }
  try{
    const data=await api('/admin/official-shelf/review',{method:'POST',body:JSON.stringify({workId,...(editionId?{editionId}:{})})});
    if(popup)popup.location.replace(data.url);else window.open(data.url,'_blank','noopener');
  }catch(err){
    if(popup)popup.close();
    AhakoDialog.alert(`審査用Playerを開けませんでした: ${err.message}`);
  }
}

if(els.dailyReconDay&&!els.dailyReconDay.value)els.dailyReconDay.value=localJstDay();
if(els.dailyReconButton)els.dailyReconButton.addEventListener('click',runDailyReconciliation);
if(els.auditOrderButton)els.auditOrderButton.addEventListener('click',runPaymentAudit);
if(els.auditOrdersReload)els.auditOrdersReload.addEventListener('click',loadAuditOrders);
if(els.auditOrderId)els.auditOrderId.addEventListener('keydown',e=>{if(e.key==='Enter')runPaymentAudit();});
document.querySelectorAll('[data-admin-tab]').forEach(b=>b.addEventListener('click',()=>setAdminTab(b.dataset.adminTab)));
if(els.reloadSelection)els.reloadSelection.addEventListener('click',loadOfficialShelfAdmin);
if(els.publishedWorks)els.publishedWorks.addEventListener('click',async e=>{
  const review=e.target.closest('[data-review-work]');
  if(review){const card=review.closest('.operator-work');await openSelectionReview({workId:card?.dataset.workId||''});return;}
  const b=e.target.closest('[data-add-work-shelf]');if(!b)return;
  const card=b.closest('.operator-work'),workId=card?.dataset.workId||'',kind=card?.querySelector('[data-shelf-kind]')?.value||'seed',issueLimit=Number(card?.querySelector('[data-issue-limit]')?.value||0);
  if(!workId||!Number.isInteger(issueLimit)||issueLimit<1){AhakoDialog.alert('作品と発行冊数を確認してください。');return;}
  const label=kind==='bloom'?'開花':'種本',title=card.querySelector('h3')?.textContent||'この作品';
  if(!await AhakoDialog.confirm(`「${title}」の現在公開版を凍結して、${label}として ${issueLimit}冊「あ箱の本」に追加しますか？`,{title:'あ箱の本へ追加',confirmLabel:'追加する'}))return;
  b.disabled=true;
  try{await api('/admin/official-shelf/from-work',{method:'POST',body:JSON.stringify({workId,kind,issueLimit})});toast(`あ箱の本に${label}を追加しました`);await loadOfficialShelfAdmin();}
  catch(err){AhakoDialog.alert(`追加できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
if(els.editionCandidates)els.editionCandidates.addEventListener('click',async e=>{
  const review=e.target.closest('[data-review-edition]');
  if(review){const card=review.closest('.edition-candidate');await openSelectionReview({workId:card?.dataset.workId||'',editionId:card?.querySelector('[data-edition-choice]')?.value||''});return;}
  const b=e.target.closest('[data-put-shelf]');if(!b)return;const card=b.closest('.edition-candidate');
  const workId=card?.dataset.workId||'',editionId=card?.querySelector('[data-edition-choice]')?.value||'',kind=card?.querySelector('[data-shelf-kind]')?.value||'seed',issueLimit=Number(card?.querySelector('[data-issue-limit]')?.value||0);
  if(!workId||!editionId||!Number.isInteger(issueLimit)||issueLimit<1){AhakoDialog.alert('Editionと発行冊数を確認してください。');return;}
  const label=kind==='bloom'?'開花':'種本';if(!await AhakoDialog.confirm(`「${card.querySelector('h3')?.textContent||'この作品'}」を${label}として ${issueLimit}冊、「あ箱の本」に置きますか？`,{title:'あ箱の本へ追加',confirmLabel:'追加する'}))return;
  b.disabled=true;try{await api('/admin/official-shelf',{method:'POST',body:JSON.stringify({workId,editionId,kind,issueLimit})});toast(`あ箱の本に${label}を置きました`);await loadOfficialShelfAdmin();}catch(err){AhakoDialog.alert(`追加できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
if(els.officialShelfItems)els.officialShelfItems.addEventListener('click',async e=>{
  const del=e.target.closest('[data-shelf-delete]');
  if(del){
    const row=del.closest('.official-shelf-row'),title=row?.querySelector('strong')?.textContent||'この本';
    if(!await AhakoDialog.confirm(`「${title}」を「あ箱の本」から削除しますか？\n\nすでに受け取られた一冊と、その旅の履歴は削除されません。`,{title:'あ箱の本から削除',danger:true,confirmLabel:'削除する'}))return;
    del.disabled=true;try{await api(`/admin/official-shelf/${encodeURIComponent(del.dataset.shelfId)}`,{method:'DELETE'});toast('あ箱の本から削除しました');await loadOfficialShelfAdmin();}catch(err){AhakoDialog.alert(`削除できませんでした: ${err.message}`);}finally{del.disabled=false;}return;
  }
  const b=e.target.closest('[data-shelf-action]');if(!b)return;b.disabled=true;try{await api(`/admin/official-shelf/${encodeURIComponent(b.dataset.shelfId)}/${b.dataset.shelfAction}`,{method:'POST'});toast(b.dataset.shelfAction==='stop'?'停止しました':'再開しました');await loadOfficialShelfAdmin();}catch(err){AhakoDialog.alert(`操作できませんでした: ${err.message}`);}finally{b.disabled=false;}
});
els.connect.addEventListener('click',connect);els.token.addEventListener('keydown',e=>{if(e.key==='Enter')connect();});els.refresh.addEventListener('click',loadDashboard);els.filter.addEventListener('change',loadReports);if(els.contactFilter)els.contactFilter.addEventListener('change',loadContacts);els.inspect.addEventListener('click',inspect);
setAdminTab(sessionStorage.getItem('ahako-admin-tab')||'status',{remember:false});
if(token)connect();
function installWebhookInbox(){
  const anchor=els.auditOrdersList;if(!anchor)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>Webhook受信・再処理</summary><p>受信記録から購入確定・返金状態を再照合します。新しい課金・送金・返金は実行しません。</p><button type="button" data-webhook-refresh>受信記録を更新</button><div data-webhook-list></div>';
  anchor.parentNode.append(panel);
  const container=panel.querySelector('[data-webhook-list]');
  let generation=0;
  async function load(){
    const own=++generation;container.textContent='受信記録を確認しています…';
    try{
      const events=[];let cursor=null;
      do{
        const data=await api('/admin/commerce/webhooks'+(cursor?'?cursor='+encodeURIComponent(cursor):''));
        events.push(...(data.events||[]));cursor=data.cursor;
      }while(cursor);
      if(own!==generation)return;
      const labels={pending:'未処理',processing:'処理中',waiting:'待機',failed:'失敗',needs_review:'要確認',applied:'処理済み',ignored:'対象外・処理不要'};
      events.sort((a,b)=>String(b.receivedAt).localeCompare(String(a.receivedAt)));
      const active=events.filter(e=>!['applied','ignored'].includes(e.status));
      const done=events.filter(e=>['applied','ignored'].includes(e.status));
      function card(e){return `<div class="audit-order-card" style="display:block"><strong>${escapeHtml(labels[e.status]||e.status)} · ${escapeHtml(e.type)}</strong><p><code style="overflow-wrap:anywhere">${escapeHtml(e.eventId)}</code></p><p>${escapeHtml(formatJstDate(e.receivedAt))} · 試行 ${Number(e.attempts||0)}回</p>${e.reason?`<p>${escapeHtml(e.reason)}</p>`:''}${e.orderId?`<p><code>${escapeHtml(e.orderId)}</code></p>`:''}${['pending','waiting','failed','needs_review'].includes(e.status)?`<button type="button" data-webhook-retry="${escapeHtml(e.eventId)}">再処理する</button>`:''}</div>`;}
      container.innerHTML=events.length?`<p>未完了・要確認 ${active.length}件 / 処理済み・対象外 ${done.length}件</p>${active.map(card).join('')}<details><summary>処理済み・対象外 ${done.length}件</summary>${done.map(card).join('')}</details>`:'保存された受信記録はまだありません。更新後に届く通知から記録します。';
      container.querySelectorAll('[data-webhook-retry]').forEach(button=>button.onclick=async()=>{
        button.disabled=true;button.textContent='再処理中…';
        try{const result=await api('/admin/commerce/webhook/'+encodeURIComponent(button.dataset.webhookRetry)+'/retry',{method:'POST',body:'{}'});toast(labels[result.status]||result.status);await load();}
        catch(error){button.disabled=false;button.textContent='再処理する';toast('再処理失敗: '+error.message);}
      });
    }catch(error){if(own===generation)container.textContent='受信記録を取得できませんでした: '+error.message;}
  }
  panel.querySelector('[data-webhook-refresh]').onclick=load;
  panel.addEventListener('toggle',()=>{if(panel.open)load();});
}
installWebhookInbox();

function installDisputeRiskPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>異議申立て・出金確認</summary><p>内部保留とStripeの銀行出金設定を分けて確認します。資金回収・返金・銀行出金は実行しません。Sandboxでは自動出金スケジュールをmanualへ変更できます。</p><button type="button" data-risk-refresh>異議申立てを更新</button><div data-risk-list></div><p>作者のConnected Account ID</p><input data-risk-account placeholder="acct_…" autocomplete="off" style="max-width:100%;width:320px"><button type="button" data-payout-check>出金設定を確認</button><div data-payout-result></div><hr><p><strong>登録済み作者の出金設定一覧</strong></p><p>現在の決済環境の登録を5件ずつ確認します。設定変更・出金は実行しません。</p><button type="button" data-payout-list-refresh>作者一覧を確認</button><div data-payout-list></div><button type="button" data-payout-list-more hidden>次の5件を確認</button>';
  els.auditOrdersList.parentNode.append(panel);
  const list=panel.querySelector('[data-risk-list]');
  async function load(){
    list.textContent='確認中…';
    try{
      const data=await api('/admin/commerce/risk');const items=data.disputes||[];
      items.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
      list.innerHTML=`<p>内部保留 ${items.filter(x=>x.blocked).length}件 / 記録 ${items.length}件</p>`+items.map(x=>`<div class="audit-order-card" style="display:block"><strong>${escapeHtml(x.status)} · ${yen(x.amount)}</strong><p>理由 ${escapeHtml(x.reason)} / 注文 ${escapeHtml(x.orderId||'未照合')}</p><p>証拠提出期限 ${escapeHtml(x.evidenceDueAt?formatJstDate(x.evidenceDueAt):'未設定')}</p><p>${x.blocked?'購入権・作者の内部取引を保留':'この異議申立てによる内部保留は解除'} / Stripeの銀行出金停止：未実施</p><p>購入時の作者配分 ${x.sellerShareAtSale===null?'未確認':yen(x.sellerShareAtSale)} / 後続の残高購入候補 ${(x.possibleDownstreamPurchases||[]).length}件（資金の出所は未確定）</p>${(x.possibleDownstreamPurchases||[]).length?`<details><summary>後続取引候補</summary>${x.possibleDownstreamPurchases.map(t=>`<p>${escapeHtml(t.orderId)} · ${yen(t.amount)}<br>${escapeHtml(t.buyerAccountId)} → ${escapeHtml(t.sellerAccountId||'あ箱')}</p>`).join('')}</details>`:''}${x.accountId?`<button type="button" data-risk-select="${escapeHtml(x.accountId)}">この作者の出金設定を確認</button>`:''}</div>`).join('');
      list.querySelectorAll('[data-risk-select]').forEach(button=>button.onclick=()=>{panel.querySelector('[data-risk-account]').value=button.dataset.riskSelect;checkPayout();});
    }catch(error){list.textContent=error.message;}
  }
  async function checkPayout(){
    const accountId=panel.querySelector('[data-risk-account]').value.trim(),result=panel.querySelector('[data-payout-result]');
    if(!/^acct_[A-Za-z0-9_]+$/.test(accountId)){result.textContent='Connected Account IDを確認してください。';return;}
    result.textContent='Stripeへ確認中…';
    try{
      const data=await api('/admin/commerce/account/'+encodeURIComponent(accountId)+'/payout-check');const p=data.payout;
      const shown=v=>v===null?'未確認':`¥${Number(v).toLocaleString('ja-JP')}`;
      result.innerHTML=`<p>Dashboard種別：${escapeHtml(p.dashboardType||'unknown')}</p><p>環境：${escapeHtml(p.environment)} / 内部保留：${p.internalHeld?'あり':'なし'}</p><p>Stripeの出金スケジュール：${escapeHtml(p.payoutInterval)} / 銀行出金能力：${p.payoutsEnabled===null?'未確認':p.payoutsEnabled?'有効':'無効'}</p><p>Stripe利用可能残高 ${shown(p.availableJPY)} / 入金待ち ${shown(p.pendingJPY)}</p><p><strong>あ箱の出金可能額：未算定。銀行出金実行：未実装。</strong></p><p>${p.payoutInterval==='manual'?'自動出金は停止設定です。':'自動出金は停止設定になっていません。'} 手動出金・Instant Payouts・既に作成済みの出金を止めた保証ではありません。</p>${p.errors.length?`<p>取得エラー：${escapeHtml(p.errors.map(x=>x.source+': '+x.code).join(', '))}</p>`:''}`;
      if(p.environment==='test'&&p.dashboardType==='express'){
        const button=document.createElement('button');button.type='button';button.textContent='SandboxのExpress画面を確認';result.appendChild(button);
        button.onclick=async()=>{
          button.disabled=true;
          try{
            const data=await api('/admin/commerce/account/'+encodeURIComponent(accountId)+'/express-login',{method:'POST'});
            const url=new URL(data.url);if(url.protocol!=='https:'||url.hostname!=='connect.stripe.com')throw new Error('ログイン先を確認できません。');
            const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='作者向けExpress Dashboardを開く';
            result.appendChild(document.createElement('br'));result.appendChild(link);
          }catch(error){const message=document.createElement('p');message.textContent=error.message;result.appendChild(message);}
          finally{button.disabled=false;}
        };
      }
      if(p.environment==='test'&&p.payoutInterval!=='manual'&&!p.errors.length){
        const button=document.createElement('button');button.type='button';button.textContent='Sandboxの自動出金を停止';result.appendChild(button);
        button.onclick=async()=>{
          if(!confirm(accountId+' の自動出金をmanualへ変更します。手動・Instant出金は別途制御が必要です。自動再開はしません。'))return;
          button.disabled=true;
          try{await api('/admin/commerce/account/'+encodeURIComponent(accountId)+'/manual-payouts',{method:'POST',body:JSON.stringify({accountId,confirmation:'STOP_AUTOMATIC_PAYOUTS'})});await checkPayout();}
          catch(error){result.textContent='設定変更・確認に失敗しました：'+error.message+'。出金設定を再取得してください。';}
        };
      }
    }catch(error){result.textContent=error.message;}
  }
  let payoutRows=[],payoutCursor=null,payoutLoading=false,payoutEnvironment='';
  const payoutList=panel.querySelector('[data-payout-list]'),more=panel.querySelector('[data-payout-list-more]'),refresh=panel.querySelector('[data-payout-list-refresh]');
  function renderPayoutList(){
    const shown=v=>v===null||v===undefined?'未確認':yen(v);
    const verified=payoutRows.filter(x=>x.payout?.payoutInterval==='manual'&&!x.errors.length&&!x.payout.errors.length).length;
    payoutList.innerHTML=`<p>環境：${escapeHtml(payoutEnvironment)} / 取得 ${payoutRows.length}件 / manual確認済み ${verified}件（取得済み分）</p>`+payoutRows.map(x=>{
      const p=x.payout,errors=[...(x.errors||[]),...(p?.errors||[])];
      const state=!p||errors.length?'未確認・取得エラー':p.payoutInterval==='manual'?'自動出金は停止設定':p.payoutInterval==='unknown'?'スケジュール未確認':'自動出金は停止設定ではありません';
      return `<div class="audit-order-card" style="display:block;overflow-wrap:anywhere"><strong>${escapeHtml(x.displayName)}</strong><p>${escapeHtml(x.authorId)}<br>${escapeHtml(x.accountId||'Account ID未確認')}</p><p>${escapeHtml(state)} / ${escapeHtml(p?.payoutInterval||'unknown')}</p><p>Stripe利用可能 ${shown(p?.availableJPY)} / 入金待ち ${shown(p?.pendingJPY)}</p><p>内部保留：${p?(p.internalHeld?'あり':'なし'):'未確認'} / 銀行出金能力：${!p||p.payoutsEnabled===null?'未確認':p.payoutsEnabled?'有効':'無効'}</p>${errors.length?`<p>取得エラー：${escapeHtml(errors.map(e=>e.source+': '+e.code).join(', '))}</p>`:''}${x.accountId?`<button type="button" data-payout-list-select="${escapeHtml(x.accountId)}">個別に確認</button>`:''}</div>`;
    }).join('')+'<p>manualは自動出金の停止設定です。手動・Instant出金や、作成済み出金の停止確認は含みません。</p>';
    payoutList.querySelectorAll('[data-payout-list-select]').forEach(button=>button.onclick=()=>{panel.querySelector('[data-risk-account]').value=button.dataset.payoutListSelect;checkPayout();});
  }
  async function loadPayoutList(reset){
    if(payoutLoading)return;payoutLoading=true;refresh.disabled=true;more.disabled=true;
    if(reset){payoutRows=[];payoutCursor=null;payoutList.textContent='Stripeへ確認中…';more.hidden=true;}
    try{
      const data=await api('/admin/commerce/payout-accounts'+(!reset&&payoutCursor?'?cursor='+encodeURIComponent(payoutCursor):''));
      if(!reset&&payoutEnvironment&&payoutEnvironment!==data.environment)throw new Error('決済環境が変わりました。作者一覧を再取得してください。');
      payoutEnvironment=data.environment;payoutRows.push(...(data.accounts||[]));payoutCursor=data.nextCursor;
      renderPayoutList();more.hidden=!data.hasMore;
      if(!payoutRows.length)payoutList.textContent='この決済環境にはConnected Accountの登録がありません。';
    }catch(error){const message=document.createElement('p');message.textContent='一覧の取得に失敗しました：'+error.message;payoutList.appendChild(message);}
    finally{payoutLoading=false;refresh.disabled=false;more.disabled=false;}
  }
  refresh.onclick=()=>loadPayoutList(true);more.onclick=()=>loadPayoutList(false);
  panel.querySelector('[data-risk-refresh]').onclick=load;panel.querySelector('[data-payout-check]').onclick=checkPayout;
  panel.addEventListener('toggle',()=>{if(panel.open)load();});
}
installDisputeRiskPanel();

})();
