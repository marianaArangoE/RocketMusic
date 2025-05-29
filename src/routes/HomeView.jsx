// src/routes/HomeView.jsx
import React, { useState, useEffect } from "react";
import TrackVisibility from 'react-on-screen';
import { ReactTyped } from "react-typed";


import { Link, useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import gengarGif from '../uiResources/gengar.gif';
import pokeballIcon from '../uiResources/pokebutton.png';
import '../styles/Home.css';
import { Container, Row, Col, Button, ToggleButton, Nav, Card } from 'react-bootstrap';
export default function HomeView() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { token: spotifyToken, login: redirectToSpotifyLogin } = useSpotifyToken();

  if (authLoading) {
    return <p className="text-center mt-5">Cargando…</p>;
  }

  const isLoggedIn = !!user && !!spotifyToken;
  if (!isLoggedIn) {
    return (
      <Container fluid className="home-container">
        <h1>Bienvenido a RocketMusic</h1>
        <p>Inicia sesión para explorar y empezar a escuchar música.</p>
        <Button variant="primary" onClick={redirectToSpotifyLogin} className="mt-3">
          Iniciar sesión con Spotify
        </Button>
      </Container>
    );
  }
  return (
    <Container fluid className="home-container">

      <Row className="home-row">
        <Col md={{ span: 8, offset: 2 }}>
          <div className="welcome-box d-flex align-items-center justify-content-between">
            <div>
              <h1 className="welcome-text typing-container">
                Bienvenido al cuartel del Equipo Rocket
              </h1>
              {/* <p className="welcome-subtext ">
                ¡Prepárate para capturar toda la música!
              </p> */}




              <TrackVisibility>
                {({ isVisible }) =>
                  <div className={`animate__animated ${isVisible ? 'animate__fadeIn' : ''}`}>
                    <p className="welcome-subtext "> {""}<br></br>
                      <ReactTyped
                        strings={["¡Prepárate para capturar toda la música!", "¡Atrapa todas tus canciones favoritas!", "¡Hazte con todas… las playlists!"]}
                        typeSpeed={100} loop backSpeed={50}
                        className="current-text"
                        // style={{ whiteSpace: 'pre-line', fontSize: '2em' }}
                      />
                    </p>
                  </div>
                }
              </TrackVisibility>

              <div className="loader pokeball-loader">
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