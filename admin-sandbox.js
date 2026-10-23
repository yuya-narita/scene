(()=>{
'use strict';
const API='https://scene-studio-api-sandbox.a-hako.workers.dev';
const $=s=>document.querySelector(s);
let token=sessionStorage.getItem('ahako-sandbox-admin-token')||'';
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
const els={login:$('#loginPanel'),content:$('#adminContent'),token:$('#tokenInput'),connect:$('#connectButton'),loginStatus:$('#loginStatus'),refresh:$('#refreshButton'),filter:$('#reportFilter'),list:$('#reportList'),openCount:$('#openCount'),shownCount:$('#shownCount'),contactFilter:$('#contactFilter'),contactList:$('#contactList'),openContactCount:$('#openContactCount'),shownContactCount:$('#shownContactCount'),contactTabBadge:$('#contactTabBadge'),authorCount:$('#authorCount'),authorList:$('#authorList'),workCount:$('#workCount'),publishedCount:$('#publishedCount'),suspendedCount:$('#suspendedCount'),r2Usage:$('#r2Usage'),assetCount:$('#assetCount'),heavyWorks:$('#heavyWorks'),orphanSummary:$('#orphanSummary'),orphanNote:$('#orphanNote'),expiredPreviewSummary:$('#expiredPreviewSummary'),cleanupOrphans:$('#cleanupOrphansButton'),todayViews:$('#todayViews'),todayCompletions:$('#todayCompletions'),todaySceneAdvances:$('#todaySceneAdvances'),todayCompletionRate:$('#todayCompletionRate'),popularWorks:$('#popularWorks'),readerTodayViews:$('#readerTodayViews'),readerTodayCompletions:$('#readerTodayCompletions'),readerTodaySceneAdvances:$('#readerTodaySceneAdvances'),readerTodayCompletionRate:$('#readerTodayCompletionRate'),readerTodayStudio:$('#readerTodayStudio'),readerTodayOfficial:$('#readerTodayOfficial'),readerSites:$('#readerSites'),readerModes:$('#readerModes'),distTodayReaders:$('#distTodayReaders'),distTodayCompletions:$('#distTodayCompletions'),distPeriodReaders:$('#distPeriodReaders'),distObservedCopies:$('#distObservedCopies'),distObservedWorks:$('#distObservedWorks'),distPeriodOpens:$('#distPeriodOpens'),distTopCopies:$('#distTopCopies'),distWorks:$('#distWorks'),relayPeriodCount:$('#relayPeriodCount'),relayCopies:$('#relayCopies'),relayWorks:$('#relayWorks'),relayMaxHop:$('#relayMaxHop'),relayTopCopies:$('#relayTopCopies'),relayWorksList:$('#relayWorksList'),workId:$('#workIdInput'),inspect:$('#inspectButton'),direct:$('#directResult'),reportTabBadge:$('#reportTabBadge'),reloadSelection:$('#reloadSelectionButton'),selectionStatus:$('#selectionStatus'),publishedWorksStatus:$('#publishedWorksStatus'),publishedWorks:$('#publishedWorks'),editionCandidates:$('#editionCandidates'),officialShelfItems:$('#officialShelfItems'),auditOrderId:$('#auditOrderIdInput'),auditOrderButton:$('#auditOrderButton'),auditOrderStatus:$('#auditOrderStatus'),auditOrderResult:$('#auditOrderResult'),auditOrdersList:$('#auditOrdersList'),auditOrdersStatus:$('#auditOrdersStatus'),auditOrdersReload:$('#auditOrdersReloadButton'),auditOkCount:$('#auditOkCount'),auditAlertCount:$('#auditAlertCount'),auditPendingCount:$('#auditPendingCount'),auditTabBadge:$('#auditTabBadge'),dailyReconDay:$('#dailyReconDay'),dailyReconButton:$('#dailyReconButton'),dailyReconStatus:$('#dailyReconStatus'),dailyReconResult:$('#dailyReconResult'),previewList:$('#previewList'),previewListCount:$('#previewListCount')};
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
  const responseButton=document.createElement('button');responseButton.type='button';responseButton.textContent='この注文の対応確認';responseButton.onclick=()=>openOrderResponseCheck?.(audit.orderId);els.auditOrderResult.appendChild(responseButton);
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
  if(remember)sessionStorage.setItem('ahako-sandbox-admin-tab',name);
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
async function connect(){token=els.token.value.trim();if(!token){els.loginStatus.textContent='ADMIN_TOKENを入力してください。';return;}els.connect.disabled=true;try{const sandboxStatus=await api('/commerce/status');if(sandboxStatus.ok!==true||sandboxStatus.environment!=='test')throw new Error('Sandbox TEST環境を確認できないため、接続を停止しました。');verifiedStats=await api('/admin/stats');sessionStorage.setItem('ahako-sandbox-admin-token',token);els.loginStatus.textContent='';els.login.hidden=true;els.content.hidden=false;els.refresh.disabled=false;await loadDashboard();}catch(e){verifiedStats=null;els.loginStatus.textContent=e.status===401?'ADMIN_TOKENが違います。':`接続できません: ${e.message}`;}finally{els.connect.disabled=false;}}

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
    const expiredPreviewCount=Number(d.storage?.expiredPreviewCount||0);
    const expiredPreviewBytes=Number(d.storage?.expiredPreviewBytes||0);
    if(els.orphanSummary)els.orphanSummary.textContent=orphanCount?`${orphanCount.toLocaleString('ja-JP')}素材 · ${formatBytes(orphanBytes)}`:'0素材';
    if(els.orphanNote)els.orphanNote.textContent=recentCount?`ほかに公開処理保護中 ${recentCount.toLocaleString('ja-JP')}素材（24時間未満）`:'現存作品から参照されていない古い素材だけが対象です。';
    if(els.expiredPreviewSummary)els.expiredPreviewSummary.textContent=expiredPreviewCount?`削除対象Preview：${expiredPreviewCount.toLocaleString('ja-JP')}作品 · ${formatBytes(expiredPreviewBytes)}`:'削除対象Preview：0作品';
    const cleanupCount=orphanCount+expiredPreviewCount;
    if(els.cleanupOrphans){els.cleanupOrphans.disabled=cleanupCount===0;els.cleanupOrphans.textContent=cleanupCount?'お掃除':'きれい';}
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
  const previewCount=Number(lastStats?.storage?.expiredPreviewCount||0);
  const previewBytes=Number(lastStats?.storage?.expiredPreviewBytes||0);
  if(!count&&!previewCount){toast('お掃除対象はありません');return;}
  const targets=[count?`未参照素材 ${count.toLocaleString('ja-JP')}件（${formatBytes(bytes)}）`:'',previewCount?`保管期限超過Preview ${previewCount.toLocaleString('ja-JP')}作品（${formatBytes(previewBytes)}）`:''].filter(Boolean).join('\n');
  if(!await AhakoDialog.confirm(`${targets}をR2から完全削除します。\n\n現存作品が参照している素材、アップロードから24時間未満の素材、閲覧期限から30日以内のPreviewは削除しません。\nこの操作は元に戻せません。`,{title:'R2をお掃除',kicker:'CLEANUP',danger:true,confirmLabel:'完全削除する'}))return;
  els.cleanupOrphans.disabled=true;
  els.cleanupOrphans.textContent='掃除中…';
  try{
    const d=await api('/admin/orphans/cleanup',{method:'POST'});
    const parts=[];if(Number(d.deletedCount||0))parts.push(`${Number(d.deletedCount).toLocaleString('ja-JP')}素材・${formatBytes(d.deletedBytes||0)}`);if(Number(d.expiredPreviewDeletedCount||0))parts.push(`Preview ${Number(d.expiredPreviewDeletedCount).toLocaleString('ja-JP')}作品・${formatBytes(d.expiredPreviewDeletedBytes||0)}`);toast(`${parts.join(' / ')||'0件'}を削除しました`);
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
    els.authorList.innerHTML=rows.length?rows.map(author=>{const active=author.accountStatus!=='suspended';return `<article class="contact-card${active?'':' is-resolved'}" data-author-id="${escapeHtml(author.authorId||'')}"><div class="meta"><span>作者名</span><strong>${escapeHtml(author.displayName||'未設定')}</strong><span>メール</span><a class="inline-link" href="mailto:${escapeHtml(author.email||'')}">${escapeHtml(author.email||'')}</a><span>authorId</span><code>${escapeHtml(author.authorId||'')}</code><span>状態</span><strong>${active?'利用中':'停止中'}</strong><span>登録</span><span>${escapeHtml(formatJstDate(author.createdAt))}</span></div><div class="actions"><button type="button" data-author-action="${active?'suspend':'activate'}" class="${active?'stop':''}">${active?'利用を停止':'利用を再開'}</button><button type="button" data-author-sale-check="${escapeHtml(author.authorId||'')}">販売準備を確認</button><button type="button" data-author-shadow-check="${escapeHtml(author.authorId||'')}">リスク監視</button><button type="button" data-author-fund-ledger="${escapeHtml(author.authorId||'')}">原資台帳</button><button type="button" data-author-allocation="${escapeHtml(author.authorId||'')}">残額割当</button></div></article>`;}).join(''):'<div class="empty">作者アカウントはまだありません。</div>';
  }catch(error){
    if(els.authorCount)els.authorCount.textContent='–';
    els.authorList.innerHTML=`<div class="empty">作者を読み込めませんでした: ${escapeHtml(error.message)}</div>`;
  }
}
function formatPreviewDate(value){
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '日時不明';
  return new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
}
async function copyPreviewUrl(url){
  try{await navigator.clipboard.writeText(url);toast('Preview URLをコピーしました');}
  catch(_){window.prompt('Preview URLをコピーしてください',url);}
}
async function loadPreviews(){
  if(!els.previewList)return;
  els.previewList.innerHTML='<div class="empty">読み込み中…</div>';
  if(els.previewListCount)els.previewListCount.textContent='確認中…';
  try{
    const d=await api('/admin/previews');
    const rows=Array.isArray(d.previews)?d.previews:[];
    if(els.previewListCount)els.previewListCount.textContent=`${rows.length.toLocaleString('ja-JP')}作品`;
    if(!rows.length){els.previewList.innerHTML='<div class="empty">Previewはまだありません。</div>';return;}
    els.previewList.innerHTML=rows.map(row=>{
      const expired=row.expired===true;
      const url=String(row.url||'');
      return `<div class="preview-row${expired?' is-expired':''}">
        <div class="preview-main"><strong>${escapeHtml(row.fileName||'preview.scene')}</strong><small>発行 ${escapeHtml(formatPreviewDate(row.createdAt))}</small></div>
        <div class="preview-state"><span class="state${expired?' expired':''}">${expired?'期限切れ':'有効'}</span><time>期限 ${escapeHtml(formatPreviewDate(row.expiresAt))}</time></div>
        <div class="preview-actions"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">開く</a><button type="button" data-preview-copy="${escapeHtml(url)}">URLコピー</button><button type="button" data-preview-claim="${escapeHtml(row.token||'')}">${row.claimActive?'受取URL再発行':'受取URL発行'}</button></div>
      </div>`;
    }).join('');
  }catch(e){
    if(els.previewListCount)els.previewListCount.textContent='';
    els.previewList.innerHTML=`<div class="empty">Preview一覧を読み込めませんでした: ${escapeHtml(e.message)}</div>`;
  }
}
async function loadDashboard(){await Promise.all([loadStats(),loadReports(),loadContacts(),loadAuthors(),loadAnalytics(),loadReaderAnalytics(),loadDistributionObservation(),loadRelayAnalytics(),loadPreviews()]);}

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
if(els.previewList)els.previewList.addEventListener('click',async e=>{
  const copy=e.target.closest('[data-preview-copy]');if(copy){copyPreviewUrl(copy.dataset.previewCopy||'');return;}
  const claim=e.target.closest('[data-preview-claim]');if(!claim)return;
  const previewToken=claim.dataset.previewClaim||'';if(!previewToken)return;
  const original=claim.textContent;claim.disabled=true;claim.textContent='発行中…';
  try{
    const d=await api(`/admin/previews/${encodeURIComponent(previewToken)}/claim`,{method:'POST'});
    const claimUrl=String(d?.claim?.url||'');if(!claimUrl)throw new Error('受取URLを取得できませんでした');
    try{await navigator.clipboard.writeText(claimUrl);toast('受取URLを発行してコピーしました');}
    catch(_){window.prompt('この受取URLを作者へDMしてください',claimUrl);}
    await loadPreviews();
  }catch(error){toast(error.message||'受取URLを発行できませんでした');claim.disabled=false;claim.textContent=original;}
});
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
setAdminTab(sessionStorage.getItem('ahako-sandbox-admin-tab')||'status',{remember:false});
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

let openSellerReadinessCheck=null;
els.authorList?.addEventListener('click',event=>{
  const button=event.target.closest('[data-author-sale-check]');
  if(!button||!openSellerReadinessCheck)return;
  setAdminTab('audit');openSellerReadinessCheck(button.dataset.authorSaleCheck);
});
function installSellerReadinessPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>作者の本番販売チェック</summary><p>作者IDを指定して、販売許可とStripe設定を確認します。準備完了後は、この画面で本番販売を許可・停止できます。</p><label>作者ID <input data-seller-id placeholder="author_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><button type="button" data-seller-run>販売準備を確認</button><div data-seller-result aria-live="polite"></div>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const input=panel.querySelector('[data-seller-id]'),button=panel.querySelector('[data-seller-run]'),result=panel.querySelector('[data-seller-result]');
  let busy=false;
  async function run(){
    if(busy)return;
    const authorId=input.value.trim();
    result.textContent='';
    if(!/^author_[a-f0-9]{32}$/.test(authorId)){result.textContent='author_から始まる作者IDを確認してください。';return;}
    busy=true;button.disabled=true;input.disabled=true;button.textContent='確認中…';result.textContent='現在の販売許可とStripe設定を照会しています…';
    try{
      const data=await apiWithTimeout('/admin/commerce/seller-readiness?authorId='+encodeURIComponent(authorId),{},30000);
      const s=data.sellerReadiness;
      if(!s||s.authorId!==authorId||!Array.isArray(s.checks))throw new Error('販売チェック結果を確認できません。Workerを更新してください。');
      const labels={ready:'現在の販売開始チェック：OK',awaiting_allowlist:'Stripe設定の確認完了・販売許可待ち',paused:'作者設定の確認完了・新規購入は停止中',blocked:'販売開始前に確認が必要です',sandbox:'Sandboxの確認結果です。本番販売の準備完了ではありません。'};
      const checkLabel={ok:'✓',blocked:'要対応',unknown:'未確認'};
      result.innerHTML=`<div class="audit-order-card" style="display:block;overflow-wrap:anywhere"><strong>${escapeHtml(s.displayName)}</strong><p>${escapeHtml(labels[s.state]||'状態未確認')}</p><p>環境：${escapeHtml(s.environment)} / 新規購入：${s.paymentsEnabled?'有効':'停止'}<br>販売許可：${s.authorization?.unverified?'未確認':s.policyValid?(s.listed?'許可中':'未許可・停止中'):'初期設定エラー'}</p><p>${escapeHtml(s.authorId)}<br>${escapeHtml(s.accountId||'Stripe連携未確認')}</p>${s.checks.map(c=>`<p><strong>${escapeHtml(checkLabel[c.status]||'未確認')} ${escapeHtml(c.label)}</strong><br>${escapeHtml(c.detail)}</p>`).join('')}${s.errors?.length?`<p>取得エラー：${escapeHtml(s.errors.map(e=>e.source+': '+e.code).join(', '))}</p>`:''}<small>確認日時 ${escapeHtml(formatJstDate(s.checkedAt))}</small></div>`;
      if(s.environment==='live'){
        const note=document.createElement('p');note.textContent='この結果は販売開始の技術的な確認です。運営による作品・販売条件の確認と、本番の初回購入の確認も行ってください。';result.appendChild(note);
      }
      if(s.environment==='live'&&s.authorization){
        const auth=s.authorization;
        const source=document.createElement('p');
        source.textContent='許可の取得元：'+(auth.unverified?'未確認':auth.source==='admin'?'adminの設定':'初期の許可リスト')+(auth.error?' / '+auth.error:'');
        result.appendChild(source);
        const stopNote=document.createElement('p');stopNote.textContent='販売停止は新しい購入手続きを止めます。既に発行済みのStripe決済画面の取消し・返金・銀行出金停止は行いません。';result.appendChild(stopNote);
        if(s.canAllow||s.canStop){
          const action=s.canAllow?'allow':'deny';
          const actionButton=document.createElement('button');actionButton.type='button';
          actionButton.textContent=action==='allow'?'この作者の本番販売を許可':'この作者の新規販売を停止';
          result.appendChild(actionButton);
          actionButton.onclick=async()=>{
            if(busy)return;
            busy=true;button.disabled=true;input.disabled=true;actionButton.disabled=true;
            let submitted=false,message='';
            try{
              const confirmed=await AhakoDialog.confirm(`${s.displayName}\n${s.authorId}\n\n`+(action==='allow'?'この作者の本番販売を許可します。Stripe設定を再確認して反映します。':'この作者の新しい購入手続きを停止します。既存のStripe決済画面・購入済みの権利・資金は変更しません。'),{title:action==='allow'?'本番販売を許可':'新規販売を停止',danger:action==='deny',confirmLabel:action==='allow'?'販売を許可する':'新規販売を停止する'});
              if(!confirmed)return;
              submitted=true;
              const data=await apiWithTimeout('/admin/commerce/seller-authorization',{method:'POST',body:JSON.stringify({authorId,action,expectedVersion:auth.version,expectedAccountId:s.accountId,confirmation:action==='allow'?'ALLOW_LIVE_SELLER':'STOP_LIVE_SELLER'})},30000);
              if(data.authorization?.authorId!==authorId||data.authorization?.decision!==action)throw new Error('反映結果を確認できません。');
              message=action==='allow'?'本番販売の許可を保存しました。再取得した現在の状態を確認してください。':'新規販売の停止を保存しました。再取得した現在の状態を確認してください。';
            }catch(error){message='操作結果を確認してください：'+error.message+'。現在の設定を再取得します。';}
            finally{
              busy=false;button.disabled=false;input.disabled=false;actionButton.disabled=false;
              if(submitted){await run();const status=document.createElement('p');status.textContent=message;result.appendChild(status);}
            }
          };
        }
        if(auth.history?.length){
          const history=document.createElement('details');
          history.innerHTML='<summary>最近の許可・停止履歴</summary>'+auth.history.map(item=>`<p>${escapeHtml(formatJstDate(item.at))} / ${item.decision==='allow'?'販売を許可':'新規販売を停止'} / 管理者</p>`).join('');
          result.appendChild(history);
        }
      }
    }catch(error){result.textContent='確認できませんでした：'+error.message+'。状態を再取得してください。';}
    finally{busy=false;button.disabled=false;input.disabled=false;button.textContent='販売準備を確認';}
  }
  button.onclick=run;
  input.addEventListener('input',()=>{result.textContent='';});
  openSellerReadinessCheck=authorId=>{
    if(busy)return;
    panel.open=true;input.value=authorId;panel.scrollIntoView({behavior:'smooth',block:'start'});run();
  };
}
installSellerReadinessPanel();

