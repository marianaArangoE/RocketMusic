import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/Firebase";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";

export default function ProfileView() {
    const [spotifyToken, setSpotifyToken] = useState(null);
    const [spotifyProfile, setSpotifyProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPlaylistsCount, setUserPlaylistsCount] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [recentTracks, setRecentTracks] = useState([]);
    const [topGenres, setTopGenres] = useState([]);


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
    useEffect(() => {
        const fetchSpotifyData = async () => {
            if (!spotifyToken) return;

            try {
                const headers = { Authorization: `Bearer ${spotifyToken}` };

                const [profileRes, playlistsRes, topArtistsRes, recentTracksRes] =
                    await Promise.all([
                        axios.get("https://api.spotify.com/v1/me", { headers }),
                        axios.get("https://api.spotify.com/v1/me/playlists", { headers }),
                        axios.get("https://api.spotify.com/v1/me/top/artists?limit=5", { headers }),
                        axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=5", { headers }),
                    ]);

                setSpotifyProfile(profileRes.data);
                setUserPlaylistsCount(playlistsRes.data.total);
                setTopArtists(topArtistsRes.data.items);
                setRecentTracks(recentTracksRes.data.items);

                // Extraer géneros más frecuentes
                const genreMap = {};
                topArtistsRes.data.items.forEach((artist) => {
                    artist.genres.forEach((genre) => {
                        genreMap[genre] = (genreMap[genre] || 0) + 1;
                    });
                });
                const sortedGenres = Object.entries(genreMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([genre]) => genre);
                setTopGenres(sortedGenres);

            } catch (error) {
                if (error.response?.status === 403) {
                    console.warn("⛔ Token sin permisos suficientes. Redirigiendo para actualizar scopes...");
                    updatePermissions();
                } else {
                    console.error("❌ Error al obtener datos de Spotify:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSpotifyData();
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
                scope: "user-read-email playlist-read-private user-top-read user-read-recently-played"

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
    function updatePermissions() {
        localStorage.removeItem("spotify_token");
        localStorage.removeItem("spotify_code_verifier"); scope: "user-read-email"
        console.warn("⛔ Token sin permisos suficientes. Redirigiendo a login...");
        redirectToSpotifyLogin();
    }

    if (loading) return <p>Cargando perfil de Spotify...</p>;
    if (!spotifyProfile)
        return <p>No se pudo obtener el perfil de Spotify. ¿Estás vinculado?</p>;
    console.log("📷 Imagen de perfil:", spotifyProfile.images);
    return (
        <div>
            <h1>🎧 Bienvenido/a, {spotifyProfile.display_name}</h1>
            <img
                src={spotifyProfile.images?.[0]?.url || "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/001.png"}
                alt="Avatar"
                width={150}
                style={{ borderRadius: "50%", margin: "1rem 0" }}
            />
            <button onClick={() => window.location.href = "/my-playlists"}>
                📂 Ver mis playlists
            </button>
            <p>📧 Email: {spotifyProfile.email}</p>
            <p>🆔 ID: {spotifyProfile.id}</p>
            <p>🎵 Número de playlists: {userPlaylistsCount ?? "Cargando..."}</p>

            <h3>👩‍🎤 Artistas más escuchados</h3>
            <ul>
                {topArtists.map((artist) => (
                    <li key={artist.id}>{artist.name}</li>
                ))}
            </ul>

            <h3>🎼 Géneros favoritos</h3>
            <ul>
                {topGenres.map((genre, index) => (
                    <li key={index}>{genre}</li>
                ))}
            </ul>

            <h3>🕘 Historial reciente</h3>
            <ul>
                {recentTracks.map((item, index) => (
                    <li key={index}>{item.track.name} - {item.track.artists[0].name}</li>
                ))}
            </ul>

            <a
                href="https://www.spotify.com/account/profile/"
                target="_blank"
                rel="noreferrer"
            >
                ✏️ Editar perfil en Spotify
            </a>
        </div>
    );
}