# Estrategia: mercado internacional y monetización

26 sept 2026. Objetivo: jugadores de países de primer nivel (más del 30 % de EE. UU.; el resto sobre todo Reino Unido, UE, Canadá, Australia, Corea del Sur y Japón) y el resto del mundo sin buscarlo. Se busca maximizar el retorno de la publicidad (ROAS), no minimizar el coste por instalación (CPI), y alejarse de lo hipercasual.

## Dónde estamos

**Idioma.** El juego ya está en inglés para cualquiera cuyo navegador o móvil no esté en español (`detectLang` en `src/i18n.ts`), y la ficha de CrazyGames está en inglés. Pero la cara pública es española:

- El nombre «¡Apágalo!» es difícil de leer, pronunciar y buscar para un estadounidense o un japonés (lleva «¡» y tilde).
- La ficha de Google Play solo existe en español («¡Apágalo! Bomberos»), igual que las capturas y el gráfico destacado.
- La web y la tarjeta al compartir (metadatos OG) están en español.
- Los escenarios tienen sabor español (verbena, San Juan, El Castañar). Como ambientación está bien; lo que importa es que los textos en inglés suenen naturales.

**Idiomas del objetivo.** El inglés cubre EE. UU., Reino Unido, Canadá y Australia. Faltan japonés y coreano, y alemán y francés para la UE. Las fuentes del juego (Bungee y Baloo 2) no tienen caracteres japoneses ni coreanos.

**Monetización: ninguna.** Sin anuncios ni compras, el ROAS es cero por definición. Cualquier euro en publicidad ahora se pierde.

**Plataforma.** Android y web. En EE. UU. más de la mitad de los móviles son iPhone, así que sin iOS se pierde la parte más valiosa de ese tráfico.

**Profundidad.** Hay 6 niveles y un reto diario: se acaba en una o dos tardes. No hay meta (moneda, mejoras, colección, eventos), y eso es justo lo que acerca un juego a lo hipercasual y lo que hace que la retención se caiga a partir del día 3. Para que la publicidad en países caros salga rentable hace falta retención larga. El camino es un **híbrido-casual**: el núcleo casual que ya tenemos más una capa de progresión y compras.

> Actualización 29 sept 2026: la 1.3.0 ya trae monedas, mejoras y una campaña de 67 niveles (ver fase 2). Falta publicarla y medir cuánto sube la retención.

**Medición.** La analítica no guarda país ni idioma, así que hoy no podemos separar a los jugadores de primer nivel del resto.

**Criterios de `concepto.md`.** Están pensados para decidir si el concepto engancha con tráfico gratuito (D1 ≥ 10 % para seguir). Para pagar tráfico en países caros el listón es bastante más alto.

## Principios

1. Primero retención, después monetización y solo después comprar tráfico.
2. Pagar más por jugadores que monetizan (ROAS a 7 días) en vez de buscar la instalación más barata.
3. Nada de mecánicas de un toque ni partidas de 20 segundos. Profundidad y motivos para volver.

## Plan por fases

### Fase 0: cara internacional (1-2 días, sin tocar la jugabilidad)

- **Nombre internacional** (decisión tuya). El paquete `com.nocodeboy.apagalo` no se puede cambiar, pero el título de la ficha sí, y puede ser distinto por idioma. Opciones:
  - Mantener «¡Apágalo!» como marca y añadir un subtítulo en inglés: «¡Apágalo! Firefighter Rescue».
  - Nombre en inglés fuera de España y Latinoamérica, por ejemplo «Put It Out! Firefighter», manteniendo «¡Apágalo! Bomberos» en español. Si se cambia, el título dentro del juego en inglés tiene que coincidir (CrazyGames lo exige).
