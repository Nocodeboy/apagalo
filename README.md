# ¡Apágalo! (Put It Out!)

Arcade casual en 3D low-poly: eres un bombero con la manguera atada al camión y apagas incendios que se propagan en tiempo real. Tiene 6 escenarios, un reto diario y mejoras que se compran con las monedas de cada partida. Funciona en web y en móvil, en español y en inglés. En inglés se llama **Put It Out!** (en la web y en las fichas, «Put It Out! Firefighter»); quien juega en español sigue viendo «¡Apágalo!».

| Dónde | Estado |
|---|---|
| Web | https://apagalo.vercel.app (publicada) |
| Google Play | Prueba cerrada «Prueba cerrada - Alpha» desde el 25 sept 2026 (12 testers × 14 días antes de pedir producción). Captación: https://apagalo.vercel.app/testers |
| CrazyGames | Borrador completo, listo para enviar a revisión (Basic Launch) |

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
src/ui/         HUD, pantallas, avisos e iconos sobre el mundo (shop.ts: tienda y oferta de inicio)
src/audio.ts    efectos sintetizados con WebAudio y reproductor de música
src/main.ts     flujo del juego y bucle principal
src/economy.ts  monedas por partida, mejoras (coste y efecto) y lo que da cada compra
src/monetize/   anuncios y compras (ver «Monetización»)
  types.ts        contrato común: AdProvider, IapProvider, lugares de anuncio y catálogo de productos
  index.ts        elige el proveedor según la versión, topes de anuncios, pausa y analítica
  android.ts      AdMob (con consentimiento UMP) y Google Play Billing
  crazygames.ts   anuncios del SDK v3 de CrazyGames (desactivados por defecto)
  fake.ts         proveedor de prueba para los tests (?fakeads=1)
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
npm run bot            # tasa de victoria por nivel (bot PRO y casual); con mejoras: npx tsx tools/bot.ts 10 --up=max
npm run daily-table    # regenera las semillas del reto diario; obligatorio tras tocar la simulación
npm run deploy:web     # compila y publica la web en Vercel
npm run android:sync   # compila y copia el juego dentro del proyecto Android
CG_ADS=1 node build.mjs  # igual que build, con anuncios en CrazyGames (solo a partir del Full Launch)
```

`node build.mjs` genera cuatro versiones desde el mismo código:

| Versión | Carpeta | Diferencias |
|---|---|---|
| Web pública | `dist/web/` | Analítica activa, botón de compartir con enlace, metadatos para redes en inglés, manifiesto PWA, página de privacidad, fuentes alojadas en la propia web. Sin anuncios ni compras |
| CrazyGames | `dist/crazygames/` → `dist/apagalo-crazygames.zip` | SDK de CrazyGames, sin enlaces externos, todo dentro del zip. Anuncios del SDK solo si se compila con `CG_ADS=1` |
| Android | `dist/android/` | Lo empaqueta Capacitor (ver abajo): compartir nativo, botón atrás del sistema, anuncios de AdMob y compras de Google Play |
| Artefacto de Claude | `dist/artifact.html` | Sin analítica |

Para probarlo en local: `npm run serve` y abre http://127.0.0.1:8765/web/. Abierto como archivo (`file://`) las fuentes no cargan. En local la analítica no envía nada. Con `?fakeads=1` (http://127.0.0.1:8765/web/?fakeads=1) se prueban los anuncios y la tienda sin SDK (ver «Monetización»).

## Publicación

