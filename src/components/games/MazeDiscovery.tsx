import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MapControls, OrthographicCamera } from '@react-three/drei';
import { ArrowLeft, Coins, LocateFixed, Maximize, Minimize, Play, RotateCcw, Sparkles, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { BoxGeometry, Color, MathUtils, MeshStandardMaterial, MOUSE, Object3D, OrthographicCamera as OrthographicCameraType, PlaneGeometry, SphereGeometry, TOUCH, Vector3, type Group, type InstancedMesh, type Mesh } from 'three';
import { Language, PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import { Cell, findCell, getMazeLevel, MAZE_MATRIX_SIZES, MazeMatrixSize, sameCell } from './mazeLevels';
import { useGameStore } from './useGameStore';

interface MazeDiscoveryProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const cellWorld = (cell: Cell, width: number, height: number): [number, number, number] => [
  cell[0] - (width - 1) / 2,
  0,
  cell[1] - (height - 1) / 2,
];

function MazeCamera({
  matrixSize,
  levelNumber,
  planning,
  controlsRef,
}: {
  matrixSize: MazeMatrixSize;
  levelNumber: number;
  planning: boolean;
  controlsRef: React.MutableRefObject<any>;
}) {
  const camera = useThree((state) => state.camera) as OrthographicCameraType;
  const viewport = useThree((state) => state.size);
  const wasPlanning = useRef(planning);
  const previousBoard = useRef(`${matrixSize}:${levelNumber}`);
  const transitioning = useRef(false);
  const spawn = cellWorld(findCell(getMazeLevel(levelNumber, matrixSize).grid, 2), matrixSize, matrixSize);
  const cameraPosition = useMemo(() => [spawn[0], matrixSize * 0.8, spawn[2] + 0.001] as [number, number, number], [matrixSize, spawn[0], spawn[2]]);
  const cameraUp = useMemo(() => [0, 0, -1] as [number, number, number], []);
  const mapTarget = useMemo(() => [spawn[0], 0, spawn[2]] as [number, number, number], [spawn[0], spawn[2]]);
  const planningZoom = matrixSize / 20;
  const executionZoom = matrixSize / 32;

  useEffect(() => {
    const aspect = viewport.width / Math.max(1, viewport.height);
    const halfHeight = (matrixSize + 4) / 2;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
  }, [camera, matrixSize, viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const state = useGameStore.getState();
    const boardKey = `${matrixSize}:${levelNumber}`;
    const boardChanged = previousBoard.current !== boardKey;
    const modeChanged = wasPlanning.current !== planning;
    const blend = 1 - Math.exp(-delta * 4);
    const start = spawn;

    if (boardChanged || modeChanged) {
      previousBoard.current = boardKey;
      wasPlanning.current = planning;
      transitioning.current = true;
      if (planning) controls.target.set(start[0], 0, start[2]);
    }

    if (planning) {
      if (transitioning.current) {
        const target = new Vector3(start[0], matrixSize * 0.8, start[2] + 0.001);
        controls.target.lerp(new Vector3(start[0], 0, start[2]), blend);
        camera.position.lerp(target, blend);
        camera.zoom = MathUtils.damp(camera.zoom, planningZoom, 4, delta);
        camera.up.lerp(new Vector3(0, 0, -1), blend).normalize();
        if (camera.position.distanceTo(target) < 0.08 && Math.abs(camera.zoom - planningZoom) < 0.05) transitioning.current = false;
      } else {
        camera.up.set(0, 0, -1);
      }
    } else {
      const robot = cellWorld(state.playerPosition, matrixSize, matrixSize);
      const target = new Vector3(robot[0], 0, robot[2]);
      const desiredCamera = new Vector3(robot[0] + 12, 16, robot[2] + 12);
      controls.target.lerp(target, blend);
      camera.position.lerp(desiredCamera, blend);
      if (transitioning.current) camera.zoom = MathUtils.damp(camera.zoom, executionZoom, 4, delta);
      camera.up.lerp(new Vector3(0, 1, 0), blend).normalize();
      if (Math.abs(camera.zoom - executionZoom) < 0.05) transitioning.current = false;
    }

    controls.enabled = !transitioning.current;
    camera.lookAt(controls.target);
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={cameraPosition}
        zoom={planningZoom}
        near={0.1}
        far={matrixSize * 3 + 100}
        up={cameraUp}
      />
      <MapControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
        enablePan={planning}
        enableZoom
        minZoom={0.3}
        maxZoom={matrixSize}
        mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        target={mapTarget}
      />
    </>
  );
}

const StableMazeCamera = React.memo(MazeCamera);

function Robot({ width, height }: { width: number; height: number }) {
  const robot = useRef<Group>(null);

  useLayoutEffect(() => {
    const position = cellWorld(useGameStore.getState().playerPosition, width, height);
    robot.current?.position.set(position[0], 0.18, position[2]);
  }, [height, width]);

  useFrame((state, delta) => {
    if (!robot.current) return;
    const target = cellWorld(useGameStore.getState().playerPosition, width, height);
    const blend = 1 - Math.exp(-delta * 30);
    robot.current.position.x = MathUtils.lerp(robot.current.position.x, target[0], blend);
    robot.current.position.z = MathUtils.lerp(robot.current.position.z, target[2], blend);
    robot.current.position.y = 0.18 + Math.sin(state.clock.elapsedTime * 4) * 0.035;
  });

  return (
    <group ref={robot}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.48, 0.42, 0.4]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.32} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0, 0.67, 0]}>
        <boxGeometry args={[0.56, 0.43, 0.44]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.28} metalness={0.12} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.69, 0.225]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.93, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.16, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Coin({ position }: { position: [number, number, number] }) {
  const coin = useRef<Mesh>(null);
  useFrame((state) => {
    if (coin.current) {
      coin.current.rotation.y = state.clock.elapsedTime * 1.7;
      coin.current.position.y = 0.28 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
    }
  });
  return (
    <mesh ref={coin} position={[position[0], 0.28, position[2]]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.2, 0.07, 10, 20]} />
      <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.45} metalness={0.45} roughness={0.25} />
    </mesh>
  );
}

