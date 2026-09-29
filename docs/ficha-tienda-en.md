# Ficha de Google Play en inglés

26 sept 2026. Textos en inglés para la ficha de Google Play (en-US como idioma predeterminado y en-GB), la ficha de CrazyGames con el nombre nuevo y los textos de anuncios de Google Ads. Las explicaciones van en español; lo que se copia en la consola va en inglés, dentro de bloques.

- Todas las longitudes se han contado con un script (caracteres Unicode, espacios incluidos, sin el salto de línea final). Si cambias una palabra, vuelve a contar.
- Límites de Google Play: título 30 caracteres ([Play, metadatos][play-meta]), descripción breve 80 ([Play, recursos][play-assets]), descripción completa 4.000 ([AppTweak][apptweak-kw]).
- Lo que sale de las sugerencias de búsqueda de Play es una consulta propia del 26 sept 2026 (autocompletado de Google Play en EE. UU., Reino Unido, Canadá y Australia). No da volúmenes, solo qué frases escribe la gente.
- Estrategia, calendario y motivos: [marketing.md](marketing.md). Monetización y cambios de «Contenido de la app» cuando entre la 1.3: [monetizacion.md](monetizacion.md).

## Reglas que condicionan los textos

- **Título:** 30 caracteres como máximo, sin emojis, sin mayúsculas enteras (salvo que sean la marca), sin nada que indique ranking, precio o programas de Play. Nada de «best», «#1» ni «free» en el título ([Play, metadatos][play-meta]).
- **Descripción:** sin repeticiones excesivas ni listas de palabras clave; Play puede rechazar la ficha por ello ([Play, metadatos][play-meta]). Play no tiene campo oculto de palabras clave: indexa título, descripción breve y descripción completa. La guía de AppTweak recomienda repetir las palabras principales 3-5 veces de forma natural en la descripción completa ([AppTweak][apptweak-kw]; [AppTweak, investigación][apptweak-research]). Aquí se ha preferido quedarse en ese rango antes que buscar un porcentaje de densidad.
- **Capturas:** los textos sobre la imagen no deben ocupar más del 20 % de la captura. Nada de «Download now», rankings, premios, testimonios ni precios. Para que un juego sea elegible en algunos formatos de recomendación de Play hacen falta al menos 3 capturas verticales de 1080×1920 o más (o 3 horizontales de 1920×1080) ([Play, recursos][play-assets]).
- **Público:** si la ficha parece dirigida a niños (animación infantil, personajes muy jóvenes), Play puede pedir que quites esos elementos o que cumplas la política de Familias ([Play, público][play-kids]). El juego es 13+: nada de «for kids», «toddler» ni «Fireman Sam» (es una marca registrada y un público infantil), aunque salgan en las sugerencias de búsqueda.

## Título

| Opción | Caracteres | Cuándo |
|---|---:|---|
| `Put It Out! Firefighter` | 23 | **Principal.** Marca + la palabra con más búsquedas del nicho («firefighter games», «firefighter simulator» encabezan las sugerencias de «firefighter») |
| `Put It Out! Firefighter Game` | 28 | Si en 4-6 semanas no aparece para «firefighter game». Suena menos a marca |
| `Put It Out! Firefighter 3D` | 26 | «firefighter simulator 3d» aparece entre las sugerencias en EE. UU. y Reino Unido |
| `Put It Out! Fire Rescue` | 23 | Alternativa si se quiere probar «fire rescue games» (sugerencia principal de «fire rescue») |
| `Put It Out! Fire Truck Rescue` | 29 | Mete «fire truck», muy buscado pero lleno de juegos infantiles y de conducción: atrae expectativas equivocadas |

El título no se puede probar con los experimentos de ficha (solo icono, gráficos y descripciones, [Play, experimentos][play-exp]). Cambiarlo es posible, pero conviene no hacerlo más de una vez cada varias semanas para poder leer el efecto en Play Console.

En español se mantiene **«¡Apágalo! Bomberos»** (es-ES y es-419).

## Descripción breve

Tres opciones. La primera es la recomendada para en-US; las otras dos sirven para un experimento de ficha una vez en producción.

| # | Texto | Caracteres |
|---|---|---:|
| 1 | `The fire spreads with the wind. Grab the hose, pick a nozzle and save the town.` | 79 |
| 2 | `3D firefighter game: stop fires that spread in real time and rescue the animals.` | 80 |
| 3 | `67 fire rescue levels, 3 nozzles and one daily fire that everyone plays.` | 72 |

