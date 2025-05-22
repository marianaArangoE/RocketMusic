import { useEffect, useState } from "react";
import axios from "axios";

export default function SpotifyLoginView() {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("spotify_token");

    if (!storedToken && hash) {
      const tokenFromHash = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1];

      window.location.hash = "";
      if (tokenFromHash) {
        window.localStorage.setItem("spotify_token", tokenFromHash);
        storedToken = tokenFromHash;
      }
    }

    setToken(storedToken);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("spotify_token");
  };

  const searchArtists = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "artist",
      },
    });

    setArtists(data.artists.items);
  };

  const renderArtists = () =>
    artists.map((artist) => (
      <div key={artist.id}>
        {artist.images.length ? (
          <img width={"100%"} src={artist.images[0].url} alt={artist.name} />
        ) : (
          <div>No Image</div>
        )}
        <p>{artist.name}</p>
      </div>
    ));

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React Login</h1>

        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-email`}
          >
            Iniciar sesión con Spotify
          </a>
        ) : (
          <button onClick={logout}>Cerrar sesión</button>
        )}

        {token ? (
          <form onSubmit={searchArtists}>
            <input
              type="text"
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <button type="submit">Buscar artista</button>
          </form>
        ) : (
          <h2>Debes iniciar sesión con Spotify</h2>
        )}

        {renderArtists()}
      </header>
    </div>
  );
}
