# ¡Apágalo!

Arcade casual en 3D low-poly: eres un bombero con la manguera atada al camión y apagas incendios que se propagan en tiempo real. Tiene 6 escenarios y un reto diario. Funciona en web y en móvil, en español y en inglés.

| Dónde | Estado |
|---|---|
| Web | https://apagalo.vercel.app (publicada) |
| Google Play | Prueba cerrada «Prueba cerrada - Alpha» desde el 25 sept 2026 (12 testers × 14 días antes de pedir producción). Captación: https://apagalo.vercel.app/testers |
| CrazyGames | Borrador subido, pendiente de la revisión de calidad y del envío |

Estado detallado, siguientes pasos y dónde vive cada cosa (cuentas, carpetas, servicios): [docs/README.md](docs/README.md).

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
tools/          bot de dificultad, imágenes y vídeos, pruebas del SDK de CrazyGames (ver tools/README.md)
docs/           concepto, dificultad, Google Play, testers y CrazyGames (índice en docs/README.md)
assets/         música, iconos, og.png, portadas de CrazyGames, gráficos de Play (play/),
                iconos de Android (android/) e imágenes de la página de testers (testers/)
```

No están en el repositorio (ver `.gitignore`): `node_modules/`, las salidas generadas (`dist/`, `build/` con los vídeos, `shots/`) y la clave de firma de Android.

## Comandos

Requisitos: Node 22 o superior. Para las herramientas de imágenes y vídeo, además, Python 3 con Playwright y ffmpeg (detalles en `tools/README.md`). Para la app de Android, el SDK de Android con Java 21.

```bash
npm install
npm run build          # compila todas las versiones en dist/ (ver abajo)
npm run typecheck      # comprueba los tipos
npm run serve          # sirve dist/ en http://127.0.0.1:8765 (abre /web/)
npm run bot            # tasa de victoria por nivel (bot PRO y casual)
npm run daily-table    # regenera las semillas del reto diario; obligatorio tras tocar la simulación
npm run deploy:web     # compila y publica la web en Vercel
npm run android:sync   # compila y copia el juego dentro del proyecto Android
```

`node build.mjs` genera cuatro versiones desde el mismo código:

| Versión | Carpeta | Diferencias |
|---|---|---|
| Web pública | `dist/web/` | Analítica activa, botón de compartir con enlace, metadatos para redes, manifiesto PWA, página de privacidad, fuentes alojadas en la propia web |
| CrazyGames | `dist/crazygames/` → `dist/apagalo-crazygames.zip` | SDK de CrazyGames, sin enlaces externos, todo dentro del zip |
| Android | `dist/android/` | Lo empaqueta Capacitor (ver abajo): compartir nativo y botón atrás del sistema |
| Artefacto de Claude | `dist/artifact.html` | Sin analítica |

Para probarlo en local: `npm run serve` y abre http://127.0.0.1:8765/web/. Abierto como archivo (`file://`) las fuentes no cargan. En local la analítica no envía nada.

## Publicación

**Web** (https://apagalo.vercel.app, proyecto `apagalo` de Vercel): `npm run deploy:web`. La primera vez en cada ordenador hay que enlazar la carpeta: `cd dist/web && npx vercel@latest link --project apagalo`.

**CrazyGames**: sube `dist/apagalo-crazygames.zip`. Estado, ficha y pasos en `docs/crazygames.md`.

**Google Play**: la app es el mismo juego empaquetado con Capacitor 8 (carpeta `android/`, paquete `com.nocodeboy.apagalo`, objetivo Android 16 / API 36). Tiene pantalla completa, la pantalla siempre encendida, el botón atrás del sistema integrado (pausa, vuelve o sale desde el título) y compartir con el menú nativo.

```bash
npm run android:sync                      # copia dist/android dentro del proyecto Android
cd android && ./gradlew bundleRelease     # android/app/build/outputs/bundle/release/app-release.aab
```

Para firmar hace falta `android/keystore.properties` y `android/keystore/apagalo-upload.jks`. No van en el repositorio: están en la carpeta `NO-COMPARTIR`. Antes de cada subida, sube `versionCode` y `versionName` en `android/app/build.gradle` y `VERSION` en `build.mjs`. Los pasos completos, la ficha y las respuestas de Play Console están en `docs/google-play.md`.

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

1. Google Play: llegar a 12 testers (y añadir el grupo de LaunchReady), mantenerlos 14 días, recoger sus comentarios y pedir el acceso a producción (guía en `docs/testers.md`). Aprovechar para subir la 1.2.1 (`versionCode` 2) con los cambios que salgan de la prueba.
2. CrazyGames: terminar la revisión de calidad y enviar a Basic Launch (`docs/crazygames.md`).
3. Tras 7-14 días con tráfico, decidir con los criterios de `docs/concepto.md` mirando `apagalo_kpis` y `apagalo_niveles`.
