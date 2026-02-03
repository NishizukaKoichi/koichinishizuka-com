import Link from "next/link";
import type { RunRecord } from "../schema";

type Props = {
  runs: RunRecord[];
};

export function RunList({ runs }: Props) {
  if (!runs.length) {
    return <p className="text-sm text-gray-600">No runs yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded border">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">
              Run ID
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">
              Intent ID
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {runs.map((run) => (
            <tr key={run.id}>
              <td className="px-4 py-2">
                <Link
                  href={`/runs/${run.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {run.id}
                </Link>
              </td>
              <td className="px-4 py-2">{run.intent_id}</td>
              <td className="px-4 py-2">
                <StatusBadge status={run.status} />
              </td>
              <td className="px-4 py-2">{formatDate(run.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const StatusBadge = ({ status }: { status: RunRecord["status"] }) => {
  const colors: Record<RunRecord["status"], string> = {
    queued: "bg-gray-200 text-gray-800",
    running: "bg-yellow-100 text-yellow-800",
    succeeded: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
};
