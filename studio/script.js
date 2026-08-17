(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const editorScreen = $('#editorScreen');
  const easyIntro = $('.intro');
  const advancedScreen = $('#advancedScreen');
  const playerScreen = $('#playerScreen');
  const titleInput = $('#titleInput');
  const authorInput = $('#authorInput');
  const subtitleInput = $('#subtitleInput');
  const languageInput = $('#languageInput');
  const seriesTitleInput = $('#seriesTitleInput');
  const episodeInput = $('#episodeInput');
  const episodeTitleInput = $('#episodeTitleInput');
  const descriptionInput = $('#descriptionInput');
  const coverLogoInput = $('#coverLogoInput');
  const coverLogoChoose = $('#coverLogoChoose');
  const coverLogoClear = $('#coverLogoClear');
  const coverImageInput = $('#coverImageInput');
  const coverPreview = $('#coverPreview');
  const coverImageClear = $('#coverImageClear');
  const coverFitInput = $('#coverFitInput');
  const coverPositionInput = $('#coverPositionInput');
  const coverPreviewLogo = $('#coverPreviewLogo');
  const coverPreviewTitle = $('#coverPreviewTitle');
  const coverPreviewAuthor = $('#coverPreviewAuthor');
  const coverPreviewSubtitle = $('#coverPreviewSubtitle');
  const coverPreviewEpisode = $('#coverPreviewEpisode');
  const coverPreviewEpisodeTitle = $('#coverPreviewEpisodeTitle');
  const workMetaSection = $('.work-meta-section');
  const coverQuickDialog=$('#coverQuickDialog');
  const coverQuickClose=$('#coverQuickClose');
  const coverQuickDone=$('#coverQuickDone');
  const coverQuickWorkTitle=$('#coverQuickWorkTitle');
  const coverQuickAuthor=$('#coverQuickAuthor');
  const coverQuickSubtitle=$('#coverQuickSubtitle');
  const coverQuickEpisode=$('#coverQuickEpisode');
  const coverQuickEpisodeTitle=$('#coverQuickEpisodeTitle');
  const coverQuickDescription=$('#coverQuickDescription');
  const coverQuickLogo=$('#coverQuickLogo');
  const coverQuickLogoClear=$('#coverQuickLogoClear');
  const coverQuickImage=$('#coverQuickImage');
  const coverQuickImageClear=$('#coverQuickImageClear');

  const authorHistoryList = $('#authorHistoryList');
  const endingLabelInput = $('#endingLabelInput');
  const endingLinkInputs = [1,2].map(n=>({kicker:$(`#endingLink${n}Kicker`),label:$(`#endingLink${n}Label`),url:$(`#endingLink${n}Url`)}));
  const endingPreviewLabel = $('#endingPreviewLabel');
  const endingPreviewLinks = $$('[data-preview-link]');
  const endingPreviewCenterEdit=$('#endingPreviewCenterEdit');
  const endingPreviewCover=$('[data-preview-cover]');
  const easyToast=$('#easyToast');
  const fixedActionNotice=$('#fixedActionNotice');
  const fixedActionNoticeText=$('#fixedActionNoticeText');
  const endingQuickDialog=$('#endingQuickDialog');
  const endingQuickTitle=$('#endingQuickTitle');
  const endingQuickCenterFields=$('#endingQuickCenterFields');
  const endingQuickSlotFields=$('#endingQuickSlotFields');
  const endingQuickCenterText=$('#endingQuickCenterText');
  const endingQuickKicker=$('#endingQuickKicker');
  const endingQuickLabel=$('#endingQuickLabel');
  const endingQuickUrl=$('#endingQuickUrl');
  const endingQuickClear=$('#endingQuickClear');
  const endingQuickClose=$('#endingQuickClose');
  const endingQuickDone=$('#endingQuickDone');
  const endingLegacyEditor=$('#endingLegacyEditor');
  const endingQuickRecentList=$('#endingQuickRecentList');
  let endingQuickTarget='center';
  let coverImageUrl = '';
  let coverImageFileName = '';
  let coverLogoUrl = '';
  let coverLogoFileName = '';
  const bodyInput = $('#bodyInput');
  const charCount = $('#charCount');
  const densitySelect = $('#densitySelect');
  const playerHost = $('#scenePlayer');

  // v0.3.25: Player-like intro without fighting iOS focus scrolling.
  // CSS owns the first Scene-style entrance from the very first paint.
  // Tapping the copy fully dismisses + reclaims its space.
  // Focusing the body visually advances the copy first, but preserves its layout height
  // while the iOS keyboard is positioning the textarea; the space is reclaimed on blur.
  if(easyIntro){
    let introDismissed=false;
    let introFocusHeld=false;

    const fullyDismissEasyIntro=()=>{
      if(introDismissed && !introFocusHeld)return;
      introDismissed=true;
      introFocusHeld=false;
      easyIntro.classList.remove('is-focus-dismissed');
      easyIntro.classList.add('is-dismissed');
      easyIntro.setAttribute('aria-hidden','true');
    };

    const focusDismissEasyIntro=()=>{
      if(introDismissed)return;
      introDismissed=true;
      introFocusHeld=true;
      easyIntro.classList.add('is-focus-dismissed');
      easyIntro.setAttribute('aria-hidden','true');
    };

    const isIOSLike = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    easyIntro.addEventListener('click',fullyDismissEasyIntro);
    bodyInput?.addEventListener('focus',()=>{
      // iOS needs the intro's layout height while Safari positions the textarea/keyboard.
      // Desktop browsers do not, so reclaim the space immediately just like a direct intro tap.
      if(isIOSLike) focusDismissEasyIntro();
      else fullyDismissEasyIntro();
    });
    bodyInput?.addEventListener('blur',()=>{
      if(!introFocusHeld)return;
      // Let iOS finish its keyboard/focus viewport transition before reclaiming layout space.
      requestAnimationFrame(()=>requestAnimationFrame(fullyDismissEasyIntro));
    });
  }

  const I18N = window.SceneStudioI18n;
  const t = (key, vars={}) => I18N?.t(key, vars) ?? key;
  let uiLanguage = I18N?.getLocale?.() || 'ja';

  const UI_BINDINGS = [
    ['.intro h2','intro.title'],['.intro p','intro.body'],
    ['#titleInput','field.title.ph','placeholder'],['#authorInput','field.author.ph','placeholder'],
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
    ['#makeButton span','make'],['#makeButton small','make.note'],['#easyAdvancedReturnButton span','advanced.open'],['#projectIoTitle','io.heading'],['#exportSceneButton strong','io.export'],['label[for="importSceneInput"] strong','io.import'],['.footer-note','footer.note'],
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
    ['label.easy-file-open span','file.open'],['#exportPackageButton span','file.export'],['#easyPublishButton span','publish.action'],['#easyPublishButton small','publish.short'],['#draftManageButton span','draft.manager'],['#newDraftQuickButton span','draft.new'],['#newDraftQuickButton small','draft.new.note'],
    ['.work-meta-section > summary','work.info'],['.author-history-help','work.authorHistory'],['label[for="descriptionInput"] .field-label','work.description'],['#descriptionInput','work.description.ph','placeholder'],['.work-description-help','work.description.help'],['.ending-editor .section-heading > span','ending.heading'],['.ending-editor .section-heading > small','ending.note'],['#endingLabelInput','ending.label.ph','placeholder'],['label[for="subtitleInput"] .field-label','work.subtitle'],['label[for="languageInput"] .field-label','work.language'],['label[for="seriesTitleInput"] .field-label','work.series'],['label[for="episodeInput"] .field-label','work.episode'],['.easy-cover-simple .section-heading > span','work.cover'],['.easy-cover-simple .section-heading > small','work.cover.note'],['label[for="coverImageInput"]','work.cover.choose'],['#coverImageClear','work.cover.remove'],['.cover-preview-empty small','work.cover.empty'],['.easy-cover-actions p','work.cover.saveNote'],['.project-io-details summary','work.developer'],
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
      easy:{author:authorInput.value,subtitle:subtitleInput?.value||'',series:seriesTitleInput?.value||'',episode:episodeInput?.value||'',episodeTitle:episodeTitleInput?.value||'',description:descriptionInput?.value||'',language:languageInput?.value||'auto',density:densitySelect?.value||'normal'},
      document:workingDocument?clone(workingDocument):null,
      publication:{
        id:latestPublishedId||'',
        url:latestPublishedUrl||'',
        fingerprint:latestPublishedFingerprint||'',
        publishedAt:latestPublishedAt||0,
        stoppedAt:latestPublicationStoppedAt||0
      },
      recProgress:clone(autoRecProgress),
      cover:{url:coverImageUrl||'',name:coverImageFileName||'',logoUrl:coverLogoUrl||'',logoName:coverLogoFileName||''},
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
    latestPublicationStoppedAt=Number(row.publication?.stoppedAt)||0;
    titleInput.value=row.title||'Untitled';authorInput.value=row.easy?.author||'';bodyInput.value=row.body||'';
    if(subtitleInput)subtitleInput.value=row.easy?.subtitle||'';
    if(seriesTitleInput)seriesTitleInput.value=row.easy?.series||'';
    if(episodeInput)episodeInput.value=row.easy?.episode||'';
    if(episodeTitleInput)episodeTitleInput.value=row.easy?.episodeTitle||row.document?.metadata?.episodeTitle||'';
    if(descriptionInput)descriptionInput.value=row.easy?.description||row.document?.metadata?.description||'';
    if(languageInput)languageInput.value=row.easy?.language||'auto';
    if(densitySelect)densitySelect.value='normal';
    coverImageUrl=map.get(row.cover?.url)||row.cover?.url||'';coverImageFileName=row.cover?.name||'';
    coverLogoUrl=map.get(row.cover?.logoUrl)||row.cover?.logoUrl||row.document?.cover?.logo?.src||'';coverLogoFileName=row.cover?.logoName||row.document?.cover?.logo?._editorFileName||'';
    if(endingLabelInput)endingLabelInput.value=row.ending?.label||workingDocument?.ending?.label||'';
    endingLinkInputs.forEach((pair,index)=>{const pos=index===0?'left':'right';const links=row.ending?.links||workingDocument?.ending?.links||[];const hasPositions=links.some(x=>x?.position==='left'||x?.position==='right');const item=hasPositions?(links.find(x=>x?.position===pos)||{}):(links[index]||{});if(pair.kicker)pair.kicker.value=item.kicker||'';if(pair.label)pair.label.value=item.label||'';if(pair.url)pair.url.value=item.url||'';});
    updateCount();updateCoverPreview();updateEndingPreview();updateEasyFileActions();updateProtectedResplitPreview();
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

  async function setHostedPublicationState(workId,action){
    const response=await fetch(`${SCENE_STUDIO_API_BASE}/work/${encodeURIComponent(workId)}/${action}`,{method:'POST'});
    let payload=null; try{payload=await response.json();}catch(_){}
    if(!response.ok || !payload?.ok)throw new Error(payload?.error||`${action} failed (${response.status})`);
    return payload;
  }

  async function confirmDraftUnpublish(){
    const row=pendingUnpublishDraft; pendingUnpublishDraft=null;
    if(!row?.publication?.url || !row?.publication?.id)return;
    try{
      await setHostedPublicationState(row.publication.id,'unpublish');
      const fresh=await getDraftRecord(row.id); if(!fresh)return;
      fresh.publication={...(fresh.publication||{}),id:row.publication.id,url:'',stoppedAt:Date.now()};
      fresh.updatedAt=Date.now(); await putDraftRecord(fresh);
      if(currentDraftId===row.id){
        latestPublishedId=row.publication.id; latestPublishedUrl='';
        latestPublicationStoppedAt=fresh.publication.stoppedAt; syncPublishCopyForStatus();
      }
      await refreshDraftUI(false);
    }catch(error){ console.warn('Unpublish failed',error); alert(t('unpublish.failed')); }
  }

  async function republishDraftPublication(row){
    const workId=row?.publication?.id; if(!workId)return;
    try{
      await setHostedPublicationState(workId,'republish');
      const fresh=await getDraftRecord(row.id); if(!fresh)return;
      fresh.publication={...(fresh.publication||{}),id:workId,url:`${SCENE_STUDIO_API_BASE}/work/${encodeURIComponent(workId)}`,stoppedAt:0};
      fresh.updatedAt=Date.now(); await putDraftRecord(fresh);
      if(currentDraftId===row.id){
        latestPublishedId=workId; latestPublishedUrl=fresh.publication.url;
        latestPublicationStoppedAt=0; syncPublishCopyForStatus();
      }
      await refreshDraftUI(false);
    }catch(error){ console.warn('Republish failed',error); alert(t('republish.failed')); }
  }

  async function deleteHostedPublication(workId){
    if(!workId)return;
    const response=await fetch(`${SCENE_STUDIO_API_BASE}/work/${encodeURIComponent(workId)}`,{method:'DELETE'});
    let payload=null; try{payload=await response.json();}catch(_){}
    if(!response.ok || !payload?.ok)throw new Error(payload?.error||`Delete failed (${response.status})`);
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
      const isStopped=!isPublished && Boolean(row.publication?.id);
      const status=isPublished?draftPublishStatus(row):(isStopped?'stopped':'draft');
      const el=document.createElement('article');
      el.className=`draft-row unified-work-row ${isPublished?'is-published':''} ${isStopped?'is-stopped':''} ${status==='dirty'?'is-dirty':''}`;

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
          <button data-publish ${(!isPublished && !isStopped) || status==='dirty'?'':'hidden'}>${status==='dirty'?t('publish.update'):t('publish.action')}</button>
          <button data-share ${isPublished?'':'hidden'}>${t('publish.share')}</button>
          <button data-copy ${isPublished?'':'hidden'}>${t('draft.link')}</button>
          <button data-stop ${isPublished?'':'hidden'}>${t('draft.unpublish')}</button>
          <button data-republish ${isStopped?'':'hidden'}>${t('draft.republish')}</button>
          <button data-delete>${t('draft.delete')}</button>
        </div>`;

      el.querySelector('strong').textContent=row.title||'Untitled';

      const badges=el.querySelector('.unified-work-badges');
      if(isPublished || isStopped){
        const badge=document.createElement('span');
        badge.className=`published-status ${status==='dirty'?'is-dirty':''} ${isStopped?'is-stopped':''}`;
        badge.textContent=isStopped?t('draft.status.stopped'):(status==='dirty'?t('draft.status.dirty'):t('draft.status.published'));
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
      if(isStopped)el.querySelector('[data-republish]').onclick=()=>republishDraftPublication(row);
      const publishButton=el.querySelector('[data-publish]');
      if(publishButton && !publishButton.hidden){
        publishButton.onclick=async()=>{
          const fresh=await getDraftRecord(row.id); if(!fresh)return;
          await restoreDraftRecord(fresh);
          $('#draftManagerDialog')?.close();
          requestAnimationFrame(()=>openPublishDialogFromEasy());
        };
      }

      el.querySelector('[data-open]').onclick=async()=>{
        await restoreDraftRecord(await getDraftRecord(row.id));
        $('#draftManagerDialog').close();
      };
      el.querySelector('[data-delete]').onclick=async()=>{
        const hasHosted=Boolean(row.publication?.id);
        if(!confirm(hasHosted?t('draft.deleteHostedConfirm',{title:row.title||'Untitled'}):t('draft.deleteLocalConfirm',{title:row.title||'Untitled'})))return;
        try{
          if(hasHosted)await deleteHostedPublication(row.publication.id);
          await removeDraftRecord(row.id);
          if(currentDraftId===row.id){
            currentDraftId=''; latestPublishedId=''; latestPublishedUrl=''; latestPublishedFingerprint='';
            latestPublishedAt=0; latestPublicationStoppedAt=0; localStorage.removeItem(DRAFT_LAST_KEY);
          }
          await refreshDraftUI(true);
        }catch(error){console.warn('Delete failed',error);alert(t('draft.deleteFailed'));}
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
    titleInput.value='';authorInput.value='';bodyInput.value='';
    if(densitySelect)densitySelect.value='normal';
    if(subtitleInput)subtitleInput.value='';applyRememberedWorkIdentity();if(seriesTitleInput)seriesTitleInput.value='';if(episodeInput)episodeInput.value='';if(episodeTitleInput)episodeTitleInput.value='';if(descriptionInput)descriptionInput.value='';
    coverImageUrl='';coverImageFileName='';coverLogoUrl='';coverLogoFileName='';
    if(endingLabelInput)endingLabelInput.value='';endingLinkInputs.forEach(pair=>{if(pair.kicker)pair.kicker.value='';if(pair.label)pair.label.value='';if(pair.url)pair.url.value='';});
    updateCount();updateCoverPreview();updateEndingPreview();updateEasyFileActions();updateAutoRecStartLabel();
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

  // v0.3.08 — Transparent PNG logos are often exported with a large empty canvas.
  // Trim only fully transparent outer pixels so the visible mark occupies the
  // same visual slot as a text work title. A small transparent breathing margin
  // is restored after trimming.
  async function trimTransparentPng(blob){
    if(!blob || !/^image\/png$/i.test(blob.type||''))return blob;
    const src=URL.createObjectURL(blob);
    try{
      const img=await new Promise((resolve,reject)=>{
        const node=new Image();
        node.onload=()=>resolve(node);
        node.onerror=reject;
        node.src=src;
      });
      const w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
      if(!w || !h)return blob;
      const canvas=document.createElement('canvas');
      canvas.width=w; canvas.height=h;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx)return blob;
      ctx.drawImage(img,0,0,w,h);
      const data=ctx.getImageData(0,0,w,h).data;
      let minX=w,minY=h,maxX=-1,maxY=-1;
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          if(data[(y*w+x)*4+3]>8){
            if(x<minX)minX=x;if(x>maxX)maxX=x;
            if(y<minY)minY=y;if(y>maxY)maxY=y;
          }
        }
      }
      if(maxX<minX || maxY<minY)return blob;
      const bw=maxX-minX+1,bh=maxY-minY+1;
      // Avoid rewriting already-tight artwork.
      if(bw/w>.92 && bh/h>.92)return blob;
      const pad=Math.max(4,Math.round(Math.max(bw,bh)*.035));
      const out=document.createElement('canvas');
      out.width=bw+pad*2;out.height=bh+pad*2;
      const octx=out.getContext('2d');
      octx.drawImage(canvas,minX,minY,bw,bh,pad,pad,bw,bh);
      const outBlob=await new Promise(resolve=>out.toBlob(resolve,'image/png'));
      return outBlob||blob;
    }catch(error){
      console.warn('Logo trim skipped',error);
      return blob;
    }finally{
      URL.revokeObjectURL(src);
    }
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

  const AUTHOR_HISTORY_KEY='scene-studio-author-history-v1';
  const WORK_IDENTITY_KEY='scene-studio-work-identity-v1';

  function readAuthorHistory(){
    try{
      const raw=JSON.parse(localStorage.getItem(AUTHOR_HISTORY_KEY)||'[]');
      return Array.isArray(raw)?raw.filter(v=>typeof v==='string'&&v.trim()).slice(0,12):[];
    }catch(_){return [];}
  }
  function renderAuthorHistory(){
    if(!authorHistoryList)return;
    authorHistoryList.replaceChildren();
    readAuthorHistory().forEach(name=>{const option=document.createElement('option');option.value=name;authorHistoryList.appendChild(option);});
  }
  function rememberAuthorName(value){
    const name=String(value||'').trim(); if(!name)return;
    const next=[name,...readAuthorHistory().filter(v=>v!==name)].slice(0,12);
    localStorage.setItem(AUTHOR_HISTORY_KEY,JSON.stringify(next)); renderAuthorHistory();
  }
  function readRememberedWorkIdentity(){
    try{
      const value=JSON.parse(localStorage.getItem(WORK_IDENTITY_KEY)||'{}');
      return value && typeof value==='object' ? value : {};
    }catch(_){ return {}; }
  }
  function rememberWorkIdentity(){
    const value={
      title:String(titleInput?.value||'').trim(),
      subtitle:String(subtitleInput?.value||'').trim(),
      author:String(authorInput?.value||'').trim()
    };
    localStorage.setItem(WORK_IDENTITY_KEY,JSON.stringify(value));
    if(value.author)rememberAuthorName(value.author);
  }
  function applyRememberedWorkIdentity(){
    const value=readRememberedWorkIdentity();
    if(titleInput && !titleInput.value)value.title && (titleInput.value=value.title);
    if(subtitleInput && !subtitleInput.value)value.subtitle && (subtitleInput.value=value.subtitle);
    if(authorInput && !authorInput.value)value.author && (authorInput.value=value.author);
  }
  function endingFromEasy(){
    return {
      label:String(endingLabelInput?.value||'').trim(),
      coverButton:{kicker:'COVER',label:t('ending.cover')},
      links:endingLinkInputs.map((row,index)=>({position:index===0?'left':'right',kicker:String(row.kicker?.value||'').trim(),label:String(row.label?.value||'').trim(),url:String(row.url?.value||'').trim()})).filter(x=>x.label&&x.url)
    };
  }
  function updateEndingPreview(){
    if(endingPreviewLabel)endingPreviewLabel.textContent=String(endingLabelInput?.value||'').trim()||'つづく';
    endingPreviewLinks.forEach((button,index)=>{
      const row=endingLinkInputs[index];
      const kicker=String(row?.kicker?.value||'').trim();
      const label=String(row?.label?.value||'').trim();
      const empty=!label;
      button.hidden=false;
      button.classList.toggle('is-placeholder',empty);
      const small=button.querySelector('small'); const strong=button.querySelector('strong');
      if(small){small.textContent=kicker || (index===0?'PREVIOUS':'NEXT');small.hidden=false;}
      if(strong)strong.textContent=label || (index===0?'前の話':'続き');
    });
  }


  let easyToastTimer=null;
  function showEasyToast(message){
    if(!easyToast)return;
    clearTimeout(easyToastTimer);
    easyToast.textContent=message;
    easyToast.hidden=false;
    easyToast.classList.remove('is-showing');
    requestAnimationFrame(()=>requestAnimationFrame(()=>easyToast.classList.add('is-showing')));
    easyToastTimer=setTimeout(()=>{
      easyToast.classList.remove('is-showing');
      setTimeout(()=>{easyToast.hidden=true;},180);
    },1500);
  }

  let fixedActionNoticeTimer=null;
  function showFixedActionNotice(message){
    if(!fixedActionNotice)return;
    if(fixedActionNoticeTimer)window.clearTimeout(fixedActionNoticeTimer);
    if(fixedActionNoticeText)fixedActionNoticeText.textContent=message;
    fixedActionNotice.hidden=false;
    fixedActionNotice.classList.remove('is-visible','is-hiding');
    // Force layout so Safari and desktop both animate from a real rendered state.
    void fixedActionNotice.offsetWidth;
    fixedActionNotice.classList.add('is-visible');
    fixedActionNoticeTimer=window.setTimeout(()=>{
      fixedActionNotice.classList.remove('is-visible');
      fixedActionNotice.classList.add('is-hiding');
      window.setTimeout(()=>{
        fixedActionNotice.hidden=true;
        fixedActionNotice.classList.remove('is-hiding');
      },180);
    },1800);
  }

  const ENDING_RECENTS_KEY='scene-studio-ending-recents-v1';
  function readEndingRecents(){try{const v=JSON.parse(localStorage.getItem(ENDING_RECENTS_KEY)||'[]');return Array.isArray(v)?v.slice(0,12):[];}catch(_){return [];}}
  function saveEndingRecent(item){
    const clean=item?.type==='center'?{type:'center',text:String(item.text||'').trim()}:{type:'slot',kicker:String(item?.kicker||'').trim(),label:String(item?.label||'').trim(),url:String(item?.url||'').trim()};
    if(clean.type==='center'&&!clean.text)return;if(clean.type==='slot'&&!clean.label)return;
    const key=JSON.stringify(clean), next=[clean,...readEndingRecents().filter(x=>JSON.stringify(x)!==key)].slice(0,12);
    localStorage.setItem(ENDING_RECENTS_KEY,JSON.stringify(next));
  }
  function renderEndingRecents(type){
    if(!endingQuickRecentList)return;endingQuickRecentList.replaceChildren();
    const rows=readEndingRecents().filter(x=>x?.type===type);
    if(!rows.length){const e=document.createElement('small');e.className='ending-quick-empty';e.textContent='まだありません';endingQuickRecentList.appendChild(e);return;}
    rows.slice(0,6).forEach(item=>{const b=document.createElement('button');b.type='button';b.className='ending-quick-recent-chip';b.textContent=item.type==='center'?item.text:(item.kicker?`${item.kicker} / ${item.label}`:item.label);b.onclick=()=>{if(item.type==='center'){endingQuickCenterText.value=item.text||'';}else{endingQuickKicker.value=item.kicker||'';endingQuickLabel.value=item.label||'';endingQuickUrl.value=item.url||'';}syncQuickEndingToMain();};endingQuickRecentList.appendChild(b);});
  }
  function syncQuickEndingToMain(){
    if(endingQuickTarget==='center'){if(endingLabelInput)endingLabelInput.value=endingQuickCenterText?.value||'';}
    else{const row=endingLinkInputs[endingQuickTarget==='left'?0:1];if(row?.kicker)row.kicker.value=endingQuickKicker?.value||'';if(row?.label)row.label.value=endingQuickLabel?.value||'';if(row?.url)row.url.value=endingQuickUrl?.value||'';}
    updateEndingPreview();syncEasyShellToWorkingDocument();syncEasyPublishButton();scheduleDraftSave(100);
  }
  function openEndingQuickEditor(target){
    if(!endingQuickDialog)return;
    endingQuickTarget=target;const center=target==='center';
    endingQuickCenterFields.hidden=!center;endingQuickSlotFields.hidden=center;
    endingQuickTitle.textContent=center?'中央の文':target==='left'?'左ボタン':'右ボタン';
    if(center){
      endingQuickCenterText.value=endingLabelInput?.value||'';
      renderEndingRecents('center');
    }else{
      const row=endingLinkInputs[target==='left'?0:1];
      endingQuickKicker.value=row?.kicker?.value||'';
      endingQuickLabel.value=row?.label?.value||'';
      endingQuickUrl.value=row?.url?.value||'';
      renderEndingRecents('slot');
    }
    endingQuickDialog.hidden=false;
    document.documentElement.classList.add('ending-quick-open');
    requestAnimationFrame(()=>{(center?endingQuickCenterText:endingQuickLabel)?.focus();});
  }
  function closeEndingQuickEditor(save=true){
    if(!endingQuickDialog)return;
    if(save)commitEndingQuickRecent();
    endingQuickDialog.hidden=true;
    document.documentElement.classList.remove('ending-quick-open');
  }
  function commitEndingQuickRecent(){
    syncQuickEndingToMain();
    if(endingQuickTarget==='center')saveEndingRecent({type:'center',text:endingQuickCenterText?.value});
    else saveEndingRecent({type:'slot',kicker:endingQuickKicker?.value,label:endingQuickLabel?.value,url:endingQuickUrl?.value});
  }

  function workMetadataFromEasy(){
    const detected = detectWorkLanguage();
    const selectedLanguage = languageInput?.value || 'auto';
    return {
      subtitle: subtitleInput?.value.trim() || '',
      language: selectedLanguage === 'auto' ? detected : selectedLanguage,
      seriesTitle: seriesTitleInput?.value.trim() || '',
      episode: episodeInput?.value.trim() || '',
      episodeTitle: episodeTitleInput?.value.trim() || '',
      description: descriptionInput?.value.trim() || ''
    };
  }

  function refreshCoverPreviewLayout(){
    updateCoverPreview();
    if(!coverPreview)return;
    coverPreview.classList.remove('cover-layout-refresh');
    requestAnimationFrame(()=>{
      coverPreview.classList.add('cover-layout-refresh');
      requestAnimationFrame(()=>{
        coverPreview.classList.remove('cover-layout-refresh');
        updateCoverPreview();
      });
    });
  }

  function updateCoverPreview(){
    if(!coverPreview)return;
    const bg=coverPreview.querySelector('.cover-preview-bg');
    if(bg){
      bg.style.backgroundImage=coverImageUrl ? `url("${coverImageUrl}")` : 'none';
      bg.style.backgroundSize='cover';
      bg.style.backgroundPosition='center center';
    }
    coverPreview.classList.toggle('has-image',Boolean(coverImageUrl));
    const empty=coverPreview.querySelector('.cover-preview-empty');
    if(empty)empty.hidden=Boolean(coverImageUrl);
    if(coverImageClear)coverImageClear.hidden=!coverImageUrl;

    const title=String(titleInput?.value||'').trim();
    const author=String(authorInput?.value||'').trim();
    const subtitle=String(subtitleInput?.value||'').trim();
    const episode=String(episodeInput?.value||'').trim();
    const episodeTitle=String(episodeTitleInput?.value||'').trim();

    if(coverPreviewLogo){coverPreviewLogo.src=coverLogoUrl||'';coverPreviewLogo.hidden=!coverLogoUrl;}
    if(coverPreviewTitle){coverPreviewTitle.textContent=title||t('cover.preview.untitled');coverPreviewTitle.hidden=Boolean(coverLogoUrl);}
    if(coverPreviewAuthor){coverPreviewAuthor.textContent=author;coverPreviewAuthor.hidden=!author;}
    if(coverPreviewEpisode){coverPreviewEpisode.textContent=episode;coverPreviewEpisode.hidden=!episode;}
    if(coverPreviewSubtitle){coverPreviewSubtitle.textContent=subtitle;coverPreviewSubtitle.hidden=!subtitle;}
    if(coverPreviewEpisodeTitle){coverPreviewEpisodeTitle.textContent=episodeTitle;coverPreviewEpisodeTitle.hidden=!episodeTitle;}

    coverPreview.dataset.liveTitle=title;
    coverPreview.dataset.liveAuthor=author;
    coverPreview.dataset.liveSubtitle=subtitle;
    coverPreview.dataset.liveEpisode=episode;
    coverPreview.dataset.liveEpisodeTitle=episodeTitle;
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
    if(meta.episodeTitle)manifest.episodeTitle=meta.episodeTitle;
    if(meta.description)manifest.description=meta.description;
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
        episode:episodeInput?.value.trim() || '',
        episodeTitle:episodeTitleInput?.value.trim() || '',
        description:descriptionInput?.value.trim() || ''
      },
      theme:selectedTheme,
      appearance:{
        cinemaTone: selectedTheme==='cinema' ? cinemaTone : 'dark',
        typography:{ fontFamily:selectedFont }
      },
      player:{ navigation:{ allowPrevious:true } },
      ...((coverImageUrl||coverLogoUrl) ? {cover:{...(coverImageUrl?{src:coverImageUrl,fit:'cover',position:'center center'}:{}),...(coverLogoUrl?{logo:{src:coverLogoUrl,_editorFileName:coverLogoFileName}}:{})}} : {}),
      ending:endingFromEasy(),
      scenes
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
    workingDocument.metadata.episodeTitle=episodeTitleInput?.value.trim() || '';
    workingDocument.metadata.description=descriptionInput?.value.trim() || '';
    workingDocument.theme=selectedTheme;
    workingDocument.appearance ||= {};
    workingDocument.appearance.typography ||= {};
    workingDocument.appearance.typography.fontFamily=selectedFont;
    workingDocument.appearance.cinemaTone=selectedTheme==='cinema' ? cinemaTone : (workingDocument.appearance.cinemaTone || 'dark');
    if(coverImageUrl||coverLogoUrl){
      workingDocument.cover={...(coverImageUrl?{src:coverImageUrl,fit:'cover',position:'center center'}:{}),...(coverLogoUrl?{logo:{src:coverLogoUrl,_editorFileName:coverLogoFileName}}:{})};
    } else delete workingDocument.cover;
    workingDocument.ending=endingFromEasy();
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
    const cover=doc?.cover;
    if(cover?.src)callback({kind:'cover',sceneIndex:-1,holder:cover,key:'src',src:cover.src,fileName:cover._editorFileName||coverImageFileName||''});
    if(cover?.logo?.src)callback({kind:'logo',sceneIndex:-1,holder:cover.logo,key:'src',src:cover.logo.src,fileName:cover.logo._editorFileName||coverLogoFileName||''});
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

    const coverPath=String(packaged.cover?.src||'').startsWith('assets/') ? String(packaged.cover.src) : '';

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
        doc.metadata.description=manifest.description||doc.metadata.description||'';
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
      if(doc.cover?.src){
        coverImageUrl=doc.cover.src;
        coverImageFileName=doc.cover._editorFileName||'cover';
        updateCoverPreview();
      } else if(manifest?.cover?.image && entries.get(manifest.cover.image)){
        const bytes=entries.get(manifest.cover.image);
        const blob=new Blob([bytes],{type:guessMime(manifest.cover.image)});
        coverImageUrl=URL.createObjectURL(blob);
        coverImageFileName=manifest.cover.image.split('/').pop()||'cover';
        assetRegistry.set(coverImageUrl,{blob,name:coverImageFileName});
        doc.cover={src:coverImageUrl,fit:'cover',position:'center center'};
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
    if(episodeTitleInput)episodeTitleInput.value=doc.metadata?.episodeTitle||'';
    if(descriptionInput)descriptionInput.value=doc.metadata?.description||'';
    coverImageUrl=doc.cover?.src||'';coverImageFileName=doc.cover?._editorFileName||'';
    coverLogoUrl=doc.cover?.logo?.src||'';coverLogoFileName=doc.cover?.logo?._editorFileName||'';
    if(endingLabelInput)endingLabelInput.value=doc.ending?.label||doc.ending?.title||'';
    endingLinkInputs.forEach((pair,index)=>{const item=doc.ending?.links?.[index]||{};if(pair.label)pair.label.value=item.label||item.title||'';if(pair.url)pair.url.value=item.url||item.href||'';});
    bodyInput.value=(doc.scenes||[]).map(scene=>scene.text||'').filter(Boolean).join('\n\n');
    updateCount();updateCoverPreview();updateEndingPreview();
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
    const recPanel=$('#autoRecPanel');if(recPanel)recPanel.hidden=false;
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
    if(liveEditEnabled&&liveEditToolbar)liveEditToolbar.hidden=false;
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
  const SCENE_STUDIO_API_BASE='https://scene-studio-api.a-hako.workers.dev';

  async function uploadPublishAsset(src){
    if(!src || !/^blob:/i.test(src))return src;
    const item=assetRegistry.get(src);
    if(!item?.blob)throw new Error(`Local asset is unavailable: ${item?.name||'asset'}`);

    const response=await fetch(`${SCENE_STUDIO_API_BASE}/asset`,{
      method:'POST',
      headers:{
        'Content-Type':item.blob.type||'application/octet-stream',
        'X-File-Name':encodeURIComponent(item.name||'asset')
      },
      body:item.blob
    });
    let payload=null;
    try{payload=await response.json();}catch(_){}
    if(!response.ok || !payload?.ok || !payload?.url){
      throw new Error(payload?.error || `Asset upload failed (${response.status})`);
    }
    return payload.url;
  }

  async function prepareDocumentForPublish(sceneDocument){
    const hosted=clone(sceneDocument);
    const cache=new Map();
    const refs=[];
    walkAssetRefs(hosted,ref=>refs.push(ref));

    for(const ref of refs){
      if(!/^blob:/i.test(ref.src))continue;
      let hostedUrl=cache.get(ref.src);
      if(!hostedUrl){
        hostedUrl=await uploadPublishAsset(ref.src);
        cache.set(ref.src,hostedUrl);
      }
      ref.holder[ref.key]=hostedUrl;
      delete ref.holder._editorManaged;
      delete ref.holder._editorFileName;
    }
    return hosted;
  }

  async function fetchWithTimeout(url,options={},timeoutMs=20000){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      return await fetch(url,{...options,signal:controller.signal,cache:'no-store'});
    }finally{
      clearTimeout(timer);
    }
  }

  const publishAdapter={
    async publish(sceneDocument,{id=''}={}){
      // Hosting v2: upload browser-local image/audio assets first, replace blob: URLs
      // with permanent Worker/R2 URLs, then publish the portable Scene document.
      const hostedDocument=await prepareDocumentForPublish(sceneDocument);
      const baseEndpoint=id?`${SCENE_STUDIO_API_BASE}/publish?id=${encodeURIComponent(id)}`:`${SCENE_STUDIO_API_BASE}/publish`;
      const request={
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(hostedDocument)
      };

      let response;
      try{
        response=await fetchWithTimeout(baseEndpoint,request,20000);
      }catch(error){
        // Updating an existing publication is idempotent for the same work id.
        // Safari can occasionally leave the first update request pending forever,
        // so retry that path once with a cache-busting query. Never retry a new
        // publication because that could create a second work id.
        if(!id || error?.name!=='AbortError')throw error;
        const retryEndpoint=`${baseEndpoint}&_=${Date.now()}`;
        response=await fetchWithTimeout(retryEndpoint,request,15000);
      }

      let payload=null;
      try{ payload=await response.json(); }catch(_){ /* handled below */ }
      if(!response.ok || !payload?.ok || !payload?.id){
        throw new Error(payload?.error || `Publish failed (${response.status})`);
      }

      const finalId=payload.id;
      return {
        id:finalId,
        // Keep the exact hosted document that was accepted for publication so
        // the editor can adopt permanent asset URLs after a successful publish.
        document:hostedDocument,
        url:`${SCENE_STUDIO_API_BASE}/work/${encodeURIComponent(finalId)}`
      };
    }
  };

  let latestPublishedId='';
  let latestPublishedUrl='';
  let latestPublishedFingerprint='';
  let latestPublishedAt=0;
  let latestPublicationStoppedAt=0;

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

  function syncEasyPublishButton(){
    const btn=$('#easyPublishButton');
    if(!btn)return;
    const hasSource=Boolean(bodyInput?.value.trim() || workingDocument?.scenes?.length);
    const status=currentPublishStatus();
    btn.disabled=!hasSource;
    const label=btn.querySelector('span');
    if(label)label.textContent=status==='published'?t('publish.published'):status==='dirty'?t('publish.update'):t('publish.action');
    btn.classList.toggle('is-published',status==='published');
    btn.classList.toggle('is-dirty',status==='dirty');
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
    syncEasyPublishButton();
  }

  function preparePublishFromEasy(){
    if(!bodyInput?.value.trim() && !workingDocument?.scenes?.length){bodyInput?.focus();return false;}
    ensureWorkingDocumentFromEasy();
    syncEasyShellToWorkingDocument();
    return Boolean(workingDocument?.scenes?.length);
  }

  function openPublishDialogFromEasy(){
    if(!preparePublishFromEasy())return;
    openPublishDialog();
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

  async function runPublish(){
    if(!workingDocument?.scenes?.length)return;
    const wasUpdate=currentPublishStatus()==='dirty';
    setPublishState('working');
    try{
      const result=await publishAdapter.publish(
        getDocumentForPlayback(),
        {id:latestPublishedId||''}
      );
      if(!result?.url)throw new Error('Publish URL missing');

      latestPublishedId=result.id||latestPublishedId;
      latestPublishedUrl=result.url;

      // Once R2 has accepted the assets, stop depending on session-only blob:
      // URLs. This is especially important on iPhone when a published work is
      // reopened for editing: blob URLs from a previous page lifetime are no
      // longer valid, while the hosted URLs remain stable.
      if(result.document){
        workingDocument=clone(result.document);
        coverImageUrl=workingDocument.cover?.src||'';
        coverLogoUrl=workingDocument.cover?.logo?.src||'';
        refreshCoverPreviewLayout();
        updateEndingPreview();
        if(!advancedScreen.hidden){
          normalizeSceneIds();
          refreshDocumentLanguages();
          renderAdvanced();
        }
      }

      latestPublishedFingerprint=currentPublishFingerprint();
      latestPublishedAt=Date.now();
      latestPublicationStoppedAt=0;

      const text=$('#publishUrlText');
      if(text)text.textContent=latestPublishedUrl;
      setPublishState('success');
      syncPublishCopyForStatus();
      await saveDraftNow();

    }catch(error){
      console.warn('Publish failed',error);
      setPublishState('error');
      const message=$('#publishStateError p');
      if(message && error?.name==='AbortError'){
        message.textContent=uiLanguage==='ja'
          ? '更新の応答がタイムアウトしました。通信状態を確認して、もう一度お試しください。'
          : 'The update timed out. Check your connection and try again.';
      }
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


  let liveEditChromeObserver=null;
  let liveEditSoundBound=false;

  function bindLiveEditSoundControl(){
    if(!player || liveEditSoundBound)return;
    const right=player.els?.restart || playerHost.querySelector('.sp-restart');
    if(!right)return;

    liveEditSoundBound=true;
    right.hidden=false;
    right.disabled=false;
    right.textContent='♪';
    right.setAttribute('aria-label','音声をオン・オフ');
    right.setAttribute('aria-pressed', player.isMuted?.() ? 'false' : 'true');
    right.classList.toggle('is-muted', Boolean(player.isMuted?.()));

    // Same contract as Prayer/public-player.js:
    // reuse the Core restart slot and override the original restart action.
    right.addEventListener('click',(e)=>{
      if(!liveEditEnabled)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const muted=player.toggleMuted();
      right.classList.toggle('is-muted',muted);
      right.setAttribute('aria-pressed',muted?'false':'true');
    },true);

    playerHost.addEventListener('sceneplayer:mutechange',(e)=>{
      const muted=Boolean(e.detail?.muted);
      right.classList.toggle('is-muted',muted);
      right.setAttribute('aria-pressed',muted?'false':'true');
    });
  }

  function syncLiveEditPreviewChrome(){
    if(!liveEditEnabled)return;
    const coverOpen=playerHost.classList.contains('sp-cover-open');
    const recPanel=$('#autoRecPanel');

    // Cover is an entry screen, not Scene 0.
    if(recPanel)recPanel.hidden=coverOpen && !autoRecActive;

    if(coverOpen){
      setLiveToolbarVisible(false);
      closeLiveEditSheet();
    }
    bindLiveEditSoundControl();
  }

  function observeLiveEditPreviewChrome(){
    liveEditChromeObserver?.disconnect?.();
    liveEditChromeObserver=new MutationObserver(syncLiveEditPreviewChrome);
    liveEditChromeObserver.observe(playerHost,{attributes:true,attributeFilter:['class']});
  }

  function ensurePlayer(){
    if(player)return player;
    player=new ScenePlayerCore(playerHost,{allowPrevious:true,keyboard:true,swipe:true,endOnNextAction:true,maxStackVisible:4,autoDelay:2600,uiLanguage});
    playerHost.addEventListener('sceneplayer:scenechange',(event)=>{
      syncPublishPreviewButton(false);
      if(autoRecActive && event.detail?.direction==='next')recordAutoRecBoundary();
      syncLiveEditPreviewChrome();
    });
    playerHost.addEventListener('sceneplayer:coverstart',syncLiveEditPreviewChrome);
    playerHost.addEventListener('sceneplayer:load',syncLiveEditPreviewChrome);
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
    // Preview / AUTO REC is reader-facing. Keep the snapshot, hide Studio chrome.
    if(inPlayer){
      if(undoBarTimer)window.clearTimeout(undoBarTimer);
      undoBarTimer=null;
      if(bar){bar.hidden=true;bar.classList.remove('is-visible','is-hiding');}
      return;
    }
    // In authoring screens the slot is always present; availability is shown by tone.
    if(compact){compact.hidden=false;compact.disabled=!undoSnapshot;}
  }
  function setScreen(name){ editorScreen.hidden=name!=='easy'; advancedScreen.hidden=name!=='advanced'; playerScreen.hidden=name!=='player'; const open=name==='player'; const returnButton=$('#editReturnButton'); if(returnButton)returnButton.hidden=!open; document.documentElement.classList.toggle('easy-player-open',open); document.body.classList.toggle('easy-player-open',open); const modeLabel=$('#studioModeLabel'); if(modeLabel) modeLabel.textContent=name==='advanced'?'Advanced Studio':'Easy Studio'; syncUndoVisibilityForScreen(name); }
  // v0.2.97: the shared authoring header stays the same size while scrolling.
  const sharedHeader=$('#studioSharedHeader');
  sharedHeader?.classList.remove('is-compact');
  function scrollScreenToTop(screen){
    // iOS Safari/Chrome can preserve the document scroll position when a hidden
    // Studio screen is swapped in. Reset both the page and the screen itself.
    if(screen) screen.scrollTop=0;
    const reset=()=>window.scrollTo(0,0);
    reset();
    requestAnimationFrame(()=>{ reset(); requestAnimationFrame(reset); });
  }

  let playerReturnScrollY=0;
  let playerReturnScreenScrollTop=0;

  function setPreviewChromeHidden(hidden){
    const controls=[$('#floatingAdvancedButton'),$('#floatingPreviewButton'),$('#undoCompactButton')];
    for(const el of controls){
      if(!el)continue;
      if(hidden){
        el.style.setProperty('display','none','important');
        el.style.setProperty('visibility','hidden','important');
        el.style.setProperty('pointer-events','none','important');
      }else{
        el.style.removeProperty('display');
        el.style.removeProperty('visibility');
        el.style.removeProperty('pointer-events');
      }
    }
  }
  function getDocumentForPlayback(){ return clone(workingDocument || buildSceneDocument()); }
  function openPlayer({from='easy', startAt=0}={}){
    if(from==='easy'){
      if(!bodyInput.value.trim() && !workingDocument){bodyInput.focus();return;}
      ensureWorkingDocumentFromEasy();
      syncEasyShellToWorkingDocument();
    } else {
      syncAdvancedFieldsToScene();
    }
    if(!workingDocument?.scenes?.length)return;

    // v0.3.03: return to the last known-good Preview architecture.
    // The return button lives inside #playerScreen, exactly as it did when
    // iPhone return worked reliably. Keep only the newer scroll restore.
    playerReturnTarget=from;
    playerReturnScrollY=Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
    const returnScreen=(from==='advanced' ? advancedScreen : editorScreen);
    playerReturnScreenScrollTop=Math.max(0, returnScreen?.scrollTop || 0);

    playerScreen.style.removeProperty('display');
    setScreen('player');
    setPreviewChromeHidden(true);
    syncPublishPreviewButton(false);

    const p=ensurePlayer();
    p.options.historyAllScenes=true;
    enableLiveEdit();
    p.setUILanguage?.(uiLanguage);
    const playbackDoc=getDocumentForPlayback();
    p.load(playbackDoc,{startAt});
    const ep=String(playbackDoc.metadata?.episode||'').trim();
    const epTitle=String(playbackDoc.metadata?.episodeTitle||'').trim();
    if(p.els?.title)p.els.title.textContent=[ep,epTitle].filter(Boolean).join(' ・ ') || playbackDoc.title || '';
    if(p.els?.author)p.els.author.textContent=playbackDoc.author||'';
    p.unlockAudio(true);
  }
  function closePlayer(){
    disableLiveEdit();
    // Proven v0.2.89 path: clean up, switch screen, then restore position.
    // No pointer/touch capture tricks and no detached return control.
    syncPublishPreviewButton(false);
    try{if(autoRecActive)finishAutoRec(false);}catch(error){console.warn('AUTO REC cleanup failed',error);}
    try{player?.stopAuto?.();}catch(error){console.warn('Player auto cleanup failed',error);}
    try{player?._stopAllAudio?.(true);}catch(error){console.warn('Player audio cleanup failed',error);}

    const target=playerReturnTarget==='advanced'?'advanced':'easy';
    playerScreen.style.removeProperty('display');
    setScreen(target);
    setPreviewChromeHidden(false);
    if(target==='advanced')renderAdvanced();

    const restore=()=>{
      const returnScreen=(target==='advanced'?advancedScreen:editorScreen);
      if(returnScreen)returnScreen.scrollTop=playerReturnScreenScrollTop;
      try{window.scrollTo({top:playerReturnScrollY,left:0,behavior:'instant'});}
      catch(_){window.scrollTo(0,playerReturnScrollY);}
      syncUndoVisibilityForScreen(target);
    };
    restore();
    requestAnimationFrame(()=>{restore();requestAnimationFrame(restore);});
  }

  function openAdvanced(){
    if(!bodyInput.value.trim() && !workingDocument){bodyInput.focus();return;}
    ensureWorkingDocumentFromEasy();
    syncEasyShellToWorkingDocument();
    selectedSceneIndex=Math.max(0,Math.min(selectedSceneIndex,workingDocument.scenes.length-1));
    renderAdvanced(); updateEasyFileActions(); setScreen('advanced');
    const modeFab=$('#floatingAdvancedButton');
    if(modeFab){modeFab.hidden=false;modeFab.disabled=false;modeFab.querySelector('span').textContent='✎';modeFab.setAttribute('aria-label','Easy編集に戻る');modeFab.title='Easy';}
    scrollScreenToTop(advancedScreen);
  }
  function closeAdvanced(){
    syncAdvancedFieldsToScene();
    restoreEasyStateFromDocument(workingDocument);
    easySourceDirty=false;
    updateEasyFileActions();
    setScreen('easy');
    const modeFab=$('#floatingAdvancedButton');
    if(modeFab){modeFab.querySelector('span').textContent='⚙︎';modeFab.setAttribute('aria-label','細かく調整');modeFab.title='Advanced';updateEasyFileActions();}
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
    const p=ensurePresentation(scene); p.display=$('#sceneDisplaySelect').value;
    const advancedEffect=$('#sceneEffectSelect').value;
    if(advancedEffect==='typewriter'){
      p.effect='none';
      p.typing={...(p.typing||{}),enabled:true,speed:Number(p.typing?.speed)||55,cursor:p.typing?.cursor!==false};
    }else{
      if(p.typing)delete p.typing;
      p.effect=advancedEffect;
    }
    p.text.size=$('#sceneSizeSelect').value;
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
    $('#sceneEffectSelect').value=scene.presentation?.typing?.enabled?'typewriter':(scene.presentation?.effect || 'auto'); $('#sceneSizeSelect').value=scene.presentation?.text?.size || 'auto';
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
      const effectLabel=scene.presentation?.typing?.enabled?'タイプライター':({auto:t('effect.auto'),fade:t('effect.fade'),pop:t('effect.pop'),blur:t('effect.blur'),whisper:t('effect.whisper'),loud:t('effect.loud'),pulse:t('effect.pulse'),shake:t('effect.shake'),tilt:t('effect.tilt'),none:t('effect.none')}[scene.presentation?.effect||'auto'] || (scene.presentation?.effect||'auto'));
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
        description:descriptionInput?.value ?? '',
        language:languageInput?.value ?? 'ja',
        body:bodyInput?.value ?? ''
      }
    };
  }

  function showCompactUndo(){
    if(!undoSnapshot || !playerScreen?.hidden)return;
    const compact=$('#undoCompactButton');
    if(compact){compact.hidden=false;compact.disabled=!undoSnapshot;}
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
    if(compact){compact.hidden=false;compact.disabled=false;}
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
    if(compact){compact.hidden=false;compact.disabled=true;}
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
    if(descriptionInput)descriptionInput.value=snap.easy.description||'';
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
    if(compact){compact.hidden=false;compact.disabled=true;}
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

  bodyInput.addEventListener('input',()=>{ updateCount(); easySourceDirty=true; syncEasyPublishButton(); });
  $('#sceneSubTextInput').addEventListener('input',autoGrowSubText);
  coverLogoChoose?.addEventListener('click',()=>coverLogoInput?.click());
  coverLogoInput?.addEventListener('change',async()=>{
    const file=coverLogoInput.files?.[0]; if(!file)return;
    if(file.type && file.type!=='image/png'){alert('作品ロゴは透過PNGを選んでください。');coverLogoInput.value='';return;}
    try{
      const snap=await snapshotPickedFile(file);
      const logoBlob=await trimTransparentPng(snap.blob);
      if(coverLogoUrl && /^blob:/i.test(coverLogoUrl))URL.revokeObjectURL(coverLogoUrl);
      coverLogoUrl=URL.createObjectURL(logoBlob);
      coverLogoFileName=snap.name||'logo.png';
      assetRegistry.set(coverLogoUrl,{blob:logoBlob,name:coverLogoFileName});
      refreshCoverPreviewLayout();syncEasyShellToWorkingDocument();syncEasyPublishButton();scheduleDraftSave(80);
    }catch(error){console.error(error);alert('作品ロゴを読み込めませんでした。');coverLogoInput.value='';}
  });
  coverLogoClear?.addEventListener('click',()=>{
    if(coverLogoUrl && /^blob:/i.test(coverLogoUrl))URL.revokeObjectURL(coverLogoUrl);
    coverLogoUrl='';coverLogoFileName='';if(coverLogoInput)coverLogoInput.value='';
    if(coverQuickLogoClear)coverQuickLogoClear.hidden=true;
    refreshCoverPreviewLayout();syncEasyShellToWorkingDocument();syncEasyPublishButton();scheduleDraftSave(80);
  });
  coverImageInput?.addEventListener('change',async()=>{
    const file=coverImageInput.files?.[0]; if(!file)return;
    try{
      const snap=await snapshotPickedFile(file);
      if(coverImageUrl && /^blob:/i.test(coverImageUrl))URL.revokeObjectURL(coverImageUrl);
      coverImageUrl=URL.createObjectURL(snap.blob);
      coverImageFileName=snap.name||'cover';
      assetRegistry.set(coverImageUrl,{blob:snap.blob,name:coverImageFileName});
      refreshCoverPreviewLayout();syncEasyShellToWorkingDocument();syncEasyPublishButton();scheduleDraftSave(80);
    }catch(error){console.error(error);alert('画像を読み込めませんでした。もう一度選択してください。');coverImageInput.value='';}
  });
  coverImageClear?.addEventListener('click',()=>{if(coverQuickImageClear)coverQuickImageClear.hidden=true;
    if(coverImageUrl && /^blob:/i.test(coverImageUrl))URL.revokeObjectURL(coverImageUrl);
    coverImageUrl=''; coverImageFileName='';
    if(coverImageInput)coverImageInput.value='';
    refreshCoverPreviewLayout();syncEasyShellToWorkingDocument();syncEasyPublishButton();scheduleDraftSave(80);
  });
  // Work metadata is shell data, not Scene source. Never rebuild the Scene array here.
  [titleInput,authorInput,subtitleInput,seriesTitleInput,episodeInput,episodeTitleInput,descriptionInput]
    .forEach(el=>el?.addEventListener('input',()=>{
      refreshCoverPreviewLayout();
      syncEasyShellToWorkingDocument();
      syncEasyPublishButton();
      rememberWorkIdentity();
      scheduleDraftSave(250);
    }));
  authorInput?.addEventListener('change',()=>rememberAuthorName(authorInput.value));
  authorInput?.addEventListener('blur',()=>rememberAuthorName(authorInput.value));
  endingLabelInput?.addEventListener('input',()=>{
    updateEndingPreview();
    syncEasyShellToWorkingDocument();
    syncEasyPublishButton();
    scheduleDraftSave(250);
  });
  endingLinkInputs.forEach(pair=>{
    pair.kicker?.addEventListener('input',()=>{updateEndingPreview();syncEasyShellToWorkingDocument();syncEasyPublishButton();scheduleDraftSave(250);});
    pair.label?.addEventListener('input',()=>{
      updateEndingPreview();
      syncEasyShellToWorkingDocument();
      syncEasyPublishButton();
      scheduleDraftSave(250);
    });
    pair.url?.addEventListener('input',()=>{
      updateEndingPreview();
      syncEasyShellToWorkingDocument();
      syncEasyPublishButton();
      scheduleDraftSave(250);
    });
  });
  // v0.2.75: the cover itself is the primary Easy Studio editor.
  function syncCoverQuickToMain(){
    if(titleInput)titleInput.value=coverQuickWorkTitle?.value||'';
    if(authorInput)authorInput.value=coverQuickAuthor?.value||'';
    if(subtitleInput)subtitleInput.value=coverQuickSubtitle?.value||'';
    if(episodeInput)episodeInput.value=coverQuickEpisode?.value||'';
    if(episodeTitleInput)episodeTitleInput.value=coverQuickEpisodeTitle?.value||'';
    if(descriptionInput)descriptionInput.value=coverQuickDescription?.value||'';
    refreshCoverPreviewLayout();
    syncEasyShellToWorkingDocument();
    syncEasyPublishButton();
    rememberWorkIdentity();
    scheduleDraftSave(250);
  }
  function openCoverQuickEditor(focusTarget='title'){
    if(!coverQuickDialog)return;
    coverQuickWorkTitle.value=titleInput?.value||'';
    coverQuickAuthor.value=authorInput?.value||'';
    coverQuickSubtitle.value=subtitleInput?.value||'';
    coverQuickEpisode.value=episodeInput?.value||'';
    coverQuickEpisodeTitle.value=episodeTitleInput?.value||'';
    if(coverQuickDescription)coverQuickDescription.value=descriptionInput?.value||'';
    coverQuickImageClear.hidden=!coverImageUrl;
    coverQuickLogoClear.hidden=!coverLogoUrl;
    coverQuickDialog.hidden=false;
    document.documentElement.classList.add('ending-quick-open');
    const target={title:coverQuickWorkTitle,author:coverQuickAuthor,subtitle:coverQuickSubtitle,episode:coverQuickEpisode,episodeTitle:coverQuickEpisodeTitle,description:coverQuickDescription}[focusTarget]||coverQuickWorkTitle;
    requestAnimationFrame(()=>target?.focus());
  }
  function closeCoverQuickEditor(){
    if(!coverQuickDialog)return;
    coverQuickDialog.hidden=true;
    document.documentElement.classList.remove('ending-quick-open');
    authorInput?.dispatchEvent(new Event('change',{bubbles:true}));
    refreshCoverPreviewLayout();
    setTimeout(refreshCoverPreviewLayout,160);
  }

  // v0.2.75: direct-preview editing stays isolated from the rest of Easy Studio.
  function revealWorkField(field){
    if(!field)return;
    if(workMetaSection)workMetaSection.open=true;
    requestAnimationFrame(()=>{field.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>field.focus(),220);});
  }
  coverPreview?.addEventListener('click',()=>openCoverQuickEditor('title'));
  coverPreview?.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openCoverQuickEditor('title');}});
  coverPreviewTitle?.addEventListener('click',(event)=>{event.stopPropagation();openCoverQuickEditor('title');});
  coverPreviewAuthor?.addEventListener('click',(event)=>{event.stopPropagation();openCoverQuickEditor('author');});
  coverPreviewSubtitle?.addEventListener('click',(event)=>{event.stopPropagation();openCoverQuickEditor('subtitle');});
  [coverQuickWorkTitle,coverQuickAuthor,coverQuickSubtitle,coverQuickEpisode,coverQuickEpisodeTitle,coverQuickDescription].forEach(el=>el?.addEventListener('input',syncCoverQuickToMain));
  coverQuickLogo?.addEventListener('click',()=>coverLogoInput?.click());
  coverQuickLogoClear?.addEventListener('click',()=>coverLogoClear?.click());
  coverQuickImage?.addEventListener('click',()=>coverImageInput?.click());
  coverQuickImageClear?.addEventListener('click',()=>{coverImageClear?.click();coverQuickImageClear.hidden=true;});
  coverQuickDone?.addEventListener('click',closeCoverQuickEditor);
  coverQuickClose?.addEventListener('click',closeCoverQuickEditor);
  coverQuickDialog?.addEventListener('click',(event)=>{if(event.target===coverQuickDialog)closeCoverQuickEditor();});
  endingPreviewCenterEdit?.addEventListener('click',()=>openEndingQuickEditor('center'));
  endingPreviewLinks[0]?.addEventListener('click',()=>openEndingQuickEditor('left'));
  endingPreviewLinks[1]?.addEventListener('click',()=>openEndingQuickEditor('right'));
  if(endingPreviewCover){
    const notifyFixedCover=(event)=>{
      event?.preventDefault?.();
      event?.stopPropagation?.();
      showFixedActionNotice('「表紙に戻る」は固定です');
    };
    endingPreviewCover.addEventListener('pointerup',notifyFixedCover);
    endingPreviewCover.addEventListener('click',(event)=>{
      // Keyboard-generated click still works; pointer clicks were already handled.
      if(event.detail===0)notifyFixedCover(event);
      else { event.preventDefault(); event.stopPropagation(); }
    });
    endingPreviewCover.addEventListener('keydown',(event)=>{
      if(event.key==='Enter'||event.key===' '){ notifyFixedCover(event); }
    });
  }
  endingQuickCenterText?.addEventListener('input',syncQuickEndingToMain);
  [endingQuickKicker,endingQuickLabel,endingQuickUrl].forEach(el=>el?.addEventListener('input',syncQuickEndingToMain));
  endingQuickClear?.addEventListener('click',()=>{endingQuickKicker.value='';endingQuickLabel.value='';endingQuickUrl.value='';syncQuickEndingToMain();});
  endingQuickDone?.addEventListener('click',()=>closeEndingQuickEditor(true));
  endingQuickClose?.addEventListener('click',()=>closeEndingQuickEditor(true));
  endingQuickDialog?.addEventListener('click',(event)=>{if(event.target===endingQuickDialog)closeEndingQuickEditor(true);});
  endingLabelInput?.addEventListener('change',()=>saveEndingRecent({type:'center',text:endingLabelInput.value}));
  endingLinkInputs.forEach(pair=>[pair.kicker,pair.label,pair.url].forEach(el=>el?.addEventListener('change',()=>saveEndingRecent({type:'slot',kicker:pair.kicker?.value,label:pair.label?.value,url:pair.url?.value}))));

  languageInput?.addEventListener('change',()=>{syncEasyShellToWorkingDocument();syncEasyPublishButton();});
  if(endingLegacyEditor){
    endingLegacyEditor.open = window.matchMedia('(min-width:721px)').matches;
  }
  renderAuthorHistory();
  updateCoverPreview();
  updateEndingPreview();

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
  ['publishFromPreviewButton','autoRecStart','autoRecCancel','autoRecRetry'].forEach(id=>{
    const el=$('#'+id); if(!el)return;
    ['pointerdown','pointerup','touchstart','touchend'].forEach(type=>{
      el.addEventListener(type,(event)=>event.stopPropagation(),{passive:true});
    });
  });
  $('#autoRecStart')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();startAutoRec();});
  $('#autoRecCancel')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();finishAutoRec(false);});
  $('#autoRecRetry')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();startAutoRec();});
  $('#publishFromPreviewButton')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();openPublishDialog();});
  $('#easyPublishButton')?.addEventListener('click',(event)=>{event.preventDefault();openPublishDialogFromEasy();});
  $('#publishDialogClose')?.addEventListener('click',closePublishDialog);
  $('#publishConfirmButton')?.addEventListener('click',runPublish);
  $('#publishRetryButton')?.addEventListener('click',runPublish);
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
    const menuExport=$('#menuExportPackageButton');
    if(menuExport) menuExport.disabled=!hasSource;
    const floatingAdvanced=$('#floatingAdvancedButton');
    if(floatingAdvanced){
      floatingAdvanced.hidden=false;
      const inAdvanced=!advancedScreen.hidden;
      floatingAdvanced.disabled=inAdvanced ? false : !hasDocument;
      floatingAdvanced.querySelector('span').textContent=inAdvanced?'✎':'⚙︎';
      floatingAdvanced.setAttribute('aria-label',inAdvanced?'Easy編集に戻る':'細かく調整');
      floatingAdvanced.title=inAdvanced?'Easy':'Advanced';
    }
    const floatingPreview=$('#floatingPreviewButton');
    if(floatingPreview)floatingPreview.disabled=!hasSource;
    const compactUndo=$('#undoCompactButton');
    if(compactUndo){compactUndo.hidden=false;compactUndo.disabled=!undoSnapshot;}
    const menuDraftCount=$('#menuDraftCount');
    const toolbarDraftCount=$('#draftToolbarCount');
    if(menuDraftCount && toolbarDraftCount) menuDraftCount.textContent=toolbarDraftCount.textContent;
    syncEasyPublishButton();
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
  const easyMenuButton=$('#easyMenuButton');
  const easyMenuPanel=$('#easyMenuPanel');
  const easyMenuBackdrop=$('#easyMenuBackdrop');
  function closeEasyMenu(){
    if(!easyMenuPanel)return;
    easyMenuPanel.hidden=true;
    if(easyMenuBackdrop)easyMenuBackdrop.hidden=true;
    document.body.classList.remove('easy-menu-open');
    easyMenuButton?.setAttribute('aria-expanded','false');
  }
  easyMenuButton?.addEventListener('click',(e)=>{
    e.stopPropagation();
    const willOpen=easyMenuPanel?.hidden;
    if(easyMenuPanel)easyMenuPanel.hidden=!willOpen;
    if(easyMenuBackdrop)easyMenuBackdrop.hidden=!willOpen;
    document.body.classList.toggle('easy-menu-open',Boolean(willOpen));
    easyMenuButton.setAttribute('aria-expanded',willOpen?'true':'false');
  });
  easyMenuPanel?.addEventListener('click',(e)=>e.stopPropagation());
  easyMenuBackdrop?.addEventListener('click',closeEasyMenu);

  // v0.2.94: menu is a top-right popover; no drag-to-dismiss gesture.
  document.addEventListener('click',closeEasyMenu);
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeEasyMenu();});
  $('#menuExportPackageButton')?.addEventListener('click',()=>{closeEasyMenu();exportScenePackage();});
  $('#menuDraftManageButton')?.addEventListener('click',()=>{closeEasyMenu();$('#draftManageButton')?.click();});
  $('#menuNewDraftButton')?.addEventListener('click',()=>{closeEasyMenu();$('#newDraftQuickButton')?.click();});
  $('#floatingAdvancedButton')?.addEventListener('click',()=>{
    if(!advancedScreen.hidden) closeAdvanced();
    else openAdvanced();
  });

  $('#floatingPreviewButton')?.addEventListener('click',()=>{
    if(!advancedScreen.hidden){
      syncAdvancedFieldsToScene();
      openPlayer({from:'advanced',startAt:selectedSceneIndex});
    }else{
      openPlayer({from:'easy',startAt:0});
      updateEasyFileActions();
    }
  });
  $('#easyAdvancedReturnButton')?.addEventListener('click',openAdvanced);
  $('#exportSceneButton').addEventListener('click',exportSceneDocument);
  // v0.3.04: this legacy button is no longer present in the compact header UI.
  // Guard it so initialization continues and later controls (including Preview return)
  // always receive their event listeners.
  $('#exportPackageButton')?.addEventListener('click',exportScenePackage);
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
  // v0.3.03: use the original proven return interaction.
  $('#editReturnButton')?.addEventListener('click',(event)=>{
    event.preventDefault();
    event.stopPropagation();
    closePlayer();
  });
  $('#advancedBackButton')?.addEventListener('click',closeAdvanced);
  $('#advancedPreviewButton')?.addEventListener('click',()=>{syncAdvancedFieldsToScene();openPlayer({from:'advanced',startAt:selectedSceneIndex});});
  $('#advancedExportButton')?.addEventListener('click',()=>{syncAdvancedFieldsToScene();exportScenePackage();});
  $('#allowPreviousInput').addEventListener('change',()=>{if(workingDocument){workingDocument.player ||= {};workingDocument.player.navigation ||= {};workingDocument.player.navigation.allowPrevious=$('#allowPreviousInput').checked;}});
  $('#moveUpButton').addEventListener('click',()=>moveScene(-1)); $('#moveDownButton').addEventListener('click',()=>moveScene(1));
  $('#mergePreviousButton').addEventListener('click',mergePrevious); $('#splitSceneButton').addEventListener('click',splitAtCursor); $('#addSceneButton').addEventListener('click',addScene); $('#deleteSceneButton').addEventListener('click',requestDeleteScene);
  const advancedEffectSelect=$('#sceneEffectSelect');
  if(advancedEffectSelect){
    let typeOption=advancedEffectSelect.querySelector('option[value="typewriter"]');
    if(!typeOption){
      typeOption=advancedEffectSelect.querySelector('option[value="slow"]');
      if(typeOption){typeOption.value='typewriter';typeOption.textContent='タイプライター';}
      else{
        typeOption=document.createElement('option');typeOption.value='typewriter';typeOption.textContent='タイプライター';
        const none=advancedEffectSelect.querySelector('option[value="none"]');advancedEffectSelect.insertBefore(typeOption,none||null);
      }
    }
  }
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


  // ---------------------------------------------------------
  // Live Edit v0.1 — preview-first authoring prototype.
  // Preview is the navigation surface; Advanced remains the detail surface.
  // ---------------------------------------------------------
  const liveEditToolbar=$('#liveEditToolbar');
  const liveInlineToolbar=$('#liveInlineToolbar');
  const liveEditSheet=$('#liveEditSheet');
  const liveEditSheetBody=$('#liveEditSheetBody');
  const liveEditSheetTitle=$('#liveEditSheetTitle');
  const liveEditSceneNumber=$('#liveEditSceneNumber');
  const desktopLivePanel=$('#desktopLivePanel');
  const desktopLivePanelBody=$('#desktopLivePanelBody');
  const desktopSceneLabel=$('#desktopSceneLabel');
  const desktopPrevScene=$('#desktopPrevScene');
  const desktopNextScene=$('#desktopNextScene');
  const desktopLiveMQ=window.matchMedia('(min-width:1100px)');
  let liveEditEnabled=false;
  let liveEditToolbarVisible=false;
  let liveInlineEditEl=null;
  let liveInlineKeyboardShift=0;
  let liveInlineIntroTimer=0;
  let liveInlineDockTimer=0;
  const LIVE_INLINE_HINT_KEY='sceneStudio.liveEdit.cursorHintSeen.v1';

  function liveEditScene(){
    const i=Math.max(0,Math.min(player?.index ?? selectedSceneIndex,(workingDocument?.scenes?.length||1)-1));
    return {scene:workingDocument?.scenes?.[i]||null,index:i};
  }
  function closeLiveEditSheet(){ if(liveEditSheet)liveEditSheet.hidden=true; document.body.classList.remove('live-edit-sheet-open'); }
  function setLiveToolbarVisible(show){
    liveEditToolbarVisible=!!show;
    if(liveEditToolbar) liveEditToolbar.hidden=!liveEditEnabled||!liveEditToolbarVisible;
    playerHost.classList.toggle('live-edit-toolbar-visible',liveEditEnabled&&liveEditToolbarVisible);
  }
  function resetInlineKeyboardShift(){
    liveInlineKeyboardShift=0;
    playerHost.style.removeProperty('--live-inline-keyboard-shift');
  }
  function finishInlineTextEdit(){
    if(!liveInlineEditEl){
      resetInlineKeyboardShift();
      if(liveInlineToolbar)liveInlineToolbar.hidden=true;
      return;
    }
    liveInlineEditEl.removeAttribute('contenteditable');
    liveInlineEditEl.removeAttribute('role');
    liveInlineEditEl.classList.remove('live-inline-editing');
    liveInlineEditEl=null;
    playerHost.classList.remove('live-inline-text-edit');
    document.body.classList.remove('live-inline-text-edit');
    resetInlineKeyboardShift();
    if(liveInlineToolbar){liveInlineToolbar.hidden=true;liveInlineToolbar.classList.remove('is-intro','is-expanded');}
    clearTimeout(liveInlineIntroTimer);
    clearTimeout(liveInlineDockTimer);
    document.documentElement.style.removeProperty('--live-keyboard-inset');
    if(liveEditEnabled&&!autoRecActive&&!player?.historyOpen)setLiveToolbarVisible(true);
  }
  function updateInlineAutoFit(scene,el){
    if(!scene||!el)return;
    const article=el.closest('.sp-scene');
    if(!article)return;
    // Reuse Scene Player Core's own Auto Fit tiers so Live Edit and replay match.
    const textStyle=scene.presentation?.text||{};
    const fit=typeof player?._resolveAutoFit==='function'
      ? player._resolveAutoFit(scene,textStyle)
      : 'normal';
    article.dataset.fit=fit;
  }
  function keepInlineCaretVisible(){
    const el=liveInlineEditEl;
    if(!el||document.activeElement!==el)return;
    const sel=getSelection();
    if(!sel||!sel.rangeCount)return;
    const range=sel.getRangeAt(0).cloneRange();
    range.collapse(false);
    let rect=range.getBoundingClientRect();
    // Empty-line caret can report a zero rect on iOS; fall back to the text node.
    if(!rect||(!rect.width&&!rect.height)) rect=el.getBoundingClientRect();

    const vv=window.visualViewport;
    const viewportTop=vv?.offsetTop||0;
    const viewportHeight=vv?.height||window.innerHeight;
    // Keep a comfortable strip above iOS' input accessory / keyboard.
    const safeTop=viewportTop+72;
    const safeBottom=viewportTop+viewportHeight-86;
    let next=liveInlineKeyboardShift;

    if(rect.bottom>safeBottom){
      next-=rect.bottom-safeBottom+18;
    }else if(rect.top<safeTop && liveInlineKeyboardShift<0){
      next+=Math.min(safeTop-rect.top+18,-liveInlineKeyboardShift);
    }
    const minShift=-Math.round(window.innerHeight*0.48);
    next=Math.max(minShift,Math.min(0,next));
    if(Math.abs(next-liveInlineKeyboardShift)<1)return;
    liveInlineKeyboardShift=next;
    playerHost.style.setProperty('--live-inline-keyboard-shift',`${Math.round(next)}px`);
  }
  function updateLiveKeyboardInset(){
    if(!liveInlineEditEl||!liveInlineToolbar)return;
    const vv=window.visualViewport;
    const inset=vv?Math.max(0,window.innerHeight-(vv.height+vv.offsetTop)):0;
    document.documentElement.style.setProperty('--live-keyboard-inset',`${Math.round(inset)}px`);
  }
  function syncInlineTextToScene(){
    const el=liveInlineEditEl;
    if(!el)return '';
    const {scene}=liveEditScene();if(!scene)return '';
    const value=el.innerText.replace(/\n$/,'');
    scene.text=value;
    if(player?.currentScene)player.currentScene.text=value;
    el.classList.toggle('live-edit-empty-target',value.length===0);
    el.closest('.sp-scene')?.classList.toggle('live-edit-empty-scene',value.length===0);
    updateInlineAutoFit(scene,el);
    scheduleDraftSave(100);
    return value;
  }
  function inlineCaretOffset(){
    const el=liveInlineEditEl,sel=getSelection();
    if(!el||!sel||!sel.rangeCount)return -1;
    const range=sel.getRangeAt(0);
    if(!el.contains(range.startContainer))return -1;
    const before=range.cloneRange();
    before.selectNodeContents(el);
    before.setEnd(range.startContainer,range.startOffset);
    return before.toString().length;
  }
  function setInlineCaretOffset(offset){
    const el=liveInlineEditEl;if(!el)return false;
    const target=Math.max(0,Math.min(Number(offset)||0,el.innerText.replace(/\n$/,'').length));
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    let left=target,node=null;
    while((node=walker.nextNode())){
      const len=node.nodeValue?.length||0;
      if(left<=len){
        const range=document.createRange(),sel=getSelection();
        range.setStart(node,left);range.collapse(true);
        sel.removeAllRanges();sel.addRange(range);
        el.focus({preventScroll:true});
        requestAnimationFrame(keepInlineCaretVisible);
        return true;
      }
      left-=len;
    }
    const range=document.createRange(),sel=getSelection();
    range.selectNodeContents(el);range.collapse(false);sel.removeAllRanges();sel.addRange(range);
    el.focus({preventScroll:true});requestAnimationFrame(keepInlineCaretVisible);return true;
  }
  function moveInlineCaret(delta){
    const pos=inlineCaretOffset();if(pos<0)return;
    setInlineCaretOffset(pos+delta);
  }
  function jumpInlineCaretToPunctuation(direction){
    const el=liveInlineEditEl;if(!el)return;
    const text=el.innerText.replace(/\n$/,'');
    const pos=inlineCaretOffset();if(pos<0)return;
    // Scene editing usually splits at sentence / clause boundaries. Land AFTER punctuation/newline.
    const boundary=/[。、！？!?\n]/;
    if(direction<0){
      let i=Math.min(pos-2,text.length-1);
      for(;i>=0;i--){if(boundary.test(text[i])){setInlineCaretOffset(i+1);return;}}
      setInlineCaretOffset(0);
    }else{
      let i=Math.max(pos,text.length>0?0:-1);
      for(;i<text.length;i++){if(boundary.test(text[i])){setInlineCaretOffset(i+1);return;}}
      setInlineCaretOffset(text.length);
    }
  }
  function collapseInlineCursorDock(){
    if(!liveInlineToolbar)return;
    liveInlineToolbar.classList.remove('is-expanded','is-intro');
    clearTimeout(liveInlineDockTimer);
  }
  function expandInlineCursorDock(){
    if(!liveInlineToolbar)return;
    liveInlineToolbar.classList.add('is-expanded');
    liveInlineToolbar.classList.remove('is-intro');
    clearTimeout(liveInlineDockTimer);
    liveInlineDockTimer=setTimeout(()=>{
      liveInlineToolbar?.classList.remove('is-expanded');
    },4200);
  }
  function showInlineAuthoringIntro(){
    // v0.3.1: cursor tools are intentionally tucked away.
    // Editing shows only a tiny split/tool trigger; tap it to reveal helpers.
    collapseInlineCursorDock();
  }

  function ensureLiveEditEmptyTarget(){
    if(!liveEditEnabled||!playerHost)return;
    const {scene}=liveEditScene();
    const article=playerHost.querySelector('.sp-scene.is-active');
    if(!scene||!article)return;
    let text=article.querySelector('.sp-text');
    const empty=typeof scene.text!=='string'||scene.text.length===0;
    article.classList.toggle('live-edit-empty-scene',empty);
    if(empty&&!text){
      text=document.createElement('div');
      text.className='sp-text live-edit-empty-target';
      text.textContent='';
      try{player?._applyTextStyle?.(text,scene.presentation?.text||{},false);}catch(_){}
      article.appendChild(text);
    }else if(text){
      text.classList.toggle('live-edit-empty-target',empty);
    }
  }
  function liveEditSplitInlineAtCaret(){
    const {scene,index}=liveEditScene();if(!scene||!liveInlineEditEl)return;
    const text=syncInlineTextToScene();
    const pos=inlineCaretOffset();
    if(pos<=0||pos>=text.length){showUndo('分割する位置にカーソルを置いてください');return;}
    const left=text.slice(0,pos).trimEnd(),right=text.slice(pos).trimStart();
    if(!left||!right){showUndo('分割する位置にカーソルを置いてください');return;}
    captureUndo('Scene分割を元に戻せます');
    scene.text=left;
    const next=clone(scene);next.id=nextUniqueId();next.text=right;delete next.subText;delete next.audio;
    if(next.presentation)delete next.presentation.background;
    workingDocument.scenes.splice(index+1,0,next);
    finishInlineTextEdit();
    liveEditRenderAt(index+1,{preserveSheet:false});
    showUndo('カーソル位置で分割しました');
    // This click is still a direct user gesture on iOS, so focus the new Scene now.
    startInlineTextEdit();
  }

  
function updateLiveKeyboardInset(){
  const vv=window.visualViewport;
  if(!vv){
    document.documentElement.style.setProperty('--live-keyboard-inset','0px');
    return;
  }
  const inset=Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
  document.documentElement.style.setProperty('--live-keyboard-inset', `${inset}px`);
}
function bindLiveKeyboardViewport(){
  const vv=window.visualViewport;
  if(!vv || vv.__liveEditBound)return;
  vv.__liveEditBound=true;
  const refresh=()=>{
    if(document.body.classList.contains('live-inline-text-edit')){
      updateLiveKeyboardInset();
      requestAnimationFrame(updateLiveKeyboardInset);
    }
  };
  vv.addEventListener('resize',refresh);
  vv.addEventListener('scroll',refresh);
  window.addEventListener('orientationchange',refresh);
}
bindLiveKeyboardViewport();

function startInlineTextEdit(){
    const {scene}=liveEditScene(); if(!scene)return;
    finishInlineTextEdit(); closeLiveEditSheet(); setLiveToolbarVisible(true);
    const el=playerHost.querySelector('.sp-scene.is-active .sp-text'); if(!el)return;

    liveInlineEditEl=el;
    // Keep the six-key Live Edit strip available while the iOS keyboard is open.
    // This lets the author move directly from writing to typography/effects/etc.
    setLiveToolbarVisible(true);
    updateLiveKeyboardInset();
    requestAnimationFrame(updateLiveKeyboardInset);
    setTimeout(updateLiveKeyboardInset,80);
    setTimeout(updateLiveKeyboardInset,220);
    if(liveInlineToolbar){liveInlineToolbar.hidden=false;showInlineAuthoringIntro();}
    updateLiveKeyboardInset();
    // contenteditable=true is the most reliable option on iPhone Safari.
    // The element itself stays in the Player; no duplicate textarea/modal is created.
    el.setAttribute('contenteditable','true');
    el.setAttribute('role','textbox');
    el.setAttribute('aria-label','Scene text');
    el.classList.add('live-inline-editing');
    playerHost.classList.add('live-inline-text-edit');
    // Toolbar is a sibling of #scenePlayer, so expose editing state on body too.
    // The iOS keyboard pinning CSS and visualViewport updater key off this class.
    document.body.classList.add('live-inline-text-edit');
    updateLiveKeyboardInset();
    requestAnimationFrame(updateLiveKeyboardInset);

    const sync=()=>{
      if(!liveInlineEditEl)return;
      syncInlineTextToScene();
      requestAnimationFrame(()=>{updateLiveKeyboardInset();keepInlineCaretVisible();});
    };

    const abort=new AbortController();
    el._liveEditAbort?.abort();
    el._liveEditAbort=abort;
    el.addEventListener('input',sync,{signal:abort.signal});
    el.addEventListener('keyup',()=>requestAnimationFrame(keepInlineCaretVisible),{signal:abort.signal});
    el.addEventListener('click',()=>requestAnimationFrame(keepInlineCaretVisible),{signal:abort.signal});
    window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(()=>{updateLiveKeyboardInset();keepInlineCaretVisible();}),{signal:abort.signal});
    window.visualViewport?.addEventListener('scroll',()=>requestAnimationFrame(()=>{updateLiveKeyboardInset();keepInlineCaretVisible();}),{signal:abort.signal});
    el.addEventListener('blur',()=>{sync();finishInlineTextEdit();},{once:true,signal:abort.signal});

    // iPhone Safari only opens the software keyboard when focus happens
    // synchronously inside the user's tap gesture. Do not defer this focus.
    el.focus({preventScroll:true});

    // Cursor placement can happen on the next frame without losing keyboard activation.
    requestAnimationFrame(()=>{
      const sel=getSelection(),range=document.createRange();
      range.selectNodeContents(el);range.collapse(false);
      sel.removeAllRanges();sel.addRange(range);
      // Wait until iOS reports the keyboard/visual viewport, then keep the caret
      // inside the visible Player area without leaving Live Edit.
      setTimeout(keepInlineCaretVisible,180);
      setTimeout(keepInlineCaretVisible,360);
    });
  }
  function liveEditRenderAt(index,{preserveSheet=true}={}){
    if(!player||!workingDocument?.scenes?.length)return;
    const target=Math.max(0,Math.min(Number(index)||0,workingDocument.scenes.length-1));
    const wasOpen=liveEditSheet&&!liveEditSheet.hidden;
    const doc=getDocumentForPlayback();
    // Live Edit must never return to the cover just because author data changed.
    // Swap the playback document in place and ask the existing Player to render
    // the same authoring surface without emitting a navigation event.
    player._clearAutoTimer?.();
    player._resetPresentationRuntime?.();
    player._resetBackgroundRuntime?.();
    player.document=doc;
    player.index=target;
    player.maxVisitedIndex=Math.max(player.maxVisitedIndex,target);
    player.ended=false;
    player.options.historyAllScenes=true;
    const allowPrevious=doc.player?.navigation?.allowPrevious!==false;
    player.options.allowPrevious=allowPrevious;
    if(player.els?.prev)player.els.prev.hidden=!allowPrevious;
    player.host?.classList.toggle('sp-no-previous',!allowPrevious);
    if(player.els?.total)player.els.total.textContent=String(doc.scenes.length);
    player._audioRenderMode='restore';
    player._render?.();
    ensureLiveEditEmptyTarget();
    if(player.els?.cover)player.els.cover.hidden=true;
    player.host?.classList.remove('sp-cover-open');
    selectedSceneIndex=target;
    if(!preserveSheet||!wasOpen)closeLiveEditSheet();
    if(desktopLiveActive())requestAnimationFrame(renderDesktopLivePanel);
  }
  function refreshLivePlayer({preserveSheet=true}={}){
    if(!player||!workingDocument?.scenes?.length)return;
    liveEditRenderAt(player.index,{preserveSheet});
  }
  function liveEditAdvanced(section){
    if(desktopLiveActive()){
      if(section==='text'){openDesktopTextDetail();return;}
      if(section==='effect'){openDesktopEffectDetail();return;}
    }
    const {index}=liveEditScene();
    selectedSceneIndex=index;
    playerReturnTarget='advanced';
    closeLiveEditSheet();
    closePlayer();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      renderAdvanced();
      let target=$('.scene-inspector');
      if(section==='background') target=$('#sceneBackgroundMode')?.closest('details')||target;
      if(section==='audio') target=$('#sceneBgmAction')?.closest('details')||target;
      target?.scrollIntoView?.({behavior:'smooth',block:'start'});
    }));
  }
  function desktopLiveActive(){ return !!(liveEditEnabled && desktopLiveMQ.matches); }
  function desktopMakeSelect(label,values,current,onchange){
    const wrap=document.createElement('label');wrap.className='desktop-live-field';
    const cap=document.createElement('span');cap.textContent=label;wrap.appendChild(cap);
    const select=document.createElement('select');
    values.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;select.appendChild(o);});
    select.value=current;select.addEventListener('change',()=>onchange(select.value));wrap.appendChild(select);return wrap;
  }
  function desktopAction(label,fn,cls=''){
    const b=document.createElement('button');b.type='button';b.className=`desktop-live-action ${cls}`.trim();b.textContent=label;b.addEventListener('click',fn);return b;
  }
  function desktopPickFile(accept,onPicked){
    const input=document.createElement('input');input.type='file';input.accept=accept;input.style.position='fixed';input.style.left='-9999px';document.body.appendChild(input);
    input.addEventListener('change',async()=>{const file=input.files?.[0];if(file){const snap=await snapshotPickedFile(file);const url=URL.createObjectURL(snap.blob);registerAsset(url,snap.blob,snap.name);onPicked(url,snap.name,file);scheduleDraftSave(60);refreshLivePlayer({preserveSheet:false});renderDesktopLivePanel();}input.remove();},{once:true});
    input.click();
  }
  function desktopCard(title,cls=''){
    const card=document.createElement('section');card.className=`desktop-live-card ${cls}`.trim();
    const h=document.createElement('h3');h.textContent=title;card.appendChild(h);return card;
  }
  function desktopDetail(label,section){
    const b=desktopAction(label,()=>liveEditAdvanced(section),'desktop-live-detail');return b;
  }
  function desktopDetailRange(label,{min,max,step,value,unit='',format=(v)=>v,oninput}){
    const field=document.createElement('label');field.className='desktop-text-detail-range';
    const head=document.createElement('span');head.className='desktop-text-detail-range-head';
    const name=document.createElement('strong');name.textContent=label;

    // Build the numeric editor as part of the control itself instead of
    // trying to attach one after the modal has rendered.
    const valueWrap=document.createElement('span');valueWrap.className='desktop-text-detail-value';
    const numeric=document.createElement('input');numeric.type='number';numeric.className='desktop-text-detail-number';

    // Percent controls whose internal value is 0..1 are shown as 0..100.
    const displayScale=(String(unit).trim()==='%' && Number(max)<=1)?100:1;
    const displayMin=Number(min)*displayScale;
    const displayMax=Number(max)*displayScale;
    const displayStep=Number(step)*displayScale;
    numeric.min=String(displayMin);
    numeric.max=String(displayMax);
    numeric.step=String(displayStep);
    numeric.value=String(Number(value)*displayScale);

    const suffix=document.createElement('span');suffix.className='desktop-text-detail-unit';suffix.textContent=unit.trim();

    const slider=document.createElement('input');
    slider.type='range';
    slider.dataset.numberLinked='1';
    slider.min=min;slider.max=max;slider.step=step;slider.value=value;

    const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
    const sliderToNumber=()=>{
      const raw=Number(slider.value);
      numeric.value=String(Number((raw*displayScale).toFixed(6)));
    };
    const applySlider=()=>{
      sliderToNumber();
      oninput(Number(slider.value));
    };
    const applyNumber=()=>{
      let shown=Number(numeric.value);
      if(!Number.isFinite(shown))shown=Number(slider.value)*displayScale;
      shown=clamp(shown,displayMin,displayMax);
      numeric.value=String(shown);
      slider.value=String(shown/displayScale);
      oninput(Number(slider.value));
    };

    slider.addEventListener('input',applySlider);
    numeric.addEventListener('input',applyNumber);
    numeric.addEventListener('change',applyNumber);
    numeric.addEventListener('blur',applyNumber);

    valueWrap.append(numeric);
    if(unit.trim())valueWrap.append(suffix);
    head.append(name,valueWrap);
    field.append(head,slider);

    // Initial value is visible immediately when the modal opens.
    sliderToNumber();
    return field;
  }
  function desktopDetailSelect(label,values,current,onchange){
    const wrap=document.createElement('label');wrap.className='desktop-text-detail-field';
    const cap=document.createElement('span');cap.textContent=label;
    const select=document.createElement('select');
    values.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;select.appendChild(o);});
    select.value=current;select.addEventListener('change',()=>onchange(select.value));wrap.append(cap,select);return wrap;
  }
  function closeDesktopTextDetail(){
    desktopLivePanel?.querySelector('.desktop-text-detail-overlay')?.remove();
  }

  function closeDesktopEffectDetail(){
    desktopLivePanel?.querySelector('.desktop-effect-detail-overlay')?.remove();
  }

  function currentDesktopDetailKind(){
    if(!desktopLivePanel)return '';
    if(desktopLivePanel.querySelector('.desktop-effect-detail-overlay'))return 'effect';
    if(desktopLivePanel.querySelector('.desktop-text-detail-overlay'))return 'text';
    return '';
  }

  function reopenDesktopDetailForCurrentScene(kind){
    if(!kind||!desktopLiveActive())return;
    // Scene navigation is not "cancel": keep edits already made to the
    // previous Scene and simply retarget the open inspector to the new Scene.
    closeDesktopEffectDetail();
    closeDesktopTextDetail();
    if(kind==='effect')openDesktopEffectDetail();
    else if(kind==='text')openDesktopTextDetail();
  }
  function openDesktopEffectDetail(){
    if(!desktopLiveActive()||!desktopLivePanel)return;
    closeDesktopEffectDetail();
    const {scene,index}=liveEditScene();if(!scene)return;
    const p=ensurePresentation(scene);
    const before={
      effect:p.effect,
      display:p.display,
      typing:clone(p.typing||null),
      effectTiming:clone(p.effectTiming||null),
      disappear:clone(p.disappear||null)
    };
    let committed=false;
    const apply=()=>{scheduleDraftSave(40);refreshLivePlayer({preserveSheet:false});};
    const restore=()=>{
      if(before.effect===undefined)delete p.effect;else p.effect=before.effect;
      if(before.display===undefined)delete p.display;else p.display=before.display;
      if(before.typing===null)delete p.typing;else p.typing=clone(before.typing);
      if(before.effectTiming===null)delete p.effectTiming;else p.effectTiming=clone(before.effectTiming);
      if(before.disappear===null)delete p.disappear;else p.disappear=clone(before.disappear);
      scheduleDraftSave(40);refreshLivePlayer({preserveSheet:false});renderDesktopLivePanel();
    };

    const overlay=document.createElement('div');overlay.className='desktop-text-detail-overlay desktop-effect-detail-overlay';
    const modal=document.createElement('section');modal.className='desktop-text-detail-modal desktop-effect-detail-modal';
    const head=document.createElement('header');head.className='desktop-text-detail-head';
    const titleWrap=document.createElement('div');const kicker=document.createElement('small');kicker.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    const title=document.createElement('h2');title.textContent='演出の詳細設定';titleWrap.append(kicker,title);
    const x=document.createElement('button');x.type='button';x.className='desktop-text-detail-close';x.textContent='×';head.append(titleWrap,x);
    const body=document.createElement('div');body.className='desktop-text-detail-body';
    const section=(name)=>{const s=document.createElement('section');s.className='desktop-text-detail-section';const h=document.createElement('h3');h.textContent=name;s.appendChild(h);body.appendChild(s);return s;};
    const two=(s)=>{const d=document.createElement('div');d.className='desktop-text-detail-two';s.appendChild(d);return d;};

    const basic=section('基本');
    const basicGrid=two(basic);
    const currentEffect=p.typing?.enabled?'typewriter':(p.effect||'auto');
    const effectSelect=desktopDetailSelect('出かた',[
      ['auto','おまかせ'],['fade','フェード'],['pop','ポンと出る'],['blur','ぼやける'],['whisper','そっと'],['loud','強く'],['pulse','脈打つ'],['shake','揺れる'],['tilt','傾く'],['typewriter','タイプライター'],['none','なし']
    ],currentEffect,v=>{
      if(v==='typewriter'){
        p.effect='none';
        p.typing={...(p.typing||{}),enabled:true,speed:Number(p.typing?.speed)||55,cursor:p.typing?.cursor!==false};
      }else{
        delete p.typing;p.effect=v;
      }
      apply();closeDesktopEffectDetail();openDesktopEffectDetail();
    });
    basicGrid.append(effectSelect,desktopDetailSelect('表示',[['stack','前の文章を残す'],['solo','この文章だけ']],p.display||'stack',v=>{p.display=v;apply();}));

    const timing=section('タイミング');
    const timingGrid=two(timing);
    p.effectTiming ||= {};
    timingGrid.append(
      desktopDetailRange('演出時間',{min:.15,max:3,step:.05,value:Number(p.effectTiming.duration)||0.8,unit:' 秒',format:v=>v.toFixed(2),oninput:v=>{p.effectTiming.duration=v;apply();}}),
      desktopDetailRange('開始遅延',{min:0,max:3,step:.05,value:Number(p.effectTiming.delay)||0,unit:' 秒',format:v=>v.toFixed(2),oninput:v=>{if(v<=0)delete p.effectTiming.delay;else p.effectTiming.delay=v;apply();}}),
      desktopDetailRange('消えるまで',{min:0,max:12,step:.1,value:(Number(p.disappear?.after)||0)/1000,unit:' 秒',format:v=>v.toFixed(1),oninput:v=>{
        const motion=p.disappear?.motion||'stay';
        p.disappear={...(p.disappear||{}),after:Math.round(v*1000),motion};
        if(v<=0)delete p.disappear;
        apply();
      }}),
      desktopDetailRange('消える時のフェード',{min:.1,max:4,step:.05,value:(Number(p.disappear?.fade)||700)/1000,unit:' 秒',format:v=>v.toFixed(2),oninput:v=>{
        p.disappear={...(p.disappear||{}),after:Number(p.disappear?.after)||2500,fade:Math.round(v*1000),motion:p.disappear?.motion||'stay'};
        apply();
      }}),
      desktopDetailSelect('消え方',[['stay','その場で消える'],['up','上に抜ける']],p.disappear?.motion||'stay',v=>{
        p.disappear={...(p.disappear||{}),motion:v};
        apply();
      })
    );

    const typingSec=section('タイプライター');
    const typingOn=!!p.typing?.enabled;
    typingSec.classList.toggle('is-disabled',!typingOn);
    const typingGrid=two(typingSec);
    const speed=desktopDetailRange('1文字の速度',{min:.01,max:.25,step:.005,value:(Number(p.typing?.speed)||55)/1000,unit:' 秒/文字',format:v=>v.toFixed(3),oninput:v=>{if(!p.typing?.enabled)return;p.typing.speed=Math.round(v*1000);apply();}});
    const cursor=desktopDetailSelect('カーソル',[['on','表示する'],['off','表示しない']],p.typing?.cursor===false?'off':'on',v=>{if(!p.typing?.enabled)return;p.typing.cursor=v!=='off';apply();});
    if(!typingOn){speed.querySelectorAll('input').forEach(el=>el.disabled=true);cursor.querySelector('select').disabled=true;}
    typingGrid.append(speed,cursor);
    const typingNote=document.createElement('p');typingNote.className='desktop-text-detail-note';typingNote.textContent=typingOn?'左のLive Previewで文字送りを確認できます。':'「出かた」をタイプライターにすると設定できます。';typingSec.appendChild(typingNote);

    const preview=section('プレビュー');
    const note=document.createElement('p');note.className='desktop-text-detail-note';note.textContent='変更は左のLive Previewへ即時反映され、自動保存されます。Sceneを移動して戻っても、このSceneの設定値を保持します。';preview.appendChild(note);
    const replay=document.createElement('button');replay.type='button';replay.className='desktop-effect-replay';replay.textContent='▶ 演出をもう一度見る';replay.addEventListener('click',()=>refreshLivePlayer({preserveSheet:false}));preview.appendChild(replay);

    const foot=document.createElement('footer');foot.className='desktop-text-detail-foot';
    const reset=document.createElement('button');reset.type='button';reset.className='desktop-text-detail-reset';reset.textContent='リセット';
    const spacer=document.createElement('span');const cancel=document.createElement('button');cancel.type='button';cancel.textContent='キャンセル';const save=document.createElement('button');save.type='button';save.className='is-primary';save.textContent='保存';foot.append(reset,spacer,cancel,save);
    modal.append(head,body,foot);overlay.appendChild(modal);desktopLivePanel.appendChild(overlay);
    const closeOnly=()=>{closeDesktopEffectDetail();};
    x.addEventListener('click',closeOnly);cancel.addEventListener('click',closeOnly);overlay.addEventListener('click',e=>{if(e.target===overlay)closeOnly();});
    save.addEventListener('click',async()=>{committed=true;await saveDraftNow();closeDesktopEffectDetail();renderDesktopLivePanel();});
    reset.addEventListener('click',()=>{delete p.effectTiming;delete p.disappear;delete p.typing;p.effect='auto';p.display='stack';scheduleDraftSave(40);refreshLivePlayer({preserveSheet:false});closeDesktopEffectDetail();openDesktopEffectDetail();});
  }
  
function enhanceDesktopTextDetailRanges(root){
  if(!root)return;
  root.querySelectorAll('input[type="range"]').forEach(range=>{
    if(range.dataset.numberLinked==='1')return;
    range.dataset.numberLinked='1';

    const host=range.parentElement;
    if(!host)return;
    host.classList.add('desktop-range-with-number');

    const numeric=document.createElement('input');
    numeric.type='number';
    numeric.className='desktop-range-number';
    numeric.dataset.rangeNumber='1';
    if(range.min!=='')numeric.min=range.min;
    if(range.max!=='')numeric.max=range.max;
    numeric.step=range.step||'any';
    numeric.value=range.value;
    host.appendChild(numeric);

    const normalize=(raw)=>{
      let n=Number(raw);
      if(!Number.isFinite(n))n=Number(range.value)||0;
      if(range.min!=='')n=Math.max(Number(range.min),n);
      if(range.max!=='')n=Math.min(Number(range.max),n);
      return n;
    };

    range.addEventListener('input',()=>{numeric.value=range.value;});
    numeric.addEventListener('input',()=>{
      const n=normalize(numeric.value);
      range.value=String(n);
      range.dispatchEvent(new Event('input',{bubbles:true}));
      range.dispatchEvent(new Event('change',{bubbles:true}));
    });
    numeric.addEventListener('blur',()=>{
      const n=normalize(numeric.value);
      numeric.value=String(n);
      range.value=String(n);
    });
  });
}

function openDesktopTextDetail(){
    if(!desktopLiveActive()||!desktopLivePanel)return;
    closeDesktopTextDetail();
    const {scene,index}=liveEditScene();if(!scene)return;
    const p=ensurePresentation(scene);p.text ||= {};
    const before=clone(p.text);
    let committed=false;
    const apply=()=>{scheduleDraftSave(40);refreshLivePlayer({preserveSheet:false});};
    const restore=()=>{p.text=clone(before);scheduleDraftSave(50);refreshLivePlayer({preserveSheet:false});renderDesktopLivePanel();};

    const overlay=document.createElement('div');overlay.className='desktop-text-detail-overlay';
    const modal=document.createElement('section');modal.className='desktop-text-detail-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','文字の詳細設定');
    const head=document.createElement('header');head.className='desktop-text-detail-head';
    const title=document.createElement('div');const sceneNo=document.createElement('small');sceneNo.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;const h=document.createElement('h2');h.textContent='文字の詳細設定';title.append(sceneNo,h);
    const x=document.createElement('button');x.type='button';x.className='desktop-text-detail-close';x.textContent='×';x.setAttribute('aria-label','閉じる');
    head.append(title,x);
    const body=document.createElement('div');body.className='desktop-text-detail-body';

    const section=(name)=>{const s=document.createElement('section');s.className='desktop-text-detail-section';const hh=document.createElement('h3');hh.textContent=name;s.appendChild(hh);body.appendChild(s);return s;};
    const two=(parent)=>{const g=document.createElement('div');g.className='desktop-text-detail-two';parent.appendChild(g);return g;};

    const typography=section('基本');
    const basic=two(typography);
    basic.append(
      desktopDetailSelect('書体',[['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],p.text.fontFamily||'inherit',v=>{if(v==='inherit')delete p.text.fontFamily;else p.text.fontFamily=v;apply();}),
      desktopDetailSelect('サイズ',[['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],p.text.size||'auto',v=>{p.text.size=v;apply();}),
      desktopDetailSelect('文字色',[['auto','おまかせ'],['white','白'],['black','黒'],['custom','任意色']],!p.text.color?'auto':(String(p.text.color).toLowerCase()==='#ffffff'?'white':(String(p.text.color).toLowerCase()==='#000000'?'black':'custom')),v=>{if(v==='white')p.text.color='#ffffff';else if(v==='black')p.text.color='#000000';else if(v==='custom')p.text.color=p.text.color&&!['#fff','#ffffff','#000','#000000'].includes(String(p.text.color).toLowerCase())?p.text.color:'#4a4a4a';else delete p.text.color;apply();}),
      desktopDetailSelect('文字影',[['auto','おまかせ'],['none','なし'],['soft','弱'],['strong','強']],p.text.shadow||'auto',v=>{if(v==='auto')delete p.text.shadow;else p.text.shadow=v;apply();})
    );
    const colorRow=document.createElement('label');colorRow.className='desktop-text-detail-color';const colorLabel=document.createElement('span');colorLabel.textContent='任意色';const color=document.createElement('input');color.type='color';color.value=/^#[0-9a-f]{6}$/i.test(String(p.text.color||''))?p.text.color:'#4a4a4a';const colorCode=document.createElement('code');colorCode.textContent=color.value.toUpperCase();color.addEventListener('input',()=>{p.text.color=color.value;colorCode.textContent=color.value.toUpperCase();apply();});colorRow.append(colorLabel,color,colorCode);typography.appendChild(colorRow);

    const layout=section('レイアウト');
    const ranges=two(layout);
    ranges.append(
      desktopDetailRange('行間',{min:1.2,max:2.5,step:.05,value:Number(p.text.lineHeight)||1.85,format:v=>v.toFixed(2),oninput:v=>{p.text.lineHeight=v;apply();}}),
      desktopDetailRange('字間',{min:-.05,max:.20,step:.005,value:Number(p.text.letterSpacing)||.035,unit:' em',format:v=>v.toFixed(3),oninput:v=>{p.text.letterSpacing=v;apply();}}),
      desktopDetailRange('左右の余白',{min:0,max:28,step:1,value:Number(p.text.sideMargin)||0,unit:' %',format:v=>Math.round(v),oninput:v=>{if(v<=0)delete p.text.sideMargin;else p.text.sideMargin=v;apply();}}),
      desktopDetailRange('透明度',{min:.35,max:1,step:.05,value:Number(p.text.opacity)||1,unit:' %',format:v=>Math.round(v*100),oninput:v=>{if(v>=.999)delete p.text.opacity;else p.text.opacity=v;apply();}})
    );
    const layoutSelects=two(layout);
    layoutSelects.append(
      desktopDetailSelect('文字配置',[['auto','Sceneに合わせる'],['left','左'],['center','中央'],['right','右']],p.text.align||'auto',v=>{if(v==='auto')delete p.text.align;else p.text.align=v;apply();}),
      desktopDetailSelect('折り返し',[['auto','自動（推奨）'],['nowrap','折り返さない']],p.text.wrap||'auto',v=>{if(v==='auto')delete p.text.wrap;else p.text.wrap=v;apply();})
    );

    const note=section('プレビュー');
    const noteP=document.createElement('p');noteP.className='desktop-text-detail-note';noteP.textContent='変更は左のLive Previewへ即時反映され、自動保存されます。Sceneを移動して戻っても、このSceneの設定値を保持します。';note.appendChild(noteP);

    const foot=document.createElement('footer');foot.className='desktop-text-detail-foot';
    const reset=document.createElement('button');reset.type='button';reset.className='desktop-text-detail-reset';reset.textContent='リセット';
    const spacer=document.createElement('span');
    const cancel=document.createElement('button');cancel.type='button';cancel.textContent='キャンセル';
    const save=document.createElement('button');save.type='button';save.className='is-primary';save.textContent='保存';
    foot.append(reset,spacer,cancel,save);
    modal.append(head,body,foot);overlay.appendChild(modal);desktopLivePanel.appendChild(overlay);

    const closeOnly=()=>{closeDesktopTextDetail();};
    x.addEventListener('click',closeOnly);cancel.addEventListener('click',closeOnly);
    save.addEventListener('click',async()=>{committed=true;await saveDraftNow();closeDesktopTextDetail();renderDesktopLivePanel();});
    reset.addEventListener('click',()=>{p.text={};scheduleDraftSave(50);refreshLivePlayer({preserveSheet:false});closeDesktopTextDetail();openDesktopTextDetail();});
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeOnly();});
  }
  function renderDesktopLivePanel(){
    if(!desktopLivePanel)return;
    if(!desktopLiveActive()){
      desktopLivePanel.hidden=true;
      document.body.classList.remove('desktop-live-edit');
      return;
    }
    const {scene,index}=liveEditScene();if(!scene)return;
    desktopLivePanel.hidden=false;document.body.classList.add('desktop-live-edit');
    desktopSceneLabel.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    desktopPrevScene.disabled=index<=0;desktopNextScene.disabled=index>=workingDocument.scenes.length-1;
    desktopLivePanelBody.innerHTML='';
    const p=ensurePresentation(scene);p.text ||= {};
    const refresh=()=>{scheduleDraftSave(70);refreshLivePlayer({preserveSheet:false});renderDesktopLivePanel();};

    const bodyCard=desktopCard('本文','desktop-live-body-card');
    const ta=document.createElement('textarea');ta.value=scene.text||'';ta.placeholder='本文を入力';
    ta.addEventListener('input',()=>{scene.text=ta.value;scheduleDraftSave(100);refreshLivePlayer({preserveSheet:false});});
    bodyCard.appendChild(ta);

    const three=document.createElement('div');three.className='desktop-live-three';
    const textCard=desktopCard('文字（Aa）');
    const textGrid=document.createElement('div');textGrid.className='desktop-live-grid';
    const colorValue=!p.text.color?'auto':(String(p.text.color).toLowerCase()==='#ffffff'?'white':(String(p.text.color).toLowerCase()==='#000000'?'black':'custom'));
    textGrid.append(
      desktopMakeSelect('書体',[['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],p.text.fontFamily||'inherit',v=>{if(v==='inherit')delete p.text.fontFamily;else p.text.fontFamily=v;refresh();}),
      desktopMakeSelect('サイズ',[['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],p.text.size||'auto',v=>{p.text.size=v;refresh();}),
      desktopMakeSelect('色',[['auto','おまかせ'],['white','白'],['black','黒'],['custom','任意色']],colorValue,v=>{if(v==='white')p.text.color='#ffffff';else if(v==='black')p.text.color='#000000';else if(v==='custom')p.text.color=p.text.color&&!['#fff','#ffffff','#000','#000000'].includes(String(p.text.color).toLowerCase())?p.text.color:'#4a4a4a';else delete p.text.color;refresh();}),
      desktopMakeSelect('影',[['auto','おまかせ'],['none','なし'],['soft','やわらか'],['strong','強く']],p.text.shadow||'auto',v=>{if(v==='auto')delete p.text.shadow;else p.text.shadow=v;refresh();})
    );
    textCard.append(textGrid);
    if(colorValue==='custom'){
      const color=document.createElement('input');color.type='color';color.className='desktop-live-color';color.value=/^#[0-9a-f]{6}$/i.test(String(p.text.color||''))?p.text.color:'#4a4a4a';color.addEventListener('input',()=>{p.text.color=color.value;scheduleDraftSave(60);refreshLivePlayer({preserveSheet:false});});textCard.append(color);
    }
    textCard.append(desktopDetail('文字の詳細設定','text'));

    const effectCard=desktopCard('演出（✦）');
    const effectGrid=document.createElement('div');effectGrid.className='desktop-live-grid';
    const effectValue=p.typing?.enabled?'typewriter':(p.effect||'auto');
    effectGrid.append(
      desktopMakeSelect('出かた',[['auto','おまかせ'],['fade','フェード'],['pop','ポンと出る'],['blur','ぼやける'],['whisper','そっと'],['loud','強く'],['pulse','脈打つ'],['shake','揺れる'],['tilt','傾く'],['typewriter','タイプライター'],['none','なし']],effectValue,v=>{if(v==='typewriter'){p.effect='none';p.typing={...(p.typing||{}),enabled:true,speed:Number(p.typing?.speed)||55,cursor:p.typing?.cursor!==false};}else{delete p.typing;p.effect=v;}refresh();}),
      desktopMakeSelect('表示',[['stack','前の文章を残す'],['solo','この文章だけ']],p.display||'stack',v=>{p.display=v;refresh();})
    );
    effectCard.append(effectGrid,desktopDetail('演出の詳細設定','effect'));

    const bgCard=desktopCard('背景（▣）');
    const bg=p.background;
    const bgTop=document.createElement('div');bgTop.className='desktop-live-bg-top';
    if(bg?.src){const img=document.createElement('img');img.src=bg.src;img.alt='背景';bgTop.appendChild(img);}else{const ph=document.createElement('div');ph.className='desktop-live-bg-placeholder';ph.textContent='背景';bgTop.appendChild(ph);}
    const bgBtns=document.createElement('div');bgBtns.className='desktop-live-stack';
    bgBtns.append(desktopAction(bg?.src?'画像を変更':'画像を選択',()=>desktopPickFile('image/*',(url,name)=>{p.background={...(p.background||{}),src:url,_editorFileName:name,_editorManaged:true,transition:p.background?.transition||'fade',fit:p.background?.fit||'cover',tone:p.background?.tone||'dark',dim:p.background?.dim??.34};}),'is-primary'),desktopAction('背景なし',()=>{p.background={src:'',transition:'fade',_editorManaged:true};refresh();}));
    bgTop.appendChild(bgBtns);bgCard.appendChild(bgTop);
    const tone=document.createElement('div');tone.className='desktop-live-choice';
    tone.append(desktopAction('暗く',()=>{if(p.background?.src){p.background={...p.background,tone:'dark',dim:.38};refresh();}},bg?.src&&bg?.tone!=='light'?'is-selected':''),desktopAction('明るく',()=>{if(p.background?.src){p.background={...p.background,tone:'light',dim:.64};refresh();}},bg?.src&&bg?.tone==='light'?'is-selected':''));
    bgCard.append(tone,desktopDetail('背景の詳細設定','background'));
    three.append(textCard,effectCard,bgCard);

    const audioCard=desktopCard('音（♪）','desktop-live-audio-card');
    const audioGrid=document.createElement('div');audioGrid.className='desktop-live-audio-grid';
    const channel=(title,ch)=>{const row=document.createElement('div');row.className='desktop-live-audio-col';const h=document.createElement('strong');h.textContent=title;row.appendChild(h);const cmd=managedAudio(scene,ch);const state=document.createElement('small');state.textContent=cmd?.action==='start'?(cmd._editorFileName||'音源あり'):cmd?.action==='stop'?'停止':'前Sceneを継続';row.appendChild(state);row.append(desktopAction('継続',()=>{setManagedAudio(scene,ch,null);refresh();}),desktopAction('停止',()=>{setManagedAudio(scene,ch,{channel:ch,action:'stop',fadeOut:600});refresh();}),desktopAction(cmd?.action==='start'?'ファイルを変更':'ファイルを選択',()=>desktopPickFile('audio/*',(url,name)=>setManagedAudio(scene,ch,{channel:ch,action:'start',src:url,volume:ch==='ambient'?.35:.5,fadeIn:600,fadeOut:600,loop:true,restart:true,_editorFileName:name})),'is-primary'));return row;};
    audioGrid.append(channel('BGM','bgm'),channel('Ambient（環境音）','ambient'));
    const se=document.createElement('div');se.className='desktop-live-audio-col';se.innerHTML='<strong>SE（効果音）</strong>';const secmd=managedAudio(scene,'oneshot');const sest=document.createElement('small');sest.textContent=secmd?.src?(secmd._editorFileName||'音源あり'):'なし';se.appendChild(sest);se.append(desktopAction('なし',()=>{setManagedAudio(scene,'oneshot',null);refresh();}),desktopAction(secmd?'ファイルを変更':'ファイルを選択',()=>desktopPickFile('audio/*',(url,name)=>setManagedAudio(scene,'oneshot',{channel:'oneshot',role:'se',action:'play',src:url,volume:.8,fadeIn:0,_editorFileName:name})),'is-primary'));audioGrid.appendChild(se);
    audioCard.append(audioGrid,desktopDetail('音の詳細設定','audio'));

    const sceneCard=desktopCard('Scene操作（•••）','desktop-live-scene-card');
    const ops=document.createElement('div');ops.className='desktop-live-scene-ops';
    const addOp=(label,fn,disabled=false,cls='')=>{const b=desktopAction(label,fn,cls);b.disabled=disabled;ops.appendChild(b);};
    addOp('＋ 次にScene追加',liveEditAddScene,false,'is-primary');addOp('← 前へ移動',()=>liveEditMoveScene(-1),index===0);addOp('次へ移動 →',()=>liveEditMoveScene(1),index===workingDocument.scenes.length-1);addOp('前のSceneと結合',liveEditMergePrevious,index===0);addOp('複製',liveEditDuplicateScene);addOp('削除',liveEditDeleteScene,workingDocument.scenes.length<=1,'is-danger');
    sceneCard.appendChild(ops);
    const nav=document.createElement('div');nav.className='desktop-live-nav';const navText=document.createElement('div');navText.innerHTML='<strong>読者が過去Sceneへ戻れる</strong><small>公開Playerの戻る操作を許可</small>';const toggle=desktopAction(workingDocument.player?.navigation?.allowPrevious===false?'OFF':'ON',()=>{liveEditToggleAllowPrevious();renderDesktopLivePanel();},'desktop-live-toggle');nav.append(navText,toggle);sceneCard.appendChild(nav);

    desktopLivePanelBody.append(bodyCard,three,audioCard,sceneCard);
  }

  function renderLiveEditSheet(kind){
    const {scene,index}=liveEditScene(); if(!scene||!liveEditSheetBody)return;
    liveEditSceneNumber.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    liveEditSheet.hidden=false;
    document.body.classList.add('live-edit-sheet-open');
    liveEditSheetBody.innerHTML='';

    if(kind==='text'){
      finishInlineTextEdit();
      liveEditSheetTitle.textContent='文字';
      const grid=document.createElement('div');grid.className='live-edit-grid';
      const makeSelect=(label,values,current,onchange)=>{
        const wrap=document.createElement('label');wrap.className='live-edit-field';wrap.append(label);
        const select=document.createElement('select');
        values.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;select.appendChild(o);});
        select.value=current;select.addEventListener('change',()=>onchange(select.value));wrap.appendChild(select);return wrap;
      };
      const p=ensurePresentation(scene);p.text ||= {};
      const rerender=()=>{scheduleDraftSave(80);refreshLivePlayer();};
      let colorValue=!p.text.color?'auto':(String(p.text.color).toLowerCase()==='#ffffff'?'white':(String(p.text.color).toLowerCase()==='#000000'?'black':'custom'));
      const colorField=makeSelect('色',[['auto','おまかせ'],['white','白'],['black','黒'],['custom','任意色']],colorValue,v=>{
        if(v==='white')p.text.color='#ffffff';
        else if(v==='black')p.text.color='#000000';
        else if(v==='custom'){
          if(!p.text.color || ['#ffffff','#000000'].includes(String(p.text.color).toLowerCase()))p.text.color='#4a4a4a';
        }else delete p.text.color;
        rerender();
        renderLiveEditSheet('text');
      });
      grid.append(
        makeSelect('書体',[['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],p.text.fontFamily||'inherit',v=>{if(v==='inherit')delete p.text.fontFamily;else p.text.fontFamily=v;rerender();}),
        makeSelect('サイズ',[['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],p.text.size||'auto',v=>{p.text.size=v;rerender();}),
        colorField,
        makeSelect('影',[['auto','おまかせ'],['none','なし'],['soft','やわらか'],['strong','強く']],p.text.shadow||'auto',v=>{if(v==='auto')delete p.text.shadow;else p.text.shadow=v;rerender();})
      );
      if(colorValue==='custom'){
        const custom=document.createElement('label');custom.className='live-edit-color-custom';
        const label=document.createElement('span');label.textContent='任意色';
        const picker=document.createElement('input');picker.type='color';picker.value=/^#[0-9a-f]{6}$/i.test(String(p.text.color||''))?p.text.color:'#4a4a4a';
        const value=document.createElement('code');value.textContent=picker.value.toUpperCase();
        picker.addEventListener('input',()=>{p.text.color=picker.value;value.textContent=picker.value.toUpperCase();rerender();});
        custom.append(label,picker,value);
        liveEditSheetBody.append(grid,custom);
      }else{
        liveEditSheetBody.append(grid);
      }
      const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='文字の詳細設定';detail.addEventListener('click',()=>liveEditAdvanced('text'));
      liveEditSheetBody.append(detail);return;
    }

    if(kind==='effect'){
      liveEditSheetTitle.textContent='演出';
      const grid=document.createElement('div');grid.className='live-edit-grid';
      const makeSelect=(label,values,current,onchange)=>{
        const wrap=document.createElement('label');wrap.className='live-edit-field';wrap.append(label);
        const select=document.createElement('select');
        values.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;select.appendChild(o);});
        select.value=current;select.addEventListener('change',()=>onchange(select.value));wrap.appendChild(select);return wrap;
      };
      const p=ensurePresentation(scene);
      const effectValue=p.typing?.enabled?'typewriter':(p.effect||'auto');
      grid.append(
        makeSelect('出かた',[['auto','おまかせ'],['fade','フェード'],['pop','ポンと出る'],['blur','ぼやける'],['whisper','そっと'],['loud','強く'],['pulse','脈打つ'],['shake','揺れる'],['tilt','傾く'],['typewriter','タイプライター'],['none','なし']],effectValue,v=>{
          if(v==='typewriter'){
            p.effect='none';
            p.typing={...(p.typing||{}),enabled:true,speed:Number(p.typing?.speed)||55,cursor:p.typing?.cursor!==false};
          }else{
            if(p.typing)delete p.typing;
            p.effect=v;
          }
          scheduleDraftSave(80);refreshLivePlayer();
        }),
        makeSelect('表示',[['stack','前の文章を残す'],['solo','この文章だけ']],p.display||'stack',v=>{p.display=v;scheduleDraftSave(80);refreshLivePlayer();})
      );
      const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='演出の詳細設定';detail.addEventListener('click',()=>liveEditAdvanced('text'));
      liveEditSheetBody.append(grid,detail);return;
    }

    const makeActionButton=(label,cls='')=>{const b=document.createElement('button');b.type='button';b.className=`live-edit-action ${cls}`.trim();b.textContent=label;return b;};
    const pickLiveFile=async(accept,onPicked)=>{
      const input=document.createElement('input');input.type='file';
      const wantsAudio=String(accept||'').startsWith('audio/');
      const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
      // iOS Files may gray out perfectly valid mp3/m4a assets when accept=audio/*.
      // Let the user pick from Files, then validate locally.
      input.accept=(isIOS&&wantsAudio)?'':accept;
      input.style.position='fixed';input.style.left='-9999px';document.body.appendChild(input);
      input.addEventListener('change',async()=>{
        const file=input.files?.[0];
        if(file){
          if(wantsAudio){
            const name=(file.name||'').toLowerCase();
            const audioLike=(file.type||'').startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(name);
            if(!audioLike){
              alert('音声ファイルを選択してください。');
              input.remove();
              return;
            }
          }
          const snap=await snapshotPickedFile(file);const url=URL.createObjectURL(snap.blob);registerAsset(url,snap.blob,snap.name);onPicked(url,snap.name,file);
          scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet(kind);
        }
        input.remove();
      },{once:true});
      input.click();
    };

    if(kind==='background'){
      liveEditSheetTitle.textContent='背景';
      const p=ensurePresentation(scene),bg=p.background;
      const actions=document.createElement('div');actions.className='live-edit-choice-row';
      const inherit=makeActionButton('前Sceneを継続',!bg?'is-selected':'');
      const clear=makeActionButton('背景なし',bg?.src===''?'is-selected':'');
      inherit.onclick=()=>{delete p.background;scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('background');};
      clear.onclick=()=>{p.background={src:'',transition:'fade',_editorManaged:true};scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('background');};
      actions.append(inherit,clear);
      const pick=makeActionButton(bg?.src?'画像を変更':'画像を選択','is-primary');
      pick.onclick=()=>pickLiveFile('image/*',(url,name)=>{p.background={...(p.background||{}),src:url,_editorFileName:name,_editorManaged:true,transition:p.background?.transition||'fade',fit:p.background?.fit||'cover',tone:p.background?.tone||'dark',dim:p.background?.dim??.34};});
      const toneRow=document.createElement('div');toneRow.className='live-edit-choice-row live-edit-tone-row';
      const tone=bg?.tone || ((workingDocument?.theme==='cinema'&&workingDocument?.appearance?.cinemaTone==='light')?'light':'dark');
      const dark=makeActionButton('暗く',bg?.src&&tone==='dark'?'is-selected':'');
      const light=makeActionButton('明るく',bg?.src&&tone==='light'?'is-selected':'');
      const setTone=(next)=>{
        if(!p.background?.src)return;
        p.background={...p.background,tone:next,dim:next==='light'?.64:.38,_editorManaged:true};
        scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('background');
      };
      dark.onclick=()=>setTone('dark');light.onclick=()=>setTone('light');
      toneRow.append(dark,light);
      if(!bg?.src){dark.disabled=true;light.disabled=true;}
      const status=document.createElement('div');status.className='live-edit-status';status.textContent=bg?.src?`選択中：${bg._editorFileName||'背景画像'}`:(bg?.src===''?'このSceneから背景なし':'前Sceneの背景を継続');
      const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='暗さ・動き・切替を細かく調整';detail.addEventListener('click',()=>liveEditAdvanced('background'));
      liveEditSheetBody.append(actions,pick,toneRow,status,detail);return;
    }

    liveEditSheetTitle.textContent='音';
    const audioWrap=document.createElement('div');audioWrap.className='live-edit-audio-list';
    const channelRow=(title,channel,accept='audio/*')=>{
      const cmd=managedAudio(scene,channel);const row=document.createElement('section');row.className='live-edit-audio-row';
      const head=document.createElement('div');head.className='live-edit-audio-head';const name=document.createElement('strong');name.textContent=title;const state=document.createElement('small');
      state.textContent=cmd?.action==='start'?(cmd._editorFileName||'音源あり'):cmd?.action==='stop'?'停止':'継続';head.append(name,state);
      const buttons=document.createElement('div');buttons.className='live-edit-audio-actions';
      const inherit=makeActionButton('継続',!cmd?'is-selected':'');const stop=makeActionButton('停止',cmd?.action==='stop'?'is-selected':'');const pick=makeActionButton(cmd?.action==='start'?'変更':'選択','is-primary');
      inherit.onclick=()=>{setManagedAudio(scene,channel,null);scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('audio');};
      stop.onclick=()=>{setManagedAudio(scene,channel,{channel,action:'stop',fadeOut:600});scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('audio');};
      pick.onclick=()=>pickLiveFile(accept,(url,fileName)=>setManagedAudio(scene,channel,{channel,action:'start',src:url,volume:channel==='ambient'?.35:.5,fadeIn:600,fadeOut:600,loop:true,restart:true,_editorFileName:fileName}));
      buttons.append(inherit,stop,pick);row.append(head,buttons);return row;
    };
    audioWrap.append(channelRow('BGM','bgm'),channelRow('Ambient','ambient'));
    const se=managedAudio(scene,'oneshot');const seRow=document.createElement('section');seRow.className='live-edit-audio-row';
    const seHead=document.createElement('div');seHead.className='live-edit-audio-head';seHead.innerHTML='<strong>SE</strong>';const seState=document.createElement('small');seState.textContent=se?.src?(se._editorFileName||'音源あり'):'なし';seHead.appendChild(seState);
    const seButtons=document.createElement('div');seButtons.className='live-edit-audio-actions';const seNone=makeActionButton('なし',!se?'is-selected':'');const sePick=makeActionButton(se?'変更':'選択','is-primary');
    seNone.onclick=()=>{setManagedAudio(scene,'oneshot',null);scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('audio');};
    sePick.onclick=()=>pickLiveFile('audio/*',(url,fileName)=>setManagedAudio(scene,'oneshot',{channel:'oneshot',role:'se',action:'play',src:url,volume:.8,fadeIn:0,_editorFileName:fileName}));
    seButtons.append(seNone,sePick);seRow.append(seHead,seButtons);audioWrap.append(seRow);
    const presetNote=document.createElement('p');presetNote.className='live-edit-note';presetNote.textContent='Ambient / SE のプリセットは後から追加できます。今はファイル選択と状態変更だけをLive Editで行います。';
    const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='音量・フェード・ループを細かく調整';detail.addEventListener('click',()=>liveEditAdvanced('audio'));
    liveEditSheetBody.append(audioWrap,presetNote,detail);
  }

  function liveEditReloadAt(index){
    finishInlineTextEdit();closeLiveEditSheet();
    normalizeSceneIds();refreshDocumentLanguages();
    selectedSceneIndex=Math.max(0,Math.min(index,workingDocument.scenes.length-1));
    scheduleDraftSave(60);
    liveEditRenderAt(selectedSceneIndex,{preserveSheet:false});
    setLiveToolbarVisible(true);
  }
  function liveEditAddScene(){
    const {index}=liveEditScene();
    captureUndo('Scene追加を元に戻せます');
    const scene={id:nextUniqueId(),type:'text',text:'',presentation:{display:'stack',effect:'auto',text:{size:'auto'}}};
    workingDocument.scenes.splice(index+1,0,scene);
    liveEditReloadAt(index+1);
    showUndo('Sceneを追加しました');
    // Keep this synchronous inside the + button's user gesture so iPhone Safari
    // is allowed to open the software keyboard immediately. Empty is valid:
    // pressing the iOS checkmark without typing leaves this Scene empty.
    startInlineTextEdit();
  }
  function liveEditMoveScene(delta){
    const {index}=liveEditScene(),ni=index+delta;
    if(ni<0||ni>=workingDocument.scenes.length)return;
    captureUndo('Sceneの並び替えを元に戻せます');
    const [scene]=workingDocument.scenes.splice(index,1);workingDocument.scenes.splice(ni,0,scene);
    liveEditReloadAt(ni);showUndo('Sceneを並び替えました');
  }
  function liveEditDuplicateScene(){
    const {scene,index}=liveEditScene();if(!scene)return;
    captureUndo('Scene複製を元に戻せます');
    const copy=clone(scene);copy.id=nextUniqueId();
    workingDocument.scenes.splice(index+1,0,copy);
    liveEditReloadAt(index+1);showUndo('Sceneを複製しました');
  }
  function liveEditDeleteScene(){
    const {index}=liveEditScene();if(workingDocument.scenes.length<=1)return;
    if(!confirm(`Scene ${index+1} を削除しますか？`))return;
    captureUndo('Scene削除を元に戻せます');
    workingDocument.scenes.splice(index,1);
    liveEditReloadAt(Math.min(index,workingDocument.scenes.length-1));showUndo('Sceneを削除しました');
  }
  function liveEditMergePrevious(){
    const {scene,index}=liveEditScene();if(!scene||index<=0)return;
    captureUndo('Scene結合を元に戻せます');
    const prev=workingDocument.scenes[index-1];
    prev.text=[prev.text,scene.text].filter(Boolean).join('\n\n');
    if(scene.subText&&!prev.subText)prev.subText=scene.subText;
    workingDocument.scenes.splice(index,1);
    liveEditReloadAt(index-1);
    showUndo('前のSceneと結合しました');
  }
  function liveEditToggleAllowPrevious(){
    workingDocument.player ||= {};workingDocument.player.navigation ||= {};
    const next=workingDocument.player.navigation.allowPrevious===false;
    workingDocument.player.navigation.allowPrevious=next;
    scheduleDraftSave(60);
    liveEditRenderAt(liveEditScene().index,{preserveSheet:true});
    renderLiveEditSceneMenu();
  }

  function renderLiveEditSceneMenu(){
    const {index}=liveEditScene();
    finishInlineTextEdit();
    liveEditSceneNumber.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    liveEditSheet.hidden=false;document.body.classList.add('live-edit-sheet-open');
    liveEditSheetTitle.textContent='Scene操作';liveEditSheetBody.innerHTML='';
    const grid=document.createElement('div');grid.className='live-edit-scene-actions';
    const action=(label,fn,disabled=false,danger=false)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;if(danger)b.classList.add('is-danger');b.addEventListener('click',fn);return b;};
    grid.append(
      action('← 前へ移動',()=>liveEditMoveScene(-1),index===0),
      action('次へ移動 →',()=>liveEditMoveScene(1),index===workingDocument.scenes.length-1),
      action('前のSceneと結合',liveEditMergePrevious,index===0),
      action('複製',liveEditDuplicateScene),
      action('削除',liveEditDeleteScene,workingDocument.scenes.length<=1,true)
    );
    const nav=document.createElement('div');nav.className='live-edit-nav-toggle';
    const label=document.createElement('div');label.innerHTML='<strong>読者が過去Sceneへ戻れる</strong><small>公開Playerの戻る操作を許可</small>';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='live-edit-toggle';
    const allowed=workingDocument.player?.navigation?.allowPrevious!==false;
    toggle.dataset.on=allowed?'true':'false';toggle.setAttribute('aria-pressed',allowed?'true':'false');toggle.textContent=allowed?'ON':'OFF';
    toggle.addEventListener('click',liveEditToggleAllowPrevious);
    nav.append(label,toggle);
    liveEditSheetBody.append(grid,nav);
  }

  function enableLiveEdit(){
    liveEditEnabled=true;
    if(player)player.options.historyAllScenes=true;
    setLiveToolbarVisible(false);
    playerHost.classList.add('live-edit-enabled');
    bindLiveEditSoundControl();
    observeLiveEditPreviewChrome();
    syncLiveEditPreviewChrome();
    requestAnimationFrame(()=>{ensureLiveEditEmptyTarget();renderDesktopLivePanel();});
    const historyHelp=playerHost.querySelector('.sp-history-help');if(historyHelp)historyHelp.textContent='Sceneをスクロール';
    const historyKicker=playerHost.querySelector('.sp-history-kicker');if(historyKicker)historyKicker.textContent='SCENES';
  }
  function disableLiveEdit(){
    finishInlineTextEdit(); liveEditEnabled=false;closeLiveEditSheet();
    if(liveInlineToolbar)liveInlineToolbar.hidden=true;
    setLiveToolbarVisible(false);
    liveEditChromeObserver?.disconnect?.();
    liveEditChromeObserver=null;
    playerHost.classList.remove('live-edit-enabled');
    if(desktopLivePanel)desktopLivePanel.hidden=true;document.body.classList.remove('desktop-live-edit');
    const recPanel=$('#autoRecPanel');if(recPanel)recPanel.hidden=false;
    if(player)player.options.historyAllScenes=false;
  }

  // v0.3.3 — iPhone Safari may blur contenteditable before a normal click
  // reaches a control outside the editable text. Handle the cursor toolbox
  // on touchstart/mousedown, before that blur can tear down Live Edit.
  const handleLiveInlinePress=(e)=>{
    const b=e.target.closest?.('[data-live-inline]');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    const kind=b.dataset.liveInline;
    if(kind==='tools-toggle'){
      if(liveInlineToolbar.classList.contains('is-expanded'))collapseInlineCursorDock();
      else expandInlineCursorDock();
      liveInlineEditEl?.focus({preventScroll:true});
      return;
    }
    // Execute helpers immediately on touch/mouse down as well, so they remain
    // usable while the software keyboard stays open.
    clearTimeout(liveInlineDockTimer);
    liveInlineDockTimer=setTimeout(()=>liveInlineToolbar?.classList.remove('is-expanded'),4200);
    if(kind==='split'){liveEditSplitInlineAtCaret();return;}
    if(kind==='caret-prev'){moveInlineCaret(-1);return;}
    if(kind==='caret-next'){moveInlineCaret(1);return;}
    if(kind==='punct-prev'){jumpInlineCaretToPunctuation(-1);return;}
    if(kind==='punct-next'){jumpInlineCaretToPunctuation(1);return;}
  };
  liveInlineToolbar?.addEventListener('touchstart',handleLiveInlinePress,{passive:false});
  liveInlineToolbar?.addEventListener('mousedown',handleLiveInlinePress);
  liveInlineToolbar?.addEventListener('click',(e)=>{
    const b=e.target.closest('[data-live-inline]');if(!b)return;
    e.preventDefault();e.stopPropagation();
    const kind=b.dataset.liveInline;
    // Commands already run on touchstart/mousedown. Suppress the synthetic
    // click so the same action never fires twice.
    return;
  });

  liveEditToolbar?.addEventListener('pointerdown',(e)=>{
    const b=e.target.closest?.('[data-live-edit]');if(!b)return;
    e.stopPropagation();

    // On iPhone, tapping a toolbar button while the software keyboard is open
    // can blur the editable Scene before the later click event is delivered.
    // Handle the command immediately on pointerdown so one tap always means:
    // save text -> close keyboard -> open the requested tool/action.
    if(liveInlineEditEl){
      e.preventDefault();
      const kind=b.dataset.liveEdit;
      syncInlineTextToScene();

      if(kind==='add'){
        finishInlineTextEdit();
        liveEditAddScene();
        return;
      }

      finishInlineTextEdit();
      if(kind==='scene'){
        renderLiveEditSceneMenu();
        return;
      }
      renderLiveEditSheet(kind);
      return;
    }
  });

  liveEditToolbar?.addEventListener('click',(e)=>{
    const b=e.target.closest('[data-live-edit]');if(!b)return;
    e.preventDefault();e.stopPropagation();

    // If pointerdown already handled an inline-edit command, ignore the
    // follow-up click. Otherwise this is the normal keyboard-closed path.
    if(liveInlineEditEl)return;

    const kind=b.dataset.liveEdit;
    if(kind==='add'){liveEditAddScene();return;}
    if(kind==='scene'){renderLiveEditSceneMenu();return;}
    renderLiveEditSheet(kind);
  });
  $('#liveEditSheetClose')?.addEventListener('click',closeLiveEditSheet);
  desktopPrevScene?.addEventListener('click',()=>{const {index}=liveEditScene();if(index>0)liveEditRenderAt(index-1,{preserveSheet:false});});
  desktopNextScene?.addEventListener('click',()=>{const {index}=liveEditScene();if(index<workingDocument.scenes.length-1)liveEditRenderAt(index+1,{preserveSheet:false});});
  desktopLiveMQ.addEventListener?.('change',()=>{renderDesktopLivePanel();if(desktopLiveActive())setLiveToolbarVisible(true);});
  // Live Edit v0.2.3: while the visible Scene text is being edited,
  // the Player must not interpret taps / Enter / Space as navigation.
  playerHost.addEventListener('click',(e)=>{
    if(!liveInlineEditEl)return;
    if(e.target===liveInlineEditEl||liveInlineEditEl.contains(e.target)){
      e.stopImmediatePropagation();
    }
  },true);
  playerHost.addEventListener('keydown',(e)=>{
    if(!liveInlineEditEl)return;
    if(e.target===liveInlineEditEl||liveInlineEditEl.contains(e.target)){
      e.stopImmediatePropagation();
    }
  },true);

  // Live Edit v0.2.2: never capture the whole Player surface.
  // Normal Player taps must remain owned by ScenePlayerCore:
  // cover Start works, and tapping empty stage space still advances.
  // Only tapping the CURRENT Scene text is treated as an edit-intent gesture.
  playerHost.addEventListener('click',(e)=>{
    if(!liveEditEnabled||autoRecActive||player?.historyOpen)return;
    if(liveInlineEditEl)return;

    const activeText=e.target.closest('.sp-scene.is-active .sp-text');
    if(!activeText)return;

    // The text itself is the edit entry point: one tap opens the keyboard
    // and edits the visible Scene in place. The command strip stays available.
    e.preventDefault();
    e.stopPropagation();
    setLiveToolbarVisible(true);
    startInlineTextEdit();
  },true);
  playerHost.addEventListener('sceneplayer:coverstart',()=>{finishInlineTextEdit();closeLiveEditSheet();setLiveToolbarVisible(false);});
  playerHost.addEventListener('sceneplayer:scenechange',()=>{
    const detailKind=currentDesktopDetailKind();
    finishInlineTextEdit();
    closeLiveEditSheet();
    setLiveToolbarVisible(desktopLiveActive());
    // Detail editing is auto-save. Flush the Scene we just left before
    // retargeting the inspector to the newly visible Scene.
    saveDraftNow().finally(()=>{
      requestAnimationFrame(()=>{
        ensureLiveEditEmptyTarget();
        renderDesktopLivePanel();
        if(detailKind){
          requestAnimationFrame(()=>reopenDesktopDetailForCurrentScene(detailKind));
        }
      });
    });
  });
  playerHost.addEventListener('sceneplayer:historyopen',()=>{finishInlineTextEdit();closeLiveEditSheet();setLiveToolbarVisible(false);});
  playerHost.addEventListener('sceneplayer:historyclose',()=>{requestAnimationFrame(ensureLiveEditEmptyTarget);});
  $('#autoRecStart')?.addEventListener('click',()=>{closeLiveEditSheet();if(liveEditToolbar)liveEditToolbar.hidden=true;});
  $('#autoRecCancel')?.addEventListener('click',()=>{if(liveEditEnabled)setLiveToolbarVisible(true);});
  $('#autoRecRetry')?.addEventListener('click',()=>{if(liveEditEnabled)setLiveToolbarVisible(true);});

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


if(window.matchMedia?.('(min-width:900px)').matches){
  const desktopTextDetailRangeObserver=new MutationObserver(()=>{
    const root=document.querySelector(
      '.desktop-text-detail-modal, .desktop-detail-modal, [data-desktop-text-detail]'
    );
    if(root && !root.hidden && root.getClientRects().length){
      enhanceDesktopTextDetailRanges(root);
    }
  });
  desktopTextDetailRangeObserver.observe(document.body,{
    subtree:true,
    childList:true,
    attributes:true,
    attributeFilter:['class','hidden','style']
  });
}