- **Google Play:** ficha en inglés (en-US) como idioma predeterminado, con capturas y gráfico destacado en inglés (`tools/store_shots.py` con `locale='en-US'`). La ficha en español se queda para es-ES y Latinoamérica. Los cambios de ficha pasan revisión, pero no tocan la prueba cerrada ni sus 14 días.
- **Web:** metadatos y tarjeta para compartir en inglés por defecto, y en español para quien llegue en español.

### Fase 1: medir bien (1 día)

- Guardar en el primer evento el idioma del dispositivo y su zona horaria, que dan el país aproximado sin datos personales, y añadir la región a las vistas de Supabase (`apagalo_kpis` por región). Hay que actualizar la política de privacidad.
- En CrazyGames, mirar el panel por país cuando haya tráfico del Basic Launch. Es la primera lectura real de jugadores de primer nivel.

### Fase 2: profundidad híbrido-casual (2-4 semanas)

- ✅ Moneda por partida y mejoras permanentes (manguera, presión, velocidad y tiempo). Pendiente: boquillas nuevas.
- ✅ **Campaña de 67 niveles** (6 originales, 10 más por escenario y un final), cada uno medido con el bot (`docs/dificultad.md`). Pendiente: niveles generados automáticamente. Ya tenemos un bot que juega y mide la dificultad, una ventaja poco común: permite fabricar muchos niveles y descartar los injugables. El reto diario ya funciona así.
- Misiones diarias, eventos semanales y colección (camiones, trajes, estaciones).
- Objetivo: subir el D7 y las sesiones por día, que es lo que sostiene cualquier ingreso.

### Fase 3: monetización (1-2 semanas)

- **Anuncios con recompensa**, bien integrados: 30 s extra cuando se acaba el tiempo, segunda oportunidad cuando el fuego se descontrola, doble de monedas al terminar.
- **Anuncios entre niveles**, con tope: nunca en la primera sesión y como mucho uno cada pocos niveles.
- **Compras:** quitar anuncios, packs de inicio y cosméticos.
- **Técnica:** AdMob o AppLovin MAX con mediación, y consentimiento (UMP) para la UE y el Reino Unido. En Play hay que actualizar la seguridad de los datos (ID de publicidad), marcar «Contiene anuncios» y cambiar la política de privacidad. En CrazyGames los anuncios van por su SDK y solo se permiten a partir del Full Launch.

### Fase 4: iOS

Capacitor ya lo soporta. Hace falta compilar en un Mac (o en un servicio en la nube) y la cuenta de Apple Developer (99 USD al año).

### Fase 5: japonés, coreano, alemán y francés

Unos 150 textos. La traducción automática vale como punto de partida, pero conviene una revisión nativa. En japonés y coreano se usan fuentes del sistema para esos caracteres. El logo se queda como está.

### Fase 6: prueba de pago pequeña en países de primer nivel

Presupuesto pequeño, midiendo retención y ROAS a 7 días por país. Solo se escala si el valor por jugador supera lo que cuesta conseguirlo.

## Números de referencia

Son orientativos y cambian mucho según el juego, el formato y la época.

- eCPM de anuncios entre niveles en 2024 (MonetizeMore): EE. UU. entre 7,6 y 8,6 USD, Japón entre 9,5 y 10,8 USD y Brasil entre 2,2 y 3,7 USD por cada mil impresiones. Un jugador de EE. UU. o Japón vale varias veces lo que uno de un país emergente.
- Los anuncios con recompensa suelen pagar más que los de entre niveles, y los jugadores los aceptan mejor porque los eligen ellos.

## Lo que no haría

- Pagar publicidad antes de tener monetización y un D7 razonable.
- Traducir a diez idiomas antes de validar la retención en inglés.
- Tocar la prueba cerrada de Google Play: los 14 días y los 12 testers siguen siendo el paso para poder publicar.

## Decisiones pendientes

1. Nombre internacional (fase 0).
2. Si empezamos ya por las fases 0 y 1, que son baratas y no dependen de nada.
3. Más adelante: presupuesto de publicidad e iOS.
