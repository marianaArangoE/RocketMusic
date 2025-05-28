// src/routes/ProfileView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';

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
        if (err.response?.status === 401 || err.response?.status === 403) {
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

  if (authLoading || loadingData) return <p>Cargando perfil…</p>;

  if (!spotifyToken) {
    return (
      <div>
        <p>No estás vinculado a Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Vincular cuenta</button>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div>
        <p>Error al cargar tus datos de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Reintentar</button>
      </div>
    );
  }

  return (
    <div>
      <h1>🎧 Hola, {profile.display_name}</h1>
      <img
        src={
          profile.images?.[0]?.url ||
          'https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/001.png'
        }
        alt="Avatar"
        width={150}
        style={{ borderRadius: '50%', margin: '1rem 0' }}
      />
      <p>📧 {profile.email}</p>
      <p>🆔 {profile.id}</p>
      <p>🎵 Playlists: {playlistsCount}</p>

      <h3>👩‍🎤 Tus artistas top</h3>
      <ul>
        {topArtists.map(a => <li key={a.id}>{a.name}</li>)}
      </ul>

      <h3>🎼 Géneros favoritos</h3>
      <ul>
        {topGenres.map((g,i) => <li key={i}>{g}</li>)}
      </ul>

      <h3>🕘 Reproducciones recientes</h3>
      <ul>
        {recentTracks.map((item,i) => (
          <li key={i}>
            {item.track.name} — {item.track.artists[0]?.name}
          </li>
        ))}
      </ul>

      <button onClick={() => navigate('/my-playlists')}>📂 Ver mis playlists</button>
      <br /><br />
      <a
        href="https://www.spotify.com/account/profile/"
        target="_blank"
        rel="noreferrer"
      >
        ✏️ Editar perfil en Spotify
      </a>
    </div>
  );
}
