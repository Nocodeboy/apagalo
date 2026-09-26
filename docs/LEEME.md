# ¡Apágalo! v1.2 — listo para probar con jugadores reales

## Enlaces

- **Juego público:** https://apagalo.vercel.app (móvil y PC, sin descargas)
- **Privacidad:** https://apagalo.vercel.app/privacidad
- **Versión en Claude:** el artefacto «¡Apágalo!» de tu galería (sin analítica)
- **Google Play (prueba interna):** https://play.google.com/apps/internaltest/4701507287428617045

## Qué hay en esta carpeta

| Carpeta | Contenido |
|---|---|
| `promo/` | `apagalo-promo-x.mp4`: vídeo vertical de 17 s para X/TikTok/Reels, con la música del juego. `og.png`: la imagen que sale al compartir el enlace |
| `crazygames/` | Todo para subirlo a CrazyGames: el zip del juego, 3 portadas, 2 vídeos de vista previa y `FICHA-CRAZYGAMES.md` con los textos y los pasos |
| `google-play/` | La app de Android: `apagalo-1.2.0.aab` (lo que se sube a Play), `apagalo-1.2.0.apk` (para instalar a mano), icono, gráfico destacado, 6 capturas y `FICHA-GOOGLE-PLAY.md` con el estado. En `NO-COMPARTIR` está la clave de firma: guárdala en un sitio seguro |
| `web/` | La web tal y como está publicada en Vercel |
| `codigo-fuente.zip` | El proyecto completo (código, herramientas, documentación, música e imágenes). Instrucciones dentro, en `README.md` |

## Textos para publicar en X

**Opción A (directa):**
> He hecho un juego de bomberos que se juega en el navegador 🚒🔥
> El fuego se extiende con el viento en tiempo real y tienes que apagarlo antes de que arrase el pueblo.
> 6 escenarios + reto diario. Gratis, sin descargas:
> apagalo.vercel.app

**Opción B (reto):**
> ¿Cuánto tardas en apagar el pueblo? 🔥
> Hoy hay reto diario nuevo y el mismo para todo el mundo. Deja tu resultado en respuestas 👇
> apagalo.vercel.app

Sube el vídeo como archivo nativo (no un enlace a YouTube): X lo reproduce solo en el feed. Sobre el enlace hay un equilibrio: X suele dar menos alcance a los tuits con enlaces externos, así que ponerlo en la primera respuesta ayuda al alcance, y ponerlo en el tuit ayuda a que la gente entre a jugar. Para este test importa más lo segundo.

## Cómo ver los resultados

En Supabase (proyecto Tools-NoCode) → SQL editor:

```sql
select * from apagalo_kpis;      -- jugadores, % que sigue al minuto 1, % que completa el nivel 1, sesión media, D1
select * from apagalo_niveles;   -- por nivel: cuántos empiezan, ganan y pierden
select * from apagalo_cohortes;  -- nuevos por día con D1 y D7
```

Criterios decididos antes de probar (`docs/concepto.md` en el código):

- **Matar** si menos del 70 % sigue jugando al minuto 1, si menos del 40 % termina el nivel 1 o si la sesión media baja de 4 minutos.
- **Iterar** si el D1 está entre el 6 y el 10 %.
- **Seguir** (prueba cerrada en Google Play) si el D1 es ≥ 10 % y la sesión media ≥ 8 minutos.

Con menos de ~100 jugadores los porcentajes bailan mucho: espera a tener volumen antes de decidir.
