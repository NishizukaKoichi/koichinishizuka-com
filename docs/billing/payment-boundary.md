# Payment Boundary Definition

必須項目: 以下は埋め済み。未記入のまま次工程へ進まない。

## free_cannot_do
Stripeや認証や配布を個別実装すると、
・設計が毎回ブレる
・売り方を変えたくなった瞬間に壊れる
・「ちゃんと止まるか」「剥奪できるか」が信用できない
結果として、作ったものを安心して売れない

## payment_trigger
実行・配布・停止の判断がすべて entitlement に一本化され、
「これは売っていい」「これは止められる」という状態が
仕組みとして保証される必要がある瞬間

## plan_key_1
starter

## plan_1_entitlements
plan:starter

## plan_key_2
pro

## plan_2_entitlements
plan:pro

## Notes
- 料金表は書かない。価格は seller が /admin/pricing で後から決める。
- 価格変更は「新しい Stripe Price を作成して Active を切替」のみ許可。
