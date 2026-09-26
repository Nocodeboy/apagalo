# ¡Apágalo! en CrazyGames

Todo lo necesario para publicar el juego en CrazyGames: estado, archivos, textos de la ficha, requisitos técnicos y cómo actualizarlo.

## Estado (26 sept 2026)

- Cuenta de desarrollador creada y juego en **borrador**, con la versión 1.2.0 subida y validada por su cargador.
- Pendiente, en este orden:
  1. **Revisión de calidad (QA tool)**: abrir la vista previa del borrador, pulsar **JUGAR** y jugar unos 20 segundos para que detecte `gameplayStart`. Luego *Continue* y marcar la autoevaluación (esa casilla la confirmas tú).
  2. **Ficha**: textos de abajo, las 3 portadas y los 2 vídeos.
  3. **Guardado del progreso**: activar la opción de guardar el progreso (*progress save*) en el envío, porque el juego guarda la partida con su módulo Data.
  4. **Enviar a revisión** (Basic Launch). El botón final lo pulsas tú.

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

**Name:** ¡Apágalo! Firefighter
(Si prefieres un nombre solo en inglés para el mercado internacional: *Put It Out! Firefighter*. El juego se muestra en inglés o español según el idioma del navegador.)

**Short description:**
Grab the hose and stop the fire before it spreads through town!

**Description:**
You are the village firefighter. Your hose is tied to the fire truck, the wind keeps shifting and the flames spread cell by cell in real time. Aim at the base of the fire, rescue the animals, cool down the gas bottles and don't let anything important burn.

- 6 handcrafted scenarios: the village fair, a farm, a gas station, an industrial park, a chestnut forest and a Midsummer night full of fireworks.
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

**Descripción en español** (por si la ficha la permite):
Eres el bombero del pueblo. La manguera va atada al camión, el viento cambia y las llamas se extienden en tiempo real. Apunta a la base del fuego, rescata a los animales, enfría las bombonas y que no se queme nada importante. 6 escenarios, 3 boquillas (chorro, abanico y espuma) y un reto diario nuevo cada día.

## Requisitos técnicos cubiertos

- **SDK v3 de CrazyGames**, cargado solo en esta versión: `loadingStart` / `loadingStop` al arrancar, `gameplayStart` al jugar, `gameplayStop` en pausa, menús y al terminar el nivel, `happytime` al sacar 3 estrellas. Comprobado con un SDK simulado (`tools/test_cg_sdk.py`): secuencia correcta y cero errores.
- **Guardado en su nube (módulo Data)**: la partida se guarda también en CrazyGames, así que un jugador con cuenta la conserva entre dispositivos. Al entrar, si el portal ya tiene una partida, manda esa; si no, se copia la local. Comprobado con `tools/test_cg_data.py`.
- **Un clic hasta jugar**: la primera vez, el botón JUGAR lleva directo al nivel 1 con el tutorial, sin pasar por el selector de niveles.
- Si el SDK no carga o está desactivado, el juego funciona igual (todas las llamadas están protegidas).
- Sin enlaces externos: el botón de compartir y el enlace a la política de privacidad no existen en esta versión. Sin pantalla completa propia (la pone el portal).
- Sin anuncios propios ni compras.
- Todo el contenido está dentro del zip (fuentes incluidas dentro de `index.html`, porque el cargador de CrazyGames no conserva subcarpetas). La única petición externa es el propio SDK de CrazyGames.
- Tamaño muy por debajo de los límites (3,5 MB frente a 50 MB iniciales / 250 MB totales; 3 archivos frente a 1.500).
- Idiomas: inglés y español, según el idioma del navegador.
- Contenido apto para todos los públicos: fuego de dibujos, sin violencia ni sangre.

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

En Supabase: `select * from apagalo_kpis;`, `select * from apagalo_niveles;` y `select * from apagalo_cohortes;`.
