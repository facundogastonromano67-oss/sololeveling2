export const missionTemplates = [
  { title: "Completar la sesión de entrenamiento", category: "entrenamiento", target: 1, unit: "sesión", xp: 45, skill: "Fuerza" },
  { title: "Completar cuatro comidas saludables", category: "nutrición", target: 4, unit: "comidas", xp: 35, skill: "Salud física" },
  { title: "Caminar 8.000 pasos", category: "resistencia", target: 8000, unit: "pasos", xp: 30, skill: "Resistencia" },
  { title: "Tomar dos litros de agua", category: "recuperación", target: 2, unit: "litros", xp: 20, skill: "Salud física" },
  { title: "Dormir al menos siete horas", category: "recuperación", target: 7, unit: "horas", xp: 30, skill: "Salud física" },
  { title: "Leer veinte minutos", category: "enfoque", target: 20, unit: "minutos", xp: 25, skill: "Aprendizaje" },
  { title: "Planificar las tres prioridades de mañana", category: "disciplina", target: 3, unit: "prioridades", xp: 20, skill: "Organización" },
  { title: "Ordenar el espacio principal", category: "disciplina", target: 1, unit: "espacio", xp: 20, skill: "Disciplina" },
  { title: "Realizar diez minutos de movilidad", category: "movilidad", target: 10, unit: "minutos", xp: 20, skill: "Movilidad" },
  { title: "Comer dos porciones de fruta", category: "nutrición", target: 2, unit: "porciones", xp: 20, skill: "Salud física" },
  { title: "No usar pantallas antes de dormir", category: "recuperación", target: 30, unit: "minutos", xp: 25, skill: "Control emocional" },
  { title: "Escribir una página en el cuaderno", category: "enfoque", target: 1, unit: "página", xp: 20, skill: "Creatividad" },
  { title: "Practicar una habilidad profesional", category: "trabajo", target: 25, unit: "minutos", xp: 30, skill: "Conocimiento" },
  { title: "Registrar gastos del día", category: "finanzas", target: 1, unit: "registro", xp: 20, skill: "Finanzas personales" },
  { title: "Tener una conversación sin teléfono", category: "social", target: 1, unit: "conversación", xp: 25, skill: "Comunicación" },
  { title: "Preparar la ropa y el bolso de mañana", category: "disciplina", target: 1, unit: "preparación", xp: 20, skill: "Organización" }
];

export const systemMissionTemplates = [
  { title: "Bloque de enfoque profundo", description: "Completá 45 minutos sin notificaciones.", category: "enfoque", target: 45, unit: "minutos", xp: 70, skill: "Productividad" },
  { title: "La tarea que evitás", description: "Resolvé hoy una tarea que venís postergando.", category: "disciplina", target: 1, unit: "tarea", xp: 80, skill: "Disciplina" },
  { title: "Final técnico", description: "En la última serie priorizá control y técnica perfecta.", category: "entrenamiento", target: 1, unit: "serie", xp: 65, skill: "Fuerza" },
  { title: "Caminata extra", description: "Sumá 2.500 pasos por encima de tu objetivo normal.", category: "resistencia", target: 2500, unit: "pasos", xp: 65, skill: "Resistencia" },
  { title: "Comida preparada", description: "Dejá lista una comida simple para mañana.", category: "nutrición", target: 1, unit: "comida", xp: 60, skill: "Organización" },
  { title: "Cierre sin excusas", description: "Cerrá el día y registrá un aprendizaje concreto.", category: "disciplina", target: 1, unit: "cierre", xp: 60, skill: "Constancia" },
  { title: "Conversación difícil", description: "Expresá con respeto algo que venís evitando.", category: "social", target: 1, unit: "conversación", xp: 75, skill: "Comunicación" },
  { title: "Aprendizaje aplicado", description: "Usá hoy una idea aprendida esta semana.", category: "intelecto", target: 1, unit: "aplicación", xp: 70, skill: "Inteligencia aplicada" },
  { title: "Orden de emergencia", description: "Recuperá en 20 minutos un espacio descuidado.", category: "disciplina", target: 20, unit: "minutos", xp: 65, skill: "Organización" }
];

