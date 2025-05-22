// src/routes/DashboardView.jsx

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // 👈 Importa useNavigate arriba del archivo

import axios from "axios";

export default function DashboardView() {
    const navigate = useNavigate();
    const [spotifyToken, setSpotifyToken] = useState(null);
    const [spotifyProfile, setSpotifyProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [randomPlaylists, setRandomPlaylists] = useState([]);

    // Obtener token de usuario desde Firestore
    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const token = snap.data().spotifyToken;
                    setSpotifyToken(token);
                } else {
                    console.warn("⚠️ Usuario no encontrado en Firestore.");
                }
            } else {
                console.warn("⚠️ Usuario no autenticado.");
            }
        });
    }, []);

    // Obtener perfil de Spotify
    useEffect(() => {
        const fetchSpotifyProfile = async () => {
            if (!spotifyToken) return;
            try {
                const res = await axios.get("https://api.spotify.com/v1/me", {
                    headers: {
                        Authorization: `Bearer ${spotifyToken}`,
                    },
                });
                setSpotifyProfile(res.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    console.warn("⛔ Token inválido o expirado. Redirigiendo a Spotify...");
                    localStorage.removeItem("spotify_token");
                    redirectToSpotifyLogin();
                } else {
                    console.error("❌ Error al obtener perfil de Spotify:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSpotifyProfile();
    }, [spotifyToken]);

    // Hardcodear una playlist pública para mostrar
    useEffect(() => {
        const fetchNewReleases = async () => {
            if (!spotifyToken) return;

            try {
                console.log("🎟️ Usando token para new releases:", spotifyToken);

                const response = await axios.get(
                    "https://api.spotify.com/v1/browse/new-releases?limit=5",
                    {
                        headers: {
                            Authorization: `Bearer ${spotifyToken}`,
                        },
                    }
                );

                const albums = response.data.albums?.items || [];
                setRandomPlaylists(albums);
            } catch (error) {
                console.error("❌ Error al traer nuevos lanzamientos:", error);
            }
        };

        fetchNewReleases();
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
                scope: "user-read-email playlist-read-private playlist-read-collaborative",

            });

            window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
        });
    }

    function generateRandomString(length) {
        const charset =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

    if (loading) return <p>Cargando perfil de Spotify...</p>;
    if (!spotifyProfile)
        return <p>No se pudo obtener el perfil de Spotify. ¿Estás vinculado?</p>;

    return (
        <div>
            <h1>🎧 Bienvenido/a, {spotifyProfile.display_name}</h1>
                 <button onClick={() => navigate("/profile")}>👤 Ir a mi perfil</button>

            <h2>🎲 Playlist destacada</h2>
            {randomPlaylists.length === 0 ? (
                <p>No se pudieron cargar las playlists.</p>
            ) : (
                randomPlaylists.map((album) => (
                    <div key={album.id}>
                        <img src={album.images[0]?.url} alt="cover" width={150} />
                        <h3>{album.name}</h3>
                        <a href={album.external_urls.spotify} target="_blank" rel="noreferrer">
                            ➕ Escuchar en Spotify
                        </a>
                    </div>
                ))
            )}

        </div>
    );
}
