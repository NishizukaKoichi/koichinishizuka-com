type Props = {
  value: string;
};

export function IdempotencyKeyField({ value }: Props) {
  return <input type="hidden" name="idempotency_key" value={value} />;
}
