"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseAdminClient } from "./supabase/server";
import { UserRole } from "./auth";

const ACCESS_COOKIE_NAME = "sb-access-token";
const REFRESH_COOKIE_NAME = "sb-refresh-token";

export async function signInAction(formData: FormData): Promise<{ error?: string; redirectTo?: string }> {
  const usernameOrEmail = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const requiredRole = formData.get("role")?.toString().trim();

  if (!usernameOrEmail || !password) {
    return { error: "Please enter both username and password." };
  }

  const admin = createSupabaseAdminClient();
  let email = usernameOrEmail;

  // If user entered username instead of email, resolve email address
  if (!usernameOrEmail.includes("@")) {
    let foundEmail: string | null = null;
    try {
      const { data: profile } = await admin
        .from("user_profiles")
        .select("user_id")
        .eq("username", usernameOrEmail.toLowerCase())
        .maybeSingle();

      if (profile?.user_id) {
        const { data: authUser } = await admin.auth.admin.getUserById(profile.user_id);
        foundEmail = authUser?.user?.email ?? null;
      }
    } catch {
      // fallback
    }

    if (!foundEmail) {
      const { data: usersData } = await admin.auth.admin.listUsers();
      const matched = usersData?.users?.find(
        (u) =>
          u.user_metadata?.username?.toLowerCase() === usernameOrEmail.toLowerCase() ||
          u.email?.split("@")[0].toLowerCase() === usernameOrEmail.toLowerCase()
      );
      if (matched?.email) {
        foundEmail = matched.email;
      }
    }

    if (foundEmail) {
      email = foundEmail;
    } else {
      email = `${usernameOrEmail.toLowerCase()}@demo.islington.edu.np`;
    }
  }

  const client = createSupabaseServerClient();
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData?.session) {
    return { error: "Invalid username or password." };
  }

  const { access_token, refresh_token } = authData.session;
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE_NAME, access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Verify role permission if accessing specific portal
  const user = authData.user;
  let role = (user.app_metadata?.role || user.user_metadata?.role || "researcher") as UserRole;

  try {
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.role) {
      role = profile.role as UserRole;
    }
  } catch {
    // fallback to metadata
  }

  if (requiredRole === "admin" && role !== "admin") {
    cookieStore.delete(ACCESS_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    return { error: "Access denied. This account does not possess administrator privileges." };
  }

  if (requiredRole === "researcher" && role !== "researcher") {
    cookieStore.delete(ACCESS_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    return { error: "Access denied. Administrators must access the system via the Admin Portal." };
  }

  const destination = role === "admin" ? "/admin" : "/researcher";
  return { redirectTo: destination };
}

export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  redirect("/");
}
