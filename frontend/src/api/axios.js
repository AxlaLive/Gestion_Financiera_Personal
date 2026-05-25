import axios from 'axios';

// Forzamos la URL de producción directamente
const baseURL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
});

export default api;
