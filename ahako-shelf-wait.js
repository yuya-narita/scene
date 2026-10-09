/* A single, local loading Scene. No Player, media, timers or network requests. */
(function (global) {
  'use strict';
  const scenes = [
    { text: 'この向こうに、誰かの一冊。', effect: 'fade' },
    { text: 'まだ知らない「次」が、待っている。', effect: 'blur' },
    { text: '本棚の向こうで、物語が待ち合わせ。', effect: 'fade' },
    { text: 'さて、今日はどの世界へ？', effect: 'typewriter' },
    { text: 'あ箱から、時々一冊。', effect: 'typewriter' }
  ];
  // All loading hosts in one visit share one Scene, including swipe snapshots.
  const scene = scenes[Math.floor(Math.random() * scenes.length)];
  function mount(host) {
    if (!host || host.dataset.waitMounted === 'true') return;
    host.dataset.waitMounted = 'true';
    host.classList.add('ahako-shelf-wait');
    host.dataset.effect = scene.effect;
    host.setAttribute('role', 'status');
    host.setAttribute('aria-label', scene.text + ' 本棚を読み込み中');
    const text = document.createElement('p');
    text.className = 'ahako-shelf-wait-text';
    text.setAttribute('aria-hidden', 'true');
    if (scene.effect === 'typewriter') {
      for (const [index, character] of Array.from(scene.text).entries()) {
        const span = document.createElement('span');
        span.textContent = character;
        span.style.animationDelay = `${index * 65}ms`;
        text.append(span);
      }
    } else text.textContent = scene.text;
    host.replaceChildren(text);
  }
  global.AhakoShelfWait = Object.freeze({ mount });
  document.querySelectorAll('[data-ahako-shelf-wait]').forEach(mount);
})(window);
