export const missionTemplates = [
  { title: "Completar la sesión de entrenamiento", category: "entrenamiento", target: 1, unit: "sesión", xp: 45 },
  { title: "Completar cuatro comidas saludables", category: "nutrición", target: 4, unit: "comidas", xp: 35 },
  { title: "Caminar 8.000 pasos", category: "resistencia", target: 8000, unit: "pasos", xp: 30 },
  { title: "Tomar dos litros de agua", category: "recuperación", target: 2, unit: "litros", xp: 20 },
  { title: "Dormir al menos siete horas", category: "recuperación", target: 7, unit: "horas", xp: 30 },
  { title: "Leer veinte minutos", category: "enfoque", target: 20, unit: "minutos", xp: 25 },
  { title: "Planificar las tres prioridades de mañana", category: "disciplina", target: 3, unit: "prioridades", xp: 20 },
  { title: "Ordenar el espacio principal", category: "disciplina", target: 1, unit: "espacio", xp: 20 },
  { title: "Realizar diez minutos de movilidad", category: "movilidad", target: 10, unit: "minutos", xp: 20 },
  { title: "Comer dos porciones de fruta", category: "nutrición", target: 2, unit: "porciones", xp: 20 },
  { title: "No usar pantallas treinta minutos antes de dormir", category: "recuperación", target: 30, unit: "minutos", xp: 25 },
  { title: "Escribir una página en el cuaderno", category: "enfoque", target: 1, unit: "página", xp: 20 }
];

export const systemMissionTemplates = [
  { title: "Bloque de enfoque profundo", description: "Completá 45 minutos sin notificaciones.", category: "enfoque", target: 45, unit: "minutos", xp: 70 },
  { title: "La tarea que evitás", description: "Resolvé hoy una tarea que venís postergando.", category: "disciplina", target: 1, unit: "tarea", xp: 80 },
  { title: "Final técnico", description: "En la última serie priorizá control y técnica perfecta.", category: "entrenamiento", target: 1, unit: "serie", xp: 65 },
  { title: "Caminata extra", description: "Sumá 2.500 pasos por encima de tu objetivo normal.", category: "resistencia", target: 2500, unit: "pasos", xp: 65 },
  { title: "Comida preparada", description: "Prepará con anticipación una comida simple para mañana.", category: "nutrición", target: 1, unit: "comida", xp: 60 },
  { title: "Cierre sin excusas", description: "Cerrá el día y registrá un aprendizaje concreto.", category: "disciplina", target: 1, unit: "cierre", xp: 60 }
];

export const exercises = [
  { id: "sentadilla", name: "Sentadilla", group: "Piernas", equipment: "Peso corporal", cue: "Rodillas siguen la línea de los pies; bajá con control." },
  { id: "flexiones", name: "Flexiones", group: "Pecho", equipment: "Peso corporal", cue: "Cuerpo firme, pecho hacia el suelo, codos a 30–45°." },
  { id: "remo-banda", name: "Remo con banda", group: "Espalda", equipment: "Banda", cue: "Llevá los codos atrás sin elevar los hombros." },
  { id: "zancadas", name: "Zancadas alternas", group: "Piernas", equipment: "Peso corporal", cue: "Paso estable y rodilla trasera hacia el suelo." },
  { id: "puente-gluteos", name: "Puente de glúteos", group: "Glúteos", equipment: "Peso corporal", cue: "Terminá apretando glúteos, sin arquear la espalda." },
  { id: "plancha", name: "Plancha frontal", group: "Core", equipment: "Peso corporal", cue: "Costillas hacia abajo y glúteos activos." },
  { id: "press-mancuernas", name: "Press con mancuernas", group: "Pecho", equipment: "Mancuernas", cue: "Bajá controlado y mantené los pies firmes." },
  { id: "remo-mancuerna", name: "Remo a una mano", group: "Espalda", equipment: "Mancuerna", cue: "Tirá hacia la cadera sin girar el torso." },
  { id: "peso-muerto-rumano", name: "Peso muerto rumano", group: "Posterior", equipment: "Mancuernas", cue: "Cadera atrás, espalda neutra y carga cerca del cuerpo." },
  { id: "press-hombros", name: "Press de hombros", group: "Hombros", equipment: "Mancuernas", cue: "No arquees la zona lumbar; subí en línea controlada." },
  { id: "elevaciones-laterales", name: "Elevaciones laterales", group: "Hombros", equipment: "Mancuernas", cue: "Usá poco peso y frená antes de encoger los hombros." },
  { id: "curl-biceps", name: "Curl de bíceps", group: "Brazos", equipment: "Mancuernas", cue: "Codos quietos y descenso lento." },
  { id: "extension-triceps", name: "Extensión de tríceps", group: "Brazos", equipment: "Banda", cue: "Fijá los codos y extendé sin impulso." },
  { id: "gemelos", name: "Elevación de gemelos", group: "Piernas", equipment: "Peso corporal", cue: "Subí completo, pausá arriba y bajá lento." },
  { id: "dead-bug", name: "Dead bug", group: "Core", equipment: "Peso corporal", cue: "Espalda baja apoyada mientras extendés brazo y pierna." },
  { id: "bird-dog", name: "Bird dog", group: "Core", equipment: "Peso corporal", cue: "No gires la cadera; alcanzá largo y controlado." },
  { id: "caminata", name: "Caminata rápida", group: "Cardio", equipment: "Ninguno", cue: "Ritmo que permita hablar en frases cortas." },
  { id: "bicicleta", name: "Bicicleta", group: "Cardio", equipment: "Bicicleta", cue: "Esfuerzo sostenido y respiración controlada." }
];

