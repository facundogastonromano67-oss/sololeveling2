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
    const [profile, plans, missions, notes, workouts, mealLogs] = await Promise.all([
      supabase.from("profiles").select("id,display_name,avatar_url,xp,level,streak,mode,is_premium").single(),
      supabase.from("plans").select("*").eq("active", true).maybeSingle(),
      supabase.from("user_missions").select("*,mission_completions(completed_on,value)").eq("active", true).order("sort_order"),
      supabase.from("notebook_entries").select("*").order("updated_at", { ascending: false }).limit(20),
      supabase.from("workout_sessions").select("*,workout_sets(*)").order("started_at", { ascending: false }).limit(10),
      supabase.from("meal_logs").select("*").order("logged_at", { ascending: false }).limit(30)
    ]);
    for (const result of [profile, plans, missions, notes, workouts, mealLogs]) if (result.error) throw result.error;
    return { profile: profile.data, plan: plans.data, missions: missions.data, notes: notes.data, workoutSessions: workouts.data, mealLogs: mealLogs.data };
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
    if (note.id) record.id = note.id;
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
      const rows = payload.sets.map(set => ({ workout_session_id: data.id, user_id: session.user.id, ...set }));
      const { error: setError } = await supabase.from("workout_sets").insert(rows);
      if (setError) throw setError;
    }
    return data;
  },

  async closeDay(reflection) {
    const { data, error } = await supabase.rpc("close_day", { p_reflection: reflection || "" });
    if (error) throw error;
    return data;
  }
};
