import { redirect } from "next/navigation";
import { listRuns } from "@/capabilities/exec/repo";
import { RunList } from "@/capabilities/exec/ui/RunList";
import { getServerUserId } from "@/lib/auth/server";

export default async function RunsPage() {
  const userId = await getServerUserId();

  if (!userId) {
    redirect("/login");
  }

  const { runs, error } = await listRuns(userId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Runs</h1>
        <p className="text-sm text-gray-600">
          Latest runs for the signed-in user.
        </p>
      </div>
      {error ? (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Failed to load runs: {String(error)}
        </div>
      ) : (
        <RunList runs={runs} />
      )}
    </div>
  );
}
