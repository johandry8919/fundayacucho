import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    key: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trimStart()
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.correo.trim() || !formData.key.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo.trim())) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData.correo.trim(), formData.key);

           console.log(response)
  
      
      if (response.message === 'Login exitoso') {
        authLogin(response.user);
        navigate('/home', { replace: true });
      } else {
        setError(response.message || 'Error de autenticación');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (isMounted) {
        setError('Error de conexión o del servidor. Por favor intente nuevamente.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Iniciar Sesión</h1>
          
          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                type="email"
                id="correo"
                name="correo"
                className="form-input"
                value={formData.correo}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ingrese su correo electrónico"
                autoComplete="username"
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="key">Contraseña</label>
              <input
                type="password"
                id="key"
                name="key"
                className="form-input"
                value={formData.key}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
              aria-busy={loading}
              aria-live="polite"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            
            <p className="register-link">
              ¿No tienes una cuenta?{' '}
              <Link to="/registro" tabIndex={loading ? -1 : 0}>
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