function disputeResponsePresentation(dispute,now=Date.now()){
  const status=String(dispute?.status||'unknown');
  const labels={needs_response:'異議申立て・証拠提出待ち',under_review:'異議申立て・審査中',won:'勝訴',lost:'敗訴',warning_needs_response:'事前照会・回答待ち',warning_under_review:'事前照会・審査中',warning_closed:'事前照会終了',prevented:'未然防止'};
  const responseNeeded=['needs_response','warning_needs_response'].includes(status);
  let next=responseNeeded?'Stripeで提出期限と理由を確認し、購入時の販売条件・提供記録・連絡記録を準備してください。':
    ['under_review','warning_under_review'].includes(status)?'Stripeで審査状況を確認してください。通常返金を重ねず、結果通知を待ちます。':
    status==='won'?'Webhookと内部保留の解除を確認してください。他の異議申立てやadminの販売停止は別に確認します。':
    status==='lost'?'追加返金をせず、作者配分の回収状況をStripeで確認してください。現在の実装では内部保留を維持します。':
    ['warning_closed','prevented'].includes(status)?'Stripeの確定状態と内部保留の解除を確認してください。':
    '状態を判定できません。Stripeで確認し、資金操作を進めないでください。';
  const due=Date.parse(dispute?.evidenceDueAt||'');
  const deadline=responseNeeded?(Number.isFinite(due)?(due<=now?'提出期限を過ぎている可能性があります。Stripeで確認してください。':'提出期限：'+formatJstDate(dispute.evidenceDueAt)):'提出期限が未取得です。Stripeで確認してください。'):'';
  return {label:labels[status]||'状態未確認',next,deadline};
}
function responseStripeLink(environment,kind,id){
  if(!['live','test'].includes(environment))return '';
  if(kind==='disputes'?!/^du_[A-Za-z0-9_]+$/.test(id||''):!/^((pi|ch|py)_[A-Za-z0-9_]+)$/.test(id||''))return '';
  return `https://dashboard.stripe.com/${environment==='test'?'test/':''}${kind}/${encodeURIComponent(id)}`;
}
function renderDisputeResponseNote(dispute,environment){
  const p=disputeResponsePresentation(dispute),url=responseStripeLink(environment,'disputes',dispute.disputeId||dispute.id);
  return `<div><p><strong>${escapeHtml(p.label)}</strong>${p.deadline?'<br>'+escapeHtml(p.deadline):''}</p><p>${escapeHtml(p.next)}</p>${url?`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Stripeで異議申立てを確認（${environment==='live'?'本番LIVE':'TEST'}）</a>`:''}</div>`;
}
let openOrderResponseCheck=null;
function installOrderResponsePanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>返金・異議申立て対応（読取専用）</summary><p>注文のStripe返金・異議申立てと、あ箱の購入権を確認します。この確認では資金・注文・購入権を変更しません。</p><label>Order ID <input data-response-id placeholder="order_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><button type="button" data-response-run>対応確認を取得</button><div data-response-result aria-live="polite"></div><details><summary>運営の対応手順</summary><ol><li>支払済みなのにMY COPYがない場合は個別監査を行い、「MY COPYを再発行」が案内された時に権利だけを修復します。</li><li>通常返金は、Stripeの既存返金・異議申立て・作者配分の回収状況を先に確認します。現在の操作は全額返金用です。部分返金は別途確認します。</li><li>異議申立てはStripeで対応します。通常返金を重ねず、提出期限と証拠を確認してください。提出後は内容を修正できないため、提出前に確認します。</li><li>作者が出金済み、残高不足、送金取消失敗の場合は回収済みと判断しません。独立した返金や送金を追加せず、Stripeの実績を照合します。</li><li>復旧・返金の反映後は個別監査、Webhook処理状況、日次照合を確認します。履歴は残します。</li></ol><p>売上残高購入では、作者への送金取消を確認してから購入者のDebitを返金します。Debitだけ成功した事故の復旧とは分けて扱います。本番の売上残高購入は現在停止中です。</p><p>販売停止・内部保留・manual設定は、銀行出金を完全停止した証明にはなりません。銀行出金済額・回収可能額は未算定です。</p><p><a href="https://docs.stripe.com/disputes/responding" target="_blank" rel="noopener noreferrer">Stripe：異議申立て対応</a> ／ <a href="https://docs.stripe.com/connect/destination-charges" target="_blank" rel="noopener noreferrer">Stripe：返金と送金取消</a></p></details>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const input=panel.querySelector('[data-response-id]'),button=panel.querySelector('[data-response-run]'),result=panel.querySelector('[data-response-result]');
  let busy=false;
  async function run(){
    if(busy)return;
    const orderId=input.value.trim().toLowerCase();result.textContent='';
    if(!/^order_[a-f0-9]{32}$/.test(orderId)){result.textContent='Order IDを確認してください。';return;}
    busy=true;input.disabled=true;button.disabled=true;button.textContent='確認中…';result.textContent='Stripeの現在状態とあ箱の記録を確認しています…';
    try{
      const data=await apiWithTimeout(`/admin/commerce/order/${encodeURIComponent(orderId)}/response-check`,{},30000),r=data.responseCheck;
      if(!r||r.orderId!==orderId||r.readOnly!==true)throw new Error('対応確認の結果を確認できません。Workerを更新してください。');
      const states={payment_sync_review:['Stripe支払済み・購入確定の反映を確認','追加購入や返金を先に行わず、Webhookの処理状況と個別監査を確認してください。購入確定の反映を優先します。'],debit_recovery_complete:['購入不成立のDebit・復旧返金を確認','作者送金がない事故の復旧です。正常購入後の返金とは別に扱います。MY COPYを新たに発行せず、復旧履歴と日次照合を確認してください。'],unverified:['未確認・照会エラー','Stripeと取得エラーを確認してください。未確認のまま返金・送金取消・再発行を進めないでください。'],dispute_review:['異議申立ての確認を優先','通常返金を重ねず、下のStripe状態と提出期限を確認してください。勝訴・敗訴後も回収と保留反映の確認が必要です。'],refund_pending:['Stripeで返金処理中','返金を再度作成せず、Stripeの結果とWebhook反映を確認してください。'],refund_complete:['Stripe全額返金・あ箱の失効反映を確認','追加返金は不要です。日次照合も確認してください。'],refund_sync_review:['Stripe全額返金済み・照合と権利反映を確認','再返金せず、Webhookの処理状況と個別監査を確認してください。'],partial_refund_review:['部分返金あり・個別確認','現在の全額返金・全失効の処理では判断できません。Stripeの返金累計と購入権の扱いを確認してください。'],refund_failure_review:['失敗・取消済みの返金記録あり','送金取消と返金の実績を先に確認してください。別の返金を新規作成せず、元の処理を調べます。'],entitlement_repair:['金銭照合済み・MY COPY権利だけの修復候補','個別監査を再取得し、「MY COPYを再発行」の案内から修復してください。返金を先に行う必要はありません。'],audit_review:['監査に不一致あり','個別監査で原因を確認してください。金銭系の自動修復は行いません。'],purchase_incomplete:['購入確定前の注文','Stripe未払いと断定する表示ではありません。下のCheckout照会と個別監査を確認してください。'],paid_review:['支払済み・対応内容を判断','通常の購入です。返金が必要な場合は、理由・既存返金・異議申立て・作者配分の回収を確認してから判断します。']};
      const [title,next]=states[r.state]||states.unverified;
      const money=v=>v===null||v===undefined||!Number.isFinite(Number(v))?'未確認':r.currency==='JPY'?'¥'+Number(v).toLocaleString('ja-JP'):`${escapeHtml(r.currency)} ${Number(v).toLocaleString('ja-JP')}（最小単位）`;
      const status=v=>({active:'有効',refunded:'返金による失効',revoked_refund:'返金による失効',missing:'記録なし',not_issued:'未発行'}[v]||v||'未確認');
      const stripe=r.stripe,refundLabels={pending:'処理中',requires_action:'追加対応待ち',succeeded:'成功',failed:'失敗',canceled:'取消済み'};
      const paymentUrl=stripe?responseStripeLink(r.environment,'payments',stripe.paymentIntentId||stripe.chargeId):'';
      result.innerHTML=`<div class="audit-order-card" style="display:block;overflow-wrap:anywhere"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(next)}</p><p>環境：${escapeHtml(r.environment)} / 確認日時 ${escapeHtml(formatJstDate(r.checkedAt))}<br>${escapeHtml(r.orderId)}</p><p>購入額 ${money(r.amount)} / 作者配分 ${money(r.revenue?.authorAmount)} / あ箱 ${money(r.revenue?.platformAmount)}<br>分配の基準：${r.revenue?.basis==='order_snapshot'?'購入時のOrder snapshot':r.revenue?.basis==='legacy_current_rule_fallback'?'旧注文の代替計算（snapshotなし）':'未確認'}</p><p>Stripe返金済額：${money(stripe?.amountRefunded)}<br>個別監査：${r.audit?.status==='ok'?'一致':r.audit?.status==='mismatch'?'不一致':'未確認'}<br>あ箱の注文状態：${escapeHtml(r.orderStatus)}</p><p>購入権：${escapeHtml(status(r.rights?.entitlementStatus))} / MY COPY：${escapeHtml(status(r.rights?.copyStatus))}<br>注文の異議申立て保留記録：${r.rights?.disputeAccessBlocked?'あり':'なし'}</p>${stripe?.refunds?.length?'<p><strong>Stripeの返金記録</strong></p>'+stripe.refunds.map(x=>`<p>${escapeHtml(refundLabels[x.status]||x.status)} ${money(x.amount)} / ${escapeHtml(x.id)}${x.failureReason?'<br>'+escapeHtml(x.failureReason):''}</p>`).join(''):stripe?.refunds?'<p>Stripeの返金記録：なし</p>':''}${stripe?.disputes?.map(x=>renderDisputeResponseNote(x,r.environment)).join('')||''}${r.checkout?`<p>Checkout照会：${escapeHtml(r.checkout.message||'未確認')}</p>`:''}${stripe?.transfer?`<p>Stripe送金額 ${money(stripe.transfer.amount)} / 取消累計 ${money(stripe.transfer.amountReversed)}<br>Stripe上の送金総額です。作者配分の回収済額・回収可能額とは区別します。</p>`:''}<p>作者のStripe利用可能残高 ${money(r.seller?.balance?.available)} / 入金待ち ${money(r.seller?.balance?.pending)}<br>この注文の作者配分の回収可能額・銀行出金済額：未算定。銀行出金停止の確認：未実施。</p><p>本番admin返金：${r.environment==='live'?(r.adminRefundEnabled?'有効':'無効'):'Sandbox'}。この確認から返金は実行しません。</p>${paymentUrl?`<a href="${escapeHtml(paymentUrl)}" target="_blank" rel="noopener noreferrer">Stripeで支払いを確認（${r.environment==='live'?'本番LIVE':'TEST'}）</a>`:''}${r.errors?.length?'<p>取得エラー：'+escapeHtml(r.errors.map(x=>x.source+': '+x.code).join(', '))+'</p>':''}</div>`;
      const auditButton=document.createElement('button');auditButton.type='button';auditButton.textContent='個別監査を再取得';auditButton.onclick=()=>{els.auditOrderId.value=orderId;runPaymentAudit();};result.appendChild(auditButton);
    }catch(error){result.textContent='対応確認できませんでした：'+error.message+'。結果は未確認です。';}
    finally{busy=false;input.disabled=false;button.disabled=false;button.textContent='対応確認を取得';}
  }
  button.onclick=run;input.addEventListener('input',()=>{result.textContent='';});
  openOrderResponseCheck=orderId=>{if(busy)return;panel.open=true;input.value=orderId;panel.scrollIntoView({behavior:'smooth',block:'start'});run();};
}
installOrderResponsePanel();

function installDisputeRiskPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>異議申立て・出金確認</summary><p>内部保留とStripeの銀行出金設定を分けて確認します。資金回収・返金・銀行出金は実行しません。Sandboxでは自動出金スケジュールをmanualへ変更できます。</p><button type="button" data-risk-refresh>保存済み通知を更新</button><div data-risk-list></div><p>作者のConnected Account ID</p><input data-risk-account placeholder="acct_…" autocomplete="off" style="max-width:100%;width:320px"><button type="button" data-payout-check>出金設定を確認</button><div data-payout-result></div><hr><p><strong>登録済み作者の出金設定一覧</strong></p><p>現在の決済環境の登録を5件ずつ確認します。設定変更・出金は実行しません。</p><button type="button" data-payout-list-refresh>作者一覧を確認</button><div data-payout-list></div><button type="button" data-payout-list-more hidden>次の5件を確認</button>';
  els.auditOrdersList.parentNode.append(panel);
  const list=panel.querySelector('[data-risk-list]'),riskRefresh=panel.querySelector('[data-risk-refresh]');
  let riskLoading=false;
  async function load(){
    if(riskLoading)return;riskLoading=true;riskRefresh.disabled=true;riskRefresh.textContent='取得中…';
    list.textContent='保存済みの通知記録を確認しています…';
    try{
      const data=await api('/admin/commerce/risk');const items=data.disputes||[];
      items.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
      list.innerHTML=`<p>内部保留 ${items.filter(x=>x.blocked).length}件 / 保存済み通知 ${items.length}件 / 取得 ${escapeHtml(formatJstDate(new Date().toISOString()))}</p><p>Stripeの現在状態は「この注文の対応確認」またはStripeで確認してください。</p>`+items.map(x=>`<div class="audit-order-card" style="display:block"><strong>${escapeHtml(x.status)} · ${yen(x.amount)}</strong><p>理由 ${escapeHtml(x.reason)} / 注文 ${escapeHtml(x.orderId||'未照合')}</p><p>証拠提出期限 ${escapeHtml(x.evidenceDueAt?formatJstDate(x.evidenceDueAt):'未設定')}</p><p>${x.blocked?'購入権・作者の内部取引を保留':'この異議申立てによる内部保留は解除'} / Stripeの銀行出金停止：未実施</p><p>購入時の作者配分 ${x.sellerShareAtSale===null?'未確認':yen(x.sellerShareAtSale)} / 後続の残高購入候補 ${(x.possibleDownstreamPurchases||[]).length}件（資金の出所は未確定）</p>${(x.possibleDownstreamPurchases||[]).length?`<details><summary>後続取引候補</summary>${x.possibleDownstreamPurchases.map(t=>`<p>${escapeHtml(t.orderId)} · ${yen(t.amount)}<br>${escapeHtml(t.buyerAccountId)} → ${escapeHtml(t.sellerAccountId||'あ箱')}</p>`).join('')}</details>`:''}${renderDisputeResponseNote(x,data.environment)}${x.orderId?`<button type="button" data-response-order="${escapeHtml(x.orderId)}">この注文の対応確認</button>`:'<p>注文未照合：Stripeで支払いとの対応を確認してください。</p>'}${x.accountId?`<button type="button" data-risk-select="${escapeHtml(x.accountId)}">この作者の出金設定を確認</button>`:''}</div>`).join('');
      list.querySelectorAll('[data-response-order]').forEach(button=>button.onclick=()=>openOrderResponseCheck?.(button.dataset.responseOrder));
      list.querySelectorAll('[data-risk-select]').forEach(button=>button.onclick=()=>{panel.querySelector('[data-risk-account]').value=button.dataset.riskSelect;checkPayout();});
    }catch(error){list.textContent=error.message;}
    finally{riskLoading=false;riskRefresh.disabled=false;riskRefresh.textContent='保存済み通知を更新';}
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
      return `<div class="audit-order-card" style="display:block;overflow-wrap:anywhere"><strong>${escapeHtml(x.displayName)}</strong><p>${escapeHtml(x.authorId)}<br>${escapeHtml(x.accountId||'Account ID未確認')}</p><p>${escapeHtml(state)} / ${escapeHtml(p?.payoutInterval||'unknown')}</p><p>Stripe利用可能 ${shown(p?.availableJPY)} / 入金待ち ${shown(p?.pendingJPY)}</p><p>内部保留：${p?(p.internalHeld?'あり':'なし'):'未確認'} / 銀行出金能力：${!p||p.payoutsEnabled===null?'未確認':p.payoutsEnabled?'有効':'無効'}</p>${errors.length?`<p>取得エラー：${escapeHtml(errors.map(e=>e.source+': '+e.code).join(', '))}</p>`:''}${x.accountId?`<button type="button" data-payout-list-select="${escapeHtml(x.accountId)}">個別に確認</button>`:''}<button type="button" data-seller-list-check="${escapeHtml(x.authorId)}">販売準備を確認</button></div>`;
    }).join('')+'<p>manualは自動出金の停止設定です。手動・Instant出金や、作成済み出金の停止確認は含みません。</p>';
    payoutList.querySelectorAll('[data-seller-list-check]').forEach(button=>button.onclick=()=>openSellerReadinessCheck?.(button.dataset.sellerListCheck));
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

