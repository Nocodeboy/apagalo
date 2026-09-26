# Monetización: plan de negocio

26 sept 2026. Cómo va a ganar dinero «Put It Out! Firefighter» / «¡Apágalo! Bomberos», cuánto cabe esperar y qué hay que montar, en qué orden. Completa [estrategia.md](estrategia.md) (fase 3 y fase 6).

- El contrato del código está en `src/monetize/types.ts` (ubicaciones, catálogo y precios base). Este documento usa los mismos identificadores.
- Las tablas del modelo salen de `tools/revenue_model.py`: cambia los supuestos al principio del script y ejecuta `python3 tools/revenue_model.py`. Las tablas de este documento son su salida tal cual.
- Cada cifra con fuente lleva enlace (lista completa al final, en «Fuentes»). **(estimación)** marca un número propio sin fuente. **Recomendación** marca un cambio que no está en el diseño que se está implementando.
- Importes en USD salvo que ponga €. Cambio usado: 1 € = 1,1403 USD ([BCE, 25 sept 2026][ecb]).

## Resumen

1. **Con el diseño actual, pagar publicidad no se recupera.** En Android, una instalación de EE. UU. deja 0,11 $ en 90 días en el escenario base (0,03 $ pesimista, 0,35 $ optimista). Una instalación en Norteamérica cuesta de media 1,68 $ ([Adjust vía FoxData][foxdata]). Con 100-300 €/mes, la cohorte de pago recupera entre el 1 % y el 26 % a 90 días y el mes cierra entre −53 € y −168 €. Haría falta multiplicar el valor por jugador entre 3 y 15 veces.
2. **El presupuesto no llega para que Google Ads aprenda.** Google pide un presupuesto diario de al menos 50 veces el CPI objetivo ([Google Ads][gads-bp]): unos 84 $/día para un CPI de 1,68 $, unos 2.200 € al mes. Los 100-300 € sirven para medir la retención por país en tandas de unas 300 instalaciones (unos 450 €), no para escalar.
3. **Los ingresos vendrán sobre todo de anuncios bonificados.** En el modelo, los anuncios son el 58-65 % de los ingresos de Android. En el escenario base, el ARPDAU es de 0,029 $ en EE. UU. y de 0,016 $ con la mezcla de países del escenario (orgánico más pago). Con 75 jugadores diarios, Android deja unos 32 € al mes. La economía tiene techo: con 30.800 monedas se compra todo (unos 22 $ en `coins_l`) y después no queda nada que comprar.
4. **Antes de activar anuncios hay que cambiar varias cosas en Play.** La ficha dice «Sin anuncios y sin compras». Además, en Play Console consta que la app no tiene anuncios y que no comparte datos. AdMob solo sirve anuncios con normalidad cuando la app está publicada en la tienda ([AdMob][admob-readiness]), así que todo entra en vigor con el paso a producción (previsto para mediados o finales de octubre). Las compras necesitan Play Billing Library 8 o superior desde el 31 ago 2026, con prórroga hasta el 1 nov 2026 ([Android Developers][pbl-deprecation]).
5. **CrazyGames es el canal barato hacia jugadores de primer nivel, pero exige ajustes.** No hay anuncios hasta el Full Launch. Para pasar del Basic Launch hacen falta al menos 7 días y 500 partidas, y ellos miran 10+ minutos de juego, un D1 del 10-15 % y más del 80 % de conversión ([CrazyGames][cg-basic]). Sus normas prohíben ofrecer «seguir jugando» con un anuncio cada vez que pierdes y mezclar ese anuncio con el anuncio entre niveles en la misma transición ([CrazyGames][cg-ads]). Hay que adaptar el +30 s a esas normas.

Consecuencia: primero tráfico orgánico (CrazyGames, ficha de Play en inglés, contenido en redes), monetización activa desde el primer día de producción y el dinero de publicidad guardado para medir. Solo se escala cuando el LTV a 90 días supere el CPI (reglas en «KPIs y reglas para parar o escalar»).

## Modelo y por qué

**Híbrido: anuncios bonificados como base, intersticiales con tope y compras para quien quiera pagar.**

- **Por qué no solo anuncios.** Los países objetivo pagan con compras. En 2025, en los 19 países que mide Sensor Tower, la publicidad fue el 23 % de los ingresos netos de los juegos móviles. En EE. UU., el reparto fue 73 % compras en la tienda, 14 % tienda web propia y 13 % anuncios ([Deconstructor of Fun sobre Sensor Tower][dof-st]). En mercados maduros (EE. UU., Canadá, Corea del Sur y Japón), las compras son el 77-90 % ([GameDev Reports sobre Sensor Tower][gdr-st-ads]). Los híbridos que priman las compras ingresan unas 4 veces más que los que priman los anuncios ([Deconstructor of Fun][dof-st]).
- **Por qué no solo compras.** Hay 6 niveles y un reto diario: poca profundidad para que pague mucha gente. Los anuncios monetizan al 98-99 % que no paga (estimación). En el modelo, los anuncios siguen siendo el 58-65 % de los ingresos. Para inclinar la balanza hacia las compras hacen falta más cosas en las que gastar (ver «Economía»).
- **Por qué los bonificados son la base.** Son el formato con el eCPM más alto en todas las regiones ([TopOn H1 2025][topon]; [Appodeal vía Mistplay][mistplay-ecpm]). El jugador los elige, y por eso la norma de Play sobre intersticiales no se les aplica ([Play, política de anuncios][play-ads]). En juegos casuales, aun así, los intersticiales aportan el 44 % de los ingresos por anuncios, frente al 39 % de los bonificados ([TopOn H1 2025][topon]). Por eso se mantienen, pero con tope.
- **Qué no se usa.** Banners durante la partida: pagan poco (0,17-1,05 $ de eCPM en Android según región, [TopOn][topon]), ensucian la pantalla y CrazyGames los prohíbe en juego ([CrazyGames][cg-ads]). Tampoco anuncios de apertura (App Open), muros de ofertas, cajas de botín (obligan a la etiqueta «incluye elementos aleatorios», [ESRB][esrb-random]) ni suscripciones (no hay contenido que las justifique).

## Ubicaciones de anuncios

### Reglas por ubicación

| Ubicación (id en el código) | Formato | Cuándo se ofrece | Tope | Salvaguardas |
|---|---|---|---|---|
| `continue_time` | Bonificado | Al acabarse el tiempo | Una vez por intento | Botón «No, gracias» del mismo tamaño y estilo; icono de vídeo; nunca se abre solo; si no hay anuncio cargado, no aparece el botón |
| `double_coins` | Bonificado | Pantalla final del nivel | Una vez por pantalla final | Muestra las monedas antes y después; si el anuncio falla, no se da el premio y se avisa |
| `free_coins` | Bonificado | Tienda: +150 monedas | 3 al día (y como mucho 3 en 24 h, aunque se cambie la fecha) | Contador visible («2 de 3 hoy») y hora de reinicio |
| `between_levels` | Intersticial | Al pulsar «Siguiente» en la pantalla final (antes de la presentación del nivel) | Solo con ≥ 3 finales de nivel en total, ≥ 2 desde el último y ≥ 120 s desde el último anuncio a pantalla completa (también los bonificados); nunca en la primera sesión; nunca con `remove_ads` | Pausa y silencia el juego mientras dura; nunca durante la partida ni justo antes de jugar |

En el modelo (escenario base) salen 1,8 bonificados y 2,0 intersticiales por jugador activo y día a partir del día 1 (tabla «Anuncios por jugador activo y día»).

### Salvaguardas comunes (lo que exige Play y lo que exige CrazyGames)

- Play prohíbe los intersticiales que salen de forma inesperada, los que salen «al principio de un nivel» o de un bloque de contenido, los intersticiales de vídeo antes de la pantalla de carga y los que no se pueden cerrar pasados 15 s. Tampoco permite obligar a tocar un anuncio para seguir usando la app. Los bonificados que elige el jugador quedan fuera de esa norma ([Play][play-ads]).
- CrazyGames exige pausar y silenciar el juego durante el anuncio, gestionar el caso sin anuncio (`adError`) sin congelar el juego, no encadenar anuncios para un premio y que el botón de ver anuncio no sea engañoso: la opción de seguir sin verlo debe tener el mismo tamaño, fuente y color. También exige dar una alternativa al anuncio, por ejemplo pagar con monedas ([CrazyGames][cg-ads]).
- **Recomendación A1** (aplicada, más estricta: solo con «Siguiente», nunca con «Reintentar», «Menú» ni el botón atrás). El intersticial solo al pasar de la pantalla final al siguiente nivel o al selector. Nunca al pulsar «Reintentar» tras perder, porque eso es «el principio de un nivel» y además frustra. En CrazyGames, tampoco en botones de navegación como el menú o los ajustes ([CrazyGames][cg-ads]).
- **Recomendación A2** (aplicada: además, los 120 s cuentan desde cualquier anuncio a pantalla completa, también los bonificados). Si en esa pantalla final el jugador acaba de ver `double_coins`, o si ha usado `continue_time` en ese intento, no se muestra el intersticial en esa transición y el contador de 120 s vuelve a cero. CrazyGames prohíbe juntar entre dos niveles el anuncio intermedio y el de «seguir jugando» ([CrazyGames][cg-ads]). Las normas de AdSense para juegos HTML5 prohíben los anuncios que salen al cerrar otro anuncio a pantalla completa ([AdSense H5][adsense-h5]).
- **Recomendación A3.** `continue_time` también se puede pagar con monedas (250, estimación). Sirve de sumidero de monedas y cumple la norma de CrazyGames de dar una alternativa al anuncio.
- **Recomendación A4.** En CrazyGames, `continue_time` como mucho una vez por sesión (o una cada 10 minutos). Sus normas prohíben ofrecerlo cada vez que se pierde ([CrazyGames][cg-ads]), y su guía pone de ejemplo un «revivir» limitado a una vez por sesión ([CrazyGames, guía de monetización][cg-guide]).
- **Recomendación A5.** El texto de `remove_ads` debe decir que quita los anuncios entre niveles y que los anuncios opcionales con premio siguen disponibles.

