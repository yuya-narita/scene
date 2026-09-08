(() => {
  'use strict';
  const launcher=document.getElementById('localLauncher');
  const dropZone=document.getElementById('localDropZone');
  const openButton=document.getElementById('localOpenButton');
  const fileInput=document.getElementById('localFileInput');
  const status=document.getElementById('localStatus');
  const backButton=document.getElementById('localBackButton');
  const relayButton=document.getElementById('publicRelay');
  const journey=document.getElementById('publicJourney');
  const journeyMessage=document.getElementById('publicJourneyMessage');
  const journeyPath=document.getElementById('publicJourneyPath');
  const journeyPrompt=document.getElementById('publicJourneyPrompt');
  let assetUrls=[];
  let currentPackage=null;
  let currentSourceMode='file';
  let currentBookshelfCopyId='';
  const BOOKSHELF_DB='ahako-local-bookshelf';
  const READER_BOOKS='readerBooks';
  const API_BASE='https://scene-studio-api.a-hako.workers.dev';

  const u16=(v,o)=>v.getUint16(o,true);
  const u32=(v,o)=>v.getUint32(o,true);
  const norm=path=>String(path||'').replace(/^\.\//,'').replace(/^\//,'').replace(/\\/g,'/');

  function revokeAssets(){for(const url of assetUrls){try{URL.revokeObjectURL(url)}catch(_){}}assetUrls=[];}
  function setStatus(text){if(status)status.textContent=text||'';}
  function setRelayEntryMode(active){
    if(!dropZone)return;
    dropZone.classList.toggle('is-relay-entry',!!active);
    dropZone.setAttribute('aria-label',active?'RELAYを受け取っています':'.sceneを開く');
    const small=dropZone.querySelector('small');
    const title=dropZone.querySelector('h1');
    const desc=dropZone.querySelector('p:not(.local-status)');
    const hint=dropZone.querySelector('span');
    const privacy=dropZone.querySelector('.local-privacy-link');
    if(active){
      if(small)small.textContent='あ箱';
      if(title)title.textContent='この一冊は、もう届きました。';
      if(desc)desc.hidden=true;
      if(openButton)openButton.hidden=true;
      if(hint)hint.hidden=true;
      if(privacy)privacy.hidden=true;
      dropZone.removeAttribute('tabindex');
      dropZone.removeAttribute('role');
    }else{
      if(small)small.textContent='あ箱 LOCAL PLAYER';
      if(title)title.textContent='.sceneを開く';
      if(desc)desc.hidden=false;
      if(openButton)openButton.hidden=false;
      if(hint)hint.hidden=false;
      if(privacy)privacy.hidden=false;
      dropZone.setAttribute('tabindex','0');
      dropZone.setAttribute('role','button');
    }
  }




  function bookshelfCopyIdFromLocation(){
    let copyId='';
    try{copyId=String(new URL(location.href).searchParams.get('bookshelfCopy')||'').trim();}catch(_){}
    if(copyId)return copyId;
    try{return String(sessionStorage.getItem('ahako:bookshelf:open-copy')||'').trim();}catch(_){return '';}
  }
  function relayNowFromLocation(){
    try{return new URL(location.href).searchParams.get('relayNow')==='1';}catch(_){return false;}
  }
  function clearBookshelfOpenHandoff(){
    try{sessionStorage.removeItem('ahako:bookshelf:open-copy');}catch(_){}
  }
  function validBookshelfCopyId(v){return /^copy_[a-f0-9]{32}$/i.test(String(v||''));}
  function idbRequest(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB error'));});}
  function openBookshelfDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(BOOKSHELF_DB);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('本棚を開けませんでした。'));
      req.onupgradeneeded=()=>{try{req.transaction.abort();}catch(_){}reject(new Error('読者本棚がまだありません。'));};
    });
  }
  async function readerBookFromBookshelf(copyId){
    if(!validBookshelfCopyId(copyId))throw new Error('本棚の一冊を確認できません。');
    const db=await openBookshelfDb();
    try{
      if(!db.objectStoreNames.contains(READER_BOOKS))throw new Error('読者本棚がまだありません。');
      const rec=await idbRequest(db.transaction(READER_BOOKS,'readonly').objectStore(READER_BOOKS).get(copyId));
      if(!rec?.blob)throw new Error('この一冊は本棚に見つかりませんでした。');
      return rec;
    }finally{db.close();}
  }
  async function openBookshelfCopy(copyId){
    currentBookshelfCopyId=copyId;
    currentSourceMode='bookshelf';
    setRelayEntryMode(false);
    if(launcher)launcher.hidden=false;
    setStatus('本棚から開いています…');
    if(openButton)openButton.disabled=true;
    try{
      const rec=await readerBookFromBookshelf(copyId);
      clearBookshelfOpenHandoff();
      const file=new File([rec.blob],rec.fileName||`${rec.title||'book'}_distribution.scene`,{type:'application/octet-stream'});
      await openScene(file,{sourceMode:'bookshelf',sourceKey:`bookshelf:${copyId}`});
      return true;
    }catch(error){
      console.error(error);
      currentPackage=null;
      if(launcher)launcher.hidden=false;
      if(backButton)backButton.hidden=true;
      setStatus(String(error?.message||error));
      return false;
    }finally{
      if(openButton)openButton.disabled=false;
    }
  }

  // ------------------------------------------------------------
  // V63.1 URL RELAY receiver
  // A relay URL is a delivery ticket, not an owned local file. When a valid
  // ?relay=TOKEN is present, resolve it through the Worker and hand the
  // returned runtime Scene directly to the existing public Player. No file
  // picker is shown to the recipient.
  // ------------------------------------------------------------
  function relayTokenFromLocation(){
    try{return String(new URL(location.href).searchParams.get('relay')||'').trim();}catch(_){return '';}
  }
  function relayPublicIdFromLocation(){
    try{return String(new URL(location.href).searchParams.get('relayKey')||'').trim();}catch(_){return '';}
  }
  function validRelayPublicId(v){return /^[A-Za-z0-9_-]{8,32}$/.test(String(v||''));}
  function validRelayToken(v){return /^[a-f0-9]{48}$/i.test(String(v||''));}
  function relayReceiverArrivalId(token='',publicId=''){
    const credential=validRelayPublicId(publicId)?`id:${publicId}`:`token:${token}`;
    const key=`ahako:url-relay-receiver:${credential}`;
    let id='';try{id=String(localStorage.getItem(key)||'');}catch(_){}
    if(!/^arrival_[a-f0-9]{32}$/i.test(id)){
      try{id=`arrival_${crypto.randomUUID().replaceAll('-','')}`;}catch(_){const a=new Uint8Array(16);crypto.getRandomValues(a);id=`arrival_${[...a].map(v=>v.toString(16).padStart(2,'0')).join('')}`;}
      try{localStorage.setItem(key,id);}catch(_){}
    }
    return id;
  }
  function relayResolveErrorMessage(code,fallback){
    if(code==='RELAY_EXPIRED')return 'この一冊の受け取り期限が切れています。';
    if(code==='RELAY_ALREADY_RECEIVED')return 'この一冊は、もう誰かのもとへ届きました。';
    if(code==='RELAY_RECEIVER_REQUIRED')return 'このRELAY URLを受け取る準備ができませんでした。';
    if(code==='EDITION_STOPPED')return 'この版のRELAYは作者により停止されています。';
    if(code==='EDITION_NOT_FOUND'||code==='RELAY_NOT_FOUND')return 'この一冊の旅を見つけられませんでした。';
    return String(fallback||'RELAYを読み込めませんでした。');
  }
  async function openRelayFromUrl(token='',publicId=''){
    const hasToken=validRelayToken(token),hasPublicId=validRelayPublicId(publicId);
    if(!hasToken&&!hasPublicId){
      setStatus('このRELAY URLは正しくありません。');
      return false;
    }
    currentSourceMode='relay-url';
    setRelayEntryMode(true);
    if(launcher)launcher.hidden=false;
    setStatus('一冊を受け取っています…');
    if(openButton)openButton.disabled=true;
    try{
      const receiverArrivalId=relayReceiverArrivalId(token,publicId);
      const credentialQuery=hasPublicId?`id=${encodeURIComponent(publicId)}`:`token=${encodeURIComponent(token)}`;
      const query=`${credentialQuery}&arrivalId=${encodeURIComponent(receiverArrivalId)}`;
      const response=await fetch(`${API_BASE}/relay/resolve?${query}`,{method:'GET',cache:'no-store'});
      const payload=await response.json().catch(()=>null);
      if(!response.ok||!payload?.ok||!payload?.scene){
        throw new Error(relayResolveErrorMessage(payload?.code,payload?.error));
      }
      const raw=JSON.parse(JSON.stringify(payload.scene));
      // Keep the winning receiver arrival stable for observation and future
      // "next one" RELAY creation. This makes reopening by the same browser
      // continue the same anonymous reader node instead of minting another one.
      const resolvedCopyId=String(payload?.relay?.copyId||raw?.distribution?.copyId||'');
      const resolvedRelayId=String(payload?.relay?.relayId||raw?.distribution?.relay?.relayId||'');
      if(/^copy_[a-f0-9]{32}$/i.test(resolvedCopyId)&&/^relay_[a-f0-9]{32}$/i.test(resolvedRelayId)){
        try{localStorage.setItem(`ahako:distribution-arrival:${resolvedCopyId}:${resolvedRelayId}`,receiverArrivalId);}catch(_){}
      }
      currentPackage={files:new Map(),manifest:{package:'url-relay',packageVersion:'1.0'},raw};
      if(relayButton)relayButton.hidden=true;
      renderJourney(raw);
      const previousUrls=assetUrls;assetUrls=[];
      try{
        await window.ScenePublicPlayer.loadDocument(raw,{sourceKey:`relay-url:${String(payload?.relay?.relayId||publicId||token)}`});
      }catch(error){assetUrls=previousUrls;throw error;}
      for(const u of previousUrls){try{URL.revokeObjectURL(u)}catch(_){} }
      launcher.hidden=true;
      if(backButton)backButton.hidden=true;
      setStatus('');
      return true;
    }catch(error){
      console.error(error);
      currentPackage=null;
      if(relayButton)relayButton.hidden=true;
      if(journey)journey.hidden=true;
      launcher.hidden=false;
      setRelayEntryMode(true);
      if(backButton)backButton.hidden=true;
      setStatus(String(error?.message||error));
      return false;
    }finally{
      if(openButton)openButton.disabled=false;
    }
  }

  // ------------------------------------------------------------
  // Phase 4 RELAY
  // Official RELAY does not mint a new copyId. It keeps the same issued copy
  // and adds a new relay node so the journey can be observed without storing
  // recipient identity. The package is rebuilt locally; work assets are not
  // uploaded to the A-Hako API.
  // ------------------------------------------------------------
  const enc=new TextEncoder();
  function randomRelayId(){
    try{return `relay_${crypto.randomUUID().replaceAll('-','')}`;}catch(_){const a=new Uint8Array(16);crypto.getRandomValues(a);return `relay_${[...a].map(v=>v.toString(16).padStart(2,'0')).join('')}`;}
  }
  function validCopyId(v){return /^copy_[a-f0-9]{32}$/i.test(String(v||''));}
  function validRelayId(v){return /^relay_[a-f0-9]{32}$/i.test(String(v||''));}
  function validArrivalId(v){return /^arrival_[a-f0-9]{32}$/i.test(String(v||''));}
  function validWorkId(v){return /^[A-Za-z0-9_-]{12,80}$/.test(String(v||''));}
  function randomArrivalId(){try{return `arrival_${crypto.randomUUID().replaceAll('-','')}`;}catch(_){const a=new Uint8Array(16);crypto.getRandomValues(a);return `arrival_${[...a].map(v=>v.toString(16).padStart(2,'0')).join('')}`;}}
  function currentArrivalId(copyId,relayId){
    const key=`ahako:distribution-arrival:${copyId}:${relayId||'root'}`;
    let id='';try{id=String(localStorage.getItem(key)||'');}catch(_){}
    if(!validArrivalId(id)){id=randomArrivalId();try{localStorage.setItem(key,id);}catch(_){}}
    return id;
  }
  function relayInfo(raw){
    // Author policy: older Distribution.scene files without an explicit policy
    // remain relayable; only an explicit false disables pass-along.
    if(raw?.sharing?.relay?.enabled === false)return null;
    const workId=String(raw?.workId||'').trim();
    const editionId=String(raw?.edition?.editionId||'').trim();
    const copyId=String(raw?.distribution?.copyId||'').trim();
    if(!validWorkId(workId)||!/^edition_[a-f0-9]{32}$/i.test(editionId)||!validCopyId(copyId))return null;
    const source=raw?.distribution?.relay||{};
    const sourceRelayId=validRelayId(source.relayId)?String(source.relayId):null;
    const sourceHop=Number.isInteger(Number(source.hop))?Math.max(0,Math.min(999,Number(source.hop))):0;
    const sourceArrivalId=currentArrivalId(copyId,sourceRelayId);
    return {workId,editionId,copyId,sourceRelayId,sourceHop,sourceArrivalId};
  }
  function sentStateKey(info){
    return `ahako:distribution-relay-sent:${info.copyId}:${info.sourceArrivalId}`;
  }
  function loadSentState(info){
    if(!info)return null;
    try{
      const raw=localStorage.getItem(sentStateKey(info));
      if(!raw)return null;
      const value=JSON.parse(raw);
      if(!value||value.sent!==true)return null;
      return {
        sent:true,
        relayId:validRelayId(value.relayId)?String(value.relayId):null,
        sentAt:String(value.sentAt||''),
        hop:Number.isInteger(Number(value.hop))?Math.max(0,Math.min(1000,Number(value.hop))):Math.min(1000,info.sourceHop+1)
      };
    }catch(_){return null;}
  }
  function saveSentState(info,{relayId,hop,sentAt}){
    if(!info)return;
    try{
      localStorage.setItem(sentStateKey(info),JSON.stringify({sent:true,relayId,hop,sentAt}));
    }catch(_){ }
  }
  function issuedStateKey(info){return `ahako:url-relay-issued:${info.copyId}:${info.sourceArrivalId}`;}
  function loadIssuedState(info){
    try{const v=JSON.parse(localStorage.getItem(issuedStateKey(info))||'null');if(!v||!validRelayId(v.relayId)||!validRelayPublicId(v.publicId)||!/^https:\/\//.test(String(v.url||'')))return null;if(v.expiresAt&&Date.parse(v.expiresAt)<=Date.now()){localStorage.removeItem(issuedStateKey(info));return null;}return v;}catch(_){return null;}
  }
  function saveIssuedState(info,value){try{localStorage.setItem(issuedStateKey(info),JSON.stringify(value));}catch(_){}}

  function journeyPathText(hop,sent=false){
    const parts=['発行'];
    if(hop<=0){parts.push('◎ あなた');}
    else if(hop<=4){for(let i=1;i<hop;i++)parts.push('●');parts.push('◎ あなた');}
    else{parts.push('●','●','…','●','◎ あなた');}
    if(sent)parts.push('○');
    return parts.join('  ─  ');
  }
  function renderJourney(raw,{sent=null}={}){
    if(!journey)return;
    const info=relayInfo(raw);
    if(!info){journey.hidden=true;return;}
    const issued=loadIssuedState(info);
    const isSent=sent===null?issued?.shared===true:!!sent;
    const hop=info.sourceHop;
    journey.hidden=false;
    journey.classList.toggle('is-sent',isSent);
    if(journeyMessage){
      journeyMessage.textContent=isSent
        ? '次の一人へ送り出しました。'
        : (hop>0 ? `${hop}回渡って、あなたに届きました。` : 'この一冊の旅は、ここから始まります。');
    }
    if(journeyPath)journeyPath.textContent=journeyPathText(hop,isSent);
    if(journeyPrompt){
      if(isSent){
        journeyPrompt.textContent='○ は、まだ届いていない次の旅です。';
      }else{
        const readExpiresAt=String(raw?.distribution?.relay?.readExpiresAt||'');
        const ms=Date.parse(readExpiresAt)-Date.now();
        if(readExpiresAt&&Number.isFinite(ms)&&ms>0){
          const days=Math.max(1,Math.ceil(ms/(24*60*60*1000)));
          journeyPrompt.textContent=days<=1
            ? 'この一冊の旅は、今日まで。面白かったら次の一人へ。'
            : `この一冊は、あと${days}日あなたの手元にあります。面白かったら次の一人へ。`;
        }else{
          journeyPrompt.textContent='面白かったら、次の一人へ。';
        }
      }
    }
  }

  function crc32(bytes){
    let c=0xffffffff;
    for(let i=0;i<bytes.length;i++){
      c^=bytes[i];
      for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);
    }
    return (c^0xffffffff)>>>0;
  }
  function dosDateTime(date=new Date()){
    let y=Math.max(1980,date.getFullYear());
    const time=(date.getHours()<<11)|(date.getMinutes()<<5)|(date.getSeconds()>>1);
    const d=((y-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
    return {time,date:d};
  }
  function writeU16(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;}
  function writeU32(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255;}
  function buildStoredZip(files){
    const locals=[],centrals=[];let offset=0;const now=dosDateTime(new Date());
    for(const [name0,data0] of files){
      const name=norm(name0),nameBytes=enc.encode(name),data=data0 instanceof Uint8Array?data0:new Uint8Array(data0),crc=crc32(data);
      const local=new Uint8Array(30+nameBytes.length+data.length);
      writeU32(local,0,0x04034b50);writeU16(local,4,20);writeU16(local,6,0x0800);writeU16(local,8,0);writeU16(local,10,now.time);writeU16(local,12,now.date);writeU32(local,14,crc);writeU32(local,18,data.length);writeU32(local,22,data.length);writeU16(local,26,nameBytes.length);writeU16(local,28,0);local.set(nameBytes,30);local.set(data,30+nameBytes.length);locals.push(local);
      const central=new Uint8Array(46+nameBytes.length);
      writeU32(central,0,0x02014b50);writeU16(central,4,20);writeU16(central,6,20);writeU16(central,8,0x0800);writeU16(central,10,0);writeU16(central,12,now.time);writeU16(central,14,now.date);writeU32(central,16,crc);writeU32(central,20,data.length);writeU32(central,24,data.length);writeU16(central,28,nameBytes.length);writeU16(central,30,0);writeU16(central,32,0);writeU16(central,34,0);writeU16(central,36,0);writeU32(central,38,0);writeU32(central,42,offset);central.set(nameBytes,46);centrals.push(central);
      offset+=local.length;
    }
    const centralOffset=offset,centralSize=centrals.reduce((n,a)=>n+a.length,0),count=centrals.length;
    const eocd=new Uint8Array(22);writeU32(eocd,0,0x06054b50);writeU16(eocd,4,0);writeU16(eocd,6,0);writeU16(eocd,8,count);writeU16(eocd,10,count);writeU32(eocd,12,centralSize);writeU32(eocd,16,centralOffset);writeU16(eocd,20,0);
    return new Blob([...locals,...centrals,eocd],{type:'application/octet-stream'});
  }
  function safeFileBase(v){return String(v||'scene').replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,' ').trim().slice(0,80)||'scene';}
  async function createRelayUrl(info,hop){
    const response=await fetch(`${API_BASE}/relay/create`,{
      method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',
      body:JSON.stringify({
        workId:info.workId,editionId:info.editionId,copyId:info.copyId,
        parentRelayId:info.sourceRelayId,sourceArrivalId:info.sourceArrivalId,hop
      })
    });
    const payload=await response.json().catch(()=>null);
    if(!response.ok||!payload?.ok||!payload?.url||!validRelayId(payload?.relayId)||!validRelayPublicId(payload?.publicId)){
      const code=String(payload?.code||'');
      if(code==='EDITION_NOT_FOUND')throw new Error('この版はまだURL RELAY用に登録されていません。');
      if(code==='EDITION_STOPPED')throw new Error('この版のRELAYは作者により停止されています。');
      throw new Error(String(payload?.error||'RELAY URLを発行できませんでした。'));
    }
    return payload;
  }
  async function commitRelayUrl(publicId){
    if(!validRelayPublicId(publicId))return false;
    try{
      const response=await fetch(`${API_BASE}/relay/commit`,{
        method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',
        body:JSON.stringify({id:publicId})
      });
      const payload=await response.json().catch(()=>null);
      return !!(response.ok&&payload?.ok);
    }catch(_){return false;}
  }
  function relayTokenFromUrl(url){
    try{return String(new URL(url,location.href).searchParams.get('relay')||'').trim();}catch(_){return '';}
  }
  function legacyCopyText(text){
    try{
      const area=document.createElement('textarea');
      area.value=String(text||'');
      area.setAttribute('readonly','');
      area.style.position='fixed';area.style.left='-9999px';area.style.top='0';
      document.body.appendChild(area);area.select();area.setSelectionRange(0,area.value.length);
      const ok=document.execCommand&&document.execCommand('copy');
      area.remove();
      return !!ok;
    }catch(_){return false;}
  }
  function isLikelyDesktop(){
    try{return !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'') && matchMedia('(pointer:fine)').matches;}catch(_){return false;}
  }
  async function copyRelayUrl(url){
    if(navigator.clipboard?.writeText){
      try{await navigator.clipboard.writeText(url);return true;}catch(e){console.warn('Clipboard API unavailable; falling back.',e);}
    }
    return legacyCopyText(url);
  }
  async function shareRelayUrl(url){
    if(isLikelyDesktop()){
      // Desktop browsers may show a clipboard permission prompt for
      // navigator.clipboard.writeText(). Prefer the user-gesture based
      // execCommand copy path first so RELAY sharing stays one-click.
      if(legacyCopyText(url)){
        alert('RELAY URLをコピーしました。次の一人へ送ってください。');
        return {shared:true,method:'desktop-legacy-copy'};
      }
      if(await copyRelayUrl(url)){
        alert('RELAY URLをコピーしました。次の一人へ送ってください。');
        return {shared:true,method:'desktop-copy'};
      }
      window.prompt('このURLをコピーして、次の一人へ送ってください。',url);
      return {shared:false,manual:true};
    }
    if(navigator.share){
      try{await navigator.share({url});return {shared:true,method:'native'};}
      catch(e){if(e?.name==='AbortError')return {shared:false,cancelled:true};console.warn('Native URL share unavailable; falling back.',e);}
    }
    if(await copyRelayUrl(url)){
      alert('RELAY URLをコピーしました。次の一人へ送ってください。');
      return {shared:true,method:'clipboard'};
    }
    window.prompt('このURLをコピーして、次の一人へ送ってください。',url);
    return {shared:false,manual:true};
  }

  async function relayCurrentScene(){
    if(!currentPackage)return;
    const info=relayInfo(currentPackage.raw);
    if(!info)return;
    if(relayButton)relayButton.disabled=true;
    if(journey){journey.classList.add('is-sharing');journey.setAttribute('aria-disabled','true');}
    const hop=Math.min(1000,info.sourceHop+1);
    try{
      let issued=loadIssuedState(info);
      if(!issued){
        issued=await createRelayUrl(info,hop);
        saveIssuedState(info,{url:String(issued.url),publicId:String(issued.publicId),relayId:String(issued.relayId),hop,expiresAt:String(issued.expiresAt||''),issuedAt:new Date().toISOString(),shared:false});
      }
      const result=await shareRelayUrl(String(issued.url));
      if(result.cancelled)return;
      if(result.shared){
        // A successful share/copy may still not mean the recipient opened it.
        // Commit the pending ○, but keep this card reusable and always reuse
        // the exact same relay URL for this arrival.
        await commitRelayUrl(String(issued.publicId));
        issued={...issued,shared:true,sharedAt:new Date().toISOString()};
        saveIssuedState(info,issued);
        renderJourney(currentPackage.raw,{sent:true});
      }
    }catch(error){console.error(error);alert(`RELAY URLを作れませんでした: ${error?.message||error}`);}
    finally{if(relayButton)relayButton.disabled=false;if(journey){journey.classList.remove('is-sharing');journey.removeAttribute('aria-disabled');}}
  }

  async function inflateRaw(bytes){
    if(typeof DecompressionStream==='undefined')throw new Error('このブラウザは .scene の展開に必要な機能へ対応していません。');
    const ds=new DecompressionStream('deflate-raw');
    const stream=new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function readZip(buffer){
    const bytes=new Uint8Array(buffer),view=new DataView(buffer),min=Math.max(0,bytes.length-65557);let eocd=-1;
    for(let i=bytes.length-22;i>=min;i--){if(u32(view,i)===0x06054b50){eocd=i;break;}}
    if(eocd<0)throw new Error('ZIPコンテナとして認識できません。');
    const count=u16(view,eocd+10);let p=u32(view,eocd+16);const files=new Map(),dec=new TextDecoder('utf-8');
    for(let n=0;n<count;n++){
      if(u32(view,p)!==0x02014b50)throw new Error('ZIP中央ディレクトリが壊れています。');
      const method=u16(view,p+10),csize=u32(view,p+20),usize=u32(view,p+24),nameLen=u16(view,p+28),extraLen=u16(view,p+30),commentLen=u16(view,p+32),localOffset=u32(view,p+42);
      const name=dec.decode(bytes.slice(p+46,p+46+nameLen));p+=46+nameLen+extraLen+commentLen;if(name.endsWith('/'))continue;
      if(u32(view,localOffset)!==0x04034b50)throw new Error(`ZIPヘッダ破損: ${name}`);
      const ln=u16(view,localOffset+26),le=u16(view,localOffset+28),start=localOffset+30+ln+le,packed=bytes.slice(start,start+csize);let data;
      if(method===0)data=packed;else if(method===8)data=await inflateRaw(packed);else throw new Error(`未対応の圧縮方式: ${method}`);
      if(usize&&data.length!==usize)console.warn('size mismatch',name,data.length,usize);files.set(norm(name),data);
    }
    return files;
  }
  function mime(path){
    const p=path.toLowerCase();
    if(p.endsWith('.mp3'))return'audio/mpeg';if(p.endsWith('.wav'))return'audio/wav';if(p.endsWith('.m4a'))return'audio/mp4';if(p.endsWith('.aac'))return'audio/aac';if(p.endsWith('.ogg'))return'audio/ogg';
    if(p.endsWith('.png'))return'image/png';if(p.endsWith('.jpg')||p.endsWith('.jpeg'))return'image/jpeg';if(p.endsWith('.webp'))return'image/webp';if(p.endsWith('.gif'))return'image/gif';if(p.endsWith('.svg'))return'image/svg+xml';
    if(p.endsWith('.woff2'))return'font/woff2';if(p.endsWith('.woff'))return'font/woff';return'application/octet-stream';
  }
  function jsonFile(files,name){
    const b=files.get(norm(name));if(!b)throw new Error(`${name} が .scene 内にありません。`);
    return JSON.parse(new TextDecoder('utf-8').decode(b));
  }
  function buildAssetMap(files){
    const map=new Map();
    for(const[name,data]of files){if(!name.startsWith('assets/'))continue;const url=URL.createObjectURL(new Blob([data],{type:mime(name)}));assetUrls.push(url);map.set(norm(name),url);}
    return map;
  }
  function rewriteAssets(value,map){
    if(Array.isArray(value))return value.map(v=>rewriteAssets(v,map));
    if(!value||typeof value!=='object')return value;
    const out={};
    for(const[k,v]of Object.entries(value)){
      if(typeof v==='string'&&(k==='src'||k==='url'))out[k]=map.get(norm(v))||v;
      else out[k]=rewriteAssets(v,map);
    }
    return out;
  }
  async function openScene(file,{sourceMode='file',sourceKey=''}={}){
    if(!file)return;
    currentSourceMode=sourceMode;
    setStatus('読み込み中…');openButton.disabled=true;
    try{
      const files=await readZip(await file.arrayBuffer());
      const manifest=jsonFile(files,'manifest.json');
      if(manifest.package!=='scene-package')throw new Error(`未対応 package: ${manifest.package||'(なし)'}`);
      if(String(manifest.packageVersion||'')!=='1.0')throw new Error(`未対応 Scene Package version: ${manifest.packageVersion||'(なし)'}`);
      const raw=jsonFile(files,manifest.entry||'scene.json');
      currentPackage={files:new Map(files),manifest:JSON.parse(JSON.stringify(manifest)),raw:JSON.parse(JSON.stringify(raw))};
      if(relayButton)relayButton.hidden=true;
      renderJourney(raw);
      // Validate/build first; revoke previous package only after the new package is ready.
      const nextUrls=[];const previousUrls=assetUrls;assetUrls=[];
      let doc;
      try{const map=buildAssetMap(files);doc=rewriteAssets(raw,map);await window.ScenePublicPlayer.loadDocument(doc,{sourceKey:sourceKey||`local:${file.name}:${file.size}:${file.lastModified||0}`});}
      catch(error){for(const u of assetUrls){try{URL.revokeObjectURL(u)}catch(_){}}assetUrls=previousUrls;throw error;}
      for(const u of previousUrls){try{URL.revokeObjectURL(u)}catch(_){}}
      launcher.hidden=true;if(backButton)backButton.hidden=false;setStatus('');
    }catch(error){console.error(error);currentPackage=null;if(relayButton)relayButton.hidden=true;if(journey)journey.hidden=true;setStatus(String(error?.message||error));}
    finally{openButton.disabled=false;fileInput.value='';}
  }
  function returnToLauncher(){
    if(currentSourceMode==='relay-url'){try{history.back();}catch(_){}return;}
    if(currentSourceMode==='bookshelf'){
      try{window.ScenePublicPlayer?.unloadDocument?.();}catch(error){console.warn(error);}
      revokeAssets();
      currentPackage=null;
      location.href='../bookshelf/';
      return;
    }
    // Let the current public Player own Core/audio teardown, then release only
    // the Blob URLs that belong to the local package.
    try{window.ScenePublicPlayer?.unloadDocument?.();}catch(error){console.warn(error);}
    revokeAssets();
    currentPackage=null;if(relayButton)relayButton.hidden=true;if(journey)journey.hidden=true;
    setRelayEntryMode(false);
    setStatus('');
    fileInput.value='';
    if(backButton)backButton.hidden=true;
    launcher.hidden=false;
  }
  function openPicker(){fileInput.click();}
  openButton.addEventListener('click',e=>{e.stopPropagation();openPicker();});
  backButton?.addEventListener('click',returnToLauncher);
  relayButton?.addEventListener('click',relayCurrentScene);
  journey?.addEventListener('click',()=>{if(relayInfo(currentPackage?.raw)&&!journey.classList.contains('is-sharing'))relayCurrentScene();});
  journey?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&relayInfo(currentPackage?.raw)&&!journey.classList.contains('is-sharing')){e.preventDefault();relayCurrentScene();}});
  fileInput.addEventListener('change',()=>openScene(fileInput.files?.[0]));
  ['dragenter','dragover'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();dropZone.classList.add('is-over');}));
  ['dragleave','drop'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();dropZone.classList.remove('is-over');}));
  dropZone.addEventListener('drop',e=>openScene(e.dataTransfer?.files?.[0]));
  dropZone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPicker();}});
  window.SceneLocalLoader={version:'5.1-bookshelf-relay',openFile:openScene,openPicker,returnToLauncher,relayCurrentScene,openRelayFromUrl,openBookshelfCopy};

  const initialBookshelfCopyId=bookshelfCopyIdFromLocation();
  const initialRelayNow=relayNowFromLocation();
  const initialRelayToken=relayTokenFromLocation();
  const initialRelayPublicId=relayPublicIdFromLocation();
  if(validBookshelfCopyId(initialBookshelfCopyId)){
    openBookshelfCopy(initialBookshelfCopyId).then(ok=>{
      if(ok&&initialRelayNow&&relayInfo(currentPackage?.raw))setTimeout(()=>relayCurrentScene(),0);
    });
  }else if(initialRelayToken||initialRelayPublicId){
    setRelayEntryMode(true);
    if(launcher)launcher.hidden=false;
    openRelayFromUrl(initialRelayToken,initialRelayPublicId);
  }

})();
