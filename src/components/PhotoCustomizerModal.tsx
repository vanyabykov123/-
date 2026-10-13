import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Check, X, RefreshCw } from 'lucide-react';

interface PhotoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customHeroFace?: string;
  customEnemyFace?: string;
  customFriendsPhoto?: string;
  onUpdateHeroFace: (dataUrl: string | undefined) => void;
  onUpdateEnemyFace: (dataUrl: string | undefined) => void;
  onUpdateFriendsPhoto: (dataUrl: string | undefined) => void;
}

export const PhotoCustomizerModal: React.FC<PhotoCustomizerModalProps> = ({
  isOpen,
  onClose,
  customHeroFace,
  customEnemyFace,
  customFriendsPhoto,
  onUpdateHeroFace,
  onUpdateEnemyFace,
  onUpdateFriendsPhoto
}) => {
  const heroInputRef = useRef<HTMLInputElement>(null);
  const enemyInputRef = useRef<HTMLInputElement>(null);
  const friendsInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | undefined) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Персонажи из ваших фото</h2>
            <p className="text-xs text-slate-400">Управление спрайтами и загрузка оригинальных фото</p>
          </div>
        </div>

        {/* Slots */}
        <div className="space-y-4 mb-6">
          {/* Slot 1: Hero Girl in Blue Dress */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                {customHeroFace ? (
                  <img src={customHeroFace} alt="Герой" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👸</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Главный герой: Девушка в синем платье</div>
                <div className="text-xs text-slate-300">
                  {customHeroFace ? 'Загружено пользовательское фото' : 'Используется стилизованный портрет по фото 2'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, onUpdateHeroFace)}
              />
              <button
                onClick={() => heroInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition"
              >
                {customHeroFace ? 'Заменить' : 'Загрузить файл'}
              </button>
              {customHeroFace && (
                <button
                  onClick={() => onUpdateHeroFace(undefined)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition"
                  title="Сбросить"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Slot 2: Enemy Man in Blue Suit */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-red-500 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                {customEnemyFace ? (
                  <img src={customEnemyFace} alt="Враг" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🤵</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Враг: Мужчина в синем костюме</div>
                <div className="text-xs text-slate-300">
                  {customEnemyFace ? 'Загружено фото врага' : 'Используется портрет с вытянутой рукой по фото 1'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={enemyInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, onUpdateEnemyFace)}
              />
              <button
                onClick={() => enemyInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition"
              >
                {customEnemyFace ? 'Заменить' : 'Загрузить файл'}
              </button>
              {customEnemyFace && (
                <button
                  onClick={() => onUpdateEnemyFace(undefined)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition"
                  title="Сбросить"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Slot 3: Friends Photo on finish line */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-pink-400 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src={customFriendsPhoto || '/friends_photo.svg'} 
                  alt="Друзья" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Финал: Исходное фото друзей</div>
                <div className="text-xs text-slate-300">
                  {customFriendsPhoto ? 'Загружен исходный файл с устройства' : 'Оригинальное фото 4 друзей на даче'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={friendsInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, onUpdateFriendsPhoto)}
              />
              <button
                onClick={() => friendsInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition"
              >
                {customFriendsPhoto ? 'Заменить' : 'Загрузить файл'}
              </button>
              {customFriendsPhoto && (
                <button
                  onClick={() => onUpdateFriendsPhoto(undefined)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition"
                  title="Сбросить"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-bold text-sm text-white shadow-lg"
        >
          Готово, вернуться к игре!
        </button>
      </div>
    </div>
  );
};
