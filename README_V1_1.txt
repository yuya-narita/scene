あ箱 — 共鳴率 v1.1 修正

今回確認した原因は2つです。

1. 0.0%へ潰れやすかった
v1の計算はGaussian型で tolerance=max(0.8秒, 作者時間×25%)。
たとえば作者3.2秒に対して読者5.0秒だと、約1.8秒差だけで
そのSceneの共鳴値がほぼ0%になります。
41 Sceneで1〜2秒程度のズレが重なると、体感では「まあまあ近い」
のに最終値が0.0%へ落ちやすい設計でした。

v1.1では「音ゲーの厳密判定」ではなく「間の近さ」に合わせ、
tolerance=max(1秒, 作者時間×50%) の緩やかな曲線へ変更。
diff=0 → 100%
diff=tolerance → 50%
として、少しのズレで全体が0へ潰れないようにしています。

2. Scene 1の測定開始点
PlayerはScene 1 / 音声を player.begin() で開始したあと、
公開Player独自の openingBreath を挟んでいました。
v1では共鳴時計をopeningBreath後から開始していたため、
Scene 1だけ音の開始点と測定開始点がズレていました。
v1.1では player.begin() と同時に共鳴時計を開始します。

3. ON/OFFが見つからない
iPhoneの「時間」シートでは共鳴設定がAUTOタイミング編集の下に入り、
長いパネルの下側に隠れていました。
v1.1では Scene一覧の直下、AUTOタイミング編集より上に移動します。

更新ファイル:
- public-player.js
- player-test/public-player.js
- studio/script.js
- studio/style.css

既存の開始遅延拡張と共鳴データ形式は変更していません。
