// // src/components/SpotifyAuthGuard.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, db } from "../firebase/Firebase";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import {
//   getStoredTokens,
//   getSpotifyAccessToken,
//   clearSpotifyTokens,
//   cacheSpotifyTokens,
// } from "../services/spotifyService";
// import { getSpotifyAuthUrl } from "../services/spotifyAuth";

// export default function SpotifyAuthGuard({ children }) {
//   const [checking, setChecking] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         // si no hay user de Firebase, llevar a login
//         navigate("/login", { replace: true });
//         return;
//       }

//       // 1) Intentamos desde local / refresco
//       let token = await getSpotifyAccessToken();

//       // 2) Si no hay token, probamos Firestore (caso first-load)
//       if (!token) {
//         const snap = await getDoc(doc(db, "users", user.uid));
//         if (snap.exists() && snap.data().spotify?.access_token) {
//           const s = snap.data().spotify;
//           token = s.access_token;
//           // cache local
//           await cacheSpotifyTokens({
//             access_token:  s.access_token,
//             refresh_token: s.refresh_token,
//             expires_in:    Math.floor((s.expiry - Date.now()) / 1000),
//           });
//         }
//       }

//       // 3) Si aún no tenemos token --> lanzamos PKCE de Spotify
//       if (!token) {
//         clearSpotifyTokens({ force: true });
//         const url = await getSpotifyAuthUrl({ showDialog: true });
//         window.location.href = url;
//         return;
//       }

//       // 4) Token OK → renderizamos children
//       setChecking(false);
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   if (checking) {
//     return (
//       <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
//         <h2>Validando sesión de Spotify…</h2>
//       </div>
//     );
//   }

//   return <>{children}</>;
// }
