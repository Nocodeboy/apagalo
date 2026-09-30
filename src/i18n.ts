import type { Lang, Txt } from './sim/types';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

const S = {
  gameName: { es: '¡Apágalo!', en: 'Put It Out!' },
  logo: { es: '¡APÁGALO!', en: 'PUT IT OUT!' },
  pageTitle: { es: '¡Apágalo! · Juego de bomberos', en: 'Put It Out! Firefighter' },
  play: { es: 'JUGAR', en: 'PLAY' },
  continue: { es: 'CONTINUAR', en: 'CONTINUE' },
  levels: { es: 'Niveles', en: 'Levels' },
  daily: { es: 'Reto diario', en: 'Daily challenge' },
  dailyDone: { es: 'Hecho hoy', en: 'Done today' },
  streak: { es: 'racha', en: 'streak' },
  settings: { es: 'Ajustes', en: 'Settings' },
  tagline: { es: 'Coge la manguera. Salva el pueblo.', en: 'Grab the hose. Save the town.' },
  go: { es: '¡VAMOS!', en: "LET'S GO!" },
  back: { es: 'Volver', en: 'Back' },
  level: { es: 'Nivel', en: 'Level' },
  locked: { es: 'Supera antes el nivel anterior', en: 'Beat the previous level first' },
  lockedShort: { es: 'bloqueado', en: 'locked' },
  starsN: { es: '{n} de 3 estrellas', en: '{n} of 3 stars' },
  levelsDone: { es: '{n}/{m} superados', en: '{n}/{m} cleared' },
  chapterAria: { es: 'Niveles {r}: {s} de {m} estrellas', en: 'Levels {r}: {s} of {m} stars' },
  // finale: the whole campaign is done
  campaignDone: { es: '¡CAMPAÑA COMPLETADA!', en: 'CAMPAIGN COMPLETE!' },
  campaignLine: { es: 'Has apagado los {n} incendios del pueblo', en: 'You put out all {n} fires in town' },
  campaignMore: { es: 'te faltan {n} para el 100%', en: '{n} more for 100%' },
  campaignPerfect: { es: '¡todas! Eres el mejor bombero del pueblo', en: 'every single one! Best firefighter in town' },
  shareCampaign: { es: '🏆 ¡Campaña completada! {n} niveles · ★ {s}/{m}', en: '🏆 Campaign complete! {n} levels · ★ {s}/{m}' },
  goal1: { es: 'Apaga todo el fuego', en: 'Put out every fire' },
  goal2: { es: 'Salva el {n}%', en: 'Save {n}%' },
  goal3: { es: 'Salva el {n}% y que no se escape nadie', en: 'Save {n}% and nobody flees' },
  goal3b: { es: 'Salva el {n}%', en: 'Save {n}%' },
  control: { es: 'EXTINCIÓN', en: 'CONTROL' },
  saved: { es: 'A salvo', en: 'Saved' },
  pause: { es: 'Pausa', en: 'Paused' },
  resume: { es: 'Seguir', en: 'Resume' },
  restart: { es: 'Reintentar', en: 'Retry' },
  next: { es: 'Siguiente', en: 'Next' },
  share: { es: 'Compartir', en: 'Share' },
  menu: { es: 'Menú', en: 'Menu' },
  win: { es: '¡FUEGO APAGADO!', en: 'FIRE OUT!' },
  loseTime: { es: '¡SE ACABÓ EL TIEMPO!', en: "TIME'S UP!" },
  loseControl: { es: '¡SE HA DESCONTROLADO!', en: 'OUT OF CONTROL!' },
  loseTip: { es: 'Ataca primero el frente que avanza con el viento.', en: 'Attack the front the wind is pushing first.' },
  statSaved: { es: 'Zona a salvo', en: 'Area saved' },
  statTime: { es: 'Tiempo', en: 'Time' },
  statRescued: { es: 'Vecinos a salvo', en: 'Safe & sound' },
  breeze: { es: 'Brisa', en: 'Breeze' },
  windy: { es: 'Viento', en: 'Windy' },
  strongWind: { es: 'Viento fuerte', en: 'Strong wind' },
  statCombo: { es: 'Combo máx.', en: 'Best combo' },
  statScore: { es: 'Puntos', en: 'Score' },
  best: { es: 'Récord', en: 'Best' },
  newBest: { es: '¡Nuevo récord!', en: 'New best!' },
  jet: { es: 'Chorro', en: 'Jet' },
  fog: { es: 'Abanico', en: 'Fog' },
  foam: { es: 'Espuma', en: 'Foam' },
  sound: { es: 'Efectos', en: 'Sound' },
  music: { es: 'Música', en: 'Music' },
  vibration: { es: 'Vibración', en: 'Vibration' },
  quality: { es: 'Calidad gráfica', en: 'Graphics' },
  high: { es: 'Alta', en: 'High' },
  low: { es: 'Ahorro', en: 'Battery saver' },
  gfx_auto: { es: 'Automática', en: 'Automatic' },
  gfx_high: { es: 'Alta', en: 'High' },
  gfx_medium: { es: 'Media', en: 'Medium' },
  gfx_low: { es: 'Ahorro', en: 'Battery saver' },
  newTag: { es: 'NUEVO', en: 'NEW' },
  unlocked: { es: '¡Nivel {n} desbloqueado!', en: 'Level {n} unlocked!' },
  bannerWin: { es: '¡APAGADO!', en: 'FIRE OUT!' },
  bannerTime: { es: '¡TIEMPO!', en: "TIME'S UP!" },
  bannerLost: { es: '¡DESCONTROLADO!', en: 'OUT OF CONTROL!' },
  starLost: { es: '−1 ★', en: '−1 ★' },
  goalsNow: { es: 'Así vas', en: 'Right now' },
  stats: { es: 'Estadísticas anónimas', en: 'Anonymous stats' },
  privacy: { es: 'Privacidad', en: 'Privacy' },
  adChoices: { es: 'Opciones de privacidad de los anuncios', en: 'Ad privacy options' },
  statsNote: { es: 'Cómo se juega, sin datos personales', en: 'How the game is played, no personal data' },
  dailyRank: { es: 'Mejor que el {p}% de los {n} jugadores de hoy', en: 'Better than {p}% of today’s {n} players' },
  dailyFirst: { es: '¡Eres de los primeros en jugar el reto de hoy!', en: 'You’re one of the first to play today’s challenge!' },
  language: { es: 'Idioma', en: 'Language' },
  reset: { es: 'Borrar progreso', en: 'Reset progress' },
  resetConfirm: { es: 'Pulsa otra vez para borrar', en: 'Tap again to confirm' },
  resetWarn: {
    es: 'Se borrarán las estrellas, los récords, las monedas (también las compradas) y las mejoras. Las compras como «Sin anuncios» se conservan.',
    en: 'Your stars, records, coins (bought ones too) and upgrades will be deleted. Purchases like “No ads” are kept.',
  },
  copied: { es: '¡Copiado! Pégalo donde quieras', en: 'Copied! Paste it anywhere' },
  tutMove: { es: 'Arrastra aquí para moverte', en: 'Drag here to move' },
  tutAim: { es: 'Arrastra aquí para apuntar y echar agua', en: 'Drag here to aim & spray' },
  tutDesk: { es: 'WASD para moverte · Ratón para apuntar · Clic para echar agua', en: 'WASD to move · Mouse to aim · Click to spray' },
  tutNozzle: { es: 'Cambia de boquilla aquí', en: 'Switch nozzle here' },
  // in-game toasts
  tClusterOut: { es: '¡Foco apagado!', en: 'Blaze out!' },
  tCombo: { es: '¡Combo x{n}!', en: 'Combo x{n}!' },
  tRescue: { es: '¡Rescatado!', en: 'Rescued!' },
  tFled: { es: '¡Se ha escapado!', en: 'It ran off!' },
  tSoak: { es: '¡Oiga, que me mojo!', en: "Hey, I'm soaked!" },
  tSoakAnimal: { es: '¡Miau!', en: 'Meow!' },
  tShort: { es: '¡Calambre! Corta la luz primero', en: 'Zap! Cut the power first' },
  tFlare: { es: '¡Llamarada! El agua no sirve con combustible: usa ESPUMA', en: 'Flare-up! Water spreads fuel fires: use FOAM' },
  tFlareNoFoam: { es: '¡Llamarada! No eches agua al combustible', en: "Flare-up! Don't spray water on fuel" },
  tExplode: { es: '¡BUUUM! Enfría las bombonas antes', en: 'KABOOM! Cool the gas bottles next time' },
  tCylinder: { es: '¡La bombona se calienta! Échale agua', en: 'Gas bottle heating up! Cool it down' },
  tPowerOff: { es: 'Luz cortada. ¡Ya puedes mojar!', en: 'Power off. Spray away!' },
  tConnect: { es: 'Manguera enganchada', en: 'Hose connected' },
  tHose: { es: 'Manguera al límite. Busca una boca de riego', en: 'Hose at full length. Find a hydrant' },
  tOverheat: { es: '¡Quema! Usa el abanico para protegerte', en: 'Too hot! Use fog to shield yourself' },
  tWindWarn: { es: '¡Cambia el viento!', en: 'Wind is shifting!' },
  tRocket: { es: '¡Cohete! Moja la zona marcada', en: 'Rocket! Wet the marked spot' },
  tFizzle: { es: '¡Cohete apagado!', en: 'Rocket fizzled!' },
  tFoamEmpty: { es: 'Sin espuma', en: 'Out of foam' },
  tLever: { es: '¡Baja la palanca!', en: 'Pull the lever!' },
  rockets: { es: 'cohetes', en: 'rockets' },
  dailyTitle: { es: 'Reto diario #{n}', en: 'Daily #{n}' },
  dailyAgain: { es: 'Vuelve mañana para el #{n}', en: 'Come back tomorrow for #{n}' },
  dailyPlayed: { es: 'Ya jugado hoy: {s} pts. Puedes mejorar tu récord.', en: 'Played today: {s} pts. You can beat it.' },
  loading: { es: 'Preparando el reto…', en: 'Preparing the challenge…' },
  credits: { es: 'Hecho por @nocodeboy', en: 'Made by @nocodeboy' },
  privacyNote: { es: 'Guardamos estadísticas anónimas (desactívalas en Ajustes).', en: 'We collect anonymous stats (turn them off in Settings).' },
  privacyPolicy: { es: 'Política de privacidad', en: 'Privacy policy' },
  // coins, shop and upgrades
  shop: { es: 'Tienda', en: 'Shop' },
  coins: { es: 'Monedas', en: 'Coins' },
  coinsN: { es: '{n} monedas', en: '{n} coins' },
  double: { es: 'x2', en: 'x2' },
  /** small label on the rewarded buttons: the player sees it is an ad before tapping */
  adWord: { es: 'Anuncio', en: 'Ad' },
  doubleAria: { es: 'Mira un anuncio y duplica las monedas', en: 'Watch an ad to double your coins' },
  upgrades: { es: 'Mejoras', en: 'Upgrades' },
  up_hose: { es: 'Manguera larga', en: 'Longer hose' },
  up_hose_d: { es: 'Llega más lejos del camión', en: 'Reach farther from the truck' },
  up_power: { es: 'Más presión', en: 'Water pressure' },
  up_power_d: { es: 'Chorro más fuerte y de más alcance', en: 'A stronger jet that reaches farther' },
  up_speed: { es: 'Botas ligeras', en: 'Light boots' },
  up_speed_d: { es: 'Corres más rápido', en: 'Run faster' },
  up_time: { es: 'Más tiempo', en: 'Extra time' },
  up_time_d: { es: 'Más segundos en cada nivel', en: 'More seconds on every level' },
  upMax: { es: 'MÁX.', en: 'MAX' },
  upBuy: { es: 'Mejorar {name} por {n} monedas', en: 'Upgrade {name} for {n} coins' },
  upgraded: { es: '¡Mejorado!', en: 'Upgraded!' },
  notEnough: { es: 'Te faltan monedas', en: 'Not enough coins' },
  noUpgradesNote: { es: 'En el reto diario no cuentan las mejoras: es igual para todos.', en: 'Upgrades are off in the daily challenge, so it’s fair for everyone.' },
  freeCoins: { es: 'Monedas gratis', en: 'Free coins' },
  freeCoinsD: { es: '+{n} por anuncio · Quedan {left} hoy', en: '+{n} per ad · {left} left today' },
  freeTomorrow: { es: 'Vuelve mañana a por más', en: 'Come back tomorrow for more' },
  watch: { es: 'Ver', en: 'Watch' },
  watchAria: { es: 'Mira un anuncio y consigue {n} monedas', en: 'Watch an ad for {n} coins' },
  purchases: { es: 'Compras', en: 'Store' },
  p_remove_ads: { es: 'Sin anuncios', en: 'No ads' },
  p_remove_ads_d: { es: 'Quita los anuncios entre niveles y suma {n} monedas. Los de premio siguen siendo opcionales', en: 'Removes the ads between levels, plus {n} coins. Reward ads stay optional' },
  p_starter_pack: { es: 'Pack de inicio', en: 'Starter pack' },
  p_starter_pack_d: { es: '{n} monedas para empezar. Solo una vez', en: '{n} coins to get started. One time only' },
  p_coins_s: { es: 'Bolsa de monedas', en: 'Bag of coins' },
  p_coins_m: { es: 'Cofre de monedas', en: 'Chest of coins' },
  p_coins_l: { es: 'Camión de monedas', en: 'Truckload of coins' },
  restore: { es: 'Restaurar compras', en: 'Restore purchases' },
  restored: { es: 'Compras restauradas', en: 'Purchases restored' },
  restoreNone: { es: 'No hay compras que restaurar', en: 'Nothing to restore' },
  buyOk: { es: '¡Gracias! Ya es tuyo', en: 'Thanks! It’s all yours' },
  buyFail: { es: 'La compra no se ha completado', en: 'The purchase didn’t go through' },
  buyPending: { es: 'Pago pendiente: recibirás la compra en cuanto se confirme', en: 'Payment pending: you’ll get it as soon as it’s confirmed' },
  buyDelivered: { es: '¡Compra recibida! +{n} monedas', en: 'Purchase delivered! +{n} coins' },
  adFail: { es: 'El anuncio no se ha completado. Prueba más tarde', en: 'The ad didn’t finish. Try again later' },
  // rewarded continue and one-time offer
  contTip: { es: 'Aún queda fuego. ¿Quieres {n} segundos más?', en: 'The fire is still burning. Want {n} more seconds?' },
  contYes: { es: '+{n} s', en: '+{n} s' },
  contAd: { es: 'anuncio', en: 'ad' },
  contYesAria: { es: 'Mira un anuncio y consigue {n} segundos más', en: 'Watch an ad for {n} more seconds' },
  contNo: { es: 'No, gracias', en: 'No thanks' },
  contGo: { es: '¡+{n} s! A por ello', en: '+{n} s! Go, go, go!' },
  offerTitle: { es: 'Oferta de bienvenida', en: 'Welcome offer' },
  offerNo: { es: 'Ahora no', en: 'Not now' },
  // ---- v2: route, places, power-ups, events, crew, big fires and front pages ----
  chapter: { es: 'Capítulo {n}', en: 'Chapter {n}' },
  chapterAria2: { es: 'Capítulo {n}: niveles {r}', en: 'Chapter {n}: levels {r}' },
  prevPage: { es: 'Capítulo anterior', en: 'Previous chapter' },
  nextPage: { es: 'Capítulo siguiente', en: 'Next chapter' },
  bigFire: { es: 'GRAN INCENDIO', en: 'BIG FIRE' },
  bigFireTag: { es: 'Gran incendio', en: 'Big fire' },
  newPlace: { es: 'SITIO NUEVO', en: 'NEW PLACE' },
  newThing: { es: 'Nuevo', en: 'New' },
  newCrew: { es: 'Ya puedes contratar equipo en la tienda', en: 'You can hire a crew in the shop now' },
  newCrew2: { es: 'Ahora caben 2 del equipo', en: 'Now 2 crew members fit' },
  bigNews: { es: 'Gana y saldrás en portada', en: 'Win it and make the front page' },
  album: { es: 'Portadas', en: 'Front pages' },
  albumCount: { es: '{n} de {m} portadas', en: '{n} of {m} front pages' },
  albumLocked: { es: 'Nivel {n}', en: 'Level {n}' },
  albumHint: { es: 'Gana los grandes incendios para salir en el periódico', en: 'Win the big fires to make the paper' },
  frontPage: { es: 'Ver la portada', en: 'See the front page' },
  frontPageNew: { es: '¡SALES EN PORTADA!', en: 'FRONT PAGE NEWS!' },
  newspaper: { es: 'EL DIARIO DEL FUEGO', en: 'THE DAILY BLAZE' },
  paperPrice: { es: 'Edición especial · 1 moneda', en: 'Special edition · 1 coin' },
  paperCaption: { es: 'El bombero, en plena faena', en: 'Our firefighter at work' },
  paperSaved: { es: 'a salvo', en: 'saved' },
  paperTime: { es: 'tiempo', en: 'time' },
  paperScore: { es: 'puntos', en: 'score' },
  paperFoot: { es: 'Juega gratis', en: 'Play free' },
  paperShare: { es: 'Compartir', en: 'Share' },
  paperSaved2: { es: 'Portada guardada', en: 'Front page saved' },
  paperShareText: { es: '¡Salgo en portada! 🗞️ {h}', en: 'I made the front page! 🗞️ {h}' },
  crew: { es: 'Equipo', en: 'Crew' },
  crewSlots: { es: 'Equipo · {n} de {m}', en: 'Crew · {n} of {m}' },
  crewHint: { es: 'Toca para llevarlo o dejarlo', en: 'Tap to take or leave' },
  crewNone: { es: 'Contrata equipo en la tienda', en: 'Hire a crew in the shop' },
  crewFrom: { es: 'Desde el nivel {n}', en: 'From level {n}' },
  crewHire: { es: 'Contratar', en: 'Hire' },
  crewLvl: { es: 'Nivel {n}', en: 'Level {n}' },
  crewBuy: { es: 'Contratar o mejorar a {name} por {n} monedas', en: 'Hire or improve {name} for {n} coins' },
  crewHired: { es: '¡Se une al equipo!', en: 'Joined the crew!' },
  crewNoDaily: { es: 'En el reto diario no va el equipo', en: 'No crew in the daily challenge' },
  heli: { es: 'Helicóptero', en: 'Helicopter' },
  heliOnWay: { es: '¡Helicóptero en camino!', en: 'Helicopter on its way!' },
  heliReady: { es: 'Helicóptero listo: pulsa el botón y apunta', en: 'Helicopter ready: tap the button and aim' },
  // 2.2: the portable extinguisher
  extTool: { es: 'Extintor', en: 'Extinguisher' },
  tExtGot: { es: 'Extintor guardado: úsalo con su botón o la tecla F', en: 'Extinguisher stored: use it with its button or the F key' },
  tExtGotT: { es: 'Extintor guardado: úsalo con su botón', en: 'Extinguisher stored: use it with its button' },
  tHoseDrop: { es: 'Manguera en el suelo: apaga con polvo y vuelve a por ella', en: 'Hose on the ground: put flames out with powder, then go back for it' },
  tExtEmpty: { es: '¡Extintor vacío! Vuelve a por tu manguera', en: 'Extinguisher empty! Go back for your hose' },
  tNeedHose: { es: 'Sin manguera: recógela en el círculo', en: 'No hose: pick it up at the circle' },
  // 2.2: the Pulaski
  digTool: { es: 'Pulaski', en: 'Pulaski' },
  digNews: { es: 'Pulaski: cava cortafuegos', en: 'Pulaski: dig firebreaks' },
  tDigHelp: {
    es: 'Nuevo: Pulaski. Mantén su botón (o G) para cavar cortafuegos: el fuego no cruza la tierra desnuda',
    en: "New: the Pulaski. Hold its button (or G) to dig firebreaks: fire can't cross bare earth",
  },
  tDigHelpT: { es: 'Nuevo: Pulaski. Mantén su botón y camina para cavar un cortafuegos: el fuego no cruza la tierra desnuda', en: "New: the Pulaski. Hold its button and walk to dig a firebreak: fire can't cross bare earth" },
  airSupport: { es: 'Apoyo aéreo', en: 'Air support' },
  airSupportD: { es: 'Reintenta con un helicóptero', en: 'Retry with a helicopter' },
  airSupportAria: { es: 'Mira un anuncio y reintenta con un helicóptero listo', en: 'Watch an ad and retry with a helicopter ready' },
  airReady: { es: 'Apoyo aéreo listo: pulsa el helicóptero cuando lo necesites', en: 'Air support ready: tap the helicopter when you need it' },
  tHoseCut: { es: '¡El tren ha cortado la manguera! Vuelve al camión o a una boca de riego', en: 'A train cut your hose! Hook up to the truck or a hydrant' },
  tHoseFixed: { es: 'Manguera empalmada', en: 'Hose spliced' },
  tTrain: { es: '¡Viene un tren! Sal de la vía', en: 'Train coming! Get off the tracks' },
  tTrainHit: { es: '¡Cuidado con el tren!', en: 'Mind the train!' },
  tPump: { es: 'Bomba del muelle: la espuma se rellena', en: 'Sea pump: your foam refills' },
  tWindowSafe: { es: '¡A salvo!', en: 'Safe!' },
  tWindowFled: { es: '¡Ha salido por la azotea!', en: 'Out over the roof!' },
  tDog: { es: '¡Chispa al rescate!', en: 'Sparky to the rescue!' },
  tLeakFixed: { es: '¡Fuga cerrada!', en: 'Leak closed!' },
  tNewPower: { es: 'Nuevo: {name}. {desc}', en: 'New: {name}. {desc}' },
  tPowerGot: { es: '¡{name}!', en: '{name}!' },
  tEventSoon: { es: 'En 3 s', en: 'In 3 s' },
  whatsNewTitle: { es: 'Novedades de la 2.0', en: "What's new in 2.0" },
  whatsNew1: { es: '6 sitios nuevos, cada uno con su reto: el puerto, el centro, la estación de tren, la de esquí, el museo y el camping', en: '6 new places, each with its own twist: the docks, downtown, the rail yard, the ski lodge, the museum and the campground' },
  whatsNew2: { es: 'Objetos en el suelo, sorpresas a mitad de nivel y equipo que contratas', en: 'Pick-ups on the ground, mid-level surprises and a crew to hire' },
  whatsNew3: { es: 'Un gran incendio cada 10 niveles: gánalo y sales en portada', en: 'A big fire every 10 levels: win it and make the front page' },
  whatsNew4: { es: 'Tus estrellas siguen ahí, y los niveles nuevos que han quedado detrás ya están abiertos', en: 'Your stars are safe, and new levels behind you are already open' },
  gotIt: { es: '¡Vamos!', en: "Let's go!" },
  // ---- v2, entrega 2: the ski lodge, the museum and the campground ----
  tIce: { es: '¡Hielo! Resbalas: suelta antes de llegar', en: 'Ice! You slide: let go before you get there' },
  tFrozen: { es: 'Boca de riego helada: quédate encima para romper el hielo', en: 'Frozen hydrant: stay on it to chip the ice off' },
  tDeepSnow: { es: 'La nieve honda te frena: ve por los caminos', en: 'Deep snow slows you down: stick to the paths' },
  tArtPick: { es: '¡Cogida! Sácala por una puerta verde (cargado no puedes echar agua)', en: 'Got it! Carry it out of a green door (no spraying while you carry)' },
  tArtSafe: { es: '¡Obra a salvo!', en: 'Art saved!' },
  tArtLost: { es: '¡Se ha quemado una obra!', en: 'A work of art burned!' },
  tHandsFull: { es: 'Tienes las manos ocupadas: llévala antes a una puerta verde', en: 'Hands full: take it to a green door first' },
  tSprinkler: { es: 'Rociadores encendidos: el fuego deja de avanzar en esta sala', en: 'Sprinklers on: the fire stops spreading in this room' },
  tSprinklerLabel: { es: '¡Rociadores!', en: 'Sprinklers!' },
  tHeliBack: { es: 'El helicóptero vuelve a estar listo', en: 'Helicopter ready again' },
  tLightning: { es: '¡Rayo! Moja la zona marcada', en: 'Lightning! Wet the marked spot' },
  tBoltFizzle: { es: '¡El rayo no prende!', en: 'Strike fizzled!' },
  goal3art: { es: 'Salva el {n}% y que no se queme ninguna obra', en: 'Save {n}% and lose no work of art' },
  // More games (cross-promotion, not on CrazyGames)
  moreGames: { es: 'Más juegos', en: 'More games' },
  moreGamesTitle: { es: 'Más juegos de Nocodeboy', en: 'More games by Nocodeboy' },
  moreGamesSoon: { es: 'Muy pronto', en: 'Coming soon' },
  moreGamesPlay: { es: 'Jugar', en: 'Play' },
} satisfies Record<string, Txt>;

