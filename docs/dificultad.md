# Dificultad medida con el bot

Salida de `npx tsx tools/bot.ts 10` (10 partidas por nivel), medida el 25 sept 2026. Sirve de referencia para ver si un cambio en la simulación hace el juego más fácil o más difícil: vuelve a ejecutarlo y compara.

- **PRO**: bot con buena puntería y decisiones rápidas. **casual**: bot más lento e impreciso, parecido a un jugador nuevo.
- **win**: % de partidas ganadas. **saved**: % del pueblo salvado de media. **left**: segundos que sobran en las victorias. **★ a/b/c/d**: partidas que acabaron con 0/1/2/3 estrellas. La última columna dice cómo acabaron las partidas.
- **rescued**: animales rescatados de media / total del nivel. **boom** y **zap**: explosiones de bombona y calambrazos de media.
- `daily#N`: los retos diarios del 25 sept al 1 oct 2026, jugados solo por el bot PRO, con su escenario y modificador (viento, noche, poco tiempo).

```
1 plaza PRO            win 100%  saved  97%  left 100s  ★ 0/0/0/10  rescued 0.0/0  boom 0.0  zap 0.0  {"win":10}
1 plaza casual         win  90%  saved  56%  left  41s  ★ 1/9/0/0  rescued 0.0/0  boom 0.0  zap 0.0  {"win":9,"control":1}
2 granja PRO           win 100%  saved  63%  left  95s  ★ 0/9/0/1  rescued 0.0/4  boom 0.0  zap 0.0  {"win":10}
2 granja casual        win  60%  saved  75%  left 128s  ★ 4/0/0/6  rescued 0.0/4  boom 0.0  zap 0.0  {"win":6,"control":4}
3 gasolinera PRO       win 100%  saved  69%  left  93s  ★ 0/10/0/0  rescued 0.0/0  boom 0.0  zap 0.0  {"win":10}
3 gasolinera casual    win  80%  saved  51%  left  72s  ★ 2/8/0/0  rescued 0.0/0  boom 0.0  zap 0.0  {"win":8,"control":2}
4 poligono PRO         win  90%  saved  73%  left 105s  ★ 1/3/2/4  rescued 0.0/2  boom 0.0  zap 0.0  {"win":9,"control":1}
4 poligono casual      win 100%  saved  47%  left  81s  ★ 0/10/0/0  rescued 0.0/2  boom 0.0  zap 0.0  {"win":10}
5 castanar PRO         win  70%  saved  66%  left 140s  ★ 3/0/2/5  rescued 0.3/4  boom 0.0  zap 0.0  {"win":7,"control":3}
5 castanar casual      win  80%  saved  58%  left 125s  ★ 2/0/8/0  rescued 0.0/4  boom 0.0  zap 0.0  {"win":8,"control":2}
6 sanjuan PRO          win 100%  saved  84%  left  54s  ★ 0/1/9/0  rescued 0.5/2  boom 0.0  zap 0.0  {"win":10}
6 sanjuan casual       win  60%  saved  53%  left  58s  ★ 4/5/1/0  rescued 0.0/2  boom 0.0  zap 0.0  {"win":6,"control":4}
daily#1 casta wind     win   0%  saved  30%  left   0s  ★ 10/0/0/0  rescued 0.6/4  boom 0.0  zap 0.0  {"control":10}
daily#2 plaza wind     win 100%  saved  91%  left  94s  ★ 0/0/10/0  rescued 0.0/0  boom 0.0  zap 0.0  {"win":10}
daily#3 casta night    win  30%  saved  41%  left 143s  ★ 7/0/2/1  rescued 0.3/4  boom 0.0  zap 0.0  {"control":7,"win":3}
daily#4 gasol short    win  70%  saved  49%  left  48s  ★ 3/7/0/0  rescued 0.0/0  boom 0.1  zap 0.0  {"win":7,"control":3}
daily#5 sanju wind     win 100%  saved  82%  left  54s  ★ 0/0/10/0  rescued 0.0/2  boom 0.0  zap 0.0  {"win":10}
daily#6 granj night    win   0%  saved  45%  left   0s  ★ 10/0/0/0  rescued 1.0/4  boom 0.0  zap 0.0  {"control":10}
daily#7 plaza wind     win 100%  saved  94%  left  95s  ★ 0/0/0/10  rescued 0.0/0  boom 0.0  zap 0.0  {"win":10}
```

## Campaña (niveles 7-67)

Medida el 29 sept 2026 con `npx tsx tools/bot.ts 10 <id>` para cada nivel (los 6 originales dan lo mismo que arriba). Con 10 partidas cada porcentaje baila unos ±15 puntos: sirve para ver la tendencia, no para comparar dos niveles sueltos.

Objetivo: el PRO gana el 85 % o más en todos, y el casual baja de un 85-90 % en el bloque 1 a un 40-50 % en el bloque 10. Se cumple por bloques:

| Bloque | Niveles | PRO gana (media) | Casual gana (media) |
|---|---|---|---|
| 1 | 7-12 | 98 % | 93 % |
| 2 | 13-18 | 100 % | 78 % |
| 3 | 19-24 | 98 % | 72 % |
| 4 | 25-30 | 100 % | 77 % |
| 5 | 31-36 | 100 % | 78 % |
| 6 | 37-42 | 100 % | 70 % |
| 7 | 43-48 | 98 % | 57 % |
| 8 | 49-54 | 97 % | 65 % |
| 9 | 55-60 | 98 % | 55 % |
| 10 | 61-66 | 98 % | 52 % |

Nivel a nivel («Casual salva» es el % del pueblo que salva de media):

