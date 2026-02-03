import { redirect } from "next/navigation";
import { executeIntent } from "@/capabilities/exec/actions";
import { fetchIntent } from "@/capabilities/exec/repo";
import { ExecuteForm } from "@/capabilities/exec/ui/ExecuteForm";
import { getServerUserId } from "@/lib/auth/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExecuteIntentPage({ params }: Props) {
  const { id } = await params;
  const userId = await getServerUserId();

  if (!userId) {
    redirect("/login");
  }

  const { intent, error } = await fetchIntent(userId, id);

  if (error || !intent) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        Intent not found or inaccessible.
      </div>
    );
  }

  const defaultIdempotencyKey = crypto.randomUUID();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Execute Intent</h1>
        <p className="text-sm text-gray-600">
          Run intent actions and persist run records with idempotency.
        </p>
      </div>

      <div className="rounded border p-4">
        <h2 className="text-lg font-semibold">Intent</h2>
        <dl className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <InfoRow label="Intent ID" value={intent.id} />
          <InfoRow label="Action" value={intent.action} />
          <InfoRow label="Status" value={intent.status ?? "—"} />
          <InfoRow label="Expires At" value={intent.expires_at ?? "—"} />
          <InfoRow label="Created At" value={intent.created_at ?? "—"} />
        </dl>
        <div className="mt-3">
          <p className="text-sm font-semibold">Args</p>
          <pre className="rounded border bg-gray-50 p-2 text-sm whitespace-pre-wrap">
            {formatJson(intent.args ?? {})}
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Execute</h2>
        <ExecuteForm
          action={executeIntent}
          intentId={intent.id}
          defaultIdempotencyKey={defaultIdempotencyKey}
        />
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col rounded border p-3">
    <span className="text-xs text-gray-500 uppercase">{label}</span>
    <span className="text-sm">{value}</span>
  </div>
);

const formatJson = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return `Unserializable value: ${String(error)}`;
  }
};
