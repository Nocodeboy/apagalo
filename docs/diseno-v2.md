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
- **«More games»** en el título: los otros juegos del estudio (promoción cruzada), en la web y en Android.

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
| 13 | Esquí: **hielo** (resbalas), **nieve profunda** (vas más lento, no arde) y **bocas de riego heladas** (engancharse tarda 2,4 s en vez de 0,6, solo la primera vez) | Solo hielo | El hielo solo cambia cómo te mueves; con la nieve y las bocas heladas el mapa decide por dónde ir y a qué boca engancharse |
| 14 | Museo: **obras de arte** que se cogen al pasar y se llevan a una salida (cargado vas al 72 % y no echas agua), **aspersores** que se encienden una vez con una palanca por sala (16 s de agua en su zona) y **muros bajos** que paran el agua | Solo obras de arte | Llevar el cuadro obliga a dejar de apagar: decide qué es antes. La palanca premia saber dónde está cada sala |
| 15 | Camping: **helicóptero de guardia** (botón siempre disponible, vuelve a estar listo 18-28 s después de cada descarga), **hierba alta** (el fuego más rápido del juego) y, en el último, **tormenta seca** (rayos avisados que prenden donde caen si no está mojado) | Helicóptero solo como power-up | Es la versión grande del power-up que ya se conoce: fácil de entender y muy vistoso. La hierba alta le da trabajo |
| 16 | El suelo del camping es tierra con manchas de hierba alta | Todo hierba | Con todo de hierba el parque entero ardía en 20 s y ni el PRO lo salvaba |
| 17 | Grandes incendios de la ruta final: 10 `puerto-2`, 20 `ciudad-3`, 30 `estacion-4`, 40 `puerto-6`, 50 `ciudad-7`, 60 `nieve-5`, 70 `museo-5`, 80 `estacion-8`, 90 `camping-5`, 100 `castanar-11`, 110 `plaza-11` y 120 el final | Mantener los de la entrega 1 | Cada escenario nuevo tiene su gran incendio; `sanjuan-11` deja de serlo (la entrega 1 no se publicó, así que nadie tiene su portada) |
| 18 | **Rampa de propagación**: desde el nivel 40 el fuego corre algo más, hasta un 12 % más en el 120 (nunca en las presentaciones) | Rehacer los mapas de los niveles de siempre | La curva del casual se quedaba plana en la segunda mitad; así sube sin tocar los mapas |
| 19 | El bot apunta siguiendo la parábola del chorro | Dejarlo | Se quedaba regando vallas bajas que tapaban el objetivo: medía peor de lo que juega una persona |
| 20 | «More games» en la pantalla de título (web y Android), sin enlaces en CrazyGames ni en el artefacto; la lista vive en `src/games.ts` y un juego sin `url` no sale | Enlaces fijos en el HTML | CrazyGames no permite enlaces a fuera. Con la lista en código, añadir el juego del perro pastor es poner su URL |
| 21 | **Dificultad (30 sept 2026, decidida por Claude por delegación de Germán):** +5 puntos en el mínimo de los niveles 41-120 donde el PRO sigue ganando siempre, sin grandes incendios, presentaciones ni los niveles donde el PRO bajaba del 90 %; en 9 donde el casual se hundía, de +1 a +3. En total, 33 niveles. **Se revisa con los datos reales de derrotas** (`level_fail` por nivel) | Esperar a los datos sin tocar nada; subir la propagación | Es el cambio más fino y reversible: nivel a nivel, sin tocar la simulación ni el reto diario. El casual de la segunda mitad pasa del 74-87 % al 70-76 % y el PRO sigue al 90 % o más en todos los niveles (`dificultad.md`, «2.0: decisión de dificultad») |
| 22 | **Extintor portátil (2.2)**: el power-up se guarda como carga de polvo y lo sacas tú; al sacarlo sueltas la manguera | Mantener el golpe instantáneo, o que caiga cerca del fuego | Feedback de jugadores: «casi siempre cae donde no hay fuego». Guardado, decides tú dónde y cuándo, y soltar la manguera abre una decisión táctica (ir más lejos a cambio de tener que volver) |
| 23 | **Pulaski (2.2)** desde el nivel 23 (`castanar-3`) y en todos los retos diarios: mantén el botón (o la G) y la hierba o la hojarasca de delante pasa a tierra en 0,5 s por casilla. Mientras cavas vas al 40 % de velocidad y no echas agua; lo cavado cuenta como salvado | Rastrillo que solo frena el fuego; darlo desde el principio | Un cortafuegos que el fuego no cruza es fácil de entender. Llega cuando el jugador ya domina la manguera y en el primer bosque grande. El bot no cava, así que las tablas de dificultad no cambian: para quien lo use, los niveles 23-120 son algo más fáciles |

