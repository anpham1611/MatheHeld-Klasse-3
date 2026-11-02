export type VehicleType =
  | 'car'
  | 'tractor'
  | 'train'
  | 'helicopter'
  | 'bus'
  | 'truck'
  | 'fire_engine'
  | 'ambulance'
  | 'airplane'
  | 'boat'
  | 'bicycle'
  | 'motorcycle';

export interface VehicleDesign {
  id: string;
  type: VehicleType;
  name: string;
  bodyColor: string;
  accentColor: string;
  variant: number;
  parts: [string, string];
}

export interface VehiclePart {
  id: string;
  vehicleId: string;
  vehicleType: VehicleType;
  name: string;
  partIndex: number;
  bodyColor: string;
  accentColor: string;
}

export interface VehiclePuzzleRound {
  vehicles: VehicleDesign[];
  parts: VehiclePart[];
}

const VEHICLE_MODELS: Array<{ type: VehicleType; names: [string, string, string, string, string]; parts: [string, string] }> = [
  { type: 'car', names: ['Kleinwagen', 'Sportwagen', 'Cabrio', 'Familienauto', 'Rennwagen'], parts: ['Rad', 'Autotür'] },
  { type: 'tractor', names: ['Hoftraktor', 'Minitraktor', 'Oldtimertraktor', 'Feldtraktor', 'Großtraktor'], parts: ['großes Rad', 'Motorhaube'] },
  { type: 'train', names: ['Dampflok', 'Schnellzug', 'Regionalzug', 'Güterzug', 'Straßenbahn'], parts: ['Räder', 'Schornstein'] },
  { type: 'helicopter', names: ['Rettungshubschrauber', 'Polizeihubschrauber', 'Transporthubschrauber', 'Rundflughubschrauber', 'Löschhubschrauber'], parts: ['Rotor', 'Heckrotor'] },
  { type: 'bus', names: ['Schulbus', 'Stadtbus', 'Reisebus', 'Doppeldeckerbus', 'Kleinbus'], parts: ['Rad', 'Bustür'] },
  { type: 'truck', names: ['Lieferwagen', 'Möbelwagen', 'Kipplaster', 'Tankwagen', 'Sattelzug'], parts: ['Rad', 'Ladefläche'] },
  { type: 'fire_engine', names: ['Feuerwehrauto', 'Drehleiterwagen', 'Löschfahrzeug', 'Tanklöschwagen', 'Feuerwehrbus'], parts: ['Rad', 'Leiter'] },
  { type: 'ambulance', names: ['Krankenwagen', 'Rettungswagen', 'Notarztwagen', 'Sanitätswagen', 'Krankentransporter'], parts: ['Rad', 'Blaulicht'] },
  { type: 'airplane', names: ['Propellerflugzeug', 'Passagierflugzeug', 'Segelflugzeug', 'Düsenflugzeug', 'Postflugzeug'], parts: ['Flügel', 'Heck'] },
  { type: 'boat', names: ['Segelboot', 'Ruderboot', 'Fischerboot', 'Fähre', 'Motorboot'], parts: ['Bootsrad', 'Segel'] },
  { type: 'bicycle', names: ['Kinderfahrrad', 'Tandem', 'Mountainbike', 'Rennrad', 'Dreirad'], parts: ['Vorderrad', 'Lenker'] },
  { type: 'motorcycle', names: ['Motorrad', 'Roller', 'Moped', 'Geländemotorrad', 'Polizeimotorrad'], parts: ['Vorderrad', 'Sitz'] },
];

const VEHICLE_CATALOG = VEHICLE_MODELS.flatMap((model) => model.names.map((name, variant) => ({
  id: `${model.type}-${variant + 1}`,
  type: model.type,
  name,
  variant,
  parts: model.parts,
})));

const PALETTES = [
  ['#e65b47', '#ffd258'],
  ['#5b9e50', '#f6c94a'],
  ['#486b9d', '#f58a45'],
  ['#efaa36', '#5b9e50'],
  ['#a36bc5', '#61c5d3'],
  ['#43a89a', '#ed7e54'],
  ['#df7290', '#6b9bdd'],
  ['#7b8d43', '#e97154'],
  ['#2b8a78', '#ffd166'],
  ['#e38d37', '#5a8ec2'],
  ['#8a6bb8', '#e9b64d'],
  ['#d95d69', '#64b49e'],
  ['#5881b2', '#f0a74a'],
];

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function generateVehiclePuzzle(random: () => number = Math.random): VehiclePuzzleRound {
  const palettes = shuffle(PALETTES, random);
  const vehicles = shuffle(VEHICLE_CATALOG, random).slice(0, 5).map((vehicle, index) => {
    const [bodyColor, accentColor] = palettes[index];
    return {
      id: `vehicle-${vehicle.id}`,
      type: vehicle.type,
      name: vehicle.name,
      bodyColor,
      accentColor,
      variant: vehicle.variant,
      parts: vehicle.parts,
    };
  });

  const parts = shuffle(vehicles.flatMap((vehicle) =>
    vehicle.parts.map((name, partIndex) => ({
      id: `part-${vehicle.id}-${partIndex}`,
      vehicleId: vehicle.id,
      vehicleType: vehicle.type,
      name,
      partIndex,
      bodyColor: vehicle.bodyColor,
      accentColor: vehicle.accentColor,
    }))), random);

  return { vehicles, parts };
}
