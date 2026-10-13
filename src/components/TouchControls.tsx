import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';

interface TouchControlsProps {
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onJumpDown: () => void;
  onJumpUp: () => void;
  onSprintToggle: (active: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onJumpDown,
  onJumpUp,
  onSprintToggle
}) => {
  const vibrate = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-4 flex items-end justify-between pointer-events-none select-none z-30 touch-none">
      {/* Left: D-PAD (Left / Right) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            vibrate();
            onLeftDown();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onLeftUp();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onLeftUp();
          }}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/80 border-2 border-slate-700/80 active:bg-blue-600/80 active:border-blue-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-95"
          aria-label="Влево"
        >
          <ArrowLeft className="w-8 h-8 text-blue-200" />
        </button>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            vibrate();
            onRightDown();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onRightUp();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onRightUp();
          }}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/80 border-2 border-slate-700/80 active:bg-blue-600/80 active:border-blue-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-95"
          aria-label="Вправо"
        >
          <ArrowRight className="w-8 h-8 text-blue-200" />
        </button>
      </div>

      {/* Right: ACTION BUTTONS (B = Sprint, A = Jump) */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* B BUTTON: SPRINT / RUN */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            vibrate();
            onSprintToggle(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onSprintToggle(false);
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onSprintToggle(false);
          }}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-amber-600/80 border-2 border-amber-400/90 active:bg-amber-500 text-white flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-90"
          aria-label="Бег"
        >
          <Zap className="w-5 h-5 text-amber-200" />
          <span className="text-xs font-black tracking-tighter">БЕГ</span>
        </button>

        {/* A BUTTON: JUMP */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            vibrate();
            onJumpDown();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onJumpUp();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onJumpUp();
          }}
          className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-600/85 border-3 border-emerald-300 text-white flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-90"
          aria-label="Прыжок"
        >
          <ArrowUp className="w-7 h-7 text-emerald-100" />
          <span className="text-xs font-black tracking-wider">ПРЫЖОК</span>
        </button>
      </div>
    </div>
  );
};
