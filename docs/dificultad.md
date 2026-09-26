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
