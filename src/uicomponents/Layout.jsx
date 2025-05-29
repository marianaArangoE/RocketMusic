// src/uicomponents/Layout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import '../styles/Layout.css';  // donde tienes .home-container

export default function Layout() {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <Nav className="nav-rocket">
        <div className="nav-button-container">
          <button className="nav-button" onClick={() => navigate('/home')}>Home</button>
          <button className="nav-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-button" onClick={() => navigate('/my-playlists')}>My Playlists</button>
          <button className="nav-button" onClick={() => navigate('/social')}>Social</button>
          <button className="nav-button" onClick={() => navigate('/profile')}>Profile</button>
          <button className="nav-button" onClick={() => navigate('/signout')}>Sign Out</button>
        </div>
      </Nav>

      {/* Overlay / sombra */}
      <div className="home-container__overlay" />

      {/* Aquí van todas las pantallas hijas */}
      <main style={{ paddingTop: '4rem' }}>
        <Outlet />
      </main>
    </>
  );
}