- La 1 vende la mecánica que nos diferencia (viento, boquillas) y es la que mejor convierte en teoría; mete «fire» y «hose», pero no «firefighter».
- La 2 lleva «firefighter game» y «3D» para posicionar, a cambio de sonar más a lista.
- La 3 lleva «fire rescue», el tamaño de la campaña y el reto diario.

## Descripción completa

### Versión A: sin monedas ni anuncios, con la campaña de 67 niveles

2.684 caracteres. «firefighter» 3 veces, «firefighting» 1, «fire truck» 2, «fire rescue» 2, «fireman» 1, «daily challenge» 2.

La publicada con la 1.2.x decía «6 FIRE RESCUE MISSIONS, 6 DIFFERENT RULES» y no tenía la línea de la campaña; se cambia por esta con la versión que lleve los 67 niveles.

```text
Put It Out! is a 3D firefighter game where the fire is alive. It spreads from one spot to the next and the wind pushes it in real time. Grab the hose, aim at the base of the flames and decide what to save first, before the whole town goes up.

Your hose is tied to the fire truck, so every step counts. Run, aim, switch nozzles and keep the fire away from the church, the barn and the fuel pumps.

67 FIRE RESCUE LEVELS IN 6 PLACES, EACH WITH ITS OWN RULE
• Village fair: learn to aim, spray and hold the fire line.
• Rosa's farm: rescue the sheep, goats, dogs and cats before the flames reach them.
• Gas station: water only spreads a fuel fire. Switch to foam and keep the gas bottles cool.
• Industrial park: live power plus water means a shock. Pull the lever first, then spray.
• Chestnut forest: the wind shifts. Hook your hose up to a hydrant to reach farther.
• Midsummer night: fireworks rain down on the beach. Wet the marked spots before they land.
Every place comes back ten more times, each one harder than the last. The campaign ends with The Big One: the whole town on fire at night, with every rule at once.

Every mission has its own light and colors: a summer noon, a golden afternoon on the farm, a cloudy industrial park, an autumn forest and a night on the beach.

3 NOZZLES, 3 JOBS
• Jet: long reach, so you can hit the fire from a safe distance.
• Fog: a wide spray that shields you from the heat.
• Foam: the only way to put out fuel fires.

A NEW FIRE EVERY DAY
The daily challenge gives every player the same map, the same wind and the same hot spots. See how you did against everyone who played today and share your result without spoilers. Come back tomorrow for the next daily challenge and keep your streak going.

UP TO 3 STARS PER LEVEL
Save more of the town, get every animal out and finish faster to earn all three stars.

FIREFIGHTER TIPS
• Attack the front the wind is pushing first.
• Cool the gas bottles before they get too hot.
• Watch the minimap: it shows every hot spot.
• Hose at full length? Find a hydrant.

EASY TO PICK UP, HARD TO MASTER
• One thumb moves, the other aims and sprays, with aim assist.
• Each fire takes a few minutes: good for a quick break.
• Plays offline. No account needed.
• In English and Spanish.
• Automatic graphics settings keep it smooth on older phones.

This is a firefighting action game, not a truck driving simulator. No traffic, no sirens to switch on: just you, the hose and a fire that keeps moving. If you like firefighter games, fire truck games or fireman games and want to be the one holding the hose, this one is for you.

Made by a solo indie developer, with new fire rescue missions on the way.
```

Notas:

- No dice «No ads». La ficha española actual sí lo dice («Sin anuncios y sin compras»); hay que quitarlo antes de publicar la 1.3 ([monetizacion.md](monetizacion.md)).
- El párrafo «not a truck driving simulator» está a propósito: casi todos los juegos de bomberos con millones de descargas son de conducción, gestión o infantiles (ver [marketing.md](marketing.md), competencia). Ajustar la expectativa evita reseñas de «esto no es un simulador».
- «Plays offline» lo dice ya la ficha española aprobada. El ranking del reto diario necesita conexión; el resto no.

### Versión B: con la 1.3 (monedas, mejoras y anuncios con premio)

Es la versión A con este bloque justo antes de «FIREFIGHTER TIPS». Total: 2.985 caracteres.