| Nº | id | Nombre | Tiempo | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|---|---|
| 7 | `plaza-2` | Día de mercado | 120 s | 100 % | 100 % | 75 % |
| 8 | `granja-2` | El redil | 120 s | 100 % | 100 % | 97 % |
| 9 | `gasolinera-2` | Las bombonas | 120 s | 100 % | 100 % | 86 % |
| 10 | `poligono-2` | La palanca del fondo | 140 s | 100 % | 100 % | 76 % |
| 11 | `castanar-2` | La senda del guarda | 130 s | 100 % | 80 % | 50 % |
| 12 | `sanjuan-2` | Hogueras en la cala | 140 s | 90 % | 80 % | 80 % |
| 13 | `granja-3` | El trigal | 120 s | 100 % | 80 % | 82 % |
| 14 | `gasolinera-3` | Área de descanso | 120 s | 100 % | 70 % | 74 % |
| 15 | `poligono-3` | El taller | 120 s | 100 % | 80 % | 79 % |
| 16 | `castanar-3` | El merendero | 140 s | 100 % | 80 % | 63 % |
| 17 | `sanjuan-3` | El paseo de tablas | 150 s | 100 % | 80 % | 72 % |
| 18 | `plaza-3` | La plaza de toros | 130 s | 100 % | 80 % | 73 % |
| 19 | `gasolinera-4` | Hora punta | 130 s | 100 % | 70 % | 71 % |
| 20 | `poligono-4` | La serrería | 140 s | 100 % | 70 % | 53 % |
| 21 | `castanar-4` | Al otro lado del arroyo | 120 s | 100 % | 70 % | 83 % |
| 22 | `sanjuan-4` | El espigón | 160 s | 90 % | 80 % | 82 % |
| 23 | `plaza-4` | La Plaza Mayor | 140 s | 100 % | 70 % | 74 % |
| 24 | `granja-4` | Los frutales | 90 s | 100 % | 70 % | 78 % |
| 25 | `poligono-5` | Turno de noche | 150 s | 100 % | 70 % | 63 % |
| 26 | `castanar-5` | Castaños centenarios | 130 s | 100 % | 60 % | 68 % |
| 27 | `sanjuan-5` | Brisa de mar | 180 s | 100 % | 90 % | 54 % |
| 28 | `plaza-5` | La paella gigante | 120 s | 100 % | 80 % | 80 % |
| 29 | `granja-5` | La acequia | 120 s | 100 % | 80 % | 95 % |
| 30 | `gasolinera-5` | Turno de noche | 140 s | 100 % | 80 % | 52 % |
| 31 | `castanar-6` | Acampada nocturna | 150 s | 100 % | 70 % | 53 % |
| 32 | `sanjuan-6` | Los chiringuitos | 170 s | 100 % | 80 % | 72 % |
| 33 | `plaza-6` | Verbena nocturna | 130 s | 100 % | 90 % | 61 % |
| 34 | `granja-6` | Gasóleo derramado | 80 s | 100 % | 100 % | 83 % |
| 35 | `gasolinera-6` | Área de servicio | 160 s | 100 % | 60 % | 62 % |
| 36 | `poligono-6` | El desguace | 150 s | 100 % | 70 % | 72 % |
| 37 | `sanjuan-7` | Verbena en el paseo | 170 s | 100 % | 70 % | 73 % |
| 38 | `plaza-7` | La romería | 150 s | 100 % | 50 % | 60 % |
| 39 | `granja-7` | Viento revuelto | 160 s | 100 % | 80 % | 59 % |
| 40 | `gasolinera-7` | Parada de camioneros | 160 s | 100 % | 70 % | 61 % |
| 41 | `poligono-7` | La subestación | 150 s | 100 % | 80 % | 70 % |
| 42 | `castanar-7` | El aserradero | 130 s | 100 % | 70 % | 73 % |
| 43 | `plaza-8` | Las luces de la feria | 140 s | 100 % | 70 % | 65 % |
| 44 | `granja-8` | La bomba del pozo | 120 s | 90 % | 50 % | 80 % |
| 45 | `gasolinera-8` | Túnel de lavado | 150 s | 100 % | 70 % | 59 % |
| 46 | `poligono-8` | Almacén de butano | 160 s | 100 % | 30 % | 68 % |
| 47 | `castanar-8` | Los pastos | 170 s | 100 % | 60 % | 46 % |
| 48 | `sanjuan-8` | El pinar de la playa | 180 s | 100 % | 60 % | 65 % |
| 49 | `granja-9` | Noche en la granja | 150 s | 90 % | 80 % | 88 % |
| 50 | `gasolinera-9` | Fiestas del pueblo | 170 s | 100 % | 70 % | 70 % |
| 51 | `poligono-9` | Fábrica de pinturas | 170 s | 100 % | 60 % | 58 % |
| 52 | `castanar-9` | Fiestas del pueblo | 180 s | 100 % | 60 % | 64 % |
| 53 | `sanjuan-9` | La traca final | 150 s | 100 % | 60 % | 70 % |
| 54 | `plaza-9` | Castillo de fuegos | 150 s | 90 % | 60 % | 81 % |
| 55 | `gasolinera-10` | Vendaval | 170 s | 100 % | 60 % | 69 % |
| 56 | `poligono-10` | Tormenta seca | 170 s | 100 % | 50 % | 44 % |
| 57 | `castanar-10` | Tormenta seca | 140 s | 100 % | 70 % | 49 % |
| 58 | `sanjuan-10` | El puerto pesquero | 180 s | 100 % | 30 % | 79 % |
| 59 | `plaza-10` | Tormenta de verano | 140 s | 90 % | 60 % | 62 % |
| 60 | `granja-10` | El cortijo | 90 s | 100 % | 60 % | 83 % |
| 61 | `poligono-11` | Polígono en llamas | 200 s | 100 % | 60 % | 70 % |
| 62 | `castanar-11` | El Castañar en llamas | 160 s | 100 % | 30 % | 58 % |
| 63 | `sanjuan-11` | La noche más corta | 190 s | 90 % | 50 % | 56 % |
| 64 | `plaza-11` | Fin de fiestas | 180 s | 100 % | 60 % | 83 % |
| 65 | `granja-11` | La gran cosecha | 150 s | 100 % | 40 % | 67 % |
| 66 | `gasolinera-11` | La gran estación | 190 s | 100 % | 70 % | 57 % |
| 67 | `finale` | El gran incendio | 260 s | 90 % | 30 % | 56 % |

Cosas a tener en cuenta:

- **Se pierde más cerca de la 2.ª estrella.** En muchos niveles nuevos `minSaved` está a 5-13 puntos de la línea de 2 estrellas (en los originales, unos 30). Por eso el marcador de salvado se pone rojo y parpadea cuando quedan menos de 5 puntos para perder (`#hud-saved.danger`).
- **La noche solo es difícil para personas.** El bot ve igual de noche, así que los niveles nocturnos (p. ej. `plaza-6`, `plaza-9`, `granja-9`, `poligono-10`, el final) serán algo más duros de lo que dicen estos números.
- **Rescates y 3 estrellas.** En la 1.3.0 el bot casi nunca rescataba (se quedaba parado a 1,3 casillas del animal), así que las 3 estrellas de los niveles con rescates quedaban para quien jugara bien. Arreglado en la 2.0.
- **Fallos del bot que no se tocaron en la 1.3.0** (los dos primeros, arreglados en la 2.0: ver «2.0: qué cambia al medir»): no llega nunca a propósito a una boca de riego (`nearAt(hydrant, 0.9)` no casa con ninguna casilla, haría falta ≥ 1,05), no apunta a celdas de un edificio escondidas detrás de otras aunque el agua llegue, y si la palanca está lejos riega el cuadro eléctrico una y otra vez. Los niveles se han diseñado para no depender de eso.

