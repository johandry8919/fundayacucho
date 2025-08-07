import React, { useState, useEffect } from 'react';


const SelectUniversidad = () => {
  const [universidades, setUniversidades] = useState([]);
  const [formData, setFormData] = useState({ universidad: '' });




  useEffect(() => {
    const loadUniversidades = async () => {
      try {
        const response = await fetch('src/components/uner.csv');
        const csvData = await response.text();
        
        // Procesar el CSV
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        const nomEstIndex = headers.indexOf('nomb_uni');
        
        if (nomEstIndex === -1) {
          console.error('La columna nomb_uni no existe en el CSV');
          return;
        }
        
        const uniqueUniversidades = [];
        const universidadesSet = new Set();
        
        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(',');
          if (currentLine.length > nomEstIndex) {
            const universidad = currentLine[nomEstIndex].trim();
            if (universidad && !universidadesSet.has(universidad)) {
              universidadesSet.add(universidad);
              uniqueUniversidades.push(universidad);
            }
          }
        }
        
        setUniversidades(uniqueUniversidades.sort());
      } catch (error) {
        console.error('Error al cargar las universidades:', error);
      }
    };

    loadUniversidades();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="col-md-6">
      <label htmlFor="formUniversidad" className="form-label">
        Universidad de Venezuela de donde se postuló
      </label>
      <select
        className="form-select"
        id="formUniversidad"
        name="universidad"
        value={formData.universidad}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione...</option>
        {universidades.map((universidad) => (
          <option key={universidad} value={universidad}>
            {universidad}
          </option>
        ))}
      </select>
      <div className="invalid-feedback">
        Por favor seleccione una universidad.
      </div>
    </div>
  );
};

export default SelectUniversidad;