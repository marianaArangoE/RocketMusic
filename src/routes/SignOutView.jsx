import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSignOut from '../hooks/useSignOut';
import '../styles/SignOut.css';

export default function SignOutView() {
  const [confirming, setConfirming] = useState(true);
  const signOut = useSignOut();
  const navigate = useNavigate();

  if (!confirming) {
    return (
      <div className="signout-container">
        <p className="signout-loading">Cerrando sesión…</p>
      </div>
    );
  }

  return (
    <div className="signout-container">
      <div className="signout-card">
        <p className="signout-question">¿Cerrar sesión?</p>
        <div className="signout-buttons">
          <button
            className="confirm-btn"
            onClick={() => {
              setConfirming(false);
              signOut();
            }}
          >
            ✅ Sí, cerrar sesión
            <span className="hoverEffect"><div /></span>
          </button>
          <button
            className="cancel-btn"
            onClick={() => navigate('/dashboard')}
          >
            ❌ No, volver
            <span className="hoverEffect"><div /></span>
          </button>
        </div>
      </div>
    </div>
  );
}