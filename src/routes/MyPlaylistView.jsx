import { useState, useEffect } from "react";
import axios from "axios";
import { auth, db } from "../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function MyPlaylistView() {
    const [spotifyToken, setSpotifyToken] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    


    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setSpotifyToken(snap.data().spotifyToken);
                }
            }
        });
    }, []);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!spotifyToken) return;
            try {
                const res = await axios.get("https://api.spotify.com/v1/me/playlists", {
                    headers: {
                        Authorization: `Bearer ${spotifyToken}`,
                    },
                });
                setPlaylists(res.data.items);
            } catch (error) {
                if (error.response?.status === 403) {
                    console.warn("⛔ Permisos insuficientes. Redirigiendo a Spotify para actualizar permisos...");
                    redirectToSpotifyLogin();
                } else {
                    console.error("❌ Error al cargar playlists:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [spotifyToken]);

    function redirectToSpotifyLogin() {
        const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

        const codeVerifier = generateRandomString(128);
        generateCodeChallenge(codeVerifier).then((codeChallenge) => {
            localStorage.setItem("spotify_code_verifier", codeVerifier);

            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                response_type: "code",
                redirect_uri: REDIRECT_URI,
                code_challenge_method: "S256",
                code_challenge: codeChallenge,
                scope: "playlist-read-private user-read-email user-read-recently-played user-top-read",
            });

            window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
        });
    }

    function generateRandomString(length) {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const values = window.crypto.getRandomValues(new Uint32Array(length));
        for (let i = 0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }
        return result;
    }

    async function generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest("SHA-256", data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

return (
    <div>
        <h1>🎵 Mis playlists</h1>
        {loading ? (
            <p>Cargando playlists...</p>
        ) : playlists.length === 0 ? (
            <p>No se encontraron playlists.</p>
        ) : (
            playlists.map((pl) => (
                <div key={pl.id}>
                    <img
                        src={pl.images?.[0]?.url || "https://via.placeholder.com/150"}
                        alt={pl.name}
                        width={150}
                    />
                    <h3>{pl.name}</h3>
                    <a
                        href={pl.external_urls.spotify}
                        target="_blank"
                        rel="noreferrer"
                    >
                        ▶️ Ver en Spotify
                    </a>
                    <br />
                    <Link to={`/playlist/${pl.id}`}>🧐 Ver detalles</Link>
                </div>
            ))
        )}
    </div>
);
}
