// src/routes/LoginView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/Firebase';
import '../styles/Login.css';

export default function LoginView() {
  const { user, loading } = useFirebaseAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (user) navigate('/dashboard');
      else navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged redirigirá al dashboard
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Facebook login error:', err);
    }
  };

  const handleEmailLogin = () => {
    navigate('/email-login');
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome</h2>
        <p>Sign in to your account</p>

        <button className="button" onClick={handleGoogleLogin}>
          Continue with Google
          <span className="hoverEffect"><div /></span>
        </button>

        <button className="button" onClick={handleFacebookLogin}>
          Continue with Facebook
          <span className="hoverEffect"><div /></span>
        </button>

        <button className="button" onClick={handleEmailLogin}>
          Continue with Email
          <span className="hoverEffect"><div /></span>
        </button>
      </div>
    </div>
  );
}
