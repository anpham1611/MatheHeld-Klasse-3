export type MinecraftModuleId = 
  | 'multiplication_division'
  | 'perimeter_area'
  | 'place_values'
  | 'math_quests'
  | 'time_fractions'
  | 'creative_sandbox';

export interface VoxelBlock {
  x: number;
  y: number;
  z: number;
  type: 'dirt' | 'wood' | 'cobblestone' | 'iron' | 'fence' | 'cake' | 'chest' | 'chicken';
  pieceId?: string;
  rotation?: 0 | 90 | 180 | 270;
  brickColor?: string;
}

export interface MinecraftTask {
  id: string;
  moduleId: MinecraftModuleId;
  subType: string;
  titleDe: string;
  questionDe: string;
  hintDe: string;
  explanationDe: string;
  correctAnswer: number;
  options: number[];
  initialBlocks?: VoxelBlock[];
  meta?: {
    rows?: number;
    cols?: number;
    length?: number;
    width?: number;
    totalTreasures?: number;
    recipients?: number;
    dirt?: number;
    wood?: number;
    cobble?: number;
    iron?: number;
    targetNumber?: number;
    bridgeLength?: number;
    perDay?: number;
    fractionNumerator?: number;
    fractionDenominator?: number;
    timeHour?: number;
    timeMinute?: number;
  };
}

export const BLOCK_VALUES = {
  dirt: { nameDe: 'Erde (Dirt)', value: 1, color: '#865439', labelDe: '1 Einer (E)' },
  wood: { nameDe: 'Holz (Wood)', value: 10, color: '#a07855', labelDe: '10 Zehner (Z)' },
  cobblestone: { nameDe: 'Bruchstein (Stein)', value: 100, color: '#828282', labelDe: '100 Hunderter (H)' },
  iron: { nameDe: 'Eisenblock', value: 1000, color: '#e0e7ea', labelDe: '1000 Tausender (T)' },
};

