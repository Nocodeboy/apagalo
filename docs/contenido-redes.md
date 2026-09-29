# Contenido para redes: las 4 primeras semanas

26 sept 2026. Calendario orgánico en inglés para TikTok, YouTube Shorts, Instagram Reels y X, del lunes 28 sept al domingo 25 oct 2026 (las 4 semanas antes del paso a producción en Play, P). Las publicaciones van en inglés; las notas para ti, en español. Estrategia y conceptos de anuncio: [marketing.md](marketing.md).

## Lo esencial

- **4 vídeos verticales a la semana**, el mismo vídeo en las tres redes, subido de forma nativa en cada una y sin la marca de agua de otra red: Instagram anunció en 2021 que deja de promocionar en Reels los vídeos reciclados con marca de agua de otras apps ([GSMArena][ig-watermark]).
- **X en inglés** 3 veces por semana (hilos técnicos, capturas del sábado) y **X en español (@nocodeboy)** 2 veces por semana contando el proceso.
- **Solo juego real, con la interfaz en inglés.** Nada que no esté en la versión publicada.
- **Tiempo:** preparar los vídeos por tandas el fin de semana. presskit.gg recomienda no dedicar más de 1-2 horas a la semana a TikTok y ve sostenibles 2-3 publicaciones por semana mientras se desarrolla ([presskit.gg][presskit-tiktok]). 4 a la semana es posible porque `tools/video.py` y la grabación de pantalla dan el material; si no llegas, baja a 3 antes que publicar cosas flojas.
- **Qué suele funcionar** con juegos indie en vídeo corto, según presskit.gg: mecánicas satisfactorias, antes y después, fallos y bugs llamativos, y series tipo «día N» ([presskit.gg][presskit-tiktok]). En anuncios de juegos, TikTok ve más CTR al enseñar un fallo como incentivo (+9,99 %) y con efectos de sonido (+7,61 %) ([TikTok Creative Center][tiktok-hc]). Todo eso encaja con el juego: viento, llamarada, cohetes, «KABOOM!».

## Cuentas y perfil

Nota: decide el nombre de usuario antes de publicar nada. Propuesta: `@putitoutgame` en TikTok, Instagram, YouTube y X (comprobar que está libre en las cuatro). Si no, `@putitout.game` o `@playputitout`.

**Bio corta** (TikTok, Instagram, YouTube; 68 caracteres):

```text
Fire spreads with the wind. Grab the hose. Free 3D firefighter game.
```

**Bio de X** (153 caracteres):

```text
Put It Out! A 3D firefighting game where the fire spreads with the wind. 67 levels + a daily challenge. Free in your browser, Android soon. By @nocodeboy
```

- Foto de perfil: el icono del juego (`assets/icon-512.png`). Cabecera de X y YouTube: el gráfico destacado en inglés cuando esté (ver [ficha-tienda-en.md](ficha-tienda-en.md)).
- Enlace del perfil: la web con UTM (abajo). Desde P, la ficha de Play.
- Fija arriba el vídeo que mejor funcione de la semana 1 (presskit.gg recomienda fijar un tuit con el juego en movimiento, [presskit.gg][presskit-social]).

## Enlaces con UTM

Cada enlace lleva de dónde viene, para leerlo en Supabase y en Play Console.

- **Web:** `https://apagalo.vercel.app/?utm_source=tiktok&utm_medium=social&utm_campaign=w1_p01`. Hoy la analítica no guarda los `utm_*` de la URL: hay que añadirlo a `first_open` (está en la lista de [marketing.md](marketing.md), KPIs).
- **Play (desde P):** la URL de la ficha con `utm_source` y `utm_campaign`. Play Console enseña las visitas que llegan por enlaces con UTM ([Play, adquisición][play-acq]); el Install Referrer lo lee la app. Genera los enlaces con el constructor de URL de campañas de Google Play y comprueba en Play Console que aparecen como «enlaces con UTM».
- **Testers:** `https://apagalo.vercel.app/testers?lang=en&utm_source=x&utm_medium=social&utm_campaign=w1_testers`.
- Convención: `utm_source` = `tiktok`, `youtube`, `instagram`, `x`, `reddit`; `utm_campaign` = `w<semana>_p<idea>`.

Nota: en TikTok e Instagram los enlaces no son clicables en los textos de los vídeos; solo el del perfil. Cambia el enlace del perfil según el vídeo de la semana si quieres medir por vídeo.

