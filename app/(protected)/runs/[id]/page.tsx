import { redirect } from "next/navigation";
import { fetchRunById } from "@/capabilities/exec/repo";
import { RunDetail } from "@/capabilities/exec/ui/RunDetail";
import { getServerUserId } from "@/lib/auth/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RunDetailPage({ params }: Props) {
  const { id } = await params;
  const userId = await getServerUserId();

  if (!userId) {
    redirect("/login");
  }

  const { run, error } = await fetchRunById(userId, id);

  if (error || !run) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        Run not found or inaccessible.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Run</h1>
        <p className="text-sm text-gray-600">
          Execution output and idempotency details.
        </p>
      </div>
      <RunDetail run={run} />
    </div>
  );
}
