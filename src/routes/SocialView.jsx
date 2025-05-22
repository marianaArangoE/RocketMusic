import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SocialView() {
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [followingUsers, setFollowingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("spotify_token");
  if (!token || token === "undefined") {
    console.warn("🚫 Token ausente o inválido. Redirigiendo...");
    redirectToSpotifyLogin();
    return;
  }

  const fetchCurators = async () => {
    try {
      console.log("🎟️ Usando token para obtener curadores:", token);

      const res = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: "top",
          type: "playlist",
          limit: 10,
        },
      });

      const playlists = res.data.playlists.items;

      const curators = playlists
        .filter((p) => p && p.owner)
        .map((playlist) => ({
          userId: playlist.owner.id,
          displayName: playlist.owner.display_name || "Usuario sin nombre",
          profileUrl: playlist.owner.external_urls.spotify,
          playlistName: playlist.name,
          playlistImg: playlist.images?.[0]?.url || null,
        }));

      const validCurators = [];

      for (const curator of curators) {
        const isFollowable = await isUserFollowable(curator.userId);
        if (isFollowable) {
          validCurators.push(curator);
          const isFollowing = await checkIfFollowing(curator.userId);
          setFollowingUsers((prev) => ({
            ...prev,
            [curator.userId]: isFollowing,
          }));
        } else {
          console.warn(`⛔ Usuario no es seguible: ${curator.userId}`);
        }
      }

      setRecommendations(validCurators);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        console.warn("⛔ Token expirado o no autorizado. Redirigiendo...");
        localStorage.removeItem("spotify_token");
        redirectToSpotifyLogin();
      } else {
        console.error("❌ Error al obtener curadores:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const isUserFollowable = async (userId) => {
    try {
      await axios.get("https://api.spotify.com/v1/me/following/contains", {
        headers: { Authorization: `Bearer ${token}` },
        params: { type: "user", ids: userId },
      });
      return true;
    } catch (err) {
      if (err.response?.status === 403) {
        return false;
      }
      if (err.response?.status === 401) {
        console.warn("⛔ Token vencido al validar followable. Redirigiendo...");
        localStorage.removeItem("spotify_token");
        redirectToSpotifyLogin();
      }
      return false;
    }
  };

  fetchCurators();
}, []);


  const handleSearch = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("spotify_token");
    if (!search || !token || token === "undefined") {
      console.warn("🚫 Token inválido. Redirigiendo...");
      redirectToSpotifyLogin();
      return;
    }

    try {
      const res = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: search,
          type: "playlist",
          limit: 5,
        },
      });

      const playlists = res.data.playlists.items;

      const results = playlists.map((playlist) => ({
        userId: playlist.owner.id,
        displayName: playlist.owner.display_name || "Usuario sin nombre",
        profileUrl: playlist.owner.external_urls.spotify,
        playlistName: playlist.name,
        playlistImg: playlist.images[0]?.url,
      }));

      setSearchResults(results);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.warn("⛔ Token expirado. Redirigiendo...");
        localStorage.removeItem("spotify_token");
        redirectToSpotifyLogin();
      } else {
        console.error("❌ Error al buscar playlists:", error);
      }
    }
  };

  const checkIfFollowing = async (userId) => {
    const token = localStorage.getItem("spotify_token");
    try {
      const res = await axios.get("https://api.spotify.com/v1/me/following/contains", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: "user",
          ids: userId,
        },
      });
      return res.data[0]; // true o false
    } catch (err) {
      console.error(`Error al verificar si sigues a ${userId}:`, err);
      return false;
    }
  };

  const followUser = async (userId) => {
    const token = localStorage.getItem("spotify_token");
    try {
      await axios.put(
        "https://api.spotify.com/v1/me/following",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "user", ids: userId },
        }
      );
      setFollowingUsers((prev) => ({ ...prev, [userId]: true }));
    } catch (err) {
      console.error(`Error al seguir a ${userId}:`, err);
    }
  };

  const unfollowUser = async (userId) => {
    const token = localStorage.getItem("spotify_token");
    try {
      await axios.delete("https://api.spotify.com/v1/me/following", {
        headers: { Authorization: `Bearer ${token}` },
        params: { type: "user", ids: userId },
      });
      setFollowingUsers((prev) => ({ ...prev, [userId]: false }));
    } catch (err) {
      console.error(`Error al dejar de seguir a ${userId}:`, err);
    }
  };

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
        scope: [
          "user-read-email",
          "playlist-read-private",
          "playlist-read-collaborative",
          "user-follow-modify",
          "user-follow-read"
        ].join(" "),
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

  return (
    <div>
      <h1>👥 Social View</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar curadores (por nombre de playlist)"
        />
        <button type="submit">Buscar</button>
      </form>

      {searchResults.length > 0 && (
        <div>
          <h3>🔍 Resultados de búsqueda:</h3>
          <ul>
            {searchResults.map((user, index) => (
              <li key={index}>
                <strong>{user.displayName}</strong><br />
                Playlist: {user.playlistName}<br />
                <a href={user.profileUrl} target="_blank" rel="noreferrer">
                  Ver perfil en Spotify
                </a><br />
                {user.playlistImg && <img src={user.playlistImg} width={100} alt="playlist" />}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3>🎧 Recomendaciones de curadores de playlists</h3>

      {loading ? (
        <p>Cargando...</p>
      ) : recommendations.length === 0 ? (
        <p>No se encontraron curadores en este momento.</p>
      ) : (
        <ul>
          {recommendations.map((user, index) => (
            <li key={index}>
              <strong>{user.displayName}</strong><br />
              Playlist: {user.playlistName}<br />
              <a href={user.profileUrl} target="_blank" rel="noreferrer">
                Ver perfil en Spotify
              </a><br />
              {user.playlistImg && <img src={user.playlistImg} width={100} alt="playlist" />}
              <br />
              <button onClick={() =>
                followingUsers[user.userId]
                  ? unfollowUser(user.userId)
                  : followUser(user.userId)
              }>
                {followingUsers[user.userId] ? "Dejar de seguir" : "Seguir"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
