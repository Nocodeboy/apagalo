# Diseño v2: más variedad (escenarios, mecánicas, objetos y equipo)

Decidido el 29 sept 2026. Germán pidió construirlo directamente, sin revisión previa del diseño. Sustituye a la campaña de la 1.3.0 (67 niveles en 6 escenarios, en bloques que rotan).

## 1. De dónde sale

La 1.3.0 tiene 67 niveles: los 6 originales, 10 más de cada escenario en bloques de 6 y el final. Germán, después de jugarla:

> «Creo que los últimos cambios no han sido muy acertados. Tenemos más niveles pero casi siempre son los mismos escenarios y mecánicas y se va a hacer aburrido rápido. Falta variedad de pantallas, mecánicas nuevas, objetos, extras, etc... Creo que podemos buscar algo de inspiración en marchando sin llegar a hacerlo igual.»

*Tray Runner* (*¡Marchando!*) resolvió lo mismo con su diseño v2 (`marchando/docs/diseno-v2.md`). De ahí se toma el patrón, no el contenido: una mecánica estrella por sitio, ruta mezclada, objetos que aparecen durante el nivel, eventos sorpresa, personal que contratas, coleccionables para compartir y entregas jugables.

## 2. Qué se va a hacer (resumen)

- **6 escenarios nuevos**, cada uno con su **mecánica estrella** y su aspecto propio: el puerto, el centro de la ciudad, la estación de tren, la estación de esquí, el museo y el camping.
- **Ruta mezclada de 120 niveles**: nunca dos seguidos en el mismo sitio y un sitio nuevo antes del nivel 10.
- **Power-ups** en el suelo durante el nivel (uno cada vez), **eventos sorpresa** anunciados con un cartel y **equipo** que contratas con monedas y te acompaña.
- **Gran incendio cada 10 niveles**, que al ganarlo por primera vez da una **portada de periódico** para el álbum y para compartir como imagen.
- Monetización: **apoyo aéreo** con anuncio con recompensa tras perder varias veces un nivel, y el equipo como nuevo sumidero de monedas.
- Inglés primero: todo lo nuevo en inglés y español, y el juego sale en inglés salvo que el dispositivo esté en español.

## 3. Supuestos

| Tema | Supuesto |
|---|---|
| Rendimiento | Igual que ahora: 60 fps en un móvil de gama media (30 como mínimo). Mapas de 36 × 36 casillas como mucho, un power-up a la vez, como mucho 2 del equipo y 3 vecinos |
| Escala | Todo en el dispositivo: guardado local (y en la nube de CrazyGames). El servidor solo para la analítica y el ranking del reto diario |
| Fiabilidad | La simulación sigue siendo determinista (misma semilla y mismas acciones, misma partida). Power-ups y eventos salen de semillas fijas por nivel, no de `Math.random` |
| Partidas guardadas | Nadie pierde nada: las estrellas van por el `id` del nivel (nunca cambia) y el punto más lejano al que se había llegado sigue abierto |
| Mantenimiento | Todo el contenido en código (mapas con `MB`), comprobado con el bot y con capturas |
| Idioma | Textos nuevos en `{ en, es }`. El inglés es el idioma principal del estudio |

## 4. Registro de decisiones

