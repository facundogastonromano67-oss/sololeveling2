import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(url && key && !url.includes("TU-PROYECTO") && !key.includes("TU_CLAVE"));

export const supabase = configured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export const backend = {
  configured,

  async session() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async signUp(email, password, displayName) {
    if (!supabase) throw new Error("Supabase todavía no está configurado.");
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    if (!supabase) throw new Error("Supabase todavía no está configurado.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthChange(callback) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },

  async loadDashboard() {
    if (!supabase) return null;
    const refresh = await supabase.rpc("refresh_daily_system_missions");
    if (refresh.error) throw refresh.error;
    const [profile, plans, missions, notes, workouts, mealLogs, skills, purchases, arena, dungeons, reviews, penalties, unlocked] = await Promise.all([
      supabase.from("profiles").select("id,display_name,avatar_url,avatar_frame,xp,level,rank,streak,best_streak,coins,mode,is_premium").single(),
      supabase.from("plans").select("*").eq("active", true).maybeSingle(),
      supabase.from("user_missions").select("*,mission_completions(completed_on,value)").eq("active", true).order("sort_order"),
      supabase.from("notebook_entries").select("*").order("updated_at", { ascending: false }).limit(20),
      supabase.from("workout_sessions").select("*,workout_sets(*)").order("started_at", { ascending: false }).limit(10),
      supabase.from("meal_logs").select("*").order("logged_at", { ascending: false }).limit(30),
      supabase.from("user_skills").select("skill_key,xp,level"),
      supabase.from("store_purchases").select("item_key,purchased_at"),
      supabase.from("arena_scores").select("score,result,played_at").order("played_at", { ascending: false }).limit(50),
      supabase.from("dungeon_runs").select("run_date,completion_percent,coins_awarded").order("run_date", { ascending: false }).limit(30),
      supabase.from("daily_reviews").select("review_date,completed_count,total_count,reflection").order("review_date", { ascending: false }).limit(60),
      supabase.from("penalties").select("*").order("source_date", { ascending: false }).limit(30),
      supabase.from("achievement_unlocks").select("achievement_key")
    ]);
    for (const result of [profile, plans, missions, notes, workouts, mealLogs, skills, purchases, arena, dungeons, reviews, penalties, unlocked]) if (result.error) throw result.error;
    return { profile: profile.data, plan: plans.data, missions: missions.data, notes: notes.data, workoutSessions: workouts.data, mealLogs: mealLogs.data, skills: skills.data, purchases: purchases.data, arenaScores: arena.data, dungeonRuns: dungeons.data, dailyReviews: reviews.data, penalties: penalties.data, achievements: unlocked.data };
  },

  async completeMission(missionId, value = null) {
    const { data, error } = await supabase.rpc("complete_mission", { p_mission_id: missionId, p_value: value });
    if (error) throw error;
    return data;
  },

  async createMission(payload) {
    const { data, error } = await supabase.rpc("create_user_mission", {
      p_title: payload.title,
      p_description: payload.description || "",
      p_category: payload.category || "disciplina",
      p_target_value: Number(payload.target || 1),
      p_unit: payload.unit || "vez",
      p_weekdays: payload.weekdays || [1, 2, 3, 4, 5, 6, 7]
    });
    if (error) throw error;
    return data;
  },

  async generatePlan(evaluation) {
    const { data, error } = await supabase.functions.invoke("generate-plan", { body: evaluation });
    if (error) throw error;
    return data;
  },

  async saveNote(note) {
    const session = await this.session();
    const record = { user_id: session.user.id, title: note.title || "Sin título", body: note.body || "" };
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(note.id || "")) record.id = note.id;
    const { data, error } = await supabase.from("notebook_entries").upsert(record).select().single();
    if (error) throw error;
    return data;
  },

  async logMeal(mealId, mealName) {
    const session = await this.session();
    const { error } = await supabase.from("meal_logs").insert({ user_id: session.user.id, recipe_slug: mealId, meal_name: mealName });
    if (error) throw error;
  },

  async logWorkout(payload) {
    const session = await this.session();
    const { data, error } = await supabase.from("workout_sessions").insert({
      user_id: session.user.id, title: payload.title, duration_minutes: payload.durationMinutes,
      notes: payload.notes || "", finished_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    if (payload.sets?.length) {
      const rows = payload.sets.filter(set => set.done !== false).map(set => ({
        workout_session_id: data.id,
        user_id: session.user.id,
        exercise_slug: set.exerciseId || set.exercise_slug,
        set_number: set.setNumber || set.set_number || 1,
        reps: Number(set.reps) || null,
        weight_kg: Number(set.weight ?? set.weight_kg) || 0,
        rir: set.rpe ? Math.max(0, Math.min(10, 10 - Number(set.rpe))) : null,
        notes: set.notes || ""
      }));
      const { error: setError } = await supabase.from("workout_sets").insert(rows);
      if (setError) throw setError;
    }
    return data;
  },

  async closeDay(reflection) {
    const { data, error } = await supabase.rpc("close_day", { p_reflection: reflection || "" });
    if (error) throw error;
    return data;
  },

  async completeLesson(lessonId, notes = "") {
    const session = await this.session();
    const { data, error } = await supabase.from("lesson_progress").upsert({
      user_id: session.user.id, lesson_id: lessonId, completed_at: new Date().toISOString(), notes
    }).select().single();
    if (error) throw error;
    return data;
  },

  async purchaseStoreItem(itemKey, priceCoins, requiredLevel) {
    const { data, error } = await supabase.rpc("purchase_store_item", {
      p_item_key: itemKey, p_price_coins: priceCoins, p_required_level: requiredLevel
    });
    if (error) throw error;
    return data;
  },

  async completeDungeon() {
    const { data, error } = await supabase.rpc("complete_daily_dungeon");
    if (error) throw error;
    return data;
  },

  async playArena(power) {
    const { data, error } = await supabase.rpc("play_arena_duel", { p_power: Number(power) });
    if (error) throw error;
    return { user: data.user, system: data.system, result: data.result === "victory" ? "GANASTE" : data.result === "draw" ? "EMPATE" : "GANÓ EL SISTEMA", won: data.result === "victory" };
  }
};
