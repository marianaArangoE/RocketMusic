// src/routes/DashboardView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';

export default function DashboardView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  const [spotifyProfile, setSpotifyProfile] = React.useState(null);
  const [randomPlaylists, setRandomPlaylists] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 1. Si no hay usuario en Firebase, redirijo a /login
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 2. Cuando tenga token, traigo perfil y playlists
  React.useEffect(() => {
    if (!spotifyToken) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const headers = { Authorization: `Bearer ${spotifyToken}` };

    // Función async para fetch
    (async () => {
      try {
        // Perfil
        const { data: profileData } = await axios.get(
          'https://api.spotify.com/v1/me',
          { headers }
        );
        setSpotifyProfile(profileData);

        // Nuevos lanzamientos (destacados)
        const { data: releasesData } = await axios.get(
          'https://api.spotify.com/v1/browse/new-releases?limit=5',
          { headers }
        );
        setRandomPlaylists(releasesData.albums.items || []);
      } catch (err) {
        if (err.response?.status === 401) {
          // token inválido o expirado
          localStorage.removeItem('spotify_token');
          redirectToSpotifyLogin();
        } else {
          console.error('Error al cargar datos de Spotify:', err);
          setError(err);
        }
      } finally {
        setLoadingData(false);
      }
    })();
  }, [spotifyToken, redirectToSpotifyLogin]);

  // 3. UI de loading / error
  if (authLoading || loadingData) {
    return <p>Cargando dashboard…</p>;
  }

  if (!spotifyToken) {
    return (
      <div>
        <p>No tienes un token de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>
          Vincular Spotify
        </button>
      </div>
    );
  }

  if (error || !spotifyProfile) {
    return (
      <div>
        <p>Hubo un error al obtener tu perfil de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>
          Reintentar Vinculación
        </button>
      </div>
    );
  }

  // 4. Render principal
  return (
    <div>
      <h1>🎧 Bienvenido/a, {spotifyProfile.display_name}</h1>
      <button onClick={() => navigate('/profile')}>👤 Mi perfil</button>

      <h2>🎲 Playlists Destacadas</h2>
      {randomPlaylists.length === 0 ? (
        <p>No hay playlists para mostrar.</p>
      ) : (
        randomPlaylists.map((album) => (
          <div key={album.id} style={{ marginBottom: 20 }}>
            <img
              src={album.images[0]?.url}
              alt={album.name}
              width={150}
              height={150}
            />
            <h3>{album.name}</h3>
            <a
              href={album.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
            >
              ➕ Escuchar en Spotify
            </a>
          </div>
        ))
      )}
    </div>
  );
}
