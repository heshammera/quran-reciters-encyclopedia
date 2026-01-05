
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Preferences = {
    lean_mode?: boolean;
    dark_mode?: boolean;
    audio_volume?: number;
    hide_donation_prompts?: boolean;
};

export async function getUserPreferences() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error("Error fetching preferences:", error);
    }

    return data;
}

export async function updatePreferences(prefs: Preferences) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.id,
            ...prefs,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error("Error updating preferences:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}

export async function createDonationPledge(amount: number, notes?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("donations")
        .insert({
            user_id: user.id,
            amount,
            notes,
            status: 'pending'
        });

    if (error) {
        console.error("Error creating donation pledge:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
