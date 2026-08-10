import { academyCourses, exercises, meals, missionTemplates, routineTemplate, systemMissionTemplates, weeklyMealTemplate } from "../data/catalog.js";
import { achievements, attributes, rankForLevel, storeItems } from "../data/content.js";

const KEY = "g30-state-v3";
const LEGACY_KEY = "g30-state-v2";
const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const today = () => dateKey();
const dayNumber = () => ((new Date().getDay() + 6) % 7) + 1;
const clone = value => JSON.parse(JSON.stringify(value));

const emptySkills = () => Object.fromEntries(attributes.flatMap(attribute => attribute.skills.map(name => [name, { level: 1, xp: 0 }])));

function systemMissionsForDate(date = today()) {
  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 3 }, (_, index) => {
    const item = systemMissionTemplates[(seed + index * 2) % systemMissionTemplates.length];
    return { id: `system-${date}-${index}`, ...clone(item), source: "system", level: 2, weekdays: [dayNumber()], progress: 0, completedOn: [], order: index };
  });
}

export function freshState() {
  return {
    version: 3,
    onboarding: { completed: false, step: -1, draft: null },
    profile: { displayName: "", avatar: null, avatarFrame: null, xp: 0, level: 1, rank: "E", streak: 0, bestStreak: 0, coins: 100, mode: "flexible", planDay: 0, premium: false, lastClosedDate: null },
    evaluation: null,
    planDraft: null,
    plan: { active: false, startDate: null, routine: [], nutrition: [], customRoutine: false },
    missions: [], workoutSessions: [], mealLogs: [], notes: [], dailyReviews: [], penalties: [],
    skills: emptySkills(),
    academy: { completed: [], dailyDate: null, dailyCount: 0 },
    arena: { wins: 0, losses: 0, bestScore: 0, history: [], guildName: "" },
    dungeons: { completed: 0, currentStreak: 0, history: [] },
    economy: { owned: [], ledger: [] },
    achievements: [],
    reminders: [],
    ui: { selectedTraining: 0, selectedNutrition: dayNumber() - 1 }
  };
}

function normalize(state) {
  const base = freshState();
  const merged = { ...base, ...state };
  merged.profile = { ...base.profile, ...(state.profile || {}) };
  merged.onboarding = { ...base.onboarding, ...(state.onboarding || {}) };
  merged.plan = { ...base.plan, ...(state.plan || {}) };
  merged.academy = { ...base.academy, ...(state.academy || {}) };
  merged.arena = { ...base.arena, ...(state.arena || {}) };
  merged.dungeons = { ...base.dungeons, ...(state.dungeons || {}) };
  merged.economy = { ...base.economy, ...(state.economy || {}) };
  merged.ui = { ...base.ui, ...(state.ui || {}) };
  merged.skills = { ...base.skills, ...(state.skills || {}) };
  merged.version = 3;
  return merged;
}

function migrateLegacy(legacy) {
  const next = freshState();
  if (!legacy) return next;
  next.profile = { ...next.profile, ...legacy.profile, displayName: legacy.profile?.displayName || "" };
  next.evaluation = legacy.evaluation;
  next.plan = { ...next.plan, ...legacy.plan, nutrition: weeklyMealTemplate.map((mealIds, index) => ({ day: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index], mealIds })) };
  next.plan.active = Boolean(legacy.evaluation && legacy.plan?.active);
  next.onboarding.completed = next.plan.active;
  next.missions = legacy.missions || [];
  next.workoutSessions = legacy.workoutSessions || [];
  next.mealLogs = legacy.mealLogs || [];
  next.notes = legacy.notes || [];
  next.dailyReviews = legacy.dailyReviews || [];
  next.penalties = legacy.penalties || [];
  return next;
}

export function loadLocalState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (parsed?.version === 3) return normalize(parsed);
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (legacy?.version === 2) {
      const migrated = migrateLegacy(legacy); saveLocalState(migrated); return migrated;
    }
  } catch {}
  const state = freshState(); saveLocalState(state); return state;
}

