import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import '../styles/Admin.css';

const Admin = () => {
  const [formData, setFormData] = useState({
    correo: '',
    key: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.correo) {
      setError('Por favor ingrese su correo electrónico');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      setError('Por favor ingrese un correo electrónico válido');
      return false;
    }
    
    if (!formData.key) {
      setError('Por favor ingrese su contraseña');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData.correo, formData.key);
      if (response && response.message === 'Login exitoso' && response.user) {
        authLogin(response.user);
        navigate('/admin/dashboard');
      } else {
        setError(response?.message || 'Error de autenticación. Por favor verifique sus credenciales.');
      }
    } catch (err) {
      if (isMounted) {
        setError('Error de conexión o del servidor. Por favor intente nuevamente.');
        console.error('Login error:', err);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Panel de Administración</h1>
        
        <form onSubmit={handleSubmit} className="admin-form" noValidate>
          {error && (
            <div 
              className="error-message" 
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="admin-email">Correo Electrónico</label>
            <input
              id="admin-email"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="admin@ejemplo.com"
              autoComplete="username"
              autoFocus
              disabled={loading}
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              name="key"
              type="password"
              value={formData.key}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