## Cómo sacar los clips

### Opción A: `tools/video.py` (render desde el juego real)

Qué hace: abre el juego compilado en un Chromium sin pantalla, avanza el juego fotograma a fotograma con un reloj virtual y guarda cada fotograma; luego ffmpeg lo une con la música a 1080×1920 y 30 fps, con el texto animado de cada clip y una tarjeta final. El perfil `x` es el vertical para redes. Durante los fotogramas grabados juega el bot PRO; antes, cada clip puede dejar crecer el fuego sin nadie (`('idle', s)`) o adelantar la partida con el bot (`('bot', s)`). `frames=[(n, velocidad)]` con velocidad mayor que 1 da cámara rápida.

Pasos (ver [tools/README.md](../tools/README.md)):

1. `npm run build` y, en otra terminal, `npm run serve`.
2. `python3 tools/video.py test` saca un fotograma por clip para comprobar el encuadre.
3. `tools/render.sh x` renderiza los clips que falten (se puede reanudar) y `tools/render.sh x encode` monta el vídeo en `build/video/apagalo-promo-x.mp4`.
4. El render va a ~1 fotograma por segundo (lo dice el propio script): 15 s de vídeo son 450 fotogramas, unos 8 minutos por clip.

Para vídeos en inglés hay que cambiar el script (no lo he tocado; es un encargo para una sesión de código):

- En `SAVE`, `lang:'es'` → `lang:'en'`, y en `open_level`, `locale='es-ES'` → `locale='en-US'`. Así el HUD y el logo salen en inglés («PUT IT OUT!», «CONTROL», «Jet / Fog / Foam»).
- Textos de los clips (`cap`): «¡EL PUEBLO ARDE!» → `THE TOWN\nIS ON FIRE!`; «EL VIENTO LO EXTIENDE» → `THE WIND\nSPREADS IT`; «¡LLUEVEN COHETES!» → `IT'S RAINING\nFIREWORKS!`.
- Tarjeta final (`STYLE`): título `PUT IT OUT!`, `Play free<br>on your phone or PC`, la URL y `No download · 67 levels + daily challenge`. Desde P, la insignia oficial de Google Play en lugar de «No download».
- Salida con otro nombre (por ejemplo `putitout-promo-x-en.mp4`) para no pisar el español.
- Mejor aún: un parámetro `LANG=en` que haga todo eso, y una opción para grabar sin el bot (hoy `recStart` siempre pone al bot a jugar, así que la cámara rápida «sin bombero» del vídeo P06 no sale de aquí).

Limitaciones: el vídeo lleva solo la música; los efectos de sonido (vapor, «KABOOM», calambrazo) no se graban porque se sintetizan en el navegador. Y el bot no comete errores a propósito.

Para elegir en qué segundo empezar un clip: `npx tsx tools/trace.ts gasolinera` (o `plaza`, `granja`, `poligono`, `castanar`, `sanjuan`) imprime cada 5 s de partida del bot cuánto arde, qué boquilla lleva y hacia dónde va. Usa otra semilla que la web, así que es una guía, no un tiempo exacto. Índices de nivel en `video.py`: plaza 0, granja 1, gasolinera 2, polígono 3, castañar 4, San Juan 5.

### Opción B: grabar la pantalla en Android

Para los errores a propósito, los efectos de sonido y el reto diario con tu resultado real.

1. En el juego: Ajustes → Idioma: English; Calidad gráfica: Alta; efectos y música activados.
2. Móvil en No molestar (sin notificaciones en el vídeo) y con batería de sobra (el juego baja la calidad si el móvil se calienta).
3. Grabador de pantalla del propio Android (ajustes rápidos), con el audio del dispositivo, no el micrófono.
4. Graba el nivel entero varias veces y quédate con los 15-30 s buenos. Vertical, sin girar el móvil.
5. Opcional para anuncios: «Mostrar toques» en las opciones de desarrollador, para que se vea cómo se juega con dos pulgares. Para orgánico, mejor sin toques.

### Edición

- Gancho en pantalla en los 2 primeros segundos, en mayúsculas cortas y dentro de la zona segura (lejos de los bordes, donde cada red pone sus botones).
- Duración: 15-25 s. Corta en cuanto se resuelva («FIRE OUT!»).
- Sonido del juego siempre. En TikTok e Instagram, las cuentas de empresa solo pueden usar la música comercial de la plataforma (norma conocida: compruébalo en tu cuenta); la música del juego es tuya y sirve en todas.
- Subtítulos si hay voz. La mayoría de estos vídeos no la necesitan.
- Exporta sin marca de agua (desde el editor, no descargando el vídeo de TikTok).

