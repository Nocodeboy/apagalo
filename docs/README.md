# Documentación

| Documento | De qué va |
|---|---|
| [concepto.md](concepto.md) | Ficha de concepto: fantasía, bucle, escenarios y los criterios para matar, iterar o seguir con el juego, decididos antes de probar |
| [diseno-v2.md](diseno-v2.md) | Diseño de la 2.0: los 6 escenarios nuevos con su mecánica, ruta mezclada de 120 niveles, power-ups, eventos, equipo, grandes incendios con portada, apoyo aéreo, «More games» y migración de partidas |
| [dificultad.md](dificultad.md) | Dificultad de cada nivel medida con el bot, como referencia para comparar después de tocar la simulación |
| [google-play.md](google-play.md) | App de Android: estado de la prueba, cómo compilar y subir una versión, clave de firma, textos de la ficha y respuestas de Play Console |
| [testers.md](testers.md) | Cómo conseguir los 12 testers de la prueba cerrada: montaje, calendario, problemas frecuentes, textos para redes y WhatsApp, y LaunchReady |
| [monetizacion.md](monetizacion.md) | Modelo de ingresos: anuncios, compras, economía, escenarios y umbrales (con `tools/revenue_model.py`), cumplimiento de Play y cuentas que crear |
| [android-monetizacion.md](android-monetizacion.md) | Paso a paso técnico de AdMob, consentimiento, productos de Play Billing, app-ads.txt y declaraciones de Play |
| [marketing.md](marketing.md) | Plan de marketing: mercados, canales orgánicos y de pago con 100-300 €/mes, creatividades, calendario y KPI |
| [ficha-tienda-en.md](ficha-tienda-en.md) | Ficha de Google Play en inglés (Put It Out! Firefighter) y descripción de CrazyGames |
| [contenido-redes.md](contenido-redes.md) | Calendario de 4 semanas de vídeos cortos y publicaciones |
| [estrategia.md](estrategia.md) | Hacia dónde ir: mercado internacional (países de primer nivel), profundidad híbrido-casual, monetización y compra de tráfico, por fases |
| [crazygames.md](crazygames.md) | CrazyGames: estado del envío, archivos, textos de la ficha, requisitos técnicos y cómo subir una versión |

Lo técnico (estructura del código, comandos, analítica, calidad gráfica) está en el [README principal](../README.md), y las herramientas en [tools/README.md](../tools/README.md).

Lo común a todos los juegos del estudio (proceso por fases, motor, cómo arrancar un juego nuevo, infraestructura y el resumen de lo aprendido aquí) está en el repositorio privado `Nocodeboy/nocodeboy-games`. Los documentos de esta carpeta siguen siendo la referencia completa de cada tema.

## Estado general (30 sept 2026)

La **1.3.0** trae el nombre internacional «Put It Out! Firefighter», monedas, mejoras y tienda, anuncios y compras en Android, y una campaña de 67 niveles. Está publicada en la web (29 sept); en Google Play y CrazyGames sigue la 1.2.0.

La **2.0.0** está en la rama `v2`, sin publicar. Responde a lo que dijo Germán de la 1.3.0 («casi siempre son los mismos escenarios y mecánicas»): diseño en [diseno-v2.md](diseno-v2.md).

- **Entrega 1 (hecha):** 3 escenarios nuevos con su mecánica (el puerto con el gasóleo que arde en el agua, el centro con gente en las ventanas y la estación con trenes que cortan la manguera), power-ups, eventos sorpresa, equipo (Lola, Chispa y el dron), un gran incendio cada 10 niveles con su portada de periódico y el álbum, apoyo aéreo con anuncio con recompensa, el juego en inglés salvo en dispositivos en español y la migración de las partidas de la 1.2.0 y la 1.3.0.
- **Entrega 2 (hecha):** los otros 3 escenarios (la estación de esquí con hielo, nieve profunda y bocas de riego heladas; el museo de noche con obras de arte que sacar y aspersores con palanca; el camping con helicóptero de guardia, hierba alta y tormenta seca), la ruta final de **120 niveles en 12 escenarios** con 12 grandes incendios (12 portadas), una rampa suave de propagación en la segunda mitad y la entrada «More games» (promoción cruzada con *Tray Runner*; en CrazyGames no sale). Dificultad en [dificultad.md](dificultad.md) («2.0, entrega 2»).
- Antes de publicarla: jugarla (sobre todo los escenarios nuevos), rehacer capturas y vídeo de las tiendas con los escenarios nuevos y dar la URL del juego del perro pastor cuando salga (`src/games.ts`). Los textos de las fichas ya están en [ficha-tienda-en.md](ficha-tienda-en.md), [google-play.md](google-play.md) y [crazygames.md](crazygames.md).

| Canal | Publicado | Siguiente paso |
|---|---|---|
| Web | 1.3.0 en https://apagalo.vercel.app (29 sept), sin anuncios, con analítica y la página `/testers` | Probarla y mirar en Supabase si los niveles nuevos suben la retención |
| Google Play | 1.2.0 en prueba cerrada (aprobada el 25 sept). Grupo de testers con 6 miembros contando contigo | Llegar a 12 testers y añadir el grupo de LaunchReady. Antes de subir la 1.3.0: cuenta de AdMob, productos y declaraciones (`android-monetizacion.md`) |
| CrazyGames | Borrador completo con la 1.2.0 (build, revisión de calidad y ficha) | Cambiar a «Put It Out! Firefighter» con la 1.3.0 y las portadas en inglés, repetir la revisión de calidad, rellenar el cobro (Tipalti) y enviar |
| GitHub | https://github.com/Nocodeboy/apagalo. El estudio está en `Nocodeboy/nocodeboy-games` (privado) | Subir cada cambio de *¡Apágalo!* (si Claude no puede subirlo, deja un `.bat` para hacerlo desde el portátil). Los otros juegos tienen su propio repositorio privado (`Nocodeboy/marchando`, `Nocodeboy/pastorealo`) |

Decisión pendiente (después de 7-14 días con jugadores): mirar las vistas `kpis` y `niveles` (juego `apagalo`) en Supabase y aplicar los criterios de `concepto.md`.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Código | https://github.com/Nocodeboy/apagalo. Copia de trabajo en el portátil: `Documentos\Nocodeboy Games\apagalo`, al lado de las de `nocodeboy-games`, `marchando` y `pastorealo` (una carpeta por repositorio, como en GitHub) |
| Archivos para publicar (zip, vídeos, `.aab`, imágenes) | `Documentos\Nocodeboy Games\publicacion\apagalo` en el portátil. Se pueden regenerar desde el código |
| Clave de firma de Android | `Documentos\Nocodeboy Games\NO-COMPARTIR\apagalo` en el portátil. Guarda una copia fuera del ordenador |
| Web | Vercel, proyecto `apagalo` |
| Analítica | Supabase, proyecto `nocodeboy-games` del estudio (tablas y vistas comunes con la columna `game`/`juego`). Las versiones instaladas hasta la 1.2.0 envían a los `apagalo_*` de Tools-NoCode, que lo reenvían allí |
| Google Play | Play Console, cuenta NoCodeBuilder |
| Testers | Grupo de Google `apagalo-testers` (https://groups.google.com/g/apagalo-testers) |
| CrazyGames | Portal de desarrolladores de CrazyGames, con tu cuenta |