export function saveLocalState(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function resetLocalState() { const state = freshState(); saveLocalState(state); return state; }

function adaptRoutine(evaluation) {
  const days = Math.max(2, Math.min(5, Number(evaluation.trainingDays || 3)));
  const week = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const place = String(evaluation.place || "Casa").toLowerCase();
  return Array.from({ length: days }, (_, index) => {
    const source = clone(routineTemplate[index]);
    source.day = week[Math.round(index * 6 / Math.max(1, days - 1))];
    source.exercises = source.exercises.map(row => {
      let exerciseId = row.exerciseId;
      if (place.includes("gimnasio")) {
        if (exerciseId === "sentadilla") exerciseId = "prensa";
        if (exerciseId === "flexiones") exerciseId = "press-maquina";
        if (exerciseId === "remo-banda") exerciseId = "jalon";
      }
      return { ...row, exerciseId, restSeconds: exerciseId === "plancha" || exerciseId === "dead-bug" ? 60 : 90 };
    });
    return source;
  });
}

function filterNutrition(evaluation) {
  const avoid = `${evaluation.restrictions || ""} ${evaluation.dislikes || ""}`.toLowerCase();
  const blocked = meal => (avoid.includes("pescado") || avoid.includes("atún") || avoid.includes("atun")) && /atún|merluza/i.test(meal.name)
    || (avoid.includes("lactosa") || avoid.includes("lácteo")) && /yogur|leche|queso/i.test(meal.name)
    || (avoid.includes("carne")) && /carne|hamburguesa|boloñesa/i.test(meal.name);
  return weeklyMealTemplate.map((ids, index) => ({
    day: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index],
    mealIds: ids.map(id => {
      const meal = meals.find(item => item.id === id);
      if (!meal || !blocked(meal)) return id;
      return meals.find(candidate => candidate.type === meal.type && !blocked(candidate))?.id || id;
    })
  }));
}

export function buildPlanDraft(evaluation) {
  const chosen = (evaluation.missionTitles || []).map(title => missionTemplates.find(item => item.title === title)).filter(Boolean);
  const templates = (chosen.length >= 4 ? chosen : missionTemplates.slice(0, 6)).slice(0, 15);
  return {
    evaluation: clone(evaluation),
    mode: evaluation.mode || "flexible",
    routine: adaptRoutine(evaluation),
    nutrition: filterNutrition(evaluation),
    missions: templates.map((item, index) => ({ id: uid("draft-mission"), ...clone(item), description: "", source: "user", level: 1, weekdays: [1, 2, 3, 4, 5, 6, 7], progress: 0, completedOn: [], completions: 0, order: index }))
  };
}

export function savePlanDraft(state, evaluation) { state.planDraft = buildPlanDraft(evaluation); state.evaluation = clone(evaluation); saveLocalState(state); return state.planDraft; }

export function replaceDraftExercise(state, dayIndex, exerciseIndex) {
  const row = state.planDraft?.routine?.[dayIndex]?.exercises?.[exerciseIndex];
  const current = exercises.find(item => item.id === row?.exerciseId);
  if (!row || !current) return;
  const pool = [...(current.alternatives || []), ...exercises.filter(item => item.group === current.group).map(item => item.id)].filter((id, index, all) => id !== row.exerciseId && all.indexOf(id) === index);
  row.exerciseId = pool[0] || row.exerciseId; saveLocalState(state);
}

export function replaceDraftMeal(state, dayIndex, mealIndex) {
  const day = state.planDraft?.nutrition?.[dayIndex];
  const current = meals.find(item => item.id === day?.mealIds?.[mealIndex]);
  if (!day || !current) return;
  const choices = meals.filter(item => item.type === current.type && item.id !== current.id);
  day.mealIds[mealIndex] = choices[0]?.id || current.id; saveLocalState(state);
}

export function confirmLocalPlan(state) {
  if (!state.planDraft) throw new Error("Primero tenés que generar el plan.");
  state.profile.displayName = state.planDraft.evaluation.displayName || state.profile.displayName || "Cazador";
  state.profile.mode = state.planDraft.mode;
  state.profile.planDay = 1;
  state.evaluation = clone(state.planDraft.evaluation);
  state.plan = { active: true, startDate: today(), routine: clone(state.planDraft.routine), nutrition: clone(state.planDraft.nutrition), customRoutine: false };
  state.missions = [...systemMissionsForDate(), ...clone(state.planDraft.missions).map((mission, index) => ({ ...mission, id: uid("mission"), order: index }))];
  state.onboarding = { completed: true, step: 0, draft: null };
  state.planDraft = null; saveLocalState(state); return state;
}

export function generateLocalPlan(state, evaluation) { savePlanDraft(state, evaluation); return confirmLocalPlan(state); }

export function ensureDailyState(state) {
  if (!state.plan.active) return state;
  const expected = systemMissionsForDate();
  const hasToday = state.missions.some(m => m.source === "system" && m.id.startsWith(`system-${today()}`));
  if (!hasToday) state.missions = [...expected, ...state.missions.filter(m => m.source !== "system")];
  const start = new Date(`${state.plan.startDate}T12:00:00`);
  state.profile.planDay = Math.max(1, Math.floor((new Date() - start) / 86400000) + 1);
  saveLocalState(state); return state;
}

