# Schema Spec

## Core Entities

### User
- user_id (UUIDv7)
- created_at (UTC / server time)
- auth_credentials (passkey / email magic link metadata)

Constraints
- user_id 再発行不可
- User 統合 API は存在しない

### EpochRecord
- record_id (UUIDv7)
- user_id (FK → User)
- recorded_at (UTC / server time)
- record_type (enum)
- payload (JSON)
- prev_hash (string)
- record_hash (string)
- visibility (private / scout_visible / public)

Constraints
- record_hash = hash(record_id + user_id + recorded_at + record_type + payload + prev_hash + attachment_hash?)
- recorded_at はクライアント指定不可
- payload のスキーマは record_type ごとに固定

### Attachment (Image)
- attachment_id
- record_id (FK → EpochRecord)
- attachment_hash
- storage_pointer

Constraints
- Record なしの attachment 作成不可
- 差し替え不可
- 削除不可

### Profile (表層データ)
- user_id (FK → User)
- display_name
- avatar_url
- bio

Constraints
- EpochRecord を生成しない
- 履歴保持なし

## Supporting Entities
- Record Index (時間順読み取りのための索引)
- Billing / Subscription / Read Session / Time Window
- Audit Logs (全操作を記録、Record 本体とは分離)

## Notes
- Entitlements は実行ゲートの唯一の真実点。
- 課金情報は履歴の意味付けに使わない。
