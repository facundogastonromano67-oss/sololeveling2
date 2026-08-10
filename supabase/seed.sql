-- Catálogos base. Se puede ejecutar varias veces sin duplicar filas.
insert into public.mission_templates(slug,template_type,title,description,category,target_value,unit,base_xp,difficulty,sort_order) values
('training-session','user','Completar la sesión de entrenamiento','Realizá la sesión programada o su versión mínima.','entrenamiento',1,'sesión',45,2,1),
('four-meals','user','Completar cuatro comidas saludables','Registrá cuatro comidas simples con proteína y alimentos básicos.','nutrición',4,'comidas',35,2,2),
('walk-8000','user','Caminar 8.000 pasos','Acumulá movimiento durante el día.','resistencia',8000,'pasos',30,2,3),
('water-2l','user','Tomar dos litros de agua','Distribuí la hidratación durante el día.','recuperación',2,'litros',20,1,4),
('sleep-7h','user','Dormir al menos siete horas','Prepará un horario de sueño realista.','recuperación',7,'horas',30,2,5),
('read-20','user','Leer veinte minutos','Leé sin notificaciones durante veinte minutos.','enfoque',20,'minutos',25,1,6),
('plan-tomorrow','user','Planificar las tres prioridades de mañana','Definí las tres acciones que más importan.','disciplina',3,'prioridades',20,1,7),
('tidy-space','user','Ordenar el espacio principal','Dejá listo el lugar donde vas a trabajar o entrenar.','disciplina',1,'espacio',20,1,8),
('mobility-10','user','Realizar diez minutos de movilidad','Mové tobillos, caderas, columna torácica y hombros.','movilidad',10,'minutos',20,1,9),
('fruit-2','user','Comer dos porciones de fruta','Elegí frutas que te resulten fáciles de sostener.','nutrición',2,'porciones',20,1,10),
('screen-free-30','user','No usar pantallas treinta minutos antes de dormir','Creá una transición breve hacia el descanso.','recuperación',30,'minutos',25,2,11),
('notebook-page','user','Escribir una página en el cuaderno','Usá el cuaderno para pensar, recordar o descargar ideas.','enfoque',1,'página',20,1,12),
('system-focus','system','Bloque de enfoque profundo','Completá 45 minutos sin notificaciones.','enfoque',45,'minutos',70,4,1),
('system-hard-task','system','La tarea que evitás','Resolvé hoy una tarea que venís postergando.','disciplina',1,'tarea',80,5,2),
('system-technical-finish','system','Final técnico','En la última serie priorizá control y técnica perfecta.','entrenamiento',1,'serie',65,4,3),
('system-extra-walk','system','Caminata extra','Sumá 2.500 pasos por encima de tu objetivo normal.','resistencia',2500,'pasos',65,4,4),
('system-meal-prep','system','Comida preparada','Prepará con anticipación una comida simple para mañana.','nutrición',1,'comida',60,4,5),
('system-close-day','system','Cierre sin excusas','Cerrá el día y registrá un aprendizaje concreto.','disciplina',1,'cierre',60,4,6)
on conflict(slug) do update set title=excluded.title,description=excluded.description,base_xp=excluded.base_xp,published=true;