export function shuffleAnswerOptions(options: number[], random: () => number = Math.random): number[] {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

// Generates randomized, curriculum-aligned tasks
export function generateMinecraftTask(moduleId: MinecraftModuleId): MinecraftTask {
  const taskId = `${moduleId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  switch (moduleId) {
    case 'multiplication_division': {
      // 50% Farm Multiplication, 50% Chest Division
      const isMultiplication = Math.random() > 0.4;
      if (isMultiplication) {
        // e.g., 4 rows of 6 chickens
        const rows = Math.floor(Math.random() * 6) + 3; // 3 to 8
        const cols = Math.floor(Math.random() * 6) + 3; // 3 to 8
        const total = rows * cols;

        const options = Array.from(new Set([
          total,
          total + rows,
          total - cols,
          (rows + 1) * cols,
          rows * (cols - 1)
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(total)) options[0] = total;

        // Build initial blocks representing the farm array
        const blocks: VoxelBlock[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            blocks.push({ x: c - Math.floor(cols / 2), y: 0, z: r - Math.floor(rows / 2), type: 'dirt' });
            blocks.push({ x: c - Math.floor(cols / 2), y: 1, z: r - Math.floor(rows / 2), type: 'chicken' });
          }
        }

        return {
          id: taskId,
          moduleId,
          subType: 'farm_multiplication',
          titleDe: '🌾 Hühnerfarm: Das Rechteck-Array der Multiplikation',
          questionDe: `Bauer Steve baut ein Hühnergehege mit ${rows} Reihen zu je ${cols} Hühnern. Wie viele Hühner sind es insgesamt?`,
          hintDe: `Nutze das Punktefeld: Anzahl der Reihen × Hühner pro Reihe = ${rows} × ${cols}`,
          explanationDe: `Multiplikation als wiederholte Addition: ${rows} × ${cols} = ${total} Hühner!`,
          correctAnswer: total,
          options: shuffleAnswerOptions(options),
          initialBlocks: blocks,
          meta: { rows, cols }
        };
      } else {
        // Chest Division: e.g. 24 gold ingots into 4 chests
        const recipients = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
        const perRecipient = Math.floor(Math.random() * 7) + 3; // 3 to 9
        const totalTreasures = recipients * perRecipient;

        const options = Array.from(new Set([
          perRecipient,
          perRecipient + 1,
          perRecipient - 1,
          perRecipient + 2,
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(perRecipient)) options[0] = perRecipient;

        const blocks: VoxelBlock[] = [];
        for (let i = 0; i < recipients; i++) {
          blocks.push({ x: (i - Math.floor(recipients / 2)) * 2, y: 0, z: 0, type: 'chest' });
        }

        return {
          id: taskId,
          moduleId,
          subType: 'treasure_division',
          titleDe: '📦 Schatz-Teilung: Gerechte Division im Team',
          questionDe: `In der Hauptkiste liegen ${totalTreasures} Goldbarren. Teile sie gleichmäßig auf ${recipients} Schatztruhen auf. Wie viele Barren bekommt jede Truhe?`,
          hintDe: `Gerechtes Aufteilen: Gesamtanzahl ÷ Kisten = ${totalTreasures} ÷ ${recipients}`,
          explanationDe: `Rechnung: ${totalTreasures} ÷ ${recipients} = ${perRecipient} Goldbarren pro Truhe!`,
          correctAnswer: perRecipient,
          options: shuffleAnswerOptions(options),
          initialBlocks: blocks,
          meta: { totalTreasures, recipients }
        };
      }
    }

    case 'perimeter_area': {
      const isArea = Math.random() > 0.5;
      const length = Math.floor(Math.random() * 6) + 4; // 4 to 9
      const width = Math.floor(Math.random() * 5) + 3;  // 3 to 7

      const area = length * width;
      const perimeter = (length + width) * 2;

      // Construct floor & fences blocks
      const blocks: VoxelBlock[] = [];
      for (let x = 0; x < length; x++) {
        for (let z = 0; z < width; z++) {
          blocks.push({
            x: x - Math.floor(length / 2),
            y: 0,
            z: z - Math.floor(width / 2),
            type: 'cobblestone'
          });
        }
      }
      // Fences around
      for (let x = -1; x <= length; x++) {
        for (let z = -1; z <= width; z++) {
          if (x === -1 || x === length || z === -1 || z === width) {
            blocks.push({
              x: x - Math.floor(length / 2),
              y: 0,
              z: z - Math.floor(width / 2),
              type: 'fence'
            });
          }
        }
      }

      if (isArea) {
        const options = Array.from(new Set([
          area,
          perimeter,
          (length + 1) * width,
          length * (width - 1),
          area + 4
        ])).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(area)) options[0] = area;

        return {
          id: taskId,
          moduleId,
          subType: 'floor_area',
          titleDe: '🏰 Grundfläche der Minecraft-Villa',
          questionDe: `Alex baut das Fundament einer Villa: ${length} Blöcke lang und ${width} Blöcke breit. Wie groß ist die Fläche in Quadratblöcken?`,
          hintDe: `Fläche = Länge × Breite (${length} × ${width})`,
          explanationDe: `Fläche: ${length} × ${width} = ${area} Blöcke²!`,
          correctAnswer: area,
          options: shuffleAnswerOptions(options),
          initialBlocks: blocks,
          meta: { length, width }
        };
      } else {
        const options = Array.from(new Set([
          perimeter,
          area,
          perimeter + 2,
          perimeter - 2,
          length + width
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(perimeter)) options[0] = perimeter;

        return {
          id: taskId,
          moduleId,
          subType: 'fence_perimeter',
          titleDe: '🪵 Umfang des Außenzauns um das Grundstück',
          questionDe: `Um das Haus (${length} Blöcke lang, ${width} Blöcke breit) vor Zombies zu schützen, baut Steve einen Zaun herum. Wie lang ist der Umfang (Zaunteile)?`,
          hintDe: `Umfang = (Länge + Breite) × 2 = (${length} + ${width}) × 2`,
          explanationDe: `Umfang: (${length} + ${width}) × 2 = ${perimeter} Zaunblöcke!`,
          correctAnswer: perimeter,
          options: shuffleAnswerOptions(options),
          initialBlocks: blocks,
          meta: { length, width }
        };
      }
    }

    case 'place_values': {
      // 1000s, 100s, 10s, 1s using Iron, Cobblestone, Wood, Dirt
      const iron = Math.floor(Math.random() * 3) + 1; // 1 to 3 thousands (e.g., 1000, 2000)
      const cobble = Math.floor(Math.random() * 6) + 1; // 1 to 6 hundreds
      const wood = Math.floor(Math.random() * 8) + 1; // 1 to 8 tens
      const dirt = Math.floor(Math.random() * 9) + 1; // 1 to 9 units
      const targetNumber = iron * 1000 + cobble * 100 + wood * 10 + dirt;

      const blocks: VoxelBlock[] = [];
      // Stack representation
      for (let i = 0; i < iron; i++) blocks.push({ x: -3, y: i, z: 0, type: 'iron' });
      for (let i = 0; i < cobble; i++) blocks.push({ x: -1, y: i, z: 0, type: 'cobblestone' });
      for (let i = 0; i < wood; i++) blocks.push({ x: 1, y: i, z: 0, type: 'wood' });
      for (let i = 0; i < dirt; i++) blocks.push({ x: 3, y: i, z: 0, type: 'dirt' });

      const options = Array.from(new Set([
        targetNumber,
        targetNumber + 10,
        targetNumber - 100,
        targetNumber + 1000,
        iron * 100 + cobble * 10 + wood
      ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
      if (!options.includes(targetNumber)) options[0] = targetNumber;

      return {
        id: taskId,
        moduleId,
        subType: 'place_value_blocks',
        titleDe: '💎 Stellenwert-System mit Minecraft-Blöcken',
        questionDe: `Regel: Eisen = 1000, Stein = 100, Holz = 10, Erde = 1. Die Skulptur besteht aus ${iron} Eisen, ${cobble} Steinen, ${wood} Holz und ${dirt} Erde. Welchen Gesamtwert hat sie?`,
        hintDe: `Rechne: (${iron} × 1000) + (${cobble} × 100) + (${wood} × 10) + (${dirt} × 1)`,
        explanationDe: `Stellenwert: ${iron} Tausender + ${cobble} Hunderter + ${wood} Zehner + ${dirt} Einer = ${targetNumber}!`,
        correctAnswer: targetNumber,
        options: shuffleAnswerOptions(options),
        initialBlocks: blocks,
        meta: { iron, cobble, wood, dirt, targetNumber }
      };
    }

    case 'math_quests': {
      // River Bridge Quest or Survival Crafting
      const questType = Math.random() > 0.5 ? 'bridge' : 'crafting';

      if (questType === 'bridge') {
        const perDay = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
        const days = Math.floor(Math.random() * 6) + 3; // 3 to 8 days
        const bridgeLength = perDay * days;

        const options = Array.from(new Set([
          days,
          days + 1,
          days - 1,
          days + 2
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(days)) options[0] = days;

        // Bridge initial blocks
        const blocks: VoxelBlock[] = [];
        for (let x = 0; x < bridgeLength; x++) {
          blocks.push({ x: x - Math.floor(bridgeLength / 2), y: 0, z: 0, type: 'wood' });
        }

        return {
          id: taskId,
          moduleId,
          subType: 'bridge_quest',
          titleDe: '🌉 Quest 1: Die Brücke über den tiefen Fluss',
          questionDe: `Die Dorfbewohner brauchen eine ${bridgeLength} Blöcke lange Brücke. Ein Baumeister schafft täglich ${perDay} Blöcke. Nach wie vielen Tagen ist die Brücke fertig?`,
          hintDe: `Teile die Gesamtlänge durch die tägliche Bauleistung: ${bridgeLength} ÷ ${perDay}`,
          explanationDe: `Rechnung: ${bridgeLength} ÷ ${perDay} = ${days} Tage Bauzeit!`,
          correctAnswer: days,
          options: shuffleAnswerOptions(options),
          initialBlocks: blocks,
          meta: { bridgeLength, perDay }
        };
      } else {
        // Torch or Bread crafting: e.g. 1 coal = 4 torches. Need 32 torches.
        const coalNeed = Math.floor(Math.random() * 7) + 4; // 4 to 10
        const torches = coalNeed * 4;

        const options = Array.from(new Set([
          coalNeed,
          coalNeed + 1,
          coalNeed - 1,
          coalNeed + 2
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(coalNeed)) options[0] = coalNeed;

        return {
          id: taskId,
          moduleId,
          subType: 'torch_crafting',
          titleDe: '🔥 Quest 2: Fackeln für die dunkle Mine herstellen',
          questionDe: `1 Kohle + 1 Stock ergeben 4 Fackeln. Du benötigst ${torches} Fackeln für den Minenschacht. Wie viele Stücke Kohle musst du abbauen?`,
          hintDe: `Teile die Fackeln durch 4: ${torches} ÷ 4`,
          explanationDe: `Rechnung: ${torches} ÷ 4 = ${coalNeed} Kohleblöcke!`,
          correctAnswer: coalNeed,
          options: shuffleAnswerOptions(options),
          meta: { targetNumber: coalNeed }
        };
      }
    }

    case 'time_fractions': {
      // 50% Time in Minecraft (20 min cycle or clock reading), 50% Cake fractions
      const isFraction = Math.random() > 0.4;
      if (isFraction) {
        const denoms = [2, 3, 4, 6];
        const denom = denoms[Math.floor(Math.random() * denoms.length)];
        const numer = Math.floor(Math.random() * (denom - 1)) + 1; // 1 to denom-1

        const totalSlices = denom * 2; // e.g. 8 slices
        const eatenSlices = numer * 2;

        const options = Array.from(new Set([
          eatenSlices,
          eatenSlices + 1,
          totalSlices - eatenSlices,
          totalSlices
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(eatenSlices)) options[0] = eatenSlices;

        const blocks: VoxelBlock[] = [
          { x: 0, y: 0, z: 0, type: 'cake' }
        ];

        return {
          id: taskId,
          moduleId,
          subType: 'cake_fractions',
          titleDe: '🎂 Kuchen-Brüche (Cake Fractions)',
          questionDe: `Ein Minecraft-Kuchen ist in ${totalSlices} gleiche Stücke geteilt. Alex isst ${numer}/${denom} des Kuchens. Wie viele Stücke isst sie?`,
          hintDe: `Berechne: (${totalSlices} ÷ ${denom}) × ${numer}`,
          explanationDe: `Rechnung: ${totalSlices} ÷ ${denom} = ${totalSlices / denom}, mal ${numer} = ${eatenSlices} Stücke!`,
          correctAnswer: eatenSlices,
          options: shuffleAnswerOptions(options),
          initialBlocks: blocks,
          meta: { fractionNumerator: numer, fractionDenominator: denom }
        };
      } else {
        // Minecraft Day/Night Cycle time problem
        // Minecraft 1 full day = 20 real minutes (10 min day, 10 min night)
        const cycles = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const totalMinutes = cycles * 20;

        const options = Array.from(new Set([
          totalMinutes,
          totalMinutes + 10,
          totalMinutes - 20,
          cycles * 10
        ])).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);
        if (!options.includes(totalMinutes)) options[0] = totalMinutes;

        return {
          id: taskId,
          moduleId,
          subType: 'time_cycle',
          titleDe: '☀️ Tag-Nacht-Zyklus & Uhrzeit in Minecraft',
          questionDe: `Ein vollständiger Minecraft Tag-Nacht-Zyklus dauert 20 echte Minuten (10 Min Tag, 10 Min Nacht). Wie viele Minuten vergehen bei ${cycles} vollen Zyklen?`,
          hintDe: `Multipliziere: ${cycles} × 20 Minuten`,
          explanationDe: `Rechnung: ${cycles} × 20 = ${totalMinutes} Minuten!`,
          correctAnswer: totalMinutes,
          options: shuffleAnswerOptions(options),
          meta: { targetNumber: totalMinutes }
        };
      }
    }

    case 'creative_sandbox':
    default: {
      return {
        id: taskId,
        moduleId: 'creative_sandbox',
        subType: 'sandbox',
        titleDe: '🔨 3D Voxel Kreativ-Labor',
        questionDe: 'Baue frei mit Erde, Holz, Stein und Eisen. Entdecke Fläche, Umfang und Zahlenwert in Echtzeit!',
        hintDe: 'Klicke auf den Boden, um Blöcke zu setzen oder abzubauen.',
        explanationDe: 'Kreatives Lernen mit unendlichen Möglichkeiten!',
        correctAnswer: 0,
        options: [0, 1, 2, 3],
      };
    }
  }
}

export const TEACHER_PEDAGOGICAL_GUIDE = {
  de: {
    title: 'Leitfaden für Lehrkräfte: Klasse 3 Mathematik mit Minecraft',
    intro: 'Minecraft fungiert als riesiger digitaler LEGO-Baukasten, der abstrakte mathematische Konzepte in dreidimensionale Voxel-Modelle verwandelt.',
    modules: [
      {
        num: 1,
        name: 'Multiplikation & Division (Grundrechenarten)',
        method: 'Arrays und gerechtes Aufteilen:',
        points: [
          'Hühnerfarm: 4 Reihen zu je 6 Blöcken = 24 Hühner (4 × 6 = 24).',
          'Schatztruhe: 24 Goldbarren auf 4 Kisten verteilen (24 ÷ 4 = 6 Barren).'
        ]
      },
      {
        num: 2,
        name: 'Geometrie: Umfang & Flächeninhalt',
        method: 'Jeder Block misst exakt 1×1×1 Längeneinheit:',
        points: [
          'Grundfläche: Bodenplatte mit Länge 8 und Breite 5 = 40 Blöcke².',
          'Zaun-Umfang: Zäune um das Haus = (8 + 5) × 2 = 26 Zaunabschnitte.'
        ]
      },
      {
        num: 3,
        name: 'Zahlenraum bis 1000 & Stellenwerttafel (E-Z-H-T)',
        method: 'Block-Währung für Stellenwerte:',
        points: [
          'Erde (Dirt) = 1 Einer (E)',
          'Holz (Wood) = 10 Zehner (Z)',
          'Bruchstein (Cobblestone) = 100 Hunderter (H)',
          'Eisenblock (Iron) = 1000 Tausender (T)',
          'Bauaufgabe 1.342: Exakt 1 Eisen, 3 Steine, 4 Holz und 2 Erde verwenden.'
        ]
      },
      {
        num: 4,
        name: 'Sachaufgaben als Survival-Quests',
        method: 'Spannende Geschichten lösen:',
        points: [
          'Brückenbau: 15 Blöcke Gesamtlänge, 3 Blöcke/Tag = 5 Tage Bauzeit.',
          'Handlungsorientiertes Überprüfen durch reales Bauen im Spiel.'
        ]
      },
      {
        num: 5,
        name: 'Uhrzeit & Grundbrüche',
        method: 'Spielmechaniken didaktisch nutzen:',
        points: [
          'Tag-Nacht-Zyklus: 20 echte Minuten (10 Min Tag, 10 Min Nacht), Sonnenuhr bauen.',
          'Minecraft-Kuchen in Stücke teilen für 1/2, 1/4, 3/4.'
        ]
      }
    ],
    tips: [
      'Zeitmanagement: 15 Min Unterricht/Rechnen → 20 Min Spielpraxis → 5 Min Reflexion.',
      'Minecraft Education Edition Tafeln und Sperrbereiche nutzen.',
      'Teamarbeit zu zweit oder dritt für soziale Kompetenz.'
    ]
  }
};
