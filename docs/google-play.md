# ¡Apágalo! en Google Play

## App

- **Nombre en la tienda:** ¡Apágalo! Bomberos
- **Paquete:** `com.nocodeboy.apagalo` (no se puede cambiar nunca)
- **Versión:** 1.2.0 (código 1) publicada en la prueba cerrada; 1.3.0 (código 2) preparada, con anuncios (AdMob) y compras (Google Play Billing) · Android 7.0 o superior (API 24) · objetivo Android 16 (API 36)
- **Nombre de la app en el móvil:** «Put It Out!» (en español, «¡Apágalo!»)
- **Permisos:** internet; desde la 1.3.0 también ID de publicidad (AD_ID) y facturación de Google Play (BILLING)
- **Archivo para Play:** `apagalo-1.2.0.aab` (firmado con la clave de subida)
- **APK para instalar a mano en tu móvil:** `apagalo-1.2.0.apk`

## Estado (26 sept 2026)

- Cuenta de Play Console: NoCodeBuilder (personal). Ficha completa y aprobada: textos, icono, gráfico destacado, 6 capturas, categoría Casual, contacto, privacidad, clasificación de contenido (IARC), público 13+, seguridad de los datos y demás declaraciones (respuestas abajo).
- **Prueba cerrada «Prueba cerrada - Alpha»**: versión 1.2.0, 177 países. Enviada a revisión el 25 sept a las 20:55 y **aprobada a las 21:13**.
  - Testers: el grupo de Google apagalo-testers@googlegroups.com. Cualquiera puede unirse; solo tú publicas; los miembros no se ven entre sí.
  - Enlace para aceptar la prueba: https://play.google.com/apps/testing/com.nocodeboy.apagalo
  - Ficha en Play: https://play.google.com/store/apps/details?id=com.nocodeboy.apagalo
  - Página para captar testers: https://apagalo.vercel.app/testers. Textos, calendario y problemas frecuentes en `docs/testers.md`.
  - Requisito para publicar en abierto: **12 testers apuntados sin interrupción durante 14 días**. El plazo cuenta desde que hay 12 a la vez; después se pide el acceso a producción desde el panel.
- **Prueba interna** (la primera, sigue activa): lista «Testers Torre Diaria», enlace https://play.google.com/apps/internaltest/4701507287428617045.
- Pendiente: añadir el grupo de LaunchReady a la prueba cerrada (ver `docs/testers.md`), llegar a 12 testers y subir una 1.2.1 (`versionCode` 2) con los cambios que salgan de la prueba.

## Archivos

