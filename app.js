const initialMissions = [
  { id:"s1", title:"Desafío de enfoque", target:"45 min sin interrupciones", progress:"0 / 45 min", attribute:"ENFOQUE", xp:85, system:true },
  { id:"s2", title:"Última serie", target:"Terminá con técnica perfecta", progress:"0 / 1", attribute:"DISCIPLINA", xp:90, system:true },
  { id:"s3", title:"Decisión difícil", target:"Resolvé la tarea que postergás", progress:"0 / 1", attribute:"VOLUNTAD", xp:100, system:true },
  { id:"m1", title:"Completar entrenamiento", target:"Sesión programada", progress:"0 / 1 sesión", attribute:"FUERZA", xp:55 },
  { id:"m2", title:"Cuatro comidas saludables", target:"Registrá cada comida", progress:"0 / 4 comidas", attribute:"NUTRICIÓN", xp:45 },
  { id:"m3", title:"Caminar 8.000 pasos", target:"Sincronización disponible", progress:"5.420 / 8.000", attribute:"RESISTENCIA", xp:35 },
  { id:"m4", title:"Leer 20 minutos", target:"Nivel de misión 4", progress:"0 / 20 min", attribute:"ENFOQUE", xp:30 },
  { id:"m5", title:"Tomar dos litros de agua", target:"Distribuidos durante el día", progress:"1,2 / 2 L", attribute:"RECUPERACIÓN", xp:25 },
  { id:"m6", title:"Ordenar el día siguiente", target:"Definí tus tres prioridades", progress:"0 / 3", attribute:"DISCIPLINA", xp:30 }
];

