import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase/Firebase';
import '../styles/Login.css';

export default function LoginView() {
  const { user, loading } = useFirebaseAuth();
  const { login: redirectToSpotifyLogin } = useSpotifyToken();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleEmailAuth = async e => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{mode === 'signup' ? 'Crear cuenta' : 'Bienvenido'}</h2>
        <p>{mode === 'signup' ? 'Regístrate para comenzar' : 'Inicia sesión en tu cuenta'}</p>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <input
            type="email"
            value={email}
            placeholder="Correo electrónico"
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            value={password}
            placeholder="Contraseña"
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="button">
            {mode === 'signup' ? 'Registrarme' : 'Ingresar'}
            <span className="hoverEffect"><div/></span>
          </button>
        </form>

        <div className="social-login">
          <p>O inicia con:</p>
          <button className="button" onClick={handleFacebookLogin}>
            Iniciar con Facebook
            <span className="hoverEffect"><div/></span>
          </button>
          <button className="button" onClick={handleGoogleLogin}>
            Iniciar con Gmail
            <span className="hoverEffect"><div/></span>
          </button>
          <button className="button" onClick={redirectToSpotifyLogin}>
            Iniciar con Spotify
            <span className="hoverEffect"><div/></span>
          </button>
        </div>

        <div className="toggle-section">
          {mode === 'signin' ? (
            <p>
              ¿No tienes una cuenta?{' '}
              <button className="link-button" onClick={() => setMode('signup')}>
                Registrarme
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button className="link-button" onClick={() => setMode('signin')}>
                Iniciar sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
