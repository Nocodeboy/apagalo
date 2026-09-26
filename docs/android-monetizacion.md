# Anuncios y compras en la app de Android

Estado a 26 sept 2026, versión 1.3.0 (`versionCode` 2). La app ya lleva AdMob (anuncios con recompensa y entre niveles, con el formulario de consentimiento de Google para la UE y el Reino Unido) y Google Play Billing (compras dentro de la app). Por defecto funciona con los **anuncios de prueba de Google**: no ganan dinero y se pueden tocar sin riesgo. Para cobrar de verdad hay que hacer lo que explica esta guía en AdMob y en Play Console, pegar tres identificadores y cambiar un interruptor.

## Qué hay en el código

| Pieza | Qué es |
|---|---|
| `@capacitor-community/admob` 8.1 | Anuncios de AdMob (SDK de Google Mobile Ads 25.4) y consentimiento UMP. Compatible con Capacitor 8 |
| `@capgo/native-purchases` 8.8 | Google Play Billing Library 9.1: productos de compra única, consumir y confirmar, restaurar. Sin servidor propio ni cuenta de terceros |
| `src/monetize/android.ts` | El adaptador. Arriba del todo está `ADMOB_CONFIG`, lo único que hay que tocar |
| `android/app/src/main/AndroidManifest.xml` | Id de la app de AdMob (ahora el de prueba de Google) y permisos `AD_ID` y `BILLING` |
| `android/app/src/main/res/values*/strings.xml` | Nombre bajo el icono: «Put It Out!» por defecto y «¡Apágalo!» en móviles en español |

Cómo se comporta:

- **Al arrancar**, primero pide a Google el estado del consentimiento. Si el jugador está en la UE o el Reino Unido y aún no ha decidido, muestra el formulario de Google. Después inicia AdMob y deja cargado un anuncio con recompensa y uno entre niveles. Tras mostrar uno, carga el siguiente. Si no hay anuncio (sin conexión, sin inventario), reintenta cada vez más espaciado, hasta cada 5 minutos.
- **Anuncio con recompensa:** el juego solo da el premio si Google avisa de que se ha visto entero. Si el jugador lo cierra antes, no hay premio.
- **Ninguna llamada se queda colgada:** todas tienen tiempo máximo y nunca lanzan errores al juego.
- **Compras:** las monedas (`coins_s`, `coins_m`, `coins_l`) se consumen tras la compra, así se pueden volver a comprar. `remove_ads` y `starter_pack` se confirman (acknowledge), porque si no Google las reembolsa a los 3 días. «Restaurar compras» devuelve los productos no consumibles de la cuenta de Google.
- **Compras interrumpidas:** si alguien paga y la app se cierra antes de terminar, o paga con un método lento (efectivo en tienda), la compra queda pendiente en Google. La próxima vez que toque ese mismo producto se le entrega sin cobrarle otra vez.

Pendiente en el juego (no está en este adaptador): un botón «Opciones de privacidad» en Ajustes. La política de consentimiento de Google en la UE exige que el jugador pueda cambiar su decisión. `android.ts` exporta `androidPrivacyOptionsRequired()` (dice si hay que enseñar el botón) y `showAndroidPrivacyOptions()` (abre el formulario de Google).

## Qué crear en AdMob

