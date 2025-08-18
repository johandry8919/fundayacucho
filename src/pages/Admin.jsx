import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../../src/services/api'; // Asegúrate de que la ruta sea correcta
import {  Button, TextField, Typography} from "@mui/material";

const Admin = () => {
  const [correo, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(correo, key);
      if (response.success) { 
        authLogin(); 
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión o del servidor.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="admin-login-container">
          <Typography variant="h5" align="center" gutterBottom>
          Iniciar Sesión de Administrador
        </Typography>

      <form onSubmit={handleSubmit} className="admin-login-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">

          <TextField
            fullWidth
            margin="normal"
            label="Correo Electrónico"
            type="email"
            value={correo}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
        </div>
        <div className="form-group">
          
          <TextField
            fullWidth
            margin="normal"
            label="Clave"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3 }}
          >
            Iniciar Sesión
          </Button>
      </form>
    </div>
  );
};

export default Admin;