let openShadowRiskCheck=null;
els.authorList?.addEventListener('click',event=>{
  const button=event.target.closest('[data-author-shadow-check]');
  if(button&&openShadowRiskCheck){setAdminTab('audit');openShadowRiskCheck(button.dataset.authorShadowCheck);}
});
function installShadowRiskPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>リスク監視（Shadow・資金操作なし）</summary><p>作者のStripe残高・内部保留・注文・Webhookの一部を確認し、観測記録を保存します。出金許可、保留の追加・解除、返金、購入権の変更は行いません。</p><label>作者ID <input data-shadow-author placeholder="author_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button type="button" data-shadow-run>現在状態を確認・記録</button> <button type="button" data-shadow-history>保存済みの観測を見る</button></p><div data-shadow-result aria-live="polite"></div><div data-shadow-history-result aria-live="polite"></div>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const input=panel.querySelector('[data-shadow-author]'),button=panel.querySelector('[data-shadow-run]'),historyButton=panel.querySelector('[data-shadow-history]'),result=panel.querySelector('[data-shadow-result]'),historyResult=panel.querySelector('[data-shadow-history-result]');
  let busy=false,last=null;
  const labels={PROVENANCE_UNVERIFIED:'資金の出所：未検証',FUND_AGE_UNVERIFIED:'原資の年齢：未検証',PAYOUT_PATHS_UNVERIFIED:'全出金経路の制御：未検証',BUDGET_UNCONFIGURED:'損失上限：未設定',DEADLINE_UNVERIFIED:'Stripe資金保有期限：未検証',AUTHOR_NOT_AUTHORIZED:'新規販売：許可を確認できない',SELLER_CHECK_UNVERIFIED:'販売準備の取得：未確認',CONNECT_UNVERIFIED:'Stripe連携：未確認',BALANCE_UNVERIFIED:'Stripe残高：未確認',NEGATIVE_STRIPE_BALANCE:'Stripe残高にマイナスあり',INTERNAL_HOLD_RECORDED:'保存済みの内部保留あり',DISPUTE_LOST_UNRECOVERED:'敗訴あり・回収確認が必要',DISPUTE_REVIEW:'異議申立ての確認が必要',REFUND_PENDING:'Stripeで返金処理中',RECONCILIATION_MISMATCH:'注文の個別監査に不一致あり',ENTITLEMENT_REPAIR_CANDIDATE:'MY COPY権利だけの修復候補あり',PAYMENT_SYNC_REVIEW:'Stripe支払済み・注文反映の確認が必要',ORDER_UNVERIFIED:'注文の照会結果：未確認',WEBHOOK_QUEUE_REVIEW:'この決済環境にWebhook未処理あり（作者への帰属未確認）',ORDER_ATTRIBUTION_UNVERIFIED:'口座に紐付かない注文あり（仮注文等を含む）',ORDER_SCAN_PARTIAL:'注文は一部の範囲を確認',WEBHOOK_SCAN_PARTIAL:'Webhookは一部の範囲を確認',LOOKUP_UNVERIFIED:'取得・記録の検証に失敗あり'};
  const stateLabels={confirmation_only:'購入確定前・決済IDなし（売上計上なし）',unverified:'未確認',paid_review:'支払済み',payment_sync_review:'支払済み・注文反映要確認',purchase_incomplete:'購入確定前（未払いと断定しない）',refund_complete:'全額返金・権利反映確認',refund_sync_review:'全額返金・権利反映要確認',refund_pending:'返金処理中',partial_refund_review:'部分返金・要確認',refund_failure_review:'返金失敗記録・要確認',dispute_review:'異議申立て記録あり',entitlement_repair:'購入権の修復候補',audit_review:'個別監査に不一致',debit_recovery_complete:'Debitのみ成功した事故の復旧確認'};
  function lock(value){busy=value;input.disabled=value;button.disabled=value;historyButton.disabled=value;result.querySelectorAll('button').forEach(b=>b.disabled=value);button.textContent=value?'確認中…':'現在状態を確認・記録';}
  function validId(){const id=input.value.trim().toLowerCase();if(!/^author_[a-f0-9]{32}$/.test(id))throw new Error('作者IDを確認してください。');return id;}
  function render(r){
    const esc=escapeHtml,money=v=>Number.isSafeInteger(v)?'¥'+v.toLocaleString('ja-JP'):'未確認';
    result.innerHTML=`<div class="audit-order-card" style="display:block;overflow-wrap:anywhere"><strong>監視のみ・出金判断は未完了</strong><p>${esc(r.seller.displayName)} / ${r.environment==='live'?'本番LIVE':'Sandbox TEST'}<br>確認日時：${esc(formatJstDate(r.checkedAt))}<br>観測記録：${esc(r.observationId)}</p><p>Stripe利用可能残高 ${money(r.balance?.availableJPY)}<br>Stripe入金待ち ${money(r.balance?.pendingJPY)}<br>残高購入の候補額：未算定 / 出金候補額：未算定<br>原資の年齢・保有期限：未検証 / 銀行出金の完全停止：未検証</p><p>保存済み通知による内部保留：${r.holds?(r.holds.internalHeld||r.holds.disputes.some(x=>x.blocked)?'あり':'記録なし'):'未確認'}。Stripeの全異議申立てを確認した意味ではありません。</p>${r.holds?.disputes.length?'<details><summary>保存済みの保留理由</summary>'+r.holds.disputes.map(x=>'<p>'+esc(x.disputeId)+' / '+esc({won:'勝訴',lost:'敗訴',needs_response:'回答待ち',under_review:'審査中',warning_closed:'事前照会終了',prevented:'未然防止'}[x.status]||x.status)+'<br>当該保留：'+(x.blocked?'あり':'解除記録あり')+' / 通知記録の更新：'+esc(x.updatedAt?formatJstDate(x.updatedAt):'未取得')+'</p>').join('')+'</details>':''}<ul>${r.reasonCodes.map(x=>'<li>'+esc(labels[x]||x)+'</li>').join('')}</ul><details><summary>販売準備の確認結果</summary>${r.seller.checks.map(x=>'<p>'+esc(x.label)+'：'+esc({ok:'確認済み',blocked:'条件未達',unknown:'未確認'}[x.status]||'未確認')+'<br>'+esc(x.detail)+'</p>').join('')}</details><p><strong>今回の注文ページ</strong><br>環境内を${r.coverage.orders.scanned??'未確認'}件走査／現在の連携口座に一致 ${r.coverage.orders.matched}件。口座未設定 ${r.coverage.orders.unattributed}件、他口座 ${r.coverage.orders.otherAccounts}件。後者はこの作者の売上に計上しません。</p>${r.orders.map(x=>`<p>${esc(x.orderId)}<br>${esc(stateLabels[x.state]||'未確認')}<br>${x.checkoutState?'Checkout照会：'+esc(x.checkoutState):''}</p>`).join('')||'<p>このページに対象口座の注文はありません。売上ゼロや異常なしを意味しません。</p>'}<p><strong>決済環境全体のWebhook待機キュー</strong><br>今回 ${r.coverage.webhooks.scanned??'未確認'}件。対象作者への帰属は未確認です。</p>${r.webhooks.map(x=>'<p>'+esc(x.eventId)+' / '+esc({pending:'待機',processing:'処理中',failed:'失敗',waiting:'後続処理待ち',needs_review:'運営確認待ち',applied:'反映済み',ignored:'対象外として処理済み'}[x.status]||'未確認')+'</p>').join('')||'<p>このページに待機通知はありません。Stripe側の未到達通知を調査した意味ではありません。</p>'}<p>注文は1回2件、Webhookは1回5件まで。表示は今回取得したページだけで、合算した全体監査ではありません。別の取得時刻の結果は同一時点の残高として合算できません。過去の連携口座、Stripeだけにある決済、日次照合、出所・期限の厳密な照合は別途確認します。</p>${r.errors.length||r.seller.errors.length?'<p>取得エラー：'+esc([...r.errors,...r.seller.errors].map(x=>x.source+': '+x.code).join(', '))+'</p>':''}</div>`;
    if(r.coverage.orders.nextCursor){const next=document.createElement('button');next.type='button';next.textContent='次の注文ページを確認・記録';next.onclick=()=>run({orderCursor:r.coverage.orders.nextCursor,webhookCursor:r.coverage.webhooks.startCursor,expectedEnvironment:r.environment,expectedAccountId:r.accountId});result.appendChild(next);}
    if(r.coverage.webhooks.nextCursor){const next=document.createElement('button');next.type='button';next.textContent='次のWebhookページを確認・記録';next.onclick=()=>run({orderCursor:r.coverage.orders.startCursor,webhookCursor:r.coverage.webhooks.nextCursor,expectedEnvironment:r.environment,expectedAccountId:r.accountId});result.appendChild(next);}
    for(const order of r.orders){const next=document.createElement('button');next.type='button';next.textContent='注文の対応確認：'+order.orderId.slice(-8);next.onclick=()=>openOrderResponseCheck?.(order.orderId);result.appendChild(next);const origin=document.createElement('button');origin.type='button';origin.textContent='原資を照合：'+order.orderId.slice(-8);origin.onclick=()=>openFundLedgerCheck?.('order',order.orderId);result.appendChild(origin);}
  }
  async function history(authorId){
    const data=await apiWithTimeout('/admin/commerce/shadow-risk?authorId='+encodeURIComponent(authorId),{},30000);
    if(!['live','test'].includes(data.environment)||!Array.isArray(data.history))throw new Error('Workerの監視機能を確認してください。');
    historyResult.innerHTML='<p><strong>保存済みの観測（現在状態の照会ではありません）</strong></p>'+data.history.map(x=>'<p>'+escapeHtml(formatJstDate(x.checkedAt))+' / '+escapeHtml(x.observationId)+'<br>監視のみ・出金判断は未完了</p>').join('');
    if(!data.history.length)historyResult.innerHTML+='<p>観測記録はまだありません。</p>';
    return data;
  }
  async function run(page={}){
    if(busy)return;
    let authorId;try{authorId=validId();}catch(e){result.textContent=e.message;return;}
    lock(true);last=null;result.textContent='Stripeとあ箱の記録を照会しています。完了すると観測記録を保存します…';
    try{
      const environment=page.expectedEnvironment||(await history(authorId)).environment;
      const data=await apiWithTimeout('/admin/commerce/shadow-risk',{method:'POST',body:JSON.stringify({authorId,...page,expectedEnvironment:environment})},45000),r=data.observation;
      if(!r||r.subjectId!==authorId||r.environment!==environment||r.decisionMode!=='shadow'||r.enforcementApplied!==false||r.spendableCandidateJPY!==null||r.payoutableCandidateJPY!==null)throw new Error('監視結果の対応を確認できません。');
      last=r;render(r);historyResult.textContent='今回の観測記録を保存しました。履歴は「保存済みの観測を見る」で再取得できます。';
    }catch(e){last=null;result.textContent='監視結果は未確認です：'+e.message+'。通信断の場合、観測記録だけ保存されている可能性があります。保存済みの観測を確認してください。';}
    finally{lock(false);}
  }
  button.onclick=()=>run();historyButton.onclick=async()=>{if(busy)return;try{const id=validId();lock(true);await history(id);}catch(e){historyResult.textContent='履歴を確認できません：'+e.message;}finally{lock(false);}};
  input.addEventListener('input',()=>{last=null;result.textContent='';historyResult.textContent='';});
  openShadowRiskCheck=authorId=>{if(busy)return;panel.open=true;input.value=authorId;result.textContent='';historyResult.textContent='';panel.scrollIntoView({behavior:'smooth',block:'start'});run();};
}
installShadowRiskPanel();

