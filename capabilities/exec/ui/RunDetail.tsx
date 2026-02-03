import type { RunRecord } from "../schema";

type Props = {
  run: RunRecord;
};

export function RunDetail({ run }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <DetailRow label="Run ID" value={run.id} />
        <DetailRow label="Intent ID" value={run.intent_id} />
        <DetailRow label="Status" value={run.status} />
        <DetailRow label="Idempotency Key" value={run.idempotency_key} />
        <DetailRow label="Started At" value={run.started_at} />
        <DetailRow label="Finished At" value={run.finished_at} />
        <DetailRow label="Created At" value={run.created_at} />
      </div>
      <div>
        <h3 className="mb-1 font-semibold">Output</h3>
        <pre className="rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">
          {formatJson(run.output)}
        </pre>
      </div>
      <div>
        <h3 className="mb-1 font-semibold">Error</h3>
        <pre className="rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">
          {formatJson(run.error)}
        </pre>
      </div>
    </div>
  );
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => (
  <div className="flex flex-col rounded border p-3">
    <span className="text-xs text-gray-500 uppercase">{label}</span>
    <span className="text-sm">{value ?? "—"}</span>
  </div>
);

const formatJson = (value: unknown) => {
  if (!value) return "null";
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return `Unserializable value: ${String(error)}`;
  }
};
