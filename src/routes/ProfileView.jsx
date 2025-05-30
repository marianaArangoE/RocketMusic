// src/routes/ProfileView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';
import '../styles/Profile.css';
import LoadingScreen from '../components/LoadingScreen';
export default function ProfileView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  const [profile, setProfile] = React.useState(null);
  const [playlistsCount, setPlaylistsCount] = React.useState(null);
  const [topArtists, setTopArtists] = React.useState([]);
  const [recentTracks, setRecentTracks] = React.useState([]);
  const [topGenres, setTopGenres] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  React.useEffect(() => {
    if (!spotifyToken) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    const headers = { Authorization: `Bearer ${spotifyToken}` };

    (async () => {
      try {
        const [
          profileRes,
          playlistsRes,
          topArtistsRes,
          recentTracksRes
        ] = await Promise.all([
          axios.get('https://api.spotify.com/v1/me', { headers }),
          axios.get('https://api.spotify.com/v1/me/playlists?limit=1', { headers }),
          axios.get('https://api.spotify.com/v1/me/top/artists?limit=5', { headers }),
          axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=5', { headers }),
        ]);

        setProfile(profileRes.data);
        setPlaylistsCount(playlistsRes.data.total);
        setTopArtists(topArtistsRes.data.items);
        setRecentTracks(recentTracksRes.data.items);

        // calcular géneros top
        const genreCount = {};
        topArtistsRes.data.items.forEach(a =>
          a.genres.forEach(g => (genreCount[g] = (genreCount[g] || 0) + 1))
        );
        const sorted = Object.entries(genreCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([g]) => g);
        setTopGenres(sorted);

      } catch (err) {
        if ([401,403].includes(err.response?.status)) {
          localStorage.removeItem('spotify_token');
          redirectToSpotifyLogin();
        } else {
          console.error('Error Spotify:', err);
          setError(err);
        }
      } finally {
        setLoadingData(false);
      }
    })();
  }, [spotifyToken, redirectToSpotifyLogin]);

if (authLoading || loadingData) {
    return <LoadingScreen />;
  }
  if (!spotifyToken) {
    return (
      <div className="profile-empty">
        <p>No estás vinculado a Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Vincular cuenta</button>
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="profile-empty">
        <p>Error al cargar tus datos de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="profile-content">
      <section className="profile-header">
        <img
          className="profile-avatar"
          src={
            profile.images?.[0]?.url ||
            'https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/001.png'
          }
          alt="Avatar"
        />
        <h1>🎧 {profile.display_name}</h1>
        <p className="profile-email">📧 {profile.email}</p>
      </section>

      <section className="profile-stats">
        <div className="stat-card">
          <h3>Playlists</h3>
          <p>{playlistsCount}</p>
        </div>
        <div className="stat-card">
          <h3>Géneros Top</h3>
          <p>{topGenres.join(', ')}</p>
        </div>
      </section>

      <section className="profile-cards-grid">
        <div className="card">
          <h3>👩‍🎤 Artistas Top</h3>
          <ul>
            {topArtists.map(a => <li key={a.id}>{a.name}</li>)}
          </ul>
        </div>
        <div className="card">
          <h3>🕘 Recientes</h3>
          <ul>
            {recentTracks.map((item,i) => (
              <li key={i}>
                {item.track.name} — {item.track.artists[0]?.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="profile-actions">
        <button onClick={() => navigate('/my-playlists')} className="button">
          📂 Mis Playlists
          <span className="hoverEffect"><div/></span>
        </button>
        <a
          href="https://www.spotify.com/account/profile/"
          target="_blank"
          rel="noreferrer"
          className="edit-link"
        >
          ✏️ Editar perfil en Spotify
        </a>
      </footer>
    </div>
  );
}
