import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo-link" aria-label="Inicio">
          <img 
            src="/img/cintillo6.png" 
            alt="Fundayacucho - Logo" 
            className="header-logo"
            width="100%"
            height="155"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