### Diferencias por plataforma

| | Android | CrazyGames | Web propia |
|---|---|---|---|
| Anuncios | AdMob, con consentimiento UMP en el EEE, Reino Unido y Suiza | Solo su SDK y solo desde el Full Launch; en el Basic Launch los anuncios están desactivados y no se reparte nada ([CrazyGames][cg-ads]) | Ninguno por ahora (ver «Monetización web») |
| Intersticial | Topes propios (tabla de arriba) | El SDK limita el anuncio intermedio a uno cada 3 minutos e ignora las peticiones antes de tiempo ([CrazyGames][cg-ads]) | — |
| Bonificados | Los tres | Los tres, con A3 y A4 | — |
| Compras | Google Play Billing | Solo por invitación, con Xsolla ([CrazyGames][cg-intro]) | No |
| Sin anuncio disponible | Se oculta el botón (`rewardedReady()`) | Ídem; no puede haber botones de anuncio que no hagan nada ([CrazyGames][cg-ads]) | — |

## Compras y precios

### Catálogo

Coincide con `PRODUCTS` y `SUGGESTED_PRICE_USD` de `src/monetize/types.ts`.

| Id | Tipo | Monedas | Precio base | Monedas por dólar | Cuándo se ofrece | Para qué |
|---|---|---:|---:|---:|---|---|
| `remove_ads` | No consumible | 500 | 2,99 $ | 167 | Tienda y Ajustes | Quita los intersticiales. Para quien juega a menudo |
| `starter_pack` | No consumible, una sola vez | 3.000 | 1,99 $ | 1.508 | Una vez, tras completar el 2.º nivel | Primera compra barata: la mejor relación monedas/precio |
| `coins_s` | Consumible | 1.000 | 0,99 $ | 1.010 | Tienda | Compra por impulso |
| `coins_m` | Consumible | 6.000 | 4,99 $ | 1.202 | Tienda | Ancla del medio («la más elegida») |
| `coins_l` | Consumible | 14.000 | 9,99 $ | 1.401 | Tienda | «Mejor valor» |

- Los no consumibles necesitan el botón «Restaurar compras» (`restore()` del contrato).
- **Recomendación C1.** Después de la primera oferta, dejar `starter_pack` visible en la tienda 48 h con cuenta atrás. Una sola ventana emergente convierte poco (estimación; se mide en el experimento X5).
- **Recomendación C2.** Ofrecer también `remove_ads` en la pantalla que sale después del tercer intersticial visto, una sola vez.
- Play Console permite experimentos de precio con productos de pago único: hasta dos variantes más el control, un máximo de seis meses y un solo experimento a la vez por país ([Play][play-price-exp]).

### Precios por país

Play convierte el precio base a cada moneda con el tipo de cambio del día, suma impuestos donde corresponde y aplica redondeos locales ([Play, precios][play-prices]). En EE. UU. y Canadá el precio se muestra sin impuestos. En el resto de países de la tabla, Play pone el precio con el IVA o impuesto equivalente incluido y es Google quien lo declara e ingresa ([Play, impuestos][play-tax]). Esta tabla es la paridad calculada por el script (tipos del BCE e IVA general), para revisar lo que proponga Play:

| País | coins_s (0,99 $) | starter_pack (1,99 $) | remove_ads (2,99 $) | coins_m (4,99 $) | coins_l (9,99 $) | Neto por coins_s |
|---|---:|---:|---:|---:|---:|---:|
| EE. UU. | 0,99 $ | 1,99 $ | 2,99 $ | 4,99 $ | 9,99 $ | 0,84 $ |
| Reino Unido | 0,99 £ | 1,99 £ | 2,49 £ | 4,49 £ | 8,99 £ | 0,93 $ |
| Alemania | 0,99 € | 1,99 € | 2,99 € | 4,99 € | 9,99 € | 0,81 $ |
| Francia | 0,99 € | 1,99 € | 2,99 € | 5,49 € | 10,99 € | 0,80 $ |
| España | 0,99 € | 1,99 € | 2,99 € | 5,49 € | 10,99 € | 0,79 $ |
| Canadá | 1,49 C$ | 2,99 C$ | 3,99 C$ | 6,99 C$ | 13,99 C$ | 0,90 $ |
| Australia | 1,49 A$ | 2,99 A$ | 4,49 A$ | 7,99 A$ | 15,99 A$ | 0,81 $ |
| Japón | 170 ¥ | 340 ¥ | 520 ¥ | 870 ¥ | 1.700 ¥ | 0,83 $ |
| Corea del Sur | 1.500 ₩ | 3.000 ₩ | 4.500 ₩ | 7.400 ₩ | 14.900 ₩ | 0,86 $ |
| México | 19 MX$ | 39 MX$ | 59 MX$ | 99 MX$ | 209 MX$ | 0,79 $ |
| Brasil | 4,99 R$ | 9,99 R$ | 15,99 R$ | 25,99 R$ | 51,99 R$ | 0,82 $ |

«Neto por coins_s» es lo que te llega por una venta de 0,99 $ de base, sin impuestos y tras la comisión del 15 %. IVA usado: Alemania 19 %, Francia 20 % y España 21 % (tipos generales; la [Comisión Europea][ec-vat] remite a su base de datos TEDB), Reino Unido 20 % ([Avalara][avalara-uk]), Japón 10 % ([JETRO][jetro-jct]) y Corea del Sur 10 %, Australia 10 % y México 16 % ([Play, impuestos][play-tax]). Para Brasil, Play indica que el precio lleva impuestos incluidos pero no da el tipo, así que el script usa 0 % (optimista).

- **Recomendación P1.** En la zona euro, una sola escalera: 0,99 / 1,99 / 2,99 / 4,99 / 9,99 € en Alemania, Francia y España. En Francia y España eso deja `coins_m` y `coins_l` alrededor de un 9 % por debajo de la paridad, pero es más simple y no hay precios distintos entre países vecinos.
- Japón, Corea del Sur, México y Brasil no tienen prioridad hasta traducir el juego (fase 5 de la estrategia). Basta con la conversión automática.

**Comisión de Play.** En transacciones con usuarios del EEE, Reino Unido y EE. UU., desde el 30 jun 2026 la comisión sobre el primer millón de USD anual es del 10 % más un 5 % por el cobro. En el resto de países sigue el 15 % para quien está en el nivel del 15 % ([Play, comisiones][play-fees]). En los dos casos, el 15 % en total.

## Economía

### Entradas y salidas

| Entrada | Cantidad (diseño) |
|---|---|
| Final de nivel | ~50 de base + 50 por estrella + bonus por % salvado. El modelo supone 0,5 monedas por punto porcentual, es decir, 0-50 (estimación: confirmar con la implementación) |
| Reto diario | 100-300 (no usa mejoras) |
| `double_coins` | Duplica las monedas del nivel, una vez por pantalla final |
| `free_coins` | +150, hasta 3 al día |
| Compras | Catálogo de arriba |

| Salida | Cantidad |
|---|---|
| 4 mejoras × 5 niveles (manguera, potencia y alcance, velocidad, segundos extra) | 200 / 500 / 1.000 / 2.000 / 4.000 por nivel = 7.700 por mejora, **30.800 en total** (el diseño habla de 30.000; la suma exacta es 30.800) |

### Ritmo

| Perfil | Finales/día | Monedas por final (con x2) | Monedas por día activo | Días hasta nivel 2 en todo (2.800) | Días hasta nivel 3 en todo (6.800) | Días hasta el máximo | coins_m equivale a (días) | coins_l equivale a (días) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| casual | 3,0 | 131 | 519 | 5,4 | 13,1 | 59,3 | 11,6 | 27,0 |
| típico | 4,5 | 175 | 1.028 | 2,7 | 6,6 | 30,0 | 5,8 | 13,6 |
| implicado | 7,0 | 269 | 2.363 | 1,2 | 2,9 | 13,0 | 2,5 | 5,9 |

Monedas por dólar de cada producto: coins_s 1.010, starter_pack 1.508, remove_ads 167, coins_m 1.202, coins_l 1.401.

Los perfiles son estimaciones: finales de nivel al día, % de victorias, estrellas, % salvado, uso de x2, reto diario y anuncios de +150 (valores en `PROFILES` del script). El bot casual gana el 60-100 % de las partidas según el nivel, y en 4 de los 6 niveles casi siempre con 1 estrella ([dificultad.md](dificultad.md)), lo que cuadra con el perfil casual.

### Qué dice el ritmo

