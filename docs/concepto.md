# ¡Apágalo! — ficha de concepto

**Qué es:** un arcade casual en 3D low-poly con cámara cenital. Eres un bombero con la manguera atada al camión y tienes que apagar incendios que se propagan en tiempo real por escenarios muy distintos entre sí. Móvil y web.

**Referente:** *Pressure Wash Panic* (@chongdashu). Tomamos su bucle (moverse, apuntar, chorro de agua, presión de reloj) y **no** su estética ni su contenido. El suyo es limpiar una superficie estática; el nuestro es un sistema vivo que crece si no actúas. Aquí el agua salva cosas en vez de ensuciarlas.

## Fantasía del jugador
"Soy el héroe que llega a tiempo". Cada segundo cuenta, el fuego avanza con el viento y tú decides qué salvar primero.

## Bucle de 30 segundos
1. Localizas el frente que más amenaza (flecha de viento, alerta sobre animales, bombonas).
2. Te colocas con la manguera tirante y atacas la base del fuego con el chorro.
3. El fuego salta por las brasas y hay un foco nuevo. Cambias a abanico para aguantar el calor o a espuma si es combustible.
4. "¡Foco apagado!", combo, vapor y un respiro de 2 segundos antes del siguiente frente.

## Escenarios (uno nuevo por nivel, un concepto nuevo por nivel)
| # | Escenario | Hora / paleta | Concepto que enseña |
|---|---|---|---|
| 1 | Verbena en la plaza del pueblo | Mediodía de verano | Moverse, apuntar y echar agua |
| 2 | La granja de Doña Rosa | Tarde dorada | Rescatar animales; el abanico te protege del calor |
| 3 | La gasolinera | Mañana | El combustible no se apaga con agua: espuma. Enfriar bombonas |
| 4 | El polígono | Nublado | Electricidad: corta la luz antes de mojar |
| 5 | El Castañar | Otoño, viento | Cambios de viento, bocas de riego y reconectar la manguera |
| 6 | Noche de San Juan en la playa | Noche | Cohetes que caen: moja antes de que prendan |
| 7 | El puerto (2.0) | Atardecer naranja | Gasóleo que arde en el agua y el viento arrastra: solo la espuma lo para |
| 8 | El centro (2.0) | Día frío | Gente en las ventanas: quédate debajo para subir la plataforma |
| 9 | La estación de tren (2.0) | Mañana con bruma | Trenes con horario que tapan el agua y cortan la manguera |
| 10 | La estación de esquí (2.0) | Hora azul con nieve | Hielo que resbala, nieve honda y bocas de riego heladas |
| 11 | El museo (2.0) | Noche, interior | Sacar las obras de arte y encender los rociadores de cada sala |
| 12 | El camping (2.0) | Hora dorada | Hierba alta que arde deprisa y un helicóptero de guardia |
| ★ | Reto diario | Varía | El mismo para todos, numerado y con modificadores |

Desde la 2.0 los escenarios se mezclan en una ruta de 120 niveles con un gran incendio cada 10 (diseño en [diseno-v2.md](diseno-v2.md)).

## Gancho para compartir
- Resultado sin spoilers: `¡Apágalo! Reto #37 🚒 ⭐⭐⭐ 🟩🟩🟩🟩🟧 97% a salvo · 1:12`.
- Momentos de clip: explosión de bombona, la llamarada al echar agua al aceite, la noche de San Juan en llamas y el rescate de la oveja en el último segundo.

## Ritual diario
Reto diario con semilla por fecha: el mismo mapa, viento y focos para todo el mundo, más una racha con protección de un día.

## Criterios de muerte (escritos antes de probar)
Test web de 7–14 días en CrazyGames Basic Launch o con enlace propio:
- **Matar** si menos del 70 % sigue jugando al minuto 1, o si menos del 40 % termina el nivel 1.
- **Matar** si el tiempo medio de sesión es inferior a 4 minutos.
- **Iterar** si el D1 web está entre el 6 y el 10 %. **Seguir** (soft launch en Play) si el D1 es ≥ 10 % y la sesión media ≥ 8 minutos.
- **Matar** si en 5 pruebas en persona 3 o más personas no entienden qué hacer sin ayuda en 20 s.

## Stack elegido y por qué
- **Three.js + TypeScript, compilado con esbuild en una sola página.** La matriz dice "3D casual → Unity 6" y "web/instant → Phaser". Aquí vamos web primero y en 3D, y Unity web pesa decenas de MB y arranca lento en móvil, lo que mata la regla de jugar en menos de 10 s. Godot web en 3D va justo en móviles de gama baja. Three.js pesa unos 200 KB con gzip, arranca en menos de 2 s, se programa entero por código desde Linux y se empaqueta después para Play con Capacitor sin reescribir nada.
- **Simulación separada del render:** el incendio, el agua, el viento y las reglas viven en `src/sim` sin dependencias. El bot de dificultad juega exactamente al mismo juego en Node.
- **Arte:** todo el modelado es low-poly procedural (sin assets externos ni licencias), con paletas propias por escenario.
- **Sonido:** los efectos (agua, fuego, vapor, explosiones) se sintetizan en tiempo real con WebAudio. La música la pondremos con pistas generadas por IA o libres de derechos.
- **Analítica:** eventos estándar (`first_open`, `level_start/complete/fail`, `daily_*`, `share`) con un adaptador listo para PostHog o Supabase.
