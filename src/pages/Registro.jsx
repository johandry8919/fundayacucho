import React, { useState, useEffect } from 'react';
import { registro_usuario } from '../services/api';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Registro.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    nacionalidad: '',
    correo: '',
    tipoUsuario: '1',
    password: '',
    id_rol : '1'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  //const [isMounted, setIsMounted] = useState(true);
  const navigate = useNavigate();

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      //setIsMounted(false);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate cédula (Venezuelan ID)
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!/^\d{6,8}$/.test(formData.cedula)) {
      newErrors.cedula = 'La cédula debe tener entre 6 y 8 dígitos';
    }
    
    // Validate email
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Por favor ingrese un correo electrónico válido';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await registro_usuario(
        formData.cedula, 
        formData.nacionalidad, 
        formData.correo, 
        formData.tipoUsuario, 
        formData.password
      );
      
      await Swal.fire({
        title: '¡Registrado con éxito!',
        text: 'Serás redirigido al login para iniciar sesión',
        icon: 'success',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
     
        navigate('/login');
      
      
    } catch (err) {
      
        const errorMessage = err.response?.data?.message || 'Error al registrar el usuario. Por favor intente de nuevo.';
        
        Swal.fire({
          title: 'Error al registrar',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: 'var(--primary-color)'
        });
      
    } finally {
        setLoading(false);
  
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h1 className="registro-title">Registro de Usuario</h1>
        
        <form onSubmit={handleSubmit} className="registro-form" noValidate>
          {Object.keys(errors).length > 0 && (
            <div className="error-message" role="alert" aria-live="assertive">
              Por favor corrija los errores en el formulario
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="cedula">
              Cédula {errors.cedula && <span className="error-text">- {errors.cedula}</span>}
            </label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.cedula}
              onChange={handleChange}
              className={`form-input ${errors.cedula ? 'input-error' : ''}`}
              required
              placeholder="Ingrese su cédula"
              disabled={loading}
              aria-invalid={!!errors.cedula}
              aria-describedby={errors.cedula ? 'cedula-error' : undefined}
            />
            {errors.cedula && (
              <span id="cedula-error" className="visually-hidden">
                Error: {errors.cedula}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="nacionalidad">Nacionalidad</label>
            <select
              id="nacionalidad"
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="V">Venezolano</option>
              <option value="E">Extranjero</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="correo">
              Correo Electrónico {errors.correo && <span className="error-text">- {errors.correo}</span>}
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              className={`form-input ${errors.correo ? 'input-error' : ''}`}
              required
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              disabled={loading}
              aria-invalid={!!errors.correo}
              aria-describedby={errors.correo ? 'correo-error' : undefined}
            />
            {errors.correo && (
              <span id="correo-error" className="visually-hidden">
                Error: {errors.correo}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="tipoUsuario">Tipo de Usuario</label>
            <select
              id="tipoUsuario"
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="1">Nuevo Becario</option>
              <option value="2">Egresado Fundayacucho</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              Contraseña {errors.password && <span className="error-text">- {errors.password}</span>}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="visually-hidden">
                Error: {errors.password}
              </span>
            )}
            <div className="password-hint">
              La contraseña debe tener al menos 8 caracteres
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <p className="login-link">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;