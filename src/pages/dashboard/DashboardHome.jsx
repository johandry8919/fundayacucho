
import React from 'react';
import Chart from '../../components/Chart';

const DashboardHome = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard de Administración</h2>
      </div>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Usuarios Registrados</h3>
          <p>1,234</p>
        </div>
        <div className="card">
          <h3>Solicitudes Pendientes</h3>
          <p>56</p>
        </div>
        <div className="card">
          <h3>Becas Aprobadas</h3>
          <p>789</p>
        </div>
        <div className="card">
          <h3>Países Activos</h3>
          <p>42</p>
        </div>
      </div>
      <div className="dashboard-chart">
        <Chart />
      </div>
    </div>
  );
};

export default DashboardHome;