Documentación general: [Getting started guide](https://support.google.com/admob/answer/15948559).

1. **Cuenta de AdMob** en https://admob.google.com con tu cuenta de Google.
2. **Añadir la app** (Apps › Add app › Android). A «¿Está publicada en una tienda compatible?» responde **No** mientras la app siga en prueba cerrada: AdMob no puede enlazar apps que no son públicas en Play. Ponle de nombre «Put It Out!». Hasta que la enlaces y la revisen tendrá anuncios limitados. Cuando la app salga a producción, vuelve y enlázala con Google Play (App settings › App store details). Ver [Set up an app in AdMob](https://support.google.com/admob/answer/9989980) y [Link your app to an app store](https://support.google.com/admob/answer/10037806).
3. **Dos bloques de anuncios** (Ad units):
   - Uno **Rewarded** (con recompensa), por ejemplo «android_rewarded». La cantidad y el nombre de la recompensa dan igual: el juego decide qué da. Ver [Create a rewarded ad unit](https://support.google.com/admob/answer/7311747).
   - Uno **Interstitial** (entre niveles), por ejemplo «android_interstitial». El juego ya limita cuándo sale; no hace falta límite de frecuencia en AdMob. Ver [Create an interstitial ad unit](https://support.google.com/admob/answer/7311435).
4. **Privacidad y mensajes** (Privacy & messaging):
   - En la configuración de la app, añade la URL de la política de privacidad: https://apagalo.vercel.app/privacidad ([Add a privacy policy URL](https://support.google.com/admob/answer/10113106)).
   - Crea y **publica** un mensaje de «European regulations» (el antiguo mensaje GDPR) para esta app, en español e inglés ([Create a European regulations message](https://support.google.com/admob/answer/10113207)). Sin él, el formulario no aparece y en la UE y el Reino Unido casi no habrá anuncios.
   - Opcional: el mensaje para leyes estatales de EE. UU. ([US states privacy laws](https://support.google.com/admob/answer/9561022)). El SDK lo aplica solo.
5. **Pagos**: Payments › Settings. Completa el perfil de pagos, la información fiscal y la cuenta bancaria. AdMob paga cuando el saldo supera el umbral (70 € en euros) ([Payment thresholds](https://support.google.com/admob/answer/2772208), [Steps to getting paid](https://support.google.com/admob/checklist/2998383)). Como facturas como autónomo, confirma con tu gestoría los datos fiscales (NIF-IVA intracomunitario, ya que paga Google Ireland).

## Dónde pegar los identificadores

1. En `src/monetize/android.ts`, dentro de `ADMOB_CONFIG`:
   - `REAL_AD_UNITS.rewarded` y `REAL_AD_UNITS.interstitial`: los ids de los dos bloques (`ca-app-pub-…/…`, con barra).
   - `USE_TEST_ADS: false`.
2. En `android/app/src/main/AndroidManifest.xml`, en `com.google.android.gms.ads.APPLICATION_ID`: el id de la app (`ca-app-pub-…~…`, con virgulilla). Tiene que ser de la misma app de AdMob que los bloques.
3. Compila como siempre (`npm run android:sync` y `cd android && ./gradlew bundleRelease`).

Si pones `USE_TEST_ADS: false` sin pegar los ids, la app no muestra anuncios (no se rompe). **No toques nunca tus propios anuncios reales**: AdMob puede suspender la cuenta por clics no válidos. Para probar con los ids reales, mete tu móvil en `TEST_DEVICE_IDS` (ver «Pruebas»).

## Archivo app-ads.txt

AdMob comprueba que la web del desarrollador que figura en la ficha de Play autoriza a Google a vender tus anuncios ([Set up an app-ads.txt file](https://support.google.com/admob/answer/9363762)). La web de la ficha es https://apagalo.vercel.app, así que el archivo tiene que estar en **https://apagalo.vercel.app/app-ads.txt** con esta línea, cambiando el número por tu id de editor (AdMob › Settings › Account information, «Publisher ID»):

```
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

AdMob muestra la línea exacta en Apps › View all apps › app-ads.txt; copia la suya. Para publicarlo: guarda el archivo como `assets/app-ads.txt` y haz que `build.mjs` lo copie a `dist/web/` (igual que `og.png`), y despliega la web. AdMob tarda hasta 24 horas en leerlo.

## Productos en Play Console

Requisitos previos:

- **Perfil de pagos** de comerciante vinculado a la cuenta de desarrollador (Configuración › Perfil de pagos). Sin él no se pueden crear productos ([Create a payments profile](https://support.google.com/googleplay/android-developer/answer/7161426)).
- Haber subido a alguna pista (la prueba cerrada vale) una versión con el permiso `BILLING`: la 1.3.0 ya lo lleva ([Create an in-app product](https://support.google.com/googleplay/android-developer/answer/1153481)).

Después, en **Monetizar con Play › Productos › Productos de compra única › Crear** (en inglés: Monetize with Play › Products › One-time products › Create one-time product; [Overview of one-time products](https://support.google.com/googleplay/android-developer/answer/16430488)), crea estos cinco. El id tiene que ser exactamente este: no se puede cambiar ni reutilizar después.

| Id del producto | Qué da en el juego | Tipo en el código | Precio base sugerido |
|---|---|---|---|
| `remove_ads` | Quita los anuncios entre niveles + 500 monedas | No consumible | 2,99 USD |
| `starter_pack` | Pack de inicio: 3.000 monedas | No consumible (una vez por cuenta) | 1,99 USD |
| `coins_s` | 1.000 monedas | Consumible | 0,99 USD |
| `coins_m` | 6.000 monedas | Consumible | 4,99 USD |
| `coins_l` | 14.000 monedas | Consumible | 9,99 USD |

Para cada uno: nombre y descripción en español e inglés que digan exactamente lo que da, una opción de compra de tipo **Comprar** (Buy), el precio en dólares dejando que Play lo convierta a cada país, y **Activar**. En Play Console no se marca si es consumible: eso lo decide el código (consume las monedas y confirma los otros dos). Los ids y las monedas salen de `PRODUCTS` en `src/monetize/types.ts`; si cambian allí, hay que cambiarlos aquí.

## Pruebas

**Anuncios de prueba (lo que hay ahora).** Compila e instala una versión de depuración (`npm run android:sync`, luego `cd android && ./gradlew installDebug` con el móvil conectado). Los anuncios llevan la etiqueta «Test Ad». Comprueba que el de recompensa solo premia si lo ves hasta el final y que el juego sigue bien al cerrar cada anuncio. Ids de prueba de Google: [Enable test ads](https://developers.google.com/admob/android/test-ads).

**Formulario de consentimiento.** El formulario es el mensaje europeo que publicas en tu cuenta de AdMob, así que para verlo hacen falta el id de app real en el manifiesto y ese mensaje publicado (con el id de app de prueba, Google no tiene ningún mensaje tuyo que enseñar; la app sigue cargando anuncios de prueba igualmente). Luego:

1. Abre la app una vez con el móvil conectado y busca en Logcat el identificador de dispositivo (una línea con `addTestDeviceHashedId("…")` o `setTestDeviceIds(Arrays.asList("…"))`).
2. Ponlo en `TEST_DEVICE_IDS` y pon `DEBUG_CONSENT_IN_EEA: true`. Ese móvil se comporta como si estuviera en la UE y además recibe anuncios de prueba aunque uses los ids reales.
3. Para que vuelva a salir el formulario, borra los datos de la app. Antes de publicar, vuelve a dejar `DEBUG_CONSENT_IN_EEA: false`. `TEST_DEVICE_IDS` puede quedarse con tus móviles.

Referencia: [UMP SDK para Android](https://developers.google.com/admob/android/privacy).

**Compras.** Los probadores con licencia pagan con tarjetas de prueba y no se les cobra ([Test your Google Play Billing Library integration](https://developer.android.com/google/play/billing/test), [Test in-app billing with application licensing](https://support.google.com/googleplay/android-developer/answer/6062777)).

1. Play Console › Configuración › Pruebas de licencias (Settings › License testing): añade tu cuenta de Gmail y la de quien vaya a probar.
2. Los productos tienen que estar activos. Con un probador con licencia sirve la versión de depuración instalada por cable (el paquete tiene que ser `com.nocodeboy.apagalo`); si no, instala desde la prueba cerrada.
3. Casos que conviene probar:
   - Comprar `coins_s` dos veces seguidas (las dos deben dar monedas).
   - Comprar `remove_ads`, desinstalar, reinstalar y usar «Restaurar compras».
   - Cancelar en la hoja de pago de Google (no debe dar nada).
   - Pagar con «Slow test card, approves after a few minutes»: al principio no da nada. Cuando Google la aprueba, se entrega la próxima vez que se toque ese producto (monedas) o al restaurar (`remove_ads`, `starter_pack`).
   - Tarjeta que rechaza: no debe dar nada.

## Declaraciones de Play Console que cambian

Al subir la 1.3.0 a producción (o antes, en la prueba cerrada), actualiza en **Contenido de la app**:

- **Anuncios:** «Sí, mi app contiene anuncios». La ficha mostrará «Contiene anuncios» ([Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455)).
- **ID de publicidad:** «Sí, usa el ID de publicidad», para publicidad o marketing, análisis y prevención de fraude, seguridad y cumplimiento. La app declara el permiso `com.google.android.gms.permission.AD_ID` ([Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248)).
- **Seguridad de los datos** ([Data safety](https://support.google.com/googleplay/android-developer/answer/10787469), [qué recoge el SDK de AdMob](https://developers.google.com/admob/android/privacy/play-data-disclosure)). Además de lo que ya está declarado, añade lo que recoge AdMob, cifrado en tránsito:
  - Ubicación › Ubicación aproximada (la dirección IP).
  - Actividad en la app › Interacciones con la app (aperturas, toques, vídeos vistos).
  - Información y rendimiento de la app › Diagnósticos.
  - IDs de dispositivo u otros (ID de publicidad, app set ID).
  - Para todos: recogidos y **compartidos** (van a Google para servir anuncios), obligatorios (no se pueden desactivar en la app), con fines de publicidad o marketing, análisis y prevención de fraude, seguridad y cumplimiento. Hoy la respuesta «Se comparten con terceros: no» deja de ser cierta.
  - Si la analítica del juego llega a registrar compras, añade también Información financiera › Historial de compras.
- **Clasificación de contenido (IARC):** repite el cuestionario y marca que tiene compras digitales dentro de la app. La ficha mostrará «Compras en aplicaciones».
- **Público objetivo:** déjalo en 13+ (13-15, 16-17 y 18+). Si se incluyeran menores de 13, se aplicaría la política de familias y habría que configurar los anuncios de otra forma.

Y fuera de «Contenido de la app»:

- **Ficha de la tienda:** quita «Sin anuncios y sin compras» de la descripción completa (en `docs/google-play.md` también).
- **Política de privacidad** (`/privacidad`): tiene que mencionar AdMob (Google), el ID de publicidad, el consentimiento y las compras a través de Google Play.
- **Estado de comerciante (Ley de Servicios Digitales de la UE):** revisa tu declaración en la cuenta de desarrollador. Con anuncios y compras lo normal es declararte comerciante, y entonces tu dirección y teléfono se muestran a los usuarios de la UE.

## Resumen de lo que tienes que hacer tú

1. AdMob: cuenta, app «Put It Out!» (sin enlazar de momento), dos bloques, URL de privacidad, mensaje europeo publicado, pagos e información fiscal.
2. Pegar los dos ids de bloque y `USE_TEST_ADS: false` en `android.ts`, y el id de app en el manifiesto.
3. Publicar `app-ads.txt` en la web.
4. Play Console: perfil de pagos, los cinco productos activos, probadores con licencia.
5. Declaraciones: anuncios, ID de publicidad, seguridad de los datos, IARC, descripción y política de privacidad.
6. Cuando la app salga a producción: enlazarla con Google Play en AdMob.
