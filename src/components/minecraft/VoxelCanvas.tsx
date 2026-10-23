import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VoxelBlock } from '../../math/minecraftCurriculum';
import { BrickCatalogItem, getBrickDimensions, getBrickPiece } from '../../math/brickCatalog';
import { sound } from '../../audio/soundManager';
import { RotateCw, ZoomIn, ZoomOut, Sun, Moon, Sparkles, Plus, Trash2 } from 'lucide-react';

interface VoxelCanvasProps {
  blocks: VoxelBlock[];
  editable?: boolean;
  placementEnabled?: boolean;
  removalEnabled?: boolean;
  allowPan?: boolean;
  showStuds?: boolean;
  activePiece?: BrickCatalogItem;
  activeRotation?: 0 | 90 | 180 | 270;
  activeBrickColor?: string;
  activeBlockType?: VoxelBlock['type'];
  onBlocksChange?: (newBlocks: VoxelBlock[]) => void;
  onBlockPlace?: (block: VoxelBlock) => boolean | void;
  onBlockRemove?: (block: VoxelBlock) => boolean | void;
  lang?: 'de' | 'vi';
}

function createBrickGeometry(piece: BrickCatalogItem): THREE.BufferGeometry {
  const width = piece.width;
  const depth = piece.depth;
  const height = piece.height / 3;

  switch (piece.shape) {
    case 'slope':
    case 'wedge': {
      const shape = new THREE.Shape();
      const rise = Math.min(height, Math.tan((piece.angle || 45) * Math.PI / 180) * width);
      shape.moveTo(-width / 2, -height / 2);
      shape.lineTo(width / 2, -height / 2);
      shape.lineTo(width / 2, height / 2);
      shape.lineTo(-width / 2, height / 2 - rise);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
      geometry.translate(0, 0, -depth / 2);
      return geometry;
    }
    case 'axle':
      return new THREE.CylinderGeometry(0.12, 0.12, Math.max(width, depth), 10);
    case 'pin':
      return new THREE.CylinderGeometry(0.2, 0.2, Math.max(0.33, height), 10);
    case 'gear':
      return new THREE.CylinderGeometry(Math.min(width, depth) * 0.44, Math.min(width, depth) * 0.44, Math.max(height, 0.2), 12);
    case 'tire':
      return new THREE.TorusGeometry(Math.min(width, depth) * 0.34, Math.min(width, depth) * 0.16, 8, 18);
    case 'curved':
      return new THREE.TorusGeometry(0.4, 0.1, 6, 16, Math.PI);
    case 'leaf':
      return new THREE.SphereGeometry(0.5, 8, 5);
    case 'flower':
      return new THREE.SphereGeometry(0.42, 8, 6);
    case 'tree':
      return new THREE.ConeGeometry(Math.min(width, depth) * 0.48, height, 8);
    case 'animal':
    case 'minifigure':
      return new THREE.CapsuleGeometry(Math.min(width, depth) * 0.2, Math.max(height * 0.55, 0.2), 3, 8);
    default:
      return new THREE.BoxGeometry(width, height, depth);
  }
}

