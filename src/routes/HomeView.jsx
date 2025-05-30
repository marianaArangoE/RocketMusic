// src/routes/HomeView.jsx
import React from 'react';
import TrackVisibility from 'react-on-screen';
import { ReactTyped } from 'react-typed';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import gengarGif from '../uiResources/gengar.gif';
import pokeballIcon from '../uiResources/pokebutton.png';
import '../styles/Home.css';

export default function HomeView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  // Mientras comprobamos el estado de autenticación
  if (authLoading) {
    return <p className="text-center mt-5">Cargando…</p>;
  }

  // Si no hay usuario Firebase, lo enviamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado en Firebase pero no vinculado a Spotify
  if (user && !spotifyToken) {
    return (
      <Container fluid className="home-container text-center">
        <h1>Bienvenido a RocketMusic</h1>
        <p>Vincula tu cuenta de Spotify para empezar a escuchar.</p>
        <Button variant="primary" onClick={redirectToSpotifyLogin} className="mt-3">
          Vincular con Spotify
        </Button>
      </Container>
    );
  }

  // Ya está todo listo: Firebase + Spotify
  return (
    <Container fluid className="home-container">
      <Row className="home-row">
        <Col md={{ span: 8, offset: 2 }}>
          <div className="welcome-box d-flex align-items-center justify-content-between">
            <div>
              <h1 className="welcome-text typing-container">
                Bienvenido al cuartel del Equipo Rocket
              </h1>

              <TrackVisibility>
                {({ isVisible }) => (
                  <div className={`animate__animated ${isVisible ? 'animate__fadeIn' : ''}`}>
                    <p className="welcome-subtext">
                      <ReactTyped
                        strings={[
                          '¡Prepárate para capturar toda la música!',
                          '¡Atrapa todas tus canciones favoritas!',
                          '¡Hazte con todas… las playlists!'
                        ]}
                        typeSpeed={100}
                        loop
                        backSpeed={50}
                        className="current-text"
                      />
                    </p>
                  </div>
                )}
              </TrackVisibility>

              <div className="pokeball-loader">
                <Button
                  variant="link"
                  onClick={() => navigate('/dashboard')}
                  className="pokeball-btn mt-3"
                >
                  <img src={pokeballIcon} alt="Ir al Dashboard" />
                </Button>
              </div>
            </div>

            <Card className="gengar-card">
              <Card.Img
                className="gengar-img"
                src={gengarGif}
                alt="Gengar animado"
              />
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
