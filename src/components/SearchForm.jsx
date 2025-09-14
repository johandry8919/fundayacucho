import { useState, useEffect, useMemo, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { estado, get_municipios, get_parroquias } from "../services/api";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';

// Fix for default marker icon issue with bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SCHOLARSHIP_TYPES = ["Nacional", "Internacional"];
const DEGREE_TYPES = ["Pre-grado", "Maestría", "Doctorado", "Postgrado"];

const DYNAMIC_LABELS = {
  internacional: "¿Indique el país de procedencia?",
  'venezolano exterior': "¿Indique el país donde cursó los estudios?",
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

function RegistrationForm() {
  const { user } = useAuth();

  const [universidades, setUniversidades] = useState([]);
  const [estados, setEstado] = useState([]);
  const [municipios, setMunicipio] = useState([]);
  const [parroquias, setParroquia] = useState([]);
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [mapCenter, setMapCenter] = useState([6.4238, -66.5897]); // Centro de Venezuela por defecto
  const [zoomLevel, setZoomLevel] = useState(5);
  const markerRef = useRef(null);

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setFormData(prev => ({
            ...prev,
            latitud: lat.toString(),
            longitud: lng.toString(),
          }));
          setMapCenter([lat, lng]);
        }
      },
    }),
    [],
  );

  const [formData, setFormData] = useState({
    nombre_completo: "",
    cedula: user.cedula,
    correo: user.email || "",
    telefono_celular: "",
    telefono_alternativo: "",
    fecha_nacimiento: "",
    estado: "",
    municipio: "",
    parroquia: "",
    tipo_beca: "",
    cod_estado: "",
    carrera_cursada: "",
    fecha_ingreso: "",
    fecha_egreso: "",
    titularidad: "",
    idiomas: "",
    ocupacion_actual: "",
    universidad: "",
    becario_tipo: "",
    descripcion_becario: "",
    codigoestado: "",
    codigomunicipio: "",
    codigoparroquia: "",
    latitud: "",
    longitud: "",
    latitud_pais: "",
    longitud_pais: "",
    direccion: "",
    codigoestado2: "",
    es_militar: "",
    trabajando: ''
  });

  let idEstadoFiltro = formData.codigoestado2;

  const SubmitEstado = async () => {
    try {
      let data = await estado();
      setEstado(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    SubmitEstado();
  }, []);

  useEffect(() => {
    const loadUniversidades = async () => {
      try {
        if (!idEstadoFiltro) return;

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

            if (
              idEstado === idEstadoFiltro.toString() &&
              nombreUniversidad &&
              !universidadesSet.has(nombreUniversidad)
            ) {
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
  }, [idEstadoFiltro]);

  useEffect(() => {
    const fetchAndProcessCountries = async () => {
      try {
        const response = await fetch("/paiseslatitudlongitud.csv");
        if (!response.ok) throw new Error("Error al cargar el archivo CSV");
        
        const csvData = await response.text();
        const countries = parseCountriesFromCSV(csvData);
        
        setPaises(countries.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      } catch (error) {
        console.error("Error al procesar países:", error);
      }
    };

    const parseCountriesFromCSV = (csvText) => {
      const lines = csvText.split("\n");
      if (lines.length < 2) return [];
      
      const headers = lines[0].split(",").map(header => header.trim());
      
      const nameIndex = headers.indexOf("nombre");
      const latIndex = headers.indexOf("latitud");
      const lngIndex = headers.indexOf("longitud");
      
      if (nameIndex === -1 || latIndex === -1 || lngIndex === -1) {
        console.error("Columnas requeridas no encontradas en el CSV");
        return [];
      }
      
      const uniqueCountries = new Map();
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(",").map(col => col.trim());
        
        if (columns.length > Math.max(nameIndex, latIndex, lngIndex)) {
          const nombre = columns[nameIndex];
          const latitud = parseFloat(columns[latIndex]);
          const longitud = parseFloat(columns[lngIndex]);
          
          if (nombre && !isNaN(latitud) && !isNaN(longitud)) {
            if (!uniqueCountries.has(nombre)) {
              uniqueCountries.set(nombre, {
                nombre,
                latitud,
                longitud
              });
            }
          }
        }
      }
      
      return Array.from(uniqueCountries.values());
    };

    fetchAndProcessCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      if (e.target.tagName === "SELECT") {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const lat = selectedOption.getAttribute("latitud");
        const lng = selectedOption.getAttribute("longitud");
        const lat_pais = selectedOption.getAttribute("latitud_pais");
        const lng_pais = selectedOption.getAttribute("longitud_pais");

        if (lat && lng) {
          newData.latitud = lat;
          newData.longitud = lng;
          setMapCenter([parseFloat(lat), parseFloat(lng)]);
          setZoomLevel(
            name === "codigoestado" ? 7 : name === "codigomunicipio" ? 10 : 12
          );
        }
        if (lat_pais && lng_pais) {
          newData.latitud_pais = lat_pais;
          newData.longitud_pais = lng_pais;
        }
      }

      if (name === "codigoestado") {
        get_municipio(value);
      }

      if (name === "codigomunicipio") {
        get_parroquia(value);
      }

      return newData;
    });
  };

  const get_municipio = async (codigomunicipio) => {
    try {
      setMunicipio(null);
      const data = await get_municipios(codigomunicipio);
      setMunicipio(data);
    } catch (err) {
      console.error("Error al obtener municipios:", err);
      setMunicipio(null);
    }
  };

  const get_parroquia = async (codigomunicipio) => {
    try {
      setParroquia(null);
      const data = await get_parroquias(codigomunicipio);
      setParroquia(data);
    } catch (err) {
      console.error("Error al obtener municipios:", err);
      setParroquia(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Aquí iría la lógica para enviar el formulario
    console.log("Datos del formulario:", formData);
    // Simular envío
    setTimeout(() => {
      setLoading(false);
      alert("Formulario enviado con éxito");
    }, 2000);
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
    <div className="registration-container">
      <div className="registration-header">
        <h1>Formulario de Registro de Becario</h1>
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
            <span className="step-label">Información Académica</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Información Adicional</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        {currentStep === 1 && (
          <div className="form-section active">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              DATOS PERSONALES
            </h3>
            
            <div className="form-grid">
              <div className="form-field">
                <label>Nombres y apellidos</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Cédula o Pasaporte</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person-vcard"></i>
                  </span>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Fecha de nacimiento</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>¿Es militar?</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <select
                    name="es_militar"
                    value={formData.es_militar}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>Correo electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Teléfono celular</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-phone"></i>
                  </span>
                  <input
                    type="tel"
                    name="telefono_celular"
                    value={formData.telefono_celular}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Estado</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <select
                    name="codigoestado"
                    value={formData.codigoestado}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {estados.data && estados.data.map((stad) => (
                      <option
                        key={stad.codigoestado}
                        value={stad.codigoestado}
                        latitud={stad.latitud}
                        longitud={stad.longitud}
                      >
                        {stad.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>Municipio</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <select
                    name="codigomunicipio"
                    value={formData.codigomunicipio}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {municipios && municipios.data && municipios.data.length > 0 ? (
                      municipios.data.map((muni) => (
                        <option
                          key={muni.codigomunicipio}
                          value={muni.codigomunicipio}
                          latitud={muni.latitud}
                          longitud={muni.longitud}
                        >
                          {muni.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {municipios === null ? "Cargando municipios..." : "Seleccione un estado primero"}
                      </option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>Parroquia</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <select
                    name="codigoparroquia"
                    value={formData.codigoparroquia}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {parroquias && parroquias.data && parroquias.data.length > 0 ? (
                      parroquias.data.map((parr) => (
                        <option
                          key={parr.codigoparroquia}
                          value={parr.codigoparroquia}
                          latitud={parr.latitud}
                          longitud={parr.longitud}
                        >
                          {parr.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {parroquias === null ? "Cargando parroquias..." : "Seleccione un municipio primero"}
                      </option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-field full-width">
                <label>Dirección en Venezuela</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt-fill"></i>
                  </span>
                  <textarea
                    value={formData.direccion}
                    onChange={handleChange}
                    rows="2"
                    name="direccion"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="form-field full-width">
                <label>Ubicación seleccionada</label>
                <div className="map-container">
                  <MapContainer
                    center={mapCenter}
                    zoom={zoomLevel}
                    style={{ height: "100%", width: "100%" }}
                    dragging={true}
                    touchZoom={true}
                    doubleClickZoom={true}
                    scrollWheelZoom={true}
                    zoomControl={true}
                    tap={true}
                  >
                    <ChangeView center={mapCenter} zoom={zoomLevel} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {formData.latitud && formData.longitud && (
                      <Marker
                        draggable={true}
                        eventHandlers={markerEventHandlers}
                        position={[
                          parseFloat(formData.latitud),
                          parseFloat(formData.longitud)
                        ]}
                        ref={markerRef}
                      >
                        <Popup>Puedes arrastrar el marcador para ajustar la ubicación</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
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
              INFORMACIÓN ACADÉMICA
            </h3>
            
            <div className="form-grid">
              <div className="form-field">
                <label>Tipo de beca</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-award"></i>
                  </span>
                  <select
                    name="tipo_beca"
                    value={formData.tipo_beca}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {SCHOLARSHIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-field full-width">
                <label>Tipo de becario</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="checkInternacional"
                      name="becario_tipo"
                      value="internacional"
                      checked={formData.becario_tipo === "internacional"}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="checkInternacional">
                      Becario Internacional en Venezuela
                    </label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="checkVenezolanoVzla"
                      name="becario_tipo"
                      value="venezolano en venezuela"
                      checked={formData.becario_tipo === "venezolano en venezuela"}
                      onChange={handleChange}
                    />
                    <label htmlFor="checkVenezolanoVzla">
                      Becario Venezolano en Venezuela
                    </label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="checkVenezolanoExt"
                      name="becario_tipo"
                      value="venezolano exterior"
                      checked={formData.becario_tipo === "venezolano exterior"}
                      onChange={handleChange}
                    />
                    <label htmlFor="checkVenezolanoExt">
                      Becario Venezolano en el Exterior
                    </label>
                  </div>
                </div>
              </div>
              
              {formData.becario_tipo && (
                <div className="form-field">
                  <label>{DYNAMIC_LABELS[formData.becario_tipo]}</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-globe"></i>
                    </span>
                    <select
                      name="descripcion_becario"
                      value={formData.descripcion_becario}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {paises.map((pais) => (
                        <option
                          key={pais.nombre}
                          value={pais.nombre}
                          latitud_pais={pais.latitud}
                          longitud_pais={pais.longitud}
                        >
                          {pais.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="form-field">
                <label>Carrera cursada</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-book"></i>
                  </span>
                  <input
                    type="text"
                    name="carrera_cursada"
                    value={formData.carrera_cursada}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Fecha de ingreso</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-calendar-check"></i>
                  </span>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Fecha de egreso</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-calendar-x"></i>
                  </span>
                  <input
                    type="date"
                    name="fecha_egreso"
                    value={formData.fecha_egreso}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Titularidad</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-patch-check"></i>
                  </span>
                  <select
                    name="titularidad"
                    value={formData.titularidad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {DEGREE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>Estado de la universidad</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <select
                    name="codigoestado2"
                    value={formData.codigoestado2}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {estados.data && estados.data.map((stad) => (
                      <option
                        key={stad.codigoestado}
                        value={stad.codigoestado}
                      >
                        {stad.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>Universidad</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-building"></i>
                  </span>
                  <select
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
                </div>
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
              <span className="section-icon">📋</span>
              INFORMACIÓN ADICIONAL
            </h3>
            
            <div className="form-grid">
              <div className="form-field">
                <label>Ocupación actual</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-briefcase"></i>
                  </span>
                  <input
                    type="text"
                    name="ocupacion_actual"
                    value={formData.ocupacion_actual}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>¿Está trabajando?</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-briefcase"></i>
                  </span>
                  <select
                    name="trabajando"
                    value={formData.trabajando}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="si">Si</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              
              <div className="form-field full-width">
                <label>Idiomas que domina</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-translate"></i>
                  </span>
                  <textarea
                    name="idiomas"
                    value={formData.idiomas}
                    onChange={handleChange}
                    rows="2"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="nav-button prev" onClick={prevStep}>
                <span className="icon">←</span> Anterior
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  "Guardar Formulario"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistrationForm;