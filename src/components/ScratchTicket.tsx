import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, Wand2, Eye, Camera, Upload } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ScratchTicketProps {
  customFriendsPhotoUrl?: string;
  onFullyScratched?: () => void;
  onUpdateFriendsPhoto?: (url: string) => void;
}

export const ScratchTicket: React.FC<ScratchTicketProps> = ({
  customFriendsPhotoUrl,
  onFullyScratched,
  onUpdateFriendsPhoto
}) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const checkThrottleRef = useRef<number>(0);

  // Initialize scratch canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 320;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';

    // 1. Holographic silver-metallic lottery foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.2, '#cbd5e1');
    grad.addColorStop(0.4, '#e2e8f0');
    grad.addColorStop(0.6, '#94a3b8');
    grad.addColorStop(0.8, '#cbd5e1');
    grad.addColorStop(1, '#64748b');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Sparkling lottery glitter pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 90; i++) {
      const rx = (i * 37) % width;
      const ry = (i * 53) % height;
      ctx.beginPath();
      ctx.arc(rx, ry, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars pattern
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 71) % (width - 40)) + 20;
      const sy = ((i * 47) % (height - 40)) + 20;
      ctx.font = '14px sans-serif';
      ctx.fillText('✦', sx, sy);
    }

    // 3. Dashed security border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);

    // 4. Center Coin Badge
    const cx = width / 2;
    const cy = height / 2;

    // Glowing badge circle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪙', cx, cy - 35);

    // 5. MAIN SCRATCH CALLOUT TEXT (as requested by user)
    // "СОТРИ МЕНЯ И ПОЛУЧИ СВОЙ ПРИЗ"
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Press Start 2P", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText('СОТРИ МЕНЯ', cx, cy + 20);
    ctx.fillText('И ПОЛУЧИ СВОЙ ПРИЗ!', cx, cy + 50);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px "Rubik", sans-serif';
    ctx.fillText('✨ Проведи пальцем или мышкой по билету ✨', cx, cy + 85);
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!isRevealed) {
        initCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, isRevealed]);

  // Scratch action
  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 44; // Generous brush radius
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };

    // Play scratch sound
    soundManager.playScratch();

    // Check percentage throttle
    checkThrottleRef.current++;
    if (checkThrottleRef.current % 12 === 0) {
      calculateScratchPercentage();
    }
  };

  const calculateScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    // Sample a grid of pixels
    const sampleStep = 16;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    let transparentCount = 0;
    let totalSampled = 0;

    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        totalSampled++;
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha < 128) {
          transparentCount++;
        }
      }
    }

    const pct = Math.round((transparentCount / totalSampled) * 100);
    setScratchPercent(pct);

    // If more than 35% is cleared, automatically complete the reveal!
    if (pct >= 35) {
      revealAll();
    }
  };

  const revealAll = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    setScratchPercent(100);

    // Clear entire canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Play fanfare / sound
    soundManager.playPowerUp();

    // Confetti blast!
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#facc15']
    });

    if (onFullyScratched) {
      onFullyScratched();
    }
  };

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScratching(true);
    lastPointRef.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
    lastPointRef.current = null;
  };

  return (
    <div className="relative w-full my-4">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Праздничный скретч-билет 30 лет</span>
        </div>

        {!isRevealed && (
          <button
            onClick={revealAll}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400/50 text-indigo-100 font-semibold text-xs transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Стереть всё сразу ({scratchPercent}%)</span>
          </button>
        )}
      </div>

      {/* Main Ticket Box */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[300px] sm:min-h-[340px] rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-gradient-to-b from-slate-900 to-indigo-950 flex flex-col items-center justify-center select-none touch-none"
      >
        {/* UNDER LAYER: THE REVEAL CONTENT WITH PHOTO OF FRIENDS & TREASURE CHEST */}
        <div className="absolute inset-0 p-3 sm:p-5 flex flex-col items-center justify-between text-center overflow-y-auto">
          {/* Main User Requested Inscription:
              «Обернись на своих друзей и забери свой сундук с золотом» */}
          <div className="bg-amber-950/85 border-2 border-amber-400 rounded-2xl px-4 py-2.5 shadow-lg w-full max-w-md animate-bounce">
            <h2 className="text-base sm:text-xl font-black text-amber-300 uppercase tracking-tight leading-snug drop-shadow-md">
              Обернись на своих друзей и забери свой сундук с золотом! 👑
            </h2>
          </div>

          {/* PHOTO OF FRIENDS (Real original photo / High-fidelity photo) */}
          <div className="relative my-2 w-full max-w-sm h-40 sm:h-52 rounded-2xl overflow-hidden border-3 border-amber-300 shadow-2xl bg-slate-950 group">
            <img
              src={customFriendsPhotoUrl || '/friends_photo.svg'}
              alt="Оригинальное фото друзей"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay photo source badge & Change photo button */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-amber-400/70 text-amber-300 font-bold text-[10px] shadow">
              <Camera className="w-3 h-3 text-amber-400" />
              <span>{customFriendsPhotoUrl ? 'ИСХОДНОЕ ФОТО ДРУЗЕЙ' : 'ОРИГИНАЛЬНОЕ ФОТО'}</span>
            </div>

            {onUpdateFriendsPhoto && (
              <>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const res = ev.target?.result as string;
                        onUpdateFriendsPhoto(res);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-[10px] shadow-lg transition active:scale-95"
                  title="Загрузить исходный файл фото с телефона или компьютера"
                >
                  <Upload className="w-3 h-3" />
                  <span>{customFriendsPhotoUrl ? 'Заменить фото' : 'Загрузить файл фото'}</span>
                </button>
              </>
            )}
          </div>

          {/* ANIMATED TREASURE CHEST OF GOLD (Secret prize - amount hidden!) */}
          <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500/25 via-yellow-400/40 to-amber-500/25 border-2 border-amber-400/90 rounded-2xl px-5 py-2.5 shadow-xl w-full max-w-md">
            <span className="text-3xl animate-bounce">🪙</span>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                СУНДУК С ЗОЛОТОМ
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.8)]">
                ТАИНСТВЕННЫЙ СУНДУК! 👑
              </div>
              <div className="text-[11px] text-amber-200/90 font-medium">
                Что внутри — секрет! Забери свой настоящий сундук у друзей! 🎁
              </div>
            </div>
            <span className="text-3xl animate-bounce">🪙</span>
          </div>
        </div>

        {/* TOP LAYER: INTERACTIVE SCRATCH CANVAS */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none z-20 transition-opacity duration-300"
          />
        )}
      </div>

      {/* Helper caption */}
      <div className="text-center text-xs text-indigo-200/80 mt-2">
        {isRevealed ? (
          <span className="text-emerald-400 font-bold">
            🎉 Билет успешно стёрт! Приз разблокирован!
          </span>
        ) : (
          <span>
            💡 Сотрите защитный серебряный слой монеткой или пальцем, чтобы узнать, где ваш приз!
          </span>
        )}
      </div>
    </div>
  );
};
