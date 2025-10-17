import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "../context/AuthContext";
import {
  estado,
  get_municipios,
  get_parroquias,
  saveBecarioEsteriol,
  get_becario_esteriol,
  get_Uner,
  get_carreras,
  get_anexo_cedula,
  get_Paises,
} from "../services/api";
import "./../styles/BecarioView.css";
import { MapContainer, TileLayer, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import BecarioMarker from "./BecarioMarker";

// Fix for default marker icon issue with bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

const DEGREE_TYPES = ["Pre-grado", "Maestría", "Doctorado", "Postgrado"];

const BecarioEsteriol = () => {
  const { user } = useAuth();
  const [dataBecario, setBecario] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: user?.id || "",
    nombresApellidos: "",
    cedula: user?.cedula || "",
    pasaporte: "",
    fechaNacimiento: "",
    genero: "",
    nacionalidad: user?.nacionalidad === "V" ? "Venezolano" : "Extranjero",
    correo: user?.email || "",
    telefonoPrincipal: "",
    telefonoAlternativo: "",
    nombre_representante: "",
    parentesco: "",
    institucion: "",
    tipo_becario: "",
    pais_procedencia: "",
    institucion_academica: "",
    carrera: "",
    titularidad: "",
    anioIngreso: "",
    semestreActual: "",
    constancia_semestre: "",
    anexoCedula: null,
    anexoConstancia: null,
    anexoResidencia: null,
    anexoFoto: null,
    Contrato_convenio: null,
    codigoestado: "",
    codigomunicipio: "",
    codigoparroquia: "",
    latitud: "",
    longitud: "",
    latitud_pais: "",
    longitud_pais: "",
    pais_procedencia: "",
    
  });

  const [estados, setEstados] = useState([]);
  const [paises, setPaises] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
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
          setFormData((prev) => ({
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
        setZoomLevel(13);
      }
    }
  }, [formData.latitud, formData.longitud]);

  const handleMapClick = useCallback((e) => {
    const { lat, lng } = e.latlng;
    setFormData((prev) => ({
      ...prev,
      latitud: lat.toString(),
      longitud: lng.toString(),
    })); 
  }, []);

  const handleMapReady = useCallback(
    (map) => {
      mapRef.current = map;
      map.on("click", handleMapClick);
      return () => {
        map.off("click", handleMapClick);
      };
    },
    [handleMapClick]
  );

  const validateField = (name, value) => {
    const requiredFields = {
      nombresApellidos: "Nombres y Apellidos es requerido",
      cedula: "Cédula es requerida",
      pasaporte: "Cédula es requerida",
      fechaNacimiento: "Fecha de Nacimiento es requerida",
      genero: "Género es requerido",
      nacionalidad: "Nacionalidad es requerida",
      correo: "Correo electrónico es requerido",
      telefonoPrincipal: "Teléfono principal es requerido",
      institucion: "Institución es requerida",
      tipo_becario: "Programa de estudio es requerido",
      pais_procedencia: "Pais de estudio es requerido",
      institucion_academica: "Institución académica es requerida",
      carrera: "Carrera es requerida",
      titularidad: "Titularidad es requerida",
      anioIngreso: "Año de ingreso es requerido",
      semestreActual: "Semestre actual es requerido",
      anexoCedula: "Cédula es requerida",
      anexoConstancia: "Constancia de estudio es requerida",
      anexoResidencia: "Constancia de residencia es requerida",
      anexoFoto: "Fotografía es requerida",
      Contrato_convenio: "Contrato convenio es requerida",
      codigoestado: "Estado es requerido",
      codigomunicipio: "Municipio es requerido",
      codigoparroquia: "Parroquia es requerida",
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
      (name === "telefonoPrincipal" || name === "telefonoAlternativo") &&
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
        "nombresApellidos",
        "cedula",
        "pasaporte",
        "fechaNacimiento",
        "genero",
        "nacionalidad",
        "correo",
        "telefonoPrincipal",
        "codigoestado",
        "codigomunicipio",
        "codigoparroquia",
        "nombre_representante",
        "parentesco",
      ],
      2: [
        "pais_procedencia",
        "carrera",
        "titularidad",
        "anioIngreso",
        "semestreActual",
        "institucion_academica"
     
      ],
      3: ["tipo_becario","tipoBeca"],
      4: ["anexoCedula", "anexoConstancia", "anexoResidencia", "anexoFoto" , "Contrato_convenio" ],
    };

    const newErrors = {};
    let isValid = true;

    stepFields[step].forEach((field) => {
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

useEffect(() => {
  pais_procedencia();
}, []);



  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const fieldValue = type === "file" ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
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
          "nombresApellidos",
          "cedula",
          "pasaporte",
          "fechaNacimiento",
          "genero",
          "nacionalidad",
          "correo",
          "telefonoPrincipal",
          "codigoestado",
          "codigomunicipio",
          "codigoparroquia",
          "nombre_representante",
          "parentesco",
        ],
        2: [
          "pais_procedencia",
          "carrera",
          "titularidad",
          "anioIngreso",
          "semestreActual",
          "constancia_semestre"

        ],
        3: ["tipo_becario" , "tipoBeca"],
        4: ["anexoCedula", "anexoConstancia", "anexoResidencia", "anexoFoto" , "Contrato_convenio" ],
      };

      const newTouched = {};
      stepFields[currentStep].forEach((field) => {
        newTouched[field] = true;
      });
      setTouched((prev) => ({ ...prev, ...newTouched }));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
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
        institucion: data.uner,
        fechaRegistro: new Date().toISOString(),
      });

      return await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error("Error generando QR:", err);
      return null;
    }
  };

  // Función para generar PDF con mejor formato y manejo de contenido
  const generatePDF = async (data, qrCodeUrl) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // Reducido de 15 a 10
    const lineHeight = 6; // Reducido de 7 a 6
    const maxContentWidth = pageWidth - 2 * margin;
    const footerHeight = 15; // Altura fija para el pie de página
    
    // Función para agregar nueva página si es necesario
    const addNewPageIfNeeded = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - footerHeight - 10) {
        doc.addPage();
        yPos = margin;
        addHeader();
        return true;
      }
      return false;
    };

    // Función para agregar el encabezado
    const addHeader = () => {
      const headerHeight = 25;
      doc.addImage(
        "/img/cintillo6.png", 
        "PNG", 
        margin, 
        margin, 
        pageWidth - 2 * margin, 
        headerHeight
      );
      
      // Título del documento
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("COMPROBANTE DE REGISTRO", pageWidth / 2, margin + headerHeight + 10, {
        align: "center"
      });
      
     
    };

    // Inicializar posición Y y agregar encabezado
    let yPos = margin + 40; // Reducido de 50 a 40 para ahorrar espacio
    addHeader();
    yPos += 5; // Reducido de 10 a 5 para ahorrar espacio

    // Función para agregar sección con título
    const addSection = (title, content) => {
      // Verificar si necesitamos una nueva página antes de agregar el título
      const needsNewPage = addNewPageIfNeeded(lineHeight * 3); // Menos espacio para el título
      
      if (!needsNewPage) {
        // Solo agregar espacio extra si no estamos al inicio de una nueva página
        yPos += lineHeight * 0.5;
      }
      
      // Título de la sección
      doc.setFontSize(11); // Reducido de 12 a 11
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPos);
      yPos += lineHeight * 0.8; // Reducido el espacio después del título
      
      // Contenido de la sección
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, maxContentWidth);
      
      // Verificar si necesitamos una nueva página para el contenido
      const neededSpace = lines.length * lineHeight;
      if (yPos + neededSpace > pageHeight - footerHeight - 10) {
        doc.addPage();
        yPos = margin;
        addHeader();
        // No agregar espacio extra después del encabezado en este caso
      }
      
      // Agregar el texto
      doc.text(lines, margin, yPos);
      yPos += (lines.length * lineHeight) + (lineHeight * 0.5); // Reducido el espacio entre secciones
    };

    // Agregar información personal
    const personalInfo = [
      `Nombre: ${data.nombresApellidos || "No especificado"}`,
      `Cédula: ${data.cedula || "No especificada"}`,
      `Fecha de Nacimiento: ${data.fechaNacimiento || "No especificada"}`,
      `Teléfono: ${data.telefonoPrincipal || "No especificado"}`
    ].join('\n');
    
    addSection("Datos Personales", personalInfo);
    // Agregar información paresteco
    const parentescoInfo = [
      `Nombre: ${data.nombre_representante || "No especificado"}`,
      `Parentesco: ${data.parentesco || "No especificado"}`,
      `Teléfono: ${data.telefonoPrincipal || "No especificado"}`,
      `Correo: ${data.correo || "No especificado"}`,
    ].join('\n');
    
    addSection("Datos del representante", parentescoInfo);

    // Agregar información académica
    const academicInfo = [
      `Programa: ${data.tipo_becario || "No especificado"}`,
      `Pais de estudio: ${data.pais_procedencia || "No especificado"}`,
      `Institucion Academica: ${data.institucion_academica || "No especificada"}`,
      `Carrera Cursa: ${data.carrera || "No especificada"}`,
      `Titularidad: ${data.titularidad || "No especificada"}`,
      `Año de Ingreso: ${data.anioIngreso || "No especificado"}`,
      `Semestre Actual: ${data.semestreActual || "No especificado"}`,
      //`Constancia Semestre Actual: ${data.constancia_semestre || "No especificado"}`,
    ].join('\n');
    
    addSection("Información Académica", academicInfo);

    // Agregar información de la beca
    const scholarshipInfo = [
      `Tipo de becario: ${data.tipo_becario || "No especificado"}`,
      `Tipo de beca: ${data.tipoBeca || "No especificado"}`,
   
     
    ].join('\n');
    
    addSection("Información de la Beca", scholarshipInfo);

    // Agregar código QR con mejor posicionamiento
    if (qrCodeUrl) {
      const qrSize = 40; // Reducido de 50 a 40
      const qrX = pageWidth - margin - qrSize;
      const qrY = pageHeight - footerHeight - qrSize - 5; // Ajustado para usar el espacio del footer
      
      // Asegurar que el QR no se superponga con el contenido
      if (yPos > qrY - 10) {
        // En lugar de forzar una nueva página, reducimos el tamaño del QR
        const smallerQrSize = 30;
        doc.addImage(
          qrCodeUrl,
          "PNG",
          pageWidth - margin - smallerQrSize,
          yPos,
          smallerQrSize,
          smallerQrSize
        );
        
        // Texto debajo del QR
        doc.setFontSize(7); // Texto más pequeño
        doc.text(
          "Escanear",
          pageWidth - margin - (smallerQrSize / 2),
          yPos + smallerQrSize + 3,
          { align: "center" }
        );
        
        yPos += smallerQrSize + 8; // Ajustar posición Y después del QR
      } else {
        // Si hay espacio, usar el tamaño normal
        doc.addImage(
          qrCodeUrl,
          "PNG",
          qrX,
          qrY,
          qrSize,
          qrSize
        );
        
        // Texto debajo del QR
        doc.setFontSize(7); // Texto más pequeño
        doc.text(
          "Escanee para verificar",
          qrX + (qrSize / 2),
          qrY + qrSize + 3,
          { align: "center" }
        );
      }
    }

    // Pie de página
    const addFooter = () => {
      doc.setFontSize(7); // Reducido de 8 a 7
      doc.setFont("helvetica", "italic");
      const pageCount = doc.internal.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Número de página (más compacto)
        doc.text(
          `${i}/${pageCount}`,
          pageWidth - margin,
          pageHeight - 5,
          { align: "right" }
        );
        
        // Texto del pie de página (más corto y compacto)
        doc.text(
          "Comprobante de registro - Fundación Ayacucho",
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" }
        );
      }
    };
    
    // Agregar pie de página a todas las páginas
    addFooter();
    
    return doc;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await saveBecarioEsteriol(formDataToSend);

      if (response) {
        // Generar y descargar el PDF con el código QR
        const qrCodeUrl = await generateQRCode(formData);
        const pdfDoc = await generatePDF(formData, qrCodeUrl);

        // Guardar el PDF
        const fileName = `comprobante_beca_${
          formData.cedula
        }_${new Date().getTime()}.pdf`;
        pdfDoc.save(fileName);

        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          html: "Tus datos han sido guardados correctamente.<br><br>Se ha generado un comprobante con un código QR para verificación.",
          confirmButtonText: "Aceptar",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/home");
        });
      } else {
        throw new Error(response.message || "Error al guardar los datos");
      }
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Ocurrió un error al guardar los datos. Por favor, inténtalo de nuevo.",
        confirmButtonText: "Aceptar",
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
    get_becarios();
  }, []);

  const handleEstadoChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const estadoId = e.target.value;
    const latitud = selectedOption.getAttribute("latitud");
    const longitud = selectedOption.getAttribute("longitud");
    const latitud_pais = selectedOption.getAttribute("latitud_pais");
    const longitud_pais = selectedOption.getAttribute("longitud_pais");

    if (estadoId || dataBecario.codigo_estado  ) {
      try {
        const response = await get_Uner(estadoId);
        setUner(response);
      } catch (error) {
        console.error("Error fetching municipios:", error);
      }
    }
    setFormData({
      ...formData,
      codigoestado: estadoId,
      codigomunicipio: "02",
      codigoparroquia: "",
      latitud: latitud || "",
      longitud: longitud || "",
      latitud_pais: latitud_pais || "",
      longitud_pais: longitud_pais || "",
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
      const response = await get_becario_esteriol(user.id);
     const responseAnexoCedula = await get_anexo_cedula(response.cedula);
      
  
      setBecario(response);
      if (response) {
        let fechaNacimientoFormateada = "";
        let anioIngresoFormateada = "";
        if (response.fecha_nacimiento || response.anio_ingreso) {
          const fecha = new Date(response.fecha_nacimiento);
          const ingreso = new Date(response.anio_ingreso);
          if (!isNaN(fecha.getTime())) {
            fechaNacimientoFormateada = fecha.toISOString().split("T")[0];
          }

          if (!isNaN(ingreso.getTime())) {
            anioIngresoFormateada = ingreso.toISOString().split("T")[0];
          }
        }
        setFormData((prev) => ({
          ...prev,
          nombresApellidos: response.nombres_apellidos || "",
          genero: response.genero || "",
          pasaporte: response.pasaporte || "",
          telefonoPrincipal: response.telefono_principal || "",
          telefonoAlternativo: response.telefono_alternativo || "",
          nombre_representante: response.nombre_representante || "",
          parentesco: response.parentesco || "",
          institucion: response.institucion || "",
          tipo_becario: response.tipo_becario || "",
          pais_procedencia: response.pais_procedencia || "",
          institucion_academica: response.institucion_academica || "",
          carrera: response.carrera || "",
          titularidad: response.titularidad || "",
          anioIngreso: anioIngresoFormateada || "",
          semestreActual: response.semestre_actual || "",
          anexoCedula: responseAnexoCedula || "",
          anexoConstancia: response.anexo_constancia || "",
          anexoResidencia: response.anexo_residencia || "",
          anexoFoto: response.anexoFoto || "",
          codigoestado: response.codigoestado || "",
          codigomunicipio: response.codigomunicipio || "",
          codigoparroquia: response.codigoparroquia || "",
          latitud: response.latitud || "",
          longitud: response.longitud || "",
          latitud_pais: response.latitud_pais || "",
          longitud_pais: response.longitud_pais || "",
          pais_procedencia: response.pais_procedencia || "",
          fechaNacimiento: fechaNacimientoFormateada || "",
          
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

  const pais_procedencia = async () => {
    try {
    const response = await get_Paises();
    setPaises(response);
  } catch (error) {
    console.error("Error fetching paises:", error);
    setPaises([]);
  }
  };


  const handleMunicipioChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const municipioId = e.target.value;
    const latitud = selectedOption.getAttribute("latitud");
    const longitud = selectedOption.getAttribute("longitud");

    setFormData({
      ...formData,
      codigomunicipio: municipioId,
      codigoparroquia: "",
      latitud: latitud || formData.latitud,
      longitud: longitud || formData.longitud,
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
    const latitud = selectedOption.getAttribute("latitud");
    const longitud = selectedOption.getAttribute("longitud");

    setFormData({
      ...formData,
      codigoparroquia: parroquiaId,
      latitud: latitud || formData.latitud,
      longitud: longitud || formData.longitud,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      const validDocumentTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (name === "anexoFoto" && !validImageTypes.includes(files[0].type)) {
        alert("Por favor, seleccione una imagen válida (JPEG, PNG)");
        return;
      }

      if (name === "Contrato_convenio" && !validImageTypes.includes(files[0].type)) {
        alert("Por favor, seleccione una imagen válida (JPEG, PNG)");
        return;
      }
      if (name === "constancia_semestre" && !validImageTypes.includes(files[0].type)) {
        alert("Por favor, seleccione una imagen válida (JPEG, PNG)");
        return;
      }

     
      
      if (
        ["anexoCedula", "anexoConstancia", "anexoResidencia"].includes(name) &&
        !validDocumentTypes.includes(files[0].type)
      ) {
        alert("Por favor, seleccione un documento válido (PDF, JPEG, PNG)");
        return;
      }

      if (files[0].size > 5 * 1024 * 1024) {
        alert("El archivo no debe exceder los 5MB");
        return;
      }

      setFormData({ ...formData, [name]: files[0] });
    }
  };

  return (
    <div className="becario-container">
      <div className="becario-header">
        <h1> Datos Personales del Becario  y de  su representante en Venezuela </h1>
        <p>
          Complete toda la información solicitada para su registro en el sistema
        </p>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
            <span className="step-number"></span>
            <span className="step-label">Datos Personales</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
            <span className="step-number"></span>
            <span className="step-label">Datos Académicos</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
            <span className="step-number"></span>
            <span className="step-label">Datos de Beca</span>
          </div>
          <div className={`progress-step ${currentStep >= 4 ? "active" : ""}`}>
            <span className="step-number"></span>
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
                <input
                  type="text"
                  name="nombresApellidos"
                  value={formData.nombresApellidos}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.nombresApellidos && touched.nombresApellidos && (
                  <div className="error-message">{errors.nombresApellidos}</div>
                )}
              </div>
              <div className="form-field">
                <label>Cédula de Identidad</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled
                />
                {errors.cedula && touched.cedula && (
                  <div className="error-message">{errors.cedula}</div>
                )}
              </div>


              <div className="form-field">
                <label>Número de pasaporte </label>
                <input
                  type="text"
                  name="pasaporte"
                  value={formData.pasaporte}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
            
                />
                {errors.pasaporte && touched.pasaporte && (
                  <div className="error-message">{errors.pasaporte}</div>
                )}
              </div>
              <div className="form-field">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.fechaNacimiento && touched.fechaNacimiento && (
                  <div className="error-message">{errors.fechaNacimiento}</div>
                )}
              </div>
              <div className="form-field">
                <label>Género</label>
                <select
                  select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  {dataBecario.genero && (
                    <option value={dataBecario.genero}>
                      {dataBecario.genero}
                    </option>
                  )}
                  :{<option value="">Seleccione...</option>}
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.genero && touched.genero && (
                  <div className="error-message">{errors.genero}</div>
                )}
              </div>
              <div className="form-field">
                <label>Nacionalidad</label>
                <input
                  disabled
                  type="text"
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.nacionalidad && touched.nacionalidad && (
                  <div className="error-message">{errors.nacionalidad}</div>
                )}
              </div>
              <div className="form-field">
                <label>Correo Electrónico Personal</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled
                />
                {errors.correo && touched.correo && (
                  <div className="error-message">{errors.correo}</div>
                )}
              </div>
              <div className="form-field">
                <label>Número Telefónico Principal</label>
                <input
                  type="tel"
                  name="telefonoPrincipal"
                  value={formData.telefonoPrincipal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.telefonoPrincipal && touched.telefonoPrincipal && (
                  <div className="error-message">
                    {errors.telefonoPrincipal}
                  </div>
                )}
              </div>
              <div className="form-field">
                <label>Número Telefónico Alternativo</label>
                <input
                  type="tel"
                  name="telefonoAlternativo"
                  value={formData.telefonoAlternativo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <h2>Datos de representante y ubicación en Venezuela</h2>

              <div className="form-field">
                <label>Nombre y apellido del representante en Venezuela</label>
                <input
                  type="text"
                  name="nombre_representante"
                  value={formData.nombre_representante}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required

                />
                {errors.nombre_representante && touched.nombre_representante && (
                  <div className="error-message">{errors.nombre_representante}</div>
                )}
              </div>
            
              <div className="form-field">
                <label>Parentesco</label>
                <input
                  type="text"
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.parentesco && touched.parentesco && (
                  <div className="error-message">{errors.parentesco}</div>
                )}
              </div>

                

              <div className="form-field mt-2">
                <label>Estado de Residencia</label>
                <select
                  name="codigoestado"
                  value={formData.codigoestado}
                  onChange={handleEstadoChange}
                  required
                >
                  <option value={dataBecario.codigo_municipio}>
                    {dataBecario.estado}
                  </option>

                  {estados.map((e) => (
                    <option
                      selected
                      key={e.codigoestado}
                      value={e.codigoestado}
                      latitud={e.latitud}
                      longitud={e.longitud}
                    >
                      {e.nombre}
                    </option>
                  ))}
                </select>
                {errors.codigoestado && touched.codigoestado && (
                  <div className="error-message">{errors.codigoestado}</div>
                )}
              </div>

              <div className="form-field">
                <label>Municipio de Residencia</label>
                <select
                  name="codigomunicipio"
                  value={formData.codigomunicipio}
                  onChange={handleMunicipioChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value={dataBecario.codigo_municipio}>
                    {dataBecario.municipio}
                  </option>
                  {municipios.map((m) => (
                    <option
                      key={m.codigomunicipio}
                      value={m.codigomunicipio}
                      latitud={m.latitud}
                      longitud={m.longitud}
                    >
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {errors.codigomunicipio && touched.codigomunicipio && (
                  <div className="error-message">{errors.codigomunicipio}</div>
                )}
              </div>

              <div className="form-field">
                <label>Parroquia de Residencia</label>
                <select
                  name="codigoparroquia"
                  value={formData.codigoparroquia}
                  onChange={handleParroquiaChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value={dataBecario.codigo_parroquia}>
                    {dataBecario.parroquia}
                  </option>
                  {parroquias.map((p) => (
                    <option
                      key={p.codigoparroquia}
                      value={p.codigoparroquia}
                      latitud={p.latitud}
                      longitud={p.longitud}
                    >
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {errors.codigoparroquia && touched.codigoparroquia && (
                  <div className="error-message">{errors.codigoparroquia}</div>
                )}
              </div>

              <div className="form-field full-width">
                <label>Ubicación seleccionada</label>
                <div
                  className="map-container"
                  style={{ height: "400px", width: "100%", margin: "10px 0" }}
                >
                  <MapContainer
                    center={mapCenter}
                    zoom={zoomLevel}
                    style={{ height: "100%", width: "100%" }}
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
                <div
                  style={{ marginTop: "8px", fontSize: "0.9em", color: "#666" }}
                >
                  <p>
                    Haz clic en el mapa para seleccionar una ubicación o
                    arrastra el marcador para ajustarla.
                  </p>
                </div>
              </div>

        
            </div>
            <div className="form-navigation">
              <button
                type="button"
                className="nav-button next"
                onClick={nextStep}
              >
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
             

        

                    <div className="form-field">
                      <label>Indique el país donde esta estudiando</label>
                      <select
                        name="pais_procedencia"
                        value={formData.pais_procedencia}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {paises &&
                          paises.map((stad) => (
                            <option
                              latitud_pais={stad.latitud}
                              longitud_pais={stad.longitud}
                            >
                              {stad.nombre_pais}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="institucion">Nombre de la institución</label>
                      <input type="text" name="institucion_academica" value={formData.institucion_academica} onChange={handleChange} onBlur={handleBlur} required />
                      {errors.institucion_academica && touched.institucion_academica && (
                        <div className="error-message">{errors.institucion_academica}</div>
                      )}

                    </div>

              <div className="form-field mt-2">
                <label htmlFor="carrera">Carrera que cursa</label>
                <input type="text" name="carrera" value={formData.carrera} onChange={handleChange} onBlur={handleBlur} required />
                {errors.carrera && touched.carrera && (
                  <div className="error-message">{errors.carrera}</div>
                )}
              </div>
              <div className="form-field">
                <label>Titularidad</label>
                <div className="input-group">
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
                <label>Año de Ingreso a la Carrera</label>
                <input
                  type="date"
                  name="anioIngreso"
                  value={formData.anioIngreso}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.anioIngreso && touched.anioIngreso && (
                  <div className="error-message">{errors.anioIngreso}</div>
                )}
              </div>
              <div className="form-field">
                <label>Semestre o Trimestre Actual que Cursa</label>
                <select
                  name="semestreActual"
                  value={formData.semestreActual}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="trimestres">trimestres</option>
                  <option value="semestre ">semestre </option>
                  <option value="año_cursando">año cursando</option>
             
                </select>
                {errors.semestreActual && touched.semestreActual && (
                  <div className="error-message">{errors.semestreActual}</div>
                )}
              </div>


              <div className="form-field">
                <label>Constancia de último nivel aprobado (trimestre, semestre o año) </label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="constancia_semestre"
                    name="constancia_semestre"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="constancia_semestre" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>

                   {formData.constancia_semestre && (
                    <span className="file-name">{formData.constancia_semestre.name}</span>
                  )}
                  {errors.constancia_semestre && touched.constancia_semestre && (
                    <div className="error-message">{errors.constancia_semestre}</div>
                  )}
                  
                </div>
              </div>
          
       

        
            </div>
            <div className="form-navigation">
              <button
                type="button"
                className="nav-button prev"
                onClick={prevStep}
              >
                <span className="icon">←</span> Anterior
              </button>
              <button
                type="button"
                className="nav-button next"
                onClick={nextStep}
              >
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

            <div className="form-field full-width">
                <label>
                Tipo de beca
                </label>
                <select
                  name="institucion"
                  value={formData.institucion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option  value="">Seleccione</option>
                  <option   value="Internacional">Internacional</option>
                  
                </select>
                {errors.institucion && touched.institucion && (
                  <div className="error-message">{errors.institucion}</div>
                )}
              </div>
              <div className="form-field">
                <label>Tipo de becario</label>
                <select
                  name="tipo_becario"
                  value={formData.tipo_becario}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option   value="">Seleccione</option>
                  <option value="Becario_Venezolano_en_el_Exterior">Becario Venezolano en el Exterior</option>
                 
                </select>
                {errors.tipo_becario && touched.tipo_becario && (
                  <div className="error-message">{errors.tipo_becario}</div>
                )}
              </div>




             
        
      
            </div>
            <div className="form-navigation">
              <button
                type="button"
                className="nav-button prev"
                onClick={prevStep}
              >
                <span className="icon">←</span> Anterior
              </button>
              <button
                type="button"
                className="nav-button next"
                onClick={nextStep}
              >
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
                  <input
                    type="file"
                    id="anexoCedula"
                    name="anexoCedula"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="anexoCedula" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoCedula && (
                    <span className="file-name">
                      {formData.anexoCedula.name}
                    </span>
                  )}
                  {errors.anexoCedula && touched.anexoCedula && (
                    <div className="error-message">{errors.anexoCedula}</div>
                  )}
                </div>
              </div>
              <div className="form-field">
                <label>Constancia de Estudio/Inscripción</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="anexoConstancia"
                    name="anexoConstancia"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                  />
                  <label
                    htmlFor="anexoConstancia"
                    className="file-upload-button"
                  >
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoConstancia && (
                    <span className="file-name">
                      {formData.anexoConstancia.name}
                    </span>
                  )}
                  {errors.anexoConstancia && touched.anexoConstancia && (
                    <div className="error-message">
                      {errors.anexoConstancia}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-field">
                <label>Constancia de Residencia</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="anexoResidencia"
                    name="anexoResidencia"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                  />
                  <label
                    htmlFor="anexoResidencia"
                    className="file-upload-button"
                  >
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoResidencia && (
                    <span className="file-name">
                      {formData.anexoResidencia.name}
                    </span>
                  )}
                  {errors.anexoResidencia && touched.anexoResidencia && (
                    <div className="error-message">
                      {errors.anexoResidencia}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-field">
                <label>Fotografía del becario</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="anexoFoto"
                    name="anexoFoto"
                    onChange={handleFileChange}
                    required
                    className="file-input"
                  />
                  <label htmlFor="anexoFoto" className="file-upload-button">
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>
                  {formData.anexoFoto && (
                    <span className="file-name">{formData.anexoFoto.name}</span>
                  )}
                  {errors.anexoFoto && touched.anexoFoto && (
                    <div className="error-message">{errors.anexoFoto}</div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label>Contrato convenio</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="Contrato_convenio"
                    name="Contrato_convenio"
                    className="file-input"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    
                  />
                  <label
                    htmlFor="Contrato_convenio"
                    className="file-upload-button"
                  >
                    <span className="upload-icon">📎</span> Seleccionar archivo
                  </label>

                  {formData.Contrato_convenio && (
                    <span className="file-name">{formData.Contrato_convenio.name}</span>
                  )}
                  {errors.Contrato_convenio && touched.Contrato_convenio && (
                    <div className="error-message">{errors.Contrato_convenio}</div>
                  )}
                  
                
                </div>
              </div>
            </div>
            <div className="form-navigation">
              <button
                type="button"
                className="nav-button prev"
                onClick={prevStep}
              >
                <span className="icon">←</span> Anterior
              </button>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Enviando..."
                  : dataBecario.cedula
                  ? "Actualizar datos"
                  : "Registrar Datos"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BecarioEsteriol;
