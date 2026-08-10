# Backend implementado en esta versión

La aplicación funciona en dos modos:

- **Local:** usable de inmediato, sin cuenta. Guarda los datos en el navegador y habilita el acceso completo para desarrollo.
- **Supabase:** cuentas reales, sincronización y seguridad por usuario mediante PostgreSQL y Row Level Security.

## Datos incluidos

- Perfiles y evaluación inicial.
- Planes G30 de 30 días en modo flexible o intensivo.
- Misiones fijas, desafíos del Sistema, completados, XP y penalizaciones.
- Registro de entrenamientos, series, repeticiones, cargas y notas.
- Catálogo de ejercicios con instrucciones y alternativas.
- Plan de comidas, recetas simples y registro de comidas.
- Cuaderno privado y cierre diario.
- Cursos, clases detalladas y progreso de Academia.
- Veinte habilidades agrupadas en Intelecto, Carisma, Rendimiento y Físico.
- Monedas, compras internas, logros, Arena, Mazmorras y gremios.

## Seguridad aplicada

- RLS habilitado en todas las tablas expuestas.
- Cada política privada compara `auth.uid()` con el propietario de la fila.
- El navegador no puede editar XP, nivel, Premium o recompensas.
- `complete_mission` entrega XP de forma transaccional e idempotente.
- `close_day` calcula pendientes, pérdida limitada de XP y una sola penalización por fecha.
- `generate-plan` valida la sesión antes de usar la clave de servicio.
- La clave `service_role` vive únicamente en Supabase Edge Functions.
- El cuaderno queda fuera del contexto del futuro Asistente salvo autorización explícita.
- Las compras con monedas y la recompensa de Mazmorras se calculan en funciones
  transaccionales; el navegador no puede acreditar saldo por su cuenta.
- Los puntajes públicos de Arena se publican únicamente cuando el servidor los
  marca como verificados.

## Deliberadamente pendiente

Los pagos reales, anuncios, ranking público, guerras entre gremios e IA generativa
siguen desactivados. Stripe debe validar cada suscripción mediante webhooks; Arena
pública requiere antifraude y moderación. La aplicación ofrece mientras tanto una
Arena, un ranking y un gremio locales que no simulan resultados de otros usuarios.

Referencias oficiales: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth](https://supabase.com/docs/guides/auth), [Edge Functions](https://supabase.com/docs/guides/functions).
