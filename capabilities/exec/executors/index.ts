import type { RunErrorPayload } from "../schema";
import { executeEcho } from "./echo";
import { executeTimestamp } from "./timestamp";

type ExecutorFn = (args: unknown) => Promise<unknown> | unknown;

const executors: Record<string, ExecutorFn> = {
  echo: executeEcho,
  timestamp: executeTimestamp,
};

export type ExecutorResult =
  | { ok: true; output: unknown }
  | {
      ok: false;
      error: RunErrorPayload;
    };

export async function executeWithExecutor(
  action: string,
  args: unknown,
): Promise<ExecutorResult> {
  const executor = executors[action];

  if (!executor) {
    return {
      ok: false,
      error: {
        code: "ACTION_NOT_SUPPORTED",
        message: `Action "${action}" is not supported.`,
      },
    };
  }

  try {
    const output = await executor(args);
    return { ok: true, output };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "EXEC_FAILED",
        message: "Executor threw an error.",
        details: serializeError(error),
      },
    };
  }
}

const serializeError = (error: unknown) => {
  if (!error) return null;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "object") {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return { message: String(error) };
    }
  }

  return { message: String(error) };
};