## Con mejoras

Las mejoras se compran con monedas en la tienda: 4 líneas de 5 niveles cada una, a 200, 500, 1.000, 2.000 y 4.000 monedas (7.700 por línea, 30.800 todas). Cuentan en todos los niveles de la campaña; el reto diario se juega siempre sin mejoras porque su clasificación es común para todos. Los valores están en `UPGRADE_STEP` de `src/economy.ts`.

| Línea | Por nivel | Al máximo |
|---|---|---|
| Manguera larga | +1 m de manguera | +5 m |
| Más presión | +4 % de fuerza del agua y +3 % de alcance de las boquillas | +20 % y +15 % |
| Botas ligeras | +3 % de velocidad | +15 % |
| Más tiempo | +5 s en el reloj | +25 s |

Medido el 26 sept 2026 con `npx tsx tools/bot.ts 30` (sin mejoras), `--up=3` (todas a nivel 3) y `--up=max`: 30 partidas por nivel, media de los 6 niveles.

| | PRO sin mejoras | PRO todo a 3 | PRO al máximo | casual sin mejoras | casual todo a 3 | casual al máximo |
|---|---|---|---|---|---|---|
| Victorias | 94 % | 97 % | 100 % | 75 % | 78 % | 87 % |
| Zona salvada | 78 % | 84 % | 87 % | 54 % | 56 % | 63 % |
| Partidas con 3 estrellas | 41 % | 48 % | 48 % | 7 % | 2 % | 6 % |

- Ayudan de forma clara: con todo al máximo el bot PRO gana siempre y el casual pasa del 75 % al 87 % de victorias, con 9 puntos más de zona salvada.
- Las estrellas siguen costando: la tercera estrella apenas cambia para el bot casual, y en la gasolinera (3) y en San Juan (6) ningún bot la consigue ni con todo al máximo.
- El polígono (4) se decide en la carrera hasta la palanca: con las mejoras a nivel 3 el bot PRO ya lo saca siempre con 3 estrellas (el casual no). Con +4 % de velocidad por nivel también lo hacía trivial para el casual, por eso la velocidad sube solo un 3 % por nivel y la fuerza un 4 %.
- El bot casual apunta al fuego más cercano con bastante error; con más alcance dispara desde más lejos y falla más, así que en la granja (2) y en El Castañar (5) sus números con mejoras suben poco o bailan. A un jugador de verdad más alcance nunca le perjudica.
- Sin mejoras la simulación es idéntica a la de antes (misma salida del bot), así que las semillas del reto diario (`dailyTable.ts`) siguen valiendo.

Salida de `npx tsx tools/bot.ts 30 --up=max`:

```
1 plaza PRO            win 100%  saved  98%  left 125s  ★ 0/0/0/30  rescued 0.0/0  boom 0.0  zap 0.0  {"win":30}
1 plaza casual         win 100%  saved  75%  left  75s  ★ 0/23/1/6  rescued 0.0/0  boom 0.0  zap 0.0  {"win":30}
2 granja PRO           win 100%  saved  74%  left 129s  ★ 0/15/11/4  rescued 1.0/4  boom 0.0  zap 0.0  {"win":30}
2 granja casual        win  60%  saved  57%  left 125s  ★ 12/12/1/5  rescued 0.5/4  boom 0.0  zap 0.0  {"win":18,"control":12}
3 gasolinera PRO       win 100%  saved  74%  left 111s  ★ 0/24/6/0  rescued 0.0/0  boom 0.0  zap 0.0  {"win":30}
3 gasolinera casual    win 100%  saved  63%  left 109s  ★ 0/30/0/0  rescued 0.0/0  boom 0.0  zap 0.0  {"win":30}
4 poligono PRO         win 100%  saved 100%  left 179s  ★ 0/0/0/30  rescued 0.0/2  boom 0.0  zap 0.0  {"win":30}
4 poligono casual      win 100%  saved  52%  left  99s  ★ 0/29/1/0  rescued 1.0/2  boom 0.0  zap 0.0  {"win":30}
5 castanar PRO         win 100%  saved  83%  left 164s  ★ 0/6/1/23  rescued 0.0/4  boom 0.0  zap 0.0  {"win":30}
5 castanar casual      win  77%  saved  59%  left 150s  ★ 7/0/23/0  rescued 0.0/4  boom 0.0  zap 0.0  {"win":23,"control":7}
6 sanjuan PRO          win 100%  saved  90%  left  79s  ★ 0/0/30/0  rescued 0.2/2  boom 0.0  zap 0.0  {"win":30}
6 sanjuan casual       win  87%  saved  72%  left  79s  ★ 4/8/18/0  rescued 0.2/2  boom 0.0  zap 0.0  {"win":26,"control":4}
```

## El final (nivel 67, «El gran incendio»)

`src/sim/campaign/finale.ts`. Mapa de 36×36 (1.296 celdas) con el camión en el cruce del centro y un fuego en cada barrio: la feria con el puesto de churros ardiendo (suroeste), la gasolinera con un coche ardiendo junto a los surtidores y tres bombonas cerca (sureste), las naves con el cuadro eléctrico con corriente y la palanca junto al cruce (noreste) y el casco viejo con la iglesia y una casa ardiendo (noroeste). De noche, con 8 cohetes desde el segundo 35, el viento que gira hacia el norte en el 75 (empuja el fuego del casco viejo hacia la iglesia) y hacia el sur en el 150, 260 s, espuma para 18 s y una boca de riego en cada barrio. Se pierde si lo salvado baja del 56 %; 2 estrellas con el 66 % y 3 con el 75 % sin que se escape nadie (hay un gato, un vecino y un perro que rescatar).

Lo que separa al bot PRO del casual es el orden: el PRO ataca primero los fuegos que amenazan lo que más vale (la iglesia, las naves) aunque estén más lejos, y el casual va al más cercano mientras el casco viejo se quema. Por eso se decide sobre todo por el % salvado, no por el tiempo.

