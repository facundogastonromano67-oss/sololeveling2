import "./styles.css";
import { academyCourses, exercises, meals, missionTemplates } from "./data/catalog.js";
import { backend } from "./services/backend.js";
import {
  addMissionLocal, closeDayLocal, completeMissionLocal, exerciseById, generateLocalPlan,
  loadLocalState, logMealLocal, logWorkoutLocal, mealById, resetLocalState, saveLocalState,
  saveNoteLocal, today, updateMissionLocal
} from "./services/local-store.js";

let state = loadLocalState();
let currentView = "inicio";
let session = null;
const demoAccess = String(import.meta.env.VITE_DEMO_FULL_ACCESS ?? "true") === "true";
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const selectedDay = () => ((new Date().getDay() + 6) % 7) + 1;
const isDone = mission => mission.completedOn?.includes(today());
const fullAccess = () => Boolean(state.profile.premium || (!backend.configured && demoAccess));
const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;

function toast(message, danger = false) {
  const node = document.querySelector("#toast");
  node.textContent = message; node.classList.toggle("danger", danger); node.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { node.hidden = true; }, 3000);
}

function progress() {
  const daily = state.missions.filter(m => m.weekdays?.includes(selectedDay()));
  const done = daily.filter(isDone).length;
  return { done, total: daily.length, percent: daily.length ? Math.round(done / daily.length * 100) : 0 };
}

function missionCard(m) {
  return `<article class="mission-card ${m.source} ${isDone(m) ? "done" : ""}">
    <button class="check" data-complete="${m.id}" aria-label="Completar ${esc(m.title)}">${isDone(m) ? "✓" : ""}</button>
    <div><header><h3>${esc(m.title)}</h3>${m.source === "system" ? "<span>SISTEMA</span>" : ""}</header>
      <p>${esc(m.description || `${m.target} ${m.unit}`)}</p>
      <footer><b>${esc(m.category)}</b><small>${isDone(m) ? "Completada hoy" : `${m.progress || 0} / ${m.target} ${esc(m.unit)}`}</small></footer>
    </div><strong class="xp">+${m.xp}<small> XP</small></strong>
    ${m.source === "user" ? `<button class="edit" data-edit-mission="${m.id}" aria-label="Editar">⋮</button>` : ""}
  </article>`;
}

function homeView() {
  const p = progress();
  const todayMissions = state.missions.filter(m => m.weekdays?.includes(selectedDay()));
  const system = todayMissions.filter(m => m.source === "system");
  const mandatory = todayMissions.filter(m => m.source === "user");
  return `<section class="view home-view">
    <article class="hero-card">
      <img src="${asset("hero-awakening.webp")}" alt="Figura frente a un portal de energía" />
      <div class="hero-copy"><small>SISTEMA G30 · DÍA ${state.profile.planDay}</small><h1>Hoy decidís si avanzás.</h1>
      <p>Tus misiones son la prioridad. Completá lo importante antes de perseguir recompensas.</p>
      <div class="hero-stats"><span><b>${state.profile.level}</b>NIVEL</span><span><b>${state.profile.xp}</b>XP</span><span><b>${p.percent}%</b>HOY</span></div></div>
    </article>
    ${state.penalties.filter(item => !item.completed).map(item => `<article class="penalty"><b>PENALIZACIÓN ACTIVA</b><strong>${esc(item.title)}</strong><span>${esc(item.description)} · −${item.xpLoss} XP aplicado</span></article>`).join("")}
    <div class="section-heading"><div><small>DESAFÍOS ADAPTATIVOS</small><h2>Misiones del Sistema</h2></div><b>${system.filter(isDone).length} / ${system.length}</b></div>
    <div class="mission-list">${system.map(missionCard).join("")}</div>
    <div class="section-heading"><div><small>SIEMPRE VISIBLES</small><h2>Misiones obligatorias</h2></div><button class="mini-button" data-modal="mission">+ AGREGAR</button></div>
    <div class="mission-list">${mandatory.map(missionCard).join("")}</div>
    <div class="quick-grid"><button data-modal="planner"><span>▦</span><b>Editar plan</b><small>Misiones y semana</small></button><button data-modal="notebook"><span>□</span><b>Cuaderno</b><small>Notas libres</small></button><button data-modal="close-day"><span>✓</span><b>Cerrar el día</b><small>Revisión y penalización</small></button></div>
  </section>`;
}

