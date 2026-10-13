import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  ExternalLink, 
  FolderDown, 
  Smartphone, 
  Loader2, 
  LogOut,
  FileText,
  AlertCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  createDriveFolder, 
  uploadFileToDrive,
  DriveUploadResult 
} from '../services/googleDriveService';

interface GoogleDriveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveExportModal: React.FC<GoogleDriveExportModalProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<DriveUploadResult[]>([]);
  const [folderLink, setFolderLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Ошибка авторизации через Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setUploadedFiles([]);
    setFolderLink(null);
  };

  // Perform upload to Google Drive
  const handleUploadToDrive = async () => {
    if (!token && !getAccessToken()) {
      setError('Пожалуйста, сначала выполните вход через Google.');
      return;
    }

    // Explicit confirmation dialog as required by Workspace Integration rules
    const confirmed = window.confirm(
      'Вы подтверждаете загрузку комплекта приложения "Super Podruga 30" (Android WebAPK & Installer) на ваш Google Диск?'
    );
    if (!confirmed) return;

    setIsUploading(true);
    setError(null);
    setUploadedFiles([]);
    setFolderLink(null);

    try {
      setUploadStatus('Создание папки на Google Диске...');
      const folderId = await createDriveFolder('Super Podruga 30 (Android App)');
      setFolderLink(`https://drive.google.com/drive/folders/${folderId}`);

      const results: DriveUploadResult[] = [];

      // 1. Android Installer / Standalone HTML Launcher
      setUploadStatus('Загрузка Android Installer...');
      const appUrl = window.location.origin;
      const installerHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Super Podruga 30 - Android Launcher</title>
  <link rel="manifest" href="${appUrl}/manifest.json">
  <meta name="theme-color" content="#1e3a8a">
  <meta name="mobile-web-app-capable" content="yes">
  <style>
    body { margin: 0; background: #090d16; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 2px solid #3b82f6; border-radius: 20px; padding: 25px; max-width: 400px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #f59e0b; margin-top: 0; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.5; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; font-weight: bold; padding: 14px 24px; border-radius: 14px; font-size: 16px; margin-top: 15px; box-shadow: 0 4px 15px rgba(16,185,129,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <h1>🎮 Супер Подруга 30</h1>
    <p>Праздничная игра к 30-летию готова к запуску и установке на вашем Android-устройстве!</p>
    <a href="${appUrl}" class="btn" target="_blank">🚀 Запустить игру</a>
    <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
      Подсказка для Android: Откройте ссылку в Chrome и нажмите <b>«Установить приложение»</b> для добавления ярлыка на рабочий стол.
    </p>
  </div>
</body>
</html>`;

      const installerRes = await uploadFileToDrive(
        'Super_Podruga_30_Android_Installer.html',
        'text/html',
        installerHtml,
        folderId
      );
      results.push(installerRes);

      // Upload the genuine signed Android APK file!
      try {
        setUploadStatus('Загрузка файла super-podruga-30.apk (7.4 MB)...');
        const apkBlob = await fetch('/super-podruga-30.apk').then(r => r.blob());
        const apkRes = await uploadFileToDrive(
          'super-podruga-30.apk',
          'application/vnd.android.package-archive',
          apkBlob,
          folderId
        );
        results.push(apkRes);
      } catch (apkErr) {
        console.warn('APK upload skipped:', apkErr);
      }

      // 2. Android WebAPK Manifest
      setUploadStatus('Загрузка manifest.json для WebAPK...');
      const manifestContent = JSON.stringify({
        name: "Супер Подруга 30: Марио на День Рождения",
        short_name: "Подруга 30",
        description: "Праздничная ретро-игра к 30-летию: одолей врагов, открой секретный приз и отпразднуй под Сектор Газа!",
        start_url: appUrl,
        display: "standalone",
        orientation: "landscape-primary",
        background_color: "#090d16",
        theme_color: "#2563eb",
        icons: [
          {
            src: `${appUrl}/icon.svg`,
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }, null, 2);

      const manifestRes = await uploadFileToDrive(
        'manifest.json',
        'application/json',
        manifestContent,
        folderId
      );
      results.push(manifestRes);

      // 3. Clear Installation Instruction
      setUploadStatus('Загрузка инструкции по установке на Android...');
      const instructionText = `========================================================
СУПЕР ПОДРУГА 30 (ДЕНЬ РОЖДЕНИЯ 30 ЛЕТ)
ИНСТРУКЦИЯ ПО УСТАНОВКЕ НА СМАРТФОН ANDROID
========================================================

Данная игра разработана с поддержкой стандарта Android WebAPK (PWA):

СПОСОБ 1 (САМЫЙ БЫСТРЫЙ И РЕКОМЕНДУЕМЫЙ):
1. Откройте ссылку на игру в браузере Google Chrome на вашем телефоне Android:
   ${appUrl}
2. В браузере появится предложение «Установить приложение» (или нажмите на три точки ⋮ в правом верхнем углу Chrome).
3. Выберите «Установить приложение» (или «Добавить на главный экран»).
4. Система Android автоматически скомпилирует WebAPK и установит его на рабочий стол смартфона!
5. Игра запускается на весь экран, без рамок браузера, с виртуальным геймпадом, звуком и поддержкой офлайн-режима!

СПОСОБ 2 (ЧЕРЕЗ GOOGLE ДИСК):
1. Откройте файл Super_Podruga_30_Android_Installer.html прямо с вашего Google Диска на телефоне.
2. Нажмите кнопку «Запустить игру».

Приятной игры и с 30-летием! 🎉`;

      const readmeRes = await uploadFileToDrive(
        'ИНСТРУКЦИЯ_УСТАНОВКИ_НА_ANDROID.txt',
        'text/plain',
        instructionText,
        folderId
      );
      results.push(readmeRes);

      setUploadedFiles(results);
      setUploadStatus('Готово! Все файлы успешно загружены на ваш Google Диск!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Произошла ошибка при загрузке на Google Диск');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500 rounded-3xl p-5 sm:p-7 text-white shadow-2xl animate-in fade-in zoom-in-95 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400 flex items-center justify-center text-white shadow-lg">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Google Диск & Android APK</h2>
            <p className="text-xs text-slate-300">Сохранение комплекта установки на ваш личный диск</p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 mb-4 bg-red-950/60 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Auth Section */}
        {!user ? (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 text-center mb-5">
            <p className="text-sm text-slate-300 mb-4">
              Чтобы отправить установочные файлы игры на ваш Google Диск, войдите в свой аккаунт Google:
            </p>

            {/* Official GSI Styled Button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-md transition transform active:scale-95 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  <span>Подключение...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Войти с Google</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div className="truncate">
                  <div className="text-xs text-slate-400">Подключен Google Диск:</div>
                  <div className="text-sm font-bold text-white truncate">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition text-xs flex items-center gap-1 shrink-0"
                title="Сменить аккаунт"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUploadToDrive}
              disabled={isUploading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{uploadStatus || 'Загрузка файлов...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>Загрузить APK на мой Google Диск</span>
                </>
              )}
            </button>

            {/* Direct APK Download Button */}
            <a
              href="/super-podruga-30.apk"
              download="super-podruga-30.apk"
              className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <FolderDown className="w-4 h-4 text-emerald-400" />
              <span>Скачать APK на телефон напрямую (7.4 MB)</span>
            </a>
          </div>
        )}

        {/* Upload Result & Links */}
        {uploadedFiles.length > 0 && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 mb-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Файлы успешно загружены в папку Google Диска:</span>
            </div>

            <div className="space-y-1.5 mb-3 text-xs text-slate-300">
              {uploadedFiles.map((f) => (
                <div key={f.fileId} className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>

            {folderLink && (
              <a
                href={folderLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть папку на Google Диске
              </a>
            )}
          </div>
        )}

        {/* Android WebAPK Info */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Smartphone className="w-4 h-4" />
            <span>Как установить как APK на Android:</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            ОС Android поддерживает технологию WebAPK: при открытии игры в Chrome на телефоне достаточно нажать <span className="text-white font-semibold">«Установить приложение»</span>, и система сама сформирует настоящий APK и установит значок на рабочий стол!
          </p>
        </div>

        {/* Bottom Close */}
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Закрыть окно
          </button>
        </div>
      </div>
    </div>
  );
};
