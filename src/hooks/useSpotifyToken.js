// src/hooks/useSpotifyToken.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { auth, db } from '../firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CLIENT_ID        = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI     = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = window.crypto.getRandomValues(new Uint32Array(length));
  return Array.from(arr).map(n => charset[n % charset.length]).join('');
}
async function generateCodeChallenge(verifier) {
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default function useSpotifyToken() {
  const [token, setToken] = useState(() => localStorage.getItem('spotify_token'));

  // inicia el flow de login
  const login = useCallback(async () => {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('spotify_code_verifier', verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      scope: 'user-read-email playlist-read-private user-top-read user-read-recently-played',
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }, []);

  // intercambia el code por token y guarda en Firestore
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const verifier = localStorage.getItem('spotify_code_verifier');

    if (code && verifier) {
      (async () => {
        try {
          const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            code_verifier: verifier,
          });
          const { data } = await axios.post('https://accounts.spotify.com/api/token', body);
          const access_token = data.access_token;
          localStorage.setItem('spotify_token', access_token);
          setToken(access_token);

          // obtenemos userId de Spotify
          const me = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          const spotifyId = me.data.id;
          // guardamos en Firestore cuando haya sesión Firebase
          onAuthStateChanged(auth, async (fbUser) => {
            if (!fbUser) return;
            const ref = doc(db, 'users', fbUser.uid);
            const snap = await getDoc(ref);
            const dataToSave = {
              spotifyId,
              spotifyToken: access_token,
              spotifyName: me.data.display_name,
              linkedAt: new Date()
            };
            if (snap.exists()) await updateDoc(ref, dataToSave);
            else               await setDoc(ref, { username: '', ...dataToSave });
          });

          // limpiamos URL
          window.history.replaceState({}, document.title, REDIRECT_URI);
        } catch (err) {
          console.error('Error Spotify token:', err);
          if (err.response?.status === 401) {
            localStorage.removeItem('spotify_token');
            login();
          }
        }
      })();
    }
  }, [login]);

  return { token, login };
}