- **El arranque va bien.** Un jugador típico tiene nivel 2 en las cuatro mejoras en unos 3 días y nivel 3 en unos 7. La primera mejora (200) llega con el primer o segundo final de nivel.
- **El máximo queda lejos para casi todos.** Llegar al máximo cuesta 30 días activos a un jugador típico. En el escenario base, una instalación suma 3,9 días activos en 90 días (tabla «Escenarios»), así que el que no paga casi nunca pasa del nivel 3. Eso da sentido a `coins_m` (6 días de juego típico) y `coins_l` (14 días).
- **Hay un techo de gasto.** Todo se compra con unos 22 $ en `coins_l` (30.800 / 1.401). Después no hay nada en qué gastar, y el reto diario no usa mejoras. Un pagador que lo tiene todo ya no vuelve a comprar.
- **`free_coins` es generoso.** 3 × 150 = 450 monedas al día, el 44 % de lo que gana un jugador típico. `coins_s` (1.000) equivale a poco más de 2 días viendo esos anuncios.

### Recomendaciones (no están en el diseño actual)

- **E1. Sumideros antes de lanzar las compras.** Seguir con monedas (A3, 250). Cosméticos del camión, el traje y el chorro, de 1.500 a 8.000 monedas. Más adelante, mejoras nuevas ligadas a boquillas o niveles nuevos (fase 2 de la estrategia: niveles generados y validados por el bot).
- **E2.** `free_coins` de 150 a 100, o probar 150 frente a 250 (experimento X6) antes de decidir.
- **E3.** Racha del reto diario: +50 monedas por día seguido, hasta +250. Da un motivo para volver sin tocar el ranking, que sigue sin mejoras.
- **E4.** Mantener el reto diario sin mejoras. Es lo que hace justo el ranking compartido.

## Modelo de ingresos

### Fórmulas

- Retención diaria `r(t)`, con `r(0) = 1`, interpolada en escala log-log entre D1, D7, D30 y D90 y extrapolada después con la pendiente del último tramo.
- Días activos en `n` días: `A(n) = Σ r(t)` para `t = 0 … n-1`.
- Anuncios por jugador activo y día: bonificados `B = (finales × %x2 + ofertas de +30 s × % acepta + anuncios de +150) × fill`; intersticiales `I = finales / 2 × fill` desde el día 1 (el 2 es el parámetro `is_every`) y 0 el día 0 (primera sesión).
- ARPDAU de anuncios del país `c`: `(B × eCPM_bonif(c) + I × eCPM_inters(c)) / 1000`, con `eCPM(c) = eCPM EE. UU. × relativo del país × factor de realismo`.
- LTV de anuncios: `ARPDAU_día0 + Σ r(t) × ARPDAU(c)` para `t = 1 … n-1`.
- LTV de compras: `% pagadores a 90 días × gasto por pagador × parte de ese gasto hecha en el día n × multiplicador del país × 0,85 / (1 + IVA)`.
- **CPI de equilibrio = LTV D90.** ROAS Dn = LTV Dn / CPI. «ROAS D7 objetivo» = LTV D7 / LTV D90: el ROAS a 7 días de una cohorte que se recuperará justo a los 90 días.
- Estado estable: `DAU = instalaciones al día × A(90)`; ingresos al día = Σ instalaciones × LTV D90.

El modelo solo cubre Android. No incluye CrazyGames ni la web.

### Supuestos

| Supuesto | pesimista | base | optimista |
|---|---:|---:|---:|
| D1 / D7 / D30 / D90 | 25,0 % / 5,0 % / 1,2 % / 0,4 % | 32,0 % / 8,0 % / 2,5 % / 1,0 % | 40,0 % / 12,0 % / 4,5 % / 2,0 % |
| Finales de nivel por jugador y día | 3,0 | 4,5 | 6,0 |
| % que ve x2 al final | 20 % | 30 % | 40 % |
| Ofertas de +30 s por día · % que acepta | 0,4 · 30 % | 0,5 · 35 % | 0,6 · 40 % |
| Anuncios de +150 monedas por día | 0,25 | 0,50 | 0,90 |
| Relleno (fill) | 85 % | 90 % | 95 % |
| Factor de realismo del eCPM | 0,6 | 0,8 | 1,0 |
| Pagadores en 90 días · gasto bruto por pagador | 0,5 % · 2,50 $ | 1,2 % · 3,50 $ | 2,5 % · 5,00 $ |
| Instalaciones orgánicas al día | 5 | 15 | 40 |
| Presupuesto de pago al mes · CPI medio | 100 € · 2,50 $ | 200 € · 1,75 $ | 300 € · 1,20 $ |

De dónde sale cada supuesto:

- **Retención.** Anclada en GameAnalytics, con datos de 2025 de más de 16.000 juegos móviles. D1: mediana ~22 %, 25 % mejor ~30 %, 10 % mejor ~40 %. D7: mediana ~4 %, 25 % mejor 6-7 %, 10 % mejor 11-12 %. D30: mediana 0,68-0,79 %, 25 % mejor 1,6-1,8 % ([GameAnalytics 2026][ga-2026]). El pesimista está entre la mediana y el 25 % mejor, el base un poco por encima del 25 % mejor y el optimista en el 10 % mejor. Referencias: en 2024 la mediana de D1 de los casuales fue del 20-21 % ([GameAnalytics 2025][ga-2025]) y el D1 medio de todos los juegos en 2025, del 27 % ([Adjust vía GameDev Reports][gdr-adjust]). D90: estimación.
- **eCPM de EE. UU. en Android.** Bonificado 9,00 $ e intersticial 5,50 $ antes del factor de realismo (estimación anclada). Datos de partida: TopOn, H1 2025, Europa y Norteamérica en Android, bonificado 8,90 $, intersticial 4,36 $ y banner 1,05 $ ([TopOn][topon]). Appodeal, Q4 2024, Norteamérica en Android, bonificado 9,20 $ ([Appodeal vía Mistplay][mistplay-ecpm]). MonetizeMore, 2024, intersticial en EE. UU. de 6,50 a 8,57 $ según el mes, sin separar sistema ([MonetizeMore][monetizemore]). El factor de realismo (0,6-1,0) recoge que al principio solo habrá AdMob, poco volumen y anuncios limitados a quien no consienta en el EEE (estimación).
- **eCPM de los demás países** en relación con EE. UU.:
  - Reino Unido, Australia, Japón y Corea del Sur: medias iOS+Android de Appodeal, Q4 2024. Bonificado: EE. UU. 15,15 $, Australia 13,80 $, Corea del Sur 12,00 $, Japón 10,80 $ y Reino Unido 10,65 $. Intersticial: 12,65 / 9,10 / 8,65 / 7,20 / 7,25 $ en el mismo orden ([Appodeal vía Mistplay][mistplay-ecpm]).
  - México y Brasil: Latinoamérica frente a Europa y Norteamérica en Android, bonificado 2,18 $ frente a 8,90 $ e intersticial 0,98 $ frente a 4,36 $ ([TopOn][topon]).
  - Alemania, Francia, Canadá, España y el resto: estimación, porque no hay datos públicos por país.
  - Ojo: según MonetizeMore, en Japón el intersticial paga más que en EE. UU. (9,26-10,78 $) ([MonetizeMore][monetizemore]). Las fuentes no coinciden.
- **Estacionalidad.** El eCPM sube en el cuarto trimestre (bonificado en EE. UU. en Android: +24 % del tercer al cuarto trimestre de 2025, [Bidlogic][bidlogic]) y baja en enero. Con el lanzamiento a finales de octubre, los primeros datos serán mejores de lo normal.
- **Pagadores.** Estimación. No hay un dato primario reciente y fiable de conversión a pagador en casuales: GGA reconoce que no pudo verificarlo ([GGA][gga-kpis]). Como referencia antigua, en 2021 el 1,64 % de los jugadores de casuales había pagado a los 7 días, frente al 1,10 % de media de todos los géneros ([myTracker][mytracker]). El 79 % de los que pagan hace su primera compra el primer mes ([Mistplay 2024 vía GameDev Reports][gdr-mistplay]).
- **Instalaciones orgánicas, mezcla de países y CPI de pago.** Estimación, hasta tener datos de Play Console. Mezcla de pago: EE. UU. 50 %, Reino Unido 15 %, Canadá, Australia y Alemania 10 % cada uno, Francia 5 %.

### Anuncios por jugador activo y día

| Escenario | Bonificados | Intersticiales (desde el día 1) | eCPM bonif. EE. UU. | eCPM inters. EE. UU. | ARPDAU anuncios EE. UU. | Ídem el día 0 |
|---|---:|---:|---:|---:|---:|---:|
| pesimista | 0,82 | 1,27 | 5,40 $ | 3,30 $ | 0,0087 $ | 0,0045 $ |
| base | 1,82 | 2,02 | 7,20 $ | 4,40 $ | 0,0220 $ | 0,0131 $ |
| optimista | 3,36 | 2,85 | 9,00 $ | 5,50 $ | 0,0459 $ | 0,0303 $ |

### LTV y CPI de equilibrio por país (escenario base, Android)