function trainingContent() {
  if (!fullAccess()) return lockedContent("La rutina de entrenamiento");
  return `<div class="routine-grid">${state.plan.routine.map((day, index) => `<article class="day-card"><header><small>${esc(day.day)}</small><h3>${esc(day.title)}</h3></header>
    <ol>${day.exercises.map(row => { const ex = exerciseById(row.exerciseId); return `<li><span><b>${esc(ex?.name || row.exerciseId)}</b><small>${esc(ex?.cue || "")}</small></span><strong>${row.sets} × ${esc(row.reps)}</strong></li>`; }).join("")}</ol>
    <button class="secondary" data-workout="${index}">REGISTRAR SESIÓN</button></article>`).join("")}</div>`;
}

function nutritionContent() {
  if (!fullAccess()) return lockedContent("El plan de alimentación");
  return `<p class="health-note">Porciones orientativas. Ajustá cantidades según tu hambre, progreso y la indicación de un profesional. Revisá alergias y restricciones.</p>
    <div class="meal-grid">${state.plan.mealIds.map(id => { const meal = mealById(id); if (!meal) return ""; const logged = state.mealLogs.some(log => log.mealId === id && log.date === today()); return `<article class="meal-card ${logged ? "logged" : ""}"><small>${esc(meal.type)}</small><h3>${esc(meal.name)}</h3><div><span>${meal.kcal} kcal</span><span>${meal.protein} g proteína</span></div><ul>${meal.ingredients.map(i => `<li>${esc(i)}</li>`).join("")}</ul><button class="secondary" data-meal="${meal.id}">${logged ? "REGISTRADA ✓" : "REGISTRAR COMIDA"}</button></article>`; }).join("")}</div>`;
}

function lockedContent(name) {
  return `<article class="locked"><b>${name} está disponible con Premium</b><p>La versión gratuita mantiene misiones ilimitadas. Premium desbloquea rutina, alimentación y elimina anuncios.</p><button class="primary" data-view-target="tienda">VER PREMIUM · USD 1,99/MES</button></article>`;
}

function planView() {
  return `<section class="view"><header class="page-title"><small>CICLO ACTIVO · MODO ${state.profile.mode === "intensive" ? "INTENSIVO" : "FLEXIBLE"}</small><h1>Plan G30</h1><p>Todo el plan en una pantalla, organizado en secciones comprimibles.</p></header>
    <details open><summary><span>01</span><div><b>Plan personal</b><small>Misiones y calendario semanal</small></div><i>⌄</i></summary><div class="detail-body"><p>Tenés ${state.missions.filter(m => m.source === "user").length} misiones obligatorias y 3 desafíos del Sistema.</p><button class="secondary" data-modal="planner">REVISAR Y EDITAR PLAN</button></div></details>
    <details open><summary><span>02</span><div><b>Entrenamiento</b><small>${fullAccess() ? `${state.plan.routine.length} sesiones por semana` : "Premium"}</small></div><i>⌄</i></summary><div class="detail-body">${trainingContent()}</div></details>
    <details><summary><span>03</span><div><b>Alimentación</b><small>${fullAccess() ? `${state.plan.mealIds.length} comidas simples` : "Premium"}</small></div><i>⌄</i></summary><div class="detail-body">${nutritionContent()}</div></details>
  </section>`;
}

