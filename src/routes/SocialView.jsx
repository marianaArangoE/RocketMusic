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

  // Inicial (20 artistas “top”)
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://api.spotify.com/v1/search", {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: "top", type: "artist", limit: 50 },
        });
        const items = res.data.artists.items || [];
        const sliced = items.slice(0, 20).map(a => ({
          id: a.id,
          name: a.name,
          img: a.images?.[0]?.url || null,
          profileUrl: a.external_urls.spotify,
        }));
        // follow-status
        const ids = sliced.map(a => a.id).join(",");
        const followRes = await axios.get(
          "https://api.spotify.com/v1/me/following/contains",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { type: "artist", ids },
          }
        );
        const mapStatus = {};
        sliced.forEach((a, i) => (mapStatus[a.id] = followRes.data[i]));
        setFollowing(mapStatus);
        setArtists(sliced);
      } catch {
        redirectToSpotifyLogin();
      } finally {
        setLoading(false);
      }
    })();
  }, [token, redirectToSpotifyLogin]);

  // Búsqueda
  const doSearch = async e => {
    e.preventDefault();
    if (!token) return redirectToSpotifyLogin();
    setLoading(true);
    try {
      const res = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: search, type: "artist", limit: 10 },
      });
      setSearchResults(
        res.data.artists.items.map(a => ({
          id: a.id,
          name: a.name,
          img: a.images?.[0]?.url || null,
          profileUrl: a.external_urls.spotify,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // Follow / Unfollow
  const followArtist = async id => {
    await axios.put(
      "https://api.spotify.com/v1/me/following",
      {},
      { headers: { Authorization: `Bearer ${token}` }, params: { type: "artist", ids: id } }
    );
    setFollowing(f => ({ ...f, [id]: true }));
  };
  const unfollowArtist = async id => {
    await axios.delete("https://api.spotify.com/v1/me/following", {
      headers: { Authorization: `Bearer ${token}` },
      params: { type: "artist", ids: id },
    });
    setFollowing(f => ({ ...f, [id]: false }));
  };

  const list = searchResults.length > 0 ? searchResults : artists;
return (
  <div className="social-content">
    <h1>🎶 Descubre Artistas 🎶</h1>

    <div className="social-controls">
      <form className="search-form" onSubmit={doSearch}>
        <input
          type="text"
          value={search}
          placeholder="Buscar artistas"
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="button">
          Buscar
          <span className="hoverEffect">
            <div />
          </span>
        </button>
      </form>
      <button
        className="button"
        onClick={() => window.location.reload()}
        disabled={loading}
      >
        Aleatorio
        <span className="hoverEffect">
          <div />
        </span>
      </button>
    </div>

    {loading ? (
      <p className="text-center">Cargando…</p>
    ) : (
      <ul className="artist-list">
        {list.map(a => (
          <li key={a.id} className="artist-item">
            <img src={a.img || "https://placehold.co/64"} alt={a.name} />
            <div className="artist-info">
              <span className="artist-name">{a.name}</span>
              <a
                href={a.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="spotify-link"
              >
                Ver en Spotify
              </a>
            </div>
            <div className="artist-actions">
              <button
                className="button follow-button"
                onClick={() =>
                  following[a.id] ? unfollowArtist(a.id) : followArtist(a.id)
                }
              >
                {following[a.id] ? "Dejar de seguir" : "Seguir"}
                <span className="hoverEffect">
                  <div />
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
}