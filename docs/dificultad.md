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
