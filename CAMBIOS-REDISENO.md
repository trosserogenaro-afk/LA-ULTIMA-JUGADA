# La Última Jugada — rediseño visual (sobre luj-30oct-COMPLETO)

## Archivos modificados
- `index.html` y `la-ultima-jugada.html` (idénticos, sincronizados): nueva capa de estilos `<style id="luj-redesign">` antes de `</head>`; dos ajustes de marcado en la navegación; un pequeño script al final que marca partidos de clubes favoritos.
- `sw.js`: versión de caché `luj-v13` → `luj-v14` para renovar la caché.

## Sin cambios
- Toda la lógica JavaScript original, datos, endpoints, claves de localStorage, IDs y `onclick`.
- `manifest.webmanifest`, iconos, `logo-luj.png`, `la-ultima-jugada-logo.png`, `README-DEPLOY.md`.

## Qué cambia
- Cabecera más compacta; logo con altura controlada; controles agrupados; botón de actualizar con estado "trabajando"; instalación menos invasiva.
- La guía inicial ya no queda pegada arriba al hacer scroll; solo las pestañas quedan fijas.
- Pestañas con estado activo claro; en escritorio ocupan el ancho disponible.
- Tarjetas de partido: marcador más visible, EN VIVO destacado sin parpadeo, hora programada mostrada una sola vez, nombres en hasta dos líneas, favoritos marcados.
- Tablas: encabezados, filas alternadas, indicador de orden, desplazamiento horizontal solo dentro de la tabla.
- Hojas de detalle, Modo Carrera, herramientas: espaciado, jerarquía y áreas táctiles mejoradas.
- Subpestañas de Argentina con desplazamiento interno (antes desbordaban la página en móvil).
- Escritorio: contenedor más ancho y "Hoy" en dos columnas.
- Movimiento reducido respetado; el sombreado del encabezado y el pulso del EN VIVO se eliminaron.

## Pendiente (ya existía en el original)
- Faltan en el proyecto las definiciones `UDL_CLUBS`, `UDL_LINK`, `LIBERTADORES` y `SUDAMERICANA`: la sección UDL y la de Sudamérica quedan vacías y generan errores de JS.
- Tablas de Europa sin conexión muestran `undefined`/`NaN` (campos distintos a los esperados).

## Actualización 2 (UDL y Hoy a medianoche)
- Se incorporó el bloque UDL del ZIP FIX-UDL-12nov: `UDL_BASE`, `UDL_LINK`, `UDL_CLUBS` (30 clubes), `UDL_CLASICOS`. Archivos locales: `crest-25-mayo-nogoya.png`, `crest-el-porvenir.png`.
- Sección UDL: la grilla de clubes muestra solo escudos (nombre en `title`/`aria-label`). Los clásicos siguen igual.
- Modo Carrera: "Club de la UDL" ya lista los 30 clubes y permite arrancar la partida.
- `const TODAY_DATE` pasó a `let`. Un script sincroniza "Hoy" con la fecha de Argentina al cargar, a las 00:00 y al volver a la pestaña.
  - Al cambiar la fecha se ejecuta `handleRefresh()` (consulta ESPN de partidos). Las tablas NO se actualizan automáticamente.
  - Sin conexión, "Hoy" queda vacío porque los partidos de muestra son del 30/10.
- `sw.js`: caché `luj-v15`.

## Pendiente
- `LIBERTADORES` y `SUDAMERICANA` siguen sin definir: la pestaña Sudamérica genera error de JS.

## Actualización 4 (Europa al 12/11/2026)
- Tablas de Premier, La Liga, Serie A, Bundesliga y Champions: puntos y G/E/P verificados contra la herramienta deportiva (zona horaria Buenos Aires). Se corrigió el formato que causaba `undefined`/`NaN`.
- Partidos recientes y próximos de esas cinco competencias, con fecha y hora de Argentina. Solo se cargaron los que trae la fuente (no goles de tabla, que no se muestran en esta vista).
- Abreviaturas nuevas agregadas: Elversberg (SVE), Paderborn (PAD) y equipos de la Champions.
- Sin cambios: Argentina (sigue el pipeline de API-Football, pendiente de clave), UDL, Uruguay, Libertadores y Sudamericana.

## Actualización 5 (zonas en tablas europeas)
- Barra de color junto al escudo y leyenda debajo de cada tabla.
- Premier, La Liga y Serie A (20 equipos): 1–4 Champions (azul), 5 Europa League (naranja), 6 Conference League (verde), 18–20 descenso (rojo).
- Bundesliga (18): 1–4 Champions, 5 Europa League, 6 Conference, 16 play-off (amarillo), 17–18 descenso.
- Champions (36, fase de liga): 1–8 octavos directos (azul), 9–24 play-off (amarillo).
- Las reglas se aplican por cantidad de equipos de cada tabla. Verificar que coincidan con el reglamento vigente de cada liga antes de publicar.

## Actualización 6 — goles en partidos europeos
- Premier, La Liga, Serie A, Bundesliga y Champions: 47 partidos con goles cargados con minuto y lado del gol (fuente: game_stats del 12/11/2026). Los 3 0-0 quedan sin goles.
- Cada marcador fue verificado contra el resultado final de la app antes de guardarlo.
- Limitación: la fuente no trae nombres de goleadores, así que se muestra "Gol 52'" en vez de un nombre. Los nombres vendrán del pipeline de API-Football (APIFOOTBALL_KEY) cuando esté configurado.
- Los autogoles no se distinguen en esta fuente; se atribuyen al equipo que figura en el cambio de marcador.
- Service worker: caché luj-v17.
