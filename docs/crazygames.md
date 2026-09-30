# ¡Apágalo! (Put It Out!) en CrazyGames

Todo lo necesario para publicar el juego en CrazyGames: estado, archivos, textos de la ficha, requisitos técnicos y cómo actualizarlo.

## Estado (1 oct 2026)

- **En Basic Launch** desde el 28 sept. Termina a las 500 partidas o el 19 oct.
  - La ficha quedó en categoría **Simulation**, con las etiquetas **3D, Top-Down, Hero, Skill, Mission**. Mientras dura el Basic Launch la ficha es de solo lectura (nombre, descripción, etiquetas), y para cambiarla hay que escribir al soporte. Todavía dice «6 handcrafted scenarios»; la descripción de la 2.0 está más abajo.
- **2.0 publicada el 30 sept.** La subida de versión la aprobaron automáticamente («now live»), así que no hace falta esperar revisión.
- **2.1.0 lista en `dist/apagalo-crazygames.zip`:** el juego en 6 idiomas (ver [idiomas.md](idiomas.md)). Se sube igual, como versión nueva.
- **Métricas del Basic Launch** (28–29 sept, 149 partidas, con la versión 1.x). El umbral es 9 de 15.

  | | Puntuación | Tiempo medio de juego | Retención D1 | Conversión a partida |
  |---|---|---|---|---|
  | Escritorio | 6/15 | 2m41s | 0 % | 70,9 % |
  | Móvil y tableta | 4/15 | 3m11s | 0 % | 31,9 % |

  La 2.0 es la que tiene que subirlas.

### Subir una versión nueva sin arrastrar la carpeta

El campo de archivos del juego es una carpeta (`webkitdirectory`). El portal saca la ruta de cada archivo de `webkitRelativePath` y quita la primera carpeta. Si los archivos llegan sin carpeta, por ejemplo subidos con una herramienta de automatización, `check-presigned-url-upload` devuelve 400 y se quedan girando.

Arrastrar la carpeta a mano funciona siempre. Para hacerlo por programa:

1. Intercepta el `change` del input con `stopImmediatePropagation` y guarda los `File`.
2. A cada archivo, dale `webkitRelativePath = 'carpeta/' + nombre` con `Object.defineProperty`.
3. Mételos en el input con un `DataTransfer` y lanza un `change` nuevo.

En las portadas y los vídeos de la ficha hay que pulsar antes el botón «Upload» de cada hueco (si no, sale «UploadType is not properly set»). Luego se carga el archivo en su input y, en las portadas, se pulsa Submit en el recorte.

Las portadas llevan el título fuera de la esquina superior izquierda, porque CrazyGames pone ahí sus etiquetas (NEW, HOT…): en la horizontal está desplazado a la derecha, en la vertical más abajo y en la cuadrada más pequeño y a la derecha.

## Archivos

Se generan con el código (`npm run build`, `tools/assets.py` y `tools/video.py`). En la carpeta del portátil están en `publicacion\crazygames\`.

| Qué | Archivo | Notas |
|---|---|---|
| Juego (HTML5) | `apagalo-crazygames.zip` | 3 archivos (`index.html` con las fuentes dentro y las 2 músicas), 3,5 MB descomprimido. Sale de `dist/apagalo-crazygames.zip` |
| Portada horizontal | `cg-cover-1920x1080.png` | Solo el título, sin botones ni bordes. En `assets/` |
| Portada vertical | `cg-cover-800x1200.png` | Ídem |
| Portada cuadrada | `cg-cover-800x800.png` | Ídem |
| Vídeo de vista previa 16:9 | `apagalo-crazygames-1920x1080.mp4` | 18 s, 8,8 MB (el límite es 10 MB), sin sonido ni texto ni interfaz; empieza en la misma escena que la portada |
| Vídeo de vista previa 2:3 | `apagalo-crazygames-1080x1620.mp4` | 19 s, 8,8 MB, ídem, para móvil |

## Ficha (en inglés, que es el idioma principal del portal)

**Name:** Put It Out! Firefighter
(Antes «¡Apágalo! Firefighter»: hay que cambiarlo en la ficha. Dentro del juego el título es «PUT IT OUT!» para navegadores en inglés y «¡APÁGALO!» para los que están en español, así que coincide con la ficha para el público del portal, que es sobre todo angloparlante.)

**Short description:**
Grab the hose and stop the fire before it spreads through town!

**Description:**
You are the village firefighter. Your hose is tied to the fire truck, the wind keeps shifting and the flames spread cell by cell in real time. Aim at the base of the fire, rescue the animals, cool down the gas bottles and don't let anything important burn.

- 67 handcrafted levels across 6 places: the village fair, a farm, a gas station, an industrial park, a chestnut forest and a Midsummer night full of fireworks. The finale sets the whole town on fire at once.
- 3 nozzles: jet for reach, fog to shield yourself from the heat, foam for fuel fires.
- Every level has its own twist: wind shifts, live electrical boxes, rockets falling from the sky, hydrants to reconnect your hose.
- A new daily challenge every day, the same for every player.
- Earn up to 3 stars per level by saving more of the town and every animal.

**Controls:**
- Desktop: WASD / arrow keys to move, mouse to aim, left click or Space to spray. Change nozzle with 1-2-3, Q/E, mouse wheel or right click. Esc to pause.
- Mobile: left thumb moves, right thumb aims and sprays (with aim assist). Nozzle buttons on the right.

**Categoría sugerida:** Casual (alternativa: Action).
**Etiquetas sugeridas:** firefighter, fire, 3d, casual, simulation, mobile, rescue, water, low poly.
**Orientación:** horizontal y vertical (se adapta).
**Móvil:** sí, controles táctiles de doble joystick.
**Idiomas:** inglés y español.

**Con la 2.0** (rama `v2`, 120 niveles en 12 escenarios), la descripción pasa a esta (1.133 caracteres; nombre, descripción corta y controles, los mismos):

```text
Put It Out! Firefighter is a 3D firefighting game where the fire is alive. Your hose is tied to the fire truck, the wind keeps shifting and the flames spread cell by cell in real time. Aim at the base of the fire, rescue everyone and don't let anything important burn.