## 5. Diseño

### 5.1 Los escenarios nuevos

| Escenario (id) | Mecánica estrella | Aspecto |
|---|---|---|
| El puerto / *The docks* (`puerto`) | **Manchas de gasóleo ardiendo que el viento arrastra por el agua** hacia los barcos y el muelle de madera. El agua las aviva (llamarada): solo la **espuma** las apaga, y si les echas espuma dejan de moverse. **La bomba del muelle**: engánchate a ella (como a una boca de riego) y la espuma se rellena sola | Atardecer naranja, mar verde azulado, contenedores de colores, grúas, barcos de pesca y norais |
| El centro / *Downtown* (`ciudad`) | **Vecinos atrapados en las ventanas**: quédate en la marca amarilla bajo la ventana y la plataforma los baja en 1,5 s. Si el fuego llega a su ventana se escapan por la azotea: pierdes la tercera estrella y valen como un edificio | Día frío, torres de cristal con ventanas encendidas, pasos de cebra, taxis amarillos, árboles en alcorques |
| La estación / *The rail yard* (`estacion`) | **Trenes con horario**: un aviso de 3 s (luces y campana) y el tren cruza. Bloquea el paso, tapa el agua, te aparta de la vía si estás encima y **corta la manguera** si la vía queda entre tú y el camión o la boca de riego: sin agua hasta que te enganches a una o pasen 6 s | Mañana con bruma, grava y traviesas, andenes con marquesina, estación de ladrillo, vagones de mercancías |
| La estación de esquí / *Ski lodge* (`nieve`) | **Hielo**: resbalas (cuesta frenar y girar). **Nieve profunda**: vas más lento. **Bocas de riego heladas**: hay que picar el hielo (quedarse 2,4 s) para engancharse la primera vez | Hora azul con nieve, chalés de troncos con luz cálida, pinos nevados, pilonas del telesilla, motos de nieve, muñecos de nieve y pista de patinaje |
| El museo / *The museum* (`museo`) | **Obras de arte**: pasa junto a un cuadro o una escultura para cogerlo y llévalo a una salida (alfombrilla verde con cartel). Cargado vas más lento y no puedes echar agua. Cada obra vale 20 puntos de lo salvado y arde si el fuego la toca 3 s. **Aspersores**: cada sala tiene una palanca que los enciende una vez | De noche, interior en corte con muros bajos, mármol en damero, parqué color miel, alfombras con cenefa dorada, vitrinas, estanterías, un dinosaurio y cajas |
| El camping / *Campground* (`camping`) | **Helicóptero de guardia**: botón para pedir una descarga de agua donde apuntas; se recarga (18-28 s según el nivel, se ve la cuenta atrás en el botón). **Hierba alta seca**: el fuego corre muy rápido | Hora dorada, tiendas de campaña, caravanas, canoas en el lago, mesas de pícnic, leña, pinos y un mirador |

Cada escenario se estrena con un **nivel de presentación**: tranquilo, sin eventos ni power-ups y centrado en su mecánica.

Cómo han quedado (entrega 1):

