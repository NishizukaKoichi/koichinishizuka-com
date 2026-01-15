# API Spec

## Principles
- すべて追記型。削除／更新 API は存在しない。
- クライアントは状態を持たない。サーバが唯一の真実。
- recorded_at はサーバ時刻のみ。

## Auth
- POST /auth/register
- POST /auth/login
- POST /auth/recover
  - recover 成功時は auth_recovered の EpochRecord を自動生成。

## Record Write
- POST /records
  - input: record_type, payload, visibility, attachment (optional)
  - server: recorded_at 付与、prev_hash 解決、record_hash 生成、不可逆保存
  - failure: Record は生成されない

## Record Read (Self)
- GET /records/self
  - 常に無料
  - 時間順のみ

## Record Read (Other)
- GET /records/{user_id}
  - 有効な Read Session / Time Window が必要
  - 範囲外アクセスは拒否

## Visibility Change
- POST /records/{record_id}/visibility
  - 状態変更 Record を新規生成
  - 元 Record は変更しない

## Billing / Sessions
- POST /billing/session/start
  - input: type (time_window | read_session), target_user_id, scope
- POST /billing/session/end

## Error Handling
- 欠損入力は 400、未認証は 401、権限不足は 403。
- 範囲外や無効なセッションは 409。
- 署名検証失敗は 400。

## Prohibited Endpoints
- DELETE /records
- PUT /records
- 全文検索、要約、ランキング、比較 API