| País | ARPDAU anuncios | LTV D7 | LTV D30 | LTV D90 | LTV D365 (extrap.) | % anuncios (D90) | ROAS D7 objetivo | CPI equilibrio pesim. | CPI equilibrio base | CPI equilibrio optim. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| EE. UU. | 0,022 $ | 0,054 $ | 0,085 $ | 0,112 $ | 0,152 $ | 68 % | 48 % | 0,03 $ | 0,11 $ | 0,35 $ |
| Reino Unido | 0,014 $ | 0,039 $ | 0,061 $ | 0,080 $ | 0,107 $ | 63 % | 49 % | 0,02 $ | 0,08 $ | 0,25 $ |
| Alemania | 0,014 $ | 0,039 $ | 0,060 $ | 0,078 $ | 0,105 $ | 62 % | 49 % | 0,02 $ | 0,08 $ | 0,24 $ |
| Francia | 0,012 $ | 0,035 $ | 0,054 $ | 0,070 $ | 0,094 $ | 58 % | 50 % | 0,02 $ | 0,07 $ | 0,22 $ |
| Canadá | 0,016 $ | 0,045 $ | 0,069 $ | 0,090 $ | 0,121 $ | 60 % | 50 % | 0,02 $ | 0,09 $ | 0,28 $ |
| Australia | 0,018 $ | 0,048 $ | 0,074 $ | 0,097 $ | 0,131 $ | 66 % | 49 % | 0,03 $ | 0,10 $ | 0,30 $ |
| Japón | 0,014 $ | 0,041 $ | 0,063 $ | 0,083 $ | 0,111 $ | 61 % | 50 % | 0,02 $ | 0,08 $ | 0,26 $ |
| Corea del Sur | 0,016 $ | 0,044 $ | 0,068 $ | 0,090 $ | 0,121 $ | 64 % | 49 % | 0,02 $ | 0,09 $ | 0,28 $ |
| España | 0,008 $ | 0,025 $ | 0,038 $ | 0,050 $ | 0,067 $ | 59 % | 50 % | 0,01 $ | 0,05 $ | 0,16 $ |
| México | 0,005 $ | 0,015 $ | 0,023 $ | 0,030 $ | 0,041 $ | 60 % | 49 % | 0,01 $ | 0,03 $ | 0,09 $ |
| Brasil | 0,005 $ | 0,016 $ | 0,025 $ | 0,032 $ | 0,043 $ | 56 % | 50 % | 0,01 $ | 0,03 $ | 0,10 $ |
| Resto | 0,003 $ | 0,011 $ | 0,016 $ | 0,021 $ | 0,028 $ | 54 % | 50 % | 0,01 $ | 0,02 $ | 0,07 $ |

### ARPDAU total y LTV D30 por país en los tres escenarios

ARPDAU total = ingresos por anuncios y compras de los primeros 90 días / días activos en ese periodo. El LTV D90 de cada escenario es la columna «CPI equilibrio» de la tabla anterior.

| País | ARPDAU total (pesim. · base · optim.) | LTV D30 (pesim. · base · optim.) |
|---|---:|---:|
| EE. UU. | 0,011 $ · 0,029 $ · 0,062 $ | 0,024 $ · 0,085 $ · 0,249 $ |
| Reino Unido | 0,008 $ · 0,021 $ · 0,044 $ | 0,017 $ · 0,061 $ · 0,180 $ |
| Alemania | 0,008 $ · 0,020 $ · 0,043 $ | 0,017 $ · 0,060 $ · 0,176 $ |
| Francia | 0,007 $ · 0,018 $ · 0,039 $ | 0,015 $ · 0,054 $ · 0,159 $ |
| Canadá | 0,009 $ · 0,023 $ · 0,050 $ | 0,019 $ · 0,069 $ · 0,204 $ |
| Australia | 0,010 $ · 0,025 $ · 0,054 $ | 0,020 $ · 0,074 $ · 0,218 $ |
| Japón | 0,008 $ · 0,021 $ · 0,046 $ | 0,018 $ · 0,063 $ · 0,187 $ |
| Corea del Sur | 0,009 $ · 0,023 $ · 0,050 $ | 0,019 $ · 0,068 $ · 0,202 $ |
| España | 0,005 $ · 0,013 $ · 0,028 $ | 0,011 $ · 0,038 $ · 0,113 $ |
| México | 0,003 $ · 0,008 $ · 0,017 $ | 0,007 $ · 0,023 $ · 0,069 $ |
| Brasil | 0,003 $ · 0,008 $ · 0,018 $ | 0,007 $ · 0,025 $ · 0,073 $ |
| Resto | 0,002 $ · 0,005 $ · 0,012 $ | 0,005 $ · 0,016 $ · 0,048 $ |

Comprobación: los rangos de ARPDAU que circulan son de 0,01-0,05 $ en hipercasual y 0,03-0,10 $ en casual y puzle ([Juego Studios][juego-arpdau], fuente secundaria que cita a AppsFlyer y Sensor Tower). El base queda en la parte baja: pocos intersticiales por diseño y poca profundidad de compra.

### Escenarios: orgánico más 100-300 €/mes de publicidad

Estado estable después de 90 días con el mismo ritmo de instalaciones.

| Métrica | pesimista | base | optimista |
|---|---:|---:|---:|
| Instalaciones orgánicas / día | 5,0 | 15,0 | 40,0 |
| Instalaciones de pago / día | 1,5 | 4,3 | 9,5 |
| Días activos por instalación (90 días) | 2,63 | 3,86 | 5,65 |
| DAU | 17 | 75 | 280 |
| ARPDAU total | 0,006 $ | 0,016 $ | 0,034 $ |
| % de ingresos por anuncios | 58 % | 63 % | 65 % |
| Ingresos netos al mes | 3 € | 32 € | 247 € |
| Gasto en publicidad al mes | 100 € | 200 € | 300 € |
| Resultado al mes | -97 € | -168 € | -53 € |
| ROAS D7 / D30 / D90 de la cohorte de pago | 1 % / 1 % / 1 % | 3 % / 4 % / 6 % | 11 % / 18 % / 26 % |

### CPI de mercado y qué haría falta

CPI de referencia que se publican (Android salvo que ponga iOS):

- Norteamérica 1,68 $, Europa 0,53 $ y Latinoamérica 0,14 $, todos los géneros, 2025. Casual e híbrido-casual a escala mundial en Android: de 0,54 $ a 0,95 $ entre 2024 y 2025 ([Adjust vía FoxData][foxdata]).
- Casual a escala mundial, de feb 2024 a feb 2025: Android 0,14 $ e iOS 1,41 $. ROAS a 30 días: Android 15 % e iOS 47 % ([Liftoff][liftoff-2025]; [Liftoff, resumen][liftoff-highlights]).
- Países de primer nivel: iOS 4,22 $ y Android 2,97 $ ([Segwise][segwise], agregador).
- Casual y puzle en Android: EE. UU. 1,50-3,50 $; Reino Unido, Canadá y Australia 1,00-2,50 $; Europa occidental 0,60-1,50 $ ([GGA][gga-kpis]; rangos recopilados sin una única fuente de datos, poco fiables).

El CPI de equilibrio en EE. UU. es de 0,11 $ en el base y 0,35 $ en el optimista, entre 5 y 15 veces menos que el mercado. Ni contando 365 días se arregla (0,15 $ en el base). Ojo: incluso el casual medio en Android recupera solo el 15 % a 30 días ([Liftoff][liftoff-highlights]).

| Caso | ARPDAU anuncios EE. UU. | LTV D90 EE. UU. | Cubre del CPI | Falta multiplicar por |
|---|---:|---:|---:|---:|
| base | 0,022 $ | 0,112 $ | 7 % | 15,0 × |
| base con la retención del optimista | 0,022 $ | 0,151 $ | 9 % | 11,1 × |
| base con la monetización del optimista | 0,046 $ | 0,268 $ | 16 % | 6,3 × |
| optimista | 0,046 $ | 0,350 $ | 21 % | 4,8 × |
| optimista + intersticial en cada final de nivel | 0,062 $ | 0,423 $ | 25 % | 4,0 × |
| optimista + eCPM de iOS (versión futura) | 0,079 $ | 0,513 $ | 31 % | 3,3 × |

(CPI de referencia: 1,68 $. eCPM de iOS frente a Android en Europa y Norteamérica, según [TopOn][topon]: bonificado 12,24 $ frente a 8,90 $ e intersticial 10,27 $ frente a 4,36 $.)

Lo que dice la tabla:

- Los anuncios más agresivos no lo arreglan: poner un intersticial en cada final de nivel sube el LTV un 21 % y es probable que cueste retención.
- Lo que más mueve el LTV es la monetización por jugador activo, es decir, profundidad: más sesiones, más motivos para gastar y compras con más recorrido. Después vienen la retención y el paso a iOS.
- Con 6 niveles, el juego no se paga con publicidad en países caros. El orden es: fase 2 de la estrategia (profundidad), iOS y, solo después, publicidad para escalar.

## Compra de tráfico con 100-300 €/mes

- **Lo que pide Google Ads.** En campañas de instalaciones con CPI objetivo, presupuesto diario de al menos 50 veces el CPI objetivo; 10 veces si se optimiza a una acción. No hay que tocar la campaña antes de 100 conversiones ni cambiar presupuesto o CPI más de un 20 % de golpe ([Google Ads][gads-bp]; [consejos][gads-tips]). Con un CPI de 1,68 $ son 84 $ al día, unos 2.200 € al mes. 100-300 € es el 5-14 % de eso: la campaña no sale del aprendizaje.
- **Qué hacer con el dinero: tandas de medición, no campaña continua.** Unas 300 instalaciones cuestan unos 450 € a 1,68 $ (dos o tres meses de presupuesto juntos). Con 300 instalaciones, el intervalo de confianza del 95 % es de unos ±5 puntos en un D1 del 32 % y de ±3 puntos en un D7 del 8 % (cálculo binomial). Con menos no se puede decidir nada.
- **Dónde.** Un solo grupo de países en inglés de primer nivel: EE. UU., Canadá, Reino Unido y Australia. Anuncios con los vídeos de juego que ya salen de `tools/video.py`.
- **Cómo atribuir sin otro SDK.** Leer el Play Install Referrer en `first_open` y guardar `utm_source` y `utm_campaign` en Supabase junto con el país (fase 1 de la estrategia). Así se calculan D1/D7 y el LTV por origen en `apagalo_cohortes`. Optimizar a compras o a ROAS en Google Ads exige mandarle eventos de dentro de la app (Firebase/GA4 o una plataforma de atribución): no compensa con este presupuesto.
- **Tráfico sin coste hacia jugadores de primer nivel.** CrazyGames dice tener más de 50 millones de jugadores al mes, con mucho peso de EE. UU. y otros países de primer nivel ([CrazyGames FAQ][cg-faq]). La ficha de Play en inglés (fase 0) y los vídeos del juego en redes completan el orgánico.