Medido el 26 sept 2026 (en esta rama el final era el nivel 7 porque los escenarios aún estaban vacíos; la dificultad no depende de la posición):

```
npx tsx tools/bot.ts 10 finale
7 finale PRO           win  90%  saved  67%  left  56s  ★ 1/3/6/0  rescued 1.0/3  boom 0.0  zap 0.0  {"win":9,"control":1}
7 finale casual        win  30%  saved  56%  left  73s  ★ 7/3/0/0  rescued 0.0/3  boom 0.0  zap 0.0  {"control":7,"win":3}
npx tsx tools/bot.ts 30 finale
7 finale PRO           win  97%  saved  68%  left  61s  ★ 1/6/23/0  rescued 1.0/3  boom 0.0  zap 0.0  {"win":29,"control":1}
7 finale casual        win  40%  saved  57%  left  68s  ★ 18/12/0/0  rescued 0.0/3  boom 0.0  zap 0.0  {"control":18,"win":12}
npx tsx tools/bot.ts 30 finale --up=3
7 finale PRO           win  93%  saved  69%  left  82s  ★ 2/3/25/0  rescued 1.2/3  boom 0.0  zap 0.0  {"win":28,"control":2}
7 finale casual        win  73%  saved  60%  left  75s  ★ 8/22/0/0  rescued 0.3/3  boom 0.0  zap 0.0  {"win":22,"control":8}
npx tsx tools/bot.ts 30 finale --up=max
7 finale PRO           win 100%  saved  69%  left  85s  ★ 0/8/22/0  rescued 1.1/3  boom 0.0  zap 0.0  {"win":30}
7 finale casual        win  57%  saved  59%  left  87s  ★ 13/15/2/0  rescued 0.4/3  boom 0.0  zap 0.0  {"win":17,"control":13}
```

- Con 50 partidas: PRO 96 %, casual 36 %. Sin hacer nada se descontrola hacia el segundo 50.
- Las 3 estrellas no las saca ningún bot (ninguno rescata a los tres y el PRO no pasa del 74 % salvado): quedan para quien juegue muy bien.
- Rendimiento (Chromium con WebGL por software, calidad media, 360×640): 0,2-0,4 ms por paso de simulación, ~1,5 ms por actualización de la vista y unas 110 llamadas de dibujo con 56.000 triángulos, frente a 60-75 llamadas y 33.000-80.000 triángulos de los niveles originales.

## 2.0: qué cambia al medir

Desde la 2.0 los números no se pueden comparar uno a uno con los de arriba (1.3.0), por tres motivos:

- **Los niveles tienen power-ups y eventos** (desde el 3 y el 8). El bot coge los power-ups que le pillan cerca, usa el helicóptero y enfría la fuga de gas. Casi todos ayudan, así que los niveles de siempre salen algo más fáciles.
- **Se han arreglado los fallos del bot** que se habían dejado para no mover las medidas: ahora sí llega a las bocas de riego (y al camión: se engancha en su punto de enganche, no en el centro), rescata (se pone en el centro de la casilla, a menos de 1,25 m), ataca las llamas escondidas dentro de un edificio echando agua a su pared (solo si no ve otra) y ya no se queda quieto delante de un objetivo que no ve por estar medio metro desviado. Juega mejor, sobre todo el casual en los niveles con rescates y bocas de riego.
- **La gente de las ventanas** (el centro) solo va a rescatarla cuando el fuego se le acerca.

El reto diario (`dailyTable.ts`) se ha regenerado con el bot nuevo: de 400 días, 300 valen con la primera semilla.

## 2.0, entrega 1: ruta de 97 niveles

Medida el 30 sept 2026 con `npx tsx tools/bot.ts 10 --sum`. Con 10 partidas cada porcentaje baila unos ±15 puntos.

Por capítulos (cada capítulo acaba en su gran incendio):

| Capítulo | Niveles | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|
| 1-10 | 10 | 100 % | 89 % | 70 % |
| 11-20 | 10 | 100 % | 91 % | 78 % |
| 21-30 | 10 | 100 % | 84 % | 76 % |
| 31-40 | 10 | 97 % | 86 % | 73 % |
| 41-50 | 10 | 100 % | 91 % | 72 % |
| 51-60 | 10 | 100 % | 74 % | 69 % |
| 61-70 | 10 | 100 % | 80 % | 77 % |
| 71-80 | 10 | 98 % | 71 % | 70 % |
| 81-90 | 10 | 100 % | 69 % | 68 % |
| 91-97 | 7 | 100 % | 87 % | 72 % |
Por escenario:

| Escenario | Niveles | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|
| plaza | 12 | 100 % | 81 % | 72 % |
| granja | 11 | 99 % | 87 % | 81 % |
| gasolinera | 11 | 100 % | 90 % | 67 % |
| poligono | 11 | 99 % | 74 % | 68 % |
| castanar | 11 | 100 % | 63 % | 62 % |
| sanjuan | 11 | 97 % | 75 % | 71 % |
| puerto | 10 | 100 % | 93 % | 75 % |
| ciudad | 10 | 100 % | 91 % | 82 % |
| estacion | 10 | 100 % | 88 % | 76 % |
| Grandes incendios | Niveles | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|
| todos | 10 | 99 % | 70 % | 67 % |

Retos diarios del 25 sept al 1 oct (solo PRO):

```
daily#1 casta wind     win  60%  saved  38%  left 114s  ★ 4/6/0/0  rescued 2.4/4  boom 0.0  zap 0.0  pw 0.4  {"win":6,"control":4}
daily#2 plaza wind     win 100%  saved  91%  left  93s  ★ 0/0/10/0  rescued 0.0/0  boom 0.0  zap 0.0  pw 0.3  {"win":10}
daily#3 casta night    win 100%  saved  73%  left 150s  ★ 0/0/7/3  rescued 1.7/4  boom 0.0  zap 0.0  pw 0.7  {"win":10}
daily#4 gasol short    win 100%  saved  62%  left  58s  ★ 0/9/1/0  rescued 0.0/0  boom 0.0  zap 0.0  pw 1.2  {"win":10}
daily#5 sanju wind     win 100%  saved  80%  left  64s  ★ 0/1/9/0  rescued 0.0/2  boom 0.0  zap 0.0  pw 2.3  {"win":10}
daily#6 granj night    win 100%  saved  64%  left 100s  ★ 0/10/0/0  rescued 4.4/6  boom 0.0  zap 0.0  pw 1.1  {"win":10}
daily#7 plaza wind     win 100%  saved  94%  left  95s  ★ 0/0/1/9  rescued 0.0/0  boom 0.1  zap 0.0  pw 0.3  {"win":10}
```

