import { redirect } from "next/navigation";
import Link from "next/link";
import { createIntentAction } from "@/capabilities/exec/actions";
import { listIntents } from "@/capabilities/exec/repo";
import { getServerUserId } from "@/lib/auth/server";

export default async function IntentsPage() {
  const userId = getServerUserId();

  if (!userId) {
    redirect("/login");
  }

  const { intents } = await listIntents(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Intents</h1>
        <p className="text-sm text-gray-600">
          Create and execute intents. Execution is idempotent.
        </p>
      </div>

      <form action={createIntentAction} className="rounded border p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="action">
              Action
            </label>
            <select
              id="action"
              name="action"
              className="rounded border px-3 py-2 text-sm"
              defaultValue="echo"
              required
            >
              <option value="echo">echo</option>
              <option value="timestamp">timestamp</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="rounded border px-3 py-2 text-sm"
              defaultValue="active"
              required
            >
              <option value="active">active</option>
              <option value="canceled">canceled</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="args">
            Args (JSON)
          </label>
          <textarea
            id="args"
            name="args"
            className="min-h-[120px] rounded border px-3 py-2 text-sm font-mono"
            placeholder='{"message":"hello"}'
            defaultValue='{"message":"hello"}'
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
            Create Intent
          </button>
        </div>
      </form>

      <div className="rounded border p-4">
        <h2 className="text-lg font-semibold">Recent</h2>
        {intents.length === 0 ? (
          <p className="text-sm text-gray-500">No intents yet.</p>
        ) : (
          <div className="divide-y">
            {intents.map((intent) => (
              <div key={intent.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium">{intent.action}</p>
                  <p className="text-xs text-gray-500">{intent.id}</p>
                  <p className="text-xs text-gray-500">Status: {intent.status ?? "—"}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/intents/${intent.id}/execute`}
                    className="rounded border px-3 py-1 text-xs"
                  >
                    Execute
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
