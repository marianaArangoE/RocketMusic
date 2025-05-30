// src/components/LoadingScreen.jsx
import React from 'react';
import psyduck from '../uiResources/psyduck.gif';
import '../styles/LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <img src={psyduck} alt="Cargando..." className="loading-gif" />
    </div>
  );
}
