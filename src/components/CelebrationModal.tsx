import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, RotateCcw, Download, Sparkles, Trophy, Music, Heart, UploadCloud } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { ScratchTicket } from './ScratchTicket';

interface CelebrationModalProps {
  score: number;
  rubles?: number;
  onRestart: () => void;
  onOpenInstall: () => void;
  onOpenDrive?: () => void;
  customFriendsPhotoUrl?: string;
  onUpdateFriendsPhoto?: (url: string) => void;
  onWatchDance?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  score,
  onRestart,
  onOpenInstall,
  onOpenDrive,
  customFriendsPhotoUrl,
  onUpdateFriendsPhoto,
  onWatchDance
}) => {
  const [currentLyric, setCurrentLyric] = useState<string>('🎉 С ДНЁМ РОЖДЕНИЯ, ПОДРУГА! ТЕБЕ 30 ЛЕТ!');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted);

  useEffect(() => {
    // Launch celebratory confetti bursts
    const end = Date.now() + 4 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Listen to lyrics from SoundManager
    soundManager.onLyricsUpdate = (lyric: string) => {
      setCurrentLyric(lyric);
    };

    return () => {
      soundManager.onLyricsUpdate = null;
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-8 shadow-2xl text-center text-white my-auto animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 mb-3">
          <Sparkles className="w-4 h-4 animate-spin" />
          Уровень пройден! 30-летие разблокировано!
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>

        {/* Main Greeting Banner */}
        <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-rose-300 tracking-tight leading-tight mb-2 drop-shadow-md">
          С ДНЁМ РОЖДЕНИЯ, ПОДРУГА! 🎂
        </h1>
        <p className="text-sm sm:text-base text-indigo-200 font-medium mb-4">
          Ты преодолела все препятствия, одела шикарный строгий костюм и забрала главный приз!
        </p>

        {/* Interactive Scratch-off Lottery Ticket (Photo + Inscription underneath) */}
        <ScratchTicket 
          customFriendsPhotoUrl={customFriendsPhotoUrl} 
          onUpdateFriendsPhoto={onUpdateFriendsPhoto}
        />

        {/* Transformation & Friends Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-left">
          {/* Card 1: Transformation to strict suit */}
          <div className="bg-slate-800/80 border border-indigo-400/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-amber-400 flex items-center justify-center shrink-0 text-2xl shadow">
              🕶️
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Трансформация героя
              </div>
              <div className="text-sm font-bold text-white">
                Строгий костюм Boss Lady
              </div>
              <div className="text-xs text-slate-300">
                Танцует в костюме под Сектор Газа!
              </div>
            </div>
          </div>

          {/* Card 2: Friends Reunion */}
          <div className="bg-slate-800/80 border border-indigo-400/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-pink-400 flex items-center justify-center shrink-0 text-2xl shadow overflow-hidden">
              <img
                src={customFriendsPhotoUrl || '/friends_photo.svg'}
                alt="Друзья"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-pink-400 uppercase tracking-wide">
                Исходное фото друзей
              </div>
              <div className="text-sm font-bold text-white">
                Все друзья танцуют!
              </div>
              <div className="text-xs text-slate-300">
                Встретили именинницу у флага!
              </div>
            </div>
          </div>
        </div>

        {/* Music Player & Lyrics Ticker: Sektor Gaza "Мне сегодня 30 лет" */}
        <div className="bg-slate-950/90 border border-indigo-500/50 rounded-2xl p-4 mb-5 shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs sm:text-sm font-bold">
              <Music className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>Играет хит: Сектор Газа — «Мне сегодня 30 лет»</span>
            </div>
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 transition"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="py-2 px-3 bg-indigo-950/80 rounded-xl border border-indigo-800/50 font-bold text-sm sm:text-base text-amber-300 animate-pulse">
            {currentLyric}
          </div>
        </div>

        {/* Actions buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onWatchDance && (
            <button
              onClick={onWatchDance}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition transform active:scale-95 text-white"
            >
              <span>💃 Смотреть танец в костюме</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Играть заново
          </button>

          {onOpenDrive && (
            <button
              onClick={onOpenDrive}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition transform active:scale-95 text-white"
            >
              <UploadCloud className="w-4 h-4" />
              💾 На Google Диск
            </button>
          )}

          <button
            onClick={onOpenInstall}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform active:scale-95 text-white"
          >
            <Download className="w-4 h-4" />
            📲 Android (APK)
          </button>
        </div>

        {/* Footer Love */}
        <div className="mt-4 text-xs text-indigo-300/70 flex items-center justify-center gap-1">
          Сделано с любовью для лучшей подруги <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </div>
  );
};
