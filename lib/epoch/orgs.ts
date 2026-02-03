import { query } from "../db/epoch";
import { uuidV7Like } from "../ids";
import { ensureProfile } from "./profiles";

export type PublicOrganization = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  memberCount: number;
  publicMemberCount: number;
  foundedAt: string | null;
  description: string | null;
};

export type OrgMember = {
  userId: string;
  displayName: string | null;
  department: string | null;
  role: string | null;
  recordCount: number;
  joinedAt: string | null;
};

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  ownerId: string | null;
  createdAt: string;
  settings: {
    allowMemberEpochAccess: boolean;
    requireApprovalForJoin: boolean;
  };
  isPublic: boolean;
  industry: string | null;
  location: string | null;
  foundedAt: string | null;
  description: string | null;
};

export type OrganizationStats = {
  totalMembers: number;
  totalRecords: number;
  activeToday: number;
  departments: number;
};

export type OrganizationDepartment = {
  id: string;
  organizationId: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt: string;
};

export type OrganizationMemberDetail = {
  id: string;
  userId: string;
  displayName: string | null;
  departmentId: string | null;
  role: string | null;
  joinedAt: string | null;
};

export type OrganizationActivity = {
  recordId: string;
  userId: string;
  displayName: string | null;
  recordType: string;
  recordedAt: string;
};

export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  role: string | null;
  memberCount: number;
};

type OrgRow = {
  org_id: string;
  name: string;
  slug: string | null;
  owner_user_id: string | null;
  created_at: string;
  allow_member_epoch_access: boolean | null;
  require_approval_for_join: boolean | null;
  is_public: boolean | null;
  industry: string | null;
  location: string | null;
  founded_at: string | null;
  description: string | null;
  member_count: string | number | null;
  public_member_count: string | number | null;
};

type MemberRow = {
  membership_id?: string;
  user_id: string;
  display_name: string | null;
  department: string | null;
  role: string | null;
  joined_at: string | null;
  record_count: string | number | null;
};

type UserOrgRow = {
  org_id: string;
  name: string;
  slug: string | null;
  role: string | null;
  member_count: string | number | null;
};

type OrgStatsRow = {
  total_members: string | number | null;
  total_records: string | number | null;
  active_today: string | number | null;
  department_count: string | number | null;
};

type OrgMemberDetailRow = {
  membership_id: string;
  user_id: string;
  display_name: string | null;
  department: string | null;
  role: string | null;
  joined_at: string | null;
};

type DepartmentRow = {
  department_id: string;
  org_id: string;
  name: string;
  parent_id: string | null;
  sort_order: number | null;
  created_at: string;
};

type ActivityRow = {
  record_id: string;
  record_type: string;
  recorded_at: string;
  user_id: string;
  display_name: string | null;
};

export async function listPublicOrganizations(): Promise<PublicOrganization[]> {
  const rows = await query<OrgRow>(
    `SELECT o.org_id, o.name, o.slug, o.owner_user_id, o.created_at,
            o.allow_member_epoch_access, o.require_approval_for_join, o.is_public,
            o.industry, o.location, o.founded_at, o.description,
            counts.member_count, counts.public_member_count
     FROM epoch_orgs o
     LEFT JOIN (
       SELECT org_id,
              COUNT(*) AS member_count,
              COUNT(*) FILTER (WHERE is_public = true) AS public_member_count
       FROM epoch_org_members
       GROUP BY org_id
     ) counts
       ON counts.org_id = o.org_id
     WHERE o.is_public = true
     ORDER BY o.name ASC`
  );

  return rows.map((row) => ({
    id: row.org_id,
    name: row.name,
    industry: row.industry,
    location: row.location,
    memberCount: Number(row.member_count ?? 0),
    publicMemberCount: Number(row.public_member_count ?? 0),
    foundedAt: row.founded_at,
    description: row.description,
  }));
}

