import { useState, useEffect } from 'react';
import { auth } from '../firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
