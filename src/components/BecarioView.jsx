import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { estado, get_municipios, get_parroquias, saveBecario } from '../services/api';
import './../styles/BecarioView.css';

const BecarioView = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    id_usuario: user?.id || '',
    nombresApellidos: '',
    cedula: user?.cedula || '',
    fechaNacimiento: '',
    genero: '',
    nacionalidad: user.nacionalidad == 'V' ? 'Venezolano'  :   'Estrangero',
    correo: user?.email || '',
    telefonoPrincipal: '',
    telefonoAlternativo: '',
    comuna: '',
    direccion: '',
    institucion: '',
    programaEstudio: '',
    anioIngreso: '',
    semestreActual: '',
    turnoEstudio: '',
    modalidadEstudio: '',
    programaBeca: '',
    estadoBeca: '',
    tipoTarea: '',
    dependencia: '',
    anexoCedula: null,
    anexoConstancia: null,
    anexoResidencia: null,
    anexoFoto: null,
    codigoestado: "",
    codigomunicipio: "",
    codigoparroquia: "",
    latitud: "",
    longitud: "",
  });

  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await estado();
        setEstados(response);
      } catch (error) {
        console.error("Error fetching estados:", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    const loadUniversidades = async () => {
      if (!formData.codigoestado) return;
      try {
        const response = await fetch("/uner.csv");
        const csvData = await response.text();
        const lines = csvData.split("\n");
        const headers = lines[0].split(",");
        const nomEstIndex = headers.indexOf("nomb_uni");
        const idEstadoIndex = headers.indexOf("id\r");

        if (nomEstIndex === -1 || idEstadoIndex === -1) {
          console.error("Columnas requeridas no encontradas en el CSV");
          return;
        }

        const universidadesFiltradas = [];
        const universidadesSet = new Set();

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(",");
          if (currentLine.length > Math.max(nomEstIndex, idEstadoIndex)) {
            const idEstado = currentLine[idEstadoIndex].trim();
            const nombreUniversidad = currentLine[nomEstIndex].trim();
            if (idEstado === formData.codigoestado.toString() && nombreUniversidad && !universidadesSet.has(nombreUniversidad)) {
              universidadesSet.add(nombreUniversidad);
              universidadesFiltradas.push(nombreUniversidad);
            }
          }
        }
        setUniversidades(universidadesFiltradas.sort());
      } catch (error) {
        console.error("Error al cargar universidades:", error);
      }
    };

    loadUniversidades();
  }, [formData.codigoestado]);

  const handleEstadoChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const estadoId = e.target.value;
    const latitud = selectedOption.getAttribute('latitud');
    const longitud = selectedOption.getAttribute('longitud');
    
    setFormData({ 
      ...formData, 
      codigoestado: estadoId, 
      codigomunicipio: '', 
      codigoparroquia: '',
      latitud: latitud || "",
      longitud: longitud || ""
    });
    
    try {
      const response = await get_municipios(estadoId);
      setMunicipios(response);
      setParroquias([]);
    } catch (error) {
      console.error("Error fetching municipios:", error);
    }
  };

  const handleMunicipioChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const municipioId = e.target.value;
    const latitud = selectedOption.getAttribute('latitud');
    const longitud = selectedOption.getAttribute('longitud');
    
    setFormData({ 
      ...formData, 
      codigomunicipio: municipioId, 
      codigoparroquia: '',
      latitud: latitud || formData.latitud,
      longitud: longitud || formData.longitud
    });
    
    try {
      const response = await get_parroquias(municipioId);
      setParroquias(response);
    } catch (error) {
      console.error("Error fetching parroquias:", error);
    }
  };

  const handleParroquiaChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const parroquiaId = e.target.value;
    const latitud = selectedOption.getAttribute('latitud');
    const longitud = selectedOption.getAttribute('longitud');
    
    setFormData({ 
      ...formData, 
      codigoparroquia: parroquiaId,
      latitud: latitud || formData.latitud,
      longitud: longitud || formData.longitud
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const validDocumentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      
      if (name === 'anexoFoto' && !validImageTypes.includes(files[0].type)) {
        alert('Por favor, seleccione una imagen válida (JPEG, PNG)');
        return;
      }
      
      if (['anexoCedula', 'anexoConstancia', 'anexoResidencia'].includes(name) && 
          !validDocumentTypes.includes(files[0].type)) {
        alert('Por favor, seleccione un documento válido (PDF, JPEG, PNG)');
        return;
      }
      
      if (files[0].size > 5 * 1024 * 1024) {
        alert('El archivo no debe exceder los 5MB');
        return;
      }
      
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      
      data.append('fileDestination', 'imagenes');
      
      const response = await saveBecario(data);
      console.log('Formulario enviado con éxito:', response);
      
      alert('Datos registrados exitosamente');
      
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Error al enviar el formulario. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="becario-container">
      <div className="becario-header">
        <h1>Formulario de Registro de Nuevo Becario</h1>
        <p>Complete toda la información solicitada para su registro en el sistema</p>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Datos Personales</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Datos Académicos</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Datos de Beca</span>
          </div>
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Documentos</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="becario-form">
        {currentStep === 1 && (
          <div className="form-section active">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              DATOS PERSONALES
            </h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Nombres y Apellidos</label>
                <input type="text" name="nombresApellidos" value={formData.nombresApellidos} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Cédula de Identidad</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} required disabled />
              </div>
              <div className="form-field">
                <label>Fecha de Nacimiento</label>
                <input 
                type="date" 
                name="fechaNacimiento"
                 value={formData.fechaNacimiento} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Género</label>
                <select name="genero" value={formData.genero} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-field">
                <label>Nacionalidad</label>
                <input disabled type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Correo Electrónico Personal</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} required disabled />
              </div>
              <div className="form-field">
                <label>Número Telefónico Principal</label>
                <input type="tel" name="telefonoPrincipal" value={formData.telefonoPrincipal} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Número Telefónico Alternativo</label>
                <input type="tel" name="telefonoAlternativo" value={formData.telefonoAlternativo} onChange={handleChange} />
              </div>
              
              <div className="form-field">
                <label>Estado de Residencia</label>
                <select name="codigoestado" value={formData.codigoestado} onChange={handleEstadoChange} required>
                  <option value="">Seleccione...</option>
                  {estados.map(e => 
                    <option 
                      key={e.codigoestado}
                      value={e.codigoestado}
                      latitud={e.latitud}
                      longitud={e.longitud}
                    >
                      {e.nombre}
                    </option>
                  )}
                </select>
              </div>
              
              <div className="form-field">
                <label>Municipio de Residencia</label>
                <select name="codigomunicipio" value={formData.codigomunicipio} onChange={handleMunicipioChange} required>
                  <option value="">Seleccione...</option>
                  {municipios.map(m => 
                    <option
                      key={m.codigomunicipio} 
                      value={m.codigomunicipio}
                      latitud={m.latitud}
                      longitud={m.longitud}
                    >
                      {m.nombre}
                    </option>
                  )}
                </select>
              </div>
              
              <div className="form-field">
                <label>Parroquia de Residencia</label>
                <select name="codigoparroquia" value={formData.codigoparroquia} onChange={handleParroquiaChange} required>
                  <option value="">Seleccione...</option>
                  {parroquias.map(p =>
                    <option 
                      key={p.codigoparroquia} 
                      value={p.codigoparroquia}
                      latitud={p.latitud}
                      longitud={p.longitud}
                    >
                      {p.nombre}
                    </option>
                  )}
                </select>
              </div>
              
              <div className="form-field">
                <label>Territorio Comuna: Comuna, Consejo Comunal de su dirección</label>
                <input type="text" name="comuna" value={formData.comuna} onChange={handleChange} required />
              </div>
              <div className="form-field full-width">
                <label>Dirección Exacta de Habitación</label>
                <textarea name="direccion" value={formData.direccion} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-navigation">
              <button type="button" className="nav-button next" onClick={nextStep}>
                Siguiente <span className="icon">→</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section active">
            <h3 className="section-title">
              <span className="section-icon">🎓</span>
              DATOS ACADÉMICOS
            </h3>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>Institución de Educación Universitaria de adscripción</label>
                <select name="institucion" value={formData.institucion} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {universidades.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Programa de Estudio (Carrera)</label>
                <input type="text" name="programaEstudio" value={formData.programaEstudio} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Año de Ingreso a la Carrera</label>
                <input type="number" name="anioIngreso" value={formData.anioIngreso} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Semestre o Trimestre Actual que Cursa</label>
                <input type="text" name="semestreActual" value={formData.semestreActual} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Turno de Estudio</label>
                <select name="turnoEstudio" value={formData.turnoEstudio} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="diurno">Diurno</option>
                  <option value="nocturno">Nocturno</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>
              <div className="form-field">
                <label>Modalidad de Estudio</label>
                <select name="modalidadEstudio" value={formData.modalidadEstudio} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="presencial">Presencial</option>
                  <option value="a_distancia">A Distancia</option>
                </select>
              </div>
            </div>
            <div className="form-navigation">
              <button type="button" className="nav-button prev" onClick={prevStep}>
                <span className="icon">←</span> Anterior
              </button>
              <button type="button" className="nav-button next" onClick={nextStep}>
                Siguiente <span className="icon">→</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-section active">
            <h3 className="section-title">
              <span className="section-icon">🏅</span>
              DATOS DE LA BECA
            </h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Nombre del Programa de Becas</label>
                <select name="programaBeca" value={formData.programaBeca} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="auto_postulacion">Auto postulación</option>
                  <option value="circuitos_comunales">Circuitos Comunales</option>
                  <option value="instituciones_convenios">Instituciones y Convenios</option>
                  <option value="motores_productivos">Motores Productivos</option>
                  <option value="universidad">Universidad</option>
                </select>
              </div>
              <div className="form-field">
                <label>Estado Actual de la Beca</label>
                <select name="estadoBeca" value={formData.estadoBeca} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="nuevo_becario">Nuevo Becario</option>
                  <option value="actualizacion">Actualización</option>
                  <option value="culminada">Culminada</option>
                  <option value="retirada">Retirada</option>
                </select>
              </div>
              <div className="form-field full-width">
                <label>Tipo de Tarea/Contraprestación que realiza</label>
                <select name="tipoTarea" value={formData.tipoTarea} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="apoyo_academico">Apoyo Académico (Preparadores)</option>
                  <option value="apoyo_investigacion">Apoyo a la Investigación</option>
                  <option value="apoyo_administrativo">Apoyo Administrativo</option>
                  <option value="servicio_comunitario">Servicio Comunitario en Circuito Comunal</option>
                  <option value="proyecto_productivo">Proyecto Productivo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-field full-width">
                <label>Dependencia o Comunidad de Adscripción</label>
                <input type="text" name="dependencia" value={formData.dependencia} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-navigation">
              <button type="button" className="nav-button prev" onClick={prevStep}>
                <span className="icon">←</span> Anterior
              </button>
              <button type="button" className="nav-button next" onClick={nextStep}>
                Siguiente <span className="icon">→</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-section active">
            <h3 className="section-title">
              <span className="section-icon">📁</span>
              ANEXOS DIGITALES OBLIGATORIOS
            </h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Cédula de Identidad</label>
                <div className="file-upload-container">
                  <input type="file" id="anexoCedula" name="anexoCedula" onChange={handleFileChange} required className="file-input" accept=".pdf,.jpg,.jpeg,.png" />
                  <label htmlFor="anexoCedula" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoCedula && <span className="file-name">{formData.anexoCedula.name}</span>}
                </div>
              </div>
              <div className="form-field">
                <label>Constancia de Estudio/Inscripción</label>
                <div className="file-upload-container">
                  <input type="file" id="anexoConstancia" name="anexoConstancia" onChange={handleFileChange} required className="file-input" />
                  <label htmlFor="anexoConstancia" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoConstancia && <span className="file-name">{formData.anexoConstancia.name}</span>}
                </div>
              </div>
              <div className="form-field">
                <label>Constancia de Residencia</label>
                <div className="file-upload-container">
                  <input type="file" id="anexoResidencia" name="anexoResidencia" onChange={handleFileChange} required className="file-input" />
                  <label htmlFor="anexoResidencia" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoResidencia && <span className="file-name">{formData.anexoResidencia.name}</span>}
                </div>
              </div>
              <div className="form-field">
                <label>Fotografía del becario</label>
                <div className="file-upload-container">
                  <input type="file" id="anexoFoto" name="anexoFoto" onChange={handleFileChange} required className="file-input" />
                  <label htmlFor="anexoFoto" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoFoto && <span className="file-name">{formData.anexoFoto.name}</span>}
                </div>
              </div>
            </div>
            <div className="form-navigation">
              <button type="button" className="nav-button prev" onClick={prevStep}>
                <span className="icon">←</span> Anterior
              </button>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Registrar Datos'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BecarioView;