export const exercises = [
  { id: "sentadilla", name: "Sentadilla", group: "Piernas", equipment: "Peso corporal", cue: "Rodillas siguen la línea de los pies; bajá con control.", alternatives: ["sentadilla-goblet", "prensa"] },
  { id: "sentadilla-goblet", name: "Sentadilla goblet", group: "Piernas", equipment: "Mancuerna", cue: "Sostené la carga cerca del pecho y mantené el torso estable.", alternatives: ["sentadilla", "prensa"] },
  { id: "prensa", name: "Prensa de piernas", group: "Piernas", equipment: "Gimnasio", cue: "No despegues la cadera y evitá bloquear las rodillas.", alternatives: ["sentadilla-goblet", "zancadas"] },
  { id: "flexiones", name: "Flexiones", group: "Pecho", equipment: "Peso corporal", cue: "Cuerpo firme, pecho hacia el suelo, codos a 30–45°.", alternatives: ["press-mancuernas", "press-maquina"] },
  { id: "press-maquina", name: "Press de pecho en máquina", group: "Pecho", equipment: "Gimnasio", cue: "Escápulas estables y regreso lento.", alternatives: ["press-mancuernas", "flexiones"] },
  { id: "remo-banda", name: "Remo con banda", group: "Espalda", equipment: "Banda", cue: "Llevá los codos atrás sin elevar los hombros.", alternatives: ["remo-mancuerna", "jalon"] },
  { id: "jalon", name: "Jalón al pecho", group: "Espalda", equipment: "Gimnasio", cue: "Llevá los codos hacia abajo sin balancear el torso.", alternatives: ["remo-mancuerna", "remo-banda"] },
  { id: "zancadas", name: "Zancadas alternas", group: "Piernas", equipment: "Peso corporal", cue: "Paso estable y rodilla trasera hacia el suelo.", alternatives: ["sentadilla", "prensa"] },
  { id: "puente-gluteos", name: "Puente de glúteos", group: "Glúteos", equipment: "Peso corporal", cue: "Terminá apretando glúteos, sin arquear la espalda.", alternatives: ["peso-muerto-rumano"] },
  { id: "plancha", name: "Plancha frontal", group: "Core", equipment: "Peso corporal", cue: "Costillas hacia abajo y glúteos activos.", alternatives: ["dead-bug", "bird-dog"] },
  { id: "press-mancuernas", name: "Press con mancuernas", group: "Pecho", equipment: "Mancuernas", cue: "Bajá controlado y mantené los pies firmes.", alternatives: ["flexiones", "press-maquina"] },
  { id: "remo-mancuerna", name: "Remo a una mano", group: "Espalda", equipment: "Mancuerna", cue: "Tirá hacia la cadera sin girar el torso.", alternatives: ["remo-banda", "jalon"] },
  { id: "peso-muerto-rumano", name: "Peso muerto rumano", group: "Posterior", equipment: "Mancuernas", cue: "Cadera atrás, espalda neutra y carga cerca del cuerpo.", alternatives: ["puente-gluteos"] },
  { id: "press-hombros", name: "Press de hombros", group: "Hombros", equipment: "Mancuernas", cue: "No arquees la zona lumbar; subí en línea controlada.", alternatives: ["elevaciones-laterales"] },
  { id: "elevaciones-laterales", name: "Elevaciones laterales", group: "Hombros", equipment: "Mancuernas", cue: "Usá poco peso y frená antes de encoger los hombros.", alternatives: ["press-hombros"] },
  { id: "curl-biceps", name: "Curl de bíceps", group: "Brazos", equipment: "Mancuernas", cue: "Codos quietos y descenso lento.", alternatives: ["extension-triceps"] },
  { id: "extension-triceps", name: "Extensión de tríceps", group: "Brazos", equipment: "Banda", cue: "Fijá los codos y extendé sin impulso.", alternatives: ["curl-biceps"] },
  { id: "gemelos", name: "Elevación de gemelos", group: "Piernas", equipment: "Peso corporal", cue: "Subí completo, pausá arriba y bajá lento.", alternatives: ["zancadas"] },
  { id: "dead-bug", name: "Dead bug", group: "Core", equipment: "Peso corporal", cue: "Espalda baja apoyada mientras extendés brazo y pierna.", alternatives: ["plancha", "bird-dog"] },
  { id: "bird-dog", name: "Bird dog", group: "Core", equipment: "Peso corporal", cue: "No gires la cadera; alcanzá largo y controlado.", alternatives: ["dead-bug", "plancha"] },
  { id: "caminata", name: "Caminata rápida", group: "Cardio", equipment: "Ninguno", cue: "Ritmo que permita hablar en frases cortas.", alternatives: ["bicicleta"] },
  { id: "bicicleta", name: "Bicicleta", group: "Cardio", equipment: "Bicicleta", cue: "Esfuerzo sostenido y respiración controlada.", alternatives: ["caminata"] }
];