insert into public.exercise_library(slug,name,muscle_group,equipment,instructions,coaching_cues,alternatives) values
('sentadilla','Sentadilla','Piernas','Peso corporal','["Separá los pies al ancho cómodo de hombros.","Llevá la cadera atrás y abajo.","Subí empujando el suelo sin perder la postura."]','["Rodillas siguen la línea de los pies.","Bajá sólo hasta donde mantengas control."]','{sentadilla-caja,zancadas}'),
('sentadilla-caja','Sentadilla a una silla','Piernas','Silla','["Ubicate delante de una silla estable.","Tocá el asiento con control.","Volvé a ponerte de pie sin impulso."]','["Usá la silla como referencia, no para dejarte caer."]','{sentadilla}'),
('flexiones','Flexiones','Pecho','Peso corporal','["Apoyá manos apenas más anchas que hombros.","Mantené el cuerpo firme.","Bajá el pecho y empujá el suelo."]','["Codos a 30–45 grados.","No hundas la zona lumbar."]','{flexiones-inclinadas,press-mancuernas}'),
('flexiones-inclinadas','Flexiones inclinadas','Pecho','Banco o mesa','["Apoyá manos en una superficie firme.","Formá una línea recta con el cuerpo.","Acercá el pecho y empujá."]','["Cuanto más alta la superficie, más fácil."]','{flexiones}'),
('remo-banda','Remo con banda','Espalda','Banda','["Fijá la banda a una altura segura.","Llevá codos hacia atrás.","Volvé lentamente."]','["Hombros lejos de las orejas."]','{remo-mancuerna}'),
('remo-mancuerna','Remo a una mano','Espalda','Mancuerna','["Apoyá una mano en un banco.","Tirá la mancuerna hacia la cadera.","Bajá sin girar el torso."]','["No eleves el hombro."]','{remo-banda}'),
('zancadas','Zancadas alternas','Piernas','Peso corporal','["Da un paso estable.","Bajá la rodilla trasera.","Empujá con la pierna delantera para volver."]','["Mantené el pie delantero completo apoyado."]','{sentadilla}'),
('puente-gluteos','Puente de glúteos','Glúteos','Peso corporal','["Acostate con rodillas flexionadas.","Elevá la cadera.","Pausá y bajá lentamente."]','["Terminá con glúteos, no arqueando la espalda."]','{peso-muerto-rumano}'),
('peso-muerto-rumano','Peso muerto rumano','Posterior','Mancuernas','["Sostené la carga cerca del cuerpo.","Llevá la cadera atrás.","Volvé extendiendo la cadera."]','["Espalda neutra y rodillas suaves."]','{puente-gluteos}'),
('plancha','Plancha frontal','Core','Peso corporal','["Apoyá antebrazos y puntas de pies.","Alineá hombros, cadera y tobillos.","Respirá manteniendo tensión."]','["Costillas abajo y glúteos activos."]','{dead-bug}'),
('dead-bug','Dead bug','Core','Peso corporal','["Acostate con brazos arriba y rodillas a 90°.","Extendé brazo y pierna opuestos.","Volvé y alterná."]','["La espalda baja permanece apoyada."]','{bird-dog}'),
('bird-dog','Bird dog','Core','Peso corporal','["Comenzá en cuatro apoyos.","Extendé brazo y pierna opuestos.","Volvé sin mover la pelvis."]','["Alcanzá largo, no alto."]','{dead-bug}'),
('press-mancuernas','Press con mancuernas','Pecho','Mancuernas','["Apoyá espalda y pies.","Bajá las mancuernas con control.","Empujá sin chocarlas."]','["Mantené muñecas sobre codos."]','{flexiones}'),
('press-hombros','Press de hombros','Hombros','Mancuernas','["Comenzá con las cargas a la altura de hombros.","Empujá hacia arriba.","Bajá con control."]','["Evitá arquear la zona lumbar."]','{flexiones-inclinadas}'),
('elevaciones-laterales','Elevaciones laterales','Hombros','Mancuernas','["Sostené cargas livianas.","Elevá brazos hacia los lados.","Bajá lentamente."]','["Frená antes de encoger hombros."]','{press-hombros}'),
('curl-biceps','Curl de bíceps','Brazos','Mancuernas','["Mantené codos junto al cuerpo.","Flexioná sin mover el torso.","Descendé lentamente."]','["No uses impulso."]','{remo-banda}'),
('extension-triceps','Extensión de tríceps','Brazos','Banda','["Fijá la banda por encima.","Extendé los codos.","Volvé con control."]','["Los codos permanecen quietos."]','{flexiones}'),
('gemelos','Elevación de gemelos','Piernas','Peso corporal','["Apoyate para mantener equilibrio.","Subí los talones.","Pausá y bajá completo."]','["Evitá rebotar."]','{caminata}'),
('caminata','Caminata rápida','Cardio','Ninguno','["Comenzá cinco minutos suave.","Sostené un ritmo activo.","Terminá reduciendo el ritmo."]','["Deberías poder hablar en frases cortas."]','{bicicleta}'),
('bicicleta','Bicicleta','Cardio','Bicicleta','["Ajustá una altura cómoda.","Pedaleá cinco minutos suave.","Sostené el esfuerzo programado."]','["Respiración controlada y cadencia estable."]','{caminata}')
on conflict(slug) do update set instructions=excluded.instructions,coaching_cues=excluded.coaching_cues,published=true;

