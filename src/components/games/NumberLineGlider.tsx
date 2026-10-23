import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Pause, Star, Trophy, Sparkles, Heart, HelpCircle, PenTool } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { t } from '../../math/translations';
import { sound } from '../../audio/soundManager';
import { generateStellenwertTask, StellenwertTask } from '../../math/curriculum';
import { PauseModal } from '../PauseModal';
import { VictoryModal } from '../VictoryModal';
import { Scratchpad } from '../Scratchpad';

interface NumberLineGliderProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

interface Orb {
  id: string;
  x: number;
  y: number;
  value: number;
  radius: number;
  speed: number;
  isCorrect: boolean;
  color: string;
}

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const NumberLineGlider: React.FC<NumberLineGliderProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [task, setTask] = useState<StellenwertTask>(() => generateStellenwertTask());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  // Player ship position
  const shipPosRef = useRef({ x: 300, y: 500, vx: 0, targetX: 300 });
  const keysRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({
    left: false,
    right: false,
    shoot: false,
  });
  const orbsRef = useRef<Orb[]>([]);
  const particlesRef = useRef<StarParticle[]>([]);
  const lasersRef = useRef<{ x: number; y: number; vy: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const cameraShakeRef = useRef<number>(0);

  // Spawn orbs for current task
  const spawnOrbsForTask = (currentTask: StellenwertTask, canvasWidth: number) => {
    const newOrbs: Orb[] = [];
    const colors = ['#38bdf8', '#fbbf24', '#a855f7', '#f43f5e'];

    // Place the 4 options across the horizontal lanes
    const laneWidth = canvasWidth / 4;
    currentTask.options.forEach((optValue, i) => {
      const isCorrect = optValue === currentTask.answer;
      newOrbs.push({
        id: `orb_${i}_${Date.now()}`,
        x: laneWidth * i + laneWidth / 2,
        y: -40 - Math.random() * 40,
        value: optValue,
        radius: 36,
        speed: 1.2 + Math.min(score * 0.05, 1.8),
        isCorrect,
        color: colors[i % colors.length],
      });
    });

    orbsRef.current = newOrbs;
  };

  // Init orbs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      spawnOrbsForTask(task, canvas.width || 600);
    }
  }, [task]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = true;
      } else if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        shootLaser();
      } else if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  const shootLaser = () => {
    if (isPaused || showVictory) return;
    sound.playLaser();
    lasersRef.current.push({
      x: shipPosRef.current.x,
      y: shipPosRef.current.y - 30,
      vy: -14,
    });
  };

  const handleCorrectHit = (orb: Orb) => {
    sound.playCorrect();
    // Burst particles
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particlesRef.current.push({
        x: orb.x,
        y: orb.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 35,
        color: '#fef08a',
      });
    }

    cameraShakeRef.current = 6;
    const newStreak = streak + 1;
    const addedScore = 100 + newStreak * 20;
    setScore((s) => s + addedScore);
    setStreak(newStreak);
    setSolvedCount((c) => {
      const nextCount = c + 1;
      if (nextCount >= 8) {
        setShowVictory(true);
        onUpdateStats(3, Math.floor(score / 50) + 10, score + addedScore);
      }
      return nextCount;
    });

    // Next task
    setTask(generateStellenwertTask());
    setShowHint(false);
  };

  const handleWrongHit = (orb: Orb) => {
    sound.playWrong();
    cameraShakeRef.current = 10;
    setStreak(0);
    setLives((l) => {
      const nextLives = l - 1;
      if (nextLives <= 0) {
        // Soft reset lives with a friendly bounce
        sound.playHit();
        return 3;
      }
      return nextLives;
    });
    // Remove orb
    orbsRef.current = orbsRef.current.filter((o) => o.id !== orb.id);
  };

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize
    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      shipPosRef.current.y = canvas.height - 85;
      if (shipPosRef.current.x > canvas.width) {
        shipPosRef.current.x = canvas.width / 2;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Starfield background
    const starsBg = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.8,
      speed: Math.random() * 0.8 + 0.3,
    }));

    const render = (time: number) => {
      const rawDt = (time - lastTimeRef.current) / 1000;
      const dt = Math.min(rawDt, 0.05);
      lastTimeRef.current = time;

      if (!isPaused && !showVictory) {
        // Player Ship Movement
        const speed = 480;
        if (keysRef.current.left) {
          shipPosRef.current.x -= speed * dt;
        }
        if (keysRef.current.right) {
          shipPosRef.current.x += speed * dt;
        }

        // Clamp
        shipPosRef.current.x = Math.max(45, Math.min(canvas.width - 45, shipPosRef.current.x));

        // Update Lasers
        lasersRef.current.forEach((laser) => {
          laser.y += laser.vy;
        });
        lasersRef.current = lasersRef.current.filter((l) => l.y > -20);

        // Update Orbs
        orbsRef.current.forEach((orb) => {
          orb.y += orb.speed;
        });

        // Laser - Orb Collision
        lasersRef.current.forEach((laser, lIdx) => {
          orbsRef.current.forEach((orb) => {
            const dx = laser.x - orb.x;
            const dy = laser.y - orb.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < orb.radius + 8) {
              lasersRef.current.splice(lIdx, 1);
              if (orb.isCorrect) {
                handleCorrectHit(orb);
              } else {
                handleWrongHit(orb);
              }
            }
          });
        });

        // Respawn if all orbs fall off screen
        if (orbsRef.current.length > 0 && orbsRef.current.every((o) => o.y > canvas.height + 50)) {
          spawnOrbsForTask(task, canvas.width);
        }

        // Update Particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
      }

      // Draw Scene
      ctx.save();

      // Screen Shake
      if (cameraShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * cameraShakeRef.current * 2;
        const shakeY = (Math.random() - 0.5) * cameraShakeRef.current * 2;
        ctx.translate(shakeX, shakeY);
        cameraShakeRef.current *= 0.88;
        if (cameraShakeRef.current < 0.2) cameraShakeRef.current = 0;
      }

      // Sky Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.6, '#1e1b4b');
      grad.addColorStop(1, '#311042');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      ctx.fillStyle = '#ffffff';
      starsBg.forEach((star) => {
        if (!isPaused && !showVictory) {
          star.y += star.speed;
          if (star.y > canvas.height) star.y = 0;
        }
        ctx.globalAlpha = Math.sin(star.y * 0.05) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Floating Orbs
      orbsRef.current.forEach((orb) => {
        ctx.save();
        ctx.translate(orb.x, orb.y);

        // Glow
        ctx.shadowBlur = 16;
        ctx.shadowColor = orb.color;

        // Outer bubble
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(0, 0, orb.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-orb.radius * 0.3, -orb.radius * 0.3, orb.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Text value
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${orb.value}`, 0, 2);

        ctx.restore();
      });

      // Draw Lasers
      lasersRef.current.forEach((l) => {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillRect(l.x - 3, l.y, 6, 18);
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Ship (Cute Space Fox Glider)
      const ship = shipPosRef.current;
      ctx.save();
      ctx.translate(ship.x, ship.y);

      // Jet flame
      const flameHeight = Math.random() * 12 + 14;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(0, 20 + flameHeight);
      ctx.lineTo(10, 20);
      ctx.fill();

      // Glider Wings
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(36, 18);
      ctx.lineTo(16, 14);
      ctx.lineTo(0, 24);
      ctx.lineTo(-16, 14);
      ctx.lineTo(-36, 18);
      ctx.closePath();
      ctx.fill();

      // Wing trim
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cockpit / Character bubble
      ctx.fillStyle = '#fbbf24'; // Golden Fox face
      ctx.beginPath();
      ctx.arc(0, -2, 14, 0, Math.PI * 2);
      ctx.fill();

      // Fox ears
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(-6, -18);
      ctx.lineTo(0, -8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, -8);
      ctx.lineTo(6, -18);
      ctx.lineTo(0, -8);
      ctx.fill();

      // Fox eyes & nose
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(-4, -2, 2, 0, Math.PI * 2);
      ctx.arc(4, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 3, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Zahlenstrahl visual preview (0 to 1000 bottom bar)
      const barY = canvas.height - 24;
      const barPadding = 50;
      const barWidth = canvas.width - barPadding * 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(barPadding, barY, barWidth, 4);

      // Marks at 0, 250, 500, 750, 1000
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      [0, 250, 500, 750, 1000].forEach((mark) => {
        const mx = barPadding + (mark / 1000) * barWidth;
        ctx.fillRect(mx - 1, barY - 4, 2, 12);
        ctx.fillText(`${mark}`, mx, barY + 18);
      });

      // Target pin on the number line
      const targetX = barPadding + (task.answer / 1000) * barWidth;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(targetX, barY + 2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [task, isPaused, showVictory, score, streak]);

  // Touch / Click on lane to move and shoot
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    shipPosRef.current.x = clickX;
    shootLaser();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950 select-none">
      {/* Top HUD Cluster (Low Occlusion, Tabular numbers) */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playJump();
              onBack();
            }}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer backdrop-blur transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer backdrop-blur transition"
          >
            <Pause className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold border border-indigo-400 cursor-pointer backdrop-blur transition"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">{t(lang, 'scratchpad')}</span>
          </button>
        </div>

        {/* Current Mission Card */}
        <div className="pointer-events-auto bg-slate-900/90 border-2 border-indigo-500/80 rounded-2xl px-4 py-2 text-center shadow-lg shadow-indigo-500/10 backdrop-blur max-w-md mx-2">
          <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'de' ? task.questionDe : task.questionVi}</span>
          </div>

          {/* Stellenwert Visual Blocks (H - Z - E breakdown) */}
          <div className="flex items-center justify-center gap-2 mt-1 font-['Fredoka']">
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-2 py-0.5 rounded-lg text-xs font-bold">
              {task.h} H
            </div>
            <div className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded-lg text-xs font-bold">
              {task.z} Z
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-lg text-xs font-bold">
              {task.e} E
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="text-slate-400 hover:text-amber-300 transition cursor-pointer ml-1"
              title="Tipp anzeigen"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {showHint && (
            <div className="text-[11px] text-amber-300 font-medium mt-1 animate-in fade-in">
              💡 {lang === 'de' ? task.hintDe : task.hintVi}
            </div>
          )}
        </div>

        {/* Stats Cluster */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/80 px-2.5 py-1.5 rounded-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Score & Streak */}
          <div className="bg-slate-900/80 border border-slate-700/80 px-3 py-1 rounded-xl text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t(lang, 'score')}</div>
            <div className="text-base font-black text-amber-400 tabular-nums font-['Fredoka']">
              {score}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Canvas */}
      <div className="flex-1 w-full h-full relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Onscreen Mobile / Tablet Touch Controls (Left / Right / Shoot) */}
        <div className="sm:hidden absolute bottom-8 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button
              onMouseDown={() => (keysRef.current.left = true)}
              onMouseUp={() => (keysRef.current.left = false)}
              onTouchStart={() => (keysRef.current.left = true)}
              onTouchEnd={() => (keysRef.current.left = false)}
              className="w-14 h-14 bg-slate-800/80 border-2 border-indigo-400 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-indigo-600 transition"
            >
              ◀
            </button>
            <button
              onMouseDown={() => (keysRef.current.right = true)}
              onMouseUp={() => (keysRef.current.right = false)}
              onTouchStart={() => (keysRef.current.right = true)}
              onTouchEnd={() => (keysRef.current.right = false)}
              className="w-14 h-14 bg-slate-800/80 border-2 border-indigo-400 rounded-2xl flex items-center justify-center text-white text-2xl active:bg-indigo-600 transition"
            >
              ▶
            </button>
          </div>

          <button
            onClick={shootLaser}
            className="pointer-events-auto w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg text-lg active:scale-90 transition"
          >
            ⚡
          </button>
        </div>
      </div>

      {/* Scratchpad Window */}
      {showScratchpad && (
        <Scratchpad lang={lang} onClose={() => setShowScratchpad(false)} />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          lang={lang}
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            setScore(0);
            setStreak(0);
            setLives(3);
            setSolvedCount(0);
            setTask(generateStellenwertTask());
          }}
          onQuit={onBack}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      )}

      {/* Victory Modal */}
      {showVictory && (
        <VictoryModal
          lang={lang}
          score={score}
          starsEarned={3}
          streak={streak}
          coinsEarned={15}
          onNext={() => {
            setShowVictory(false);
            setSolvedCount(0);
            setTask(generateStellenwertTask());
          }}
          onRestart={() => {
            setShowVictory(false);
            setScore(0);
            setStreak(0);
            setLives(3);
            setSolvedCount(0);
            setTask(generateStellenwertTask());
          }}
          onQuit={onBack}
        />
      )}
    </div>
  );
};
