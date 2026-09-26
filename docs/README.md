# Documentación

| Documento | De qué va |
|---|---|
| [concepto.md](concepto.md) | Ficha de concepto: fantasía, bucle, escenarios y los criterios para matar, iterar o seguir con el juego, decididos antes de probar |
| [dificultad.md](dificultad.md) | Dificultad de cada nivel medida con el bot, como referencia para comparar después de tocar la simulación |
| [google-play.md](google-play.md) | App de Android: estado de la prueba, cómo compilar y subir una versión, clave de firma, textos de la ficha y respuestas de Play Console |
| [testers.md](testers.md) | Cómo conseguir los 12 testers de la prueba cerrada: montaje, calendario, problemas frecuentes, textos para redes y WhatsApp, y LaunchReady |
| [estrategia.md](estrategia.md) | Hacia dónde ir: mercado internacional (países de primer nivel), profundidad híbrido-casual, monetización y compra de tráfico, por fases |
| [crazygames.md](crazygames.md) | CrazyGames: estado del envío, archivos, textos de la ficha, requisitos técnicos y cómo subir una versión |

Lo técnico (estructura del código, comandos, analítica, calidad gráfica) está en el [README principal](../README.md), y las herramientas en [tools/README.md](../tools/README.md).

## Estado general (26 sept 2026)

| Canal | Estado | Siguiente paso |
|---|---|---|
| Web | Publicada en https://apagalo.vercel.app (1.2.0), con analítica y la página `/testers` | Mover tráfico y mirar los datos |
| Google Play | Prueba cerrada aprobada el 25 sept. Grupo de testers con 6 miembros contando contigo | Llegar a 12 testers, añadir el grupo de LaunchReady y aguantar 14 días. Luego pedir producción |
| CrazyGames | Borrador completo: build, revisión de calidad y ficha hechas | Rellenar los datos de cobro (Tipalti), aceptar términos y PEGI 12 y enviar |
| GitHub | Repositorio https://github.com/Nocodeboy/apagalo (26 sept) | Subir aquí cada cambio |

Decisión pendiente (después de 7-14 días con jugadores): mirar `apagalo_kpis` y `apagalo_niveles` en Supabase y aplicar los criterios de `concepto.md`.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Código | https://github.com/Nocodeboy/apagalo. Copia de trabajo en el portátil: `Documentos\Juego 4\apagalo` |
| Archivos para publicar (zip, vídeos, `.aab`, imágenes) | `Documentos\Juego 4\publicacion` en el portátil. Se pueden regenerar desde el código |
| Clave de firma de Android | `Documentos\Juego 4\NO-COMPARTIR` en el portátil. Guarda una copia fuera del ordenador |
| Web | Vercel, proyecto `apagalo` |
| Analítica | Supabase, proyecto Tools-NoCode (tablas y vistas `apagalo_*`) |
| Google Play | Play Console, cuenta NoCodeBuilder |
| Testers | Grupo de Google `apagalo-testers` (https://groups.google.com/g/apagalo-testers) |
| CrazyGames | Portal de desarrolladores de CrazyGames, con tu cuenta |
