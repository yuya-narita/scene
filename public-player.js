(() => {
  'use strict';

  const host = document.getElementById('scenePlayer');
  const opening = document.getElementById('publicOpening');
  const openingImage = document.getElementById('publicOpeningImage');
  const openingDim = document.getElementById('publicOpeningDim');
  const intro = document.getElementById('publicIntro');
  const introTitle = document.getElementById('publicIntroTitle');
  const introAuthor = document.getElementById('publicIntroAuthor');
  const introDescription = document.getElementById('publicIntroDescription');
  const startButton = document.getElementById('publicStart');
  const continueButton = document.getElementById('publicContinue');

  const ending = document.getElementById('publicEnding');
  const endingLabel = document.getElementById('publicEndingLabel');
  const endingLinks = document.getElementById('publicEndingLinks');
  const restartButton = document.getElementById('publicRestart');

  const errorPanel = document.getElementById('publicError');
  const errorMessage = document.getElementById('publicErrorMessage');
  const retryButton = document.getElementById('publicRetry');

  let player = null;
  let documentData = null;
  let shellBound = false;
  let muted = false;

  // R2 Hosting verification build.
  // Fixed to one freshly published Scene so opening index.html is enough
  // to test remote JSON + remote image/audio playback.
  const R2_HOSTING_TEST_SCENE = 'https://scene-studio-api.a-hako.workers.dev/work/6330508d9dca';
  const source = () => R2_HOSTING_TEST_SCENE;
  const storageKey = () => `scene-public-progress:${source()}`;

  function safeProgress() {
    const n = Number(localStorage.getItem(storageKey()));
    return Number.isInteger(n) && n > 0 && documentData?.scenes?.[n] ? n : 0;
  }

  function showError(error) {
    console.error(error);
    host.hidden = true;
    intro.hidden = true;
    opening.hidden = true;
    ending.hidden = true;
    errorPanel.hidden = false;
    errorMessage.textContent = `${error?.message || error}`;
  }

  function setTheme(doc) {
    const light = doc.theme === 'light';
    const bg = light ? '#f7f6f1' : '#0b1016';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    document.documentElement.style.setProperty('--public-bg', bg);
    document.documentElement.style.setProperty('--public-text', light ? '#211d18' : '#f5f5f2');
    document.documentElement.style.setProperty('--public-sub', light ? 'rgba(33,29,24,.48)' : 'rgba(245,245,242,.58)');
    document.documentElement.style.setProperty('--public-line', light ? 'rgba(33,29,24,.18)' : 'rgba(245,245,242,.16)');
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
    endingLinks.replaceChildren();

    // No forced END / つづく. Show a label only when the author explicitly set one.
    const label = String(
      doc.ending?.label ??
      doc.ending?.title ??
      ''
    ).trim();

    endingLabel.textContent = label;
    endingLabel.hidden = !label;

    for (const link of normalizedExternalLinks(doc)) {
      const a = document.createElement('a');
      a.className = 'public-ending-link';
      a.href = link.url;
      a.textContent = link.label;
      endingLinks.appendChild(a);
    }

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
    openingImage.style.backgroundPosition = 'center';
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

  function applyDocumentMeta(doc) {
    document.title = doc.title || 'Scene';
    introTitle.textContent = doc.title || 'Scene';
    introAuthor.textContent = doc.author || '';
    introDescription.textContent = doc.description || doc.subtitle || '';
    setTheme(doc);
    buildEnding(doc);
    continueButton.hidden = safeProgress() <= 0;
  }

  async function fetchScene() {
    errorPanel.hidden = true;
    const src = source();
    const response = await fetch(src, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Scene JSONを取得できませんでした (${response.status})\n${src}`);
    }

    const doc = await response.json();
    ScenePlayerCore.validate(doc);
    documentData = doc;
    applyDocumentMeta(doc);

    intro.hidden = false;
    host.hidden = true;
    ending.hidden = true;
  }

  function bindPublicControls() {
    if (!player || shellBound) return;
    shellBound = true;

    const left = player.els?.prev;
    const right = player.els?.restart;

    if (left) {
      left.hidden = false;
      left.textContent = '‹';
      left.setAttribute('aria-label', '過去Sceneを開く');
      left.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Public Player: the left header control is History, not browser/back navigation.
        // If History is already open, close it; otherwise open the visited Scene list.
        if (player.historyOpen) player.closeHistory();
        else player.openHistory();
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
    host.addEventListener('sceneplayer:end', onEnd);
  }

  function onSceneChange(e) {
    const index = Number(e.detail?.index);
    if (Number.isInteger(index) && index > 0) {
      localStorage.setItem(storageKey(), String(index));
    }
  }

  function onEnd() {
    localStorage.removeItem(storageKey());

    // Keep player/audio alive underneath the ending screen.
    // This preserves BGM/Ambient as the work's afterglow unless the Scene itself
    // explicitly issued a stop command.
    ending.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => ending.classList.add('is-visible'));
    });
  }

  function removeShellListeners() {
    host.removeEventListener('sceneplayer:scenechange', onSceneChange);
    host.removeEventListener('sceneplayer:end', onEnd);
  }

  const PUBLIC_EXIT_FADE_MS = 1600;

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
    if (player) {
      const previousPlayer = player;
      try { previousPlayer.fadeOutAudio(PUBLIC_EXIT_FADE_MS); } catch (_) {}
      destroyAfterFade(previousPlayer);
      player = null;
    }

    shellBound = false;
    muted = false;

    ending.hidden = true;
    ending.classList.remove('is-visible');

    await openingBreath();

    /*
      Make the host measurable BEFORE Core.load().
      The opening overlay is gone only when Scene 1 is ready to begin, so the
      first Scene keeps its own entrance animation instead of appearing already
      settled.
    */
    host.hidden = false;

    player = new ScenePlayerCore(host, {
      allowPrevious: true,
      endOnNextAction: true
    });

    bindPublicControls();

    await new Promise(resolve => requestAnimationFrame(resolve));

    player.load(documentData, { startAt });
    // START / CONTINUE is the trusted user gesture used to unlock iOS media.
    player.unlockAudio(true);
  }

  function showIntro() {
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
    applyDocumentMeta(documentData);
  }

  startButton.addEventListener('click', () => {
    localStorage.removeItem(storageKey());
    ensurePlayer(0);
  });

  continueButton.addEventListener('click', () => {
    ensurePlayer(safeProgress());
  });

  restartButton.addEventListener('click', () => {
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

  window.ScenePublicPlayer = {
    version: '0.3.13',
    get player(){ return player; },
    get document(){ return documentData; },
    get source(){ return source(); },
    reload(){ return fetchScene(); },
    start(index = 0){ return ensurePlayer(index); },
    close(){ return closeToSource(); }
  };

  fetchScene().catch(showError);
})();