## Formato por red

| Red | Formato | Texto | Etiquetas |
|---|---|---|---|
| TikTok | 9:16, 15-25 s | 1-2 frases + pregunta | 3-5 |
| YouTube Shorts | 9:16, 15-25 s | Título con el gancho; descripción con el enlace | 2-3 en el título o la descripción |
| Instagram Reels | 9:16, 15-25 s | 1-2 frases | 3-5 |
| X (inglés) | Vídeo nativo, GIF o 2-4 capturas; hilos de 3-6 tuits | Corto, en primera persona | 1-2 como mucho (`#indiedev`, `#gamedev`, `#screenshotsaturday` los sábados, `#threejs` en lo técnico) |
| X (español, @nocodeboy) | Hilo o tuit con captura de números | Build in public | Ninguna o 1 |

Conjuntos de etiquetas:

- **Juego:** `#indiegame #firefighter #mobilegame #gamedev`
- **Satisfactorio:** `#indiegame #satisfying #firefighter`
- **Desarrollo:** `#indiedev #gamedev #threejs #buildinpublic`

## 20 ideas

Cada idea: gancho (texto en pantalla), texto de la publicación, etiquetas, de dónde sale el clip y una nota para ti. P01-P10 y P20 salen de los conceptos de anuncio de [marketing.md](marketing.md): lo que funcione aquí va a la tanda de pago.

### P01. The wind just changed

- **Hook:** `The wind just changed.`
- **Caption:** `The fire in this game spreads cell by cell, and the wind decides where it goes next. Chestnut forest, level 5. Would you have held the line?`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** `video.py`, clip `castanar` (cámara rápida ×4 con el aviso «Wind is shifting!»).
- **Nota:** que se vea bien la flecha de viento del HUD antes del cambio.

### P02. Don't use water on this fire

- **Hook:** `Don't use water on this fire.`
- **Caption:** `Gas station rules: water only spreads a fuel fire. Foam is the only fix. Did you know that one?`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** Android. Echa agua al combustible 2 s («Flare-up!») y cambia a espuma.
- **Nota:** el error tiene que ser tuyo y verse claro; es el gancho de «fallo» que mejor funciona en los datos de TikTok.

### P03. Never spray a live electrical box

- **Hook:** `Never spray a live electrical box.`
- **Caption:** `Industrial park, level 4: cut the power first, then spray. I learned it the hard way.`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** Android. Calambrazo («Zap!»), palanca roja («Power off. Spray away!») y apagar.
- **Nota:** 3 tiempos: error, arreglo, victoria.

### P04. Get them out

- **Hook:** `The fire is heading for the pen.`
- **Caption:** `Rosa's farm: fog nozzle up to handle the heat, walk in, get every animal out. The third star depends on it.`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** `video.py`, clip `granja`, o Android con un rescate apurado de verdad.
- **Nota:** no escribas «last second» si no lo fue.

### P05. It's raining fireworks

- **Hook:** `It's raining fireworks.`
- **Caption:** `Midsummer night on the beach. Wet the marked spots before the rockets land, or they light everything up.`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** `video.py`, clip `sanjuan`.
- **Nota:** es el escenario más vistoso de noche; buen candidato para fijar en el perfil.

### P06. What if nobody comes?

- **Hook:** `What happens if the firefighter doesn't show up?`
- **Caption:** `Time-lapse from the real simulation: nobody touching the controls. Then I stepped in.`
- **Hashtags:** `#indiegame #gamedev #firefighter #simulation`
- **Clip:** Android. Nivel 1 sin moverte durante el tramo de cámara rápida (acelerado al editar, rotulado «TIME-LAPSE»), luego juegas y lo paras.
- **Nota:** `video.py` no sirve para esta: graba siempre con el bot jugando.

### P07. Jet, fog or foam?

- **Hook:** `Which nozzle would you pick?`
- **Caption:** `Three fires, three nozzles. Answer before the reveal. Comment your score out of 3.`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** montaje de P01, P02 y P04: situación (1,5 s), congelado con las tres boquillas (1 s), respuesta.
- **Nota:** el formato de pregunta invita a comentar; responde a los comentarios el primer día.

### P08. Same fire for everyone

