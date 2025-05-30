// src/routes/SocialView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import useSpotifyToken from "../hooks/useSpotifyToken";
import '../styles/Social.css';
export default function SocialView() {
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState({});
  const [loading, setLoading] = useState(false);

  const { token, login: redirectToSpotifyLogin } = useSpotifyToken();

  // Mezcla Fisher–Yates
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Inicial: carga 20 artistas “top” y su estado de follow
  useEffect(() => {
    if (!token) return;
    const init = async () => {
      setLoading(true);
      try {
        // 1) Obtener primer lote de artistas
        const res = await axios.get("https://api.spotify.com/v1/search", {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: "top", type: "artist", limit: 50 },
        });
        const items = res.data.artists?.items || [];
        const candidates = shuffle(items).slice(0, 20).map(a => ({
          id: a.id,
          name: a.name,
          img: a.images?.[0]?.url || null,
          profileUrl: a.external_urls.spotify,
        }));

        // 2) Consultar /me/following/contains para artistas
        const ids = candidates.map(a => a.id).join(",");
        const followRes = await axios.get(
          "https://api.spotify.com/v1/me/following/contains",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { type: "artist", ids },
          }
        );
        const statuses = followRes.data; // array of booleans

        // 3) Montar estado inicial
        const initialFollowing = {};
        candidates.forEach((a, idx) => {
          initialFollowing[a.id] = statuses[idx];
        });

        setFollowing(initialFollowing);
        setArtists(candidates);
      } catch (err) {
        console.error("Error cargando artistas:", err);
        if (err.response?.status === 401) redirectToSpotifyLogin();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  // Búsqueda de artistas
  const doSearch = async e => {
    e.preventDefault();
    if (!token) return redirectToSpotifyLogin();
    setLoading(true);
    try {
      const res = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: search, type: "artist", limit: 10 },
      });
      const items = res.data.artists?.items || [];
      setSearchResults(
        items.map(a => ({
          id: a.id,
          name: a.name,
          img: a.images?.[0]?.url || null,
          profileUrl: a.external_urls.spotify,
        }))
      );
    } catch (err) {
      console.error("Error en búsqueda de artistas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Follow / unfollow artista
  const followArtist = async id => {
    try {
      await axios.put(
        "https://api.spotify.com/v1/me/following",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "artist", ids: id },
        }
      );
      setFollowing(f => ({ ...f, [id]: true }));
    } catch (err) {
      console.error("Error siguiendo artista:", err);
    }
  };
  const unfollowArtist = async id => {
    try {
      await axios.delete("https://api.spotify.com/v1/me/following", {
        headers: { Authorization: `Bearer ${token}` },
        params: { type: "artist", ids: id },
      });
      setFollowing(f => ({ ...f, [id]: false }));
    } catch (err) {
      console.error("Error dejando de seguir artista:", err);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>🔒 Vincula tu cuenta de Spotify para continuar</h2>
        <button onClick={redirectToSpotifyLogin}>Login Spotify</button>
      </div>
    );
  }

return (
  <div className="social-content">
    <h1>🎶 Descubre Artistas</h1>

    <div className="social-controls">
      <button
        className="random-button"
        onClick={() => window.location.reload()}
        disabled={loading}
      >
        🔄 Aleatorio
      </button>
    </div>

    {loading ? (
      <p>Cargando…</p>
    ) : (
      <ul className="artist-list">
        {artists.map(a => (
          <li key={a.id}>
            <img
              src={a.img || "https://placehold.co/64"}
              alt={a.name}
            />
            <div className="artist-info">
              <strong>{a.name}</strong>
              <a href={a.profileUrl} target="_blank" rel="noreferrer">
                Ver en Spotify
              </a>
            </div>
            <div className="artist-actions">
              <button
                className="follow-button"
                onClick={() =>
                  following[a.id]
                    ? unfollowArtist(a.id)
                    : followArtist(a.id)
                }
              >
                {/* Corazón vacío */}
                <svg
                  className="empty"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                >
                  <path fill="none" d="M0 0H24V24H0z" />
                  <path
                    d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10
                       12.5C9.5 20 2 16 2 9c0-3.5 2.5-6
                       5.5-6C9.36 3 11 4 12 5c1-1
                       2.64-2 4.5-2zm-3.566 15.604c.881-.556
                       1.676-1.109 2.42-1.701C18.335 14.533
                       20 11.943 20 9c0-2.36-1.537-4-3.5-4
                       -1.076 0-2.24.57-3.086 1.414L12
                       7.828l-1.414-1.414C9.74 5.57
                       8.576 5 7.5 5 5.56 5 4 6.656 4
                       9c0 2.944 1.666 5.533 4.645 7.903
                       .745.592 1.54 1.145 2.421
                       1.7.299.189.595.37.934.572
                       .339-.202.635-.383.934-.571z"
                  />
                </svg>
                {/* Corazón relleno */}
                <svg
                  className="filled"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                >
                  <path d="M0 0H24V24H0z" fill="none" />
                  <path
                    d="M16.5 3C19.538 3 22 5.5 22 9c0 7
                       -7.5 11-10 12.5C9.5 20 2 16 2
                       9c0-3.5 2.5-6 5.5-6C9.36 3
                       11 4 12 5c1-1 2.64-2 4.5-2z"
                  />
                </svg>
                {following[a.id] ? "Dejar de seguir" : "Seguir"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}

    <hr />

    <form className="search-form" onSubmit={doSearch}>
      <input
        type="text"
        value={search}
        placeholder="Buscar artistas"
        onChange={e => setSearch(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        Buscar
      </button>
    </form>

    {searchResults.length > 0 && (
      <ul className="artist-list">
        {searchResults.map(a => (
          <li key={a.id}>
            <strong>{a.name}</strong>{" "}
            <a href={a.profileUrl} target="_blank" rel="noreferrer">
              Ver en Spotify
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);
}