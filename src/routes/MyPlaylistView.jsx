import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';
import '../styles/MyPlaylists.css';

export default function MyPlaylistView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  const [playlists, setPlaylists] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);


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
        if ([401, 403].includes(err.response?.status)) {
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


  if (authLoading || loadingData) {
    return <p className="text-center mt-5">Cargando playlists…</p>;
  }
  if (!spotifyToken) {
    return (
      <div className="text-center mt-5">
        <p>No estás vinculado a Spotify.</p>
        <button onClick={redirectToSpotifyLogin} className="btn btn-primary">
          Vincular cuenta
        </button>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center mt-5">
        <p>Error al cargar tus playlists.</p>
        <button onClick={redirectToSpotifyLogin} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  
  return (
    <div className="dashboard-content">
      <h1>🎵 Mis playlists 🎵</h1>

      {playlists.length === 0 ? (
        <p>No se encontraron playlists.</p>
      ) : (
        <div className="dash-cards-container">
          {playlists.map((pl) => (
            <div key={pl.id} className="dash-card">
              <img
                src={pl.images?.[0]?.url || 'https://via.placeholder.com/150'}
                alt={pl.name}
                onClick={() => window.open(pl.external_urls.spotify, '_blank')}
                style={{ cursor: 'pointer' }}
              />
              <h3>{pl.name}</h3>
              <div className="actions">
                <a
                  href={pl.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="spotify-link"
                >
                   Ver en Spotify
                </a>
                <Link to={`/playlist/${pl.id}`} className="details-link">
                  🧐 Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
