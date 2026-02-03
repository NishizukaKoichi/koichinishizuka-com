import { query } from "../db/epoch";
import { uuidV7Like } from "../ids";
import { createEpochRecord } from "../epoch-records";
import { ensureProfile } from "./profiles";

export type ScoutStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_discussion"
  | "completed"
  | "withdrawn";

export type ScoutInitiatorInfo = {
  organization?: string | null;
  role?: string | null;
  projectSummary?: string | null;
};

export type ScoutInboxEntry = {
  id: string;
  status: ScoutStatus;
  sentAt: string;
  respondedAt?: string | null;
  fromUserId?: string | null;
  fromDisplayName?: string | null;
  toUserId?: string | null;
  toDisplayName?: string | null;
  initiatorInfo?: ScoutInitiatorInfo;
  hasConversation: boolean;
};

export type ScoutMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isSystem: boolean;
};

export type ScoutConversation = {
  id: string;
  status: ScoutStatus;
  initiatorId: string;
  initiatorName: string;
  initiatorInfo: ScoutInitiatorInfo;
  targetId: string;
  targetName: string;
  messages: ScoutMessage[];
  createdAt: string;
  acceptedAt?: string | null;
  completedAt?: string | null;
};

const SCOUT_MESSAGE = "一回来て、仕事を一緒にやってみませんか？";

const SYSTEM_SENDER = {
  id: "system",
  name: "システム",
};

type ScoutRow = {
  scout_id: string;
  initiator_user_id: string;
  target_user_id: string;
  status: ScoutStatus;
  initiator_org_name: string | null;
  initiator_role: string | null;
  project_summary: string | null;
  created_at: string;
  responded_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  withdrawn_at: string | null;
  completed_at: string | null;
  initiator_name: string | null;
  target_name: string | null;
  has_conversation: boolean | null;
};

type MessageRow = {
  message_id: string;
  sender_user_id: string | null;
  sender_name: string | null;
  content: string;
  created_at: string;
  is_system: boolean;
};

function mapInitiatorInfo(row: ScoutRow): ScoutInitiatorInfo {
  return {
    organization: row.initiator_org_name ?? undefined,
    role: row.initiator_role ?? undefined,
    projectSummary: row.project_summary ?? undefined,
  };
}

async function recordScoutEvent(options: {
  userId: string;
  recordType: "invited" | "declined" | "decision_made";
  payload: Record<string, unknown>;
}): Promise<void> {
  await createEpochRecord({
    userId: options.userId,
    recordType: options.recordType,
    payload: options.payload,
    visibility: "private",
  });
}

async function addSystemMessage(scoutId: string, content: string): Promise<void> {
  await query(
    `INSERT INTO epoch_scout_messages (
       message_id,
       scout_id,
       sender_user_id,
       content,
       is_system,
       created_at
     ) VALUES ($1, $2, $3, $4, true, $5)`,
    [uuidV7Like(), scoutId, null, content, new Date().toISOString()]
  );
}

export async function listScoutsForUser(userId: string): Promise<{
  received: ScoutInboxEntry[];
  sent: ScoutInboxEntry[];
}> {
  await ensureProfile(userId);

  const receivedRows = await query<ScoutRow>(
    `SELECT s.*, initiator.display_name AS initiator_name, target.display_name AS target_name,
            EXISTS (
              SELECT 1 FROM epoch_scout_messages m
              WHERE m.scout_id = s.scout_id AND m.is_system = false
            ) AS has_conversation
     FROM epoch_scouts s
     LEFT JOIN epoch_profiles initiator ON initiator.user_id = s.initiator_user_id
     LEFT JOIN epoch_profiles target ON target.user_id = s.target_user_id
     WHERE s.target_user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );

  const sentRows = await query<ScoutRow>(
    `SELECT s.*, initiator.display_name AS initiator_name, target.display_name AS target_name,
            EXISTS (
              SELECT 1 FROM epoch_scout_messages m
              WHERE m.scout_id = s.scout_id AND m.is_system = false
            ) AS has_conversation
     FROM epoch_scouts s
     LEFT JOIN epoch_profiles initiator ON initiator.user_id = s.initiator_user_id
     LEFT JOIN epoch_profiles target ON target.user_id = s.target_user_id
     WHERE s.initiator_user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );

  const received = receivedRows.map((row) => ({
    id: row.scout_id,
    status: row.status,
    sentAt: row.created_at,
    respondedAt: row.responded_at,
    fromUserId: row.initiator_user_id,
    fromDisplayName: row.initiator_name ?? row.initiator_user_id,
    initiatorInfo: mapInitiatorInfo(row),
    hasConversation: Boolean(row.has_conversation),
  }));

  const sent = sentRows.map((row) => ({
    id: row.scout_id,
    status: row.status,
    sentAt: row.created_at,
    respondedAt: row.responded_at,
    toUserId: row.target_user_id,
    toDisplayName: row.target_name ?? row.target_user_id,
    hasConversation: Boolean(row.has_conversation),
  }));

  return { received, sent };
}

