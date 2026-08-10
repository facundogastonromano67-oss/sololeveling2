# Subir el proyecto a un repositorio nuevo

1. Creá un repositorio vacío en GitHub, sin README ni archivos iniciales.
2. Descomprimí el ZIP.
3. En el repositorio elegí **Add file → Upload files**.
4. Arrastrá todo el contenido de la carpeta, incluyendo `.github`, `src`, `public` y `supabase`.
5. Confirmá el commit con el mensaje `Base funcional del Sistema G30`.

Para trabajar desde una computadora es preferible usar Git:

```bash
git init
git add .
git commit -m "Base funcional del Sistema G30"
git branch -M main
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

No subas `.env.local`, contraseñas de PostgreSQL ni la clave `service_role`.

## Publicar el frontend

El workflow `deploy-pages.yml` compila la aplicación y la publica con GitHub Pages. En GitHub entrá en **Settings → Pages** y elegí **GitHub Actions** como fuente.

La base de datos no se ejecuta en GitHub Pages. Se conecta al proyecto de Supabase configurado en las variables de compilación.
