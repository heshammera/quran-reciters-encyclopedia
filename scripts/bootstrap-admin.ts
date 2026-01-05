
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function main() {
    console.log("🔄 Fetching users...");

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error fetching users:", error.message);
        return;
    }

    if (!users || users.length === 0) {
        console.log("No users found in Authentication.");
        return;
    }

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`Processing user: ${user.email} (${user.id})`);

        // Check if role exists
        const { data: currentRole } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (currentRole) {
            console.log(`- Current role: ${currentRole.role}. updating to admin...`);
        } else {
            console.log(`- No role found. assigning 'admin'...`);
        }

        const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({
                user_id: user.id,
                role: "admin"
            });

        if (upsertError) {
            console.error(`❌ Failed to update role: ${upsertError.message}`);
        } else {
            console.log(`✅ Successfully set ${user.email} as ADMIN`);
        }
    }

    console.log("\nDone! You should now be able to access /admin");
}

main();