export function updateMissionLocal(state, missionId, patch) {
  if (state.profile.mode === "intensive" && state.plan.active) throw new Error("El modo intensivo bloquea cambios durante el ciclo de 30 días.");
  const mission = state.missions.find(item => item.id === missionId);
  if (!mission || mission.source === "system") return state;
  Object.assign(mission, patch); saveLocalState(state); return state;
}

export function addMissionLocal(state, data) {
  if (state.profile.mode === "intensive" && state.plan.active) throw new Error("El modo intensivo no permite cambiar misiones durante el ciclo.");
  if (state.missions.filter(m => m.source === "user").length >= 15) throw new Error("El máximo es de 15 misiones obligatorias.");
  state.missions.push({ id: uid("mission"), title: data.title, description: data.description || "", category: data.category || "disciplina", target: Number(data.target || 1), unit: data.unit || "vez", xp: 15, skill: data.skill || "Disciplina", source: "user", level: 1, weekdays: data.weekdays || [1, 2, 3, 4, 5, 6, 7], progress: 0, completedOn: [], completions: 0, order: state.missions.length });
  saveLocalState(state); return state;
}

function addSkillXp(state, name, amount) {
  if (!state.skills[name]) return;
  state.skills[name].xp += amount;
  state.skills[name].level = Math.floor(state.skills[name].xp / 250) + 1;
}

function recalculateProfile(state) {
  state.profile.level = Math.max(1, Math.floor(state.profile.xp / 500) + 1);
  state.profile.rank = rankForLevel(state.profile.level);
}

export function completeMissionLocal(state, missionId) {
  const mission = state.missions.find(item => item.id === missionId);
  if (!mission) return state;
  const date = today(); const done = mission.completedOn.includes(date);
  mission.completedOn = done ? mission.completedOn.filter(item => item !== date) : [...mission.completedOn, date];
  mission.progress = done ? 0 : mission.target;
  mission.completions = Math.max(0, (mission.completions || 0) + (done ? -1 : 1));
  state.profile.xp = Math.max(0, state.profile.xp + (done ? -mission.xp : mission.xp));
  addSkillXp(state, mission.skill, done ? -Math.ceil(mission.xp / 2) : Math.ceil(mission.xp / 2));
  if (!done && mission.source === "user" && mission.completions > 0 && mission.completions % 7 === 0) {
    mission.level += 1; mission.xp += 3;
    if (Number.isInteger(mission.target) && mission.target > 1 && mission.category !== "nutrición") mission.target = Math.ceil(mission.target * 1.05);
  }
  recalculateProfile(state); unlockAchievements(state); saveLocalState(state); return state;
}

