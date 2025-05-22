import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackView() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const tokenFromHash = hash
      .substring(1)
      .split("&")
      .find((elem) => elem.startsWith("access_token"))
      ?.split("=")[1];

    if (tokenFromHash) {
      localStorage.setItem("spotify_token", tokenFromHash);
      console.log("🎧 Token guardado:", tokenFromHash);
    } else {
      console.warn("No se encontró el token en el hash");
    }

    navigate("/spotify-login");
  }, []);

  return <p>Procesando login con Spotify...</p>;
}
