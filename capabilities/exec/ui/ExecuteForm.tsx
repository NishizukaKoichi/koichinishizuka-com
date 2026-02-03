"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import type { ExecuteResult } from "../actions";
import { ExecuteButton } from "./ExecuteButton";
import { IdempotencyKeyField } from "./IdempotencyKeyField";

type Props = {
  intentId: string;
  defaultIdempotencyKey: string;
  action: (state: ExecuteResult, formData: FormData) => Promise<ExecuteResult>;
};

const initialState: ExecuteResult = {};

export function ExecuteForm({
  intentId,
  defaultIdempotencyKey,
  action,
}: Props) {
  const stableIdempotencyKey = useMemo(
    () => defaultIdempotencyKey,
    [defaultIdempotencyKey],
  );
  const [idempotencyKey] = useState(stableIdempotencyKey);
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded border p-4">
      <input type="hidden" name="intent_id" value={intentId} />
      <IdempotencyKeyField value={idempotencyKey} />
      <div className="flex items-center gap-3">
        <ExecuteButton />
        <span className="text-xs text-gray-500">
          Idempotency key: {idempotencyKey}
        </span>
      </div>
      {state?.runId && (
        <div className="rounded border border-green-300 bg-green-50 p-2 text-sm text-green-800">
          Started run:{" "}
          <Link href={`/runs/${state.runId}`} className="underline">
            {state.runId}
          </Link>
        </div>
      )}
      {state?.error && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">
          {state.error.code}: {state.error.message}
        </div>
      )}
    </form>
  );
}