- **Materiales nuevos** (`src/sim/materials.ts`): `Slick` (gasóleo en el mar: prende con nada, dura ~45 s ardiendo, no vale nada pero quema lo que toca), `Rail` (vía: no arde, se pisa), `Hull` (barcos de pesca y vagones de mercancías: prenden antes que un coche y arden más) y `Office` (las torres del centro: el fuego corre por dentro de la manzana si no lo cortas).
- **Mapas**: en los tres se ha buscado lo mismo que en los escenarios originales: pocos focos al empezar, puestos en algo que arde bien (pasarelas de madera, redes, pacas, hierba seca junto a las vías, el fondo de una manzana), para que la rapidez y el orden decidan. Si nadie hace nada se pierde entre el 30 y el 60 % del mapa.
- **Puerto**: la bomba del muelle rellena la espuma a 0,8 s por segundo mientras estás enganchado. Una mancha que se apaga con espuma se queda quieta; sin espuma deriva una casilla cada `0,9 / viento` segundos.
- **Centro**: cada persona en una ventana vale como dos casillas y media de torre (15 puntos de valor) y se escapa si el fuego llega a su ventana durante 4,5 s. El agua pasa por debajo de las ventanas (ya no las «moja»).
- **Estación**: los trenes van por horario fijo (`trains` de cada nivel) y cortan la manguera si la vía queda entre tú y tu enganche.

Cómo han quedado (entrega 2):

- **Materiales nuevos**: `Snow` (nieve profunda: no arde, se pisa al 68 % de velocidad), `Ice` (hielo: no arde, se acelera y se frena mucho peor), `Carpet` (alfombras del museo: el fuego corre por ellas), `TallGrass` (hierba alta del camping: prende con nada y corre más que nada) y `Timber` (chalés de troncos: arden mucho y dan mucho calor). En el museo el suelo de mármol no arde y el parqué sí.
- **Esquí** (8 niveles): el primer paso por el hielo y por la nieve profunda se explica con un aviso. Las bocas de riego heladas llevan un indicador de hielo y un anillo que se llena mientras picas; una vez descongelada, engancharse vuelve a ser normal. Los grandes chalés de troncos son lo que más vale.
- **Museo** (8 niveles): las obras se cogen solas al pasar junto a ellas (una cada vez) y se sueltan al llegar a una salida. Encima de cada obra en peligro sale un aviso. La palanca de cada sala enciende sus aspersores 16 s: mojan cada casilla y debilitan las llamas, así que frenan el fuego pero lo que ya arde hay que apagarlo. Los muros bajos (`|`, 1,6 m) paran el agua: hay que entrar por las puertas. El perro del equipo no coge obras.
- **Camping** (7 niveles): el helicóptero está de guardia desde el principio (el botón muestra la cuenta atrás mientras recarga). En «Tormenta seca» los «cohetes» del motor son rayos: se avisa del sitio y, si está mojado cuando cae, no prende.

### 5.2 La ruta

- 120 niveles al final (97 en la entrega 1). Los `id` no cambian nunca; `num` es la posición.
- **Sitio nuevo** en los niveles 1-6 (los originales, como hasta ahora), 7 (puerto), 12 (centro), 17 (estación), 24 (esquí), 33 (museo) y 44 (camping). Los tres últimos llegan más tarde que los otros para que la segunda mitad de la ruta también estrene cosas.
- **Nunca dos niveles seguidos en el mismo escenario.** Los niveles de cada escenario se reparten a lo largo de la ruta desde su estreno, en su orden de dificultad (`buildRoute()` en `src/sim/levels.ts`; lo comprueba `npx tsx tools/route.ts`).
- **Gran incendio en los niveles 10, 20… 110** y el final en el 120: 10 `puerto-2`, 20 `ciudad-3`, 30 `estacion-4`, 40 `puerto-6`, 50 `ciudad-7`, 60 `nieve-5`, 70 `museo-5`, 80 `estacion-8`, 90 `camping-5`, 100 `castanar-11`, 110 `plaza-11` y 120 `finale` (en la entrega 1 eran 10, con el final en el 97).
- **Dificultad en diente de sierra**: sube a lo largo de la ruta, baja en cada nivel de presentación y justo después de cada gran incendio. Desde el 40, además, el fuego corre un poco más (`spread`, hasta +12 % en el 120).
- **Pantalla de niveles** por capítulos de 10 (1-10, 11-20…): cada capítulo acaba en su gran incendio. Cada nivel lleva el color y el icono de su escenario; los estrenos llevan «SITIO NUEVO» y el gran incendio ocupa la fila entera con su portada.

### 5.3 Power-ups

