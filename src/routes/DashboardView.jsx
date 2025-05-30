import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';
import mimikyuIcon from '../uiResources/mimikyu.png';
import '../styles/Dashboard.css';

export default function DashboardView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  const [spotifyProfile, setSpotifyProfile] = React.useState(null);
  const [randomPlaylists, setRandomPlaylists] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);


  const loadDashboardData = React.useCallback(async () => {
    if (!spotifyToken) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    setError(null);

    try {

      const { data: profileData } = await axios.get(
        'https://api.spotify.com/v1/me',
        { headers: { Authorization: `Bearer ${spotifyToken}` } }
      );
      setSpotifyProfile(profileData);


      const { data: releasesData } = await axios.get(
        'https://api.spotify.com/v1/browse/new-releases?limit=',
        { headers: { Authorization: `Bearer ${spotifyToken}` } }
      );
      const items = releasesData.albums.items || [];


      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }


      setRandomPlaylists(items.slice(0, 6));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('spotify_token');
        redirectToSpotifyLogin();
      } else {
        console.error('Error al cargar datos de Spotify:', err);
        setError(err);
      }
    } finally {
      setLoadingData(false);
    }
  }, [spotifyToken, redirectToSpotifyLogin]);


  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  if (authLoading || loadingData) {
    return <p className="text-center mt-5">Cargando dashboard…</p>;
  }
  if (!spotifyToken) {
    return (
      <div className="text-center mt-5">
        <p>No tienes un token de Spotify.</p>
        <button onClick={redirectToSpotifyLogin} className="btn btn-primary">
          Vincular Spotify
        </button>
      </div>
    );
  }
  if (error || !spotifyProfile) {
    return (
      <div className="text-center mt-5">
        <p>Hubo un error al obtener tu perfil de Spotify.</p>
        <button onClick={redirectToSpotifyLogin} className="btn btn-primary">
          Reintentar Vinculación
        </button>
      </div>
    );
  }


  return (
    <div className="dashboard-content">
      <div className="welcome-header">
        <h1>
          <img
            src={mimikyuIcon}
            alt="Mimikyu"
            className="mimikyu-icon"
          />
          Bienvenido/a, {spotifyProfile.display_name}
        </h1>
      </div>

      
      <div className="dashboard-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button className="button" onClick={loadDashboardData}>
          Actualizar
          <span className="hoverEffect">
            <div />
          </span>
        </button>
      </div>

      <h2> 🎲 Playlists Destacadas 🎲 </h2>
      {randomPlaylists.length === 0 ? (
        <p>No hay playlists para mostrar.</p>
      ) : (
        <div className="dash-cards-container">
          {randomPlaylists.map(album => (
            <div
              key={album.id}
              className="dash-card"
              onClick={() => window.open(album.external_urls.spotify, '_blank')}
            >
              <img src={album.images[0]?.url} alt={album.name} />
              <h3>{album.name}</h3>
              <a
                href={album.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
              >
                Escuchar →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