## KPIs y reglas para parar o escalar

### Objetivos

Se miden en Android, por cohortes de al menos 300 instalaciones, separando países de primer nivel y el resto.

| KPI | Mínimo para seguir | Para escalar con publicidad | Dónde se mide |
|---|---:|---:|---|
| D1 | ≥ 30 % | ≥ 35 % | `apagalo_cohortes` |
| D7 | ≥ 8 % | ≥ 12 % | `apagalo_cohortes` |
| D30 | ≥ 2,5 % | ≥ 4,5 % | `apagalo_cohortes` |
| Juego al día por jugador activo | ≥ 12 min | ≥ 20 min | `session_end` |
| % de jugadores activos que ve al menos un bonificado al día | ≥ 25 % | ≥ 40 % | eventos de anuncio (a añadir) |
| Bonificados por jugador activo | 1,5-2,5 | — | AdMob |
| Intersticiales por jugador activo | ≤ 2,5 (techo) | — | AdMob |
| Fill | ≥ 85 % | — | AdMob |
| Pagadores a 30 días (% de instalaciones) | ≥ 0,8 % | ≥ 2 % | Play Console y eventos de compra |
| ARPDAU total en EE. UU. | ≥ 0,03 $ | ≥ 0,10 $ | AdMob + Play / DAU |
| LTV D90 / CPI del país | — | ≥ 1,2 | modelo con datos reales |
| ROAS D7 de la cohorte de pago | — | ≥ 58-60 % (el ROAS D7 objetivo de 48-50 % × 1,2) | Google Ads + Supabase |

Los mínimos rondan el escenario base; los de escalar, el optimista. CrazyGames tiene sus propios umbrales (10+ min, D1 del 10-15 %, más del 80 % de conversión, [CrazyGames][cg-basic]), además de los criterios de [concepto.md](concepto.md).

### Reglas

1. **Nada de publicidad de pago** hasta cumplir todo esto: la app está en producción, lleva anuncios y compras al menos 14 días y tiene al menos 300 instalaciones orgánicas en la versión con monetización, con D1 ≥ 30 % y D7 ≥ 8 %.
2. **Primera tanda de medición:** unos 450 € en 10-14 días en EE. UU., Canadá, Reino Unido y Australia.
3. **Parar** la publicidad y volver a producto (fase 2) si la tanda da D1 < 25 % o D7 < 5 %.
4. **No escalar** si la retención llega al mínimo pero el ROAS D7 < 20 %. En ese caso el dinero va a las palancas de producto de la tabla de arriba.
5. **Escalar** en un país solo si el LTV D90 proyectado es al menos 1,2 veces el CPI y el ROAS D7 ≥ 58-60 % en dos cohortes seguidas de al menos 300 instalaciones. Subir como mucho un 20 % por semana, que es el límite de Google para no reiniciar el aprendizaje ([Google Ads][gads-tips]).
6. **Cortar un país** si en dos cohortes su ROAS D7 se queda por debajo de la mitad del objetivo.
7. **Intersticiales:** si al activarlos el D1 o el D7 caen más de 2 puntos frente a antes (o frente al grupo sin cambios, si hay volumen para un A/B), pasar a uno cada 3 finales. Si aun así cae, quitarlos y quedarse solo con bonificados.
8. **CrazyGames:** si no pasa el Basic Launch, iterar con los criterios de [concepto.md](concepto.md). No se esperan ingresos de ahí hasta el Full Launch.

## SDK y mediación

**Recomendación: solo AdMob al principio, a través de `@capacitor-community/admob`, y mediación por pujas dentro de AdMob más adelante.**

- **El plugin encaja.** La v8 es para Capacitor 8, incluye el SDK de Google Mobile Ads 25.4.x en Android y ofrece bonificados, intersticiales y las funciones de consentimiento UMP (`requestConsentInfo`, `showConsentForm`, `showPrivacyOptionsForm`) ([plugin][cap-admob]).
- **Una cuenta, un cobro y una línea en app-ads.txt.** Umbral de pago de 70 € ([AdMob, umbrales][admob-thresholds]). UMP es una plataforma de consentimiento certificada por Google ([AdMob, CMP][admob-cmp]). AdMob y AppLovin se reparten el 65 % de los ingresos por anuncios en juegos móviles: AppLovin el 36 % y AdMob el 29 % entre ene 2025 y may 2026 ([GameDev Reports sobre Sensor Tower][gdr-st-ads]).
- **Cuándo añadir pujas.** Añadir AppLovin, Unity Ads o Meta cuando haya unos 1.000 jugadores diarios en países de primer nivel o unos 10 $ al día de anuncios (estimación).
  - Se añaden como fuentes de puja dentro de AdMob: la mayoría cobra a través de AdMob, aunque algunas pagan directamente, y hace falta una cuenta con cada una ([AdMob, FAQ de pujas][admob-bidding-faq]).
  - En el caso de Unity Ads como pujador en AdMob, paga Google ([Unity][unity-receiving]). AppLovin puja en AdMob en bonificados e intersticiales ([adaptador][admob-applovin]).
  - Cada red añade dependencias nativas, líneas en app-ads.txt y datos en la sección de seguridad de los datos.
  - Una fuente secundaria habla de un 18-22 % más de ARPDAU al pasar a pujas ([Revenue Lab][revenuelab]; no verificado).
- **Por qué no AppLovin MAX ahora.** AppLovin solo paga lo que sirve su red (y su exchange), con un mínimo de 100 $ (150 $ por transferencia) el día 15 del mes siguiente. Las demás redes pagan cada una por su lado ([AppLovin][applovin-pay]). Además, hay que integrar su SDK nativo aparte del plugin.
- **Por qué no Unity LevelPlay ahora.** Paga en USD cada mes a través de Tipalti ([Unity][unity-payouts]) y tampoco tiene cabida en el plugin.
- **A vigilar.** Google indica que el SDK de Google Mobile Ads («Legacy») está en modo mantenimiento y que lo nuevo va al SDK «Next-Gen» ([AdMob][admob-data]). El plugin usa el Legacy: habrá que migrar cuando el plugin lo haga.
- **Compras.** El plugin de compras que se elija tiene que usar Play Billing Library 8 o superior ([Android Developers][pbl-deprecation]). Compruébalo en su `build.gradle` antes de elegirlo.

| Quién paga | Umbral | Cuándo |
|---|---|---|
| AdMob | 10 € para elegir forma de pago; 70 € para cobrar ([AdMob][admob-thresholds]) | Hacia el día 21 del mes ([AdMob][admob-steps]) |
| Google Play | 1 USD en moneda local (100 USD por transferencia en dólares) ([Play][play-payouts]) | Hacia el día 15 del mes siguiente ([Google Payments][gpay-payouts]) |
| AppLovin (solo su demanda) | 100 $ (150 $ por transferencia) ([AppLovin][applovin-pay]) | Día 15 del mes siguiente |
| CrazyGames | 100 €, por transferencia o PayPal ([CrazyGames FAQ][cg-faq]) | Mensual |
| GameDistribution | 100 € ([términos][gd-terms]) | En los 60 días siguientes al informe mensual |

## Cumplimiento

### Políticas de Google Play

- Intersticiales: las normas y las recomendaciones A1-A2 están en «Salvaguardas comunes». Los bonificados deben ser siempre opcionales ([Play][play-ads]).
- Público objetivo: se mantiene en 13+. No marcar la app como dirigida a niños ni activar el tratamiento para menores en AdMob. Si algún día se incluyen niños en el público, se aplican las normas de Familias ([Play][play-review]).
- Seguir las «Better Ads Standards» de apps, que la política de Play toma como referencia ([Play][play-ads]).
- **Recomendación:** en AdMob, limitar el contenido máximo de los anuncios a uno acorde con PEGI 12 (por ejemplo, «PG») y revisar los filtros de categorías sensibles.

### Declaraciones en Play Console (Contenido de la app)

| Sección | Hoy | Con monetización |
|---|---|---|
| Anuncios | «No contiene anuncios» | «Sí, contiene anuncios». La ficha mostrará «Contiene anuncios» ([Play][play-review]) |
| ID de publicidad | No lo usa | «Sí», con finalidad publicidad o marketing, analítica y prevención del fraude (lo que declara AdMob). En Android 13+ la app necesita el permiso `com.google.android.gms.permission.AD_ID`, que ya añade el SDK de anuncios al unir manifiestos ([Play][play-adid]). No quitarlo |
| Seguridad de los datos | Recoge, no comparte | Ver la tabla siguiente |
| Clasificación de contenido | Sin compras | Volver a rellenar el cuestionario (ver «Clasificación IARC») |
| Público objetivo | 13-15, 16-17, 18+ | Igual |

### Seguridad de los datos, respuesta por respuesta