```text
UPGRADE YOUR GEAR
Earn coins in every mission and spend them on a longer hose, more water pressure, light boots and extra time. Upgrades are switched off in the daily challenge, so the ranking stays fair.
Optional ads can give you 30 extra seconds or double your coins. You decide when to watch one.
```

Los nombres de las mejoras son los del juego en inglés (`up_hose`, `up_power`, `up_speed`, `up_time` en `src/i18n.ts`). Si cambian en el juego, cámbialos aquí. Play ya muestra «Contains ads · In-app purchases» bajo el título cuando se declaran, así que no hace falta repetirlo.

## Palabras clave

Sacadas de las sugerencias de búsqueda de Play (26 sept 2026). Entre paréntesis, dónde aparecen.

| Prioridad | Palabra o frase | Qué sugiere Play | Dónde va |
|---|---|---|---|
| Principal | firefighter game(s) | Primera sugerencia de «firefighter» en EE. UU., Canadá y Australia; variantes «simulator», «offline», «real» | Título, descripción breve 2, descripción (3 + «firefighting» 1) |
| Principal | fire rescue (games) | Primera sugerencia de «fire rescue» en EE. UU., Canadá y Australia | Descripción breve 3, descripción (2) |
| Principal | fire truck (games) | Primera sugerencia de «fire truck»; muchas variantes infantiles («for kids», «3 years») | Descripción (2). No en el título: arrastra búsquedas infantiles y de conducción |
| Secundaria | fireman game(s) | Sugerida en EE. UU. y Reino Unido | Descripción (1) |
| Secundaria | fire fighting games (offline) | «fire fighting games offline» sugerida en EE. UU. | «firefighting», «Plays offline» en la descripción |
| Secundaria (Reino Unido) | fire engine game, fire brigade game | Primeras sugerencias de «fire engine» y «fire brigade» en Reino Unido | Ficha en-GB (abajo) |
| Secundaria | forest fire games | Sugerida junto a apps de seguimiento de incendios | Implícita («Chestnut forest»). No forzar |
| De marca y mecánica | hose, nozzle, foam, wind, hydrant, daily challenge, 3D | Poca búsqueda, pero describen el juego y ayudan a la relevancia semántica ([AppTweak][apptweak-research]) | Descripción |
| Evitar | kids, toddler, baby, Fireman Sam, simulator (en el título), 911, realistic | Infantil, marca de otro o expectativa de simulador realista | Ninguna parte |

«wildfire» se asocia en Play sobre todo a apps de seguimiento de incendios («wildfire tracker»), no a juegos: no merece la pena.

## Capturas (6, verticales de 1080×1920)

Salen del juego real con `tools/store_shots.py`, igual que las españolas, pero con el juego en inglés. Hoy ese script fuerza `locale='es-ES'` y el guardado de `tools/assets.py` pone `lang:'es'`: para las capturas en inglés hay que cambiar las dos cosas (o añadir un parámetro de idioma) y volver a generar. No lo he tocado: solo documento el cambio.

El texto va arriba, en la tipografía del juego (Bungee), en una sola línea o dos, y ocupando menos del 20 % de la imagen. Sin botones de descarga ni precios.

| Orden | Texto (≤ 5 palabras) | Palabras | Qué debe mostrar | Captura de partida |
|---|---|---:|---|---|
| 1 | `Fire spreads with the wind` | 5 | La plaza con un frente de fuego ancho avanzando, la flecha de viento del HUD visible y el bombero con el chorro tirante desde el camión | `2-plaza.png` |
| 2 | `Fuel fire? Switch to foam` | 5 | Gasolinera: espuma sobre el combustible, el botón «Foam» seleccionado y las bombonas con su indicador de presión | `5-gasolinera.png` |
| 3 | `Rescue every animal` | 3 | Granja: el fuego cerca del corral, ovejas y cabras a salvo y el contador de animales del HUD | `1-granja.png` |
| 4 | `Wet it before fireworks land` | 5 | San Juan de noche: las marcas de los cohetes en la arena y el chorro mojando una | `3-sanjuan.png` |
| 5 | `Wind shifts. Find a hydrant` | 5 | El Castañar: aviso «Wind is shifting!», la manguera enganchada a una boca de riego y el bosque de otoño | `4-castanar.png` |
| 6 | `A new fire every day` | 5 | **Captura nueva:** pantalla final del reto diario con la frase real «Better than X% of today's N players» y las estrellas. Usa un resultado de verdad (no inventar el porcentaje) | Sustituye a `6-niveles.png` |

