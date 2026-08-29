あ箱 Chat吹き出し復旧パッチ

原因:
渡してもらった「チャット吹き出しが正常だった最新版」を確認したところ、
root の scene-player-core.js と studio/scene-player-core.js には
.sp-chat-bubble を生成する処理が残っています。

しかし対応する live Chat Scene のCSS
  .sp-scene[data-view="chat"] ...
  .sp-chat-bubble ...
が root と studio の scene-player-core.css から抜けていました。

一方 player-test/scene-player-core.css には正常なChat CSS一式が残っています。
つまり、今回の共鳴率修正で壊れたのではなく、渡してもらった土台の時点で
public / Studio preview のChat CSSが欠落していた可能性が高いです。

このパッチは player-test に残っているChat CSSを、
- scene-player-core.css（公開Player）
- studio/scene-player-core.css（Studio preview）
へ復旧したものです。

JS・共鳴率・読了ページには触れていません。