const prep = {
  bowl: ["Colocá todos los ingredientes en un bol.", "Mezclá hasta integrar.", "Ajustá canela, sal o limón y serví."],
  pan: ["Calentá una sartén a fuego medio.", "Cociná la proteína y las verduras con poco aceite.", "Serví con el acompañamiento indicado."],
  oven: ["Precalentá el horno a 200 °C.", "Acomodá los ingredientes en una fuente y condimentá.", "Horneá hasta que la proteína esté cocida y las verduras tiernas."],
  pot: ["Cortá los ingredientes en tamaños parejos.", "Cociná a fuego medio en una olla, agregando agua si hace falta.", "Probá, corregí condimentos y serví."],
  quick: ["Prepará y medí los ingredientes.", "Combiná todo en menos de cinco minutos.", "Serví en el momento."]
};

export const meals = [
  { id: "avena-banana", name: "Avena con banana y yogur", type: "Desayuno", kcal: 430, protein: 20, carbs: 65, fats: 10, ingredients: ["60 g de avena", "1 banana", "170 g de yogur natural", "Canela"], steps: prep.bowl },
  { id: "huevos-tostadas", name: "Huevos revueltos con tostadas", type: "Desayuno", kcal: 410, protein: 24, carbs: 38, fats: 18, ingredients: ["3 huevos", "2 tostadas integrales", "1 tomate"], steps: prep.pan },
  { id: "yogur-fruta", name: "Yogur, fruta y frutos secos", type: "Desayuno", kcal: 360, protein: 18, carbs: 43, fats: 13, ingredients: ["200 g de yogur", "1 fruta", "20 g de maní o nueces"], steps: prep.quick },
  { id: "tostadas-avena", name: "Tostadas con queso y fruta", type: "Desayuno", kcal: 390, protein: 19, carbs: 51, fats: 12, ingredients: ["2 tostadas integrales", "60 g de queso fresco", "1 fruta"], steps: prep.quick },
  { id: "pollo-arroz", name: "Pollo con arroz y verduras", type: "Almuerzo", kcal: 610, protein: 45, carbs: 70, fats: 15, ingredients: ["180 g de pollo", "1 taza de arroz cocido", "Verduras salteadas"], steps: prep.pan },
  { id: "carne-papas", name: "Carne magra con papas", type: "Almuerzo", kcal: 650, protein: 42, carbs: 67, fats: 22, ingredients: ["170 g de carne magra", "300 g de papa", "Ensalada"], steps: prep.oven },
  { id: "lentejas", name: "Guiso simple de lentejas", type: "Almuerzo", kcal: 560, protein: 28, carbs: 76, fats: 14, ingredients: ["1 taza de lentejas", "Cebolla, zanahoria y tomate", "1 huevo"], steps: prep.pot },
  { id: "atun-arroz", name: "Ensalada de atún y arroz", type: "Almuerzo", kcal: 520, protein: 34, carbs: 61, fats: 13, ingredients: ["1 lata de atún", "1 taza de arroz", "Tomate y zanahoria"], steps: prep.bowl },
  { id: "pasta-bolonesa", name: "Pasta con boloñesa simple", type: "Almuerzo", kcal: 690, protein: 39, carbs: 90, fats: 19, ingredients: ["100 g de pasta seca", "150 g de carne picada magra", "Salsa de tomate"], steps: prep.pot },
  { id: "arroz-huevos", name: "Arroz, huevos y vegetales", type: "Almuerzo", kcal: 540, protein: 26, carbs: 70, fats: 17, ingredients: ["1 taza de arroz", "3 huevos", "Vegetales congelados"], steps: prep.pan },
  { id: "sandwich-pollo", name: "Sándwich completo de pollo", type: "Merienda", kcal: 470, protein: 35, carbs: 49, fats: 14, ingredients: ["2 rebanadas de pan integral", "120 g de pollo", "Queso, tomate y hojas"], steps: prep.quick },
  { id: "licuado", name: "Licuado de leche, banana y avena", type: "Merienda", kcal: 420, protein: 19, carbs: 67, fats: 9, ingredients: ["300 ml de leche", "1 banana", "40 g de avena"], steps: prep.quick },
  { id: "tostadas-queso", name: "Tostadas con queso y fruta", type: "Merienda", kcal: 380, protein: 18, carbs: 50, fats: 12, ingredients: ["2 tostadas", "60 g de queso fresco", "1 fruta"], steps: prep.quick },
  { id: "yogur-avena", name: "Yogur con avena y maní", type: "Merienda", kcal: 390, protein: 21, carbs: 44, fats: 15, ingredients: ["200 g de yogur", "35 g de avena", "20 g de maní"], steps: prep.bowl },
  { id: "tortilla", name: "Tortilla de papa y ensalada", type: "Cena", kcal: 560, protein: 28, carbs: 55, fats: 25, ingredients: ["3 huevos", "250 g de papa", "Ensalada"], steps: prep.pan },
  { id: "pollo-pure", name: "Pollo con puré de calabaza", type: "Cena", kcal: 520, protein: 43, carbs: 48, fats: 15, ingredients: ["180 g de pollo", "350 g de calabaza", "Verduras"], steps: prep.pan },
  { id: "omelette", name: "Omelette de verduras y queso", type: "Cena", kcal: 440, protein: 31, carbs: 18, fats: 27, ingredients: ["3 huevos", "Verduras", "50 g de queso"], steps: prep.pan },
  { id: "merluza-papas", name: "Merluza al horno con papas", type: "Cena", kcal: 540, protein: 39, carbs: 58, fats: 16, ingredients: ["200 g de merluza", "250 g de papa", "Limón y ensalada"], steps: prep.oven },
  { id: "hamburguesa-casera", name: "Hamburguesa casera al plato", type: "Cena", kcal: 590, protein: 41, carbs: 54, fats: 22, ingredients: ["180 g de carne magra", "Arroz o papas", "Ensalada"], steps: prep.pan },
  { id: "fideos-atun", name: "Fideos con atún y tomate", type: "Cena", kcal: 570, protein: 34, carbs: 76, fats: 14, ingredients: ["90 g de fideos secos", "1 lata de atún", "Tomate triturado"], steps: prep.pot }
];