function academyView() {
  return `<section class="view"><header class="page-title"><small>CONOCIMIENTO APLICABLE</small><h1>Academia</h1><p>Clases detalladas para aprender en serio. El conocimiento no entrega XP: sirve cuando lo aplicás.</p></header>
    <article class="academy-hero"><img src="${asset("academy-archive.webp")}" alt="Archivo futurista de conocimiento"/><div><small>CLASE RECOMENDADA · 18 MIN</small><h2>Esfuerzo y repeticiones en reserva</h2><p>Aprendé cuándo una serie es útil y cómo progresar sin entrenar al fallo siempre.</p><button class="primary" data-lesson="fuerza-base:0">COMENZAR CLASE</button></div></article>
    <div class="course-grid">${academyCourses.map(course => `<article class="course"><img src="${asset(course.image)}" alt=""/><div><small>${course.lessons.length} CLASES</small><h3>${course.title}</h3><p>${course.subtitle}</p><button class="secondary" data-lesson="${course.id}:0">ABRIR CURSO</button></div></article>`).join("")}</div>
  </section>`;
}

function storeView() {
  return `<section class="view"><header class="page-title"><small>ACCESO Y CONTENIDO</small><h1>Tienda</h1><p>El pago real todavía está desactivado hasta conectar Stripe de forma segura.</p></header>
    <article class="premium-card"><div><small>G30 PREMIUM</small><h2>Rutina + alimentación<br/>sin anuncios</h2><p>La versión gratuita conserva las misiones diarias de forma ilimitada.</p></div><div><strong>USD 1,99</strong><span>/ mes</span><button class="primary" disabled>PRÓXIMAMENTE</button></div></article>
    <div class="fair"><b>REGLA DE JUEGO LIMPIO</b><p>No se puede comprar XP, rangos, rachas ni resultados competitivos.</p></div>
  </section>`;
}

function profileView() {
  return `<section class="view"><article class="profile-card"><div class="avatar">${esc(state.profile.displayName).slice(0, 2).toUpperCase()}</div><div><small>RANGO E · NIVEL ${state.profile.level}</small><h1>${esc(state.profile.displayName)}</h1><p>${session ? esc(session.user.email) : "Perfil local de desarrollo"}</p></div><button class="secondary" data-modal="auth">${session ? "CUENTA" : "INICIAR SESIÓN"}</button></article>
    <div class="stat-grid"><article><small>XP TOTAL</small><b>${state.profile.xp}</b></article><article><small>HOY</small><b>${progress().percent}%</b></article><article><small>ENTRENAMIENTOS</small><b>${state.workoutSessions.length}</b></article><article><small>NOTAS</small><b>${state.notes.length}</b></article></div>
    <article class="profile-section"><h2>Últimos entrenamientos</h2>${state.workoutSessions.length ? state.workoutSessions.slice(0, 5).map(item => `<div class="history"><span><b>${esc(item.title)}</b><small>${esc(item.date || item.started_at?.slice(0, 10))}</small></span><strong>${item.durationMinutes || item.duration_minutes || 0} min</strong></div>`).join("") : "<p>Todavía no registraste una sesión.</p>"}</article>
    <article class="profile-section"><h2>Cuaderno</h2><p>Recordatorios, diario íntimo, ideas o cualquier texto privado.</p><button class="secondary" data-modal="notebook">ABRIR CUADERNO</button></article>
    <article class="profile-section settings"><h2>Desarrollo</h2><p>${backend.configured ? "Backend Supabase configurado." : "Usando datos locales. Configurá Supabase para sincronizar entre dispositivos."}</p><button class="danger-button" id="reset-local">REINICIAR DATOS LOCALES</button></article>
  </section>`;
}

function render() {
  const views = { inicio: homeView, plan: planView, academia: academyView, tienda: storeView, perfil: profileView };
  document.querySelector("#app").innerHTML = `<div class="ambient"></div><header class="topbar"><button class="brand" data-view-target="inicio"><span>G30</span><div><b>SISTEMA</b><small>${backend.configured ? (session ? "NUBE ACTIVA" : "CONECTAR CUENTA") : "MODO LOCAL"}</small></div></button><button class="account" data-modal="auth">${session ? esc(state.profile.displayName) : "INICIAR SESIÓN"}</button></header>
    <main>${views[currentView]()}</main>
    <div class="floating"><button data-modal="assistant">✦<small>ASISTENTE</small></button><button data-modal="arena">⚔<small>ARENA</small></button></div>
    <nav class="bottom-nav">${[["inicio","⌂","Inicio"],["plan","▣","Plan G30"],["academia","◇","Academia"],["tienda","✦","Tienda"],["perfil","●","Perfil"]].map(([id,icon,label]) => `<button class="${currentView === id ? "active" : ""}" data-view-target="${id}"><span>${icon}</span><small>${label}</small></button>`).join("")}</nav>`;
  bindEvents();
}

