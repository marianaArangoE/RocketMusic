// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';

export default function ProtectedRoute({ requireSpotify = false }) {
  const { user, loading } = useFirebaseAuth();
  const { token: spotifyToken } = useSpotifyToken();

  // Mientras se resuelve el estado de autenticación
  if (loading) return <p className="text-center mt-5">Cargando…</p>;

  // Si no hay usuario en Firebase, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere token de Spotify y no existe, redirigir a vincular
  if (requireSpotify && !spotifyToken) {
    return <Navigate to="/spotify-login" replace />;
  }

  // Si todo OK, renderizar ruta hija
  return <Outlet />;
}