export async function getPublicOrganization(orgId: string): Promise<PublicOrganization | null> {
  const rows = await query<OrgRow>(
    `SELECT o.org_id, o.name, o.slug, o.owner_user_id, o.created_at,
            o.allow_member_epoch_access, o.require_approval_for_join, o.is_public,
            o.industry, o.location, o.founded_at, o.description,
            counts.member_count, counts.public_member_count
     FROM epoch_orgs o
     LEFT JOIN (
       SELECT org_id,
              COUNT(*) AS member_count,
              COUNT(*) FILTER (WHERE is_public = true) AS public_member_count
       FROM epoch_org_members
       GROUP BY org_id
     ) counts
       ON counts.org_id = o.org_id
     WHERE o.org_id = $1
       AND o.is_public = true`,
    [orgId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.org_id,
    name: row.name,
    industry: row.industry,
    location: row.location,
    memberCount: Number(row.member_count ?? 0),
    publicMemberCount: Number(row.public_member_count ?? 0),
    foundedAt: row.founded_at,
    description: row.description,
  };
}

export async function listPublicMembers(orgId: string): Promise<OrgMember[]> {
  const rows = await query<MemberRow>(
    `SELECT m.user_id, p.display_name, m.department, m.role, m.joined_at,
            stats.record_count
     FROM epoch_org_members m
     JOIN epoch_profiles p ON p.user_id = m.user_id
     LEFT JOIN (
       SELECT user_id, COUNT(record_id) AS record_count
       FROM epoch_records
       GROUP BY user_id
     ) stats
       ON stats.user_id = m.user_id
     WHERE m.org_id = $1
       AND m.is_public = true
     ORDER BY stats.record_count DESC NULLS LAST, m.joined_at ASC NULLS LAST`,
    [orgId]
  );

  return rows.map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    department: row.department,
    role: row.role,
    recordCount: Number(row.record_count ?? 0),
    joinedAt: row.joined_at,
  }));
}

export async function listUserOrganizations(userId: string): Promise<UserOrganization[]> {
  await ensureProfile(userId);
  const rows = await query<UserOrgRow>(
    `SELECT o.org_id, o.name, o.slug, m.role,
            counts.member_count
     FROM epoch_org_members m
     JOIN epoch_orgs o ON o.org_id = m.org_id
     LEFT JOIN (
       SELECT org_id, COUNT(*) AS member_count
       FROM epoch_org_members
       GROUP BY org_id
     ) counts
       ON counts.org_id = o.org_id
     WHERE m.user_id = $1
     ORDER BY o.name ASC`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.org_id,
    name: row.name,
    role: row.role,
    slug: row.slug ?? "",
    memberCount: Number(row.member_count ?? 0),
  }));
}

export async function addOrgMember(options: {
  orgId: string;
  userId: string;
  role?: string | null;
  department?: string | null;
  joinedAt?: string | null;
  isPublic?: boolean;
}): Promise<void> {
  await ensureProfile(options.userId);
  await query(
    `INSERT INTO epoch_org_members (
       membership_id,
       org_id,
       user_id,
       role,
       department,
       joined_at,
       is_public
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (org_id, user_id) DO UPDATE SET
       role = EXCLUDED.role,
       department = EXCLUDED.department,
       joined_at = EXCLUDED.joined_at,
       is_public = EXCLUDED.is_public`,
    [
      uuidV7Like(),
      options.orgId,
      options.userId,
      options.role ?? null,
      options.department ?? null,
      options.joinedAt ?? null,
      options.isPublic ?? false,
    ]
  );
}

