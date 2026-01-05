
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
    console.log("🔍 Checking Admin Status...");

    // 1. Get the user by email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    const adminUser = users?.find(u => u.email === 'admin@admin.com');

    if (!adminUser) {
        console.error("❌ User admin@admin.com not found!");
        return;
    }

    console.log(`👤 User Found: ${adminUser.id}`);

    // 2. Check user_roles table
    const { data: role, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", adminUser.id);

    if (roleError) {
        console.error("❌ Error fetching role:", roleError);
    } else {
        console.log("--------------- ROLE DATA ---------------");
        console.log(role);
        console.log("-----------------------------------------");
    }
}

main();
