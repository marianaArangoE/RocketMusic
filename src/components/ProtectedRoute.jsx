import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';

export default function ProtectedRoute({ requireSpotify = false }) {
  const { user, loading } = useFirebaseAuth();
  const { token: spotifyToken } = useSpotifyToken();

  
  if (loading) return <p className="text-center mt-5">Cargando…</p>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSpotify && !spotifyToken) {
    return <Navigate to="/spotify-login" replace />;
  }
  return <Outlet />;
}
