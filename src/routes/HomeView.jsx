import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/Firebase';

export default function LogingView() {
  const { user, loading } = useFirebaseAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (user) navigate('/dashboard');
      else      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleOnclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleOnclick}>Login with Google</button>
    </div>
  );
}
