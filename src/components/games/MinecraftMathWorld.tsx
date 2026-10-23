import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, BookOpen, Sparkles, RefreshCw, HelpCircle, 
  PenTool, CheckCircle2, Trophy, Star, Volume2, VolumeX,
  Layers, Hammer, Compass, Sun, Eye, ChevronRight
} from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import { 
  MinecraftModuleId, 
  MinecraftTask, 
  generateMinecraftTask, 
  VoxelBlock, 
  BLOCK_VALUES 
} from '../../math/minecraftCurriculum';
import { VoxelCanvas } from '../minecraft/VoxelCanvas';
import { TeacherGuideModal } from '../minecraft/TeacherGuideModal';
import { Scratchpad } from '../Scratchpad';
import { PauseModal } from '../PauseModal';

interface MinecraftMathWorldProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MinecraftMathWorld: React.FC<MinecraftMathWorldProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [activeModule, setActiveModule] = useState<MinecraftModuleId>('multiplication_division');
  const [currentTask, setCurrentTask] = useState<MinecraftTask>(() => generateMinecraftTask('multiplication_division'));
  const [currentBlocks, setCurrentBlocks] = useState<VoxelBlock[]>(() => currentTask.initialBlocks || []);
  
  // Creative Sandbox State
  const [creativeBlockType, setCreativeBlockType] = useState<VoxelBlock['type']>('dirt');

  // Answer & Feedback State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [localScore, setLocalScore] = useState<number>(player.scores.minecraft || 0);

  // Modals
  const [showTeacherGuide, setShowTeacherGuide] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Switch Module handler
  const handleSelectModule = (moduleId: MinecraftModuleId) => {
    sound.playJump();
    setActiveModule(moduleId);
    const newTask = generateMinecraftTask(moduleId);
    setCurrentTask(newTask);
    setCurrentBlocks(newTask.initialBlocks || []);
    setIsAnswered(false);
    setIsCorrect(null);
    setSelectedOption(null);
    setShowHint(false);
  };

  // Next Question
  const handleNextTask = () => {
    sound.playJump();
    const newTask = generateMinecraftTask(activeModule);
    setCurrentTask(newTask);
    setCurrentBlocks(newTask.initialBlocks || []);
    setIsAnswered(false);
    setIsCorrect(null);
    setSelectedOption(null);
    setShowHint(false);
  };

  // Answer Checker
  const handleSelectAnswer = (option: number) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === currentTask.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
      sound.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4ade80', '#eab308', '#38bdf8', '#f97316'],
      });

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = 100 + nextStreak * 20;
      setLocalScore((prev) => prev + points);

      onUpdateStats(1, 10, localScore + points);
    } else {
      sound.playWrong();
      setStreak(0);
    }
  };

  // Keyboard shortcut listener: 1, 2, 3, 4 for multiple choice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      } else if (!isAnswered && currentTask.options) {
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
          const idx = parseInt(e.code.replace('Digit', '')) - 1;
          if (currentTask.options[idx] !== undefined) {
            handleSelectAnswer(currentTask.options[idx]);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentTask]);

  // Modules metadata definition
  const modulesList = [
    {
      id: 'multiplication_division' as MinecraftModuleId,
      labelVi: '1. Nông Trại & Kho Báu',
      labelDe: '1. Farm & Schatz',
      subVi: 'Nhân mảng & Chia đều',
      subDe: '1x1 & Division',
      icon: '🌾',
    },
    {
      id: 'perimeter_area' as MinecraftModuleId,
      labelVi: '2. Nền Nhà & Hàng Rào',
      labelDe: '2. Villa & Zaun',
      subVi: 'Diện tích & Chu vi',
      subDe: 'Fläche & Umfang',
      icon: '📐',
    },
    {
      id: 'place_values' as MinecraftModuleId,
      labelVi: '3. Khối Đất - Gỗ - Đá - Sắt',
      labelDe: '3. Block-Stellenwerte',
      subVi: 'Cấu tạo số đến 1000',
      subDe: 'Zahlenraum bis 1000',
      icon: '💎',
    },
    {
      id: 'math_quests' as MinecraftModuleId,
      labelVi: '4. Nhiệm Vụ Vượt Sông',
      labelDe: '4. Mathe-Quests',
      subVi: 'Toán có lời văn',
      subDe: 'Sachaufgaben',
      icon: '🌉',
    },
    {
      id: 'time_fractions' as MinecraftModuleId,
      labelVi: '5. Đồng Hồ & Bánh Kem',
      labelDe: '5. Zeit & Brüche',
      subVi: 'Xem giờ & Phân số',
      subDe: 'Uhrzeit & Kuchen',
      icon: '🎂',
    },
    {
      id: 'creative_sandbox' as MinecraftModuleId,
      labelVi: '6. Xưởng Sáng Tạo 3D',
      labelDe: '6. 3D Kreativ-Labor',
      subVi: 'Thử nghiệm tự do',
      subDe: 'Freies Bauen',
      icon: '🔨',
    },
  ];

  // Creative Sandbox Stats Calculation
  const totalDirt = currentBlocks.filter((b) => b.type === 'dirt').length;
  const totalWood = currentBlocks.filter((b) => b.type === 'wood').length;
  const totalCobble = currentBlocks.filter((b) => b.type === 'cobblestone').length;
  const totalIron = currentBlocks.filter((b) => b.type === 'iron').length;
  const totalSandboxValue = totalIron * 1000 + totalCobble * 100 + totalWood * 10 + totalDirt * 1;

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] bg-slate-950 flex flex-col justify-between overflow-x-hidden font-['Nunito',sans-serif] select-none text-slate-100">
      {/* Top Navbar */}
      <header className="px-3 py-2.5 sm:px-6 sm:py-3 bg-slate-900/90 border-b border-emerald-500/40 backdrop-blur flex items-center justify-between gap-2 z-20 shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sound.playJump();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'de' ? 'Zurück' : 'Trở về'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-400 flex items-center justify-center text-lg">
              🧱
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white font-['Fredoka'] tracking-wide flex items-center gap-1.5">
                <span>{lang === 'de' ? 'Minecraft Mathe-Welt' : 'Minecraft Math World'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded uppercase font-mono">
                  {lang === 'de' ? 'Klasse 3' : 'Lớp 3'}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Quick Stats Banner */}
        <div className="hidden md:flex items-center gap-3 bg-black/40 border border-slate-700 px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
            <span>🟢</span>
            <span>{player.euroCoins} {lang === 'de' ? 'Smaragde' : 'Ngọc / Vàng'}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-yellow-400 text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            <span>{player.stars} {lang === 'de' ? 'Sterne' : 'Sao'}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-amber-300 text-xs font-black">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{localScore} Pkt</span>
          </div>
        </div>

        {/* Right Tools: Teacher Guide, Scratchpad, Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Teacher Guide Button */}
          <button
            onClick={() => {
              sound.playJump();
              setShowTeacherGuide(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-black cursor-pointer transition shadow"
            title={lang === 'de' ? 'Leitfaden für Lehrkräfte & Eltern' : 'Sổ tay giáo viên / Teacher Guide'}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">
              {lang === 'de' ? 'Lehrer-Tafel' : 'Sổ tay Giáo Viên'}
            </span>
          </button>

          {/* Scratchpad Button */}
          <button
            onClick={() => {
              sound.playJump();
              setShowScratchpad(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold cursor-pointer transition"
            title={lang === 'de' ? 'Schmierzettel / Notizen' : 'Bảng nháp tính toán'}
          >
            <PenTool className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">{lang === 'de' ? 'Notizen' : 'Nháp'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playJump();
              onToggleMute();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl cursor-pointer transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Module Selector Bar (Horizontal Scrollable Tabs) */}
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {modulesList.map((m) => {
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectModule(m.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-lg scale-102'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <span className="text-base">{m.icon}</span>
              <div className="text-left">
                <div className="leading-tight font-['Fredoka']">
                  {lang === 'de' ? m.labelDe : m.labelVi}
                </div>
                <div className="text-[10px] text-slate-300 opacity-80 font-normal">
                  {lang === 'de' ? m.subDe : m.subVi}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto">
        {/* Left Column: 3D Voxel Viewport (lg: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[340px] sm:h-[420px] lg:h-full min-h-[300px]">
          <VoxelCanvas
            blocks={currentBlocks}
            editable={activeModule === 'creative_sandbox'}
            activeBlockType={creativeBlockType}
            onBlocksChange={setCurrentBlocks}
            lang={lang}
          />
        </div>

        {/* Right Column: Minecraft Task & Question Board (lg: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {activeModule === 'creative_sandbox' ? (
            /* Creative Sandbox Control Panel */
            <div className="flex-1 p-5 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔨</span>
                    <div>
                      <h3 className="text-lg font-black text-white font-['Fredoka']">
                        {lang === 'de' ? '3D Kreativ-Labor' : 'Xưởng Sáng Tạo Tự Do'}
                      </h3>
                      <p className="text-xs text-emerald-400 font-bold">
                        {lang === 'de' ? 'Baue und beobachte Stellenwerte live' : 'Đặt khối & quan sát trực quan Toán 3D'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Block Selector */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {lang === 'de' ? 'Block-Typ wählen:' : 'Chọn loại khối để đặt:'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['dirt', 'wood', 'cobblestone', 'iron'] as VoxelBlock['type'][]).map((type) => {
                      const info = BLOCK_VALUES[type as keyof typeof BLOCK_VALUES];
                      const isSel = creativeBlockType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            sound.playJump();
                            setCreativeBlockType(type);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition cursor-pointer ${
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded border border-black/30 shadow-inner"
                            style={{ backgroundColor: info.color }}
                          />
                          <span className="text-[11px] font-black truncate max-w-full">
                            {lang === 'de' ? info.nameDe : info.nameVi.split(' ')[1]}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono font-bold">
                            ={info.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Math Analysis of placed blocks */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    {lang === 'de' ? 'Live-Mathematik-Analyse:' : 'Phân tích Toán Học Trực Quan:'}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        {lang === 'de' ? 'Gesamtblöcke:' : 'Tổng số khối:'}
                      </span>
                      <span className="text-base font-black text-white">{currentBlocks.length}</span>
                    </div>

                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        {lang === 'de' ? 'Zahlenwert (T-H-Z-E):' : 'Giá trị số (H-Z-E):'}
                      </span>
                      <span className="text-base font-black text-amber-400">{totalSandboxValue}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between py-0.5">
                      <span>{lang === 'de' ? 'Eisen' : 'Sắt'} ({totalIron} × 1000):</span>
                      <span className="font-mono font-bold text-white">{totalIron * 1000}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>{lang === 'de' ? 'Bruchstein' : 'Đá'} ({totalCobble} × 100):</span>
                      <span className="font-mono font-bold text-white">{totalCobble * 100}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>{lang === 'de' ? 'Holz' : 'Gỗ'} ({totalWood} × 10):</span>
                      <span className="font-mono font-bold text-white">{totalWood * 10}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>{lang === 'de' ? 'Erde' : 'Đất'} ({totalDirt} × 1):</span>
                      <span className="font-mono font-bold text-white">{totalDirt * 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleNextTask}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs cursor-pointer shadow transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{lang === 'de' ? 'Neue Aufgabe generieren' : 'Tạo thử thách mới'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Minecraft Math Task Card */
            <div className="flex-1 p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between">
              <div>
                {/* Task Header & Title */}
                <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {lang === 'de' ? 'Mathe-Aufgabe' : 'Bài Tập Toán 3'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Fredoka'] mt-1">
                      {lang === 'de' ? currentTask.titleDe : currentTask.titleVi}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      sound.playJump();
                      setShowHint(!showHint);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer transition text-xs flex items-center gap-1 shrink-0"
                    title={lang === 'de' ? 'Rechen-Tipp anzeigen' : 'Gợi ý cách giải'}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{lang === 'de' ? 'Tipp' : 'Gợi ý'}</span>
                  </button>
                </div>

                {/* Question Text in Wooden Blackboard */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium leading-relaxed mb-4 shadow-inner">
                  {lang === 'de' ? currentTask.questionDe : currentTask.questionVi}
                </div>

                {/* Hint Banner if toggled */}
                {showHint && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{lang === 'de' ? currentTask.hintDe : currentTask.hintVi}</span>
                  </div>
                )}

                {/* Answer Options Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {currentTask.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    let btnStyle = 'bg-slate-800/90 border-slate-700 hover:border-emerald-400/80 hover:bg-slate-750 text-white';

                    if (isAnswered) {
                      if (option === currentTask.correctAnswer) {
                        btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg scale-102';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-700 border-rose-500 text-white line-through';
                      } else {
                        btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectAnswer(option)}
                        className={`p-3 rounded-xl border-2 font-['Fredoka'] text-base sm:text-lg font-black transition-all cursor-pointer flex items-center justify-between shadow ${btnStyle}`}
                      >
                        <span className="text-xs text-slate-400 font-mono w-5 h-5 rounded-md bg-black/30 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-center font-extrabold">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Explanation Card */}
                {isAnswered && (
                  <div
                    className={`p-3.5 rounded-xl border mb-3 text-xs leading-relaxed ${
                      isCorrect
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                        : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300 font-black">
                            {lang === 'de' ? 'Exzellent gelöst! +100 Punkte' : 'Chính xác xuất sắc! +100 điểm'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-rose-400 font-black">
                            {lang === 'de' ? 'Noch nicht ganz richtig!' : 'Chưa chính xác!'}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="opacity-95">
                      {lang === 'de' ? currentTask.explanationDe : currentTask.explanationVi}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">
                  {streak > 1 && (
                    <span className="text-amber-400 font-bold">
                      🔥 {lang === 'de' ? `Serie: ${streak} richtige Antworten!` : `Chuỗi ${streak} câu đúng!`}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNextTask}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs sm:text-sm cursor-pointer shadow-lg transition"
                >
                  <span>{lang === 'de' ? 'Nächste Quest' : 'Câu tiếp theo'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Teacher Guide Pedagogical Modal */}
      {showTeacherGuide && (
        <TeacherGuideModal
          lang={lang}
          onClose={() => setShowTeacherGuide(false)}
        />
      )}

      {/* Scratchpad Modal */}
      {showScratchpad && (
        <Scratchpad
          lang={lang}
          onClose={() => setShowScratchpad(false)}
        />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          lang={lang}
          onResume={() => setIsPaused(false)}
          onRestart={handleNextTask}
          onQuit={onBack}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      )}
    </div>
  );
};