export async function getScoutConversation(options: {
  scoutId: string;
  userId: string;
}): Promise<ScoutConversation | null> {
  const rows = await query<ScoutRow>(
    `SELECT s.*, initiator.display_name AS initiator_name, target.display_name AS target_name,
            false AS has_conversation
     FROM epoch_scouts s
     LEFT JOIN epoch_profiles initiator ON initiator.user_id = s.initiator_user_id
     LEFT JOIN epoch_profiles target ON target.user_id = s.target_user_id
     WHERE s.scout_id = $1
       AND (s.initiator_user_id = $2 OR s.target_user_id = $2)`,
    [options.scoutId, options.userId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const messages = await query<MessageRow>(
    `SELECT m.message_id, m.sender_user_id, m.content, m.created_at, m.is_system,
            sender.display_name AS sender_name
     FROM epoch_scout_messages m
     LEFT JOIN epoch_profiles sender ON sender.user_id = m.sender_user_id
     WHERE m.scout_id = $1
     ORDER BY m.created_at ASC`,
    [options.scoutId]
  );

  return {
    id: row.scout_id,
    status: row.status,
    initiatorId: row.initiator_user_id,
    initiatorName: row.initiator_name ?? row.initiator_user_id,
    initiatorInfo: mapInitiatorInfo(row),
    targetId: row.target_user_id,
    targetName: row.target_name ?? row.target_user_id,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    completedAt: row.completed_at,
    messages: messages.map((message) => ({
      id: message.message_id,
      senderId: message.is_system ? SYSTEM_SENDER.id : message.sender_user_id ?? "unknown",
      senderName: message.is_system
        ? SYSTEM_SENDER.name
        : message.sender_name ?? message.sender_user_id ?? "Unknown",
      content: message.content,
      timestamp: message.created_at,
      isSystem: message.is_system,
    })),
  };
}

export async function createScout(options: {
  initiatorUserId: string;
  targetUserId: string;
  initiatorOrgName?: string | null;
  initiatorRole?: string | null;
  projectSummary?: string | null;
}): Promise<ScoutConversation> {
  const { initiatorUserId, targetUserId } = options;
  if (!initiatorUserId || !targetUserId) {
    throw new Error("initiatorUserId and targetUserId are required");
  }
  if (initiatorUserId === targetUserId) {
    throw new Error("Cannot scout yourself");
  }

  await ensureProfile(initiatorUserId);
  await ensureProfile(targetUserId);

  const scoutId = uuidV7Like();
  const nowIso = new Date().toISOString();

  await query(
    `INSERT INTO epoch_scouts (
       scout_id,
       initiator_user_id,
       target_user_id,
       status,
       initiator_org_name,
       initiator_role,
       project_summary,
       created_at
     ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)`,
    [
      scoutId,
      initiatorUserId,
      targetUserId,
      options.initiatorOrgName ?? null,
      options.initiatorRole ?? null,
      options.projectSummary ?? null,
      nowIso,
    ]
  );

  await addSystemMessage(
    scoutId,
    `スカウトが送信されました: 「${SCOUT_MESSAGE}」`
  );

  const payload = {
    scout_id: scoutId,
    message: SCOUT_MESSAGE,
    initiator_user_id: initiatorUserId,
    target_user_id: targetUserId,
    initiator_org_name: options.initiatorOrgName ?? null,
    initiator_role: options.initiatorRole ?? null,
    project_summary: options.projectSummary ?? null,
  };

  await recordScoutEvent({
    userId: initiatorUserId,
    recordType: "invited",
    payload: {
      ...payload,
      direction: "sent",
    },
  });

  await recordScoutEvent({
    userId: targetUserId,
    recordType: "invited",
    payload: {
      ...payload,
      direction: "received",
    },
  });

  const conversation = await getScoutConversation({ scoutId, userId: initiatorUserId });
  if (!conversation) {
    throw new Error("Failed to load scout conversation");
  }
  return conversation;
}

export async function acceptScout(options: {
  scoutId: string;
  userId: string;
}): Promise<ScoutConversation> {
  const nowIso = new Date().toISOString();
  const rows = await query<ScoutRow>(
    `UPDATE epoch_scouts
     SET status = 'accepted', responded_at = $1, accepted_at = $1
     WHERE scout_id = $2
       AND target_user_id = $3
       AND status = 'pending'
     RETURNING *`,
    [nowIso, options.scoutId, options.userId]
  );

  if (rows.length === 0) {
    throw new Error("Scout not found or already responded");
  }

  await addSystemMessage(options.scoutId, "スカウトが承諾されました。詳細の擦り合わせを開始できます。");

  const row = rows[0];
  const payload = {
    scout_id: row.scout_id,
    initiator_user_id: row.initiator_user_id,
    target_user_id: row.target_user_id,
    status: "accepted",
  };

  await recordScoutEvent({
    userId: row.initiator_user_id,
    recordType: "decision_made",
    payload: { ...payload, direction: "sent" },
  });
  await recordScoutEvent({
    userId: row.target_user_id,
    recordType: "decision_made",
    payload: { ...payload, direction: "received" },
  });

  const conversation = await getScoutConversation({ scoutId: row.scout_id, userId: options.userId });
  if (!conversation) {
    throw new Error("Failed to load scout conversation");
  }
  return conversation;
}

export async function declineScout(options: {
  scoutId: string;
  userId: string;
}): Promise<ScoutConversation> {
  const nowIso = new Date().toISOString();
  const rows = await query<ScoutRow>(
    `UPDATE epoch_scouts
     SET status = 'declined', responded_at = $1, declined_at = $1
     WHERE scout_id = $2
       AND target_user_id = $3
       AND status = 'pending'
     RETURNING *`,
    [nowIso, options.scoutId, options.userId]
  );

  if (rows.length === 0) {
    throw new Error("Scout not found or already responded");
  }

  await addSystemMessage(options.scoutId, "スカウトが辞退されました。");

  const row = rows[0];
  const payload = {
    scout_id: row.scout_id,
    initiator_user_id: row.initiator_user_id,
    target_user_id: row.target_user_id,
    status: "declined",
  };

  await recordScoutEvent({
    userId: row.initiator_user_id,
    recordType: "declined",
    payload: { ...payload, direction: "sent" },
  });
  await recordScoutEvent({
    userId: row.target_user_id,
    recordType: "declined",
    payload: { ...payload, direction: "received" },
  });

  const conversation = await getScoutConversation({ scoutId: row.scout_id, userId: options.userId });
  if (!conversation) {
    throw new Error("Failed to load scout conversation");
  }
  return conversation;
}

export async function withdrawScout(options: {
  scoutId: string;
  userId: string;
}): Promise<ScoutConversation> {
  const nowIso = new Date().toISOString();
  const rows = await query<ScoutRow>(
    `UPDATE epoch_scouts
     SET status = 'withdrawn', responded_at = $1, withdrawn_at = $1
     WHERE scout_id = $2
       AND initiator_user_id = $3
       AND status IN ('pending', 'accepted', 'in_discussion')
     RETURNING *`,
    [nowIso, options.scoutId, options.userId]
  );

  if (rows.length === 0) {
    throw new Error("Scout not found or cannot withdraw");
  }

  await addSystemMessage(options.scoutId, "この会話は取り下げられました。");

  const conversation = await getScoutConversation({ scoutId: rows[0].scout_id, userId: options.userId });
  if (!conversation) {
    throw new Error("Failed to load scout conversation");
  }
  return conversation;
}

export async function completeScout(options: {
  scoutId: string;
  userId: string;
}): Promise<ScoutConversation> {
  const nowIso = new Date().toISOString();
  const rows = await query<ScoutRow>(
    `UPDATE epoch_scouts
     SET status = 'completed', completed_at = $1
     WHERE scout_id = $2
       AND (initiator_user_id = $3 OR target_user_id = $3)
       AND status IN ('accepted', 'in_discussion')
     RETURNING *`,
    [nowIso, options.scoutId, options.userId]
  );

  if (rows.length === 0) {
    throw new Error("Scout not found or cannot complete");
  }

  await addSystemMessage(options.scoutId, "この会話は完了としてマークされました。");

  const conversation = await getScoutConversation({ scoutId: rows[0].scout_id, userId: options.userId });
  if (!conversation) {
    throw new Error("Failed to load scout conversation");
  }
  return conversation;
}

export async function addScoutMessage(options: {
  scoutId: string;
  userId: string;
  content: string;
}): Promise<ScoutConversation> {
  if (!options.content.trim()) {
    throw new Error("Message content is required");
  }

  const rows = await query<ScoutRow>(
    `SELECT *
     FROM epoch_scouts
     WHERE scout_id = $1
       AND (initiator_user_id = $2 OR target_user_id = $2)`,
    [options.scoutId, options.userId]
  );

  if (rows.length === 0) {
    throw new Error("Scout not found");
  }

  const scout = rows[0];
  if (["declined", "withdrawn", "completed"].includes(scout.status)) {
    throw new Error("Scout conversation is closed");
  }

  await query(
    `INSERT INTO epoch_scout_messages (
       message_id,
       scout_id,
       sender_user_id,
       content,
       is_system,
       created_at
     ) VALUES ($1, $2, $3, $4, false, $5)`,
    [uuidV7Like(), options.scoutId, options.userId, options.content.trim(), new Date().toISOString()]
  );

  if (scout.status === "accepted") {
    await query(
      `UPDATE epoch_scouts
       SET status = 'in_discussion'
       WHERE scout_id = $1`,
      [options.scoutId]
    );
  }

  const conversation = await getScoutConversation({ scoutId: options.scoutId, userId: options.userId });
  if (!conversation) {
    throw new Error("Failed to load scout conversation");
  }
  return conversation;
}
