import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
  createSupabaseUserClient,
} from "./supabase/server";

export type UserRole = "researcher" | "admin";

export type LinkedResearcher = {
  id: string;
  slug: string;
  name: string;
  title: string;
  email: string;
};

export type AuthUserProfile = {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  researcherId: string | null;
  researcher: LinkedResearcher | null;
};

export type AuthSession = {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  profile: AuthUserProfile;
};

const ACCESS_COOKIE_NAME = "sb-access-token";

function toItem<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!accessToken) return null;

  try {
    const client = createSupabaseServerClient();
    const { data: userData, error: userError } = await client.auth.getUser(accessToken);

    if (userError || !userData?.user) {
      return null;
    }

    const user = userData.user;
    const admin = createSupabaseAdminClient();

    // 1. Attempt lookup from public.user_profiles table
    let profile: AuthUserProfile | null = null;
    try {
      const { data: dbProfile } = await admin
        .from("user_profiles")
        .select(`
          id,
          user_id,
          username,
          role,
          researcher_id,
          researchers (id, slug, name, title, email)
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (dbProfile) {
        profile = {
          id: dbProfile.id,
          userId: dbProfile.user_id,
          username: dbProfile.username,
          role: dbProfile.role as UserRole,
          researcherId: dbProfile.researcher_id,
          researcher: toItem(dbProfile.researchers as unknown as LinkedResearcher),
        };
      }
    } catch {
      // Table may still be syncing in schema cache
    }

    // 2. Fallback to Supabase Auth user metadata
    if (!profile) {
      const role = (user.app_metadata?.role || user.user_metadata?.role || "researcher") as UserRole;
      const username = (user.user_metadata?.username || user.email?.split("@")[0] || "user") as string;
      const researcherId = (user.user_metadata?.researcher_id || null) as string | null;

      let linkedResearcher: LinkedResearcher | null = null;
      if (researcherId) {
        const { data: rData } = await admin
          .from("researchers")
          .select("id, slug, name, title, email")
          .eq("id", researcherId)
          .maybeSingle();
        linkedResearcher = rData ?? null;
      }

      profile = {
        id: user.id,
        userId: user.id,
        username,
        role,
        researcherId,
        researcher: linkedResearcher,
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? "",
      },
      accessToken,
      profile,
    };
  } catch {
    return null;
  }
}

export async function requireResearcher(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  // Admins must use the Admin portal, not researcher workspace
  if (session.profile.role === "admin") {
    redirect("/admin");
  }
  if (session.profile.role !== "researcher") {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.profile.role !== "admin") {
    // Authenticated non-admin is denied access to admin
    redirect("/admin/login?error=denied");
  }
  return session;
}

export { createSupabaseUserClient };
