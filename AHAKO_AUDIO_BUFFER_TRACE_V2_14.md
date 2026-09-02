# AHAKO AUDIO BUFFER TRACE V2.14

V2.13 をベースにした一時診断版です。機能修正ではなく、iPhone で Scene2 以降の BGM / SE と読了 SE がどこで止まるかを追跡します。

## 追加ログ
- AudioBuffer の fetch/decode 開始・成功・失敗
- Scene ごとの audio command 適用
- Buffer 再生を使えず HTMLAudio にフォールバックした瞬間
- BGM/Ambient BufferSource の開始要求
- BGM/Ambient BufferSource の stop 要求と理由
- One-shot BufferSource の開始・終了・stopAfter / stopAt
- 読了 SE 進入時の cache / pending 状態
- AudioContext state

## 検証手順
1. iPhone で表紙から START
2. Scene1 → Scene2 まで手動
3. Scene2 に入った直後の黒ログをスクリーンショット
4. 読了まで進み、読了直後の黒ログをスクリーンショット

黒ログに `buffer-persistent-skip` / `buffer-oneshot-skip` が出る場合は `hasBuffer` と `contextState` を確認します。
`buffer-persistent-start-request` の後に `buffer-persistent-stop-request` が出る場合は `reason` で停止元を追います。
