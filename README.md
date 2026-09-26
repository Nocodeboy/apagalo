# ¡Apágalo!

Arcade casual en 3D low-poly: eres un bombero con la manguera atada al camión y apagas incendios que se propagan en tiempo real. Tiene 6 escenarios y un reto diario. Funciona en web y en móvil, en español y en inglés.

| Dónde | Estado |
|---|---|
| Web | https://apagalo.vercel.app (publicada) |
| Google Play | Prueba cerrada «Prueba cerrada - Alpha» desde el 25 sept 2026 (12 testers × 14 días antes de pedir producción). Captación: https://apagalo.vercel.app/testers |
| CrazyGames | Borrador subido, pendiente de la revisión de calidad y del envío |

## Estructura

```
src/sim/        Simulación pura (sin 3D): fuego, viento, brasas, agua, reglas, niveles, bot
  world.ts        motor: rejilla de celdas, propagación, agua, bombonas, electricidad, cohetes
  levels.ts       los 6 escenarios (construidos con mapbuilder.ts)
  daily.ts        reto diario con semilla por fecha
  dailyTable.ts   semillas verificadas por el bot (generado; no editar)
  bot.ts          bot que juega (dificultad, demo del menú, validación del diario)
src/render/     Three.js: suelo con quemado/mojado dinámico, modelos, llamas, humo, agua, manguera
src/ui/         HUD, pantallas, avisos e iconos sobre el mundo
src/audio.ts    efectos sintetizados con WebAudio y reproductor de música
src/main.ts     flujo del juego y bucle principal
src/platform.ts diferencias por plataforma (SDK de CrazyGames, Capacitor en Android, web)
src/storage.ts  partida guardada (localStorage y, en CrazyGames, su módulo Data en la nube)
src/analytics.ts eventos a Supabase
src/privacidad.html, src/testers.html   páginas /privacidad y /testers de la web
android/        proyecto Android (Capacitor 8)
tools/          bot.ts (dificultad), sweep.ts, trace.ts, daily-table.ts, assets.py (iconos y portadas),
                store_shots.py (capturas de Play), video.py y render.sh (vídeos), testers_assets.py,
                _cgtest.py y _cgdata_test.py (pruebas del SDK de CrazyGames con Playwright)
docs/           concepto.md (criterios de muerte), crazygames.md, google-play.md, testers.md
assets/         música, iconos, og.png, portadas de CrazyGames, gráficos de Play (play/),
                iconos de Android (android/) e imágenes de la página de testers (testers/)
```

No están en el repositorio (ver `.gitignore`): `node_modules/`, las salidas generadas (`dist/`, `build/` con los vídeos, `shots/`) y la clave de firma de Android.

## Comandos

```bash
npm install
node build.mjs                 # compila todas las versiones (ver abajo)
npx tsc --noEmit -p .          # comprobar tipos
npx tsx tools/bot.ts 10        # tasa de victoria por nivel (bot PRO y casual)
npx tsx tools/daily-table.ts   # regenerar las semillas del reto diario tras tocar la simulación
python3 tools/assets.py        # iconos, imagen para redes (og.png) y portadas de CrazyGames
tools/render.sh x              # vídeo promocional vertical (repetir hasta que no queden clips; luego: tools/render.sh x encode)
```

`node build.mjs` genera cuatro versiones desde el mismo código:

| Versión | Carpeta | Diferencias |
|---|---|---|
| Web pública | `dist/web/` | Analítica activa, botón de compartir con enlace, metadatos para redes, manifiesto PWA, página de privacidad, fuentes alojadas en la propia web |
| CrazyGames | `dist/crazygames/` → `dist/apagalo-crazygames.zip` | SDK de CrazyGames, sin enlaces externos, todo dentro del zip |
| Android | `dist/android/` | Lo empaqueta Capacitor (ver abajo): compartir nativo y botón atrás del sistema |
| Artefacto de Claude | `dist/artifact.html` | Sin analítica |

Para probarlo en local, sirve `dist/` con cualquier servidor estático (por ejemplo `python3 -m http.server -d dist` y abre `/web/`). Abierto como archivo (`file://`) las fuentes no cargan. En local la analítica no envía nada.

