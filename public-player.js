(() => {
  'use strict';

  const host = document.getElementById('scenePlayer');
  const intro = document.getElementById('publicIntro');
  const introTitle = document.getElementById('publicIntroTitle');
  const introAuthor = document.getElementById('publicIntroAuthor');
  const introDescription = document.getElementById('publicIntroDescription');
  const startButton = document.getElementById('publicStart');
  const continueButton = document.getElementById('publicContinue');

  const ending = document.getElementById('publicEnding');
  const endingLabel = document.getElementById('publicEndingLabel');
  const endingLinks = document.getElementById('publicEndingLinks');
  const returnButton = document.getElementById('publicReturn');
  const restartButton = document.getElementById('publicRestart');

  const errorPanel = document.getElementById('publicError');
  const errorMessage = document.getElementById('publicErrorMessage');
  const retryButton = document.getElementById('publicRetry');

  let player = null;
  let documentData = null;
  let shellBound = false;
  let muted = false;

  const params = new URLSearchParams(location.search);
  const requested = (params.get('src') || '').trim();
  const DEFAULT_SCENE = './works/external-signal/scene.json';
  const source = () => requested || DEFAULT_SCENE;
  const storageKey = () => `scene-public-progress:${source()}`;

  const queryReturn = (params.get('return') || '').trim();
  const queryReturnLabel = (params.get('returnLabel') || '').trim();

  function safeProgress() {
    const n = Number(localStorage.getItem(storageKey()));
    return Number.isInteger(n) && n > 0 && documentData?.scenes?.[n] ? n : 0;
  }

  function showError(error) {
    console.error(error);
    host.hidden = true;
    intro.hidden = true;
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

  function returnConfig(doc) {
    const nav = doc.navigation || doc.player?.navigation || {};
    const endingReturn = doc.ending?.return || {};
    const url = queryReturn ||
      String(endingReturn.url || nav.returnUrl || doc.returnUrl || '').trim();

    const label = queryReturnLabel ||
      String(endingReturn.label || nav.returnLabel || doc.returnLabel || '元のページへ戻る').trim();

    return { url, label };
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

    const ret = returnConfig(doc);
    returnButton.textContent = ret.label || '元のページへ戻る';

    // If an explicit URL exists, always show.
    // If not, browser back is useful only when this page was reached from elsewhere.
    // Some publishing sites intentionally suppress document.referrer.
    // Browser history can still return to the source page, so do not require
    // referrer metadata in order to expose the return action.
    const canHistoryBack = history.length > 1;
    returnButton.hidden = !(ret.url || canHistoryBack);

    returnButton.onclick = () => {
      stopForExit();
      if (ret.url) {
        location.href = ret.url;
        return;
      }
      history.back();
    };
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
      left.setAttribute('aria-label', 'Sceneを閉じる');
      left.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeToSource();
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
      try { player.destroy(); } catch (_) {}
      player = null;
      shellBound = false;
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

  function ensurePlayer(startAt = 0) {
    if (player) {
      try { player.destroy(); } catch (_) {}
    }

    shellBound = false;
    muted = false;

    /*
      IMPORTANT:
      Make the host measurable BEFORE Core.load().
      v0.2 loaded while `display:none`, so the first Scene could calculate its
      landing position against a zero-sized viewport and appear too high.
    */
    intro.hidden = true;
    ending.hidden = true;
    ending.classList.remove('is-visible');
    host.hidden = false;

    player = new ScenePlayerCore(host, {
      allowPrevious: true,
      endOnNextAction: true
    });

    bindPublicControls();

    // Wait one rendered frame so the public host has its real iPhone/desktop size.
    requestAnimationFrame(() => {
      player.load(documentData, { startAt });
      // START / CONTINUE is the user gesture used to unlock iOS media.
      player.unlockAudio(true);
    });
  }

  function showIntro() {
    ending.classList.remove('is-visible');
    ending.hidden = true;

    if (player) {
      try { player.destroy(); } catch (_) {}
      player = null;
      shellBound = false;
    }

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

  window.ScenePublicPlayer = {
    version: '0.3.1',
    get player(){ return player; },
    get document(){ return documentData; },
    get source(){ return source(); },
    reload(){ return fetchScene(); },
    start(index = 0){ return ensurePlayer(index); },
    close(){ return closeToSource(); }
  };

  fetchScene().catch(showError);
})();
