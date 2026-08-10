export const attributes = [
  { id: "intelecto", name: "Intelecto", color: "#56b8ff", skills: ["Inteligencia aplicada", "Conocimiento", "Aprendizaje", "Resolución de problemas", "Creatividad"] },
  { id: "carisma", name: "Carisma", color: "#b889ff", skills: ["Comunicación", "Habilidades sociales", "Liderazgo", "Control emocional", "Integridad y valores"] },
  { id: "rendimiento", name: "Rendimiento", color: "#43e5bd", skills: ["Disciplina", "Constancia", "Organización", "Productividad", "Finanzas personales"] },
  { id: "fisico", name: "Físico", color: "#ff8a63", skills: ["Fuerza", "Resistencia", "Velocidad y potencia", "Movilidad", "Salud física"] }
];

export const achievements = [
  { id: "first-mission", title: "Primer paso", description: "Completá tu primera misión.", condition: s => completedCount(s) >= 1, coins: 20 },
  { id: "perfect-day", title: "Día perfecto", description: "Cerrá un día con todas las misiones.", condition: s => s.dailyReviews.some(r => r.completed === r.total && r.total >= 4), coins: 60 },
  { id: "first-workout", title: "Registro de cazador", description: "Guardá tu primer entrenamiento.", condition: s => s.workoutSessions.length >= 1, coins: 30 },
  { id: "week-streak", title: "Constancia I", description: "Alcanzá una racha de 7 días.", condition: s => s.profile.bestStreak >= 7, coins: 100 },
  { id: "student", title: "Conocimiento aplicado", description: "Completá 3 clases de la Academia.", condition: s => s.academy.completed.length >= 3, coins: 75 },
  { id: "arena-win", title: "Victoria en la Arena", description: "Ganale una vez al Sistema.", condition: s => s.arena.wins >= 1, coins: 35 }
];

const completedCount = state => state.missions.reduce((sum, mission) => sum + (mission.completedOn?.length || 0), 0);

export const rankForLevel = level => level >= 50 ? "S" : level >= 35 ? "A" : level >= 25 ? "B" : level >= 15 ? "C" : level >= 7 ? "D" : "E";

export const onboardingSteps = [
  { id: "identity", label: "Tu punto de partida" },
  { id: "context", label: "Tu día real" },
  { id: "training", label: "Entrenamiento" },
  { id: "nutrition", label: "Alimentación" },
  { id: "missions", label: "Misiones" },
  { id: "mode", label: "Modo del plan" }
];

export const storeItems = [
  { id: "recipe-pack-1", type: "recipe", title: "Recetas rápidas I", description: "Seis recetas exclusivas de menos de 20 minutos.", cost: 180, level: 2 },
  { id: "skill-chest-1", type: "chest", title: "Cofre de habilidades E", description: "Desbloquea un desafío especial para una habilidad.", cost: 120, level: 3 },
  { id: "frame-cyan", type: "cosmetic", title: "Marco Portal Cian", description: "Un marco luminoso para tu avatar.", cost: 250, level: 5 },
  { id: "academy-focus", type: "course", title: "Curso: Enfoque profundo", description: "Tres clases avanzadas sobre concentración.", cost: 320, level: 6 }
];

export const assistantRules = state => {
  const today = new Date().toISOString().slice(0, 10);
  const daily = state.missions.filter(m => m.weekdays?.includes(((new Date().getDay() + 6) % 7) + 1));
  const done = daily.filter(m => m.completedOn?.includes(today)).length;
  const hour = new Date().getHours();
  if (!state.plan.active) return { title: "Tu plan todavía no está activo", text: "Completá la evaluación y revisá el resultado. No voy a activar nada sin tu confirmación.", action: "evaluation" };
  if (daily.length && done === daily.length) return { title: "El día está completo", text: "Cerrá el día, registrá qué funcionó y prepará la primera acción de mañana.", action: "close-day" };
  if (hour >= 19 && done < daily.length / 2) return { title: "Reducí la fricción", text: `Quedan ${daily.length - done} misiones. Elegí ahora la más corta y completala antes de abrir otra tarea.`, action: "inicio" };
  if (!state.workoutSessions.length) return { title: "Creá tu primera referencia", text: "Registrá una sesión aunque ya tengas una rutina profesional. Tus marcas de hoy serán la base de la progresión.", action: "plan" };
  return { title: "Prioridad actual", text: `Completaste ${done} de ${daily.length}. Seguí por una misión obligatoria antes de buscar recompensas.`, action: "inicio" };
};
