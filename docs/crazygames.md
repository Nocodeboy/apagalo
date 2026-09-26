# ¡Apágalo! en CrazyGames — paquete de envío

Todo lo necesario para subir el juego desde tu cuenta de desarrollador en CrazyGames. **No se ha enviado nada**: la subida la haces tú (o me das permiso explícito y lo hacemos juntos con tu sesión abierta).

## Archivos

| Qué | Archivo | Notas |
|---|---|---|
| Juego (HTML5) | `apagalo-crazygames.zip` | 3,5 MB descomprimido, 8 archivos, `index.html` en la raíz |
| Portada horizontal | `cg-cover-1920x1080.png` | Solo el título, sin botones ni bordes |
| Portada vertical | `cg-cover-800x1200.png` | Ídem |
| Portada cuadrada | `cg-cover-800x800.png` | Ídem |
| Vídeo de vista previa 16:9 | `apagalo-crazygames-1920x1080.mp4` | 18 s, sin sonido ni texto ni interfaz; empieza en la misma escena que la portada |
| Vídeo de vista previa 2:3 | `apagalo-crazygames-1080x1620.mp4` | 19 s, ídem, para móvil |

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

- **SDK v3 de CrazyGames** cargado solo en esta versión: `loadingStart` / `loadingStop` al arrancar, `gameplayStart` al jugar, `gameplayStop` en pausa, menús y al terminar el nivel, `happytime` al sacar 3 estrellas. Probado con un SDK simulado: secuencia correcta y cero errores.
- Si el SDK no carga o está desactivado, el juego funciona igual (todas las llamadas están protegidas).
- Sin enlaces externos: el botón de compartir y el enlace a la política de privacidad no existen en esta versión.
- Sin anuncios propios ni compras.
- Todo el contenido está dentro del zip (fuentes y música incluidas). La única petición externa es el propio SDK de CrazyGames.
- Tamaño muy por debajo de los límites (3,5 MB frente a 50 MB iniciales / 250 MB totales, 8 archivos frente a 1.500).
- Contenido apto para todos los públicos: fuego de dibujos, sin violencia ni sangre.

## Una decisión que es tuya: la analítica propia

La versión de CrazyGames también manda las estadísticas anónimas a tu Supabase (con `platform = crazygames`), igual que la web. Así ves el embudo por nivel, que el panel de CrazyGames no da con ese detalle. Se puede desactivar en Ajustes → Estadísticas anónimas.

CrazyGames es estricto con los datos que recoge un juego fuera de su SDK. Si en la revisión te lo piden, o prefieres no arriesgar, se desactiva en `build.mjs` (una línea: `__ANALYTICS__` a `null` para el objetivo `crazygames`) y te quedas solo con las métricas de CrazyGames.

## Cómo subirlo

1. Entra en el portal de desarrolladores de CrazyGames con tu cuenta.
2. Crea un juego nuevo de tipo HTML5 y sube `apagalo-crazygames.zip`.
3. Usa su herramienta de vista previa para comprobar que el SDK responde (debe aparecer el entorno `crazygames`).
4. Rellena la ficha con los textos de arriba, sube las 3 portadas y los 2 vídeos.
5. Envíalo a revisión. Lo normal es que entre en el **Basic Launch** (tráfico limitado de prueba), que es exactamente el test de 7-14 días que buscamos.

## Qué mirar durante el test

Los criterios están escritos antes de probar (`docs/concepto.md`):

- **Matar** si menos del 70 % sigue jugando al minuto 1 o menos del 40 % termina el nivel 1.
- **Matar** si la sesión media baja de 4 minutos.
- **Iterar** si el D1 está entre el 6 y el 10 %. **Seguir** (prueba en Google Play) si el D1 es ≥ 10 % y la sesión media ≥ 8 minutos.

En Supabase: `select * from apagalo_kpis;`, `select * from apagalo_niveles;` y `select * from apagalo_cohortes;`.