El SDK de anuncios recoge y comparte automáticamente la IP (que puede servir para estimar la ubicación aproximada), las interacciones (arranques, toques, vistas de vídeo), diagnósticos (tiempo de arranque, bloqueos, consumo) e identificadores (ID de publicidad, App set ID). Todo es para publicidad, analítica y prevención del fraude, cifrado en tránsito ([AdMob][admob-data]). Con eso:

| Tipo de dato en Play | Hoy | Con AdMob | ¿Recogido / compartido? | Finalidades | ¿Opcional? |
|---|---|---|---|---|---|
| Actividad en la app › Interacciones con la app | Recogido (Supabase) | Además, AdMob | Recogido y compartido | Funcionalidad y analítica (Supabase); publicidad o marketing, analítica, prevención del fraude (AdMob) | Supabase sí; AdMob no |
| Información y rendimiento › Diagnósticos | No | AdMob | Recogido y compartido | Publicidad o marketing, analítica, prevención del fraude | No |
| Información y rendimiento › Otros datos de rendimiento | Recogido (calidad gráfica) | Igual | Recogido | Analítica | Sí |
| IDs de dispositivo u otros | ID aleatorio de instalación | Además, ID de publicidad y App set ID | Recogido y compartido | Funcionalidad y analítica (ID propio); publicidad o marketing, analítica, prevención del fraude (AdMob) | ID propio sí; los de AdMob, no (**recomendación** conservadora) |
| Ubicación › Ubicación aproximada | No | AdMob a partir de la IP | Recogido y compartido | Publicidad o marketing, analítica, prevención del fraude | No (**recomendación** conservadora) |
| Información financiera › Historial de compras | No | Solo si las compras se mandan a Supabase (recomendado para medir el LTV) | Recogido | Analítica | Sí, si respeta el interruptor de estadísticas |

- ¿Cifrado en tránsito? Sí.
- ¿Se puede pedir el borrado? Hoy la respuesta es «No». **Recomendación:** cambiarla a «Sí», con una página que explique los pasos (Google la pide) para los datos de Supabase.
- Cada red de mediación que se añada suma sus propios datos.

### Consentimiento (UMP)

- **EEE, Reino Unido y Suiza.** Para servir anuncios personalizados hace falta una plataforma de consentimiento certificada por Google e integrada con el TCF de IAB: desde el 16 ene 2024 en el EEE y el Reino Unido, y desde el 31 jul 2024 en Suiza. Sin ella solo hay anuncios no personalizados o limitados ([AdMob][admob-cmp]). El SDK de UMP está certificado para el TCF v2.3 ([AdMob][admob-eu]).
- **Flujo.** En cada arranque, `requestConsentInfo`. Si hace falta, `showConsentForm`. Solo cuando se pueda pedir anuncios, se inicializa AdMob y se cargan. En Ajustes, un botón «Privacidad y anuncios» que abre `showPrivacyOptionsForm` ([plugin][cap-admob]).
- **Estados de EE. UU.** Activar en AdMob el mensaje para los estados que cubre: California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregón, Rhode Island, Tennessee, Texas, Utah y Virginia ([AdMob][admob-us-msg]). El SDK respeta las señales GPP que guarda UMP ([AdMob][admob-us-dev]).
- La opción propia de estadísticas anónimas (Supabase) se mantiene aparte, en la misma pantalla de Ajustes.

### Política de privacidad (`src/privacidad.html`)

Hoy dice «No usamos cookies de publicidad ni rastreo entre webs» y «No vendemos ni compartimos los datos con terceros». En Android eso deja de ser cierto. Hay que añadir, antes de publicar la versión con anuncios:

1. Que la app de Android muestra anuncios de Google AdMob. Qué datos recoge el SDK (IP y ubicación aproximada, ID de publicidad y App set ID, interacciones, diagnósticos) y para qué (publicidad, analítica, prevención del fraude). Enlace a cómo usa Google los datos de las apps de sus socios.
2. La base legal: consentimiento a través de UMP en el EEE, Reino Unido y Suiza, y exclusión voluntaria en los estados de EE. UU.
3. Cómo cambiar el consentimiento (Ajustes → Privacidad y anuncios) y cómo restablecer o borrar el ID de publicidad en Android.
4. Que las compras las procesa Google Play y que no ves los datos de pago. Si mandas las compras a Supabase, qué guardas y para qué.
5. En CrazyGames, los anuncios los sirve su SDK bajo su política (cuando haya Full Launch).
6. Conservación de los datos, cómo pedir el borrado (un correo, no solo un mensaje en X) y que el juego no está dirigido a menores de 13 años.
7. La fecha de actualización, y la versión en inglés al mismo nivel que la española.

### app-ads.txt

- Publicar en `https://apagalo.vercel.app/app-ads.txt` la línea que da AdMob para tu cuenta. Tiene esta forma (el cuarto campo es el ID de certificación de Google y es opcional según la especificación):

  ```
  google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
  ```

- AdMob busca el archivo en el dominio de la web de desarrollador de la ficha de Play, y como mucho un nivel de subdominio por encima ([AdMob][admob-appads]). `vercel.app` está en la lista pública de sufijos ([Public Suffix List][psl]), así que `apagalo.vercel.app` cuenta como dominio propio. La web de la ficha ya es `https://apagalo.vercel.app`.
- `build.mjs` tiene que copiar `app-ads.txt` a la raíz de `dist/web/`, servido como texto y sin redirecciones. AdMob tarda hasta 24 h en comprobarlo ([AdMob][admob-appads]).
- Cada red de mediación que se añada suma su línea.

### Clasificación IARC

- Hay que volver a rellenar el cuestionario cuando cambian el contenido o las funciones de la app ([Play][play-ratings]).
- **Compras digitales: sí.** La clasificación mostrará el aviso de compras en el juego («In-Game Purchases» en ESRB).
- **Elementos aleatorios de pago: no.** Si los hubiera, el aviso sería «In-Game Purchases (Includes Random Items)» ([ESRB][esrb-random]).
- Los anuncios se declaran en su propia sección. El resto de respuestas no cambia: sin violencia contra personas ni animales, sin interacción entre usuarios y sin compartir ubicación.

### Textos de la ficha

- Quitar «Sin anuncios y sin compras» de la descripción completa ([google-play.md](google-play.md)). La ficha mostrará sola «Contiene anuncios» y las compras en la app.
- Si se usa como argumento, se puede decir «anuncios opcionales con recompensa» sin prometer que no habrá ningún otro.

### iOS (más adelante) y la ley europea de servicios digitales (DSA)

- Apple exige declarar si eres comerciante según la DSA, y desde el 17 feb 2025 retira de la tienda de la UE las apps que no lo hayan declarado ([Apple][apple-dsa]; [MacRumors][macrumors-dsa]).
- En Play no he podido confirmar en la ayuda oficial cómo se pide: revisa si Play Console lo solicita en los datos de la cuenta.
- Como autónomo que cobra por la app, lo esperable es declararse comerciante, con los datos de contacto visibles en la UE (confírmalo con tu gestoría).

## Cuentas y configuración, en orden

### Ahora, antes de producción (de finales de septiembre a mediados de octubre)

1. **AdMob: cuenta.** Con la misma cuenta de Google que Play Console (NoCodeBuilder), para enlazar después la app y la ficha.
2. **AdMob: perfil de pagos.** España. El tipo de perfil (individual o empresa) y el NIF, según te diga tu gestoría. Datos fiscales de fuera de EE. UU.: Google puede retener más si faltan, y los convenios pueden reducir la retención ([AdMob][admob-tax]).
3. **AdMob: app y bloques de anuncios.** Añadir la app como Android «no publicada». Crear 3 bloques bonificados (`continue_time`, `double_coins`, `free_coins`) y 1 intersticial (`between_levels`): un bloque por ubicación, para ver el rendimiento por separado. Mientras tanto, anuncios de prueba y dispositivos de prueba.
4. **AdMob: Privacidad y mensajes.** Mensaje del RGPD (EEE, Reino Unido y Suiza) en español e inglés con la URL de la política, y mensaje de los estados de EE. UU.
5. **Política de privacidad y app-ads.txt.** Actualizar `/privacidad` (ver arriba) y publicar `app-ads.txt` en la web.
6. **Play Console: perfil de pagos y comerciante.** Configurar el perfil de pagos para vender en la app ([Play, pagos][play-payouts]). Apuntarse al nivel del 15 % si la consola lo pide ([Play][play-fees]).
7. **Play Console: productos.** Subir a la prueba cerrada la 1.2.1 ya con Play Billing Library 8 o superior: sin una versión con la librería de facturación no se pueden crear productos ([Android Developers][pbl-getting-ready]). Crear los 5 productos con los mismos ids que `types.ts` y los precios de arriba, activarlos y añadir a los testers como cuentas de prueba de licencias.
8. **Play Console: contenido de la app.** Anuncios, ID de publicidad, seguridad de los datos, cuestionario IARC y descripción de la ficha, con la versión monetizada. Los cambios de ficha no afectan a la prueba cerrada ni a sus 14 días ([estrategia.md](estrategia.md)).
9. **CrazyGames.** Datos de cobro en Tipalti (Billing → Manage Payment Details) y envío al Basic Launch ([crazygames.md](crazygames.md)).
10. **Supabase.** Eventos `ad_shown` y `ad_rewarded` (con la ubicación), `iap_purchase` (producto y precio en micros y moneda), el Install Referrer y la región (fase 1 de la estrategia).

