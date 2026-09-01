# La Ultima Jugada — Deploy

## Git → Cloudflare (recomendado)
1. Repo GitHub: `GENAROTROSSERO/LA-ULTIMA-JUGADA` (o el tuyo)
2. Cloudflare Pages → Connect to Git → branch `main`
3. Build command: **vacío** (sitio estático)
4. Output directory: `/` o dejar vacío
5. Cada `git push` a main publica solo

### Subir desde PC (una vez)
```bash
git add index.html la-ultima-jugada.html sw.js manifest.webmanifest *.png
git commit -m "sync site"
git push
```

## No uses zips sueltos si el proyecto ya está conectado a Git
Cloudflare tomará el HTML del repo.

## Automation (tablas 2–3 veces/día)
En Grok Automations o GitHub Actions, programar un prompt corto:
"Actualizar tablas Clausura y apartado Hoy de La Ultima Jugada; push a main"
Horarios sugeridos (ARG): 12:00, 18:00, 23:00

## Service worker
Tras cada deploy fuerte, el usuario puede necesitar hard refresh una vez (sw.js version bump).
