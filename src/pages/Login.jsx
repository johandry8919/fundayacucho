import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../../src/services/api';
import { Button, TextField, Typography } from "@mui/material";
import Footer from '../components/Footer';
import Header from '../components/Header';

const Login = () => {
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
      if (response.message == 'Login exitoso') {
        authLogin(response.user); // Pass user data to context
        navigate('/home');
      } else {
        setError(response.message || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión o del servidor.');
      console.error('Login error:', err);
    }
  };

  return (
    <>
     <Header />
        
           
       
    <div className="admin-login-container">
      <Typography variant="h5" align="center" gutterBottom>
        Iniciar Sesión
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
        <Button
          variant="text"
          color="primary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => navigate('/registro')}
        >
          ¿No tienes cuenta? Regístrate
        </Button>
      </form>
    </div>

      <Footer />
    
    </>
   
  );
};

export default Login;
