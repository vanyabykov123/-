import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle, ExternalLink, X, ShieldCheck } from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert('Чтобы установить на Android: откройте меню браузера (три точки ⋮) и нажмите «Установить приложение» или «Добавить на гл. экран».');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Установка на Android (APK / PWA)</h2>
            <p className="text-xs text-slate-400">Полноэкранная игра как нативное приложение</p>
          </div>
        </div>

        {/* Android Explanation */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-4 text-sm text-slate-300 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Технология WebAPK для Android:</strong> Google Chrome и Android автоматически собирают и устанавливают PWA в виде нативного приложения (APK) с ярлыком на рабочем столе.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Работает офлайн:</strong> Игра кэшируется через Service Worker и запускается даже без доступа к интернету.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Без рамок браузера:</strong> Полноэкранный режим с поддержкой геймпада и вибрации.
            </div>
          </div>
        </div>

        {/* Step-by-Step for Chrome on Android */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 mb-5">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            Инструкция по установке:
          </div>
          <ol className="text-xs text-slate-200 space-y-2 list-decimal list-inside">
            <li>Если кнопка ниже активна, нажмите <span className="text-emerald-300 font-semibold">«Установить сейчас»</span></li>
            <li>Или нажмите на <span className="text-emerald-300 font-semibold">меню браузера ⋮</span> (три точки вверху)</li>
            <li>Выберите пункт <span className="text-emerald-300 font-semibold">«Установить приложение»</span> (или «Добавить на главный экран»)</li>
            <li>Готово! Значок появится на рабочем столе смартфона</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Direct APK Download Button */}
          <a
            href="/super-podruga-30.apk"
            download="super-podruga-30.apk"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95 text-center"
          >
            <Download className="w-5 h-5 text-amber-300" />
            <span>📥 Скачать APK файл (super-podruga-30.apk • 7.4 MB)</span>
          </a>

          {isInstalled ? (
            <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/30 border border-emerald-400 text-emerald-200 text-center font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Приложение уже установлено на вашем устройстве!
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition transform active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              {deferredPrompt ? 'Установить в 1 клик через браузер (WebAPK)' : 'Добавить на главный экран (WebAPK)'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Закрыть и продолжить игру
          </button>
        </div>
      </div>
    </div>
  );
};
