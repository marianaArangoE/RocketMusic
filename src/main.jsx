// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './theme.css';
import './index.css';

import { ThemeProvider } from './hooks/ThemeContext';   // 📌 ruta correcta
import App from './App';
import SpotifyLoginView from './routes/SpotifyLoginView';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function Root() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/signout" element={<SignOutView />} />
          <Route path="u/:username" element={<PublicProfileView />} />
          <Route path="choose-username" element={<ChooseUsernameView />} />
          <Route path="/spotify-login" element={<SpotifyLoginView />} />
          <Route path="/callback" element={<CallbackView />} />
          <Route path="/my-playlists" element={<MyPlayListView />} />
          <Route path="/social" element={<SocialView />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailView />} />
        </Routes>
      </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
