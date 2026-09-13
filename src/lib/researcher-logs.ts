import { createSupabaseAdminClient } from "./supabase/server";

export type ResearcherActivityLog = {
  id: string;
  researcher_id: string;
  user_id: string;
  project_name: string;
  mentor_name: string;
  activity_date: string;
  duration: string;
  mentor_attendance: string;
  student_attendance: string;
  attendance_mode: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  researchers?: { name: string } | { name: string }[] | null;
};

export async function createResearcherActivityLog(input: {
  researcherId: string;
  userId: string;
  projectName: string;
  mentorName: string;
  activityDate: string;
  duration: string;
  mentorAttendance: string;
  studentAttendance: string;
  attendanceMode: string;
}) {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("researcher_activity_logs").insert({
    researcher_id: input.researcherId,
    user_id: input.userId,
    project_name: input.projectName,
    mentor_name: input.mentorName,
    activity_date: input.activityDate,
    duration: input.duration,
    mentor_attendance: input.mentorAttendance,
    student_attendance: input.studentAttendance,
    attendance_mode: input.attendanceMode,
  });

  if (error) throw new Error(error.message);
}

export async function listRecentResearcherActivityLogs(limit = 10) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("researcher_activity_logs")
    .select("id, researcher_id, user_id, project_name, mentor_name, activity_date, duration, mentor_attendance, student_attendance, attendance_mode, status, admin_notes, reviewed_at, created_at, researchers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ResearcherActivityLog[];
}

export async function reviewResearcherActivityLog(
  id: string,
  status: "approved" | "rejected",
  adminId: string,
  adminNotes: string | null = null
) {
  const client = createSupabaseAdminClient();
  const { error } = await client
    .from("researcher_activity_logs")
    .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString(), reviewed_by: adminId })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
