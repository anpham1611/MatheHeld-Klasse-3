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
}

export interface MinecraftTask {
  id: string;
  moduleId: MinecraftModuleId;
  subType: string;
  titleVi: string;
  titleDe: string;
  questionVi: string;
  questionDe: string;
  hintVi: string;
  hintDe: string;
  explanationVi: string;
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
  dirt: { nameVi: 'Khối Đất (Dirt)', nameDe: 'Erde (Dirt)', value: 1, color: '#865439', label: '1 Đơn vị (E)' },
  wood: { nameVi: 'Khối Gỗ (Wood)', nameDe: 'Holz (Wood)', value: 10, color: '#a07855', label: '10 Chục (Z)' },
  cobblestone: { nameVi: 'Khối Đá (Cobblestone)', nameDe: 'Bruchstein', value: 100, color: '#828282', label: '100 Trăm (H)' },
  iron: { nameVi: 'Khối Sắt (Iron Block)', nameDe: 'Eisenblock', value: 1000, color: '#e0e7ea', label: '1000 Nghìn (T)' },
};

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
          titleVi: '🌾 Nông Trại Gà: Khái niệm Mảng Phép Nhân',
          titleDe: '🌾 Hühnerfarm: Das Rechteck-Array der Multiplikation',
          questionVi: `Bác Steve xây chuồng gà hình chữ nhật gồm ${rows} hàng, mỗi hàng có ${cols} con gà. Hỏi có tất cả bao nhiêu con gà?`,
          questionDe: `Bauer Steve baut ein Hühnergehege mit ${rows} Reihen zu je ${cols} Hühnern. Wie viele Hühner sind es insgesamt?`,
          hintVi: `Tính theo công thức Mảng hình chữ nhật: Số hàng × Số cột = ${rows} × ${cols}`,
          hintDe: `Nutze das Punktefeld: Anzahl der Reihen × Hühner pro Reihe = ${rows} × ${cols}`,
          explanationVi: `Phép nhân là phép cộng lặp lại: ${rows} hàng × ${cols} con gà = ${total} con gà trong chuồng!`,
          explanationDe: `Multiplikation als wiederholte Addition: ${rows} × ${cols} = ${total} Hühner!`,
          correctAnswer: total,
          options: options.sort((a, b) => a - b),
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
          titleVi: '📦 Chia Kho Báu: Phép Chia Đều Cho Đồng Đội',
          titleDe: '📦 Schatz-Teilung: Gerechte Division im Team',
          questionVi: `Chiếc rương chính chứa ${totalTreasures} thỏi vàng (Gold Ingots). Hãy chia đều số vàng này vào ${recipients} chiếc rương cho ${recipients} người bạn thợ mỏ. Mỗi bạn được bao nhiêu thỏi vàng?`,
          questionDe: `In der Hauptkiste liegen ${totalTreasures} Goldbarren. Teile sie gleichmäßig auf ${recipients} Schatztruhen auf. Wie viele Barren bekommt jede Truhe?`,
          hintVi: `Chia đều là phép chia: Tổng số vàng ÷ Số rương = ${totalTreasures} ÷ ${recipients}`,
          hintDe: `Gerechtes Aufteilen: Gesamtanzahl ÷ Kisten = ${totalTreasures} ÷ ${recipients}`,
          explanationVi: `Phép tính: ${totalTreasures} ÷ ${recipients} = ${perRecipient}. Mỗi rương nhận đúng ${perRecipient} thỏi vàng!`,
          explanationDe: `Rechnung: ${totalTreasures} ÷ ${recipients} = ${perRecipient} Goldbarren pro Truhe!`,
          correctAnswer: perRecipient,
          options: options.sort((a, b) => a - b),
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
          titleVi: '🏰 Diện Tích Sàn Nhà Biệt Thự Minecraft',
          titleDe: '🏰 Grundfläche der Minecraft-Villa',
          questionVi: `Alex xây nền nhà hình chữ nhật có chiều dài ${length} khối và chiều rộng ${width} khối. Hỏi diện tích sàn nhà là bao nhiêu khối vuông?`,
          questionDe: `Alex baut das Fundament einer Villa: ${length} Blöcke lang und ${width} Blöcke breit. Wie groß ist die Fläche in Quadratblöcken?`,
          hintVi: `Diện tích hình chữ nhật = Chiều dài × Chiều rộng (${length} × ${width})`,
          hintDe: `Fläche = Länge × Breite (${length} × ${width})`,
          explanationVi: `Diện tích là số khối mặt sàn: ${length} × ${width} = ${area} khối vuông (Blocks²).`,
          explanationDe: `Fläche: ${length} × ${width} = ${area} Blöcke²!`,
          correctAnswer: area,
          options: options.sort((a, b) => a - b),
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
          titleVi: '🪵 Chu Vi Hàng Rào Bao Quanh Biệt Thự',
          titleDe: '🪵 Umfang des Außenzauns um das Grundstück',
          questionVi: `Để bảo vệ ngôi nhà (${length} khối dài, ${width} khối rộng) khỏi quái vật, Steve cần xây hàng rào bao quanh. Chu vi của khu đất là bao nhiêu mét (khối rào)?`,
          questionDe: `Um das Haus (${length} Blöcke lang, ${width} Blöcke breit) vor Zombies zu schützen, baut Steve einen Zaun herum. Wie lang ist der Umfang (Zaunteile)?`,
          hintVi: `Chu vi hình chữ nhật = (Chiều dài + Chiều rộng) × 2 = (${length} + ${width}) × 2`,
          hintDe: `Umfang = (Länge + Breite) × 2 = (${length} + ${width}) × 2`,
          explanationVi: `Chu vi bao quanh: (${length} + ${width}) × 2 = ${length + width} × 2 = ${perimeter} khối hàng rào!`,
          explanationDe: `Umfang: (${length} + ${width}) × 2 = ${perimeter} Zaunblöcke!`,
          correctAnswer: perimeter,
          options: options.sort((a, b) => a - b),
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
        titleVi: '💎 Cấu Tạo Số: Khối Đất - Gỗ - Đá - Sắt',
        titleDe: '💎 Stellenwert-System mit Minecraft-Blöcken',
        questionVi: `Quy ước: Khối Sắt = 1000, Khối Đá = 100, Khối Gỗ = 10, Khối Đất = 1. Công trình trên có: ${iron} khối Sắt, ${cobble} khối Đá, ${wood} khối Gỗ và ${dirt} khối Đất. Tổng giá trị của công trình là bao nhiêu?`,
        questionDe: `Regel: Eisen = 1000, Stein = 100, Holz = 10, Erde = 1. Die Skulptur besteht aus ${iron} Eisen, ${cobble} Steinen, ${wood} Holz und ${dirt} Erde. Welchen Gesamtwert hat sie?`,
        hintVi: `Tính: (${iron} × 1000) + (${cobble} × 100) + (${wood} × 10) + (${dirt} × 1)`,
        hintDe: `Rechne: (${iron} × 1000) + (${cobble} × 100) + (${wood} × 10) + (${dirt} × 1)`,
        explanationVi: `Cấu tạo số: ${iron} Nghìn (${iron * 1000}) + ${cobble} Trăm (${cobble * 100}) + ${wood} Chục (${wood * 10}) + ${dirt} Đơn vị (${dirt}) = ${targetNumber}!`,
        explanationDe: `Stellenwert: ${iron} Tausender + ${cobble} Hunderter + ${wood} Zehner + ${dirt} Einer = ${targetNumber}!`,
        correctAnswer: targetNumber,
        options: options.sort((a, b) => a - b),
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
          titleVi: '🌉 Nhiệm Vụ 1: Cây Cầu Bắc Qua Sông Lớn',
          titleDe: '🌉 Quest 1: Die Brücke über den tiefen Fluss',
          questionVi: `Dân làng cần xây một cây cầu bắc qua sông dài ${bridgeLength} khối. Mỗi ngày thợ xây đặt được ${perDay} khối. Hỏi sau bao nhiêu ngày cây cầu sẽ hoàn thành?`,
          questionDe: `Die Dorfbewohner brauchen eine ${bridgeLength} Blöcke lange Brücke. Ein Baumeister schafft täglich ${perDay} Blöcke. Nach wie vielen Tagen ist die Brücke fertig?`,
          hintVi: `Lấy tổng độ dài cây cầu chia cho số khối mỗi ngày: ${bridgeLength} ÷ ${perDay}`,
          hintDe: `Teile die Gesamtlänge durch die tägliche Bauleistung: ${bridgeLength} ÷ ${perDay}`,
          explanationVi: `Phép tính: ${bridgeLength} ÷ ${perDay} = ${days} ngày. Dân làng sẽ qua sông an toàn sau ${days} ngày!`,
          explanationDe: `Rechnung: ${bridgeLength} ÷ ${perDay} = ${days} Tage Bauzeit!`,
          correctAnswer: days,
          options: options.sort((a, b) => a - b),
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
          titleVi: '🔥 Nhiệm Vụ 2: Chế Tạo Đuốc Thắp Sáng Hang Mỏ',
          titleDe: '🔥 Quest 2: Fackeln für die dunkle Mine herstellen',
          questionVi: `Trong bàn chế tạo, 1 viên Than và 1 Que gỗ tạo ra 4 cây đuốc. Để thắp sáng toàn bộ hầm mỏ, bạn cần ${torches} cây đuốc. Cần bao nhiêu viên Than?`,
          questionDe: `1 Kohle + 1 Stock ergeben 4 Fackeln. Du benötigst ${torches} Fackeln für den Minenschacht. Wie viele Stücke Kohle musst du abbauen?`,
          hintVi: `Chia số đuốc cần cho 4: ${torches} ÷ 4`,
          hintDe: `Teile die Fackeln durch 4: ${torches} ÷ 4`,
          explanationVi: `Phép tính: ${torches} ÷ 4 = ${coalNeed} viên Than. Đủ để thắp sáng an toàn!`,
          explanationDe: `Rechnung: ${torches} ÷ 4 = ${coalNeed} Kohleblöcke!`,
          correctAnswer: coalNeed,
          options: options.sort((a, b) => a - b),
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

        // Let's ask: e.g. "Chiếc bánh kem chia làm 4 phần bằng nhau, Steve đã ăn 3 phần. Phân số chỉ số phần đã ăn là bao nhiêu?" or calculate slices
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
          titleVi: '🎂 Phân Số Bánh Kem (Cake Fractions)',
          titleDe: '🎂 Kuchen-Brüche (Cake Fractions)',
          questionVi: `Một chiếc bánh kem Minecraft khổng lồ được cắt thành ${totalSlices} miếng bằng nhau. Alex muốn ăn ${numer}/${denom} của chiếc bánh. Hỏi Alex sẽ ăn bao nhiêu miếng bánh?`,
          questionDe: `Ein Minecraft-Kuchen ist in ${totalSlices} gleiche Stücke geteilt. Alex isst ${numer}/${denom} des Kuchens. Wie viele Stücke isst sie?`,
          hintVi: `Tìm ${numer}/${denom} của ${totalSlices}: Lấy ${totalSlices} chia ${denom} rồi nhân với ${numer}`,
          hintDe: `Berechne: (${totalSlices} ÷ ${denom}) × ${numer}`,
          explanationVi: `Ta có ${totalSlices} ÷ ${denom} = ${totalSlices / denom} miếng mỗi phần. Vậy ${numer} phần tương ứng: ${totalSlices / denom} × ${numer} = ${eatenSlices} miếng!`,
          explanationDe: `Rechnung: ${totalSlices} ÷ ${denom} = ${totalSlices / denom}, mal ${numer} = ${eatenSlices} Stücke!`,
          correctAnswer: eatenSlices,
          options: options.sort((a, b) => a - b),
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
          titleVi: '☀️ Vòng Tuần Hoàn Ngày & Đêm Trong Minecraft',
          titleDe: '☀️ Tag-Nacht-Zyklus & Uhrzeit in Minecraft',
          questionVi: `Một chu kỳ Ngày và Đêm đầy đủ trong Minecraft kéo dài đúng 20 phút ngoài đời thực (10 phút ngày, 10 phút đêm). Nếu trải qua ${cycles} ngày đêm, đã có tất cả bao nhiêu phút trôi qua?`,
          questionDe: `Ein vollständiger Minecraft Tag-Nacht-Zyklus dauert 20 echte Minuten (10 Min Tag, 10 Min Nacht). Wie viele Minuten vergehen bei ${cycles} vollen Zyklen?`,
          hintVi: `Lấy số chu kỳ nhân với 20 phút: ${cycles} × 20`,
          hintDe: `Multipliziere: ${cycles} × 20 Minuten`,
          explanationVi: `Phép tính: ${cycles} × 20 = ${totalMinutes} phút (tương đương ${Math.floor(totalMinutes / 60)} giờ ${totalMinutes % 60} phút)!`,
          explanationDe: `Rechnung: ${cycles} × 20 = ${totalMinutes} Minuten!`,
          correctAnswer: totalMinutes,
          options: options.sort((a, b) => a - b),
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
        titleVi: '🔨 Xưởng Sáng Tạo Voxel 3D Tự Do',
        titleDe: '🔨 3D Voxel Kreativ-Labor',
        questionVi: 'Tự do đặt các khối Đất, Gỗ, Đá, Sắt và kiểm tra diện tích, chu vi cùng giá trị số học tự động!',
        questionDe: 'Baue frei mit Erde, Holz, Stein und Eisen. Entdecke Fläche, Umfang und Zahlenwert in Echtzeit!',
        hintVi: 'Bấm vào ô trên mặt đất để đặt khối hoặc đập vỡ khối.',
        hintDe: 'Klicke auf den Boden, um Blöcke zu setzen oder abzubauen.',
        explanationVi: 'Sáng tạo và học toán không giới hạn!',
        explanationDe: 'Kreatives Lernen mit unendlichen Möglichkeiten!',
        correctAnswer: 0,
        options: [0, 1, 2, 3],
      };
    }
  }
}

