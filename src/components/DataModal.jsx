import { useState, useEffect } from 'react';

const SCHOLARSHIP_TYPES = ['Nacional', 'Internacional'];
const DEGREE_TYPES = ['Pre-grado', 'Maestría', 'Doctorado', 'Postgrado'];

function DataModal({ show, onHide, initialData, onSubmit, loading ,idEstadoFiltro= 21}) {
    const [universidades, setUniversidades] = useState([]);

  const [formData, setFormData] = useState({
    nombre_completo: '',
    cedula: '',
    correo: '',
    telefono_celular: '',
    telefono_alternativo: '',
    fecha_nacimiento: '',
    estado: '',
    municipio: '',
    parroquia: '',
    tipo_beca: '',
    cod_estado:'',
    carrera_cursada: '',
    fecha_ingreso: '',
    fecha_egreso: '',
    titularidad: '',
    idiomas: '',
    ocupacion_actual: '',
    universidad: '',
    becario_internacional_venezuela: false,
    becario_venezolano_venezuela: false,
    becario_venezolano_exterior: false
  });


   useEffect(() => {
    const loadUniversidades = async () => {
      try {
        if (!idEstadoFiltro) return; // No cargar si no hay filtro
        
        const response = await fetch('/uner.csv');
        const csvData = await response.text();
        
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const nomEstIndex = headers.indexOf('nomb_uni');
        const idEstadoIndex = headers.indexOf('id_est');
        
        if (nomEstIndex === -1 || idEstadoIndex === -1) {
          console.error('Columnas requeridas no encontradas en el CSV');
          return;
        }
        
        const universidadesFiltradas = [];
        const universidadesSet = new Set();
        
        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(',');
          
          if (currentLine.length > Math.max(nomEstIndex, idEstadoIndex)) {
            const idEstado = currentLine[idEstadoIndex].trim();
            const nombreUniversidad = currentLine[nomEstIndex].trim();
            
            if (idEstado === idEstadoFiltro.toString() && 
                nombreUniversidad && 
                !universidadesSet.has(nombreUniversidad)) {
              universidadesSet.add(nombreUniversidad);
              universidadesFiltradas.push(nombreUniversidad);
            }
          }
        }
        
        setUniversidades(universidadesFiltradas.sort());
      } catch (error) {
        console.error('Error al cargar universidades:', error);
      }
    };

    loadUniversidades();
  }, [idEstadoFiltro]);


  useEffect(() => {
    if (initialData) {
      const {
        name,
        lastname,
        cedula,
        birthDate,
        name_estado,
        name_municipio,
        name_parroquia,
        cod_estado
      } = initialData;

      const cleanLocationName = (name) => {
        return name ? name.replace(/\s+/g, ' ').trim() : '';
      };

      setFormData({
        ...formData,
        nombre_completo: `${name || ''} ${lastname || ''}`.trim(),
        cedula: cedula || '',
        fecha_nacimiento: birthDate || '',
        estado: cleanLocationName(name_estado),
        municipio: cleanLocationName(name_municipio),
        parroquia: cleanLocationName(name_parroquia),
        cod_estado: cod_estado || '',
      });
    } else {
      setFormData({
        nombre_completo: '',
        cedula: '',
        correo: '',
        telefono_celular: '',
        telefono_alternativo: '',
        fecha_nacimiento: '',
        estado: '',
        municipio: '',
        parroquia: '',
        tipo_beca: '',
        carrera_cursada: '',
        fecha_ingreso: '',
        fecha_egreso: '',
        titularidad: '',
        idiomas: '',
        cod_estado:'',
        ocupacion_actual: '',
        becario_internacional_venezuela: false,
        becario_venezolano_venezuela: false,
        becario_venezolano_exterior: false
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Clase condicional para mostrar el modal
  const modalClass = show ? 'modal fade show d-block' : 'modal fade';
  const backdropClass = show ? 'modal-backdrop fade show' : '';

  return (
    <>
      {/* Modal */}
      {show && (
        <div className={modalClass} style={{ display: 'block' }} tabIndex="-1" aria-labelledby="modalTitle" aria-hidden={!show}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title" id="modalTitle">Formulario de Registro</h5>
                <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* Nombres y cédula */}
                  <div className="col-md-6">
                    <label htmlFor="formFullName" className="form-label">Nombres y apellidos</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formFullName"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Por favor ingrese nombres y apellidos.</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formIdNumber" className="form-label">Cédula/Pasaporte</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formIdNumber"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Por favor ingrese la cédula o pasaporte.</div>
                  </div>

                  {/* Correo y teléfono */}
                  <div className="col-md-6">
                    <label htmlFor="formEmail" className="form-label">Correo electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      id="formEmail"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Por favor ingrese un correo válido.</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formPhone" className="form-label">Teléfono celular</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="formPhone"
                      name="telefono_celular"
                      value={formData.telefono_celular}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Por favor ingrese un número de contacto.</div>
                  </div>

                  {/* Información Personal */}
                  <h5 className="mt-4 mb-3">Información Personal</h5>

                  <div className="col-md-4">
                    <label htmlFor="formBirthDate" className="form-label">Fecha de nacimiento</label>
                    <input
                      type="date"
                      className="form-control"
                      id="formBirthDate"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Por favor seleccione una fecha.</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="formState" className="form-label">Estado de nacimiento</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formState"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      readOnly
                      required
                    />
                    <div className="invalid-feedback">El estado es obligatorio.</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="formMunicipality" className="form-label">Municipio</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formMunicipality"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleChange}
                      readOnly
                      required
                    />
                    <div className="invalid-feedback">El municipio es obligatorio.</div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="formParish" className="form-label">Parroquia</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formParish"
                      name="parroquia"
                      value={formData.parroquia}
                      onChange={handleChange}
                      readOnly
                      required
                    />
                    <div className="invalid-feedback">La parroquia es obligatoria.</div>
                  </div>

                  {/* Información Académica */}
                  <h5 className="mt-4 mb-3">Información Académica</h5>

    
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
                                

                  <div className="col-md-6">
                    <label htmlFor="formDegree" className="form-label">Tipo de beca</label>
                    <select
                      className="form-select"
                      id="formDegree"
                      name="tipo_beca"
                      value={formData.tipo_beca}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {SCHOLARSHIP_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="invalid-feedback">Seleccione un tipo de beca.</div>
                  </div>


                  <div className="col-6 ">
                    <label className="form-label">Tipo de becario</label>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkInternacional"
                          name="becario_internacional_venezuela"
                          checked={formData.becario_internacional_venezuela}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="checkInternacional">
                          Becario Internacional en Venezuela
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkVenezolanoVzla"
                          name="becario_venezolano_venezuela"
                          checked={formData.becario_venezolano_venezuela}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="checkVenezolanoVzla">
                          Becario Venezolano en Venezuela
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="checkVenezolanoExt"
                          name="becario_venezolano_exterior"
                          checked={formData.becario_venezolano_exterior}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="checkVenezolanoExt">
                          Becario Venezolano en Exterior
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formCareer" className="form-label">Carrera cursada</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formCareer"
                      name="carrera_cursada"
                      value={formData.carrera_cursada}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Por favor ingrese la carrera.</div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="formStartDate" className="form-label">Fecha de ingreso</label>
                    <input
                      type="date"
                      className="form-control"
                      id="formStartDate"
                      name="fecha_ingreso"
                      value={formData.fecha_ingreso}
                      onChange={handleChange}
                      required
                    />
                    <div className="invalid-feedback">Seleccione una fecha de ingreso.</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="formEndDate" className="form-label">Fecha de egreso</label>
                    <input
                      type="date"
                      className="form-control"
                      id="formEndDate"
                      name="fecha_egreso"
                      value={formData.fecha_egreso}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="formDegreeType" className="form-label">Titularidad</label>
                    <select
                      className="form-select"
                      id="formDegreeType"
                      name="titularidad"
                      value={formData.titularidad}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {DEGREE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="invalid-feedback">Seleccione la titularidad.</div>
                  </div>

                  {/* Información Adicional */}
                  <h5 className="mt-4 mb-3">Información Adicional</h5>

                  <div className="col-12">
                    <label htmlFor="formLanguages" className="form-label">Idiomas que domina</label>
                    <textarea
                      className="form-control"
                      id="formLanguages"
                      name="idiomas"
                      rows="2"
                      value={formData.idiomas}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <label htmlFor="formOccupation" className="form-label">Ocupación actual</label>
                    <input
                      type="text"
                      className="form-control"
                      id="formOccupation"
                      name="ocupacion_actual"
                      value={formData.ocupacion_actual}
                      onChange={handleChange}
                    />
                  </div>

                  

                  {/* Botones */}
                  <div className="col-12 text-end mt-4">
                    <button type="button" className="btn btn-secondary me-2" onClick={onHide}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span className="ms-2">Enviando...</span>
                        </>
                      ) : (
                        'Enviar Formulario'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop del modal */}
      {show && <div className={backdropClass} style={{ zIndex: 1040 }}></div>}
    </>
  );
}

export default DataModal;