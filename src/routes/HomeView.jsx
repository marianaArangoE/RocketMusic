// src/routes/HomeView.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFirebaseAuth from '../hooks/useFirebaseAuth';
import useSpotifyToken from '../hooks/useSpotifyToken';
import gengarGif from '../uiResources/gengar.gif';
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
      <Nav
        className="nav-rocket"
        variant="tabs"
        defaultActiveKey="/home"
      >
        <Nav.Item>
          <Nav.Link as={Link} to="/home">
            HOME
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/dashboard">
            DASHBOARD
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/my-playlists">
            MY PLAYLISTS
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/social">
            SOCIAL
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/profile">
            PROFILE
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/signout">
            SIGN OUT
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Row className="home-row">
        <Col md={{ span: 8, offset: 2 }}>
          <div className="welcome-box d-flex align-items-center justify-content-between">
            <div>
              <h1 className="welcome-text">
                Bienvenido al cuartel del Equipo Rocket
              </h1>
              <p className="welcome-subtext">
                ¡Prepárate para capturar toda la música!
              </p>
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