| # | Decisión | Alternativas | Por qué |
|---|---|---|---|
| 1 | Una mecánica estrella por escenario nuevo | Mecánicas sueltas en cualquier nivel | Cada sitio se recuerda por algo, enseña una sola cosa y da un vídeo de promo |
| 2 | Ruta mezclada con los niveles de siempre y los nuevos | Mundos en bloques de 10 | Lo pidió Germán: repetir sitio aburre |
| 3 | 120 niveles al final (97 en la entrega 1) | 67 o más de 200 | Volumen normal de un casual de primer nivel sin eternizar el desarrollo |
| 4 | Mapas dibujados a mano con `MB`, validados con el bot y capturas | Generador de mapas | Los escenarios nuevos tienen mecánicas muy distintas; a mano cada mapa enseña algo. 53 mapas nuevos es asumible |
| 5 | Power-ups en el suelo, sin potenciadores antes del nivel | Potenciadores previos al estilo *Candy Crush* | Los previos empujan a pagar para ganar |
| 6 | El equipo se contrata una vez, sube de nivel y ocupa huecos (1 desde el nivel 9, 2 desde el 40) | Equipo gratis por escenario | Sumidero de monedas con decisiones: qué llevar a cada nivel |
| 7 | El compañero bombero usa el mismo bot que mide la dificultad | IA propia | Ya juega bien, es determinista y se prueba con las mismas herramientas |
| 8 | Gran incendio en los niveles 10, 20… y el final en el 120; la portada va por el `id` del nivel | Por posición | Si la ruta cambia, la portada sigue siendo de ese nivel |
| 9 | El guardado guarda el nivel más lejano abierto (`reach`) y los niveles abiertos a mano (`open`) | Guardar por posición, como Marchando | Los `id` no cambian nunca y la ruta sí puede cambiar: así un nivel insertado detrás de donde vas queda jugable y no se pierde el punto al que llegaste |
| 10 | Reto diario sin mejoras ni equipo; power-ups y eventos iguales para todos (salen de la semilla del día) | Reto con mejoras | Ranking justo |
| 11 | Apoyo aéreo (anuncio con recompensa) solo tras perder 2 veces seguidas el mismo nivel, desde el nivel 8, una vez por nivel y sesión | Tras cada derrota | CrazyGames prohíbe ofrecer un anuncio de «seguir jugando» cada vez que se pierde |
| 12 | Dos entregas, cada una compila y pasa las pruebas | Todo de una vez | Si no da tiempo, la entrega 1 queda completa |

## 5. Diseño

### 5.1 Los escenarios nuevos

| Escenario (id) | Mecánica estrella | Aspecto |
|---|---|---|
| El puerto / *The docks* (`puerto`) | **Manchas de gasóleo ardiendo que el viento arrastra por el agua** hacia los barcos y el muelle de madera. El agua las aviva (llamarada): solo la **espuma** las apaga, y si les echas espuma dejan de moverse. **La bomba del muelle**: engánchate a ella (como a una boca de riego) y la espuma se rellena sola | Atardecer naranja, mar verde azulado, contenedores de colores, grúas, barcos de pesca y norais |
| El centro / *Downtown* (`ciudad`) | **Vecinos atrapados en las ventanas**: quédate en la marca amarilla bajo la ventana y la plataforma los baja en 1,5 s. Si el fuego llega a su ventana se escapan por la azotea: pierdes la tercera estrella y valen como un edificio | Día frío, torres de cristal con ventanas encendidas, pasos de cebra, taxis amarillos, árboles en alcorques |
| La estación / *The rail yard* (`estacion`) | **Trenes con horario**: un aviso de 3 s (luces y campana) y el tren cruza. Bloquea el paso, tapa el agua, te aparta de la vía si estás encima y **corta la manguera** si la vía queda entre tú y el camión o la boca de riego: sin agua hasta que te enganches a una o pasen 6 s | Mañana con bruma, grava y traviesas, andenes con marquesina, estación de ladrillo, vagones de mercancías |
| La estación de esquí / *Ski lodge* (`nieve`) (entrega 2) | **Hielo**: resbalas (cuesta frenar y girar). **Bocas de riego heladas**: hay que picar el hielo (quedarse más tiempo) para engancharse | Noche con nieve, cabañas de madera con luz cálida, pinos nevados, remontes |
| El museo / *The museum* (`museo`) (entrega 2) | **Obras de arte**: pasa junto a un cuadro o una escultura para cogerlo y llévalo a la salida. Cargado vas más lento y no puedes echar agua. Las que arden cuentan mucho en lo salvado | Interior en corte, suelo de mármol, alfombras, marcos dorados |
| El camping / *Campground* (`camping`) (entrega 2) | **Helicóptero**: botón para pedir una descarga de agua donde apuntas, con recarga. **Hierba alta seca**: el fuego corre muy rápido | Hora dorada del oeste de EE. UU., tiendas de campaña, caravanas, pinos y un lago |

Cada escenario se estrena con un **nivel de presentación**: tranquilo, sin eventos ni power-ups y centrado en su mecánica.

Cómo han quedado (entrega 1):

