
import React from 'react';
import '../styles/dashboard.css';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/Admin');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <h3>Menú</h3>
        <ul>
          <li><Link to=".">Dashboard</Link></li>
          <li><Link to="reporte">Reportes</Link></li>
          <li><Link to="mapa">Mapa</Link></li>
          <li><Link to="consultas">Consultas</Link></li>
          <li><button onClick={handleLogout} className="logout-button">Cerrar Sesión</button></li>
        </ul>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
