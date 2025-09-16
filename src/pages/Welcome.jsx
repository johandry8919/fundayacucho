// pages/Welcome.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="container-fluid  text-center mt-5  ">
      <h1>Bienvenido a Fundayacucho</h1>
      <p>Por favor, inicie sesión o regístrese para continuar.</p>
      <div className="justify-content-center">
        <Link to="/login" className="btn btn-primary mx-2">
          Iniciar Sesión
        </Link>
        <Link to="/registro" className="btn btn-secondary mx-2">
          Registrarse
        </Link>
      </div>
    </div>
  );
}

export default Welcome;
