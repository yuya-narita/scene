(function(global){
  'use strict';

  const STORAGE_KEY = 'scene-studio-ui-language';
  const SUPPORTED = new Set(['ja','en']);

  const M = {
    ja: {

      'menu.label':'メニュー','menu.language':'言語','draft.toolbarAria':'制作中の作品',
      'preview.cover':'表紙','preview.edit':'タップして編集','preview.coverEdit':'表紙を編集','preview.coverText':'表紙テキスト。タップして編集','preview.ending':'読了ページ','preview.endingAria':'読了ページ プレビュー','cover.start':'はじめる',
      'sample.replaceTitle':'入力中の文章を置き換えますか？','sample.replaceText':'現在のタイトルと本文をサンプルに置き換えます。置き換え後も「元に戻す」で1回だけ戻せます。','sample.replaceAction':'サンプルに置き換える',
      'cover.quick.title':'表紙を編集','cover.quick.subtitle':'サブタイトル','cover.quick.episode':'話数','cover.quick.episodeTitle':'今回のタイトル','cover.quick.logoChoose':'作品ロゴ（透過PNG）を選ぶ / 変更','cover.quick.logoRemove':'作品ロゴを外す','cover.quick.imageChoose':'表紙画像を選ぶ / 変更','cover.quick.imageRemove':'表紙画像を外す','cover.quick.note':'入力は表紙プレビューへ即時反映されます。','common.done':'完了',
      'ending.quick.center':'中央の文','ending.quick.small':'小さい文字','ending.quick.button':'ボタン名','ending.quick.link':'リンク','ending.quick.clear':'このボタンを空にする','ending.quick.recent':'最近使ったもの','ending.quick.saved':'この端末に保存','ending.quick.left':'左ボタン','ending.quick.right':'右ボタン','ending.quick.empty':'まだありません','ending.quick.previous':'前の話','ending.quick.next':'続き','ending.quick.fixed':'「表紙に戻る」は固定です',
      'advanced.backToEasy':'Easy編集に戻る','advanced.fineTune':'細かく調整','preview.workAria':'作品をプレビュー',
      'alert.logoPng':'作品ロゴは透過PNGを選んでください。','alert.logoRead':'作品ロゴを読み込めませんでした。','alert.imageRead':'画像を読み込めませんでした。もう一度選択してください。',
      'work.authorHistory':'この端末で以前使った作者名を候補に表示します。','work.description':'ひとこと','work.description.ph':'例：声が重なる街で、ひとりだけ違う声を聞いた。','work.description.help':'リンクカードなどで作品を短く紹介するための文章です。','ending.heading':'読了ページ','ending.note':'最後の余韻と、その後の導線を設定します。入力内容は下のプレビューへ即時反映されます。読了後、約3秒の余韻を置いてボタンを表示します。','ending.label.ph':'例：つづく','ending.preview.default':'読了','ending.cover':'表紙に戻る','cover.preview.untitled':'Untitled',
      'intro.title':'「間」まで、書きたい。',
      'intro.body':'次の文章を、まだ見せない体験にします。',
      'field.title':'作品タイトル','field.title.ph':'例：声のそろう通り',
      'field.author':'作者名','common.optional':'任意','field.author.ph':'例：Yuya Narita',
      'field.body':'本文','field.body.ph':'ここに文章を貼り付けてください。',
      'body.chars':'{n}文字','body.sample':'サンプルを入れる',
      'theme.heading':'雰囲気','theme.note':'あとから変えられます',
      'theme.light':'文章・エッセイ','theme.dark':'SF・ホラー','theme.cinema':'余白・映画的',
      'font.heading':'作品の書体','font.note':'全Sceneの基本になります',
      'font.serif':'明朝','font.serif.note':'物語・文章向け',
      'font.sans':'ゴシック','font.sans.note':'説明・現代的',
      'font.mono':'等幅','font.mono.note':'端末・ログ向け',
      'split.summary':'シーン分割を調整','split.guide':'1シーンの目安',
      'density.short':'短め','density.normal':'標準','density.long':'長め',
      'split.note':'空行・会話文・箇条書き・改行を優先し、最後に句点と文字数で整えます。',
      'cinema.bg':'背景画像','cinema.bg.note':'Scene Formatの背景としてPlayerへ渡します。',
      'cinema.dark':'暗く','cinema.light':'明るく','cinema.choose':'画像を選ぶ','cinema.remove':'画像を外す',
      'make':'箱詰め','make.note':'文章をSceneに分け、ひとつずつ表示します',
      'advanced.open':'細かく調整','io.heading':'作品ファイル','io.export':'設計図を書き出す','io.import':'設計図を読み込む','io.packageExport':'完全パッケージを書き出す','io.packageImport':'完全パッケージを読み込む','io.exported':'書き出しました：{name}','io.imported':'読み込みました：{name}（{n} Scenes）','io.invalid':'Scene Format v1として読み込めません。','io.localAssets':'ローカル画像・音声の参照が{n}件あります。同じブラウザセッション外では再選択が必要です。','io.packageExported':'完全パッケージを書き出しました：{name}（Assets {n}件）','io.packageImported':'完全パッケージを読み込みました：{name}（{n} Scenes / Assets {a}件復元）','io.packageFailed':'完全パッケージを書き出せませんでした。','io.packageInvalid':'Scene Packageとして読み込めません。','footer.note':'あなたの文章を、あ箱へ。',
      'advanced.title':'シーンを調整','common.preview':'プレビュー',
      'nav.previous.policy':'読者が過去Sceneへ戻れる','nav.previous.note':'戻るボタン・スワイプ・キーボードをまとめて制御します。',
      'scene.text':'本文','scene.subtext':'サブテキスト','scene.subtext.ph':'補足が必要なSceneだけ',
      'scene.type':'種類','scene.type.text':'テキスト','scene.type.dialogue':'セリフ','scene.type.sound':'音だけ',
      'scene.display':'表示','scene.display.stack':'前の文章を残す','scene.display.solo':'この文章だけ',
      'scene.effect':'出かた','effect.auto':'おまかせ','effect.fade':'フェード','effect.pop':'ポンと出る','effect.blur':'ぼやけて現れる',
      'effect.whisper':'そっと現れる','effect.loud':'強く出る','effect.pulse':'脈打つ','effect.shake':'揺れる','effect.tilt':'傾く','effect.slow':'ゆっくり','effect.none':'演出なし',
      'scene.size':'文字サイズ','size.auto':'おまかせ','size.small':'小','size.normal':'標準','size.large':'大','size.xl':'特大',
      'scene.font':'このSceneの書体','font.inherit':'作品設定を使う','scene.language':'このSceneの言語','scene.language.auto':'自動判定','scene.language.ja':'日本語','scene.language.en':'English','scene.language.custom':'その他','scene.language.tag':'言語タグ',
      'edit.merge':'前と結合','edit.split':'カーソル位置で分割','edit.delete':'削除',
      'section.background':'背景','background.mode':'このSceneの背景','background.inherit':'前Sceneから継続','background.image':'このSceneで画像を変更','background.clear':'このSceneで背景を解除',
      'background.choose':'画像を選ぶ','background.unselect':'選択解除','asset.applyUrl':'URLを反映','asset.invalidUrl':'有効なURLまたは相対パスを入力してください。','background.transition':'切替','background.fit':'表示','background.motion':'動き','background.dim':'暗さ','background.thin':'薄さ',
      'transition.fade':'フェード','transition.cut':'カット','transition.flash':'フラッシュ','transition.glitch':'グリッチ',
      'fit.cover':'画面を埋める','fit.contain':'全体を収める',
      'motion.none':'なし','motion.slowZoom':'ゆっくりズーム','motion.breath':'呼吸','motion.panLeft':'左へ流す','motion.panRight':'右へ流す','motion.panUp':'上へ流す','motion.panDown':'下へ流す',
      'section.audio':'音','audio.operation':'操作','audio.inherit':'継続（指定なし）','audio.start':'このSceneで開始','audio.volumeChange':'音量を変更','audio.stop':'このSceneで停止',
      'audio.bgm.note':'続いていた時間','audio.ambient.note':'その時そこにあった音','audio.se.note':'その時起きた音',
      'audio.chooseBgm':'BGMを選ぶ','audio.chooseAmbient':'持続音を選ぶ','audio.chooseSe':'SEを選ぶ','audio.notSelected':'未選択','audio.configured':'設定済み',
      'audio.loop':'ループ','audio.volume':'音量','audio.seEnable':'このSceneでSEを鳴らす',
      'audio.hint':'BGMは「続いていた時間」、Ambientは「その時そこにあった音」、SEは「その時起きた音」として扱います。何も指定しなければ前Sceneの状態を継続します。',
      'preview.return':'編集に戻る','alert.audio':'音声ファイルを選択してください。',
      'scene.count':'{n} Scenes',
      'player.previous':'過去Scene','player.restart':'最初から','player.history':'過去Sceneをスクロール','player.history.close':'履歴を閉じる',

      'file.open':'作品を開く','file.export':'作品を書き出す','draft.manager':'制作中一覧','draft.new':'＋ 新しく作る','draft.new.note':'新しい下書き','draft.saved':'自動保存済み','draft.full':'下書きが10件あります','draft.saveFailedNew':'現在の作品を自動保存できなかったため、新しい作品には切り替えませんでした。',
      'work.info':'作品情報・表紙','work.subtitle':'サブタイトル','work.language':'言語','work.series':'シリーズ名','work.episode':'話数表記','work.cover':'表紙画像','work.cover.choose':'表紙画像を選ぶ','work.cover.remove':'表紙画像を外す','work.cover.empty':'画像なしでもOK','work.cover.note':'Easyでは画像だけ指定します。細かな表紙編集はAdvancedへ。','work.cover.saveNote':'画像は中央・coverで保存します。タイトル等は作品情報として別に保持されます。','work.developer':'開発者向け','work.subtitle.ph':'例：冷やせれば勝ちやろ','work.series.ph':'例：貧乏メガネのシノ','work.episode.ph':'例：第1話 / EPISODE 01 / PROLOGUE','work.language.auto':'自動判定','work.language.ja':'日本語','work.language.en':'English','work.language.mul':'複数言語','common.optional.free':'任意・自由入力','common.open':'開く','draft.footer':'制作途中は端末内に自動保存されます。ここから公開・共有・公開停止・再公開・削除できます。','common.close':'閉じる','scene.effectOnly':'演出のみ','scene.empty':'空Scene','background.changeOverlay':'このSceneから背景変更',
      'auto.heading':'AUTOタイミング','auto.reset':'標準に戻す','auto.second':'秒','auto.unrecorded':'未記録・標準 {s}s','auto.recorded':'記録済み {s}s','auto.hint':'REC後にミスしたSceneだけ微調整できます。AUTOはこの秒数だけ表示して次へ進みます。',
      'text.color':'文字色','text.shadow':'文字影','color.white':'白','color.black':'黒','color.custom':'任意色','shadow.none':'なし','shadow.soft':'弱','shadow.strong':'強',
      'background.preview':'背景プレビュー','background.preview.note':'切替・表示・動き・暗さ','background.transitionSpeed':'切替の速さ','background.motionSpeed':'動きの速さ','background.motionAmount':'動きの強さ',
      'publish.action':'公開する','publish.short':'公開','publish.update':'変更を公開','publish.published':'公開中','publish.ready':'この作品を公開しますか？','publish.readyText':'公開すると、読者へ渡せるURLを発行します。','publish.updateReady':'公開中の作品を更新しますか？','publish.updateText':'変更内容を、現在の公開URLへ反映します。','publish.working':'公開しています…','publish.workingText':'作品を公開できる状態にしています。','publish.success':'公開しました','publish.share':'シェア','publish.copy':'リンクをコピー','publish.mockNote':'公開URLはそのまま読者へ共有できます。公開停止・再公開・削除はWorksから管理できます。','publish.failed':'公開できませんでした','publish.failedText':'時間をおいて、もう一度試してください。','publish.retry':'もう一度試す',
      'draft.title':'制作途中の作品','draft.all':'全て','draft.inProgress':'途中','draft.publishedTab':'公開','draft.continue':'続きから','draft.link':'リンク','draft.unpublish':'公開停止','draft.republish':'再公開','draft.delete':'削除','draft.status.published':'公開中','draft.status.stopped':'公開停止中','draft.status.dirty':'変更あり','draft.empty.all':'作品はありません。','draft.empty.draft':'制作途中の作品はありません。','draft.empty.published':'公開中の作品はありません。','draft.today':'今日','draft.copied':'コピー済み',
      'unpublish.title':'この作品の公開を停止しますか？','unpublish.text':'公開URLは使えなくなる想定です。制作中のデータはそのまま残ります。','unpublish.named':'「{title}」の公開URLは使えなくなる想定です。制作中のデータはそのまま残ります。','unpublish.cancel':'キャンセル','unpublish.confirm':'公開を停止','unpublish.failed':'公開停止に失敗しました。','republish.failed':'再公開に失敗しました。','draft.deleteHostedConfirm':'「{title}」を完全削除します。公開URLも使えなくなります。よろしいですか？','draft.deleteLocalConfirm':'「{title}」のローカル下書きを削除しますか？','draft.deleteFailed':'削除に失敗しました。',
      'delete.scene.title':'このSceneを削除しますか？','delete.scene.current':'Scene {n}「{label}」を削除します。','delete.scene.text':'削除後も「元に戻す」で1回だけ戻せます。','delete.scene.cancel':'キャンセル','delete.scene.confirm':'このSceneを削除','common.fileReadFailed':'ファイルを読み込めませんでした。もう一度選択してください。',
      'rec.continue':'続き','rec.cancel':'中止','rec.done':'REC保存完了','rec.retry':'やり直す',
      'undo.action':'↶ 元に戻す','undo.sampleUndoAvailable':'サンプル置換を元に戻せます','undo.sceneMoved':'Sceneを並び替えました','undo.sceneMerged':'前のSceneと結合しました','undo.sceneSplit':'Sceneを分割しました','undo.sceneDeleted':'Sceneを削除しました','undo.scenesDeleted':'{n} Scenesを削除しました','undo.resplit':'未編集Sceneだけ再分割しました','undo.sampleReplaced':'サンプルを入れました','undo.splitAtCursor':'カーソル位置で分割しました',
      'player.ending.title':'読了','player.ending.text':'最後まで読みました。','player.ending.restart':'最初から読む'
    },
    en: {

      'menu.label':'Menu','menu.language':'Language','draft.toolbarAria':'Works in progress',
      'preview.cover':'Cover','preview.edit':'Tap to edit','preview.coverEdit':'Edit cover','preview.coverText':'Cover text. Tap to edit','preview.ending':'Ending page','preview.endingAria':'Ending page preview','cover.start':'Start',
      'sample.replaceTitle':'Replace your current text?','sample.replaceText':'This replaces the current title and text with the sample. You can undo it once afterward.','sample.replaceAction':'Replace with sample',
      'cover.quick.title':'Edit cover','cover.quick.subtitle':'Subtitle','cover.quick.episode':'Episode','cover.quick.episodeTitle':'Episode title','cover.quick.logoChoose':'Choose / change work logo (transparent PNG)','cover.quick.logoRemove':'Remove work logo','cover.quick.imageChoose':'Choose / change cover image','cover.quick.imageRemove':'Remove cover image','cover.quick.note':'Changes appear in the cover preview immediately.','common.done':'Done',
      'ending.quick.center':'Center text','ending.quick.small':'Small text','ending.quick.button':'Button label','ending.quick.link':'Link','ending.quick.clear':'Clear this button','ending.quick.recent':'Recently used','ending.quick.saved':'Saved on this device','ending.quick.left':'Left button','ending.quick.right':'Right button','ending.quick.empty':'Nothing yet','ending.quick.previous':'Previous','ending.quick.next':'Next','ending.quick.fixed':'“Back to cover” is fixed',
      'advanced.backToEasy':'Back to Easy','advanced.fineTune':'Fine Tune','preview.workAria':'Preview work',
      'alert.logoPng':'Please choose a transparent PNG for the work logo.','alert.logoRead':'Could not load the work logo.','alert.imageRead':'Could not load the image. Please choose it again.',
      'work.authorHistory':'Previously used author names on this device appear as suggestions.','work.description':'One-line intro','work.description.ph':'e.g. In a town of overlapping voices, one person hears something different.','work.description.help':'A short description used for link cards and work previews.','ending.heading':'Ending page','ending.note':'Set the final afterglow and what readers can do next. Changes appear in the preview immediately. Ending actions appear after about a 3-second pause.','ending.label.ph':'e.g. To be continued','ending.preview.default':'Finished','ending.cover':'Back to cover','cover.preview.untitled':'Untitled',
      'intro.title':'Write the pauses, too.',
      'intro.body':'Turn it into an experience where the next passage stays hidden.',
      'field.title':'Title','field.title.ph':'e.g. The Street of Matching Voices',
      'field.author':'Author','common.optional':'Optional','field.author.ph':'e.g. Yuya Narita',
      'field.body':'Text','field.body.ph':'Paste your text here.',
      'body.chars':'{n} characters','body.sample':'Insert sample',
      'theme.heading':'Mood','theme.note':'You can change this later',
      'theme.light':'Writing / Essay','theme.dark':'Sci-Fi / Horror','theme.cinema':'Spacious / Cinematic',
      'font.heading':'Work typeface','font.note':'Default for all Scenes',
      'font.serif':'Serif','font.serif.note':'Stories / prose',
      'font.sans':'Sans-serif','font.sans.note':'Explanatory / modern',
      'font.mono':'Monospace','font.mono.note':'Terminal / logs',
      'split.summary':'Adjust Scene splitting','split.guide':'Scene length',
      'density.short':'Short','density.normal':'Standard','density.long':'Long',
      'split.note':'Prioritizes blank lines, dialogue, lists, and line breaks, then uses punctuation and length as fallback.',
      'cinema.bg':'Background image','cinema.bg.note':'Passed to the Player as a Scene Format background.',
      'cinema.dark':'Dark','cinema.light':'Light','cinema.choose':'Choose image','cinema.remove':'Remove image',
      'make':'Pack into Scenes','make.note':'Split your text into Scenes and reveal them one at a time',
      'advanced.open':'Fine Tune','io.heading':'Work file','io.export':'Export blueprint','io.import':'Import blueprint','io.packageExport':'Export full package','io.packageImport':'Import full package','io.exported':'Exported: {name}','io.imported':'Imported: {name} ({n} Scenes)','io.invalid':'Could not import this as Scene Format v1.','io.localAssets':'This work contains {n} local image/audio reference(s). They must be selected again outside the current browser session.','io.packageExported':'Exported full package: {name} ({n} assets)','io.packageImported':'Imported full package: {name} ({n} Scenes / {a} assets restored)','io.packageFailed':'Could not export the full package.','io.packageInvalid':'Could not import this as a Scene Package.','footer.note':'Your words, into あ箱.',
      'advanced.title':'Adjust Scenes','common.preview':'Preview',
      'nav.previous.policy':'Readers can revisit past Scenes','nav.previous.note':'Controls the back button, swipe, and keyboard navigation together.',
      'scene.text':'Text','scene.subtext':'Subtext','scene.subtext.ph':'Only when a Scene needs extra context',
      'scene.type':'Type','scene.type.text':'Text','scene.type.dialogue':'Dialogue','scene.type.sound':'Sound only',
      'scene.display':'Display','scene.display.stack':'Keep previous text','scene.display.solo':'Show only this text',
      'scene.effect':'Entrance','effect.auto':'Automatic','effect.fade':'Fade','effect.pop':'Pop in','effect.blur':'Blur in',
      'effect.whisper':'Whisper in','effect.loud':'Strong entrance','effect.pulse':'Pulse','effect.shake':'Shake','effect.tilt':'Tilt','effect.slow':'Slow','effect.none':'No effect',
      'scene.size':'Text size','size.auto':'Automatic','size.small':'Small','size.normal':'Standard','size.large':'Large','size.xl':'Extra large',
      'scene.font':'Typeface for this Scene','font.inherit':'Use work setting','scene.language':'Language for this Scene','scene.language.auto':'Automatic','scene.language.ja':'Japanese','scene.language.en':'English','scene.language.custom':'Other','scene.language.tag':'Language tag',
      'edit.merge':'Merge with previous','edit.split':'Split at cursor','edit.delete':'Delete',
      'section.background':'Background','background.mode':'Background for this Scene','background.inherit':'Continue from previous Scene','background.image':'Change image in this Scene','background.clear':'Clear background in this Scene',
      'background.choose':'Choose image','background.unselect':'Clear selection','asset.applyUrl':'Apply URL','asset.invalidUrl':'Enter a valid URL or relative path.','background.transition':'Transition','background.fit':'Fit','background.motion':'Motion','background.dim':'Darkness','background.thin':'Fading',
      'transition.fade':'Fade','transition.cut':'Cut','transition.flash':'Flash','transition.glitch':'Glitch',
      'fit.cover':'Fill screen','fit.contain':'Fit whole image',
      'motion.none':'None','motion.slowZoom':'Slow zoom','motion.breath':'Breath','motion.panLeft':'Pan left','motion.panRight':'Pan right','motion.panUp':'Pan up','motion.panDown':'Pan down',
      'section.audio':'Audio','audio.operation':'Action','audio.inherit':'Continue (no command)','audio.start':'Start in this Scene','audio.volumeChange':'Change volume','audio.stop':'Stop in this Scene',
      'audio.bgm.note':'Time that kept flowing','audio.ambient.note':'Sound that existed there','audio.se.note':'Sound that happened then',
      'audio.chooseBgm':'Choose BGM','audio.chooseAmbient':'Choose ambient audio','audio.chooseSe':'Choose SE','audio.notSelected':'Not selected','audio.configured':'Configured',
      'audio.loop':'Loop','audio.volume':'Volume','audio.seEnable':'Play SE in this Scene',
      'audio.hint':'BGM is treated as time that kept flowing, Ambient as sound that existed there, and SE as sound that happened then. With no command, the previous Scene state continues.',
      'preview.return':'Back to editor','alert.audio':'Please choose an audio file.',
      'scene.count':'{n} Scenes',
      'player.previous':'Past Scenes','player.restart':'Restart','player.history':'Scroll past Scenes','player.history.close':'Close history',

      'file.open':'Open Work','file.export':'Export Work','draft.manager':'Works','draft.new':'+ New Work','draft.new.note':'New draft','draft.saved':'Autosaved','draft.full':'You already have 10 drafts','draft.saveFailedNew':'The current work could not be autosaved, so a new work was not opened.',
      'work.info':'Work Info & Cover','work.subtitle':'Subtitle','work.language':'Language','work.series':'Series','work.episode':'Episode label','work.cover':'Cover image','work.cover.choose':'Choose cover image','work.cover.remove':'Remove cover image','work.cover.empty':'No image is fine','work.cover.note':'Easy only sets the image. Use Advanced for detailed cover editing.','work.cover.saveNote':'The image is saved centered with cover fit. Titles and other metadata are stored separately.','work.developer':'Developer','work.subtitle.ph':'e.g. If Cooling Wins','work.series.ph':'e.g. Shino with the Poor Glasses','work.episode.ph':'e.g. Episode 01 / PROLOGUE','work.language.auto':'Automatic','work.language.ja':'Japanese','work.language.en':'English','work.language.mul':'Multiple languages','common.optional.free':'Optional · free text','common.open':'Open','draft.footer':'Drafts are autosaved on this device. Publish, share, unpublish, republish, and delete from Works.','common.close':'Close','scene.effectOnly':'Effects only','scene.empty':'Empty Scene','background.changeOverlay':'Change background from this Scene',
      'auto.heading':'AUTO Timing','auto.reset':'Reset to default','auto.second':'sec','auto.unrecorded':'Not recorded · default {s}s','auto.recorded':'Recorded {s}s','auto.hint':'Fine-tune only the Scenes you missed after REC. AUTO advances after this duration.',
      'text.color':'Text color','text.shadow':'Text shadow','color.white':'White','color.black':'Black','color.custom':'Custom color','shadow.none':'None','shadow.soft':'Soft','shadow.strong':'Strong',
      'background.preview':'Background preview','background.preview.note':'transition · fit · motion · darkness','background.transitionSpeed':'Transition speed','background.motionSpeed':'Motion speed','background.motionAmount':'Motion amount',
      'publish.action':'Publish','publish.short':'Publish','publish.update':'Publish Changes','publish.published':'Published','publish.ready':'Publish this work?','publish.readyText':'Publishing creates a URL you can share with readers.','publish.updateReady':'Update the published work?','publish.updateText':'Apply these changes to the current public URL.','publish.working':'Publishing…','publish.workingText':'Preparing your work for publication.','publish.success':'Published','publish.share':'Share','publish.copy':'Copy Link','publish.mockNote':'The public URL is ready to share with readers. Unpublish, republish, and delete are managed from Works.','publish.failed':'Could not publish','publish.failedText':'Please wait a moment and try again.','publish.retry':'Try Again',
      'draft.title':'Works','draft.all':'All','draft.inProgress':'Drafts','draft.publishedTab':'Published','draft.continue':'Continue','draft.link':'Link','draft.unpublish':'Unpublish','draft.republish':'Republish','draft.delete':'Delete','draft.status.published':'Published','draft.status.stopped':'Unpublished','draft.status.dirty':'Changes','draft.empty.all':'No works yet.','draft.empty.draft':'No drafts.','draft.empty.published':'No published works.','draft.today':'Today','draft.copied':'Copied',
      'unpublish.title':'Unpublish this work?','unpublish.text':'The public URL will no longer be available. Your draft will remain saved.','unpublish.named':'The public URL for “{title}” will no longer be available. Your draft will remain saved.','unpublish.cancel':'Cancel','unpublish.confirm':'Unpublish','unpublish.failed':'Could not unpublish.','republish.failed':'Could not republish.','draft.deleteHostedConfirm':'Permanently delete “{title}”? Its public URL will stop working.','draft.deleteLocalConfirm':'Delete the local draft “{title}”?','draft.deleteFailed':'Delete failed.',
      'delete.scene.title':'Delete this Scene?','delete.scene.current':'Delete Scene {n} “{label}”.','delete.scene.text':'You can undo this deletion once.','delete.scene.cancel':'Cancel','delete.scene.confirm':'Delete Scene','common.fileReadFailed':'Could not read the file. Please choose it again.',
      'rec.continue':'Continue','rec.cancel':'Stop','rec.done':'REC Saved','rec.retry':'Record Again',
      'undo.action':'↶ Undo','undo.sampleUndoAvailable':'You can undo the sample replacement','undo.sceneMoved':'Scene reordered','undo.sceneMerged':'Merged with previous Scene','undo.sceneSplit':'Scene split','undo.sceneDeleted':'Scene deleted','undo.scenesDeleted':'Deleted {n} Scenes','undo.resplit':'Re-split unedited Scenes','undo.sampleReplaced':'Sample inserted','undo.splitAtCursor':'Split at cursor',
      'player.ending.title':'Finished','player.ending.text':'You reached the end.','player.ending.restart':'Read from start'
    }
  };

  function detect(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.has(saved)) return saved;
    return /^ja\b/i.test(navigator.language || '') ? 'ja' : 'en';
  }

  let locale = detect();

  function t(key, vars={}){
    let s = (M[locale] && M[locale][key]) ?? (M.ja[key] ?? key);
    Object.entries(vars).forEach(([k,v]) => { s = s.replaceAll(`{${k}}`, String(v)); });
    return s;
  }

  function setLocale(next){
    if(!SUPPORTED.has(next)) return locale;
    locale = next;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    global.dispatchEvent(new CustomEvent('scene-studio:ui-language', {detail:{language:locale}}));
    return locale;
  }

  function getLocale(){ return locale; }

  global.SceneStudioI18n = {t,setLocale,getLocale,messages:M};
})(window);
