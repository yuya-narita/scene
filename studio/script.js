(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const editorScreen = $('#editorScreen');
  const advancedScreen = $('#advancedScreen');
  const playerScreen = $('#playerScreen');
  const titleInput = $('#titleInput');
  const authorInput = $('#authorInput');
  const subtitleInput = $('#subtitleInput');
  const languageInput = $('#languageInput');
  const seriesTitleInput = $('#seriesTitleInput');
  const episodeInput = $('#episodeInput');
  const coverImageInput = $('#coverImageInput');
  const coverPreview = $('#coverPreview');
  const coverImageClear = $('#coverImageClear');
  const coverFitInput = $('#coverFitInput');
  const coverPositionInput = $('#coverPositionInput');
  let coverImageUrl = '';
  let coverImageFileName = '';
  const bodyInput = $('#bodyInput');
  const charCount = $('#charCount');
  const densitySelect = $('#densitySelect');
  const playerHost = $('#scenePlayer');

  const I18N = window.SceneStudioI18n;
  const t = (key, vars={}) => I18N?.t(key, vars) ?? key;
  let uiLanguage = I18N?.getLocale?.() || 'ja';

  const UI_BINDINGS = [
    ['.intro h2','intro.title'],['.intro p','intro.body'],
    ['label.field:nth-of-type(1) .field-label','field.title'],['#titleInput','field.title.ph','placeholder'],
    ['label.field:nth-of-type(2) .field-label','field.author'],['#authorInput','field.author.ph','placeholder'],
    ['.body-field .field-label','field.body'],['#bodyInput','field.body.ph','placeholder'],['#sampleButton','body.sample'],
    ['.theme-section .section-heading span','theme.heading'],['.theme-section .section-heading small','theme.note'],
    ['.theme-card[data-theme="light"] small','theme.light'],['.theme-card[data-theme="dark"] small','theme.dark'],['.theme-card[data-theme="cinema"] small','theme.cinema'],
    ['.work-font-section .section-heading span','font.heading'],['.work-font-section .section-heading small','font.note'],
    ['.work-font-card[data-font="serif"] strong','font.serif'],['.work-font-card[data-font="serif"] small','font.serif.note'],
    ['.work-font-card[data-font="sans"] strong','font.sans'],['.work-font-card[data-font="sans"] small','font.sans.note'],
    ['.work-font-card[data-font="mono"] strong','font.mono'],['.work-font-card[data-font="mono"] small','font.mono.note'],
    ['.split-options summary','split.summary'],['.split-panel label span','split.guide'],['.split-panel p','split.note'],
    ['#densitySelect option[value="short"]','density.short'],['#densitySelect option[value="normal"]','density.normal'],['#densitySelect option[value="long"]','density.long'],
    ['.cinema-background-copy strong','cinema.bg'],['.cinema-background-copy span','cinema.bg.note'],
    ['.cinema-tone-button[data-tone="dark"]','cinema.dark'],['.cinema-tone-button[data-tone="light"]','cinema.light'],
    ['.cinema-background-button','cinema.choose'],['#cinemaBackgroundClear','cinema.remove'],
    ['#makeButton span','make'],['#makeButton small','make.note'],['#advancedButton','advanced.open'],['#easyAdvancedReturnButton span','advanced.open'],['#projectIoTitle','io.heading'],['#exportSceneButton strong','io.export'],['label[for="importSceneInput"] strong','io.import'],['.footer-note','footer.note'],
    ['.advanced-topbar h1','advanced.title'],
    ['.advanced-policy strong','nav.previous.policy'],['.advanced-policy small','nav.previous.note'],
    ['#sceneTextInput','scene.text','aria-label'],['.scene-inspector > .adv-field:nth-of-type(1) > span','scene.text'],
    ['.subtext-field > span','scene.subtext'],['#sceneSubTextInput','scene.subtext.ph','placeholder'],
    ['#sceneTypeSelect','scene.type','aria-label'],['#sceneTypeSelect option[value="text"]','scene.type.text'],['#sceneTypeSelect option[value="dialogue"]','scene.type.dialogue'],['#sceneTypeSelect option[value="sound"]','scene.type.sound'],
    ['#sceneDisplaySelect option[value="stack"]','scene.display.stack'],['#sceneDisplaySelect option[value="solo"]','scene.display.solo'],
    ['#sceneEffectSelect option[value="auto"]','effect.auto'],['#sceneEffectSelect option[value="fade"]','effect.fade'],['#sceneEffectSelect option[value="pop"]','effect.pop'],['#sceneEffectSelect option[value="blur"]','effect.blur'],
    ['#sceneEffectSelect option[value="whisper"]','effect.whisper'],['#sceneEffectSelect option[value="loud"]','effect.loud'],['#sceneEffectSelect option[value="pulse"]','effect.pulse'],['#sceneEffectSelect option[value="shake"]','effect.shake'],['#sceneEffectSelect option[value="tilt"]','effect.tilt'],['#sceneEffectSelect option[value="slow"]','effect.slow'],['#sceneEffectSelect option[value="none"]','effect.none'],
    ['#sceneSizeSelect option[value="auto"]','size.auto'],['#sceneSizeSelect option[value="small"]','size.small'],['#sceneSizeSelect option[value="normal"]','size.normal'],['#sceneSizeSelect option[value="large"]','size.large'],['#sceneSizeSelect option[value="xl"]','size.xl'],
    ['#sceneFontSelect option[value="inherit"]','font.inherit'],['#sceneFontSelect option[value="serif"]','font.serif'],['#sceneFontSelect option[value="sans"]','font.sans'],['#sceneFontSelect option[value="mono"]','font.mono'],
    ['#sceneLanguageSelect option[value="auto"]','scene.language.auto'],['#sceneLanguageSelect option[value="ja"]','scene.language.ja'],['#sceneLanguageSelect option[value="en"]','scene.language.en'],['#sceneLanguageSelect option[value="custom"]','scene.language.custom'],
    ['#mergePreviousButton','edit.merge'],['#splitSceneButton','edit.split'],['#deleteSceneButton','edit.delete'],
    ['.adv-section:nth-of-type(1) summary','section.background'],['#sceneBackgroundMode option[value="inherit"]','background.inherit'],['#sceneBackgroundMode option[value="image"]','background.image'],['#sceneBackgroundMode option[value="clear"]','background.clear'],
    ['label[for="sceneBackgroundInput"]','background.choose'],['#sceneBackgroundRemoveFile','background.unselect'],['#sceneBackgroundUrlApply','asset.applyUrl'],
    ['#sceneBackgroundTransition option[value="fade"]','transition.fade'],['#sceneBackgroundTransition option[value="cut"]','transition.cut'],['#sceneBackgroundTransition option[value="flash"]','transition.flash'],['#sceneBackgroundTransition option[value="glitch"]','transition.glitch'],
    ['#sceneBackgroundFit option[value="cover"]','fit.cover'],['#sceneBackgroundFit option[value="contain"]','fit.contain'],
    ['#sceneBackgroundMotion option[value="none"]','motion.none'],['#sceneBackgroundMotion option[value="slowZoom"]','motion.slowZoom'],['#sceneBackgroundMotion option[value="breath"]','motion.breath'],['#sceneBackgroundMotion option[value="panLeft"]','motion.panLeft'],['#sceneBackgroundMotion option[value="panRight"]','motion.panRight'],['#sceneBackgroundMotion option[value="panUp"]','motion.panUp'],['#sceneBackgroundMotion option[value="panDown"]','motion.panDown'],
    ['.adv-section:nth-of-type(2) summary','section.audio'],
    ['label[for="sceneBgmInput"]','audio.chooseBgm'],['label[for="sceneAmbientInput"]','audio.chooseAmbient'],['label[for="sceneSeInput"]','audio.chooseSe'],['#sceneBgmUrlApply','asset.applyUrl'],['#sceneAmbientUrlApply','asset.applyUrl'],['#sceneSeUrlApply','asset.applyUrl'],
    ['#sceneBgmLoop + span','audio.loop'],['#sceneAmbientLoop + span','audio.loop'],['#sceneSeEnabled + span','audio.seEnable'],
    ['.audio-card:nth-child(1) .audio-card-title small','audio.bgm.note'],['.audio-card:nth-child(2) .audio-card-title small','audio.ambient.note'],['.audio-card:nth-child(3) .audio-card-title small','audio.se.note'],
    ['.advanced-hint','audio.hint'],['#editReturnButton','preview.return'],
    ['label.easy-file-open span','file.open'],['#exportPackageButton span','file.export'],['#draftManageButton span','draft.manager'],['#newDraftQuickButton span','draft.new'],['#newDraftQuickButton small','draft.new.note'],
    ['.work-meta-section > summary','work.info'],['label[for="subtitleInput"] .field-label','work.subtitle'],['label[for="languageInput"] .field-label','work.language'],['label[for="seriesTitleInput"] .field-label','work.series'],['label[for="episodeInput"] .field-label','work.episode'],['.easy-cover-simple .section-heading > span','work.cover'],['.easy-cover-simple .section-heading > small','work.cover.note'],['label[for="coverImageInput"]','work.cover.choose'],['#coverImageClear','work.cover.remove'],['.cover-preview-empty small','work.cover.empty'],['.easy-cover-actions p','work.cover.saveNote'],['.project-io-details summary','work.developer'],
    ['#advancedPreviewButton','common.preview'],['#advancedExportButton','file.export'],['.auto-timing-head strong','auto.heading'],['#sceneAutoTimingReset','auto.reset'],['.auto-timing-controls label span','auto.second'],['.auto-timing-editor > p','auto.hint'],
    ['#sceneColorSelect','text.color','aria-label'],['#sceneShadowSelect','text.shadow','aria-label'],['#sceneColorSelect option[value="auto"]','effect.auto'],['#sceneColorSelect option[value="white"]','color.white'],['#sceneColorSelect option[value="black"]','color.black'],['#sceneColorSelect option[value="custom"]','color.custom'],['#sceneShadowSelect option[value="auto"]','effect.auto'],['#sceneShadowSelect option[value="none"]','shadow.none'],['#sceneShadowSelect option[value="soft"]','shadow.soft'],['#sceneShadowSelect option[value="strong"]','shadow.strong'],
    ['.scene-motion-preview-field > span','background.preview'],['#publishFromPreviewButton','publish.action'],['#publishDialogClose','unpublish.cancel','aria-label'],['#deleteSceneDialog h2','delete.scene.title'],['#deleteSceneDialogText','delete.scene.text'],['#deleteSceneCancel','delete.scene.cancel'],['#deleteSceneConfirm','delete.scene.confirm'],['#unpublishDialog h2','unpublish.title'],['#unpublishDialogText','unpublish.text'],['#unpublishCancel','unpublish.cancel'],['#unpublishConfirm','unpublish.confirm'],['#draftManagerDialog h2','draft.title'],['#draftManagerClose','unpublish.cancel','aria-label'],['#newDraftButton','draft.new'],
    ['#autoRecCancel','rec.cancel'],['#autoRecDone strong','rec.done'],['#autoRecRetry','rec.retry'],
    ['#undoButton','undo.action'],['#undoCompactButton','undo.action','aria-label'],
    ['#sceneColorCustomField > span','color.custom']
  ];

  function applyStaticUITranslations(){
    document.documentElement.lang = uiLanguage;
    UI_BINDINGS.forEach(([selector,key,attr])=>{
      const el=document.querySelector(selector); if(!el)return;
      if(attr) el.setAttribute(attr,t(key)); else el.textContent=t(key);
    });

    // Easy metadata uses nested labels/smalls, so translate without destroying structure.
    const metaSummary=$('.work-meta-section > summary');
    if(metaSummary){
      metaSummary.textContent=t('work.info');
      metaSummary.dataset.optionalLabel=t('common.optional');
    }
    const metaFields=[
      [subtitleInput,'work.subtitle','common.optional','work.subtitle.ph'],
      [languageInput,'work.language',null,null],
      [seriesTitleInput,'work.series','common.optional','work.series.ph'],
      [episodeInput,'work.episode','common.optional.free','work.episode.ph']
    ];
    metaFields.forEach(([input,labelKey,smallKey,phKey])=>{
      const label=input?.closest('.field');
      const head=label?.querySelector('.field-label');
      if(head){
        head.textContent=t(labelKey);
        if(smallKey){const small=document.createElement('small');small.textContent=' '+t(smallKey);head.appendChild(small);}
      }
      if(phKey && input)input.placeholder=t(phKey);
    });
    if(languageInput){
      const langMap={auto:'work.language.auto',ja:'work.language.ja',en:'work.language.en',mul:'work.language.mul'};
      [...languageInput.options].forEach(o=>{if(langMap[o.value])o.textContent=t(langMap[o.value]);});
    }
    const coverHead=$('.easy-cover-simple .section-heading');
    if(coverHead){
      const main=coverHead.querySelector(':scope > span');
      const note=coverHead.querySelector(':scope > small');
      if(main){main.textContent=t('work.cover');const opt=document.createElement('small');opt.textContent=' '+t('common.optional');main.appendChild(opt);}
      if(note)note.textContent=t('work.cover.note');
    }
    const coverSaveNote=$('.easy-cover-actions p'); if(coverSaveNote)coverSaveNote.textContent=t('work.cover.saveNote');
    const draftFoot=$('.draft-manager-foot > small'); if(draftFoot)draftFoot.textContent=t('draft.footer');
    $$('.adv-section').forEach(section=>{section.dataset.openLabel=t('common.open');section.dataset.closeLabel=t('common.close');});
    const bgPreviewOverlay=$('#sceneBackgroundPreview'); if(bgPreviewOverlay)bgPreviewOverlay.dataset.overlayLabel=t('background.changeOverlay');

    // Labels that repeat and are safer to bind by semantic parent.
    document.querySelectorAll('.adv-grid > .adv-field').forEach(label=>{
      const sel=label.querySelector('select');
      const head=label.querySelector(':scope > span');
      if(!sel||!head)return;
      if(sel.id==='sceneTypeSelect')head.textContent=t('scene.type');
      if(sel.id==='sceneDisplaySelect')head.textContent=t('scene.display');
      if(sel.id==='sceneEffectSelect')head.textContent=t('scene.effect');
      if(sel.id==='sceneSizeSelect')head.textContent=t('scene.size');
      if(sel.id==='sceneFontSelect')head.textContent=t('scene.font');
      if(sel.id==='sceneLanguageSelect')head.textContent=t('scene.language');
      if(sel.id==='sceneBackgroundTransition')head.textContent=t('background.transition');
      if(sel.id==='sceneBackgroundFit')head.textContent=t('background.fit');
      if(sel.id==='sceneBackgroundMotion')head.textContent=t('background.motion');
    });
    const bgModeLabel=$('#sceneBackgroundMode')?.closest('.adv-field')?.querySelector(':scope > span');
    if(bgModeLabel) bgModeLabel.textContent=t('background.mode');

    ['Bgm','Ambient'].forEach(prefix=>{
      const action=$(`#scene${prefix}Action`);
      const label=action?.closest('.adv-field')?.querySelector(':scope > span');
      if(label)label.textContent=t('audio.operation');
      if(action){
        const map={inherit:'audio.inherit',start:'audio.start',volume:'audio.volumeChange',stop:'audio.stop'};
        [...action.options].forEach(o=>{ if(map[o.value])o.textContent=t(map[o.value]); });
      }
    });

    document.querySelectorAll('[id$="Volume"],[id$="VolumeChange"]').forEach(input=>{
      const head=input.closest('.adv-field')?.querySelector(':scope > span');
      if(head && head.firstChild) head.firstChild.textContent=t('audio.volume')+' ';
    });

    const tabKeys={all:'draft.all',draft:'draft.inProgress',published:'draft.publishedTab'};
    Object.entries(tabKeys).forEach(([filter,key])=>{const b=$(`.draft-manager-tab[data-draft-filter="${filter}"]`);if(b&&b.firstChild)b.firstChild.textContent=t(key)+' ';});
    const publishStatic=[
      ['#publishStateWorking h2','publish.working'],
      ['#publishStateWorking p','publish.workingText'],
      ['#publishStateSuccess h2','publish.success'],
      ['#publishShareButton','publish.share'],
      ['#publishCopyButton','publish.copy'],
      ['#publishStateSuccess .publish-mock-note','publish.mockNote'],
      ['#publishStateError h2','publish.failed'],
      ['#publishStateError p','publish.failedText'],
      ['#publishRetryButton','publish.retry']
    ];
    publishStatic.forEach(([sel,key])=>{const e=$(sel);if(e)e.textContent=t(key);});
    syncPublishCopyForStatus?.();
    const semanticLabels={sceneColorSelect:'text.color',sceneShadowSelect:'text.shadow'};
    Object.entries(semanticLabels).forEach(([id,key])=>{const h=$('#'+id)?.closest('.adv-field')?.querySelector(':scope > span');if(h)h.textContent=t(key);});
    const previewHead=$('.scene-motion-preview-field > span'); if(previewHead) previewHead.innerHTML=`${t('background.preview')} <small>${t('background.preview.note')}</small>`;
    const rangeLabels={sceneBackgroundDim:'background.dim',sceneBackgroundTransitionDuration:'background.transitionSpeed',sceneBackgroundMotionDuration:'background.motionSpeed',sceneBackgroundMotionAmount:'background.motionAmount'};
    Object.entries(rangeLabels).forEach(([id,key])=>{const h=$('#'+id)?.closest('.adv-field')?.querySelector(':scope > span');if(h&&h.firstChild)h.firstChild.textContent=t(key)+' ';});
    const autoState=$('#sceneAutoTimingState'); if(autoState) updateAutoTimingFields?.();
    const customColorLabel=$('#sceneColorCustomField > span');
    if(customColorLabel)customColorLabel.textContent=t('color.custom');
    const customLangLabel=$('#sceneLanguageCustomField > span');
    if(customLangLabel) customLangLabel.textContent=t('scene.language.tag');
    const undoButton=$('#undoButton');if(undoButton)undoButton.textContent=t('undo.action');
    const undoCompact=$('#undoCompactButton');if(undoCompact)undoCompact.setAttribute('aria-label',t('undo.action'));
    const undoMsg=$('#undoMessage');
    if(undoMsg && !$('#undoBar')?.hidden)undoMsg.textContent=translateUndoLabel(undoMsg.dataset.rawLabel||undoMsg.textContent);
    $$('.ui-language-switch button').forEach(b=>{
      const on=b.dataset.uiLang===uiLanguage;
      b.classList.toggle('is-selected',on); b.setAttribute('aria-pressed',on?'true':'false');
    });
  }

  function setUILanguage(language){
    uiLanguage = I18N?.setLocale?.(language) || language;
    applyStaticUITranslations();
    updateCount();
    updateAdvancedConditionalUI?.();
    if(workingDocument) renderAdvanced?.();
    if(player) player.setUILanguage?.(uiLanguage);
  }

  let selectedTheme = 'light';
  let selectedFont = 'serif';
  let cinemaTone = 'dark';
  let cinemaBackgroundUrl = '';
  let player = null;
  let workingDocument = null;
  // Once a Scene document exists it is the single source of truth.
  // Easy's textarea is only a source draft until the user edits it again.
  let easySourceDirty = true;
  let protectedResplitPending = false;

  const DRAFT_DB_NAME='scene-studio-drafts';
  const DRAFT_DB_VERSION=1;
  const DRAFT_STORE='drafts';
  const DRAFT_MAX=10;
  const DRAFT_LAST_KEY='sceneStudio.lastDraftId';
  let currentDraftId=localStorage.getItem(DRAFT_LAST_KEY)||'';
  let draftSaveTimer=null;
  let latestDraftSummary=null;
  let autoRecProgress={nextIndex:0,recordedCount:0};

  function openDraftDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DRAFT_DB_NAME,DRAFT_DB_VERSION);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DRAFT_STORE))db.createObjectStore(DRAFT_STORE,{keyPath:'id'});};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }
  async function draftStore(mode='readonly'){
    const db=await openDraftDB();
    return {db,store:db.transaction(DRAFT_STORE,mode).objectStore(DRAFT_STORE)};
  }
  async function listDraftRecords(){
    const {db,store}=await draftStore();
    const rows=await new Promise((resolve,reject)=>{const r=store.getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});
    db.close();
    return rows.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  }
  async function getDraftRecord(id){
    if(!id)return null;
    const {db,store}=await draftStore();
    const row=await new Promise((resolve,reject)=>{const r=store.get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});
    db.close();return row;
  }
  async function putDraftRecord(row){
    const {db,store}=await draftStore('readwrite');
    await new Promise((resolve,reject)=>{const r=store.put(row);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});
    db.close();
  }
  async function removeDraftRecord(id){
    const {db,store}=await draftStore('readwrite');
    await new Promise((resolve,reject)=>{const r=store.delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});
    db.close();
  }
  function createDraftId(){return globalThis.crypto?.randomUUID?.()||`draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
  function replaceAssetRefs(value,map){
    if(!value)return value;
    if(typeof value==='string')return map.get(value)||value;
    if(Array.isArray(value)){value.forEach((v,i)=>value[i]=replaceAssetRefs(v,map));return value;}
    if(typeof value==='object'){Object.keys(value).forEach(k=>value[k]=replaceAssetRefs(value[k],map));}
    return value;
  }
  function serializeDraftAssets(){
    const items=[];
    assetRegistry.forEach((item,url)=>{if(item?.blob)items.push({url,name:item.name||'asset',blob:item.blob});});
    return items;
  }
  function draftSceneCount(){return workingDocument?.scenes?.length||0;}
  function draftTitle(){return String(titleInput?.value||workingDocument?.title||'Untitled').trim()||'Untitled';}
  function draftRecMeta(total=draftSceneCount()){
    const n=Math.min(Number(autoRecProgress.recordedCount)||0,total||0);
    return total?`REC ${n}/${total}`:'';
  }
  function formatDraftTime(ts){
    const d=new Date(ts||Date.now()), now=new Date();
    if(d.toDateString()===now.toDateString())return `${t('draft.today')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  async function buildDraftRecord(){
    if(!bodyInput.value.trim() && !workingDocument?.scenes?.length)return null;
    if(!advancedScreen.hidden && workingDocument?.scenes?.length)syncAdvancedFieldsToScene();
    if(workingDocument?.scenes?.length)syncEasyShellToWorkingDocument();
    if(!currentDraftId)currentDraftId=createDraftId();
    localStorage.setItem(DRAFT_LAST_KEY,currentDraftId);
    return {
      id:currentDraftId,updatedAt:Date.now(),title:draftTitle(),body:bodyInput.value,
      easySourceDirty,protectedResplitPending,selectedSceneIndex,
      easy:{author:authorInput.value,subtitle:subtitleInput?.value||'',series:seriesTitleInput?.value||'',episode:episodeInput?.value||'',language:languageInput?.value||'auto',density:densitySelect?.value||'normal'},
      document:workingDocument?clone(workingDocument):null,
      publication:{
        id:latestPublishedId||'',
        url:latestPublishedUrl||'',
        fingerprint:latestPublishedFingerprint||'',
        publishedAt:latestPublishedAt||0
      },
      recProgress:clone(autoRecProgress),
      cover:{url:coverImageUrl||'',name:coverImageFileName||''},
      assets:serializeDraftAssets()
    };
  }
  async function saveDraftNow(){
    try{
      clearTimeout(draftSaveTimer);
      const row=await buildDraftRecord();
      if(!row)return true;
      if(!await getDraftRecord(row.id)){
        const all=await listDraftRecords();
        if(all.length>=DRAFT_MAX){
          const ind=$('#draftSaveIndicator');
          if(ind){ind.textContent=t('draft.full');ind.hidden=false;}
          return false;
        }
      }
      await putDraftRecord(row);
      latestDraftSummary=row;
      const ind=$('#draftSaveIndicator');
      if(ind){ind.textContent=t('draft.saved');ind.hidden=false;clearTimeout(ind._hideTimer);ind._hideTimer=setTimeout(()=>ind.hidden=true,1800);}
      await refreshDraftUI(false);
      return true;
    }catch(err){
      console.warn('Draft autosave failed',err);
      return false;
    }
  }
  function scheduleDraftSave(delay=700){
    clearTimeout(draftSaveTimer);
    draftSaveTimer=setTimeout(saveDraftNow,delay);
  }
  async function restoreDraftRecord(row){
    if(!row)return;
    assetRegistry.forEach((_,url)=>{if(/^blob:/i.test(url)){try{URL.revokeObjectURL(url);}catch(_){}}});
    assetRegistry.clear();
    const map=new Map();
    for(const item of (row.assets||[])){
      if(!item?.blob)continue;
      const url=URL.createObjectURL(item.blob);map.set(item.url,url);registerAsset(url,item.blob,item.name||'asset');
    }
    workingDocument=row.document?replaceAssetRefs(clone(row.document),map):null;
    currentDraftId=row.id;localStorage.setItem(DRAFT_LAST_KEY,row.id);
    selectedSceneIndex=Math.max(0,Number(row.selectedSceneIndex)||0);
    easySourceDirty=Boolean(row.easySourceDirty);
    protectedResplitPending=false;
    autoRecProgress=row.recProgress||{nextIndex:0,recordedCount:0};
    latestPublishedId=row.publication?.id||'';
    latestPublishedUrl=row.publication?.url||'';
    latestPublishedFingerprint=row.publication?.fingerprint||'';
    latestPublishedAt=Number(row.publication?.publishedAt)||0;
    titleInput.value=row.title||'Untitled';authorInput.value=row.easy?.author||'';bodyInput.value=row.body||'';
    if(subtitleInput)subtitleInput.value=row.easy?.subtitle||'';
    if(seriesTitleInput)seriesTitleInput.value=row.easy?.series||'';
    if(episodeInput)episodeInput.value=row.easy?.episode||'';
    if(languageInput)languageInput.value=row.easy?.language||'auto';
    if(densitySelect)densitySelect.value='normal';
    coverImageUrl=map.get(row.cover?.url)||'';coverImageFileName=row.cover?.name||'';
    updateCount();updateCoverPreview();updateEasyFileActions();updateProtectedResplitPreview();
    if(workingDocument?.scenes?.length){normalizeSceneIds();refreshDocumentLanguages();renderAdvanced();}
    setScreen('easy');scrollScreenToTop(editorScreen);updateAutoRecStartLabel();
  }
  function stableDraftPublishValue(value,assetMap){
    if(value===null || value===undefined)return value;
    if(typeof value==='string'){
      if(/^blob:/i.test(value) && assetMap?.has(value))return assetMap.get(value);
      return value;
    }
    if(Array.isArray(value))return value.map(v=>stableDraftPublishValue(v,assetMap));
    if(typeof value==='object'){
      const out={};
      Object.keys(value).sort().forEach(key=>{out[key]=stableDraftPublishValue(value[key],assetMap);});
      return out;
    }
    return value;
  }

  function draftPublishFingerprint(row){
    if(!row?.document?.scenes?.length)return '';
    try{
      const assetMap=new Map();
      for(const item of (row.assets||[])){
        if(!item?.url)continue;
        const blob=item.blob;
        assetMap.set(item.url,`asset:${item.name||'asset'}:${blob?.size||0}:${blob?.type||''}`);
      }
      return JSON.stringify(stableDraftPublishValue(row.document,assetMap));
    }catch(_){
      return '';
    }
  }

  function draftPublishStatus(row){
    if(!row?.publication?.url)return 'unpublished';
    const current=draftPublishFingerprint(row);
    return current && current===row.publication?.fingerprint ? 'published' : 'dirty';
  }

  async function copyAnyPublishedUrl(url,button=null){
    if(!url)return;
    try{
      await navigator.clipboard.writeText(url);
    }catch(_){
      const ta=document.createElement('textarea');
      ta.value=url;ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    }
    if(button){
      const before=button.textContent;
      button.textContent=t('draft.copied');
      setTimeout(()=>{button.textContent=before;},1200);
    }
  }

  async function shareDraftPublication(row){
    const url=row?.publication?.url;
    if(!url)return;
    if(navigator.share){
      try{
        await navigator.share({title:row.title||'Scene',text:row.title||'Scene',url});
        return;
      }catch(error){
        if(error?.name==='AbortError')return;
      }
    }
    await copyAnyPublishedUrl(url);
  }

  let pendingUnpublishDraft=null;

  function stopDraftPublication(row){
    if(!row?.publication?.url)return;
    pendingUnpublishDraft=row;
    const text=$('#unpublishDialogText');
    if(text){
      text.textContent=t('unpublish.named',{title:row.title||'Untitled'});
    }
    $('#unpublishDialog')?.showModal();
  }

  async function confirmDraftUnpublish(){
    const row=pendingUnpublishDraft;
    pendingUnpublishDraft=null;
    if(!row?.publication?.url)return;

    const fresh=await getDraftRecord(row.id);
    if(!fresh)return;
    fresh.publication={id:'',url:'',fingerprint:'',publishedAt:0};
    fresh.updatedAt=Date.now();
    await putDraftRecord(fresh);

    if(currentDraftId===row.id){
      latestPublishedId='';
      latestPublishedUrl='';
      latestPublishedFingerprint='';
      latestPublishedAt=0;
      syncPublishCopyForStatus();
    }

    await refreshDraftUI(false);
  }

  async function refreshDraftUI(showResume=true){
    const rows=await listDraftRecords();
    latestDraftSummary=rows[0]||null;

    const label=$('#draftCountLabel');
    if(label)label.textContent=`${rows.length} / ${DRAFT_MAX}`;
    const toolbarCount=$('#draftToolbarCount');
    if(toolbarCount)toolbarCount.textContent=`${rows.length} / ${DRAFT_MAX}`;

    const list=$('#draftList');
    if(!list)return;

    const publishedRows=rows.filter(row=>Boolean(row.publication?.url));
    const draftRows=rows.filter(row=>!row.publication?.url);
    const allCount=$('#allCountLabel');
    const draftOnlyCount=$('#draftOnlyCountLabel');
    const publishedCount=$('#publishedCountLabel');
    if(allCount)allCount.textContent=String(rows.length);
    if(draftOnlyCount)draftOnlyCount.textContent=String(draftRows.length);
    if(publishedCount)publishedCount.textContent=String(publishedRows.length);

    const activeFilter=document.querySelector('.draft-manager-tab.is-active')?.dataset.draftFilter||'all';
    const visibleRows=activeFilter==='published'
      ? publishedRows
      : activeFilter==='draft'
        ? draftRows
        : rows;

    list.innerHTML='';
    if(!visibleRows.length){
      const labels={all:t('draft.empty.all'),draft:t('draft.empty.draft'),published:t('draft.empty.published')};
      list.innerHTML=`<p class="draft-empty">${labels[activeFilter]||labels.all}</p>`;
      return;
    }

    visibleRows.forEach(row=>{
      const total=row.sceneCount||row.document?.scenes?.length||0;
      const rec=Math.min(total,Number(row.recProgress?.completedCount||row.recCompletedCount||0));
      const isPublished=Boolean(row.publication?.url);
      const status=isPublished?draftPublishStatus(row):'draft';
      const el=document.createElement('article');
      el.className=`draft-row unified-work-row ${isPublished?'is-published':''} ${status==='dirty'?'is-dirty':''}`;

      el.innerHTML=`
        <div class="unified-work-copy">
          <div class="unified-work-title-line">
            <strong></strong>
            <span class="unified-work-badges"></span>
          </div>
          <small class="unified-work-meta"></small>
          <small class="published-url" ${isPublished?'':'hidden'}></small>
        </div>
        <div class="draft-row-actions unified-work-actions">
          <button data-open>${t('draft.continue')}</button>
          <button data-share ${isPublished?'':'hidden'}>${t('publish.share')}</button>
          <button data-copy ${isPublished?'':'hidden'}>${t('draft.link')}</button>
          <button data-stop ${isPublished?'':'hidden'}>${t('draft.unpublish')}</button>
          <button data-delete>${t('draft.delete')}</button>
        </div>`;

      el.querySelector('strong').textContent=row.title||'Untitled';

      const badges=el.querySelector('.unified-work-badges');
      if(isPublished){
        const badge=document.createElement('span');
        badge.className=`published-status ${status==='dirty'?'is-dirty':''}`;
        badge.textContent=status==='dirty'?t('draft.status.dirty'):t('draft.status.published');
        badges.appendChild(badge);
      }

      const meta=[
        `${total} Scenes`,
        total?`REC ${rec}/${total}`:'',
        formatDraftTime(row.updatedAt)
      ].filter(Boolean).join(' · ');
      el.querySelector('.unified-work-meta').textContent=meta;

      if(isPublished){
        el.querySelector('.published-url').textContent=row.publication.url;
        el.querySelector('[data-share]').onclick=()=>shareDraftPublication(row);
        el.querySelector('[data-copy]').onclick=e=>copyAnyPublishedUrl(row.publication.url,e.currentTarget);
        el.querySelector('[data-stop]').onclick=()=>stopDraftPublication(row);
      }

      el.querySelector('[data-open]').onclick=async()=>{
        await restoreDraftRecord(await getDraftRecord(row.id));
        $('#draftManagerDialog').close();
      };
      el.querySelector('[data-delete]').onclick=async()=>{
        if(!confirm(`「${row.title||'Untitled'}」のローカル下書きを削除しますか？`))return;
        await removeDraftRecord(row.id);
        if(currentDraftId===row.id){
          currentDraftId='';
          localStorage.removeItem(DRAFT_LAST_KEY);
        }
        await refreshDraftUI(true);
      };

      list.appendChild(el);
    });
  }

  async function startNewDraft(){
    // Never abandon the currently edited work silently.
    const hadWork=Boolean(bodyInput.value.trim() || workingDocument?.scenes?.length);
    const saved=await saveDraftNow();
    if(hadWork && !saved){
      alert('現在の作品を自動保存できなかったため、新しい作品には切り替えませんでした。');
      return false;
    }
    workingDocument=null;easySourceDirty=true;protectedResplitPending=false;selectedSceneIndex=0;autoRecProgress={nextIndex:0,recordedCount:0};
    currentDraftId=createDraftId();localStorage.setItem(DRAFT_LAST_KEY,currentDraftId);
    latestPublishedId='';
    latestPublishedUrl='';
    latestPublishedFingerprint='';
    latestPublishedAt=0;
    titleInput.value='Untitled';authorInput.value='';bodyInput.value='';
    if(densitySelect)densitySelect.value='normal';
    if(subtitleInput)subtitleInput.value='';if(seriesTitleInput)seriesTitleInput.value='';if(episodeInput)episodeInput.value='';
    coverImageUrl='';coverImageFileName='';updateCount();updateCoverPreview();updateEasyFileActions();updateAutoRecStartLabel();
    setScreen('easy');scrollScreenToTop(editorScreen);
    return true;
  }

  // Runtime asset registry.
  // key: object URL used by Scene Format in the current browser session
  // value: Blob/File + original filename. This lets Package Export carry the
  // actual binary data instead of only the blob: reference.
  const assetRegistry = new Map();

  function registerAsset(url, blob, name='asset'){
    if(!url || !blob)return;
    assetRegistry.set(url,{blob,name:String(name||'asset')});
  }

  async function snapshotPickedFile(file){
    if(!file)return null;
    const bytes=await file.arrayBuffer();
    return {blob:new Blob([bytes],{type:file.type||'application/octet-stream'}),name:file.name||'asset'};
  }
  function unregisterAsset(url){
    if(!url)return;
    const item=assetRegistry.get(url);
    assetRegistry.delete(url);
    if(/^blob:/i.test(url)){
      try{ URL.revokeObjectURL(url); }catch(_){}
    }
    return item;
  }

  let selectedSceneIndex = 0;
  let playerReturnTarget = 'easy';

  const SAMPLE = `通りは朝から、よく整えられた録音室みたいだった。\n\n角を曲がると、声が重なった。\n\n「今日もいい天気ですね」\n\nパン屋の店主が、窯の前で。\n\n同じ音程、同じタイミング、同じ長さ。\n違う口から出ているのに、一枚の録音を街に貼り付けたみたいに、揺れない。\n\nそれでも——\n\n私は、ほんのわずかな遅れを待ってしまう。`;

  const clone = (v) => typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
  function splitBody(text) { return SceneTextSplitter.splitDetailed(text, { density: densitySelect.value, language: 'auto' }); }
  function detectWorkLanguage(text = bodyInput.value) { return SceneTextSplitter.detectLanguage(text); }
  function makeSceneId(index) { return `s${String(index + 1).padStart(3, '0')}`; }
  function nextUniqueId() {
    const used = new Set((workingDocument?.scenes || []).map(s => s.id));
    let n = 1; while (used.has(makeSceneId(n - 1))) n += 1;
    return makeSceneId(n - 1);
  }
  function normalizeSceneIds() {
    // Existing ids stay stable; only blank/duplicate ids are repaired.
    const seen = new Set();
    workingDocument.scenes.forEach((scene, i) => {
      if (!scene.id || seen.has(scene.id)) scene.id = nextUniqueId();
      seen.add(scene.id);
    });
  }

  function refreshDocumentLanguages(){
    if(!workingDocument?.scenes?.length)return;
    const priorDefault=workingDocument.language && workingDocument.language!=='mul' && workingDocument.language!=='und' ? workingDocument.language : '';
    const langs=[];
    workingDocument.scenes.forEach(scene=>{
      let lang=SceneTextSplitter.normalizeLanguageTag?.(scene.language,'') || '';
      if(!lang || lang==='mul') lang=priorDefault || SceneTextSplitter.detectLanguage(scene.text || scene.subText || '');
      if(lang && !['mul','und'].includes(lang) && !langs.includes(lang)) langs.push(lang);
    });
    workingDocument.languages=langs;
    workingDocument.language=langs.length>1?'mul':(langs[0] || priorDefault || 'und');
    if(workingDocument.language!=='mul'){
      workingDocument.scenes.forEach(scene=>{ if(scene.language===workingDocument.language) delete scene.language; });
    } else {
      workingDocument.scenes.forEach(scene=>{
        if(!scene.language && (scene.text || scene.subText)) scene.language=SceneTextSplitter.detectLanguage(scene.text || scene.subText || '');
      });
    }
  }

  function workMetadataFromEasy(){
    const detected = detectWorkLanguage();
    const selectedLanguage = languageInput?.value || 'auto';
    return {
      subtitle: subtitleInput?.value.trim() || '',
      language: selectedLanguage === 'auto' ? detected : selectedLanguage,
      seriesTitle: seriesTitleInput?.value.trim() || '',
      episode: episodeInput?.value.trim() || ''
    };
  }

  function updateCoverPreview(){
    if(!coverPreview)return;
    coverPreview.style.backgroundImage=coverImageUrl ? `url("${coverImageUrl}")` : '';
    coverPreview.style.backgroundSize='cover';
    coverPreview.style.backgroundPosition='center center';
    coverPreview.classList.toggle('has-image',Boolean(coverImageUrl));
    const empty=coverPreview.querySelector('.cover-preview-empty');
    if(empty)empty.hidden=Boolean(coverImageUrl);
    if(coverImageClear)coverImageClear.hidden=!coverImageUrl;
  }

  function packageManifestFor(doc, coverPath=''){
    const meta=workMetadataFromEasy();
    const manifest={
      package:'scene-package',
      packageVersion:'1.0',
      sceneFormat:'1.0',
      title:doc.title || 'Untitled',
      author:doc.author || '',
      language:meta.language || doc.language || 'und',
      entry:'scene.json'
    };
    if(meta.subtitle)manifest.subtitle=meta.subtitle;
    if(meta.seriesTitle || meta.episode){
      manifest.series={};
      if(meta.seriesTitle)manifest.series.title=meta.seriesTitle;
      if(meta.episode)manifest.series.episode=meta.episode;
    }
    if(coverPath){
      manifest.cover={
        image:coverPath,
        fit:'cover',
        position:'center'
      };
    }
    return manifest;
  }

  function buildSceneDocument() {
    const chunks = splitBody(bodyInput.value);
    const languageSummary = SceneTextSplitter.summarizeLanguages?.(chunks) || { language: detectWorkLanguage(), languages: [detectWorkLanguage()] };
    const scenes = chunks.map((chunk, index) => ({
      id: makeSceneId(index), type: chunk.type || 'text', text: chunk.text,
      ...(languageSummary.language === 'mul' && chunk.language ? { language: chunk.language } : {}),
      presentation: { display: 'stack', effect: 'auto', text: { size: 'auto' } }
    }));
    if (selectedTheme === 'cinema' && cinemaBackgroundUrl && scenes[0]) {
      scenes[0].presentation.background = { src: cinemaBackgroundUrl, transition: 'fade', dim: cinemaTone === 'dark' ? 0.48 : 0.72, fit: 'cover', position: 'center center' };
    }
    return {
      format:'scene-format', version:'1.0', language:languageSummary.language,
      ...(languageSummary.languages?.length ? { languages: languageSummary.languages } : {}),
      title:titleInput.value.trim() || 'Untitled', author:authorInput.value.trim(),
      metadata:{
        subtitle:subtitleInput?.value.trim() || '',
        seriesTitle:seriesTitleInput?.value.trim() || '',
        episode:episodeInput?.value.trim() || ''
      },
      theme:selectedTheme,
      appearance:{
        cinemaTone: selectedTheme==='cinema' ? cinemaTone : 'dark',
        typography:{ fontFamily:selectedFont }
      },
      player:{ navigation:{ allowPrevious:true } }, scenes
    };
  }


  function normalizedSceneText(value){
    return String(value||'').replace(/\r\n?/g,'\n').trim();
  }

  function sceneHasAdvancedMeaning(scene){
    if(!scene)return false;
    if(normalizedSceneText(scene.subText))return true;
    if(Number.isFinite(Number(scene.pause)) && Number(scene.pause)>0)return true;
    if(Array.isArray(scene.audio) && scene.audio.length)return true;
    if(scene.type && scene.type!=='text')return true;

    const p=scene.presentation||{};
    if(p.background && Object.keys(p.background).length)return true;
    if(p.display && p.display!=='stack')return true;
    if(p.effect && p.effect!=='auto')return true;

    const tx=p.text||{};
    const defaultTextKeys=new Set(['size','fontFamily']);
    for(const [key,value] of Object.entries(tx)){
      if(key==='size' && (!value || value==='auto'))continue;
      if(key==='fontFamily' && (!value || value==='inherit'))continue;
      if(value!==undefined && value!==null && value!=='' && value!==false)return true;
    }

    // Unknown/custom presentation fields are preserved rather than guessed away.
    for(const [key,value] of Object.entries(p)){
      if(['display','effect','text','background'].includes(key))continue;
      if(value!==undefined && value!==null && value!=='' && value!==false)return true;
    }

    // Unknown Scene-level fields may belong to future Format features.
    const ordinary=new Set(['id','type','text','subText','language','pause','audio','presentation']);
    for(const [key,value] of Object.entries(scene)){
      if(ordinary.has(key))continue;
      if(value!==undefined && value!==null && value!=='' && value!==false)return true;
    }
    return false;
  }

  function emptySceneLabel(scene){
    return sceneHasAdvancedMeaning(scene) ? `（${t('scene.effectOnly')}）` : `（${t('scene.empty')}）`;
  }

  let lastEasyReconcileDeletedCount=0;

  function lcsScenePairs(oldScenes,newScenes){
    const a=oldScenes.map(scene=>normalizedSceneText(scene.text));
    const b=newScenes.map(scene=>normalizedSceneText(scene.text));
    const dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
    for(let i=a.length-1;i>=0;i--){
      for(let j=b.length-1;j>=0;j--){
        dp[i][j]=a[i]===b[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j],dp[i][j+1]);
      }
    }
    const pairs=[];
    let i=0,j=0;
    while(i<a.length && j<b.length){
      if(a[i]===b[j]){pairs.push([i,j]);i++;j++;}
      else if(dp[i+1][j]>=dp[i][j+1])i++;
      else j++;
    }
    return pairs;
  }

  function applyFreshTextToPriorScene(prior,freshScene){
    const reused=clone(prior);
    reused.text=freshScene.text;
    reused.type=freshScene.type||reused.type||'text';
    if(freshScene.language)reused.language=freshScene.language;
    else delete reused.language;
    if(freshScene.presentation?.background){
      reused.presentation ||= {};
      reused.presentation.background=clone(freshScene.presentation.background);
    }
    return reused;
  }

  function sceneStructuralSignature(scene){
    const s=clone(scene||{});
    delete s.id;
    delete s.text;
    return JSON.stringify(s);
  }

  function sceneIsProtectedFromResplit(scene){
    if(!scene)return false;

    // Textless Scenes are Advanced-only by definition.
    if(!normalizedSceneText(scene.text))return true;

    if(normalizedSceneText(scene.subText))return true;
    if(Array.isArray(scene.audio) && scene.audio.length)return true;
    if(Number.isFinite(Number(scene.pause)) && Number(scene.pause)>0)return true;
    if(scene.type && scene.type!=='text')return true;

    const p=scene.presentation||{};
    if(p.background && Object.keys(p.background).length)return true;
    if(p.display && p.display!=='stack')return true;
    if(p.effect && p.effect!=='auto')return true;

    const tx=p.text||{};
    if(tx.size && tx.size!=='auto')return true;
    if(tx.color)return true;
    if(tx.shadow)return true;
    if(tx.fontFamily && tx.fontFamily!=='inherit')return true;

    // Unknown/custom Format data is protected instead of guessed away.
    for(const [key,value] of Object.entries(p)){
      if(['background','display','effect','text'].includes(key))continue;
      if(value!==undefined && value!==null && value!=='' && value!==false)return true;
    }
    const ordinary=new Set(['id','type','text','subText','language','pause','audio','presentation']);
    for(const [key,value] of Object.entries(scene)){
      if(ordinary.has(key))continue;
      if(value!==undefined && value!==null && value!=='' && value!==false)return true;
    }
    return false;
  }

  function plainSceneFromExistingSplitterChunk(chunk){
    return {
      id:nextUniqueId(),
      type:chunk.type||'text',
      text:chunk.text||'',
      ...(chunk.language?{language:chunk.language}:{}),
      presentation:{display:'stack',effect:'auto',text:{size:'auto'}}
    };
  }

  function resplitPlainRunWithExistingSplitter(run){
    if(!run.length)return [];

    // IMPORTANT:
    // This is a real newline separator. Splitter itself is untouched.
    // We only provide the plain run as text input.
    const sourceText=run.map(scene=>String(scene.text||'')).filter(Boolean).join('\n\n');
    if(!sourceText.trim())return [];

    return splitBody(sourceText).map(plainSceneFromExistingSplitterChunk);
  }

  function protectedResplitWorkingDocument(){
    if(!workingDocument?.scenes?.length)return;

    const source=workingDocument.scenes;
    const result=[];
    let plainRun=[];

    const flushPlainRun=()=>{
      if(!plainRun.length)return;
      result.push(...resplitPlainRunWithExistingSplitter(plainRun));
      plainRun=[];
    };

    for(const scene of source){
      if(sceneIsProtectedFromResplit(scene)){
        flushPlainRun();
        result.push(clone(scene));
      }else{
        plainRun.push(scene);
      }
    }
    flushPlainRun();

    if(result.length){
      workingDocument.scenes=result;
      normalizeSceneIds();
      refreshDocumentLanguages();
    }
  }

  function protectedResplitStats(){
    if(!workingDocument?.scenes?.length){
      let predicted=0;
      try{predicted=bodyInput.value.trim()?splitBody(bodyInput.value).length:0;}catch(_){}
      return {current:0,predicted,protectedCount:0,plainCount:predicted};
    }

    let predicted=0;
    let protectedCount=0;
    let plainCount=0;
    let plainRun=[];

    const flush=()=>{
      if(!plainRun.length)return;
      plainCount+=plainRun.length;
      try{predicted+=resplitPlainRunWithExistingSplitter(plainRun).length;}
      catch(_){predicted+=plainRun.length;}
      plainRun=[];
    };

    for(const scene of workingDocument.scenes){
      if(sceneIsProtectedFromResplit(scene)){
        flush();
        protectedCount++;
        predicted++;
      }else{
        plainRun.push(scene);
      }
    }
    flush();

    return {current:workingDocument.scenes.length,predicted,protectedCount,plainCount};
  }

  function updateProtectedResplitPreview(){
    const count=$('#protectedSplitCount');
    const detail=$('#protectedSplitDetail');
    if(!count||!detail)return;

    if(!bodyInput.value.trim() && !workingDocument?.scenes?.length){
      count.textContent='—';
      detail.textContent='本文を入力すると表示します。';
      return;
    }

    const stats=protectedResplitStats();
    count.textContent=stats.current
      ? `${stats.current} → 約 ${stats.predicted} Scenes`
      : `約 ${stats.predicted} Scenes`;

    detail.textContent=stats.current
      ? `保護 ${stats.protectedCount} / 再分割対象 ${stats.plainCount}。画像・音・AUTO・演出済みSceneはそのまま残します。`
      : '初回Scene化では本文全体を既存Splitterで分割します。';
  }

  function reconcileEasyBodyWithScenes(){
    lastEasyReconcileDeletedCount=0;
    const fresh=buildSceneDocument();
    if(!workingDocument)return fresh;

    const oldDoc=workingDocument;
    const oldScenes=oldDoc.scenes||[];
    const newTextScenes=fresh.scenes||[];
    const result=[];

    let ni=0;

    for(let oi=0; oi<oldScenes.length; oi++){
      const old=oldScenes[oi];
      const oldText=normalizedSceneText(old.text);

      // Advanced-only / image-only / sound-only Scene:
      // preserve at the exact same order position.
      if(!oldText){
        result.push(clone(old));
        continue;
      }

      const nextNew = ni < newTextScenes.length ? newTextScenes[ni] : null;
      const nextNewText = normalizedSceneText(nextNew?.text);

      if(nextNew && nextNewText===oldText){
        // Unchanged Scene.
        result.push(applyFreshTextToPriorScene(old,nextNew));
        ni++;
        continue;
      }

      // Look ahead in OLD scenes. If the current Easy text exactly matches a
      // later old Scene, the current old Scene was deleted in Easy.
      let laterOldMatch=-1;
      if(nextNewText){
        for(let look=oi+1; look<oldScenes.length; look++){
          const candidate=normalizedSceneText(oldScenes[look].text);
          if(candidate && candidate===nextNewText){
            laterOldMatch=look;
            break;
          }
        }
      }

      if(laterOldMatch>=0){
        // Current old Scene was removed. Keep its shell only if it still has
        // Advanced meaning; otherwise delete it.
        if(sceneHasAdvancedMeaning(old)){
          const kept=clone(old);
          kept.text='';
          result.push(kept);
        }else{
          lastEasyReconcileDeletedCount+=1;
        }
        continue;
      }

      // Look ahead in NEW text. If the current old text appears later there,
      // Easy inserted new text before this Scene.
      let laterNewMatch=-1;
      if(oldText){
        for(let look=ni+1; look<newTextScenes.length; look++){
          if(normalizedSceneText(newTextScenes[look].text)===oldText){
            laterNewMatch=look;
            break;
          }
        }
      }

      if(laterNewMatch>=0){
        while(ni<laterNewMatch){
          result.push(clone(newTextScenes[ni++]));
        }
        result.push(applyFreshTextToPriorScene(old,newTextScenes[ni]));
        ni++;
        continue;
      }

      // Neither side has a later exact match: treat as an edit of this Scene.
      if(nextNew){
        result.push(applyFreshTextToPriorScene(old,nextNew));
        ni++;
      }else{
        // Easy removed this trailing Scene completely.
        if(sceneHasAdvancedMeaning(old)){
          const kept=clone(old);
          kept.text='';
          result.push(kept);
        }else{
          lastEasyReconcileDeletedCount+=1;
        }
      }
    }

    // Remaining Easy text is genuinely new.
    while(ni<newTextScenes.length){
      result.push(clone(newTextScenes[ni++]));
    }

    if(!result.length && oldScenes.length){
      const placeholder=clone(oldScenes[0]);
      placeholder.text='';
      result.push(placeholder);
      lastEasyReconcileDeletedCount=Math.max(0,lastEasyReconcileDeletedCount-1);
    }

    return {
      ...clone(oldDoc),
      ...fresh,
      player:clone(oldDoc.player||fresh.player),
      scenes:result
    };
  }

  function ensureWorkingDocumentFromEasy(){
    if(!workingDocument){
      workingDocument=buildSceneDocument();
      selectedSceneIndex=0;
      easySourceDirty=false;
    }else if(easySourceDirty){
      const previousId=workingDocument.scenes?.[selectedSceneIndex]?.id||'';
      const priorDocument=clone(workingDocument);
      const priorIndex=selectedSceneIndex;
      const priorBody=(workingDocument.scenes||[]).map(scene=>scene.text||'').filter(Boolean).join('\n\n');

      workingDocument=reconcileEasyBodyWithScenes();
      normalizeSceneIds();
      refreshDocumentLanguages();
      const restoredIndex=previousId ? workingDocument.scenes.findIndex(scene=>scene.id===previousId) : -1;
      selectedSceneIndex=restoredIndex>=0 ? restoredIndex : Math.min(selectedSceneIndex,Math.max(0,workingDocument.scenes.length-1));
      easySourceDirty=false;

      if(lastEasyReconcileDeletedCount>0){
        undoSnapshot={
          label:'Easy編集によるScene削除',
          workingDocument:priorDocument,
          selectedSceneIndex:priorIndex,
          easySourceDirty:false,
          easy:{
            title:titleInput?.value ?? '',
            author:authorInput?.value ?? '',
            subtitle:subtitleInput?.value ?? '',
            series:seriesTitleInput?.value ?? '',
            episode:episodeInput?.value ?? '',
            language:languageInput?.value ?? 'ja',
            body:priorBody
          }
        };
        const n=lastEasyReconcileDeletedCount;
        showUndo(n===1?'Sceneを削除しました':`${n} Scenesを削除しました`);
      }
    }

    if(protectedResplitPending && workingDocument?.scenes?.length){
      const before=clone(workingDocument);
      const beforeIndex=selectedSceneIndex;

      captureUndo('再分割を元に戻せます');
      protectedResplitWorkingDocument();
      selectedSceneIndex=Math.min(beforeIndex,Math.max(0,workingDocument.scenes.length-1));
      protectedResplitPending=false;
      showUndo('未編集Sceneだけ再分割しました');
    }

   
    return workingDocument;
  }

  function syncEasyShellToWorkingDocument(){
    if(!workingDocument)return;
    // Easy may still change work-level metadata without destroying Scene edits.
    workingDocument.title=titleInput.value.trim() || 'Untitled';
    workingDocument.author=authorInput.value.trim();
    workingDocument.metadata ||= {};
    workingDocument.metadata.subtitle=subtitleInput?.value.trim() || '';
    workingDocument.metadata.seriesTitle=seriesTitleInput?.value.trim() || '';
    workingDocument.metadata.episode=episodeInput?.value.trim() || '';
    workingDocument.theme=selectedTheme;
    workingDocument.appearance ||= {};
    workingDocument.appearance.typography ||= {};
    workingDocument.appearance.typography.fontFamily=selectedFont;
    workingDocument.appearance.cinemaTone=selectedTheme==='cinema' ? cinemaTone : (workingDocument.appearance.cinemaTone || 'dark');
  }

  function sceneDocumentForExport(){
    // If Advanced has been opened, its Scene document is authoritative.
    // Otherwise build directly from Easy Studio so a first export needs no extra step.
    if(workingDocument){
      if(!advancedScreen.hidden) syncAdvancedFieldsToScene();
      syncEasyShellToWorkingDocument();
      return clone(workingDocument);
    }
    return buildSceneDocument();
  }
  function safeFileStem(value){
    const stem=String(value||'untitled').trim()
      .replace(/[\\/:*?"<>|\u0000-\u001F]/g,'_')
      .replace(/\s+/g,' ')
      .replace(/[. ]+$/g,'')
      .slice(0,80);
    return stem || 'untitled';
  }
  function downloadTextFile(name,text,type='application/json'){
    const blob=new Blob([text],{type:`${type};charset=utf-8`});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=name; a.style.display='none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  function downloadBlobFile(name,blob){
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=name; a.style.display='none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }

  const ZIP_TEXT_ENCODER=new TextEncoder();
  const ZIP_TEXT_DECODER=new TextDecoder('utf-8');

  function zipU16(view,offset,value){ view.setUint16(offset,value,true); }
  function zipU32(view,offset,value){ view.setUint32(offset,value>>>0,true); }

  function crc32(bytes){
    let crc=0xFFFFFFFF;
    for(let i=0;i<bytes.length;i++){
      crc^=bytes[i];
      for(let k=0;k<8;k++) crc=(crc>>>1)^((crc&1)?0xEDB88320:0);
    }
    return (crc^0xFFFFFFFF)>>>0;
  }

  async function blobBytes(blob,fallbackUrl=''){
    try{return new Uint8Array(await blob.arrayBuffer());}
    catch(firstError){
      if(fallbackUrl && /^blob:/i.test(fallbackUrl)){
        try{const response=await fetch(fallbackUrl);if(response.ok)return new Uint8Array(await response.arrayBuffer());}catch(_){}
      }
      throw firstError;
    }
  }

  // Minimal standards-compliant ZIP writer using STORE (method 0).
  // STORE is deliberate: browser-side implementation stays dependency-free,
  // while images/audio are already compressed formats in most projects.
  async function makeStoreZip(entries){
    const locals=[];
    const centrals=[];
    let offset=0;

    for(const entry of entries){
      const nameBytes=ZIP_TEXT_ENCODER.encode(entry.name);
      const data=entry.bytes instanceof Uint8Array ? entry.bytes : new Uint8Array(entry.bytes);
      const crc=crc32(data);

      const local=new Uint8Array(30+nameBytes.length+data.length);
      const lv=new DataView(local.buffer);
      zipU32(lv,0,0x04034b50);
      zipU16(lv,4,20);
      zipU16(lv,6,0x0800); // UTF-8 names
      zipU16(lv,8,0);      // STORE
      zipU16(lv,10,0); zipU16(lv,12,0);
      zipU32(lv,14,crc);
      zipU32(lv,18,data.length);
      zipU32(lv,22,data.length);
      zipU16(lv,26,nameBytes.length);
      zipU16(lv,28,0);
      local.set(nameBytes,30);
      local.set(data,30+nameBytes.length);
      locals.push(local);

      const central=new Uint8Array(46+nameBytes.length);
      const cv=new DataView(central.buffer);
      zipU32(cv,0,0x02014b50);
      zipU16(cv,4,20);
      zipU16(cv,6,20);
      zipU16(cv,8,0x0800);
      zipU16(cv,10,0);
      zipU16(cv,12,0); zipU16(cv,14,0);
      zipU32(cv,16,crc);
      zipU32(cv,20,data.length);
      zipU32(cv,24,data.length);
      zipU16(cv,28,nameBytes.length);
      zipU16(cv,30,0); zipU16(cv,32,0);
      zipU16(cv,34,0); zipU16(cv,36,0);
      zipU32(cv,38,0);
      zipU32(cv,42,offset);
      central.set(nameBytes,46);
      centrals.push(central);

      offset+=local.length;
    }

    const centralOffset=offset;
    const centralSize=centrals.reduce((n,x)=>n+x.length,0);
    const end=new Uint8Array(22);
    const ev=new DataView(end.buffer);
    zipU32(ev,0,0x06054b50);
    zipU16(ev,4,0); zipU16(ev,6,0);
    zipU16(ev,8,entries.length);
    zipU16(ev,10,entries.length);
    zipU32(ev,12,centralSize);
    zipU32(ev,16,centralOffset);
    zipU16(ev,20,0);

    return new Blob([...locals,...centrals,end],{type:'application/zip'});
  }

  async function inflateRaw(bytes){
    if(typeof DecompressionStream!=='function') throw new Error('zip-deflate-unsupported');
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // Reader supports STORE packages generated by Studio and ordinary DEFLATE
  // entries when the browser provides DecompressionStream.
  async function readZipEntries(file){
    const bytes=new Uint8Array(await file.arrayBuffer());
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    const out=new Map();
    let p=0;

    while(p+4<=bytes.length){
      const sig=view.getUint32(p,true);
      if(sig===0x04034b50){
        if(p+30>bytes.length)throw new Error('zip-local-header');
        const flags=view.getUint16(p+6,true);
        const method=view.getUint16(p+8,true);
        const compSize=view.getUint32(p+18,true);
        const uncompSize=view.getUint32(p+22,true);
        const nameLen=view.getUint16(p+26,true);
        const extraLen=view.getUint16(p+28,true);
        if(flags&0x0008) throw new Error('zip-data-descriptor-unsupported');
        const nameStart=p+30;
        const dataStart=nameStart+nameLen+extraLen;
        const dataEnd=dataStart+compSize;
        if(dataEnd>bytes.length)throw new Error('zip-entry-overflow');
        const name=ZIP_TEXT_DECODER.decode(bytes.slice(nameStart,nameStart+nameLen));
        let data=bytes.slice(dataStart,dataEnd);
        if(method===8) data=await inflateRaw(data);
        else if(method!==0) throw new Error(`zip-method-${method}`);
        if(uncompSize && data.length!==uncompSize) throw new Error('zip-size');
        if(name && !name.endsWith('/')) out.set(name,data);
        p=dataEnd;
        continue;
      }
      if(sig===0x02014b50 || sig===0x06054b50) break;
      p++;
    }
    if(!out.size)throw new Error('zip-empty');
    return out;
  }

  function guessMime(name){
    const n=String(name||'').toLowerCase();
    if(/\.(jpg|jpeg)$/.test(n))return 'image/jpeg';
    if(/\.png$/.test(n))return 'image/png';
    if(/\.webp$/.test(n))return 'image/webp';
    if(/\.gif$/.test(n))return 'image/gif';
    if(/\.svg$/.test(n))return 'image/svg+xml';
    if(/\.mp3$/.test(n))return 'audio/mpeg';
    if(/\.m4a$/.test(n))return 'audio/mp4';
    if(/\.aac$/.test(n))return 'audio/aac';
    if(/\.wav$/.test(n))return 'audio/wav';
    if(/\.ogg$/.test(n))return 'audio/ogg';
    if(/\.opus$/.test(n))return 'audio/opus';
    if(/\.flac$/.test(n))return 'audio/flac';
    return 'application/octet-stream';
  }

  function assetExtension(name,mime=''){
    const m=String(name||'').match(/(\.[A-Za-z0-9]{1,8})$/);
    if(m)return m[1].toLowerCase();
    const map={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif','audio/mpeg':'.mp3','audio/mp4':'.m4a','audio/aac':'.aac','audio/wav':'.wav','audio/ogg':'.ogg','audio/opus':'.opus','audio/flac':'.flac'};
    return map[mime]||'.bin';
  }

  function safeAssetBase(name){
    return safeFileStem(String(name||'asset').replace(/\.[^.]+$/,'')).replace(/\s+/g,'_').slice(0,48)||'asset';
  }

  async function resolveAssetBlob(src){
    const registered=assetRegistry.get(src);
    if(registered)return registered;
    if(/^blob:/i.test(src)){
      const response=await fetch(src);
      if(!response.ok)throw new Error('blob-fetch');
      const blob=await response.blob();
      return {blob,name:'asset'+assetExtension('',blob.type)};
    }
    return null;
  }

  function walkAssetRefs(doc,callback){
    (doc.scenes||[]).forEach((scene,sceneIndex)=>{
      const bg=scene?.presentation?.background;
      if(bg?.src)callback({
        kind:'background',sceneIndex,
        holder:bg,key:'src',src:bg.src,
        fileName:bg._editorFileName||''
      });

      (scene?.audio||[]).forEach((cmd,audioIndex)=>{
        if(!cmd?.src)return;
        const kind=cmd.channel==='bgm'?'bgm':cmd.channel==='ambient'?'ambient':'se';
        callback({
          kind,sceneIndex,audioIndex,
          holder:cmd,key:'src',src:cmd.src,
          fileName:cmd._editorFileName||''
        });
      });
    });
  }

  function studioStateForPackage(doc){
    const total=doc?.scenes?.length||0;
    const rawNext=Math.max(0,Number(autoRecProgress?.nextIndex)||0);
    const nextIndex=Math.min(rawNext,total);
    const rawRecorded=Math.max(0,Number(autoRecProgress?.recordedCount)||0);
    const recordedCount=Math.min(rawRecorded,total);
    const selected=Math.max(0,Math.min(Number(selectedSceneIndex)||0,Math.max(0,total-1)));

    return {
      format:'scene-studio-state',
      version:'1.0',
      rec:{
        nextIndex,
        recordedCount,
        ...(nextIndex<total && doc.scenes?.[nextIndex]?.id ? {nextSceneId:doc.scenes[nextIndex].id} : {})
      },
      editor:{
        selectedSceneIndex:selected,
        ...(doc.scenes?.[selected]?.id ? {selectedSceneId:doc.scenes[selected].id} : {})
      }
    };
  }

  function restoreStudioStateFromPackage(state,doc){
    const total=doc?.scenes?.length||0;
    if(!state || state.format!=='scene-studio-state' || String(state.version||'')!=='1.0'){
      autoRecProgress={nextIndex:0,recordedCount:0};
      selectedSceneIndex=0;
      return;
    }

    let nextIndex=Math.max(0,Number(state.rec?.nextIndex)||0);
    const nextSceneId=String(state.rec?.nextSceneId||'');
    if(nextSceneId){
      const byId=doc.scenes.findIndex(scene=>scene?.id===nextSceneId);
      if(byId>=0)nextIndex=byId;
    }
    nextIndex=Math.min(nextIndex,total);

    let recordedCount=Math.max(0,Number(state.rec?.recordedCount)||0);
    recordedCount=Math.min(recordedCount,total);

    autoRecProgress={nextIndex,recordedCount};

    let selected=Math.max(0,Number(state.editor?.selectedSceneIndex)||0);
    const selectedSceneId=String(state.editor?.selectedSceneId||'');
    if(selectedSceneId){
      const byId=doc.scenes.findIndex(scene=>scene?.id===selectedSceneId);
      if(byId>=0)selected=byId;
    }
    selectedSceneIndex=Math.max(0,Math.min(selected,Math.max(0,total-1)));
  }

  async function buildScenePackage(){
    const doc=sceneDocumentForExport();
    const packaged=clone(doc);
    const entries=[];
    const bySource=new Map();
    let assetCounter=0;

    const refs=[];
    walkAssetRefs(packaged,ref=>refs.push(ref));

    for(const ref of refs){
      if(!/^blob:/i.test(ref.src))continue;
      let assetPath=bySource.get(ref.src);
      if(!assetPath){
        const item=await resolveAssetBlob(ref.src);
        if(!item)continue;
        assetCounter++;
        const ext=assetExtension(item.name||ref.fileName,item.blob.type);
        const base=safeAssetBase(ref.fileName||item.name||`${ref.kind}_${assetCounter}`);
        assetPath=`assets/${String(assetCounter).padStart(3,'0')}_${ref.kind}_${base}${ext}`;
        bySource.set(ref.src,assetPath);
        entries.push({name:assetPath,bytes:await blobBytes(item.blob,ref.src)});
      }
      ref.holder[ref.key]=assetPath;
      ref.holder._editorFileName=ref.fileName || assetRegistry.get(ref.src)?.name || assetPath.split('/').pop();
    }

    let coverPath='';
    if(coverImageUrl && /^blob:/i.test(coverImageUrl)){
      const item=await resolveAssetBlob(coverImageUrl);
      if(item?.blob){
        const ext=assetExtension(item.name||coverImageFileName,item.blob.type);
        coverPath=`assets/images/cover${ext || '.jpg'}`;
        entries.push({name:coverPath,bytes:await blobBytes(item.blob,coverImageUrl)});
      }
    }

    const packageAssetCount=entries.length;
    packaged.package={format:'scene-package',version:'1.0',assetCount:packageAssetCount};

    const studioState=studioStateForPackage(packaged);

    let manifest;
    try{
      manifest=packageManifestFor(packaged,coverPath);
    }catch(e){
      console.warn('manifest metadata fallback',e);
      manifest={
        package:'scene-package', packageVersion:'1.0', sceneFormat:'1.0',
        title:packaged.title||'Untitled', author:packaged.author||'',
        language:packaged.language||'und', entry:'scene.json'
      };
      if(coverPath)manifest.cover={image:coverPath,fit:'cover',position:'center'};
    }

    entries.unshift(
      {name:'scene.json',bytes:ZIP_TEXT_ENCODER.encode(JSON.stringify(packaged,null,2))},
      {name:'manifest.json',bytes:ZIP_TEXT_ENCODER.encode(JSON.stringify(manifest,null,2))},
      {name:'studio-state.json',bytes:ZIP_TEXT_ENCODER.encode(JSON.stringify(studioState,null,2))}
    );

    const blob=await makeStoreZip(entries);
    return {doc:packaged,manifest,studioState,blob,assetCount:packageAssetCount};
  }

  async function exportScenePackage(){
    try{
      if(!advancedScreen.hidden)syncAdvancedFieldsToScene();
      const result=await buildScenePackage();
      const name=`${safeFileStem(result.doc.title)}.scene`;
      downloadBlobFile(name,result.blob);
      setProjectIoStatus(t('io.packageExported',{name,n:result.assetCount}));
    }catch(error){
      console.error(error);
      const detail=(error && (error.stack||error.message)) ? String(error.stack||error.message) : String(error);
      setProjectIoStatus(`${t('io.packageFailed')} ${detail.split('\n')[0]}`,{error:true});
      alert(`${t('io.packageFailed')}\n\n${detail}`);
    }
  }

  async function importScenePackage(file){
    try{
      const entries=await readZipEntries(file);
      const sceneBytes=entries.get('scene.json') || [...entries.entries()].find(([name])=>/\.scene\.json$/i.test(name))?.[1];
      if(!sceneBytes)throw new Error('scene-json-missing');

      const parsed=JSON.parse(ZIP_TEXT_DECODER.decode(sceneBytes).replace(/^\uFEFF/,''));
      const manifestBytes=entries.get('manifest.json');
      const manifest=manifestBytes ? JSON.parse(ZIP_TEXT_DECODER.decode(manifestBytes).replace(/^\uFEFF/,'')) : null;
      const studioStateBytes=entries.get('studio-state.json');
      let studioState=null;
      if(studioStateBytes){
        try{
          studioState=JSON.parse(ZIP_TEXT_DECODER.decode(studioStateBytes).replace(/^\uFEFF/,''));
        }catch(error){
          console.warn('Studio state could not be restored',error);
        }
      }
      const doc=validateSceneFormatV1(parsed);
      if(manifest){
        doc.metadata ||= {};
        doc.metadata.subtitle=manifest.subtitle||doc.metadata.subtitle||'';
        doc.metadata.seriesTitle=manifest.series?.title||doc.metadata.seriesTitle||'';
        doc.metadata.episode=manifest.series?.episode||doc.metadata.episode||'';
        if(languageInput)languageInput.value=['ja','en','mul'].includes(manifest.language)?manifest.language:'auto';
      }
      let restored=0;

      const refs=[];
      walkAssetRefs(doc,ref=>refs.push(ref));
      for(const ref of refs){
        const path=String(ref.src||'').replace(/^\.\//,'');
        if(!/^assets\//i.test(path))continue;
        const bytes=entries.get(path);
        if(!bytes)continue;
        const name=ref.fileName || path.split('/').pop() || 'asset';
        const blob=new Blob([bytes],{type:guessMime(name)});
        const url=URL.createObjectURL(blob);
        registerAsset(url,blob,name);
        ref.holder[ref.key]=url;
        ref.holder._editorFileName=name;
        restored++;
      }

      workingDocument=doc;
      latestPublishedId='';latestPublishedUrl='';latestPublishedFingerprint='';latestPublishedAt=0;
      currentDraftId=createDraftId();localStorage.setItem(DRAFT_LAST_KEY,currentDraftId);
      restoreStudioStateFromPackage(studioState,doc);
      easySourceDirty=false;
      restoreEasyStateFromDocument(doc);
      normalizeSceneIds();
      refreshDocumentLanguages();
      renderAdvanced();
      updateAutoRecStartLabel();
      setScreen('advanced');
      scrollScreenToTop(advancedScreen);
      if(manifest?.cover?.image && entries.get(manifest.cover.image)){
        const bytes=entries.get(manifest.cover.image);
        const blob=new Blob([bytes],{type:guessMime(manifest.cover.image)});
        coverImageUrl=URL.createObjectURL(blob);
        coverImageFileName=manifest.cover.image.split('/').pop()||'cover';
        assetRegistry.set(coverImageUrl,{blob,name:coverImageFileName});
        updateCoverPreview();
      } else {
        coverImageUrl=''; coverImageFileName=''; updateCoverPreview();
      }
      await saveDraftNow();
      setProjectIoStatus(t('io.packageImported',{name:file.name||'scene.zip',n:doc.scenes.length,a:restored}));
    }catch(error){
      console.error(error);
      setProjectIoStatus(t('io.packageInvalid'),{error:true});
      alert(t('io.packageInvalid'));
    }
  }

  function validateSceneFormatV1(value){
    if(!value || typeof value!=='object') throw new Error('not-object');
    const doc=value.format==='scene-format' ? value : (value.document?.format==='scene-format' ? value.document : value.sceneFormat?.format==='scene-format' ? value.sceneFormat : null);
    if(!doc) throw new Error('format');
    if(String(doc.version||'')!=='1.0') throw new Error('version');
    if(!Array.isArray(doc.scenes) || !doc.scenes.length) throw new Error('scenes');
    if(!['light','dark','cinema'].includes(doc.theme)) throw new Error('theme');
    const seen=new Set();
    doc.scenes.forEach((scene,index)=>{
      if(!scene || typeof scene!=='object') throw new Error(`scene-${index}`);
      if(!['text','dialogue','sound'].includes(scene.type)) throw new Error(`scene-type-${index}`);
      if(scene.type!=='sound' && typeof scene.text!=='string') throw new Error(`scene-text-${index}`);
      const id=String(scene.id||'').trim();
      if(!id || seen.has(id)) throw new Error(`scene-id-${index}`);
      seen.add(id);
    });
    return clone(doc);
  }
  function countLocalAssetRefs(doc){
    let count=0;
    const visit=(value)=>{
      if(!value)return;
      if(typeof value==='string'){ if(/^blob:/i.test(value))count++; return; }
      if(Array.isArray(value)){value.forEach(visit);return;}
      if(typeof value==='object')Object.values(value).forEach(visit);
    };
    visit(doc);
    return count;
  }
  function setProjectIoStatus(message,{error=false}={}){
    const el=$('#projectIoStatus'); if(!el)return;
    el.textContent=message||''; el.classList.toggle('is-error',Boolean(error));
  }
  function restoreEasyStateFromDocument(doc){
    titleInput.value=doc.title||'';
    authorInput.value=doc.author||'';
    if(subtitleInput)subtitleInput.value=doc.metadata?.subtitle||'';
    if(seriesTitleInput)seriesTitleInput.value=doc.metadata?.seriesTitle||'';
    if(episodeInput)episodeInput.value=doc.metadata?.episode||'';
    bodyInput.value=(doc.scenes||[]).map(scene=>scene.text||'').filter(Boolean).join('\n\n');
    updateCount();
    protectedResplitPending=false;
   
    applyTheme(doc.theme||'light');
    applyWorkFont(doc.appearance?.typography?.fontFamily||'serif');
    cinemaTone=doc.appearance?.cinemaTone==='light'?'light':'dark';
    $$('.cinema-tone-button').forEach(b=>{
      const on=b.dataset.tone===cinemaTone;
      b.classList.toggle('is-selected',on); b.setAttribute('aria-pressed',on?'true':'false');
    });
    const firstBackground=(doc.scenes||[]).map(s=>s.presentation?.background).find(bg=>bg?.src);
    cinemaBackgroundUrl=doc.theme==='cinema' ? (firstBackground?.src||'') : '';
    const preview=$('#cinemaBackgroundPreview'), clear=$('#cinemaBackgroundClear');
    if(preview){
      preview.hidden=!cinemaBackgroundUrl;
      preview.style.backgroundImage=cinemaBackgroundUrl?`url("${cinemaBackgroundUrl}")`:'';
    }
    if(clear) clear.hidden=!cinemaBackgroundUrl;
  }
  function exportSceneDocument(){
    try{
      const doc=sceneDocumentForExport();
      const name=`${safeFileStem(doc.title)}.scene.json`;
      downloadTextFile(name,JSON.stringify(doc,null,2));
      setProjectIoStatus(t('io.exported',{name}));
    }catch(error){
      console.error(error); setProjectIoStatus(t('io.invalid'),{error:true});
    }
  }
  async function importSceneDocument(file){
    try{
      const raw=await file.text();
      const parsed=JSON.parse(raw.replace(/^\uFEFF/,''));
      const doc=validateSceneFormatV1(parsed);
      workingDocument=doc;
      latestPublishedId='';latestPublishedUrl='';latestPublishedFingerprint='';latestPublishedAt=0;
      currentDraftId=createDraftId();localStorage.setItem(DRAFT_LAST_KEY,currentDraftId);
      autoRecProgress={nextIndex:0,recordedCount:0};
      easySourceDirty=false;
      selectedSceneIndex=0;
      restoreEasyStateFromDocument(doc);
      normalizeSceneIds();
      refreshDocumentLanguages();
      renderAdvanced();
      setScreen('advanced');
      scrollScreenToTop(advancedScreen);
      const localRefs=countLocalAssetRefs(doc);
      let message=t('io.imported',{name:file.name||'scene.json',n:doc.scenes.length});
      if(localRefs) message+=` ${t('io.localAssets',{n:localRefs})}`;
      setProjectIoStatus(message);
    }catch(error){
      console.error(error); setProjectIoStatus(t('io.invalid'),{error:true});
      alert(t('io.invalid'));
    }
  }

  function updateCount(){ charCount.textContent = t('body.chars',{n:bodyInput.value.length.toLocaleString(uiLanguage==='ja'?'ja-JP':'en-US')}); }
  function autoGrowSubText(){
    const el=$('#sceneSubTextInput');
    if(!el)return;
    el.style.height='auto';
    const max=150;
    el.style.height=`${Math.min(Math.max(el.scrollHeight,72),max)}px`;
    el.style.overflowY=el.scrollHeight>max?'auto':'hidden';
  }

  function applyTheme(theme){ selectedTheme=theme; if(workingDocument) workingDocument.theme=theme; $$('.theme-card').forEach(card=>{const on=card.dataset.theme===theme;card.classList.toggle('is-selected',on);card.setAttribute('aria-pressed',on?'true':'false');}); $('#cinemaBackgroundPanel').hidden=theme!=='cinema'; }
  function applyWorkFont(font){
    selectedFont=['serif','sans','mono'].includes(font)?font:'serif';
    $$('.work-font-card').forEach(card=>{
      const on=card.dataset.font===selectedFont;
      card.classList.toggle('is-selected',on);
      card.setAttribute('aria-pressed',on?'true':'false');
    });
    if(workingDocument){
      workingDocument.appearance=workingDocument.appearance||{};
      workingDocument.appearance.typography=workingDocument.appearance.typography||{};
      workingDocument.appearance.typography.fontFamily=selectedFont;
    }
  }
  // AUTO REC v1 — author pacing recorder.
  let autoRecActive=false;
  let autoRecStartedAt=0;
  let autoRecSceneStartedAt=0;
  let autoRecDurations=[];
  let autoRecRaf=0;
  let autoRecCurrentIndex=0;

  function formatAutoRecTime(ms){
    const total=Math.max(0,Number(ms)||0)/1000;
    const m=Math.floor(total/60);
    const s=Math.floor(total%60);
    const d=Math.floor((total-Math.floor(total))*10);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`;
  }

  function renderAutoRecUI(){
    const start=$('#autoRecStart'),live=$('#autoRecLive'),done=$('#autoRecDone');
    if(start)start.hidden=autoRecActive;
    if(live)live.hidden=!autoRecActive;
    if(autoRecActive && done)done.hidden=true;
    if(!autoRecActive)return;
    const now=performance.now();
    const clock=$('#autoRecClock'),count=$('#autoRecCount');
    if(clock)clock.textContent=formatAutoRecTime(now-autoRecStartedAt);
    if(count){
      const current=Math.min((player?.index ?? 0)+1,workingDocument?.scenes?.length||1);
      count.textContent=`${current} / ${workingDocument?.scenes?.length||1}`;
    }
    autoRecRaf=requestAnimationFrame(renderAutoRecUI);
  }

  function updateAutoRecStartLabel(){
    const btn=$('#autoRecStart');if(!btn)return;
    const total=workingDocument?.scenes?.length||0;
    const next=Math.min(autoRecProgress?.nextIndex||0,total);
    btn.textContent=next>0&&next<total
      ? `● AUTO REC ${t('rec.continue')} ${next+1}/${total}`
      : '● AUTO REC';
  }

  function startAutoRec(){
    if(!workingDocument?.scenes?.length)return;
    const total=workingDocument.scenes.length;
    let startAt=Math.min(Math.max(0,Number(autoRecProgress?.nextIndex)||0),total-1);
    if(startAt>=total-1 && (autoRecProgress?.recordedCount||0)>=total){autoRecProgress={nextIndex:0,recordedCount:0};startAt=0;}
    const p=ensurePlayer();
    p.stopAuto?.();p.load(getDocumentForPlayback(),{startAt});p.unlockAudio?.(true);
    autoRecActive=true;syncPublishPreviewButton(false);autoRecDurations=[];autoRecCurrentIndex=startAt;
    autoRecStartedAt=performance.now();autoRecSceneStartedAt=autoRecStartedAt;
    const done=$('#autoRecDone'); if(done)done.hidden=true;
    renderAutoRecUI();
  }

  function recordAutoRecBoundary(){
    if(!autoRecActive)return;
    const now=performance.now();
    const duration=Math.max(150,Math.round(now-autoRecSceneStartedAt));
    autoRecDurations.push(duration);
    if(workingDocument?.scenes?.[autoRecCurrentIndex])workingDocument.scenes[autoRecCurrentIndex].pause=duration;
    autoRecCurrentIndex=Math.min(autoRecCurrentIndex+1,(workingDocument?.scenes?.length||1)-1);
    autoRecProgress={nextIndex:autoRecCurrentIndex,recordedCount:Math.max(autoRecProgress?.recordedCount||0,autoRecCurrentIndex)};
    autoRecSceneStartedAt=now;
    updateAutoRecStartLabel();scheduleDraftSave(80);
  }

  function finishAutoRec(save=true){
    if(!autoRecActive)return;
    cancelAnimationFrame(autoRecRaf);
    if(save && autoRecDurations.length<(workingDocument?.scenes?.length||0)){
      autoRecDurations.push(Math.max(150,Math.round(performance.now()-autoRecSceneStartedAt)));
    }
    autoRecActive=false;
    const start=$('#autoRecStart'),live=$('#autoRecLive'),done=$('#autoRecDone');
    if(live)live.hidden=true;
    if(save){
      const finalDuration=Math.max(150,Math.round(performance.now()-autoRecSceneStartedAt));
      if(workingDocument?.scenes?.[autoRecCurrentIndex])workingDocument.scenes[autoRecCurrentIndex].pause=finalDuration;
      const count=workingDocument?.scenes?.length||0;
      autoRecProgress={nextIndex:count,recordedCount:count};
      updateAutoRecStartLabel();scheduleDraftSave(80);
      const total=autoRecDurations.reduce((a,b)=>a+b,0)+finalDuration;
      const summary=$('#autoRecSummary');
      if(summary)summary.textContent=`${autoRecDurations.length} Scene / ${formatAutoRecTime(total)}`;
      if(done)done.hidden=false;
      if(start)start.hidden=true;
    }else{
      if(done)done.hidden=true;
      if(start)start.hidden=false;
      updateAutoRecStartLabel();scheduleDraftSave(80);
    }
  }

  // ---------------------------------------------------------
  // Publish UI mock v0.2.45 — 3 publication states
  // unpublished / published-clean / published-dirty
  // Replace only publishAdapter.publish() when Hosting API is ready.
  // ---------------------------------------------------------
  const publishAdapter={
    async publish(sceneDocument,{id=''}={}){
      await new Promise(resolve=>setTimeout(resolve,1100));
      const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      let finalId=id;
      if(!finalId){
        const bytes=new Uint8Array(8);
        if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(bytes);
        else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
        finalId='';
        for(const b of bytes)finalId+=alphabet[b%alphabet.length];
      }
      return {id:finalId,url:`https://scene.example/s/${finalId}`};
    }
  };

  let latestPublishedId='';
  let latestPublishedUrl='';
  let latestPublishedFingerprint='';
  let latestPublishedAt=0;

  function stablePublishValue(value){
    if(value===null || value===undefined)return value;
    if(typeof value==='string'){
      if(/^blob:/i.test(value)){
        const asset=assetRegistry.get(value);
        if(asset?.blob){
          return `asset:${asset.name||'asset'}:${asset.blob.size||0}:${asset.blob.type||''}`;
        }
      }
      return value;
    }
    if(Array.isArray(value))return value.map(stablePublishValue);
    if(typeof value==='object'){
      const out={};
      Object.keys(value).sort().forEach(key=>{out[key]=stablePublishValue(value[key]);});
      return out;
    }
    return value;
  }

  function currentPublishFingerprint(){
    if(!workingDocument?.scenes?.length)return '';
    try{
      return JSON.stringify(stablePublishValue(getDocumentForPlayback()));
    }catch(_){
      return '';
    }
  }

  function currentPublishStatus(){
    if(!latestPublishedUrl)return 'unpublished';
    const now=currentPublishFingerprint();
    return now && latestPublishedFingerprint===now ? 'published' : 'dirty';
  }

  function setPublishState(name){
    ['Ready','Working','Success','Error'].forEach(key=>{
      const el=$(`#publishState${key}`);
      if(el)el.hidden=key.toLowerCase()!==name;
    });
    // State panels are dynamic; re-apply language whenever the visible state changes.
    const stateMap={
      Working:[['#publishStateWorking h2','publish.working'],['#publishStateWorking p','publish.workingText']],
      Success:[['#publishStateSuccess h2','publish.success'],['#publishShareButton','publish.share'],['#publishCopyButton','publish.copy'],['#publishStateSuccess .publish-mock-note','publish.mockNote']],
      Error:[['#publishStateError h2','publish.failed'],['#publishStateError p','publish.failedText'],['#publishRetryButton','publish.retry']]
    };
    const key=name.charAt(0).toUpperCase()+name.slice(1);
    (stateMap[key]||[]).forEach(([sel,msg])=>{const el=$(sel);if(el)el.textContent=t(msg);});
  }

  function syncPublishCopyForStatus(){
    const status=currentPublishStatus();
    const readyTitle=$('#publishReadyTitle');
    const readyText=$('#publishReadyText');
    const confirm=$('#publishConfirmButton');

    if(status==='dirty'){
      if(readyTitle)readyTitle.textContent=t('publish.updateReady');
      if(readyText)readyText.textContent=t('publish.updateText');
      if(confirm)confirm.textContent=t('publish.update');
    }else{
      if(readyTitle)readyTitle.textContent=t('publish.ready');
      if(readyText)readyText.textContent=t('publish.readyText');
      if(confirm)confirm.textContent=t('publish.action');
    }

    const endButton=$('#publishFromPreviewButton');
    if(endButton){
      endButton.textContent=status==='published'?t('publish.published'):status==='dirty'?t('publish.update'):t('publish.action');
      endButton.classList.toggle('is-published',status==='published');
      endButton.classList.toggle('is-dirty',status==='dirty');
    }
  }

  function openPublishDialog(){
    if(!workingDocument?.scenes?.length)return;
    const status=currentPublishStatus();
    syncPublishCopyForStatus();

    if(status==='published'){
      const text=$('#publishUrlText');
      if(text)text.textContent=latestPublishedUrl;
      setPublishState('success');
    }else{
      setPublishState('ready');
    }
    $('#publishDialog')?.showModal();
  }

  function closePublishDialog(){
    $('#publishDialog')?.close();
  }

  async function runMockPublish(){
    if(!workingDocument?.scenes?.length)return;
    const wasUpdate=currentPublishStatus()==='dirty';
    setPublishState('working');
    try{
      const result=await publishAdapter.publish(
        getDocumentForPlayback(),
        {id:wasUpdate?latestPublishedId:''}
      );
      if(!result?.url)throw new Error('Publish URL missing');

      latestPublishedId=result.id||latestPublishedId;
      latestPublishedUrl=result.url;
      latestPublishedFingerprint=currentPublishFingerprint();
      latestPublishedAt=Date.now();

      const text=$('#publishUrlText');
      if(text)text.textContent=latestPublishedUrl;
      setPublishState('success');
      syncPublishCopyForStatus();
      await saveDraftNow();

    }catch(error){
      console.warn('Publish mock failed',error);
      setPublishState('error');
    }
  }

  async function copyPublishedUrl(){
    if(!latestPublishedUrl)return;
    try{
      await navigator.clipboard.writeText(latestPublishedUrl);
      const btn=$('#publishCopyButton');
      if(btn){
        const before=btn.textContent;
        btn.textContent=t('draft.copied');
        setTimeout(()=>btn.textContent=before,1400);
      }
    }catch(_){
      const ta=document.createElement('textarea');
      ta.value=latestPublishedUrl;
      ta.style.position='fixed';
      ta.style.opacity='0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  async function sharePublishedUrl(){
    if(!latestPublishedUrl)return;
    const shareData={
      title:workingDocument?.title||'Scene',
      text:workingDocument?.title||'Scene',
      url:latestPublishedUrl
    };
    if(navigator.share){
      try{
        await navigator.share(shareData);
        return;
      }catch(error){
        if(error?.name==='AbortError')return;
      }
    }
    await copyPublishedUrl();
  }

  function syncPublishPreviewButton(show=false){
    const btn=$('#publishFromPreviewButton');
    if(!btn)return;
    btn.hidden=!(show && !autoRecActive && !playerScreen.hidden);
    if(!btn.hidden)syncPublishCopyForStatus();
  }

  function ensurePlayer(){
    if(player)return player;
    player=new ScenePlayerCore(playerHost,{allowPrevious:true,keyboard:true,swipe:true,endOnNextAction:true,maxStackVisible:4,autoDelay:2600,uiLanguage});
    playerHost.addEventListener('sceneplayer:scenechange',(event)=>{
      syncPublishPreviewButton(false);
      if(autoRecActive && event.detail?.direction==='next')recordAutoRecBoundary();
    });
    playerHost.addEventListener('sceneplayer:end',()=>{
      if(autoRecActive){finishAutoRec(true);syncPublishPreviewButton(false);}
      else syncPublishPreviewButton(true);
    });
    playerHost.addEventListener('sceneplayer:restart',()=>{
      // 「最初から読む」でEND画面を離れた瞬間に、
      // 公開状態は保持したまま公開ボタンだけ非表示へ戻す。
      syncPublishPreviewButton(false);
    });
    return player;
  }
  function syncUndoVisibilityForScreen(name){
    const inPlayer=name==='player';
    const bar=$('#undoBar'), compact=$('#undoCompactButton');
    // Preview / AUTO REC is a reader-facing surface. Keep the undo snapshot,
    // but never let Studio undo controls overlap the Player.
    if(inPlayer){
      if(undoBarTimer)window.clearTimeout(undoBarTimer);
      undoBarTimer=null;
      if(bar){bar.hidden=true;bar.classList.remove('is-visible','is-hiding');}
      if(compact)compact.hidden=true;
      return;
    }
    // Returning to Easy / Advanced restores only the compact affordance.
    // The undo history itself has remained untouched while previewing.
    if(undoSnapshot && compact)compact.hidden=false;
  }
  function setScreen(name){ editorScreen.hidden=name!=='easy'; advancedScreen.hidden=name!=='advanced'; playerScreen.hidden=name!=='player'; const open=name==='player'; document.documentElement.classList.toggle('easy-player-open',open); document.body.classList.toggle('easy-player-open',open); syncUndoVisibilityForScreen(name); }
  function scrollScreenToTop(screen){
    // iOS Safari/Chrome can preserve the document scroll position when a hidden
    // Studio screen is swapped in. Reset both the page and the screen itself.
    if(screen) screen.scrollTop=0;
    const reset=()=>window.scrollTo(0,0);
    reset();
    requestAnimationFrame(()=>{ reset(); requestAnimationFrame(reset); });
  }

  function getDocumentForPlayback(){ return clone(workingDocument || buildSceneDocument()); }
  function openPlayer({from='easy', startAt=0}={}){
    if(from==='easy'){
      if(!bodyInput.value.trim() && !workingDocument){bodyInput.focus();return;}
      ensureWorkingDocumentFromEasy();
      syncEasyShellToWorkingDocument();
    } else {
      // Advanced edits write directly into the authoritative Scene document.
      syncAdvancedFieldsToScene();
    }
    if(!workingDocument?.scenes?.length)return;
    playerReturnTarget=from;
    setScreen('player');
    syncPublishPreviewButton(false);
    const p=ensurePlayer();
    p.setUILanguage?.(uiLanguage);
    p.load(getDocumentForPlayback(),{startAt});

    // openPlayer itself is called from the author's Play/Confirm click.
    // Use that trusted gesture to unlock/arm audio AFTER load(), so Scene 1
    // BGM/Ambient/SE can begin on the first Scene instead of waiting for the
    // reader's next tap (especially important on iOS/WebKit).
    p.unlockAudio(true);
  }
  function closePlayer(){ syncPublishPreviewButton(false); if(autoRecActive)finishAutoRec(false); if(player){player.stopAuto();player._stopAllAudio?.(true);} setScreen(playerReturnTarget==='advanced'?'advanced':'easy'); if(playerReturnTarget==='advanced') renderAdvanced(); else window.scrollTo({top:0,left:0,behavior:'instant'}); }

  function openAdvanced(){
    if(!bodyInput.value.trim() && !workingDocument){bodyInput.focus();return;}
    ensureWorkingDocumentFromEasy();
    syncEasyShellToWorkingDocument();
    selectedSceneIndex=Math.max(0,Math.min(selectedSceneIndex,workingDocument.scenes.length-1));
    renderAdvanced(); updateEasyFileActions(); setScreen('advanced'); scrollScreenToTop(advancedScreen);
  }
  function closeAdvanced(){
    syncAdvancedFieldsToScene();
    restoreEasyStateFromDocument(workingDocument);
    easySourceDirty=false;
    updateEasyFileActions();
    setScreen('easy');
  }

  function currentScene(){ return workingDocument?.scenes?.[selectedSceneIndex] || null; }
  function ensurePresentation(scene){ scene.presentation ||= {}; scene.presentation.text ||= {}; return scene.presentation; }

  const pct = (value, fallback=0) => Math.max(0, Math.min(100, Number(value ?? fallback))) / 100;
  const ms = (value, fallback=0) => Math.max(0, Number(value ?? fallback) || 0);
  function managedAudio(scene, channel){ return (scene.audio || []).find(c => c?._editorManaged && c.channel === channel) || null; }
  function setManagedAudio(scene, channel, command){
    const rest=(scene.audio || []).filter(c => !(c?._editorManaged && c.channel === channel));
    if(command) rest.push({...command, _editorManaged:true});
    if(rest.length) scene.audio=rest; else delete scene.audio;
  }
  function setAssetField(id, url='', name=''){
    const el=$('#'+id); if(!el)return; el.dataset.assetUrl=url||''; el.dataset.assetName=name||'';
  }
  function assetFrom(id){ const el=$('#'+id); return {src:el?.dataset.assetUrl||'', name:el?.dataset.assetName||''}; }

  function isExternalAssetUrl(value){
    const raw=String(value||'').trim();
    if(!raw || /^javascript:/i.test(raw)) return false;
    if(/^blob:/i.test(raw)) return false;
    // Absolute http(s), data URLs, and relative paths are valid Scene Format refs.
    return /^(https?:|data:)/i.test(raw) || /^(\.\/|\.\.\/|\/)/.test(raw);
  }

  function externalAssetLabel(value){
    const raw=String(value||'').trim();
    try{
      const u=new URL(raw,location.href);
      const last=u.pathname.split('/').filter(Boolean).pop();
      return last || u.hostname || t('audio.configured');
    }catch(_){
      return raw.split('/').pop() || t('audio.configured');
    }
  }

  function setExternalAsset(inputId,urlInputId,value){
    const raw=String(value||'').trim();
    if(!isExternalAssetUrl(raw)){
      alert(t('asset.invalidUrl'));
      return false;
    }
    const current=assetFrom(inputId).src;
    if(current && assetRegistry.has(current)) unregisterAsset(current);
    setAssetField(inputId,raw,externalAssetLabel(raw));
    const field=$('#'+urlInputId); if(field)field.value=raw;
    return true;
  }

  function loadExternalUrlField(inputId,urlInputId){
    const src=assetFrom(inputId).src;
    const field=$('#'+urlInputId);
    if(field) field.value=(src && !/^blob:/i.test(src)) ? src : '';
  }

  function bindExternalAssetUrl({inputId,urlInputId,applyId,onApply}){
    const field=$('#'+urlInputId), button=$('#'+applyId);
    if(!field||!button)return;
    const commit=()=>{
      if(setExternalAsset(inputId,urlInputId,field.value)){
        onApply?.();
        updateAdvancedConditionalUI();
        syncAdvancedFieldsToScene();
        renderSceneList();
      }
    };
    button.addEventListener('click',commit);
    field.addEventListener('keydown',(e)=>{
      if(e.key==='Enter'){ e.preventDefault(); commit(); }
    });
  }
  function updateAssetLabel(id, inputId){ const el=$('#'+id), asset=assetFrom(inputId); if(el)el.textContent=asset.name || (asset.src ? t('audio.configured') : t('audio.notSelected')); }
  function updateRangeOutput(inputId, outputId){ const input=$('#'+inputId), output=$('#'+outputId); if(input&&output) output.value=`${input.value}%`; }
  function updateMotionPreview(restart=true){
    const wrap=$('#sceneMotionPreview'), layer=$('#sceneMotionPreviewImage'), veil=$('#sceneMotionPreviewVeil'), label=$('#sceneMotionPreviewLabel');
    if(!wrap||!layer)return;
    const asset=assetFrom('sceneBackgroundInput');
    const motion=$('#sceneBackgroundMotion')?.value || 'none';
    const transition=$('#sceneBackgroundTransition')?.value || 'fade';
    const fit=$('#sceneBackgroundFit')?.value || 'cover';
    const dim=Math.max(0,Math.min(85,Number($('#sceneBackgroundDim')?.value||0)));
    const transitionMs=Math.max(0,Number($('#sceneBackgroundTransitionDuration')?.value||700));
    const motionMs=Math.max(250,Number($('#sceneBackgroundMotionDuration')?.value||6500));
    const amount=Math.max(1,Number($('#sceneBackgroundMotionAmount')?.value||9));

    layer.className='scene-motion-preview-image';
    wrap.classList.remove('preview-cut','preview-fade','preview-flash','preview-glitch','is-previewing');
    layer.style.backgroundImage=asset.src?`url("${asset.src}")`:'';
    layer.style.backgroundSize=fit;
    layer.style.setProperty('--studio-motion-duration',`${motionMs}ms`);
    layer.style.setProperty('--studio-motion-amount',`${amount}%`);
    layer.style.setProperty('--studio-motion-scale',String(1+amount/100));
    wrap.style.setProperty('--studio-transition-duration',`${transitionMs}ms`);
    if(motion!=='none')layer.classList.add(`motion-${motion}`);
    if(veil)veil.style.background=`rgba(0,0,0,${dim/100})`;

    const names={none:t('motion.none'),slowZoom:'SLOW ZOOM',breath:'BREATH',panLeft:'PAN LEFT',panRight:'PAN RIGHT',panUp:'PAN UP',panDown:'PAN DOWN'};
    const transitionNames={fade:'FADE',cut:'CUT',flash:'FLASH',glitch:'GLITCH'};
    if(label)label.textContent=`${transitionNames[transition]||transition.toUpperCase()} / ${fit.toUpperCase()} / ${names[motion]||motion} / ${dim}%`;

    if(restart){
      wrap.classList.add(`preview-${transition}`);
      void wrap.offsetWidth;
      wrap.classList.add('is-previewing');
    }
  }


  function updateAdvancedConditionalUI(){
    const bgMode=$('#sceneBackgroundMode')?.value || 'inherit';
    $('#sceneBackgroundControls').hidden=bgMode!=='image';
    const bgAsset=assetFrom('sceneBackgroundInput');
    const bgPreview=$('#sceneBackgroundPreview');
    if(bgPreview){ bgPreview.hidden=!bgAsset.src; bgPreview.style.backgroundImage=bgAsset.src?`url("${bgAsset.src}")`:''; }
    updateRangeOutput('sceneBackgroundDim','sceneBackgroundDimOutput');
    const transitionOut=$('#sceneBackgroundTransitionDurationOutput');
    if(transitionOut)transitionOut.textContent=`${$('#sceneBackgroundTransitionDuration')?.value||700}ms`;
    const motionDurationOut=$('#sceneBackgroundMotionDurationOutput');
    if(motionDurationOut)motionDurationOut.textContent=`${$('#sceneBackgroundMotionDuration')?.value||6500}ms`;
    const motionAmountOut=$('#sceneBackgroundMotionAmountOutput');
    if(motionAmountOut)motionAmountOut.textContent=`${$('#sceneBackgroundMotionAmount')?.value||9}%`;
    updateMotionPreview();
    const dimLabel=$('#sceneBackgroundDimLabel');
    if(dimLabel){
      const lightCinema=workingDocument?.theme==='cinema' && workingDocument?.appearance?.cinemaTone==='light';
      dimLabel.textContent=lightCinema?t('background.thin'):t('background.dim');
    }
    ['Bgm','Ambient'].forEach(prefix=>{
      const action=$(`#scene${prefix}Action`).value;
      $(`#scene${prefix}StartFields`).hidden=action!=='start';
      $(`#scene${prefix}VolumeFields`).hidden=action!=='volume';
      $(`#scene${prefix}StopFields`).hidden=action!=='stop';
      updateAssetLabel(`scene${prefix}FileLabel`,`scene${prefix}Input`);
      updateRangeOutput(`scene${prefix}Volume`,`scene${prefix}VolumeOutput`);
      updateRangeOutput(`scene${prefix}VolumeChange`,`scene${prefix}VolumeChangeOutput`);
    });
    $('#sceneSeFields').hidden=!$('#sceneSeEnabled').checked;
    updateAssetLabel('sceneSeFileLabel','sceneSeInput');
    updateRangeOutput('sceneSeVolume','sceneSeVolumeOutput');
  }
  function syncBackgroundFields(scene){
    const p=ensurePresentation(scene), mode=$('#sceneBackgroundMode').value;
    if(mode==='inherit') delete p.background;
    else if(mode==='clear') p.background={src:'',transition:'fade',_editorManaged:true};
    else {
      const asset=assetFrom('sceneBackgroundInput');
      const bg=p.background && typeof p.background==='object' ? {...p.background} : {};
      bg.src=asset.src || bg.src || '';
      bg._editorFileName=asset.name || bg._editorFileName || '';
      bg._editorManaged=true;
      bg.transition=$('#sceneBackgroundTransition').value;
      bg.fit=$('#sceneBackgroundFit').value;
      bg.dim=pct($('#sceneBackgroundDim').value,34);
      bg.transitionDuration=Math.max(0,Number($('#sceneBackgroundTransitionDuration')?.value||700));
      const motion=$('#sceneBackgroundMotion').value;
      if(motion==='none') delete bg.motion;
      else {
        const duration=Math.max(250,Number($('#sceneBackgroundMotionDuration')?.value||6500));
        const amount=Math.max(1,Number($('#sceneBackgroundMotionAmount')?.value||9));
        bg.motion={
          type:motion,
          duration,
          pan:amount,
          scaleFrom: motion==='slowZoom' ? 1 : 1+amount/200,
          scaleTo: 1+amount/100
        };
      }
      p.background=bg;
    }
  }
  function syncPersistentAudio(scene, prefix, channel){
    const action=$(`#scene${prefix}Action`).value;
    if(action==='inherit'){ setManagedAudio(scene,channel,null); return; }
    if(action==='start'){
      const asset=assetFrom(`scene${prefix}Input`); const existing=managedAudio(scene,channel);
      const src=asset.src || (existing?.action==='start'?existing.src:'');
      if(!src){ setManagedAudio(scene,channel,null); return; }
      setManagedAudio(scene,channel,{channel,action:'start',src,volume:pct($(`#scene${prefix}Volume`).value,50),fadeIn:ms($(`#scene${prefix}FadeIn`).value),fadeOut:ms($(`#scene${prefix}FadeOut`).value),loop:$(`#scene${prefix}Loop`).checked,restart:true,_editorFileName:asset.name||existing?._editorFileName||''});
    } else if(action==='volume'){
      setManagedAudio(scene,channel,{channel,action:'volume',volume:pct($(`#scene${prefix}VolumeChange`).value,30),fade:ms($(`#scene${prefix}VolumeFade`).value)});
    } else if(action==='stop'){
      setManagedAudio(scene,channel,{channel,action:'stop',fadeOut:ms($(`#scene${prefix}StopFade`).value,600)});
    }
  }
  function syncAudioFields(scene){
    syncPersistentAudio(scene,'Bgm','bgm');
    syncPersistentAudio(scene,'Ambient','ambient');
    if(!$('#sceneSeEnabled').checked){ setManagedAudio(scene,'oneshot',null); return; }
    const asset=assetFrom('sceneSeInput'), existing=managedAudio(scene,'oneshot'); const src=asset.src || existing?.src || '';
    if(!src){ setManagedAudio(scene,'oneshot',null); return; }
    setManagedAudio(scene,'oneshot',{channel:'oneshot',role:'se',action:'play',src,volume:pct($('#sceneSeVolume').value,80),fadeIn:ms($('#sceneSeFadeIn').value),_editorFileName:asset.name||existing?._editorFileName||''});
  }
  function loadPersistentAudio(scene,prefix,channel,defaults){
    const cmd=managedAudio(scene,channel); const action=cmd?.action || 'inherit'; $(`#scene${prefix}Action`).value=action;
    setAssetField(`scene${prefix}Input`,cmd?.src||'',cmd?._editorFileName||'');
    loadExternalUrlField(`scene${prefix}Input`,`scene${prefix}UrlInput`);
    $(`#scene${prefix}Loop`).checked=cmd?.loop!==false;
    $(`#scene${prefix}Volume`).value=Math.round((cmd?.action==='start'?cmd.volume:defaults.volume)*100);
    $(`#scene${prefix}FadeIn`).value=cmd?.fadeIn ?? defaults.fadeIn; $(`#scene${prefix}FadeOut`).value=cmd?.fadeOut ?? defaults.fadeOut;
    $(`#scene${prefix}VolumeChange`).value=Math.round((cmd?.action==='volume'?cmd.volume:defaults.changeVolume)*100); $(`#scene${prefix}VolumeFade`).value=cmd?.fade ?? defaults.volumeFade;
    $(`#scene${prefix}StopFade`).value=cmd?.fadeOut ?? defaults.stopFade;
  }
  function loadMediaFields(scene){
    const bg=scene.presentation?.background;
    let mode='inherit'; if(bg && typeof bg==='object') mode=bg.src ? 'image' : 'clear';
    $('#sceneBackgroundMode').value=mode;
    setAssetField('sceneBackgroundInput',bg?.src||'',bg?._editorFileName||'');
    loadExternalUrlField('sceneBackgroundInput','sceneBackgroundUrlInput');
    $('#sceneBackgroundTransition').value=bg?.transition||'fade'; $('#sceneBackgroundFit').value=bg?.fit||'cover'; $('#sceneBackgroundMotion').value=bg?.motion?.type||'none'; $('#sceneBackgroundDim').value=Math.round((bg?.dim ?? 0.34)*100);
    $('#sceneBackgroundTransitionDuration').value=bg?.transitionDuration ?? 700;
    $('#sceneBackgroundMotionDuration').value=bg?.motion?.duration ?? (bg?.motion?.type==='breath'?4200:6500);
    $('#sceneBackgroundMotionAmount').value=bg?.motion?.pan ?? 9;
    loadPersistentAudio(scene,'Bgm','bgm',{volume:.5,fadeIn:800,fadeOut:800,changeVolume:.3,volumeFade:500,stopFade:800});
    loadPersistentAudio(scene,'Ambient','ambient',{volume:.35,fadeIn:600,fadeOut:600,changeVolume:.25,volumeFade:500,stopFade:600});
    const se=managedAudio(scene,'oneshot'); $('#sceneSeEnabled').checked=Boolean(se); setAssetField('sceneSeInput',se?.src||'',se?._editorFileName||''); loadExternalUrlField('sceneSeInput','sceneSeUrlInput'); $('#sceneSeVolume').value=Math.round((se?.volume ?? .8)*100); $('#sceneSeFadeIn').value=se?.fadeIn ?? 0;
    updateAdvancedConditionalUI();
  }
  const DEFAULT_AUTO_SECONDS=2.6;

  function sceneAutoSeconds(scene=currentScene()){
    const pause=Number(scene?.pause);
    return Number.isFinite(pause) && pause>0 ? pause/1000 : DEFAULT_AUTO_SECONDS;
  }

  function updateAutoTimingFields(){
    const scene=currentScene();
    if(!scene)return;
    const input=$('#sceneAutoTimingInput');
    const state=$('#sceneAutoTimingState');
    const hasRecorded=Number.isFinite(Number(scene.pause)) && Number(scene.pause)>0;
    const seconds=sceneAutoSeconds(scene);
    if(input)input.value=seconds.toFixed(2);
    if(state){
      state.textContent=hasRecorded ? t('auto.recorded',{s:seconds.toFixed(2)}) : t('auto.unrecorded',{s:DEFAULT_AUTO_SECONDS.toFixed(2)});
      state.classList.toggle('is-recorded',hasRecorded);
    }
  }

  function commitAutoTimingFromInput(){
    const scene=currentScene();
    const input=$('#sceneAutoTimingInput');
    if(!scene||!input)return;
    const seconds=Math.max(.15,Math.min(60,Number(input.value)||DEFAULT_AUTO_SECONDS));
    scene.pause=Math.round(seconds*1000);
    input.value=seconds.toFixed(2);
    updateAutoTimingFields();
    renderSceneList();
  }

  function nudgeAutoTiming(delta){
    const scene=currentScene();
    if(!scene)return;
    const next=Math.max(.15,Math.min(60,sceneAutoSeconds(scene)+Number(delta||0)));
    scene.pause=Math.round(next*1000);
    updateAutoTimingFields();
    renderSceneList();
  }

  function resetAutoTiming(){
    const scene=currentScene();
    if(!scene)return;
    delete scene.pause;
    updateAutoTimingFields();
    renderSceneList();
  }

  function syncAdvancedFieldsToScene(){
    const scene=currentScene(); if(!scene)return;
    const autoInput=$('#sceneAutoTimingInput');
    if(autoInput && document.activeElement===autoInput){
      const seconds=Math.max(.15,Math.min(60,Number(autoInput.value)||DEFAULT_AUTO_SECONDS));
      scene.pause=Math.round(seconds*1000);
    }
    scene.text=$('#sceneTextInput').value;
    const sub=$('#sceneSubTextInput').value; if(sub)scene.subText=sub; else delete scene.subText;
    scene.type=$('#sceneTypeSelect').value;
    const p=ensurePresentation(scene); p.display=$('#sceneDisplaySelect').value; p.effect=$('#sceneEffectSelect').value; p.text.size=$('#sceneSizeSelect').value;
    const colorChoice=$('#sceneColorSelect')?.value || 'auto';
    if(colorChoice==='white') p.text.color='#ffffff';
    else if(colorChoice==='black') p.text.color='#000000';
    else if(colorChoice==='custom') p.text.color=$('#sceneColorCustomInput')?.value || '#ffffff';
    else delete p.text.color;
    const shadowChoice=$('#sceneShadowSelect')?.value || 'auto';
    if(shadowChoice==='auto') delete p.text.shadow;
    else p.text.shadow=shadowChoice;
    const sceneFont=$('#sceneFontSelect').value;
    if(sceneFont && sceneFont!=='inherit') p.text.fontFamily=sceneFont;
    else delete p.text.fontFamily;
    const languageChoice=$('#sceneLanguageSelect')?.value || 'auto';
    if(languageChoice==='auto'){
      if(workingDocument?.language==='mul' && scene.text?.trim()) scene.language=SceneTextSplitter.detectLanguage(scene.text);
      else delete scene.language;
    }
    else if(languageChoice==='custom'){
      const custom=SceneTextSplitter.normalizeLanguageTag?.($('#sceneLanguageCustomInput')?.value,'') || '';
      if(custom) scene.language=custom; else delete scene.language;
    } else scene.language=languageChoice;
    syncBackgroundFields(scene); syncAudioFields(scene);
    refreshDocumentLanguages();
    workingDocument.player ||= {}; workingDocument.player.navigation ||= {}; workingDocument.player.navigation.allowPrevious=$('#allowPreviousInput').checked;
  }
  function loadSceneIntoFields(){
    const scene=currentScene(); if(!scene)return;
    $('#selectedSceneNumber').textContent=`Scene ${selectedSceneIndex+1}`; $('#selectedSceneId').textContent=scene.id;
    $('#sceneTextInput').value=scene.text || ''; $('#sceneSubTextInput').value=scene.subText || '';
    requestAnimationFrame(autoGrowSubText);
    $('#sceneTypeSelect').value=scene.type || 'text'; $('#sceneDisplaySelect').value=scene.presentation?.display || 'stack';
    $('#sceneEffectSelect').value=scene.presentation?.effect || 'auto'; $('#sceneSizeSelect').value=scene.presentation?.text?.size || 'auto';
    const sceneColor=scene.presentation?.text?.color || '';
    $('#sceneColorSelect').value=!sceneColor?'auto':(sceneColor.toLowerCase()==='#ffffff'||sceneColor.toLowerCase()==='white'?'white':(sceneColor.toLowerCase()==='#000000'||sceneColor.toLowerCase()==='black'?'black':'custom'));
    $('#sceneColorCustomInput').value=/^#[0-9a-f]{6}$/i.test(sceneColor)?sceneColor:'#ffffff';
    $('#sceneColorCustomField').hidden=$('#sceneColorSelect').value!=='custom';
    $('#sceneShadowSelect').value=scene.presentation?.text?.shadow || 'auto';
    $('#sceneFontSelect').value=scene.presentation?.text?.fontFamily || 'inherit';
    const sceneLang=scene.language || '';
    const commonSceneLang=['ja','en'];
    $('#sceneLanguageSelect').value=!sceneLang?'auto':(commonSceneLang.includes(sceneLang)?sceneLang:'custom');
    $('#sceneLanguageCustomInput').value=commonSceneLang.includes(sceneLang)?'':sceneLang;
    $('#sceneLanguageCustomField').hidden=$('#sceneLanguageSelect').value!=='custom';
    $('#moveUpButton').disabled=selectedSceneIndex===0; $('#moveDownButton').disabled=selectedSceneIndex===workingDocument.scenes.length-1;
    $('#mergePreviousButton').disabled=selectedSceneIndex===0; $('#deleteSceneButton').disabled=workingDocument.scenes.length<=1;
    updateAutoTimingFields();
    loadMediaFields(scene);
  }
  function scenePreviewText(scene){
    const raw=scene.text||scene.subText||'';
    const preview=String(raw).replace(/\s+/g,' ').trim();
    if(!preview)return emptySceneLabel(scene);
    return preview.length>42?preview.slice(0,42)+'…':preview;
  }
  function renderSceneList(){
    const list=$('#sceneList'); list.innerHTML=''; $('#sceneCountLabel').textContent=t('scene.count',{n:workingDocument.scenes.length});
    workingDocument.scenes.forEach((scene,i)=>{
      const b=document.createElement('button'); b.type='button'; b.className='scene-list-item'+(i===selectedSceneIndex?' is-selected':'');
      const media=[]; if(scene.presentation?.background)media.push('BG'); if((scene.audio||[]).some(c=>c.channel==='bgm'))media.push('BGM'); if((scene.audio||[]).some(c=>c.channel==='ambient'))media.push('AMB'); if((scene.audio||[]).some(c=>c.channel==='oneshot'))media.push('SE');
      const emptyScene=!normalizedSceneText(scene.text) && !normalizedSceneText(scene.subText);
      const typeLabel=emptyScene
        ? (sceneHasAdvancedMeaning(scene)?t('scene.effectOnly'):t('scene.empty'))
        : ({text:t('scene.type.text'),dialogue:t('scene.type.dialogue'),sound:t('scene.type.sound')}[scene.type]||scene.type);
      const effectLabel={auto:t('effect.auto'),fade:t('effect.fade'),pop:t('effect.pop'),blur:t('effect.blur'),whisper:t('effect.whisper'),loud:t('effect.loud'),pulse:t('effect.pulse'),shake:t('effect.shake'),tilt:t('effect.tilt'),slow:t('effect.slow'),none:t('effect.none')}[scene.presentation?.effect||'auto'] || (scene.presentation?.effect||'auto');
      const sceneLang=scene.language || (workingDocument.language==='mul'?'':workingDocument.language) || '';
      const timing=Number.isFinite(Number(scene.pause)) && Number(scene.pause)>0 ? ` · AUTO ${(Number(scene.pause)/1000).toFixed(2)}s` : '';
      b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><div><strong>${scenePreviewText(scene)}</strong><small>${typeLabel} · ${effectLabel}${sceneLang?' · '+sceneLang.toUpperCase():''}${media.length?' · '+media.join('/') : ''}${timing}</small></div>`;
      b.addEventListener('click',()=>{syncAdvancedFieldsToScene();selectedSceneIndex=i;renderAdvanced();}); list.appendChild(b);
    });
  }
  function renderAdvanced(){
    if(!workingDocument)return; normalizeSceneIds(); selectedSceneIndex=Math.max(0,Math.min(selectedSceneIndex,workingDocument.scenes.length-1));
    $('#allowPreviousInput').checked=workingDocument.player?.navigation?.allowPrevious !== false;
    const pos=$('#advancedScenePosition'); if(pos)pos.textContent=`Scene ${selectedSceneIndex+1} / ${workingDocument.scenes.length}`;
    renderSceneList(); loadSceneIntoFields();
  }
  let undoSnapshot=null;
  let undoBarTimer=null;

  function captureUndo(label='変更'){
    undoSnapshot={
      label,
      workingDocument:workingDocument ? clone(workingDocument) : null,
      selectedSceneIndex,
      easySourceDirty,
      easy:{
        title:titleInput?.value ?? '',
        author:authorInput?.value ?? '',
        subtitle:subtitleInput?.value ?? '',
        series:seriesTitleInput?.value ?? '',
        episode:episodeInput?.value ?? '',
        language:languageInput?.value ?? 'ja',
        body:bodyInput?.value ?? ''
      }
    };
  }

  function showCompactUndo(){
    if(!undoSnapshot || !playerScreen?.hidden)return;
    const compact=$('#undoCompactButton');
    if(compact)compact.hidden=false;
  }

  function hideUndoBar(){
    const bar=$('#undoBar');
    if(!bar)return;
    bar.classList.remove('is-visible');
    bar.classList.add('is-hiding');
    window.setTimeout(()=>{
      bar.hidden=true;
      bar.classList.remove('is-hiding');
      showCompactUndo();
    },180);
  }

  function translatedSceneTypeLabel(label){
    const raw=String(label||'');
    if(raw==='演出のみ' || raw==='Effects only')return t('scene.effectOnly');
    if(raw==='空Scene' || raw==='Empty Scene')return t('scene.empty');
    if(raw==='テキスト' || raw==='Text')return t('scene.type.text');
    return raw;
  }

  function translateUndoLabel(label){
    const exact={
      'Sceneを並び替えました':'undo.sceneMoved',
      '前のSceneと結合しました':'undo.sceneMerged',
      'Sceneを分割しました':'undo.sceneSplit',
      'Sceneを削除しました':'undo.sceneDeleted',
      '未編集Sceneだけ再分割しました':'undo.resplit',
      'サンプルを入れました':'undo.sampleReplaced',
      'カーソル位置で分割しました':'undo.splitAtCursor'
    };
    if(exact[label])return t(exact[label]);

    const deleted=String(label||'').match(/^(\d+) Scenesを削除しました$/);
    if(deleted)return t('undo.scenesDeleted',{n:deleted[1]});

    return label;
  }

  function showUndo(label){
    scheduleDraftSave(120);
    if(!playerScreen?.hidden)return;
    const bar=$('#undoBar'), msg=$('#undoMessage'), compact=$('#undoCompactButton');
    if(!bar)return;
    if(undoBarTimer)window.clearTimeout(undoBarTimer);
    if(compact)compact.hidden=true;
    if(msg){msg.dataset.rawLabel=label;msg.textContent=translateUndoLabel(label);}
    bar.hidden=false;
    bar.classList.remove('is-hiding');
    requestAnimationFrame(()=>bar.classList.add('is-visible'));
    undoBarTimer=window.setTimeout(hideUndoBar,3500);
  }

  function clearUndo(){
    undoSnapshot=null;
    if(undoBarTimer)window.clearTimeout(undoBarTimer);
    undoBarTimer=null;
    const bar=$('#undoBar'), compact=$('#undoCompactButton');
    if(bar){bar.hidden=true;bar.classList.remove('is-visible','is-hiding');}
    if(compact)compact.hidden=true;
  }

  function restoreUndo(){
    if(!undoSnapshot)return;
    const snap=undoSnapshot;
    undoSnapshot=null;

    workingDocument=snap.workingDocument ? clone(snap.workingDocument) : null;
    selectedSceneIndex=snap.selectedSceneIndex;
    easySourceDirty=snap.easySourceDirty;

    if(titleInput)titleInput.value=snap.easy.title;
    if(authorInput)authorInput.value=snap.easy.author;
    if(subtitleInput)subtitleInput.value=snap.easy.subtitle;
    if(seriesTitleInput)seriesTitleInput.value=snap.easy.series;
    if(episodeInput)episodeInput.value=snap.easy.episode;
    if(languageInput)languageInput.value=snap.easy.language;
    if(bodyInput)bodyInput.value=snap.easy.body;

    updateCount();
    updateCoverPreview();
    updateEasyFileActions();

    if(!advancedScreen.hidden && workingDocument?.scenes?.length){
      renderAdvanced();
    }
    if(undoBarTimer)window.clearTimeout(undoBarTimer);
    undoBarTimer=null;
    const bar=$('#undoBar'), compact=$('#undoCompactButton');
    if(bar){bar.hidden=true;bar.classList.remove('is-visible','is-hiding');}
    if(compact)compact.hidden=true;
  }

  function moveScene(delta){
    syncAdvancedFieldsToScene();
    const ni=selectedSceneIndex+delta;
    if(ni<0||ni>=workingDocument.scenes.length)return;
    captureUndo('Sceneの並び替えを元に戻せます');
    const [s]=workingDocument.scenes.splice(selectedSceneIndex,1);
    workingDocument.scenes.splice(ni,0,s);
    selectedSceneIndex=ni;
    renderAdvanced();
    showUndo('Sceneを並び替えました');
  }
  function mergePrevious(){
    if(selectedSceneIndex<=0)return;
    syncAdvancedFieldsToScene();
    captureUndo('Scene結合を元に戻せます');
    const prev=workingDocument.scenes[selectedSceneIndex-1], cur=workingDocument.scenes[selectedSceneIndex];
    prev.text=[prev.text,cur.text].filter(Boolean).join('\n\n');
    if(cur.subText&&!prev.subText)prev.subText=cur.subText;
    workingDocument.scenes.splice(selectedSceneIndex,1);
    selectedSceneIndex-=1;
    renderAdvanced();
    showUndo('前のSceneと結合しました');
  }
  function splitAtCursor(){
    const input=$('#sceneTextInput'), pos=input.selectionStart;
    const text=input.value;
    if(pos<=0||pos>=text.length)return;
    syncAdvancedFieldsToScene();
    const scene=currentScene();
    const left=text.slice(0,pos).trimEnd(), right=text.slice(pos).trimStart();
    if(!left||!right)return;
    captureUndo('Scene分割を元に戻せます');
    scene.text=left;
    const cloneScene=clone(scene);
    cloneScene.id=nextUniqueId();
    cloneScene.text=right;
    delete cloneScene.subText;
    delete cloneScene.audio;
    if(cloneScene.presentation)delete cloneScene.presentation.background;
    workingDocument.scenes.splice(selectedSceneIndex+1,0,cloneScene);
    selectedSceneIndex+=1;
    renderAdvanced();
    showUndo('カーソル位置で分割しました');
  }
  function addScene(){
    syncAdvancedFieldsToScene();
    captureUndo('Scene追加を元に戻せます');
    const scene={id:nextUniqueId(),type:'text',text:'',presentation:{display:'stack',effect:'auto',text:{size:'auto'}}};
    workingDocument.scenes.splice(selectedSceneIndex+1,0,scene);
    selectedSceneIndex+=1;
    renderAdvanced();
    $('#sceneTextInput').focus();
    showUndo('Sceneを追加しました');
  }
  function requestDeleteScene(){
    const scene=currentScene();
    if(!scene || !workingDocument || workingDocument.scenes.length<=1)return;
    const dialog=$('#deleteSceneDialog');
    const text=$('#deleteSceneDialogText');
    if(text){
      const preview=scenePreviewText(scene);
      text.textContent=t('delete.scene.current',{n:selectedSceneIndex+1,label:translatedSceneTypeLabel(preview)});
    }
    if(typeof dialog?.showModal==='function') dialog.showModal();
    else if(confirm(t('delete.scene.current',{n:selectedSceneIndex+1,label:translatedSceneTypeLabel(scenePreviewText(scene))}))) deleteSceneNow();
  }

  function deleteSceneNow(){
    if(workingDocument.scenes.length<=1)return;
    captureUndo('Scene削除を元に戻せます');
    workingDocument.scenes.splice(selectedSceneIndex,1);
    selectedSceneIndex=Math.min(selectedSceneIndex,workingDocument.scenes.length-1);
    renderAdvanced();
    showUndo('Sceneを削除しました');
  }

  bodyInput.addEventListener('input',()=>{ updateCount(); easySourceDirty=true; });
  $('#sceneSubTextInput').addEventListener('input',autoGrowSubText);
  coverImageInput?.addEventListener('change',async()=>{
    const file=coverImageInput.files?.[0]; if(!file)return;
    try{
      const snap=await snapshotPickedFile(file);
      if(coverImageUrl && /^blob:/i.test(coverImageUrl))URL.revokeObjectURL(coverImageUrl);
      coverImageUrl=URL.createObjectURL(snap.blob);
      coverImageFileName=snap.name||'cover';
      assetRegistry.set(coverImageUrl,{blob:snap.blob,name:coverImageFileName});
      updateCoverPreview();
    }catch(error){console.error(error);alert('画像を読み込めませんでした。もう一度選択してください。');coverImageInput.value='';}
  });
  coverImageClear?.addEventListener('click',()=>{
    if(coverImageUrl && /^blob:/i.test(coverImageUrl))URL.revokeObjectURL(coverImageUrl);
    coverImageUrl=''; coverImageFileName='';
    if(coverImageInput)coverImageInput.value='';
    updateCoverPreview();
  });
  // Work metadata is shell data, not Scene source. Never rebuild the Scene array here.
  [titleInput,authorInput,subtitleInput,seriesTitleInput,episodeInput]
    .forEach(el=>el?.addEventListener('input',()=>{syncEasyShellToWorkingDocument();}));
  languageInput?.addEventListener('change',()=>{syncEasyShellToWorkingDocument();});
  updateCoverPreview();

  $('#sceneColorSelect')?.addEventListener('change',()=>{
    $('#sceneColorCustomField').hidden=$('#sceneColorSelect').value!=='custom';
    syncAdvancedFieldsToScene();
  });
  $('#sceneColorCustomInput')?.addEventListener('input',()=>syncAdvancedFieldsToScene());
  $('#sceneShadowSelect')?.addEventListener('change',()=>syncAdvancedFieldsToScene());
  ['sceneBackgroundTransition','sceneBackgroundFit','sceneBackgroundMotion'].forEach(id=>{
    $('#'+id)?.addEventListener('change',()=>{syncAdvancedFieldsToScene();updateAdvancedConditionalUI();});
  });
  ['sceneBackgroundDim','sceneBackgroundTransitionDuration','sceneBackgroundMotionDuration','sceneBackgroundMotionAmount'].forEach(id=>{
    $('#'+id)?.addEventListener('input',()=>{syncAdvancedFieldsToScene();updateAdvancedConditionalUI();});
  });

  // Studio overlay controls must never fall through to the Player tap surface.
  ['editReturnButton','publishFromPreviewButton','autoRecStart','autoRecCancel','autoRecRetry'].forEach(id=>{
    const el=$('#'+id); if(!el)return;
    ['pointerdown','pointerup','touchstart','touchend'].forEach(type=>{
      el.addEventListener(type,(event)=>event.stopPropagation(),{passive:true});
    });
  });
  $('#autoRecStart')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();startAutoRec();});
  $('#autoRecCancel')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();finishAutoRec(false);});
  $('#autoRecRetry')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();startAutoRec();});
  $('#publishFromPreviewButton')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();openPublishDialog();});
  $('#publishDialogClose')?.addEventListener('click',closePublishDialog);
  $('#publishConfirmButton')?.addEventListener('click',runMockPublish);
  $('#publishRetryButton')?.addEventListener('click',runMockPublish);
  $('#publishCopyButton')?.addEventListener('click',copyPublishedUrl);
  $('#publishShareButton')?.addEventListener('click',sharePublishedUrl);
  $('#publishDialog')?.addEventListener('click',(event)=>{if(event.target===event.currentTarget)closePublishDialog();});

  $('#sceneAutoTimingInput')?.addEventListener('change',commitAutoTimingFromInput);
  $('#sceneAutoTimingInput')?.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){e.preventDefault();commitAutoTimingFromInput();e.currentTarget.blur();}
  });
  $$('[data-auto-nudge]').forEach(btn=>btn.addEventListener('click',()=>nudgeAutoTiming(Number(btn.dataset.autoNudge))));
  $('#sceneAutoTimingReset')?.addEventListener('click',resetAutoTiming);

  $('#sampleReplaceDialog')?.addEventListener('close',()=>{
    if($('#sampleReplaceDialog').returnValue==='replace') applySample();
  });
  $('#sampleReplaceDialog')?.addEventListener('click',(e)=>{
    if(e.target===e.currentTarget)e.currentTarget.close('cancel');
  });
  $('#undoButton')?.addEventListener('click',restoreUndo);
  $('#undoCompactButton')?.addEventListener('click',restoreUndo);

  $('#deleteSceneDialog')?.addEventListener('close',()=>{
    if($('#deleteSceneDialog').returnValue==='delete') deleteSceneNow();
  });
  $('#deleteSceneDialog')?.addEventListener('click',(e)=>{
    const dialog=e.currentTarget;
    if(e.target===dialog) dialog.close('cancel');
  });

  function updateEasyFileActions(){
    const exportButton=$('#exportPackageButton');
    const advancedReturn=$('#easyAdvancedReturnButton');
    const hasDocument=Boolean(workingDocument?.scenes?.length);
    const hasSource=Boolean(hasDocument || bodyInput.value.trim());
    if(exportButton) exportButton.disabled=!hasSource;
    if(advancedReturn) advancedReturn.hidden=!hasDocument;
  }
  bodyInput.addEventListener('input',updateEasyFileActions);
  updateEasyFileActions();
 

  function applySample(){
    captureUndo('サンプル置換を元に戻せます');
    titleInput.value='声のそろう通り';
    bodyInput.value=SAMPLE;
    easySourceDirty=true;
    updateCount();
    updateCoverPreview();
    updateEasyFileActions();
   
    showUndo('タイトルと本文をサンプルに置き換えました');
  }

  document.addEventListener('input',(event)=>{
    if(event.target?.closest?.('#editorScreen,#advancedScreen'))scheduleDraftSave();
  },true);
  document.addEventListener('change',(event)=>{
    if(event.target?.closest?.('#editorScreen,#advancedScreen'))scheduleDraftSave(250);
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveDraftNow();});
  window.addEventListener('pagehide',()=>{saveDraftNow();});

  let draftManagerScrollY=0;

  function lockDraftManagerBackground(){
    if(document.body.classList.contains('draft-manager-open'))return;
    draftManagerScrollY=window.scrollY||document.documentElement.scrollTop||0;
    document.body.classList.add('draft-manager-open');
    document.body.style.top=`-${draftManagerScrollY}px`;
  }

  function unlockDraftManagerBackground(){
    if(!document.body.classList.contains('draft-manager-open'))return;
    document.body.classList.remove('draft-manager-open');
    document.body.style.top='';
    window.scrollTo(0,draftManagerScrollY);
  }

  async function openDraftManager(){
    await refreshDraftUI(false);
    const dialog=$('#draftManagerDialog');
    if(!dialog)return;
    lockDraftManagerBackground();
    dialog.showModal();
    const card=dialog.querySelector('.draft-manager-card');
    if(card)card.scrollTop=0;
  }

  $('#draftManageButton')?.addEventListener('click',openDraftManager);
  $('#newDraftQuickButton')?.addEventListener('click',async()=>{await startNewDraft();});
  $('#draftManagerClose')?.addEventListener('click',()=>$('#draftManagerDialog')?.close());
  $('#draftManagerDialog')?.addEventListener('close',unlockDraftManagerBackground);
  $('#draftManagerDialog')?.addEventListener('cancel',()=>{requestAnimationFrame(unlockDraftManagerBackground);});

  $$('.draft-manager-tab').forEach(tab=>tab.addEventListener('click',async()=>{
    $$('.draft-manager-tab').forEach(item=>{
      const active=item===tab;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-selected',active?'true':'false');
    });
    await refreshDraftUI(true);
    const card=$('#draftManagerDialog')?.querySelector('.draft-manager-card');
    if(card)card.scrollTop=0;
  }));
  $('#unpublishDialog')?.addEventListener('close',async()=>{
    const result=$('#unpublishDialog')?.returnValue;
    if(result==='unpublish')await confirmDraftUnpublish();
    else pendingUnpublishDraft=null;
  });

  $('#newDraftButton')?.addEventListener('click',async()=>{if(await startNewDraft())$('#draftManagerDialog')?.close();});

  $('#sampleButton').addEventListener('click',()=>{
    if(!bodyInput.value.trim()){
      applySample();
      return;
    }
    const dialog=$('#sampleReplaceDialog');
    if(typeof dialog?.showModal==='function') dialog.showModal();
    else if(confirm('入力中のタイトルと本文をサンプルに置き換えますか？')) applySample();
  });
  $$('.theme-card').forEach(card=>card.addEventListener('click',()=>applyTheme(card.dataset.theme)));
  $$('.work-font-card').forEach(card=>card.addEventListener('click',()=>applyWorkFont(card.dataset.font)));
  $('#makeButton').addEventListener('click',()=>{openPlayer({from:'easy',startAt:0});updateEasyFileActions();});
  $('#advancedButton').addEventListener('click',openAdvanced);
  $('#easyAdvancedReturnButton')?.addEventListener('click',openAdvanced);
  $('#exportSceneButton').addEventListener('click',exportSceneDocument);
  $('#exportPackageButton').addEventListener('click',exportScenePackage);
  $('#importSceneInput').addEventListener('change',async(event)=>{
    const file=event.target.files?.[0];
    if(file) await importSceneDocument(file);
    event.target.value='';
  });
  $('#importPackageInput').addEventListener('change',async(event)=>{
    const file=event.target.files?.[0];
    if(file) await importScenePackage(file);
    updateAutoRecStartLabel();
  refreshDraftUI(true).catch(err=>console.warn('Draft UI init failed',err));
  updateEasyFileActions();
    event.target.value='';
  });
  $('#editReturnButton').addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();closePlayer();});
  $('#advancedBackButton').addEventListener('click',closeAdvanced);
  $('#advancedPreviewButton').addEventListener('click',()=>{syncAdvancedFieldsToScene();openPlayer({from:'advanced',startAt:selectedSceneIndex});});
  $('#advancedExportButton')?.addEventListener('click',()=>{syncAdvancedFieldsToScene();exportScenePackage();});
  $('#allowPreviousInput').addEventListener('change',()=>{if(workingDocument){workingDocument.player ||= {};workingDocument.player.navigation ||= {};workingDocument.player.navigation.allowPrevious=$('#allowPreviousInput').checked;}});
  $('#moveUpButton').addEventListener('click',()=>moveScene(-1)); $('#moveDownButton').addEventListener('click',()=>moveScene(1));
  $('#mergePreviousButton').addEventListener('click',mergePrevious); $('#splitSceneButton').addEventListener('click',splitAtCursor); $('#addSceneButton').addEventListener('click',addScene); $('#deleteSceneButton').addEventListener('click',requestDeleteScene);
  ['sceneTextInput','sceneSubTextInput','sceneTypeSelect','sceneDisplaySelect','sceneEffectSelect','sceneSizeSelect','sceneFontSelect','sceneLanguageSelect','sceneLanguageCustomInput'].forEach(id=>$('#'+id).addEventListener('change',()=>{syncAdvancedFieldsToScene();renderSceneList();}));

  ['sceneBackgroundMode','sceneBackgroundTransition','sceneBackgroundFit','sceneBackgroundMotion','sceneBackgroundDim','sceneBgmAction','sceneBgmLoop','sceneBgmVolume','sceneBgmFadeIn','sceneBgmFadeOut','sceneBgmVolumeChange','sceneBgmVolumeFade','sceneBgmStopFade','sceneAmbientAction','sceneAmbientLoop','sceneAmbientVolume','sceneAmbientFadeIn','sceneAmbientFadeOut','sceneAmbientVolumeChange','sceneAmbientVolumeFade','sceneAmbientStopFade','sceneSeEnabled','sceneSeVolume','sceneSeFadeIn'].forEach(id=>{
    const el=$('#'+id); if(!el)return; const evt=el.type==='range'?'input':'change'; el.addEventListener(evt,()=>{updateAdvancedConditionalUI();syncAdvancedFieldsToScene();renderSceneList();});
  });
  function bindAssetInput(inputId,labelId,onPick){
    const input=$('#'+inputId); input.addEventListener('change',async()=>{
      const file=input.files?.[0];if(!file)return;
      const isAudio=/^(sceneBgmInput|sceneAmbientInput|sceneSeInput)$/.test(inputId);
      if(isAudio){
        const name=(file.name||'').toLowerCase();
        const audioLike=(file.type||'').startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(name);
        if(!audioLike){ alert(t('alert.audio')); input.value=''; return; }
      }
      try{
        const snap=await snapshotPickedFile(file);
        const oldUrl=assetFrom(inputId).src;
        if(oldUrl && assetRegistry.has(oldUrl)) unregisterAsset(oldUrl);
        const url=URL.createObjectURL(snap.blob);
        registerAsset(url,snap.blob,snap.name);
        setAssetField(inputId,url,snap.name);
        const urlFieldId=inputId.replace(/Input$/,'UrlInput');
        const urlField=$('#'+urlFieldId); if(urlField)urlField.value='';
        if(onPick)onPick();updateAdvancedConditionalUI();syncAdvancedFieldsToScene();renderSceneList();if(labelId)updateAssetLabel(labelId,inputId);
      }catch(error){
        console.error('Asset snapshot failed',error);
        alert(t('common.fileReadFailed'));
        input.value='';
      }
    });
  }
  bindAssetInput('sceneBackgroundInput',null,()=>{$('#sceneBackgroundMode').value='image';});
  bindAssetInput('sceneBgmInput','sceneBgmFileLabel',()=>{$('#sceneBgmAction').value='start';});
  bindAssetInput('sceneAmbientInput','sceneAmbientFileLabel',()=>{$('#sceneAmbientAction').value='start';});
  bindAssetInput('sceneSeInput','sceneSeFileLabel',()=>{$('#sceneSeEnabled').checked=true;});

  bindExternalAssetUrl({inputId:'sceneBackgroundInput',urlInputId:'sceneBackgroundUrlInput',applyId:'sceneBackgroundUrlApply',onApply:()=>{$('#sceneBackgroundMode').value='image';}});
  bindExternalAssetUrl({inputId:'sceneBgmInput',urlInputId:'sceneBgmUrlInput',applyId:'sceneBgmUrlApply',onApply:()=>{$('#sceneBgmAction').value='start';}});
  bindExternalAssetUrl({inputId:'sceneAmbientInput',urlInputId:'sceneAmbientUrlInput',applyId:'sceneAmbientUrlApply',onApply:()=>{$('#sceneAmbientAction').value='start';}});
  bindExternalAssetUrl({inputId:'sceneSeInput',urlInputId:'sceneSeUrlInput',applyId:'sceneSeUrlApply',onApply:()=>{$('#sceneSeEnabled').checked=true;}});
  $('#sceneBackgroundRemoveFile').addEventListener('click',()=>{const oldUrl=assetFrom('sceneBackgroundInput').src;if(oldUrl&&assetRegistry.has(oldUrl))unregisterAsset(oldUrl);setAssetField('sceneBackgroundInput','','');$('#sceneBackgroundInput').value='';$('#sceneBackgroundUrlInput').value='';updateAdvancedConditionalUI();syncAdvancedFieldsToScene();renderSceneList();});

  const cinemaInput=$('#cinemaBackgroundInput'), cinemaPreview=$('#cinemaBackgroundPreview'), cinemaClear=$('#cinemaBackgroundClear');
  cinemaInput.addEventListener('change',async()=>{const file=cinemaInput.files?.[0];if(!file)return;try{const snap=await snapshotPickedFile(file);if(cinemaBackgroundUrl&&assetRegistry.has(cinemaBackgroundUrl))unregisterAsset(cinemaBackgroundUrl);cinemaBackgroundUrl=URL.createObjectURL(snap.blob);registerAsset(cinemaBackgroundUrl,snap.blob,snap.name);cinemaPreview.style.backgroundImage=`url("${cinemaBackgroundUrl}")`;cinemaPreview.hidden=false;cinemaClear.hidden=false;if(workingDocument?.scenes?.[0]){const p=ensurePresentation(workingDocument.scenes[0]);p.background={src:cinemaBackgroundUrl,transition:'fade',dim:cinemaTone==='dark'?0.48:0.72,fit:'cover',position:'center center',_editorFileName:snap.name,_editorManaged:true};}}catch(error){console.error(error);alert('画像を読み込めませんでした。もう一度選択してください。');cinemaInput.value='';}});
  cinemaClear.addEventListener('click',()=>{if(cinemaBackgroundUrl&&assetRegistry.has(cinemaBackgroundUrl))unregisterAsset(cinemaBackgroundUrl);cinemaBackgroundUrl='';cinemaInput.value='';cinemaPreview.style.backgroundImage='';cinemaPreview.hidden=true;cinemaClear.hidden=true;if(workingDocument?.scenes?.[0]){const p=ensurePresentation(workingDocument.scenes[0]);delete p.background;}});
  $$('.cinema-tone-button').forEach(button=>button.addEventListener('click',()=>{cinemaTone=button.dataset.tone||'dark';$$('.cinema-tone-button').forEach(b=>{const on=b.dataset.tone===cinemaTone;b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',on?'true':'false');});if(workingDocument){workingDocument.appearance ||= {};workingDocument.appearance.cinemaTone=cinemaTone;}}));

  $$('.ui-language-switch button').forEach(button=>button.addEventListener('click',()=>setUILanguage(button.dataset.uiLang)));
  window.addEventListener('scene-studio:ui-language',(e)=>{
    if(e.detail?.language && e.detail.language!==uiLanguage){
      uiLanguage=e.detail.language; applyStaticUITranslations(); updateCount(); if(workingDocument)renderAdvanced(); player?.setUILanguage?.(uiLanguage);
    }
  });

  $('#sceneLanguageSelect')?.addEventListener('change',()=>{
    $('#sceneLanguageCustomField').hidden=$('#sceneLanguageSelect').value!=='custom';
  });

  async function loadSceneFormatFromUrl(url,{openPlayer=true,startAt=0}={}){
    const response=await fetch(url,{credentials:'omit'});
    if(!response.ok) throw new Error(`Scene Format fetch failed: ${response.status}`);
    const doc=validateSceneFormatV1(await response.json());
    return loadSceneFormatFromObject(doc,{openPlayer,startAt});
  }

  function loadSceneFormatFromObject(value,{openPlayer=true,startAt=0}={}){
    const doc=validateSceneFormatV1(clone(value));
    workingDocument=doc;
    latestPublishedId='';latestPublishedUrl='';latestPublishedFingerprint='';latestPublishedAt=0;
    easySourceDirty=false;
    selectedSceneIndex=0;
    restoreEasyStateFromDocument(doc);
    normalizeSceneIds();
    refreshDocumentLanguages();
    renderAdvanced();
    if(openPlayer){
      openPlayerScreenFromApi(startAt);
    }else{
      setScreen('advanced');
      scrollScreenToTop(advancedScreen);
    }
    return clone(doc);
  }

  function openPlayerScreenFromApi(startAt=0){
    playerReturnTarget='advanced';
    const core=ensurePlayer();
    core.load(clone(workingDocument),{startAt:Number(startAt)||0});
    core.setUILanguage?.(uiLanguage);
    setScreen('player');
    scrollScreenToTop(playerScreen);
    return core;
  }

  // Public, intentionally small integration surface.
  // Embed/API clients can pass a Scene Format object directly or fetch one.
  window.SceneStudioAPI={
    version:'0.2.18',
    load:loadSceneFormatFromObject,
    loadFromUrl:loadSceneFormatFromUrl,
    play:(startAt=0)=>openPlayerScreenFromApi(startAt),
    getDocument:()=>clone(workingDocument||buildSceneDocument()),
    validate:(value)=>validateSceneFormatV1(clone(value)),
    createPlayer:(host,document,options={})=>{
      const instance=new ScenePlayerCore(host,options);
      instance.load(validateSceneFormatV1(clone(document)),{startAt:options.startAt||0});
      return instance;
    }
  };

  window.SceneStudioDebug={getSceneDocument:()=>clone(workingDocument||buildSceneDocument()),validateSceneFormatV1:(value)=>validateSceneFormatV1(value),exportSceneDocument,exportScenePackage,importScenePackage,getPlayer:()=>player,splitJapanese:(text,options={})=>JapaneseSceneSplitter.splitDetailed(text,options),splitEnglish:(text,options={})=>EnglishSceneSplitter.splitDetailed(text,options),splitAuto:(text,options={})=>SceneTextSplitter.splitDetailed(text,options),splitMultilingual:(text,options={})=>SceneTextSplitter.splitMultilingualDetailed(text,options),summarizeLanguages:(chunks)=>SceneTextSplitter.summarizeLanguages(chunks),detectWorkLanguage:(text)=>SceneTextSplitter.detectLanguage(text),getUILanguage:()=>uiLanguage,setUILanguage};
  if(densitySelect)densitySelect.value='normal';
  applyStaticUITranslations(); applyTheme('light'); updateCount();
})();
