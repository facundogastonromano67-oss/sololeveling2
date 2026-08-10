# Primer uso diario de Sistema G30

## Iniciar

```bash
npm install
npm run dev
```

La aplicación abre en la bienvenida. Completá los seis pasos de la evaluación,
revisá las misiones, los ejercicios y las comidas, y recién entonces elegí
`Comenzar plan`.

Sin Supabase los datos quedan en ese navegador. Usá `Perfil > Exportar datos`
para crear una copia de seguridad periódica.

## Rutina de cada día

1. Abrí Inicio y revisá primero las misiones obligatorias.
2. Completá o registrá cada misión en el momento en que la hacés.
3. En Plan G30 registrá las series, repeticiones, peso y RPE del entrenamiento.
4. En Alimentación abrí cada receta y registrá la comida terminada.
5. Usá el Cuaderno para notas libres, recordatorios o diario personal.
6. Cerrá el día sólo cuando ya no vayas a completar más misiones.

## Instalar como aplicación

Cuando el sitio esté publicado con HTTPS, abrilo en Chrome o Edge y elegí
`Instalar aplicación` desde el menú del navegador. En Android también puede
aparecer `Agregar a la pantalla principal`.

## Datos en más de un dispositivo

Seguí `docs/INSTALACION_SUPABASE.md`. Después de crear una cuenta, el plan,
misiones, registros, cuaderno y progreso se sincronizan con políticas que aíslan
los datos de cada usuario.

## Límites actuales

- Stripe y los anuncios reales no están conectados.
- El ranking público y las guerras entre gremios permanecen desactivados hasta
  incorporar moderación y controles antifraude.
- Arena, Mazmorra, monedas y gremio funcionan localmente; con Supabase también
  se validan las recompensas individuales en el servidor.
- El plan orienta hábitos generales y no reemplaza atención médica, nutricional
  ni de entrenamiento profesional.