- **Materiales nuevos** (`src/sim/materials.ts`): `Slick` (gasóleo en el mar: prende con nada, dura ~45 s ardiendo, no vale nada pero quema lo que toca), `Rail` (vía: no arde, se pisa), `Hull` (barcos de pesca y vagones de mercancías: prenden antes que un coche y arden más) y `Office` (las torres del centro: el fuego corre por dentro de la manzana si no lo cortas).
- **Mapas**: en los tres se ha buscado lo mismo que en los escenarios originales: pocos focos al empezar, puestos en algo que arde bien (pasarelas de madera, redes, pacas, hierba seca junto a las vías, el fondo de una manzana), para que la rapidez y el orden decidan. Si nadie hace nada se pierde entre el 30 y el 60 % del mapa.
- **Puerto**: la bomba del muelle rellena la espuma a 0,8 s por segundo mientras estás enganchado. Una mancha que se apaga con espuma se queda quieta; sin espuma deriva una casilla cada `0,9 / viento` segundos.
- **Centro**: cada persona en una ventana vale como dos casillas y media de torre (15 puntos de valor) y se escapa si el fuego llega a su ventana durante 4,5 s. El agua pasa por debajo de las ventanas (ya no las «moja»).
- **Estación**: los trenes van por horario fijo (`trains` de cada nivel) y cortan la manguera si la vía queda entre tú y tu enganche.

### 5.2 La ruta

- 120 niveles al final (97 en la entrega 1). Los `id` no cambian nunca; `num` es la posición.
- **Sitio nuevo** en los niveles 1-6 (los originales, como hasta ahora), 7 (puerto), 12 (centro), 17 (estación), 24 (esquí), 33 (museo) y 44 (camping).
- **Nunca dos niveles seguidos en el mismo escenario.** Los niveles de cada escenario se reparten a lo largo de la ruta desde su estreno, en su orden de dificultad (`buildRoute()` en `src/sim/levels.ts`; lo comprueba `npx tsx tools/route.ts`).
- **Gran incendio en los niveles 10, 20… 110** y el final en el 120. En la entrega 1: 10 (puerto), 20 (centro), 30 (estación), 40 (puerto), 50 (centro), 60 (estación), 70 (`plaza-11`), 80 (`sanjuan-11`), 90 (`castanar-11`) y el final en el 97.
- **Dificultad en diente de sierra**: sube a lo largo de la ruta, baja en cada nivel de presentación y justo después de cada gran incendio.
- **Pantalla de niveles** por capítulos de 10 (1-10, 11-20…): cada capítulo acaba en su gran incendio. Cada nivel lleva el color y el icono de su escenario; los estrenos llevan «SITIO NUEVO» y el gran incendio ocupa la fila entera con su portada.

### 5.3 Power-ups

Desde el nivel 3 (nunca en los de presentación): el primero entre los segundos 12 y 18 y luego uno cada 22-30 s, siempre en un sitio al que llega la manguera, cerca de algo que arde y lejos del borde del mapa. Se cogen pasando por encima y desaparecen a los 14 s (parpadean al final). Horas, tipos y sitios salen de una semilla fija por nivel (en el reto diario, la del día), así que son los mismos en cada intento y para todos. Se estrenan de uno en uno y se explican la primera vez.

| Power-up | Desde | Efecto |
|---|---|---|
| Bomba turbo / *Turbo pump* | 3 | 12 s con el chorro un 70 % más fuerte y un 20 % más largo |
| Botas / *Sprint boots* | 4 | 10 s corriendo un 35 % más rápido |
| Cronómetro / *Stopwatch* | 6 | +20 s en el reloj |
| Extintor / *Extinguisher* | 8 | Apaga de golpe todo lo que arde a 3 m de ti y moja alrededor |
| Helicóptero / *Helicopter* | 11 | Una descarga de helicóptero: pulsa el botón 🚁 y cae donde apuntas (o en el fuego más cercano en esa dirección) |
| Traje ignífugo / *Fire suit* | 14 | 15 s sin que el calor te frene |

### 5.4 Eventos sorpresa

Uno en la mitad de los niveles desde el 8 (dos en cada gran incendio, ninguno en los de presentación). Avisan con un cartel 3 s antes. El primero de cada tipo se explica.

Cada evento tiene su segundo previsto (el primero entre el 22 y el 42 % del tiempo del nivel, el segundo entre el 55 y el 70 %), pero empieza antes si el fuego ya está controlado en un tercio (el primero) o en dos tercios (el segundo), nunca antes del segundo 10 y con 12 s entre uno y otro. Así quien juega rápido también se los encuentra.

