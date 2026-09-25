(() => {
  'use strict';

  const host = document.getElementById('scenePlayer');
  const opening = document.getElementById('publicOpening');
  const openingImage = document.getElementById('publicOpeningImage');
  const openingDim = document.getElementById('publicOpeningDim');
  const intro = document.getElementById('publicIntro');
  const introLogo = document.getElementById('publicIntroLogo');
  const introTitle = document.getElementById('publicIntroTitle');
  const introAuthor = document.getElementById('publicIntroAuthor');
  const introEpisode = document.getElementById('publicIntroEpisode');
  const introEpisodeTitle = document.getElementById('publicIntroEpisodeTitle');
  const introDescription = document.getElementById('publicIntroDescription');
  const introCover = document.getElementById('publicIntroCover');
  const introCoverDim = document.getElementById('publicIntroCoverDim');
  const startButton = document.getElementById('publicStart');
  const continueButton = document.getElementById('publicContinue');
  const shelfReturnLink = document.getElementById('publicShelfReturn');

  const ending = document.getElementById('publicEnding');
  const endingLabel = document.getElementById('publicEndingLabel');
  const endingLeft = document.getElementById('publicEndingLeft');
  const endingRight = document.getElementById('publicEndingRight');
  const endingCoverButton = document.getElementById('publicEndingCover');
  const restartButton = document.getElementById('publicRestart');
  const ownCopyWrap = document.getElementById('publicOwnCopyWrap');
  const ownCopyButton = document.getElementById('publicOwnCopy');
  const ownCopyStatus = document.getElementById('publicOwnCopyStatus');

  const errorPanel = document.getElementById('publicError');
  const errorTitle = document.getElementById('publicErrorTitle');
  const errorMessage = document.getElementById('publicErrorMessage');
  const retryButton = document.getElementById('publicRetry');

  let player = null;
  let documentData = null;
  let shellBound = false;
  let muted = false;
  const reportButton=document.getElementById('publicReportButton');
  const reportDialog=document.getElementById('publicReportDialog');
  const reportWorkId=document.getElementById('publicReportWorkId');
  const reportUrl=document.getElementById('publicReportUrl');
  const reportCopy=document.getElementById('publicReportCopy');
  const reportStatus=document.getElementById('publicReportStatus');
  const reportSubject=document.getElementById('publicReportSubject');
  const reportEvidenceUrl=document.getElementById('publicReportEvidenceUrl');
  const reportDetails=document.getElementById('publicReportDetails');
  const reportContact=document.getElementById('publicReportContact');
  const reportConfirm=document.getElementById('publicReportConfirm');
  const reportEvidenceRequired=document.getElementById('publicReportEvidenceRequired');
  const reportContactRequired=document.getElementById('publicReportContactRequired');
  const reportContactHint=document.getElementById('publicReportContactHint');

  const params = new URLSearchParams(location.search);
  const requested = (params.get('src') || '').trim();
  const DEFAULT_SCENE = './works/external-signal/scene.json';
  const source = () => requested || DEFAULT_SCENE;
  const storageKey = () => `scene-public-progress:${source()}`;
  const PUBLIC_READER_ID_KEY='ahako:public-own-copy-reader-id';
  const BOOKSHELF_CLAIM_SOURCE_SESSION='ahako:bookshelf:claim-source';
  const BOOKSHELF_CLAIM_RETURN_PREFIX='ahako:bookshelf:claim-return:';
  const COMMERCE_ORDER_TOKEN_PREFIX='ahako:commerce-order-token:';
  const COMMERCE_CHECKOUT_RETURN_KEY='ahako:commerce-checkout-return:v157';

  function safeShelfReturn(raw){
    try{
      const url=new URL(String(raw||''),location.href);
      if(url.protocol!=='https:'&&url.protocol!=='http:')return null;
      const path=url.pathname.replace(/\/+$/,'');
      const isProductionAuthor=url.hostname==='yuya-narita.github.io'&&path==='/scene/author';
      const isSameSiteAuthor=url.origin===location.origin&&/\/author$/.test(path);
      const isProductionBookshelf=url.hostname==='yuya-narita.github.io'&&path==='/scene/bookshelf';
      const isSameSiteBookshelf=url.origin===location.origin&&/\/bookshelf$/.test(path);
      if(isProductionBookshelf||isSameSiteBookshelf){
        url.hash='';
        return {url:url.toString(),label:'← あ箱の本へ'};
      }
      const authorId=String(url.searchParams.get('id')||url.searchParams.get('author')||'').toLowerCase();
      const authorSlug=String(url.searchParams.get('u')||'').trim().toLowerCase();
      const validAuthorId=/^author_[a-f0-9]{32}$/.test(authorId);
      const validAuthorSlug=/^[a-z0-9][a-z0-9_-]{2,29}$/.test(authorSlug);
      if((!isProductionAuthor&&!isSameSiteAuthor)||(!validAuthorId&&!validAuthorSlug))return null;
      url.searchParams.delete('book');
      url.hash='';
      return {url:url.toString(),label:'← 作者の本棚へ'};
    }catch(_){return null;}
  }

  function configureShelfReturn(){
    if(!shelfReturnLink)return;
    const returnTo=safeShelfReturn(params.get('returnTo'));
    if(!returnTo){shelfReturnLink.hidden=true;return;}
    shelfReturnLink.href=returnTo.url;
    shelfReturnLink.textContent=returnTo.label;
    shelfReturnLink.hidden=false;
    if(window.matchMedia?.('(max-width:520px)').matches){
      shelfReturnLink.style.width='max-content';
      const fittedWidth=Math.ceil(shelfReturnLink.getBoundingClientRect().width);
      shelfReturnLink.style.removeProperty('width');
      if(fittedWidth)shelfReturnLink.style.setProperty('--shelf-return-expanded-width',`${fittedWidth}px`);
    }
  }

  function canRestoreShelfFromHistory(target){
    if(history.length<=1||!document.referrer)return false;
    try{
      const destination=new URL(target,location.href),previous=new URL(document.referrer);
      const clean=path=>path.replace(/\/+$/,'');
      const destinationPath=clean(destination.pathname),previousPath=clean(previous.pathname);
      if(destination.origin!==previous.origin||destinationPath!==previousPath)return false;
      if(/\/bookshelf$/.test(destinationPath))return true;
      if(!/\/author$/.test(destinationPath))return false;
      const authorReference=url=>String(url.searchParams.get('u')||url.searchParams.get('id')||url.searchParams.get('author')||'').trim().toLowerCase();
      return Boolean(authorReference(destination))&&authorReference(destination)===authorReference(previous);
    }catch(_){return false;}
  }
  shelfReturnLink?.addEventListener('click',event=>{if(!canRestoreShelfFromHistory(shelfReturnLink.href))return;event.preventDefault();history.back();});

  function setShelfReturnReading(reading){
    shelfReturnLink?.classList.toggle('is-reading',Boolean(reading));
  }

  configureShelfReturn();

  function setReportVisible(visible){
    if(!reportButton)return;
    reportButton.hidden=!visible;
  }

  function publicAssetBase(){
    try{
      const u=new URL(source(),location.href);
      return u.pathname.includes('/work/') ? u.origin : 'https://scene-studio-api.a-hako.workers.dev';
    }catch(_){
      return 'https://scene-studio-api.a-hako.workers.dev';
    }
  }
  function resolvePublicAudioSrc(src){
    const value=String(src||'').trim();
    if(!value)return value;
    // Published Scene audio is normally hydrated to /asset/<id>, but the
    // ending-audio field could still arrive as the raw R2 asset id. Safari
    // then receives e.g. "58d0..." as a relative URL and rejects it with
    // NotSupportedError. Only hydrate bare asset ids; keep URLs/data/blob/local
    // paths untouched for Local Player / packaged Scene compatibility.
    if(/^[A-Za-z0-9_-]{20,}$/.test(value) && !value.includes('.') && !value.includes('/')){
      return `${publicAssetBase()}/asset/${encodeURIComponent(value)}`;
    }
    return value;
  }
  function hydratePublicAudio(doc){
    const fix=(commands)=>{
      if(!Array.isArray(commands))return;
      commands.forEach((command)=>{
        if(command&&typeof command==='object'&&command.src)command.src=resolvePublicAudioSrc(command.src);
      });
    };
    (Array.isArray(doc?.scenes)?doc.scenes:[]).forEach((scene)=>fix(scene?.audio));
    fix(doc?.ending?.audio);
    return doc;
  }

  // v0.3.64 — anonymous, work-level analytics.
  // One small R2 session record is overwritten as reading progresses, so
  // Scene taps do not create one object per tap. No account / personal ID is used.
  const analyticsSessionId = crypto.randomUUID().replaceAll('-', '').slice(0, 24);
  let analyticsSceneAdvances = 0;
  let analyticsCompleted = false;
  let analyticsViewSent = false;

  // Optional author/reader pacing resonance. No judgement is shown during reading;
  // the comparison appears only on the ending screen.
  let resonanceSession = null;

  function resonanceIsEnabled(){
    const resonance=documentData?.player?.resonance;
    // Strict, versioned opt-in.
    // Earlier development builds may already contain enabled/authorOptIn,
    // so only a fresh author action in the finalized v2 opt-in UI counts.
    return resonance?.enabled===true
      && resonance?.authorOptIn===true
      && Number(resonance?.authorOptInVersion)===2;
  }
  function resonanceHasCompleteAuthorTiming(){
    const scenes=documentData?.scenes;
    return Array.isArray(scenes)&&scenes.length>0&&scenes.every(scene=>Number.isFinite(Number(scene?.pause))&&Number(scene.pause)>0);
  }
  function resetResonanceSession(startAt=0){
    resonanceSession=(resonanceIsEnabled()&&resonanceHasCompleteAuthorTiming()&&Number(startAt)===0)
      ? {valid:true,startedAt:0,lastAt:0,samples:[]}
      : null;
    renderResonanceResult(null);
  }
  function beginResonanceClock(at=performance.now()){
    if(!resonanceSession?.valid)return;
    const zero=Number(at)||performance.now();
    resonanceSession.startedAt=zero;
    resonanceSession.lastAt=zero;
  }
  function invalidateResonance(){if(resonanceSession)resonanceSession.valid=false;}
  function recordResonanceBoundary(sceneIndex,at=performance.now()){
    const session=resonanceSession;if(!session?.valid||!session.lastAt)return;
    const expected=Number(documentData?.scenes?.[sceneIndex]?.pause);
    if(!Number.isFinite(expected)||expected<=0){invalidateResonance();return;}
    const now=Number(at)||performance.now();
    const actual=Math.max(0,now-session.lastAt);
    const elapsed=Math.max(0,now-session.startedAt);
    session.lastAt=now;
    session.samples.push({sceneIndex,expected,actual,elapsed});
  }
  function resonanceCurve(diff,tolerance){
    const ratio=Math.abs(Number(diff)||0)/Math.max(1,Number(tolerance)||1);
    return 1/(1+ratio*ratio);
  }
  function expectedResonanceCue(sceneIndex){
    const scenes=documentData?.scenes||[];
    const nextCue=Number(scenes[sceneIndex+1]?.cueAt);
    if(sceneIndex+1<scenes.length&&Number.isFinite(nextCue)&&nextCue>=0)return nextCue;
    const currentCue=Number(scenes[sceneIndex]?.cueAt);
    const currentPause=Number(scenes[sceneIndex]?.pause);
    if(Number.isFinite(currentCue)&&currentCue>=0&&Number.isFinite(currentPause)&&currentPause>0)return currentCue+currentPause;
    let total=0;
    for(let i=0;i<=sceneIndex;i++)total+=Math.max(0,Number(scenes[i]?.pause)||0);
    return total;
  }
  function resonanceScore(){
    const session=resonanceSession;
    if(!session?.valid||session.samples.length!==(documentData?.scenes?.length||0))return null;
    const values=session.samples.map(({sceneIndex,expected,actual,elapsed})=>{
      // Standard resonance: preserve human reading variance while making the
      // old 75% tolerance meaningfully more selective.
      const intervalTolerance=Math.max(800,expected*.35);
      const intervalScore=resonanceCurve(actual-expected,intervalTolerance);

      // Interval-only scoring forgave a reader who slipped against the work's
      // timeline once and then kept the same spacing. Include a restrained
      // absolute-phase component so cumulative drift remains visible without
      // turning reading into a rhythm game.
      const expectedCue=expectedResonanceCue(sceneIndex);
      const phaseTolerance=Math.max(1200,expected*.20);
      const phaseScore=resonanceCurve(elapsed-expectedCue,phaseTolerance);
      return intervalScore*.75+phaseScore*.25;
    });
    const mean=values.reduce((a,b)=>a+b,0)/values.length;
    const bottomCount=Math.max(1,Math.ceil(values.length*.20));
    const bottomMean=[...values].sort((a,b)=>a-b).slice(0,bottomCount).reduce((a,b)=>a+b,0)/bottomCount;
    // The lower-tail component prevents a handful of major misses from being
    // diluted into a near-perfect score in long works.
    return Math.max(0,Math.min(100,(mean*.70+bottomMean*.30)*100));
  }
  function resonanceDepth(score){
    const value=Number(score);
    if(!Number.isFinite(value))return '';
    if(value>=90)return '同期';
    if(value>=78)return '共鳴';
    if(value>=62)return '呼吸';
    return '余白';
  }
  function resonanceResultNode(){
    let node=document.getElementById('publicResonanceResult');
    if(node||!endingLabel?.parentElement)return node;
    node=document.createElement('div');
    node.id='publicResonanceResult';
    node.className='public-resonance-result';
    node.hidden=true;
    node.innerHTML='<small>RESONANCE</small><strong></strong><span class="public-resonance-depth"></span><p>あなたと作者の「間」の共鳴率</p>';
    endingLabel.insertAdjacentElement('afterend',node);
    return node;
  }
  function renderResonanceResult(score){
    const node=resonanceResultNode();
    if(!node)return;

    // IMPORTANT: Number(null) === 0.
    // v1.8 converted null before checking validity, so disabled / legacy works
    // were mistakenly rendered as RESONANCE 0.0%. Treat null/undefined as
    // "no result" before numeric conversion.
    const hasScore=score!==null && score!==undefined && score!=='';
    const value=hasScore ? Number(score) : NaN;
    node.hidden=!Number.isFinite(value);
    ending?.classList.toggle('has-resonance',!node.hidden);

    const strong=node.querySelector('strong');
    const depth=node.querySelector('.public-resonance-depth');
    if(!node.hidden){
      if(strong)strong.textContent=`${value.toFixed(1)}%`;
      if(depth)depth.textContent=`共鳴深度：${resonanceDepth(value)}`;
    }else if(strong){
      strong.textContent='';
      if(depth)depth.textContent='';
    }
  }

  function analyticsEndpoint(){
    try{
      const u=new URL(source(),location.href);
      return (u.pathname.includes('/work/')?u.origin:'https://scene-studio-api.a-hako.workers.dev') + '/analytics';
    }catch{
      return 'https://scene-studio-api.a-hako.workers.dev/analytics';
    }
  }

  function sendAnalytics(event, extra={}){
    const workId=currentWorkId();
    if(!workId)return;
    const payload={
      event, workId, sessionId:analyticsSessionId,
      title:String(documentData?.title||'').slice(0,200),
      sceneCount:Array.isArray(documentData?.scenes)?documentData.scenes.length:0,
      sceneAdvances:analyticsSceneAdvances,
      completed:analyticsCompleted,
      ...extra
    };
    try{
      fetch(analyticsEndpoint(),{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload), keepalive:true, cache:'no-store'
      }).catch(()=>{});
    }catch(_){}
  }

  function safeProgress() {
    const n = Number(localStorage.getItem(storageKey()));
    return Number.isInteger(n) && n > 0 && documentData?.scenes?.[n] ? n : 0;
  }

  function showError(error) {
    setShelfReturnReading(false);
    console.error(error);
    host.hidden = true;
    intro.hidden = true;
    opening.hidden = true;
    ending.hidden = true;
    errorPanel.hidden = false;

    const status = Number(error?.status) || 0;

    if (status === 410) {
      errorTitle.textContent = '公開を停止しています';
      errorMessage.textContent = 'この作品は現在公開されていません。';
      retryButton.hidden = true;
      return;
    }

    if (status === 404) {
      errorTitle.textContent = '作品が見つかりません';
      errorMessage.textContent = 'この作品は削除されたか、URLが無効です。';
      retryButton.hidden = true;
      return;
    }

    errorTitle.textContent = 'Sceneを開けませんでした';
    errorMessage.textContent = `${error?.message || error}`;
    retryButton.hidden = false;
  }

  function setTheme(doc) {
    // Public chrome / ending must follow the same visual theme contract as
    // Scene Player Core. CINEMA can be authored with a light tone; treating
    // every CINEMA document as dark makes only the public ending flip to the
    // dark palette even while the work itself is visibly light.
    const light = doc.theme === 'light'
      || (doc.theme === 'cinema' && doc.appearance?.cinemaTone === 'light');
    const bg = light ? '#f7f6f1' : '#0b1016';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    document.documentElement.style.setProperty('--public-bg', bg);
    document.documentElement.style.setProperty('--public-text', light ? '#211d18' : '#f5f5f2');
    document.documentElement.style.setProperty('--public-sub', light ? 'rgba(33,29,24,.48)' : 'rgba(245,245,242,.58)');
    document.documentElement.style.setProperty('--public-line', light ? 'rgba(33,29,24,.18)' : 'rgba(245,245,242,.16)');
  }

  function coverSource(doc){
    return String(doc?.cover?.src || doc?.cover?.url || doc?.cover?.image || '').trim();
  }
  function applyCover(doc){
    const src=coverSource(doc);
    const families={serif:'"Yu Mincho","Hiragino Mincho ProN",serif',sans:'-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Yu Gothic",sans-serif',mono:'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'};
    intro?.style.setProperty('--public-cover-font',families[doc?.cover?.fontFamily]||families.serif);
    if(introCover){
      introCover.style.backgroundImage=src?`url("${src.replace(/"/g,'\\"')}")`:'none';
      introCover.style.backgroundSize=doc?.cover?.fit==='contain'?'contain':'cover';
      introCover.style.backgroundPosition=doc?.cover?.position||'center';
    }
    if(introCoverDim)introCoverDim.style.opacity=src?'1':'0';
    intro.classList.toggle('has-cover',Boolean(src));
  }

  function normalizedExternalLinks(doc) {
    const raw = doc.ending?.links || doc.navigation?.links || doc.player?.navigation?.links || [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map(item => {
        if (typeof item === 'string') return { label: item, url: item };
        return {
          label: String(item?.label || item?.title || '').trim(),
          url: String(item?.url || item?.href || '').trim()
        };
      })
      .filter(item => item.label && item.url);
  }

  function buildEnding(doc) {
    const families={serif:'"Yu Mincho","Hiragino Mincho ProN",serif',sans:'-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Yu Gothic",sans-serif',mono:'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'};
    endingLabel.style.fontFamily=families[doc?.ending?.fontFamily]||families.serif;
    const label=String(doc.ending?.label ?? doc.ending?.title ?? '').trim(); endingLabel.textContent=label; endingLabel.hidden=!label;
    const links=Array.isArray(doc.ending?.links)?doc.ending.links:[];
    const hasPositions=links.some(x=>x?.position==='left'||x?.position==='right'); const left=hasPositions?(links.find(x=>x?.position==='left')||null):(links[0]||null); const right=hasPositions?(links.find(x=>x?.position==='right')||null):(links.length>1?links[1]:null);
    const applyBox=(node,item,delay)=>{if(!node)return;const text=String(item?.label||item?.title||'').trim(),kicker=String(item?.kicker||'').trim(),url=String(item?.url||item?.href||'').trim();node.hidden=!(text&&url);if(node.hidden)return;const s=node.querySelector('small'),b=node.querySelector('strong');if(s){s.textContent=kicker;s.hidden=!kicker;}if(b)b.textContent=text;node.href=url;node.style.setProperty('--ending-delay',`${delay}ms`);};
    applyBox(endingLeft,left,3000); applyBox(endingRight,right,3200);
    const cs=endingCoverButton?.querySelector('small'),cb=endingCoverButton?.querySelector('strong'); if(cs)cs.textContent=doc.ending?.coverButton?.kicker||'COVER'; if(cb)cb.textContent=doc.ending?.coverButton?.label||'表紙に戻る'; endingCoverButton?.style.setProperty('--ending-delay','3100ms');
  }

  function firstSceneBackground(doc) {
    const scene = doc?.scenes?.[0];
    return scene?.presentation?.background || scene?.background || null;
  }

  function prepareOpening(doc) {
    const bg = firstSceneBackground(doc);
    const src = String(bg?.src || '').trim();

    openingImage.style.backgroundImage = src ? `url("${src.replace(/"/g, '\\"')}")` : 'none';
    openingImage.style.backgroundSize =
      bg?.fit === 'contain' ? 'contain' :
      bg?.fit === 'fill' ? '100% 100%' :
      'cover';
    // The opening layer is visible for a few hundred milliseconds before the
    // Player Core mounts Scene 1. Apply the authored crop here as well so the
    // image never flashes at center and then jumps to its saved position.
    openingImage.style.backgroundPosition = bg?.position || 'center center';
    openingImage.style.backgroundRepeat = 'no-repeat';

    const dim = Math.max(0, Math.min(1, Number(bg?.dim ?? 0)));
    openingDim.style.background = `rgba(0,0,0,${dim})`;
  }

  async function openingBreath() {
    prepareOpening(documentData);

    // Intro disappears first. The reader gets a short moment with only the
    // work's first background before Scene 1 begins.
    intro.classList.add('is-leaving');
    await new Promise(resolve => setTimeout(resolve, 240));

    intro.hidden = true;
    intro.classList.remove('is-leaving');

    opening.hidden = false;
    requestAnimationFrame(() => opening.classList.add('is-visible'));

    await new Promise(resolve => setTimeout(resolve, 450));

    opening.classList.remove('is-visible');
    opening.hidden = true;
  }

  function applyPublicCoverTypography(doc){
    const styles=doc?.cover?.styles||{};
    const baseFamily={
      serif:'"Yu Mincho","Hiragino Mincho ProN",serif',
      sans:'-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Yu Gothic",sans-serif',
      mono:'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'
    };
    const sizeScale={small:.78,normal:1,large:1.28,xl:1.6};
    const fields=[
      [introTitle,'title'],
      [introDescription,'subtitle'],
      [introAuthor,'author'],
      [introEpisode,'episode'],
      [introEpisodeTitle,'episodeTitle']
    ];

    for(const [el,key] of fields){
      if(!el)continue;
      const st=styles[key]||{};
      el.style.removeProperty('font-size');
      el.style.removeProperty('font-family');
      el.style.removeProperty('color');
      const baseSize=parseFloat(getComputedStyle(el).fontSize)||16;

      const family=st.fontFamily && st.fontFamily!=='inherit'
        ? baseFamily[st.fontFamily]
        : baseFamily[doc?.cover?.fontFamily];
      if(family)el.style.setProperty('font-family',family,'important');

      if(st.color)el.style.setProperty('color',String(st.color),'important');

      if(st.size && st.size!=='auto'){
        const resolved=typeof st.size==='number'
          ? Number(st.size)
          : baseSize*(sizeScale[String(st.size)]||1);
        if(Number.isFinite(resolved))el.style.setProperty('font-size',`${resolved}px`,'important');
      }
    }
  }

  function applyDocumentMeta(doc) {
    const cleanTitle=String(doc.title||'').trim()==='Untitled'?'':String(doc.title||'');
    document.title = cleanTitle || 'Scene';

    const legacyText=doc.cover?.text||{};
    const visibility=doc.cover?.visibility||{};
    const visible=(key,value)=>{
      if(Object.prototype.hasOwnProperty.call(visibility,key)){
        return visibility[key]!==false && Boolean(String(value||'').trim());
      }
      if(Object.prototype.hasOwnProperty.call(legacyText,key) && String(legacyText[key]??'')===''){
        return false;
      }
      return Boolean(String(value||'').trim());
    };

    const logoSrc=String(doc.cover?.logo?.src||'').trim();
    if(introLogo){introLogo.src=logoSrc;introLogo.hidden=!logoSrc;}

    const title=cleanTitle;
    const subtitle=String(doc.metadata?.subtitle||doc.subtitle||'');
    const author=String(doc.author||'');
    const ep=String(doc.metadata?.episode||doc.episode||'');
    const et=String(doc.metadata?.episodeTitle||doc.episodeTitle||'');

    introTitle.textContent=title;
    introTitle.hidden=Boolean(logoSrc)||!visible('title',title);

    introAuthor.textContent=author;
    introAuthor.hidden=!visible('author',author);

    if(introEpisode){
      introEpisode.textContent=ep;
      introEpisode.hidden=!visible('episode',ep);
    }
    if(introEpisodeTitle){
      introEpisodeTitle.textContent=et;
      introEpisodeTitle.hidden=!visible('episodeTitle',et);
    }

    // This node is the public cover's subtitle slot.
    // Do not substitute the long work description here.
    introDescription.textContent=subtitle;
    introDescription.hidden=!visible('subtitle',subtitle);

    setTheme(doc);
    applyCover(doc);
    applyPublicCoverTypography(doc);
    buildEnding(doc);
    syncPublicOwnCopy(doc);
    continueButton.hidden = safeProgress() <= 0;
  }

  function currentWorkId(){
    const src=source();
    const m=src.match(/\/work\/([^/?#]+)/i);
    return m?decodeURIComponent(m[1]):'';
  }

  function publicOwnCopyReaderId(){
    let id='';try{id=String(localStorage.getItem(PUBLIC_READER_ID_KEY)||'');}catch(_){}
    if(!/^reader_[a-f0-9]{32}$/i.test(id)){
      try{id=`reader_${crypto.randomUUID().replaceAll('-','')}`;}
      catch(_){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);id=`reader_${[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('')}`;}
      try{localStorage.setItem(PUBLIC_READER_ID_KEY,id);}catch(_){}
    }
    return id;
  }
  function isIOSFamily(){
    const ua=String(navigator.userAgent||'');
    return /iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&Number(navigator.maxTouchPoints||0)>1);
  }
  function isRealIOSSafari(){
    if(!isIOSFamily())return false;
    const ua=String(navigator.userAgent||'');
    return /Version\/[\d.]+/i.test(ua)&&/Safari\/[\d.]+/i.test(ua)&&!/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA)\//i.test(ua);
  }
  function needsExternalSafariHandoff(){return isIOSFamily()&&!isRealIOSSafari();}
  function newBookshelfHandoffId(){
    const bytes=new Uint8Array(12);crypto.getRandomValues(bytes);
    return `handoff_${[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('')}`;
  }
  function rememberBookshelfClaimSource(handoffId,token){
    try{
      sessionStorage.setItem(BOOKSHELF_CLAIM_SOURCE_SESSION,`${handoffId}:${token}`);
      sessionStorage.setItem(`${BOOKSHELF_CLAIM_RETURN_PREFIX}${handoffId}`,location.href);
    }catch(_){}
  }
  function publicBookshelfClaimUrl(token,{handoffId='',external=false}={}){
    if(!/^[a-f0-9]{48}$/i.test(String(token||'')))return '';
    const url=new URL('./bookshelf/',location.href);
    url.searchParams.set('claim',String(token));
    if(/^handoff_[a-f0-9]{24}$/i.test(handoffId))url.searchParams.set('handoff',handoffId);
    if(external)url.searchParams.set('openExternalBrowser','1');
    return url.toString();
  }
  function publicOwnCopyApiBase(){
    try{const url=new URL(source(),location.href);return url.pathname.includes('/work/')?url.origin:'https://scene-studio-api.a-hako.workers.dev';}
    catch(_){return 'https://scene-studio-api.a-hako.workers.dev';}
  }
  function canonicalMasterWorkId(doc=documentData){
    return String(doc?.studio?.identity?.workId||doc?.workId||'').trim();
  }
  function commercePreviewLocked(doc=documentData){return doc?.commerce?.ownCopyGate?.access==='preview_lock';}
  function commerceGateMode(doc=documentData){
    const mode=String(doc?.commerce?.ownCopyGate?.mode||'free').trim().toLowerCase();
    return ['free','purchase','support'].includes(mode)?mode:'free';
  }
  function formatJPY(amount){return `¥${Math.max(0,Math.floor(Number(amount)||0)).toLocaleString('ja-JP')}`;}
  function cleanCommerceReturnUrl(){
    const url=new URL(location.href);
    url.searchParams.delete('payment');
    url.searchParams.delete('order_id');
    return url.toString();
  }
  function rememberCheckoutEndingReturn(){
    try{
      sessionStorage.setItem(COMMERCE_CHECKOUT_RETURN_KEY,JSON.stringify({
        source:source(),publicationId:currentWorkId(),returnUrl:cleanCommerceReturnUrl(),at:Date.now()
      }));
    }catch(_){}
  }
  function checkoutEndingReturnPending(){
    try{
      const raw=sessionStorage.getItem(COMMERCE_CHECKOUT_RETURN_KEY);
      if(!raw)return false;
      const value=JSON.parse(raw);
      if(!value||Date.now()-Number(value.at||0)>30*60*1000){sessionStorage.removeItem(COMMERCE_CHECKOUT_RETURN_KEY);return false;}
      const samePublication=!value.publicationId||!currentWorkId()||String(value.publicationId)===String(currentWorkId());
      const sameSource=!value.source||String(value.source)===String(source());
      return samePublication&&sameSource;
    }catch(_){return false;}
  }
  function clearCheckoutEndingReturn(){try{sessionStorage.removeItem(COMMERCE_CHECKOUT_RETURN_KEY);}catch(_){} }
  function forceCheckoutReturnToEnding(){
    if(!documentData||!checkoutEndingReturnPending())return false;
    intro.hidden=true;
    host.hidden=true;
    ending.hidden=false;
    ending.classList.add('is-visible');
    setReportVisible(false);
    clearCheckoutEndingReturn();
    syncPublicOwnCopy(documentData).catch(error=>console.warn('Commerce ending restore failed',error));
    return true;
  }
  function rememberCommerceOrderToken(orderId,token){
    try{sessionStorage.setItem(`${COMMERCE_ORDER_TOKEN_PREFIX}${orderId}`,String(token||''));}catch(_){}
  }
  function commerceOrderToken(orderId){
    try{return String(sessionStorage.getItem(`${COMMERCE_ORDER_TOKEN_PREFIX}${orderId}`)||'');}catch(_){return '';}
  }
  function forgetCommerceOrderToken(orderId){try{sessionStorage.removeItem(`${COMMERCE_ORDER_TOKEN_PREFIX}${orderId}`);}catch(_){}}
  async function fetchCanonicalCommerce(doc=documentData){
    const workId=canonicalMasterWorkId(doc);
    if(!workId)return null;
    const response=await fetch(`${publicOwnCopyApiBase()}/commerce/work/${encodeURIComponent(workId)}`,{cache:'no-store'});
    const payload=await response.json().catch(()=>null);
    if(!response.ok||!payload?.ok)return null;
    return payload.commerce||null;
  }
  async function fetchCommerceOwnership(){
    const publicationId=currentWorkId();
    if(!publicationId)return null;
    const response=await fetch(`${publicOwnCopyApiBase()}/commerce/ownership`,{
      method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',
      body:JSON.stringify({publicationId,readerId:publicOwnCopyReaderId()})
    });
    const payload=await response.json().catch(()=>null);
    if(!response.ok||!payload?.ok)return null;
    return payload;
  }
  function showAlreadyPurchased(){
    if(!ownCopyButton)return;
    ownCopyButton.disabled=false;
    ownCopyButton.textContent='購入済み・本棚で読む';
    ownCopyButton.onclick=()=>{location.href=new URL('./bookshelf/',location.href).toString();};
    if(ownCopyStatus)ownCopyStatus.textContent='この作品は購入済みです。再購入はされません。';
  }
  async function syncPublicOwnCopy(doc){
    if(!ownCopyWrap||!ownCopyButton)return;
    const allowed=Boolean(currentWorkId())&&doc?.sharing?.ownCopy?.enabled===true;
    ownCopyWrap.hidden=!allowed;
    ownCopyButton.disabled=false;
    ownCopyButton.textContent='自分の一冊を受け取る';
    ownCopyButton.onclick=allowed?receivePublicOwnCopy:null;
    if(ownCopyStatus)ownCopyStatus.textContent='';
    if(!allowed)return;
    const gate=commerceGateMode(doc);
    if(gate==='free')return;
    ownCopyButton.disabled=true;
    ownCopyButton.textContent='購入状態を確認しています…';
    try{
      const ownership=await fetchCommerceOwnership();
      if(ownership?.owned){showAlreadyPurchased();return;}
      ownCopyButton.textContent='価格を確認しています…';
      const commerce=await fetchCanonicalCommerce(doc);
      if(!commerce||commerce.status!=='active'||!['purchase','support'].includes(String(commerce.mode||''))||!Number.isInteger(Number(commerce.amount))){
        throw new Error('販売価格を確認できませんでした。');
      }
      const amount=Number(commerce.amount);
      ownCopyButton.disabled=false;
      ownCopyButton.textContent=commerce.mode==='support'?`${formatJPY(amount)}で支援して受け取る`:`${formatJPY(amount)}で購入して受け取る`;
      ownCopyButton.onclick=()=>purchasePublicOwnCopy(commerce);
      if(ownCopyStatus)ownCopyStatus.textContent='決済後、この作品を自分の本棚に受け取れます。';
    }catch(error){
      console.warn('Commerce price lookup failed',error);
      ownCopyButton.disabled=false;
      ownCopyButton.textContent='購入して受け取る';
      ownCopyButton.onclick=()=>purchasePublicOwnCopy(null);
      if(ownCopyStatus)ownCopyStatus.textContent='価格は決済前に確認できます。';
    }
  }
  async function purchasePublicOwnCopy(){
    const publicationId=currentWorkId();if(!publicationId||!ownCopyButton)return;
    ownCopyButton.disabled=true;
    if(ownCopyStatus)ownCopyStatus.textContent='購入手続きを用意しています…';
    try{
      const orderResponse=await fetch(`${publicOwnCopyApiBase()}/commerce/order`,{
        method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',
        body:JSON.stringify({publicationId,readerId:publicOwnCopyReaderId()})
      });
      const orderPayload=await orderResponse.json().catch(()=>null);
      if(!orderResponse.ok||!orderPayload?.ok||!orderPayload?.order?.orderId||!orderPayload?.accessToken){
        if(String(orderPayload?.code||'')==='ALREADY_OWNED'){
          showAlreadyPurchased();
          return;
        }
        throw new Error(String(orderPayload?.error||'購入手続きを開始できませんでした。'));
      }
      const orderId=String(orderPayload.order.orderId);
      const accessToken=String(orderPayload.accessToken);
      rememberCommerceOrderToken(orderId,accessToken);
      const checkoutResponse=await fetch(`${publicOwnCopyApiBase()}/commerce/order/${encodeURIComponent(orderId)}/checkout`,{
        method:'POST',headers:{'Content-Type':'application/json','X-Order-Token':accessToken},cache:'no-store',
        body:JSON.stringify({returnUrl:cleanCommerceReturnUrl()})
      });
      const checkoutPayload=await checkoutResponse.json().catch(()=>null);
      if(!checkoutResponse.ok||!checkoutPayload?.ok||!checkoutPayload?.checkoutUrl){
        throw new Error(String(checkoutPayload?.error||'Stripe決済を開始できませんでした。'));
      }
      // Purchase exists only on the ending screen. Remember that exact UI state
      // before leaving for Stripe so browser Back/BFCache can never strand the
      // reader on the cover or a disabled pre-checkout snapshot.
      rememberCheckoutEndingReturn();
      location.href=String(checkoutPayload.checkoutUrl);
    }catch(error){
      console.error(error);
      const message=String(error?.message||error||'購入手続きを開始できませんでした。');
      // Keep the actual checkout error visible. Re-syncing here used to overwrite
      // it immediately with the normal price/status text, making failures look
      // like the button simply did nothing.
      ownCopyButton.disabled=false;
      if(ownCopyStatus)ownCopyStatus.textContent=message;
    }
  }
  async function finishPaidOwnCopy(orderId,accessToken,{continueReading=false}={}){
    const response=await fetch(`${publicOwnCopyApiBase()}/commerce/order/${encodeURIComponent(orderId)}/own-copy`,{
      method:'POST',headers:{'Content-Type':'application/json','X-Order-Token':accessToken},cache:'no-store',body:'{}'
    });
    const payload=await response.json().catch(()=>null);
    if(!response.ok||!payload?.ok)throw new Error(String(payload?.error||'購入した一冊を受け取れませんでした。'));
    const token=String(payload?.bookshelfClaim?.token||'');
    const claimUrl=publicBookshelfClaimUrl(token);
    if(!claimUrl)throw new Error('本棚への受取リンクを作れませんでした。');
    forgetCommerceOrderToken(orderId);
    if(continueReading){
      try{sessionStorage.setItem(`ahako:paid-claim:${currentWorkId()}`,token);}catch(_){}
      const accessSrc=`${publicOwnCopyApiBase()}/work/${encodeURIComponent(currentWorkId())}/access?reader_id=${encodeURIComponent(publicOwnCopyReaderId())}`;
      const next=new URL(cleanCommerceReturnUrl());next.searchParams.set('src',accessSrc);next.searchParams.set('paid_continue','1');
      location.replace(next.toString());return;
    }
    location.href=claimUrl;
  }
  async function handleCommerceReturn(){
    const payment=String(params.get('payment')||'');
    const orderId=String(params.get('order_id')||'');
    if(!payment||!/^order_[a-f0-9]{32}$/i.test(orderId))return false;
    const accessToken=commerceOrderToken(orderId);
    if(payment==='cancel'){
      if(ownCopyStatus)ownCopyStatus.textContent='購入はキャンセルされました。';
      history.replaceState(null,'',cleanCommerceReturnUrl());
      return true;
    }
    if(payment!=='success'||!/^[a-f0-9]{48}$/i.test(accessToken)){
      if(ownCopyStatus)ownCopyStatus.textContent='購入状態を確認できませんでした。';
      return true;
    }
    if(ownCopyWrap)ownCopyWrap.hidden=false;
    if(ownCopyButton){ownCopyButton.disabled=true;ownCopyButton.textContent='決済を確認しています…';}
    if(ownCopyStatus)ownCopyStatus.textContent='Stripeからの決済完了を確認しています…';
    for(let i=0;i<12;i++){
      const response=await fetch(`${publicOwnCopyApiBase()}/commerce/order/${encodeURIComponent(orderId)}`,{
        headers:{'X-Order-Token':accessToken},cache:'no-store'
      });
      const payload=await response.json().catch(()=>null);
      if(response.ok&&payload?.ok&&payload?.order?.status==='paid'){
        if(ownCopyStatus)ownCopyStatus.textContent='決済を確認しました。本棚に一冊を用意しています…';
        await finishPaidOwnCopy(orderId,accessToken,{continueReading:commercePreviewLocked(documentData)});
        return true;
      }
      await new Promise(resolve=>setTimeout(resolve,1000));
    }
    if(ownCopyButton){ownCopyButton.disabled=false;ownCopyButton.textContent='決済確認をもう一度試す';ownCopyButton.onclick=()=>handleCommerceReturn();}
    if(ownCopyStatus)ownCopyStatus.textContent='決済確認に少し時間がかかっています。もう一度お試しください。';
    return true;
  }
  async function receivePublicOwnCopy(){
    const workId=currentWorkId();if(!workId||!ownCopyButton)return;
    ownCopyButton.disabled=true;
    if(ownCopyStatus)ownCopyStatus.textContent='自分の一冊を用意しています…';
    try{
      const response=await fetch(`${publicOwnCopyApiBase()}/work/${encodeURIComponent(workId)}/own-copy`,{
        method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',
        body:JSON.stringify({readerId:publicOwnCopyReaderId()})
      });
      const payload=await response.json().catch(()=>null);
      if(!response.ok||!payload?.ok){
        const code=String(payload?.code||'');
        if(code==='OWN_COPY_NOT_ALLOWED')throw new Error('作者がこの作品の受け取りを停止しました。');
        if(code==='OWN_COPY_GATE_REQUIRED')throw new Error('この作品の受け取りには購入または支援が必要です。');
        if(code==='WORK_NOT_PUBLIC')throw new Error('この作品は現在公開されていません。');
        throw new Error(String(payload?.error||'自分の一冊を受け取れませんでした。'));
      }
      const token=String(payload?.bookshelfClaim?.token||'');
      const external=needsExternalSafariHandoff();
      if(external){
        const handoffId=newBookshelfHandoffId();
        rememberBookshelfClaimSource(handoffId,token);
        const claimUrl=publicBookshelfClaimUrl(token,{handoffId,external:true});
        if(!claimUrl)throw new Error('本棚への受取リンクを作れませんでした。');
        ownCopyButton.disabled=false;
        ownCopyButton.textContent='Safariで本棚を開く';
        if(ownCopyStatus)ownCopyStatus.textContent='一冊を用意しました。Safariの本棚で受け取れます。';
        ownCopyButton.onclick=()=>{try{const target=new URL(claimUrl);location.href=`x-safari-https://${target.host}${target.pathname}${target.search}${target.hash}`;}catch(error){console.error(error);}};
        return;
      }
      const claimUrl=publicBookshelfClaimUrl(token);
      if(!claimUrl)throw new Error('本棚への受取リンクを作れませんでした。');
      if(ownCopyStatus)ownCopyStatus.textContent='本棚へ入れています…';
      location.href=claimUrl;
    }catch(error){
      console.error(error);
      ownCopyButton.disabled=false;
      ownCopyButton.textContent='もう一度試す';
      if(ownCopyStatus)ownCopyStatus.textContent=String(error?.message||error);
    }
  }

  function bindReportControls(){
    if(!reportButton||!reportDialog)return;
    const reason=()=>reportDialog.querySelector('input[name="reportReason"]:checked')?.value||'other';
    const rightsClaim=()=>reason()==='copyright'||reason()==='unauthorized';
    const updateRequirements=()=>{
      const required=rightsClaim();
      if(reportEvidenceRequired)reportEvidenceRequired.hidden=!required;
      if(reportContactRequired)reportContactRequired.hidden=!required;
      if(reportEvidenceUrl)reportEvidenceUrl.required=required;
      if(reportContact)reportContact.required=required;
      if(reportContactHint)reportContactHint.textContent=required
        ? '権利関係の確認が必要な場合に運営から連絡します。'
        : '「その他」の報告では任意です。';
    };
    const sync=()=>{
      const id=currentWorkId()||'不明';
      if(reportWorkId)reportWorkId.textContent=id;
      if(reportUrl)reportUrl.textContent=location.href;
      if(reportStatus)reportStatus.textContent='根拠を確認できる情報と一緒に運営へ送信します。';
      if(reportCopy){reportCopy.disabled=false;reportCopy.textContent='運営に申立てを送る';}
      updateRequirements();
    };
    reportDialog.querySelectorAll('input[name="reportReason"]').forEach(el=>el.addEventListener('change',updateRequirements));
    reportButton.addEventListener('click',()=>{sync();reportDialog.showModal();});

    // v0.3.61 — iOS Safari: the close control must never participate in
    // form validation, and the terminating touch must not fall through to
    // a field underneath the dialog after it closes.
    const reportClose=document.getElementById('publicReportClose');
    const closeReportDialog=(event)=>{
      if(event){
        event.preventDefault();
        event.stopPropagation();
        if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      }
      const active=document.activeElement;
      if(active&&typeof active.blur==='function')active.blur();
      if(reportDialog.open)reportDialog.close('cancel');
    };
    if(reportClose){
      reportClose.addEventListener('pointerdown',(event)=>{
        event.preventDefault();
        event.stopPropagation();
      });
      reportClose.addEventListener('touchstart',(event)=>{
        event.preventDefault();
        event.stopPropagation();
      },{passive:false});
      reportClose.addEventListener('touchend',closeReportDialog,{passive:false});
      reportClose.addEventListener('click',closeReportDialog);
    }

    reportCopy?.addEventListener('click',async()=>{
      const workId=currentWorkId();
      const claimReason=reason();
      const subject=reportSubject?.value||'other';
      const evidenceUrl=(reportEvidenceUrl?.value||'').trim();
      const details=(reportDetails?.value||'').trim();
      const contact=(reportContact?.value||'').trim();
      const required=rightsClaim();
      if(!workId){if(reportStatus)reportStatus.textContent='公開作品IDを取得できませんでした。';return;}
      if(!details){if(reportStatus)reportStatus.textContent='詳しい内容を入力してください。';reportDetails?.focus();return;}
      if(required&&!evidenceUrl){if(reportStatus)reportStatus.textContent='元作品・権利を確認できるURLを入力してください。';reportEvidenceUrl?.focus();return;}
      if(evidenceUrl){try{const u=new URL(evidenceUrl);if(!/^https?:$/.test(u.protocol))throw new Error();}catch{if(reportStatus)reportStatus.textContent='元作品URLを http(s):// から入力してください。';reportEvidenceUrl?.focus();return;}}
      if(required&&!contact){if(reportStatus)reportStatus.textContent='連絡先メールを入力してください。';reportContact?.focus();return;}
      if(contact&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)){if(reportStatus)reportStatus.textContent='連絡先メールの形式を確認してください。';reportContact?.focus();return;}
      if(!reportConfirm?.checked){if(reportStatus)reportStatus.textContent='報告内容が正確であることを確認してください。';reportConfirm?.focus();return;}
      const originalText=reportCopy.textContent;
      reportCopy.disabled=true;reportCopy.textContent='送信中…';
      if(reportStatus)reportStatus.textContent='運営へ申立てを送信しています。';
      try{
        const srcUrl=new URL(source(),location.href);
        const apiBase=srcUrl.pathname.includes('/work/')?srcUrl.origin:'https://scene-studio-api.a-hako.workers.dev';
        const response=await fetch(`${apiBase}/report`,{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({workId,reason:claimReason,subject,evidenceUrl,details,contact,confirmed:true,url:location.href,sourceUrl:srcUrl.toString()})
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!data.ok)throw new Error(data.error||`HTTP ${response.status}`);
        if(reportStatus)reportStatus.textContent='申立てを受け付けました。運営が内容を確認します。';
        reportCopy.textContent='送信済み';
      }catch(error){
        console.warn('Report submission failed',error);
        if(reportStatus)reportStatus.textContent='送信できませんでした。入力内容を確認してもう一度お試しください。';
        reportCopy.disabled=false;reportCopy.textContent=originalText;
      }
    });
  }

  async function fetchScene() {
    setShelfReturnReading(false);
    errorPanel.hidden = true;
    const src = source();
    const response = await fetch(src, { cache: 'no-store' });
    if (!response.ok) {
      const error = new Error(`Scene JSONを取得できませんでした (${response.status})\n${src}`);
      error.status = response.status;
      error.source = src;
      throw error;
    }

    const doc = hydratePublicAudio(await response.json());
    ScenePlayerCore.validate(doc);
    documentData = doc;
    if(commercePreviewLocked(doc)&&!params.get('payment')){
      try{
        const ownership=await fetchCommerceOwnership();
        if(ownership?.owned){
          const accessSrc=`${publicOwnCopyApiBase()}/work/${encodeURIComponent(currentWorkId())}/access?reader_id=${encodeURIComponent(publicOwnCopyReaderId())}`;
          const next=new URL(location.href);next.searchParams.set('src',accessSrc);next.searchParams.set('paid_continue','1');
          location.replace(next.toString());return;
        }
      }catch(error){console.warn('Paid access probe failed',error);}
    }
    applyDocumentMeta(doc);
    if(!analyticsViewSent && currentWorkId()){
      analyticsViewSent=true;
      sendAnalytics('view');
    }

    intro.hidden = false;
    host.hidden = true;
    ending.hidden = true;
    setReportVisible(false);
    if(params.get('payment')){
      clearCheckoutEndingReturn();
      ending.hidden=false;
      intro.hidden=true;
      ending.classList.add('is-visible');
      handleCommerceReturn().catch(error=>{
        console.error(error);
        if(ownCopyStatus)ownCopyStatus.textContent=String(error?.message||error);
      });
    }else if(checkoutEndingReturnPending()){
      // A browser-level Back navigation may restore any older Ahako history entry
      // (cover, player, or ending). Checkout was launched only from ending, so
      // normalize every such return to ending instead of trusting browser history.
      forceCheckoutReturnToEnding();
    }else if(params.get('paid_continue')==='1'){
      history.replaceState(null,'',(()=>{const u=new URL(location.href);u.searchParams.delete('paid_continue');return u.toString();})());
      ensurePlayer(Math.max(0,safeProgress()));
    }
  }

  function bindPublicControls() {
    if (!player || shellBound) return;
    shellBound = true;

    const left = player.els?.prev;
    const right = player.els?.restart;

    if (left) {
      left.hidden = false;
      left.disabled = false;
      left.textContent = '‹';
      left.setAttribute('aria-label', '表紙に戻る');
      left.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Public Player: the left header control is always an exit to the cover.
        // Past Scenes remain available only through the author's navigation setting
        // and the downward swipe gesture.
        returnToCover();
      }, true);
    }

    if (right) {
      right.textContent = '♪';
      right.setAttribute('aria-label', '音声をオン・オフ');
      right.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        muted = player.toggleMuted();
        right.classList.toggle('is-muted', muted);
        right.setAttribute('aria-pressed', muted ? 'false' : 'true');
      }, true);
    }

    host.addEventListener('sceneplayer:scenechange', onSceneChange);
    host.addEventListener('sceneplayer:advanceintent', onAdvanceIntent);
    host.addEventListener('sceneplayer:end', onEnd);
    host.addEventListener('sceneplayer:autochange', onResonanceAutoChange);
    host.addEventListener('sceneplayer:historyopen', invalidateResonance);
  }

  function onSceneChange(e) {
    const index = Number(e.detail?.index);
    if (Number.isInteger(index) && index > 0) {
      localStorage.setItem(storageKey(), String(index));
    }
    if(e.detail?.direction==='next'){
      analyticsSceneAdvances += 1;
      sendAnalytics('progress',{index});
      if(player?.auto)invalidateResonance();
    }

    // Core disables Previous on Scene 1 / when author history is disabled.
    // In Public Player this control is not Previous: it is the always-available cover exit.
    if (player?.els?.prev) {
      player.els.prev.hidden = false;
      player.els.prev.disabled = false;
    }
  }

  function onAdvanceIntent(e){
    if(player?.auto){invalidateResonance();return;}
    const index=Number(e.detail?.index);
    if(Number.isInteger(index)&&index>=0)recordResonanceBoundary(index,e.detail?.at);
  }

  function onEnd() {
    setShelfReturnReading(false);
    if(!commercePreviewLocked(documentData))localStorage.removeItem(storageKey());
    if(resonanceSession?.valid){
      if(player?.auto)invalidateResonance();
      else if(resonanceSession.samples.length===(documentData?.scenes?.length||1)-1)recordResonanceBoundary((documentData?.scenes?.length||1)-1);
    }
    renderResonanceResult(resonanceScore());
    if(commercePreviewLocked(documentData)&&ownCopyStatus)ownCopyStatus.textContent='試し読みはここまでです。購入すると、この続きから読めます。';
    if(!analyticsCompleted){
      analyticsCompleted=true;
      sendAnalytics('complete',{index:Array.isArray(documentData?.scenes)?documentData.scenes.length-1:0});
    }

    // Keep player/audio alive underneath the ending screen.
    // This preserves BGM/Ambient as the work's afterglow unless the Scene itself
    // explicitly issued a stop command.
    ending.classList.remove('is-visible');
    ending.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => ending.classList.add('is-visible'));
    });
  }

  function onResonanceAutoChange(e){if(e.detail?.auto)invalidateResonance();}

  function removeShellListeners() {
    host.removeEventListener('sceneplayer:scenechange', onSceneChange);
    host.removeEventListener('sceneplayer:advanceintent', onAdvanceIntent);
    host.removeEventListener('sceneplayer:end', onEnd);
    host.removeEventListener('sceneplayer:autochange', onResonanceAutoChange);
    host.removeEventListener('sceneplayer:historyopen', invalidateResonance);
  }

  const PUBLIC_EXIT_FADE_MS = 850;

  function fadePublicAudio(duration = PUBLIC_EXIT_FADE_MS) {
    if (!player || typeof player.fadeOutAudio !== 'function') return 0;
    try { return player.fadeOutAudio(duration); } catch (_) { return 0; }
  }

  function destroyAfterFade(targetPlayer, duration = PUBLIC_EXIT_FADE_MS) {
    if (!targetPlayer) return;
    window.setTimeout(() => {
      try {
        // The old and new Player instances can share #scenePlayer.
        // Clean up the old instance without clearing the host used by the new one.
        targetPlayer.destroy({ preserveHost: true });
      } catch (_) {}
    }, Math.max(0, duration) + 80);
  }

  function destroyPlayer({ stopAudio = true } = {}) {
    if (!player) return;
    removeShellListeners();

    if (stopAudio) {
      try { player.destroy(); } catch (_) {}
    }
    player = null;
    shellBound = false;
  }

  function stopForExit() {
    if (player) {
      const exitingPlayer = player;
      fadePublicAudio();
      player = null;
      shellBound = false;
      destroyAfterFade(exitingPlayer);
    }
  }

  function returnToCover() {
    if (player) {
      const exitingPlayer = player;
      fadePublicAudio();
      removeShellListeners();
      player = null;
      shellBound = false;
      destroyAfterFade(exitingPlayer);
    }

    ending.classList.remove('is-visible');
    ending.hidden = true;
    showIntro();
  }

  function closeToSource() {
    const ret = returnConfig(documentData || {});
    stopForExit();

    if (ret.url) {
      location.href = ret.url;
      return;
    }

    if (history.length > 1) {
      history.back();
      return;
    }

    // Direct-open fallback: return to the lightweight intro instead of trapping the reader.
    showIntro();
  }

  async function ensurePlayer(startAt = 0) {
    setShelfReturnReading(true);
    if (player) {
      const previousPlayer = player;
      removeShellListeners();
      try { previousPlayer.fadeOutAudio(PUBLIC_EXIT_FADE_MS); } catch (_) {}
      destroyAfterFade(previousPlayer);
      player = null;
    }

    shellBound = false;
    muted = false;

    ending.hidden = true;
    ending.classList.remove('is-visible');
    ending.classList.remove('has-resonance');
    resetResonanceSession(startAt);

    /*
      Public Player owns the visible cover, but Core also has its own cover.
      Previously we did:
        openingBreath() -> Core.load() -> unlockAudio()
      That had two side effects:
      1) Core stayed in its internal cover state, so authored episode text leaked
         into the reading surface as a large "第9話" at the upper-left.
      2) The first Scene audio was never actually entered. On iPhone the later
         unlock also happened after ~690ms of awaits, outside the trusted START
         gesture. Scene 1 therefore became audible only after History restored it.

      Build/load/begin Core synchronously, before the first await. This lets
      Scene 1 audio receive the actual START/CONTINUE gesture and removes Core's
      internal cover immediately. Keep the reading surface visually hidden while
      the public opening breath plays, then replay presentation only.
    */
    host.hidden = false;
    setReportVisible(true);
    host.style.visibility = 'hidden';
    host.style.pointerEvents = 'none';

    player = new ScenePlayerCore(host, {
      allowPrevious: true,
      endOnNextAction: true
    });

    bindPublicControls();

    player.load(documentData, { startAt });
    const ep=String(documentData?.metadata?.episode||documentData?.episode||'').trim();
    const epTitle=String(documentData?.metadata?.episodeTitle||documentData?.episodeTitle||'').trim();
    if(player.els?.title)player.els.title.textContent=[ep,epTitle].filter(Boolean).join(' ・ ') || documentData.title || '';
    if(player.els?.author)player.els.author.textContent=documentData.author||'';

    // Critical: no await before this call.
    // begin() unlocks audio and enters Scene 1/continue Scene from the same
    // trusted user gesture that pressed START / CONTINUE.
    player.begin();

    await openingBreath();

    // The Scene's audio has already started from the trusted gesture. Reveal the
    // Player now and replay only its visual presentation so the entrance effect
    // is not consumed while the host was invisible.
    if (player) {
      // Reset presentation while the Core is still hidden. Revealing first
      // exposed one frame of the background motion that had progressed during
      // openingBreath(), then refreshCurrent snapped it back to its start.
      player.refreshCurrent({ preserveAudio: true });
      if(player.els?.title)player.els.title.textContent=[ep,epTitle].filter(Boolean).join(' ・ ') || documentData.title || '';
      if(player.els?.author)player.els.author.textContent=documentData.author||'';
    }
    // Resonance measures readable time. The public opening breath is not
    // operable by the reader, so Scene 1 starts when the reading surface is
    // actually revealed rather than ~690ms earlier at audio unlock.
    beginResonanceClock(performance.now());
    host.style.visibility = '';
    host.style.pointerEvents = '';
    // V128 — Public Player has an outer cover/opening shell. Core focuses the
    // stage during begin(), but openingBreath() keeps the Player hidden and the
    // START button can retain focus. Re-focus once the readable surface is
    // actually revealed so Enter advances Scene 1 immediately, matching Studio.
    requestAnimationFrame(() => player?.els?.stage?.focus?.({ preventScroll: true }));
  }


  function showIntro() {
    setShelfReturnReading(false);
    ending.classList.remove('is-visible');
    ending.hidden = true;

    if (player) {
      const introPlayer = player;
      fadePublicAudio();
      player = null;
      shellBound = false;
      destroyAfterFade(introPlayer);
    }

    opening.hidden = true;
    opening.classList.remove('is-visible');
    host.hidden = true;
    intro.hidden = false;
    setReportVisible(false);
    applyDocumentMeta(documentData);
  }

  startButton.addEventListener('click', () => {
    localStorage.removeItem(storageKey());
    ensurePlayer(0);
  });

  continueButton.addEventListener('click', () => {
    ensurePlayer(safeProgress());
  });

  endingCoverButton?.addEventListener('click', () => {
    returnToCover();
  });

  restartButton?.addEventListener('click', () => {
    localStorage.removeItem(storageKey());
    ending.classList.remove('is-visible');
    ending.hidden = true;
    ensurePlayer(0);
  });

  retryButton.addEventListener('click', () => fetchScene().catch(showError));

  // Best-effort graceful audio exit when the browser/app closes or replaces
  // the page. A browser may terminate the document immediately, so a full
  // fade cannot be guaranteed on a hard tab/app close.
  window.addEventListener('pagehide', () => {
    fadePublicAudio(PUBLIC_EXIT_FADE_MS);
  });

  // V157: Checkout can only start from the ending screen. Browser Back is not
  // guaranteed to return to the same history entry (Safari/Chrome BFCache may
  // revive cover/player snapshots), so normalize any pending checkout return to
  // the ending screen first, then re-read canonical ownership/price.
  window.addEventListener('pageshow', () => {
    const payment=String(new URL(location.href).searchParams.get('payment')||'');
    if(payment||!documentData)return;
    if(forceCheckoutReturnToEnding())return;
    if(!ownCopyWrap||ownCopyWrap.hidden)return;
    syncPublicOwnCopy(documentData).catch((error) => {
      console.warn('Commerce state restore failed', error);
      if (ownCopyButton) ownCopyButton.disabled = false;
    });
  });


  window.ScenePublicPlayer = {
    version: '0.3.29-public-own-copy',
    get player(){ return player; },
    get document(){ return documentData; },
    get source(){ return source(); },
    reload(){ return fetchScene(); },
    start(index = 0){ return ensurePlayer(index); },
    close(){ return closeToSource(); }
  };

  fetchScene().catch(showError);
  bindReportControls();
})();