- 120 handcrafted levels across 12 places, each with its own rule: foam for fuel fires, live electrical boxes, fireworks falling on the beach, burning fuel drifting across the docks, people trapped at downtown windows, trains that cut your hose, ice and frozen hydrants at the ski lodge, masterpieces to carry out of a museum at night and a helicopter on call at the campground.
- A big fire every 10 levels. Win it and you make the front page of The Daily Blaze: collect all 12.
- Power-ups on the ground and surprise events: rain showers, wind gusts, gas leaks, blackouts.
- Hire your crew: Lola the firefighter, Sparky the rescue dog and a water drone.
- 3 nozzles: jet for reach, fog to shield yourself from the heat, foam for fuel fires.
- A new daily challenge every day, the same fire for every player.

Plays in English and Spanish, on desktop and mobile.
```

Y la española:

```text
Eres el bombero. La manguera va atada al camión, el viento cambia y las llamas se extienden en tiempo real. Apunta a la base del fuego, rescata a todos y que no se queme nada importante. 120 niveles en 12 escenarios, cada uno con su regla (del puerto a la estación de esquí, el museo de noche y el camping), un gran incendio cada 10 niveles con su portada de periódico, power-ups, eventos sorpresa, tu propio equipo, 3 boquillas y un reto diario nuevo cada día.
```

La 2.0 en CrazyGames: sin «More games» (no hay enlaces a fuera), el apoyo aéreo es un anuncio con recompensa más que solo aparece en el Full Launch, y el guardado en su nube lleva también el equipo y las portadas (`tools/test_cg_data.py` prueba una partida de la 1.3.0 guardada en la nube). Las portadas y vídeos de la ficha se pueden quedar hasta tener capturas de los escenarios nuevos.

**Descripción en español de la 1.x** (por si la ficha la permite):
Eres el bombero del pueblo. La manguera va atada al camión, el viento cambia y las llamas se extienden en tiempo real. Apunta a la base del fuego, rescata a los animales, enfría las bombonas y que no se queme nada importante. 67 niveles en 6 escenarios, 3 boquillas (chorro, abanico y espuma) y un reto diario nuevo cada día.

## Requisitos técnicos cubiertos

- **SDK v3 de CrazyGames**, cargado solo en esta versión: `loadingStart` / `loadingStop` al arrancar, `gameplayStart` al jugar, `gameplayStop` en pausa, menús y al terminar el nivel, `happytime` al sacar 3 estrellas. Comprobado con un SDK simulado (`tools/test_cg_sdk.py`): secuencia correcta y cero errores.
- **Guardado en su nube (módulo Data)**: la partida se guarda también en CrazyGames, así que un jugador con cuenta la conserva entre dispositivos. Al entrar, si el portal ya tiene una partida, manda esa; si no, se copia la local. Comprobado con `tools/test_cg_data.py`.
- **Un clic hasta jugar**: la primera vez, el botón JUGAR lleva directo al nivel 1 con el tutorial, sin pasar por el selector de niveles.
- Si el SDK no carga o está desactivado, el juego funciona igual (todas las llamadas están protegidas).
- Sin enlaces externos: el botón de compartir, el enlace a la política de privacidad y, desde la 2.0, «More games» no existen en esta versión. Sin pantalla completa propia (la pone el portal).
- Sin anuncios mientras dure el Basic Launch (ver «Anuncios» más abajo) y sin compras.
- Todo el contenido está dentro del zip (fuentes incluidas dentro de `index.html`, porque el cargador de CrazyGames no conserva subcarpetas). La única petición externa es el propio SDK de CrazyGames.
- Tamaño muy por debajo de los límites (3,5 MB frente a 50 MB iniciales / 250 MB totales; 3 archivos frente a 1.500).
- Idiomas: inglés y español, según el idioma del navegador.
- Contenido apto para todos los públicos: fuego de dibujos, sin violencia ni sangre.

## Anuncios (apagados hasta el Full Launch)

CrazyGames no permite anuncios durante el Basic Launch (su SDK devuelve el error `adsDisabledBasicLaunch`). Por eso la versión de CrazyGames se compila **sin anuncios** por defecto: la constante `__CG_ADS__` de `build.mjs` es falsa y el juego no llama nunca a `CrazyGames.SDK.ad`. `tools/test_cg_sdk.py` lo comprueba.

Cuando el juego pase al **Full Launch**:

1. Compila con anuncios: `CG_ADS=1 node build.mjs` (la consola dice `crazygames zip ... (ads ON)`).
2. Comprueba con el SDK simulado: `python3 tools/test_cg_sdk.py --ads` (con `dist/` servido) tiene que decir `ads ON: OK`.
3. Sube `dist/apagalo-crazygames.zip` como una versión nueva.

Qué hace entonces (`src/monetize/crazygames.ts`, SDK v3):

- Anuncios con recompensa (`requestAd('rewarded')`): +30 s cuando se acaba el tiempo, x2 de monedas al acabar y monedas gratis en la tienda. Solo se da la recompensa si el SDK llama a `adFinished`.
- Anuncio entre niveles (`requestAd('midgame')`) al salir de la pantalla final, con los topes del juego (3 niveles terminados, 2 desde el último, 120 s, nunca en la primera sesión). CrazyGames aplica además su propio mínimo de unos 3 minutos entre midgames (`adCooldown`).
- Mientras dura el anuncio el juego se silencia, se para y llama a `gameplayStop`, como pide el portal. Si hay bloqueador de anuncios o el SDK dice que el juego sigue en Basic Launch, los botones de anuncio desaparecen el resto de la sesión. Si el SDK no empieza el anuncio en 15 s, el juego sigue sin recompensa.
- No hay compras en CrazyGames: la sección de compras de la tienda no aparece.

Antes de activarlos, revisa el +30 s: las normas de anuncios de CrazyGames no permiten ofrecer «seguir jugando» con un anuncio cada vez que se pierde (análisis en `docs/monetizacion.md`). Ahora se ofrece una vez por intento y solo cuando se acaba el tiempo, y nunca va seguido del anuncio entre niveles en la misma transición.

## Una decisión que es tuya: la analítica propia

La versión de CrazyGames también manda las estadísticas anónimas a tu Supabase (con `platform = crazygames`), igual que la web. Así ves el embudo por nivel, que el panel de CrazyGames no da con ese detalle. Se puede desactivar en Ajustes → Estadísticas anónimas.

CrazyGames es estricto con los datos que recoge un juego fuera de su SDK. Si en la revisión te lo piden, o prefieres no arriesgar, se desactiva en `build.mjs` (una línea: `__ANALYTICS__` a `null` para el objetivo `crazygames`) y te quedas solo con las métricas de CrazyGames.

## Cómo subirlo (o subir una versión nueva)

1. `npm run build` y coge `dist/apagalo-crazygames.zip`.
2. En el portal de desarrolladores, abre el juego y sube el zip en la pestaña del archivo del juego. Si el cargador pide una carpeta en vez de un zip, descomprímelo y sube la carpeta: son solo 3 archivos.
3. Abre la vista previa, pulsa JUGAR y juega un poco: la herramienta de QA tiene que ver el entorno `crazygames`, `loadingStop` y `gameplayStart`.
4. Rellena la ficha con los textos de arriba, sube las 3 portadas y los 2 vídeos y activa el guardado del progreso.
5. Envíalo a revisión. Lo normal es que entre en el **Basic Launch** (tráfico limitado de prueba), que es el test de 7-14 días que buscamos.

## Qué mirar durante el test

Los criterios están escritos antes de probar (`docs/concepto.md`):

- **Matar** si menos del 70 % sigue jugando al minuto 1 o menos del 40 % termina el nivel 1.
- **Matar** si la sesión media baja de 4 minutos.
- **Iterar** si el D1 está entre el 6 y el 10 %. **Seguir** (prueba en Google Play) si el D1 es ≥ 10 % y la sesión media ≥ 8 minutos.

En Supabase (proyecto `nocodeboy-games`): `select * from kpis where juego = 'apagalo';`, `select * from niveles where juego = 'apagalo';` y `select * from cohortes where juego = 'apagalo';`.
