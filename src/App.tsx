import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Download, 
  RotateCcw, 
  Pause, 
  Play, 
  Camera, 
  Sparkles,
  Trophy,
  Heart,
  UploadCloud
} from 'lucide-react';
import { GameEngine } from './game/engine';
import { SpriteRenderer } from './game/sprites';
import { soundManager } from './audio/soundManager';
import { CelebrationModal } from './components/CelebrationModal';
import { TouchControls } from './components/TouchControls';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { PhotoCustomizerModal } from './components/PhotoCustomizerModal';
import { GoogleDriveExportModal } from './components/GoogleDriveExportModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const spriteRendererRef = useRef<SpriteRenderer>(new SpriteRenderer());

  // Game UI States
  const [gameStarted, setGameStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [lives, setLives] = useState(3);

  // Photos State
  const [customHeroFace, setCustomHeroFace] = useState<string | undefined>(() => {
    return localStorage.getItem('podruga30_hero_face') || undefined;
  });
  const [customEnemyFace, setCustomEnemyFace] = useState<string | undefined>(() => {
    return localStorage.getItem('podruga30_enemy_face') || undefined;
  });
  const [customFriendsPhoto, setCustomFriendsPhoto] = useState<string | undefined>(() => {
    return localStorage.getItem('podruga30_friends_photo') || undefined;
  });

  // Touch screen detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Initialize engine once canvas is ready
  useEffect(() => {
    // Detect touch
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);

    // Initial load of custom photos into sprite renderer
    const storedFriends = localStorage.getItem('podruga30_friends_photo');
    if (storedFriends) {
      spriteRendererRef.current.setCustomImage('friendsPhoto', storedFriends);
    }
    const storedHero = localStorage.getItem('podruga30_hero_face');
    if (storedHero) {
      spriteRendererRef.current.setCustomImage('heroFace', storedHero);
    }
    const storedEnemy = localStorage.getItem('podruga30_enemy_face');
    if (storedEnemy) {
      spriteRendererRef.current.setCustomImage('enemyFace', storedEnemy);
    }

    if (canvasRef.current && !engineRef.current) {
      const engine = new GameEngine(canvasRef.current, spriteRendererRef.current);
      engine.onWinCallback = () => {
        setIsWon(true);
        setShowCelebrationModal(true);
      };
      engine.onLivesChange = (newLives: number) => {
        setLives(newLives);
        if (newLives <= 0) {
          setIsGameOver(true);
        }
      };
      engineRef.current = engine;
      engine.render(); // Initial render of level
    }

    return () => {
      window.removeEventListener('resize', checkTouch);
      engineRef.current?.stop();
    };
  }, []);

  // Update custom photos in sprite renderer and localStorage
  const handleUpdateHeroFace = (url: string | undefined) => {
    setCustomHeroFace(url);
    if (url) {
      localStorage.setItem('podruga30_hero_face', url);
      spriteRendererRef.current.setCustomImage('heroFace', url);
    } else {
      localStorage.removeItem('podruga30_hero_face');
    }
  };

  const handleUpdateEnemyFace = (url: string | undefined) => {
    setCustomEnemyFace(url);
    if (url) {
      localStorage.setItem('podruga30_enemy_face', url);
      spriteRendererRef.current.setCustomImage('enemyFace', url);
    } else {
      localStorage.removeItem('podruga30_enemy_face');
    }
  };

  const handleUpdateFriendsPhoto = (url: string | undefined) => {
    setCustomFriendsPhoto(url);
    if (url) {
      localStorage.setItem('podruga30_friends_photo', url);
      spriteRendererRef.current.setCustomImage('friendsPhoto', url);
    } else {
      localStorage.removeItem('podruga30_friends_photo');
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const keys = engineRef.current.keys;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        keys.jump = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyZ') {
        keys.sprint = true;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const keys = engineRef.current.keys;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        keys.jump = false;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyZ') {
        keys.sprint = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    if (!engineRef.current) return;
    setGameStarted(true);
    setIsGameOver(false);
    setIsWon(false);
    setLives(3);
    setShowCelebrationModal(false);
    engineRef.current.initLevel();
    engineRef.current.start();
  };

  const restartGame = () => {
    if (!engineRef.current) return;
    setIsGameOver(false);
    setIsWon(false);
    setLives(3);
    setShowCelebrationModal(false);
    soundManager.stopMusic();
    engineRef.current.initLevel();
    engineRef.current.start();
  };

  const togglePause = () => {
    if (!engineRef.current || !gameStarted) return;
    const paused = engineRef.current.togglePause();
    setIsPaused(paused);
  };

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none touch-none"
    >
      {/* Top Arcade Navigation Bar */}
      <header className="absolute top-0 inset-x-0 z-20 h-14 bg-slate-900/90 backdrop-blur-md border-b border-indigo-950/80 px-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">СУПЕР ПОДРУГА</span>
            <span>30 ЛЕТ</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-black">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">СЕКРЕТНЫЙ ПРИЗ 🎁</span>
            <span className="xs:hidden">ПРИЗ 🎁</span>
          </div>

          {/* 3 Lives Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs sm:text-sm font-black shadow">
            <span className="hidden md:inline">ЖИЗНИ:</span>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`text-sm transition-transform duration-200 ${
                    idx < lives ? 'scale-110 drop-shadow' : 'opacity-25 grayscale'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Photos manager */}
          <button
            onClick={() => setShowPhotoModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition"
            title="Фотографии персонажей"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline font-semibold">Фото</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Toggle */}
          {gameStarted && !isWon && (
            <button
              onClick={togglePause}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title={isPaused ? 'Продолжить' : 'Пауза'}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          {/* Google Drive Export Button */}
          <button
            onClick={() => setShowDriveModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
            title="Загрузить комплект на Google Диск"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Google Диск</span>
          </button>

          {/* Android Download / APK Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
            title="Установить как APK на Android"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Android APK</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Полный экран"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Canvas Arcade Viewport */}
      <main className="relative w-full h-full flex items-center justify-center pt-14 pb-0 bg-slate-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="max-w-full max-h-full object-contain aspect-video shadow-2xl rounded-lg bg-sky-400"
        />

        {/* Start Game Screen Overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 z-30 pt-14 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-lg w-full bg-slate-900/95 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl space-y-4">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                🎂 Праздничный Марио к 30-летию
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-300">
                СУПЕР ПОДРУГА 30
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Главный герой — именинница в синем платье! У тебя <span className="text-rose-400 font-bold">3 жизни ❤️❤️❤️</span>! Беги через знакомые места: <span className="text-amber-300 font-semibold">завод «Лакокраска»</span>, <span className="text-blue-300 font-semibold">Ярославский политех</span>, <span className="text-emerald-300 font-semibold">ресторан Subway</span> и доберись до финиша — <span className="text-amber-400 font-bold">ресторана МАМУКА</span>! Там ждут друзья, золотой сундук и песня <span className="text-pink-400 font-bold">Сектор Газа «Мне сегодня 30 лет»</span>!
              </p>

              {/* Characters Preview Cards */}
              <div className="grid grid-cols-3 gap-2 py-2 text-left">
                <div className="bg-slate-800/80 border border-blue-500/40 rounded-xl p-2.5 text-center">
                  <div className="text-2xl mb-1">👸</div>
                  <div className="text-[10px] font-bold text-blue-300">Герой</div>
                  <div className="text-[11px] text-white font-medium truncate">В синем платье</div>
                </div>

                <div className="bg-slate-800/80 border border-red-500/40 rounded-xl p-2.5 text-center">
                  <div className="text-2xl mb-1">🤵</div>
                  <div className="text-[10px] font-bold text-red-300">Враг</div>
                  <div className="text-[11px] text-white font-medium truncate">В синем костюме</div>
                </div>

                <div className="bg-slate-800/80 border border-emerald-500/40 rounded-xl p-2.5 text-center">
                  <div className="text-2xl mb-1">🎁</div>
                  <div className="text-[10px] font-bold text-emerald-300">Финал</div>
                  <div className="text-[11px] text-white font-medium truncate">Друзья и сюрприз</div>
                </div>
              </div>

              {/* Controls Hint */}
              <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-amber-300 font-semibold">Управление:</span> Стрелочки / A, D — бег, Пробел / W — прыжок. На телефонах — экранные кнопки!
              </div>

              {/* Play Button */}
              <button
                onClick={startGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-lg tracking-wider uppercase shadow-xl shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6 fill-white" />
                НАЧАТЬ ИГРУ
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl">
              <h2 className="text-2xl font-black mb-3">ПАУЗА</h2>
              <p className="text-sm text-slate-300 mb-4">Переведи дух, вечеринка ждёт!</p>
              <button
                onClick={togglePause}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 transition"
              >
                Продолжить
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 text-center text-white shadow-2xl max-w-sm w-full mx-4 space-y-3">
              <div className="text-4xl animate-bounce">💔</div>
              <h2 className="text-2xl font-black text-rose-400">ЗАКОНЧИЛИСЬ ЖИЗНИ!</h2>
              <p className="text-xs text-slate-300">
                30 лет празднуют до победного! Подруга никогда не сдаётся! Восстанови все <span className="text-rose-400 font-bold">3 ❤️</span> и доберись до ресторана МАМУКА!
              </p>
              <button
                onClick={restartGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Играть заново (3 ❤️)
              </button>
            </div>
          </div>
        )}

        {/* Floating Celebration Scratch Button when won & modal closed (to watch dance) */}
        {isWon && !showCelebrationModal && (
          <div className="absolute bottom-6 z-30 flex items-center justify-center animate-bounce">
            <button
              onClick={() => setShowCelebrationModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base tracking-wide uppercase shadow-2xl border-2 border-amber-300 flex items-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>🎁 Открыть скретч-билет и сундук 👑</span>
            </button>
          </div>
        )}

        {/* Celebration Modal when Reaching the Friends at Finish */}
        {isWon && showCelebrationModal && (
          <CelebrationModal
            score={engineRef.current?.score || 5000}
            onRestart={restartGame}
            onOpenInstall={() => setShowInstallModal(true)}
            onOpenDrive={() => setShowDriveModal(true)}
            customFriendsPhotoUrl={customFriendsPhoto}
            onUpdateFriendsPhoto={handleUpdateFriendsPhoto}
            onWatchDance={() => setShowCelebrationModal(false)}
          />
        )}
      </main>

      {/* On-Screen Touch Gamepad for Mobile & Tablet */}
      {gameStarted && !isWon && !isPaused && (
        <TouchControls
          onLeftDown={() => {
            if (engineRef.current) engineRef.current.keys.left = true;
          }}
          onLeftUp={() => {
            if (engineRef.current) engineRef.current.keys.left = false;
          }}
          onRightDown={() => {
            if (engineRef.current) engineRef.current.keys.right = true;
          }}
          onRightUp={() => {
            if (engineRef.current) engineRef.current.keys.right = false;
          }}
          onJumpDown={() => {
            if (engineRef.current) engineRef.current.keys.jump = true;
          }}
          onJumpUp={() => {
            if (engineRef.current) engineRef.current.keys.jump = false;
          }}
          onSprintToggle={(active) => {
            if (engineRef.current) engineRef.current.keys.sprint = active;
          }}
        />
      )}

      {/* Android APK Install Modal */}
      <AndroidInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Google Drive Export Modal */}
      <GoogleDriveExportModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />

      {/* Photo Customizer Modal */}
      <PhotoCustomizerModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        customHeroFace={customHeroFace}
        customEnemyFace={customEnemyFace}
        customFriendsPhoto={customFriendsPhoto}
        onUpdateHeroFace={handleUpdateHeroFace}
        onUpdateEnemyFace={handleUpdateEnemyFace}
        onUpdateFriendsPhoto={handleUpdateFriendsPhoto}
      />
    </div>
  );
}
