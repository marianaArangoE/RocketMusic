// src/routes/SocialView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import useSpotifyToken from "../hooks/useSpotifyToken";

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
    <div style={{ padding: 16 }}>
      <h1>🎶 Descubre Artistas</h1>

      <button
        onClick={() => window.location.reload()}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        🔄 Aleatorio
      </button>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <ul>
          {artists.map(a => (
            <li key={a.id} style={{ margin: "1rem 0" }}>
              <img
                src={a.img || "https://placehold.co/64"}
                alt={a.name}
                width={64}
                height={64}
                style={{ borderRadius: 32, marginRight: 12 }}
              />
              <strong>{a.name}</strong>
              <br />
              <a href={a.profileUrl} target="_blank" rel="noreferrer">
                Ver en Spotify
              </a>
              <br />
              <button
                onClick={() =>
                  following[a.id]
                    ? unfollowArtist(a.id)
                    : followArtist(a.id)
                }
              >
                {following[a.id] ? "Dejar de seguir" : "Seguir"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <form onSubmit={doSearch}>
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
        <ul style={{ marginTop: 16 }}>
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