let openFundLedgerCheck=null;
els.authorList?.addEventListener('click',event=>{
  const button=event.target.closest('[data-author-fund-ledger]');
  if(button&&openFundLedgerCheck){setAdminTab('audit');openFundLedgerCheck('account',button.dataset.authorFundLedger);}
});
function installFundLedgerPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>原資・入出金台帳（照合専用）</summary><p>Stripeの入出金とカード原資の根拠を保存します。既存の注文・監査結果・残高・保留設定は変更しません。台帳は出金や残高購入の許可には使いません。</p><label>作者ID <input data-fund-author placeholder="author_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button type="button" data-fund-account>口座の入出金を照合・記録</button> <button type="button" data-fund-account-history>口座の照合履歴</button></p><label>Order ID <input data-fund-order placeholder="order_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button type="button" data-fund-origin>カード原資を照合・記録</button> <button type="button" data-fund-origin-history>原資の照合履歴</button></p><div data-fund-status aria-live="polite"></div><div data-fund-result></div><div data-fund-history aria-live="polite"></div>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const author=panel.querySelector('[data-fund-author]'),order=panel.querySelector('[data-fund-order]'),status=panel.querySelector('[data-fund-status]'),result=panel.querySelector('[data-fund-result]'),history=panel.querySelector('[data-fund-history]');
  const accountButton=panel.querySelector('[data-fund-account]'),originButton=panel.querySelector('[data-fund-origin]'),accountHistory=panel.querySelector('[data-fund-account-history]'),originHistory=panel.querySelector('[data-fund-origin-history]');
  let busy=false;
  const reasonLabels={BALANCE_LEDGER_MISMATCH:'Stripe残高と今回の入出金集計に差額あり',TRANSACTION_HISTORY_PARTIAL:'入出金履歴は一部のみ取得',UNCLASSIFIED_TRANSACTION:'分類・出所の追加確認が必要な入出金あり',NEGATIVE_STRIPE_BALANCE:'Stripe残高にマイナスあり',ORIGIN_ALLOCATION_UNVERIFIED:'口座残高の原資別割当は未完了',PAYOUT_DEADLINE_UNVERIFIED:'出金期限の起算・適用条件は未検証',NO_PAYOUT_AUTHORIZATION:'出金は未許可',LOOKUP_OR_PERSISTENCE_UNVERIFIED:'取得または台帳保存の検証に失敗',CONNECTED_BALANCE_NOT_RECLASSIFIED:'売上残高購入を外部カード原資に付け替えない',NO_CAPTURE_EVIDENCE:'カード支払完了の根拠なし（売上計上しない）',PAYMENT_SYNC_REVIEW:'支払済み・注文反映要確認',AUTHOR_CREDIT_DIFFERENCE:'作者への入金純額とOrder snapshotに差異あり',RELATED_HISTORY_PARTIAL:'関連履歴を全件取得できていない',STORED_ACCOUNT_HOLD:'保存済みの作者内部保留あり',STORED_DISPUTE_HOLD:'保存済みの異議申立て保留あり',REFUND_PENDING:'返金処理中',DISPUTE_OPEN:'異議申立て対応中',DISPUTE_LOST:'敗訴・回収状態の確認が必要',DISPUTE_DETAILS_UNVERIFIED:'異議申立ての詳細は未確認',DISPUTE_MOVEMENTS_UNVERIFIED:'異議申立てに伴う入出金は未確認',FULL_REFUND_RECORDED:'Chargeの全額返金累計を確認',PARTIAL_REFUND_REVIEW:'部分返金・個別確認が必要',ENTITLEMENT_REPAIR_CANDIDATE:'購入権だけの修復候補',AUDIT_REVIEW:'個別監査を確認',REMAINING_FUNDS_UNALLOCATED:'この原資の未使用残額は未算定',PAYOUT_POLICY_UNCONFIGURED:'出金・待機期間等のポリシーは未設定'};
  const typeLabels={payment:'作者口座への入金',charge:'決済入金',payment_refund:'入金の返金・取消',refund:'購入の返金',transfer:'送金',transfer_refund:'送金取消',application_fee:'運営配分',application_fee_refund:'運営配分の返金',payout:'銀行出金',payout_cancel:'銀行出金取消',payout_failure:'銀行出金失敗',adjustment:'Stripe調整'};
  const money=(value,currency='jpy')=>Number.isSafeInteger(value)?currency==='jpy'?'¥'+value.toLocaleString('ja-JP'):value.toLocaleString('ja-JP')+' '+escapeHtml(currency.toUpperCase())+'（最小単位）':'未確認';
  const when=value=>value?escapeHtml(formatJstDate(value)):'未確認';
  const reasons=r=>'<ul>'+r.reasonCodes.map(code=>'<li>'+escapeHtml(reasonLabels[code]||code)+'</li>').join('')+'</ul>';
  function factTable(rows){return rows.length?'<div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>記録</th><th>総額</th><th>控除</th><th>純増減</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+escapeHtml(typeLabels[x.type]||x.type)+'<br>'+escapeHtml(x.scope)+'<br>'+escapeHtml(x.transactionId)+'<br>'+when(x.createdAt)+'<br>'+(x.status==='available'?'Stripe利用可能':'Stripe入金待ち')+'</td><td>'+money(x.amount,x.currency)+'</td><td>'+money(x.fee,x.currency)+'</td><td>'+money(x.net,x.currency)+'</td></tr>').join('')+'</tbody></table></div>':'<p>今回、入出金記録は取得されていません。</p>';}
  function lock(value){busy=value;for(const el of [author,order,accountButton,originButton,accountHistory,originHistory])el.disabled=value;result.querySelectorAll('button').forEach(x=>x.disabled=value);}
  function subject(kind){const id=(kind==='account'?author:order).value.trim().toLowerCase();if(!(kind==='account'?/^author_[a-f0-9]{32}$/:/^order_[a-f0-9]{32}$/).test(id))throw new Error(kind==='account'?'作者IDを確認してください。':'Order IDを確認してください。');return id;}
  async function loadHistory(kind,id){
    const data=await apiWithTimeout('/admin/commerce/fund-ledger?kind='+kind+'&subjectId='+encodeURIComponent(id),{},30000);
    if(!['live','test'].includes(data.environment)||!Array.isArray(data.history))throw new Error('Workerの台帳機能を確認してください。');
    history.innerHTML='<p><strong>最近5件の照合履歴（現在状態の再照会ではありません）</strong></p>'+data.history.map(x=>'<p>'+when(x.checkedAt)+' / '+escapeHtml(x.observationId)+'<br>観測した入出金 '+x.factCount+'件</p>').join('');
    if(!data.history.length)history.innerHTML+='<p>照合履歴はまだありません。</p>';return data.environment;
  }
  function render(r){
    const state=r.kind==='account'?({matched_observation:'今回取得した全履歴と残高の数値が一致',mismatch:'残高に照合差額あり',partial_or_changed:'部分取得または取得中の変動あり・全体照合は未完了',unverified:'残高照合は未確認'}[r.reconciliation.status]||'残高照合は未確認'):({observed:'カード原資の根拠を記録',incomplete:'カード原資の一部に未確認あり',unverified:'カード原資は未確認',not_card:'売上残高購入・カード原資の対象外',purchase_incomplete:'購入確定前・原資を作成しない',payment_sync_review:'Stripe支払済み・注文反映を確認'}[r.status]||'未確認');
    let body='<strong>'+escapeHtml(state)+'</strong><p>'+ (r.environment==='live'?'本番LIVE':'Sandbox TEST')+' / '+when(r.checkedAt)+'<br>'+escapeHtml(r.observationId)+'</p>';
    if(r.kind==='account'){
      body+='<p>Stripe利用可能 '+money(r.balance?.availableJPY)+' / 入金待ち '+money(r.balance?.pendingJPY)+'<br>利用可能差額 '+money(r.reconciliation.availableDifferenceJPY)+' / 入金待ち差額 '+money(r.reconciliation.pendingDifferenceJPY)+'</p><p>今回の取得 '+r.transactions.length+'件。新規台帳 '+r.facts.filter(x=>x.persistence==='created').length+'件／既存IDの再確認 '+r.facts.filter(x=>x.persistence==='reused').length+'件。再取得した同じ記録は二重計上しません。</p><p>このページで最も古いJPYの純入金：'+when(r.deadline.oldestPositiveTransactionAt)+'。出金期限の確定日ではありません。</p><p>照合は取得時点の数値比較です。原資別の未使用額、出金可能額、安全性の確定は含みません。次ページがある場合や途中ページだけの場合は全体一致と表示しません。</p>'+factTable(r.facts);
    }else{
      body+='<p>外部カード支払額 '+money(r.root?.externalCapturedJPY)+' / 作者配分 '+money(r.root?.authorShareJPY)+' / あ箱配分 '+money(r.root?.platformFeeJPY)+'<br>基準：購入時のOrder snapshot。現在料率への再計算はしません。<br>原資ID '+escapeHtml(r.root?.chargeId||'未作成')+' / '+(r.rootPersistence==='created'?'新規保存':r.rootPersistence==='reused'?'既存原資を再確認':'保存未確認')+'</p><p>作者口座への送金総額 '+money(r.transfer?.grossJPY)+' / 送金取消累計（総額） '+money(r.transfer?.reversedGrossJPY)+'<br>元の入金で確認できた作者純額 '+money(r.lot?.observedAuthorCreditJPY)+'<br>この原資の未使用残額：未算定。送金取消総額から作者の回収額を推測しません。</p><p>Charge返金累計 '+money(r.refundSummary?.amountRefundedJPY)+'<br>個別監査：'+escapeHtml(r.audit?.status==='ok'?'一致':r.audit?.status==='mismatch'?'不一致':'未取得')+'</p><details><summary>返金・送金取消・異議申立ての根拠</summary>'+(r.refunds===null?'<p>返金一覧：未確認</p>':r.refunds.length?r.refunds.map(x=>'<p>購入者への返金 '+money(x.amount)+' / '+escapeHtml({pending:'処理中',requires_action:'追加対応待ち',succeeded:'成功',failed:'失敗',canceled:'取消済み'}[x.status]||x.status)+'<br>'+escapeHtml(x.id)+'</p>').join(''):'<p>返金一覧：なし（Charge返金累計も別に確認）</p>')+(r.reversals===null?'<p>送金取消一覧：未確認</p>':r.reversals.length?r.reversals.map(x=>'<p>作者への送金を取消 '+money(x.amount)+'（送金総額）<br>'+escapeHtml(x.id)+'</p>').join(''):'<p>送金取消一覧：なし</p>')+(r.disputes===null?'<p>異議申立て一覧：未確認</p>':r.disputes.length?r.disputes.map(x=>renderDisputeResponseNote({disputeId:x.id,status:x.status,evidenceDueAt:x.evidenceDueAt},r.environment)).join(''):'<p>Stripe異議申立て一覧：なし</p>')+(r.applicationFee?'<p>あ箱配分 '+money(r.applicationFee.amountJPY)+' / 配分返金累計 '+money(r.applicationFee.amountRefundedJPY)+'</p>':'')+'</details><p>元Chargeの作成：'+when(r.deadline.chargeCreatedAt)+'<br>作者口座の入金記録作成：'+when(r.deadline.accountReceivedAt)+'<br>Stripe利用可能日：'+when(r.deadline.availableOn)+'<br>正確な売上確定時刻・法的な出金期限：未検証。今回の照合日時から起算し直しません。</p><details><summary>保留・確認理由（観測のみ）</summary>'+r.holdReasons.map(x=>'<p>'+escapeHtml(reasonLabels[x.code]||x.code)+'<br>'+escapeHtml(x.reference||'')+' / '+escapeHtml(x.source)+'<br>今回の観測：'+when(x.observedAt)+'</p>').join('')+'</details>'+factTable(r.facts);
    }
    body+='<p>台帳保存の検証：'+(r.persistenceComplete?'取得した範囲では完了':'未完了・エラーを確認')+'</p>'+reasons(r)+(r.errors.length?'<p>取得・保存エラー：'+escapeHtml(r.errors.map(x=>x.source+': '+x.code).join(', '))+'</p>':'')+'<p>この照合は保留を追加・解除しません。出金可能額・残高購入の許可額は未算定です。</p>';
    result.innerHTML='<div class="audit-order-card" style="display:block;overflow-wrap:anywhere">'+body+'</div>';
    if(r.kind==='account'&&r.nextStartingAfter){const next=document.createElement('button');next.type='button';next.textContent='次の入出金10件を照合・記録';next.onclick=()=>run('account',{startingAfter:r.nextStartingAfter,expectedAccountId:r.accountId,expectedEnvironment:r.environment});result.appendChild(next);}
    if(r.kind==='order'){const next=document.createElement('button');next.type='button';next.textContent='注文の返金・権利の対応確認';next.onclick=()=>openOrderResponseCheck?.(r.subjectId);result.appendChild(next);}
  }
  async function run(kind,page={}){
    if(busy)return;let id;try{id=subject(kind);}catch(e){status.textContent=e.message;return;}
    lock(true);result.textContent='';status.textContent='Stripeの記録を照会・照合しています…';
    try{
      const environment=page.expectedEnvironment||await loadHistory(kind,id);
      const data=await apiWithTimeout('/admin/commerce/fund-ledger',{method:'POST',body:JSON.stringify({kind,subjectId:id,...page,expectedEnvironment:environment})},45000),r=data.observation;
      if(!r||r.kind!==kind||r.subjectId!==id||r.environment!==environment||r.enforcementApplied!==false||r.mode!=='observation'||r.payoutableJPY!==null||r.spendableJPY!==null)throw new Error('台帳結果の対応を確認できません。');
      render(r);status.textContent='照合履歴を保存しました。未確認事項は下の表示を確認してください。';history.textContent='履歴を再表示する場合は「照合履歴」を押してください。';
    }catch(e){result.textContent='';status.textContent='照合結果は未確認です：'+e.message+'。通信断の場合、台帳の一部が保存されている可能性があります。履歴を確認してから再取得してください。同じStripe IDは二重計上しません。';}
    finally{lock(false);}
  }
  async function showHistory(kind){if(busy)return;try{const id=subject(kind);lock(true);status.textContent='保存済みの履歴を取得中…';await loadHistory(kind,id);status.textContent='履歴を取得しました。Stripeの現在状態は再照会していません。';}catch(e){status.textContent='履歴を確認できません：'+e.message;}finally{lock(false);}}
  accountButton.onclick=()=>run('account');originButton.onclick=()=>run('order');accountHistory.onclick=()=>showHistory('account');originHistory.onclick=()=>showHistory('order');
  for(const input of [author,order])input.addEventListener('input',()=>{result.textContent='';history.textContent='';status.textContent='';});
  openFundLedgerCheck=(kind,id)=>{if(busy)return;panel.open=true;(kind==='account'?author:order).value=id;panel.scrollIntoView({behavior:'smooth',block:'start'});run(kind);};
}
installFundLedgerPanel();

