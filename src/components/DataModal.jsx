import { useState, useEffect, useMemo, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../src/styles/modal.css";
import { estado, get_municipios, get_parroquias } from "../services/api";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';

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
  venezolano_exterior: "¿Indique el país donde cursó los estudios?",
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

function DataModal({ show, onHide, initialData, onSubmit, loading  ,cedulax, nacio}) {
  const [universidades, setUniversidades] = useState([]);
  const [estados, setEstado] = useState([]);
  const [municipios, setMunicipio] = useState([]);
  const [parroquias, setParroquia] = useState([]);

  const [mapCenter, setMapCenter] = useState([6.4238, -66.5897]); // Centro de Venezuela por defecto
  const [zoomLevel, setZoomLevel] = useState(5);
    const [paises,  setPaises] = useState(5);


  console.log(cedulax)
 

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
    cedula: cedulax,
    correo: "",
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
    } finally {
      console.log("asasd");
    }
  };

  useEffect(() => {
    SubmitEstado();
    const loadUniversidades = async () => {
      try {
        if (!idEstadoFiltro) return; // No cargar si no hay filtro

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
      const response = await fetch("/paises.csv");
      if (!response.ok) throw new Error("Error al cargar el archivo CSV");
      
      const csvData = await response.text();
      const countries = parseCountriesFromCSV(csvData);
      
      setPaises(countries.sort());
    } catch (error) {
      console.error("Error al procesar países:", error);
      // Opcional: manejar el error en el estado (setErrorState)
    }
  };

  const parseCountriesFromCSV = (csvText) => {
    const lines = csvText.split("\n");
    if (lines.length < 2) return []; // CSV vacío o solo headers
    
    const headers = lines[0].split(",");
    const countryNameIndex = headers.indexOf("nombre");
    if (countryNameIndex === -1) return []; // Columna 'nombre' no encontrada
    
    const uniqueCountries = new Set();
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(",");
      if (columns.length > countryNameIndex) {
        const countryName = columns[countryNameIndex].trim();
        if (countryName) uniqueCountries.add(countryName);
      }
    }
    
    return Array.from(uniqueCountries);
  };

  fetchAndProcessCountries();
}, []);

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
        cod_estado,
      } = initialData;

      const cleanLocationName = (name) => {
        return name ? name.replace(/\s+/g, " ").trim() : "";
      };

      setFormData({
        ...formData,
        nombre_completo: `${name || ""} ${lastname || ""}`.trim(),
        cedula: cedula || "",
        fecha_nacimiento: birthDate || "",
        estado: cleanLocationName(name_estado),
        municipio: cleanLocationName(name_municipio),
        parroquia: cleanLocationName(name_parroquia),
        cod_estado: cod_estado || "",
      });
    } else {
      setFormData({
        nombre_completo: "",
        cedula: "",
        correo: "",
        telefono_celular: "",
        telefono_alternativo: "",
        fecha_nacimiento: "",
        estado: "",
        municipio: "",
        parroquia: "",
        tipo_beca: "",
        carrera_cursada: "",
        fecha_ingreso: "",
        fecha_egreso: "",
        titularidad: "",
        idiomas: "",
        cod_estado: "",
        ocupacion_actual: "",
        becario_tipo: "",
        descripcion_becario: "",
        codigoestado: "",
        codigomunicipio: "",
        codigoparroquia: "",
        latitud: "",
        longitud: "",
        direccion: "",
        codigoestado2: "",
         es_militar: ''
      });
    }
  }, [initialData]);


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

        if (lat && lng) {
          newData.latitud = lat;
          newData.longitud = lng;

          setMapCenter([parseFloat(lat), parseFloat(lng)]);
          setZoomLevel(
            name === "codigoestado" ? 7 : name === "codigomunicipio" ? 10 : 12
          );
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
    onSubmit(formData);
  };

  // Clase condicional para mostrar el modal
  const modalClass = show ? "modal fade show d-block fondo" : "modal fade";
  const backdropClass = show ? "modal-backdrop fade show fondo" : "";

  return (
    <>
      {/* Modal */}
      {show && (
        <div
          className={modalClass}
          style={{ display: "block" }}
          tabIndex="-1"
          aria-labelledby="modalTitle"
          aria-hidden={!show}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
               
                <button
                  type="button"
                  className="btn-close"
                  onClick={onHide}
                  aria-label="Close"
                ></button>
              </div>
             

              {/* Body */}
              <div className="modal-body">
                <h5 className="mt-4 mb-3">Datos Personales</h5>
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* Nombres y cédula */}
                  <div className="col-md-6">
                    <label htmlFor="formFullName" className="form-label">
                      Nombres y apellidos
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="formFullName"
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="invalid-feedback">
                      Por favor ingrese nombres y apellidos.
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formIdNumber" className="form-label">
                      Cédula o Pasaporte
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-vcard"></i>
                      </span>
                      <input
                      type="text"
                      className="form-control"
                      id="formIdNumber"
                      name="cedula"
                      value={formData.cedula ? formData.cedula : formData.cedula = nacio+'-'+cedulax}
                      onChange={handleChange}
                      required
                      style={{ 
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
                        margin: 0
                      }}
                    />
                    </div>
                    <div className="invalid-feedback">
                      Por favor ingrese la cédula o pasaporte.
                    </div>
                  </div>

                   

                  <div className="col-md-6">
                    <label htmlFor="formBirthDate" className="form-label">
                      Fecha de nacimiento
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-calendar-event"></i>
                      </span>
                      <input
                        type="date"
                        className="form-control"
                        id="formBirthDate"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="invalid-feedback">
                      Por favor seleccione una fecha.
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="formIdNumber" className="form-label">
                     ¿Es militar?
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-shield-check"></i>
                      </span>
                      <select
                        className="form-select"
                        id="es_militar"
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

                  {/* Correo y teléfono */}
                  <div className="col-md-6">
                    <label htmlFor="formEmail" className="form-label">
                      Correo electrónico
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="formEmail"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="invalid-feedback">
                      Por favor ingrese un correo válido.
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formPhone" className="form-label">
                      Teléfono celular
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-phone"></i>
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        id="formPhone"
                        name="telefono_celular"
                        value={formData.telefono_celular}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="invalid-feedback">
                      Por favor ingrese un número de contacto.
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="codigoestado" className="form-label">
                      Estado
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt"></i>
                      </span>
                      <select
                        className="form-select"
                        id="codigoestado"
                        name="codigoestado"
                        value={formData.codigoestado}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {estados.data.map((stad) => (
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
                    <div className="invalid-feedback">
                      Por favor seleccione una universidad.
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="municipio" className="form-label">
                      Municipio
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt"></i>
                      </span>
                      <select
                        className="form-select"
                        id="municipio"
                        name="codigomunicipio"
                        value={formData.codigomunicipio}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {!municipios ? (
                          <option value="" disabled>
                            Cargando municipios...
                          </option>
                        ) : municipios.data?.length > 0 ? (
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
                            No hay municipios disponibles
                          </option>
                        )}
                      </select>
                    </div>
                    <div className="invalid-feedback">
                      Por favor seleccione una universidad.
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="municipio" className="form-label">
                      Parroquia
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt"></i>
                      </span>
                      <select
                        className="form-select"
                        id="codigoparroquia"
                        name="codigoparroquia"
                        value={formData.codigoparroquia}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {!parroquias ? (
                          <option value="" disabled>
                            Cargando municipios...
                          </option>
                        ) : parroquias.data?.length > 0 ? (
                          parroquias.data.map((muni) => (
                            <option
                              key={muni.codigoparroquia}
                              value={muni.codigoparroquia}
                              latitud={muni.latitud}
                              longitud={muni.longitud}
                            >
                              {muni.nombre}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No hay parroquias disponibles
                          </option>
                        )}
                      </select>
                    </div>
                    <div className="invalid-feedback">
                      Por favor seleccione una universidad.
                    </div>
                  </div>

                  <h5>Dirección en Venezuela</h5>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-geo-alt-fill"></i>
                    </span>
                    <textarea
                      className="form-control"
                      value={formData.direccion}
                      onChange={handleChange}
                      rows="2"
                      cols="80"
                      name="direccion"
                      id="direccion"
                    required></textarea>
                  </div>

                  <div className="col-12 mt-4">
                    <h5 className="mb-3">Ubicación seleccionada</h5>
                    <div
                      style={{
                        height: "300px",
                        width: "100%",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
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

                  <h5 className="mt-4 mb-3">Información Académica</h5>

                  {/* Información Académica */}

                  <div className="col-md-6">
                    <label htmlFor="formDegree" className="form-label">
                      Tipo de beca
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-award"></i>
                      </span>
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
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="invalid-feedback">
                      Seleccione un tipo de beca.
                    </div>
                  </div>

                  <div className="col-6 ">
                    <label className="form-label">Tipo de becario</label>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="checkInternacional"
                          name="becario_tipo" // Mismo nombre para todos los radios
                          value="internacional"
                          checked={formData.becario_tipo === "internacional"}
                          onChange={handleChange}
                          required
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkInternacional"
                        >
                          Becario Internacional en Venezuela
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="checkVenezolanoVzla"
                          name="becario_tipo" // Mismo nombre para todos los radios
                          value="venezolano_venezuela"
                          checked={
                            formData.becario_tipo === "venezolano_venezuela"
                          }
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkVenezolanoVzla"
                        >
                          Becario Venezolano en Venezuela
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="checkVenezolanoExt"
                          name="becario_tipo" // Mismo nombre para todos los radios
                          value="venezolano_exterior"
                          checked={
                            formData.becario_tipo === "venezolano_exterior"
                          }
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="checkVenezolanoExt"
                        >
                          Becario Venezolano en el Exterior
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.becario_tipo && (
                    <div className="col-12 mt-3">
                      <label
                        htmlFor="descripcion_becario"
                        className="form-label"
                      >
                        {DYNAMIC_LABELS[formData.becario_tipo]}
                      </label>

                      {DYNAMIC_LABELS[formData.becario_tipo]  && 
                      <select
                        className="form-select"
                        id="descripcion_becario"
                        name="descripcion_becario"
                        value={formData.descripcion_becario}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione... </option>
                        {paises.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      
                      }
                       
                    </div>
                  )}

                 

                  <div className="col-md-6">
                    <label htmlFor="formCareer" className="form-label">
                      Carrera cursada
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-book"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="formCareer"
                        name="carrera_cursada"
                        value={formData.carrera_cursada}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="invalid-feedback">
                      Por favor ingrese la carrera.
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="formStartDate" className="form-label">
                      Fecha de ingreso
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-calendar-check"></i>
                      </span>
                      <input
                        type="date"
                        className="form-control"
                        id="formStartDate"
                        name="fecha_ingreso"
                        value={formData.fecha_ingreso}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="invalid-feedback">
                      Seleccione una fecha de ingreso.
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formEndDate" className="form-label">
                      Fecha de egreso
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-calendar-x"></i>
                      </span>
                      <input
                        type="date"
                        className="form-control"
                        id="formEndDate"
                        name="fecha_egreso"
                        value={formData.fecha_egreso}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="formDegreeType" className="form-label">
                      Titularidad
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-patch-check"></i>
                      </span>
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
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="invalid-feedback">
                      Seleccione la titularidad.
                    </div>
                  </div>


                   <h5>Universidad de Venezuela donde se postuló</h5>

                  <div className="col-md-6">
                    <label htmlFor="codigoestado2" className="form-label">
                      Estado
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt"></i>
                      </span>
                      <select
                        className="form-select"
                        id="codigoestado2"
                        name="codigoestado2"
                        value={formData.codigoestado2}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {estados.data.map((stad) => (
                          <option
                            key={stad.codigoestado}
                            value={stad.codigoestado}
                          >
                            {stad.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="invalid-feedback">
                      Por favor seleccione una universidad.
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="formUniversidad" className="form-label">
                      Universidad 
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-building-fill"></i>
                      </span>
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
                    </div>
                    <div className="invalid-feedback">
                      Por favor seleccione una universidad.
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <h5 className="mt-4 mb-3">Información Adicional</h5>

              

                  <div className="col-6">
                    <label htmlFor="formOccupation" className="form-label">
                      Ocupación actual
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-briefcase"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="formOccupation"
                        name="ocupacion_actual"
                        value={formData.ocupacion_actual}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>


                    <div className="col-md-6">
                    <label htmlFor="trabajando" className="form-label">
                        ¿Está trabajando?
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-briefcase"></i>
                      </span>
                      <select
                        className="form-select"
                        id="trabajando"
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
                    <div className="invalid-feedback">
                      Por favor seleccione una universidad.
                    </div>
                  </div>

                      <div className="col-12">
                    <label htmlFor="formLanguages" className="form-label">
                      Idiomas que domina
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-translate"></i>
                      </span>
                      <textarea
                        className="form-control"
                        id="formLanguages"
                        name="idiomas"
                        rows="1"
                        value={formData.idiomas}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Mapa interactivo */}

                  {/* Botones */}
                  <div className="col-12 text-end mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={onHide}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span className="ms-2">Enviando...</span>
                        </>
                      ) : (
                        "Guarda Formulario"
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