### Los 30 niveles nuevos

| Nº | id | Nombre | Tiempo | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|---|---|
| 7 | `puerto-1` | El muelle (presentación) | 130 s | 100 % | 100 % | 100 % |
| 10 | `puerto-2` | ¡Fuego en el puerto! (gran incendio) | 190 s | 100 % | 70 % | 74 % |
| 12 | `ciudad-1` | La calle mayor (presentación) | 130 s | 100 % | 100 % | 98 % |
| 17 | `estacion-1` | El andén (presentación) | 130 s | 100 % | 100 % | 79 % |
| 18 | `ciudad-2` | El café de la esquina | 130 s | 100 % | 100 % | 88 % |
| 19 | `puerto-3` | La lonja | 150 s | 100 % | 90 % | 66 % |
| 20 | `ciudad-3` | Rascacielos en llamas (gran incendio) | 200 s | 100 % | 60 % | 73 % |
| 25 | `estacion-2` | Los vagones | 150 s | 100 % | 100 % | 98 % |
| 28 | `estacion-3` | El paso a nivel | 150 s | 100 % | 100 % | 77 % |
| 29 | `puerto-4` | Los contenedores | 160 s | 100 % | 100 % | 72 % |
| 30 | `estacion-4` | Incendio en la estación (gran incendio) | 210 s | 100 % | 60 % | 63 % |
| 31 | `ciudad-4` | El mercado de abastos | 150 s | 100 % | 100 % | 69 % |
| 38 | `puerto-5` | El varadero | 150 s | 100 % | 100 % | 66 % |
| 39 | `ciudad-5` | El parque | 150 s | 100 % | 100 % | 81 % |
| 40 | `puerto-6` | La terminal de combustible (gran incendio) | 210 s | 100 % | 100 % | 68 % |
| 46 | `estacion-5` | La cochera | 160 s | 100 % | 100 % | 81 % |
| 48 | `ciudad-6` | El aparcamiento | 160 s | 100 % | 100 % | 95 % |
| 50 | `ciudad-7` | Apagón en el centro (gran incendio) | 220 s | 100 % | 100 % | 73 % |
| 53 | `estacion-6` | Dos vías | 170 s | 100 % | 90 % | 73 % |
| 58 | `estacion-7` | El almacén de mercancías | 160 s | 100 % | 80 % | 70 % |
| 60 | `estacion-8` | La playa de vías (gran incendio) | 230 s | 100 % | 60 % | 57 % |
| 61 | `puerto-7` | El faro | 170 s | 100 % | 100 % | 89 % |
| 69 | `ciudad-8` | El hotel | 180 s | 100 % | 100 % | 81 % |
| 73 | `puerto-8` | El ferry | 170 s | 100 % | 80 % | 64 % |
| 82 | `estacion-9` | El último tren | 180 s | 100 % | 100 % | 77 % |
| 84 | `ciudad-9` | Noche de estreno | 170 s | 100 % | 70 % | 79 % |
| 85 | `puerto-9` | El barrio de pescadores | 160 s | 100 % | 100 % | 70 % |
| 91 | `estacion-10` | Hora punta en la estación | 190 s | 100 % | 90 % | 83 % |
| 92 | `ciudad-10` | Hora punta | 200 s | 100 % | 80 % | 80 % |
| 93 | `puerto-10` | Noche en los muelles | 200 s | 100 % | 90 % | 80 % |

### Cómo se han ajustado

1. **Que el fuego sea una amenaza**: con `npx tsx tools/curve.ts <id>` se mira cuánto se quema si nadie hace nada (tiene que perderse entre el 30 y el 60 %) y si el PRO y el casual salvan más que eso. Si a los 10 s todos van igual, el fuego empieza demasiado grande o en algo que nadie alcanza; si nadie lo nota, empieza en algo que no se propaga.
2. **Pocos focos al empezar, en material que corre** (pasarelas de madera, redes, pacas, hierba seca junto a las vías, torres pegadas unas a otras) y repartidos, para que decidan la rapidez y el orden.
3. **Umbrales con `tools/tune.ts`**: juega 16 partidas sin mínimo de salvado y propone el `minSaved` más alto con el que el PRO gana el 95 % y el casual la tasa pedida para su puesto en la ruta (del 95 % en las presentaciones al 50 % al final, 10 puntos menos en los grandes incendios y 10 más justo después). Las estrellas: dos, en lo que salva el PRO de mediana menos 2 puntos; tres, en su percentil 80.

### Lo que no se ha conseguido

- **En los escenarios nuevos el casual gana casi tanto como el PRO.** Sus niveles se deciden más por la mecánica (espuma para el gasóleo, estar debajo de la ventana, esperar al tren) que por la puntería o la rapidez, y el bot casual las usa igual de bien que el PRO. Por eso sus tasas de victoria del casual se quedan altas aunque los umbrales estén justo por debajo de lo que salva el PRO. A una persona le costarán más: no sabe de antemano que el agua aviva el gasóleo ni que el tren corta la manguera.
- **El PRO rescata más ventanas y salva menos edificios** que el casual en algunos niveles del centro (`ciudad-8`): gasta tiempo en la plataforma mientras la manzana arde. Da las tres estrellas (nadie se escapa), no más % salvado.
- **`sanjuan-4`** sigue con el PRO al 80-90 % (lo mismo que en la 1.3.0).

## 2.0, entrega 2: ruta de 120 niveles

Medida el 30 sept 2026 con `npx tsx tools/bot.ts 10 --sum` sobre la ruta final (120 niveles, 12 escenarios, 12 grandes incendios). Con 10 partidas cada porcentaje baila unos ±15 puntos. Estas tablas son de **antes de la decisión de dificultad** del mismo día; las de después están en «2.0: decisión de dificultad», al final.

**El PRO gana el 90 % o más en todos los niveles** (el que menos, el final, con el 90 %; todos los demás entre el 99 y el 100 % por capítulo).

Por capítulos:

