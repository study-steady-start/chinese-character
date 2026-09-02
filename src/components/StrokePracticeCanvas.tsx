import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Eraser, Eye, EyeOff, Grid } from 'lucide-react';

interface StrokePracticeCanvasProps {
  guideCharacter?: string;
  className?: string;
  size?: number;
}

export const StrokePracticeCanvas: React.FC<StrokePracticeCanvasProps> = ({
  guideCharacter = '',
  className = '',
  size = 280,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    saveState();
  }, [size]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-10), imageData]);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 2.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = strokeWidth;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const undoLast = () => {
    if (strokeHistory.length <= 1) {
      clearCanvas();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...strokeHistory];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    setStrokeHistory(newHistory);
    ctx.putImageData(previous, 0, 0);
  };

  return (
    <div id="stroke-practice-container" className={`flex flex-col items-center select-none ${className}`}>
      {/* Canvas Frame with Traditional Calligraphy Grid */}
      <div
        className="relative bg-amber-50/40 border-2 border-amber-900/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center touch-none"
        style={{ width: size, height: size }}
      >
        {/* Traditional 米자 & 田자 Grid lines */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none text-red-900/15" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2={size} y2={size} stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
            <line x1={size} y1="0" x2="0" y2={size} stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
            <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.2" />
            <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.2" />
          </svg>
        )}

        {/* Guide Watermark Character */}
        {showGuide && guideCharacter && (
          <div
            className="absolute inset-0 flex items-center justify-center text-slate-300/60 font-serif select-none pointer-events-none"
            style={{ fontSize: `${size * 0.75}px`, fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif" }}
          >
            {guideCharacter}
          </div>
        )}

        {/* Interactive Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        />
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center justify-between w-full mt-3 px-1 gap-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <button
            id="toggle-guide-btn"
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition ${
              showGuide
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-medium'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="가이드 글자 켜기/끄기"
          >
            {showGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            가이드
          </button>

          <button
            id="toggle-grid-btn"
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition ${
              showGrid
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-medium'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="격자선 켜기/끄기"
          >
            <Grid className="w-3.5 h-3.5" />
            격자
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="toggle-pen-btn"
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded-lg border transition ${
              !isEraser
                ? 'bg-slate-800 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="붓 펜"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          <button
            id="toggle-eraser-btn"
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded-lg border transition ${
              isEraser
                ? 'bg-slate-800 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="지우개"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <button
            id="undo-stroke-btn"
            type="button"
            onClick={undoLast}
            className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="실행 취소"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="clear-canvas-btn"
            type="button"
            onClick={clearCanvas}
            className="px-2 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition font-medium text-[11px]"
          >
            지우기
          </button>
        </div>
      </div>
    </div>
  );
};
