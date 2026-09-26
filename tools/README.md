# Herramientas

Scripts de apoyo: no forman parte del juego. Se ejecutan desde la raíz del proyecto.

Los de Python usan Playwright con Chromium (`pip install playwright pillow fonttools` y `playwright install chromium`) y cargan el juego compilado. Antes: `npm run build` y, en otra terminal, `npm run serve`, que sirve `dist/` en http://127.0.0.1:8765. Abrirlo como archivo (`file://`) no sirve porque las fuentes no cargan.

## Simulación y dificultad (TypeScript, sin navegador)

| Script | Qué hace | Uso |
|---|---|---|
| `bot.ts` | El bot juega cada nivel y los retos diarios en modo PRO y casual, y saca la tasa de victoria, el % salvado y las estrellas. Con `--up` juega los niveles con mejoras: `max` (todas a 5), un nivel para todas (`--up=3`) o uno por línea (`--up=manguera,presión,velocidad,tiempo`, p. ej. `--up=5,0,0,0`). Resultados de referencia en `docs/dificultad.md` | `npm run bot` (o `npx tsx tools/bot.ts [partidas] [nivel] [--up=max]`) |
| `daily-table.ts` | Regenera `src/sim/dailyTable.ts`, las semillas del reto diario que el bot ha comprobado que se pueden ganar. **Hay que ejecutarlo después de tocar la simulación** | `npm run daily-table` |
| `sweep.ts` | Prueba combinaciones de parámetros de `TUNE` (simulación) y saca la tasa de victoria de cada una | `npx tsx tools/sweep.ts '[{"clave":valor}]' [partidas]` |
| `trace.ts` | Traza una partida del bot PRO en un nivel (eventos y resultado), para depurar | `npx tsx tools/trace.ts [nivel]` |
| `check.ts` | Resumen de cada nivel (tamaño, entidades) y cuánto se quema si no haces nada | `npx tsx tools/check.ts [--map]` |

## Imágenes y vídeo (Python + Playwright, con `dist/` servido)

| Script | Qué genera | Dónde |
|---|---|---|
| `assets.py` | Iconos de la web, imagen para redes (`og.png`) y las 3 portadas de CrazyGames | `assets/` |
| `android_icons.py` | Fuentes del icono adaptativo y la pantalla de inicio de Android (para `@capacitor/assets`) | `assets/android/` |
| `store_shots.py` | Las 6 capturas de móvil y el gráfico destacado de Google Play | `assets/play/` |
| `testers_assets.py` | Tarjeta «Se buscan testers» y capturas ligeras de la página `/testers` (no necesita servidor) | `assets/testers/` |
| `shots2.py` | Capturas de escenarios para revisar el aspecto del juego | `shots/` |
| `video.py` | Vídeos renderizados fotograma a fotograma desde el juego real. Perfiles: `x` (vertical 1080×1920 con música, para redes), `cg169` y `cg23` (vistas previas de CrazyGames, sin sonido y por debajo de 10 MB) | `build/video/` |
| `render.sh`, `render_loop.sh` | Lanzan `video.py` clip a clip y se pueden reanudar si la máquina se reinicia: `tools/render.sh cg169` hasta que no queden clips y luego `tools/render.sh cg169 encode` | `build/video/` |

## Pruebas del SDK de CrazyGames (Python + Playwright, con `dist/` servido)

| Script | Qué comprueba |
|---|---|
| `test_cg_sdk.py` | Con un SDK simulado: la secuencia de llamadas (`init`, `loadingStart/Stop`, `gameplayStart/Stop`), que no haya errores y que no se pida ningún anuncio. Con `--ads` (tras compilar con `CG_ADS=1 node build.mjs`) comprueba el x2 con el anuncio con recompensa del SDK |
| `test_cg_data.py` | El guardado en la nube de CrazyGames: la partida del portal gana al cargar, la partida local se copia la primera vez y el progreso nuevo se guarda |

## Prueba de monedas, tienda y anuncios (Python + Playwright, con `dist/` servido)

`python3 tools/test_monetize.py [carpeta]` recorre en la web, en español y en inglés y con el proveedor de prueba (`?fakeads=1`): monedas al acabar un nivel con su cuenta animada, x2, tienda (mejoras, monedas gratis, compras, restaurar), +30 s al acabarse el tiempo, topes del anuncio entre niveles, oferta de inicio, reto diario sin mejoras, anuncios y compras que fallan (`?fakeads=fail`), la web sin anuncios, una partida guardada de la 1.2.0 y la pantalla final y la tienda a 320 px y a 640×360. Deja capturas en la carpeta (por defecto `shots/monetize/`) y termina con `ALL OK` o la lista de fallos.

## Negocio

`python3 tools/revenue_model.py` recalcula los escenarios de ingresos de `docs/monetizacion.md` (ARPDAU, valor por jugador, retorno de la publicidad y coste por instalación máximo por país). Las hipótesis están arriba del script: cámbialas por datos reales y vuelve a ejecutarlo.
