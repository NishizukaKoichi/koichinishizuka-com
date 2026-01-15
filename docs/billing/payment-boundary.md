# Payment Boundary Definition

## free_cannot_do
他人の Epoch を判断材料として読むこと。
時間全体を横断して他人の履歴を把握すること。

## payment_trigger
他人の Epoch を、歪められていない履歴として読む必要が生じた瞬間。
（編集不能・評価なし・沈黙欠損なし・時間順序絶対が確定する）

## plan_key_1
time_window

## plan_1_entitlements
read_other_epoch:time_window

## plan_key_2
read_session

## plan_2_entitlements
read_other_epoch:session

## Notes
- 課金は「他人の Epoch を判断材料として読む行為」にのみ紐づく。
- Record 単体課金、評価連動課金は禁止。
- 課金後でも評価・要約・保存・ランキングは不可。
- 課金停止後も書き込みと自己閲覧は継続可能。
- 料金表は書かない。価格は後から設定する。