- **Hook:** `Every player gets this exact fire today.`
- **Caption:** `Daily challenge #N: same map, same wind, same hot spots for everyone. I saved X%. Your turn.`
- **Hashtags:** `#indiegame #dailychallenge #firefighter #mobilegame`
- **Clip:** Android. Partida del reto del día y la pantalla final con «Better than X% of today's N players».
- **Nota:** pon el número del reto y tu porcentaje reales el día que lo publiques.

### P09. Four ways to lose

- **Hook:** `4 ways to lose this game.`
- **Caption:** `KABOOM, zap, flare-up and "out of control". I made every mistake so you don't have to.`
- **Hashtags:** `#indiegame #gamedev #firefighter #fail`
- **Clip:** Android. Cuatro fallos reales de 3-4 s y un final limpio.
- **Nota:** el que más se guarde para anuncios: enseña las reglas del juego en 20 s.

### P10. My hose only reaches this far

- **Hook:** `My hose only reaches this far.`
- **Caption:** `Your hose is tied to the fire truck. Stand on a hydrant for a moment and you can reach much farther.`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** Android o `video.py` en el Castañar: aviso «Hose at full length», boca de riego, «Hose connected».
- **Nota:** la manguera tensa es un detalle visual que ningún otro juego del nicho tiene.

### P11. How the fire spreads (hilo técnico)

- **Hook (primer tuit):** `How do you make fire feel alive in a small browser game? A thread on the simulation behind Put It Out!`
- **Caption (resto del hilo):** 4-5 tuits: el mapa es una rejilla de celdas; cada material arde distinto; el viento empuja; las brasas saltan; el agua enfría y la espuma cubre. Cierra con el enlace a la web.
- **Hashtags:** `#gamedev #threejs`
- **Clip:** GIF del fuego avanzando y el minimapa; captura del suelo quemado y mojado.
- **Nota:** saca los detalles de `src/sim/world.ts`; cuenta solo lo que hace de verdad. Sirve también para r/gamedev y r/threejs.

### P12. Day 1 vs today

- **Hook:** `Day 1 vs today.`
- **Caption:** `Same game, a few weeks apart. Low-poly, one person, a lot of fire.`
- **Hashtags:** `#indiedev #gamedev #buildinpublic #indiegame`
- **Clip:** una captura o clip del primer prototipo y lo mismo hoy.
- **Nota:** solo si tienes capturas o vídeo del primer prototipo. Si no, sáltala y usa P17.

### P13. One person, one AI, one fire game

- **Hook (primer tuit):** `I'm one person. I made a 3D firefighter game working with AI. Here's what that actually looked like.`
- **Caption:** hilo de 5-6 tuits: qué hacía la IA y qué hacías tú, el bot que prueba los niveles, lo que salió mal, las cifras reales de la semana.
- **Hashtags:** `#buildinpublic #indiedev`
- **Clip:** 2-3 capturas del juego y una de los números.
- **Nota:** tu terreno. Versión en español en @nocodeboy el mismo día, con tu tono de siempre. Pon solo cifras que puedas enseñar.

### P14. I built a bot to test my levels

- **Hook:** `I built a bot to tell me if my levels are too hard.`
- **Caption:** `It plays every level 10 times as a "pro" and as a "casual" player. The pro wins the farm 100% of the time; the casual one, 60%. Guess where real players struggle.`
- **Hashtags:** `#gamedev #indiedev`
- **Clip:** captura de la tabla de [dificultad.md](dificultad.md) y un clip del bot jugando (`video.py`).
- **Nota:** las cifras son las de `dificultad.md` (25 sept). Si vuelves a pasar el bot, actualízalas.

### P15. That steam hiss

- **Hook:** ninguno en texto; empieza con el chorro ya sobre las llamas.
- **Caption:** `Sound on. Blaze out, combo x3.`
- **Hashtags:** `#indiegame #satisfying #firefighter`
- **Clip:** Android con sonido: primer plano de un foco que se apaga con vapor, «Blaze out!» y «Combo x3».
- **Nota:** vídeo corto (8-12 s) y en bucle; tiene que grabarse en Android porque `video.py` no graba los efectos.

### P16. Six fires, six skies

- **Hook:** `Six fires. Six different skies.`
- **Caption:** `Summer noon, golden farm, cloudy industrial park, autumn forest, night on the beach. Which one would you play first?`
- **Hashtags:** `#indiegame #lowpoly #gamedev #firefighter`
- **Clip:** montaje de 6 planos de 2 s, uno por escenario. En X, las 6 capturas un sábado con `#screenshotsaturday`.
- **Nota:** responde a la idea de que todos los juegos de fuego son «naranja y negro» (ver [marketing.md](marketing.md), competencia).