### Con producción (de mediados a finales de octubre)

11. **AdMob: enlazar la app con su ficha de Play.** La revisión de preparación tarda 2-3 días. Hasta entonces el servicio de anuncios es limitado, y exige que la app esté publicada ([AdMob][admob-readiness]).
12. **AdMob: comprobar app-ads.txt** en el panel.
13. **AdMob: verificaciones y cobro.** Verificación de identidad y dirección (código PIN por correo) cuando se alcancen los umbrales, y forma de pago (transferencia a tu cuenta) al llegar a 10 € ([AdMob][admob-steps]).

### Después

14. **Mediación.** Cuentas en AppLovin, Unity Ads y Meta, adaptadores, líneas de app-ads.txt y seguridad de los datos, cuando se cumpla el umbral de la sección anterior.
15. **Google Ads.** Cuenta y campaña de instalaciones para la tanda de medición, solo si se cumple la regla 1.
16. **iOS.** Cuenta de Apple Developer, estado DSA, aviso de ATT y UMP, y precios por país (fase 4 de la estrategia).

## Cobros e impuestos (resumen: confírmalo con tu gestoría)

- **AdMob.** Paga Google Ireland Limited (NIF-IVA IE6388047V). El IVA lo declara el destinatario (Google Ireland) por inversión del sujeto pasivo, artículo 196 de la Directiva 2006/112/CE ([AdMob][admob-ireland]). Para un autónomo español suele suponer: alta en el Registro de Operadores Intracomunitarios (ROI), factura a Google Ireland sin IVA con la mención «inversión del sujeto pasivo» y declararlo en los modelos 303 y 349. La gestoría debe confirmar cada punto.
- **Google Play.** Google calcula, cobra e ingresa el IVA de las compras de los consumidores de la UE y del Reino Unido, y el impuesto sobre ventas de los estados de EE. UU. ([Play, impuestos][play-tax]). A ti te llega el neto. La entidad que te paga aparece en tu perfil de pagos: confírmala allí y con la gestoría para facturar o registrar el ingreso.
- **EE. UU.** Rellenar los datos fiscales de fuera de EE. UU. (formulario W-8) en AdMob y en Play para aplicar el convenio entre España y EE. UU. Sin ellos la retención puede ser mayor ([AdMob][admob-tax]).
- **IRPF.** Al ser pagadores extranjeros, lo normal es que Google Ireland y CrazyGames no retengan IRPF español. El ingreso entra en tu actividad de autónomo. La gestoría te dirá si necesitas otro epígrafe de IAE y si sigues exento de los pagos fraccionados (modelo 130) al sumar estos ingresos a los de Kuestiona.
- **CrazyGames** paga por Tipalti. La entidad y el tratamiento del IVA están en su portal.

## Monetización web

| Opción | Qué da | Requisitos y condiciones | Recomendación |
|---|---|---|---|
| **CrazyGames** | Parte de los ingresos por anuncios de su SDK desde el Full Launch. Compras solo por invitación, con Xsolla ([CrazyGames][cg-intro]) | Basic Launch sin anuncios ni ingresos; mínimo 7 días y 500 partidas, con cierre automático a los 21 días ([CrazyGames][cg-basic]). No publican el porcentaje en su documentación. En las bases de su game jam con GameMaker (sept 2025): 60 % de los anuncios y 70 % de las compras para el desarrollador tras recuperar el adelanto, con exclusividad web si se acepta el bonus ([bases de la jam][cg-jam]); solo orientativo | **Principal canal web.** Adaptar A1-A4 en la versión de CrazyGames y preparar el Full Launch |
| **Web propia con AdSense H5 Games Ads** | Intersticiales y bonificados dentro del juego, también dentro de iframes ([AdSense H5][adsense-h5]) | Cuenta de AdSense aprobada y solicitud del programa H5 ([AdSense][adsense-h5-signup]). Normas: nada al abrir o cerrar, nada tras cerrar otro anuncio, nada durante la partida. En anuncios de contenido, el editor recibe el 80 % tras la comisión de la plataforma del anunciante; Google no publica el porcentaje de H5 ([AdSense][adsense-share]) | **Todavía no.** La web propia sirve para captar testers y como enlace de CrazyGames y Play. Revisar si pasa de unos 1.000 jugadores diarios (estimación) |
| **Poki** | Reparto de ingresos por los jugadores que trae Poki | Exclusiva web por defecto 5 años (también Discord y YouTube Playables). Sin exclusiva, solo licencia de pago único. Porcentajes no públicos ([Poki][poki-deals]) | **No.** Choca con CrazyGames y con la web propia. Solo si Poki ofrece un trato con tracción demostrada |
| **GameDistribution** | 33 % de los ingresos netos ([términos][gd-terms]) | Solo su SDK. Cobro desde 100 € en los 60 días siguientes al informe. Sus términos dicen que el juego «no se distribuirá… a través de apps nativas» | **No.** Reparto bajo y una cláusula que, leída de forma amplia, choca con la app de Android |
| **Compras directas en la web (Stripe u otro)** | 100 % menos la pasarela | Vender contenido digital a consumidores de la UE obliga a cobrar el IVA del país del comprador (norma general del IVA de la UE; confírmalo con tu gestoría), salvo que se use un intermediario que haga de vendedor (Xsolla, Paddle) | **No por ahora.** Más trabajo fiscal que ingreso con este tráfico |

## Experimentos

Con 15 instalaciones orgánicas al día (escenario base), un A/B de retención tarda meses en tener volumen: detectar 2-3 puntos de D7 pide miles de instalaciones por grupo (estimación). Por eso:

- Primero se prueban cambios grandes, midiendo antes y después con métricas rápidas (ingresos por anuncios por jugador activo, % que ve bonificados, conversión a compra).
- La retención queda como límite: la regla 7.
- Los grupos A/B se asignan por paridad del identificador de instalación y se guarda el grupo en cada evento.

| # | Cuándo | Prueba | Métrica principal | Límite |
|---|---|---|---|---|
| X1 | Mes 1 | Intersticial cada 2 finales (control) frente a cada 3 | Ingresos por anuncios por instalación a 7 días | D1 y D7 |
| X2 | Mes 1 | `double_coins` en todas las pantallas finales frente a solo en victorias | % que ve bonificados, monedas/día | Uso de la tienda |
| X3 | Mes 1 | `continue_time` solo con anuncio frente a anuncio o 250 monedas (A3) | Uso del +30 s, saldo de monedas | Victorias por nivel |
| X4 | Mes 2 | Precio de `remove_ads`: 2,99 $ frente a 3,99 $ y 4,99 $, con los experimentos de precio de Play ([Play][play-price-exp]) | Ingresos por visitante de la tienda | Solo si hay volumen (Play calcula el efecto mínimo detectable) |
| X5 | Mes 2 | `starter_pack`: momento (tras el nivel 2 o tras la primera derrota) y ventana de 48 h (C1) | Conversión a primera compra | — |
| X6 | Mes 2 | `free_coins`: 150 frente a 250 (o 100, ver E2) | Anuncios por jugador activo, compras de `coins_s` | — |
| X7 | Mes 3 o más | Pujas de mediación (AppLovin, Unity Ads, Meta) frente a solo AdMob, antes y después | eCPM y fill por semana, corregidos por estacionalidad | — |
| X8 | Con el Full Launch | Banner de CrazyGames en menús que se ven al menos 5 s ([CrazyGames][cg-ads]) | Ingresos por cada 1.000 partidas | Tiempo de juego |

## Riesgos

- **AdMob no sirve con normalidad hasta que la app esté publicada.** Si producción se retrasa, se retrasan los ingresos, no el trabajo ([AdMob][admob-readiness]).
- **Pocos datos.** Con decenas de jugadores diarios, el eCPM y la conversión de las primeras semanas no son representativos. Decidir con cohortes de al menos 300 instalaciones.
- **CrazyGames puede rechazar la integración de anuncios** si `continue_time` o el anuncio intermedio incumplen sus normas: aplicar A1-A4 antes del Full Launch.
- **Las condiciones cambian.** Play cambió sus comisiones en el EEE, Reino Unido y EE. UU. el 30 jun 2026 ([Play][play-fees]) y el SDK de anuncios Legacy está en mantenimiento ([AdMob][admob-data]). Revisar este documento cada trimestre.

## Fuentes

Datos de mercado:

