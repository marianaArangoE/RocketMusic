
import React, { useContext } from 'react'; 
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import cssNavar from '../styles/Layout.module.css'; 
import { ThemeContext } from '../hooks/ThemeContext';


export default function Layout() {
  const navigate = useNavigate();
  const { dark, toggle } = useContext(ThemeContext); 

  return (
    <>
      <Nav className={cssNavar.nav_rocket}>
        <div className="nav-button-container">
          <button className="nav-button" onClick={() => navigate('/home')}>Home</button>
          <button className="nav-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-button" onClick={() => navigate('/my-playlists')}>My Playlists</button>
          <button className="nav-button" onClick={() => navigate('/social')}>Social</button>
          <button className="nav-button" onClick={() => navigate('/profile')}>Profile</button>
          <button className="nav-button" onClick={() => navigate('/signout')}>Sign Out</button>

          <button
            className="nav-button"
            onClick={toggle}
            title="Cambiar tema"
            style={{ fontWeight: 'bold' }}
          >
            {dark ? '🌙 Oscuro' : '☀️ Claro'}
          </button>

          
        </div>
      </Nav>


      <div className="home-container__overlay" />
      <main style={{ paddingTop: '4rem' }}>
        <Outlet />
      </main>
    </>
  );
}