| Evento | Desde | Qué pasa | Qué hacer |
|---|---|---|---|
| Vecinos con cubos / *Bucket brigade* | 8 | Tres vecinos echan cubos al fuego más cercano durante 18 s | Aprovecharlo |
| Chaparrón / *Rain shower* | 11 | 14 s de lluvia: todo se moja y el fuego crece menos | Aprovecharlo |
| Racha de viento / *Wind gust* | 14 | 10 s de viento fuerte en otra dirección | Cortar el frente nuevo |
| Baja la presión / *Pressure drop* | 16 | 12 s con el chorro a la mitad y más corto | Acercarse |
| Fuga de gas / *Gas leak* | 19 | Una tubería junto a un edificio pierde gas: su presión sube y explota en unos 15 s | Echarle agua hasta cerrarla (unos 2 s de chorro directo) |
| Curiosos / *Onlookers* | 22 | Dos curiosos se acercan al fuego | Rescatarlos (cuentan para la tercera estrella) y no mojarlos |
| Apagón / *Blackout* | primer nivel nocturno desde el 26 | 20 s sin luz: solo se ve cerca de ti y el fuego. Sin minimapa | Recordar dónde está todo |

### 5.5 Equipo

Se contrata una vez con monedas en la tienda y tiene 3 niveles. Se elige en la presentación de cada nivel: 1 hueco desde el nivel 9 y 2 desde el 40. No va al reto diario.

| Quién | Qué hace | Nivel 1 / 2 / 3 | Coste (contratar / subir / subir) |
|---|---|---|---|
| Lola, la compañera / *Lola, your partner* | Bombera con su propia manguera desde el camión: la mueve el bot, ataca el fuego que más amenaza y se engancha a las bocas de riego. No usa espuma | Fuerza del agua 45 / 60 / 75 % de la tuya | 2.500 / 4.000 / 7.000 |
| Chispa, el perro de rescate / *Sparky, the rescue dog* | Corre a por los animales y vecinos en peligro y los saca | Velocidad 4 / 5 / 6 m/s | 1.500 / 3.000 / 5.000 |
| El dron / *The drone* | Cada pocos segundos echa agua en el punto a punto de prender más cercano a ti | Cada 10 / 8 / 6 s | 2.000 / 3.500 / 6.000 |

### 5.6 Gran incendio y portadas

- Mapa grande, más fuego y dos eventos. Arriba un distintivo «GRAN INCENDIO».
- La primera victoria imprime la **portada** de *El Diario del Fuego* / *The Daily Blaze*: titular propio de ese incendio, la foto del momento de la victoria, las estrellas, el % salvado y la fecha. Se comparte como imagen (menú del móvil) o se descarga (ordenador).
- **Álbum de portadas** desde la pantalla de niveles y el título: las 12 (10 en la entrega 1), las que faltan en gris con su nivel.
- La portada (sin la foto) va en el guardado y en la nube de CrazyGames; la foto se guarda aparte en `localStorage` (`apagalo.page.<id>`), como las postales de Marchando: en otro dispositivo sale sin foto.

### 5.7 Reto diario

Los mismos mapas (los 6 originales) con modificador, sin mejoras ni equipo. Ahora con power-ups y, 2 de cada 3 días, un evento, todo sacado de la semilla del día. `src/sim/dailyTable.ts` se regenera con el bot (`npm run daily-table`).

### 5.8 Monetización

- **Apoyo aéreo** / *Air support* (anuncio con recompensa, lugar `air_support`): en la pantalla final tras perder 2 veces seguidas el mismo nivel (desde el nivel 8, nunca en el reto diario), una vez por nivel y sesión, y en CrazyGames como mucho una vez cada 10 minutos. Si lo ves, reintentas con un helicóptero listo. Si no hay anuncio cargado, el botón no aparece (en CrazyGames Basic Launch nunca).
- El intersticial no cambia: solo con «Siguiente», con sus topes (`src/monetize/index.ts`).
- **Sumideros de monedas**: el equipo (34.500 monedas para tenerlo todo al máximo) se suma a las mejoras (30.800).

### 5.9 Guardado y migración