export const TEACHER_PEDAGOGICAL_GUIDE = {
  vi: {
    title: 'Sổ Tay Giảng Dạy: Toán Lớp 3 Cùng Minecraft (Education Edition)',
    intro: 'Minecraft là một bộ "đồ chơi Lego kỹ thuật số" khổng lồ, giúp học sinh tiểu học trực quan hóa 100% các khái niệm toán học trừu tượng thành khối 3D sinh động.',
    modules: [
      {
        num: 1,
        name: 'Phép nhân & Phép chia (Bảng nhân chia cơ bản)',
        method: 'Dạy khái niệm mảng (Arrays) và sự chia đều:',
        points: [
          'Xây chuồng gà / vườn cà rốt: Kích thước 4 hàng × 6 khối = 24 khối. Giúp học sinh thấy rõ phép nhân là phép cộng lặp lại.',
          'Rương kho báu: Đặt 24 thỏi vàng chia vào 4 rương cho 4 bạn (24 ÷ 4 = 6). Trực quan hóa bản chất của phép chia đều và phép chia có dư.'
        ]
      },
      {
        num: 2,
        name: 'Hình học: Chu vi & Diện tích',
        method: 'Mọi khối trong game là khối vuông lập phương chuẩn 1×1×1:',
        points: [
          'Diện tích sàn nhà: Học sinh lát sàn nền nhà (Dài 8 × Rộng 5 = 40 khối sàn). Diện tích chính là số khối bề mặt đặt xuống.',
          'Chu vi hàng rào: Cọc hàng rào bao quanh ngôi nhà chính là chu vi = (Dài + Rộng) × 2.'
        ]
      },
      {
        num: 3,
        name: 'Số có 3 đến 4 chữ số & Cấu tạo số',
        method: 'Quy ước vật phẩm tương ứng với hàng số:',
        points: [
          'Khối Đất (Dirt) = 1 Đơn vị',
          'Khối Gỗ (Wood) = 10 (1 Chục)',
          'Khối Đá (Cobblestone) = 100 (1 Trăm)',
          'Khối Sắt (Iron Block) = 1000 (1 Nghìn)',
          'Thử thách đúc tượng 1.342: Học sinh lấy đúng 1 Sắt, 3 Đá, 4 Gỗ, 2 Đất để xây tượng.'
        ]
      },
      {
        num: 4,
        name: 'Giải toán có lời văn (Math Quests)',
        method: 'Biến bài toán khô khan thành nhiệm vụ sinh tồn:',
        points: [
          'Nhiệm vụ cầu qua sông: Cầu dài 15 khối, mỗi ngày đặt được 3 khối → 15 ÷ 3 = 5 ngày hoàn thành.',
          'Học sinh tính toán trên giấy trước rồi vào game đặt khối kiểm tra kết quả.'
        ]
      },
      {
        num: 5,
        name: 'Xem giờ và Phân số cơ bản',
        method: 'Tận dụng các cơ chế có sẵn trong Minecraft:',
        points: [
          'Xem giờ: Chu kỳ ngày/đêm 20 phút (10 phút ngày, 10 phút đêm). Chế tạo đồng hồ mặt trời bằng khối block.',
          'Phân số bánh kem (Cake): Cắt các miếng bánh hoặc chia thanh len màu để giải thích 1/2, 1/3, 1/4, 3/4.'
        ]
      }
    ],
    tips: [
      'Khuyến nghị thời gian: 15 phút nghe giảng/tính toán → 20 phút thực hành trong game → 5 phút tổng kết.',
      'Sử dụng Minecraft Education Edition với công cụ bảng đen (Chalkboard) và chế độ đóng băng người chơi.',
      'Làm việc nhóm (Collaboration): Nhóm 2-3 bạn cùng giải đố và xây dựng để tăng kỹ năng giao tiếp.'
    ]
  },
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
