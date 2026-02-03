"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/auth/server";
import { uuidV7Like } from "@/lib/ids";
import {
  fetchIntent,
  insertRunningRun,
  markRunFailure,
  markRunSuccess,
  createIntent,
} from "./repo";
import {
  executeInputSchema,
  type ExecuteInput,
  type RunErrorPayload,
} from "./schema";
import { executeWithExecutor } from "./executors";

export type ExecuteResult = {
  runId?: string;
  error?: RunErrorPayload;
};

const buildError = (
  code: RunErrorPayload["code"],
  message: string,
  details?: unknown,
): RunErrorPayload => ({
  code,
  message,
  details,
});

const revalidateExecPaths = (intentId: string, runId?: string) => {
  revalidatePath("/runs");
  if (runId) {
    revalidatePath(`/runs/${runId}`);
  }
  revalidatePath(`/intents/${intentId}/execute`);
};

export async function executeIntent(
  _: ExecuteResult,
  formData: FormData,
): Promise<ExecuteResult> {
  const userId = await getServerUserId();

  if (!userId) {
    redirect("/login");
  }

  const parsedInput = executeInputSchema.safeParse({
    intentId: formData.get("intent_id"),
    idempotencyKey: formData.get("idempotency_key"),
  });

  if (!parsedInput.success) {
    return {
      error: buildError(
        "VALIDATION_FAILED",
        "Input validation failed",
        parsedInput.error.flatten(),
      ),
    };
  }

  const input: ExecuteInput = parsedInput.data;

  const { intent, error: intentError } = await fetchIntent(
    userId,
    input.intentId,
  );
  if (intentError || !intent) {
    return { error: buildError("NOT_FOUND", "Intent not found", intentError) };
  }

  if (intent.status === "canceled") {
    return { error: buildError("INTENT_CANCELED", "Intent is canceled") };
  }

  if (intent.expires_at && new Date(intent.expires_at) < new Date()) {
    return { error: buildError("INTENT_EXPIRED", "Intent is expired") };
  }

  const startedAt = new Date().toISOString();
  const {
    run,
    conflict,
    error: insertError,
  } = await insertRunningRun({
    userId,
    intentId: input.intentId,
    idempotencyKey: input.idempotencyKey,
    startedAt,
  });

  if (insertError) {
    return {
      error: buildError("DB_ERROR", "Failed to create run record", insertError),
    };
  }

  if (!run) {
    return {
      error: buildError("DB_ERROR", "Run could not be created or fetched"),
    };
  }

  if (conflict) {
    revalidateExecPaths(input.intentId, run.id);
    return { runId: run.id };
  }

  const executorResult = await executeWithExecutor(
    intent.action,
    intent.args ?? {},
  );
  const finishedAt = new Date().toISOString();

  if (!executorResult.ok) {
    const failureError =
      executorResult.error ??
      buildError("EXEC_FAILED", "Executor failed without a reason");
    const { error: failureUpdateError } = await markRunFailure(
      userId,
      run.id,
      finishedAt,
      failureError,
    );
    revalidateExecPaths(input.intentId, run.id);
    if (failureUpdateError) {
      return {
        runId: run.id,
        error: buildError(
          "DB_ERROR",
          "Failed to update run",
          failureUpdateError,
        ),
      };
    }
    return { runId: run.id, error: failureError };
  }

  const { error: updateError } = await markRunSuccess(
    userId,
    run.id,
    finishedAt,
    executorResult.output,
  );

  revalidateExecPaths(input.intentId, run.id);

  if (updateError) {
    return {
      runId: run.id,
      error: buildError("DB_ERROR", "Failed to update run", updateError),
    };
  }

  return { runId: run.id };
}

export async function createIntentAction(formData: FormData) {
  const userId = await getServerUserId();
  if (!userId) {
    redirect("/login");
  }

  const action = String(formData.get("action") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const rawArgs = String(formData.get("args") ?? "{}").trim();

  if (!action) {
    redirect("/intents");
  }

  let args: unknown = null;
  if (rawArgs.length > 0) {
    try {
      args = JSON.parse(rawArgs);
    } catch {
      args = { raw: rawArgs };
    }
  }

  const intentId = uuidV7Like();

  await createIntent({
    id: intentId,
    userId,
    action,
    status,
    args,
  });

  revalidatePath("/intents");
  redirect(`/intents/${intentId}/execute`);
}
