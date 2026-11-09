import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color, Object3D, TorusGeometry, type InstancedMesh, type OrthographicCamera } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Animal, Round } from './engine';
import { SYMBOL_BY_SEAT } from './symbols';

interface BoardProps {
  round: Round; enabled: boolean; reducedMotion: boolean; zoom: number;
  onMove: (index: number) => void; onFailure: () => void;
}

function FitCamera({ size, zoom }: { size: number; zoom: number }) {
  const camera = useThree(state => state.camera) as OrthographicCamera;
  const viewport = useThree(state => state.size);
  useLayoutEffect(() => {
    const aspect = viewport.width / Math.max(1, viewport.height);
    const halfHeight = Math.max(size * 0.63, size * 0.6 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.zoom = zoom;
    camera.position.set(0, size * 1.8, size * 1.05);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, zoom, viewport.width, viewport.height]);
  return null;
}

type Vec3 = [number, number, number];
/** Batch glossy crosses and rings, keeping even a full 15×15 board cheap. */
function SymbolPieces({ round, seat, reducedMotion }: { round: Round; seat: Animal; reducedMotion: boolean }) {
  const symbol = SYMBOL_BY_SEAT[seat];
  const occupied = useMemo(() => round.board.flatMap((cell, index) => cell === seat ? [index] : []), [round.board, seat]);
  const rotations = useMemo<Vec3[]>(() => symbol === 'X'
    ? [[0, Math.PI / 4, 0], [0, -Math.PI / 4, 0]] : [[-Math.PI / 2, 0, 0]], [symbol]);
  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const born = useRef(new Map<number, number>());
  const object = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => symbol === 'X'
    ? new RoundedBoxGeometry(.76, .16, .17, 3, .075)
    : new TorusGeometry(.255, .075, 12, 32), [symbol]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    occupied.forEach((index, instance) => {
      if (!born.current.has(index)) born.current.set(index, now);
      const age = now - born.current.get(index)!;
      const growth = reducedMotion ? 1 : 1 - Math.pow(1 - Math.min(1, age / .28), 3);
      const bounce = reducedMotion ? 0 : (age < .5 ? Math.sin(age / .5 * Math.PI) * .22 : Math.sin(now * 2 + index) * .012);
      const x = index % round.size - (round.size - 1) / 2;
      const z = Math.floor(index / round.size) - (round.size - 1) / 2;
      rotations.forEach((rotation, p) => {
        object.position.set(x, .20 + bounce, z);
        object.scale.setScalar(growth);
        object.rotation.set(...rotation);
        object.updateMatrix();
        meshes.current[p]?.setMatrixAt(instance, object.matrix);
      });
    });
    meshes.current.forEach(mesh => { if (mesh) mesh.instanceMatrix.needsUpdate = true; });
  });
  return <group>{rotations.map((_, p) => <instancedMesh key={p} name={`${symbol}-pieces`} ref={mesh => { meshes.current[p] = mesh; }}
    args={[geometry, undefined, round.board.length]} count={occupied.length} frustumCulled={false}
    raycast={() => {}}>
    <meshPhysicalMaterial color={symbol === 'X' ? '#eb649a' : '#459ee8'} roughness={.23} metalness={.1} clearcoat={.85} clearcoatRoughness={.15} />
  </instancedMesh>)}</group>;
}

function Tiles({ round, enabled, reducedMotion, onMove }: Omit<BoardProps, 'onFailure' | 'zoom'>) {
  const mesh = useRef<InstancedMesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const object = useMemo(() => new Object3D(), []);
  const heights = useRef<number[]>(Array(round.board.length).fill(0));
  const geometry = useMemo(() => new RoundedBoxGeometry(.92, .20, .92, 2, .08), []);
  const winning = round.result?.line ?? [];
  useEffect(() => () => { geometry.dispose(); }, [geometry]);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    // setColorAt creates an instance color buffer on its first call.
    round.board.forEach((cell, index) => {
        const color = winning.includes(index) ? '#ffe294' : cell === 'kitten' ? '#ffe0ea' : cell === 'puppy' ? '#d7eefa'
          : (Math.floor(index / round.size) + index % round.size) % 2 ? '#f3f0ff' : '#ffffff';
      mesh.current!.setColorAt(index, new Color(color));
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [round.board, round.size, winning]);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    round.board.forEach((cell, index) => {
      const target = enabled && !cell && index === hover ? .10 : 0;
      heights.current[index] = reducedMotion ? target : (heights.current[index] ?? 0) + (target - (heights.current[index] ?? 0)) * Math.min(1, delta * 12);
      object.position.set(index % round.size - (round.size - 1) / 2, heights.current[index], Math.floor(index / round.size) - (round.size - 1) / 2);
      object.scale.set(1, 1, 1);
      object.updateMatrix();
      mesh.current!.setMatrixAt(index, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, undefined, round.board.length]} frustumCulled={false}
    onPointerMove={event => { event.stopPropagation(); setHover(event.instanceId ?? null); }}
    onPointerOut={() => setHover(null)}
    onClick={event => { event.stopPropagation(); const index = event.instanceId; if (enabled && index !== undefined && !round.board[index]) onMove(index); }}>
    <meshStandardMaterial roughness={.7} />
  </instancedMesh>;
}

export default function Board3D(props: BoardProps) {
  return <Canvas orthographic dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}
    camera={{ position: [0, 10, 6], near: .1, far: 150 }}
    onCreated={({ gl }) => {
      gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); props.onFailure(); }, { once: true });
    }} aria-hidden="true" style={{ touchAction: 'pan-y' }}>
    <ambientLight intensity={1.6} />
    <directionalLight position={[-4, 10, 5]} intensity={2.2} />
    <directionalLight position={[5, 3, -4]} intensity={.8} color="#c6e9ff" />
    <FitCamera size={props.round.size} zoom={props.zoom} />
    <mesh position={[0, -.23, 0]}>
      <boxGeometry args={[props.round.size + .28, .28, props.round.size + .28]} />
      <meshStandardMaterial color="#b2dcca" roughness={.8} />
    </mesh>
    <Tiles {...props} />
    <SymbolPieces round={props.round} seat="kitten" reducedMotion={props.reducedMotion} />
    <SymbolPieces round={props.round} seat="puppy" reducedMotion={props.reducedMotion} />
  </Canvas>;
}
