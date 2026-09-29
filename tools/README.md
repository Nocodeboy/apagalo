# Herramientas

Scripts de apoyo: no forman parte del juego. Se ejecutan desde la raíz del proyecto.

Los de Python usan Playwright con Chromium (`pip install playwright pillow fonttools` y `playwright install chromium`) y cargan el juego compilado. Antes: `npm run build` y, en otra terminal, `npm run serve`, que sirve `dist/` en http://127.0.0.1:8765. Si lo sirves en otro puerto, pásalo con `PORT` (p. ej. `PORT=8784 python3 tools/test_monetize.py`). Abrirlo como archivo (`file://`) no sirve porque las fuentes no cargan.

## Simulación y dificultad (TypeScript, sin navegador)

| Script | Qué hace | Uso |
|---|---|---|
| `bot.ts` | El bot juega cada nivel (o solo uno: `npx tsx tools/bot.ts 10 finale`, o un tramo de la ruta: `1-30`) y los retos diarios en modo PRO y casual, y saca la tasa de victoria, el % salvado, las estrellas y los power-ups cogidos (`pw`). Con `--up` juega los niveles con mejoras: `max` (todas a 5), un nivel para todas (`--up=3`) o uno por línea (`--up=manguera,presión,velocidad,tiempo`, p. ej. `--up=5,0,0,0`). Con `--crew=partner:3,dog:1` lleva el equipo a los niveles que tienen hueco. `--sum` añade tablas por capítulo, por escenario y de los grandes incendios; `--pro` juega solo el PRO. Resultados de referencia en `docs/dificultad.md` | `npm run bot` (o `npx tsx tools/bot.ts [partidas] [nivel\|desde-hasta] [--up=max] [--crew=…] [--sum] [--pro]`) |
| `tune.ts` | Para ajustar un nivel: juega sin mínimo de salvado (cada partida llega al final) y dice cuánto salva cada bot (percentiles 10/50/90) y qué `minSaved` y estrellas dan la tasa de victoria que pidas al casual (`id:0.6`) con el PRO por encima del 95 %. `--json=archivo` guarda las propuestas | `npx tsx tools/tune.ts 16 puerto-2:0.65 ciudad-3` |
| `curve.ts` | % salvado y casillas ardiendo cada 10 s de un nivel sin nadie jugando, con el bot casual y con el PRO: si todos pierden lo mismo al principio, el nivel no depende de cómo juegues | `npx tsx tools/curve.ts <nivel> [semilla]` |
| `map.ts` | Imprime el mapa de un nivel con los focos iniciales marcados (`@`); `all` avisa de focos puestos en casillas que no arden | `npx tsx tools/map.ts puerto-1` |
| `route.ts` | Imprime la ruta: número, escenario, id, grandes incendios, eventos (con su segundo), cuántos power-ups y lo que estrena cada nivel | `npx tsx tools/route.ts` |
| `daily-table.ts` | Regenera `src/sim/dailyTable.ts`, las semillas del reto diario que el bot ha comprobado que se pueden ganar. **Hay que ejecutarlo después de tocar la simulación** | `npm run daily-table` |
| `sweep.ts` | Prueba combinaciones de parámetros de `TUNE` (simulación) y saca la tasa de victoria de cada una | `npx tsx tools/sweep.ts '[{"clave":valor}]' [partidas]` |
| `trace.ts` | Traza una partida del bot PRO en un nivel (eventos y resultado), para depurar | `npx tsx tools/trace.ts [nivel]` |
| `check.ts` | Resumen de cada nivel (tamaño, entidades) y cuánto se quema si no haces nada | `npx tsx tools/check.ts [--map]` |

## Imágenes y vídeo (Python + Playwright, con `dist/` servido)

