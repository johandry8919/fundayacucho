import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { login } from '../../src/services/api'; // Asegúrate de que la ruta sea correcta

const Admin = () => {
  const [correo, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      //const response = await login(correo, key);
      if (true) {
        navigate('/homeadministrador');
      } else {
        //setError(response.message || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión o del servidor.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Iniciar Sesión de Administrador</h2>
      <form onSubmit={handleSubmit} className="admin-login-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="correo">Correo Electrónico:</label>
          <input
            type="correo"
            id="correo"
            value={correo}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="key">Clave:</label>
          <input
            type="password"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Admin;

