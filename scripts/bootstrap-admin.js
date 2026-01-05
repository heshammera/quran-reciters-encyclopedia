
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try both common names for the service role key
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing Environment Variables!");
    console.error("Please ensure you have .env.local file with:");
    console.error(" - NEXT_PUBLIC_SUPABASE_URL");
    console.error(" - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)");
    console.error("\nCurrent status:");
    console.error(" - URL: " + (supabaseUrl ? "✅ Found" : "❌ Missing"));
    console.error(" - Service Key: " + (serviceKey ? "✅ Found" : "❌ Missing"));
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
        console.log("No users found in Authentication. Please sign up cleanly first at /admin/login or /");
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
            console.log(`- Current role: ${currentRole.role}. Updating to admin...`);
        } else {
            console.log(`- No role found. Assigning 'admin'...`);
        }

        const { error: upsertError } = await supabase
            .from("user_roles")
            .upsert({
                user_id: user.id,
                role: "admin"
            }, { onConflict: 'user_id' });

        if (upsertError) {
            console.error(`❌ Failed to update role: ${upsertError.message}`);
        } else {
            console.log(`✅ Successfully set ${user.email} as ADMIN`);
        }
    }

    console.log("\nDone! accessing /admin should now work.");
}

main();
