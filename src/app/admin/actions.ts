"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSubmissionById, updateSubmissionStatus } from "@/lib/submissions";
import { logAdminActivity } from "@/lib/hub-data";
import { reviewResearcherActivityLog } from "@/lib/researcher-logs";

export async function reviewResearcherLogAction(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  const status = formData.get("status")?.toString().trim();
  const notes = formData.get("admin_notes")?.toString().trim() || null;

  if (!id || (status !== "approved" && status !== "rejected")) {
    redirect(`/admin?tab=logs&error=${encodeURIComponent("Invalid researcher log review request.")}`);
  }

  try {
    await reviewResearcherActivityLog(id, status, session.user.id, notes);
    revalidatePath("/admin");
    revalidatePath("/researcher/log");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to review researcher log.";
    redirect(`/admin?tab=logs&error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin?tab=logs&success=Researcher+log+${status}+successfully.`);
}

export async function saveResearcherAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const name = formData.get("name")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const title = formData.get("title")?.toString().trim() || "";
  const bio = formData.get("bio")?.toString().trim() || "";
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";
  const research_area_ids = formData.getAll("research_area_ids").map((v) => v.toString());

  if (!name || !slug || !email || !title || !bio) {
    redirect(`/admin?tab=researchers&error=${encodeURIComponent("All researcher fields are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    let targetId = id;

    if (id) {
      const { error: updateError } = await client
        .from("researchers")
        .update({
          name,
          slug,
          email,
          title,
          bio,
          is_demo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { data: insertData, error: insertError } = await client
        .from("researchers")
        .insert({
          name,
          slug,
          email,
          title,
          bio,
          is_demo,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }
      targetId = insertData.id;
    }

    // Sync linked research areas
    await client.from("researcher_research_areas").delete().eq("researcher_id", targetId);

    if (research_area_ids.length > 0) {
      const rows = research_area_ids.map((areaId) => ({
        researcher_id: targetId,
        research_area_id: areaId,
      }));
      const { error: areaError } = await client.from("researcher_research_areas").insert(rows);
      if (areaError) {
        throw new Error(areaError.message);
      }
    }

    revalidatePath("/discover");
    revalidatePath("/researchers");
    revalidatePath(`/researchers/${slug}`);
    revalidatePath("/admin");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save researcher";
    redirect(`/admin?tab=researchers&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=researchers&success=${encodeURIComponent(`Successfully saved researcher "${name}"`)}`);
}

export async function saveProjectAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const title = formData.get("title")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const status = formData.get("status")?.toString().trim() || "planned";
  const start_date = formData.get("start_date")?.toString().trim() || null;
  const end_date = formData.get("end_date")?.toString().trim() || null;
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";

  const researcher_ids = formData.getAll("researcher_ids").map((v) => v.toString());
  const research_area_ids = formData.getAll("research_area_ids").map((v) => v.toString());
  const publication_ids = formData.getAll("publication_ids").map((v) => v.toString());

  if (!title || !slug || !description || !status) {
    redirect(`/admin?tab=projects&error=${encodeURIComponent("Title, slug, description, and status are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    let targetId = id;

    if (id) {
      const { error: updateError } = await client
        .from("projects")
        .update({
          title,
          slug,
          description,
          status,
          start_date: start_date || null,
          end_date: end_date || null,
          is_demo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { data: insertData, error: insertError } = await client
        .from("projects")
        .insert({
          title,
          slug,
          description,
          status,
          start_date: start_date || null,
          end_date: end_date || null,
          is_demo,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }
      targetId = insertData.id;
    }

    // Sync project researchers
    await client.from("project_researchers").delete().eq("project_id", targetId);
    if (researcher_ids.length > 0) {
      const rows = researcher_ids.map((rId) => ({
        project_id: targetId,
        researcher_id: rId,
      }));
      const { error: rError } = await client.from("project_researchers").insert(rows);
      if (rError) throw new Error(rError.message);
    }

    // Sync project research areas
    await client.from("project_research_areas").delete().eq("project_id", targetId);
    if (research_area_ids.length > 0) {
      const rows = research_area_ids.map((aId) => ({
        project_id: targetId,
        research_area_id: aId,
      }));
      const { error: aError } = await client.from("project_research_areas").insert(rows);
      if (aError) throw new Error(aError.message);
    }

    // Sync project publications
    await client.from("project_publications").delete().eq("project_id", targetId);
    if (publication_ids.length > 0) {
      const rows = publication_ids.map((pubId) => ({
        project_id: targetId,
        publication_id: pubId,
      }));
      const { error: pubError } = await client.from("project_publications").insert(rows);
      if (pubError) throw new Error(pubError.message);
    }

    revalidatePath("/discover");
    revalidatePath("/researchers");
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/admin");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save project";
    redirect(`/admin?tab=projects&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=projects&success=${encodeURIComponent(`Successfully saved project "${title}"`)}`);
}

export async function deleteResearcherAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  if (!id) {
    redirect("/admin?tab=researchers&error=Invalid+researcher+ID");
  }

  const client = createSupabaseAdminClient();
  const { error } = await client.from("researchers").delete().eq("id", id);
  if (error) {
    redirect(`/admin?tab=researchers&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/discover");
  revalidatePath("/researchers");
  revalidatePath("/admin");
  redirect("/admin?tab=researchers&success=Researcher+deleted+successfully");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  if (!id) {
    redirect("/admin?tab=projects&error=Invalid+project+ID");
  }

  const client = createSupabaseAdminClient();
  const { error } = await client.from("projects").delete().eq("id", id);
  if (error) {
    redirect(`/admin?tab=projects&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/discover");
  revalidatePath("/researchers");
  revalidatePath("/admin");
  redirect("/admin?tab=projects&success=Project+deleted+successfully");
}

// APPROVAL WORKFLOW ACTIONS

export async function approveSubmissionAction(formData: FormData) {
  const session = await requireAdmin();
  const submissionId = formData.get("id")?.toString().trim();
  const adminNotes = formData.get("admin_notes")?.toString().trim() || "Approved by Administrator";

  if (!submissionId) {
    redirect("/admin?tab=submissions&error=Invalid+submission+ID");
  }

  const client = createSupabaseAdminClient();

  try {
    const sub = await getSubmissionById(submissionId);

    if (!sub) {
      throw new Error("Submission record not found.");
    }

    const payload = (sub.payload || {}) as Record<string, unknown>;

    // Execute update on canonical institutional tables based on submission type
    if (sub.submission_type === "profile_update") {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (typeof payload.title === "string" && payload.title.trim()) {
        updateData.title = payload.title.trim();
      }
      if (typeof payload.bio === "string" && payload.bio.trim()) {
        updateData.bio = payload.bio.trim();
      }

      const { error: rErr } = await client
        .from("researchers")
        .update(updateData)
        .eq("id", sub.researcher_id);

      if (rErr) throw new Error(rErr.message);
    } else if (sub.submission_type === "new_project" || sub.submission_type === "project_update") {
      const pTitle = (payload.project_title as string) || "Untitled Project";
      const pSlug = ((payload.slug as string) || `project-${Date.now()}`).toLowerCase();
      const pDesc = (payload.description as string) || "";
      const pStatus = (payload.status as string) || "planned";

      const { data: newProj, error: pErr } = await client
        .from("projects")
        .insert({
          title: pTitle,
          slug: pSlug,
          description: pDesc,
          status: pStatus,
          start_date: (payload.start_date as string) || null,
          end_date: (payload.end_date as string) || null,
          is_demo: false,
        })
        .select("id")
        .single();

      if (pErr) throw new Error(pErr.message);

      if (newProj?.id) {
        await client.from("project_researchers").insert({
          project_id: newProj.id,
          researcher_id: sub.researcher_id,
        });
      }
    } else if (sub.submission_type === "new_publication") {
      const pubTitle = (payload.pub_title as string) || "Untitled Publication";
      const pubSlug = ((payload.slug as string) || `pub-${Date.now()}`).toLowerCase();
      const pubVenue = (payload.venue as string) || "Institutional Repository";
      const pubAbstract = (payload.abstract as string) || "";

      const { data: newPub, error: pubErr } = await client
        .from("publications")
        .insert({
          title: pubTitle,
          slug: pubSlug,
          venue: pubVenue,
          abstract: pubAbstract,
          status: (payload.status as string) || "published",
          doi: (payload.doi as string) || null,
          published_at: (payload.published_at as string) || new Date().toISOString().split("T")[0],
          is_demo: false,
        })
        .select("id")
        .single();

      if (pubErr) throw new Error(pubErr.message);

      if (newPub?.id) {
        await client.from("publication_researchers").insert({
          publication_id: newPub.id,
          researcher_id: sub.researcher_id,
        });
      }
    }

    // Mark submission approved
    await updateSubmissionStatus({
      id: submissionId,
      status: "approved",
      admin_notes: adminNotes,
      reviewer_id: session.user.id,
    });

    revalidatePath("/discover");
    revalidatePath("/researchers");
    revalidatePath("/admin");
    revalidatePath("/researcher/submissions");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to approve submission";
    redirect(`/admin?tab=submissions&error=${encodeURIComponent(msg)}`);
  }

  redirect("/admin?tab=submissions&success=Submission+approved+and+canonical+data+updated+successfully.");
}

export async function rejectSubmissionAction(formData: FormData) {
  const session = await requireAdmin();
  const submissionId = formData.get("id")?.toString().trim();
  const adminNotes = formData.get("admin_notes")?.toString().trim() || "Rejected by Administrator.";

  if (!submissionId) {
    redirect("/admin?tab=submissions&error=Invalid+submission+ID");
  }

  try {
    await updateSubmissionStatus({
      id: submissionId,
      status: "rejected",
      admin_notes: adminNotes,
      reviewer_id: session.user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/researcher/submissions");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reject submission";
    redirect(`/admin?tab=submissions&error=${encodeURIComponent(msg)}`);
  }

  redirect("/admin?tab=submissions&success=Submission+has+been+rejected.");
}


export async function provisionResearcherAccountAction(formData: FormData) {
  await requireAdmin();

  const username = formData.get("username")?.toString().trim().toLowerCase();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString().trim();
  const researcher_id = formData.get("researcher_id")?.toString().trim() || null;

  if (!username || !email || !password) {
    redirect("/admin?tab=accounts&error=Username%2C+Email+and+Password+are+all+required.");
  }

  const client = createSupabaseAdminClient();

  try {
    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role: "researcher",
        researcher_id,
      },
      app_metadata: {
        role: "researcher",
        username,
        researcher_id,
      },
    });

    if (authError || !authData?.user) {
      throw new Error(authError?.message || "Failed to create Supabase Auth user.");
    }

    // 2. Link in public.user_profiles if table is available
    try {
      await client.from("user_profiles").upsert(
        {
          user_id: authData.user.id,
          username,
          role: "researcher",
          researcher_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch {
      // Schema may still be syncing
    }

    revalidatePath("/admin");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to provision account";
    redirect(`/admin?tab=accounts&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=accounts&success=${encodeURIComponent(`Account "${username}" successfully provisioned and linked.`)}`);
}

// ----------------------------------------------------------------------------
// EVENTS CRUD ACTIONS
// ----------------------------------------------------------------------------
export async function saveEventAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const title = formData.get("title")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const type = formData.get("type")?.toString().trim() || "conference";
  const description = formData.get("description")?.toString().trim() || "";
  const start_date = formData.get("start_date")?.toString().trim() || null;
  const end_date = formData.get("end_date")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;
  const registration_url = formData.get("registration_url")?.toString().trim() || null;
  const external_url = formData.get("external_url")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "upcoming";
  const research_area_id = formData.get("research_area_id")?.toString().trim() || null;
  const researcher_id = formData.get("researcher_id")?.toString().trim() || null;
  const project_id = formData.get("project_id")?.toString().trim() || null;
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";

  if (!title || !slug || !description) {
    redirect(`/admin?tab=events&error=${encodeURIComponent("Title, slug, and description are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    const payload = {
      title,
      slug,
      type,
      description,
      start_date,
      starts_at: start_date,
      end_date,
      ends_at: end_date,
      location,
      registration_url,
      external_url,
      status,
      research_area_id,
      researcher_id,
      project_id,
      is_demo,
      updated_at: new Date().toISOString(),
    };

    const result = id
      ? await client.from("events").update(payload).eq("id", id)
      : await client.from("events").insert(payload);

    if (result.error) {
      const missingColumn = /column .*schema cache|column .* does not exist/i.test(result.error.message);
      if (!missingColumn) throw new Error(result.error.message);

      const basePayload = {
        title,
        slug,
        description,
        starts_at: start_date,
        ends_at: end_date,
        location,
        status,
        is_demo,
        updated_at: new Date().toISOString(),
      };

      const fallbackResult = id
        ? await client.from("events").update(basePayload).eq("id", id)
        : await client.from("events").insert(basePayload);

      if (fallbackResult.error) throw new Error(fallbackResult.error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/events");
    revalidatePath("/discover");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save event";
    redirect(`/admin?tab=events&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=events&success=${encodeURIComponent(`Event "${title}" saved successfully.`)}`);
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  if (!id) redirect("/admin?tab=events");

  const client = createSupabaseAdminClient();
  try {
    await client.from("events").delete().eq("id", id);
    revalidatePath("/admin");
    revalidatePath("/events");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete event";
    redirect(`/admin?tab=events&error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin?tab=events&success=Event+deleted+successfully.");
}

// ----------------------------------------------------------------------------
// OPPORTUNITIES CRUD ACTIONS
// ----------------------------------------------------------------------------
export async function saveOpportunityAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const title = formData.get("title")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const type = formData.get("type")?.toString().trim() || "grant";
  const description = formData.get("description")?.toString().trim() || "";
  const provider = formData.get("provider")?.toString().trim() || null;
  const eligibility = formData.get("eligibility")?.toString().trim() || null;
  const amount = formData.get("amount")?.toString().trim() || null;
  const deadline = formData.get("deadline")?.toString().trim() || null;
  const application_url = formData.get("application_url")?.toString().trim() || null;
  const requirements = formData.get("requirements")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "open";
  const research_area_id = formData.get("research_area_id")?.toString().trim() || null;
  const project_id = formData.get("project_id")?.toString().trim() || null;
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";

  if (!title || !slug || !description) {
    redirect(`/admin?tab=opportunities&error=${encodeURIComponent("Title, slug, and description are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    const payload = {
      title,
      slug,
      type,
      description,
      provider,
      eligibility,
      amount,
      deadline,
      closing_date: deadline,
      application_url,
      url: application_url,
      requirements,
      status,
      research_area_id,
      project_id,
      is_demo,
      updated_at: new Date().toISOString(),
    };

    const result = id
      ? await client.from("opportunities").update(payload).eq("id", id)
      : await client.from("opportunities").insert(payload);

    if (result.error) {
      const missingColumn = /column .*schema cache|column .* does not exist/i.test(result.error.message);
      if (!missingColumn) throw new Error(result.error.message);

      const basePayload = {
        title,
        slug,
        description,
        status,
        closing_date: deadline,
        url: application_url,
        is_demo,
        updated_at: new Date().toISOString(),
      };

      const fallbackResult = id
        ? await client.from("opportunities").update(basePayload).eq("id", id)
        : await client.from("opportunities").insert(basePayload);

      if (fallbackResult.error) throw new Error(fallbackResult.error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/opportunities");
    revalidatePath("/discover");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save opportunity";
    redirect(`/admin?tab=opportunities&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=opportunities&success=${encodeURIComponent(`Opportunity "${title}" saved successfully.`)}`);
}

export async function deleteOpportunityAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  if (!id) redirect("/admin?tab=opportunities");

  const client = createSupabaseAdminClient();
  try {
    await client.from("opportunities").delete().eq("id", id);
    revalidatePath("/admin");
    revalidatePath("/opportunities");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete opportunity";
    redirect(`/admin?tab=opportunities&error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin?tab=opportunities&success=Opportunity+deleted+successfully.");
}

// ----------------------------------------------------------------------------
// RESOURCES CRUD ACTIONS
// ----------------------------------------------------------------------------
export async function saveResourceAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const title = formData.get("title")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const category = formData.get("category")?.toString().trim() || "ethics";
  const description = formData.get("description")?.toString().trim() || "";
  const content = formData.get("content")?.toString().trim() || null;
  const external_url = formData.get("external_url")?.toString().trim() || null;
  const research_area_id = formData.get("research_area_id")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "published";
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";

  if (!title || !slug || !description) {
    redirect(`/admin?tab=resources&error=${encodeURIComponent("Title, slug, and description are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    const payload = {
      title,
      slug,
      category,
      description,
      content,
      external_url,
      research_area_id,
      status,
      is_demo,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await client.from("resources").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await client.from("resources").insert(payload);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/resources");
    revalidatePath("/discover");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save resource";
    redirect(`/admin?tab=resources&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=resources&success=${encodeURIComponent(`Resource "${title}" saved successfully.`)}`);
}

export async function deleteResourceAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  if (!id) redirect("/admin?tab=resources");

  const client = createSupabaseAdminClient();
  try {
    await client.from("resources").delete().eq("id", id);
    revalidatePath("/admin");
    revalidatePath("/resources");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete resource";
    redirect(`/admin?tab=resources&error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin?tab=resources&success=Resource+deleted+successfully.");
}

// ----------------------------------------------------------------------------
// PARTNERS CRUD ACTIONS
// ----------------------------------------------------------------------------
export async function savePartnerAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const name = formData.get("name")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const type = formData.get("type")?.toString().trim() || "academic";
  const description = formData.get("description")?.toString().trim() || "";
  const website_url = formData.get("website_url")?.toString().trim() || null;
  const project_id = formData.get("project_id")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "active";
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";

  if (!name || !slug || !description) {
    redirect(`/admin?tab=partners&error=${encodeURIComponent("Name, slug, and description are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    const payload = {
      name,
      slug,
      type,
      description,
      website_url,
      project_id,
      status,
      is_demo,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await client.from("partners").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await client.from("partners").insert(payload);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/partners");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save partner";
    redirect(`/admin?tab=partners&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=partners&success=${encodeURIComponent(`Partner "${name}" saved successfully.`)}`);
}

export async function deletePartnerAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  if (!id) redirect("/admin?tab=partners");

  const client = createSupabaseAdminClient();
  try {
    await client.from("partners").delete().eq("id", id);
    revalidatePath("/admin");
    revalidatePath("/partners");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete partner";
    redirect(`/admin?tab=partners&error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin?tab=partners&success=Partner+deleted+successfully.");
}

// ----------------------------------------------------------------------------
// ANNOUNCEMENTS CRUD ACTIONS
// ----------------------------------------------------------------------------
export async function saveAnnouncementAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const title = formData.get("title")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const summary = formData.get("summary")?.toString().trim() || "";
  const content = formData.get("content")?.toString().trim() || "";
  const external_url = formData.get("external_url")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "published";
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";

  if (!title || !slug || !summary || !content) {
    redirect(`/admin?tab=announcements&error=${encodeURIComponent("Title, slug, summary, and content are required.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    const payload = {
      title,
      slug,
      summary,
      content,
      external_url,
      status,
      is_demo,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await client.from("announcements").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await client.from("announcements").insert(payload);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/announcements");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save announcement";
    redirect(`/admin?tab=announcements&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=announcements&success=${encodeURIComponent(`Announcement "${title}" saved successfully.`)}`);
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  if (!id) redirect("/admin?tab=announcements");

  const client = createSupabaseAdminClient();
  try {
    await client.from("announcements").delete().eq("id", id);
    revalidatePath("/admin");
    revalidatePath("/announcements");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete announcement";
    redirect(`/admin?tab=announcements&error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin?tab=announcements&success=Announcement+deleted+successfully.");
}

// ----------------------------------------------------------------------------
// RESEARCH GROUPS CRUD ACTIONS (Reusing existing research_groups table)
// ----------------------------------------------------------------------------
export async function saveResearchGroupAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString().trim() || null;
  const name = formData.get("name")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const is_demo = formData.get("is_demo") === "on" || formData.get("is_demo") === "true";
  const researcher_ids = formData.getAll("researcher_ids").map((v) => v.toString());

  if (!name || !slug || !description) {
    redirect(`/admin?tab=groups&error=${encodeURIComponent("Name, slug, and description are required.")}`);
  }

  const client = createSupabaseAdminClient();

  const { data: matchingGroup, error: slugCheckError } = await client
    .from("research_groups")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugCheckError) {
    redirect(`/admin?tab=groups&error=${encodeURIComponent(slugCheckError.message)}`);
  }
  if (matchingGroup && matchingGroup.id !== id) {
    redirect(
      `/admin?tab=groups&error=${encodeURIComponent(`The slug "${slug}" is already used by another research group.`)}`
    );
  }

  try {
    let groupId = id;
    const payload = {
      name,
      slug,
      description,
      is_demo,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await client.from("research_groups").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: insData, error } = await client.from("research_groups").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      groupId = insData.id;
    }

    // Sync researcher affiliations in researcher_research_groups
    if (groupId) {
      await client.from("researcher_research_groups").delete().eq("research_group_id", groupId);
      if (researcher_ids.length > 0) {
        const rows = researcher_ids.map((rId) => ({
          researcher_id: rId,
          research_group_id: groupId,
        }));
        await client.from("researcher_research_groups").insert(rows);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/researchers");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save research group";
    redirect(`/admin?tab=groups&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=groups&success=${encodeURIComponent(`Research Group "${name}" saved successfully.`)}`);
}

export async function deleteResearchGroupAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString().trim();
  if (!id) redirect("/admin?tab=groups");

  const client = createSupabaseAdminClient();
  try {
    await client.from("research_groups").delete().eq("id", id);
    revalidatePath("/admin");
    revalidatePath("/researchers");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete research group";
    redirect(`/admin?tab=groups&error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin?tab=groups&success=Research+group+deleted+successfully.");
}

export async function bulkEntityAction(formData: FormData) {
  await requireAdmin();
  const entityType = String(formData.get("entity_type") || "").trim();
  const bulkAction = String(formData.get("bulk_action") || "").trim();
  const selectedIds = formData.getAll("selected_ids").map(String).filter(Boolean);

  if (!entityType || selectedIds.length === 0) {
    redirect(`/admin?tab=${entityType || "events"}&error=${encodeURIComponent("Please select at least one item to perform bulk action.")}`);
  }

  if (!bulkAction) {
    redirect(`/admin?tab=${entityType}&error=${encodeURIComponent("Please select an action to apply to selected items.")}`);
  }

  const client = createSupabaseAdminClient();

  try {
    if (bulkAction === "delete") {
      const { error } = await client.from(entityType).delete().in("id", selectedIds);
      if (error) throw error;
      await logAdminActivity(
        "bulk_delete",
        entityType,
        `Bulk deleted ${selectedIds.length} records from ${entityType}.`
      );
    } else if (bulkAction.startsWith("status_")) {
      const targetStatus = bulkAction.replace("status_", "");
      const { error } = await client.from(entityType).update({ status: targetStatus }).in("id", selectedIds);
      if (error) throw error;
      await logAdminActivity(
        "bulk_status_update",
        entityType,
        `Bulk updated ${selectedIds.length} records in ${entityType} to status '${targetStatus}'.`
      );
    }

    revalidatePath("/admin");
    revalidatePath(`/${entityType}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bulk action failed";
    redirect(`/admin?tab=${entityType}&error=${encodeURIComponent(msg)}`);
  }

  redirect(`/admin?tab=${entityType}&success=${encodeURIComponent(`Successfully processed bulk action on ${selectedIds.length} items.`)}`);
}
