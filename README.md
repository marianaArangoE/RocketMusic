
<div align="center">




![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Firebase Functions](https://img.shields.io/badge/Firebase_Functions-Cloud_Functions-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)

<br />

![Static Badge](https://img.shields.io/badge/status-online-brightgreen?style=for-the-badge) \
![Pokémon Theme](https://img.shields.io/badge/Theme-Pokémon-yellow?style=for-the-badge)
![Inspired by Spotify](https://img.shields.io/badge/Inspired%20By-Spotify-1DB954?logo=spotify&logoColor=white&style=for-the-badge) 
[![Live](https://img.shields.io/badge/Ver%20App-Online-success?style=for-the-badge)](https://pokemusic-66466.web.app/)

</div>

# Proyecto Poke-Music `Clon Spotify`
**Poke-Music** es una plataforma web inspirada en Spotify, con temática Pokémon. Permite a los usuarios autenticarse mediante Firebase y escuchar música utilizando la API de Spotify. El proyecto utiliza React, Vite y Bootstrap para la interfaz, y aprovecha las funciones de Firebase para la autenticación y el backend.


## Ejecucion en local
  Primero se debe instalar y configurar los componentes de forma global
  ```bash
    npm install -g firebase-tools 
    firebase login
  ```
  Despues de este paso se debe loguearse con la cuenta vinculada al proyecto de firebase



### Desarrollador
```bash
npm run build
firebase deploy --only hosting
```

---
> [!IMPORTANT]
> **IMPORTANTE:**  
> 1. Debes iniciar sesión con una cuenta que tenga permisos en el proyecto de Firebase.  
> 2. Además, para que la autenticación y los servicios de Spotify funcionen correctamente, la cuenta y las URLs deben estar autorizadas en la consola de Firebase y en la configuración de la API de Spotify.