- El orden importa: en la ficha se ven primero las 2-3 primeras. La 1 y la 2 explican la mecánica que nadie más tiene; la 3 enseña el rescate.
- Todo el HUD en inglés («CONTROL», «Jet / Fog / Foam»). En la captura española de la gasolinera se lee «EXTINCIÓN», «Chorro», «Abanico», «Espuma».
- Primer experimento de ficha recomendado cuando la app esté publicada: estas capturas con texto frente a las mismas sin texto (ver [marketing.md](marketing.md), ASO).

## Gráfico destacado (1024×500)

- **Qué:** la misma escena de la plaza que el actual (bombero de espaldas con el chorro, frente de fuego al fondo, banderines de la verbena), con el logo en inglés «PUT IT OUT!» tal como sale en el título del juego (clave `logo` en inglés) y la línea «Grab the hose. Save the town.» (el lema del juego en inglés, clave `tagline`).
- **Composición:** logo arriba a la izquierda o centrado arriba; que no toque los bordes. El centro, sin texto: si se añade vídeo de vista previa, conviene que nada importante quede tapado por el botón de reproducir (precaución, no una norma verificada).
- **Evitar:** «Free», «Download», estrellas de valoración o cualquier cifra de descargas ([Play, recursos][play-assets]).
- **Formato:** JPEG o PNG de 24 bits sin transparencia, 1024×500 ([Play, recursos][play-assets]). Se genera con `tools/store_shots.py feature` una vez que la escena salga en inglés.

## Vídeo de vista previa

- Un vídeo de YouTube, público u oculto, **con los anuncios desactivados**, sin restricción de edad. Solo se reproducen solos los primeros 30 segundos ([Play, recursos][play-assets]).
- Contenido: los 30 primeros segundos del concepto 6 o un montaje de los conceptos 1, 2 y 5 de [marketing.md](marketing.md). Juego real con la interfaz en inglés.

## Ficha en-GB (Reino Unido)

Play enseña la traducción que coincide con el idioma del móvil, no con el país: la ficha en-GB la ve quien tiene el móvil en inglés británico, que es lo normal en Reino Unido. Para apuntar a un país concreto están las fichas personalizadas por país ([Play, fichas personalizadas][play-csl]). Las sugerencias de búsqueda del Reino Unido cambian: «fire engine game», «fire brigade game» y «fireman game» aparecen donde en EE. UU. sale «fire truck games».

- **Título:** el mismo, `Put It Out! Firefighter` (23).
- **Descripción breve en-GB (80):**

```text
Fire spreads with the wind. Grab the hose, choose your nozzle, save the village.
```

- **Descripción completa en-GB:** la versión A con estos 8 cambios (resultado: 2.695 caracteres; con el bloque de la 1.3, 2.996):

| Donde dice (en-US) | En en-GB |
|---|---|
| `tied to the fire truck` | `tied to the fire engine` |
| `• Village fair:` | `• Village fête:` |
| `• Gas station:` | `• Petrol station:` |
| `• Industrial park:` | `• Industrial estate:` |
| `a cloudy industrial park` | `a cloudy industrial estate` |
| `light and colors` | `light and colours` |
| `FIREFIGHTER TIPS` | `FIRE BRIGADE TIPS` |
| `fire truck games or fireman games` | `fire engine games or fireman games` |

- «gas bottles» se usa también en británico para las bombonas de butano: se queda.
- Dentro del juego los escenarios se llaman «Gas station» e «Industrial park» (hay un solo inglés en `src/i18n.ts`). La diferencia con la ficha es menor. Si algún día se añade en-GB al juego, estos son los términos.
- Capturas: las mismas que en-US.

## CrazyGames (en inglés, con el nombre nuevo)

CrazyGames pide que el nombre de la ficha coincida con el título que se ve dentro del juego ([crazygames.md](crazygames.md)). En inglés, el logo del juego ya dice «PUT IT OUT!» (clave `logo`) y el nombre corto «Put It Out!» (clave `gameName`).

**Name:**

```text
Put It Out! Firefighter
```

**Short description** (72 caracteres; la de [crazygames.md](crazygames.md) con «the wind» añadido, que es lo que nos diferencia):

