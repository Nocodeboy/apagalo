# Documentación

| Documento | De qué va |
|---|---|
| [concepto.md](concepto.md) | Ficha de concepto: fantasía, bucle, escenarios y los criterios para matar, iterar o seguir con el juego, decididos antes de probar |
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

## Estado general (26 sept 2026)

| Canal | Estado | Siguiente paso |
|---|---|---|
| Web | Publicada en https://apagalo.vercel.app (1.2.0), con analítica y la página `/testers` | Mover tráfico y mirar los datos |
| Google Play | Prueba cerrada aprobada el 25 sept. Grupo de testers con 6 miembros contando contigo | Llegar a 12 testers, añadir el grupo de LaunchReady y aguantar 14 días. Luego pedir producción |
| CrazyGames | Borrador completo: build, revisión de calidad y ficha hechas | Rellenar los datos de cobro (Tipalti), aceptar términos y PEGI 12 y enviar |
| GitHub | Repositorio https://github.com/Nocodeboy/apagalo (26 sept). El estudio está en `Nocodeboy/nocodeboy-games` (privado) | Subir aquí cada cambio de *¡Apágalo!*. Los otros juegos tienen su propio repositorio privado (`Nocodeboy/marchando`, `Nocodeboy/pastorealo`) |

Decisión pendiente (después de 7-14 días con jugadores): mirar las vistas `kpis` y `niveles` (juego `apagalo`) en Supabase y aplicar los criterios de `concepto.md`.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Código | https://github.com/Nocodeboy/apagalo. Copia de trabajo en el portátil: `Documentos\Juego 4\apagalo` |
| Archivos para publicar (zip, vídeos, `.aab`, imágenes) | `Documentos\Juego 4\publicacion` en el portátil. Se pueden regenerar desde el código |
| Clave de firma de Android | `Documentos\Juego 4\NO-COMPARTIR` en el portátil. Guarda una copia fuera del ordenador |
| Web | Vercel, proyecto `apagalo` |
| Analítica | Supabase, proyecto `nocodeboy-games` del estudio (tablas y vistas comunes con la columna `game`/`juego`). Las versiones instaladas hasta la 1.3.0 envían a los `apagalo_*` de Tools-NoCode, que lo reenvían allí |
| Google Play | Play Console, cuenta NoCodeBuilder |
| Testers | Grupo de Google `apagalo-testers` (https://groups.google.com/g/apagalo-testers) |
| CrazyGames | Portal de desarrolladores de CrazyGames, con tu cuenta |
