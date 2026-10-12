# Auto ruby dependencies and data

- kuromoji.js 0.1.2, © takuyaa and contributors, Apache License 2.0.
  https://github.com/takuyaa/kuromoji.js
  Browser bundle and gzip dictionaries are redistributed unmodified.
  See kuromoji/LICENSE-2.0.txt and kuromoji/NOTICE.md (including MeCab-IPADIC terms).
- kanji-grades.json: only character/grade columns extracted from
  https://github.com/st-man-hori/kyoiku-kanji-api/blob/main/data/kyoiku-kanji.csv
  © st-man-hori and Kanji alive data contributors, CC BY 4.0.
  https://creativecommons.org/licenses/by/4.0/
  Derived form: arrays by grade; readings, meanings and examples are not included.
  Education kanji distribution: 80 / 160 / 200 / 202 / 193 / 191 (1,026 characters).
- difficult-words.json: Scene Studio's initial, hand-selected difficult/technical
  term list. This list is deliberately limited and editable by the author's
  per-work dictionary. It is not a reading-difficulty judgement for all Japanese.

All analysis happens in the browser's dedicated worker. Only same-origin
application/dictionary assets are requested. Work text is never submitted to
an external API. Parsed readings are stored in existing richText.ranges; the
worker and dictionary are terminated after generating a preview or when closed.
