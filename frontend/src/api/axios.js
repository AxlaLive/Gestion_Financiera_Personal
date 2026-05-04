import axios from 'axios';

const baseURL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api'                     // Si estás en tu PC
    : 'https://tu-link-de-render.onrender.com/api';   // Si estás en la web (Vercel)

const api = axios.create({
  baseURL: baseURL,
});

export default api;