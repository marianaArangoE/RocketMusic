// src/routes/SignOutView.jsx
import React, { useState } from 'react';
import useSignOut from '../hooks/useSignOut';

export default function SignOutView() {
  const [confirming, setConfirming] = useState(true);
  const signOut = useSignOut();

  if (!confirming) {
    return <p>Cerrando sesión…</p>;
  }

  return (
    <div>
      <p>¿Cerrar sesión?</p>
      <button
        onClick={() => {
          setConfirming(false);
          signOut();
        }}
      >
        ✅ Sí, cerrar sesión
      </button>
      <button onClick={() => (window.location.href = '/dashboard')}>
        ❌ No, volver
      </button>
    </div>
  );
}
