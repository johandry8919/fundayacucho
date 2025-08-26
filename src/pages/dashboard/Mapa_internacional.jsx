import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { get_becarios } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Mapa = () => {
  const [becarios, setBecarios] = useState([]);
  const [filteredBecarios, setFilteredBecarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    estado: '',
    municipio: '',
    parroquia: ''
  });
  
  // Estados para las opciones de los selectores
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);

  const mapCenter = [10.5, -66.9];
  const zoomLevel = 6;

  useEffect(() => {
    const fetchBecarios = async () => {
      try {
        setLoading(true);
        const response = await get_becarios();
        
        if (response.data && Array.isArray(response.data)) {
        
          
          // Filtrar y validar coordenadas
          const validBecarios = response.data.filter(becario => {
            const lat = parseFloat(becario.latitud);
            const lng = parseFloat(becario.longitud);
            
            return !isNaN(lat) && !isNaN(lng) && 
                   lat >= -90 && lat <= 90 && 
                   lng >= -180 && lng <= 180;
          });
          
          console.log('Becarios válidos:', validBecarios);
          setBecarios(validBecarios);
          setFilteredBecarios(validBecarios);
          
          // Extraer opciones únicas para los selectores
          extractFilterOptions(validBecarios);
        } else {
          console.error("La respuesta de la API no tiene el formato esperado:", response);
          setError("Formato de datos incorrecto");
        }
      } catch (error) {
        console.error("Error al obtener los datos de los becarios:", error);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchBecarios();
  }, []);

  // Extraer opciones únicas para los filtros
  const extractFilterOptions = (becariosData) => {
    const estadosUnicos = [...new Set(becariosData.map(b => b.estado).filter(Boolean))].sort();
    setEstados(estadosUnicos);
    
    const municipiosUnicos = [...new Set(becariosData.map(b => b.municipio).filter(Boolean))].sort();
    setMunicipios(municipiosUnicos);
    
    const parroquiasUnicas = [...new Set(becariosData.map(b => b.parroquia).filter(Boolean))].sort();
    setParroquias(parroquiasUnicas);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // Aplicar filtros
    applyFilters(newFilters);
  };

  // Aplicar filtros a los becarios
  const applyFilters = (currentFilters) => {
    let filtered = becarios;

    if (currentFilters.estado) {
      filtered = filtered.filter(b => b.estado === currentFilters.estado);
    }

    if (currentFilters.municipio) {
      filtered = filtered.filter(b => b.municipio === currentFilters.municipio);
    }

    if (currentFilters.parroquia) {
      filtered = filtered.filter(b => b.parroquia === currentFilters.parroquia);
    }

    setFilteredBecarios(filtered);
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      estado: '',
      municipio: '',
      parroquia: ''
    });
    setFilteredBecarios(becarios);
  };

  // Función para renderizar los marcadores
  const renderMarkers = () => {
    if (filteredBecarios.length === 0) {
      return (
        <div className="no-results-message">
          No se encontraron becarios con los filtros aplicados
        </div>
      );
    }

    return filteredBecarios.map(becario => {
      const lat = parseFloat(becario.latitud);
      const lng = parseFloat(becario.longitud);
      
      return (
        <Marker
          key={`${becario.id}-${lat}-${lng}`}
          position={[lat, lng]}
        >
          <Popup>
            <div>
              <strong>{becario.nombre} {becario.apellido}</strong><br />
              C.I: {becario.cedula}<br />
              {becario.estado && `Estado: ${becario.estado}`}<br />
              {becario.municipio && `Municipio: ${becario.municipio}`}<br />
              {becario.parroquia && `Parroquia: ${becario.parroquia}`}<br />
              {becario.carrera && `Carrera: ${becario.carrera}`}<br />
              {becario.universidad && `Universidad: ${becario.universidad}`}
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  if (loading) {
    return (
      <div style={{ 
        height: 'calc(100vh - 120px)', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div>Cargando mapa...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: 'calc(100vh - 120px)', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <h2>Reporte de Becarios por Ubicación</h2>
      
      {/* Filtros */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'center'
      }}>
        <div>
          <label htmlFor="estado" style={{ marginRight: '10px' }}>Estado: </label>
          <select 
            id="estado"
            name="estado" 
            value={filters.estado} 
            onChange={handleFilterChange}
            style={{ padding: '5px', minWidth: '150px' }}
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="municipio" style={{ marginRight: '10px' }}>Municipio: </label>
          <select 
            id="municipio"
            name="municipio" 
            value={filters.municipio} 
            onChange={handleFilterChange}
            style={{ padding: '5px', minWidth: '150px' }}
          >
            <option value="">Todos los municipios</option>
            {municipios.map(municipio => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="parroquia" style={{ marginRight: '10px' }}>Parroquia: </label>
          <select 
            id="parroquia"
            name="parroquia" 
            value={filters.parroquia} 
            onChange={handleFilterChange}
            style={{ padding: '5px', minWidth: '150px' }}
          >
            <option value="">Todas las parroquias</option>
            {parroquias.map(parroquia => (
              <option key={parroquia} value={parroquia}>{parroquia}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={clearFilters}
          style={{ 
            padding: '5px 15px', 
            backgroundColor: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Limpiar Filtros
        </button>
      </div>
      
      <p>Total de becarios mostrados: {filteredBecarios.length} de {becarios.length}</p>
      
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: "80%", width: "100%" }}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        zoomControl={true}
        tap={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {renderMarkers()}
      </MapContainer>
    </div>
  );
};

export default Mapa;