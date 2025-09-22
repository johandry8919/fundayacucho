import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { estado, get_municipios, get_parroquias, saveBecario, get_becario } from '../services/api';
import './../styles/BecarioView.css';
import { MapContainer, TileLayer, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import BecarioMarker from './BecarioMarker';

// Fix for default marker icon issue with bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Initialize the default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const BecarioView = () => {
  const { user } = useAuth();
   const [dataBecario, setBecario] = useState([]);
  const [formData, setFormData] = useState({
   id_usuario: user?.id || '',
    nombresApellidos: '',
    cedula: user?.cedula || '',
    fechaNacimiento: '',
    genero: '',
    nacionalidad: user?.nacionalidad === 'V' ? 'Venezolano' : 'Extranjero',
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
    codigoestado: '',
    codigomunicipio: '',
    codigoparroquia: '',
    latitud: '',
    longitud: '',
  });

  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
    const navigate = useNavigate();



  // Map state
  const [mapCenter, setMapCenter] = useState([6.4238, -66.5897]); // Default center of Venezuela
  const [zoomLevel, setZoomLevel] = useState(6);
  const markerRef = useRef(null);
  const mapRef = useRef(null);

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          setFormData(prev => ({
            ...prev,
            latitud: lat.toString(),
            longitud: lng.toString(),
          }));
        }
      },
    }),
    []
  );


  useEffect(() => {
    if (formData.latitud && formData.longitud) {
      const lat = parseFloat(formData.latitud);
      const lng = parseFloat(formData.longitud);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setZoomLevel(10); 
      }
    }
  }, [formData.latitud, formData.longitud]);


  const handleMapClick = useCallback((e) => {
    const { lat, lng } = e.latlng;
    setFormData(prev => ({
      ...prev,
      latitud: lat.toString(),
      longitud: lng.toString(),
    }));
  }, []);


  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [handleMapClick]);

  const validateField = (name, value) => {
    const requiredFields = {
      nombresApellidos: 'Nombres y Apellidos es requerido',
      cedula: 'Cédula es requerida',
      fechaNacimiento: 'Fecha de Nacimiento es requerida',
      genero: 'Género es requerido',
      nacionalidad: 'Nacionalidad es requerida',
      correo: 'Correo electrónico es requerido',
      telefonoPrincipal: 'Teléfono principal es requerido',
      comuna: 'Comuna es requerida',
      direccion: 'Dirección es requerida',
      institucion: 'Institución es requerida',
      programaEstudio: 'Programa de estudio es requerido',
      anioIngreso: 'Año de ingreso es requerido',
      semestreActual: 'Semestre actual es requerido',
      turnoEstudio: 'Turno de estudio es requerido',
      modalidadEstudio: 'Modalidad de estudio es requerida',
      programaBeca: 'Programa de beca es requerido',
      estadoBeca: 'Estado de la beca es requerido',
      tipoTarea: 'Tipo de tarea es requerido',
      dependencia: 'Dependencia es requerida',
      anexoCedula: 'Cédula es requerida',
      anexoConstancia: 'Constancia de estudio es requerida',
      anexoResidencia: 'Constancia de residencia es requerida',
      anexoFoto: 'Fotografía es requerida',
      codigoestado: 'Estado es requerido',
      codigomunicipio: 'Municipio es requerido',
      codigoparroquia: 'Parroquia es requerida'
    };

    if (requiredFields[name] && !value) {
      return requiredFields[name];
    }

    // Validación de correo electrónico
    if (name === 'correo' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Ingrese un correo electrónico válido';
      }
    }

    // Validación de teléfono
    if ((name === 'telefonoPrincipal' || name === 'telefonoAlternativo') && value) {
      const phoneRegex = /^[0-9+\-\s()]*$/;
      if (!phoneRegex.test(value)) {
        return 'Ingrese un número de teléfono válido';
      }
    }

    return '';
  };

  // Validar todos los campos del paso actual
  const validateStep = (step) => {
    const stepFields = {
      1: ['nombresApellidos', 'cedula', 'fechaNacimiento', 'genero', 'nacionalidad', 'correo', 'telefonoPrincipal', 'comuna', 'direccion', 'codigoestado', 'codigomunicipio', 'codigoparroquia'],
      2: ['institucion', 'programaEstudio', 'anioIngreso', 'semestreActual', 'turnoEstudio', 'modalidadEstudio'],
      3: ['programaBeca', 'estadoBeca', 'tipoTarea', 'dependencia'],
      4: ['anexoCedula', 'anexoConstancia', 'anexoResidencia', 'anexoFoto']
    };

    const newErrors = {};
    let isValid = true;

    stepFields[step].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Si es un campo de archivo, tomamos el primer archivo
    const fieldValue = type === 'file' ? files[0] : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Si el campo ha sido tocado, validamos al cambiar
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Marcar todos los campos del paso actual como tocados para mostrar errores
      const stepFields = {
        1: ['nombresApellidos', 'cedula', 'fechaNacimiento', 'genero', 'nacionalidad', 'correo', 'telefonoPrincipal', 'comuna', 'direccion', 'codigoestado', 'codigomunicipio', 'codigoparroquia'],
        2: ['institucion', 'programaEstudio', 'anioIngreso', 'semestreActual', 'turnoEstudio', 'modalidadEstudio'],
        3: ['programaBeca', 'estadoBeca', 'tipoTarea', 'dependencia'],
        4: ['anexoCedula', 'anexoConstancia', 'anexoResidencia', 'anexoFoto']
      };

      const newTouched = {};
      stepFields[currentStep].forEach(field => {
        newTouched[field] = true;
      });
      setTouched(prev => ({ ...prev, ...newTouched }));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Función para generar código QR
  const generateQRCode = async (data) => {
    try {
      // Construir la URL para ver la información del becario
      const baseUrl = window.location.origin; // Obtiene el dominio actual
      const becarioUrl = `${baseUrl}/verificar-becario/${data.cedula}`;
      
      // Crear un objeto con la información del becario y la URL
      const qrData = JSON.stringify({
        url: becarioUrl,
        nombresApellidos: data.nombresApellidos,
        cedula: data.cedula,
        institucion: data.institucion,
        programaBeca: data.programaBeca,
        fechaRegistro: new Date().toISOString()
      });
      
      return await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Error generando QR:', err);
      return null;
    }
  };

  // Función para generar PDF
  const generatePDF = async (data, qrCodeUrl) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const lineHeight = 7;
    let yPos = 20;

    // Logo y Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprobante de Registro', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;

    // Línea divisoria
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Información del becario
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Datos Personales', margin, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${data.nombresApellidos || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Cédula: ${data.cedula || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Fecha de Nacimiento: ${data.fechaNacimiento || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Teléfono: ${data.telefonoPrincipal || ''}`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Información académica
    doc.setFont('helvetica', 'bold');
    doc.text('Información Académica', margin, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Institución: ${data.institucion || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Programa: ${data.programaEstudio || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Año de Ingreso: ${data.anioIngreso || ''}`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Información de la beca
    doc.setFont('helvetica', 'bold');
    doc.text('Información de la Beca', margin, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Programa: ${data.programaBeca || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Estado: ${data.estadoBeca || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Tipo de Tarea: ${data.tipoTarea || ''}`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Código QR
    if (qrCodeUrl) {
      const qrSize = 60;
      doc.addImage(qrCodeUrl, 'PNG', pageWidth - margin - qrSize, 40, qrSize, qrSize);
      doc.setFontSize(8);
      doc.text('Escanee este código para verificar', pageWidth - margin - qrSize/2, 40 + qrSize + 5, { align: 'center' });
    }

    // Pie de página
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento es un comprobante de registro. Consérvelo para futuras referencias.', 
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    return doc;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar el paso actual
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    // Si no es el último paso, ir al siguiente
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Si es el último paso, enviar el formulario
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Agregar todos los campos del formulario al FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await saveBecario(formDataToSend);
     
      if (response) {
        // Generar y descargar el PDF con el código QR
        const qrCodeUrl = await generateQRCode(formData);
        const pdfDoc = await generatePDF(formData, qrCodeUrl);
        
        // Guardar el PDF
        const fileName = `comprobante_beca_${formData.cedula}_${new Date().getTime()}.pdf`;
        pdfDoc.save(fileName);
        
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          html: 'Tus datos han sido guardados correctamente.<br><br>Se ha generado un comprobante con un código QR para verificación.',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false
        }).then(() => {
          navigate('/home/becario');
        });
      } else {
        throw new Error(response.message || 'Error al guardar los datos');
      }
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al guardar los datos. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await estado();
        setEstados(response);
      } catch (error) {
        console.error("Error fetching estados:", error);
        setEstados([]);
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
      codigomunicipio: '02', 
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

    const get_becarios = async () => {
    try {
      const response = await get_becario(user.id);
      setBecario(response);
      if (response) {
        let fechaNacimientoFormateada = '';
        let anioIngresoFormateada = '';
        if (response.fecha_nacimiento || response.anio_ingreso) {

          const fecha = new Date(response.fecha_nacimiento);
          const ingreso = new Date(response.anio_ingreso);
          if (!isNaN(fecha.getTime())) {
            fechaNacimientoFormateada = fecha.toISOString().split('T')[0];
          }

          if (!isNaN(ingreso.getTime())) {
            anioIngresoFormateada = ingreso.toISOString().split('T')[0];
          }
        }
        setFormData(prev => ({
          ...prev,
          nombresApellidos: response.nombres_apellidos || '',
          genero: response.genero || '',
          telefonoPrincipal: response.telefono_principal || '',
          telefonoAlternativo: response.telefono_alternativo || '',
          comuna: response.comuna || '',
          direccion: response.direccion || '',
          institucion: response.institucion || '',
          programaEstudio: response.programa_estudio || '',
          anioIngreso: anioIngresoFormateada || '',
          semestreActual: response.semestre_actual || '',
          turnoEstudio: response.turno_estudio || '',
          modalidadEstudio: response.modalidad_estudio || '',
          programaBeca: response.programa_beca || '',
          estadoBeca: response.estado_beca || '',
          tipoTarea: response.tipo_tarea || '',
          dependencia: response.dependencia || '',
          anexoCedula: response.anexo_cedula,
          anexoConstancia: response.anexo_constancia || 'sfsdfsdf',
          anexoResidencia: response.anexo_residencia || 'sdfsdfsdf',
          anexoFoto: response.anexoFoto || '',
          codigoestado: response.codigo_estado || '',
          codigomunicipio: response.codigo_municipio || '',
          codigoparroquia: response.codigo_parroquia || '',
          latitud: response.latitud || '',
          longitud: response.longitud || '',
          fechaNacimiento: fechaNacimientoFormateada || '',
        }));
        
        // Si hay coordenadas, centrar el mapa
        if (response.latitud && response.longitud) {
          const lat = parseFloat(response.latitud);
          const lng = parseFloat(response.longitud);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
            setZoomLevel(10);
          }
        }
      }

    } catch (error) {
      console.error("Error fetching municipios:", error);
    }
  };


  


  useEffect(() => {
    get_becarios();
  }, []);

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

  return (
    <div className="becario-container">
      <div className="becario-header">
        <h1>Formulario de Registro </h1>
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
                <input type="text" name="nombresApellidos" value={formData.nombresApellidos} onChange={handleChange} onBlur={handleBlur} required />
                {errors.nombresApellidos && touched.nombresApellidos && <div className="error-message">{errors.nombresApellidos}</div>}
              </div>
              <div className="form-field">
                <label>Cédula de Identidad</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} onBlur={handleBlur} required disabled />
                {errors.cedula && touched.cedula && <div className="error-message">{errors.cedula}</div>}
              </div>
              <div className="form-field">
                <label>Fecha de Nacimiento</label>
                <input 
                type="date" 
                name="fechaNacimiento"
                 value={formData.fechaNacimiento} onChange={handleChange} onBlur={handleBlur} required />
                {errors.fechaNacimiento && touched.fechaNacimiento && <div className="error-message">{errors.fechaNacimiento}</div>}
              </div>
              <div className="form-field">
                <label>Género</label>
                <select select name="genero" value={formData.genero} onChange={handleChange} onBlur={handleBlur} required>

                  {dataBecario.genero && 
                   <option value={dataBecario.genero}>{dataBecario.genero}</option>
                   }:{
                    <option value="">Seleccione...</option>

                   }
                  
                  
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.genero && touched.genero && <div className="error-message">{errors.genero}</div>}
              </div>
              <div className="form-field">
                <label>Nacionalidad</label>
                <input disabled type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} onBlur={handleBlur} required />
                {errors.nacionalidad && touched.nacionalidad && <div className="error-message">{errors.nacionalidad}</div>}
              </div>
              <div className="form-field">
                <label>Correo Electrónico Personal</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} onBlur={handleBlur} required disabled />
                {errors.correo && touched.correo && <div className="error-message">{errors.correo}</div>}
              </div>
              <div className="form-field">
                <label>Número Telefónico Principal</label>
                <input type="tel" name="telefonoPrincipal" value={formData.telefonoPrincipal} onChange={handleChange} onBlur={handleBlur} required />
                {errors.telefonoPrincipal && touched.telefonoPrincipal && <div className="error-message">{errors.telefonoPrincipal}</div>}
              </div>
              <div className="form-field">
                <label>Número Telefónico Alternativo</label>
                <input type="tel" name="telefonoAlternativo" value={formData.telefonoAlternativo} onChange={handleChange} onBlur={handleBlur} />
              </div>
              
              <div className="form-field">
                <label>Estado de Residencia</label>
                <select   name="codigoestado" value={formData.codigoestado} onChange={handleEstadoChange}  required>
                  <option value={dataBecario.codigoestado}>{dataBecario.estado_nombre}</option>
                   

                {estados.map(e => 


                    <option selected 
                      key={e.codigoestado}
                      value={e.codigoestado}
                      latitud={e.latitud}
                      longitud={e.longitud}
                    >
                      {e.nombre}
                    </option>
                  )}
                </select>
                {errors.codigoestado && touched.codigoestado && <div className="error-message">{errors.codigoestado}</div>}
              </div>
              
              <div className="form-field">
                <label>Municipio de Residencia</label>
                <select name="codigomunicipio" value={formData.codigomunicipio} onChange={handleMunicipioChange} onBlur={handleBlur} required>
                  <option value={dataBecario.codigomunicipio}>{dataBecario.municipio_nombre}</option>
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
                {errors.codigomunicipio && touched.codigomunicipio && <div className="error-message">{errors.codigomunicipio}</div>}
              </div>
              
              <div className="form-field">
                <label>Parroquia de Residencia</label>
                <select name="codigoparroquia" value={formData.codigoparroquia} onChange={handleParroquiaChange} onBlur={handleBlur} required>
                  <option value={dataBecario.codigomunicipio}>{dataBecario.parroquia_nombre}</option>
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
                {errors.codigoparroquia && touched.codigoparroquia && <div className="error-message">{errors.codigoparroquia}</div>}
              </div>

               <div className="form-field full-width">
                <label>Ubicación seleccionada</label>
                <div className="map-container" style={{ height: '400px', width: '100%', margin: '10px 0' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={zoomLevel}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={handleMapReady}
                    zoomControl={true}
                    doubleClickZoom={true}
                    closePopupOnClick={false}
                    keyboard={true}
                    scrollWheelZoom={true}
                    dragging={true}
                    touchZoom={true}
                    boxZoom={true}
                    tap={true}
                  >
                    <ChangeView center={mapCenter} zoom={zoomLevel} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {formData.latitud && formData.longitud && (
                      <BecarioMarker
                        latitud={formData.latitud}
                        longitud={formData.longitud}
                        markerRef={markerRef}
                        markerEventHandlers={markerEventHandlers}
                      />
                    )}
                  </MapContainer>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                  <p>Haz clic en el mapa para seleccionar una ubicación o arrastra el marcador para ajustarla.</p>
                </div>
              </div>
              
              <div className="form-field">
                <label>Territorio Comuna: Comuna, Consejo Comunal de su dirección</label>
                <input type="text" name="comuna" value={formData.comuna} onChange={handleChange} onBlur={handleBlur} required />
                {errors.comuna && touched.comuna && <div className="error-message">{errors.comuna}</div>}
              </div>
              <div className="form-field full-width">
                <label>Dirección Exacta de Habitación</label>
                <textarea name="direccion" value={formData.direccion} onChange={handleChange} onBlur={handleBlur} required />
                {errors.direccion && touched.direccion && <div className="error-message">{errors.direccion}</div>}
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
                <select name="institucion" value={formData.institucion} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccione...</option>
                  {universidades.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {errors.institucion && touched.institucion && <div className="error-message">{errors.institucion}</div>}
              </div>
              <div className="form-field">
                <label>Programa de Estudio (Carrera)</label>
                <input type="text" name="programaEstudio" value={formData.programaEstudio} onChange={handleChange} onBlur={handleBlur} required />
                {errors.programaEstudio && touched.programaEstudio && <div className="error-message">{errors.programaEstudio}</div>}
              </div>
         

               <div className="form-field">
                <label>Año de Ingreso a la Carrera</label>
                <input 
                type="date" 
                name="anioIngreso"
                 value={formData.anioIngreso} onChange={handleChange} onBlur={handleBlur} required />
                {errors.anioIngreso && touched.anioIngreso && <div className="error-message">{errors.anioIngreso}</div>}
              </div>
              <div className="form-field">
                <label>Semestre o Trimestre Actual que Cursa</label>
                <input type="text" name="semestreActual" value={formData.semestreActual} onChange={handleChange} onBlur={handleBlur} required />
                {errors.semestreActual && touched.semestreActual && <div className="error-message">{errors.semestreActual}</div>}
              </div>
              <div className="form-field">
                <label>Turno de Estudio</label>
                <select name="turnoEstudio" value={formData.turnoEstudio} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccione...</option>
                  <option value="diurno">Diurno</option>
                  <option value="nocturno">Nocturno</option>
                  <option value="mixto">Mixto</option>
                </select>
                {errors.turnoEstudio && touched.turnoEstudio && <div className="error-message">{errors.turnoEstudio}</div>}
              </div>
              <div className="form-field">
                <label>Modalidad de Estudio</label>
                <select name="modalidadEstudio" value={formData.modalidadEstudio} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccione...</option>
                  <option value="presencial">Presencial</option>
                  <option value="a_distancia">A Distancia</option>
                </select>
                {errors.modalidadEstudio && touched.modalidadEstudio && <div className="error-message">{errors.modalidadEstudio}</div>}
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
                <select name="programaBeca" value={formData.programaBeca} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccione...</option>
                  <option value="auto_postulacion">Auto postulación</option>
                  <option value="circuitos_comunales">Circuitos Comunales</option>
                  <option value="instituciones_convenios">Instituciones y Convenios</option>
                  <option value="motores_productivos">Motores Productivos</option>
                  <option value="universidad">Universidad</option>
                </select>
                {errors.programaBeca && touched.programaBeca && <div className="error-message">{errors.programaBeca}</div>}
              </div>
              <div className="form-field">
                <label>Estado Actual de la Beca</label>
                <select name="estadoBeca" value={formData.estadoBeca} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccione...</option>
                  <option value="nuevo_becario">Nuevo Becario</option>
                  <option value="actualizacion">Actualización</option>
                  <option value="culminada">Culminada</option>
                  <option value="retirada">Retirada</option>
                </select>
                {errors.estadoBeca && touched.estadoBeca && <div className="error-message">{errors.estadoBeca}</div>}
              </div>
              <div className="form-field full-width">
                <label>Tipo de Tarea/Contraprestación que realiza</label>
                <select name="tipoTarea" value={formData.tipoTarea} onChange={handleChange} onBlur={handleBlur} required>
                  <option value="">Seleccione...</option>
                  <option value="apoyo_academico">Apoyo Académico (Preparadores)</option>
                  <option value="apoyo_investigacion">Apoyo a la Investigación</option>
                  <option value="apoyo_administrativo">Apoyo Administrativo</option>
                  <option value="servicio_comunitario">Servicio Comunitario en Circuito Comunal</option>
                  <option value="proyecto_productivo">Proyecto Productivo</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.tipoTarea && touched.tipoTarea && <div className="error-message">{errors.tipoTarea}</div>}
              </div>
              <div className="form-field full-width">
                <label>Dependencia o Comunidad de Adscripción</label>
                <input type="text" name="dependencia" value={formData.dependencia} onChange={handleChange} onBlur={handleBlur} required />
                {errors.dependencia && touched.dependencia && <div className="error-message">{errors.dependencia}</div>}
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
                  {errors.anexoCedula && touched.anexoCedula && <div className="error-message">{errors.anexoCedula}</div>}
                </div>
              </div>
              <div className="form-field">
                <label>Constancia de Estudio/Inscripción</label>
                <div className="file-upload-container">
                  <input  type="file" id="anexoConstancia" name="anexoConstancia" onChange={handleFileChange} required className="file-input" />
                  <label htmlFor="anexoConstancia" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoConstancia && <span className="file-name">{formData.anexoConstancia.name}</span>}
                  {errors.anexoConstancia && touched.anexoConstancia && <div className="error-message">{errors.anexoConstancia}</div>}
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
                  {errors.anexoResidencia && touched.anexoResidencia && <div className="error-message">{errors.anexoResidencia}</div>}
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
                  {errors.anexoFoto && touched.anexoFoto && <div className="error-message">{errors.anexoFoto}</div>}
                </div>
              </div>
            </div>
            <div className="form-navigation">

            
              <button type="button" className="nav-button prev" onClick={prevStep}>
                <span className="icon">←</span> Anterior
              </button>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (dataBecario.length ? 'Actualizar datos' : 'Registrar Datos')}
                </button>
             
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BecarioView;