// Procedural texture generator for crisp Minecraft pixel textures
function createBlockCanvasTexture(type: VoxelBlock['type']): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'dirt': {
      // Grass block style
      ctx.fillStyle = '#865439';
      ctx.fillRect(0, 0, 64, 64);
      // Dirt pixel noise
      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#6d4229' : '#9b6445';
        ctx.fillRect(Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 4, 4);
      }
      // Green grass top band
      ctx.fillStyle = '#5c8e32';
      ctx.fillRect(0, 0, 64, 18);
      // Dripping grass edges
      for (let x = 0; x < 64; x += 8) {
        const drop = Math.floor(Math.random() * 10) + 4;
        ctx.fillRect(x, 18, 8, drop);
      }
      break;
    }
    case 'wood': {
      // Oak wood log style
      ctx.fillStyle = '#6e5138';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#4c3523';
      for (let y = 0; y < 64; y += 8) {
        ctx.fillRect(0, y, 64, 2);
      }
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = '#856445';
        ctx.fillRect(Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 6, 4);
      }
      break;
    }
    case 'cobblestone': {
      // Cobblestone
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#4f4f4f';
      for (let y = 0; y < 64; y += 16) {
        ctx.fillRect(0, y, 64, 3);
      }
      for (let x = 0; x < 64; x += 16) {
        ctx.fillRect(x, 0, 3, 64);
      }
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#9e9e9e' : '#3d3d3d';
        ctx.fillRect(Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 4, 4);
      }
      break;
    }
    case 'iron': {
      // Iron block: clean silver with edge border
      ctx.fillStyle = '#e4ebed';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#b0bec5';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 56, 56);
      ctx.strokeStyle = '#cfd8dc';
      ctx.strokeRect(8, 8, 48, 48);
      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 10, 8, 8);
      break;
    }
    case 'fence': {
      // Fence wood color
      ctx.fillStyle = '#9b7149';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#785331';
      ctx.fillRect(24, 0, 16, 64);
      break;
    }
    case 'chest': {
      // Wooden chest with latch
      ctx.fillStyle = '#8c5932';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#2d1b0d';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 60, 60);
      // Metal latch
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(26, 26, 12, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(30, 32, 4, 6);
      break;
    }
    case 'cake': {
      // Cake: white frosting with red cherry dots
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 64, 32);
      ctx.fillStyle = '#ba7947'; // sponge cake base
      ctx.fillRect(0, 32, 64, 32);
      // Cherries
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(12, 10, 8, 8);
      ctx.fillRect(36, 12, 8, 8);
      ctx.fillRect(24, 20, 8, 8);
      break;
    }
    case 'chicken': {
      // Chicken feather texture
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#ff9800'; // beak
      ctx.fillRect(24, 24, 16, 12);
      ctx.fillStyle = '#e53935'; // wattle
      ctx.fillRect(28, 36, 8, 12);
      ctx.fillStyle = '#000000'; // eye
      ctx.fillRect(18, 18, 4, 6);
      ctx.fillRect(42, 18, 4, 6);
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export const VoxelCanvas: React.FC<VoxelCanvasProps> = ({
  blocks,
  editable = false,
  placementEnabled = false,
  removalEnabled = false,
  allowPan = false,
  showStuds = false,
  activePiece,
  activeRotation = 0,
  activeBrickColor,
  activeBlockType = 'dirt',
  onBlocksChange,
  onBlockPlace,
  onBlockRemove,
  lang = 'vi',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const blockGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Rotation and Interaction state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const didMoveRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 5, radius: 16 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1, 0));
  const raycasterRef = useRef(new THREE.Raycaster());

  const [isNight, setIsNight] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(16);

  // Cache materials
  const materialsRef = useRef<Record<string, THREE.Material>>({});
  const brickColorMaterialsRef = useRef(new Map<string, THREE.Material>());

  const getBrickColorMaterial = (color: string) => {
    const cached = brickColorMaterialsRef.current.get(color);
    if (cached) return cached;
    const material = new THREE.MeshLambertMaterial({ color });
    brickColorMaterialsRef.current.set(color, material);
    return material;
  };

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
    cameraRef.current.position.y = radius * Math.sin(phi);
    cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
    cameraRef.current.lookAt(cameraTargetRef.current);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNight ? 0x0c1021 : 0x87ceeb);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(isNight ? 0x4a5568 : 0xffffff, isNight ? 0.6 : 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isNight ? 0x90caf9 : 0xfff4e6, isNight ? 0.8 : 1.3);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Sun / Moon icon mesh in distance
    const celestialGeo = new THREE.BoxGeometry(2, 2, 0.5);
    const celestialMat = new THREE.MeshBasicMaterial({ color: isNight ? 0xffffff : 0xffeb3b });
    const celestial = new THREE.Mesh(celestialGeo, celestialMat);
    celestial.position.set(20, 25, 20);
    celestial.lookAt(0, 0, 0);
    scene.add(celestial);

    // Ground platform (Minecraft Grass Island)
    const islandGeo = new THREE.BoxGeometry(20, 1, 20);
    const islandTex = createBlockCanvasTexture('dirt');
    const islandMat = new THREE.MeshLambertMaterial({ map: islandTex });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.y = -0.5;
    islandMesh.receiveShadow = true;
    scene.add(islandMesh);

    // Grid on ground
    const grid = new THREE.GridHelper(20, 20, 0x4a7c29, 0x3d6621);
    grid.position.y = 0.01;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Voxel Blocks container
    const blockGroup = new THREE.Group();
    scene.add(blockGroup);
    blockGroupRef.current = blockGroup;

    // Pre-create shared materials
    const types: VoxelBlock['type'][] = ['dirt', 'wood', 'cobblestone', 'iron', 'fence', 'cake', 'chest', 'chicken'];
    types.forEach((t) => {
      materialsRef.current[t] = new THREE.MeshLambertMaterial({
        map: createBlockCanvasTexture(t),
      });
    });
    materialsRef.current.glass = new THREE.MeshLambertMaterial({
      color: 0x8be9ff,
      transparent: true,
      opacity: 0.45,
    });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      brickColorMaterialsRef.current.forEach((material) => material.dispose());
      brickColorMaterialsRef.current.clear();
    };
  }, [updateCameraPosition, isNight]);

  // Update block meshes when `blocks` prop changes
  useEffect(() => {
    const group = blockGroupRef.current;
    if (!group) return;

    const oldGeometries = new Set<THREE.BufferGeometry>();
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) oldGeometries.add(object.geometry);
    });
    group.clear();
    oldGeometries.forEach((geometry) => geometry.dispose());

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const fenceGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
    const cakeGeo = new THREE.BoxGeometry(0.85, 0.5, 0.85);
    const chickenGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const studGeo = showStuds ? new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8) : null;

    blocks.forEach((b) => {
      const piece = getBrickPiece(b.pieceId);
      let geo = piece ? createBrickGeometry(piece) : boxGeo;
      let yOffset = 0.5;

      if (!piece && b.type === 'fence') {
        geo = fenceGeo;
      } else if (!piece && b.type === 'cake') {
        geo = cakeGeo;
        yOffset = 0.25;
      } else if (!piece && b.type === 'chicken') {
        geo = chickenGeo;
        yOffset = 0.3;
      }

      if (piece?.shape === 'axle') {
        if (piece.width >= piece.depth) geo.rotateZ(Math.PI / 2);
        else geo.rotateX(Math.PI / 2);
      }

      const mat = b.brickColor
        ? getBrickColorMaterial(b.brickColor)
        : piece?.id === 'panel-glass-2x4'
          ? materialsRef.current.glass
          : materialsRef.current[b.type] || materialsRef.current['dirt'];
      const mesh = new THREE.Mesh(geo, mat);
      if (piece?.shape === 'curved' || piece?.shape === 'leaf' || piece?.shape === 'flower') {
        mesh.scale.set(piece.width, piece.height / 3, piece.depth);
      }
      if (piece) {
        const dimensions = getBrickDimensions(piece.id, b.rotation);
        mesh.position.set(
          b.x + (dimensions.width - 1) / 2,
          (b.y + piece.height / 2) / 3,
          b.z + (dimensions.depth - 1) / 2,
        );
        mesh.rotation.y = (b.rotation || 0) * Math.PI / 180;
      } else {
        mesh.position.set(b.x, b.y + yOffset, b.z);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { block: b };

      if (studGeo && piece?.studs) {
        const dimensions = getBrickDimensions(piece.id, b.rotation);
        const studs = new THREE.InstancedMesh(studGeo, mat, piece.width * piece.depth);
        const matrix = new THREE.Matrix4();
        let index = 0;
        for (let x = 0; x < piece.width; x++) {
          for (let z = 0; z < piece.depth; z++) {
            const localX = x - (piece.width - 1) / 2;
            const localZ = z - (piece.depth - 1) / 2;
            matrix.compose(
              new THREE.Vector3(localX, piece.height / 6 + 0.04, localZ),
              new THREE.Quaternion(),
              new THREE.Vector3(1, 1, 1),
            );
            studs.setMatrixAt(index++, matrix);
          }
        }
        studs.userData = { block: b };
        studs.instanceMatrix.needsUpdate = true;
        mesh.add(studs);
      }

      group.add(mesh);
    });
  }, [blocks, showStuds, isNight]);

  const placeBlockAtPointer = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const group = blockGroupRef.current;
    if (!placementEnabled || !onBlockPlace || !activePiece || !container || !camera || !group) return;

    const rect = container.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(pointer, camera);

    let x: number;
    let y: number;
    let z: number;
    const newDimensions = getBrickDimensions(activePiece.id, activeRotation);
    const hit = raycaster.intersectObjects(group.children, true)[0];

    if (hit?.face && hit.object.userData.block) {
      const block = hit.object.userData.block as VoxelBlock;
      const blockDimensions = block.pieceId
        ? getBrickDimensions(block.pieceId, block.rotation)
        : { width: 1, depth: 1, height: 3 };
      const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      const offset = new THREE.Vector3();
      if (Math.abs(normal.x) > Math.abs(normal.y) && Math.abs(normal.x) > Math.abs(normal.z)) offset.x = Math.sign(normal.x);
      else if (Math.abs(normal.y) > Math.abs(normal.z)) offset.y = Math.sign(normal.y);
      else offset.z = Math.sign(normal.z);
      x = block.x + (offset.x > 0 ? blockDimensions.width : offset.x < 0 ? -newDimensions.width : 0);
      y = block.y + (offset.y > 0 ? blockDimensions.height : offset.y < 0 ? -newDimensions.height : 0);
      z = block.z + (offset.z > 0 ? blockDimensions.depth : offset.z < 0 ? -newDimensions.depth : 0);
    } else {
      const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const point = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
      if (!point) return;
      x = Math.round(point.x);
      y = 0;
      z = Math.round(point.z);
    }

    if (x < -9 || z < -9 || x + newDimensions.width - 1 > 9 || z + newDimensions.depth - 1 > 9 || y < 0 || y + newDimensions.height > 39) return;
    const placed = onBlockPlace({ x, y, z, type: activeBlockType, pieceId: activePiece.id, rotation: activeRotation, brickColor: activeBrickColor });
    if (placed !== false) sound.playBlockPlace();
  };

  const removeBlockAtPointer = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const group = blockGroupRef.current;
    if (!removalEnabled || !onBlockRemove || !container || !camera || !group) return;

    const rect = container.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycasterRef.current.setFromCamera(pointer, camera);
    const hit = raycasterRef.current.intersectObjects(group.children, true)[0];
    const block = hit?.object.userData.block as VoxelBlock | undefined;
    if (block && onBlockRemove(block) !== false) sound.playBlockBreak();
  };

  // Drag to orbit; Shift-drag or right-drag to pan.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    isPanningRef.current = allowPan && (e.button === 2 || e.shiftKey);
    didMoveRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    if (Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y) > 4) didMoveRef.current = true;

    if (isPanningRef.current) {
      cameraTargetRef.current.x -= deltaX * 0.025;
      cameraTargetRef.current.z += deltaY * 0.025;
    } else {
      cameraAngleRef.current.theta -= deltaX * 0.01;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.01));
    }
    updateCameraPosition();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (!didMoveRef.current && e.button !== 2) {
      if (removalEnabled) removeBlockAtPointer(e.clientX, e.clientY);
      else if (placementEnabled) placeBlockAtPointer(e.clientX, e.clientY);
    }
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  // Zoom controls
  const handleZoom = (inOut: number) => {
    const nextRadius = Math.max(8, Math.min(30, cameraAngleRef.current.radius + inOut * 2));
    cameraAngleRef.current.radius = nextRadius;
    setZoomLevel(nextRadius);
    updateCameraPosition();
  };

  // Auto Reset Angle
  const handleResetView = () => {
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 5, radius: 16 };
    cameraTargetRef.current.set(0, 1, 0);
    setZoomLevel(16);
    updateCameraPosition();
    sound.playJump();
  };

  // Add / Remove block in Creative mode
  const handleAddRandomBlock = () => {
    if (!editable || !onBlocksChange) return;
    const x = Math.floor(Math.random() * 7) - 3;
    const z = Math.floor(Math.random() * 7) - 3;
    const existing = blocks.find((b) => b.x === x && b.z === z);
    const y = existing ? existing.y + 1 : 0;

    const newBlock: VoxelBlock = { x, y, z, type: activeBlockType };
    sound.playBlockPlace();
    onBlocksChange([...blocks, newBlock]);
  };

  const handleClearBlocks = () => {
    if (!editable || !onBlocksChange) return;
    sound.playBlockBreak();
    onBlocksChange([]);
  };

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-400 to-indigo-950 border-3 border-amber-500/40 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full flex-1 select-none touch-none ${placementEnabled || removalEnabled ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
      />

      {/* Floating 3D Control Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur border border-white/20 p-1.5 rounded-xl text-white shadow-lg z-10">
        <button
          onClick={handleResetView}
          className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition text-xs flex items-center gap-1"
          title={lang === 'de' ? 'Kamera zentrieren' : 'Đặt lại góc nhìn'}
        >
          <RotateCw className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          onClick={() => handleZoom(-1)}
          className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition"
          title={lang === 'de' ? 'Heranzoomen' : 'Phóng to'}
        >
          <ZoomIn className="w-4 h-4 text-amber-300" />
        </button>

        <button
          onClick={() => handleZoom(1)}
          className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition"
          title={lang === 'de' ? 'Herauszoomen' : 'Thu nhỏ'}
        >
          <ZoomOut className="w-4 h-4 text-amber-300" />
        </button>

        <button
          onClick={() => {
            sound.playJump();
            setIsNight(!isNight);
          }}
          className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition"
          title={
            isNight
              ? lang === 'de'
                ? 'Tag-Modus aktivieren'
                : 'Chuyển Ban Ngày (Day)'
              : lang === 'de'
              ? 'Nacht-Modus aktivieren'
              : 'Chuyển Ban Đêm (Night)'
          }
        >
          {isNight ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
        </button>
      </div>

      {/* Creative Placement Bar (When editable is enabled) */}
      {editable && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur border border-amber-500/40 p-2 rounded-xl text-white z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddRandomBlock}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black cursor-pointer shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'de' ? 'Block setzen' : 'Đặt khối'}</span>
            </button>

            <button
              onClick={handleClearBlocks}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'de' ? 'Leeren' : 'Xoá hết'}</span>
            </button>
          </div>

          <div className="text-xs text-amber-300 font-mono font-bold">
            {blocks.length} {lang === 'de' ? 'Blöcke' : 'khối'}
          </div>
        </div>
      )}

      {/* Touch drag indicator for kids */}
      <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-white/70 font-mono bg-black/40 px-2 py-0.5 rounded-md">
        {lang === 'de' ? '🖱️ Ziehen: 3D Drehen' : '🖱️ Kéo chuột: Xoay 3D'}
      </div>
    </div>
  );
};
