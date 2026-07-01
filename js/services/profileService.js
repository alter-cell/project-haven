import { supabase } from "./supabaseClient.js";

/* Create profile */
export async function createProfile(profile) {
  return await supabase
    .from("profiles")
    .insert(profile);
}

/* Get my profile */
export async function getMyProfile(userId) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

/* Search by Petal ID */
export async function searchPetalId(petalId) {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("petal_id", petalId)
    .maybeSingle();
}

/* Update profile */
export async function updateProfile(userId, updates) {
  return await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
}