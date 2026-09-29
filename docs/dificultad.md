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
