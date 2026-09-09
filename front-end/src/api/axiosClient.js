import axios from 'axios';

// Vite utiliza import.meta.env para las variables que empiezan con VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opcional: Si manejas tokens de autenticación (JWT), puedes interceptar las peticiones aquí para agregarlos automáticamente
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // O donde guardes tu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;