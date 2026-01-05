# Metrics Definition

必須項目: 以下は埋め済み。未記入のまま次工程へ進まない。

## north_star
entitlement_granted が発生した userId の数

## checkout_started
/api/billing/checkout で checkout session が作成され、track("checkout_started") が記録される

## checkout_completed
webhook で checkout.session.completed を受信し、track("checkout_completed") が記録される

## entitlement_granted
entitlements が active に更新され、track("entitlement_granted") が記録される

## payment_failed
webhook で invoice.payment_failed を受信し、track("payment_failed") が記録される

## entitlement_revoked
webhook で customer.subscription.deleted を受信し、entitlements が revoked に更新される
