import AuthProvider from "../components/authProvider";
import { useNavigate } from "react-router-dom";
import { use, useState } from "react";
import { existUserName } from "../firebase/Firebase";
import { useEffect } from "react";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";

import axios from "axios";
export default function ChooseUsernameView() {
    const navigate = useNavigate();
    const [state, setCurrentState] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [username, setUsername] = useState('');

    const [spotifyToken, setSpotifyToken] = useState(null);
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const verifier = localStorage.getItem("spotify_code_verifier");

        if (code && verifier) {
            const fetchToken = async () => {
                try {
                    const body = new URLSearchParams({
                        grant_type: "authorization_code",
                        code,
                        redirect_uri: REDIRECT_URI,
                        client_id: CLIENT_ID,
                        code_verifier: verifier,
                    });

                    const { data } = await axios.post(
                        "https://accounts.spotify.com/api/token",
                        body.toString(),
                        {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                        }
                    );

                    const token = data.access_token;
                    localStorage.setItem("spotify_token", token);
                    setSpotifyToken(token);

                    console.log("✅ Access token obtenido:", token);
                    saveSpotifyToken(token);

                    window.history.replaceState({}, document.title, REDIRECT_URI);
                } catch (error) {
                    console.error("❌ Error al intercambiar el código por el token:", error.response || error);
                }
            };

            fetchToken();
        } else {
            const storedToken = localStorage.getItem("spotify_token");
            if (storedToken) setSpotifyToken(storedToken);
        }
    }, []);

    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";

    async function handleSpotifyLogin() {
        const codeVerifier = generateRandomString(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        localStorage.setItem("spotify_code_verifier", codeVerifier);

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: "code",
            redirect_uri: REDIRECT_URI,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            scope: "user-read-email playlist-read-private user-top-read user-read-recently-played"
            
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

async function saveSpotifyToken(token) {
  console.log("🚀 Entrando a saveSpotifyToken con token:", token);
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userId = response.data.id;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        const dataToSave = {
          spotifyId: userId,
          spotifyToken: token,
          spotifyName: response.data.display_name,
          linkedAt: new Date(),
        };

        if (userSnap.exists()) {
          await updateDoc(userRef, dataToSave);
          console.log('✅ Spotify token actualizado exitosamente');
        } else {
          await setDoc(userRef, {
            username: '', 
            ...dataToSave
          });
          console.log('✅ Documento creado con token de Spotify');
        }
      }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("⛔ Token expirado. Redirigiendo a login...");
      localStorage.removeItem("spotify_token");
      handleSpotifyLogin();
    } else {
      console.error("❌ Error al guardar token de Spotify:", error);
    }
  }
}



    function handleUserLoggedIn(user) {
        navigate('/dashboard');
    }
    function handleUserNotLoggedIn(user) {
        navigate('/login');

    }
    function handleUserNotRegistered(user) {
        setCurrentUser(user);
        setCurrentState(3);
    }
    function generateRandomString(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const values = window.crypto.getRandomValues(new Uint32Array(length));
        for (let i = 0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }
        return result;
    }

    async function generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }


    // function handleContinue() {
    //     if (username !== ''){
    //         const exist = await existUserName(username);
    //         if (exist){
    //             setCurrentState(5);
    //         }else{
    //             const tmp = {...currentUser}
    //             tmp.processCompleted = true;
    //         }

    //     }
    // }
    function handleContinue() { }

    if (state === 3) {
        return (
            <div>
                <h1>Bienvenido {currentUser.displayName}</h1>
                <div>
                    <button onClick={handleContinue}>Continuar</button>
                </div>
                {spotifyToken ? (
                    <p>🎶 Cuenta de Spotify vinculada correctamente</p>
                ) : (
                    <button onClick={handleSpotifyLogin}>Vincular cuenta de Spotify</button>
                )}


            </div>


        );
    }



    return (
        <AuthProvider
            onUserLoggedIn={handleUserLoggedIn}
            onUserNotLoggedIn={handleUserNotLoggedIn}
            onUserNotRegistered={handleUserNotRegistered}>
            <div>Loading...</div>
        </AuthProvider>
    );
}

