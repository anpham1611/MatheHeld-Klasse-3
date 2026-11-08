import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Color, ConeGeometry, Object3D, SphereGeometry, type InstancedMesh, type OrthographicCamera } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Animal, Round } from './engine';

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
interface Part { position: Vec3; scale: Vec3; color: string; cone?: boolean; rotation?: Vec3 }
function animalParts(animal: Animal): Part[] {
  const kitten = animal === 'kitten';
  const fur = kitten ? '#ffb9ce' : '#c79870';
  const light = kitten ? '#ffe7ef' : '#ffead2';
  const parts: Part[] = [
    { position: [0, .24, 0], scale: [.22, .24, .19], color: fur },
    { position: [0, .55, .03], scale: [.29, .25, .24], color: fur },
    { position: [0, .44, .22], scale: [.19, .1, .065], color: light },
    { position: [-.11, .56, .247], scale: [.034, .049, .02], color: '#35465d' },
    { position: [.11, .56, .247], scale: [.034, .049, .02], color: '#35465d' },
    { position: [-.119, .578, .263], scale: [.009, .013, .008], color: '#ffffff' },
    { position: [.101, .578, .263], scale: [.009, .013, .008], color: '#ffffff' },
    { position: [0, .467, .294], scale: [.035, .025, .017], color: kitten ? '#d95789' : '#59433c' },
    { position: [-.12, .065, .12], scale: [.11, .075, .12], color: light },
    { position: [.12, .065, .12], scale: [.11, .075, .12], color: light },
    { position: [.18, .25, -.19], scale: [.085, .17, .075], rotation: [0, 0, -.7], color: fur },
  ];
  for (const sign of [-1, 1]) {
    parts.push(kitten
      ? { position: [sign * .20, .78, .01], scale: [.11, .145, .10], cone: true, color: fur }
      : { position: [sign * .27, .57, -.005], scale: [.10, .23, .09], rotation: [0, 0, sign * .25], color: '#8d624f' });
    if (kitten) parts.push({ position: [sign * .20, .79, .075], scale: [.065, .09, .035], cone: true, color: '#ed83a7' });
  }
  return parts;
}

/** Batch each animal part across all occupied tiles, keeping large boards cheap. */
function AnimalPieces({ round, animal, reducedMotion }: { round: Round; animal: Animal; reducedMotion: boolean }) {
  const occupied = useMemo(() => round.board.flatMap((cell, index) => cell === animal ? [index] : []), [round.board, animal]);
  const parts = useMemo(() => animalParts(animal), [animal]);
  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const born = useRef(new Map<number, number>());
  const object = useMemo(() => new Object3D(), []);
  const sphere = useMemo(() => new SphereGeometry(1, 12, 8), []);
  const cone = useMemo(() => new ConeGeometry(1, 2, 12), []);
  useEffect(() => () => { sphere.dispose(); cone.dispose(); }, [sphere, cone]);
  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    occupied.forEach((index, instance) => {
      if (!born.current.has(index)) born.current.set(index, now);
      const age = now - born.current.get(index)!;
      const growth = reducedMotion ? 1 : Math.min(1, age / .22);
      const bounce = reducedMotion ? 0 : (age < .5 ? Math.sin(age / .5 * Math.PI) * .22 : Math.sin(now * 2 + index) * .012);
      const x = index % round.size - (round.size - 1) / 2;
      const z = Math.floor(index / round.size) - (round.size - 1) / 2;
      parts.forEach((part, p) => {
        object.position.set(x + part.position[0] * growth, .14 + bounce + part.position[1] * growth, z + part.position[2] * growth);
        object.scale.set(part.scale[0] * growth, part.scale[1] * growth, part.scale[2] * growth);
        object.rotation.set(...(part.rotation ?? [0, 0, 0]));
        object.updateMatrix();
        meshes.current[p]?.setMatrixAt(instance, object.matrix);
      });
    });
    meshes.current.forEach(mesh => { if (mesh) mesh.instanceMatrix.needsUpdate = true; });
  });
  return <group>{parts.map((part, p) => <instancedMesh key={p} ref={mesh => { meshes.current[p] = mesh; }}
    args={[part.cone ? cone : sphere, undefined, round.board.length]} count={occupied.length} frustumCulled={false}
    raycast={() => {}}>
    <meshStandardMaterial color={part.color} roughness={.72} />
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
    <AnimalPieces round={props.round} animal="kitten" reducedMotion={props.reducedMotion} />
    <AnimalPieces round={props.round} animal="puppy" reducedMotion={props.reducedMotion} />
  </Canvas>;
}
