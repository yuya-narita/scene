/* A single, local loading Scene. No Player, media, timers or network requests. */
(function (global) {
  'use strict';
  const scenes = [
  {
    "text": "あ箱から、時々一冊。",
    "effect": "fade"
  },
  {
    "text": "文章の「次」を、まだ見せない。",
    "effect": "typewriter"
  },
  {
    "text": "この箱、文字より余白が多い。",
    "effect": "tilt"
  },
  {
    "text": "あなたの知らない一冊が、ある。",
    "effect": "fade"
  },
  {
    "text": "誰かが書いた。あなたが来た。",
    "effect": "fade"
  },
  {
    "text": "ここに来るまで、出会わなかった。",
    "effect": "blur"
  },
  {
    "text": "よう来たな。好きなとこ座って。",
    "effect": "pop"
  },
  {
    "text": "読みかけのままでも、おかえり。",
    "effect": "fade"
  },
  {
    "text": "今日は、どの世界へ？",
    "effect": "typewriter"
  },
  {
    "text": "この本、さっき少し動いた。",
    "effect": "pulse"
  },
  {
    "text": "今、誰かがページの裏にいる。",
    "effect": "typewriter"
  },
  {
    "text": "まだ読んでないのに、懐かしい。",
    "effect": "blur"
  },
  {
    "text": "この一文、前にも見た？",
    "effect": "glitchHit"
  },
  {
    "text": "今の一文、誰の声で読んだ？",
    "effect": "fade"
  },
  {
    "text": "書いてない声まで、聞こえた？",
    "effect": "whisper"
  },
  {
    "text": "ニクスはもう来てる。",
    "effect": "pop"
  },
  {
    "text": "本を並べた。順番は忘れた。",
    "effect": "tilt"
  },
  {
    "text": "一冊だけ読む、って言ったよね？",
    "effect": "pop"
  },
  {
    "text": "あの続きを、まだ覚えてる？",
    "effect": "blur"
  },
  {
    "text": "書きかけにも、帰る場所がある。",
    "effect": "fade"
  },
  {
    "text": "この棚には、この人の時間がある。",
    "effect": "fade"
  },
  {
    "text": "少しだけ、頭の中をお借りします。",
    "effect": "blur"
  },
  {
    "text": "到着。読者の方が先。",
    "effect": "fade",
    "view": "chat",
    "name": "ニクス",
    "icon": "🕶️",
    "side": "left"
  },
  {
    "text": "あ、来てくれた！",
    "effect": "pop",
    "view": "chat",
    "name": "クエリナ",
    "icon": "🌸",
    "side": "right"
  },
  {
    "text": "ここで待ってたら本棚出てきた",
    "effect": "fade",
    "view": "board"
  },
  {
    "text": "今の一文、読めた奴いる？",
    "effect": "fade",
    "view": "board"
  }
];
  // All loading hosts in one visit share one Scene, including swipe snapshots.
  const scene = scenes[Math.floor(Math.random() * scenes.length)];
  function mount(host) {
    if (!host || host.dataset.waitMounted === 'true') return;
    host.dataset.waitMounted = 'true';
    host.classList.add('ahako-shelf-wait');
    host.dataset.effect = scene.effect;
    host.dataset.view = scene.view || 'text';
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
    if (scene.view === 'chat') {
      const row = document.createElement('div');
      row.className = 'ahako-wait-chat';
      row.dataset.side = scene.side;
      const icon = document.createElement('span');
      icon.className = 'ahako-wait-chat-icon';
      icon.textContent = scene.icon;
      const body = document.createElement('div');
      const name = document.createElement('small');
      name.className = 'ahako-wait-chat-name';
      name.textContent = scene.name;
      body.append(name, text);
      row.append(icon, body);
      row.setAttribute('aria-hidden', 'true');
      host.replaceChildren(row);
    } else if (scene.view === 'board') {
      const post = document.createElement('div');
      post.className = 'ahako-wait-board';
      const head = document.createElement('small');
      head.textContent = '1 名前：名無しさん';
      post.append(head, text);
      post.setAttribute('aria-hidden', 'true');
      host.replaceChildren(post);
    } else host.replaceChildren(text);
  }
  global.AhakoShelfWait = Object.freeze({ mount });
  document.querySelectorAll('[data-ahako-shelf-wait]').forEach(mount);
})(window);
