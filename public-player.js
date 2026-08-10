(() => {
  'use strict';

  const host = document.getElementById('scenePlayer');
  const intro = document.getElementById('publicIntro');
  const introTitle = document.getElementById('publicIntroTitle');
  const introAuthor = document.getElementById('publicIntroAuthor');
  const introDescription = document.getElementById('publicIntroDescription');
  const startButton = document.getElementById('publicStart');
  const continueButton = document.getElementById('publicContinue');
  const introBack = document.getElementById('publicIntroBack');
  const ending = document.getElementById('publicEnding');
  const endingTitle = document.getElementById('publicEndingTitle');
  const previousLink = document.getElementById('publicPrevious');
  const nextLink = document.getElementById('publicNext');
  const indexButton = document.getElementById('publicIndex');
  const restartButton = document.getElementById('publicRestart');
  const errorPanel = document.getElementById('publicError');
  const errorMessage = document.getElementById('publicErrorMessage');
  const retryButton = document.getElementById('publicRetry');

  let player = null;
  let documentData = null;
  let shellBound = false;

  const params = new URLSearchParams(location.search);
  const requested = (params.get('src') || '').trim();
  const DEFAULT_SCENE = './works/external-signal/scene.json';
  const source = () => requested || DEFAULT_SCENE;
  const storageKey = () => `scene-public-progress:${source()}`;

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

  function applyDocumentMeta(doc) {
    document.title = doc.title || 'Scene';
    introTitle.textContent = doc.title || 'Scene';
    introAuthor.textContent = doc.author || '';
    introDescription.textContent = doc.description || doc.subtitle || '';
    endingTitle.textContent = doc.ending?.title || 'つづく';

    const nav = doc.navigation || doc.player?.navigation || {};
    const previous = nav.previous || params.get('prev');
    const next = nav.next || params.get('next');
    const index = nav.index || params.get('index');

    previousLink.hidden = !previous;
    nextLink.hidden = !next;
    if (previous) previousLink.href = previous;
    if (next) nextLink.href = next;
    if (index) {
      introBack.hidden = false;
      introBack.onclick = () => location.href = index;
      indexButton.onclick = () => location.href = index;
    } else {
      introBack.hidden = true;
      indexButton.onclick = showIntro;
    }

    const themeColor = doc.theme === 'light' ? '#f7f6f1' : '#0b1016';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    document.documentElement.style.setProperty('--public-bg', themeColor);
    document.documentElement.style.setProperty('--public-text', doc.theme === 'light' ? '#211d18' : '#f5f5f2');
    document.documentElement.style.setProperty('--public-sub', doc.theme === 'light' ? 'rgba(33,29,24,.48)' : 'rgba(245,245,242,.58)');
    document.documentElement.style.setProperty('--public-line', doc.theme === 'light' ? 'rgba(33,29,24,.18)' : 'rgba(245,245,242,.16)');

    const progress = safeProgress();
    continueButton.hidden = progress <= 0;
  }

  async function fetchScene() {
    errorPanel.hidden = true;
    const src = source();
    const response = await fetch(src, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Scene JSONを取得できませんでした (${response.status})\n${src}`);
    const doc = await response.json();
    ScenePlayerCore.validate(doc);
    documentData = doc;
    applyDocumentMeta(doc);
    intro.hidden = false;
    host.hidden = true;
  }

  function bindPublicControls() {
    if (!player || shellBound) return;
    shellBound = true;

    const left = player.els?.prev;
    const right = player.els?.restart;
    if (left) {
      left.hidden = false;
      left.textContent = '‹';
      left.setAttribute('aria-label', '作品入口へ戻る');
      left.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        showIntro();
      }, true);
    }
    if (right) {
      right.textContent = '♪';
      right.setAttribute('aria-label', '音声をオン・オフ');
      right.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const muted = player.toggleMuted();
        right.classList.toggle('is-muted', muted);
        right.textContent = muted ? '♪' : '♪';
      }, true);
    }

    host.addEventListener('sceneplayer:scenechange', (e) => {
      const index = Number(e.detail?.index);
      if (Number.isInteger(index) && index > 0) localStorage.setItem(storageKey(), String(index));
    });

    host.addEventListener('sceneplayer:end', () => {
      localStorage.removeItem(storageKey());
      ending.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => ending.classList.add('is-visible')));
    });
  }

  function ensurePlayer(startAt = 0) {
    if (player) player.destroy();
    shellBound = false;
    player = new ScenePlayerCore(host, { allowPrevious: true, endOnNextAction: true });
    bindPublicControls();
    player.load(documentData, { startAt });
    // The START/CONTINUE click is the trusted user gesture for iOS audio.
    player.unlockAudio(true);
    host.hidden = false;
    intro.hidden = true;
    ending.hidden = true;
    ending.classList.remove('is-visible');
  }

  function showIntro() {
    ending.classList.remove('is-visible');
    ending.hidden = true;
    host.hidden = true;
    intro.hidden = false;
    applyDocumentMeta(documentData);
  }

  startButton.addEventListener('click', () => {
    localStorage.removeItem(storageKey());
    ensurePlayer(0);
  });
  continueButton.addEventListener('click', () => ensurePlayer(safeProgress()));
  restartButton.addEventListener('click', () => {
    localStorage.removeItem(storageKey());
    ensurePlayer(0);
  });
  retryButton.addEventListener('click', () => fetchScene().catch(showError));

  window.ScenePublicPlayer = {
    get player(){ return player; },
    get document(){ return documentData; },
    get source(){ return source(); },
    reload(){ return fetchScene(); },
    start(index=0){ return ensurePlayer(index); }
  };

  fetchScene().catch(showError);
})();