| Script | Qué genera | Dónde |
|---|---|---|
| `assets.py` | Iconos de la web, imagen para redes (`og.png`) y las 3 portadas de CrazyGames | `assets/` |
| `android_icons.py` | Fuentes del icono adaptativo y la pantalla de inicio de Android (para `@capacitor/assets`) | `assets/android/` |
| `store_shots.py` | Las 6 capturas de móvil y el gráfico destacado de Google Play (`levels` rehace solo la del selector de niveles; `GAME_LANG=en` para la ficha en inglés) | `assets/play/` y `assets/play-en/` |
| `testers_assets.py` | Tarjeta «Se buscan testers» y capturas ligeras de la página `/testers` (no necesita servidor) | `assets/testers/` |
| `shots2.py` | Capturas de escenarios para revisar el aspecto del juego | `shots/` |
| `shots_v2.py` | Capturas de lo nuevo de la 2.0: `levels <ids>` (presentación y 8 s de juego), `land <ids>` (apaisado), `ui [portrait\|landscape]` (ruta, álbum, portada, tienda con el equipo y presentación, en inglés y español), `systems` (power-ups, helicóptero, cada evento con su cartel y los trenes) y `crew` (equipo en juego, apoyo aéreo y pantalla final de un gran incendio) | `shots/v2/` |
| `video.py` | Vídeos renderizados fotograma a fotograma desde el juego real. Perfiles: `x` (vertical 1080×1920 con música, para redes), `cg169` y `cg23` (vistas previas de CrazyGames, sin sonido y por debajo de 10 MB) | `build/video/` |
| `render.sh`, `render_loop.sh` | Lanzan `video.py` clip a clip y se pueden reanudar si la máquina se reinicia: `tools/render.sh cg169` hasta que no queden clips y luego `tools/render.sh cg169 encode` | `build/video/` |

## Pruebas del SDK de CrazyGames (Python + Playwright, con `dist/` servido)

| Script | Qué comprueba |
|---|---|
| `test_cg_sdk.py` | Con un SDK simulado: la secuencia de llamadas (`init`, `loadingStart/Stop`, `gameplayStart/Stop`), que no haya errores y que no se pida ningún anuncio. Con `--ads` (tras compilar con `CG_ADS=1 node build.mjs`) comprueba el x2 con el anuncio con recompensa del SDK |
| `test_cg_data.py` | El guardado en la nube de CrazyGames: la partida del portal gana al cargar, la partida local se copia la primera vez y el progreso nuevo se guarda |

## Prueba de monedas, tienda y anuncios (Python + Playwright, con `dist/` servido)

`python3 tools/test_monetize.py [carpeta]` recorre en la web, en español y en inglés y con el proveedor de prueba (`?fakeads=1`): monedas al acabar un nivel con su cuenta animada, x2, tienda (mejoras, monedas gratis con su tope de 24 h, compras entregadas y luego consumidas, restaurar), +30 s al acabarse el tiempo, que los botones con anuncio lo digan, el anuncio entre niveles solo con «Siguiente» y sus topes (120 s desde cualquier anuncio, reloj atrasado), oferta de inicio, reto diario sin mejoras y con su tope de 24 h, anuncios y compras que fallan (`?fakeads=fail`), compras pagadas sin entregar que llegan al arrancar (una sola vez), pagos pendientes (`?fakeads=pending`), «Borrar progreso» con su aviso, la web sin anuncios, una partida guardada de la 1.2.0 (que sigue en el nivel 2 de la campaña y ve una vez las novedades de la 2.0), una de la 1.3.0 con 20 niveles ganados en el orden viejo (conserva monedas, mejoras, compras y estrellas, tiene abierto todo hasta donde había llegado en la ruta nueva, incluidos los niveles nuevos que han quedado detrás, y puede jugarlos), el apoyo aéreo (solo tras 2 derrotas seguidas desde el nivel 8, una vez por nivel y sesión) y el selector de niveles, la pantalla final, la tienda, el +30 s y el aviso de borrar a 320 px y a 640×360. Deja capturas en la carpeta (por defecto `shots/monetize/`) y termina con `ALL OK` o la lista de fallos.

## Negocio

`python3 tools/revenue_model.py` recalcula los escenarios de ingresos de `docs/monetizacion.md` (ARPDAU, valor por jugador, retorno de la publicidad y coste por instalación máximo por país). Las hipótesis están arriba del script: cámbialas por datos reales y vuelve a ejecutarlo.