- [TopOn, Global Mobile Games Monetization Report H1 2025][topon]: eCPM por región, sistema y formato; reparto de ingresos por formato en casuales.
- [Mistplay, «Mobile ads eCPM» (datos de Appodeal Q4 2024)][mistplay-ecpm]: eCPM por país y región.
- [MonetizeMore, eCPM insights (actualizado el 12 jun 2026, datos de 2024)][monetizemore]: intersticiales por país y mes.
- [Bidlogic, eCPM en el cuarto trimestre de 2025][bidlogic]: estacionalidad.
- [GameAnalytics, 2026 Mobile & PC Gaming Benchmarks][ga-2026] y [2025 Mobile Gaming Benchmarks][ga-2025]: retención y sesiones.
- [GameDev Reports sobre el informe de Adjust de 2026][gdr-adjust]: D1 medio en 2025.
- [FoxData, CPI 2026 (datos de Adjust, Gaming App Insights 2026)][foxdata]: CPI por región y género.
- [Liftoff, 2025 Casual Gaming Apps Report][liftoff-2025] y [resumen][liftoff-highlights]: CPI y ROAS a 30 días de casuales.
- [Segwise, CPI, IPM y ROAS][segwise]: CPI de países de primer nivel.
- [Game Growth Advisor, KPIs de 2026][gga-kpis]: rangos de CPI por país y la advertencia sobre datos de pagadores.
- [Deconstructor of Fun sobre el informe de anuncios de Sensor Tower][dof-st] y [GameDev Reports sobre el mismo informe][gdr-st-ads]: reparto entre compras y anuncios, cuota de las redes.
- [myTracker, pagadores y retención por género (2021)][mytracker]: conversión a pagador.
- [GameDev Reports sobre Mistplay 2024][gdr-mistplay]: momento de la primera compra.
- [Juego Studios, ARPDAU por género][juego-arpdau]: rangos de ARPDAU (secundaria).
- [Revenue Lab, AdMob 2026][revenuelab]: efecto de la mediación por pujas (secundaria, no verificada).
- [BCE, tipos de cambio de referencia][ecb]: cambio del 25 sept 2026.
- [Comisión Europea, tipos de IVA][ec-vat], [Avalara, IVA del Reino Unido][avalara-uk] y [JETRO, impuesto sobre el consumo de Japón][jetro-jct].

Google Play y Google Ads:

- [Política de anuncios de Play][play-ads]
- [Comisiones de Play][play-fees]
- [Preparar la app para revisión (anuncios, clasificación, público)][play-review]
- [ID de publicidad][play-adid]
- [Clasificación de contenido][play-ratings]
- [Precios de la app y de los productos][play-prices]
- [Impuestos por país][play-tax]
- [Experimentos de precio][play-price-exp]
- [Pedidos y pagos][play-payouts]
- [Calendario de pagos de Google Payments][gpay-payouts]
- [Retirada de versiones de Play Billing Library][pbl-deprecation]
- [Preparar Play Billing][pbl-getting-ready]
- [Buenas prácticas de campañas de apps en Google Ads][gads-bp] y [consejos][gads-tips]

AdMob, AdSense y mediación:

- [AdMob, datos para Play][admob-data]
- [Requisito de CMP certificada][admob-cmp]
- [Mensajes del RGPD y UMP][admob-eu]
- [Mensaje de estados de EE. UU.][admob-us-msg] y [guía para desarrolladores][admob-us-dev]
- [app-ads.txt][admob-appads]
- [Revisión de preparación de la app][admob-readiness]
- [Umbrales de pago][admob-thresholds]
- [Pasos para cobrar][admob-steps]
- [Datos fiscales de fuera de EE. UU.][admob-tax]
- [Google Ireland como entidad contratante][admob-ireland]
- [FAQ de pujas][admob-bidding-faq]
- [Adaptador de AppLovin][admob-applovin]
- [Plugin de AdMob para Capacitor][cap-admob]
- [AdSense H5 Games Ads][adsense-h5], [alta][adsense-h5-signup] y [reparto de AdSense][adsense-share]
- [Pagos de AppLovin][applovin-pay]
- [Unity: recibir pagos][unity-receiving] y [pagos de ingresos][unity-payouts]
- [Public Suffix List][psl]

Portales web:

- [CrazyGames: requisitos de anuncios][cg-ads]
- [CrazyGames: Basic Launch][cg-basic]
- [CrazyGames: requisitos][cg-intro]
- [CrazyGames: guía de monetización][cg-guide]
- [CrazyGames: FAQ][cg-faq]
- [Bases de la CrazyGames x GameMaker Web Jam][cg-jam]
- [Poki: tipos de trato][poki-deals]
- [GameDistribution: acuerdo de licencia][gd-terms]

Otros:

- [ESRB: In-Game Purchases (Includes Random Items)][esrb-random]
- [Apple: requisitos DSA para comerciantes][apple-dsa]
- [MacRumors: plazo DSA de Apple][macrumors-dsa]

[topon]: https://mores.toponad.com/reports/TopOn%20Global%20Mobile%20Games%20Monetization%20Report%20_%202025%20H1.pdf
[mistplay-ecpm]: https://business.mistplay.com/resources/mobile-ads-ecpm
[monetizemore]: https://www.monetizemore.com/blog/ecpm-insights/
[bidlogic]: https://bidlogic.io/2026/01/30/what-happened-to-mobile-app-ecpms-in-q4-2025/
[ga-2026]: https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks
[ga-2025]: https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks
[gdr-adjust]: https://gamedevreports.substack.com/p/adjust-gaming-app-insights-report
[foxdata]: https://foxdata.com/en/blogs/2026-mobile-game-user-acquisition-cost-benchmarks-how-much-should-you-spend/
[liftoff-2025]: https://liftoff.ai/2025-casual-gaming-apps-report/
[liftoff-highlights]: https://liftoff.ai/blog/highlights-2025-casual-gaming-apps-report/
[segwise]: https://segwise.ai/blog/cpi-ipm-roas-benchmarks-optimizing-ad-spend
[gga-kpis]: https://gamegrowthadvisor.com/blog/2026-03-17-mobile-game-kpis-benchmarks-2026/
[dof-st]: https://www.deconstructoroffun.com/blog/5-numbers-hiding-in-plain-sight-sensor-towers-ad-monetization-report
[gdr-st-ads]: https://gamedevreports.substack.com/p/sensor-tower-mobile-game-ad-monetization
[mytracker]: https://tracker.my.com/blog/paying-user-and-rolling-retention-rate-benchmarks-across-game-genres-a-study?lang=en
[gdr-mistplay]: https://gamedevreports.substack.com/p/mistplay-paying-users-in-mobile-games
[juego-arpdau]: https://www.juegostudio.com/blog/arpdau-benchmarks-by-game-genre
[revenuelab]: https://www.revenuelab.fyi/blog/admob-ecpm-benchmarks-2026
[ecb]: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
[ec-vat]: https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en
[avalara-uk]: https://www.avalara.com/us/en/vatlive/country-guides/europe/uk/british-vat-rates.html
[jetro-jct]: https://www.jetro.go.jp/en/invest/setting_up/section3/page6.html
[play-ads]: https://support.google.com/googleplay/android-developer/answer/9857753
[play-fees]: https://support.google.com/googleplay/android-developer/answer/112622
[play-review]: https://support.google.com/googleplay/android-developer/answer/9859455
[play-adid]: https://support.google.com/googleplay/android-developer/answer/6048248
[play-ratings]: https://support.google.com/googleplay/android-developer/answer/188189
[play-prices]: https://support.google.com/googleplay/android-developer/answer/6334373
[play-tax]: https://support.google.com/googleplay/android-developer/answer/138000
[play-price-exp]: https://support.google.com/googleplay/android-developer/answer/13343030
[play-payouts]: https://support.google.com/googleplay/android-developer/answer/137997
[gpay-payouts]: https://support.google.com/paymentscenter/answer/7159355
[pbl-deprecation]: https://developer.android.com/google/play/billing/deprecation-faq
[pbl-getting-ready]: https://developer.android.com/google/play/billing/getting-ready
[gads-bp]: https://support.google.com/google-ads/answer/14104492
[gads-tips]: https://support.google.com/google-ads/answer/9176652
[admob-data]: https://developers.google.com/admob/android/privacy/play-data-disclosure
[admob-cmp]: https://support.google.com/admob/answer/13554116
[admob-eu]: https://support.google.com/admob/answer/10113207
[admob-us-msg]: https://support.google.com/admob/answer/10860309
[admob-us-dev]: https://developers.google.com/admob/android/privacy/us-states
[admob-appads]: https://support.google.com/admob/answer/9363762
[admob-readiness]: https://support.google.com/admob/answer/10564477
[admob-thresholds]: https://support.google.com/admob/answer/2772208
[admob-steps]: https://support.google.com/admob/checklist/2998383
[admob-tax]: https://support.google.com/admob/answer/14135099
[admob-ireland]: https://support.google.com/admob/answer/4382717
[admob-bidding-faq]: https://support.google.com/admob/answer/9360574
[admob-applovin]: https://developers.google.com/admob/android/mediation/applovin
[cap-admob]: https://github.com/capacitor-community/admob
[adsense-h5]: https://support.google.com/adsense/answer/9959170
[adsense-h5-signup]: https://support.google.com/adsense/answer/1705831
[adsense-share]: https://support.google.com/adsense/answer/180195
[applovin-pay]: https://support.applovin.com/en/max/max-dashboard/account/payments
[unity-receiving]: https://docs.unity.com/en-us/grow/dashboard/finance/payment/receiving
[unity-payouts]: https://docs.unity.com/en-us/grow/dashboard/finance/payment/earnings-payouts
[psl]: https://publicsuffix.org/list/public_suffix_list.dat
[cg-ads]: https://docs.crazygames.com/requirements/ads/
[cg-basic]: https://docs.crazygames.com/resources/basic-launch-metrics/
[cg-intro]: https://docs.crazygames.com/requirements/intro/
[cg-guide]: https://docs.crazygames.com/resources/ad-monetization-guide/
[cg-faq]: https://docs.crazygames.com/faq/
[cg-jam]: https://crazygames.indiehero.io/cggmwj-jg/
[poki-deals]: https://developers.poki.com/guide/revenue-deal-types
[gd-terms]: https://static.gamedistribution.com/terms/developer.html
[esrb-random]: https://www.esrb.org/blog/in-game-purchases-includes-random-items/
[apple-dsa]: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/
[macrumors-dsa]: https://www.macrumors.com/2024/10/17/developers-eu-app-store-trader-requirements/
