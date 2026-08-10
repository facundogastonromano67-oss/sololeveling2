import { createClient } from "npm:@supabase/supabase-js@2.112.2";
import { corsHeaders } from "../_shared/cors.ts";

type Evaluation = {
  workActivity?: string;
  goal?: string;
  trainingDays?: number;
  place?: string;
  restrictions?: string;
  dislikes?: string;
  limitations?: string;
  mealCount?: number;
  mode?: "flexible" | "intensive";
  missionTitles?: string[];
};

const week = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const routines = [
  { title: "Fuerza A", exercises: [
    { exerciseId: "sentadilla", sets: 3, reps: "8–12" },
    { exerciseId: "flexiones", sets: 3, reps: "6–12" },
    { exerciseId: "remo-banda", sets: 3, reps: "10–15" },
    { exerciseId: "plancha", sets: 3, reps: "25–40 s" }
  ]},
  { title: "Fuerza B", exercises: [
    { exerciseId: "zancadas", sets: 3, reps: "8–12/lado" },
    { exerciseId: "press-hombros", sets: 3, reps: "8–12" },
    { exerciseId: "remo-mancuerna", sets: 3, reps: "8–12/lado" },
    { exerciseId: "dead-bug", sets: 3, reps: "8–12/lado" }
  ]},
  { title: "Fuerza C", exercises: [
    { exerciseId: "peso-muerto-rumano", sets: 3, reps: "8–12" },
    { exerciseId: "press-mancuernas", sets: 3, reps: "8–12" },
    { exerciseId: "puente-gluteos", sets: 3, reps: "12–15" },
    { exerciseId: "bird-dog", sets: 3, reps: "8–12/lado" }
  ]}
];

const mealWeek = [
  ["avena-banana", "pollo-arroz", "tostadas-queso", "omelette"],
  ["huevos-tostadas", "carne-papas", "licuado", "pollo-pure"],
  ["yogur-fruta", "lentejas", "sandwich-pollo", "merluza-papas"],
  ["avena-banana", "atun-arroz", "tostadas-queso", "tortilla"],
  ["huevos-tostadas", "pasta-bolonesa", "licuado", "hamburguesa-casera"],
  ["yogur-fruta", "pollo-arroz", "sandwich-pollo", "omelette"],
  ["avena-banana", "lentejas", "tostadas-queso", "pollo-pure"]
];

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");
    if (!url || !anonKey || !serviceKey || !authorization) throw new Error("Server authentication is not configured");

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return Response.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders });

    const body = await request.json() as Evaluation;
    const trainingDays = Math.max(2, Math.min(5, Number(body.trainingDays || 3)));
    const missionTitles = Array.isArray(body.missionTitles) ? [...new Set(body.missionTitles)].slice(0, 15) : [];
    if (missionTitles.length < 4) return Response.json({ error: "Elegí al menos cuatro misiones" }, { status: 422, headers: corsHeaders });

    const days = Array.from({ length: trainingDays }, (_, index) => ({
      ...structuredClone(routines[index % routines.length]),
      day: week[Math.round(index * 6 / Math.max(1, trainingDays - 1))]
    }));
    const avoid = `${body.restrictions || ""} ${body.dislikes || ""}`.toLowerCase();
    const safeMeals = mealWeek.map(ids => ids.map(id => {
      if ((avoid.includes("pescado") || avoid.includes("atún") || avoid.includes("atun")) && ["atun-arroz","merluza-papas"].includes(id)) return "pollo-arroz";
      if (avoid.includes("lactosa") && ["yogur-fruta","licuado","tostadas-queso"].includes(id)) return "huevos-tostadas";
      return id;
    }));
    const nutrition = {
      days: safeMeals.map((mealIds, index) => ({ day: week[index], mealIds })),
      restrictions: String(body.restrictions || "").slice(0, 500),
      dislikes: String(body.dislikes || "").slice(0, 500),
      notice: "Porciones orientativas; revisar alergias y ajustar con un profesional cuando corresponda."
    };

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.rpc("generate_plan_for_user", {
      p_user_id: user.id,
      p_answers: { ...body, missionTitles },
      p_training_plan: { days },
      p_nutrition_plan: nutrition,
      p_mission_titles: missionTitles
    });
    if (error) throw error;
    return Response.json({ planId: data, trainingDays, missionCount: missionTitles.length }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("generate-plan", error instanceof Error ? error.message : error);
    return Response.json({ error: error instanceof Error ? error.message : "unexpected_error" }, { status: 500, headers: corsHeaders });
  }
});
