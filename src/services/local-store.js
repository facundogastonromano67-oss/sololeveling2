import { defaultMealPlan, exercises, meals, missionTemplates, routineTemplate, systemMissionTemplates } from "../data/catalog.js";

const KEY = "g30-state-v2";
const today = () => new Date().toISOString().slice(0, 10);
const uid = prefix => `${prefix}-${crypto.randomUUID()}`;

function freshState() {
  const mandatory = missionTemplates.slice(0, 6).map((item, index) => ({
    id: uid("mission"), ...item, description: "", source: "user", level: 1,
    weekdays: [1, 2, 3, 4, 5, 6, 7], progress: 0, completedOn: [], order: index
  }));
  const system = systemMissionTemplates.slice(0, 3).map((item, index) => ({
    id: uid("mission"), ...item, source: "system", level: 2, weekdays: [1, 2, 3, 4, 5, 6, 7],
    progress: 0, completedOn: [], order: index
  }));
  return {
    version: 2,
    profile: { displayName: "Facu", xp: 0, level: 1, streak: 0, mode: "flexible", planDay: 1, premium: false },
    evaluation: null,
    plan: { active: true, startDate: today(), routine: structuredClone(routineTemplate), mealIds: [...defaultMealPlan] },
    missions: [...system, ...mandatory],
    workoutSessions: [], mealLogs: [], notes: [], dailyReviews: [], penalties: []
  };
}

export function loadLocalState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (parsed?.version === 2) return parsed;
  } catch {}
  const state = freshState();
  saveLocalState(state);
  return state;
}

export function saveLocalState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetLocalState() {
  const state = freshState();
  saveLocalState(state);
  return state;
}

export function generateLocalPlan(state, evaluation) {
  const chosen = (evaluation.missionTitles || []).map(title => missionTemplates.find(m => m.title === title)).filter(Boolean);
  const selected = (chosen.length >= 4 ? chosen : missionTemplates.slice(0, 6)).slice(0, 15);
  const system = systemMissionTemplates.slice(0, 3).map((item, index) => ({
    id: uid("mission"), ...item, source: "system", level: 2, weekdays: [1, 2, 3, 4, 5, 6, 7], progress: 0, completedOn: [], order: index
  }));
  const mandatory = selected.map((item, index) => ({
    id: uid("mission"), ...item, description: "", source: "user", level: 1,
    weekdays: [1, 2, 3, 4, 5, 6, 7], progress: 0, completedOn: [], order: index
  }));
  const days = Math.max(2, Math.min(5, Number(evaluation.trainingDays || 3)));
  const baseRoutine = Array.from({ length: days }, (_, index) => {
    const source = routineTemplate[index % routineTemplate.length];
    const week = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return { ...structuredClone(source), day: week[Math.round(index * 6 / Math.max(1, days - 1))] };
  });
  state.evaluation = evaluation;
  state.profile.mode = evaluation.mode || "flexible";
  state.profile.planDay = 1;
  state.plan = { active: true, startDate: today(), routine: baseRoutine, mealIds: [...defaultMealPlan] };
  state.missions = [...system, ...mandatory];
  saveLocalState(state);
  return state;
}

export function updateMissionLocal(state, missionId, patch) {
  const mission = state.missions.find(item => item.id === missionId);
  if (!mission || (mission.source === "system" && patch.source !== "system")) return state;
  Object.assign(mission, patch);
  saveLocalState(state);
  return state;
}

export function completeMissionLocal(state, missionId) {
  const mission = state.missions.find(item => item.id === missionId);
  if (!mission) return state;
  const date = today();
  const done = mission.completedOn.includes(date);
  mission.completedOn = done ? mission.completedOn.filter(item => item !== date) : [...mission.completedOn, date];
  mission.progress = done ? 0 : mission.target;
  state.profile.xp = Math.max(0, state.profile.xp + (done ? -mission.xp : mission.xp));
  state.profile.level = Math.max(1, Math.floor(state.profile.xp / 500) + 1);
  saveLocalState(state);
  return state;
}

export function addMissionLocal(state, data) {
  if (state.profile.mode === "intensive" && state.plan.active) throw new Error("El modo intensivo no permite cambiar misiones durante el ciclo.");
  if (state.missions.filter(m => m.source === "user").length >= 15) throw new Error("El máximo es de 15 misiones obligatorias.");
  state.missions.push({
    id: uid("mission"), title: data.title, description: data.description || "", category: data.category || "disciplina",
    target: Number(data.target || 1), unit: data.unit || "vez", xp: 15, source: "user", level: 1,
    weekdays: data.weekdays || [1, 2, 3, 4, 5, 6, 7], progress: 0, completedOn: [], order: state.missions.length
  });
  saveLocalState(state);
  return state;
}

export function logWorkoutLocal(state, payload) {
  state.workoutSessions.unshift({ id: uid("workout"), date: today(), ...payload });
  saveLocalState(state);
}

export function logMealLocal(state, mealId) {
  state.mealLogs.unshift({ id: uid("meal"), date: today(), mealId, completedAt: new Date().toISOString() });
  saveLocalState(state);
}

export function saveNoteLocal(state, note) {
  const existing = note.id && state.notes.find(item => item.id === note.id);
  if (existing) Object.assign(existing, note, { updatedAt: new Date().toISOString() });
  else state.notes.unshift({ id: uid("note"), title: note.title || "Sin título", body: note.body || "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  saveLocalState(state);
}

export function closeDayLocal(state, reflection) {
  const date = today();
  const required = state.missions.filter(m => m.source === "user");
  const missed = required.filter(m => !m.completedOn.includes(date));
  state.dailyReviews = state.dailyReviews.filter(item => item.date !== date);
  state.dailyReviews.unshift({ date, reflection, completed: required.length - missed.length, total: required.length });
  if (missed.length && !state.penalties.some(item => item.sourceDate === date)) {
    state.penalties.push({ id: uid("penalty"), sourceDate: date, title: "Recuperación del Sistema", description: "30 flexiones o su alternativa + 30 sentadillas", xpLoss: Math.min(50, missed.length * 5), completed: false });
    state.profile.xp = Math.max(0, state.profile.xp - Math.min(50, missed.length * 5));
  }
  saveLocalState(state);
  return { missed: missed.length };
}

export function exerciseById(id) { return exercises.find(item => item.id === id); }
export function mealById(id) { return meals.find(item => item.id === id); }
export { today };