insert into public.recipes(slug,name,meal_type,ingredients,instructions,calories,protein_g,carbs_g,fat_g,academy_exclusive) values
('avena-banana','Avena con banana y yogur','Desayuno','["60 g de avena","1 banana","170 g de yogur natural","Canela"]','["Mezclá avena y yogur.","Agregá banana en rodajas y canela."]',430,20,68,9,false),
('huevos-tostadas','Huevos revueltos con tostadas','Desayuno','["3 huevos","2 tostadas integrales","1 tomate"]','["Cociná los huevos a fuego medio.","Serví con tostadas y tomate."]',410,24,37,18,false),
('yogur-fruta','Yogur, fruta y frutos secos','Desayuno','["200 g de yogur","1 fruta","20 g de maní o nueces"]','["Cortá la fruta.","Mezclá todo al servir."]',360,18,42,14,false),
('pollo-arroz','Pollo con arroz y verduras','Almuerzo','["180 g de pollo","1 taza de arroz cocido","Verduras"]','["Cociná el pollo por completo.","Salteá las verduras.","Serví con arroz."]',610,45,72,15,false),
('carne-papas','Carne magra con papas','Almuerzo','["170 g de carne magra","300 g de papa","Ensalada"]','["Horneá las papas.","Cociná la carne al punto seguro.","Agregá ensalada."]',650,42,65,24,false),
('lentejas','Guiso simple de lentejas','Almuerzo','["1 taza de lentejas cocidas","Verduras","1 huevo"]','["Cociná las verduras.","Agregá las lentejas y calentá.","Serví con huevo."]',560,28,77,16,false),
('atun-arroz','Ensalada de atún y arroz','Almuerzo','["1 lata de atún","1 taza de arroz","Tomate","Zanahoria"]','["Escurrí el atún.","Mezclá con arroz frío y verduras."]',520,34,68,12,false),
('pasta-bolonesa','Pasta con boloñesa simple','Almuerzo','["100 g de pasta seca","150 g de carne picada magra","Salsa de tomate"]','["Herví la pasta.","Cociná bien la carne.","Agregá salsa y combiná."]',690,39,88,20,false),
('sandwich-pollo','Sándwich completo de pollo','Merienda','["Pan integral","120 g de pollo cocido","Queso","Tomate","Hojas verdes"]','["Cortá el pollo cocido.","Armá el sándwich con los vegetales."]',470,35,48,15,false),
('licuado','Licuado de leche, banana y avena','Merienda','["300 ml de leche","1 banana","40 g de avena"]','["Licuá todos los ingredientes hasta que quede uniforme."]',420,19,67,10,false),
('tostadas-queso','Tostadas con queso y fruta','Merienda','["2 tostadas","60 g de queso fresco","1 fruta"]','["Tostá el pan.","Serví con queso y fruta."]',380,18,48,13,false),
('tortilla','Tortilla de papa y ensalada','Cena','["3 huevos","250 g de papa","Ensalada"]','["Cociná la papa en cubos.","Agregá huevo batido.","Cociná ambos lados y serví con ensalada."]',560,28,55,25,false),
('pollo-pure','Pollo con puré de calabaza','Cena','["180 g de pollo","350 g de calabaza","Verduras"]','["Horneá o herví la calabaza.","Pisá y condimentá.","Serví con pollo bien cocido."]',520,43,52,13,false),
('omelette','Omelette de verduras y queso','Cena','["3 huevos","Verduras","50 g de queso"]','["Salteá las verduras.","Agregá huevo batido.","Sumá queso y doblá."]',440,31,18,28,false),
('merluza-papas','Merluza al horno con papas','Cena','["200 g de merluza","250 g de papa","Limón","Ensalada"]','["Horneá papas en rodajas.","Agregá merluza y cociná por completo.","Serví con limón."]',540,39,57,16,false),
('hamburguesa-casera','Hamburguesa casera al plato','Cena','["180 g de carne magra","Arroz o papas","Ensalada"]','["Formá una hamburguesa sin compactar de más.","Cociná por completo.","Serví con guarnición."]',590,41,55,21,false),
('bowl-avanzado','Bowl de garbanzos crocantes','Almuerzo','["Garbanzos","Quinoa","Vegetales","Salsa de yogur"]','["Tostá los garbanzos.","Cociná quinoa.","Armá el bowl y agregá salsa."]',610,25,88,18,true)
on conflict(slug) do update set ingredients=excluded.ingredients,instructions=excluded.instructions,published=true;