### P17. Beat my daily

- **Hook:** `97% saved. Can you beat it?` (con tu resultado real)
- **Caption:** `Today's daily challenge. Same fire for everyone. Post your result below.`
- **Hashtags:** `#dailychallenge #indiegame`
- **Clip:** X: el texto de compartir del juego y un clip de 10 s. En vídeo: la pantalla final.
- **Nota:** publícalo por la mañana en EE. UU. para que la gente juegue el mismo reto ese día.

### P18. Android testers wanted

- **Hook:** `Google Play won't let me publish my game yet.`
- **Caption:** `Google Play won't let me publish until 12 people test my game for 14 days. It's free and takes 3 minutes. Link in bio.`
- **Hashtags:** `#indiedev #androidgaming #gamedev`
- **Clip:** 10-15 s de juego y el paso a paso de `/testers?lang=en`.
- **Nota:** solo mientras falten testers. Los que entren desde aquí suelen ser de otros países: bien, dan reseñas en inglés.

### P19. Next week on Google Play

- **Hook:** `Next week this is on Google Play.`
- **Caption:** `Put It Out! Firefighter launches on Android next week. You can already play it free in your browser.`
- **Hashtags:** `#indiegame #mobilegame #firefighter #gamedev`
- **Clip:** el mejor clip de las semanas 1-3, remontado con la tarjeta final.
- **Nota:** publícalo solo cuando Google haya concedido el acceso a producción.

### P20. Watch the gauge

- **Hook:** `Watch the gauge on those gas bottles.`
- **Caption:** `The closer the fire, the higher the pressure. Cool them down in time, or...`
- **Hashtags:** `#indiegame #firefighter #mobilegame #gamedev`
- **Clip:** Android en la gasolinera: el indicador de presión sube, el aviso «Gas bottle heating up!» y, en una segunda toma, «KABOOM!».
- **Nota:** corta justo antes de la explosión en la primera parte y enséñala al final.

## Calendario

Vídeo: lunes, miércoles, viernes y domingo, en las tres redes. X en inglés: martes, jueves y sábado. X en español (@nocodeboy): martes y viernes. Hora: programa para la tarde de EE. UU. (madrugada en España); es una suposición razonable por el público objetivo, no un dato.

### Semana 1: 28 sept-4 oct (enseñar el fuego)

| Día | Dónde | Pieza | Llamada a la acción |
|---|---|---|---|
| Lun 28 | Vídeo | P18 Android testers wanted | `/testers?lang=en` |
| Mar 29 | X (en) | P11 hilo: cómo se propaga el fuego | Web |
| Mar 29 | X (es) | Por qué el juego tendrá dos nombres: «¡Apágalo!» y «Put It Out!» | Testers |
| Mié 30 | Vídeo | P01 The wind just changed | Web |
| Jue 1 | X (en) | Clip de P01 con una frase | Web |
| Vie 2 | Vídeo | P02 Don't use water on this fire | Web |
| Vie 2 | X (es) | Cuántos testers llevo y qué ha fallado | Testers |
| Sáb 3 | X (en) | P16 en capturas, `#screenshotsaturday` | Web |
| Dom 4 | Vídeo | P06 What if nobody comes? | Web |

### Semana 2: 5-11 oct (cada nivel, una regla nueva)

| Día | Dónde | Pieza | Llamada a la acción |
|---|---|---|---|
| Lun 5 | Vídeo | P05 It's raining fireworks | Web |
| Mar 6 | X (en) | P14 el bot que prueba los niveles | Web |
| Mar 6 | X (es) | El envío a CrazyGames y qué mide su Basic Launch | — |
| Mié 7 | Vídeo | P03 Never spray a live electrical box | Web |
| Jue 8 | X (en) | Clip de P10 (manguera y boca de riego) | Web |
| Vie 9 | Vídeo | P04 Get them out | Web |
| Vie 9 | X (es) | Primeros números de la semana (Supabase) | Web |
| Sáb 10 | X (en) | Captura nueva, `#screenshotsaturday` | Web |
| Dom 11 | Vídeo | P07 Jet, fog or foam? | Web |

### Semana 3: 12-18 oct (el reto diario y los fallos)

