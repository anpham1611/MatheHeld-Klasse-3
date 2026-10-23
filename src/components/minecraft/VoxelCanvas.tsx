import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VoxelBlock } from '../../math/minecraftCurriculum';
import { sound } from '../../audio/soundManager';
import { RotateCw, ZoomIn, ZoomOut, Sun, Moon, Sparkles, Plus, Trash2 } from 'lucide-react';

interface VoxelCanvasProps {
  blocks: VoxelBlock[];
  editable?: boolean;
  activeBlockType?: VoxelBlock['type'];
  onBlocksChange?: (newBlocks: VoxelBlock[]) => void;
  lang?: 'de' | 'vi';
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
  activeBlockType = 'dirt',
  onBlocksChange,
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
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 5, radius: 16 });

  const [isNight, setIsNight] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(16);

  // Cache materials
  const materialsRef = useRef<Record<string, THREE.Material>>({});

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
    cameraRef.current.position.y = radius * Math.sin(phi);
    cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
    cameraRef.current.lookAt(0, 1, 0);
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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
    };
  }, [updateCameraPosition, isNight]);

  // Update block meshes when `blocks` prop changes
  useEffect(() => {
    const group = blockGroupRef.current;
    if (!group) return;

    // Clear previous children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const fenceGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
    const cakeGeo = new THREE.BoxGeometry(0.85, 0.5, 0.85);
    const chickenGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);

    blocks.forEach((b) => {
      let geo = boxGeo;
      let yOffset = 0.5;

      if (b.type === 'fence') {
        geo = fenceGeo;
        yOffset = 0.5;
      } else if (b.type === 'cake') {
        geo = cakeGeo;
        yOffset = 0.25;
      } else if (b.type === 'chicken') {
        geo = chickenGeo;
        yOffset = 0.3;
      }

      const mat = materialsRef.current[b.type] || materialsRef.current['dirt'];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.y + yOffset, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { block: b };

      group.add(mesh);
    });
  }, [blocks]);

  // Mouse & Touch Drag Handlers for rotating camera
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta -= deltaX * 0.01;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.01));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full flex-1 cursor-grab active:cursor-grabbing select-none touch-none"
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
          title={isNight ? 'Chuyển Ban Ngày (Day)' : 'Chuyển Ban Đêm (Night)'}
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
