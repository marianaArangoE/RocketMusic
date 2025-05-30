import { useCallback } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function useSignOut() {
  const navigate = useNavigate();
  const auth = getAuth();
  const clearFirebaseStorage = useCallback(async () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('firebase'))
      .forEach(key => localStorage.removeItem(key));

    sessionStorage.clear();

    if (window.indexedDB) {
      const req = indexedDB.deleteDatabase('firebaseLocalStorageDb');
      req.onsuccess = () => console.log('✅ IndexedDB limpiada');
      req.onerror   = () => console.warn('⚠️ No se pudo limpiar IndexedDB');
    }
  }, []);

  
  const openExternalLogouts = useCallback(() => {
    const googleWin = window.open(
      'https://accounts.google.com/Logout',
      '_blank',
      'width=500,height=600'
    );
    const spotifyWin = window.open(
      'https://accounts.spotify.com/logout',
      '_blank',
      'width=500,height=600'
    );
    setTimeout(() => {
      googleWin?.close();
      spotifyWin?.close();
    }, 3000);
  }, []);

  const doSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      await clearFirebaseStorage();
      openExternalLogouts();
      navigate('/login');
    } catch (err) {
      console.error('❌ Error cerrando sesión:', err);
    }
  }, [auth, clearFirebaseStorage, openExternalLogouts, navigate]);

  return doSignOut;
}