export type Key = keyof typeof S;

/** Order of the language button in Settings, each in its own language. */
export const LANGS: readonly Lang[] = ['en', 'es', 'pt', 'fr', 'de', 'it'];
export const LANG_NAME: Record<Lang, string> = { en: 'English', es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch', it: 'Italiano' };
/** Locale for dates (Brazilian Portuguese: Brazil is by far the largest Portuguese-speaking audience). */
export const LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-ES', pt: 'pt-BR', fr: 'fr-FR', de: 'de-DE', it: 'it-IT' };

/**
 * Portuguese, French, German and Italian: dictionaries from the English text to the translation (`src/locales/`).
 * Any text missing from them falls back to English.
 */
const DICT: Partial<Record<Lang, Record<string, string>>> = { pt, fr, de, it };

let lang: Lang = 'en';
export function setLang(l: Lang) {
  lang = LANGS.includes(l) ? l : 'en';
  document.documentElement.lang = lang;
}
export function getLang(): Lang {
  return lang;
}
/**
 * English first (the studio's main language). Spanish when the device's language is Spanish, or one of the other
 * languages of Spain (Catalan, Galician, Basque), whose speakers all read Spanish; Portuguese, French, German and
 * Italian when the device is in one of them.
 */
export function detectLang(): Lang {
  const langs = (navigator.languages?.length ? navigator.languages : [navigator.language || 'en']).map((l) => (l || '').toLowerCase());
  const first = langs[0] ?? 'en';
  if (first.startsWith('es') || first.startsWith('ca') || first.startsWith('gl') || first.startsWith('eu')) return 'es';
  for (const l of ['pt', 'fr', 'de', 'it'] as const) if (first.startsWith(l)) return l;
  return 'en';
}
/** Whole numbers in the player's language (1,370 / 1.370). */
export function num(n: number): string {
  return n.toLocaleString(LOCALE[lang]);
}

/** Dictionary entries with {placeholders}, as patterns for texts built in code (e.g. "Daily #12"). */
const patterns = new Map<Lang, { re: RegExp; vars: string[]; to: string; weight: number }[]>();
const memo = new Map<string, string>();
function fromPattern(d: Record<string, string>, en: string): string | null {
  let list = patterns.get(lang);
  if (!list) {
    list = [];
    for (const [k, to] of Object.entries(d)) {
      const vars = [...k.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      const fixed = k.replace(/\{\w+\}/g, '');
      if (!vars.length || fixed.trim().length < 2) continue;
      const re = new RegExp('^' + k.split(/\{\w+\}/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.+?)') + '$');
      list.push({ re, vars, to, weight: fixed.length });
    }
    list.sort((a, b) => b.weight - a.weight);
    patterns.set(lang, list);
  }
  for (const p of list) {
    const m = p.re.exec(en);
    if (!m) continue;
    let s = p.to;
    p.vars.forEach((v, i) => (s = s.replace(`{${v}}`, d[m[i + 1]] ?? m[i + 1])));
    return s;
  }
  return null;
}
/** An English text in the current language (itself when there is no translation). */
function fromEn(en: string): string {
  const d = DICT[lang];
  if (!d) return en;
  const hit = d[en];
  if (hit !== undefined) return hit;
  const key = lang + '\u0000' + en;
  let s = memo.get(key);
  if (s === undefined) {
    s = fromPattern(d, en) ?? en;
    memo.set(key, s);
  }
  return s;
}
export function t(k: Key, vars?: Record<string, string | number>): string {
  let s = lang === 'es' || lang === 'en' ? S[k][lang] : fromEn(S[k].en);
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b));
  return s;
}
export function tx(x: Txt): string {
  return lang === 'es' || lang === 'en' ? x[lang] : fromEn(x.en);
}
