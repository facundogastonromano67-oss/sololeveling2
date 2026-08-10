import assert from "node:assert/strict";

const memory = new Map();
globalThis.localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key)
};

const store = await import("../src/services/local-store.js");
let state = store.resetLocalState();
assert.equal(state.onboarding.completed, false);
assert.equal(state.plan.active, false);
assert.equal(state.missions.length, 0);

const evaluation = {
  displayName: "Facu", goal: "Crear constancia", workActivity: "Sedentario", trainingDays: 4,
  place: "En casa", restrictions: "", dislikes: "pescado", mode: "flexible",
  missionTitles: [
    "Completar la sesión de entrenamiento", "Completar cuatro comidas saludables",
    "Caminar 8.000 pasos", "Tomar dos litros de agua"
  ]
};

const draft = store.savePlanDraft(state, evaluation);
assert.equal(draft.routine.length, 4);
assert.equal(draft.nutrition.length, 7);
assert.equal(draft.missions.length, 4);
const firstExercise = draft.routine[0].exercises[0].exerciseId;
store.replaceDraftExercise(state, 0, 0);
assert.notEqual(draft.routine[0].exercises[0].exerciseId, firstExercise);
store.confirmLocalPlan(state);
assert.equal(state.onboarding.completed, true);
assert.equal(state.plan.active, true);
assert.equal(state.missions.filter(m => m.source === "system").length, 3);
assert.equal(state.missions.filter(m => m.source === "user").length, 4);

const mission = state.missions.find(m => m.source === "user");
store.completeMissionLocal(state, mission.id);
assert.ok(mission.completedOn.includes(store.today()));
assert.equal(state.profile.xp, mission.xp);
store.completeMissionLocal(state, mission.id);
assert.equal(state.profile.xp, 0);

store.addMissionLocal(state, { title: "Preparar ropa", target: 1, unit: "vez", weekdays: [1, 3, 5] });
assert.ok(state.missions.some(m => m.title === "Preparar ropa"));

store.logWorkoutLocal(state, { title: "Fuerza A", durationMinutes: 40, sets: [{ exerciseId: "sentadilla", reps: 10, weight: 20 }] });
store.logMealLocal(state, "pollo-arroz");
store.saveNoteLocal(state, { title: "Día 1", body: "Empecé." });
assert.equal(state.workoutSessions.length, 1);
assert.equal(state.mealLogs.length, 1);
assert.equal(state.notes.length, 1);

const result = store.closeDayLocal(state, "Día de prueba");
assert.ok(result.missed >= 4);
assert.equal(state.penalties.length, 1);
const xpAfterPenalty = state.profile.xp;
store.closeDayLocal(state, "No debe duplicar");
assert.equal(state.penalties.length, 1);
assert.equal(state.profile.xp, xpAfterPenalty);

state.profile.level = 5; state.profile.coins = 500;
store.purchaseLocal(state, "frame-cyan");
assert.ok(state.economy.owned.includes("frame-cyan"));
assert.equal(state.profile.avatarFrame, "cyan");

store.completeLessonLocal(state, "fuerza-base", 0);
assert.ok(state.academy.completed.includes("fuerza-base:0"));
assert.throws(() => store.completeLessonLocal(state, "fuerza-base", 1), /clase gratuita/i);

console.log("Flujo completo local G30 validado correctamente.");
