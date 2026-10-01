# ¡Apágalo! en Google Play

## App

- **Nombre en la tienda:** ¡Apágalo! Bomberos
- **Paquete:** `com.nocodeboy.apagalo` (no se puede cambiar nunca)
- **Versión:** 1.2.0 (código 1) publicada en la prueba cerrada; 1.3.0 (código 2) preparada, con anuncios (AdMob) y compras (Google Play Billing) · Android 7.0 o superior (API 24) · objetivo Android 16 (API 36)
- **Nombre de la app en el móvil:** «Put It Out!» (en español, «¡Apágalo!»)
- **Permisos:** internet; desde la 1.3.0 también ID de publicidad (AD_ID) y facturación de Google Play (BILLING)
- **Archivo para Play:** `apagalo-1.2.0.aab` (firmado con la clave de subida)
- **APK para instalar a mano en tu móvil:** `apagalo-1.2.0.apk`

## 2.2.0 (1 oct 2026)

- **Estado el 1 oct:** la 2.0.0 (código 3) seguía **en revisión** en producción desde el 30 sept, sin publicar. Germán decidió subir la 2.2.0 igualmente, aunque sustituye a la que está en revisión y la revisión vuelve a empezar.
- **Archivo:** `put-it-out-2.2.0.aab` en la raíz del repositorio (fuera de Git, `.git/info/exclude`): código 5, versión 2.2.0, anuncios reales, firmado con la clave de subida. Pesa 10,4 MB: la app lleva la música en Opus a 40 kbps (`build.mjs`), porque con las ocho canciones en MP3 pasaba de 13 MB. El APK para probar a mano es `put-it-out-2.2.0.apk`.
- **Qué trae respecto a la 2.0.0:** seis idiomas, música en el móvil desde el primer toque y una canción por tipo de escenario, el extintor portátil y el Pulaski (ver `diseno-v2.md`, «2.2»).
- **Notas de la versión** (como la 2.0.0 no llegó a publicarse, presentan el juego):

> en-US y en-GB: Put It Out! is here: 120 levels in 12 places, from the docks to a ski resort, with power-ups, surprise events, your own crew and a daily challenge. New: a portable extinguisher that lets you go beyond your hose, and the Pulaski to dig firebreaks fire can't cross. Now in 6 languages.

> es-ES: Llega ¡Apágalo!: 120 niveles en 12 sitios, del puerto a una estación de esquí, con objetos, sorpresas, tu propio equipo y un reto diario. Novedad: un extintor portátil para ir más allá de la manguera y el Pulaski para cavar cortafuegos que el fuego no cruza. Ahora en 6 idiomas.

## 2.0 a producción (30 sept 2026)

- La cuenta no tiene el requisito de 12 testers durante 14 días: producción está abierta.
- **Ficha:** idioma predeterminado **inglés (en-US)**, «Put It Out! Firefighter», con los textos 2.0 de `docs/ficha-tienda-en.md`. Lleva el icono, el gráfico destacado en inglés y 8 capturas (`assets/play-en/`: ciudad, puerto, granja, gasolinera, museo, camping, nieve, álbum). **en-GB** con sus 5 cambios de vocabulario; usa los gráficos de en-US. **es-ES**: «¡Apágalo! Bomberos», descripción 2.0 (sin «Sin anuncios y sin compras») y 8 capturas (las 6 de antes más `assets/play/v2-1-ciudad.png` y `v2-4-museo.png`, al principio).
- **Declaraciones:** anuncios sí, ID de publicidad (analítica, publicidad, fraude), seguridad de los datos con AdMob y compras, y clasificación IARC rehecha con «Compras de productos digitales» (sigue siendo para todas las edades).
- **Producción:** todos los países; versión «3 (2.0.0)» con notas en en-US, en-GB y es-ES. El `.aab` pesa 10,7 MB y se sube a mano (`publicacion\apagalo\google-play\put-it-out-2.0.0.aab`).
- Después de publicarla: vincular la app de AdMob con la ficha de Play (AdMob › Apps › Put It Out! › Configuración de la app).

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

🔥 67 niveles en 6 escenarios
• Verbena en la plaza
• La granja de Doña Rosa: rescata a los animales
• La gasolinera: el combustible no se apaga con agua, usa espuma
• El polígono: corta la luz antes de mojar el cuadro eléctrico
• El Castañar: el viento cambia y hay que engancharse a las bocas de riego
• Noche de San Juan: caen cohetes del cielo
Cada escenario vuelve diez veces más, cada vez más difícil, y la campaña acaba con «El gran incendio»: todo el pueblo ardiendo de noche, con todas las reglas a la vez.

