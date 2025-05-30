// src/routes/PlaylistDetailView.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import '../styles/PlaylistDetail.css'; // Asegúrate de tener este CSS

export default function PlaylistDetailView() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  const [playlist, setPlaylist] = React.useState(null);
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentAudio, setCurrentAudio] = React.useState(null);
  const [playingTrackId, setPlayingTrackId] = React.useState(null);

  // 1. Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  // 2. Fetch playlist details
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
          `https://api.spotify.com/v1/playlists/${playlistId}?market=US`,
          { headers: { Authorization: `Bearer ${spotifyToken}` } }
        );
        setPlaylist(data);
      } catch (err) {
        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem('spotify_token');
          redirectToSpotifyLogin();
        } else {
          console.error('Error fetching playlist:', err);
          setError(err);
        }
      } finally {
        setLoadingData(false);
      }
    })();
  }, [playlistId, spotifyToken, redirectToSpotifyLogin]);

  // 3. Play/pause preview
  function handlePreviewClick(track) {
    if (!track.preview_url) return;
    if (currentAudio && playingTrackId === track.id) {
      currentAudio.pause();
      setPlayingTrackId(null);
      return;
    }
    if (currentAudio) currentAudio.pause();

    const audio = new Audio(track.preview_url);
    audio.play();
    setCurrentAudio(audio);
    setPlayingTrackId(track.id);
    audio.onended = () => setPlayingTrackId(null);
  }

  // 4. Loading skeleton
  if (authLoading || loadingData) {
    return (
      <div className="playlist-skeleton">
        <div className="main">
          <div className="currentplaying">
            {/* tu SVG de Gengar aquí */}
            <svg height="50px" width="50px" viewBox="0 0 64 64" className="spotify">…</svg>
            <p className="heading">Cargando playlist…</p>
          </div>
          {[1, 2, 3].map(i => (
            <div className="loader" key={i}>
              <div className="song">
                <p className="name">Cargando…</p>
                <p className="artist">Cargando…</p>
              </div>
              <div className="albumcover"></div>
              <div className={i === 1 ? 'loading' : 'play'}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Token missing / error / not found
  if (!spotifyToken) {
    return (
      <div className="playlist-detail">
        <p>❓ Necesitas vincular tu cuenta de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Vincular cuenta</button>
      </div>
    );
  }
  if (error) {
    return (
      <div className="playlist-detail">
        <p>Error al cargar la playlist.</p>
        <button onClick={redirectToSpotifyLogin}>Reintentar</button>
      </div>
    );
  }
  if (!playlist) {
    return (
      <div className="playlist-detail">
        <p>No se encontró la playlist.</p>
      </div>
    );
  }

  // 6. Render final
  const tracks = playlist.tracks.items.map(i => i.track).filter(Boolean);
  const previewableCount = tracks.filter(t => t.preview_url).length;

  return (
    <div className="playlist-detail">
      <button className="back-button" onClick={() => navigate(-1)}>← Volver</button>

      <div className="playlist-header">
        <img
          className="playlist-cover"
          src={playlist.images?.[0]?.url || 'https://placehold.co/300x300?text=Sin+imagen'}
          alt="Cover"
        />
        <div className="playlist-info">
          <h1>{playlist.name}</h1>
          <p>{playlist.description || 'Sin descripción disponible'}</p>
          <div className="stats">
            <span>👥 {playlist.followers?.total ?? 0}</span>
            <span>🎶 {playlist.tracks.total}</span>
            <span>🎧 {previewableCount}/{tracks.length}</span>
          </div>
        </div>
      </div>

      <ul className="track-list">
        {tracks.map(track => (
          <li key={track.id} className="track-item">
            <div className="track-row">
              <img
                className="track-album"
                src={track.album?.images?.[0]?.url || 'https://placehold.co/50'}
                alt=""
              />
              <div className="track-info">
                <a
                  href={`https://open.spotify.com/track/${track.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="track-link"
                >
                  <strong>{track.name}</strong>
                </a>
                <span className="track-artist">{track.artists?.[0]?.name || 'Desconocido'}</span>
                <span className="track-duration">
                  {`${Math.floor(track.duration_ms/60000)}:${String(Math.floor((track.duration_ms%60000)/1000)).padStart(2,'0')}`}
                </span>
              </div>
              <div className="track-action">
                {track.preview_url ? (
                  <button
                    className="play-btn"
                    onClick={() => handlePreviewClick(track)}
                  >
                    {playingTrackId === track.id ? '⏸️' : '▶️'}
                  </button>
                ) : (
                  <iframe
                    className="spotify-embed"
                    title={`embed-${track.id}`}
                    src={`https://open.spotify.com/embed/track/${track.id}`}
                    frameBorder="0"
                    allow="encrypted-media"
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
