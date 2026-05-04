import axios from 'axios';

const remoteBaseURL = 'https://gestion-financiera-personal-mi90.onrender.com/api';
const envBaseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
const baseURL = envBaseURL
  ?? (window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'                     // Si estás en tu PC
    : remoteBaseURL);   // Si estás en la web (Vercel)

const api = axios.create({
  baseURL,
});

export default api;