export const meals = [
  { id: "avena-banana", name: "Avena con banana y yogur", type: "Desayuno", kcal: 430, protein: 20, ingredients: ["60 g de avena", "1 banana", "170 g de yogur natural", "Canela"] },
  { id: "huevos-tostadas", name: "Huevos revueltos con tostadas", type: "Desayuno", kcal: 410, protein: 24, ingredients: ["3 huevos", "2 tostadas integrales", "1 tomate"] },
  { id: "yogur-fruta", name: "Yogur, fruta y frutos secos", type: "Desayuno", kcal: 360, protein: 18, ingredients: ["200 g de yogur", "1 fruta", "20 g de maní o nueces"] },
  { id: "pollo-arroz", name: "Pollo con arroz y verduras", type: "Almuerzo", kcal: 610, protein: 45, ingredients: ["180 g de pollo", "1 taza de arroz cocido", "Verduras salteadas"] },
  { id: "carne-papas", name: "Carne magra con papas", type: "Almuerzo", kcal: 650, protein: 42, ingredients: ["170 g de carne magra", "300 g de papa", "Ensalada"] },
  { id: "lentejas", name: "Guiso simple de lentejas", type: "Almuerzo", kcal: 560, protein: 28, ingredients: ["1 taza de lentejas", "Verduras", "1 huevo"] },
  { id: "atun-arroz", name: "Ensalada de atún y arroz", type: "Almuerzo", kcal: 520, protein: 34, ingredients: ["1 lata de atún", "1 taza de arroz", "Tomate y zanahoria"] },
  { id: "pasta-bolonesa", name: "Pasta con salsa boloñesa simple", type: "Almuerzo", kcal: 690, protein: 39, ingredients: ["100 g de pasta seca", "150 g de carne picada magra", "Salsa de tomate"] },
  { id: "sandwich-pollo", name: "Sándwich completo de pollo", type: "Merienda", kcal: 470, protein: 35, ingredients: ["Pan integral", "120 g de pollo", "Queso", "Tomate y hojas verdes"] },
  { id: "licuado", name: "Licuado de leche, banana y avena", type: "Merienda", kcal: 420, protein: 19, ingredients: ["300 ml de leche", "1 banana", "40 g de avena"] },
  { id: "tostadas-queso", name: "Tostadas con queso y fruta", type: "Merienda", kcal: 380, protein: 18, ingredients: ["2 tostadas", "60 g de queso fresco", "1 fruta"] },
  { id: "tortilla", name: "Tortilla de papa y ensalada", type: "Cena", kcal: 560, protein: 28, ingredients: ["3 huevos", "250 g de papa", "Ensalada"] },
  { id: "pollo-pure", name: "Pollo con puré de calabaza", type: "Cena", kcal: 520, protein: 43, ingredients: ["180 g de pollo", "350 g de calabaza", "Verduras"] },
  { id: "omelette", name: "Omelette de verduras y queso", type: "Cena", kcal: 440, protein: 31, ingredients: ["3 huevos", "Verduras", "50 g de queso"] },
  { id: "merluza-papas", name: "Merluza al horno con papas", type: "Cena", kcal: 540, protein: 39, ingredients: ["200 g de merluza", "250 g de papa", "Limón y ensalada"] },
  { id: "hamburguesa-casera", name: "Hamburguesa casera al plato", type: "Cena", kcal: 590, protein: 41, ingredients: ["180 g de carne magra", "Arroz o papas", "Ensalada"] }
];