function modalShell(title, body) {
  document.querySelector("#modal-root").innerHTML = `<div class="modal-backdrop"><section class="modal"><header><div><small>SISTEMA G30</small><h2>${title}</h2></div><button data-close>×</button></header><div class="modal-body">${body}</div></section></div>`;
  document.querySelector("[data-close]").onclick = closeModal;
  document.querySelector(".modal-backdrop").addEventListener("click", event => { if (event.target.classList.contains("modal-backdrop")) closeModal(); });
}
function closeModal() { document.querySelector("#modal-root").innerHTML = ""; }

function openModal(type, payload) {
  if (type === "auth") return authModal();
  if (type === "mission") return missionModal(payload);
  if (type === "planner") return plannerModal();
  if (type === "notebook") return notebookModal();
  if (type === "close-day") return closeDayModal();
  if (type === "arena") return arenaModal();
  if (type === "assistant") return assistantModal();
}

function authModal() {
  if (!backend.configured) return modalShell("Conectar backend", `<div class="empty-state"><b>El proyecto funciona localmente.</b><p>Para crear cuentas y sincronizar datos, seguí <code>docs/INSTALACION_SUPABASE.md</code> y completá <code>.env.local</code>.</p></div>`);
  if (session) {
    modalShell("Tu cuenta", `<p>Sesión activa como <b>${esc(session.user.email)}</b>.</p><button class="danger-button" id="sign-out">CERRAR SESIÓN</button>`);
    document.querySelector("#sign-out").onclick = async () => { await backend.signOut(); session = null; closeModal(); render(); };
    return;
  }
  modalShell("Ingresar o registrarte", `<form id="auth-form" class="form"><label>Nombre<input name="name" autocomplete="name" /></label><label>Email<input name="email" type="email" autocomplete="email" required /></label><label>Contraseña<input name="password" type="password" minlength="8" autocomplete="current-password" required /></label><div class="form-actions"><button class="secondary" type="button" id="register">CREAR CUENTA</button><button class="primary">INGRESAR</button></div></form>`);
  const form = document.querySelector("#auth-form");
  form.onsubmit = async event => { event.preventDefault(); await runAuth(() => backend.signIn(form.email.value, form.password.value)); };
  document.querySelector("#register").onclick = () => runAuth(() => backend.signUp(form.email.value, form.password.value, form.name.value || "Usuario"));
}
async function runAuth(action) { try { await action(); session = await backend.session(); if (session) await loadCloud(); closeModal(); render(); toast("Cuenta conectada"); } catch (error) { toast(error.message, true); } }