## Publicación

La web está en **https://apagalo.vercel.app** (proyecto `apagalo` de Vercel). Para publicar una versión nueva:

```bash
node build.mjs
cd dist/web
npx vercel@latest link --project apagalo   # solo la primera vez en cada ordenador
npx vercel@latest deploy --prod
```

La ficha y el paquete de CrazyGames están en `docs/crazygames.md`.

## App de Android (Google Play)

La app es el mismo juego empaquetado con Capacitor 8 (carpeta `android/`, paquete `com.nocodeboy.apagalo`, objetivo Android 16 / API 36). Pantalla completa, pantalla siempre encendida, botón atrás del sistema integrado (pausa / vuelve / sale desde el título) y compartir con el menú nativo.

```bash
node build.mjs && npx cap sync android          # copia dist/android dentro del proyecto Android
cd android && ./gradlew bundleRelease           # app/build/outputs/bundle/release/app-release.aab
```

Para firmar hace falta `android/keystore.properties` y `android/keystore/apagalo-upload.jks` (no van en el código: están en la carpeta `NO-COMPARTIR`). Antes de cada subida, sube `versionCode` y `versionName` en `android/app/build.gradle`. La ficha, las respuestas de Play Console y el estado están en `docs/google-play.md`.

## Controles

- **Móvil:** con el pulgar izquierdo te mueves y con el derecho apuntas y echas agua (tiene ayuda de puntería). Las boquillas se eligen a la derecha.
- **Escritorio:** WASD para moverte, ratón para apuntar y clic (o espacio) para echar agua. Boquillas con 1/2/3, Q/E, rueda o clic derecho. Pausa con Esc.

## Calidad gráfica

Por defecto está en **Automática**: los móviles empiezan en calidad media y los ordenadores en alta. Cada 2,5 s el juego mide los fotogramas; si baja de ~40 fps dos veces seguidas, reduce la resolución, las sombras, las luces del fuego y las partículas. Si en calidad media va sobrado (≥ 55 fps) sube una vez a alta. El nivel elegido se recuerda en ese dispositivo. En pantallas de 120 Hz dibuja a 60 fps para no gastar el doble de batería. En Ajustes se puede fijar a mano (Alta / Media / Ahorro).

## Analítica

`src/analytics.ts` manda los eventos por lotes a Supabase (proyecto Tools-NoCode) a través de dos funciones: `apagalo_track` (eventos) y `apagalo_submit_daily` (resultado del reto diario, que devuelve en qué puesto quedas). Las tablas `apagalo_events` y `apagalo_daily_scores` tienen RLS sin políticas: la clave pública no puede leerlas ni escribir en ellas directamente, solo llamar a esas funciones, que validan los datos.

Eventos: `first_open`, `session_end`, `ping`, `level_start`, `level_complete`, `level_fail`, `daily_start`, `daily_complete`, `daily_fail`, `share`, `quality_tier`... Cada uno lleva un identificador aleatorio del navegador (sin datos personales), la versión y la plataforma (`web`, `crazygames`, `android`). El jugador puede desactivarlo en Ajustes; la política está en `/privacidad`.

Consultas listas en Supabase:

```sql
select * from apagalo_kpis;      -- jugadores, % que sigue al minuto 1, % que completa el nivel 1, sesión media, D1
select * from apagalo_niveles;   -- embudo por nivel: empiezan, ganan, pierden, estrellas, % salvado, tiempo
select * from apagalo_cohortes;  -- nuevos por día con D1 y D7
```

## Siguientes pasos

1. Google Play: mantener ≥ 12 testers durante 14 días, recoger sus comentarios y pedir el acceso a producción (guía en `docs/testers.md`). Aprovechar para subir la 1.2.1 (`versionCode` 2) con los cambios que salgan de la prueba.
2. CrazyGames: terminar la revisión de calidad y enviar a Basic Launch (`docs/crazygames.md`).
3. Tras 7-14 días con tráfico, decidir con los criterios de `docs/concepto.md` mirando `apagalo_kpis` y `apagalo_niveles`.
