import assert from "node:assert/strict";

const memory = new Map();
globalThis.localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key)
};

const store = await import("../src/services/local-store.js");
let state = store.resetLocalState();
assert.equal(state.missions.filter(m => m.source === "system").length, 3);
assert.ok(state.missions.filter(m => m.source === "user").length >= 4);

const mission = state.missions.find(m => m.source === "user");
store.completeMissionLocal(state, mission.id);
assert.ok(mission.completedOn.includes(store.today()));
assert.equal(state.profile.xp, mission.xp);
store.completeMissionLocal(state, mission.id);
assert.equal(state.profile.xp, 0);

store.addMissionLocal(state, { title: "Preparar ropa", target: 1, unit: "vez", weekdays: [1, 3, 5] });
assert.ok(state.missions.some(m => m.title === "Preparar ropa"));

store.generateLocalPlan(state, {
  goal: "Crear constancia", trainingDays: 4, mode: "flexible",
  missionTitles: [
    "Completar la sesión de entrenamiento", "Completar cuatro comidas saludables",
    "Caminar 8.000 pasos", "Tomar dos litros de agua"
  ]
});
assert.equal(state.plan.routine.length, 4);
assert.equal(state.missions.filter(m => m.source === "user").length, 4);

store.logWorkoutLocal(state, { title: "Fuerza A", durationMinutes: 40, sets: [] });
store.logMealLocal(state, "pollo-arroz");
store.saveNoteLocal(state, { title: "Día 1", body: "Empecé." });
assert.equal(state.workoutSessions.length, 1);
assert.equal(state.mealLogs.length, 1);
assert.equal(state.notes.length, 1);

const result = store.closeDayLocal(state, "Día de prueba");
assert.equal(result.missed, 4);
assert.equal(state.penalties.length, 1);
const xpAfterPenalty = state.profile.xp;
store.closeDayLocal(state, "No debe duplicar");
assert.equal(state.penalties.length, 1);
assert.equal(state.profile.xp, xpAfterPenalty);
console.log("Flujos locales G30 validados correctamente.");