🚒 3 boquillas
Chorro para llegar lejos, abanico para protegerte del calor y espuma para los fuegos de combustible.

📅 Reto diario
Un incendio nuevo cada día, el mismo para todo el mundo. Mira en qué puesto quedas y comparte tu resultado.

⭐ Hasta 3 estrellas por nivel
Cuanto más pueblo salves y más animales rescates, más estrellas.

Controles sencillos: un pulgar para moverte y el otro para apuntar y echar agua.
Sin anuncios y sin compras. Se puede jugar sin conexión.

> La publicada con la 1.2.0 decía «6 escenarios distintos»; la línea de los 67 niveles va con la versión que lleve la campaña. A partir de la 1.3.0 la frase de «Sin anuncios y sin compras» deja de ser cierta: antes de publicar la 1.3.0 hay que cambiarla y actualizar las declaraciones de anuncios, ID de publicidad, seguridad de los datos y clasificación de contenido (lista completa en `docs/monetizacion.md` y `docs/android-monetizacion.md`). La ficha en inglés está en `docs/ficha-tienda-en.md`.

**Descripción completa de la 2.0** (rama `v2`; 2.476 caracteres, cambia por esta al publicar la 2.0; descripción breve, la misma). La ficha en inglés, que es la principal, en `docs/ficha-tienda-en.md` («2.0»):

```text
¡Apágalo! es un juego de bomberos en 3D: el fuego se extiende en tiempo real y el viento lo empuja. Coge la manguera, apunta a la base de las llamas y salva el pueblo antes de que sea tarde.

🔥 120 niveles en 12 escenarios, cada uno con su regla
• Verbena en la plaza
• La granja de Doña Rosa: rescata a los animales
• La gasolinera: el combustible no se apaga con agua, usa espuma
• El polígono: corta la luz antes de mojar el cuadro eléctrico
• El Castañar: el viento cambia y hay que engancharse a las bocas de riego
• Noche de San Juan: caen cohetes del cielo
• El puerto: el gasóleo arde en el agua y el viento lo arrastra; solo la espuma lo para
• El centro: hay gente atrapada en las ventanas, súbeles la plataforma
• La estación: los trenes pasan con horario y cortan la manguera
• La estación de esquí: hielo que resbala, nieve honda y bocas de riego heladas
• El museo de noche: saca las obras de arte y tira de la palanca de los rociadores
• El camping: la hierba seca arde como nada, pero tienes un helicóptero de guardia
Los escenarios se mezclan: nunca juegas dos veces seguidas en el mismo sitio.

📰 Un gran incendio cada 10 niveles
Mapa más grande, más fuego y dos sorpresas. Si lo ganas, sales en la portada de «El Diario del Fuego». Colecciona las 12 portadas en tu álbum y compártelas.

⚡ Power-ups y sorpresas
Bomba turbo, botas, cronómetro, extintor, helicóptero y traje ignífugo aparecen en el suelo. Y atento: chaparrones, rachas de viento, fugas de gas, apagones, vecinos con cubos y curiosos que se acercan demasiado.

🐕 Tu equipo
Contrata a Lola, bombera con su propia manguera, a Chispa, el perro de rescate, y a un dron que echa agua. Súbelos de nivel y elige a quién llevas en cada misión.

🚒 3 boquillas
Chorro para llegar lejos, abanico para protegerte del calor y espuma para los fuegos de combustible.

🪙 Mejoras
Gana monedas en cada misión y gástalas en una manguera más larga, más presión, botas ligeras, más tiempo y tu equipo. En el reto diario no cuentan, para que el ranking sea justo. Los anuncios son opcionales: tú decides cuándo ver uno a cambio de 30 s más, el doble de monedas o apoyo aéreo.

📅 Reto diario
Un incendio nuevo cada día, el mismo para todo el mundo. Mira en qué puesto quedas y comparte tu resultado.

⭐ Hasta 3 estrellas por nivel
Cuanto más pueblo salves y a más gente y animales rescates, más estrellas.

Controles sencillos: un pulgar para moverte y el otro para apuntar y echar agua. Se puede jugar sin conexión.
```

Con la 2.0 no cambia ninguna declaración respecto a la 1.3.0: el apoyo aéreo es otro lugar de anuncio con recompensa (ya declarados) y «More games» solo abre la web de los otros juegos del estudio en el navegador. La 2.0 lleva `versionCode` 3 y `versionName` 2.0.0 (ya puestos en `android/app/build.gradle`).

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
