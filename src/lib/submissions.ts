import { createSupabaseAdminClient } from "./supabase/server";

export type SubmissionRecord = {
  id: string;
  researcher_id: string;
  user_id: string;
  submission_type: string;
  title: string;
  status: "pending" | "approved" | "rejected";
  payload: Record<string, unknown>;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  researchers?: { name: string; slug: string } | null;
};

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export async function createSubmission(params: {
  researcher_id: string;
  user_id: string;
  submission_type: string;
  title: string;
  payload: Record<string, unknown>;
}): Promise<{ id: string }> {
  const client = createSupabaseAdminClient();

  // 1. Try researcher_submissions table first
  try {
    const { data, error } = await client
      .from("researcher_submissions")
      .insert({
        researcher_id: params.researcher_id,
        user_id: params.user_id,
        submission_type: params.submission_type,
        title: params.title,
        status: "pending",
        payload: params.payload,
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      return { id: data.id };
    }
  } catch {
    // Fall back to activity_audit if table is syncing
  }

  // 2. Resilient fallback using canonical activity_audit table
  const { data: auditData, error: auditError } = await client
    .from("activity_audit")
    .insert({
      entity_type: "researcher_submission",
      action: `submission:${params.submission_type}:pending`,
      entity_id: params.researcher_id,
      description: params.title,
      previous_value: {
        status: "pending",
        submission_type: params.submission_type,
        user_id: params.user_id,
        admin_notes: null,
      },
      new_value: params.payload,
    })
    .select("id")
    .single();

  if (auditError || !auditData?.id) {
    throw new Error(auditError?.message || "Failed to record submission");
  }

  return { id: auditData.id };
}

export async function listSubmissionsForResearcher(researcherId: string): Promise<SubmissionRecord[]> {
  const client = createSupabaseAdminClient();

  // Try researcher_submissions
  try {
    const { data, error } = await client
      .from("researcher_submissions")
      .select(`
        id,
        researcher_id,
        user_id,
        submission_type,
        title,
        status,
        payload,
        admin_notes,
        reviewed_by,
        reviewed_at,
        created_at
      `)
      .eq("researcher_id", researcherId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as SubmissionRecord[];
    }
  } catch {
    // fallback
  }

  // Fallback from activity_audit
  try {
    const { data, error } = await client
      .from("activity_audit")
      .select("id, entity_id, description, action, previous_value, new_value, created_at")
      .eq("entity_type", "researcher_submission")
      .eq("entity_id", researcherId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((row) => {
        const meta = (row.previous_value || {}) as Record<string, unknown>;
        return {
          id: row.id,
          researcher_id: row.entity_id,
          user_id: (meta.user_id as string) || "",
          submission_type: (meta.submission_type as string) || "profile_update",
          title: row.description,
          status: (meta.status as "pending" | "approved" | "rejected") || "pending",
          payload: (row.new_value || {}) as Record<string, unknown>,
          admin_notes: (meta.admin_notes as string) || null,
          reviewed_by: (meta.reviewed_by as string) || null,
          reviewed_at: (meta.reviewed_at as string) || null,
          created_at: row.created_at,
        };
      });
    }
  } catch {
    // empty
  }

  return [];
}

export async function listAllSubmissions(): Promise<SubmissionRecord[]> {
  const client = createSupabaseAdminClient();

  // Try researcher_submissions with linked researcher
  try {
    const { data, error } = await client
      .from("researcher_submissions")
      .select(`
        id,
        researcher_id,
        user_id,
        submission_type,
        title,
        status,
        payload,
        admin_notes,
        reviewed_by,
        reviewed_at,
        created_at,
        researchers (name, slug)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((d) => ({
        ...d,
        researchers: toItem(d.researchers as unknown as { name: string; slug: string }),
      })) as SubmissionRecord[];
    }
  } catch {
    // fallback
  }

  // Fallback to activity_audit
  try {
    const [auditRes, researchersRes] = await Promise.all([
      client
        .from("activity_audit")
        .select("id, entity_id, description, action, previous_value, new_value, created_at")
        .eq("entity_type", "researcher_submission")
        .order("created_at", { ascending: false }),
      client.from("researchers").select("id, name, slug"),
    ]);

    const researchersMap = new Map((researchersRes.data || []).map((r) => [r.id, r]));

    if (!auditRes.error && auditRes.data) {
      return auditRes.data.map((row) => {
        const meta = (row.previous_value || {}) as Record<string, unknown>;
        return {
          id: row.id,
          researcher_id: row.entity_id,
          user_id: (meta.user_id as string) || "",
          submission_type: (meta.submission_type as string) || "profile_update",
          title: row.description,
          status: (meta.status as "pending" | "approved" | "rejected") || "pending",
          payload: (row.new_value || {}) as Record<string, unknown>,
          admin_notes: (meta.admin_notes as string) || null,
          reviewed_by: (meta.reviewed_by as string) || null,
          reviewed_at: (meta.reviewed_at as string) || null,
          created_at: row.created_at,
          researchers: researchersMap.get(row.entity_id) || null,
        };
      });
    }
  } catch {
    // empty
  }

  return [];
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  const client = createSupabaseAdminClient();

  try {
    const { data, error } = await client
      .from("researcher_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) return data as SubmissionRecord;
  } catch {
    // fallback
  }

  try {
    const { data, error } = await client
      .from("activity_audit")
      .select("id, entity_id, description, action, previous_value, new_value, created_at")
      .eq("id", id)
      .single();

    if (!error && data) {
      const meta = (data.previous_value || {}) as Record<string, unknown>;
      return {
        id: data.id,
        researcher_id: data.entity_id,
        user_id: (meta.user_id as string) || "",
        submission_type: (meta.submission_type as string) || "profile_update",
        title: data.description,
        status: (meta.status as "pending" | "approved" | "rejected") || "pending",
        payload: (data.new_value || {}) as Record<string, unknown>,
        admin_notes: (meta.admin_notes as string) || null,
        reviewed_by: (meta.reviewed_by as string) || null,
        reviewed_at: (meta.reviewed_at as string) || null,
        created_at: data.created_at,
      };
    }
  } catch {
    // empty
  }

  return null;
}

export async function updateSubmissionStatus(params: {
  id: string;
  status: "approved" | "rejected";
  admin_notes: string;
  reviewer_id: string;
}): Promise<void> {
  const client = createSupabaseAdminClient();

  try {
    const { error } = await client
      .from("researcher_submissions")
      .update({
        status: params.status,
        admin_notes: params.admin_notes,
        reviewed_by: params.reviewer_id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (!error) return;
  } catch {
    // fallback
  }

  // Fallback to activity_audit
  const { data: auditRow } = await client
    .from("activity_audit")
    .select("previous_value")
    .eq("id", params.id)
    .single();

  const prev = (auditRow?.previous_value || {}) as Record<string, unknown>;
  await client
    .from("activity_audit")
    .update({
      action: `submission:${prev.submission_type || "update"}:${params.status}`,
      previous_value: {
        ...prev,
        status: params.status,
        admin_notes: params.admin_notes,
        reviewed_by: params.reviewer_id,
        reviewed_at: new Date().toISOString(),
      },
    })
    .eq("id", params.id);
}
