import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsPanel = ({ becarios, loading }) => {
  // Calcular estadísticas
  const stats = React.useMemo(() => {
    if (!becarios || !becarios.length) {
      return { 
        total: 0, 
        nacional: 0, 
        internacional: 0, 
        exterior: 0 
      };
    }

    console.log(becarios)
    
    const total = becarios.length;
    
    // Contar por tipo de beca (ajusta estas condiciones según tus datos reales)
    const nacional = becarios.filter(b => {
      const tipo = b.tbecario_tipo || b.becario_tipo || '';
      return tipo.toLowerCase().includes("venezolano en venezuela");
    }).length;
    
    const internacional = becarios.filter(b => {
      const tipo = b.becario_tipo || b.becario_tipo || '';
      return tipo.toLowerCase().includes('internacional');
    }).length;
    
    const exterior = becarios.filter(b => {
      const tipo = b.becario_tipo || b.becario_tipo || '';
      return tipo.toLowerCase().includes('venezolano exterior') || tipo.toLowerCase().includes('venezolano exterior');
    }).length;
    
    return { total, nacional, internacional, exterior };
  }, [becarios]);

  // Preparar datos para el gráfico por estados
  const chartData = React.useMemo(() => {
    if (!becarios || !becarios.length) return null;
    
    // Contar becarios por estado
    const stateCounts = {};
    becarios.forEach(becario => {
      if (becario.estado) {
        stateCounts[becario.estado] = (stateCounts[becario.estado] || 0) + 1;
      }
    });
    
   
    const sortedStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      labels: sortedStates.map(item => item[0]),
      datasets: [
        {
          label: 'Becarios por Estado',
          data: sortedStates.map(item => item[1]),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [becarios]);

  const chartOptions = {
    responsive: true,
    indexAxis: 'y', 
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Estados con más Becarios',
      },
    },
  };

  if (loading) {
    return (
      <div className="row mb-4">
        <div className="col-12">
          <div className="text-center my-4">Cargando estadísticas...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Total Becarios</h5>
              <h2 className="card-text">{stats.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Becas Nacionales</h5>
              <h2 className="card-text">{stats.nacional}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Becas Internacionales</h5>
              <h2 className="card-text">{stats.internacional}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h5 className="card-title">Becas en Exterior</h5>
              <h2 className="card-text">{stats.exterior}</h2>
            </div>
          </div>
        </div>
      </div>

     
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Distribución de Becarios por Estado</h5>
              {chartData ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <p className="text-center">No hay datos para mostrar</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatisticsPanel;