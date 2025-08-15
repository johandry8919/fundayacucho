
import React from 'react';
import '../styles/dashboard.css';
import { Link, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <h3>Menú</h3>
        <ul>
          <li><Link to=".">Dashboard</Link></li>
          <li><Link to="reporte">Reportes</Link></li>
          <li><Link to="mapa">Mapa</Link></li>
          <li><Link to="consultas">Consultas</Link></li>
        </ul>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
