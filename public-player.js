(() => {
  'use strict';

  const host = document.getElementById('scenePlayer');
  const errorPanel = document.getElementById('publicError');
  const errorMessage = document.getElementById('publicErrorMessage');
  const retryButton = document.getElementById('publicRetry');
  let player = null;

  const params = new URLSearchParams(location.search);
  const requested = (params.get('src') || '').trim();
  const DEFAULT_SCENE = './works/external-signal/scene.json';

  function sceneSource() {
    return requested || DEFAULT_SCENE;
  }

  function showError(error) {
    console.error(error);
    host.hidden = true;
    errorPanel.hidden = false;
    errorMessage.textContent = `${error?.message || error}`;
  }

  async function loadScene() {
    host.hidden = false;
    errorPanel.hidden = true;

    const src = sceneSource();
    const response = await fetch(src, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Scene JSONを取得できませんでした (${response.status})\n${src}`);
    }

    const documentData = await response.json();
    ScenePlayerCore.validate(documentData);

    if (player) player.destroy();
    player = new ScenePlayerCore(host, { allowPrevious: true });
    player.load(documentData, { startAt: 0 });

    const title = documentData.title || 'Scene';
    document.title = title;
    const themeColor = documentData.theme === 'light' ? '#f7f6f1' : '#0b1016';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }

  retryButton.addEventListener('click', () => loadScene().catch(showError));

  window.ScenePublicPlayer = {
    get player(){ return player; },
    get source(){ return sceneSource(); },
    reload(){ return loadScene(); }
  };

  loadScene().catch(showError);
})();
