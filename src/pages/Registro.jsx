import React, { useState } from 'react';
import { registro_usuario } from '../services/api';
import Swal from 'sweetalert2';
import { Button, TextField, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [cedula, setCedula] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Hook para redirección
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await registro_usuario(cedula, nacionalidad, correo, tipoUsuario, password);
      
      Swal.fire({
        title: '¡Registrado con éxito!',
        text: 'Serás redirigido al login para iniciar sesión',
        icon: 'success',
        draggable: true,
        timer: 2000,
        timerProgressBar: true,
        didClose: () => {
          // Redirigir al login después de cerrar la alerta
          navigate('/login');
        }
      });
      
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario.');
      Swal.fire({
        title: 'Error al registrar',
        text: err.message || 'Ocurrió un error, por favor intente de nuevo.',
        icon: 'error',
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <Typography variant="h5" align="center" gutterBottom>
        Registro de Usuario
      </Typography>

      <form onSubmit={handleSubmit} className="admin-login-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <TextField
            fullWidth
            margin="normal"
            label="Cédula"
            type="number"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <FormControl fullWidth margin="normal">
            <InputLabel>Nacinalidad</InputLabel>
            <Select
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
              required
            >
              <MenuItem value="V">Venezolano</MenuItem>
              <MenuItem value="E">Estrangero</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="form-group">
          <TextField
            fullWidth
            margin="normal"
            label="Correo Electrónico"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Usuario</InputLabel>
            <Select
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              required
            >
              <MenuItem value="1">Nuevo Becario</MenuItem>
              <MenuItem value="2">Egresado Fundayacucho</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="form-group">
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </Button>
      </form>
    </div>
  );
};

export default Registro;