export async function getOrganizationDetail(orgId: string): Promise<OrganizationDetail | null> {
  const rows = await query<OrgRow>(
    `SELECT org_id, name, slug, owner_user_id, created_at,
            allow_member_epoch_access, require_approval_for_join, is_public,
            industry, location, founded_at, description
     FROM epoch_orgs
     WHERE org_id = $1`,
    [orgId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.org_id,
    name: row.name,
    slug: row.slug ?? row.org_id,
    ownerId: row.owner_user_id ?? null,
    createdAt: row.created_at,
    settings: {
      allowMemberEpochAccess: row.allow_member_epoch_access ?? false,
      requireApprovalForJoin: row.require_approval_for_join ?? true,
    },
    isPublic: row.is_public ?? false,
    industry: row.industry,
    location: row.location,
    foundedAt: row.founded_at,
    description: row.description,
  };
}

export async function getOrganizationStats(orgId: string): Promise<OrganizationStats> {
  const rows = await query<OrgStatsRow>(
    `SELECT
        COUNT(DISTINCT m.user_id) AS total_members,
        COUNT(r.record_id) AS total_records,
        COUNT(r.record_id) FILTER (
          WHERE r.recorded_at::date = CURRENT_DATE
        ) AS active_today,
        COUNT(DISTINCT m.department) FILTER (
          WHERE m.department IS NOT NULL AND m.department <> ''
        ) AS department_count
     FROM epoch_org_members m
     LEFT JOIN epoch_records r ON r.user_id = m.user_id
     WHERE m.org_id = $1`,
    [orgId]
  );

  const row = rows[0];
  return {
    totalMembers: Number(row?.total_members ?? 0),
    totalRecords: Number(row?.total_records ?? 0),
    activeToday: Number(row?.active_today ?? 0),
    departments: Number(row?.department_count ?? 0),
  };
}

export async function getOrganizationRole(orgId: string, userId: string): Promise<string | null> {
  const rows = await query<{ role: string | null }>(
    `SELECT role
     FROM epoch_org_members
     WHERE org_id = $1 AND user_id = $2`,
    [orgId, userId]
  );
  if (rows.length === 0) {
    return null;
  }
  return rows[0].role ?? null;
}

export async function createOrganization(options: {
  ownerUserId: string;
  name: string;
  slug: string;
  allowMemberEpochAccess?: boolean;
  requireApprovalForJoin?: boolean;
  isPublic?: boolean;
}): Promise<OrganizationDetail> {
  await ensureProfile(options.ownerUserId);
  const orgId = uuidV7Like();
  await query(
    `INSERT INTO epoch_orgs (
       org_id,
       name,
       slug,
       owner_user_id,
       allow_member_epoch_access,
       require_approval_for_join,
       is_public
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      orgId,
      options.name,
      options.slug,
      options.ownerUserId,
      options.allowMemberEpochAccess ?? false,
      options.requireApprovalForJoin ?? true,
      options.isPublic ?? false,
    ]
  );

  await addOrgMember({
    orgId,
    userId: options.ownerUserId,
    role: "owner",
    isPublic: true,
  });

  const org = await getOrganizationDetail(orgId);
  if (!org) {
    throw new Error("Failed to create organization");
  }
  return org;
}

export async function updateOrganization(options: {
  orgId: string;
  name: string;
  slug: string;
  allowMemberEpochAccess: boolean;
  requireApprovalForJoin: boolean;
  isPublic: boolean;
}): Promise<OrganizationDetail> {
  await query(
    `UPDATE epoch_orgs
     SET name = $2,
         slug = $3,
         allow_member_epoch_access = $4,
         require_approval_for_join = $5,
         is_public = $6,
         updated_at = NOW()
     WHERE org_id = $1`,
    [
      options.orgId,
      options.name,
      options.slug,
      options.allowMemberEpochAccess,
      options.requireApprovalForJoin,
      options.isPublic,
    ]
  );

  const org = await getOrganizationDetail(options.orgId);
  if (!org) {
    throw new Error("Organization not found");
  }
  return org;
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await query(
    `DELETE FROM epoch_orgs WHERE org_id = $1`,
    [orgId]
  );
}

export async function listOrganizationMembers(orgId: string): Promise<OrganizationMemberDetail[]> {
  const rows = await query<OrgMemberDetailRow>(
    `SELECT membership_id, user_id, department, role, joined_at
     FROM epoch_org_members
     WHERE org_id = $1
     ORDER BY created_at ASC`,
    [orgId]
  );

  if (rows.length === 0) {
    return [];
  }

  const profileRows = await query<{ user_id: string; display_name: string | null }>(
    `SELECT user_id, display_name
     FROM epoch_profiles
     WHERE user_id = ANY($1::text[])`,
    [rows.map((row) => row.user_id)]
  );
  const profileMap = new Map(profileRows.map((row) => [row.user_id, row.display_name]));

  return rows.map((row) => ({
    id: row.membership_id,
    userId: row.user_id,
    displayName: profileMap.get(row.user_id) ?? null,
    departmentId: row.department,
    role: row.role,
    joinedAt: row.joined_at,
  }));
}

export async function listOrganizationDepartments(orgId: string): Promise<OrganizationDepartment[]> {
  const rows = await query<DepartmentRow>(
    `SELECT department_id, org_id, name, parent_id, sort_order, created_at
     FROM epoch_org_departments
     WHERE org_id = $1
     ORDER BY sort_order ASC, name ASC`,
    [orgId]
  );

  return rows.map((row) => ({
    id: row.department_id,
    organizationId: row.org_id,
    name: row.name,
    parentId: row.parent_id,
    order: row.sort_order ?? 0,
    createdAt: row.created_at,
  }));
}

export async function createOrganizationDepartment(options: {
  orgId: string;
  name: string;
  parentId?: string | null;
}): Promise<OrganizationDepartment> {
  const deptId = uuidV7Like();
  await query(
    `INSERT INTO epoch_org_departments (
       department_id,
       org_id,
       name,
       parent_id,
       sort_order
     ) VALUES ($1, $2, $3, $4, $5)`,
    [deptId, options.orgId, options.name, options.parentId ?? null, 0]
  );

  const rows = await query<DepartmentRow>(
    `SELECT department_id, org_id, name, parent_id, sort_order, created_at
     FROM epoch_org_departments
     WHERE department_id = $1`,
    [deptId]
  );
  const row = rows[0];
  return {
    id: row.department_id,
    organizationId: row.org_id,
    name: row.name,
    parentId: row.parent_id,
    order: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

export async function updateOrganizationDepartment(options: {
  departmentId: string;
  name: string;
  parentId?: string | null;
}): Promise<OrganizationDepartment> {
  await query(
    `UPDATE epoch_org_departments
     SET name = $2,
         parent_id = $3
     WHERE department_id = $1`,
    [options.departmentId, options.name, options.parentId ?? null]
  );

  const rows = await query<DepartmentRow>(
    `SELECT department_id, org_id, name, parent_id, sort_order, created_at
     FROM epoch_org_departments
     WHERE department_id = $1`,
    [options.departmentId]
  );
  const row = rows[0];
  return {
    id: row.department_id,
    organizationId: row.org_id,
    name: row.name,
    parentId: row.parent_id,
    order: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

export async function deleteOrganizationDepartment(departmentId: string): Promise<void> {
  await query(
    `UPDATE epoch_org_members
     SET department = NULL
     WHERE department = $1`,
    [departmentId]
  );
  await query(
    `DELETE FROM epoch_org_departments WHERE department_id = $1`,
    [departmentId]
  );
}

export async function listOrganizationActivity(orgId: string, limit = 10): Promise<OrganizationActivity[]> {
  const rows = await query<ActivityRow>(
    `SELECT r.record_id, r.record_type, r.recorded_at, p.user_id, p.display_name
     FROM epoch_org_members m
     JOIN epoch_records r ON r.user_id = m.user_id
     LEFT JOIN epoch_profiles p ON p.user_id = m.user_id
     WHERE m.org_id = $1
     ORDER BY r.recorded_at DESC
     LIMIT $2`,
    [orgId, limit]
  );

  return rows.map((row) => ({
    recordId: row.record_id,
    userId: row.user_id,
    displayName: row.display_name,
    recordType: row.record_type,
    recordedAt: row.recorded_at,
  }));
}