export const academyCourses = [
  { id: "fuerza-base", title: "Fundamentos de fuerza", subtitle: "Entrená con criterio, no por castigo.", image: "academy-archive.webp", lessons: [
    { title: "Esfuerzo y repeticiones en reserva", minutes: 18, sections: [{ h: "La idea", p: "Una serie útil se acerca al límite sin necesitar llegar siempre al fallo. Dejar dos repeticiones posibles suele dar un estímulo fuerte con menos fatiga." }, { h: "Cómo usarlo", p: "Al terminar una serie preguntate cuántas repeticiones limpias podrías haber hecho. Empezá dejando dos o tres. Si la técnica se rompe, la serie ya terminó." }, { h: "Aplicación", p: "Anotá RPE y repeticiones por serie. Cuando completes el máximo del rango dos sesiones seguidas, subí una carga pequeña." }], quiz: { q: "¿Cuándo conviene subir la carga?", options: ["Cada sesión", "Al dominar el rango con técnica estable", "Sólo al llegar al fallo"], correct: 1 } },
    { title: "Progresión doble", minutes: 16, sections: [{ h: "Elegí un rango", p: "Usá por ejemplo 8 a 12 repeticiones. La carga se mantiene mientras progresan las repeticiones." }, { h: "Subí con paciencia", p: "Cuando todas las series llegan al extremo alto, aumentá el peso mínimo disponible y volvé al extremo bajo." }], quiz: { q: "En un rango 8–12, ¿qué hacés al completar 12 en todas las series?", options: ["Bajar peso", "Agregar diez series", "Subir una carga pequeña"], correct: 2 } },
    { title: "Técnica repetible", minutes: 20, sections: [{ h: "Consistencia", p: "Una buena técnica es segura, estable y repetible. No necesita verse idéntica entre personas." }, { h: "Control", p: "Filmá una serie lateral y compará profundidad, recorrido y velocidad. Si cambia demasiado, ajustá carga o repeticiones." }], quiz: { q: "¿Qué señal indica que la serie debería terminar?", options: ["La técnica cambia mucho", "Sentís calor", "La música termina"], correct: 0 } }
  ]},
  { id: "nutricion-base", title: "Nutrición sin complicaciones", subtitle: "Comidas normales, porciones claras y constancia.", image: "academy-archive.webp", lessons: [
    { title: "El plato base", minutes: 15, sections: [{ h: "Estructura", p: "Combiná proteína, carbohidrato, verduras o fruta y una cantidad moderada de grasa. No necesitás alimentos perfectos." }, { h: "Ajuste", p: "Observá hambre, energía y tendencia de peso durante varias semanas. Un solo día no alcanza para evaluar el plan." }], quiz: { q: "¿Qué dato sirve más para ajustar porciones?", options: ["Un día aislado", "La tendencia de varias semanas", "Una comida libre"], correct: 1 } },
    { title: "Preparación mínima semanal", minutes: 19, sections: [{ h: "Componentes", p: "Dejá listas dos proteínas, un carbohidrato y verduras lavadas. Después combiná, no cocines siete menús complejos." }, { h: "Plan de emergencia", p: "Conservá opciones simples: huevos, atún, arroz, yogur, fruta y vegetales congelados." }], quiz: { q: "¿Qué hace sostenible la preparación?", options: ["Cocinar recetas complejas", "Preparar componentes reutilizables", "Eliminar todos los gustos"], correct: 1 } },
    { title: "Recetas exclusivas rápidas", minutes: 22, exclusive: true, sections: [{ h: "Objetivo", p: "Seis combinaciones simples permiten variar sin convertir la cocina en un segundo trabajo." }, { h: "Método", p: "Elegí una base, una proteína y dos vegetales. Cambiá condimentos para crear variedad con los mismos ingredientes." }], quiz: { q: "¿Qué conviene variar primero?", options: ["Los condimentos y combinaciones", "Todo el supermercado", "Sólo las calorías"], correct: 0 } }
  ]},
  { id: "disciplina", title: "Disciplina aplicable", subtitle: "Diseñá un entorno que reduzca decisiones.", image: "academy-archive.webp", lessons: [
    { title: "La versión mínima", minutes: 12, sections: [{ h: "No romper la identidad", p: "Cada misión necesita una versión mínima para días difíciles. Diez minutos sostienen el hábito aunque no reemplacen una sesión completa." }, { h: "Regla", p: "Usá la versión mínima como excepción consciente, no como nueva meta permanente." }], quiz: { q: "¿Para qué sirve la versión mínima?", options: ["Reemplazar siempre el objetivo", "Sostener la conducta en un día difícil", "Ganar más XP"], correct: 1 } },
    { title: "Preparar la siguiente acción", minutes: 14, sections: [{ h: "Menos fricción", p: "Antes de cerrar el día, dejá visible la primera acción de mañana: ropa preparada, botella llena o documento abierto." }, { h: "Inicio claro", p: "La motivación suele aparecer después de empezar. Hacé que el comienzo sea obvio y corto." }], quiz: { q: "¿Qué reduce más la fricción?", options: ["Esperar inspiración", "Preparar la primera acción", "Agregar objetivos"], correct: 1 } },
    { title: "Recuperarse de un fallo", minutes: 17, sections: [{ h: "Sin dramatizar", p: "Un fallo es información. Identificá el obstáculo concreto, reducí fricción y retomá en la siguiente oportunidad." }, { h: "Límite", p: "La penalización nunca debe causar lesión ni empeorar una relación problemática con el ejercicio o la comida." }], quiz: { q: "¿Cuál es la respuesta útil a un fallo?", options: ["Duplicar castigos", "Abandonar la semana", "Detectar el obstáculo y retomar"], correct: 2 } }
  ]}
];