| Capítulo | Niveles | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|
| 1-10 | 10 | 100 % | 91 % | 70 % |
| 11-20 | 10 | 100 % | 96 % | 79 % |
| 21-30 | 10 | 100 % | 93 % | 76 % |
| 31-40 | 10 | 100 % | 91 % | 72 % |
| 41-50 | 10 | 100 % | 90 % | 75 % |
| 51-60 | 10 | 100 % | 86 % | 68 % |
| 61-70 | 10 | 100 % | 87 % | 70 % |
| 71-80 | 10 | 99 % | 81 % | 68 % |
| 81-90 | 10 | 100 % | 74 % | 67 % |
| 91-100 | 10 | 100 % | 77 % | 71 % |
| 101-110 | 10 | 100 % | 81 % | 73 % |
| 111-120 | 10 | 99 % | 77 % | 64 % |

Por escenario:

| Escenario | Niveles | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|
| plaza | 12 | 99 % | 82 % | 74 % |
| granja | 11 | 100 % | 91 % | 82 % |
| gasolinera | 11 | 100 % | 85 % | 66 % |
| poligono | 11 | 100 % | 85 % | 69 % |
| castanar | 11 | 99 % | 77 % | 61 % |
| sanjuan | 11 | 100 % | 75 % | 69 % |
| puerto | 10 | 100 % | 95 % | 73 % |
| ciudad | 10 | 100 % | 93 % | 82 % |
| estacion | 10 | 100 % | 90 % | 76 % |
| nieve | 8 | 100 % | 79 % | 66 % |
| museo | 8 | 100 % | 91 % | 70 % |
| camping | 7 | 100 % | 83 % | 63 % |

| Grandes incendios | Niveles | PRO gana | Casual gana | Casual salva |
|---|---|---|---|---|
| todos | 12 | 99 % | 72 % | 64 % |

Retos diarios del 25 sept al 1 oct (solo PRO; `dailyTable.ts` regenerado con la simulación de esta entrega):

```
daily#1 casta wind     win  50%  saved  35%  left 115s  ★ 5/5/0/0  rescued 2.5/4  boom 0.0  zap 0.0  pw 0.4  {"win":5,"control":5}
daily#2 plaza wind     win 100%  saved  91%  left  93s  ★ 0/0/10/0  rescued 0.0/0  boom 0.0  zap 0.0  pw 0.3  {"win":10}
daily#3 casta night    win 100%  saved  71%  left 145s  ★ 0/1/6/3  rescued 1.8/4  boom 0.0  zap 0.0  pw 0.7  {"win":10}
daily#4 gasol short    win 100%  saved  64%  left  62s  ★ 0/8/2/0  rescued 0.0/0  boom 0.0  zap 0.0  pw 0.8  {"win":10}
daily#5 sanju wind     win 100%  saved  80%  left  64s  ★ 0/1/9/0  rescued 0.0/2  boom 0.0  zap 0.0  pw 2.3  {"win":10}
daily#6 granj night    win 100%  saved  66%  left 102s  ★ 0/10/0/0  rescued 4.4/6  boom 0.0  zap 0.0  pw 1.1  {"win":10}
daily#7 plaza wind     win 100%  saved  94%  left  95s  ★ 0/0/1/9  rescued 0.0/0  boom 0.1  zap 0.0  pw 0.3  {"win":10}
```

### Los 23 niveles nuevos

Entre paréntesis, el % salvado de mediana. «Mínimo» es el `minSaved` (por debajo, el fuego se descontrola y se pierde). Mínimos y resultados ya con la decisión de dificultad (cambian `nieve-3`, `museo-2`, `museo-3`, `camping-2`, `camping-3`, `nieve-8`, `museo-8` y `camping-7`).

| Nº | id | Nombre | Tiempo | Mínimo | ★★ / ★★★ | PRO gana | Casual gana |
|---|---|---|---|---|---|---|---|
| 24 | `nieve-1` | The mountain hut / El refugio (presentación) | 130 s | 60 % | 93 / 97 % | 100 % (96 %) | 100 % (81 %) |
| 33 | `museo-1` | The gallery / La galería (presentación) | 130 s | 60 % | 93 / 96 % | 100 % (95 %) | 100 % (92 %) |
| 34 | `nieve-2` | The hotel terrace / La terraza del hotel | 150 s | 42 % | 85 / 88 % | 100 % (87 %) | 70 % (53 %) |
| 43 | `nieve-3` | The chairlift / El telesilla | 150 s | 58 % | 81 / 84 % | 100 % (81 %) | 50 % (60 %) |
| 44 | `camping-1` | The campfire / La hoguera (presentación) | 130 s | 49 % | 79 / 83 % | 100 % (82 %) | 100 % (70 %) |
| 45 | `museo-2` | The sculpture hall / La sala de esculturas | 150 s | 60 % | 93 / 96 % | 100 % (95 %) | 80 % (63 %) |
| 55 | `nieve-4` | The skating rink / La pista de patinaje | 160 s | 49 % | 73 / 77 % | 100 % (70 %) | 100 % (74 %) |
| 56 | `museo-3` | The museum shop / La tienda del museo | 150 s | 85 % | 92 / 95 % | 100 % (94 %) | 90 % (92 %) |
| 60 | `nieve-5` | Fire at the ski resort / Fuego en la estación de esquí (gran incendio) | 210 s | 63 % | 87 / 93 % | 100 % (89 %) | 40 % (64 %) |
| 62 | `camping-2` | Tent city / Las tiendas | 150 s | 67 % | 73 / 78 % | 100 % (76 %) | 60 % (69 %) |
| 67 | `museo-4` | The library / La biblioteca | 160 s | 56 % | 62 / 65 % | 100 % (64 %) | 100 % (62 %) |
| 70 | `museo-5` | Night at the museum / Noche en el museo (gran incendio) | 220 s | 58 % | 71 / 74 % | 100 % (73 %) | 80 % (59 %) |
| 74 | `camping-3` | The RV park / Las caravanas | 150 s | 75 % | 85 / 90 % | 100 % (88 %) | 70 % (76 %) |
| 81 | `nieve-6` | The snowy forest / El bosque nevado | 170 s | 74 % | 80 / 85 % | 100 % (82 %) | 80 % (75 %) |
| 87 | `camping-4` | The lake shore / El lago | 160 s | 57 % | 65 / 75 % | 100 % (67 %) | 50 % (59 %) |
| 89 | `museo-6` | The storeroom / El almacén | 160 s | 55 % | 65 / 69 % | 100 % (68 %) | 100 % (63 %) |
| 90 | `camping-5` | Wildfire at the national park / Incendio en el parque nacional (gran incendio) | 220 s | 61 % | 67 / 70 % | 100 % (69 %) | 90 % (62 %) |
| 99 | `nieve-7` | The alpine village / La aldea alpina | 170 s | 59 % | 65 / 70 % | 100 % (67 %) | 90 % (65 %) |
| 102 | `museo-7` | Natural history / Historia natural | 170 s | 68 % | 78 / 81 % | 100 % (77 %) | 100 % (71 %) |
| 108 | `camping-6` | The lookout / El mirador | 170 s | 56 % | 66 / 70 % | 100 % (67 %) | 100 % (61 %) |
| 112 | `nieve-8` | Blizzard night / Noche de ventisca (apagón y racha, siempre) | 190 s | 58 % | 69 / 74 % | 100 % (71 %) | 40 % (59 %) |
| 114 | `museo-8` | The gala / La gala (curiosos y apagón, siempre) | 180 s | 54 % | 72 / 75 % | 90 % (71 %) | 40 % (62 %) |
| 119 | `camping-7` | Dry lightning / Tormenta seca | 180 s | 41 % | 49 / 56 % | 90 % (51 %) | 70 % (45 %) |