const traceGridCells = (from: Cell, to: Cell): Cell[] => {
  const deltaX = to[0] - from[0];
  const deltaY = to[1] - from[1];
  const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  const cells: Cell[] = [];
  let x = from[0];
  let y = from[1];

  for (let step = 1; step <= steps; step += 1) {
    const targetX = Math.round(from[0] + (deltaX * step) / steps);
    const targetY = Math.round(from[1] + (deltaY * step) / steps);
    while (x !== targetX || y !== targetY) {
      if (x !== targetX && (y === targetY || Math.abs(targetX - x) >= Math.abs(targetY - y))) x += Math.sign(targetX - x);
      else y += Math.sign(targetY - y);
      cells.push([x, y]);
    }
  }
  return cells;
};

function MazeBoard({ levelNumber, matrixSize, controlsRef }: {
  levelNumber: number;
  matrixSize: MazeMatrixSize;
  controlsRef: React.MutableRefObject<any>;
}) {
  const level = getMazeLevel(levelNumber, matrixSize);
  const width = matrixSize;
  const height = matrixSize;
  const cellCount = width * height;
  const gameState = useGameStore((state) => state.gameState);
  const viewport = useThree((state) => state.size);
  const plannedPath = useGameStore((state) => state.plannedPath);
  const collectedCoins = useGameStore((state) => state.collectedCoins);
  const addPathStep = useGameStore((state) => state.addPathStep);
  const startPathDrawing = useGameStore((state) => state.startPathDrawing);
  const endPathDrawing = useGameStore((state) => state.endPathDrawing);
  const planning = gameState === 'PLANNING';
  const start = findCell(level.grid, 2);
  const goal = findCell(level.grid, 3);
  const floorRef = useRef<InstancedMesh>(null);
  const wallsRef = useRef<InstancedMesh>(null);
  const pathRef = useRef<InstancedMesh>(null);
  const drawing = useRef(false);
  const panGesture = useRef(false);
  const pointerCell = useRef<Cell | null>(null);
  const previousPointer = useRef<{ x: number; y: number } | null>(null);
  const previousPath = useRef<Cell[]>([]);
  const floorGeometry = useMemo(() => new PlaneGeometry(0.94, 0.94), []);
  const floorMaterial = useMemo(() => new MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 }), []);
  const wallGeometry = useMemo(() => new BoxGeometry(0.9, 0.96, 0.9), []);
  const wallMaterial = useMemo(() => new MeshStandardMaterial({ color: '#64748b', roughness: 0.58 }), []);
  const pathGeometry = useMemo(() => new SphereGeometry(0.14, 8, 8), []);
  const pathMaterial = useMemo(() => new MeshStandardMaterial({ color: '#c084fc', emissive: '#a855f7', emissiveIntensity: 1.1 }), []);
  const coinCell = findCell(level.grid, 4);
  const coinKey = `${levelNumber}:${matrixSize}:${coinCell[0]},${coinCell[1]}`;
  const hasCoin = !collectedCoins.includes(coinKey);
  const walls = useMemo(() => level.grid.flatMap((row, y) => row.flatMap((value, x) => value === 1 ? [[x, y] as Cell] : [])), [level.grid]);

  useLayoutEffect(() => {
    const floor = floorRef.current;
    const wallMesh = wallsRef.current;
    if (!floor || !wallMesh) return;
    const transform = new Object3D();
    const color = new Color();
    let instance = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const value = level.grid[y][x];
        transform.position.set(x - (width - 1) / 2, 0, y - (height - 1) / 2);
        transform.rotation.set(-Math.PI / 2, 0, 0);
        transform.updateMatrix();
        floor.setMatrixAt(instance, transform.matrix);
        color.set(value === 1 ? '#94a3b8' : value === 2 ? '#dbeafe' : value === 3 ? '#bbf7d0' : value === 4 ? '#fef3c7' : (x + y) % 2 ? '#f8fafc' : '#e0f2fe');
        floor.setColorAt(instance, color);
        instance += 1;
      }
    }
    floor.instanceMatrix.needsUpdate = true;
    if (floor.instanceColor) floor.instanceColor.needsUpdate = true;
    floor.computeBoundingSphere();

    walls.forEach(([x, y], index) => {
      transform.position.set(x - (width - 1) / 2, 0.48, y - (height - 1) / 2);
      transform.rotation.set(0, 0, 0);
      transform.updateMatrix();
      wallMesh.setMatrixAt(index, transform.matrix);
    });
    wallMesh.instanceMatrix.needsUpdate = true;
    wallMesh.computeBoundingSphere();
  }, [height, level.grid, walls, width]);

  useLayoutEffect(() => {
    const mesh = pathRef.current;
    if (!mesh) return;
    const oldPath = previousPath.current;
    const append = plannedPath.length === oldPath.length + 1
      && (!oldPath.length || sameCell(oldPath[oldPath.length - 1], plannedPath[oldPath.length - 1]));
    const firstChanged = append ? oldPath.length : 0;
    const transform = new Object3D();
    for (let index = firstChanged; index < plannedPath.length; index += 1) {
      const position = cellWorld(plannedPath[index], width, height);
      transform.position.set(position[0], 0.13, position[2]);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    }
    mesh.count = plannedPath.length;
    mesh.instanceMatrix.needsUpdate = true;
    previousPath.current = plannedPath;
  }, [height, plannedPath, width]);

  const cellAtPoint = (event: { point: Vector3 }): Cell | null => {
    const x = Math.round(event.point.x + (width - 1) / 2);
    const y = Math.round(event.point.z + (height - 1) / 2);
    return x >= 0 && y >= 0 && x < width && y < height ? [x, y] : null;
  };

  const drawTo = (target: Cell) => {
    if (!pointerCell.current) return;
    for (const cell of traceGridCells(pointerCell.current, target)) {
      const state = useGameStore.getState();
      const tail = state.plannedPath[state.plannedPath.length - 1] ?? start;
      if (level.grid[cell[1]][cell[0]] === 1) break;
      if (!sameCell(cell, tail) && Math.abs(cell[0] - tail[0]) + Math.abs(cell[1] - tail[1]) !== 1) break;
      if (!sameCell(cell, tail)) addPathStep(cell);
    }
    pointerCell.current = target;
  };

  const stopDrawing = (event?: { pointerId: number; target: unknown }) => {
    drawing.current = false;
    panGesture.current = false;
    pointerCell.current = null;
    previousPointer.current = null;
    endPathDrawing();
    const target = event?.target as { releasePointerCapture?: (id: number) => void } | undefined;
    if (event) target?.releasePointerCapture?.(event.pointerId);
  };

  return (
    <>
      <StableMazeCamera matrixSize={matrixSize} levelNumber={levelNumber} planning={planning} controlsRef={controlsRef} />
      <color attach="background" args={['#dff6ff']} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 6]} intensity={2.1} />
      <hemisphereLight args={['#ffffff', '#b7e4c7', 0.65]} />
      <instancedMesh ref={floorRef} args={[floorGeometry, floorMaterial, cellCount]} raycast={() => {}} />
      <instancedMesh ref={wallsRef} args={[wallGeometry, wallMaterial, walls.length]} raycast={() => {}} />
      <instancedMesh ref={pathRef} args={[pathGeometry, pathMaterial, cellCount]} raycast={() => {}} />
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(event) => {
          if (!planning || event.nativeEvent.button !== 0) return;
          const cell = cellAtPoint(event);
          if (!cell) {
            event.stopPropagation();
            panGesture.current = true;
            previousPointer.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
            (event.target as unknown as { setPointerCapture?: (id: number) => void }).setPointerCapture?.(event.pointerId);
            return;
          }
          event.stopPropagation();
          drawing.current = true;
          pointerCell.current = cell;
          startPathDrawing();
          const tail = useGameStore.getState().plannedPath.at(-1) ?? start;
          if (!sameCell(cell, tail)) addPathStep(cell);
          (event.target as unknown as { setPointerCapture?: (id: number) => void }).setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (panGesture.current && previousPointer.current) {
            event.stopPropagation();
            const point = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
            const camera = controlsRef.current?.object as OrthographicCameraType | undefined;
            if (camera) {
              const scale = (camera.top - camera.bottom) / (camera.zoom * Math.max(1, viewport.height));
              const deltaX = (point.x - previousPointer.current.x) * scale;
              const deltaY = (point.y - previousPointer.current.y) * scale;
              const panOffset = new Vector3(-deltaX, 0, 0).addScaledVector(camera.up, deltaY);
              camera.position.add(panOffset);
              controlsRef.current.target.add(panOffset);
              camera.lookAt(controlsRef.current.target);
              camera.updateMatrixWorld();
            }
            previousPointer.current = point;
            return;
          }
          if (!drawing.current || !useGameStore.getState().isDrawingPath) return;
          const cell = cellAtPoint(event);
          if (cell) drawTo(cell);
        }}
        onPointerUp={(event) => stopDrawing(event)}
        onPointerCancel={(event) => stopDrawing(event)}
        onPointerOver={() => { if (planning) document.body.style.cursor = 'crosshair'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <planeGeometry args={[Math.max(width * 3, 40), Math.max(height * 3, 40)]} />
        <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh position={[cellWorld(start, width, height)[0], 0.06, cellWorld(start, width, height)[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.07, 8, 20]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[cellWorld(goal, width, height)[0], 0.08, cellWorld(goal, width, height)[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.08, 8, 20]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {hasCoin && <Coin position={cellWorld(coinCell, width, height)} />}
      <Robot width={width} height={height} />
    </>
  );
}

export const MazeDiscovery: React.FC<MazeDiscoveryProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const matrixSize = useGameStore((state) => state.matrixSize);
  const gameState = useGameStore((state) => state.gameState);
  const plannedPath = useGameStore((state) => state.plannedPath);
  const isDrawingPath = useGameStore((state) => state.isDrawingPath);
  const attempts = useGameStore((state) => state.attemptsThisLevel);
  const coinsCollected = useGameStore((state) => state.coinsCollected);
  const levelStars = useGameStore((state) => state.levelStars);
  const bestStars = useGameStore((state) => state.bestStarsByLevel[currentLevel] ?? 0);
  const lastResult = useGameStore((state) => state.lastResult);
  const setMatrixSize = useGameStore((state) => state.setMatrixSize);
  const addPathStep = useGameStore((state) => state.addPathStep);
  const clearPath = useGameStore((state) => state.clearPath);
  const startExecution = useGameStore((state) => state.startExecution);
  const movePlayer = useGameStore((state) => state.movePlayer);
  const finishExecution = useGameStore((state) => state.finishExecution);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const nextLevel = useGameStore((state) => state.nextLevel);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const timer = useRef<number | null>(null);
  const cameraControls = useRef<any>(null);
  const mapFrameRef = useRef<HTMLDivElement>(null);
  const level = getMazeLevel(currentLevel, matrixSize);

  useEffect(() => {
    const syncFullscreen = () => setMapFullscreen(document.fullscreenElement === mapFrameRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    if (gameState !== 'EXECUTING') return;
    const path = [...plannedPath];
    const goal = findCell(level.grid, 3);
    const stepDelay = path.length > 50 ? Math.max(12, Math.min(420, 30000 / path.length)) : 420;
    let index = 0;

    const moveNext = () => {
      const step = path[index];
      if (!step) {
        finishExecution(false);
        sound.playWrong();
        return;
      }
      if (!movePlayer(step)) {
        sound.playWrong();
        return;
      }
      index += 1;
      if (level.grid[step[1]][step[0]] === 4) sound.playCoin();
      if (sameCell(step, goal)) {
        const reward = finishExecution(true);
        sound.playFanfare();
        if (reward) onUpdateStats(reward.starsEarned, reward.coinsEarned, reward.level);
        return;
      }
      timer.current = window.setTimeout(moveNext, stepDelay);
    };

    timer.current = window.setTimeout(moveNext, 260);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [gameState, currentLevel, matrixSize, plannedPath, level.grid, finishExecution, movePlayer, onUpdateStats]);

  const status = gameState === 'WIN'
    ? 'Ziel erreicht! Stark geplant, Robo-Profi!'
    : gameState === 'EXECUTING'
      ? 'Robi folgt deinem Plan …'
      : lastResult === 'wall'
        ? 'Plopp! Ein Hindernis. Plane einen neuen Weg.'
        : lastResult === 'missed-goal'
          ? 'Fast! Robi braucht noch einen Weg bis zum grünen Ziel.'
          : 'Ziehe über benachbarte Felder. Lass los, um den markierten Weg später fortzusetzen; LOS startet Robi.';

  const handleBack = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    resetLevel();
    onBack();
  };

  const zoomCamera = (factor: number) => {
    const camera = cameraControls.current?.object as OrthographicCameraType | undefined;
    if (!camera) return;
    camera.zoom = MathUtils.clamp(camera.zoom * factor, 0.3, matrixSize);
    camera.updateProjectionMatrix();
    cameraControls.current.update();
  };

  const centerCamera = () => {
    const controls = cameraControls.current;
    if (!controls) return;
    const position = cellWorld(useGameStore.getState().playerPosition, matrixSize, matrixSize);
    const offsetX = position[0] - controls.target.x;
    const offsetZ = position[2] - controls.target.z;
    controls.target.x = position[0];
    controls.target.z = position[2];
    controls.object.position.x += offsetX;
    controls.object.position.z += offsetZ;
    controls.update();
  };

  const toggleMapFullscreen = async () => {
    const mapFrame = mapFrameRef.current;
    if (!mapFrame) return;
    try {
      if (document.fullscreenElement === mapFrame) await document.exitFullscreen();
      else await mapFrame.requestFullscreen();
    } catch {
      setMapFullscreen(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-sky-100 via-cyan-50 to-violet-100 px-3 py-4 text-slate-800 sm:px-6 sm:py-5">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <button onClick={handleBack} className="flex min-h-12 items-center gap-2 rounded-2xl border-2 border-white bg-white/90 px-4 font-black text-slate-700 shadow-sm" aria-label="Zurück zur Spielkarte">
          <ArrowLeft className="h-5 w-5" /> Zurück
        </button>
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-sky-700">{player.name} · Mission Robi</p>
          <h1 className="font-['Fredoka'] text-xl font-black text-slate-900 sm:text-3xl">🧩 Wegfinder 3D</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleMute} className="min-h-12 rounded-2xl border-2 border-white bg-white/90 px-3 font-black text-slate-700 shadow-sm" aria-label={isMuted ? 'Ton einschalten' : 'Ton ausschalten'}>{isMuted ? '🔇' : '🔊'}</button>
          <div className="rounded-2xl border-2 border-white bg-white/90 px-3 py-2 font-black text-amber-700 shadow-sm">⭐ {player.stars}</div>
        </div>
      </header>

      <section className="mx-auto mt-4 max-w-7xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/80 bg-white/80 px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-sky-700">Level {currentLevel} / 100</p>
            <h2 className="font-['Fredoka'] text-lg font-black text-slate-800 sm:text-xl">{level.name}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-900">
              Matrixgröße
              <select
                value={matrixSize}
                disabled={gameState === 'EXECUTING'}
                onChange={(event) => setMatrixSize(Number(event.target.value) as MazeMatrixSize)}
                className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-sm font-black"
                aria-label="Matrixgröße wählen. Ein Wechsel startet Level 1 neu."
              >
                {MAZE_MATRIX_SIZES.map((size) => <option key={size} value={size}>{size} × {size}</option>)}
              </select>
            </label>
            <span className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-800"><Coins className="mr-1 inline h-4 w-4" />{coinsCollected}</span>
            <span className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-black text-violet-800">⭐ {'★'.repeat(bestStars)}{'☆'.repeat(3 - bestStars)}</span>
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(290px,0.7fr)]">
          <div className="overflow-hidden rounded-3xl border-4 border-white bg-sky-100 shadow-xl">
            <div
              ref={mapFrameRef}
              className={mapFullscreen
                ? 'fixed inset-0 z-[100] h-[100dvh] w-screen touch-none bg-sky-100'
                : 'relative aspect-square w-full touch-none'}
            >
              <Canvas dpr={[1, 1.5]} aria-label="3D-Labyrinth. Ziehe eine Linie über benachbarte Felder, um einen Weg zu planen.">
                <MazeBoard levelNumber={currentLevel} matrixSize={matrixSize} controlsRef={cameraControls} />
              </Canvas>
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
                <button onClick={() => zoomCamera(1.35)} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-white bg-white/90 text-slate-700 shadow" aria-label="Heranzoomen"><ZoomIn className="h-5 w-5" /></button>
                <button onClick={() => zoomCamera(0.74)} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-white bg-white/90 text-slate-700 shadow" aria-label="Herauszoomen"><ZoomOut className="h-5 w-5" /></button>
                <button onClick={centerCamera} disabled={gameState === 'EXECUTING'} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-white bg-white/90 text-slate-700 shadow disabled:opacity-50" aria-label="Robi zentrieren"><LocateFixed className="h-5 w-5" /></button>
                <button onClick={toggleMapFullscreen} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-white bg-white/90 text-slate-700 shadow" aria-label={mapFullscreen ? 'Vollbild beenden' : 'Karte im Vollbild öffnen'}>{mapFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}</button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 bg-white/90 px-3 py-2 text-xs font-black text-slate-600">
              <span>🤖 Robi</span><span>🟡 Münze</span><span>🟢 Ziel</span><span>⬜ Weg</span><span>🪨 Wand</span>
              <span>Im Raster ziehen: Weg zeichnen</span><span>Außerhalb des Rasters ziehen: Karte bewegen</span>
            </div>
          </div>

          <aside className="rounded-3xl border-2 border-white bg-white/90 p-4 shadow-xl sm:p-5">
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-sky-700">Erst planen, dann los!</p>
              <p className="mt-1 min-h-12 text-sm font-bold text-slate-700" aria-live="polite">{status}</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky-100" aria-label={`Geplante Schritte: ${plannedPath.length} von ${level.maxSteps}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all" style={{ width: `${Math.min(100, (plannedPath.length / level.maxSteps) * 100)}%` }} />
              </div>
              <p className="mt-1 text-right text-xs font-black text-sky-800">Schritte: {plannedPath.length} / {level.maxSteps}</p>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
              <span className="text-sm font-black text-amber-900">Pläne übrig</span>
              <span className="text-lg font-black text-amber-800">{Math.max(0, 3 - attempts)} / 3</span>
            </div>
            {attempts >= 3 && gameState === 'PLANNING' && <p className="mt-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800">Du darfst weiterprobieren. Ab jetzt gibt es 0 Sterne – übe so lange du magst!</p>}

            {gameState === 'WIN' ? (
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-50 p-4 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
                <h3 className="mt-1 font-['Fredoka'] text-xl font-black text-emerald-900">Geschafft!</h3>
                <p className="mt-1 text-2xl tracking-widest text-amber-500">{'★'.repeat(levelStars)}{'☆'.repeat(3 - levelStars)}</p>
                {currentLevel < 100 ? (
                  <button onClick={nextLevel} className="mt-3 min-h-14 w-full rounded-2xl bg-emerald-600 px-4 font-black text-white shadow-lg transition hover:bg-emerald-700 active:scale-95">Nächstes Labyrinth ▶</button>
                ) : <p className="mt-3 font-black text-emerald-800">Du hast alle 100 Level geschafft!</p>}
                <button onClick={resetLevel} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white font-black text-slate-700 shadow-sm"><RotateCcw className="h-4 w-4" /> Level noch einmal spielen</button>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={clearPath} disabled={gameState !== 'PLANNING' || plannedPath.length === 0} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 font-black text-slate-700 transition active:scale-95 disabled:opacity-45"><Trash2 className="h-5 w-5" /> Weg löschen</button>
                  <button onClick={startExecution} disabled={gameState !== 'PLANNING' || isDrawingPath || plannedPath.length === 0} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 font-black text-white shadow-lg transition hover:brightness-105 active:scale-95 disabled:opacity-45"><Play className="h-5 w-5 fill-white" /> LOS!</button>
                </div>
                <p className="mt-3 text-center text-xs font-bold text-slate-500">Lass los, um weiterzuplanen. Der Weg bleibt markiert, bis du auf LOS drückst.</p>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
};
