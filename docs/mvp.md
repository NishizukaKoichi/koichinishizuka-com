# MVP

## Must-Have
- 不可逆 EpochRecord 書き込み機構（削除・編集・並び替え不可）。
- record_type 固定と意味変更禁止。
- サーバ時刻絶対・クライアント非信頼。
- オフラインは draft のみ、確定は常にオンライン。
- 画像 attachment（Record 従属、テキスト payload 必須、差し替え不可）。
- プロフィール表層データ分離（表示名・画像は履歴を持たない）。
- 可視性制御（private / scout_visible / public、変更は追記）。
- 読み取り課金（Time Window / Read Session のみ）。
- 削除・編集 API 不在。

## Nice-to-Have (Not in MVP)
- なし。思想と構造の固定を優先する。

## Out of Scope
- 動画添付。
- 全文検索、AI 要約、ランキング、スコア、おすすめ。
- 評価や結果に連動する課金。
- Record の削除・修正・非表示依頼。
