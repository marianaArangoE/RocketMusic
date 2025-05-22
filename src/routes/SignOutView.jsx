import { useState } from "react";
import { signOut, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function SignOutView() {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(true);
  const auth = getAuth();

  const clearAllStorage = async () => {
    // Eliminar tokens y sesión local
    localStorage.clear();
    sessionStorage.clear();

    // Eliminar la IndexedDB usada por Firebase
    if (window.indexedDB) {
      const req = indexedDB.deleteDatabase("firebaseLocalStorageDb");
      req.onsuccess = () => console.log("✅ IndexedDB limpiada");
      req.onerror = () => console.warn("⚠️ No se pudo limpiar IndexedDB");
    }
  };

  const openGoogleAndSpotifyLogout = () => {
  const googleLogout = window.open(
    "https://accounts.google.com/Logout",
    "_blank",
    "width=500,height=600"
  );

  const spotifyLogout = window.open(
    "https://accounts.spotify.com/logout",
    "_blank",
    "width=500,height=600"
  );

  // Cierra ambas ventanas después de unos segundos
  setTimeout(() => {
    if (googleLogout) googleLogout.close();
    if (spotifyLogout) spotifyLogout.close();
  }, 3000);
};
  const handleConfirm = async () => {
    try {
      await signOut(auth);
      await clearAllStorage();
      openGoogleAndSpotifyLogout(); // 🔥 abrir logout de Google
      navigate("/login");
    } catch (err) {
      console.error("❌ Error cerrando sesión:", err);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <p>¿Vas a salir de la sesión, estás seguro?</p>
      <button onClick={handleConfirm}>✅ Sí, cerrar sesión</button>
      <button onClick={handleCancel}>❌ No, volver</button>
    </div>
  );
}
