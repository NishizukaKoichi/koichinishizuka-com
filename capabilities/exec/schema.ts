import { z } from "zod";

export const executeInputSchema = z.object({
  intentId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
});

export type ExecuteInput = z.infer<typeof executeInputSchema>;

export const runStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
]);

export type RunStatus = z.infer<typeof runStatusSchema>;

export const runErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export type RunErrorPayload = z.infer<typeof runErrorPayloadSchema>;

export const runRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  intent_id: z.string().uuid(),
  idempotency_key: z.string(),
  status: runStatusSchema,
  output: z.any().nullable(),
  error: runErrorPayloadSchema.nullable(),
  started_at: z.string().datetime().nullable(),
  finished_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export type RunRecord = z.infer<typeof runRecordSchema>;

export const intentRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  action: z.string(),
  args: z.any().nullable(),
  status: z.string().nullable(),
  expires_at: z.string().datetime().nullable(),
  created_at: z.string().datetime().nullable(),
});

export type IntentRecord = z.infer<typeof intentRecordSchema>;
