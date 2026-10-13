import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app or initialize new
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token cache (Do NOT store in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Не удалось получить токен доступа Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
}

// Upload file to user's Google Drive
export const uploadFileToDrive = async (
  name: string,
  mimeType: string,
  content: string | Blob,
  folderId?: string
): Promise<DriveUploadResult> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Пользователь не авторизован в Google Drive');
  }

  const metadata: Record<string, any> = {
    name,
    mimeType
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `--${boundary}\r\n`;
  const closeDelimiter = `--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const fileHeaderPart = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;
  const closePart = `\r\n${closeDelimiter}`;

  let body: Blob;
  if (content instanceof Blob) {
    body = new Blob([metadataPart, fileHeaderPart, content, closePart]);
  } else {
    body = new Blob([metadataPart, fileHeaderPart, content, closePart]);
  }

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка загрузки на Google Диск: ${errorText}`);
  }

  const result = await response.json();
  return {
    fileId: result.id,
    name: result.name,
    webViewLink: result.webViewLink
  };
};

// Create a folder on user's Google Drive
export const createDriveFolder = async (folderName: string): Promise<string> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Пользователь не авторизован в Google Drive');
  }

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка создания папки на Google Диске: ${errorText}`);
  }

  const result = await response.json();
  return result.id;
};