let openFundAllocation=null;
els.authorList?.addEventListener('click',event=>{const button=event.target.closest('[data-author-allocation]');if(button&&openFundAllocation){setAdminTab('audit');openFundAllocation(button.dataset.authorAllocation);}});
function installFundAllocationPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>原資別の残額割当（FIFO・照合専用）</summary><p>全入出金履歴を取得し、確認できたカード原資から古い順に使ったものとして記帳します。実際の出金・返金・保留変更は行いません。途中の取得結果を確定した残額として表示しません。</p><label>作者ID <input data-allocation-author placeholder="author_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button type="button" data-allocation-start>全履歴を取得して残額を割当</button> <button type="button" data-allocation-resume>途中の取得を再開</button> <button type="button" data-allocation-stop disabled>区切りで停止</button> <button type="button" data-allocation-history>割当履歴を見る</button></p><div data-allocation-status aria-live="polite"></div><div data-allocation-result></div><div data-allocation-history-result></div>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const input=panel.querySelector('[data-allocation-author]'),start=panel.querySelector('[data-allocation-start]'),resume=panel.querySelector('[data-allocation-resume]'),stop=panel.querySelector('[data-allocation-stop]'),history=panel.querySelector('[data-allocation-history]'),status=panel.querySelector('[data-allocation-status]'),result=panel.querySelector('[data-allocation-result]'),historyResult=panel.querySelector('[data-allocation-history-result]');
  let busy=false,stopRequested=false,active=null;
  const labels={transactions:'全入出金履歴を取得中',origins:'カード原資を照合中',returns:'銀行出金の戻りを照合中',finalize:'残高の再照会・割当を計算中',complete:'取得・割当の観測を保存',limited:'取得上限に到達・割当は未完了'};
  const reasons={UNATTRIBUTED_CREDIT:'出所未確認の入金あり',UNEXPLAINED_DEBIT:'使途を分類できない支出あり',RETURN_PARENT_UNVERIFIED:'戻り入金の元の支出が未確認',RETURN_EXCESS_OR_UNVERIFIED:'元の支出へ割り当てられない戻り入金あり',ROOT_RECOVERY_SHORTFALL:'対象原資だけでは返金・取消を賄えない記録あり',OUTFLOW_WITHOUT_ELIGIBLE_LOTS:'利用可能な原資を説明できない支出あり',HISTORY_OR_BALANCE_INCOMPLETE:'取得範囲・照合に未確認事項あり',BALANCE_DIFFERENCE:'Stripe残高と入出金に差額あり',NON_PAYMENT_BALANCE_PRESENT:'通常の決済残高以外の入出金が含まれるため追加確認が必要'};
  const money=v=>Number.isSafeInteger(v)?'¥'+v.toLocaleString('ja-JP'):'未算定';
  function authorId(){const id=input.value.trim().toLowerCase();if(!/^author_[a-f0-9]{32}$/.test(id))throw new Error('作者IDを確認してください。');return id;}
  function lock(value){busy=value;input.disabled=value;start.disabled=value;resume.disabled=value;history.disabled=value;stop.disabled=!value;}
  function validate(job,id,environment){if(!job||job.authorId!==id||job.environment!==environment||job.mode!=='observation'||job.enforcementApplied!==false||job.payoutableJPY!==null||job.spendableJPY!==null)throw new Error('割当結果の対応を確認できません。');return job;}
  function show(job){
    const p=job.projection;
    result.innerHTML='<div class="audit-order-card" style="display:block;overflow-wrap:anywhere"><strong>'+escapeHtml(labels[job.stage]||'状態未確認')+'</strong><p>'+(job.environment==='live'?'本番LIVE':'Sandbox TEST')+' / '+escapeHtml(formatJstDate(job.updatedAt))+'<br>'+escapeHtml(job.jobId)+'</p><p>取得した入出金 '+job.transactionCount+'件 / 原資確認 '+job.originProgress+'／'+job.originCandidates+'件 / 出金の戻り '+job.returnProgress+'／'+job.returnCandidates+'件</p>'+(p?'<p><strong>'+(p.calculationComplete?'今回の全履歴に基づくFIFO帳簿計算を完了':'割当は未完了・帳簿案だけを表示')+'</strong><br>確認したカード原資 '+p.roots.length+'件<br>出所不明の入金累計 '+money(p.unattributedCreditsTotalJPY)+' / 出所不明の帳簿残額 '+money(p.unattributedRemainingJPY)+'<br>使途不明の支出 '+money(p.unexplainedDebitsJPY)+' / 原資不足の未説明額 '+money(p.uncoveredJPY)+'<br>Stripe利用可能との差額 '+money(p.balanceDifference?.availableJPY)+' / 入金待ちとの差額 '+money(p.balanceDifference?.pendingJPY)+'</p><ul>'+p.reasonCodes.map(x=>'<li>'+escapeHtml(reasons[x]||x)+'</li>').join('')+'</ul>'+p.roots.map(x=>'<details><summary>原資 '+escapeHtml(x.chargeId)+'：FIFO残額 '+money(x.remainingUnspentJPY)+'</summary><p>Order '+escapeHtml(x.orderId)+'<br>元の作者配分 '+money(x.originalAuthorShareJPY)+' / 帳簿案 '+money(x.bookRemainingJPY)+'<br>元Charge作成日時 '+escapeHtml(formatJstDate(x.chargeCreatedAt))+'</p><p>原資確認時の保留・確認理由：'+escapeHtml(x.holdReasons.map(h=>h.code).join(', ')||'記録なし')+'</p></details>').join('')+'<details><summary>支出への割当の根拠</summary>'+p.movements.filter(x=>x.kind==='fifo_outflow'||x.kind==='root_reversal'||x.kind==='outflow_return').map(x=>'<p>'+escapeHtml(x.transactionId)+' / '+escapeHtml({fifo_outflow:'古い利用可能原資から支出',root_reversal:'対象原資への送金取消',outflow_return:'元の支出へ戻す入金'}[x.kind])+' / '+money(x.netJPY)+(x.parentTransactionId?'<br>元取引 '+escapeHtml(x.parentTransactionId):'')+(x.slices?x.slices.map(s=>'<br>'+escapeHtml(s.chargeId||'出所不明の原資')+'：'+money(s.amountJPY)).join(''):'')+'</p>').join('')+'</details>':'<p>まだ全履歴の取得・照合が終わっていないため残額は表示しません。</p>')+(job.errors.length?'<p>未確認事項：'+escapeHtml(job.errors.map(x=>x.source+': '+x.code).join(', '))+'。権限・状態を確認した後、新しく全履歴を取得してください。</p>':'')+'<p>FIFOは帳簿上の割当です。Stripe内の実際の資金を個別に識別する保証ではありません。取得した履歴に基づく観測であり、同一時点の残高を保証するものではありません。検出した変動や未確認事項がある場合は確定額にしません。銀行出金の戻りでも元の原資の日付を引き継ぎます。</p><p>出金可能額・残高購入の許可額・出金期限は未確定です。この計算から資金を動かすことはありません。</p></div>';
  }
  async function getHistory(id){const data=await apiWithTimeout('/admin/commerce/fund-allocation?authorId='+encodeURIComponent(id),{},30000);if(!['live','test'].includes(data.environment)||!Array.isArray(data.jobs))throw new Error('Workerの割当機能を確認してください。');historyResult.innerHTML='<p><strong>最近5件の割当履歴（現在状態の再照会ではありません）</strong></p>'+data.jobs.map(x=>'<p>'+escapeHtml(formatJstDate(x.updatedAt))+' / '+escapeHtml(labels[x.stage]||x.stage)+'<br>'+escapeHtml(x.jobId)+'</p>').join('');return data;}
  async function run(fresh){
    if(busy)return;let id;try{id=authorId();}catch(e){status.textContent=e.message;return;}
    lock(true);stopRequested=false;result.textContent='';status.textContent='取得する環境と履歴を確認中…';
    try{
      const data=await getHistory(id),environment=data.environment;
      if(fresh){active=validate((await apiWithTimeout('/admin/commerce/fund-allocation',{method:'POST',body:JSON.stringify({action:'start',authorId:id,expectedEnvironment:environment})},45000)).job,id,environment);}
      else{
        const target=active?.authorId===id&&active.environment===environment?data.jobs.find(x=>x.jobId===active.jobId):data.jobs.find(x=>!['complete','limited'].includes(x.stage));
        if(!target)throw new Error('再開できる取得はありません。新しく取得してください。');active=validate(target,id,environment);
      }
      show(active);
      for(let step=0;step<20&&!['complete','limited'].includes(active.stage)&&!stopRequested;step++){
        status.textContent=(labels[active.stage]||'確認中')+'… 入出金 '+active.transactionCount+'件';
        active=validate((await apiWithTimeout('/admin/commerce/fund-allocation',{method:'POST',body:JSON.stringify({action:'step',authorId:id,jobId:active.jobId,expectedRevisionId:active.revisionId,expectedEnvironment:environment})},45000)).job,id,environment);show(active);
      }
      status.textContent=active.stage==='complete'?'全履歴の取得と割当の観測を保存しました。残額・差額・未確認事項を確認してください。':active.stage==='limited'?'取得上限に到達しました。全体の割当は未完了です。':'区切りで停止しました。「途中の取得を再開」で続けられます。';
    }catch(e){status.textContent='割当の確認は未完了です：'+e.message+'。通信断・同時更新の場合は保存済み履歴を取得して再開してください。';}
    finally{lock(false);}
  }
  start.onclick=()=>run(true);resume.onclick=()=>run(false);stop.onclick=()=>{stopRequested=true;stop.disabled=true;status.textContent='実行中の確認が終わった区切りで停止します…';};
  history.onclick=async()=>{if(busy)return;try{const id=authorId();lock(true);const data=await getHistory(id);if(data.jobs[0]){active=validate(data.jobs[0],id,data.environment);show(active);}status.textContent='保存済み履歴を取得しました。Stripeの現在状態は再照会していません。';}catch(e){status.textContent='履歴を確認できません：'+e.message;}finally{lock(false);}};
  input.addEventListener('input',()=>{active=null;result.textContent='';historyResult.textContent='';status.textContent='';});
  openFundAllocation=id=>{if(busy)return;panel.open=true;input.value=id;active=null;panel.scrollIntoView({behavior:'smooth',block:'start'});run(true);};
}
installFundAllocationPanel();

function installSandboxDebitInspection(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>売上残高の引落し詳細（Sandbox・読取専用）</summary><p>Stripeの引落し・関連取引を確認します。残高・購入権・監査結果は変更しません。</p><label>作者ID <input data-debit-author placeholder="author_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><br><label>入出金ID <input data-debit-transaction placeholder="txn_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button data-debit-run type="button">引落し詳細を取得</button> <button data-debit-download type="button" disabled>結果JSONを保存</button></p><p data-debit-status aria-live="polite"></p><pre data-debit-result style="white-space:pre-wrap;overflow-wrap:anywhere"></pre>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const author=panel.querySelector('[data-debit-author]'),transaction=panel.querySelector('[data-debit-transaction]'),run=panel.querySelector('[data-debit-run]'),download=panel.querySelector('[data-debit-download]'),status=panel.querySelector('[data-debit-status]'),result=panel.querySelector('[data-debit-result]');
  let report=null,busy=false;
  const clear=()=>{report=null;download.disabled=true;result.textContent='';status.textContent='';};
  author.oninput=clear;transaction.oninput=clear;
  run.onclick=async()=>{
    if(busy)return;clear();const id=author.value.trim().toLowerCase(),txn=transaction.value.trim();
    if(!/^author_[a-f0-9]{32}$/.test(id)||!/^txn_[A-Za-z0-9_]{1,180}$/.test(txn)){status.textContent='作者IDと入出金IDを確認してください。';return;}
    busy=true;run.disabled=true;author.disabled=true;transaction.disabled=true;status.textContent='Stripeの記録を取得中…';
    try{
      const data=await apiWithTimeout('/admin/commerce/sandbox-debit-inspection?'+new URLSearchParams({authorId:id,transactionId:txn,expectedEnvironment:'test'}),{},45000),r=data.inspection;
      if(!r||r.environment!=='test'||r.mode!=='read_only'||r.authorId!==id||r.transactionId!==txn||r.enforcementApplied!==false||r.payoutableJPY!==null||r.spendableJPY!==null)throw new Error('結果の対応を確認できません。');
      report=r;result.textContent=JSON.stringify(r,null,2);download.disabled=false;
      status.textContent=r.complete?'取得完了。関連するStripe取引を確認しました。使途や原資の確定ではありません。':'取得に未確認事項があります。結果JSONに取得できた記録とエラーを含めています。';
    }catch(e){status.textContent='取得できませんでした：'+e.message;}
    finally{busy=false;run.disabled=false;author.disabled=false;transaction.disabled=false;}
  };
  download.onclick=()=>{
    if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');
    a.href=url;a.download='ahako-sandbox-debit-'+report.transactionId+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  };
}
installSandboxDebitInspection();

function installSandboxBalanceLockPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>残高購入の停止状態（Sandbox）</summary><p>作者の残高購入が処理中・確認待ちになっているか確認します。解除時は再照合し、安全を確認できた停止だけ解除します。引き落とし・送金・返金は実行しません。</p><label>作者ID <input data-lock-author placeholder="author_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button data-lock-check type="button">停止状態を確認</button> <button data-lock-release type="button" disabled>照合済みの停止を解除</button></p><p data-lock-status aria-live="polite"></p><div data-lock-result style="overflow-wrap:anywhere"></div>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const input=panel.querySelector('[data-lock-author]'),check=panel.querySelector('[data-lock-check]'),release=panel.querySelector('[data-lock-release]'),status=panel.querySelector('[data-lock-status]'),result=panel.querySelector('[data-lock-result]');
  const reasons={NO_LOCK:'停止はありません。',ALREADY_IDLE:'残高購入のロックは空いています。',PREPARING_PURCHASE:'購入準備中です。まだ解除できません。',EXPIRED_BEFORE_DEBIT:'引き落とし開始前に準備が期限切れになりました。安全に解除できます。',STRIPE_RESULT_UNVERIFIED:'決済結果または作者への送金を確認できません。停止を維持します。',LEGACY_OR_INVALID_LOCK_REQUIRES_INVESTIGATION:'旧形式または未確認のロックです。個別調査が必要です。',ENTITLEMENT_REPAIR_REQUIRED:'購入権の修復が必要です。返金せず、既存の権利修復経路を先に確認してください。',ORDER_AUDIT_REQUIRES_REVIEW:'注文の監査に確認事項があります。停止を維持します。',PAID_SETTLEMENT_VERIFIED:'Stripeの購入・作者への送金と購入権を照合しました。停止を解除できます。',REFUND_AND_REVERSAL_VERIFIED:'Stripeの返金・送金取消と注文を照合しました。停止を解除できます。',RELEASED_AFTER_VERIFICATION:'照合のうえ停止を解除しました。資金は動かしていません。'};
  let report=null,busy=false;
  function clear(){report=null;release.disabled=true;status.textContent='';result.textContent='';}
  function validate(r,id){if(!r||r.environment!=='test'||r.authorId!==id||!/^acct_[A-Za-z0-9_]+$/.test(r.accountId||'')||r.financialWrites!==false||typeof r.canRelease!=='boolean'||r.canRelease&&(!r.revision||typeof r.revision!=='string'))throw new Error('結果の対応を確認できません。');return r;}
  function show(r){result.textContent=(reasons[r.reason]||'状態を確定できません。')+(r.orderId?'\n対象注文：'+r.orderId:'');result.style.whiteSpace='pre-wrap';}
  async function run(doRelease){
    if(busy)return;
    const id=input.value.trim().toLowerCase(),prior=report;
    if(!/^author_[a-f0-9]{32}$/.test(id)){clear();status.textContent='作者IDを確認してください。';return;}
    if(doRelease&&(!prior?.canRelease||prior.authorId!==id))return;
    busy=true;input.disabled=true;check.disabled=true;release.disabled=true;report=null;result.textContent='';status.textContent=doRelease?'状態を再照合して解除中…':'停止状態を確認中…';
    try{
      const path='/admin/commerce/sandbox-balance-purchase-lock';
      const data=doRelease?await apiWithTimeout(path,{method:'POST',body:JSON.stringify({action:'release_verified',authorId:id,expectedEnvironment:'test',expectedAccountId:prior.accountId,expectedRevision:prior.revision})},45000):await apiWithTimeout(path+'?'+new URLSearchParams({authorId:id,expectedEnvironment:'test'}),{},45000);
      report=validate(data.report,id);show(report);status.textContent=doRelease?'停止を解除しました。':'確認が完了しました。';
    }catch(e){status.textContent='完了を確認できません：'+e.message+'。「停止状態を確認」で現在状態を再取得してください。';}
    finally{busy=false;input.disabled=false;check.disabled=false;release.disabled=!report?.canRelease;}
  }
  input.oninput=clear;check.onclick=()=>run(false);release.onclick=()=>run(true);
}
installSandboxBalanceLockPanel();

function installSandboxPurchaseTestPanel(){
  if(!els.auditOrdersList)return;
  const panel=document.createElement('details');panel.className='audit-normal';panel.style.marginTop='24px';
  panel.innerHTML='<summary>残高購入テスト（Sandbox専用）</summary><p>①設定確認 → ②テストデータ準備 → ③残高不足 → ④同時購入の順に進めます。準備では資金を動かしません。購入ボタンを押すとSandboxの売上残高から引き落としを試します。購入テストは1注文¥100です。カード決済への切替や自動再試行は行いません。</p><label>購入者の作者ID <input data-sp-buyer value="author_94acc908ea5e49dbb56d4e441b1608e2" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><br><label>販売先Sandbox Connected Account ID <input data-sp-seller value="acct_1UJ7Ld1XnlUPtCE2" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:480px;box-sizing:border-box"></label><p><button data-sp-check type="button">① 設定・残高を確認</button> <button data-sp-prepare type="button" disabled>② テストデータを準備</button></p><p data-sp-ready aria-live="polite"></p><label style="display:flex;gap:8px;align-items:flex-start"><input data-sp-consent type="checkbox" style="min-width:22px;min-height:22px"><span>Sandboxの検証として、この作者の売上残高をAccount Debitで支払うテストと販売条件（単発購入・決済後のMY COPY受け取り）に同意します。</span></label><p><button data-sp-insufficient type="button" disabled>③ 残高不足をテスト</button> <button data-sp-concurrent type="button" disabled>④ 同時購入をテスト（¥100）</button></p><p><button data-sp-verify type="button" disabled>取引・MY COPYを再照合</button> <button data-sp-receive type="button" disabled>購入済みMY COPYを受け取る</button> <button data-sp-download type="button" disabled>結果JSONを保存</button> <button data-sp-copy type="button" disabled>受け取った.sceneを保存</button> <button data-sp-end type="button" disabled>テスト認証を終了</button></p><p data-sp-status aria-live="polite"></p><pre data-sp-result style="white-space:pre-wrap;overflow-wrap:anywhere"></pre><p>本番のログイン情報・本棚には保存しません。MY COPYはこの欄で本文を確認して.sceneとして保存できます。認証は30分で期限切れになります。通信断の場合は購入を繰り返さず、再照合してください。認証終了は取引の取消・返金ではありません。</p>';
  els.auditOrdersList.parentNode.appendChild(panel);
  const el=k=>panel.querySelector('[data-sp-'+k+']'),buyer=el('buyer'),seller=el('seller'),status=el('status'),readyText=el('ready'),result=el('result');
  const labels={TEST_HARNESS_DISABLED:'Sandbox Workerに AHAKO_SANDBOX_PURCHASE_TESTS_ENABLED=true の設定が必要です。',SANDBOX_WEBHOOK_SECRET_REQUIRED:'Sandbox Workerに正しいSandbox用 STRIPE_WEBHOOK_SECRET の設定が必要です。',BUYER_TEST_ACCOUNT_UNVERIFIED:'購入者の作者・Stripe連携のSandboxデータを確認できません。',SELF_PURCHASE_BLOCKED:'購入者と販売先のStripe口座が同じです。',STRIPE_TEST_IDENTITY_UNVERIFIED:'Stripe口座とTEST環境を照合できません。',SELLER_TRANSFERS_NOT_READY:'販売先の送金受け取り設定が未完了です。',INSUFFICIENT_PRICE_OUTSIDE_SUPPORTED_RANGE:'残高不足用の価格が設定範囲を超えています。',TEST_BALANCE_UNDER_100:'同時購入テストに必要なSandbox残高¥100がありません。',RISK_HOLD_PRESENT:'リスク保留があります。先に状態を確認してください。',STRIPE_READ_UNVERIFIED:'Stripeの読取権限または接続を確認できません。'};
  let busy=false,readiness=null,run=null,sessionToken='',report=null,copyScene=null,apiSummary=[],attempted={},orderTokens={};
  const endpoint='/admin/commerce/sandbox-purchase-test';
  function controls(){
    buyer.disabled=seller.disabled=busy||Boolean(run);el('check').disabled=busy;el('prepare').disabled=busy||Boolean(run)||!readiness?.ready;
    for(const kind of ['insufficient','concurrent'])el(kind).disabled=busy||!run||!el('consent').checked||readiness?.paused!==false||!readiness?.enabled||Boolean(attempted[kind])||Date.now()>=Number(run.expiresAt);
    el('verify').disabled=busy||!run;el('end').disabled=busy||!run||!sessionToken;el('receive').disabled=busy||!run||!report?.cases.some(x=>x.status==='paid'&&orderTokens[x.orderId]);el('download').disabled=busy||!report;el('copy').disabled=busy||!copyScene;el('consent').disabled=busy;
  }
  function ids(){const b=buyer.value.trim().toLowerCase(),s=seller.value.trim();if(!/^author_[a-f0-9]{32}$/.test(b)||!/^acct_[A-Za-z0-9_]{1,180}$/.test(s))throw new Error('購入者の作者IDと販売先のStripe口座を確認してください。');return {buyerAuthorId:b,sellerAccountId:s,expectedEnvironment:'test'};}
  function showReady(r,subject){if(!r||r.environment!=='test'||r.buyerAuthorId!==subject.buyerAuthorId||r.sellerAccountId!==subject.sellerAccountId||r.financialWrites!==false||!Array.isArray(r.issues))throw new Error('準備結果の対応を確認できません。');readiness=r;readyText.textContent=(Number.isSafeInteger(r.availableJPY)?'Stripe確認残高 ¥'+r.availableJPY.toLocaleString('ja-JP')+'。':'')+(r.ready?(r.paused?'テスト準備ができます。新規購入は停止中です。':'テスト購入が有効です。'):'\n'+r.issues.map(x=>(labels[x]||x)+(x==='STRIPE_READ_UNVERIFIED'&&r.stripeCode?'（'+r.stripeCode+'）':'')).join('\n'));readyText.style.whiteSpace='pre-wrap';}
  async function testRequest(path,{method='GET',body=null,orderToken=''}={}){
    if(API!=='https://scene-studio-api-sandbox.a-hako.workers.dev'||!/^\/(commerce|stripe|bookshelf-claim)(\/|$)/.test(path))throw new Error('Sandbox接続先を確認できません。');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
    try{const response=await fetch(API+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+sessionToken,...(orderToken?{'X-Order-Token':orderToken}:{})},cache:'no-store',signal:controller.signal,...(body?{body:JSON.stringify(body)}:{})});return {httpStatus:response.status,body:await response.json()};}finally{clearTimeout(timer);}
  }
  function requireOK(r){if(r.httpStatus<200||r.httpStatus>=300||r.body?.ok!==true)throw new Error('API確認に失敗：'+String(r.body?.code||r.httpStatus));return r.body;}
  async function activeRuntime(){const r=await apiWithTimeout('/commerce/status',{},15000);if(r.environment!=='test'||!r.paymentsEnabled||!r.balancePurchaseEnabled||r.paused)throw new Error('Sandboxの新規購入は停止中です。設定確認後、Sandbox Workerだけを有効にしてから実行してください。');}
  function showReport(r){if(!r||r.environment!=='test'||r.runId!==run.runId||r.financialWrites!==false||!Array.isArray(r.cases))throw new Error('照合結果の対応を確認できません。');report=r;readyText.textContent='最新のStripe確認残高 ¥'+r.availableJPY.toLocaleString('ja-JP')+'（'+r.checkedAt+'）';const lines=r.cases.map(c=>{
    const issued=c.copyActive?'MY COPY確認済み':'MY COPY未確認';
    const pass=c.financialEvidenceComplete&&(c.kind==='insufficient'?c.status==='pending_payment'&&c.debitCount===0&&c.transferCount===0&&!c.entitlementId:c.status==='paid'&&c.debitCount===1&&c.transferCount===1&&c.debitAmountJPY===100&&c.transferAmountJPY===50&&c.copyActive&&c.auditStatus==='ok');
    return (c.kind==='insufficient'?'残高不足':'同時購入')+'：'+(pass?'照合一致':'未実施または要確認')+'\n'+c.orderId+'\n注文 '+c.status+' / Debit '+c.debitCount+'件 / 作者Transfer '+c.transferCount+'件 / '+issued+' / 監査 '+(c.auditStatus||'未実施');
  });result.textContent='照合時点 '+String(r.checkedAt||'未確認')+'\nStripe残高 ¥'+r.availableJPY+' / ロック '+r.lockState+'\n\n'+lines.join('\n\n')+(copyScene?'\n\n受け取った本文：\n'+copyScene.scenes.map(x=>String(x.text||'')).join('\n'):'');}
  async function reconcile(){const data=await apiWithTimeout(endpoint+'?'+new URLSearchParams({runId:run.runId,expectedEnvironment:'test'}),{},60000);showReport(data.report);}
  el('check').onclick=async()=>{if(busy)return;busy=true;controls();try{const subject=ids();showReady((await apiWithTimeout(endpoint+'?'+new URLSearchParams(subject),{},45000)).ready,subject);status.textContent=run?'設定を再確認しました。':'設定確認が完了しました。';}catch(e){readiness=null;readyText.textContent='';status.textContent=e.message;}finally{busy=false;controls();}};
  el('prepare').onclick=async()=>{if(busy||run)return;busy=true;controls();try{const subject=ids(),data=await apiWithTimeout(endpoint,{method:'POST',body:JSON.stringify({...subject,action:'prepare'})},45000);showReady(data.ready,subject);if(!data.run)return;
    const r=data.run;if(r.environment!=='test'||r.buyerAuthorId!==subject.buyerAuthorId||r.sellerAccountId!==subject.sellerAccountId||r.buyerAccountId!==data.ready.buyerAccountId||!/^stest_[a-f0-9]{32}$/.test(r.runId)||!Number.isFinite(r.expiresAt)||r.expiresAt<=Date.now()||!Array.isArray(r.cases)||r.cases.length!==2||r.cases.some(x=>!/^scene_[a-f0-9]{32}$/.test(x.workId||'')||!/^sptest_[a-f0-9]{32}$/.test(x.publicationId||'')||!/^reader_[a-f0-9]{32}$/.test(x.readerId||'')||!/^order_[a-f0-9]{32}$/.test(x.orderId||''))||!r.cases.some(x=>x.kind==='concurrent'&&x.amount===100)||!r.cases.some(x=>x.kind==='insufficient'&&Number.isSafeInteger(x.amount)&&x.amount>data.ready.availableJPY)||!/^[a-f0-9]{64}$/.test(data.sessionToken||''))throw new Error('テスト対象を確認できません。');
    run=r;sessionToken=data.sessionToken;attempted={};apiSummary=[];orderTokens={};copyScene=null;report=null;el('insufficient').textContent='③ 残高不足をテスト（¥'+r.cases.find(x=>x.kind==='insufficient').amount+'）';status.textContent='テストデータを準備しました。引き落としは実行していません。';
  }catch(e){status.textContent=e.message;}finally{busy=false;controls();}};
  async function purchase(kind){
    if(busy||!run||attempted[kind]||!el('consent').checked)return;busy=true;report=null;result.textContent='';controls();
    try{
      await activeRuntime();const c=run.cases.find(x=>x.kind===kind);if(Date.now()>=run.expiresAt)throw new Error('テスト認証の期限が切れました。');
      const b=requireOK(await testRequest('/stripe/connect/balance'));if(b.environment!=='test'||!b.connected||!Number.isSafeInteger(b.available))throw new Error('Sandbox残高を確認できません。');
      if(kind==='insufficient'&&b.available>=c.amount)throw new Error('残高が増え、残高不足の条件ではなくなりました。購入は開始していません。');
      if(kind==='concurrent'&&b.available<c.amount)throw new Error('同時購入テストの残高¥100が不足しています。');
      const consent=requireOK(await testRequest('/stripe/connect/account-debit-consent',{method:'POST',body:{accepted:true,version:'account-debit-v1'}}));if(consent.accepted!==true||consent.connectedAccountId!==run.buyerAccountId)throw new Error('Account Debit同意の対象を確認できません。');
      attempted[kind]=true;status.textContent='注文を作成して検証中…';
      const created=requireOK(await testRequest('/commerce/order',{method:'POST',body:{publicationId:c.publicationId,readerId:c.readerId}}));
      if(created.paymentEnvironment!=='test'||created.order?.orderId!==c.orderId||created.order.amount!==c.amount||created.order.status!=='pending_payment'||!/^[a-f0-9]{48}$/.test(created.accessToken||''))throw new Error('注文の対応を確認できません。再照合してください。');
      orderTokens[c.orderId]=created.accessToken;
      const init={method:'POST',orderToken:created.accessToken,body:{paymentMethod:'author_balance',useAuthorBalance:true,salesConsent:{accepted:true,version:'ahako-sales-20261013-v1',amount:c.amount,currency:'JPY'}}},path='/commerce/order/'+c.orderId+'/checkout';
      const results=await Promise.allSettled(Array.from({length:kind==='concurrent'?2:1},()=>testRequest(path,init)));
      let paid=false;const summary=results.map(x=>{if(x.status==='rejected')return {result:'connection_unknown'};const b=x.value.body;paid||=b?.ok===true&&b.paid===true&&b.paymentRail==='connected_balance';return {httpStatus:x.value.httpStatus,code:String(b?.code||''),paid:b?.paid===true,paymentRail:String(b?.paymentRail||'')};});apiSummary.push({kind,orderId:c.orderId,results:summary});
      const expected=kind==='insufficient'?summary.length===1&&summary[0].code==='BALANCE_PURCHASE_INSUFFICIENT':summary.filter(x=>x.paid&&x.paymentRail==='connected_balance').length===1&&summary.some(x=>['BALANCE_PURCHASE_BUSY','ORDER_ALREADY_PAID','ORDER_NOT_PAYABLE'].includes(x.code));
      if(paid)await receiveCase(c,created.accessToken);
      await reconcile();status.textContent=(expected?'API応答は想定どおりです。':'API応答に未確認・想定外の結果があります。')+' Stripe件数・監査・MY COPYを照合欄で確認してください。';
    }catch(e){status.textContent='検証は未完了です：'+e.message+'。引き落としの有無は決めつけず、再照合してください。';}
    finally{busy=false;controls();}
  }
  async function receiveCase(c,orderToken){
        const ownPath='/commerce/order/'+c.orderId+'/own-copy',a=requireOK(await testRequest(ownPath,{method:'POST',orderToken:orderToken,body:{}})),again=requireOK(await testRequest(ownPath,{method:'POST',orderToken:orderToken,body:{}}));
        if(!/^copy_[a-f0-9]{32}$/.test(a.distribution?.copyId||'')||a.distribution.copyId!==again.distribution?.copyId||a.distribution.workId!==c.workId||!a.bookshelfClaim?.token)throw new Error('MY COPYの同一性を確認できません。');
        const claim=requireOK(await testRequest('/bookshelf-claim',{method:'POST',body:{token:a.bookshelfClaim.token}}));
        if(claim.distribution?.copyId!==a.distribution.copyId||claim.scene?.workId!==c.workId||!Array.isArray(claim.scene.scenes)||!claim.scene.scenes.some(x=>typeof x.text==='string'&&x.text.length>0))throw new Error('受け取り本文を確認できません。');copyScene=claim.scene;
  }
  el('insufficient').onclick=()=>purchase('insufficient');el('concurrent').onclick=()=>purchase('concurrent');el('consent').onchange=controls;
  el('verify').onclick=async()=>{if(busy||!run)return;busy=true;controls();try{await reconcile();status.textContent='現在のStripe取引・注文・MY COPYを照合しました。';}catch(e){report=null;result.textContent='';status.textContent='再照合は未完了です：'+e.message;}finally{busy=false;controls();}};
  el('receive').onclick=async()=>{if(busy||!run||!report)return;const targets=report.cases.filter(x=>x.status==='paid'&&orderTokens[x.orderId]);if(!targets.length)return;busy=true;controls();try{for(const row of targets){const c=run.cases.find(x=>x.orderId===row.orderId);if(!c)throw new Error('注文の対応を確認できません。');await receiveCase(c,orderTokens[c.orderId]);}await reconcile();status.textContent='購入済みMY COPYの本文を受け取りました。追加の引き落としは行っていません。';}catch(e){status.textContent='受け取りは未完了です：'+e.message+'。購入を繰り返さず再照合してください。';}finally{busy=false;controls();}};
  function save(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  el('download').onclick=()=>{if(report)save({report,apiResults:apiSummary},'ahako-sandbox-purchase-'+run.runId+'.json');};
  el('copy').onclick=()=>{if(copyScene)save(copyScene,'ahako-sandbox-purchase.scene');};
  el('end').onclick=async()=>{if(busy||!run)return;busy=true;controls();try{await apiWithTimeout(endpoint,{method:'POST',body:JSON.stringify({action:'end',runId:run.runId,expectedEnvironment:'test'})},15000);sessionToken='';attempted={insufficient:true,concurrent:true};status.textContent='テスト認証を終了しました。取引・権利・復旧履歴は保持しています。';}catch(e){status.textContent=e.message;}finally{busy=false;controls();}};
  const changed=()=>{if(!run){readiness=null;report=null;readyText.textContent='';result.textContent='';controls();}};buyer.oninput=changed;seller.oninput=changed;controls();
}
installSandboxPurchaseTestPanel();


