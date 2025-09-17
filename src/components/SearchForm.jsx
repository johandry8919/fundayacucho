import { useState, useEffect, useMemo, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  estado,
  get_municipios,
  get_parroquias,
  submitForm,
  get_egresado,
} from "../services/api";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../context/AuthContext";
import "../styles/SearchForm.css"; // Add this import for custom styles
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Fix for default marker icon issue with bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const SCHOLARSHIP_TYPES = ["Nacional", "Internacional"];
const DEGREE_TYPES = ["Pre-grado", "Maestría", "Doctorado", "Postgrado"];

const DYNAMIC_LABELS = {
  internacional: "¿Indique el país de procedencia?",
  "venezolano exterior": "¿Indique el país donde cursó los estudios?",
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [egresado, setEgresado] = useState();
  const navigate = useNavigate();

  console.log(egresado);

  const [mapCenter, setMapCenter] = useState([6.4238, -66.5897]); // Centro de Venezuela por defecto
  const [zoomLevel, setZoomLevel] = useState(5);
  const markerRef = useRef(null);

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setFormData((prev) => ({
            ...prev,
            latitud: lat.toString(),
            longitud: lng.toString(),
          }));
          setMapCenter([lat, lng]);
        }
      },
    }),
    []
  );

  const [formData, setFormData] = useState({
    id_usuario: user.id,
    nombre_completo: "",
    cedula: user.cedula,
    correo: user.email || "",
    telefono_celular: "",
    telefono_alternativo: "",
    fecha_nacimiento: "",
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
    trabajando: "",
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

  const get_Egresado = async () => {
    try {
      let data = await get_egresado(user.cedula);
      setEgresado(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    SubmitEstado();
    get_Egresado();
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

      const headers = lines[0].split(",").map((header) => header.trim());

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

        const columns = line.split(",").map((col) => col.trim());

        if (columns.length > Math.max(nameIndex, latIndex, lngIndex)) {
          const nombre = columns[nameIndex];
          const latitud = parseFloat(columns[latIndex]);
          const longitud = parseFloat(columns[lngIndex]);

          if (nombre && !isNaN(latitud) && !isNaN(longitud)) {
            if (!uniqueCountries.has(nombre)) {
              uniqueCountries.set(nombre, {
                nombre,
                latitud,
                longitud,
              });
            }
          }
        }
      }

      return Array.from(uniqueCountries.values());
    };

    fetchAndProcessCountries();
  }, []);

  // Validación de campos requeridos
  const validateField = (name, value) => {
    const requiredFields = {
      nombre_completo: "Nombre completo es requerido",
      cedula: "Cédula es requerida",
      correo: "Correo electrónico es requerido",
      telefono_celular: "Teléfono celular es requerido",
      fecha_nacimiento: "Fecha de nacimiento es requerida",
      codigoestado: "Estado es requerido",
      codigomunicipio: "Municipio es requerido",
      codigoparroquia: "Parroquia es requerida",
      direccion: "Dirección es requerida",
      tipo_beca: "Tipo de beca es requerido",
      carrera_cursada: "Carrera cursada es requerida",
      fecha_ingreso: "Fecha de ingreso es requerida",
      universidad: "Universidad es requerida",
    };

    if (requiredFields[name] && !value) {
      return requiredFields[name];
    }

    // Validación de correo electrónico
    if (name === "correo" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Ingrese un correo electrónico válido";
      }
    }

    // Validación de teléfono
    if (
      (name === "telefono_celular" || name === "telefono_alternativo") &&
      value
    ) {
      const phoneRegex = /^[0-9+\-\s()]*$/;
      if (!phoneRegex.test(value)) {
        return "Ingrese un número de teléfono válido";
      }
    }

    return "";
  };

  // Validar todos los campos del paso actual
  const validateStep = (step) => {
    const stepFields = {
      1: [
        "nombre_completo",
        "cedula",
        "correo",
        "telefono_celular",
        "fecha_nacimiento",
        "codigoestado",
        "codigomunicipio",
        "codigoparroquia",
        "direccion",
      ],
      2: ["tipo_beca", "carrera_cursada", "fecha_ingreso", "universidad"],
      3: ["es_militar", "trabajando"],
    };

    const newErrors = {};
    let isValid = true;

    stepFields[step]?.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Si es un campo de archivo, tomamos el primer archivo
    const fieldValue = type === "file" ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Handle map updates for location fields
    if (e.target.tagName === "SELECT") {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const lat = selectedOption.getAttribute("latitud");
      const lng = selectedOption.getAttribute("longitud");
      const lat_pais = selectedOption.getAttribute("latitud_pais");
      const lng_pais = selectedOption.getAttribute("longitud_pais");

      if (lat && lng) {
        setFormData((prev) => ({
          ...prev,
          latitud: lat,
          longitud: lng,
        }));
        setMapCenter([parseFloat(lat), parseFloat(lng)]);
        setZoomLevel(
          name === "codigoestado" ? 7 : name === "codigomunicipio" ? 10 : 12
        );
      }
      if (lat_pais && lng_pais) {
        setFormData((prev) => ({
          ...prev,
          latitud_pais: lat_pais,
          longitud_pais: lng_pais,
        }));
      }
    }

    // Load municipalities when state changes
    if (name === "codigoestado") {
      get_municipio(value);
    }

    // Load parishes when municipality changes
    if (name === "codigomunicipio") {
      get_parroquia(value);
    }

    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const get_municipio = async (codigoestado) => {
    try {
      const data = await get_municipios(codigoestado);
      setMunicipio(data);
      // Clear dependent fields when state changes
      setFormData((prev) => ({
        ...prev,
        codigomunicipio: "",
        codigoparroquia: "",
      }));
      setParroquia([]);
    } catch (err) {
      console.error("Error al obtener municipios:", err);
      setMunicipio([]);
    }
  };

  const get_parroquia = async (codigomunicipio) => {
    try {
      const data = await get_parroquias(codigomunicipio);
      setParroquia(data);
      // Clear parish field when municipality changes
      setFormData((prev) => ({
        ...prev,
        codigoparroquia: "",
      }));
    } catch (err) {
      console.error("Error al obtener parroquias:", err);
      setParroquia([]);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Marcar todos los campos del paso actual como tocados para mostrar errores
      const stepFields = {
        1: [
          "nombre_completo",
          "cedula",
          "correo",
          "telefono_celular",
          "fecha_nacimiento",
          "codigoestado",
          "codigomunicipio",
          "codigoparroquia",
          "direccion",
        ],
        2: ["tipo_beca", "carrera_cursada", "fecha_ingreso", "universidad"],
        3: ["es_militar", "trabajando"],
      };

      const newTouched = {};
      stepFields[currentStep]?.forEach((field) => {
        newTouched[field] = true;
      });
      setTouched((prev) => ({ ...prev, ...newTouched }));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Filtrar y agregar datos al FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      // Enviar formulario
      const response = await submitForm(data);
      console.log("Formulario enviado con éxito:", response);

      // Mostrar alerta de éxito
      await Swal.fire({
        title: "¡Formulario enviado con éxito!",
        text: "Serás redirigido al home para iniciar sesión",
        icon: "success",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Redirigir después del éxito
      navigate("/home");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);

      // Mostrar alerta de error más específica
      await Swal.fire({
        title: "Error al enviar el formulario",
        text: error.message || "Por favor, intenta nuevamente",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Formulario de Registro de Egresado Fundayacucho</h1>
        <p>
          Complete toda la información solicitada para su registro en el sistema
        </p>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Datos Personales</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Información Académica</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
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
                <label
                  htmlFor="nombre_completo"
                  className={errors.nombre_completo ? "error" : ""}
                >
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.nombre_completo ? "error" : ""}
                  required
                />
                {errors.nombre_completo && touched.nombre_completo && (
                  <span className="error-message">
                    {errors.nombre_completo}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="cedula"
                  className={errors.cedula ? "error" : ""}
                >
                  Cédula o Pasaporte <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.cedula ? "error" : ""}
                  required
                  disabled
                />
                {errors.cedula && touched.cedula && (
                  <span className="error-message">{errors.cedula}</span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="fecha_nacimiento"
                  className={errors.fecha_nacimiento ? "error" : ""}
                >
                  Fecha de nacimiento <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.fecha_nacimiento ? "error" : ""}
                  required
                />
                {errors.fecha_nacimiento && touched.fecha_nacimiento && (
                  <span className="error-message">
                    {errors.fecha_nacimiento}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="es_militar"
                  className={errors.es_militar ? "error" : ""}
                >
                  ¿Es militar? <span className="required">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <select
                    id="es_militar"
                    name="es_militar"
                    value={formData.es_militar}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.es_militar ? "error" : ""}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {errors.es_militar && touched.es_militar && (
                  <span className="error-message">{errors.es_militar}</span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="correo"
                  className={errors.correo ? "error" : ""}
                >
                  Correo electrónico <span className="required">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.correo ? "error" : ""}
                    required
                  />
                </div>
                {errors.correo && touched.correo && (
                  <span className="error-message">{errors.correo}</span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="telefono_celular"
                  className={errors.telefono_celular ? "error" : ""}
                >
                  Teléfono celular <span className="required">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-phone"></i>
                  </span>
                  <input
                    type="tel"
                    id="telefono_celular"
                    name="telefono_celular"
                    value={formData.telefono_celular}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.telefono_celular ? "error" : ""}
                    required
                  />
                </div>
                {errors.telefono_celular && touched.telefono_celular && (
                  <span className="error-message">
                    {errors.telefono_celular}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="codigoestado"
                  className={errors.codigoestado ? "error" : ""}
                >
                  Estado <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="codigoestado"
                    name="codigoestado"
                    value={formData.codigoestado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.codigoestado ? "error" : ""}
                    required
                  >
                    <option value="">Seleccione...</option>

                    
                    {estados &&
                      estados.map((stad) => (
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
                {errors.codigoestado && touched.codigoestado && (
                  <span className="error-message">{errors.codigoestado}</span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="codigomunicipio"
                  className={errors.codigomunicipio ? "error" : ""}
                >
                  Municipio <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="codigomunicipio"
                    name="codigomunicipio"
                    value={formData.codigomunicipio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.codigomunicipio ? "error" : ""}
                    disabled={!formData.codigoestado}
                    required
                  >
                    <option value="">
                      {formData.codigoestado
                        ? "Seleccione un municipio..."
                        : "Seleccione un estado primero"}
                    </option>
                    {municipios && municipios && municipios.length > 0 ? (
                      municipios.map((muni) => (
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
                        {municipios === null
                          ? "Cargando municipios..."
                          : "Seleccione un estado primero"}
                      </option>
                    )}
                  </select>
                </div>
                {errors.codigomunicipio && touched.codigomunicipio && (
                  <span className="error-message">
                    {errors.codigomunicipio}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label
                  htmlFor="codigoparroquia"
                  className={errors.codigoparroquia ? "error" : ""}
                >
                  Parroquia <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="codigoparroquia"
                    name="codigoparroquia"
                    value={formData.codigoparroquia}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.codigoparroquia ? "error" : ""}
                    disabled={!formData.codigomunicipio}
                    required
                  >
                    <option value="">
                      {formData.codigomunicipio
                        ? "Seleccione una parroquia..."
                        : "Seleccione un municipio primero"}
                    </option>
                    {parroquias && parroquias && parroquias.length > 0 ? (
                      parroquias.map((parr) => (
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
                        {parroquias === null
                          ? "Cargando parroquias..."
                          : "Seleccione un municipio primero"}
                      </option>
                    )}
                  </select>
                </div>
                {errors.codigoparroquia && touched.codigoparroquia && (
                  <span className="error-message">
                    {errors.codigoparroquia}
                  </span>
                )}
              </div>

              <div className="form-field full-width">
                <label
                  htmlFor="direccion"
                  className={errors.direccion ? "error" : ""}
                >
                  Dirección en Venezuela <span className="required">*</span>
                </label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.direccion ? "error" : ""}
                  rows="3"
                  required
                />
                {errors.direccion && touched.direccion && (
                  <span className="error-message">{errors.direccion}</span>
                )}
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
                          parseFloat(formData.longitud),
                        ]}
                        ref={markerRef}
                      >
                        <Popup>
                          Puedes arrastrar el marcador para ajustar la ubicación
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                disabled={loading}
              >
                Siguiente <i className="bi bi-arrow-right"></i>
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
                    onBlur={handleBlur}
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
                      onBlur={handleBlur}
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
                      checked={
                        formData.becario_tipo === "venezolano en venezuela"
                      }
                      onChange={handleChange}
                      onBlur={handleBlur}
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
                      onBlur={handleBlur}
                    />
                    <label htmlFor="checkVenezolanoExt">
                      Becario Venezolano en el Exterior
                    </label>
                  </div>
                </div>
              </div>

              {formData.becario_tipo === "internacional" ||
              formData.becario_tipo === "venezolano exterior" ? (
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
                      onBlur={handleBlur}
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
              ) : null}

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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {estados &&
                      estados.map((stad) => (
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
                    onBlur={handleBlur}
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

            <div className="form-actions">
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-outline"
                disabled={loading}
              >
                <i className="bi bi-arrow-left"></i> Anterior
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                disabled={loading}
              >
                Siguiente <i className="bi bi-arrow-right"></i>
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
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
                    onBlur={handleBlur}
                    rows="2"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-outline"
                disabled={loading}
              >
                <i className="bi bi-arrow-left"></i> Anterior
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitud"
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
