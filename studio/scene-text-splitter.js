(() => {
  'use strict';

  const VERSION = '1.3.1';

  function languageStats(text) {
    const s = String(text ?? '');
    const ja = (s.match(/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
    const latin = (s.match(/[A-Za-z]/g) || []).length;
    return { ja, latin };
  }

  function detectLanguage(text) {
    const raw = String(text ?? '');
    const { ja, latin } = languageStats(raw);
    // Technical tokens should not decide the prose language. Strip common URL / email
    // payloads for a second look while keeping surrounding words such as "URLは…です".
    const prose = raw
      .replace(/https?:\/\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+/gi, ' ')
      .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, ' ')
      .replace(/\b(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}(?:\/\S*)?/g, ' ');
    const clean = languageStats(prose);
    // Japanese wins whenever it is meaningfully present. This keeps Japanese prose
    // containing URLs / product names from being misclassified as English.
    if (ja >= 4 && ja >= latin * 0.08) return 'ja';
    if (clean.ja >= 2 && clean.ja >= clean.latin * 0.25) return 'ja';
    if (latin >= 4) return 'en';
    return ja > 0 ? 'ja' : 'en';
  }

  function getSplitter(language) {
    return language === 'en' ? window.EnglishSceneSplitter : window.JapaneseSceneSplitter;
  }

  function normalizeLanguageTag(tag, fallback = '') {
    const value = String(tag ?? '').trim();
    if (!value) return fallback;
    if (value === 'auto' || value === 'inherit') return value;
    // Lightweight BCP 47 shape validation. Full registry validation belongs outside runtime.
    return /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value) ? value : fallback;
  }



  /*
   * v1.3 — viewport density guard
   *
   * The language splitters decide semantic / rhetorical boundaries first.
   * This final pass only intervenes when one generated Scene becomes visually
   * too tall for tap-reading, especially prose that contains many short lines.
   * It cuts only at existing line boundaries and prefers the language
   * splitter's own boundary score near the visual target.
   */
  function visualRows(text, language = 'ja') {
    const wrap = language === 'en' ? 48 : 27;
    return String(text ?? '').split('\n').reduce((sum, raw) => {
      const line = raw.trim();
      if (!line) return sum + 1;
      return sum + Math.max(1, Math.ceil([...line].length / wrap));
    }, 0);
  }

  function boundaryPreference(language, prev, next) {
    let score = 28;
    const a = String(prev ?? '').trim();
    const b = String(next ?? '').trim();
    if (language === 'ja' && window.JapaneseSceneSplitter) {
      try {
        const generic = window.JapaneseSceneSplitter.boundaryScore?.(
          { text: prev }, { text: next }, { authorLineBreak: true }
        );
        if (Number.isFinite(generic?.score)) score = generic.score;
        const role = window.JapaneseSceneSplitter.roleBoundaryScore?.(prev, next);
        if (Number.isFinite(role?.score)) score += role.score * 0.55;
        const dep = window.JapaneseSceneSplitter.dependencyValue?.(prev, next);
        if (Number.isFinite(dep?.value)) score -= dep.value * 0.18;
      } catch (_) {}
    }
    if (/^(?:だから|なので|そのため|つまり|というのも|なぜなら|そしてまた)/.test(b)) score -= 18;

    if (language === 'ja') {
      // Do not cut a syntactic continuation merely to satisfy viewport height.
      // Examples: 「ニコニコしながら / 近づいてくる。」
      //           「踊り出して、 / めちゃくちゃ楽しそう…」
      if (/[、，,]$/.test(a)) score -= 82;
      if (/(?:ながら|つつ|たり|たりして|て|で|ので|から|けど|けれど|のに|まま|ついでに)$/.test(a)) score -= 68;
      if (/(?:という|っていう|みたいな|ような|ための|ことを|ものを|のを)$/.test(a)) score -= 54;

      // A line without sentence-closing punctuation is usually one thought
      // continuing onto the next source line. Keep it together unless a very
      // strong rhetorical boundary outweighs this penalty.
      if (!/[。！？!?…」』”’）)]$/.test(a) && a.length >= 5) score -= 34;

      // Conversely, a complete sentence followed by a new sentence is a safe
      // viewport boundary. This small bonus prevents balance alone from winning.
      if (/[。！？!?」』”’]$/.test(a) && /^[^、，,]/.test(b)) score += 10;
    }
    return score;
  }

  function splitOversizeChunk(chunk, language, options = {}) {
    const maxRows = Math.max(6, Number(options.maxVisualRows) || 8);
    const targetRows = Math.max(4, Number(options.targetVisualRows) || Math.max(5, maxRows - 2));
    const minRows = Math.max(2, Number(options.minVisualRows) || 3);
    const rawLines = String(chunk?.text ?? '').split('\n');
    const lines = rawLines.map(s => s.trim()).filter(Boolean);
    if (lines.length < 2 || visualRows(chunk.text, language) <= maxRows) return [chunk];

    const groups = [];
    let start = 0;
    while (start < lines.length) {
      const remainingText = lines.slice(start).join('\n');
      if (visualRows(remainingText, language) <= maxRows) {
        groups.push(lines.slice(start));
        break;
      }

      let best = null;
      for (let cut = start + 1; cut < lines.length; cut++) {
        const left = lines.slice(start, cut).join('\n');
        const right = lines.slice(cut).join('\n');
        const leftRows = visualRows(left, language);
        const rightRows = visualRows(right, language);
        if (leftRows < minRows) continue;
        if (leftRows > maxRows + 1) break;

        const closeness = 24 - Math.abs(leftRows - targetRows) * 4;
        const boundary = boundaryPreference(language, lines[cut - 1], lines[cut]);
        const avoidTinyTail = rightRows < minRows ? -26 : 0;
        const score = closeness + boundary + avoidTinyTail;
        if (!best || score > best.score) best = { cut, score };
      }

      if (!best) {
        let cut = start + 1;
        while (cut < lines.length && visualRows(lines.slice(start, cut + 1).join('\n'), language) <= maxRows) cut++;
        best = { cut: Math.max(start + 1, cut - 1), score: 0 };
      }

      groups.push(lines.slice(start, best.cut));
      start = best.cut;
    }

    if (groups.length <= 1) return [chunk];
    return groups.filter(group => group.length).map((group, index) => {
      const text = group.join('\n').trim();
      return {
        ...chunk,
        text,
        reason: index === groups.length - 1 ? (chunk.reason || 'viewport-density') : 'viewport-density',
        debug: {
          ...(chunk.debug || {}),
          viewportDensity: true,
          viewportPart: index + 1,
          viewportParts: groups.length,
          visualRows: visualRows(text, language),
          maxVisualRows: maxRows
        }
      };
    });
  }

  function refineViewportDensity(chunks, language, options = {}) {
    if (options.viewportAware === false) return chunks;
    const enabled = options.viewportAware === true || options.maxVisualRows != null;
    if (!enabled) return chunks;
    return (chunks || []).flatMap(chunk => splitOversizeChunk(chunk, language, options));
  }

  function splitWith(language, text, options) {
    const splitter = getSplitter(language);
    if (!splitter?.splitDetailed) throw new Error(`No Scene splitter available for ${language}`);
    const chunks = splitter.splitDetailed(text, { ...options, language }).map(chunk => ({ ...chunk, language }));
    return refineViewportDensity(chunks, language, options);
  }

  function splitBlock(block, options) {
    const lines = String(block).split('\n');
    const meaningful = lines.filter(line => line.trim());
    const lineLanguages = meaningful.map(detectLanguage);
    const hasMixedLines = new Set(lineLanguages).size > 1;

    // Multilingual authoring commonly uses one language per line / paragraph.
    // Preserve that boundary and delegate each run to its language-specific splitter.
    if (hasMixedLines) {
      const runs = [];
      let lang = null;
      let buffer = [];
      const flush = () => {
        const text = buffer.join('\n').trim();
        if (text) runs.push({ language: lang || detectLanguage(text), text });
        buffer = [];
      };
      for (const line of lines) {
        if (!line.trim()) { buffer.push(line); continue; }
        const next = detectLanguage(line);
        if (lang && next !== lang && buffer.some(x => x.trim())) flush();
        lang = next;
        buffer.push(line);
      }
      flush();
      return runs.flatMap(run => splitWith(run.language, run.text, options));
    }

    const language = detectLanguage(block);
    return splitWith(language, block, options);
  }

  function splitMultilingualDetailed(text, options = {}) {
    const normalized = String(text ?? '').replace(/\r\n?/g, '\n').trim();
    if (!normalized) return [];
    const blocks = normalized.split(/(?:\n[ \t]*){2,}/).map(x => x.trim()).filter(Boolean);
    return blocks.flatMap(block => splitBlock(block, options));
  }

  function summarizeLanguages(chunks) {
    const languages = [];
    for (const chunk of chunks || []) {
      const lang = normalizeLanguageTag(chunk?.language);
      if (lang && !languages.includes(lang)) languages.push(lang);
    }
    return {
      language: languages.length > 1 ? 'mul' : (languages[0] || 'und'),
      languages
    };
  }

  function splitDetailed(text, options = {}) {
    const requested = normalizeLanguageTag(options.language, 'auto');
    if (requested && !['auto', 'mul'].includes(requested)) {
      return splitWith(requested, text, options);
    }
    if (requested === 'mul' || options.multilingual === true) {
      return splitMultilingualDetailed(text, options);
    }

    // v1.2 Auto policy:
    // Decide the prose language from the WHOLE document and delegate the whole
    // document to one language splitter. Do not switch splitter just because a
    // short paragraph/line contains English product names or technical tokens
    // such as "Scene", "TAP", "Splitter", "BGM", etc.
    //
    // True multilingual authoring is still available explicitly with:
    //   language: 'mul'  or  multilingual: true
    const normalized = String(text ?? '').replace(/\r\n?/g, '\n').trim();
    if (!normalized) return [];

    const language = detectLanguage(normalized);
    return splitWith(language, normalized, options);
  }

  function split(text, options = {}) { return splitDetailed(text, options).map(x => x.text); }

  window.SceneTextSplitter = Object.freeze({
    version: VERSION,
    detectLanguage,
    languageStats,
    normalizeLanguageTag,
    summarizeLanguages,
    split,
    splitDetailed,
    splitMultilingualDetailed,
    visualRows,
    refineViewportDensity,
    getSplitter
  });
})();