- Nuevos campos: `route` (versión de la ruta aplicada), `reach` (`id` del nivel más lejano abierto), `open` (niveles abiertos por la migración), `crew` y `team` (equipo), `pages` (portadas) y `whatsNew` (aviso de novedades visto).
- Un nivel está abierto si es el primero, si tiene estrellas, si el anterior de la ruta tiene estrellas o si está en `open`.
- Al cambiar la ruta (y al cargar una partida de la 1.2.0 o la 1.3.0, que no tienen `reach`), se calcula el punto más lejano de la ruta vieja (el orden de la 1.3.0 está guardado en `LEGACY_ROUTE_13`): el nivel siguiente al último con estrellas. Se abren todos los niveles de la ruta nueva hasta la posición de ese nivel. Así los niveles ganados conservan sus estrellas, el punto al que llegaste sigue abierto y los niveles nuevos que han quedado detrás son jugables.
- Quien viene de una versión anterior con progreso ve una vez el aviso de novedades de la 2.0.

### 5.10 Analítica

Eventos nuevos: `powerup {k, level}`, `event {k, level}`, `crew_hire {id, lvl, n}`, `frontpage {level}`, `share {what: 'frontpage'}` y el lugar `air_support` en `ad_offer`, `ad_show` y `ad_reward`. `level_start`, `level_complete` y `level_fail` llevan también el escenario (`scn`), si es gran incendio (`big`) y el equipo (`crew`).

## 6. Entregas

1. **Sistemas comunes y 3 escenarios**: power-ups, eventos, equipo, gran incendio con portadas y álbum, ruta de 97 niveles con su migración, apoyo aéreo, inglés por defecto, y el puerto, el centro y la estación con 10 niveles cada uno. Versión 2.0.0.
2. **Los otros 3 escenarios**: esquí, museo y camping (8, 8 y 7 niveles), ruta final de 120 niveles con los 12 grandes incendios y el álbum completo.

## 7. Riesgos asumidos

| Riesgo | Cómo se controla |
|---|---|
| Mucho trabajo | Dos entregas jugables; la 1 va completa antes de empezar la 2 |
| Equilibrar 120 niveles con eventos y power-ups | Bot PRO y casual en cada nivel, tablas por escenario y por capítulo en `dificultad.md` |
| Rendimiento en móvil | Trenes, vecinos y equipo usan modelos baratos; se mide en el nivel más cargado |
| Reordenar la ruta | Migración por `id` con `reach` y `open`, probada con partidas reales de la 1.2.0 y la 1.3.0 (`tools/test_monetize.py`) |
| Versiones mezcladas durante el despliegue | El reto diario de la 2.0 no es el mismo que el de la 1.x (power-ups y eventos): el ranking de esos días mezcla los dos |

## 8. Cómo ha quedado

### Entrega 1 (30 sept 2026)

- **Ruta de 97 niveles** (`npx tsx tools/route.ts`): 67 de siempre y 30 nuevos (10 del puerto, 10 del centro y 10 de la estación). Estrenos en el 7, el 12 y el 17; grandes incendios en el 10 (`puerto-2`), 20 (`ciudad-3`), 30 (`estacion-4`), 40 (`puerto-6`), 50 (`ciudad-7`), 60 (`estacion-8`), 70 (`plaza-11`), 80 (`sanjuan-11`), 90 (`castanar-11`) y el final en el 97, que ahora trae la racha de viento y la fuga de gas (los eventos que lo ponen más difícil).
- **Dificultad** medida en `docs/dificultad.md` («2.0, entrega 1»): el PRO gana el 97-100 % por capítulo y el casual baja del 89-91 % de los primeros capítulos al 69-74 % de los últimos. En los escenarios nuevos el casual gana más de lo buscado (93 % en el puerto, 91 % en el centro y 88 % en la estación): sus niveles se deciden por la mecánica, que el bot casual usa tan bien como el PRO.
- **Herramientas nuevas**: `tools/route.ts` (la ruta), `tools/map.ts` (el mapa con los focos), `tools/curve.ts` (cuánto se quema sin nadie, con el casual y con el PRO), `tools/tune.ts` (umbrales a partir de lo que salva cada bot) y `tools/shots_v2.py` (capturas de todo lo nuevo).
- **Pruebas**: `tools/test_monetize.py` prueba ahora también una partida de la 1.3.0 (20 niveles ganados en el orden viejo), el aviso de novedades y el apoyo aéreo.
- **Pendiente para publicar**: fichas de las tiendas y de CrazyGames (siguen con «67 niveles en 6 escenarios»), capturas y vídeo nuevos. La foto de la portada solo guarda el fotograma con más fuego desde el segundo 8: si el gran incendio se gana antes, se toma al terminar.

