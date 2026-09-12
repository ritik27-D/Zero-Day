"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function saveResearcherAction(formData: FormData) {
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