| Día | Dónde | Pieza | Llamada a la acción |
|---|---|---|---|
| Lun 12 | Vídeo | P08 Same fire for everyone | Web |
| Mar 13 | X (en) | P13 hilo: una persona, una IA, un juego | Web |
| Mar 13 | X (es) | P13 en español | Web |
| Mié 14 | Vídeo | P09 Four ways to lose | Web |
| Jue 15 | X (en) | P17 Beat my daily | Web |
| Vie 16 | Vídeo | P10 My hose only reaches this far | Web |
| Vie 16 | X (es) | 14 días de prueba cerrada: solicitud de producción (si se cumple) | — |
| Sáb 17 | X (en) | Captura, `#screenshotsaturday` | Web |
| Dom 18 | Vídeo | P15 That steam hiss | Web |

### Semana 4: 19-25 oct (cuenta atrás para Google Play)

| Día | Dónde | Pieza | Llamada a la acción |
|---|---|---|---|
| Lun 19 | Vídeo | P16 Six fires, six skies | Web |
| Mar 20 | X (en) | Segunda parte técnica: el suelo quemado y mojado en Three.js | Web |
| Mar 20 | X (es) | Lo que aprendí del Basic Launch de CrazyGames | — |
| Mié 21 | Vídeo | P20 Watch the gauge | Web |
| Jue 22 | X (en) | P17 Beat my daily (reto nuevo) | Web |
| Vie 23 | Vídeo | P12 Day 1 vs today (o P17 en vídeo) | Web |
| Vie 23 | X (es) | La semana que viene, en Google Play | — |
| Sáb 24 | X (en) | Captura, `#screenshotsaturday` | Web |
| Dom 25 | Vídeo | P19 Next week on Google Play | Web; Play desde P |

Si P se retrasa, P19 se mueve con ella y en su hueco va el vídeo que mejor haya funcionado, remontado con otro gancho.

**Mientras dure el Basic Launch de CrazyGames**, las llamadas a la acción van a la web propia, no a CrazyGames: su decisión se basa en la retención y el tiempo de juego, y no conviene mezclarla con nuestro tráfico ([marketing.md](marketing.md)).

**Reddit** en estas semanas (una publicación por comunidad, días distintos): r/playmygame con P01 (semana 2), r/WebGames con la web (semana 2), r/IndieGaming con P05 (semana 3), r/gamedev en el hilo Screenshot Saturday con P11 (semana 3), r/threejs con P11 (semana 4), r/DestroyMyGame con el tráiler de Play (semana 2). Lee las normas de cada una antes ([marketing.md](marketing.md)).

## Medición

Una hoja con una fila por publicación:

| Campo | De dónde sale |
|---|---|
| Fecha, red, idea (P01…), gancho | Tú |
| Vistas | Analíticas de cada red |
| Tiempo medio visto y % que lo ve entero | TikTok e Instagram |
| Visto frente a deslizado | YouTube Shorts |
| Visitas al perfil, seguidores nuevos | Cada red |
| Clics y partidas | `utm_campaign` en Supabase (cuando se guarde) y Play Console desde P |

Cada domingo, 10 minutos: ordena los vídeos de la semana por tiempo medio visto. Cada 4 semanas, repite los 3 tipos de gancho mejores con escenas nuevas y deja de hacer los 3 peores. Los 5 mejores de todo el periodo son los vídeos de la tanda de pago ([marketing.md](marketing.md)).

## Reglas

- Solo juego real, con la versión publicada. Nada de mecánicas, pantallas o resultados que no existan. Los porcentajes y rankings, siempre de una partida tuya de verdad.
- Nada de monedas, mejoras ni «+30 s» hasta que la 1.3 esté publicada.
- Interfaz en inglés en todo lo que sea en inglés.
- Sin música de terceros con derechos: la del juego sirve en todas las redes.
- Sin «for kids» ni estética infantil en miniaturas y textos (el juego es 13+).
- Responde a los comentarios el primer día: es cuando más se ve el vídeo.

[ig-watermark]: https://m.gsmarena.com/instagram_stops_promoting_recycled_tiktok_videos_in_reels-news-47671.php
[presskit-tiktok]: https://presskit.gg/field-guides/tiktok-indie-game-marketing
[presskit-social]: https://presskit.gg/field-guides/social-media-branding-indie-game
[tiktok-hc]: https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok-hyper-casual-game-creative-tips/pc/en
[play-acq]: https://support.google.com/googleplay/android-developer/answer/6263332
