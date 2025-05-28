// src/routes/MyPlaylistView.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';

export default function MyPlaylistView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  const [playlists, setPlaylists] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 1. Redirigir al login si no hay usuario Firebase
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 2. Cuando cambie spotifyToken, traigo mis playlists
  React.useEffect(() => {
    if (!spotifyToken) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setError(null);

    (async () => {
      try {
        const { data } = await axios.get(
          'https://api.spotify.com/v1/me/playlists',
          { headers: { Authorization: `Bearer ${spotifyToken}` } }
        );
        setPlaylists(data.items);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          // token inválido/expirado o permisos insuficientes
          localStorage.removeItem('spotify_token');
          redirectToSpotifyLogin();
        } else {
          console.error('Error al cargar playlists:', err);
          setError(err);
        }
      } finally {
        setLoadingData(false);
      }
    })();
  }, [spotifyToken, redirectToSpotifyLogin]);

  // 3. Estados de carga / error / no vinculado
  if (authLoading || loadingData) {
    return <p>Cargando playlists…</p>;
  }

  if (!spotifyToken) {
    return (
      <div>
        <p>No estás vinculado a Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Vincular cuenta</button>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error al cargar tus playlists.</p>
        <button onClick={redirectToSpotifyLogin}>Reintentar vinculación</button>
      </div>
    );
  }

  // 4. Render principal
  return (
    <div>
      <h1>🎵 Mis playlists</h1>
      {playlists.length === 0 ? (
        <p>No se encontraron playlists.</p>
      ) : (
        playlists.map((pl) => (
          <div key={pl.id} style={{ marginBottom: 20 }}>
            <img
              src={pl.images?.[0]?.url || 'https://via.placeholder.com/150'}
              alt={pl.name}
              width={150}
            />
            <h3>{pl.name}</h3>
            <a
              href={pl.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
            >
              ▶️ Ver en Spotify
            </a>
            <br />
            <Link to={`/playlist/${pl.id}`}>🧐 Ver detalles</Link>
          </div>
        ))
      )}
    </div>
  );
}