Se generan con el código (ver «Compilar una versión nueva»). En la carpeta del portátil están en `publicacion\google-play\`: `apagalo-1.2.0.aab` (lo que se sube a Play), `apagalo-1.2.0.apk` (para instalar a mano), `icon-512.png`, `feature-1024x500.png` y `capturas\` (6 capturas de 1080×1920). Las imágenes salen de `assets/play/` (`tools/store_shots.py`).

## Compilar una versión nueva

1. Sube `versionCode` (entero, +1 cada vez) y `versionName` en `android/app/build.gradle`, y `VERSION` en `build.mjs`.
2. Copia la clave de firma a su sitio: `keystore.properties` → `android/keystore.properties` y `apagalo-upload.jks` → `android/keystore/apagalo-upload.jks` (están en `NO-COMPARTIR`; Git no los sube).
3. `RELEASE=1 npm run android:sync` (en Windows, `set RELEASE=1` antes) y después `cd android && ./gradlew bundleRelease` (en Windows, `gradlew.bat bundleRelease`). El archivo sale en `android/app/build/outputs/bundle/release/app-release.aab`. Las dos cosas fallan a propósito si la app sigue con los anuncios de prueba de Google; mientras la prueba cerrada los use a propósito, `npm run android:sync` y `./gradlew bundleRelease -PallowTestAds` (ver «Antes de publicar» en `docs/android-monetizacion.md`).
4. En Play Console → Prueba cerrada → Crear versión, sube el `.aab`, escribe las notas (español e inglés) y envíala a revisión.

## Clave de subida (guárdala: sin ella no puedes subir actualizaciones)

- Archivo: `apagalo-upload.jks` (carpeta `NO-COMPARTIR`, fuera del repositorio)
- Alias: `apagalo-upload`
- Contraseña: en `keystore.properties`, en la misma carpeta
- Huella SHA-256: `A0:F7:13:A0:8E:9F:9D:EE:21:82:E7:48:2B:03:9F:3C:18:CC:41:18:38:A9:B1:D0:A1:7D:BC:4B:1C:F2:19:03`

Google firma la app final con su propia clave (Play App Signing). Si pierdes la clave de subida, puedes pedir en Play Console que la cambien, pero tarda días. Haz una copia en un sitio seguro fuera del ordenador.

## Ficha de la tienda

**Descripción breve (máx. 80):**
Coge la manguera y apaga el fuego antes de que el viento lo extienda.

**Descripción completa:**

¡Apágalo! es un juego de bomberos en 3D: el fuego se extiende en tiempo real y el viento lo empuja. Coge la manguera, apunta a la base de las llamas y salva el pueblo antes de que sea tarde.

🔥 6 escenarios distintos
• Verbena en la plaza
• La granja de Doña Rosa: rescata a los animales
• La gasolinera: el combustible no se apaga con agua, usa espuma
• El polígono: corta la luz antes de mojar el cuadro eléctrico
• El Castañar: el viento cambia y hay que engancharse a las bocas de riego
• Noche de San Juan: caen cohetes del cielo

🚒 3 boquillas
Chorro para llegar lejos, abanico para protegerte del calor y espuma para los fuegos de combustible.

📅 Reto diario
Un incendio nuevo cada día, el mismo para todo el mundo. Mira en qué puesto quedas y comparte tu resultado.

⭐ Hasta 3 estrellas por nivel
Cuanto más pueblo salves y más animales rescates, más estrellas.

Controles sencillos: un pulgar para moverte y el otro para apuntar y echar agua.
Sin anuncios y sin compras. Se puede jugar sin conexión.

> A partir de la 1.3.0 esta frase deja de ser cierta: antes de publicar la 1.3.0 hay que cambiarla y actualizar las declaraciones de anuncios, ID de publicidad, seguridad de los datos y clasificación de contenido (lista completa en `docs/monetizacion.md` y `docs/android-monetizacion.md`). La ficha en inglés está en `docs/ficha-tienda-en.md`.

**Categoría:** Juegos › Casual
**Correo de contacto:** ghptiemblo@gmail.com · **Web:** https://apagalo.vercel.app
**Política de privacidad:** https://apagalo.vercel.app/privacidad

**Gráficos:** icono `icon-512.png`, gráfico destacado `feature-1024x500.png`, capturas de teléfono `1-granja.png` … `6-niveles.png` (1080×1920).

## Contenido de la app (respuestas)

- **Anuncios:** no contiene anuncios.
- **Acceso a la app:** todo disponible sin credenciales.
- **Público objetivo:** 13-15, 16-17 y 18+. No está dirigida a niños.
- **Clasificación de contenido (IARC):** juego; sin violencia contra personas ni animales (se apaga fuego), sin sangre, sin miedo, sin sexo, sin lenguaje malsonante, sin drogas, sin apuestas, sin interacción entre usuarios, no comparte ubicación, sin compras.
- **Seguridad de los datos:**
  - Recoge datos: sí. Se comparten con terceros: no. Cifrados en tránsito: sí (HTTPS).
  - Sin cuentas de usuario.
  - Actividad en la app › Interacciones con la app: recogida, no temporal, opcional (se puede desactivar en Ajustes), para funcionalidad (ranking del reto diario) y análisis.
  - Información y rendimiento › Otros datos de rendimiento: recogida, opcional, para análisis (calidad gráfica automática).
  - IDs de dispositivo u otros: identificador aleatorio de instalación, opcional, para funcionalidad y análisis.
  - Solicitud de borrado de datos: respondido «No» (pregunta opcional). Para marcar «Sí», Google pide una página con los pasos para pedir el borrado.
- **App de noticias / sanitaria / financiera / gubernamental:** no.
