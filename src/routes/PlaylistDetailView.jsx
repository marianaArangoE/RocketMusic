// src/routes/PlaylistDetailView.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import axios from 'axios';

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
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 2. Fetch playlist details (forcing US market for previews)
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
        if (err.response?.status === 401 || err.response?.status === 403) {
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

  // 3. Preview play/pause handler
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

  // 4. Render states
  if (authLoading || loadingData) {
    return <p>Cargando playlist…</p>;
  }
  if (!spotifyToken) {
    return (
      <div>
        <p>❓ Necesitas vincular tu cuenta de Spotify.</p>
        <button onClick={redirectToSpotifyLogin}>Vincular cuenta</button>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error al cargar la playlist.</p>
        <button onClick={redirectToSpotifyLogin}>Reintentar</button>
      </div>
    );
  }
  if (!playlist) {
    return <p>No se encontró la playlist.</p>;
  }

  // 5. Prepare and render playlist details
  const tracks = playlist.tracks.items
    .map(item => item.track)
    .filter(Boolean);
  const previewableCount = tracks.filter(t => t.preview_url).length;

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <img
        src={playlist.images?.[0]?.url || 'https://placehold.co/300x300?text=Sin+imagen'}
        alt="Cover"
        width={200}
      />
      <h1>{playlist.name}</h1>
      <p>{playlist.description || 'Sin descripción disponible'}</p>
      <p>👥 Seguidores: {playlist.followers?.total ?? 0}</p>
      <p>🎶 Total canciones: {playlist.tracks.total}</p>
      <p>
        🎧 Canciones con preview: {previewableCount}/{playlist.tracks.items.length}
      </p>

      <ul>
        {tracks.map(track => (
          <li key={track.id} style={{ marginBottom: '1rem' }}>
            <strong>{track.name}</strong> — {track.artists?.[0]?.name || 'Desconocido'}
            <br />
            Álbum: {track.album?.name || 'Desconocido'}
            <br />
            ⏱{' '}
            {`${Math.floor(track.duration_ms / 60000)}:${String(
              Math.floor((track.duration_ms % 60000) / 1000)
            ).padStart(2, '0')}`}
            <br />
            {track.preview_url ? (
              <button onClick={() => handlePreviewClick(track)}>
                {playingTrackId === track.id ? '⏸️ Pausar' : '▶️ Reproducir preview'}
              </button>
            ) : (
              // fallback to Spotify embed iframe when no preview available
              <iframe
                title={`Spotify embed ${track.id}`}
                src={`https://open.spotify.com/embed/track/${track.id}`}
                width="300"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                style={{ marginTop: 8 }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
