import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "index.html", "src/main.js", "src/styles.css", "src/data/catalog.js", "src/services/backend.js",
  "public/manifest.webmanifest", "public/sw.js", "public/assets/icon.svg",
  "public/assets/hero-awakening.webp", "public/assets/academy-archive.webp", "public/assets/dungeon-gate.webp",
  "supabase/config.toml", "supabase/seed.sql",
  "supabase/migrations/202608090001_initial_schema.sql",
  "supabase/migrations/202608090002_security_and_functions.sql",
  "supabase/functions/generate-plan/index.ts",
  "docs/INSTALACION_SUPABASE.md", "docs/ARQUITECTURA_BACKEND.md"
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `Falta ${file}`);

for (const file of ["src/main.js", "src/data/catalog.js", "src/services/backend.js", "src/services/local-store.js"])
  execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "inherit" });

const security = fs.readFileSync(path.join(root, "supabase/migrations/202608090002_security_and_functions.sql"), "utf8");
for (const text of ["enable row level security", "auth.uid()", "complete_mission", "close_day", "generate_plan_for_user", "service_role"])
  assert.match(security, new RegExp(text.replace(/[()]/g, "\\$&"), "i"), `Falta control: ${text}`);

const seed = fs.readFileSync(path.join(root, "supabase/seed.sql"), "utf8");
assert.ok((seed.match(/'user'/g) || []).length >= 12, "Faltan misiones base");
assert.ok((seed.match(/exercise_library/g) || []).length >= 1, "Falta catálogo de ejercicios");
assert.ok((seed.match(/public\.recipes/g) || []).length >= 1, "Faltan recetas");
JSON.parse(fs.readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8"));
console.log("Sistema G30 validado: frontend, backend, seguridad, contenido e imágenes presentes.");