Desde el nivel 3 (nunca en los de presentación): el primero entre los segundos 12 y 18 y luego uno cada 22-30 s, siempre en un sitio al que llega la manguera, cerca de algo que arde y lejos del borde del mapa. Se cogen pasando por encima y desaparecen a los 14 s (parpadean al final). Horas, tipos y sitios salen de una semilla fija por nivel (en el reto diario, la del día), así que son los mismos en cada intento y para todos. Se estrenan de uno en uno y se explican la primera vez.

| Power-up | Desde | Efecto |
|---|---|---|
| Bomba turbo / *Turbo pump* | 3 | 12 s con el chorro un 70 % más fuerte y un 20 % más largo |
| Botas / *Sprint boots* | 4 | 10 s corriendo un 35 % más rápido |
| Cronómetro / *Stopwatch* | 6 | +20 s en el reloj |
| Extintor / *Extinguisher* | 8 | Desde la 2.2 se guarda: 6 s de polvo (hasta 9 acumulados) que usas cuando quieras con su botón o la F. Al sacarlo sueltas la manguera donde estás y puedes ir más allá de su largo; el polvo alcanza 3,6 m, apaga también los fuegos de combustible y apenas moja. Vacío, hay que volver a por la manguera (en la 2.0 y la 2.1 apagaba de golpe lo que ardía a 3 m del sitio donde caía) |
| Helicóptero / *Helicopter* | 11 | Una descarga de helicóptero: pulsa el botón 🚁 y cae donde apuntas (o en el fuego más cercano en esa dirección) |
| Traje ignífugo / *Fire suit* | 14 | 15 s sin que el calor te frene |

### 5.4 Eventos sorpresa

Uno en la mitad de los niveles desde el 8 (dos en cada gran incendio, ninguno en los de presentación). Avisan con un cartel 3 s antes. El primero de cada tipo se explica.

Los niveles pensados alrededor de sus eventos los llevan fijos en su definición (`fixedEvents`), estén donde estén en la ruta: la ventisca (`nieve-8`: apagón y racha) y la gala (`museo-8`: curiosos y apagón). Los demás los reciben de la ruta; `wantEvents` solo dice cuáles prefiere un nivel si la ruta le da alguno.

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

Eventos nuevos: `powerup {k, level}`, `event {k, level}`, `crew_hire {id, lvl, n}`, `frontpage {level}`, `share {what: 'frontpage'}`, `crosspromo_open`, `crosspromo_click {id}` (lista de «More games») y el lugar `air_support` en `ad_offer`, `ad_show` y `ad_reward`. `level_start`, `level_complete` y `level_fail` llevan también el escenario (`scn`), si es gran incendio (`big`) y el equipo (`crew`).

### 5.11 «More games» (promoción cruzada)

