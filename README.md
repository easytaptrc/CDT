# CDT Training Center — sitio web

Página de una sola pantalla (HTML + CSS + JS, sin compilación) con escena 3D en Three.js, scroll suave (Lenis) y animaciones con GSAP.

## Verla en tu computadora
```bash
node server.js
```
Luego abre http://localhost:5173 . (También abre con doble clic en `index.html`).

## Qué editar antes de publicar
| Qué | Dónde |
|---|---|
| Número de WhatsApp | `js/config.js` → `whatsapp` |
| **Precios** (solo la inscripción de $499 es real, el resto son de ejemplo) | `index.html`, sección `id="precios"` |
| **Equipo**: roles, nombres y fotos de los coaches reales | `index.html`, sección `id="equipo"` |
| Facebook / TikTok | `index.html`, en el `<footer>` (comentario ✏️) |
| Fotos | carpeta `img/` (se bajaron de su Instagram a 640 px; con fotos originales en alta se verá aún mejor) |

## Publicar
Sube la carpeta completa (sin `server.js` ni `.claude/`) a Netlify, Vercel, GitHub Pages o cualquier hosting estático.