### Cómo se han ajustado

1. **Mapas**: como en la entrega 1, con `npx tsx tools/probe.ts 4 <id>` (cuánto se pierde sin nadie, cuánto salvan el casual y el PRO). En el museo el mármol no arde: el fuego corre por el parqué y las alfombras, y los muros bajos (`|`, 1,6 m) paran el agua, así que hay que entrar en cada sala. En el camping el suelo base es tierra y la hierba alta va en manchas: con todo de hierba el parque entero ardía en 20 s.
2. **El bot apunta como sale el chorro**: antes daba por buena la línea de tiro aunque en medio hubiera algo bajo (una valla de 0,9 m) y se quedaba regando la valla. Ahora sigue la parábola del chorro. Esto cambió las cifras de algunos niveles de siempre.
3. **Umbrales con `tools/tune-route.ts`** (tasa del casual según el puesto en la ruta: 95 % en las presentaciones, del 90 % al 50 % a lo largo de la ruta, 10 puntos menos en los grandes incendios y 10 más justo después) y `tools/apply-tune.py`. En los 23 niveles nuevos, estrellas y mínimo. En el resto, solo el mínimo (`--min-only`): siempre a la baja donde el PRO no llegaba al 90 %, y al alza solo desde el nivel 55, como mucho 20 puntos y con el tope de dos estrellas menos 6 puntos (perder siempre queda lejos de las dos estrellas). Las estrellas de los niveles de siempre solo se han bajado donde el PRO ya no llegaba a dos.
4. **Rampa de propagación** (`spread` en `src/sim/levels.ts`): desde el nivel 40 el fuego corre un poco más, hasta un 12 % más en el 120 (nunca en las presentaciones). Sube la presión en la segunda mitad sin tocar los mapas.

### Lo que no se ha conseguido

- **La curva del casual baja menos de lo buscado**: del 91-96 % de los primeros capítulos al 74-81 % de los últimos (se buscaba el 40-55 %). Los grandes incendios sí son más duros (72 % el casual). El ajuste solo subió los mínimos con mucho cuidado (desde el nivel 55, sin pasar de dos estrellas menos 6 puntos y con el PRO al 95 %). Hay margen para endurecer (ver la sección siguiente), pero se deja para cuando haya datos de jugadores: a una persona le costará más que al bot, porque tiene que descubrir que el hielo resbala, que la palanca activa los aspersores o que el helicóptero se recarga, mientras que el bot casual lo sabe desde el primer intento. Después de la decisión de dificultad (al final del documento), la segunda mitad queda en el 70-76 %.
- **Niveles donde el casual gana poco**: `nieve-5` (40 %) y `camping-4` (50 %). Son el gran incendio de la nieve y el lago; se dejan así porque el PRO gana el 100 % y quedan justo antes de un nivel tranquilo.
- ~~`nieve-8` y `museo-8` se quedaban sin sus eventos~~ Arreglado: llevan eventos fijos (`fixedEvents`) que no dependen de su puesto en la ruta. La ventisca tiene apagón (segundo 50) y racha (105); la gala, curiosos (45) y apagón (100). Como todos los eventos, empiezan antes si el fuego ya está controlado, y el segundo no llega si el nivel se acaba antes. Con ellos el casual gana el 60 % en `nieve-8` (antes, el 70 %) y el 70 % en `museo-8`, igual que antes; el PRO, el 100 % en los dos. Son cifras de antes de la decisión de dificultad.

### Si los datos piden más dificultad

Esta guía y su tabla son de antes de la decisión de dificultad: la opción segura de los mínimos ya está aplicada (ver la sección siguiente), así que lo que queda por endurecer es menos. Qué mirar: en la vista `niveles` de Supabase (juego `apagalo`), la tasa de victoria de cada nivel (`level_complete` sobre `level_start`), con al menos 200 partidas por nivel. La referencia es la curva buscada: el 90 % al principio, del 40 al 55 % al final y 10 puntos menos en los grandes incendios. Si un tramo queda **15 puntos o más por encima**, se endurece en este orden.

Medido con `npx tsx tools/headroom.ts 12` (niveles 41-120, 12 partidas por bot; las pruebas de propagación y tiempo, con 8). Con tan pocas partidas cada cifra baila unos ±10 puntos. Hoy, en esos 80 niveles, el PRO gana el 100 % y el casual el 82 %.

| | Cambio | PRO gana | Casual gana | Niveles con el PRO por debajo del 90 % |
|---|---|---|---|---|
| Ahora | | 100 % | 82 % | 0 |
| **1. Mínimos** | +5 puntos en todos | 96 % | 49 % | 10 |
| | +5 puntos solo donde el PRO sigue ganando siempre y el mínimo queda 6 puntos por debajo de las dos estrellas (38 niveles) | 99 % | 69 % | 0 |
| | +10 puntos en todos | 75 % | 32 % | 33 (demasiado) |
| **2. Propagación** | `SPREAD_MAX` de 0,12 a 0,18 | 98 % | 72 % | 12 |
| | `SPREAD_MAX` a 0,24 | 94 % | 69 % (54 % en 111-120) | 19; en 111-120 el PRO baja al 72 % (demasiado) |
| **3. Tiempo** | −20 % en todos | 99 % | 82 % | 3 |

Por capítulos, con +5 puntos en todos los mínimos (PRO / casual): 41-50, 99 / 76 %; 51-60, 97 / 58 %; 61-70, 98 / 44 %; 71-80, 93 / 39 %; 81-90, 92 / 22 %; 91-100, 98 / 45 %; 101-110, 96 / 57 %; 111-120, 92 / 48 %.

