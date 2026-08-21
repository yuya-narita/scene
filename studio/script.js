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
  const COVER_INFO_FIELDS=['title','subtitle','author','episode','episodeTitle'];
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
  const coverQuickFont=$('#coverQuickFont');
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
  const endingQuickFont=$('#endingQuickFont');
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
  let coverFontFamily = 'serif';
  let endingFontFamily = 'serif';
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
    ['#sceneViewSelect option[value="world"]','scene.view.world'],['#sceneViewSelect option[value="console"]','scene.view.console'],['#sceneViewSelect option[value="system"]','scene.view.system'],['#sceneViewSelect option[value="warning"]','scene.view.warning'],['#sceneViewSelect option[value="void"]','scene.view.void'],
    ['#sceneEntryMotionSelect option[value="flow"]','scene.entry.flow'],['#sceneEntryMotionSelect option[value="still"]','scene.entry.still'],
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
      if(sel.id==='sceneViewSelect')head.textContent=t('scene.view');
      if(sel.id==='sceneEntryMotionSelect')head.textContent=t('scene.entryMotion');
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
    coverFontFamily=['serif','sans','mono'].includes(workingDocument?.cover?.fontFamily)?workingDocument.cover.fontFamily:'serif';
    endingFontFamily=['serif','sans','mono'].includes(workingDocument?.ending?.fontFamily)?workingDocument.ending.fontFamily:'serif';
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
  const TEXT_COLOR_RECENTS_KEY='scene-studio-text-color-recents-v1';
  const TEXT_COLOR_PINS_KEY='scene-studio-text-color-pins-v1';

  function normalizeTextColor(value){
    const v=String(value||'').trim().toUpperCase();
    if(/^#[0-9A-F]{6}$/.test(v))return v;
    if(/^#[0-9A-F]{3}$/.test(v))return '#'+v.slice(1).split('').map(ch=>ch+ch).join('');
    return '';
  }
  function readStoredTextColors(key){
    try{
      const raw=JSON.parse(localStorage.getItem(key)||'[]');
      return Array.isArray(raw)?raw.map(normalizeTextColor).filter(Boolean):[];
    }catch(_){return [];}
  }
  function documentTextColors(){
    const out=[];
    (workingDocument?.scenes||[]).forEach(scene=>{
      const c=normalizeTextColor(scene?.presentation?.text?.color);
      if(c && !['#FFFFFF','#000000'].includes(c) && !out.includes(c))out.push(c);
    });
    return out;
  }
  function readRecentTextColors(){
    return readStoredTextColors(TEXT_COLOR_RECENTS_KEY)
      .filter(c=>c && !['#FFFFFF','#000000'].includes(c))
      .slice(0,8);
  }
  function readPinnedTextColors(){return readStoredTextColors(TEXT_COLOR_PINS_KEY).slice(0,8);}
  function rememberTextColor(value){
    const c=normalizeTextColor(value);if(!c || ['#FFFFFF','#000000'].includes(c))return;
    const next=[c,...readStoredTextColors(TEXT_COLOR_RECENTS_KEY).filter(x=>x!==c)].slice(0,8);
    localStorage.setItem(TEXT_COLOR_RECENTS_KEY,JSON.stringify(next));
  }
  function togglePinnedTextColor(value){
    const c=normalizeTextColor(value);if(!c)return false;
    const pins=readPinnedTextColors();
    const exists=pins.includes(c);
    const next=exists?pins.filter(x=>x!==c):[c,...pins.filter(x=>x!==c)].slice(0,8);
    localStorage.setItem(TEXT_COLOR_PINS_KEY,JSON.stringify(next));
    return !exists;
  }
  function previewCurrentSceneTextColor(value){
    const c=normalizeTextColor(value);if(!c)return;
    const text=player?.els?.scenes?.querySelector('.sp-scene.is-active .sp-text');
    if(text)text.style.setProperty('color',c,'important');
  }
  function hsvToHex(h,s,v){
    h=((Number(h)||0)%360+360)%360;s=Math.max(0,Math.min(1,Number(s)||0));v=Math.max(0,Math.min(1,Number(v)||0));
    const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;
    if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
    const toHex=n=>Math.round((n+m)*255).toString(16).padStart(2,'0');
    return ('#'+toHex(r)+toHex(g)+toHex(b)).toUpperCase();
  }
  function hexToHsv(hex){
    const c=normalizeTextColor(hex)||'#4A4A4A';const r=parseInt(c.slice(1,3),16)/255,g=parseInt(c.slice(3,5),16)/255,b=parseInt(c.slice(5,7),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;
    if(d){if(max===r)h=60*(((g-b)/d)%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}
    if(h<0)h+=360;return {h,s:max?d/max:0,v:max};
  }
  function makeCommittedTextColorPicker(initialColor,{compact=false,onPreview,onCommit}={}){
    let committed=normalizeTextColor(initialColor)||'#4A4A4A';
    let hsv=hexToHsv(committed);let preview=committed;let open=false;
    const root=document.createElement('div');root.className='studio-color-picker'+(compact?' is-compact':'');
    const trigger=document.createElement('button');trigger.type='button';trigger.className='studio-color-trigger';trigger.style.backgroundColor=committed;trigger.setAttribute('aria-label','任意色を選ぶ');
    const pop=document.createElement('div');pop.className='studio-color-popover';pop.hidden=true;
    const square=document.createElement('div');square.className='studio-color-square';
    const cursor=document.createElement('span');cursor.className='studio-color-cursor';square.appendChild(cursor);
    const hue=document.createElement('input');hue.type='range';hue.min='0';hue.max='359';hue.step='1';hue.value=String(Math.round(hsv.h));hue.className='studio-color-hue';hue.setAttribute('aria-label','色相');
    const meta=document.createElement('div');meta.className='studio-color-meta';
    const dot=document.createElement('span');dot.className='studio-color-dot';
    const code=document.createElement('code');code.textContent=committed;
    const hint=document.createElement('small');hint.textContent='動かして確認・クリックで決定';
    meta.append(dot,code,hint);pop.append(square,hue,meta);root.append(trigger,pop);
    const paint=()=>{
      square.style.setProperty('--picker-hue',String(Math.round(hsv.h)));
      cursor.style.left=`${Math.max(0,Math.min(100,hsv.s*100))}%`;
      cursor.style.top=`${Math.max(0,Math.min(100,(1-hsv.v)*100))}%`;
      dot.style.backgroundColor=preview;code.textContent=preview;trigger.style.backgroundColor=preview;
    };
    const previewAt=e=>{
      const r=square.getBoundingClientRect();if(!r.width||!r.height)return;
      hsv.s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
      hsv.v=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
      preview=hsvToHex(hsv.h,hsv.s,hsv.v);paint();if(typeof onPreview==='function')onPreview(preview);
    };
    const fitMobilePopover=()=>{
      if(!open||!matchMedia('(max-width:640px)').matches)return;
      for(const prop of ['position','left','right','top','bottom','width','maxHeight','overflow','transform']){
        pop.style.removeProperty(prop);
      }
      requestAnimationFrame(()=>{
        const body=pop.closest('.live-edit-sheet-body');
        if(!body)return;
        const bodyRect=body.getBoundingClientRect();
        const popRect=pop.getBoundingClientRect();
        const safeBottom=Math.min(bodyRect.bottom,window.innerHeight-86);
        const clipped=popRect.bottom-safeBottom;
        if(clipped>0){
          body.scrollTo({
            top:body.scrollTop+clipped+18,
            behavior:'smooth'
          });
        }
      });
    };

    const placePopover=()=>{
      if(!open)return;
      if(matchMedia('(max-width:640px)').matches){
        fitMobilePopover();
        return;
      }
      const vv=window.visualViewport;
      const vw=vv?.width||window.innerWidth;
      const vh=vv?.height||window.innerHeight;
      const vo=vv?.offsetTop||0;
      const r=trigger.getBoundingClientRect();
      const width=Math.min(286,Math.max(220,vw-24));
      pop.style.position='fixed';
      pop.style.width=`${width}px`;
      pop.style.boxSizing='border-box';
      pop.style.transform='none';
      const left=Math.max(12,Math.min(vw-width-12,r.left+(r.width/2)-(width/2)));
      pop.style.left=`${left}px`;
      pop.style.right='auto';

      const ph=Math.min(pop.scrollHeight||260,Math.max(220,vh-24));
      const below=r.bottom+8;
      const above=r.top-ph-8;
      const top=(below+ph<=vo+vh-8)?below:Math.max(vo+8,above);
      pop.style.top=`${top}px`;
      pop.style.maxHeight=`${Math.max(180,vh-16)}px`;
      pop.style.overflow='auto';
    };
    const close=(revert=true)=>{
      if(!open)return;
      open=false;
      pop.hidden=true;
      root.classList.remove('is-open');
      document.removeEventListener('pointerdown',outside,true);
      document.removeEventListener('keydown',keyClose,true);
      window.visualViewport?.removeEventListener('resize',placePopover);
      window.visualViewport?.removeEventListener('scroll',placePopover);
      window.removeEventListener('resize',placePopover);
      if(revert){preview=committed;hsv=hexToHsv(committed);hue.value=String(Math.round(hsv.h));paint();if(typeof onPreview==='function')onPreview(committed);}
    };
    const outside=e=>{if(!root.contains(e.target))close(true);};
    const keyClose=e=>{if(e.key==='Escape'){e.preventDefault();close(true);}};
    const togglePicker=e=>{
      e.preventDefault();e.stopPropagation();
      open=!open;pop.hidden=!open;root.classList.toggle('is-open',open);
      if(open){
        paint();
        requestAnimationFrame(()=>{
          placePopover();
          document.addEventListener('pointerdown',outside,true);
          document.addEventListener('keydown',keyClose,true);
          window.visualViewport?.addEventListener('resize',placePopover);
          window.visualViewport?.addEventListener('scroll',placePopover);
          window.addEventListener('resize',placePopover);
          if(matchMedia('(max-width:640px)').matches){
            requestAnimationFrame(fitMobilePopover);
            setTimeout(fitMobilePopover,80);
          }
        });
      }else close(false);
    };
    trigger.addEventListener('pointerdown',togglePicker);
    trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();});
    square.addEventListener('pointermove',previewAt);
    square.addEventListener('click',e=>{previewAt(e);committed=preview;rememberTextColor(committed);trigger.style.backgroundColor=committed;if(typeof onCommit==='function')onCommit(committed);close(false);});
    hue.addEventListener('input',()=>{hsv.h=Number(hue.value)||0;preview=hsvToHex(hsv.h,hsv.s,hsv.v);paint();if(typeof onPreview==='function')onPreview(preview);});
    // Hue itself is only a preview control; the saturation/value square click is the commit gesture.
    paint();
    return {root,get value(){return committed;},setValue(v){const c=normalizeTextColor(v);if(!c)return;committed=c;preview=c;hsv=hexToHsv(c);hue.value=String(Math.round(hsv.h));paint();}};
  }
  function makeTextColorPalette(currentColor,onApply){
    const wrap=document.createElement('div');wrap.className='text-color-palette';
    const makeRow=(label,colors)=>{
      const row=document.createElement('div');row.className='text-color-palette-row';
      const name=document.createElement('span');name.className='text-color-palette-label';name.textContent=label;row.appendChild(name);
      const chips=document.createElement('div');chips.className='text-color-palette-chips';
      if(colors.length){
        colors.forEach(hex=>{
          const b=document.createElement('button');b.type='button';b.className='text-color-chip';b.style.backgroundColor=hex;b.title=hex;b.setAttribute('aria-label',`${label} ${hex}`);
          if(normalizeTextColor(currentColor)===hex)b.classList.add('is-current');
          b.addEventListener('click',()=>{rememberTextColor(hex);onApply(hex);});chips.appendChild(b);
        });
      }else{
        const empty=document.createElement('small');empty.textContent='まだなし';chips.appendChild(empty);
      }
      row.appendChild(chips);return row;
    };
    wrap.append(makeRow('最近',readRecentTextColors()),makeRow('固定',readPinnedTextColors()));
    const actions=document.createElement('div');actions.className='text-color-palette-actions';
    const pin=document.createElement('button');pin.type='button';pin.className='text-color-pin';
    const current=normalizeTextColor(currentColor);
    const pinned=current && readPinnedTextColors().includes(current);
    pin.textContent=pinned?'★ 固定を外す':'☆ この色を固定';pin.disabled=!current;
    pin.addEventListener('click',()=>{if(!current)return;togglePinnedTextColor(current);const fresh=makeTextColorPalette(current,onApply);wrap.replaceWith(fresh);});
    actions.appendChild(pin);wrap.appendChild(actions);return wrap;
  }

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
    const preservedStyle=clone(workingDocument?.ending?.style||{});
    return {
      label:String(endingLabelInput?.value||'').trim(),
      fontFamily:endingFontFamily,
      ...(Object.keys(preservedStyle).length?{style:preservedStyle}:{}),
      coverButton:{kicker:'COVER',label:t('ending.cover')},
      links:endingLinkInputs.map((row,index)=>({position:index===0?'left':'right',kicker:String(row.kicker?.value||'').trim(),label:String(row.label?.value||'').trim(),url:String(row.url?.value||'').trim()})).filter(x=>x.label&&x.url)
    };
  }
  function updateEndingPreview(){
    if(endingPreviewLabel){
      const endingText=String(endingLabelInput?.value||'').trim()||'つづく';
      endingPreviewLabel.textContent=endingText;
      endingPreviewLabel.classList.toggle('has-authored-break',/\r?\n/.test(endingText));
      const families={serif:'"Yu Mincho","Hiragino Mincho ProN",serif',sans:'-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Yu Gothic",sans-serif',mono:'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'};
      endingPreviewLabel.style.setProperty('font-family',families[endingFontFamily]||families.serif,'important');
    }
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
  function refreshLivePlayerDocumentChrome(){
    if(!player||!workingDocument)return;
    const doc=getDocumentForPlayback();
    if(typeof player.refreshDocumentChrome==='function'){
      player.refreshDocumentChrome({document:doc});
      if(liveEditEnabled&&player?.ended)requestAnimationFrame(prepareLiveEndingEditor);
    }else{
      // Older cached Core fallback: keep its document current. Reopening cover/end
      // will then pick up the authored shell typography.
      player.document=doc;
    }
  }

  function syncQuickEndingToMain(){
    if(endingQuickTarget==='center'){if(endingLabelInput)endingLabelInput.value=endingQuickCenterText?.value||'';if(endingQuickFont)endingFontFamily=endingQuickFont.value||'serif';}
    else{const row=endingLinkInputs[endingQuickTarget==='left'?0:1];if(row?.kicker)row.kicker.value=endingQuickKicker?.value||'';if(row?.label)row.label.value=endingQuickLabel?.value||'';if(row?.url)row.url.value=endingQuickUrl?.value||'';}
    updateEndingPreview();syncEasyShellToWorkingDocument();refreshLivePlayerDocumentChrome();syncEasyPublishButton();scheduleDraftSave(100);
    if(liveEditEnabled&&player?.ended)requestAnimationFrame(prepareLiveEndingEditor);
  }
  function openEndingQuickEditor(target){
    if(!endingQuickDialog)return;
    if(liveEditEnabled)bringEndingQuickDialogToFront();
    endingQuickTarget=target;const center=target==='center';
    endingQuickCenterFields.hidden=!center;endingQuickSlotFields.hidden=center;
    endingQuickTitle.textContent=center?'中央の文':target==='left'?'左ボタン':'右ボタン';
    if(center){
      endingQuickCenterText.value=endingLabelInput?.value||'';
      if(endingQuickFont)endingQuickFont.value=endingFontFamily;
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

  function coverTextOverrideValue(target, fallback='') {
    // v13 compatibility name: cover display text now comes from canonical work info.
    const canonical=coverTextStateFromDocument();
    if(Object.prototype.hasOwnProperty.call(canonical,target))return String(canonical[target]??'');
    return String(fallback??'');
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
    const coverFamilies={serif:'"Yu Mincho","Hiragino Mincho ProN",serif',sans:'-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Yu Gothic",sans-serif',mono:'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'};
    coverPreview.style.setProperty('--cover-author-font',coverFamilies[coverFontFamily]||coverFamilies.serif);
    const empty=coverPreview.querySelector('.cover-preview-empty');
    if(empty)empty.hidden=Boolean(coverImageUrl);
    if(coverImageClear)coverImageClear.hidden=!coverImageUrl;

    const title=coverTextOverrideValue('title',titleInput?.value||'').trim();
    const author=coverTextOverrideValue('author',authorInput?.value||'').trim();
    const subtitle=coverTextOverrideValue('subtitle',subtitleInput?.value||'').trim();
    const episode=coverTextOverrideValue('episode',episodeInput?.value||'').trim();
    const episodeTitle=coverTextOverrideValue('episodeTitle',episodeTitleInput?.value||'').trim();

    if(coverPreviewLogo){coverPreviewLogo.src=coverLogoUrl||'';coverPreviewLogo.hidden=!coverLogoUrl;}
    const visible=coverVisibilityStateFromDocument();
    if(coverPreviewTitle){
      const previewTitle=title;
      coverPreviewTitle.textContent=previewTitle;
      coverPreviewTitle.hidden=Boolean(coverLogoUrl)||!previewTitle||visible.title===false;
      coverPreviewTitle.classList.toggle('has-authored-break',/\r?\n/.test(previewTitle));
    }
    if(coverPreviewAuthor){coverPreviewAuthor.textContent=author;coverPreviewAuthor.hidden=!author||visible.author===false;}
    if(coverPreviewEpisode){coverPreviewEpisode.textContent=episode;coverPreviewEpisode.hidden=!episode||visible.episode===false;}
    if(coverPreviewSubtitle){coverPreviewSubtitle.textContent=subtitle;coverPreviewSubtitle.hidden=!subtitle||visible.subtitle===false;}
    if(coverPreviewEpisodeTitle){coverPreviewEpisodeTitle.textContent=episodeTitle;coverPreviewEpisodeTitle.hidden=!episodeTitle||visible.episodeTitle===false;}

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
      title:titleInput.value.trim(), author:authorInput.value.trim(),
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
      cover:{
        ...(coverImageUrl?{src:coverImageUrl,fit:'cover',position:'center center'}:{}),
        ...(coverLogoUrl?{logo:{src:coverLogoUrl,_editorFileName:coverLogoFileName}}:{}),
        fontFamily:coverFontFamily,
        ...(workingDocument?.cover?.styles && Object.keys(workingDocument.cover.styles).length
          ? {styles:clone(workingDocument.cover.styles)}
          : {}),
        ...(workingDocument?.cover?.visibility && Object.keys(workingDocument.cover.visibility).length
          ? {visibility:clone(workingDocument.cover.visibility)}
          : {})
      },
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
    workingDocument.title=titleInput.value.trim();
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
    const preservedCoverStyles=clone(workingDocument.cover?.styles||{});
    const preservedCoverVisibility=clone(workingDocument.cover?.visibility||{});
    workingDocument.cover={...(coverImageUrl?{src:coverImageUrl,fit:'cover',position:'center center'}:{}),...(coverLogoUrl?{logo:{src:coverLogoUrl,_editorFileName:coverLogoFileName}}:{}),fontFamily:coverFontFamily,...(Object.keys(preservedCoverStyles).length?{styles:preservedCoverStyles}:{}),...(Object.keys(preservedCoverVisibility).length?{visibility:preservedCoverVisibility}:{})};
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
    coverFontFamily=['serif','sans','mono'].includes(doc.cover?.fontFamily)?doc.cover.fontFamily:'serif';
    endingFontFamily=['serif','sans','mono'].includes(doc.ending?.fontFamily)?doc.ending.fontFamily:'serif';
    if(endingLabelInput)endingLabelInput.value=doc.ending?.label||doc.ending?.title||'';
    {
      const links=Array.isArray(doc.ending?.links)?doc.ending.links:[];
      const hasPositions=links.some(item=>item?.position==='left'||item?.position==='right');
      endingLinkInputs.forEach((pair,index)=>{
        const pos=index===0?'left':'right';
        const item=hasPositions
          ? (links.find(entry=>entry?.position===pos)||{})
          : (links[index]||{});
        if(pair.kicker)pair.kicker.value=item.kicker||'';
        if(pair.label)pair.label.value=item.label||item.title||'';
        if(pair.url)pair.url.value=item.url||item.href||'';
      });
    }
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

    // In Live Editor, AUTO REC must begin at the Scene the author is actually viewing.
    // Outside Live Editor, keep the existing resume-from-progress behavior.
    let startAt=liveEditEnabled
      ? Math.max(0,Math.min(Number(player?.index)||0,total-1))
      : Math.min(Math.max(0,Number(autoRecProgress?.nextIndex)||0),total-1);

    if(!liveEditEnabled && startAt>=total-1 && (autoRecProgress?.recordedCount||0)>=total){
      autoRecProgress={nextIndex:0,recordedCount:0};
      startAt=0;
    }

    const p=ensurePlayer();
    p.stopAuto?.();
    p.load(getDocumentForPlayback(),{startAt});

    // A document with a cover re-enters Cover state on load().
    // Live Editor is already inside the work, so restore the current Scene immediately.
    if(liveEditEnabled){
      p._clearAutoTimer?.();
      p._resetPresentationRuntime?.();
      p._resetBackgroundRuntime?.();
      p.index=startAt;
      p.maxVisitedIndex=Math.max(p.maxVisitedIndex,startAt);
      p.ended=false;
      p._audioRenderMode='restore';
      p._render?.();
      if(p.els?.cover)p.els.cover.hidden=true;
      p.host?.classList.remove('sp-cover-open');
      selectedSceneIndex=startAt;
    }

    p.unlockAudio?.(true);
    autoRecActive=true;
    syncPublishPreviewButton(false);
    autoRecDurations=[];
    autoRecCurrentIndex=startAt;
    autoRecStartedAt=performance.now();
    autoRecSceneStartedAt=autoRecStartedAt;
    const done=$('#autoRecDone'); if(done)done.hidden=true;
    renderAutoRecUI();
    syncLiveEditPreviewChrome();
    if(desktopLiveActive())requestAnimationFrame(renderDesktopLivePanel);
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
    const rights=$('#publishRightsConfirm');

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

  function resetPublishRightsConfirmation(){
    const rights=$('#publishRightsConfirm');
    const confirm=$('#publishConfirmButton');
    if(rights)rights.checked=false;
    if(confirm)confirm.disabled=true;
  }

  function openPublishDialog(){
    if(!workingDocument?.scenes?.length)return;
    const status=currentPublishStatus();
    syncPublishCopyForStatus();

    resetPublishRightsConfirmation();
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
    const rights=$('#publishRightsConfirm');
    if(rights && !rights.checked){ rights.focus(); return; }
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
      syncPublishPreviewButton(false);
      // Keep the toolbar/Aa sheet alive while the author is actively editing
      // cover text. setLiveToolbarVisible() itself mutates playerHost.classList,
      // so this observer used to immediately close the sheet it had just opened.
      const coverAaOpen=liveShellTextContext?.kind==='cover';
      const coverTextActive=!!liveCoverInlineTarget;
      if(!coverAaOpen && !coverTextActive){
        setLiveToolbarVisible(false);
        closeLiveEditSheet();
      }
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
    playerHost.addEventListener('sceneplayer:coverstart',()=>{
      syncPublishPreviewButton(false);
      syncLiveEditPreviewChrome();
    });
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
  function setScreen(name){ editorScreen.hidden=name!=='easy'; advancedScreen.hidden=name!=='advanced'; playerScreen.hidden=name!=='player'; const open=name==='player'; const returnButton=$('#editReturnButton'); if(returnButton)returnButton.hidden=!open; document.documentElement.classList.toggle('easy-player-open',open); document.body.classList.toggle('easy-player-open',open); const modeLabel=$('#studioModeLabel'); if(modeLabel) modeLabel.textContent=name==='advanced'?'道具箱':'Easy Studio'; syncUndoVisibilityForScreen(name); }
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

    // Cover inline editing keeps a five-field working draft so editing one field
    // never destroys the other four. It MUST be rebuilt for every preview.
    // Otherwise a draft from a previous work/preview can overwrite the current
    // Easy cover the moment the author taps a cover field or Aa.
    liveCoverTextDraft=coverTextStateFromDocument();

    enableLiveEdit();
    p.setUILanguage?.(uiLanguage);
    const playbackDoc=getDocumentForPlayback();
    p.load(playbackDoc,{startAt});
    requestAnimationFrame(renderDesktopLivePanel);
    setTimeout(renderDesktopLivePanel,60);
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
    if(modeFab){
      modeFab.hidden=false;
      modeFab.disabled=false;
      modeFab.querySelector('span').textContent='✎';
      modeFab.setAttribute('aria-label','Easyへ戻る');
      modeFab.title='Easyへ戻る';
    }
    scrollScreenToTop(advancedScreen);
  }
  function closeAdvanced(){
    syncAdvancedFieldsToScene();
    restoreEasyStateFromDocument(workingDocument);
    easySourceDirty=false;
    updateEasyFileActions();
    setScreen('easy');
    const modeFab=$('#floatingAdvancedButton');
    if(modeFab){
      modeFab.querySelector('span').textContent='▦';
      modeFab.setAttribute('aria-label','道具箱を開く');
      modeFab.title='道具箱';
      updateEasyFileActions();
    }
  }

  function currentScene(){ return workingDocument?.scenes?.[selectedSceneIndex] || null; }
  function ensurePresentation(scene){ scene.presentation ||= {}; scene.presentation.text ||= {}; return scene.presentation; }

  const pct = (value, fallback=0) => Math.max(0, Math.min(100, Number(value ?? fallback))) / 100;
  const ms = (value, fallback=0) => Math.max(0, Number(value ?? fallback) || 0);
  function managedAudio(scene, channel){
    const list=scene.audio || [];
    // Prefer events created by Studio, but imported .scene files are valid even
    // when they do not contain the private _editorManaged marker. Falling back
    // to the first matching Format v1 command lets Live/Advanced Studio show
    // the value authored in the current Scene instead of only the inherited
    // value from the previous Scene.
    return list.find(c => c?._editorManaged && c.channel === channel)
      || list.find(c => c && c.channel === channel && (channel !== 'oneshot' || c.role === 'se' || !c.role))
      || null;
  }
  function setManagedAudio(scene, channel, command){
    const list=scene.audio || [];
    const existing=managedAudio(scene,channel);
    // If an imported raw Format v1 command is being edited, replace that exact
    // command rather than appending a second Studio-managed event. Other raw
    // commands (for example an additional one-shot) are preserved.
    const rest=list.filter(c => c !== existing && !(c?._editorManaged && c.channel === channel));
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
    const p=ensurePresentation(scene); p.display=$('#sceneDisplaySelect').value; p.view=$('#sceneViewSelect')?.value || 'world'; p.entryMotion=$('#sceneEntryMotionSelect')?.value || 'flow';
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
    if($('#sceneViewSelect')) $('#sceneViewSelect').value=scene.presentation?.view || 'world';
    if($('#sceneEntryMotionSelect')) $('#sceneEntryMotionSelect').value=scene.presentation?.entryMotion || 'flow';
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

  function toolboxSceneSummary(){
    const scene=currentScene();
    if(!scene)return;

    const p=scene.presentation||{};
    const txt=p.text||{};

    const textBits=[];
    const fontMap={serif:'明朝',sans:'ゴシック',mono:'等幅'};
    textBits.push(txt.fontFamily ? (fontMap[txt.fontFamily]||txt.fontFamily) : '作品設定');
    textBits.push(txt.size && txt.size!=='auto' ? txt.size : 'おまかせ');
    $('#toolboxTextSummary') && ($('#toolboxTextSummary').textContent=textBits.join(' / '));

    const fx=p.typing?.enabled ? 'タイプライター' : (p.effect||'おまかせ');
    const display=(p.display||'stack')==='solo' ? 'この文章だけ' : '前の文章を残す';
    $('#toolboxEffectSummary') && ($('#toolboxEffectSummary').textContent=`${fx} / ${display}`);

    let bg='前Sceneを継続';
    if(p.background && typeof p.background==='object'){
      if(p.background.src==='')bg='背景なし';
      else if(p.background.src)bg=`画像あり / ${p.background.motion?.type||'動きなし'}`;
    }
    $('#toolboxBackgroundSummary') && ($('#toolboxBackgroundSummary').textContent=bg);

    const audio=scene.audio||[];
    const has=(ch)=>audio.some(cmd=>cmd?.channel===ch && cmd?.action!=='stop');
    const stopped=(ch)=>audio.some(cmd=>cmd?.channel===ch && cmd?.action==='stop');
    const parts=[
      `BGM ${stopped('bgm')?'停止':(has('bgm')?'設定あり':'継続')}`,
      `Ambient ${stopped('ambient')?'停止':(has('ambient')?'設定あり':'継続')}`,
      `SE ${has('oneshot')?'あり':'なし'}`
    ];
    $('#toolboxAudioSummary') && ($('#toolboxAudioSummary').textContent=parts.join('・'));
  }

  function cleanupToolboxDetail(){
    document.body.classList.remove('toolbox-detail-open');
    requestAnimationFrame(()=>{
      if(advancedScreen && !advancedScreen.hidden){
        loadSceneIntoFields();
        toolboxSceneSummary();
      }
    });
  }

  function closeAllToolboxDetails(){
    document.querySelectorAll('.desktop-text-detail-overlay').forEach(el=>el.remove());
    document.body.classList.remove('toolbox-detail-open');
  }

  function openToolboxDetail(kind){
    if(!workingDocument || advancedScreen?.hidden)return;
    syncAdvancedFieldsToScene();

    // Toolbox is a cockpit: only one inspector can exist at a time.
    closeAllToolboxDetails();

    if(kind==='text')openDesktopTextDetail();
    else if(kind==='effect')openDesktopEffectDetail();
    else if(kind==='background')openDesktopBackgroundDetail();
    else if(kind==='audio')openDesktopAudioDetail();

    const selector=kind==='effect'?'.desktop-effect-detail-overlay':
      kind==='background'?'.desktop-background-detail-overlay':
      kind==='audio'?'.desktop-audio-detail-overlay':
      '.desktop-text-detail-overlay';

    const overlay=document.querySelector(selector);
    if(!overlay)return;

    overlay.dataset.toolboxDetail='true';
    document.body.classList.add('toolbox-detail-open');

    // Always host Toolbox inspectors at body level so PC scroll position
    // never dictates where the modal appears.
    if(overlay.parentElement!==document.body)document.body.appendChild(overlay);

    const clean=()=>{
      requestAnimationFrame(()=>{
        closeAllToolboxDetails();
        cleanupToolboxDetail();
      });
    };

    overlay.querySelector('.desktop-text-detail-close')?.addEventListener('click',clean,{once:true});
    [...overlay.querySelectorAll('.desktop-text-detail-foot button')].forEach(btn=>{
      const t=(btn.textContent||'').trim();
      if(t==='閉じる'||t==='キャンセル'||t==='保存'){
        btn.addEventListener('click',clean,{once:true});
      }
    });
  }

  function enhanceToolboxStructure(){
    if(!advancedScreen || advancedScreen.dataset.toolboxReady==='2')return;
    advancedScreen.dataset.toolboxReady='2';

    const layout=advancedScreen.querySelector('.advanced-layout');
    const rail=advancedScreen.querySelector('.scene-rail');
    const inspector=advancedScreen.querySelector('.scene-inspector');
    if(!layout || !rail || !inspector)return;

    // AUTO timing belongs directly under Scene navigation on both phone and PC.
    const auto=inspector.querySelector('.auto-timing-editor');
    if(auto)rail.insertAdjacentElement('afterend',auto);

    // Old background/audio accordions are retained only as hidden data controls.
    advancedScreen.querySelectorAll('.legacy-advanced-detail').forEach(el=>{
      el.hidden=true;
      el.setAttribute('aria-hidden','true');
    });

    // Rebuild project-wide storage once, with the correct visible names.
    let extras=advancedScreen.querySelector('.toolbox-extras');
    extras?.remove();

    extras=document.createElement('details');
    extras.className='toolbox-extras';
    extras.innerHTML=`
      <summary>作品全体・その他</summary>
      <div class="toolbox-extras-body">
        <section class="toolbox-global-slot toolbox-global-navigation">
          <h3>読者ナビゲーション</h3>
        </section>
        <section class="toolbox-global-slot toolbox-global-ending">
          <h3>読了ページ</h3>
        </section>
        <section class="toolbox-global-slot toolbox-global-meta">
          <h3>作品情報・表紙</h3>
        </section>
      </div>`;
    layout.after(extras);

    const policy=advancedScreen.querySelector('.advanced-policy');
    const ending=advancedScreen.querySelector('#advancedEndingEditor');
    const meta=advancedScreen.querySelector('.advanced-work-meta');

    if(policy)extras.querySelector('.toolbox-global-navigation').appendChild(policy);
    if(ending){
      ending.open=false;
      ending.querySelector(':scope > summary')?.replaceChildren(document.createTextNode('読了ページを編集'));
      extras.querySelector('.toolbox-global-ending').appendChild(ending);
    }
    if(meta){
      meta.open=false;
      meta.querySelector(':scope > summary')?.replaceChildren(document.createTextNode('作品情報・表紙を編集'));
      extras.querySelector('.toolbox-global-meta').appendChild(meta);
    }

    advancedScreen.querySelectorAll('[data-toolbox-detail]').forEach(btn=>{
      if(btn.dataset.toolboxBound==='1')return;
      btn.dataset.toolboxBound='1';
      btn.addEventListener('click',()=>openToolboxDetail(btn.dataset.toolboxDetail));
    });
  }

  function renderAdvanced(){
    if(!workingDocument)return;
    enhanceToolboxStructure();
    normalizeSceneIds();
    selectedSceneIndex=Math.max(0,Math.min(selectedSceneIndex,workingDocument.scenes.length-1));
    $('#allowPreviousInput').checked=workingDocument.player?.navigation?.allowPrevious !== false;
    const pos=$('#advancedScenePosition'); if(pos)pos.textContent=`Scene ${selectedSceneIndex+1} / ${workingDocument.scenes.length}`;
    renderSceneList();
    loadSceneIntoFields();
    toolboxSceneSummary();
    requestAnimationFrame(()=>{
      const selected=$('#sceneList')?.querySelector('.scene-list-item.is-selected');
      selected?.scrollIntoView?.({behavior:'smooth',block:'nearest',inline:'center'});
    });
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
    if(coverQuickFont)coverFontFamily=coverQuickFont.value||'serif';
    refreshCoverPreviewLayout();
    syncEasyShellToWorkingDocument();

    // Easy is the source of truth here. Refresh all five cover text fields
    // together instead of keeping an older Live Editor draft alive.
    liveCoverTextDraft=coverTextStateFromDocument();

    refreshLivePlayerDocumentChrome();
    syncEasyPublishButton();
    rememberWorkIdentity();
    scheduleDraftSave(250);
  }

  let coverVisibilityPanel=null;
  const coverVisibilityChecks={};

  function ensureCoverVisibilityPanel(){
    if(coverVisibilityPanel||!coverQuickDialog)return coverVisibilityPanel;
    const card=document.createElement('section');
    card.className='cover-visibility-panel';
    const h=document.createElement('strong');
    h.textContent='表紙に表示する情報';
    const note=document.createElement('p');
    note.textContent='作品情報は残したまま、表紙に出す項目だけ選べます。画像だけの表紙ならすべてOFF。';
    const grid=document.createElement('div');
    grid.className='cover-visibility-grid';

    const labels=[
      ['title','作品タイトル'],
      ['subtitle','サブタイトル'],
      ['author','作者名'],
      ['episode','話数'],
      ['episodeTitle','今回のタイトル']
    ];
    for(const [target,labelText] of labels){
      const label=document.createElement('label');
      label.className='cover-visibility-check';
      const input=document.createElement('input');
      input.type='checkbox';
      input.dataset.coverVisibilityTarget=target;
      const span=document.createElement('span');
      span.textContent=labelText;
      label.append(input,span);
      grid.appendChild(label);
      coverVisibilityChecks[target]=input;
      input.addEventListener('change',()=>{
        setCoverFieldVisible(target,input.checked,{refresh:true});
      });
    }
    card.append(h,note,grid);

    const fontAnchor=coverQuickFont?.closest?.('label') || coverQuickFont?.parentElement;
    if(fontAnchor?.parentElement)fontAnchor.parentElement.insertBefore(card,fontAnchor);
    else coverQuickDialog.querySelector?.('section,form,div')?.appendChild(card);
    coverVisibilityPanel=card;
    return card;
  }

  function syncCoverVisibilityControls(){
    ensureCoverVisibilityPanel();
    const state=coverVisibilityStateFromDocument();
    for(const target of COVER_INFO_FIELDS){
      const input=coverVisibilityChecks[target];
      if(input)input.checked=state[target]!==false;
      const desktop=desktopLivePanelBody?.querySelector?.(`[data-cover-visibility-target="${target}"]`);
      if(desktop)desktop.checked=state[target]!==false;
    }
  }

  function openCoverQuickEditor(focusTarget='title'){
    if(!coverQuickDialog)return;
    coverQuickWorkTitle.value=titleInput?.value||'';
    coverQuickAuthor.value=authorInput?.value||'';
    coverQuickSubtitle.value=subtitleInput?.value||'';
    coverQuickEpisode.value=episodeInput?.value||'';
    coverQuickEpisodeTitle.value=episodeTitleInput?.value||'';
    if(coverQuickDescription)coverQuickDescription.value=descriptionInput?.value||'';
    if(coverQuickFont)coverQuickFont.value=coverFontFamily;
    ensureCoverVisibilityPanel();
    syncCoverVisibilityControls();
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
  coverQuickFont?.addEventListener('change',syncCoverQuickToMain);
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
  endingQuickFont?.addEventListener('change',()=>{endingFontFamily=endingQuickFont.value||'serif';syncQuickEndingToMain();});
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
  $('#publishRightsConfirm')?.addEventListener('change',(event)=>{const b=$('#publishConfirmButton');if(b)b.disabled=!event.currentTarget.checked;});
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
      const inAdvanced=advancedScreen && !advancedScreen.hidden;
      floatingAdvanced.hidden=!hasDocument;
      floatingAdvanced.disabled=!hasDocument;
      floatingAdvanced.querySelector('span').textContent=inAdvanced?'✎':'▦';
      floatingAdvanced.setAttribute('aria-label',inAdvanced?'Easyへ戻る':'道具箱を開く');
      floatingAdvanced.title=inAdvanced?'Easyへ戻る':'道具箱';
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
  $('#floatingAdvancedButton')?.addEventListener('click',(event)=>{
    event.preventDefault();
    event.stopPropagation();
    if(!advancedScreen.hidden) closeAdvanced();
    else openAdvanced();
  });
  $('#toolboxEasyReturnButton')?.addEventListener('click',closeAdvanced);

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
  ['sceneTextInput','sceneSubTextInput','sceneTypeSelect','sceneDisplaySelect','sceneViewSelect','sceneEntryMotionSelect','sceneEffectSelect','sceneSizeSelect','sceneFontSelect','sceneLanguageSelect','sceneLanguageCustomInput'].forEach(id=>$('#'+id)?.addEventListener('change',()=>{
    syncAdvancedFieldsToScene();
    renderSceneList();
    if(liveEditEnabled && player && !playerScreen?.hidden) refreshLivePlayer({preserveSheet:true});
  }));

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
  const desktopTimingButton=$('#desktopTimingButton');
  const desktopLiveMQ=window.matchMedia('(min-width:1100px)');
  let desktopTimingOpen=false;
  let liveEditEnabled=false;
  let liveEditToolbarVisible=false;
  let liveInlineEditEl=null;
  let liveInlineEditField='text';
  let liveInlineKeyboardShift=0;
  let liveInlineIntroTimer=0;
  let liveInlineDockTimer=0;
  const LIVE_INLINE_HINT_KEY='sceneStudio.liveEdit.cursorHintSeen.v1';

  function liveEditScene(){
    const advancedActive=advancedScreen && !advancedScreen.hidden;
    const sourceIndex=advancedActive ? selectedSceneIndex : (player?.index ?? selectedSceneIndex);
    const i=Math.max(0,Math.min(sourceIndex,(workingDocument?.scenes?.length||1)-1));
    return {scene:workingDocument?.scenes?.[i]||null,index:i};
  }
  function closeLiveEditSheet(){
    if(liveEditSheet){
      liveEditSheet.hidden=true;
      liveEditSheet.classList.remove('live-edit-sheet-timing','live-edit-sheet-audio','mobile-live-detail-sheet');
    }
    document.body.classList.remove('live-edit-sheet-open','mobile-live-detail-open');
    liveShellTextContext=null;
  }
  function clearCoverToolbarState(){
    if(!liveEditToolbar)return;
    liveEditToolbar.classList.remove('live-cover-toolbar-mode','live-ending-toolbar-mode');
    liveEditToolbar.querySelectorAll('[data-live-edit]').forEach(btn=>{
      btn.disabled=false;
      btn.removeAttribute('aria-disabled');
    });
  }
  function updateCoverToolbarState(){
    if(!liveEditToolbar)return;
    const coverMode=playerHost.classList.contains('sp-cover-open') && !!liveCoverInlineTarget;
    const endingMode=Boolean(player?.ended && liveEndingInlineEl);
    const restricted=coverMode||endingMode;
    liveEditToolbar.classList.toggle('live-cover-toolbar-mode',coverMode);
    liveEditToolbar.classList.toggle('live-ending-toolbar-mode',endingMode);
    liveEditToolbar.querySelectorAll('[data-live-edit]').forEach(btn=>{
      const isText=btn.dataset.liveEdit==='text';
      btn.disabled=restricted && !isText;
      if(btn.disabled)btn.setAttribute('aria-disabled','true');
      else btn.removeAttribute('aria-disabled');
    });
  }

  function setLiveToolbarVisible(show){
    liveEditToolbarVisible=!!show;
    if(liveEditToolbar) liveEditToolbar.hidden=!liveEditEnabled||!liveEditToolbarVisible;
    playerHost.classList.toggle('live-edit-toolbar-visible',liveEditEnabled&&liveEditToolbarVisible);
    if(playerHost?.classList?.contains('sp-cover-open') || (player?.ended&&liveEndingInlineEl))updateCoverToolbarState();
    else clearCoverToolbarState();
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
    const editingEl=liveInlineEditEl;
    if(editingEl){
      editingEl.removeAttribute('contenteditable');
      editingEl.removeAttribute('role');
      editingEl.classList.remove('live-inline-editing');
    }
    liveInlineEditEl=null;
    liveInlineEditField='text';
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
    if(liveInlineEditField==='subText'){
      if(value.length)scene.subText=value;
      else delete scene.subText;
      if(player?.currentScene){
        if(value.length)player.currentScene.subText=value;
        else delete player.currentScene.subText;
      }
    }else{
      scene.text=value;
      if(player?.currentScene)player.currentScene.text=value;
      el.classList.toggle('live-edit-empty-target',value.length===0);
      el.closest('.sp-scene')?.classList.toggle('live-edit-empty-scene',value.length===0);
      updateInlineAutoFit(scene,el);
    }
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

function startInlineTextEdit(field='text'){
    const {scene}=liveEditScene(); if(!scene)return;
    finishInlineTextEdit(); closeLiveEditSheet(); setLiveToolbarVisible(true);
    const selector=field==='subText'?'.sp-subtext':'.sp-text';
    const el=playerHost.querySelector(`.sp-scene.is-active ${selector}`); if(!el)return;

    liveInlineEditField=field==='subText'?'subText':'text';
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
    el.setAttribute('aria-label',liveInlineEditField==='subText'?'Scene subtext':'Scene text');
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
    removeLiveDisappearEditTarget();
    const target=Math.max(0,Math.min(Number(index)||0,workingDocument.scenes.length-1));
    const wasOpen=liveEditSheet&&!liveEditSheet.hidden;
    const doc=getDocumentForPlayback();

    // Keep Studio preview on the exact same renderer/API as the Public Player.
    // refreshCurrent() redraws the current Scene immediately and replays its
    // presentation while preserving the already-playing BGM/Ambient transport.
    player.options.historyAllScenes=true;
    const allowPrevious=doc.player?.navigation?.allowPrevious!==false;
    player.options.allowPrevious=allowPrevious;
    if(player.els?.prev)player.els.prev.hidden=!allowPrevious;
    player.host?.classList.toggle('sp-no-previous',!allowPrevious);
    if(player.els?.total)player.els.total.textContent=String(doc.scenes.length);

    if(typeof player.refreshCurrent==='function'){
      player.refreshCurrent({document:doc,index:target,preserveAudio:true});
    }else{
      // Compatibility fallback for an older cached Core.
      player._clearAutoTimer?.();
      player._resetPresentationRuntime?.();
      player._resetBackgroundRuntime?.();
      player.document=doc;
      player.index=target;
      player.maxVisitedIndex=Math.max(player.maxVisitedIndex,target);
      player.ended=false;
      player._audioRenderMode='restore';
      player._render?.();
    }

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
  let mobileLiveDetailReturnSection='';
  let mobileLiveDetailOpening=false;

  function refreshMobileLiveDetail(section){
    if(desktopLiveActive() || !liveEditEnabled)return false;

    const currentModal=liveEditSheetBody?.querySelector('.desktop-text-detail-modal');
    const currentBody=currentModal?.querySelector('.desktop-text-detail-body');
    if(!currentModal)return false;

    const keepScroll=currentBody?.scrollTop||0;

    // Reset already changed the Scene data. Build the fresh inspector off-screen,
    // then swap only its contents into the visible modal. This avoids destroying
    // the visible scroll container, which caused the one-frame "ビクッ".
    const previousVisibility=currentModal.style.visibility;
    currentModal.style.visibility='visible';

    let selector =
      section==='effect' ? '.desktop-effect-detail-overlay' :
      section==='background' ? '.desktop-background-detail-overlay' :
      section==='audio' ? '.desktop-audio-detail-overlay' :
      '.desktop-text-detail-overlay';

    if(section==='text')openDesktopTextDetail();
    else if(section==='effect')openDesktopEffectDetail();
    else if(section==='background')openDesktopBackgroundDetail();
    else if(section==='audio')openDesktopAudioDetail();

    const freshOverlay=[...document.querySelectorAll(selector)]
      .find(el=>!liveEditSheetBody?.contains(el));
    const freshModal=freshOverlay?.querySelector('.desktop-text-detail-modal');

    if(!freshModal){
      currentModal.style.visibility=previousVisibility;
      return false;
    }

    // Preserve the visible modal node and scrolling body node.
    const freshHead=freshModal.querySelector('.desktop-text-detail-head');
    const freshBody=freshModal.querySelector('.desktop-text-detail-body');
    const freshFoot=freshModal.querySelector('.desktop-text-detail-foot');
    const oldHead=currentModal.querySelector('.desktop-text-detail-head');
    const oldBody=currentModal.querySelector('.desktop-text-detail-body');
    const oldFoot=currentModal.querySelector('.desktop-text-detail-foot');

    if(freshHead && oldHead)oldHead.replaceWith(freshHead);
    if(freshBody && oldBody){
      oldBody.replaceChildren(...freshBody.childNodes);
      oldBody.scrollTop=keepScroll;
    }
    if(freshFoot && oldFoot)oldFoot.replaceWith(freshFoot);

    freshOverlay.remove();

    // Rebind mobile return behavior to the newly swapped header/footer controls.
    let returned=false;
    const returnToCompact=()=>{
      if(returned)return;
      returned=true;
      const sec=section;
      currentModal.remove();
      liveEditSheetBody.replaceChildren();
      liveEditSheet.classList.remove('mobile-live-detail-sheet','live-edit-sheet-audio');
      document.body.classList.remove('mobile-live-detail-open');
      const h=liveEditSheet.querySelector('.live-edit-sheet-head');
      if(h)h.hidden=false;
      renderLiveEditSheet(sec);
    };

    currentModal.querySelector('.desktop-text-detail-close')
      ?.addEventListener('click',returnToCompact,{once:true});
    [...currentModal.querySelectorAll('.desktop-text-detail-foot button')].forEach(btn=>{
      const t=(btn.textContent||'').trim();
      if(t==='閉じる'||t==='キャンセル'||t==='保存'){
        btn.addEventListener('click',()=>requestAnimationFrame(returnToCompact),{once:true});
      }
    });

    currentModal.style.visibility=previousVisibility || 'visible';
    if(currentBody)currentBody.scrollTop=keepScroll;
    return true;
  }

  function openMobileLiveDetail(section){
    if(!liveEditEnabled || !liveEditSheet || !liveEditSheetBody)return;

    mobileLiveDetailReturnSection=section;
    mobileLiveDetailOpening=true;

    const selector = section==='effect' ? '.desktop-effect-detail-overlay' :
      section==='background' ? '.desktop-background-detail-overlay' :
      section==='audio' ? '.desktop-audio-detail-overlay' :
      '.desktop-text-detail-overlay';

    // Generate the shared detail inspector exactly as PC does.
    if(section==='text')openDesktopTextDetail();
    else if(section==='effect')openDesktopEffectDetail();
    else if(section==='background')openDesktopBackgroundDetail();
    else if(section==='audio')openDesktopAudioDetail();

    const overlay=document.querySelector(selector);
    const modal=overlay?.querySelector('.desktop-text-detail-modal');
    if(!overlay || !modal){
      mobileLiveDetailOpening=false;
      console.error('[Live Detail] shared inspector generation failed:',section);
      return;
    }

    // We only need the shared inspector contents. The iPhone's already-working
    // Live Edit sheet becomes the visual host, avoiding a second overlay layer.
    modal.dataset.mobileLiveDetail='true';
    modal.remove();
    overlay.remove();

    liveEditSheet.hidden=false;
    document.body.classList.add('live-edit-sheet-open','mobile-live-detail-open');
    liveEditSheet.classList.add('mobile-live-detail-sheet');

    const head=liveEditSheet.querySelector('.live-edit-sheet-head');
    if(head)head.hidden=true;

    liveEditSheetBody.replaceChildren(modal);

    // PC modal is now inside the mobile sheet, so strip desktop constraints.
    modal.style.setProperty('width','100%','important');
    modal.style.setProperty('max-width','none','important');
    modal.style.setProperty('max-height','none','important');
    modal.style.setProperty('height','100%','important');
    modal.style.setProperty('overflow','auto','important');
    modal.style.setProperty('border','0','important');
    modal.style.setProperty('border-radius','0','important');
    modal.style.setProperty('box-shadow','none','important');

    // Detail close buttons should return to the compact Live Edit sheet.
    let mobileDetailReturned=false;
    const returnToCompact=()=>{
      if(mobileDetailReturned)return;
      mobileDetailReturned=true;

      const sec=mobileLiveDetailReturnSection || section;
      mobileLiveDetailReturnSection='';
      mobileLiveDetailOpening=true;

      modal.remove();
      liveEditSheetBody.replaceChildren();
      liveEditSheet.classList.remove('mobile-live-detail-sheet','live-edit-sheet-audio');
      document.body.classList.remove('mobile-live-detail-open');

      const h=liveEditSheet.querySelector('.live-edit-sheet-head');
      if(h)h.hidden=false;

      mobileLiveDetailOpening=false;
      renderLiveEditSheet(sec);
    };

    modal.querySelector('.desktop-text-detail-close')?.addEventListener('click',returnToCompact,{once:true});

    // Close / Cancel / Save all return to the compact sheet.
    // Reset stays inside the detail view.
    const footerButtons=[...modal.querySelectorAll('.desktop-text-detail-foot button')];
    footerButtons.forEach(btn=>{
      const t=(btn.textContent||'').trim();
      if(t==='閉じる'||t==='キャンセル'||t==='保存'){
        btn.addEventListener('click',()=>requestAnimationFrame(returnToCompact),{once:true});
      }
    });

    mobileLiveDetailOpening=false;
  }

  function restoreMobileLiveDetailSheet(section){
    if(!section||!liveEditEnabled)return;
    requestAnimationFrame(()=>renderLiveEditSheet(section));
  }

  function liveEditAdvanced(section){
    if(liveEditEnabled){
      openMobileLiveDetail(section);
      return;
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
    const b=desktopAction(label,()=>{
      if(desktopLiveActive() && section==='text'){openDesktopTextDetail();return;}
      if(desktopLiveActive() && section==='effect'){openDesktopEffectDetail();return;}
      if(desktopLiveActive() && section==='background'){openDesktopBackgroundDetail();return;}
      if(desktopLiveActive() && section==='audio'){openDesktopAudioDetail();return;}
      liveEditAdvanced(section);
    },'desktop-live-detail');
    return b;
  }
  function desktopDetailRange(label,{min,max,step,value,unit='',format=(v)=>v,oninput}){
    const field=document.createElement('label');field.className='desktop-text-detail-range';
    const head=document.createElement('span');head.className='desktop-text-detail-range-head';
    const name=document.createElement('strong');name.textContent=label;

    const valueWrap=document.createElement('span');valueWrap.className='desktop-text-detail-value';

    // Percent controls whose internal value is 0..1 are shown as 0..100.
    const displayScale=(String(unit).trim()==='%' && Number(max)<=1)?100:1;
    const displayMin=Number(min)*displayScale;
    const displayMax=Number(max)*displayScale;
    const displayStep=Number(step)*displayScale;

    const mobileWheel=window.matchMedia('(max-width:899px)').matches && !desktopLiveActive();
    const numeric=document.createElement(mobileWheel?'select':'input');
    numeric.className='desktop-text-detail-number';
    if(mobileWheel)numeric.classList.add('desktop-mobile-wheel-number');

    const precision=(()=>{
      const raw=String(displayStep);
      if(raw.includes('e-'))return Number(raw.split('e-')[1])||0;
      return raw.includes('.')?raw.split('.')[1].length:0;
    })();
    const clean=(n)=>Number(Number(n).toFixed(Math.min(6,precision+2)));

    if(mobileWheel){
      // Native iOS <select> is intentionally used here:
      // tapping the visible number opens Apple's drum/wheel picker.
      const count=Math.min(2000,Math.floor((displayMax-displayMin)/displayStep+0.5)+1);
      for(let i=0;i<count;i++){
        const shown=clean(displayMin+(displayStep*i));
        if(shown>displayMax+(displayStep/2))break;
        const o=document.createElement('option');
        o.value=String(shown);
        o.textContent=String(shown);
        numeric.appendChild(o);
      }
    }else{
      numeric.type='number';
      numeric.min=String(displayMin);
      numeric.max=String(displayMax);
      numeric.step=String(displayStep);
    }

    const suffix=document.createElement('span');suffix.className='desktop-text-detail-unit';suffix.textContent=unit.trim();

    const slider=document.createElement('input');
    slider.type='range';
    slider.dataset.numberLinked='1';
    slider.min=min;slider.max=max;slider.step=step;slider.value=value;

    const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
    const sliderToNumber=()=>{
      const raw=Number(slider.value);
      const shown=clean(raw*displayScale);
      numeric.value=String(shown);
    };
    const applySlider=()=>{
      sliderToNumber();
      oninput(Number(slider.value));
    };
    const applyNumber=()=>{
      let shown=Number(numeric.value);
      if(!Number.isFinite(shown))shown=Number(slider.value)*displayScale;
      shown=clamp(shown,displayMin,displayMax);
      numeric.value=String(clean(shown));
      slider.value=String(shown/displayScale);
      oninput(Number(slider.value));
    };

    slider.addEventListener('input',applySlider);
    if(mobileWheel){
      numeric.addEventListener('change',applyNumber);
    }else{
      numeric.addEventListener('input',applyNumber);
      numeric.addEventListener('change',applyNumber);
      numeric.addEventListener('blur',applyNumber);
    }

    valueWrap.append(numeric);
    if(unit.trim())valueWrap.append(suffix);
    head.append(name,valueWrap);
    field.append(head,slider);

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
  function liveDetailHost(){
    return desktopLiveActive() && desktopLivePanel ? desktopLivePanel : document.body;
  }
  function liveDetailQuery(selector){
    return document.querySelector(selector);
  }

  function closeDesktopTextDetail(){
    const el=liveDetailQuery('.desktop-text-detail-overlay');
    const shouldRestore=el?.dataset.mobileLiveDetail==='true' && !mobileLiveDetailOpening;
    el?.remove();
    if(shouldRestore){const section=mobileLiveDetailReturnSection;mobileLiveDetailReturnSection='';restoreMobileLiveDetailSheet(section);}
  }

  function closeDesktopEffectDetail(){
    const el=liveDetailQuery('.desktop-effect-detail-overlay');
    const shouldRestore=el?.dataset.mobileLiveDetail==='true' && !mobileLiveDetailOpening;
    el?.remove();
    if(shouldRestore){const section=mobileLiveDetailReturnSection;mobileLiveDetailReturnSection='';restoreMobileLiveDetailSheet(section);}
  }

  function closeDesktopBackgroundDetail(){
    const el=liveDetailQuery('.desktop-background-detail-overlay');
    const shouldRestore=el?.dataset.mobileLiveDetail==='true' && !mobileLiveDetailOpening;
    el?.remove();
    if(shouldRestore){const section=mobileLiveDetailReturnSection;mobileLiveDetailReturnSection='';restoreMobileLiveDetailSheet(section);}
  }

  function closeDesktopAudioDetail(){
    const el=liveDetailQuery('.desktop-audio-detail-overlay');
    const shouldRestore=el?.dataset.mobileLiveDetail==='true' && !mobileLiveDetailOpening;
    el?.remove();
    if(shouldRestore){const section=mobileLiveDetailReturnSection;mobileLiveDetailReturnSection='';restoreMobileLiveDetailSheet(section);}
  }

  function currentDesktopDetailKind(){
    if(!desktopLivePanel)return '';
    if(desktopLivePanel.querySelector('.desktop-audio-detail-overlay'))return 'audio';
    if(desktopLivePanel.querySelector('.desktop-background-detail-overlay'))return 'background';
    if(desktopLivePanel.querySelector('.desktop-effect-detail-overlay'))return 'effect';
    if(desktopLivePanel.querySelector('.desktop-text-detail-overlay'))return 'text';
    return '';
  }

  function reopenDesktopDetailForCurrentScene(kind){
    if(!kind||!desktopLiveActive())return;
    // Scene navigation is not "cancel": keep edits already made to the
    // previous Scene and simply retarget the open inspector to the new Scene.
    closeDesktopAudioDetail();
    closeDesktopBackgroundDetail();
    closeDesktopEffectDetail();
    closeDesktopTextDetail();
    if(kind==='audio')openDesktopAudioDetail();
    else if(kind==='background')openDesktopBackgroundDetail();
    else if(kind==='effect')openDesktopEffectDetail();
    else if(kind==='text')openDesktopTextDetail();
  }
  

  function ensureDesktopEffectVisibleDefaults(scene,{save=true}={}){
    if(!scene)return false;
    const p=ensurePresentation(scene);
    let changed=false;

    p.effectTiming ||= {};
    if(!Number.isFinite(Number(p.effectTiming.duration)) || Number(p.effectTiming.duration)<=0){
      p.effectTiming.duration=0.8;
      changed=true;
    }
    if(!Number.isFinite(Number(p.effectTiming.delay))){
      p.effectTiming.delay=0;
      changed=true;
    }

    if(p.disappear){
      if(!Number.isFinite(Number(p.disappear.fade)) || Number(p.disappear.fade)<=0){
        p.disappear.fade=700;
        changed=true;
      }
      if(!p.disappear.motion){
        p.disappear.motion='stay';
        changed=true;
      }
    }

    if(p.typing?.enabled){
      if(!Number.isFinite(Number(p.typing.speed)) || Number(p.typing.speed)<=0){
        p.typing.speed=55;
        changed=true;
      }
      if(typeof p.typing.cursor!=='boolean'){
        p.typing.cursor=true;
        changed=true;
      }
    }

    if(changed && save)scheduleDraftSave(40);
    return changed;
  }

  function replayCurrentDesktopEffect(){
    if(!player||!workingDocument?.scenes?.length)return;
    const scene=workingDocument.scenes[player.index];
    if(!scene)return;
    ensureDesktopEffectVisibleDefaults(scene);

    // PlayerCore.refreshCurrent() performs a fresh real-Player render, so the
    // selected entrance/position/view change is visible immediately. No second
    // manual animation trigger is needed (and avoiding it prevents double-play).
    refreshLivePlayer({preserveSheet:false});
  }

function openDesktopEffectDetail(){
    if(!liveEditEnabled && advancedScreen?.hidden)return;
    closeDesktopEffectDetail();
    const {scene,index}=liveEditScene();if(!scene)return;
    ensureDesktopEffectVisibleDefaults(scene);
    const p=ensurePresentation(scene);
    const before={
      effect:p.effect,
      display:p.display,
      view:p.view,
      entryMotion:p.entryMotion,
      typing:clone(p.typing||null),
      effectTiming:clone(p.effectTiming||null),
      disappear:clone(p.disappear||null)
    };
    let committed=false;
    const apply=()=>{scheduleDraftSave(40);replayCurrentDesktopEffect();};
    const restore=()=>{
      if(before.effect===undefined)delete p.effect;else p.effect=before.effect;
      if(before.display===undefined)delete p.display;else p.display=before.display;
      if(before.view===undefined)delete p.view;else p.view=before.view;
      if(before.entryMotion===undefined)delete p.entryMotion;else p.entryMotion=before.entryMotion;
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
      ensureDesktopEffectVisibleDefaults(scene,{save:false});
      if(v==='typewriter'){
        p.effect='none';
        p.typing={...(p.typing||{}),enabled:true,speed:Number(p.typing?.speed)||55,cursor:p.typing?.cursor!==false};
      }else{
        delete p.typing;p.effect=v;
      }
      apply();closeDesktopEffectDetail();openDesktopEffectDetail();
    });
    basicGrid.append(
      effectSelect,
      desktopDetailSelect('表示',[['stack','前の文章を残す'],['solo','この文章だけ']],p.display||'stack',v=>{p.display=v;apply();}),
      desktopDetailSelect('表示モード',[['world','通常'],['console','コンソール'],['system','システム'],['warning','警告'],['void','虚無']],p.view||'world',v=>{p.view=v;apply();}),
      desktopDetailSelect('位置の動き',[['flow','流れて着地'],['still','その場']],p.entryMotion||'flow',v=>{p.entryMotion=v;apply();})
    );

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

    if(advancedScreen?.hidden){
      const preview=section('プレビュー');
      const note=document.createElement('p');
      note.className='desktop-text-detail-note';
      note.textContent='変更はLive Previewへ即時反映され、自動保存されます。';
      preview.appendChild(note);
    }

    const foot=document.createElement('footer');foot.className='desktop-text-detail-foot';
    const reset=document.createElement('button');reset.type='button';reset.className='desktop-text-detail-reset';reset.textContent=desktopLiveActive()?'リセット':'演出設定を初期化';
    const spacer=document.createElement('span');const cancel=document.createElement('button');cancel.type='button';cancel.textContent='キャンセル';const save=document.createElement('button');save.type='button';save.className='is-primary';save.textContent='保存';foot.append(reset,spacer,cancel,save);
    modal.append(head,body,foot);overlay.appendChild(modal);liveDetailHost().appendChild(overlay);
    const closeOnly=()=>{closeDesktopEffectDetail();};
    x.addEventListener('click',closeOnly);cancel.addEventListener('click',closeOnly);overlay.addEventListener('click',e=>{if(e.target===overlay)closeOnly();});
    save.addEventListener('click',async()=>{committed=true;await saveDraftNow();closeDesktopEffectDetail();renderDesktopLivePanel();});
    reset.addEventListener('click',()=>{
      delete p.effectTiming;
      delete p.disappear;
      delete p.typing;
      p.effect='auto';
      p.display='stack';
      p.view='world';
      p.entryMotion='flow';
      scheduleDraftSave(40);
      refreshLivePlayer({preserveSheet:false});
      if(refreshMobileLiveDetail('effect'))return;
      closeDesktopEffectDetail();
      openDesktopEffectDetail();
    });
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
      if(refreshMobileLiveDetail('effect'))return;
    });
    numeric.addEventListener('blur',()=>{
      const n=normalize(numeric.value);
      numeric.value=String(n);
      range.value=String(n);
    });
  });
}



function openDesktopAudioDetail(){
    if(!liveEditEnabled && advancedScreen?.hidden)return;
    closeDesktopAudioDetail();

    const {scene,index}=liveEditScene();
    if(!scene)return;

    const p=ensurePresentation(scene);

    // v1 accidentally stored the PC audio inspector model in presentation.audio.
    // Migrate that temporary model into the actual Scene Format audio commands.
    const legacyModel=p.audio && typeof p.audio==='object' ? clone(p.audio) : null;

    const commandFor=(kind)=>{
      if(kind==='bgm')return managedAudio(scene,'bgm');
      if(kind==='ambient')return managedAudio(scene,'ambient');
      return managedAudio(scene,'oneshot');
    };

    // Resolve the persistent BGM / Ambient state immediately before this Scene.
    // This lets a "volume only" Scene start from the volume the author is
    // actually hearing instead of a misleading 100% editor default.
    const inheritedPersistentState=(kind)=>{
      if(!(kind==='bgm'||kind==='ambient'))return null;
      let state=null;
      for(let i=0;i<index;i+=1){
        const commands=workingDocument.scenes?.[i]?.audio;
        if(!Array.isArray(commands))continue;
        for(const cmd of commands){
          if(cmd?.channel!==kind)continue;
          if(cmd.action==='start'||cmd.action==='play'){
            if(!cmd.src)continue;
            state={
              src:cmd.src,
              volume:Number.isFinite(Number(cmd.volume))?Math.max(0,Math.min(1,Number(cmd.volume))):1,
              loop:cmd.loop!==false,
              _editorFileName:cmd._editorFileName||''
            };
          }else if(cmd.action==='stop'){
            state=null;
          }else if(cmd.action==='volume'&&state){
            const next=Number(cmd.volume);
            if(Number.isFinite(next))state.volume=Math.max(0,Math.min(1,next));
          }
        }
      }
      return state;
    };

    const makeTrack=(kind)=>{
      const channel=kind==='se'?'oneshot':kind;
      const cmd=commandFor(kind);
      const legacy=legacyModel?.[kind]||null;

      if(cmd){
        const inherited=(kind==='bgm'||kind==='ambient') ? inheritedPersistentState(kind) : null;
        const usesOwnVolume=cmd.action==='start'||cmd.action==='play'||cmd.action==='volume';
        return {
          action: kind==='se'
            ? ((cmd.action==='play'||cmd.action==='start')?'play':'none')
            : (cmd.action||'continue'),
          src:cmd.src||'',
          // START/VOLUME/SE show the value authored by this Scene. STOP has no
          // volume field, so show the level that is actually sounding when the
          // Scene is entered instead of falling back to a misleading 100%.
          volume:usesOwnVolume && Number.isFinite(Number(cmd.volume))
            ? Number(cmd.volume)
            : (inherited?.volume ?? 1),
          fadeIn:Number(cmd.fadeIn)||0,
          fadeOut:Number(cmd.fadeOut)||0,
          fade:Number(cmd.fade)||0,
          loop:cmd.action==='start' ? cmd.loop!==false : inherited?.loop!==false,
          delay:Number(cmd.delay)||0,
          repeat:Number(cmd.repeat ?? cmd.count)||1,
          _editorFileName:cmd._editorFileName||''
        };
      }

      if(legacy){
        return {
          action:legacy.action||(kind==='se'?'none':'continue'),
          src:legacy.src||'',
          volume:Number.isFinite(Number(legacy.volume))?Number(legacy.volume):1,
          fadeIn:Number(legacy.fadeIn)||0,
          fadeOut:Number(legacy.fadeOut)||0,
          fade:Number(legacy.fade)||0,
          loop:legacy.loop!==false,
          delay:Number(legacy.delay)||0,
          repeat:Number(legacy.repeat)||1,
          _editorFileName:legacy._editorFileName||''
        };
      }

      const inherited=inheritedPersistentState(kind);
      return {
        action:kind==='se'?'none':'continue',
        src:'',
        volume:kind==='se'?1:(inherited?.volume ?? 1),
        fadeIn:0,
        fadeOut:0,
        fade:0,
        loop:inherited?.loop!==false,
        delay:0,
        repeat:1,
        _editorFileName:'',
        _inheritedSrc:inherited?.src||'',
        _inheritedFileName:inherited?._editorFileName||''
      };
    };

    const audioModel={
      bgm:makeTrack('bgm'),
      ambient:makeTrack('ambient'),
      se:makeTrack('se')
    };

    const commitTrack=(kind)=>{
      const track=audioModel[kind];

      if(kind==='se'){
        if(track.action!=='play' || !track.src){
          setManagedAudio(scene,'oneshot',null);
          return;
        }
        setManagedAudio(scene,'oneshot',{
          channel:'oneshot',
          role:'se',
          action:'play',
          src:track.src,
          volume:Math.max(0,Math.min(1,Number(track.volume)||0)),
          fadeIn:Math.max(0,Number(track.fadeIn)||0),
          delay:Math.max(0,Number(track.delay)||0),
          repeat:Math.max(1,Math.round(Number(track.repeat)||1)),
          _editorFileName:track._editorFileName||''
        });
        return;
      }

      const channel=kind;
      if(track.action==='continue'){
        setManagedAudio(scene,channel,null);
        return;
      }
      if(track.action==='stop'){
        setManagedAudio(scene,channel,{
          channel,
          action:'stop',
          fadeOut:Math.max(0,Number(track.fadeOut)||0)
        });
        return;
      }
      if(track.action==='volume'){
        setManagedAudio(scene,channel,{
          channel,
          action:'volume',
          volume:Math.max(0,Math.min(1,Number(track.volume)||0)),
          fade:Math.max(0,Number(track.fade)||0)
        });
        return;
      }

      if(track.action==='start' && track.src){
        setManagedAudio(scene,channel,{
          channel,
          action:'start',
          src:track.src,
          volume:Math.max(0,Math.min(1,Number(track.volume)||0)),
          fadeIn:Math.max(0,Number(track.fadeIn)||0),
          fadeOut:Math.max(0,Number(track.fadeOut)||0),
          loop:track.loop!==false,
          restart:true,
          _editorFileName:track._editorFileName||''
        });
      }else{
        setManagedAudio(scene,channel,null);
      }
    };

    const commitAll=()=>{
      commitTrack('bgm');
      commitTrack('ambient');
      commitTrack('se');
      // presentation.audio was only a broken v1 editor cache.
      delete p.audio;

      // Live Audio Detail edits the Scene model directly, while the legacy
      // Advanced fields still exist behind the Live Studio. Draft saving can
      // sync those fields back into the Scene, so keep them in lockstep here
      // to prevent a stale value (for example 100%) from overwriting a newly
      // edited value (for example 10%).
      loadMediaFields(scene);
    };

    const applyLiveAudioVolume=(kind,value)=>{
      if(!player)return;
      const target=Math.max(0,Math.min(1,Number(value)||0));
      try{
        player.unlockAudio?.(true);
        if(kind==='bgm' || kind==='ambient'){
          const audio=player.audioEls?.[kind];
          if(audio){
            player._setAudioVolume?.(audio,target);
            if(player.audioState?.[kind])player.audioState[kind].volume=target;
          }
          return;
        }
        // If a TEST one-shot is still playing, let its slider follow live too.
        if(kind==='se' && player.oneshots){
          player.oneshots.forEach(audio=>player._setAudioVolume?.(audio,target));
        }
      }catch(_){}
    };

    const refreshAudioPreview=(kind,{playOneShot=false,startPersistent=false,replayPersistentStart=false,liveVolume=null}={})=>{
      commitAll();
      scheduleDraftSave(40);

      // The author is actively operating an audio control. Arm the Preview
      // transport so desktop Live Edit can actually produce sound.
      try{player?.unlockAudio?.(true);}catch(_){}

      // Volume is a mixer operation: do not rebuild the Player just to hear it.
      // Apply the gain directly to the transport that is already sounding.
      if(liveVolume!=null){
        applyLiveAudioVolume(kind,liveVolume);
        renderDesktopLivePanel();
        return;
      }

      // Explicit audition of a persistent START event must replay the authored
      // start transition (including fadeIn). Live Preview scene reconstruction
      // intentionally suppresses fadeIn so navigation stays fast, but that made
      // it impossible to judge a 5s/10s fade from the Audio Detail UI.
      if(replayPersistentStart && (kind==='bgm'||kind==='ambient')){
        const cmd=managedAudio(scene,kind);
        if(cmd?.action==='start' && cmd.src){
          try{
            player?.unlockAudio?.(true);
            // restart:true seeks to startAt and reconstruct=false preserves the
            // real fadeIn semantics used by the public Player.
            player?._applyAudioCommand?.({...cmd,restart:true},false);
          }catch(_){}
          renderDesktopLivePanel();
          return;
        }
      }

      refreshLivePlayer({preserveSheet:false});
      renderDesktopLivePanel();

      // Selecting/starting a persistent source needs an explicit authoring
      // transport start because refreshCurrent(preserveAudio) intentionally
      // leaves existing audio untouched. restart:false avoids seeking when the
      // same source is already sounding.
      if(startPersistent && (kind==='bgm'||kind==='ambient')){
        requestAnimationFrame(()=>{
          try{
            player?.unlockAudio?.(true);
            const cmd=managedAudio(scene,kind);
            if(cmd?.action==='start' && cmd.src)player?._applyAudioCommand?.({...cmd,restart:false},false);
          }catch(_){}
        });
      }

      // Restore-mode rendering deliberately never fires SE events. For the
      // editor's explicit audition path, play the current one-shot directly.
      if((kind==='se' || playOneShot) && audioModel.se.action==='play' && audioModel.se.src){
        requestAnimationFrame(()=>{
          try{
            player?.unlockAudio?.(true);
            const cmd=managedAudio(scene,'oneshot');
            if(cmd)player?._applyAudioCommand?.(cmd,false);
          }catch(_){}
        });
      }
    };

    // If the broken v1 model existed, migrate it immediately.
    if(legacyModel){
      commitAll();
      scheduleDraftSave(40);
    }

    const overlay=document.createElement('div');
    overlay.className='desktop-text-detail-overlay desktop-audio-detail-overlay';
    const modal=document.createElement('section');
    modal.className='desktop-text-detail-modal desktop-audio-detail-modal';

    const head=document.createElement('header');
    head.className='desktop-text-detail-head';
    const titleWrap=document.createElement('div');
    const kicker=document.createElement('small');kicker.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    const title=document.createElement('h2');title.textContent='音の詳細設定';
    titleWrap.append(kicker,title);
    const x=document.createElement('button');x.type='button';x.className='desktop-text-detail-close';x.textContent='×';
    head.append(titleWrap,x);

    const body=document.createElement('div');
    body.className='desktop-text-detail-body desktop-audio-detail-body';

    const tabs=document.createElement('div');
    tabs.className='desktop-audio-detail-tabs';
    const content=document.createElement('div');
    content.className='desktop-audio-detail-content';
    let activeKind='bgm';

    const tabDefs=[
      ['bgm','BGM','続いていた時間'],
      ['ambient','Ambient','その時そこにあった音'],
      ['se','SE','その時起きた音']
    ];

    const renderTrack=()=>{
      content.replaceChildren();
      tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('is-active',b.dataset.kind===activeKind));

      const track=audioModel[activeKind];
      const kind=activeKind;

      const intro=document.createElement('section');
      intro.className='desktop-text-detail-section desktop-audio-intro';
      const h=document.createElement('h3');
      const def=tabDefs.find(v=>v[0]===kind);
      h.textContent=def[1];
      const note=document.createElement('p');
      note.className='desktop-text-detail-note';
      note.textContent=def[2];
      intro.append(h,note);
      content.appendChild(intro);

      const controlSec=document.createElement('section');
      controlSec.className='desktop-text-detail-section';
      const ch=document.createElement('h3');ch.textContent='再生';
      controlSec.appendChild(ch);
      const controlGrid=document.createElement('div');controlGrid.className='desktop-text-detail-two';
      controlSec.appendChild(controlGrid);

      const actionValues = kind==='se'
        ? [['none','なし'],['play','このSceneで鳴らす']]
        : [['continue','前Sceneを継続'],['start','このSceneで開始'],['volume','このSceneで音量変更'],['stop','このSceneで停止']];

      controlGrid.append(
        desktopDetailSelect('動作',actionValues,track.action,v=>{
          if(v==='volume'&&track.action!=='volume'){
            const inherited=inheritedPersistentState(kind);
            if(inherited)track.volume=inherited.volume;
          }
          track.action=v;
          refreshAudioPreview(kind,{playOneShot:kind==='se'&&v==='play',startPersistent:kind!=='se'&&v==='start'});
          renderTrack();
        })
      );

      const asset=document.createElement('div');
      asset.className='desktop-audio-detail-asset';
      const assetText=document.createElement('div');
      assetText.className='desktop-audio-detail-file';
      const inherited=inheritedPersistentState(kind);
      if(kind!=='se'&&(track.action==='continue'||track.action==='volume')){
        const inheritedName=inherited?._editorFileName||inherited?.src||'現在BGM / Ambientなし';
        assetText.innerHTML=`<strong>${track.action==='volume'?'前Sceneの音を音量変更':'前Sceneを継続'}</strong><span>${inheritedName}</span>`;
        asset.append(assetText);
      }else{
        assetText.innerHTML=`<strong>${track.src?'選択中':'音源未選択'}</strong><span>${track._editorFileName||track.src||'ファイルを選択してください'}</span>`;
        const assetBtns=document.createElement('div');
        assetBtns.className='desktop-audio-detail-file-actions';
        assetBtns.append(
          desktopAction(track.src?'音源を変更':'ファイルを選択',()=>{
            desktopPickFile((!desktopLiveActive() ? '' : 'audio/*'),(url,name)=>{
              track.src=url;
              track._editorFileName=name;
              if(kind==='se')track.action='play';
              else track.action='start';
              refreshAudioPreview(kind,{playOneShot:kind==='se',startPersistent:kind!=='se'});
              renderTrack();
            });
          },'is-primary'),
          desktopAction('音源を外す',()=>{
            track.src='';
            track._editorFileName='';
            track.action=kind==='se'?'none':'continue';
            refreshAudioPreview(kind);
            renderTrack();
          })
        );
        asset.append(assetText,assetBtns);
      }
      controlSec.appendChild(asset);
      content.appendChild(controlSec);

      const levelSec=document.createElement('section');
      levelSec.className='desktop-text-detail-section';
      const lh=document.createElement('h3');lh.textContent='音量・フェード';
      levelSec.appendChild(lh);
      const levelGrid=document.createElement('div');levelGrid.className='desktop-text-detail-two';
      levelSec.appendChild(levelGrid);

      if(kind!=='se'&&track.action==='volume'){
        levelGrid.append(
          desktopDetailRange('このSceneからの音量',{
            min:0,max:1,step:.01,value:Number(track.volume),
            unit:' %',format:v=>Math.round(v*100),
            oninput:v=>{track.volume=v;refreshAudioPreview(kind,{liveVolume:v});}
          }),
          desktopDetailRange('音量変化時間',{
            min:0,max:10,step:.1,value:(Number(track.fade)||0)/1000,
            unit:' 秒',format:v=>v.toFixed(1),
            oninput:v=>{track.fade=Math.round(v*1000);refreshAudioPreview(kind);}
          })
        );
      }else{
        levelGrid.append(
          desktopDetailRange('音量',{
            min:0,max:1,step:.01,value:Number(track.volume),
            unit:' %',format:v=>Math.round(v*100),
            oninput:v=>{track.volume=v;refreshAudioPreview(kind,{liveVolume:v});}
          }),
          desktopDetailRange('フェードイン',{
            min:0,max:10,step:.1,value:(Number(track.fadeIn)||0)/1000,
            unit:' 秒',format:v=>v.toFixed(1),
            oninput:v=>{track.fadeIn=Math.round(v*1000);refreshAudioPreview(kind);}
          }),
          desktopDetailRange('フェードアウト',{
            min:0,max:10,step:.1,value:(Number(track.fadeOut)||0)/1000,
            unit:' 秒',format:v=>v.toFixed(1),
            oninput:v=>{track.fadeOut=Math.round(v*1000);refreshAudioPreview(kind);}
          })
        );
      }

      if(kind!=='se'&&track.action!=='volume'){
        levelGrid.append(
          desktopDetailSelect('ループ',[['on','ON'],['off','OFF']],track.loop===false?'off':'on',v=>{
            track.loop=v!=='off';
            refreshAudioPreview(kind);
          })
        );
      }else if(kind==='se'){
        levelGrid.append(
          desktopDetailRange('再生遅延',{
            min:0,max:10,step:.1,value:(Number(track.delay)||0)/1000,
            unit:' 秒',format:v=>v.toFixed(1),
            oninput:v=>{track.delay=Math.round(v*1000);commitAll();scheduleDraftSave(40);}
          }),
          desktopDetailRange('再生回数',{
            min:1,max:10,step:1,value:Number(track.repeat)||1,
            unit:' 回',format:v=>Math.round(v),
            oninput:v=>{track.repeat=Math.round(v);commitAll();scheduleDraftSave(40);}
          })
        );
      }
      content.appendChild(levelSec);

      const previewSec=document.createElement('section');
      previewSec.className='desktop-text-detail-section';
      const ph=document.createElement('h3');ph.textContent='プレビュー';
      const pn=document.createElement('p');pn.className='desktop-text-detail-note';
      pn.textContent=desktopLiveActive()
        ? '再生中の音は、音量スライダーを動かすとその場で変わります。変更は自動保存され、Sceneを移動して戻っても保持されます。'
        : '変更は自動保存されます。閉じるとLive Editorでそのまま確認できます。';
      previewSec.append(ph,pn);

      if(desktopLiveActive()){
        const audition=document.createElement('button');
        audition.type='button';
        audition.className='desktop-effect-replay';
        audition.textContent='♪ このSceneの音を確認';
        audition.addEventListener('click',()=>{
          try{player?.unlockAudio?.(true);}catch(_){}
          refreshAudioPreview(kind,{
            playOneShot:kind==='se',
            replayPersistentStart:kind!=='se'
          });
        });
        previewSec.appendChild(audition);
      }
      content.appendChild(previewSec);
    };

    tabDefs.forEach(([kind,label])=>{
      const b=document.createElement('button');
      b.type='button';b.dataset.kind=kind;b.textContent=label;
      b.addEventListener('click',()=>{activeKind=kind;renderTrack();});
      tabs.appendChild(b);
    });

    body.append(tabs,content);

    const foot=document.createElement('footer');
    foot.className='desktop-text-detail-foot';
    const reset=document.createElement('button');reset.type='button';reset.className='desktop-text-detail-reset';reset.textContent=desktopLiveActive()?'リセット':'演出設定を初期化';
    const spacer=document.createElement('span');
    const close=document.createElement('button');close.type='button';close.textContent='閉じる';
    const save=document.createElement('button');save.type='button';save.className='is-primary';save.textContent='保存';
    foot.append(reset,spacer,close,save);

    modal.append(head,body,foot);
    overlay.appendChild(modal);
    liveDetailHost().appendChild(overlay);

    const closeOnly=()=>{
      commitAll();
      closeDesktopAudioDetail();
    };
    x.addEventListener('click',closeOnly);
    close.addEventListener('click',closeOnly);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeOnly();});
    save.addEventListener('click',async()=>{
      commitAll();
      await saveDraftNow();
      closeDesktopAudioDetail();
      renderDesktopLivePanel();
    });
    reset.addEventListener('click',()=>{
      // Reset only the adjustable parameters of the currently open channel.
      // Source and playback action are intentionally preserved; removing an
      // audio source belongs exclusively to the explicit "音源を外す" action.
      const track=audioModel[activeKind];
      track.volume=1;
      track.fadeIn=0;
      track.fadeOut=0;
      track.fade=0;
      track.loop=true;
      if(activeKind==='se'){
        track.delay=0;
        track.repeat=1;
      }
      refreshAudioPreview(activeKind,{playOneShot:false});
      if(refreshMobileLiveDetail('audio'))return;
      renderTrack();
    });

    renderTrack();
  }

function openDesktopBackgroundDetail(){
    if(!liveEditEnabled && advancedScreen?.hidden)return;
    closeDesktopBackgroundDetail();

    const {scene,index}=liveEditScene();
    if(!scene)return;
    const p=ensurePresentation(scene);

    const apply=()=>{
      scheduleDraftSave(40);
      refreshLivePlayer({preserveSheet:false});
      renderDesktopLivePanel();
    };

    const explicit=()=>p.background && typeof p.background==='object' ? p.background : null;
    const ensureImageState=()=>{
      if(!p.background || typeof p.background!=='object' || p.background.src===''){
        p.background={
          src:p.background?.src||'',
          transition:p.background?.transition||'fade',
          transitionDuration:Number(p.background?.transitionDuration)||700,
          fit:p.background?.fit||'cover',
          position:p.background?.position||'center center',
          tone:p.background?.tone||'dark',
          dim:Number.isFinite(Number(p.background?.dim))?Number(p.background.dim):.38,
          blur:Number(p.background?.blur)||0,
          motion:p.background?.motion||{type:'none'},
          textures:p.background?.textures||{},
          _editorManaged:true
        };
      }
      return p.background;
    };

    const overlay=document.createElement('div');
    overlay.className='desktop-text-detail-overlay desktop-background-detail-overlay';

    const modal=document.createElement('section');
    modal.className='desktop-text-detail-modal desktop-background-detail-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');

    const head=document.createElement('header');
    head.className='desktop-text-detail-head';
    const titleWrap=document.createElement('div');
    const kicker=document.createElement('small');
    kicker.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    const title=document.createElement('h2');
    title.textContent='背景の詳細設定';
    titleWrap.append(kicker,title);
    const x=document.createElement('button');
    x.type='button';x.className='desktop-text-detail-close';x.textContent='×';
    head.append(titleWrap,x);

    const body=document.createElement('div');
    body.className='desktop-text-detail-body';

    const section=(name)=>{
      const s=document.createElement('section');
      s.className='desktop-text-detail-section';
      const h=document.createElement('h3');h.textContent=name;
      s.appendChild(h);body.appendChild(s);return s;
    };
    const two=(parent)=>{
      const g=document.createElement('div');
      g.className='desktop-text-detail-two';
      parent.appendChild(g);return g;
    };

    // SOURCE --------------------------------------------------------------
    const sourceSec=section('背景');
    const sourceGrid=two(sourceSec);
    const mode=!p.background?'inherit':(p.background.src===''?'clear':'image');
    sourceGrid.append(
      desktopDetailSelect('このSceneの背景',[
        ['inherit','前Sceneから継続'],
        ['image','画像を使う'],
        ['clear','背景なし']
      ],mode,v=>{
        if(v==='inherit'){
          delete p.background;
          apply();
          closeDesktopBackgroundDetail();
          openDesktopBackgroundDetail();
          return;
        }
        if(v==='clear'){
          p.background={src:'',transition:'fade',_editorManaged:true};
          apply();
          closeDesktopBackgroundDetail();
          openDesktopBackgroundDetail();
          return;
        }
        ensureImageState();
        apply();
      })
    );

    const assetRow=document.createElement('div');
    assetRow.className='desktop-background-detail-asset';
    const thumb=document.createElement('div');
    thumb.className='desktop-background-detail-thumb';
    if(explicit()?.src){
      thumb.style.backgroundImage=`url("${explicit().src}")`;
      thumb.classList.add('has-image');
    }else{
      thumb.textContent=mode==='inherit'?'前Sceneを継続':mode==='clear'?'背景なし':'画像未選択';
    }
    const assetActions=document.createElement('div');
    assetActions.className='desktop-background-detail-asset-actions';
    const choose=desktopAction(explicit()?.src?'画像を変更':'画像を選択',()=>{
      desktopPickFile('image/*',(url,name)=>{
        const bg=ensureImageState();
        bg.src=url;bg._editorFileName=name;bg._editorManaged=true;
        if(!bg.transition)bg.transition='fade';
        apply();
        closeDesktopBackgroundDetail();
        openDesktopBackgroundDetail();
      });
    },'is-primary');
    const clear=desktopAction('画像を外す',()=>{
      p.background={src:'',transition:'fade',_editorManaged:true};
      apply();closeDesktopBackgroundDetail();openDesktopBackgroundDetail();
    });
    assetActions.append(choose,clear);
    assetRow.append(thumb,assetActions);
    sourceSec.appendChild(assetRow);

    // LIGHT ---------------------------------------------------------------
    const lightSec=section('明るさ・質感');
    const lightGrid=two(lightSec);
    const bg0=explicit()||{};
    lightGrid.append(
      desktopDetailSelect('ベール',[
        ['dark','暗く'],
        ['light','明るく']
      ],bg0.tone==='light'?'light':'dark',v=>{
        const bg=ensureImageState();bg.tone=v;
        if(!Number.isFinite(Number(bg.dim)))bg.dim=v==='light'?.64:.38;
        apply();
      }),
      desktopDetailRange('ベール強度',{
        min:0,max:1,step:.02,
        value:Number.isFinite(Number(bg0.dim))?Number(bg0.dim):(bg0.tone==='light'?.64:.38),
        unit:' %',
        format:v=>Math.round(v*100),
        oninput:v=>{const bg=ensureImageState();bg.dim=v;apply();}
      }),
      desktopDetailRange('背景ぼかし',{
        min:0,max:24,step:.5,value:Number(bg0.blur)||0,unit:' px',
        format:v=>v.toFixed(1),
        oninput:v=>{const bg=ensureImageState();if(v<=0)delete bg.blur;else bg.blur=v;apply();}
      }),
      desktopDetailRange('ビネット',{
        min:0,max:1,step:.05,value:Number(bg0.textures?.vignette)||0,unit:' %',
        format:v=>Math.round(v*100),
        oninput:v=>{
          const bg=ensureImageState();bg.textures={...(bg.textures||{})};
          if(v<=0)delete bg.textures.vignette;else bg.textures.vignette=v;apply();
        }
      }),
      desktopDetailRange('粒子',{
        min:0,max:1,step:.05,value:Number(bg0.textures?.grain)||0,unit:' %',
        format:v=>Math.round(v*100),
        oninput:v=>{
          const bg=ensureImageState();bg.textures={...(bg.textures||{})};
          if(v<=0)delete bg.textures.grain;else bg.textures.grain=v;apply();
        }
      }),
      desktopDetailRange('モノクロ',{
        min:0,max:1,step:.05,value:Number(bg0.textures?.monochrome)||0,unit:' %',
        format:v=>Math.round(v*100),
        oninput:v=>{
          const bg=ensureImageState();bg.textures={...(bg.textures||{})};
          if(v<=0)delete bg.textures.monochrome;else bg.textures.monochrome=v;apply();
        }
      })
    );

    // POSITION ------------------------------------------------------------
    const positionSec=section('表示位置');
    const positionGrid=two(positionSec);
    positionGrid.append(
      desktopDetailSelect('位置',[
        ['left top','左上'],['center top','上'],['right top','右上'],
        ['left center','左'],['center center','中央'],['right center','右'],
        ['left bottom','左下'],['center bottom','下'],['right bottom','右下']
      ],bg0.position||'center center',v=>{const bg=ensureImageState();bg.position=v;apply();}),
      desktopDetailSelect('背景サイズ',[
        ['cover','画面いっぱい（cover）'],
        ['contain','画像全体（contain）']
      ],bg0.fit||'cover',v=>{const bg=ensureImageState();bg.fit=v;apply();})
    );

    // TRANSITION ----------------------------------------------------------
    const transSec=section('Scene切替');
    const transGrid=two(transSec);
    transGrid.append(
      desktopDetailSelect('切替演出',[
        ['fade','フェード'],['cut','カット'],['flash','フラッシュ'],['glitch','グリッチ']
      ],bg0.transition||'fade',v=>{const bg=ensureImageState();bg.transition=v;apply();}),
      desktopDetailRange('切替時間',{
        min:0,max:3,step:.05,
        value:(Number(bg0.transitionDuration)||700)/1000,
        unit:' 秒',format:v=>v.toFixed(2),
        oninput:v=>{const bg=ensureImageState();bg.transitionDuration=Math.round(v*1000);apply();}
      })
    );

    // MOTION --------------------------------------------------------------
    const motionSec=section('背景の動き');
    const motionBase=bg0.motion||{type:'none'};

    const motionTypeField=desktopDetailSelect('動き',[
      ['none','なし'],['slowZoom','ゆっくりズーム'],['breath','呼吸'],
      ['panLeft','左へパン'],['panRight','右へパン'],['panUp','上へパン'],['panDown','下へパン']
    ],motionBase.type||'none',()=>{});
    motionSec.appendChild(motionTypeField);

    const motionDynamic=document.createElement('div');
    motionDynamic.className='desktop-background-motion-dynamic';
    motionSec.appendChild(motionDynamic);

    const renderMotionControls=()=>{
      motionDynamic.replaceChildren();

      const bg=ensureImageState();
      const motion=bg.motion||{type:'none'};
      const motionType=motion.type||'none';

      if(motionType==='none'){
        const note=document.createElement('p');
        note.className='desktop-text-detail-note';
        note.textContent='「動き」を選ぶと時間・倍率・移動量を細かく設定できます。';
        motionDynamic.appendChild(note);
        return;
      }

      const timingGrid=two(motionDynamic);
      timingGrid.append(
        desktopDetailRange('動きの時間',{
          min:.5,max:30,step:.25,
          value:(Number(motion.duration)||6500)/1000,
          unit:' 秒',format:v=>v.toFixed(2),
          oninput:v=>{
            const next=ensureImageState();
            next.motion={...(next.motion||{}),type:next.motion?.type||motionType,duration:Math.round(v*1000)};
            apply();
          }
        })
      );

      if(motionType==='slowZoom'||motionType==='breath'){
        const zoomGrid=two(motionDynamic);
        zoomGrid.append(
          desktopDetailRange('開始倍率',{
            min:1,max:1.5,step:.01,value:Number(motion.scaleFrom)||1,
            format:v=>v.toFixed(2),
            oninput:v=>{
              const next=ensureImageState();
              next.motion={...(next.motion||{}),type:motionType,scaleFrom:v};
              apply();
            }
          }),
          desktopDetailRange('終了倍率',{
            min:1,max:1.7,step:.01,
            value:Number(motion.scaleTo)||(motionType==='slowZoom'?1.14:1.11),
            format:v=>v.toFixed(2),
            oninput:v=>{
              const next=ensureImageState();
              next.motion={...(next.motion||{}),type:motionType,scaleTo:v};
              apply();
            }
          })
        );
      }else if(/^pan/.test(motionType)){
        const panGrid=two(motionDynamic);
        panGrid.append(
          desktopDetailRange('移動量',{
            min:1,max:30,step:1,value:Number(motion.pan)||9,unit:' %',
            format:v=>Math.round(v),
            oninput:v=>{
              const next=ensureImageState();
              next.motion={...(next.motion||{}),type:motionType,pan:v};
              apply();
            }
          })
        );
      }
    };

    const motionSelect=motionTypeField.querySelector('select');
    if(motionSelect){
      motionSelect.addEventListener('change',()=>{
        const bg=ensureImageState();
        const v=motionSelect.value;
        bg.motion={...(bg.motion||{}),type:v};
        if(v==='none')bg.motion={type:'none'};
        apply();
        renderMotionControls();
      });
    }
    renderMotionControls();

    const previewSec=section('プレビュー');
    const previewNote=document.createElement('p');
    previewNote.className='desktop-text-detail-note';
    previewNote.textContent=desktopLiveActive()
      ? '変更は左のLive Previewへ即時反映され、自動保存されます。Sceneを移動して戻っても、このSceneの背景設定を保持します。'
      : '変更は自動保存されます。閉じるとLive Editorでそのまま確認できます。';
    previewSec.appendChild(previewNote);

    const foot=document.createElement('footer');
    foot.className='desktop-text-detail-foot';
    const reset=document.createElement('button');
    reset.type='button';reset.className='desktop-text-detail-reset';reset.textContent=desktopLiveActive()?'リセット':'背景設定を初期化';
    const spacer=document.createElement('span');
    const close=document.createElement('button');
    close.type='button';close.textContent='閉じる';
    const save=document.createElement('button');
    save.type='button';save.className='is-primary';save.textContent='保存';
    foot.append(reset,spacer,close,save);

    modal.append(head,body,foot);
    overlay.appendChild(modal);
    liveDetailHost().appendChild(overlay);

    const closeOnly=()=>closeDesktopBackgroundDetail();
    x.addEventListener('click',closeOnly);
    close.addEventListener('click',closeOnly);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeOnly();});
    save.addEventListener('click',async()=>{
      await saveDraftNow();
      closeDesktopBackgroundDetail();
      renderDesktopLivePanel();
    });
    reset.addEventListener('click',()=>{
      delete p.background;
      scheduleDraftSave(40);
      refreshLivePlayer({preserveSheet:false});
      renderDesktopLivePanel();
      if(refreshMobileLiveDetail('background'))return;
      closeDesktopBackgroundDetail();
      openDesktopBackgroundDetail();
    });
  }

