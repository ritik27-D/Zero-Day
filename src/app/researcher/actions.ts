"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireResearcher } from "@/lib/auth";
import { createSubmission } from "@/lib/submissions";

export async function submitResearchUpdateAction(formData: FormData) {
  const session = await requireResearcher();
  const researcherId = session.profile.researcherId;

  if (!researcherId) {
    redirect("/researcher/submissions?error=Your+account+is+not+linked+to+an+active+researcher+profile.+Please+contact+an+administrator.");
  }

  const submission_type = formData.get("submission_type")?.toString().trim() || "profile_update";
  const title = formData.get("title")?.toString().trim() || "Research Update Request";

  // Build payload based on submission type
  let payload: Record<string, unknown> = {};

  if (submission_type === "profile_update") {
    const updatedBio = formData.get("bio")?.toString().trim();
    const updatedTitle = formData.get("title_role")?.toString().trim();
    payload = {
      title: updatedTitle,
      bio: updatedBio,
    };
  } else if (submission_type === "new_project" || submission_type === "project_update") {
    payload = {
      project_id: formData.get("project_id")?.toString().trim() || null,
      project_title: formData.get("project_title")?.toString().trim(),
      slug: formData.get("project_slug")?.toString().trim().toLowerCase(),
      description: formData.get("description")?.toString().trim(),
      status: formData.get("status")?.toString().trim() || "planned",
      start_date: formData.get("start_date")?.toString().trim() || null,
      end_date: formData.get("end_date")?.toString().trim() || null,
    };
  } else if (submission_type === "new_publication") {
    payload = {
      pub_title: formData.get("pub_title")?.toString().trim(),
      slug: formData.get("pub_slug")?.toString().trim().toLowerCase(),
      abstract: formData.get("abstract")?.toString().trim(),
      venue: formData.get("venue")?.toString().trim(),
      status: formData.get("status")?.toString().trim() || "published",
      doi: formData.get("doi")?.toString().trim() || null,
      published_at: formData.get("published_at")?.toString().trim() || null,
      linked_project_id: formData.get("linked_project_id")?.toString().trim() || null,
    };
  }

  try {
    await createSubmission({
      researcher_id: researcherId,
      user_id: session.user.id,
      submission_type,
      title,
      payload,
    });

    revalidatePath("/researcher");
    revalidatePath("/researcher/submissions");
    revalidatePath("/admin");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create submission";
    redirect(`/researcher/submissions?error=${encodeURIComponent(msg)}`);
  }

  redirect(`/researcher/submissions?success=${encodeURIComponent(`Update "${title}" submitted successfully for Administrator review.`)}`);
}