export const academyCourses = [
  {
    id: "fuerza-base", title: "Fundamentos de fuerza", subtitle: "Entrená con criterio, no por castigo.", image: "academy-archive.webp",
    lessons: [
      { title: "Esfuerzo y repeticiones en reserva", minutes: 18, body: "Una serie útil se acerca al límite sin necesitar llegar siempre al fallo. Empezá dejando dos o tres repeticiones posibles. Si completás todas las series con técnica estable durante dos sesiones, aumentá una repetición o una carga pequeña." },
      { title: "Progresión simple", minutes: 16, body: "Elegí un rango, por ejemplo 8 a 12 repeticiones. Mantené el peso hasta alcanzar el extremo alto en todas las series. Después subí la carga mínima disponible y volvé al extremo bajo." },
      { title: "Técnica que se puede repetir", minutes: 20, body: "La mejor técnica es segura, estable y repetible. Filmá una serie lateral, compará profundidad, velocidad y control. Si la forma cambia mucho, la serie terminó aunque todavía puedas mover el peso." }
    ]
  },
  {
    id: "nutricion-base", title: "Nutrición sin complicaciones", subtitle: "Comidas normales, porciones claras y constancia.", image: "academy-archive.webp",
    lessons: [
      { title: "El plato base", minutes: 15, body: "Armá la mayoría de tus comidas con una fuente de proteína, una porción de carbohidrato, verduras o fruta y una cantidad moderada de grasa. Ajustá cantidades según hambre, objetivo y progreso de varias semanas." },
      { title: "Preparación mínima semanal", minutes: 19, body: "Dejá listas dos proteínas, un carbohidrato y verduras lavadas. No necesitás cocinar siete platos distintos: necesitás componentes simples que puedas combinar cuando tengas poco tiempo." }
    ]
  },
  {
    id: "disciplina", title: "Disciplina aplicable", subtitle: "Diseñá un entorno que reduzca decisiones.", image: "academy-archive.webp",
    lessons: [
      { title: "La versión mínima", minutes: 12, body: "Cada misión debe tener una versión mínima para días difíciles. Diez minutos de entrenamiento mantienen la identidad y evitan que un mal día se convierta en una semana perdida." },
      { title: "Preparar la siguiente acción", minutes: 14, body: "Antes de cerrar el día, dejá visible la primera acción de mañana: ropa preparada, botella llena, documento abierto o comida lista. La motivación mejora cuando el inicio cuesta menos." }
    ]
  }
];

export const routineTemplate = [
  { day: "Lunes", title: "Fuerza A", exercises: [
    { exerciseId: "sentadilla", sets: 3, reps: "8–12" }, { exerciseId: "flexiones", sets: 3, reps: "6–12" }, { exerciseId: "remo-banda", sets: 3, reps: "10–15" }, { exerciseId: "plancha", sets: 3, reps: "25–40 s" }
  ]},
  { day: "Miércoles", title: "Fuerza B", exercises: [
    { exerciseId: "zancadas", sets: 3, reps: "8–12/lado" }, { exerciseId: "press-hombros", sets: 3, reps: "8–12" }, { exerciseId: "remo-mancuerna", sets: 3, reps: "8–12/lado" }, { exerciseId: "dead-bug", sets: 3, reps: "8–12/lado" }
  ]},
  { day: "Viernes", title: "Fuerza C", exercises: [
    { exerciseId: "peso-muerto-rumano", sets: 3, reps: "8–12" }, { exerciseId: "press-mancuernas", sets: 3, reps: "8–12" }, { exerciseId: "puente-gluteos", sets: 3, reps: "12–15" }, { exerciseId: "bird-dog", sets: 3, reps: "8–12/lado" }
  ]}
];

export const defaultMealPlan = ["avena-banana", "pollo-arroz", "tostadas-queso", "omelette"];
