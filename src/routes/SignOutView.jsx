// src/routes/SignOutView.jsx
import React, { useState } from 'react';
import useSignOut from '../hooks/useSignOut';
import '../styles/SignOut.css';

export default function SignOutView() {
  const [confirming, setConfirming] = useState(true);
  const signOut = useSignOut();

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
          </button>
          <button
            className="cancel-btn"
            onClick={() => (window.location.href = '/dashboard')}
          >
            ❌ No, volver
          </button>
        </div>
      </div>
    </div>
  );
}