**Web** (https://apagalo.vercel.app, proyecto `apagalo` de Vercel): `npm run deploy:web`. La primera vez en cada ordenador hay que enlazar la carpeta: `cd dist/web && npx vercel@latest link --project apagalo`.

**CrazyGames**: sube `dist/apagalo-crazygames.zip`. Estado, ficha y pasos en `docs/crazygames.md`.

**Google Play**: la app es el mismo juego empaquetado con Capacitor 8 (carpeta `android/`, paquete `com.nocodeboy.apagalo`, objetivo Android 16 / API 36). Tiene pantalla completa, la pantalla siempre encendida, el botón atrás del sistema integrado (pausa, vuelve o sale desde el título) y compartir con el menú nativo.

```bash
RELEASE=1 npm run android:sync            # compila (sin anuncios de prueba) y copia dist/android dentro del proyecto Android
cd android && ./gradlew bundleRelease     # android/app/build/outputs/bundle/release/app-release.aab
```

Con `RELEASE=1`, `build.mjs` no compila la versión de Android si sigue con los anuncios de prueba de Google (`USE_TEST_ADS: true` en `src/monetize/android.ts` o el id de app de prueba en `AndroidManifest.xml`), y `bundleRelease`/`assembleRelease` fallan por lo mismo. Mientras la prueba cerrada use anuncios de prueba a propósito: `npm run android:sync` y `./gradlew bundleRelease -PallowTestAds`. Detalles en `docs/android-monetizacion.md`.

Para firmar hace falta `android/keystore.properties` y `android/keystore/apagalo-upload.jks`. No van en el repositorio: están en la carpeta `NO-COMPARTIR`. Antes de cada subida, sube `versionCode` y `versionName` en `android/app/build.gradle` y `VERSION` en `build.mjs`. Los pasos completos, la ficha y las respuestas de Play Console están en `docs/google-play.md`.

## Controles

- **Móvil:** con el pulgar izquierdo te mueves y con el derecho apuntas y echas agua (tiene ayuda de puntería). Las boquillas se eligen a la derecha.
- **Escritorio:** WASD para moverte, ratón para apuntar y clic (o espacio) para echar agua. Boquillas con 1/2/3, Q/E, rueda o clic derecho. Pausa con Esc.

## Calidad gráfica

Por defecto está en **Automática**: los móviles empiezan en calidad media y los ordenadores en alta. Cada 2,5 s el juego mide los fotogramas; si baja de ~40 fps dos veces seguidas, reduce la resolución, las sombras, las luces del fuego y las partículas. Si en calidad media va sobrado (≥ 55 fps) sube una vez a alta. El nivel elegido se recuerda en ese dispositivo. En pantallas de 120 Hz dibuja a 60 fps para no gastar el doble de batería. En Ajustes se puede fijar a mano (Alta / Media / Ahorro).

## Monedas, mejoras y tienda

Cada partida da monedas, ganes o pierdas: 50 + 50 por estrella + hasta 50 según el % salvado (de 50 a 250). El primer resultado del día en el reto diario da 100 si pierdes y 200, 250 o 300 según las estrellas; si lo repites, paga como un nivel. Con las monedas se compran mejoras en la tienda (título o pantalla final): manguera más larga, más presión, botas y más tiempo, 5 niveles cada una a 200/500/1.000/2.000/4.000 monedas. El reto diario no aplica mejoras para que la clasificación sea justa. Efectos y equilibrio medido con el bot: `docs/dificultad.md`.

Como referencia, una victoria con 3 estrellas da unas 250 monedas: comprar todas las mejoras (30.800) lleva unas 120 victorias así (más partidas jugando normal, menos con el x2 y las monedas gratis).

## Monetización

El juego solo habla con el contrato de `src/monetize/types.ts` (`AdProvider` e `IapProvider`); `src/monetize/index.ts` elige el proveedor según la versión:

| Versión | Anuncios | Compras |
|---|---|---|
| Android | AdMob, con el consentimiento de Google (UMP) en el EEE y el Reino Unido | Google Play Billing |
| CrazyGames | SDK de CrazyGames, solo si se compila con `CG_ADS=1` (define `__CG_ADS__`, falso por defecto: CrazyGames no permite anuncios en el Basic Launch; ver `docs/crazygames.md`) | No |
| Web | No, de momento | No |
| Web y CrazyGames en local (127.0.0.1 o localhost) con `?fakeads=1` | Falsos: duran ~1 s y siempre dan la recompensa (`?fakeads=fail`: siempre fallan) | Falsas: siempre salen bien |

Si no hay anuncio con recompensa listo, sus botones no aparecen; si no hay tienda, tampoco la sección de compras. Mientras se ve un anuncio el juego se para y se silencia, y si un anuncio o una compra fallan el juego sigue sin bloquearse.

- **Con recompensa** (siempre los elige el jugador, y el botón dice «Anuncio»/«Ad» además del icono): +30 s cuando se acaba el tiempo (una vez por intento y nunca en el reto diario), x2 de monedas en la pantalla final (una vez) y +150 monedas gratis en la tienda (3 al día, y como mucho 3 en 24 h aunque se cambie la fecha del móvil). El premio del reto diario tampoco se cobra más de 3 veces en 24 h.
- **Entre niveles**: solo al pulsar «Siguiente» en la pantalla final, que lleva a la presentación del nivel (nunca con «Reintentar», que empieza a jugar directamente, ni con «Menú» o el botón atrás). Solo si hay al menos 3 niveles terminados en total, 2 desde el último anuncio entre niveles y 120 s desde el último anuncio a pantalla completa (también los de recompensa); nunca en la primera sesión, nunca si se ha comprado «Sin anuncios» y nunca en la misma transición que un anuncio con recompensa (x2 o +30 s en ese intento) o que la oferta de inicio. Si no hay anuncio cargado, no cuenta. Los topes son constantes al principio de `src/monetize/index.ts`.
- **Compras** (solo Android): «Sin anuncios» (+500 monedas), pack de inicio (3.000 monedas, una sola vez; además se ofrece en una ventana tras completar el segundo nivel) y packs de 1.000, 6.000 y 14.000 monedas. Los precios los da la tienda y un producto que la tienda no devuelve no se muestra. Cada compra se entrega y se guarda antes de consumirla, y la partida recuerda su identificador, así que nunca se entrega dos veces; las pagadas que no llegaron a entregarse (app cerrada, pago pendiente que se confirma después) se entregan al arrancar o al volver a la app. «Restaurar compras» recupera lo comprado; lo que no se consume se concede una sola vez por partida guardada. «Borrar progreso» borra también las monedas compradas (lo avisa antes); «Sin anuncios» se conserva.

Prueba de punta a punta: `python3 tools/test_monetize.py` (con `dist/` servido), en español y en inglés.

## Analítica

`src/analytics.ts` manda los eventos por lotes a Supabase (proyecto Tools-NoCode) a través de dos funciones: `apagalo_track` (eventos) y `apagalo_submit_daily` (resultado del reto diario, que devuelve en qué puesto quedas). Las tablas `apagalo_events` y `apagalo_daily_scores` tienen RLS sin políticas: la clave pública no puede leerlas ni escribir en ellas directamente, solo llamar a esas funciones, que validan los datos.

Eventos: `first_open`, `session_start`, `session_end`, `ping`, `level_start`, `level_complete`, `level_fail`, `daily_start`, `daily_complete`, `daily_fail`, `share`, `quality_tier`... Cada uno lleva un identificador aleatorio del navegador (sin datos personales), la versión y la plataforma (`web`, `crazygames`, `android`). `first_open` y `session_start` llevan además el idioma del dispositivo (`loc`, p. ej. `en-US`) y su zona horaria (`tz`, p. ej. `America/New_York`), que dan la región aproximada. El jugador puede desactivarlo en Ajustes; la política está en `/privacidad`.

Economía y monetización: `coins_earn {src, n}` (`src`: `level`, `daily`, `x2`, `free`, `iap`, `restore`), `coins_spend {item, n}`, `upgrade {id, lvl}`, `shop_open {from}`, `ad_offer {pl}`, `ad_show {pl, type}` (el intersticial, solo si de verdad se ha mostrado), `ad_reward {pl}`, `ad_fail {pl}`, `iap_start {id}`, `iap_ok {id}`, `iap_pending {id}` (pago pendiente), `iap_fail {id}`, `iap_recover {id}` (compra pagada entregada al arrancar o al volver a la app) y `offer_show {id}` (la oferta de inicio). `level_complete` y `level_fail` llevan `cont: true` si el jugador usó los +30 s.

Consultas listas en Supabase:

```sql
select * from apagalo_kpis;      -- jugadores, % que sigue al minuto 1, % que completa el nivel 1, sesión media, D1
select * from apagalo_niveles;   -- embudo por nivel: empiezan, ganan, pierden, estrellas, % salvado, tiempo
select * from apagalo_cohortes;  -- nuevos por día con D1 y D7
select * from apagalo_regiones;   -- jugadores y D1/D7 por grupo de países (EE. UU., resto de primer nivel, España, resto), desde la 1.3.0
select * from apagalo_paises;     -- lo mismo por país (del idioma del dispositivo)
select * from apagalo_monetizacion; -- por día y plataforma: anuncios ofrecidos y vistos, recompensas, intersticiales, tienda, mejoras y compras
```

## Siguientes pasos

1. Google Play: llegar a 12 testers (y añadir el grupo de LaunchReady), mantenerlos 14 días, recoger sus comentarios y pedir el acceso a producción (guía en `docs/testers.md`). Aprovechar para subir la 1.2.1 (`versionCode` 2) con los cambios que salgan de la prueba.
2. CrazyGames: completar los datos de cobro y enviar a Basic Launch (`docs/crazygames.md`).
3. Tras 7-14 días con tráfico, decidir con los criterios de `docs/concepto.md` mirando `apagalo_kpis` y `apagalo_niveles`.
