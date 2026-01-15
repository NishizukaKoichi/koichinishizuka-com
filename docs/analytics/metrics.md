# Metrics Definition

## Purpose
- ユーザーが「記録できた」と確信するまでに詰まる箇所を知る。
- 課金検討から支払い完了までの摩擦点を特定する。
- 支払い後に再訪・継続利用が起きているかを確認する。
- 不可逆性を壊さずに UX を改善できる余地を見つける。

## North Star
- record 確定成功が発生し、一定期間後に再記録または再訪が発生していること。

## Action Units
- Auth 完了
- Draft 作成
- Draft 破棄
- Record 確定成功
- Record 確定失敗
- Attachment 追加（確定前）
- Visibility 変更操作（確定前）
- Visibility 変更確定（追記 Record 成功）
- 他人 Epoch 閲覧ブロック表示（課金要求）
- 課金開始（session/time window 選択）
- 課金完了
- 他人 Epoch 閲覧開始
- 他人 Epoch 閲覧終了
- 再訪（一定期間後の復帰）

## Funnels
- F1 登録: 未認証閲覧 → 登録開始 → 認証完了 → 初回 record 確定
- F2 記録: draft 作成 → 確定操作 → 書き込み成功
- F3 課金: 他人閲覧要求 → 課金検討 → 課金開始 → 課金完了 → 閲覧開始
- F4 継続: 初回記録 → 2回目記録 → 7日内再訪 → 30日内再訪

## Cohorts
- 初回記録の有無
- attachment 利用の有無
- visibility 設定パターン（private only / public mixed / scout mixed）
- 課金経験の有無
- read session と time window の利用差

## Data Handling
- 計測ログは EpochRecord と分離保存。
- 保持期間は運用上必要な最小。
- 入力テキスト内容の収集や payload 解析は禁止。
- 個人評価につながる派生指標の生成は禁止。

## Operational Monitoring
- Record 書き込み成功率
- 書き込みレイテンシ
- record_hash 生成失敗率
- Attachment 保存失敗率
- 課金開始→完了の成功率
- 閲覧権限チェック失敗率
