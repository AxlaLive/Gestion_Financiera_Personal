import axios from 'axios';

// Forzamos la URL de producción directamente
const baseURL = 'https://gestion-financiera-personal-mi90.onrender.com/api';

const api = axios.create({
  baseURL,
});

export default api;