// The run ID is intentionally independent of the short-lived buyer credential.
// A page reload must never require another purchase to repair a paid order.
(function installSandboxSettlementRepair(){
  if(!els.auditOrdersList)return;
  const p=document.createElement('details');p.className='audit-normal';p.style.marginTop='24px';
  p.innerHTML='<summary>作者への未送金を復旧（Sandbox専用）</summary><p>購入済みテスト注文の作者分¥50だけを照合・送金します。購入者からの再引き落とし・返金・MY COPY再発行は行いません。送金前にSandboxの新規購入を停止してください。通信断後は「送金状態を確認」で照合します。</p><label>テストID <input data-ss-run placeholder="stest_…" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;max-width:500px;box-sizing:border-box"></label><p><button data-ss-check type="button">送金状態を確認</button> <button data-ss-apply type="button" disabled>確認した作者分だけを復旧</button></p><p data-ss-status aria-live="polite"></p><pre data-ss-result style="white-space:pre-wrap;overflow-wrap:anywhere"></pre><p>復旧後も安全ロックは維持します。「残高購入の停止状態」で再照合し、安全を確認できた場合だけ解除してください。</p>';
  els.auditOrdersList.parentNode.appendChild(p);
  const q=k=>p.querySelector('[data-ss-'+k+']'),input=q('run'),check=q('check'),apply=q('apply'),status=q('status'),result=q('result');let busy=false,view=null;
  const endpoint='/admin/commerce/sandbox-settlement-repair';
  const messages={READY_TO_TRANSFER:'作者分¥50の送金を実行できます。',EXISTING_TRANSFER_CAN_SYNC:'Stripeの既存送金を確認しました。再送金せずOrderへ反映します。',ALREADY_SETTLED:'作者への送金は反映済みです。再送金しません。',REPAIR_ATTEMPT_REQUIRES_RECONCILIATION:'復旧の実行記録があります。再送金せず、Stripeの結果確認が必要です。',PAUSE_SANDBOX_PURCHASES_FIRST:'先にSandbox Workerの AHAKO_COMMERCE_PAUSED=true を保存・デプロイし、もう一度確認してください。',PLATFORM_BALANCE_INSUFFICIENT:'運営側の利用可能残高が不足しています。'};
  function controls(){input.disabled=check.disabled=busy;apply.disabled=busy||!view?.canApply;}
  function subject(){const runId=input.value.trim();if(!/^stest_[a-f0-9]{32}$/.test(runId))throw new Error('テストID（stest_…）を入力してください。');return runId;}
  function show(r){if(r?.environment!=='test'||r.runId!==subject()||r.financialWrites!==false||r.amountJPY!==50||typeof r.revision!=='string')throw new Error('照合対象を確認できません。');view=r;result.textContent=(messages[r.reason]||r.reason)+'\n注文：'+r.orderId+'\n作者分：¥50\n送金先：'+r.destination+'\n運営側の利用可能残高：¥'+r.platformAvailableJPY+'\nStripe送金：'+(r.transferId||'未確認')+'\n照合日時：'+r.checkedAt;}
  input.oninput=()=>{view=null;result.textContent='';controls();};
  check.onclick=async()=>{if(busy)return;busy=true;view=null;result.textContent='';status.textContent='Stripeと注文を照合中…';controls();try{const data=await apiWithTimeout(endpoint+'?'+new URLSearchParams({runId:subject(),expectedEnvironment:'test'}),{},60000);show(data.report);status.textContent='照合完了。確認では資金を動かしていません。';}catch(e){status.textContent=e.message;}finally{busy=false;controls();}};
  apply.onclick=async()=>{if(busy||!view?.canApply)return;const viewed=view;
    if(!confirm(viewed.reason==='EXISTING_TRANSFER_CAN_SYNC'?'既存の作者送金をOrderへ反映します。新しい送金・引き落としは行いません。続けますか？':'Sandboxで、この注文の作者分¥50を表示した送金先へ送ります。購入者の再引き落としは行いません。続けますか？'))return;
    busy=true;view=null;controls();status.textContent='復旧を確認中…';try{const data=await apiWithTimeout(endpoint,{method:'POST',body:JSON.stringify({runId:subject(),expectedEnvironment:'test',action:'apply',expectedRevision:viewed.revision})},60000);show(data.report);status.textContent='送金とOrderへの反映を確認しました。次は個別監査・停止状態を再照合してください。';}catch(e){result.textContent='';status.textContent=e.message+' 購入・送金を繰り返さず、「送金状態を確認」を押してください。';}finally{busy=false;controls();}};
  controls();
})();

})();