const storage = {
  read(key, fallback){ try { const value=localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } },
  write(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
};

const state = {
  missions: initialMissions.map(m => ({...m, done:false, ...(storage.read("g30-missions",[]).find(saved=>saved.id===m.id)||{})})),
  xp: storage.read("g30-xp",1143),
  premium: storage.read("g30-premium",false),
  note: storage.read("g30-note",""),
  arenaTab:"arena"
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const safeText = value => String(value).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function saveState(){ storage.write("g30-missions",state.missions); storage.write("g30-xp",state.xp); storage.write("g30-premium",state.premium); storage.write("g30-note",state.note); }

function missionCard(mission){
  return `<article class="mission-card ${mission.system?"system":""} ${mission.done?"completed":""}">
    <button class="mission-check" data-mission="${mission.id}" aria-label="${mission.done?"Desmarcar":"Completar"} ${safeText(mission.title)}">${mission.done?"✓":""}</button>
    <div class="mission-copy"><div class="mission-title"><h3>${safeText(mission.title)}</h3>${mission.system?'<span class="system-chip">SISTEMA</span>':""}</div><p>${safeText(mission.target)}</p><div class="mission-meta"><span class="attribute">${safeText(mission.attribute)}</span><span>${mission.done?"Objetivo cumplido":safeText(mission.progress)}</span></div></div>
    <div class="mission-reward"><strong>+${mission.xp}</strong><small>XP</small></div>
  </article>`;
}

function renderMissions(){
  const system=state.missions.filter(m=>m.system), mandatory=state.missions.filter(m=>!m.system);
  $("#system-missions").innerHTML=system.map(missionCard).join("");
  $("#mandatory-missions").innerHTML=mandatory.map(missionCard).join("");
  $("#system-counter").textContent=`${system.filter(m=>m.done).length} / ${system.length}`;
  $("#mandatory-counter").textContent=`${mandatory.filter(m=>m.done).length} / ${mandatory.length}`;
  $$("[data-mission]").forEach(button=>button.addEventListener("click",()=>toggleMission(button.dataset.mission)));
  renderProgress();
}

function renderProgress(){
  const completed=state.missions.filter(m=>m.done).length;
  const percent=Math.round(completed/state.missions.length*100);
  $("#today-percent").textContent=`${percent}%`;
  $("#plan-percent").textContent=`${percent}%`;
  $("#progress-ring").style.setProperty("--progress",`${percent*3.6}deg`);
  $("#today-bar").style.height=`${Math.max(percent,8)}%`;
  ["#xp-total","#profile-xp"].forEach(id=>$(id).textContent=state.xp.toLocaleString("es-AR"));
}

function toggleMission(id){
  const mission=state.missions.find(m=>m.id===id); if(!mission)return;
  mission.done=!mission.done;
  state.xp=Math.max(0,state.xp+(mission.done?mission.xp:-mission.xp));
  saveState(); renderMissions();
  toast(mission.done?`MISIÓN COMPLETADA · +${mission.xp} XP`:"Misión reabierta");
  const completed=state.missions.filter(m=>m.done).length;
  if(mission.done&&!state.premium&&completed===3&&!storage.read("g30-ad-demo",false)){
    storage.write("g30-ad-demo",true); setTimeout(()=>$("#ad-modal").hidden=false,450);
  }
}

function renderPremium(){
  $("#account-badge").textContent=state.premium?"PREMIUM":"GRATIS";
  $("#premium-button").textContent=state.premium?"PREMIUM ACTIVO":"ACTIVAR DEMO PREMIUM";
  $("#premium-toggle b").textContent=state.premium?"ACTIVA":"INACTIVA";
  $(".training-status").textContent=state.premium?"Rutina Torso / Pierna · 4 días":"Disponible con Premium";
  $(".nutrition-status").textContent=state.premium?"4 comidas · objetivo diario":"Disponible con Premium";
  const locked=(title,copy)=>`<div class="locked"><span>◇</span><h3>${title}</h3><p>${copy}</p><div class="price"><strong>USD 1,99</strong><span>/ mes · también elimina anuncios</span></div><button class="primary-button unlock-demo">PROBAR VISTA PREMIUM</button></div>`;
  $("[data-premium-content='training']").innerHTML=state.premium?`<h3>HOY · TORSO A</h3>${["Press plano · 3 × 6–8","Remo sentado · 3 × 8–10","Press inclinado · 3 × 8–10","Dominadas asistidas · 3 × 6–8"].map((x,i)=>`<div class="routine-row"><span>0${i+1}</span><strong>${x}</strong><small>REGISTRAR</small></div>`).join("")}<button class="secondary-button">INICIAR ENTRENAMIENTO</button>`:locked("Tu rutina personalizada","Ejercicios simples, series, descansos, cargas y progresiones adaptadas a tu experiencia y equipamiento.");
  $("[data-premium-content='nutrition']").innerHTML=state.premium?`${["Desayuno · Huevos y tostadas","Almuerzo · Carne, vegetales y arroz","Merienda · Yogur, fruta y avena","Cena · Pollo, papas y ensalada"].map((x,i)=>`<div class="meal-row"><span>0${i+1}</span><strong>${x}</strong><button>VER</button></div>`).join("")}<button class="secondary-button">CAMBIAR UNA COMIDA</button>`:locked("Tu plan de alimentación","Comidas simples, cantidades, reemplazos y lista de compras. Sin recetas innecesariamente complicadas.");
  $$(".unlock-demo").forEach(button=>button.addEventListener("click",activatePremium));
}

function activatePremium(){ state.premium=true; saveState(); renderPremium(); toast("VISTA PREMIUM ACTIVADA PARA LA DEMOSTRACIÓN"); }

function go(view){
  $$(".view").forEach(section=>section.classList.toggle("active",section.dataset.view===view));
  $$(".bottom-nav [data-go]").forEach(button=>button.classList.toggle("active",button.dataset.go===view));
  $("#ad-modal").hidden=true; window.scrollTo({top:0,behavior:"smooth"});
}

function toast(message){ const node=$("#toast"); node.textContent=message; node.hidden=false; clearTimeout(toast.timer); toast.timer=setTimeout(()=>node.hidden=true,2200); }

const overlays={
  avisos:{title:"Notificaciones",html:()=>`<div class="panel-body"><article class="notice red"><span></span><div><strong>Misión del Sistema disponible</strong><p>Completá “Decisión difícil” antes del cierre.</p><small>Hace 8 minutos</small></div></article><article class="notice"><span></span><div><strong>Entrenamiento programado</strong><p>Torso A comienza a las 19:00.</p><small>Hoy</small></div></article><article class="notice gold"><span></span><div><strong>Tu gremio abrió una mazmorra</strong><p>Centinelas necesita 420 puntos de daño.</p><small>Hoy</small></div></article></div>`},
  cuaderno:{title:"Cuaderno",html:()=>`<div class="panel-body notebook"><p>Usalo como recordatorio, anotador o diario íntimo. El Asistente no puede leerlo sin tu autorización.</p><textarea id="note-field" placeholder="Escribí lo que quieras..."></textarea><footer><span>Guardado automáticamente en este dispositivo.</span><button class="secondary-button" id="note-done">LISTO</button></footer></div>`},
  cierre:{title:"Cierre del día",html:()=>`<div class="panel-body closing"><p>Completaste <strong>${state.missions.filter(m=>m.done).length} de ${state.missions.length} misiones</strong>. Registrá cómo terminó el día.</p><label>¿Cómo estuvo tu energía?<input type="range" min="1" max="5" value="3"></label><label>¿Cómo estuvo tu disciplina?<input type="range" min="1" max="5" value="4"></label><textarea placeholder="¿Qué aprendiste hoy? (opcional)"></textarea><button class="primary-button" id="close-day">CERRAR EL DÍA</button></div>`},
  calendario:{title:"Plan semanal",html:()=>`<div class="panel-body"><div class="week-strip">${["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].map((d,i)=>`<button class="${i===6?"active":""}"><span>${d}</span><strong>${10+i}</strong><small>${i===6?"HOY":`${5+i%3} misiones`}</small></button>`).join("")}</div><article class="mode-banner"><div><small>MODO ACTUAL</small><strong>INTENSIVO</strong></div><span>BLOQUEADO</span></article>${["Completar entrenamiento · 19:00","Cuatro comidas saludables","Leer 20 minutos · 22:00","Tomar dos litros de agua","Ordenar el día siguiente · 22:30"].map(x=>`<div class="calendar-mission"><span>○</span><strong>${x}</strong><small>OBLIGATORIA</small></div>`).join("")}</div>`},
  asistente:{title:"Asistente del Sistema",html:()=>`<div class="panel-body"><article class="assistant-status"><span>✦</span><div><strong>Asistente contextual</strong><small>Las modificaciones siempre requieren confirmación.</small></div></article><div class="chat-message"><small>SISTEMA</small><p id="assistant-answer">Hoy tenés ${state.missions.length} misiones. Te recomiendo empezar por el entrenamiento y dejar el desafío de enfoque para después de comer.</p></div><div class="assistant-input"><textarea id="assistant-question" placeholder="Preguntale al Sistema..."></textarea><button id="assistant-send">ENVIAR</button></div><p class="privacy-note">El Asistente no puede leer tu cuaderno sin que compartas una nota expresamente.</p></div>`},
  arena:{title:"Centro de combate",html:()=>arenaHtml("arena")}
};

function arenaHtml(tab){
  const tabs=`<div class="combat-tabs"><button data-combat="arena" class="${tab==="arena"?"active":""}">ARENA</button><button data-combat="gremios" class="${tab==="gremios"?"active":""}">GREMIOS</button><button data-combat="mazmorras" class="${tab==="mazmorras"?"active":""}">MAZMORRAS</button></div>`;
  let body="";
  if(tab==="arena")body=`<article class="combat-hero"><small>DUELO DIARIO</small><h3>Precisión bajo presión</h3><p>Un intento competitivo. El ganador se muestra claramente al finalizar.</p><button class="primary-button">BUSCAR RIVAL</button></article><div class="leaderboard"><h3>Ranking semanal</h3><div><span>01</span><strong>Nox</strong><b>1.840 pts</b></div><div><span>02</span><strong>Aldren</strong><b>1.720 pts</b></div><div class="you"><span>08</span><strong>Facu</strong><b>1.290 pts</b></div></div>`;
  if(tab==="gremios")body=`<article class="guild-card"><span class="guild-emblem">C</span><div><small>TU GREMIO</small><h3>Centinelas</h3><p>12 miembros · División Bronce I</p></div><strong>#18</strong></article><article class="war-card"><small>GUERRA ACTIVA · 31H</small><div><div><strong>Centinelas</strong><b>4.280</b></div><i>VS</i><div><strong>Vanguardia Sur</strong><b>3.940</b></div></div><button class="primary-button">ENTRAR AL COMBATE</button></article>`;
  if(tab==="mazmorras")body=`<article class="dungeon-card"><div class="dungeon-gate">◇</div><div><small>MAZMORRA SEMANAL</small><h3>La cámara del centinela</h3><p>5 salas · 3 minijuegos · Jefe de 3 fases</p><div class="boss-health"><i></i></div><small>JEFE · 64% DE VIDA</small></div></article><div class="stat-grid triple"><article><small>INTENTOS</small><strong>2 / 2</strong></article><article class="purple"><small>APORTE</small><strong>680</strong></article></div><button class="primary-button">CONTINUAR EXPEDICIÓN</button>`;
  return `<div class="panel-body">${tabs}${body}</div>`;
}

function openOverlay(type){
  const overlay=overlays[type]; if(!overlay)return;
  $("#panel-title").textContent=overlay.title; $("#panel-content").innerHTML=overlay.html(); $("#panel-backdrop").hidden=false;
  if(type==="cuaderno"){ const field=$("#note-field"); field.value=state.note; field.addEventListener("input",()=>{state.note=field.value;saveState()}); $("#note-done").addEventListener("click",closePanel); }
  if(type==="cierre")$("#close-day").addEventListener("click",()=>{closePanel();toast("DÍA CERRADO · PROGRESO GUARDADO")});
  if(type==="asistente")$("#assistant-send").addEventListener("click",()=>{const question=$("#assistant-question");if(!question.value.trim())return;$("#assistant-answer").textContent="Puedo ayudarte a reorganizarlo. Preparé una propuesta, pero no voy a modificar tu plan hasta que la confirmes.";question.value=""});
  bindCombatTabs();
}

function bindCombatTabs(){ $$("[data-combat]").forEach(button=>button.addEventListener("click",()=>{$("#panel-content").innerHTML=arenaHtml(button.dataset.combat);bindCombatTabs()})); }
function closePanel(){ $("#panel-backdrop").hidden=true; }

function openEvaluation(){
  $("#guest-screen").hidden=true;
  $("#panel-title").textContent="Evaluación inicial";
  $("#panel-content").innerHTML=`<form class="panel-body evaluation" id="evaluation-form">
    <div class="evaluation-progress"><i></i><span>VISTA PREVIA · 6 PREGUNTAS RÁPIDAS</span></div>
    <fieldset><legend>¿Qué querés transformar primero?</legend><div class="choice-grid"><label><input type="radio" name="goal" checked><span>Mi disciplina</span></label><label><input type="radio" name="goal"><span>Mi estado físico</span></label><label><input type="radio" name="goal"><span>Mi alimentación</span></label><label><input type="radio" name="goal"><span>Todo el sistema</span></label></div></fieldset>
    <fieldset><legend>¿Cómo es tu trabajo?</legend><div class="choice-grid"><label><input type="radio" name="work" checked><span>Mayormente sentado</span></label><label><input type="radio" name="work"><span>Activo</span></label><label><input type="radio" name="work"><span>Turnos variables</span></label></div></fieldset>
    <fieldset><legend>¿Cuántos días podés entrenar?</legend><input class="number-input" type="number" min="1" max="7" value="3"></fieldset>
    <fieldset><legend>Elegí misiones que realmente te sirvan</legend><div class="choice-grid"><label><input type="checkbox" checked><span>Entrenar</span></label><label><input type="checkbox" checked><span>Comer saludable</span></label><label><input type="checkbox" checked><span>Leer</span></label><label><input type="checkbox"><span>Dormir mejor</span></label><label><input type="checkbox"><span>Ordenar mi día</span></label><label><input type="checkbox"><span>Trabajo profundo</span></label></div></fieldset>
    <fieldset><legend>¿Qué estilo de plan preferís?</legend><div class="choice-grid"><label><input type="radio" name="mode"><span>Flexible</span></label><label><input type="radio" name="mode" checked><span>Intensivo</span></label></div></fieldset>
    <div class="evaluation-preview"><small>ANTES DE COMENZAR</small><strong>Vas a poder editar cada misión, ejercicio y comida.</strong><p>Después de confirmar, el Modo Intensivo bloqueará las misiones del ciclo.</p></div>
    <button class="primary-button" type="submit">GENERAR MI PLAN G30</button>
  </form>`;
  $("#panel-backdrop").hidden=false;
  $("#evaluation-form").addEventListener("submit",event=>{event.preventDefault();closePanel();go("plan");toast("PLAN G30 GENERADO · LISTO PARA REVISAR")});
}

$$('[data-go]').forEach(button=>button.addEventListener("click",()=>go(button.dataset.go)));
$$('[data-overlay]').forEach(button=>button.addEventListener("click",()=>openOverlay(button.dataset.overlay)));
$$('.accordion-trigger').forEach(trigger=>trigger.addEventListener("click",()=>{const article=trigger.closest(".accordion");article.classList.toggle("open");trigger.querySelector("b").textContent=article.classList.contains("open")?"−":"+"}));
$("#panel-close").addEventListener("click",closePanel);
$("#panel-backdrop").addEventListener("click",event=>{if(event.target===$("#panel-backdrop"))closePanel()});
$("#ad-close").addEventListener("click",()=>$("#ad-modal").hidden=true);
$("#premium-button").addEventListener("click",activatePremium);
$("#premium-toggle").addEventListener("click",()=>{state.premium=!state.premium;saveState();renderPremium();toast(state.premium?"VISTA PREMIUM ACTIVADA":"VISTA GRATUITA ACTIVADA")});
$("#guest-button").addEventListener("click",()=>$("#guest-screen").hidden=false);
$("#register-demo").addEventListener("click",openEvaluation);
$("#enter-demo").addEventListener("click",()=>$("#guest-screen").hidden=true);
$("#evaluation-button").addEventListener("click",openEvaluation);

renderMissions(); renderPremium();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
