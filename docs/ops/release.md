# Release

## Release Checklist
- Env check: `pnpm env:check` が `OK` を返すこと（失敗時はデプロイ停止）。
- Rollout plan: 内部検証 → 限定ベータ → 一般公開の順で拡大。
- Invariants check: 削除／編集 API 不在、record_hash 生成、サーバ時刻付与、追記のみ。
- Offline check: オフライン確定が存在しないこと、draft のみ保存されること。
- Attachment check: 画像が Record 従属で差し替え不可であること。
- Visibility check: 可視性変更は追記 Record であること。
- Audit check: 監査ログが全操作を記録し、運営者操作も含むこと。

## Monitoring Plan
- Record 書き込み成功率とレイテンシ。
- record_hash 生成失敗率。
- Attachment 保存失敗率。
- 課金開始→完了の成功率。
- 閲覧権限チェック失敗率。

## Rollback Plan
- 読み取り権限の新規付与を停止し、既存セッションのみ期限で失効させる。
- 書き込みは停止しない。

## Owner
- プロダクト責任者。