- Botón «More games» / «Más juegos» al pie de la pantalla de título, en la web y en Android. En CrazyGames y en el artefacto de Claude no sale (CrazyGames no permite enlaces a fuera).
- Abre una ventana con una tarjeta por juego (emoji, nombre, frase y «Play»). Los datos están en `src/games.ts` (`STUDIO_GAMES`): ahora *Tray Runner: Restaurant Rush* (https://tray-runner.vercel.app) y el del perro pastor (*Round 'Em Up!* / *¡Pastoréalo!*), que no sale hasta que tenga `url`.
- El enlace lleva `utm_source=apagalo&utm_medium=more_games&utm_campaign=crosspromo&utm_content=<web|android>`, para ver en la analítica del otro juego cuántos llegan desde aquí.

## 6. Entregas

1. **Sistemas comunes y 3 escenarios**: power-ups, eventos, equipo, gran incendio con portadas y álbum, ruta de 97 niveles con su migración, apoyo aéreo, inglés por defecto, y el puerto, el centro y la estación con 10 niveles cada uno. Versión 2.0.0.
2. **Los otros 3 escenarios**: esquí, museo y camping (8, 8 y 7 niveles), ruta final de 120 niveles con los 12 grandes incendios y el álbum completo, «More games», equilibrado y textos de las tiendas.

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

### Entrega 2 (30 sept 2026)

- **Ruta final de 120 niveles en 12 escenarios** (`npx tsx tools/route.ts`): los 97 de la entrega 1 y 23 nuevos (8 de esquí, 8 del museo y 7 del camping). Estrenos en el 24, el 33 y el 44; grandes incendios en el 10, 20… 110 y el final en el 120 (ver §5.2). La versión de la ruta pasa a 3: las partidas de la 1.2.0, la 1.3.0 y la entrega 1 se migran por `id` (`npm run test:migration`, 133 comprobaciones).
- **Dificultad** en `docs/dificultad.md` («2.0, entrega 2»): el PRO gana el 90 % o más en todos los niveles; el casual baja del 91-96 % de los primeros capítulos al 74-81 % de los últimos, y el 72 % en los grandes incendios. La bajada es más suave de lo buscado (40-55 % al final): ver «Lo que no se ha conseguido».
- **Rendimiento**: los niveles nuevos dibujan entre 56 y 98 llamadas y, la mayoría, entre 22.000 y 74.000 triángulos (modelos instanciados por grupo, como el resto). La biblioteca llegaba a 142.000 por las estanterías: ahora los libros solo se modelan por delante.
- **Herramientas nuevas**: `tools/probe.ts` (vistazo rápido a un nivel), `tools/tune-route.ts` y `tools/apply-tune.py` (umbrales por puesto en la ruta), `tools/test_migration.ts` (guardado sin navegador) y `tools/shots_b.py` (capturas en cualquier segundo de la partida). Capturas en `shots/v2/`.
- **Textos de las tiendas** actualizados a 120 niveles y 12 escenarios, primero en inglés (`ficha-tienda-en.md`, `crazygames.md`, `google-play.md`).
- **Después de la revisión**: `nieve-8` y `museo-8` con sus eventos fijos; los textos flotantes («Rescued!», «Hose connected», «Blaze out!») se apilan en vez de taparse (el más nuevo en su sitio y los anteriores encima; `tools/test_floaters.py`); y en `dificultad.md`, qué endurecer primero si los datos lo piden (mínimos, luego propagación y el tiempo lo último), medido con `tools/headroom.ts`.
- **Decisión de dificultad** (30 sept, por delegación de Germán): mínimos más altos en 33 niveles de la segunda mitad (decisión 21). Se revisa con los datos reales de derrotas.
- **Sin hacer**: capturas y vídeo nuevos para las tiendas; el evento «equipo de televisión» y el vagón que se mueve en la estación (ideas del diseño que no han entrado); la URL del juego del perro pastor.

### 2.2 (1 oct 2026): herramientas tácticas

Pedido por Germán a partir del feedback de CrazyGames: el extintor no servía porque caía lejos del fuego, y faltaban herramientas que den un toque táctico sin romper el equilibrio.

- **Extintor portátil** (decisión 22): el power-up se guarda y se usa con su botón (barra de carga en el HUD) o la F. La manguera se queda en el suelo, tendida desde el camión hasta un aro que marca dónde está la boquilla. Al vaciarse avisa («¡Extintor vacío! Vuelve a por tu manguera») y, si intentas echar agua sin ella, «Sin manguera: recógela en el círculo». Pasar por encima del aro la recoge.
- **Pulaski** (decisión 23): botón que se mantiene pulsado (o la G). Marca en el suelo la casilla que vas a cavar y deja surcos de tierra oscura. Se estrena con la etiqueta «NUEVO» en la presentación de `castanar-3` y un aviso la primera vez.
- **Equilibrio**: el bot usa el extintor (el PRO cuando hay 4 o más casillas ardiendo a 3,2 m, el casual con 6). En los niveles 8-60, con 8 partidas por nivel, las tablas por capítulo salen iguales que en la 2.1 y por nivel solo cambian 1-3 s de tiempo sobrante o una estrella suelta. `dailyTable.ts` regenerado.
- **Pruebas**: `tools/test_ext.ts` (20 comprobaciones de la simulación) y capturas en el navegador de la presentación, el aviso y una línea cavada.
- **HUD**: con chorro, abanico, espuma, helicóptero, extintor y Pulaski puede haber 6 botones. En pantallas de menos de 560 px de alto (móvil apaisado, el marco de CrazyGames en un portátil) van en columnas de 3: las boquillas a la derecha y las herramientas al lado. Los nombres largos («Extinguisher», «Feuerlöscher», «Hubschrauber») van en letra más pequeña para caber en el botón.
- **Textos** en los 6 idiomas.