1. **Primero, los mínimos** (`minSaved` de cada nivel en `src/sim/campaign/`). Es el mando más fino: el casual suele salvar justo por encima del mínimo, así que unos pocos puntos cambian mucho su tasa de victoria. Solo afecta al nivel que se toca y no cambia el reto diario. **Cuánto:** +3 a +5 puntos en los niveles que salgan fáciles, nunca más de 5 de una vez. Dos límites: el mínimo no puede pasar de dos estrellas menos 6 puntos (si hace falta, se suben también las estrellas con `tools/tune-route.ts`) y el PRO tiene que seguir ganando el 90 %. Con +5, el PRO baja del 90 % en `nieve-4`, `poligono-6`, `gasolinera-7`, `castanar-8`, `estacion-8`, `granja-8`, `poligono-8`, `gasolinera-9`, `museo-7` y `poligono-11`: en esos niveles, como mucho +2. **No subirlo en los grandes incendios**: con +5 el casual pasa del 50-92 % al 0-42 %.
2. **Después, la propagación** (`SPREAD_MAX` en `src/sim/levels.ts`, la rampa desde el nivel 40). Cambia los 80 niveles de golpe, y que el fuego corra más también se nota en la sensación de juego, no solo en el porcentaje. Tiene sentido si todos los capítulos de la segunda mitad salen fáciles, no uno suelto. **Cuánto:** de 0,12 a 0,18 como mucho, y bajando 2-3 puntos el mínimo de los niveles donde el PRO baje del 90 % (con 0,18: `ciudad-7`, `nieve-4`, `granja-7`, `gasolinera-7`, `sanjuan-7`, `camping-4`, `museo-7`, `sanjuan-10`, `plaza-11`, `puerto-10`, `sanjuan-11` y `camping-7`). Con 0,24 se rompe el último capítulo. El reto diario no cambia: usa los 6 mapas de siempre sin rampa.
3. **El tiempo, lo último.** Casi nadie pierde por el reloj: el casual pierde porque el fuego se descontrola, y gana con 50-140 s de sobra. Recortar un 20 % no cambia su tasa de victoria y solo castiga a quien juega con calma. Solo tiene sentido en un nivel concreto si la analítica muestra que se gana con más de la mitad del tiempo de sobra. **Cuánto:** −15 % como mucho. Cuidado con `castanar-8`, `camping-7` y el final, donde el PRO ya baja del 90 % con −20 %.

Si al contrario sale **difícil** (un nivel con menos del 30 % de victorias o muchos abandonos en él), se bajan primero los mínimos, en pasos de 5 puntos.

Después de cualquier cambio: `npx tsx tools/bot.ts 10 --sum` (PRO al 90 % o más en todos los niveles) y `npm run daily-table` si se ha tocado la simulación.

## 2.0: decisión de dificultad (30 sept 2026)

Germán delegó la decisión en Claude, que aplicó la opción segura de la tabla anterior: **+5 puntos en el mínimo (`minSaved`) de los niveles donde el PRO sigue ganando siempre**, sin tocar estrellas, grandes incendios, niveles de presentación ni los 10 niveles donde el PRO bajaba del 90 %. Se revisará con los datos reales de derrotas (`level_fail` por nivel).

- De los 38 niveles de la tabla, se quedan fuera los 3 grandes incendios (`nieve-5`, `museo-5` y el final) y la presentación del camping (`camping-1`): quedan 34.
- Con +5, en 10 de ellos el casual se hundía (del 0 al 20 %). En esos se ha subido solo lo que deja al casual en el 40 % o más (medido con 16 partidas): `nieve-3`, `poligono-5` y `sanjuan-10`, +3; `castanar-9` y `nieve-8`, +2; `plaza-7`, `camping-3`, `puerto-8` y `poligono-10`, +1; `castanar-10` se queda como estaba.
- En total cambian **33 niveles**: 24 con +5, 3 con +3, 2 con +2 y 4 con +1. El reto diario no cambia (usa los 6 mapas de siempre; `dailyTable.ts` regenerada, igual).

Resultado con `npx tsx tools/bot.ts 10` (los niveles 1-40 no cambian):

| Capítulo | PRO gana | Casual gana (antes) | Casual gana (después) | Casual salva (después) |
|---|---|---|---|---|
| 1-10 | 100 % | 91 % | 91 % | 70 % |
| 11-20 | 100 % | 96 % | 96 % | 79 % |
| 21-30 | 100 % | 93 % | 93 % | 76 % |
| 31-40 | 100 % | 91 % | 91 % | 72 % |
| 41-50 | 100 % | 90 % | 84 % | 75 % |
| 51-60 | 99 % | 86 % | 76 % | 68 % |
| 61-70 | 99 % | 87 % | 78 % | 70 % |
| 71-80 | 99 % | 81 % | 72 % | 68 % |
| 81-90 | 100 % | 74 % | 74 % | 67 % |
| 91-100 | 100 % | 77 % | 74 % | 71 % |
| 101-110 | 100 % | 81 % | 76 % | 73 % |
| 111-120 | 97 % | 76 % | 70 % | 64 % |

| Escenario | PRO gana | Casual gana | Casual salva |
|---|---|---|---|
| plaza | 99 % | 79 % | 74 % |
| granja | 100 % | 91 % | 82 % |
| gasolinera | 100 % | 75 % | 66 % |
| poligono | 100 % | 80 % | 69 % |
| castanar | 98 % | 76 % | 61 % |
| sanjuan | 99 % | 66 % | 70 % |
| puerto | 100 % | 92 % | 73 % |
| ciudad | 100 % | 91 % | 82 % |
| estacion | 100 % | 90 % | 76 % |
| nieve | 100 % | 71 % | 66 % |
| museo | 99 % | 86 % | 70 % |
| camping | 99 % | 77 % | 63 % |
| grandes incendios | 99 % | 72 % | 64 % |

- **El PRO gana el 90 % o más en todos los niveles.** Se quedan en el 90 % `castanar-6`, `sanjuan-6`, `museo-8` y `camping-7` (subidos +5), y `castanar-8` y el final (sin cambios); todos los demás, el 100 %.
- **El casual baja del 91-96 % de la primera mitad al 70-76 % de la segunda.** Antes era el 74-87 %. La bajada es más suave que la que se buscaba (40-55 % al final), pero sin muros: ningún nivel normal deja al casual por debajo del 30 %.
- Si los datos reales piden más, lo siguiente es la propagación (sección anterior).