export const routineTemplate = [
  { day: "Lunes", title: "Fuerza A", exercises: [{ exerciseId: "sentadilla", sets: 3, reps: "8–12" }, { exerciseId: "flexiones", sets: 3, reps: "6–12" }, { exerciseId: "remo-banda", sets: 3, reps: "10–15" }, { exerciseId: "plancha", sets: 3, reps: "25–40 s" }] },
  { day: "Miércoles", title: "Fuerza B", exercises: [{ exerciseId: "zancadas", sets: 3, reps: "8–12/lado" }, { exerciseId: "press-hombros", sets: 3, reps: "8–12" }, { exerciseId: "remo-mancuerna", sets: 3, reps: "8–12/lado" }, { exerciseId: "dead-bug", sets: 3, reps: "8–12/lado" }] },
  { day: "Viernes", title: "Fuerza C", exercises: [{ exerciseId: "peso-muerto-rumano", sets: 3, reps: "8–12" }, { exerciseId: "press-mancuernas", sets: 3, reps: "8–12" }, { exerciseId: "puente-gluteos", sets: 3, reps: "12–15" }, { exerciseId: "bird-dog", sets: 3, reps: "8–12/lado" }] },
  { day: "Sábado", title: "Condición", exercises: [{ exerciseId: "caminata", sets: 1, reps: "25–40 min" }, { exerciseId: "sentadilla", sets: 3, reps: "12–15" }, { exerciseId: "flexiones", sets: 3, reps: "6–12" }, { exerciseId: "dead-bug", sets: 3, reps: "10/lado" }] },
  { day: "Domingo", title: "Movilidad y base", exercises: [{ exerciseId: "caminata", sets: 1, reps: "20 min" }, { exerciseId: "puente-gluteos", sets: 3, reps: "15" }, { exerciseId: "bird-dog", sets: 3, reps: "10/lado" }, { exerciseId: "plancha", sets: 3, reps: "30 s" }] }
];

export const weeklyMealTemplate = [
  ["avena-banana", "pollo-arroz", "tostadas-queso", "omelette"],
  ["huevos-tostadas", "carne-papas", "licuado", "pollo-pure"],
  ["yogur-fruta", "lentejas", "sandwich-pollo", "merluza-papas"],
  ["tostadas-avena", "atun-arroz", "yogur-avena", "tortilla"],
  ["avena-banana", "pasta-bolonesa", "tostadas-queso", "hamburguesa-casera"],
  ["huevos-tostadas", "arroz-huevos", "licuado", "fideos-atun"],
  ["yogur-fruta", "pollo-arroz", "sandwich-pollo", "pollo-pure"]
];

export const defaultMealPlan = weeklyMealTemplate[0];
