import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';

export default function HomeView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  if (authLoading) return <p>Cargando…</p>;

  const isLoggedIn = !!user && !!spotifyToken;

  if (isLoggedIn) {
    return (
      <div className="dark-mode">
        <header className="header-rocket">
          <nav className="nav-rocket">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/my-playlists">Mis Playlists</Link>
            <Link to="/social">Social</Link>
            <Link to="/signout">Cerrar Sesión</Link>
          </nav>
        </header>
        <main className="main-rocket">
          <h1>¡Bienvenido de nuevo, {user.displayName || 'usuario'}!</h1>
          <p>Usa el menú de arriba para navegar.</p>
        </main>
      </div>
    );
  } else {
    return (
      <div className="text-center mt-5 dark-mode">
        <h1>Bienvenido a SpotifyApp</h1>
        <p>Inicia sesión para comenzar a explorar tus playlists y descubrir nuevos curadores.</p>
        <div className="mt-4">
          <button
            onClick={redirectToSpotifyLogin}
            className="btn btn-rocket me-2"
          >
            Iniciar sesión con Spotify
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="btn btn-rocket"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    );
  }
}
