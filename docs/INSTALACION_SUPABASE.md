# Instalación del backend Supabase

## 1. Probar la aplicación sin backend

Necesitás Node.js 22 o posterior:

```bash
npm install
npm run dev
```

Abrí la dirección que muestra la terminal. En modo local ya podés crear y completar misiones, generar un plan, registrar entrenamientos y comidas, escribir notas y cerrar el día.

## 2. Crear el proyecto en Supabase

1. Creá un proyecto en [database.new](https://database.new/).
2. Instalá o ejecutá la CLI: `npx supabase --help`.
3. Iniciá sesión y vinculá esta carpeta:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
```

4. Aplicá migraciones y catálogos:

```bash
npx supabase db push --include-seed
npx supabase functions deploy generate-plan
```

Las migraciones crean tablas, políticas RLS y funciones. `seed.sql` carga misiones, ejercicios, recetas y clases.

## 3. Conectar el frontend

Copiá `.env.example` como `.env.local` y reemplazá los valores:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_DEMO_FULL_ACCESS=false
```

La clave pública puede llamarse `anon` en proyectos anteriores o `publishable` en proyectos nuevos. Es apta para el navegador porque RLS controla el acceso. **Nunca** pongas `service_role`, una secret key ni la contraseña de PostgreSQL en un archivo `VITE_*`.

Reiniciá `npm run dev`, creá una cuenta y confirmá el correo si el proyecto lo exige.

## 4. Desarrollo local completo con Docker (opcional)

Con Docker activo:

```bash
npx supabase start
npx supabase db reset
npm run dev
```

`supabase start` muestra una URL y una clave pública locales. Usalas en `.env.local`.

## 5. Comprobaciones

```bash
npm test
npm run build
```

Probá con dos cuentas distintas: ninguna debe poder consultar notas, misiones, entrenamientos o comidas de la otra.

Documentación oficial: [desarrollo local](https://supabase.com/docs/guides/local-development/overview), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [gestión de usuarios](https://supabase.com/docs/guides/auth/managing-user-data) y [Edge Functions](https://supabase.com/docs/guides/functions/quickstart).
