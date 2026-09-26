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

Las mejoras se compran con monedas en la tienda: 4 líneas de 5 niveles cada una, a 200, 500, 1.000, 2.000 y 4.000 monedas (7.700 por línea, 30.800 todas). Solo cuentan en los 6 niveles: el reto diario se juega siempre sin mejoras porque su clasificación es común para todos. Los valores están en `UPGRADE_STEP` de `src/economy.ts`.

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
