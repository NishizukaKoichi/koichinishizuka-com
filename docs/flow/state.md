# State Flow

## States
- Pre-Registration: 未認証。説明ページのみ閲覧可能。
- Registered: 認証完了。User 作成済み、EpochRecord は未作成。
- Drafting: draft がローカルに保存されている。
- Recorded: record が確定し不可逆保存されている。
- Ongoing: 複数の record が時間順に積層されている。
- Payment Consideration: 他人の Epoch を読む必要が生じ、課金検討中。
- Read Active: Read Session / Time Window が有効で他人の Epoch が閲覧可能。
- Read Ended: 読み取り権限が失効し、自己閲覧のみ可能。

## Transitions
- Pre-Registration → Registered: 認証完了（Passkey / Magic Link）。
- Registered → Drafting: draft 作成。
- Drafting → Recorded: 確定操作成功（サーバ時刻で記録）。
- Recorded → Ongoing: 新規 record の追記。
- Ongoing → Ongoing: 条件成立時に period_of_silence を自動記録。
- Ongoing → Payment Consideration: 他人の Epoch を読む必要が生じる。
- Payment Consideration → Read Active: 課金完了。
- Read Active → Read Ended: セッション終了または有効期間終了。
- Read Ended → Ongoing: 自己記録の継続。
