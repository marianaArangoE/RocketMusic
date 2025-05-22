import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PlaylistDetailView() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("spotify_token");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);

  // 🔊 Reproducir/Pausar preview
  function handlePreviewClick(track) {
    if (!track.preview_url) return;

    if (currentAudio && playingTrackId === track.id) {
      currentAudio.pause();
      setPlayingTrackId(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(track.preview_url);
    audio.play();
    setCurrentAudio(audio);
    setPlayingTrackId(track.id);

    audio.onended = () => {
      setPlayingTrackId(null);
    };
  }

  // 🔄 Cargar detalles de la playlist
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const tracks = res.data.tracks.items.map((item) => item.track).filter(Boolean);
        console.log("🎧 Tracks cargados:", tracks);

        const previewable = tracks.filter((track) => !!track.preview_url);
        console.log(`🔍 Canciones con preview: ${previewable.length} / ${tracks.length}`);
        previewable.forEach((t, i) =>
          console.log(`▶️ Preview disponible: ${t.name} → ${t.preview_url}`)
        );

        setPlaylist(res.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          console.warn("⛔ Token inválido o sin permisos. Redirigiendo a Spotify login...");
          localStorage.removeItem("spotify_token");
          redirectToSpotifyLogin();
        } else {
          console.error("❌ Error al obtener detalles de la playlist:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId, token]);

  // 🔐 Reautenticación si no hay token
  function redirectToSpotifyLogin() {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

    const codeVerifier = generateRandomString(128);
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      localStorage.setItem("spotify_code_verifier", codeVerifier);

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        scope: "playlist-read-private user-read-email user-read-recently-played user-top-read",
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    });
  }

  function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const values = window.crypto.getRandomValues(new Uint32Array(length));
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  if (!token) {
    return (
      <div>
        <p>❓ Para ver los detalles de esta playlist necesitas vincular tu cuenta de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Vincular cuenta</button>
      </div>
    );
  }

  if (loading) return <p>Cargando...</p>;
  if (!playlist) return <p>No se pudo cargar la playlist.</p>;

  const tracks = playlist.tracks.items.map((item) => item.track).filter(Boolean);
  const previewableCount = tracks.filter((track) => track.preview_url).length;

  return (
    <div>
      <img
        src={playlist.images?.[0]?.url || "https://placehold.co/300x300?text=Sin+imagen"}
        alt="Cover"
        width={200}
      />
      <h1>{playlist.name}</h1>
      <p>{playlist.description || "Sin descripción disponible"}</p>
      <p>👥 Seguidores: {playlist.followers?.total ?? 0}</p>
      <p>🎶 Total canciones: {playlist.tracks.total}</p>
      <p>🎧 Canciones con preview: {previewableCount}/{playlist.tracks.items.length}</p>

      <ul>
        {tracks.map((track, i) => (
          <li key={track.id || i} style={{ marginBottom: "1rem" }}>
            <strong>{track.name}</strong> - {track.artists?.[0]?.name || "Artista desconocido"}<br />
            Álbum: {track.album?.name || "Desconocido"}<br />
            ⏱ {Math.floor(track.duration_ms / 60000)}:
            {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}
            {track.preview_url ? (
              <button onClick={() => handlePreviewClick(track)}>
                {playingTrackId === track.id ? "⏸️ Pausar" : "▶️ Reproducir preview"}
              </button>
            ) : (
              <p style={{ margin: 0 }}>🔇 Sin previsualización</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