export function logWorkoutLocal(state, payload) { state.workoutSessions.unshift({ id: uid("workout"), date: today(), createdAt: new Date().toISOString(), ...payload }); unlockAchievements(state); saveLocalState(state); }
export function logMealLocal(state, mealId, portions = 1) { state.mealLogs.unshift({ id: uid("meal"), date: today(), mealId, portions, completedAt: new Date().toISOString() }); saveLocalState(state); }
export function saveNoteLocal(state, note) { const existing = note.id && state.notes.find(item => item.id === note.id); let saved; if (existing) { Object.assign(existing, note, { updatedAt: new Date().toISOString() }); saved=existing; } else { saved={ id: uid("note"), title: note.title || "Sin título", body: note.body || "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; state.notes.unshift(saved); } saveLocalState(state); return saved; }

export function closeDayLocal(state, reflection) {
  const date = today(); const required = state.missions.filter(m => m.source === "user" && m.weekdays?.includes(dayNumber())); const missed = required.filter(m => !m.completedOn.includes(date));
  state.dailyReviews = state.dailyReviews.filter(item => item.date !== date);
  state.dailyReviews.unshift({ date, reflection, completed: required.length - missed.length, total: required.length });
  if (missed.length && !state.penalties.some(item => item.sourceDate === date)) {
    const xpLoss = Math.min(50, missed.length * 5);
    state.penalties.push({ id: uid("penalty"), sourceDate: date, dueDate: dateKey(new Date(Date.now() + 86400000)), title: "Recuperación del Sistema", description: "30 flexiones o alternativa segura + 30 sentadillas", xpLoss, completed: false });
    state.profile.xp = Math.max(0, state.profile.xp - xpLoss);
  }
  if (!missed.length) { state.profile.streak += 1; state.profile.bestStreak = Math.max(state.profile.bestStreak, state.profile.streak); }
  else state.profile.streak = 0;
  state.profile.lastClosedDate = date; recalculateProfile(state); unlockAchievements(state); saveLocalState(state); return { missed: missed.length };
}

export function completePenaltyLocal(state, id) { const penalty = state.penalties.find(item => item.id === id); if (penalty) penalty.completed = true; saveLocalState(state); }

export function replacePlanExercise(state, dayIndex, exerciseIndex, exerciseId) { if (state.profile.mode === "intensive" && state.plan.active) throw new Error("El modo intensivo bloquea la rutina."); const row = state.plan.routine?.[dayIndex]?.exercises?.[exerciseIndex]; if (row && exercises.some(item => item.id === exerciseId)) row.exerciseId = exerciseId; saveLocalState(state); }
export function replacePlanMeal(state, dayIndex, mealIndex, mealId) { if (state.profile.mode === "intensive" && state.plan.active) throw new Error("El modo intensivo bloquea el menú."); const day = state.plan.nutrition?.[dayIndex]; if (day && meals.some(item => item.id === mealId)) day.mealIds[mealIndex] = mealId; saveLocalState(state); }
export function importRoutineLocal(state, title, rows) { if (state.profile.mode === "intensive" && state.plan.active) throw new Error("El modo intensivo bloquea la rutina."); state.plan.routine.push({ day: "Personal", title: title || "Rutina profesional", exercises: rows }); state.plan.customRoutine = true; saveLocalState(state); }

export function completeLessonLocal(state, courseId, lessonIndex) {
  const key = `${courseId}:${lessonIndex}`; const date = today();
  if (state.academy.dailyDate !== date) { state.academy.dailyDate = date; state.academy.dailyCount = 0; }
  if (state.academy.completed.includes(key)) return { already: true };
  if (!state.profile.premium && state.academy.dailyCount >= 1) throw new Error("Alcanzaste la clase gratuita de hoy. Mañana se habilita otra.");
  state.academy.completed.push(key); state.academy.dailyCount += 1; unlockAchievements(state); saveLocalState(state); return { already: false };
}

export function arenaDuelLocal(state, power) {
  const system = 3 + Math.floor(Math.random() * 8); const user = Math.max(1, Math.min(10, Number(power))) + Math.min(3, Math.floor(state.profile.streak / 3)); const won = user > system; const draw = user === system;
  if (won) { state.arena.wins += 1; state.profile.coins += 12; } else if (!draw) state.arena.losses += 1;
  state.arena.bestScore = Math.max(state.arena.bestScore, user); state.arena.history.unshift({ date: today(), user, system, result: won ? "victoria" : draw ? "empate" : "derrota" }); unlockAchievements(state); saveLocalState(state); return { user, system, result: won ? "GANASTE" : draw ? "EMPATE" : "GANÓ EL SISTEMA", won };
}

export function completeDungeonLocal(state) {
  const daily = state.missions.filter(m => m.weekdays?.includes(dayNumber())); const done = daily.filter(m => m.completedOn.includes(today())).length; const percent = daily.length ? done / daily.length : 0;
  if (percent < .8) throw new Error("Necesitás completar al menos el 80% de las misiones de hoy.");
  if (state.dungeons.history.some(item => item.date === today())) throw new Error("La mazmorra de hoy ya fue completada.");
  state.dungeons.completed += 1; state.dungeons.currentStreak += 1; state.profile.coins += 30; state.dungeons.history.unshift({ date: today(), completion: Math.round(percent * 100), reward: 30 }); saveLocalState(state); return { reward: 30 };
}

export function purchaseLocal(state, itemId) { const item = storeItems.find(entry => entry.id === itemId); if (!item) throw new Error("Objeto inexistente."); if (state.profile.level < item.level) throw new Error(`Se desbloquea en nivel ${item.level}.`); if (state.economy.owned.includes(itemId)) throw new Error("Ya tenés este objeto."); if (state.profile.coins < item.cost) throw new Error("No tenés monedas suficientes."); state.profile.coins -= item.cost; state.economy.owned.push(itemId); state.economy.ledger.unshift({ id: uid("ledger"), date: new Date().toISOString(), amount: -item.cost, reason: item.title }); if (item.id === "frame-cyan") state.profile.avatarFrame = "cyan"; saveLocalState(state); }

function unlockAchievements(state) { for (const achievement of achievements) { if (!state.achievements.includes(achievement.id) && achievement.condition(state)) { state.achievements.push(achievement.id); state.profile.coins += achievement.coins; state.economy.ledger.unshift({ id: uid("ledger"), date: new Date().toISOString(), amount: achievement.coins, reason: achievement.title }); } } }

export function saveAvatarLocal(state, dataUrl) { state.profile.avatar = dataUrl; saveLocalState(state); }
export function setGuildLocal(state, name) { state.arena.guildName = String(name || "").slice(0, 40); saveLocalState(state); }
export function exerciseById(id) { return exercises.find(item => item.id === id); }
export function mealById(id) { return meals.find(item => item.id === id); }