```text
Grab the hose and stop the fire before the wind spreads it through town!
```

**Description** (1.011 caracteres):

```text
Put It Out! Firefighter is a 3D firefighting game where the fire is alive. Your hose is tied to the fire truck, the wind keeps shifting and the flames spread cell by cell in real time. Aim at the base of the fire, rescue the animals, cool down the gas bottles and don't let anything important burn.

- 67 handcrafted levels across 6 places: a village fair, a farm full of animals, a gas station, an industrial park, a chestnut forest and a Midsummer night on the beach. The finale sets the whole town on fire at once.
- Every mission adds a new rule: foam for fuel fires, live electrical boxes, wind shifts and hydrants to reconnect your hose, fireworks falling from the sky.
- 3 nozzles: jet for reach, fog to shield yourself from the heat, foam for fuel fires.
- A new daily challenge every day, the same fire for every player. See how you rank against everyone who played today.
- Earn up to 3 stars per level by saving more of the town and every animal.

Plays in English and Spanish, on desktop and mobile.
```

**Controls:** los de [crazygames.md](crazygames.md), sin cambios.

- El día que la versión subida a CrazyGames lleve monedas y mejoras, añadir antes de la última línea: `- Earn coins and upgrade your hose, water pressure, boots and time. Upgrades never count in the daily challenge.`
- Las portadas actuales llevan el logo en español. Si el nombre de la ficha pasa a «Put It Out! Firefighter», hay que regenerarlas con el logo en inglés (`tools/assets.py`) para que coincidan.

## Textos para Google Ads (campaña de aplicaciones)

Para la tanda de medición de [marketing.md](marketing.md). Google admite hasta 5 títulos de 30 caracteres y 5 descripciones de 90 ([Google Ads, recursos][gads-assets]), recomienda usar todas las líneas de texto y no poner más de una exclamación por texto ([Google Ads, consejos][gads-tips]).

| Título | Caracteres |
|---|---:|
| `The fire spreads. Stop it.` | 26 |
| `Grab the hose. Save the town.` | 29 |
| `Jet, fog or foam?` | 17 |
| `A new fire every day` | 20 |
| `Rescue the animals in time` | 26 |

| Descripción | Caracteres |
|---|---:|
| `The wind pushes the flames in real time. Aim at the base and decide what to save first.` | 87 |
| `Gas station fire? Water makes it worse. Switch to foam before it reaches the pumps.` | 83 |
| `67 levels in 6 places: farm, forest, fireworks night, gas station and more.` | 75 |
| `Same fire for every player, every day. See where you rank and share your result.` | 80 |
| `Free firefighter game with quick levels. One thumb moves, the other aims and sprays.` | 84 |

«Free» se puede usar en un anuncio porque el juego es gratis; en el título de la ficha, no.

## Lista de comprobación antes de publicar la ficha en inglés

1. Play Console → Presencia en Play Store → Ficha principal: idioma predeterminado **English (United States) – en-US**. Mantener es-ES como traducción y añadir es-419 y en-GB.
2. Título, descripción breve y completa de este documento. La versión A mientras la versión publicada no tenga monedas; la B el día que se publique la 1.3.
3. Capturas y gráfico destacado en inglés para en-US y en-GB; los españoles para es-ES y es-419.
4. Los cambios de ficha pasan revisión pero no afectan a la prueba cerrada ni a sus 14 días ([estrategia.md](estrategia.md)).
5. CrazyGames: nombre, descripciones y portadas nuevas antes de pulsar «Submit for approval».

[play-meta]: https://support.google.com/googleplay/android-developer/answer/9898842
[play-assets]: https://support.google.com/googleplay/android-developer/answer/9866151
[play-exp]: https://support.google.com/googleplay/android-developer/answer/6227309
[play-kids]: https://support.google.com/googleplay/android-developer/answer/9867159
[play-csl]: https://support.google.com/googleplay/android-developer/answer/9867158
[apptweak-kw]: https://www.apptweak.com/en/aso-blog/how-to-add-keywords-to-apps-on-google-play
[apptweak-research]: https://www.apptweak.com/en/aso-blog/play-store-keyword-research
[gads-assets]: https://support.google.com/google-ads/answer/9948381
[gads-tips]: https://support.google.com/google-ads/answer/9176652
