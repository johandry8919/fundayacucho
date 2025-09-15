import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/" className="footer-logo-link">
              <img 
                src="https://fundayacucho.gob.ve/img/logo50ani.ico" 
                alt="Fundayacucho Logo" 
                className="footer-logo-img"
                width="40"
                height="40"
                loading="lazy"
              />
              <span className="footer-logo-text">fundayacucho.gob.ve</span>
            </Link>
          </div>
          
          <div className="footer-info">
            <p className="footer-copyright">
              &copy; {currentYear} Fundación Gran Mariscal de Ayacucho. Todos los derechos reservados.
            </p>
            <p className="footer-address">
              Dirección General de Tecnología de la Información
            </p>
          </div>
          
          <div className="footer-links">
            <Link to="/terminos" className="footer-link">Términos y Condiciones</Link>
            <Link to="/privacidad" className="footer-link">Política de Privacidad</Link>
            <Link to="/contacto" className="footer-link">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
