# Idiomas

Desde la 2.1.0 el juego está en seis idiomas: inglés, español, portugués (de Brasil), francés, alemán e italiano.

## Cómo elige el idioma

- **La primera vez:** por el idioma del navegador o del móvil (`detectLang` en `src/i18n.ts`). Español también para catalán, gallego y euskera. Cualquier idioma que no sea uno de los seis va en inglés.
- **Después:** el jugador lo cambia en Ajustes. El botón recorre los seis idiomas, cada uno escrito en su propio idioma, y la elección se guarda.
- **Formatos:** fechas (portadas de periódico) y números en el formato de cada idioma (`LOCALE` y `num()`).

## Cómo está hecho

- **Textos originales:** siguen escritos en español e inglés, en objetos `{ es, en }`: `S` en `src/i18n.ts`, los niveles de `src/sim/campaign/`, el contenido y los retos diarios.
- **Los otros cuatro idiomas:** diccionarios en `src/locales/{pt,fr,de,it}.json`, cuya clave es el texto en inglés. `t()` y `tx()` los consultan.
- **Si falta una traducción:** sale el inglés, así que un texto nuevo nunca rompe el juego. Eso sí, hay que traducirlo antes de publicar.
- **Textos que el código compone:** por ejemplo «Daily #12». Se traducen con las entradas del diccionario que llevan `{variables}`, que funcionan como plantillas.
- **Palabras largas en nombres:** los nombres de niveles, lugares, mejoras y equipo llevan guiones invisibles (U+00AD) en las palabras de 11 letras o más, sobre todo las compuestas alemanas («Bewässerungs-graben»). Así se parten bien en las fichas de nivel; en canvas no se ven.
- **Teclado:** se lee la tecla por su posición (`e.code`), así que en un teclado francés (AZERTY) se juega con ZQSD y las boquillas con A/E. El texto francés de los controles ya dice ZQSD.

## Añadir o cambiar un texto

1. Escríbelo en español e inglés, como siempre.
2. Añade su traducción a los cuatro `src/locales/*.json`, con el inglés exacto como clave. Conserva las `{variables}`, las mayúsculas si el inglés va en mayúsculas (los titulares de periódico) y una longitud parecida.
   - Los botones y etiquetas cortas no deberían pasar del 130 % del inglés. El alemán y el francés son los que más se alargan.
3. Si cambias un texto en inglés, cambia también su clave en los cuatro diccionarios. Si no, ese texto sale en inglés.
4. Revisa las pantallas en alemán y francés en un móvil estrecho (390 px), que es donde antes se corta algo.

La traducción de la 2.1.0 se hizo extrayendo todos los pares `{ es, en }` con el AST de TypeScript, 553 textos, y traduciendo cada idioma con las mismas reglas.

**Glosario elegido:**

| Idioma | Chorro / Niebla / Espuma | Gran incendio |
|---|---|---|
| Portugués | Jato / Neblina / Espuma | Megaincêndio |
| Francés | Jet / Brume / Mousse | Grand incendie |
| Alemán | Strahl / Nebel / Schaum | Großbrand |
| Italiano | Getto / Ventaglio / Schiuma | Mega incendio |

«The Daily Blaze», Lola y Sparky no se traducen.
