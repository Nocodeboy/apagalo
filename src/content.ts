// Names and texts of the v2 content (power-ups, events, crew, places), in English and Spanish.
// Level names and tips live with each level (src/sim/campaign/*.ts); UI strings in src/i18n.ts.
import type { CrewId, EventKind, PowerKind, ThemeId, Txt } from './sim/types';

export const POWER_INFO: Record<PowerKind, { name: Txt; desc: Txt }> = {
  turbo: { name: { es: 'Bomba turbo', en: 'Turbo pump' }, desc: { es: '12 s de chorro más fuerte y más largo', en: '12 s of a stronger, longer jet' } },
  boots: { name: { es: 'Botas de carrera', en: 'Sprint boots' }, desc: { es: '10 s corriendo más rápido', en: 'Run faster for 10 s' } },
  clock: { name: { es: 'Cronómetro', en: 'Stopwatch' }, desc: { es: '+20 s en el reloj', en: '+20 s on the clock' } },
  extinguisher: { name: { es: 'Extintor', en: 'Extinguisher' }, desc: { es: 'Te lo guardas: al usarlo sueltas la manguera y apagas con polvo, también combustible', en: 'Kept for later: use it to drop the hose and put flames out with powder, fuel fires too' } },
  heli: { name: { es: 'Helicóptero', en: 'Helicopter' }, desc: { es: 'Pulsa el botón del helicóptero y soltará agua donde apuntes', en: 'Tap the helicopter button and it drops water where you aim' } },
  suit: { name: { es: 'Traje ignífugo', en: 'Fire suit' }, desc: { es: '15 s sin que el calor te frene', en: '15 s immune to the heat' } },
};

export const EVENT_INFO: Record<EventKind, { name: Txt; tip: Txt }> = {
  neighbors: { name: { es: '¡Vecinos con cubos!', en: 'Bucket brigade!' }, tip: { es: 'Tres vecinos echan cubos al fuego más cercano', en: 'Three neighbours throw buckets at the nearest fire' } },
  rain: { name: { es: '¡Chaparrón!', en: 'Rain shower!' }, tip: { es: 'Todo se moja y el fuego crece menos', en: 'Everything gets wet and the fire slows down' } },
  gust: { name: { es: '¡Racha de viento!', en: 'Wind gust!' }, tip: { es: 'Viento fuerte desde otro lado: corta el frente nuevo', en: 'Strong wind from a new side: cut off the new front' } },
  pressure: { name: { es: '¡Baja la presión!', en: 'Pressure drop!' }, tip: { es: 'El chorro va a la mitad un rato: acércate', en: 'Your jet is at half strength for a while: get closer' } },
  leak: { name: { es: '¡Fuga de gas!', en: 'Gas leak!' }, tip: { es: 'Échale agua a la tubería amarilla antes de que explote', en: 'Spray the yellow pipe before it blows' } },
  onlookers: { name: { es: '¡Curiosos!', en: 'Onlookers!' }, tip: { es: 'Se acercan al fuego: ve a por ellos y no los mojes', en: 'They are walking up to the fire: go get them, and don’t soak them' } },
  blackout: { name: { es: '¡Apagón!', en: 'Blackout!' }, tip: { es: 'Sin luces ni minimapa: solo ves lo que tienes cerca', en: 'No lights, no minimap: you only see what’s near you' } },
};

export const CREW_INFO: Record<CrewId, { name: Txt; desc: Txt; step: Txt }> = {
  partner: {
    name: { es: 'Lola, la compañera', en: 'Lola, your partner' },
    desc: { es: 'Bombera con su propia manguera: ataca el fuego que más amenaza', en: 'A firefighter with her own hose: she hits the fire that threatens most' },
    step: { es: 'Más fuerza de agua', en: 'Stronger water' },
  },
  dog: {
    name: { es: 'Chispa, perro de rescate', en: 'Sparky, rescue dog' },
    desc: { es: 'Corre a por los animales y vecinos en peligro y los saca', en: 'Runs to animals and people in danger and gets them out' },
    step: { es: 'Corre más', en: 'Runs faster' },
  },
  drone: {
    name: { es: 'El dron', en: 'The drone' },
    desc: { es: 'Moja cada pocos segundos el punto a punto de arder más cercano a ti', en: 'Every few seconds it soaks the spot closest to catching fire near you' },
    step: { es: 'Más a menudo', en: 'More often' },
  },
};

/** What each place is about, shown when it opens. */
export const PLACE_INFO: Record<ThemeId, { name: Txt; tip: Txt }> = {
  plaza: { name: { es: 'La plaza', en: 'The village square' }, tip: { es: 'Apunta a la base de las llamas', en: 'Aim at the base of the flames' } },
  granja: { name: { es: 'La granja', en: 'The farm' }, tip: { es: 'Rescata a los animales', en: 'Rescue the animals' } },
  gasolinera: { name: { es: 'La gasolinera', en: 'The gas station' }, tip: { es: 'Espuma para el combustible', en: 'Foam for the fuel' } },
  poligono: { name: { es: 'El polígono', en: 'The industrial park' }, tip: { es: 'Corta la luz antes de mojar', en: 'Cut the power before you spray' } },
  castanar: { name: { es: 'El Castañar', en: 'The chestnut forest' }, tip: { es: 'Bocas de riego y viento que cambia', en: 'Hydrants and shifting wind' } },
  sanjuan: { name: { es: 'La playa', en: 'The beach' }, tip: { es: 'Cohetes que caen', en: 'Falling rockets' } },
  puerto: { name: { es: 'El puerto', en: 'The docks' }, tip: { es: 'Gasóleo ardiendo que el viento lleva por el agua', en: 'Burning fuel the wind drives across the water' } },
  ciudad: { name: { es: 'El centro', en: 'Downtown' }, tip: { es: 'Gente en las ventanas: súbeles la plataforma', en: 'People at the windows: bring the platform up' } },
  estacion: { name: { es: 'La estación', en: 'The rail yard' }, tip: { es: 'Trenes que cortan la manguera', en: 'Trains that cut your hose' } },
  nieve: { name: { es: 'La estación de esquí', en: 'The ski lodge' }, tip: { es: 'Hielo que resbala y bocas de riego heladas', en: 'Slippery ice and frozen hydrants' } },
  museo: { name: { es: 'El museo', en: 'The museum' }, tip: { es: 'Saca las obras de arte y activa los rociadores', en: 'Carry the art out and pull the sprinklers' } },
  camping: { name: { es: 'El camping', en: 'The campground' }, tip: { es: 'Hierba seca y un helicóptero siempre a mano', en: 'Dry grass and a helicopter on call' } },
};

/** Colour of each place (level select, album). */
export const PLACE_COLOR: Record<ThemeId, string> = {
  plaza: '#e8a23a',
  granja: '#9fb54e',
  gasolinera: '#3f78b8',
  poligono: '#8fa3b3',
  castanar: '#d9822b',
  sanjuan: '#3a4a8a',
  puerto: '#2f8fa5',
  ciudad: '#5a8fd0',
  estacion: '#b4553c',
  nieve: '#6fa8dc',
  museo: '#9a4a8a',
  camping: '#3f8a5a',
};