function openDesktopTextDetail(){
    if(!liveEditEnabled && advancedScreen?.hidden)return;
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
    const colorRow=document.createElement('div');colorRow.className='desktop-text-detail-color';const colorLabel=document.createElement('span');colorLabel.textContent='任意色';const colorCode=document.createElement('code');const initialColor=/^#[0-9a-f]{6}$/i.test(String(p.text.color||''))?String(p.text.color).toUpperCase():'#4A4A4A';colorCode.textContent=initialColor;const colorPicker=makeCommittedTextColorPicker(initialColor,{compact:true,onPreview:c=>{colorCode.textContent=c;previewCurrentSceneTextColor(c);},onCommit:c=>{p.text.color=c;colorCode.textContent=c;apply();}});colorRow.append(colorLabel,colorPicker.root,colorCode);typography.appendChild(colorRow);
    typography.appendChild(makeTextColorPalette(p.text.color,hex=>{p.text.color=hex;colorCode.textContent=hex;apply();closeDesktopTextDetail();openDesktopTextDetail();}));

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
    const reset=document.createElement('button');reset.type='button';reset.className='desktop-text-detail-reset';reset.textContent=desktopLiveActive()?'リセット':'音設定を初期化';
    const spacer=document.createElement('span');
    const cancel=document.createElement('button');cancel.type='button';cancel.textContent='キャンセル';
    const save=document.createElement('button');save.type='button';save.className='is-primary';save.textContent='保存';
    foot.append(reset,spacer,cancel,save);
    modal.append(head,body,foot);overlay.appendChild(modal);liveDetailHost().appendChild(overlay);

    const closeOnly=()=>{closeDesktopTextDetail();};
    x.addEventListener('click',closeOnly);cancel.addEventListener('click',closeOnly);
    save.addEventListener('click',async()=>{committed=true;await saveDraftNow();closeDesktopTextDetail();renderDesktopLivePanel();});
    reset.addEventListener('click',()=>{
      p.text={};
      scheduleDraftSave(50);
      refreshLivePlayer({preserveSheet:false});
      if(refreshMobileLiveDetail('text'))return;
      closeDesktopTextDetail();
      openDesktopTextDetail();
    });
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeOnly();});
  }
  function renderDesktopTimingPanel(){
    if(!desktopLivePanel || !workingDocument?.scenes?.length)return;
    const {index}=liveEditScene();
    // PC timing follows the Scene currently visible in the left Live Preview.
    liveTimingIndex=Math.max(0,Math.min(index,workingDocument.scenes.length-1));
    const scene=workingDocument.scenes[liveTimingIndex];
    const seconds=liveTimingSeconds(scene);
    const recorded=liveTimingRecorded(scene);

    desktopSceneLabel.textContent=`Scene ${liveTimingIndex+1} / ${workingDocument.scenes.length}`;
    desktopTimingButton?.classList.add('is-active');
    if(desktopTimingButton)desktopTimingButton.textContent='← 編集へ戻る';
    desktopLivePanelBody.innerHTML='';

    const wrap=document.createElement('div');
    wrap.className='desktop-timing-panel';

    const railWrap=document.createElement('section');
    railWrap.className='desktop-timing-rail-wrap';
    const railTitle=document.createElement('div');
    railTitle.className='desktop-timing-rail-title';
    railTitle.innerHTML=`<strong>${workingDocument.scenes.length} Scenes</strong><small>Sceneを横送り</small>`;
    const rail=document.createElement('div');
    rail.className='desktop-timing-rail';
    workingDocument.scenes.forEach((item,idx)=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='desktop-timing-scene-card'+(idx===liveTimingIndex?' is-selected':'');
      const txt=(item.text||item.subText||'空のScene').replace(/\\s+/g,' ').trim()||'空のScene';
      card.innerHTML=`<span><b>${String(idx+1).padStart(2,'0')}</b><em>${liveTimingSeconds(item).toFixed(2)}s</em></span><strong>${txt}</strong>`;
      card.addEventListener('click',()=>{
        liveTimingIndex=idx;
        player.index=idx;
        selectedSceneIndex=idx;
        liveEditRenderAt(idx,{preserveSheet:true});
        renderDesktopTimingPanel();
        requestAnimationFrame(()=>rail.querySelector('.is-selected')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}));
      });
      rail.append(card);
    });
    railWrap.append(railTitle,rail);

    const editor=document.createElement('section');
    editor.className='desktop-timing-editor';
    const top=document.createElement('div');
    top.className='desktop-timing-editor-head';
    const left=document.createElement('div');
    left.innerHTML=`<strong>AUTOタイミング</strong><small>${recorded?`記録済み・${seconds.toFixed(2)}s`:`未記録・標準 ${DEFAULT_AUTO_SECONDS.toFixed(2)}s`}</small>`;
    const reset=document.createElement('button');reset.type='button';reset.textContent='標準に戻す';
    reset.addEventListener('click',()=>{resetLiveTiming(liveTimingIndex);renderDesktopTimingPanel();});
    top.append(left,reset);

    const controls=document.createElement('div');
    controls.className='desktop-timing-controls';
    const makeNudge=(d)=>{const b=document.createElement('button');b.type='button';b.textContent=d<0?String(d):`+${d}`;b.addEventListener('click',()=>{setLiveTimingSeconds(liveTimingIndex,liveTimingSeconds(workingDocument.scenes[liveTimingIndex])+d);renderDesktopTimingPanel();});return b;};
    const value=document.createElement('label');value.className='desktop-timing-value';
    const input=document.createElement('input');input.type='number';input.min='0.15';input.max='60';input.step='0.05';input.value=seconds.toFixed(2);input.inputMode='decimal';
    const unit=document.createElement('span');unit.textContent='秒';value.append(input,unit);
    const commit=()=>{setLiveTimingSeconds(liveTimingIndex,input.value);renderDesktopTimingPanel();};
    input.addEventListener('change',commit);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}});
    controls.append(makeNudge(-.5),makeNudge(-.1),value,makeNudge(.1),makeNudge(.5));
    const note=document.createElement('p');note.textContent='AUTO RECの記録値を微調整できます。秒数は直接入力もできます。';
    editor.append(top,controls,note);
    wrap.append(railWrap,editor);
    desktopLivePanelBody.append(wrap);
    requestAnimationFrame(()=>rail.querySelector('.is-selected')?.scrollIntoView({behavior:'auto',block:'nearest',inline:'center'}));
  }

  let desktopCoverStyleTarget='title';

  function shellStyleControls(store,onApply){
    const wrap=document.createElement('div');wrap.className='desktop-live-grid';
    const initial=store();

    wrap.append(
      desktopMakeSelect(
        '書体',
        [['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],
        initial.fontFamily||'inherit',
        v=>{
          const st=store();
          if(v==='inherit')delete st.fontFamily;else st.fontFamily=v;
          onApply(st);
        }
      ),
      desktopMakeSelect(
        'サイズ',
        [['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],
        initial.size||'auto',
        v=>{
          const st=store();
          st.size=v;
          onApply(st);
        }
      )
    );

    // Use the same color controls as the normal Aa editor:
    // おまかせ / 任意色 + committed picker + 最近 / 固定.
    const colorField=document.createElement('div');
    colorField.className='desktop-live-field';
    const colorLabel=document.createElement('span');
    colorLabel.textContent='色';

    const colorSelect=document.createElement('select');
    const currentColor=normalizeTextColor(initial.color);
    [['auto','おまかせ'],['custom','任意色']].forEach(([value,label])=>{
      const o=document.createElement('option');o.value=value;o.textContent=label;colorSelect.appendChild(o);
    });
    colorSelect.value=currentColor?'custom':'auto';

    const customWrap=document.createElement('div');
    customWrap.className='desktop-text-detail-color';
    customWrap.style.gridColumn='1 / -1';

    const customLabel=document.createElement('span');
    customLabel.textContent='任意色';
    const colorCode=document.createElement('code');
    let activeColor=currentColor || '#4A4A4A';
    colorCode.textContent=activeColor;

    const applyColor=c=>{
      const st=store();
      const normalized=normalizeTextColor(c);
      if(normalized){
        st.color=normalized;
        activeColor=normalized;
        colorCode.textContent=normalized;
        rememberTextColor(normalized);
      }else{
        delete st.color;
      }
      onApply(st);
    };

    const picker=makeCommittedTextColorPicker(activeColor,{
      compact:true,
      onPreview:c=>{
        colorCode.textContent=c;
        const selectors={
          title:'.sp-cover-title',
          subtitle:'.sp-cover-subtitle',
          author:'.sp-cover-author',
          episode:'.sp-cover-episode',
          episodeTitle:'.sp-cover-episode-title'
        };
        const el=player?.els?.cover?.querySelector?.(selectors[desktopCoverStyleTarget]||'');
        if(el)el.style.setProperty('color',c,'important');
      },
      onCommit:c=>{
        applyColor(c);
        renderDesktopLivePanel();
      }
    });

    customWrap.append(customLabel,picker.root,colorCode);

    const paletteHost=document.createElement('div');
    paletteHost.style.gridColumn='1 / -1';
    const renderPalette=()=>{
      paletteHost.replaceChildren(
        makeTextColorPalette(activeColor,c=>{
          picker.setValue(c);
          applyColor(c);
          renderDesktopLivePanel();
        })
      );
    };
    renderPalette();

    const syncColorMode=()=>{
      const custom=colorSelect.value==='custom';
      customWrap.hidden=!custom;
      paletteHost.hidden=!custom;
    };
    colorSelect.addEventListener('change',()=>{
      if(colorSelect.value==='auto'){
        const st=store();
        delete st.color;
        onApply(st);
        customWrap.hidden=true;
        paletteHost.hidden=true;
      }else{
        const st=store();
        if(!normalizeTextColor(st.color))st.color=activeColor;
        onApply(st);
        syncColorMode();
      }
    });

    colorField.append(colorLabel,colorSelect);
    wrap.append(colorField,customWrap,paletteHost);
    syncColorMode();

    return wrap;
  }

  function renderDesktopCoverPanel(){
    desktopLivePanel.hidden=false;document.body.classList.add('desktop-live-edit');desktopLivePanelBody.innerHTML='';
    desktopSceneLabel.textContent='表紙';desktopPrevScene.disabled=true;desktopNextScene.disabled=true;
    if(desktopTimingButton){desktopTimingButton.disabled=true;desktopTimingButton.classList.remove('is-active');}

    const textCard=desktopCard('作品情報・表紙表示');
    const textNote=document.createElement('p');
    textNote.textContent='左はプレビュー兼直接編集です。文字内容はEasy Studioと共通。チェックで表紙への表示だけ切り替えます。';
    Object.assign(textNote.style,{margin:'0 0 10px',fontSize:'12px',lineHeight:'1.55',color:'#737984'});
    textCard.appendChild(textNote);

    const displayText=coverTextStateFromDocument();
    const visible=coverVisibilityStateFromDocument();
    [['作品タイトル','title'],['サブタイトル','subtitle'],['作者名','author'],['話数','episode'],['今回のタイトル','episodeTitle']].forEach(([label,target])=>{
      const row=document.createElement('div');row.className='desktop-live-field';
      const head=document.createElement('div');
      Object.assign(head.style,{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'});
      const cap=document.createElement('span');cap.textContent=label;
      const showLabel=document.createElement('label');showLabel.className='desktop-cover-visible-check';
      const check=document.createElement('input');check.type='checkbox';check.checked=visible[target]!==false;check.dataset.coverVisibilityTarget=target;
      const checkText=document.createElement('span');checkText.textContent='表紙に表示';
      showLabel.append(check,checkText);head.append(cap,showLabel);

      const input=document.createElement('input');
      input.type='text';input.value=displayText[target]||'';input.dataset.coverTextTarget=target;
      input.addEventListener('focus',()=>desktopCoverStyleTarget=target);
      input.addEventListener('input',()=>{desktopCoverStyleTarget=target;setCoverTextValue(target,input.value,{refresh:true});});
      check.addEventListener('change',()=>setCoverFieldVisible(target,check.checked,{refresh:true}));
      row.append(head,input);textCard.appendChild(row);
    });

    const styleCard=desktopCard('選択中の文字（Aa）');
    styleCard.append(desktopMakeSelect('対象',[['title','作品タイトル'],['subtitle','サブタイトル'],['author','作者名'],['episode','話数'],['episodeTitle','今回のタイトル']],desktopCoverStyleTarget,v=>{desktopCoverStyleTarget=v;renderDesktopLivePanel();}));
    styleCard.append(shellStyleControls(
      ()=>{
        workingDocument.cover||={};
        workingDocument.cover.styles||={};
        workingDocument.cover.styles[desktopCoverStyleTarget]||={};
        return workingDocument.cover.styles[desktopCoverStyleTarget];
      },
      st=>{
        workingDocument.cover ||= {};
        workingDocument.cover.styles ||= {};
        workingDocument.cover.styles[desktopCoverStyleTarget]=clone(st);

        applyCoverStyleToLiveElement(
          desktopCoverStyleTarget,
          workingDocument.cover.styles[desktopCoverStyleTarget]
        );
        refreshLivePlayerDocumentChrome();
        requestAnimationFrame(()=>applyCoverStyleToLiveElement(
          desktopCoverStyleTarget,
          workingDocument.cover.styles[desktopCoverStyleTarget]
        ));

        updateCoverPreview();
        syncEasyPublishButton();
        scheduleDraftSave(70);
      }
    ));
    desktopLivePanelBody.append(textCard,styleCard);
  }

  function renderDesktopEndingPanel(){
    desktopLivePanel.hidden=false;document.body.classList.add('desktop-live-edit');desktopLivePanelBody.innerHTML='';
    desktopSceneLabel.textContent='読了ページ';desktopPrevScene.disabled=true;desktopNextScene.disabled=true;
    if(desktopTimingButton){desktopTimingButton.disabled=true;desktopTimingButton.classList.remove('is-active');}
    const textCard=desktopCard('中央の文');const ta=document.createElement('textarea');ta.value=endingLabelInput?.value||'';ta.placeholder='読了';ta.addEventListener('input',()=>setEndingTextValue(ta.value,{refresh:true}));textCard.appendChild(ta);
    const styleCard=desktopCard('文字（Aa）');styleCard.append(shellStyleControls(()=>{workingDocument.ending||={};workingDocument.ending.style||={};return workingDocument.ending.style;},()=>{refreshLivePlayerDocumentChrome();updateEndingPreview();syncEasyPublishButton();scheduleDraftSave(70);requestAnimationFrame(prepareLiveEndingEditor);}));
    const linksCard=desktopCard('下部ボタン');const ops=document.createElement('div');ops.className='desktop-live-scene-ops';ops.append(desktopAction('左ボタンを編集',()=>{bringEndingQuickDialogToFront();openEndingQuickEditor('left');}),desktopAction('右ボタンを編集',()=>{bringEndingQuickDialogToFront();openEndingQuickEditor('right');}));linksCard.appendChild(ops);
    desktopLivePanelBody.append(textCard,styleCard,linksCard);
  }

  function renderDesktopLivePanel(){
    if(!desktopLivePanel)return;
    if(!desktopLiveActive()){
      desktopLivePanel.hidden=true;
      document.body.classList.remove('desktop-live-edit');
      return;
    }
    if(playerHost.classList.contains('sp-cover-open')){
      renderDesktopCoverPanel();
      return;
    }
    if(player?.ended || !playerHost.querySelector('.sp-ending')?.hidden){
      renderDesktopEndingPanel();
      return;
    }
    if(desktopTimingButton)desktopTimingButton.disabled=false;
    const {scene,index}=liveEditScene();if(!scene)return;
    desktopLivePanel.hidden=false;document.body.classList.add('desktop-live-edit');
    desktopSceneLabel.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    desktopPrevScene.disabled=index<=0;desktopNextScene.disabled=index>=workingDocument.scenes.length-1;
    if(desktopTimingOpen){renderDesktopTimingPanel();return;}
    if(desktopTimingButton){desktopTimingButton.classList.remove('is-active');desktopTimingButton.textContent='⌛ 時間';}
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
      desktopMakeSelect('文字配置',[['auto','Sceneに合わせる'],['left','左'],['center','中央'],['right','右']],p.text.align||'auto',v=>{if(v==='auto')delete p.text.align;else p.text.align=v;refresh();})
    );
    textCard.append(textGrid);
    if(colorValue==='custom'){
      const initialColor=/^#[0-9a-f]{6}$/i.test(String(p.text.color||''))?String(p.text.color).toUpperCase():'#4A4A4A';
      const colorPicker=makeCommittedTextColorPicker(initialColor,{onPreview:c=>{previewCurrentSceneTextColor(c);},onCommit:c=>{p.text.color=c;scheduleDraftSave(40);refreshLivePlayer({preserveSheet:false});renderDesktopLivePanel();}});
      textCard.append(colorPicker.root);
    }
    textCard.append(makeTextColorPalette(p.text.color,hex=>{p.text.color=hex;scheduleDraftSave(40);refreshLivePlayer({preserveSheet:false});renderDesktopLivePanel();}));
    textCard.append(desktopDetail('文字の詳細設定','text'));

    const effectCard=desktopCard('演出（✦）');
    const effectGrid=document.createElement('div');effectGrid.className='desktop-live-grid';
    const effectValue=p.typing?.enabled?'typewriter':(p.effect||'auto');
    effectGrid.append(
      desktopMakeSelect('出かた',[['auto','おまかせ'],['fade','フェード'],['pop','ポンと出る'],['blur','ぼやける'],['whisper','そっと'],['loud','強く'],['pulse','脈打つ'],['shake','揺れる'],['tilt','傾く'],['typewriter','タイプライター'],['none','なし']],effectValue,v=>{
        ensureDesktopEffectVisibleDefaults(scene,{save:false});
        if(v==='typewriter'){
          p.effect='none';
          p.typing={...(p.typing||{}),enabled:true,speed:Number(p.typing?.speed)||55,cursor:p.typing?.cursor!==false};
        }else{
          delete p.typing;
          p.effect=v;
        }
        scheduleDraftSave(40);
        replayCurrentDesktopEffect();
        renderDesktopLivePanel();
      }),
      desktopMakeSelect('表示',[['stack','前の文章を残す'],['solo','この文章だけ']],p.display||'stack',v=>{p.display=v;refresh();}),
      desktopMakeSelect('表示モード',[['world','通常'],['console','コンソール'],['system','システム'],['warning','警告'],['void','虚無']],p.view||'world',v=>{p.view=v;refresh();}),
      desktopMakeSelect('位置の動き',[['flow','流れて着地'],['still','その場']],p.entryMotion||'flow',v=>{p.entryMotion=v;refresh();})
    );
    effectCard.append(effectGrid,desktopDetail('演出の詳細設定','effect'));

    const bgCard=desktopCard('背景（▣）');
    const bg=p.background;
    const bgTop=document.createElement('div');bgTop.className='desktop-live-bg-top';
    if(bg?.src){const img=document.createElement('img');img.src=bg.src;img.alt='背景';bgTop.appendChild(img);}else{const ph=document.createElement('div');ph.className='desktop-live-bg-placeholder';ph.textContent='背景';bgTop.appendChild(ph);}
    const bgBtns=document.createElement('div');bgBtns.className='desktop-live-stack';
    bgBtns.append(
      desktopAction('前Sceneから継続',()=>{
        delete p.background;
        refresh();
      },!bg?'is-selected':''),
      desktopAction(bg?.src?'画像を変更':'画像を選択',()=>desktopPickFile('image/*',(url,name)=>{
        p.background={...(p.background||{}),src:url,_editorFileName:name,_editorManaged:true,transition:p.background?.transition||'fade',fit:p.background?.fit||'cover',tone:p.background?.tone||'dark',dim:p.background?.dim??.34};
      }),'is-primary'),
      desktopAction('背景なし',()=>{
        p.background={src:'',transition:'fade',_editorManaged:true};
        refresh();
      },bg?.src===''?'is-selected':'')
    );
    bgTop.appendChild(bgBtns);bgCard.appendChild(bgTop);
    const tone=document.createElement('div');tone.className='desktop-live-choice';
    tone.append(desktopAction('暗く',()=>{if(p.background?.src){p.background={...p.background,tone:'dark',dim:.38};refresh();}},bg?.src&&bg?.tone!=='light'?'is-selected':''),desktopAction('明るく',()=>{if(p.background?.src){p.background={...p.background,tone:'light',dim:.64};refresh();}},bg?.src&&bg?.tone==='light'?'is-selected':''));
    bgCard.append(tone,desktopDetail('背景の詳細設定','background'));
    three.append(textCard,effectCard,bgCard);

    const audioCard=desktopCard('音（♪）','desktop-live-audio-card');
    const audioGrid=document.createElement('div');audioGrid.className='desktop-live-audio-grid';
    const bgmRow=document.createElement('div');bgmRow.className='desktop-live-audio-col';
    const bgmHead=document.createElement('strong');bgmHead.textContent='BGM';bgmRow.appendChild(bgmHead);
    const bgmCmd=managedAudio(scene,'bgm');
    const bgmState=document.createElement('small');
    bgmState.textContent=bgmCmd?.action==='start'?(bgmCmd._editorFileName||'音源あり'):bgmCmd?.action==='volume'?`音量変更 ${Math.round((Number(bgmCmd.volume)||0)*100)}%`:bgmCmd?.action==='stop'?'停止':'前Sceneを継続';
    bgmRow.appendChild(bgmState);
    bgmRow.append(
      desktopAction('継続',()=>{setManagedAudio(scene,'bgm',null);refresh();}),
      desktopAction('停止',()=>{setManagedAudio(scene,'bgm',{channel:'bgm',action:'stop',fadeOut:600});refresh();}),
      desktopAction(bgmCmd?.action==='start'?'ファイルを変更':'ファイルを選択',()=>desktopPickFile('audio/*',(url,name)=>setManagedAudio(scene,'bgm',{channel:'bgm',action:'start',src:url,volume:.5,fadeIn:600,fadeOut:600,loop:true,restart:true,_editorFileName:name})),'is-primary')
    );
    audioGrid.append(bgmRow);
    const audioQuickNote=document.createElement('p');audioQuickNote.className='live-edit-note';audioQuickNote.textContent='Ambient と SE は「音の詳細設定」で調整します。';
    audioCard.append(audioGrid,audioQuickNote,desktopDetail('音の詳細設定','audio'));

    const sceneCard=desktopCard('Scene操作（•••）','desktop-live-scene-card');
    const ops=document.createElement('div');ops.className='desktop-live-scene-ops';
    const addOp=(label,fn,disabled=false,cls='')=>{const b=desktopAction(label,fn,cls);b.disabled=disabled;ops.appendChild(b);};
    addOp('＋ 次にScene追加',liveEditAddScene,false,'is-primary');addOp('← 前へ移動',()=>liveEditMoveScene(-1),index===0);addOp('次へ移動 →',()=>liveEditMoveScene(1),index===workingDocument.scenes.length-1);addOp('前のSceneと結合',liveEditMergePrevious,index===0);addOp('複製',liveEditDuplicateScene);addOp('削除',liveEditDeleteScene,workingDocument.scenes.length<=1,'is-danger');
    sceneCard.appendChild(ops);
    const nav=document.createElement('div');nav.className='desktop-live-nav';const navText=document.createElement('div');navText.innerHTML='<strong>読者が過去Sceneへ戻れる</strong><small>公開Playerの戻る操作を許可</small>';const toggle=desktopAction(workingDocument.player?.navigation?.allowPrevious===false?'OFF':'ON',()=>{liveEditToggleAllowPrevious();renderDesktopLivePanel();},'desktop-live-toggle');nav.append(navText,toggle);sceneCard.appendChild(nav);

    desktopLivePanelBody.append(bodyCard,three,audioCard,sceneCard);
  }


  let liveTimingIndex=null;

  function liveTimingSeconds(scene){
    const pause=Number(scene?.pause);
    return Number.isFinite(pause) && pause>0 ? pause/1000 : DEFAULT_AUTO_SECONDS;
  }

  function liveTimingRecorded(scene){
    return Number.isFinite(Number(scene?.pause)) && Number(scene.pause)>0;
  }

  function setLiveTimingSeconds(index,seconds){
    const scene=workingDocument?.scenes?.[index];
    if(!scene)return;
    const safe=Math.max(.15,Math.min(60,Number(seconds)||DEFAULT_AUTO_SECONDS));
    scene.pause=Math.round(safe*1000);
    scheduleDraftSave(50);
  }

  function resetLiveTiming(index){
    const scene=workingDocument?.scenes?.[index];
    if(!scene)return;
    delete scene.pause;
    scheduleDraftSave(50);
  }

  function renderLiveTimingPanel(){
    if(!workingDocument?.scenes?.length || !liveEditSheetBody)return;

    const current=liveEditScene().index;
    if(!Number.isInteger(liveTimingIndex))liveTimingIndex=current;
    liveTimingIndex=Math.max(0,Math.min(liveTimingIndex,workingDocument.scenes.length-1));

    const scene=workingDocument.scenes[liveTimingIndex];
    const seconds=liveTimingSeconds(scene);
    const recorded=liveTimingRecorded(scene);

    liveEditSceneNumber.textContent=`Scene ${liveTimingIndex+1} / ${workingDocument.scenes.length}`;
    liveEditSheetTitle.textContent='時間';
    liveEditSheet.hidden=false;
    liveEditSheet.classList.remove('live-edit-sheet-audio');
    liveEditSheet.classList.add('live-edit-sheet-timing');
    document.body.classList.add('live-edit-sheet-open');
    liveEditSheetBody.innerHTML='';

    const railWrap=document.createElement('section');
    railWrap.className='live-timing-rail-wrap';

    const railHead=document.createElement('div');
    railHead.className='live-timing-rail-head';
    const railTitle=document.createElement('strong');
    railTitle.textContent=`${workingDocument.scenes.length} Scenes`;
    const railHint=document.createElement('small');
    railHint.textContent='Sceneを横送り';
    railHead.append(railTitle,railHint);

    const rail=document.createElement('div');
    rail.className='live-timing-rail';

    workingDocument.scenes.forEach((item,i)=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='live-timing-scene-card';
      if(i===liveTimingIndex)card.classList.add('is-selected');

      const top=document.createElement('span');
      top.className='live-timing-scene-top';
      const no=document.createElement('b');
      no.textContent=String(i+1).padStart(2,'0');
      const sec=document.createElement('em');
      sec.textContent=`${liveTimingSeconds(item).toFixed(2)}s`;
      if(!liveTimingRecorded(item))sec.classList.add('is-default');
      top.append(no,sec);

      const text=document.createElement('strong');
      text.className='live-timing-scene-text';
      text.textContent=(item.text||item.subText||'空のScene').trim() || '空のScene';

      card.append(top,text);
      card.addEventListener('click',()=>{
        liveTimingIndex=i;
        renderLiveTimingPanel();
        requestAnimationFrame(()=>{
          rail.querySelector('.live-timing-scene-card.is-selected')
            ?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
        });
      });
      rail.appendChild(card);
    });

    railWrap.append(railHead,rail);

    const editor=document.createElement('section');
    editor.className='live-timing-editor';

    const head=document.createElement('div');
    head.className='live-timing-editor-head';
    const copy=document.createElement('div');
    const title=document.createElement('strong');
    title.textContent='AUTOタイミング';
    const state=document.createElement('small');
    state.textContent=recorded ? `記録済み・${seconds.toFixed(2)}s` : `未記録・標準 ${DEFAULT_AUTO_SECONDS.toFixed(2)}s`;
    state.classList.toggle('is-recorded',recorded);
    copy.append(title,state);

    const reset=document.createElement('button');
    reset.type='button';
    reset.className='live-timing-reset';
    reset.textContent='標準に戻す';
    reset.addEventListener('click',()=>{
      resetLiveTiming(liveTimingIndex);
      renderLiveTimingPanel();
    });
    head.append(copy,reset);

    const valueRow=document.createElement('label');
    valueRow.className='live-timing-value';
    const input=document.createElement('input');
    input.type='number';
    input.min='0.15';
    input.max='60';
    input.step='0.05';
    input.inputMode='decimal';
    input.value=seconds.toFixed(2);
    input.setAttribute('aria-label','Sceneの表示秒数');
    const unit=document.createElement('span');
    unit.textContent='秒';
    valueRow.append(input,unit);

    const commit=()=>{
      setLiveTimingSeconds(liveTimingIndex,input.value);
      renderLiveTimingPanel();
    };
    input.addEventListener('change',commit);
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        input.blur();
        commit();
      }
    });

    const nudges=document.createElement('div');
    nudges.className='live-timing-nudges';
    [-.5,-.1,.1,.5].forEach(delta=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=delta<0?String(delta):`+${delta}`;
      b.addEventListener('click',()=>{
        const next=liveTimingSeconds(workingDocument.scenes[liveTimingIndex])+delta;
        setLiveTimingSeconds(liveTimingIndex,next);
        renderLiveTimingPanel();
      });
      nudges.appendChild(b);
    });

    const note=document.createElement('p');
    note.className='live-timing-note';
    note.textContent='AUTO RECの記録値を微調整できます。秒数を直接入力して手動設定することもできます。';

    editor.append(head,valueRow,nudges,note);
    liveEditSheetBody.append(railWrap,editor);

    requestAnimationFrame(()=>{
      liveEditSheetBody.querySelector('.live-timing-scene-card.is-selected')
        ?.scrollIntoView({behavior:'auto',block:'nearest',inline:'center'});
    });
  }


  // Shell text (Cover / Ending) now uses the SAME Aa bottom sheet as Scene text.
  // Keep one compact UI and one color system instead of separate cover/ending modals.
  let liveShellTextContext=null;

  function liveShellTextStyleContext(){
    const ctx=liveShellTextContext;
    if(!ctx)return null;

    if(ctx.kind==='cover'){
      const target=ctx.target;
      if(!target)return null;
      const style=ensureCoverStyleStore(target);
      return {
        label:'表紙',
        detailLabel:'表紙',
        style,
        apply(){
          workingDocument.cover ||= {};
          workingDocument.cover.styles ||= {};
          workingDocument.cover.styles[target]=clone(style);
          refreshLivePlayerDocumentChrome();
          applyCoverStyleToLiveElement(target,workingDocument.cover.styles[target]);
          updateCoverPreview();
          syncEasyPublishButton();
          scheduleDraftSave(70);
        },
        previewColor(c){
          applyCoverStyleToLiveElement(target,{...style,color:c});
        }
      };
    }

    if(ctx.kind==='ending'){
      const style=ensureEndingStyleStore();
      return {
        label:'読了ページ',
        detailLabel:'読了ページ',
        style,
        apply(){
          workingDocument.ending ||= {};
          workingDocument.ending.style=clone(style);
          refreshLivePlayerDocumentChrome();
          applyEndingStyleToLiveElement(workingDocument.ending.style);
          updateEndingPreview();
          syncEasyPublishButton();
          scheduleDraftSave(70);
          requestAnimationFrame(prepareLiveEndingEditor);
        },
        previewColor(c){
          applyEndingStyleToLiveElement({...style,color:c});
        }
      };
    }
    return null;
  }

  function renderShellTextDetail(){
    const ctx=liveShellTextStyleContext();
    if(!ctx||!liveEditSheetBody)return;

    liveEditSheet.hidden=false;
    document.body.classList.add('live-edit-sheet-open','mobile-live-detail-open');
    liveEditSheet.classList.add('mobile-live-detail-sheet');
    const head=liveEditSheet.querySelector('.live-edit-sheet-head');
    if(head)head.hidden=true;
    liveEditSheetBody.innerHTML='';

    const modal=document.createElement('section');
    modal.className='desktop-text-detail-modal';
    modal.dataset.mobileLiveDetail='true';
    Object.assign(modal.style,{
      width:'100%',maxWidth:'none',maxHeight:'none',height:'100%',overflow:'auto',
      border:'0',borderRadius:'0',boxShadow:'none'
    });

    const modalHead=document.createElement('header');
    modalHead.className='desktop-text-detail-head';
    const titleWrap=document.createElement('div');
    const small=document.createElement('small');small.textContent=ctx.detailLabel;
    const title=document.createElement('h2');title.textContent='文字の詳細設定';
    titleWrap.append(small,title);
    const close=document.createElement('button');
    close.type='button';close.className='desktop-text-detail-close';close.textContent='×';
    modalHead.append(titleWrap,close);

    const body=document.createElement('div');
    body.className='desktop-text-detail-body';
    const section=document.createElement('section');
    section.className='desktop-text-detail-section';
    const h3=document.createElement('h3');h3.textContent='基本';
    const grid=document.createElement('div');grid.className='desktop-text-detail-two';

    const st=ctx.style;
    const apply=()=>ctx.apply();
    grid.append(
      desktopDetailSelect('書体',
        [['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],
        st.fontFamily||'inherit',
        v=>{if(v==='inherit')delete st.fontFamily;else st.fontFamily=v;apply();}
      ),
      desktopDetailSelect('サイズ',
        [['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],
        st.size||'auto',
        v=>{st.size=v;apply();}
      ),
      desktopDetailSelect('文字色',
        [['auto','おまかせ'],['white','白'],['black','黒'],['custom','任意色']],
        !st.color?'auto':(String(st.color).toLowerCase()==='#ffffff'?'white':(String(st.color).toLowerCase()==='#000000'?'black':'custom')),
        v=>{
          if(v==='white')st.color='#ffffff';
          else if(v==='black')st.color='#000000';
          else if(v==='custom'){
            if(!normalizeTextColor(st.color)||['#FFFFFF','#000000'].includes(normalizeTextColor(st.color)))st.color='#4A4A4A';
          }else delete st.color;
          apply();
          renderShellTextDetail();
        }
      )
    );
    section.append(h3,grid);

    const colorRow=document.createElement('div');
    colorRow.className='desktop-text-detail-color';
    const colorLabel=document.createElement('span');colorLabel.textContent='任意色';
    const colorCode=document.createElement('code');
    const initialColor=normalizeTextColor(st.color)||'#4A4A4A';
    colorCode.textContent=initialColor;
    const picker=makeCommittedTextColorPicker(initialColor,{
      compact:true,
      onPreview:c=>{colorCode.textContent=c;ctx.previewColor(c);},
      onCommit:c=>{st.color=c;colorCode.textContent=c;ctx.apply();}
    });
    colorRow.append(colorLabel,picker.root,colorCode);
    section.appendChild(colorRow);
    section.appendChild(makeTextColorPalette(st.color,hex=>{
      st.color=hex;ctx.apply();renderShellTextDetail();
    }));
    body.appendChild(section);

    const foot=document.createElement('footer');
    foot.className='desktop-text-detail-foot';
    const done=document.createElement('button');done.type='button';done.textContent='完了';
    done.className='desktop-text-detail-save';
    foot.appendChild(done);

    modal.append(modalHead,body,foot);
    liveEditSheetBody.appendChild(modal);

    const returnCompact=()=>{
      modal.remove();
      liveEditSheet.classList.remove('mobile-live-detail-sheet');
      document.body.classList.remove('mobile-live-detail-open');
      const liveHead=liveEditSheet.querySelector('.live-edit-sheet-head');
      if(liveHead)liveHead.hidden=false;
      renderShellLiveTextSheet();
    };
    close.addEventListener('click',returnCompact,{once:true});
    done.addEventListener('click',returnCompact,{once:true});
  }

  function renderShellLiveTextSheet(){
    const ctx=liveShellTextStyleContext();
    if(!ctx||!liveEditSheetBody)return false;

    liveEditSceneNumber.textContent=ctx.label;
    liveEditSheet.hidden=false;
    document.body.classList.add('live-edit-sheet-open');
    liveEditSheet.classList.remove('live-edit-sheet-audio','live-edit-sheet-timing','mobile-live-detail-sheet');
    document.body.classList.remove('mobile-live-detail-open');
    const head=liveEditSheet.querySelector('.live-edit-sheet-head');
    if(head)head.hidden=false;
    liveEditSheetTitle.textContent='文字';
    liveEditSheetBody.innerHTML='';

    const st=ctx.style;
    const rerender=()=>ctx.apply();

    const makeSelect=(label,values,current,onchange)=>{
      const wrap=document.createElement('label');
      wrap.className='live-edit-field';
      wrap.append(label);
      const select=document.createElement('select');
      values.forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;select.appendChild(o);});
      select.value=current;
      select.addEventListener('change',()=>onchange(select.value));
      wrap.appendChild(select);
      return wrap;
    };

    const grid=document.createElement('div');
    grid.className='live-edit-grid';

    let colorValue=!st.color?'auto':(
      String(st.color).toLowerCase()==='#ffffff'?'white':
      (String(st.color).toLowerCase()==='#000000'?'black':'custom')
    );

    const colorField=makeSelect(
      '色',
      [['auto','おまかせ'],['white','白'],['black','黒'],['custom','任意色']],
      colorValue,
      v=>{
        if(v==='white')st.color='#ffffff';
        else if(v==='black')st.color='#000000';
        else if(v==='custom'){
          if(!normalizeTextColor(st.color)||['#FFFFFF','#000000'].includes(normalizeTextColor(st.color)))st.color='#4A4A4A';
        }else delete st.color;
        rerender();
        renderShellLiveTextSheet();
      }
    );

    grid.append(
      makeSelect('書体',
        [['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],
        st.fontFamily||'inherit',
        v=>{if(v==='inherit')delete st.fontFamily;else st.fontFamily=v;rerender();}
      ),
      makeSelect('サイズ',
        [['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],
        st.size||'auto',
        v=>{st.size=v;rerender();}
      ),
      colorField
    );

    liveEditSheetBody.appendChild(grid);

    if(colorValue==='custom'){
      const custom=document.createElement('div');
      custom.className='live-edit-color-custom';
      const label=document.createElement('span');label.textContent='任意色';
      const initialColor=normalizeTextColor(st.color)||'#4A4A4A';
      const value=document.createElement('code');value.textContent=initialColor;
      const colorPicker=makeCommittedTextColorPicker(initialColor,{
        compact:true,
        onPreview:c=>{value.textContent=c;ctx.previewColor(c);},
        onCommit:c=>{st.color=c;value.textContent=c;ctx.apply();}
      });
      custom.append(label,colorPicker.root,value);
      liveEditSheetBody.appendChild(custom);
    }

    liveEditSheetBody.appendChild(makeTextColorPalette(st.color,hex=>{
      st.color=hex;ctx.apply();renderShellLiveTextSheet();
    }));

    // Cover / Ending intentionally stop at the compact Aa controls.
    // Scene text keeps its separate "文字の詳細設定" route below.
    return true;
  }

  function renderLiveEditSheet(kind){
    if(kind==='text' && liveShellTextContext){
      renderShellLiveTextSheet();
      return;
    }
    const {scene,index}=liveEditScene(); if(!scene||!liveEditSheetBody)return;
    liveEditSceneNumber.textContent=`Scene ${index+1} / ${workingDocument.scenes.length}`;
    liveEditSheet.hidden=false;
    document.body.classList.add('live-edit-sheet-open');
    liveEditSheet.classList.toggle('live-edit-sheet-audio',kind==='audio');
    liveEditSheet.classList.toggle('live-edit-sheet-timing',kind==='timing');
    liveEditSheetBody.innerHTML='';

    if(kind==='timing'){
      finishInlineTextEdit();
      renderLiveTimingPanel();
      return;
    }

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
        makeSelect('文字配置',[['auto','Sceneに合わせる'],['left','左'],['center','中央'],['right','右']],p.text.align||'auto',v=>{if(v==='auto')delete p.text.align;else p.text.align=v;rerender();})
      );
      if(colorValue==='custom'){
        const custom=document.createElement('div');custom.className='live-edit-color-custom';
        const label=document.createElement('span');label.textContent='任意色';
        const initialColor=/^#[0-9a-f]{6}$/i.test(String(p.text.color||''))?String(p.text.color).toUpperCase():'#4A4A4A';
        const value=document.createElement('code');value.textContent=initialColor;
        const colorPicker=makeCommittedTextColorPicker(initialColor,{compact:true,onPreview:c=>{value.textContent=c;previewCurrentSceneTextColor(c);},onCommit:c=>{p.text.color=c;value.textContent=c;rerender();}});
        custom.append(label,colorPicker.root,value);
        liveEditSheetBody.append(grid,custom);
      }else{
        liveEditSheetBody.append(grid);
      }
      liveEditSheetBody.append(makeTextColorPalette(p.text.color,hex=>{p.text.color=hex;rerender();renderLiveEditSheet('text');}));
      const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='文字の詳細設定';detail.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMobileLiveDetail('text');});
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
        makeSelect('表示',[['stack','前の文章を残す'],['solo','この文章だけ']],p.display||'stack',v=>{p.display=v;scheduleDraftSave(80);refreshLivePlayer();}),
        makeSelect('位置の動き',[['flow','流れて着地'],['still','その場']],p.entryMotion||'flow',v=>{p.entryMotion=v;scheduleDraftSave(80);refreshLivePlayer();})
      );
      const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='演出の詳細設定';detail.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMobileLiveDetail('effect');});
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
      const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='暗さ・動き・切替を細かく調整';detail.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMobileLiveDetail('background');});
      liveEditSheetBody.append(actions,pick,toneRow,status,detail);return;
    }

    liveEditSheetTitle.textContent='音';
    const audioWrap=document.createElement('div');audioWrap.className='live-edit-audio-list';
    const bgmCmd=managedAudio(scene,'bgm');const bgmRow=document.createElement('section');bgmRow.className='live-edit-audio-row';
    const bgmHead=document.createElement('div');bgmHead.className='live-edit-audio-head';const bgmName=document.createElement('strong');bgmName.textContent='BGM';const bgmState=document.createElement('small');
    bgmState.textContent=bgmCmd?.action==='start'?(bgmCmd._editorFileName||'音源あり'):bgmCmd?.action==='volume'?`音量変更 ${Math.round((Number(bgmCmd.volume)||0)*100)}%`:bgmCmd?.action==='stop'?'停止':'継続';bgmHead.append(bgmName,bgmState);
    const bgmButtons=document.createElement('div');bgmButtons.className='live-edit-audio-actions';
    const bgmInherit=makeActionButton('継続',!bgmCmd?'is-selected':'');const bgmStop=makeActionButton('停止',bgmCmd?.action==='stop'?'is-selected':'');const bgmPick=makeActionButton(bgmCmd?.action==='start'?'変更':'選択','is-primary');
    bgmInherit.onclick=()=>{setManagedAudio(scene,'bgm',null);scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('audio');};
    bgmStop.onclick=()=>{setManagedAudio(scene,'bgm',{channel:'bgm',action:'stop',fadeOut:600});scheduleDraftSave(60);refreshLivePlayer();renderLiveEditSheet('audio');};
    bgmPick.onclick=()=>pickLiveFile('audio/*',(url,fileName)=>setManagedAudio(scene,'bgm',{channel:'bgm',action:'start',src:url,volume:.5,fadeIn:600,fadeOut:600,loop:true,restart:true,_editorFileName:fileName}));
    bgmButtons.append(bgmInherit,bgmStop,bgmPick);bgmRow.append(bgmHead,bgmButtons);audioWrap.append(bgmRow);
    const presetNote=document.createElement('p');presetNote.className='live-edit-note';presetNote.textContent='Ambient と SE は「音の詳細設定」で調整します。';
    const detail=document.createElement('button');detail.type='button';detail.className='live-edit-detail';detail.textContent='音の詳細設定';detail.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openMobileLiveDetail('audio');});
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
    finishInlineTextEdit();
    finishLiveCoverInlineEdit?.({refresh:false});
    liveCoverTextDraft=null;
    liveEditEnabled=false;
    closeLiveEditSheet();
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

  function openAfterKeyboardDismiss(openFn){
    const vv=window.visualViewport;
    const started=performance.now();
    const initialHeight=vv?.height||window.innerHeight;
    const baseline=Math.max(window.innerHeight,document.documentElement.clientHeight||0);
    let stableFrames=0;
    let lastHeight=initialHeight;

    const tick=()=>{
      const h=vv?.height||window.innerHeight;
      const keyboardMostlyGone=!vv || h>=baseline*.78 || h>=initialHeight+120;
      const stable=Math.abs(h-lastHeight)<3;
      stableFrames=stable?stableFrames+1:0;
      lastHeight=h;

      if((keyboardMostlyGone&&stableFrames>=2) || performance.now()-started>700){
        requestAnimationFrame(()=>requestAnimationFrame(openFn));
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function liveCoverIsVisible(){
    if(playerHost?.classList?.contains('sp-cover-open'))return true;
    const cover=playerHost?.querySelector?.('.sp-cover');
    if(!cover)return false;
    const cs=getComputedStyle(cover);
    return !cover.hidden && cs.display!=='none' && cs.visibility!=='hidden' && Number(cs.opacity||1)!==0;
  }

  liveEditToolbar?.addEventListener('pointerdown',(e)=>{
    const b=e.target.closest?.('[data-live-edit]');if(!b)return;

    if(liveCoverIsVisible()){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(b.dataset.liveEdit==='text'){
        // Capture the selected cover target first. Finishing the inline edit
        // clears liveCoverInlineTarget and may synchronously fire blur handlers.
        const target=liveCoverInlineTarget || desktopCoverStyleTarget || 'title';
        if(liveCoverInlineTarget)finishLiveCoverInlineEdit({refresh:false});
        document.activeElement?.blur?.();
        // Set shell context only after the inline editor has fully closed so
        // its cleanup cannot erase/retarget the Aa sheet.
        liveShellTextContext={kind:'cover',target};
        renderLiveEditSheet('text');
        setLiveToolbarVisible(true);
      }
      return;
    }
    if(player?.ended){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(b.dataset.liveEdit==='text'){
        liveShellTextContext={kind:'ending'};
        liveEndingInlineEl?.blur();
        document.activeElement?.blur?.();
        renderLiveEditSheet('text');
      }
      return;
    }

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
      if(kind==='timing'){
        liveTimingIndex=liveEditScene().index;
        renderLiveEditSheet('timing');
        return;
      }
      renderLiveEditSheet(kind);
      return;
    }
  });

  liveEditToolbar?.addEventListener('click',(e)=>{
    const b=e.target.closest('[data-live-edit]');if(!b)return;
    e.preventDefault();

    if(liveCoverIsVisible()){
      e.stopImmediatePropagation();
      if(b.dataset.liveEdit==='text'){
        // Capture the selected cover target first. Finishing the inline edit
        // clears liveCoverInlineTarget and may synchronously fire blur handlers.
        const target=liveCoverInlineTarget || desktopCoverStyleTarget || 'title';
        if(liveCoverInlineTarget)finishLiveCoverInlineEdit({refresh:false});
        document.activeElement?.blur?.();
        // Set shell context only after the inline editor has fully closed so
        // its cleanup cannot erase/retarget the Aa sheet.
        liveShellTextContext={kind:'cover',target};
        renderLiveEditSheet('text');
        setLiveToolbarVisible(true);
      }
      return;
    }
    if(player?.ended){
      e.stopImmediatePropagation();
      if(b.dataset.liveEdit==='text'){
        liveShellTextContext={kind:'ending'};
        liveEndingInlineEl?.blur();
        document.activeElement?.blur?.();
        renderLiveEditSheet('text');
      }
      return;
    }

    e.stopPropagation();

    // If pointerdown already handled an inline-edit command, ignore the
    // follow-up click. Otherwise this is the normal keyboard-closed path.
    if(liveInlineEditEl)return;

    const kind=b.dataset.liveEdit;
    if(kind==='add'){liveEditAddScene();return;}
    if(kind==='scene'){renderLiveEditSceneMenu();return;}
    if(kind==='timing'){
      liveTimingIndex=liveEditScene().index;
      renderLiveEditSheet('timing');
      return;
    }
    renderLiveEditSheet(kind);
  });
  $('#liveEditSheetClose')?.addEventListener('click',closeLiveEditSheet);
  desktopPrevScene?.addEventListener('click',()=>{
    const {index}=liveEditScene();
    if(index>0)liveEditRenderAt(index-1,{preserveSheet:false});
  });
  desktopNextScene?.addEventListener('click',()=>{
    const {index}=liveEditScene();
    if(index<workingDocument.scenes.length-1)liveEditRenderAt(index+1,{preserveSheet:false});
  });
  desktopTimingButton?.addEventListener('click',()=>{
    desktopTimingOpen=!desktopTimingOpen;
    liveTimingIndex=liveEditScene().index;
    renderDesktopLivePanel();
  });
  desktopLiveMQ.addEventListener?.('change',()=>{renderDesktopLivePanel();if(desktopLiveActive())setLiveToolbarVisible(true);});
  // Live Edit v0.2.3: while the visible Scene text is being edited,
  // the Player must not interpret taps / Enter / Space as navigation.
  playerHost.addEventListener('click',(e)=>{
    const inline=liveInlineEditEl||liveCoverInlineEl;
    if(!inline)return;
    if(e.target===inline||inline.contains(e.target)){
      e.stopImmediatePropagation();
    }
  },true);
  playerHost.addEventListener('keydown',(e)=>{
    if(!liveInlineEditEl)return;
    if(e.target===liveInlineEditEl||liveInlineEditEl.contains(e.target)){
      e.stopImmediatePropagation();
    }
  },true);

  // Live Edit disappear handling:
  // Preview must stay faithful to the authored Scene, so disappear is allowed
  // to complete normally. Once it has fully disappeared, Live Editor exposes
  // the same kind of small "tap to edit" rescue target used by an empty Scene.
  // Tapping the rescue target restores the Scene text and immediately enters
  // inline editing. Public Player behavior is untouched.
  function removeLiveDisappearEditTarget(){
    playerHost?.querySelector('.live-disappear-edit-target')?.remove();
  }
  function showLiveDisappearEditTarget(){
    if(!liveEditEnabled||autoRecActive||player?.historyOpen)return;
    removeLiveDisappearEditTarget();
    const stage=playerHost.querySelector('.sp-stage');
    const article=playerHost.querySelector('.sp-scene.is-active');
    const {scene}=liveEditScene();
    if(!stage||!article||!scene?.presentation?.disappear)return;

    const target=document.createElement('button');
    target.type='button';
    target.className='live-disappear-edit-target';
    target.textContent='タップして編集';
    target.setAttribute('aria-label','消えたSceneのテキストを編集');
    Object.assign(target.style,{
      position:'absolute',
      left:'50%',
      top:'50%',
      transform:'translate(-50%,-50%)',
      zIndex:'40',
      minWidth:'150px',
      minHeight:'46px',
      padding:'10px 14px',
      border:'0',
      borderRadius:'12px',
      background:'transparent',
      color:'rgba(120,120,124,.42)',
      font:'700 13px/1.5 system-ui,-apple-system,"Hiragino Sans","Yu Gothic",sans-serif',
      letterSpacing:'.08em',
      cursor:'text',
      WebkitTapHighlightColor:'transparent'
    });
    target.addEventListener('click',(event)=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      target.remove();

      // The Player has already completed the authored disappear animation.
      // Remove only its runtime exit classes so the text becomes editable
      // again; do not re-render the Scene, otherwise disappear would restart.
      article.classList.remove('is-disappearing','is-disappeared','is-disappear-up','is-disappear-stay');
      article.style.removeProperty('--sp-disappear-fade');
      setLiveToolbarVisible(true);
      requestAnimationFrame(()=>startInlineTextEdit());
    },true);
    stage.appendChild(target);
  }

  playerHost.addEventListener('sceneplayer:disappear',(e)=>{
    if(!liveEditEnabled)return;
    const phase=e?.detail?.phase||'';
    if(phase==='start'){
      removeLiveDisappearEditTarget();
      return;
    }
    if(phase==='end'){
      requestAnimationFrame(showLiveDisappearEditTarget);
    }
  });

  // The disappear rescue target belongs only to the Scene that created it.
  // Remove it synchronously whenever the Player leaves/reloads that Scene so
  // the "タップして編集" target cannot survive as a ghost over later Scenes.
  ['sceneplayer:scenechange','sceneplayer:load','sceneplayer:restart',
   'sceneplayer:coverstart','sceneplayer:end','sceneplayer:historyopen']
    .forEach(type=>playerHost.addEventListener(type,removeLiveDisappearEditTarget));

  // Cover / Ending direct edit in Live Editor. Reuse the existing Easy Studio
  // quick editors so there is only one source of truth for authored shell data.
  // Only authored text/slots are intercepted; Start, empty stage taps and the
  // fixed COVER action retain their normal Player behavior.
  // Live Ending Editor helpers.
  let liveEndingInlineEl=null;

  function bringEndingQuickDialogToFront(){
    if(!endingQuickDialog)return;
    // The Easy quick editor normally lives inside the Easy layer. Live Editor
    // is a higher full-screen layer, so move the same editor to <body> rather
    // than creating a second settings UI.
    if(endingQuickDialog.parentElement!==document.body){
      document.body.appendChild(endingQuickDialog);
    }
    endingQuickDialog.style.setProperty('position','fixed','important');
    endingQuickDialog.style.setProperty('inset','0','important');
    // #playerScreen itself is 2147483000!important. Keep this editor above it,
    // but below the hard "編集に戻る" control at 2147483647.
    endingQuickDialog.style.setProperty('z-index','2147483640','important');
  }

  function prepareLiveEndingEditor(){
    if(!liveEditEnabled||autoRecActive||!player?.ended)return;
    const ending=playerHost.querySelector('.sp-ending');
    if(!ending||ending.hidden)return;

    const title=ending.querySelector('.sp-ending-title');
    if(title){
      title.classList.add('live-ending-center-editable');
      title.setAttribute('role','textbox');
      title.setAttribute('aria-label','読了ページ中央の文を編集');
      title.style.cursor='text';
      title.style.webkitTapHighlightColor='transparent';
    }

    // Reader mode hides unset links. Live Editor keeps two faint empty boxes so
    // the author always has a direct entry point to the existing Easy settings.
    [['.sp-ending-left','left'],['.sp-ending-right','right']].forEach(([selector,side])=>{
      const button=ending.querySelector(selector);
      if(!button)return;
      const row=endingLinkInputs[side==='left'?0:1];
      const kicker=String(row?.kicker?.value||'').trim();
      const label=String(row?.label?.value||'').trim();
      const url=String(row?.url?.value||'').trim();
      const empty=!(label&&url);
      button.hidden=false;
      button.classList.toggle('live-ending-empty-slot',empty);
      button.style.opacity=empty?'.32':'1';
      button.style.cursor='pointer';
      button.style.pointerEvents='auto';
      const small=button.querySelector('small');
      const strong=button.querySelector('strong');
      if(empty){
        if(small){small.textContent=side==='left'?'LEFT':'RIGHT';small.hidden=false;}
        if(strong)strong.textContent='＋';
      }else{
        if(small){small.textContent=kicker;small.hidden=!kicker;}
        if(strong)strong.textContent=label;
      }
    });
  }

  let liveEndingStylePanel=null;

  function ensureEndingStyleStore(){
    workingDocument.ending ||= {};
    workingDocument.ending.style ||= {};
    return workingDocument.ending.style;
  }
  function closeLiveEndingStylePanel(){
    liveEndingStylePanel?.remove();
    liveEndingStylePanel=null;
  }
  function applyEndingStyleToLiveElement(style){
    const el=playerHost.querySelector('.sp-ending-title');
    if(!el)return;
    const sizeMap={small:'clamp(15px,3.5vw,22px)',normal:'clamp(18px,4.6vw,30px)',large:'clamp(24px,6.2vw,42px)',xl:'clamp(30px,8vw,56px)'};
    const fontMap={serif:'var(--sp-font-serif)',sans:'var(--sp-font-sans)',mono:'var(--sp-font-mono)'};
    el.style.removeProperty('color');
    el.style.removeProperty('font-size');
    if(style?.color)el.style.setProperty('color',String(style.color),'important');
    if(style?.size&&style.size!=='auto'){
      const v=typeof style.size==='number'?`${style.size}px`:sizeMap[style.size];
      if(v)el.style.setProperty('font-size',v,'important');
    }
    if(style?.fontFamily&&style.fontFamily!=='inherit'){
      const v=fontMap[style.fontFamily];
      if(v)el.style.setProperty('font-family',v,'important');
    }
  }

  function openLiveEndingStylePanel(){
    if(!player?.ended)return;
    closeLiveEndingStylePanel();
    const st=ensureEndingStyleStore();

    const overlay=document.createElement('div');
    Object.assign(overlay.style,{position:'fixed',left:'0',right:'0',zIndex:'2147483300',background:'rgba(0,0,0,.30)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'12px',boxSizing:'border-box'});
    const placeOverlay=()=>{
      const vv=window.visualViewport;
      const top=vv?.offsetTop||0;
      const height=vv?.height||window.innerHeight;
      overlay.style.top=`${Math.round(top)}px`;
      overlay.style.height=`${Math.max(240,Math.round(height))}px`;
    };
    placeOverlay();
    const card=document.createElement('section');
    Object.assign(card.style,{width:'min(680px,100%)',maxHeight:'calc(100% - 24px)',overflowY:'auto',borderRadius:'22px',background:'#fff',color:'#17181b',padding:'18px 18px 22px',boxShadow:'0 18px 55px rgba(0,0,0,.28)'});
    const h=document.createElement('h2');h.textContent='読了文字の詳細設定';Object.assign(h.style,{margin:'0 0 16px',font:'800 20px/1.35 system-ui'});
    card.appendChild(h);

    const grid=document.createElement('div');Object.assign(grid.style,{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'});
    const mkSelect=(label,items,value)=>{
      const wrap=document.createElement('label');Object.assign(wrap.style,{display:'grid',gap:'7px',font:'700 13px/1.4 system-ui'});
      const span=document.createElement('span');span.textContent=label;
      const sel=document.createElement('select');Object.assign(sel.style,{height:'46px',border:'1px solid #d7d9de',borderRadius:'12px',background:'#fff',padding:'0 10px',font:'600 15px/1 system-ui'});
      items.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o);});
      sel.value=value;wrap.append(span,sel);return {wrap,sel};
    };
    const font=mkSelect('書体',[['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],st.fontFamily||'inherit');
    const size=mkSelect('サイズ',[['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],typeof st.size==='string'?st.size:'auto');
    grid.append(font.wrap,size.wrap);card.appendChild(grid);

    const colorTitle=document.createElement('strong');colorTitle.textContent='文字色';Object.assign(colorTitle.style,{display:'block',marginTop:'16px',font:'800 13px/1.3 system-ui'});
    const colors=document.createElement('div');Object.assign(colors.style,{display:'flex',gap:'9px',alignItems:'center',marginTop:'8px',flexWrap:'wrap'});
    const colorBtn=(text,value)=>{
      const b=document.createElement('button');b.type='button';b.textContent=text;Object.assign(b.style,{height:'42px',padding:'0 14px',borderRadius:'21px',border:'1px solid #d7d9de',background:'#fff',font:'700 14px/1 system-ui'});
      b.addEventListener('click',()=>{if(value===null)delete st.color;else st.color=value;apply();});colors.appendChild(b);
    };
    colorBtn('おまかせ',null);colorBtn('白','#ffffff');colorBtn('黒','#000000');
    const picker=document.createElement('input');picker.type='color';picker.value=/^#[0-9a-f]{6}$/i.test(st.color||'')?st.color:'#ffffff';
    Object.assign(picker.style,{width:'48px',height:'42px',border:'1px solid #d7d9de',borderRadius:'10px',padding:'4px',background:'#fff'});
    colors.appendChild(picker);card.append(colorTitle,colors);

    const foot=document.createElement('div');Object.assign(foot.style,{display:'flex',justifyContent:'flex-end',marginTop:'18px'});
    const done=document.createElement('button');done.type='button';done.textContent='完了';Object.assign(done.style,{width:'120px',height:'48px',border:'0',borderRadius:'24px',background:'#17181b',color:'#fff',font:'800 15px/1 system-ui'});
    foot.appendChild(done);card.appendChild(foot);overlay.appendChild(card);

    const apply=()=>{
      if(font.sel.value==='inherit')delete st.fontFamily;else st.fontFamily=font.sel.value;
      st.size=size.sel.value;
      syncEasyShellToWorkingDocument();
      refreshLivePlayerDocumentChrome();
      applyEndingStyleToLiveElement(st);
      syncEasyPublishButton();
      scheduleDraftSave(70);
      requestAnimationFrame(prepareLiveEndingEditor);
    };
    font.sel.addEventListener('change',apply);size.sel.addEventListener('change',apply);
    picker.addEventListener('input',()=>{st.color=picker.value;apply();});
    done.addEventListener('click',closeLiveEndingStylePanel);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeLiveEndingStylePanel();});
    document.body.appendChild(overlay);liveEndingStylePanel=overlay;
  }

  function finishLiveEndingInlineEdit({refresh=true}={}){
    const el=liveEndingInlineEl;
    if(!el)return;
    const value=String(el.textContent||'').replace(/\u00a0/g,' ').trim();
    if(endingLabelInput)endingLabelInput.value=value;
    el.removeAttribute('contenteditable');
    el.classList.remove('live-ending-inline-editing');
    liveEndingInlineEl=null;
    document.body.classList.remove('live-inline-text-edit');
    document.documentElement.style.removeProperty('--live-keyboard-inset');
    closeLiveEndingStylePanel();
    clearCoverToolbarState();
    setLiveToolbarVisible(false);
    setEndingTextValue(value,{refresh});
    if(refresh)requestAnimationFrame(prepareLiveEndingEditor);
  }

  function startLiveEndingInlineEdit(){
    if(!liveEditEnabled||autoRecActive||!player?.ended)return;
    const el=playerHost.querySelector('.sp-ending-title');
    if(!el)return;
    if(liveEndingInlineEl===el)return;
    finishLiveEndingInlineEdit({refresh:false});
    liveEndingInlineEl=el;
    document.body.classList.add('live-inline-text-edit');
    updateLiveKeyboardInset();
    requestAnimationFrame(updateLiveKeyboardInset);
    setLiveToolbarVisible(true);
    updateCoverToolbarState();
    el.setAttribute('contenteditable','true');
    el.setAttribute('role','textbox');
    el.setAttribute('aria-label','読了ページ中央の文を編集');
    el.classList.add('live-ending-inline-editing');
    el.style.outline='none';
    el.style.cursor='text';
    const sync=()=>{
      if(!liveEndingInlineEl)return;
      setEndingTextValue(String(liveEndingInlineEl.textContent||'').replace(/\u00a0/g,' '),{refresh:false});
    };
    el.addEventListener('input',sync);
    el.addEventListener('blur',()=>finishLiveEndingInlineEdit(),{once:true});
    // Focus synchronously while the first tap is still a user gesture.
    // This is required for iPhone Safari to open the keyboard on one tap.
    try{ el.focus({preventScroll:true}); }catch(_){ el.focus(); }
    try{
      const range=document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel=window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }catch(_){}
  }

  playerHost.addEventListener('sceneplayer:end',()=>{
    requestAnimationFrame(prepareLiveEndingEditor);
    requestAnimationFrame(renderDesktopLivePanel);
  });

  // Live Cover inline editor. The visible cover text is the editor itself.
  // Easy Studio owns canonical work metadata; Live Editor owns cover display overrides.
  // Left preview/direct edit and the desktop right panel edit that same display layer.
  let liveCoverInlineEl=null;
  let liveCoverInlineTarget='';
  let liveCoverTextDraft=null;

  function coverTextStateFromDocument(){
    const doc=workingDocument||{};
    const legacy=doc.cover?.text||{};
    const canonical={
      title:String(doc.title||'').trim()==='Untitled'?'':String(doc.title||''),
      subtitle:String(doc.metadata?.subtitle||''),
      author:String(doc.author||''),
      episode:String(doc.metadata?.episode||''),
      episodeTitle:String(doc.metadata?.episodeTitle||'')
    };
    // Legacy v11/v12 cover.text is read only as a fallback when canonical metadata
    // is genuinely empty. New edits never write cover.text.
    for(const key of COVER_INFO_FIELDS){
      if(!canonical[key] && Object.prototype.hasOwnProperty.call(legacy,key)){
        canonical[key]=String(legacy[key]??'');
      }
    }
    return canonical;
  }

  function coverVisibilityStateFromDocument(){
    const doc=workingDocument||{};
    const visibility=doc.cover?.visibility||{};
    const legacy=doc.cover?.text||{};
    const state={};
    for(const key of COVER_INFO_FIELDS){
      if(Object.prototype.hasOwnProperty.call(visibility,key)){
        state[key]=visibility[key]!==false;
      }else if(Object.prototype.hasOwnProperty.call(legacy,key) && String(legacy[key]??'')===''){
        // Preserve old explicit-hide semantics once, without keeping two text stores.
        state[key]=false;
      }else{
        state[key]=true;
      }
    }
    return state;
  }

  function isCoverFieldVisible(target){
    return coverVisibilityStateFromDocument()[target]!==false;
  }

  function setCoverFieldVisible(target,visible,{refresh=true}={}){
    if(!COVER_INFO_FIELDS.includes(target))return;
    if(!workingDocument)ensureWorkingDocumentFromEasy();
    workingDocument.cover ||= {};
    workingDocument.cover.visibility ||= {};
    workingDocument.cover.visibility[target]=Boolean(visible);

    // v13: once visibility is explicit, retire any legacy cover-only text override.
    if(workingDocument.cover.text){
      delete workingDocument.cover.text[target];
      if(!Object.keys(workingDocument.cover.text).length)delete workingDocument.cover.text;
    }

    updateCoverPreview();
    syncEasyPublishButton();
    scheduleDraftSave(80);
    if(refresh)refreshLivePlayerDocumentChrome();
    syncCoverVisibilityControls();
  }

  function snapshotLiveCoverTextDraft(){
    liveCoverTextDraft=coverTextStateFromDocument();
    pushLiveCoverTextDraftToEasy();
    return liveCoverTextDraft;
  }

  function ensureLiveCoverTextDraft(){
    return liveCoverTextDraft || snapshotLiveCoverTextDraft();
  }

  function pushLiveCoverTextDraftToEasy(){
    // Cover display text is separate from canonical work metadata.
    updateCoverPreview();
  }

  function syncDesktopCoverDisplayInput(target,value){
    const input=desktopLivePanelBody?.querySelector?.(`[data-cover-text-target="${target}"]`);
    if(input && document.activeElement!==input)input.value=String(value??'');
  }

  function setCoverTextValue(target,value,{refresh=true}={}){
    if(!target)return;
    const raw=String(value??'');
    if(!workingDocument)ensureWorkingDocumentFromEasy();

    // One source of truth: editing the live cover edits the same work information
    // that Easy Studio edits. Only visibility/style belong exclusively to the cover.
    workingDocument.metadata ||= {};
    if(target==='title'){
      workingDocument.title=raw;
      if(titleInput)titleInput.value=raw;
      if(coverQuickWorkTitle)coverQuickWorkTitle.value=raw;
    }else if(target==='author'){
      workingDocument.author=raw;
      if(authorInput)authorInput.value=raw;
      if(coverQuickAuthor)coverQuickAuthor.value=raw;
    }else if(target==='subtitle'){
      workingDocument.metadata.subtitle=raw;
      if(subtitleInput)subtitleInput.value=raw;
      if(coverQuickSubtitle)coverQuickSubtitle.value=raw;
    }else if(target==='episode'){
      workingDocument.metadata.episode=raw;
      if(episodeInput)episodeInput.value=raw;
      if(coverQuickEpisode)coverQuickEpisode.value=raw;
    }else if(target==='episodeTitle'){
      workingDocument.metadata.episodeTitle=raw;
      if(episodeTitleInput)episodeTitleInput.value=raw;
      if(coverQuickEpisodeTitle)coverQuickEpisodeTitle.value=raw;
    }

    // Retire the old cover-only override for the edited field.
    if(workingDocument.cover?.text){
      delete workingDocument.cover.text[target];
      if(!Object.keys(workingDocument.cover.text).length)delete workingDocument.cover.text;
    }

    const d=ensureLiveCoverTextDraft();
    d[target]=raw;
    syncDesktopCoverDisplayInput(target,raw);
    updateCoverPreview();
    syncEasyPublishButton();
    rememberWorkIdentity();
    scheduleDraftSave(90);
    if(refresh)refreshLivePlayerDocumentChrome();
  }

  function resetCoverTextOverride(target,{refresh=true}={}){
    // Kept only as a compatibility hook. v13 has no separate cover text override.
    const current=coverTextStateFromDocument()[target]||'';
    syncDesktopCoverDisplayInput(target,current);
    if(refresh)refreshLivePlayerDocumentChrome();
  }

  function setEndingTextValue(value,{refresh=true}={}){
    const raw=String(value??'');
    if(endingLabelInput)endingLabelInput.value=raw;
    workingDocument.ending ||= {};
    workingDocument.ending.label=raw.trim();
    updateEndingPreview();
    syncEasyPublishButton();
    scheduleDraftSave(90);
    if(refresh)refreshLivePlayerDocumentChrome();
  }

  function coverInputForLiveTarget(target){
    return {
      title:titleInput,
      subtitle:subtitleInput,
      author:authorInput,
      episode:episodeInput,
      episodeTitle:episodeTitleInput
    }[target]||null;
  }

  function resetLiveCoverKeyboardShift(){
    playerHost.style.removeProperty('--live-cover-keyboard-shift');
    playerHost.classList.remove('live-cover-inline-text-edit');
  }

  function keepLiveCoverCaretVisible(){
    const el=liveCoverInlineEl;
    if(!el||document.activeElement!==el)return;

    const vv=window.visualViewport;
    const viewportTop=vv?.offsetTop||0;
    const viewportHeight=vv?.height||window.innerHeight;
    const safeTop=viewportTop+70;
    const safeBottom=viewportTop+viewportHeight-88;

    let rect;
    const sel=getSelection();
    if(sel?.rangeCount){
      try{
        const range=sel.getRangeAt(0).cloneRange();
        range.collapse(false);
        rect=range.getBoundingClientRect();
      }catch(_){}
    }
    if(!rect||(!rect.width&&!rect.height))rect=el.getBoundingClientRect();

    let shift=Number.parseFloat(
      getComputedStyle(playerHost).getPropertyValue('--live-cover-keyboard-shift')
    )||0;

    if(rect.bottom>safeBottom){
      shift-=rect.bottom-safeBottom+20;
    }else if(rect.top<safeTop&&shift<0){
      shift+=Math.min(safeTop-rect.top+20,-shift);
    }

    const minShift=-Math.round(window.innerHeight*.46);
    shift=Math.max(minShift,Math.min(0,shift));
    playerHost.style.setProperty('--live-cover-keyboard-shift',`${Math.round(shift)}px`);
  }

  let liveCoverStylePanel=null;

  function ensureCoverStyleStore(target){
    workingDocument.cover ||= {};
    workingDocument.cover.styles ||= {};
    workingDocument.cover.styles[target] ||= {};
    return workingDocument.cover.styles[target];
  }
  function applyCoverStyleToLiveElement(target,style){
    const selector={
      title:'.sp-cover-title',subtitle:'.sp-cover-subtitle',author:'.sp-cover-author',
      episode:'.sp-cover-episode',episodeTitle:'.sp-cover-episode-title'
    }[target];
    const el=selector?playerHost.querySelector(selector):null;
    if(!el)return;
    const sizeScale={small:.78,normal:1,large:1.28,xl:1.6};
    const fontMap={serif:'var(--sp-font-serif)',sans:'var(--sp-font-sans)',mono:'var(--sp-font-mono)'};
    el.style.removeProperty('color');
    el.style.removeProperty('font-size');
    el.style.removeProperty('font-family');
    const baseSize=parseFloat(getComputedStyle(el).fontSize)||16;
    if(style?.color)el.style.setProperty('color',String(style.color),'important');
    if(style?.size&&style.size!=='auto'){
      const v=typeof style.size==='number'?Number(style.size):baseSize*(sizeScale[style.size]||1);
      if(Number.isFinite(v))el.style.setProperty('font-size',`${v}px`,'important');
    }
    if(style?.fontFamily&&style.fontFamily!=='inherit'){
      const v=fontMap[style.fontFamily];
      if(v)el.style.setProperty('font-family',v,'important');
    }
  }

  function closeLiveCoverStylePanel(){
    liveCoverStylePanel?._viewportAbort?.abort?.();
    liveCoverStylePanel?.remove();
    liveCoverStylePanel=null;
  }
  function openLiveCoverStylePanel(target=liveCoverInlineTarget){
    if(!target)return;
    closeLiveCoverStylePanel();
    const style=ensureCoverStyleStore(target);
    const overlay=document.createElement('div');
    Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'2147483300',background:'rgba(0,0,0,.30)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'12px'});
    const card=document.createElement('section');
    Object.assign(card.style,{width:'min(680px,100%)',borderRadius:'22px',background:'#fff',color:'#17181b',padding:'18px 18px 22px',boxShadow:'0 18px 55px rgba(0,0,0,.28)'});
    const h=document.createElement('h2');h.textContent='表紙文字の詳細設定';Object.assign(h.style,{margin:'0 0 16px',font:'800 20px/1.35 system-ui'});
    card.appendChild(h);

    const grid=document.createElement('div');Object.assign(grid.style,{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'});
    const mkSelect=(label,items,value)=>{
      const wrap=document.createElement('label');Object.assign(wrap.style,{display:'grid',gap:'7px',font:'700 13px/1.4 system-ui'});
      const span=document.createElement('span');span.textContent=label;
      const sel=document.createElement('select');Object.assign(sel.style,{height:'46px',border:'1px solid #d7d9de',borderRadius:'12px',background:'#fff',padding:'0 10px',font:'600 15px/1 system-ui'});
      items.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o);});
      sel.value=value;wrap.append(span,sel);return {wrap,sel};
    };
    const font=mkSelect('書体',[['inherit','作品設定'],['serif','明朝'],['sans','ゴシック'],['mono','等幅']],style.fontFamily||'inherit');
    const size=mkSelect('サイズ',[['auto','おまかせ'],['small','小'],['normal','標準'],['large','大'],['xl','特大']],typeof style.size==='string'?style.size:'auto');
    grid.append(font.wrap,size.wrap);card.appendChild(grid);

    const colorTitle=document.createElement('strong');
    colorTitle.textContent='文字色';
    Object.assign(colorTitle.style,{display:'block',marginTop:'16px',font:'800 13px/1.3 system-ui'});

    const colorModeWrap=document.createElement('label');
    Object.assign(colorModeWrap.style,{display:'grid',gap:'7px',marginTop:'8px',font:'700 13px/1.4 system-ui'});
    const colorModeLabel=document.createElement('span');
    colorModeLabel.textContent='色';
    const colorMode=document.createElement('select');
    Object.assign(colorMode.style,{height:'46px',border:'1px solid #d7d9de',borderRadius:'12px',background:'#fff',padding:'0 10px',font:'600 15px/1 system-ui'});
    [['auto','おまかせ'],['custom','任意色']].forEach(([v,t])=>{
      const o=document.createElement('option');o.value=v;o.textContent=t;colorMode.appendChild(o);
    });

    let activeColor=normalizeTextColor(style.color)||'#4A4A4A';
    colorMode.value=normalizeTextColor(style.color)?'custom':'auto';
    colorModeWrap.append(colorModeLabel,colorMode);

    const customColorWrap=document.createElement('div');
    Object.assign(customColorWrap.style,{display:'grid',gap:'10px',marginTop:'10px'});

    const customRow=document.createElement('div');
    Object.assign(customRow.style,{display:'grid',gridTemplateColumns:'1fr auto auto',alignItems:'center',gap:'10px'});
    const customLabel=document.createElement('span');
    customLabel.textContent='任意色';
    Object.assign(customLabel.style,{font:'700 13px/1.4 system-ui'});
    const colorCode=document.createElement('code');
    colorCode.textContent=activeColor;

    const committedPicker=makeCommittedTextColorPicker(activeColor,{
      compact:true,
      onPreview:c=>{
        colorCode.textContent=c;
        applyCoverStyleToLiveElement(target,{...style,color:c});
      },
      onCommit:c=>{
        activeColor=normalizeTextColor(c)||activeColor;
        style.color=activeColor;
        colorCode.textContent=activeColor;
        apply();
        renderPalette();
      }
    });
    customRow.append(customLabel,committedPicker.root,colorCode);

    const paletteHost=document.createElement('div');
    const renderPalette=()=>{
      paletteHost.replaceChildren(
        makeTextColorPalette(activeColor,c=>{
          activeColor=normalizeTextColor(c)||activeColor;
          committedPicker.setValue(activeColor);
          style.color=activeColor;
          apply();
          renderPalette();
        })
      );
    };
    renderPalette();

    const syncColorMode=()=>{
      const custom=colorMode.value==='custom';
      customColorWrap.hidden=!custom;
    };
    colorMode.addEventListener('change',()=>{
      if(colorMode.value==='auto'){
        delete style.color;
        apply();
      }else{
        if(!normalizeTextColor(style.color))style.color=activeColor;
        apply();
      }
      syncColorMode();
    });

    customColorWrap.append(customRow,paletteHost);
    card.append(colorTitle,colorModeWrap,customColorWrap);
    syncColorMode();

    const foot=document.createElement('div');Object.assign(foot.style,{display:'flex',justifyContent:'flex-end',marginTop:'18px'});
    const done=document.createElement('button');done.type='button';done.textContent='完了';Object.assign(done.style,{width:'120px',height:'48px',border:'0',borderRadius:'24px',background:'#17181b',color:'#fff',font:'800 15px/1 system-ui'});
    foot.appendChild(done);card.appendChild(foot);overlay.appendChild(card);

    const apply=()=>{
      if(font.sel.value==='inherit')delete style.fontFamily;else style.fontFamily=font.sel.value;
      style.size=size.sel.value;

      workingDocument.cover ||= {};
      workingDocument.cover.styles ||= {};
      workingDocument.cover.styles[target]=clone(style);

      refreshLivePlayerDocumentChrome();
      applyCoverStyleToLiveElement(target,workingDocument.cover.styles[target]);
      updateCoverPreview();
      syncEasyPublishButton();
      scheduleDraftSave(70);
    };
    font.sel.addEventListener('change',apply);
    size.sel.addEventListener('change',apply);
    done.addEventListener('click',closeLiveCoverStylePanel);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeLiveCoverStylePanel();});
    document.body.appendChild(overlay);liveCoverStylePanel=overlay;
    const abort=new AbortController();
    overlay._viewportAbort=abort;
    window.visualViewport?.addEventListener('resize',placeOverlay,{signal:abort.signal});
    window.visualViewport?.addEventListener('scroll',placeOverlay,{signal:abort.signal});
  }

  function finishLiveCoverInlineEdit({refresh=true}={}){
    const el=liveCoverInlineEl;
    if(!el)return;
    const target=liveCoverInlineTarget;
    const value=String(el.textContent||'').replace(/\u00a0/g,' ').trim();
    const d=ensureLiveCoverTextDraft();
    if(target)d[target]=value;
    pushLiveCoverTextDraftToEasy();
    el.removeAttribute('contenteditable');
    el.classList.remove('live-cover-inline-editing');
    liveCoverInlineEl=null;
    liveCoverInlineTarget='';
    document.body.classList.remove('live-inline-text-edit');
    document.documentElement.style.removeProperty('--live-keyboard-inset');
    clearCoverToolbarState();
    setLiveToolbarVisible(false);
    resetLiveCoverKeyboardShift();
    setCoverTextValue(target,value,{refresh});
  }

  function startLiveCoverInlineEdit(el,target){
    if(!liveEditEnabled||autoRecActive||!playerHost.classList.contains('sp-cover-open')||!el)return;
    if(liveCoverInlineEl===el)return;
    finishLiveCoverInlineEdit({refresh:false});
    ensureLiveCoverTextDraft();
    liveCoverInlineEl=el;
    liveCoverInlineTarget=target;
    document.body.classList.add('live-inline-text-edit');
    updateLiveKeyboardInset();
    requestAnimationFrame(updateLiveKeyboardInset);
    setLiveToolbarVisible(true);
    updateCoverToolbarState();
    const input=coverInputForLiveTarget(target);
    const canonical=String(ensureLiveCoverTextDraft()[target]||'');
    el.textContent=canonical;
    // "Untitled" is a Player fallback, not authored data. Clear it on first edit.
    if(target==='title' && !canonical.trim())el.textContent='';
    el.setAttribute('contenteditable','true');
    el.setAttribute('role','textbox');
    el.setAttribute('aria-label','表紙テキストを編集');
    el.classList.add('live-cover-inline-editing');
    el.style.outline='none';
    el.style.cursor='text';
    playerHost.classList.add('live-cover-inline-text-edit');
    playerHost.style.setProperty('--live-cover-keyboard-shift','0px');

    const abort=new AbortController();
    el._liveCoverEditAbort?.abort();
    el._liveCoverEditAbort=abort;

    const sync=()=>{
      if(liveCoverInlineEl!==el)return;
      const value=String(el.textContent||'').replace(/\u00a0/g,' ');
      const d=ensureLiveCoverTextDraft();
      d[target]=value;
      pushLiveCoverTextDraftToEasy();
      setCoverTextValue(target,value,{refresh:false});
    };
    el.addEventListener('input',()=>{
      sync();
      requestAnimationFrame(keepLiveCoverCaretVisible);
    },{signal:abort.signal});
    el.addEventListener('keyup',()=>requestAnimationFrame(keepLiveCoverCaretVisible),{signal:abort.signal});
    el.addEventListener('click',()=>requestAnimationFrame(keepLiveCoverCaretVisible),{signal:abort.signal});
    window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(()=>{keepLiveCoverCaretVisible();}),{signal:abort.signal});
    window.visualViewport?.addEventListener('scroll',()=>requestAnimationFrame(()=>{keepLiveCoverCaretVisible();}),{signal:abort.signal});
    el.addEventListener('blur',()=>finishLiveCoverInlineEdit(),{once:true,signal:abort.signal});

    // Keep focus synchronous so iPhone still opens the keyboard on the first tap.
    try{el.focus({preventScroll:true});}catch(_){el.focus();}
    try{
      const range=document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel=window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }catch(_){}

    // iOS reports the reduced visualViewport shortly after the keyboard starts.
    requestAnimationFrame(keepLiveCoverCaretVisible);
    setTimeout(()=>{keepLiveCoverCaretVisible();},120);
    setTimeout(()=>{keepLiveCoverCaretVisible();},260);
    setTimeout(()=>{keepLiveCoverCaretVisible();},420);
  }

  playerHost.addEventListener('click',(e)=>{
    if(!liveEditEnabled||autoRecActive)return;

    if(playerHost.classList.contains('sp-cover-open')){
      const map=[
        ['.sp-cover-title','title'],
        ['.sp-cover-subtitle','subtitle'],
        ['.sp-cover-author','author'],
        ['.sp-cover-episode','episode'],
        ['.sp-cover-episode-title','episodeTitle']
      ];
      for(const [selector,target] of map){
        const hit=e.target.closest?.(selector);
        if(hit){
          e.preventDefault();e.stopImmediatePropagation();
          startLiveCoverInlineEdit(hit,target);
          if(desktopLiveActive()){desktopCoverStyleTarget=target;renderDesktopLivePanel();}
          return;
        }
      }
    }

    if(!player?.ended)return;
    if(e.target.closest?.('.sp-ending-title,.sp-ending-text')){
      e.preventDefault();e.stopImmediatePropagation();
      startLiveEndingInlineEdit();
      if(desktopLiveActive())renderDesktopLivePanel();
      return;
    }
    if(e.target.closest?.('.sp-ending-left')){
      e.preventDefault();e.stopImmediatePropagation();
      finishLiveEndingInlineEdit();
      bringEndingQuickDialogToFront();
      openEndingQuickEditor('left');
      return;
    }
    if(e.target.closest?.('.sp-ending-right')){
      e.preventDefault();e.stopImmediatePropagation();
      finishLiveEndingInlineEdit();
      bringEndingQuickDialogToFront();
      openEndingQuickEditor('right');
      return;
    }
    if(e.target.closest?.('.sp-ending-cover')){
      // Fixed action, but still live: let ScenePlayerCore handle this click
      // so the author can return to the cover and run another preview pass.
      return;
    }
  },true);

  // Live Edit: main text and subtext are both direct edit targets.
  // The CSS re-enables pointer events for both nodes; this capture listener
  // wins before the stage can interpret the same tap as "next Scene".
  playerHost.addEventListener('click',(e)=>{
    if(!liveEditEnabled||autoRecActive||player?.historyOpen)return;
    if(playerHost.classList.contains('sp-cover-open')||player?.ended)return;
    if(liveInlineEditEl)return;

    const activeSubText=e.target.closest?.('.sp-scene.is-active .sp-subtext');
    const activeText=e.target.closest?.('.sp-scene.is-active .sp-text');
    if(!activeSubText&&!activeText)return;

    e.preventDefault();
    e.stopImmediatePropagation();
    setLiveToolbarVisible(true);
    startInlineTextEdit(activeSubText?'subText':'text');
  },true);
  playerHost.addEventListener('sceneplayer:coverstart',()=>{finishInlineTextEdit();finishLiveCoverInlineEdit({refresh:false});liveCoverTextDraft=coverTextStateFromDocument();pushLiveCoverTextDraftToEasy();closeLiveEditSheet();setLiveToolbarVisible(false);requestAnimationFrame(renderDesktopLivePanel);});
  playerHost.addEventListener('sceneplayer:scenechange',()=>finishLiveCoverInlineEdit({refresh:false}));
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

