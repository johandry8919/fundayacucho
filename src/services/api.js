import axios from 'axios';

const API_BASE_URL = 'https://comunajoven.com.ve/api'; // Reemplazar con tu URL real
  const token = 'faa3dc480981bbfb734839367d2c9367';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
     Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    let errorObj = {
      status: null,
      message: 'Error desconocido',
      originalError: error
    };

    if (error.response) {
      // Error de servidor (4xx, 5xx)
      errorObj = {
        status: error.response.status,
        message: error.response.data?.message || 'Error en la solicitud',
        data: error.response.data
      };
      console.error('Error de API:', errorObj);
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      errorObj.message = 'No se pudo conectar con el servidor';
      console.error('No hubo respuesta del servidor');
    } else {
      // Error al configurar la solicitud
      errorObj.message = `Error al configurar la solicitud: ${error.message}`;
      console.error('Error al configurar la solicitud:', error.message);
    }

    return Promise.reject(errorObj);
  }
);

export const searchUser = async (nacionalidad, cedula) => {
  const response = await api.get('/cedula', {
    params: { nacionalidad, cedula }
  });
  return response.data;
};

export const submitForm = async (formData) => {
  const response = await api.post('/users/register', formData);
  return response.data;
};