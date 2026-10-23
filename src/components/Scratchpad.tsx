import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, RotateCcw, X } from 'lucide-react';
import { Language } from '../types/game';
import { t } from '../math/translations';

interface ScratchpadProps {
  lang: Language;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ lang, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#2563eb');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 360;
    canvas.height = canvas.parentElement?.clientHeight || 420;

    // Draw graph paper grid (kariertes Papier)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 18;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border-4 border-indigo-400 overflow-hidden flex flex-col text-slate-800 animate-in fade-in slide-in-from-bottom-6">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-between text-white select-none">
        <div className="flex items-center gap-2 font-bold font-['Fredoka'] text-sm tracking-wide">
          <span>📝 {t(lang, 'scratchpad')}</span>
          <span className="text-xs bg-indigo-500 text-indigo-100 px-2 py-0.5 rounded-full font-normal">Kariert</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearCanvas}
            title={t(lang, 'clearScratchpad')}
            className="p-1.5 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer transition ${
              tool === 'pen' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Stift</span>
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer transition ${
              tool === 'eraser' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Radierer</span>
          </button>
        </div>

        {/* Colors */}
        {tool === 'pen' && (
          <div className="flex items-center gap-1">
            {['#2563eb', '#dc2626', '#16a34a', '#1e293b'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition ${
                  color === c ? 'scale-125 border-slate-700 ring-2 ring-indigo-400' : 'border-white opacity-80'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-72 bg-white touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};
