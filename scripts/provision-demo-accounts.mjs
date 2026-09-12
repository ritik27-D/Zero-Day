import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.");
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function getOrGeneratePassword(envVarName) {
  if (process.env[envVarName] && process.env[envVarName].trim().length >= 8) {
    return process.env[envVarName].trim();
  }
  // Generate a cryptographically secure temporary password
  return "DemoPass!" + crypto.randomBytes(6).toString("hex");
}

async function ensureUser({ username, email, role, researcherSlug, envPasswordKey }) {
  console.log(`\n--- Provisioning ${role.toUpperCase()}: ${username} (${email}) ---`);
  const password = getOrGeneratePassword(envPasswordKey);

  // 1. Resolve researcher profile id if researcher role
  let researcherId = null;
  if (researcherSlug) {
    const { data: rData, error: rErr } = await client
      .from("researchers")
      .select("id, name")
      .eq("slug", researcherSlug)
      .maybeSingle();

    if (rErr || !rData) {
      console.warn(`Warning: Could not find researcher profile with slug: ${researcherSlug}`);
    } else {
      researcherId = rData.id;
      console.log(`Linked to researcher: ${rData.name} (${researcherId})`);
    }
  }

  // 2. Check if auth user already exists in Supabase Auth
  const { data: usersData } = await client.auth.admin.listUsers();
  const existingUser = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId;
  if (existingUser) {
    console.log(`Auth user already exists (ID: ${existingUser.id}). Updating credentials & metadata...`);
    userId = existingUser.id;
    const { error: updateErr } = await client.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
        researcher_id: researcherId,
      },
      app_metadata: {
        role,
        username,
        researcher_id: researcherId,
      },
    });
    if (updateErr) throw updateErr;
  } else {
    console.log(`Creating new Supabase Auth user...`);
    const { data: newUserData, error: createErr } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
        researcher_id: researcherId,
      },
      app_metadata: {
        role,
        username,
        researcher_id: researcherId,
      },
    });
    if (createErr) throw createErr;
    userId = newUserData.user.id;
  }

  // 3. Sync to public.user_profiles if the table exists
  try {
    const { error: profileErr } = await client.from("user_profiles").upsert(
      {
        user_id: userId,
        username,
        role,
        researcher_id: researcherId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (!profileErr) {
      console.log(`Synced to public.user_profiles table.`);
    }
  } catch {
    // Table may still be syncing in schema cache
  }

  console.log(`✓ Provisioned: username=${username}, role=${role}, email=${email}`);
  return { username, email, role, password };
}

async function runProvisioning() {
  console.log("====================================================");
  console.log("PROVISIONING ISLINGTON R&D CONNECT DEMO ACCOUNTS");
  console.log("====================================================");

  const accounts = [
    {
      username: "admin",
      email: "admin@islington.edu.np",
      role: "admin",
      researcherSlug: null,
      envPasswordKey: "DEMO_ADMIN_PASSWORD",
    },
    {
      username: "dr-aisha-rahman",
      email: "aisha.rahman@demo.islington.edu.np",
      role: "researcher",
      researcherSlug: "dr-aisha-rahman",
      envPasswordKey: "DEMO_RESEARCHER_A_PASSWORD",
    },
    {
      username: "niran-shrestha",
      email: "niran.shrestha@demo.islington.edu.np",
      role: "researcher",
      researcherSlug: "niran-shrestha",
      envPasswordKey: "DEMO_RESEARCHER_B_PASSWORD",
    },
  ];

  const results = [];
  for (const acc of accounts) {
    const res = await ensureUser(acc);
    results.push(res);
  }

  console.log("\n====================================================");
  console.log("PROVISIONING COMPLETE: 3 ACCOUNTS PROVISIONED");
  console.log("====================================================");
}

runProvisioning().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