insert into public.courses(slug,title,description,price_cents) values
('fuerza-base','Fundamentos de fuerza','Esfuerzo, técnica y progresión sin complicaciones.',499),
('nutricion-base','Nutrición sin complicaciones','Comidas normales, porciones claras y preparación mínima.',399),
('disciplina','Disciplina aplicable','Sistemas concretos para sostener acciones.',299)
on conflict(slug) do update set title=excluded.title,description=excluded.description,published=true;

insert into public.lessons(course_id,position,title,duration_minutes,content,action_step,preview)
select c.id,v.position,v.title,v.duration,v.content,v.action,v.preview from public.courses c join (values
('fuerza-base',1,'Esfuerzo y repeticiones en reserva',18,'Una serie útil se acerca al límite sin necesitar llegar siempre al fallo. Empezá dejando dos o tres repeticiones posibles. Si completás todas las series con técnica estable durante dos sesiones, aumentá una repetición o una carga pequeña.','En tu próxima sesión anotá cuántas repeticiones creés que quedaban.',true),
('fuerza-base',2,'Progresión simple',16,'Elegí un rango, por ejemplo 8 a 12 repeticiones. Mantené el peso hasta alcanzar el extremo alto en todas las series. Después subí la carga mínima disponible y volvé al extremo bajo.','Elegí un ejercicio y definí hoy su rango de repeticiones.',false),
('fuerza-base',3,'Técnica repetible',20,'La mejor técnica es segura, estable y repetible. Filmá una serie lateral y compará profundidad, velocidad y control. Si la forma cambia demasiado, la serie terminó aunque todavía puedas mover el peso.','Filmá una serie con una carga moderada y anotá una mejora.',false),
('nutricion-base',1,'El plato base',15,'Armá la mayoría de tus comidas con una fuente de proteína, una porción de carbohidrato, verduras o fruta y una cantidad moderada de grasa. Ajustá cantidades según hambre, objetivo y progreso de varias semanas.','Armá una comida usando las cuatro partes del plato base.',true),
('nutricion-base',2,'Preparación mínima semanal',19,'Dejá listas dos proteínas, un carbohidrato y verduras lavadas. No necesitás cocinar siete platos distintos: necesitás componentes simples que puedas combinar cuando tengas poco tiempo.','Elegí tres componentes para preparar esta semana.',false),
('disciplina',1,'La versión mínima',12,'Cada misión debe tener una versión mínima para días difíciles. Diez minutos de entrenamiento mantienen la identidad y evitan que un mal día se convierta en una semana perdida.','Definí la versión mínima de una misión importante.',true),
('disciplina',2,'Preparar la siguiente acción',14,'Antes de cerrar el día, dejá visible la primera acción de mañana: ropa preparada, botella llena, documento abierto o comida lista. La motivación mejora cuando el inicio cuesta menos.','Prepará ahora la primera acción de mañana.',false)
) as v(course_slug,position,title,duration,content,action,preview) on c.slug=v.course_slug
on conflict(course_id,position) do update set title=excluded.title,content=excluded.content,action_step=excluded.action_step,published=true;