function missionModal(id) {
  const mission = state.missions.find(item => item.id === id);
  if (mission && state.profile.mode === "intensive") return modalShell("Misión bloqueada", `<div class="empty-state"><b>Modo intensivo activo</b><p>Las misiones no pueden editarse hasta terminar el ciclo.</p></div>`);
  modalShell(mission ? "Editar misión" : "Nueva misión obligatoria", `<form id="mission-form" class="form"><label>Título<input name="title" required maxlength="80" value="${esc(mission?.title || "")}"/></label><label>Descripción<input name="description" maxlength="160" value="${esc(mission?.description || "")}"/></label><div class="form-row"><label>Objetivo<input name="target" type="number" min="1" value="${mission?.target || 1}"/></label><label>Unidad<input name="unit" value="${esc(mission?.unit || "vez")}"/></label></div><label>Categoría<select name="category">${["entrenamiento","nutrición","disciplina","enfoque","recuperación","movilidad","resistencia"].map(c => `<option ${mission?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></label><fieldset><legend>Días</legend><div class="days">${["L","M","X","J","V","S","D"].map((d, i) => `<label><input type="checkbox" name="day" value="${i+1}" ${(mission?.weekdays || [1,2,3,4,5,6,7]).includes(i+1) ? "checked" : ""}/><span>${d}</span></label>`).join("")}</div></fieldset><button class="primary">${mission ? "GUARDAR CAMBIOS" : "CREAR MISIÓN"}</button></form>`);
  document.querySelector("#mission-form").onsubmit = async event => {
    event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); data.weekdays = [...form.querySelectorAll('[name="day"]:checked')].map(i => Number(i.value));
    try { if (mission) updateMissionLocal(state, id, { title: data.title, description: data.description, target: Number(data.target), unit: data.unit, category: data.category, weekdays: data.weekdays }); else { addMissionLocal(state, data); if (session) await backend.createMission(data); } closeModal(); render(); toast("Misión guardada"); } catch (error) { toast(error.message, true); }
  };
}

function plannerModal() {
  modalShell("Generar tu Plan G30", `<form id="planner-form" class="form planner"><p>Preguntas rápidas. Al generar el plan verás las misiones, ejercicios y comidas; después podrás editar cada parte en modo flexible.</p><label>¿Qué tan activo es tu trabajo?<select name="workActivity"><option>Sedentario</option><option>Mixto</option><option>Activo</option><option>Muy físico</option></select></label><label>Objetivo principal<select name="goal"><option>Ganar fuerza y músculo</option><option>Bajar grasa</option><option>Mejorar condición</option><option>Crear constancia</option></select></label><label>¿Cuántos días podés entrenar?<input name="trainingDays" type="range" min="2" max="5" value="3"/><output id="days-output">3 días</output></label><label>¿Dónde entrenás?<select name="place"><option>En casa</option><option>Gimnasio</option><option>Ambos</option></select></label><label>Restricciones o alimentos que no comés<input name="restrictions" placeholder="Ej.: sin lactosa, no como pescado"/></label><fieldset><legend>Elegí entre 4 y 15 misiones fijas</legend><div class="mission-choices">${missionTemplates.map((m,i) => `<label><input type="checkbox" name="missionTitles" value="${esc(m.title)}" ${i<6?"checked":""}/><span>${esc(m.title)}</span></label>`).join("")}</div></fieldset><fieldset><legend>Modo del ciclo</legend><div class="mode-choice"><label><input type="radio" name="mode" value="flexible" checked/><span><b>Flexible</b> Permite editar el plan.</span></label><label><input type="radio" name="mode" value="intensive"/><span><b>Intensivo</b> Bloquea misiones 30 días.</span></label></div></fieldset><button class="primary">GENERAR Y COMENZAR PLAN</button></form>`);
  const form = document.querySelector("#planner-form"); const range = form.trainingDays; range.oninput = () => document.querySelector("#days-output").textContent = `${range.value} días`;
  form.onsubmit = async event => { event.preventDefault(); const fd = new FormData(form); const titles = fd.getAll("missionTitles"); if (titles.length < 4 || titles.length > 15) return toast("Elegí entre 4 y 15 misiones", true); const evaluation = { workActivity: fd.get("workActivity"), goal: fd.get("goal"), trainingDays: Number(fd.get("trainingDays")), place: fd.get("place"), restrictions: fd.get("restrictions"), mode: fd.get("mode"), missionTitles: titles }; try { if (session) { await backend.generatePlan(evaluation); await loadCloud(); } else generateLocalPlan(state, evaluation); closeModal(); currentView="plan"; render(); toast("Plan G30 generado"); } catch (error) { toast(error.message, true); } };
}

function workoutModal(index) {
  const day = state.plan.routine[index];
  modalShell(`Registrar ${esc(day.title)}`, `<form id="workout-form" class="form"><label>Duración (minutos)<input name="duration" type="number" min="1" value="45"/></label>${day.exercises.map((row, i) => { const ex=exerciseById(row.exerciseId); return `<fieldset><legend>${esc(ex?.name)}</legend><div class="form-row triple"><label>Series<input name="sets-${i}" type="number" min="1" value="${row.sets}"/></label><label>Reps<input name="reps-${i}" value="${esc(String(row.reps).split("–")[0])}"/></label><label>Peso kg<input name="weight-${i}" type="number" min="0" step="0.5" value="0"/></label></div><small>${esc(ex?.cue)}</small></fieldset>`; }).join("")}<label>Notas<textarea name="notes" placeholder="Cómo te sentiste, técnica, molestias..."></textarea></label><button class="primary">GUARDAR ENTRENAMIENTO</button></form>`);
  document.querySelector("#workout-form").onsubmit = async event => { event.preventDefault(); const form=event.currentTarget; const fd=new FormData(form); const payload={title:day.title,durationMinutes:Number(fd.get("duration")),notes:fd.get("notes"),sets:day.exercises.map((row,i)=>({exercise_slug:row.exerciseId,set_number:1,reps:Number(fd.get(`reps-${i}`))||null,weight_kg:Number(fd.get(`weight-${i}`))||0,notes:`${fd.get(`sets-${i}`)} series`}))}; try { logWorkoutLocal(state,payload); if(session) await backend.logWorkout(payload); closeModal(); render(); toast("Entrenamiento registrado"); } catch(error){toast(error.message,true);} };
}

function notebookModal() {
  const note=state.notes[0]; modalShell("Cuaderno libre", `<form id="note-form" class="form"><label>Título<input name="title" value="${esc(note?.title || "")}" placeholder="Recordatorio, diario, ideas..."/></label><label>Escribí lo que quieras<textarea class="notebook" name="body" placeholder="Este espacio es tuyo...">${esc(note?.body || "")}</textarea></label><p class="privacy">El cuaderno no se comparte con el Asistente sin tu autorización explícita.</p><button class="primary">GUARDAR NOTA</button></form>`);
  document.querySelector("#note-form").onsubmit=async event=>{event.preventDefault();const fd=new FormData(event.currentTarget);const data={id:note?.id,title:fd.get("title"),body:fd.get("body")};try{saveNoteLocal(state,data);if(session)await backend.saveNote(data);closeModal();render();toast("Nota guardada");}catch(error){toast(error.message,true);}};
}

function closeDayModal(){const p=progress();modalShell("Cierre del día",`<form id="close-form" class="form"><div class="closing-score"><b>${p.done} / ${p.total}</b><span>misiones completadas</span></div><label>¿Qué funcionó hoy?<textarea name="reflection" placeholder="Una idea concreta para repetir mañana"></textarea></label><p class="warning">Si quedaron misiones obligatorias sin cumplir, el Sistema aplicará una pérdida limitada de XP y creará una misión de recuperación para mañana.</p><button class="primary">CONFIRMAR CIERRE</button></form>`);document.querySelector("#close-form").onsubmit=async event=>{event.preventDefault();const reflection=new FormData(event.currentTarget).get("reflection");try{const result=session?await backend.closeDay(reflection):closeDayLocal(state,reflection);closeModal();render();toast(result.missed?`Día cerrado · ${result.missed} misiones pendientes`:"Día cerrado con éxito");}catch(error){toast(error.message,true);}};}

function lessonModal(spec){const [courseId,index]=spec.split(":");const course=academyCourses.find(c=>c.id===courseId);const lesson=course?.lessons[Number(index)];if(!lesson)return;modalShell(esc(lesson.title),`<article class="lesson"><small>${lesson.minutes} MIN · ${esc(course.title)}</small><p>${esc(lesson.body)}</p><h3>Aplicación de hoy</h3><p>Anotá una acción pequeña y aplicala en tu próxima sesión o comida. La clase se considera útil cuando cambia una decisión.</p><button class="primary" data-close-lesson>CLASE LEÍDA</button></article>`);document.querySelector("[data-close-lesson]").onclick=()=>{closeModal();toast("Clase completada · sin XP, con aplicación real");};}
function arenaModal(){modalShell("Arena y Mazmorras",`<article class="dungeon"><img src="${asset("dungeon-gate.webp")}" alt="Portal de una mazmorra"/><div><small>MAZMORRA PERSONAL · RANGO E</small><h3>La Puerta de la Constancia</h3><p>Objetivo: completar 5 días seguidos con al menos 80% de misiones. Progreso actual: 1 / 5.</p><button class="primary" disabled>PRÓXIMA FASE DEL BACKEND</button></div></article><p class="privacy">Rankings, gremios y resultados competitivos se habilitarán cuando la validación del servidor esté terminada.</p>`);}
function assistantModal(){modalShell("Asistente",`<div class="empty-state"><b>El Asistente todavía no modifica tu plan.</b><p>Primero estamos asegurando cuentas y datos. La futura IA propondrá cambios y sólo los aplicará después de tu confirmación.</p></div>`);}

async function completeMission(id) { const wasDone=isDone(state.missions.find(m=>m.id===id)); try { completeMissionLocal(state,id); render(); if(session) await backend.completeMission(id); toast(wasDone?"Misión reabierta":"Misión completada"); } catch(error){ completeMissionLocal(state,id); render(); toast(error.message,true); } }
async function registerMeal(id){const meal=mealById(id);try{logMealLocal(state,id);if(session)await backend.logMeal(id,meal.name);render();toast("Comida registrada");}catch(error){toast(error.message,true);}}

function bindEvents() {
  document.querySelectorAll("[data-view-target]").forEach(button => button.onclick=()=>{currentView=button.dataset.viewTarget;render();scrollTo({top:0,behavior:"smooth"});});
  document.querySelectorAll("[data-modal]").forEach(button=>button.onclick=()=>openModal(button.dataset.modal));
  document.querySelectorAll("[data-complete]").forEach(button=>button.onclick=()=>completeMission(button.dataset.complete));
  document.querySelectorAll("[data-edit-mission]").forEach(button=>button.onclick=()=>missionModal(button.dataset.editMission));
  document.querySelectorAll("[data-workout]").forEach(button=>button.onclick=()=>workoutModal(Number(button.dataset.workout)));
  document.querySelectorAll("[data-meal]").forEach(button=>button.onclick=()=>registerMeal(button.dataset.meal));
  document.querySelectorAll("[data-lesson]").forEach(button=>button.onclick=()=>lessonModal(button.dataset.lesson));
  const reset=document.querySelector("#reset-local");if(reset)reset.onclick=()=>{if(confirm("¿Reiniciar todos los datos locales de prueba?")){state=resetLocalState();render();toast("Datos reiniciados");}};
}

async function loadCloud() {
  const cloud=await backend.loadDashboard(); if(!cloud)return;
  state.profile={...state.profile,displayName:cloud.profile.display_name,xp:cloud.profile.xp,level:cloud.profile.level,streak:cloud.profile.streak,mode:cloud.profile.mode,premium:cloud.profile.is_premium};
  if(cloud.plan){state.plan={...state.plan,active:cloud.plan.active,startDate:cloud.plan.started_on,routine:cloud.plan.training_plan?.days||state.plan.routine,mealIds:cloud.plan.nutrition_plan?.meal_ids||state.plan.mealIds};}
  state.missions=cloud.missions.map(m=>({id:m.id,title:m.title,description:m.description,category:m.category,target:Number(m.target_value),unit:m.unit,xp:m.reward_xp,source:m.source,level:m.progression_level,weekdays:m.weekdays,progress:0,completedOn:(m.mission_completions||[]).map(c=>c.completed_on),order:m.sort_order}));
  state.notes=cloud.notes.map(n=>({id:n.id,title:n.title,body:n.body,updatedAt:n.updated_at})); state.workoutSessions=cloud.workoutSessions; state.mealLogs=cloud.mealLogs.map(m=>({id:m.id,date:m.logged_at.slice(0,10),mealId:m.recipe_slug})); saveLocalState(state);
}

async function boot(){try{session=await backend.session();if(session)await loadCloud();backend.onAuthChange(async next=>{session=next;if(next){try{await loadCloud();}catch(error){toast(error.message,true);}}render();});}catch(error){toast(`Backend no disponible: ${error.message}`,true);}render();if("serviceWorker" in navigator&&import.meta.env.PROD)navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(()=>{});}
boot();
