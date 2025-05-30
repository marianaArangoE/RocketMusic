import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './theme.css';
import './index.css';
import Layout from './uicomponents/Layout';

import SpotifyLoginView from './routes/SpotifyLoginView';
import LoginView from './routes/LoginView';
import HomeView from './routes/HomeView';
import DashboardView from './routes/DashboardView';
import ProfileView from './routes/ProfileView';
import SignOutView from './routes/SignOutView';
import PublicProfileView from './routes/PublicProfileView';
import ChooseUsernameView from './routes/ChooseUsernameView';
import CallbackView from './routes/CallbackView';
import MyPlayListView from './routes/MyPlaylistView';
import SocialView from './routes/SocialView';
import PlaylistDetailView from './routes/PlaylistDetailView';

import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './hooks/ThemeContext';

function AppRouter() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/home') {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/spotify-login" element={<SpotifyLoginView />} />
      <Route path="/callback" element={<CallbackView />} />


      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeView />} />
          <Route path="home" element={<HomeView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="signout" element={<SignOutView />} />
          <Route path="u/:username" element={<PublicProfileView />} />
          <Route path="choose-username" element={<ChooseUsernameView />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="my-playlists" element={<MyPlayListView />} />
          <Route path="social" element={<SocialView />} />
          <Route path="playlist/:playlistId" element={<PlaylistDetailView />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
