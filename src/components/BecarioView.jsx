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
  saveBecario,
  get_becario,
  get_Uner,
  get_carreras
  
} from "../services/api";
import "./../styles/BecarioView.css";
import { MapContainer, TileLayer, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import BecarioMarker from "./BecarioMarker";

// Fix for default marker icon issue with bundlers get_anexo_cedula,
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

const BecarioView = () => {
  const { user } = useAuth();
  const [dataBecario, setBecario] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: user?.id || "",
    nombresApellidos: "",
    cedula: user?.cedula || "",
    fechaNacimiento: "",
    genero: "",
    nacionalidad: user?.nacionalidad === "V" ? "Venezolano" : "Extranjero",
    correo: user?.email || "",
    telefonoPrincipal: "",
    telefonoAlternativo: "",
    comuna: "",
    direccion: "",
    institucion: "",
    programaEstudio: "",
    anioIngreso: "",
    semestreActual: "",
    turnoEstudio: "",
    modalidadEstudio: "",
    programaBeca: "",
    estadoBeca: "",
    tipoTarea: "",
    dependencia: "",
    anexoCedula: null,
    anexoConstancia: null,
    anexoResidencia: null,
    anexoFoto: null,
    Contrato_convenio: 'null.png',
    constancia_semestre: null,
    codigoestado: "",
    codigomunicipio: "",
    codigoparroquia: "",
    latitud: "",
    longitud: "",
    codigoestado2: "",
    nivel_academico:""
    
  });

  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const [uner, setUner] = useState([]);
  const [carrera, setcarrera] = useState([]);
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
      fechaNacimiento: "Fecha de Nacimiento es requerida",
      genero: "Género es requerido",
      nacionalidad: "Nacionalidad es requerida",
      correo: "Correo electrónico es requerido",
      telefonoPrincipal: "Teléfono principal es requerido",
      comuna: "Comuna es requerida",
      direccion: "Dirección es requerida",
      institucion: "Institución es requerida",
      programaEstudio: "Programa de estudio es requerido",
      anioIngreso: "Año de ingreso es requerido",
      semestreActual: "Semestre actual es requerido",
      turnoEstudio: "Turno de estudio es requerido",
      modalidadEstudio: "Modalidad de estudio es requerida",
      programaBeca: "Programa de beca es requerido",
      estadoBeca: "Estado de la beca es requerido",
      tipoTarea: "Tipo de tarea es requerido",
      dependencia: "Dependencia es requerida",
      anexoCedula: "Cédula es requerida",
      anexoConstancia: "Constancia de estudio es requerida",
      anexoResidencia: "Constancia de residencia es requerida",
      anexoFoto: "Fotografía es requerida",
     // Contrato_convenio: "Contrato convenio es requerida",
      //constancia_semestre: "Contrato convenio es requerida",
      codigoestado: "Estado es requerido",
      codigomunicipio: "Municipio es requerido",
      codigoparroquia: "Parroquia es requerida",
      codigoestado2: "Estado es requerido",
      nivel_academico: "Nivel academico es requerido"
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
        "fechaNacimiento",
        "genero",
        "nacionalidad",
        "correo",
        "telefonoPrincipal",
        "comuna",
        "direccion",
        "codigoestado",
        "codigomunicipio",
        "codigoparroquia",
      ],
      2: [
        "codigoestado2",
        "institucion",
        "programaEstudio",
        "anioIngreso",
        "semestreActual",
        "nivel_academico",
        "turnoEstudio",
        "modalidadEstudio",
        //"constancia_semestre"
      ],
      3: ["programaBeca", "estadoBeca", "tipoTarea", "dependencia"],
      4: ["anexoCedula", "anexoConstancia", "anexoResidencia", "anexoFoto"  ],
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
    if (formData.institucion) {
      const fetchCarreras = async () => {
        try {
          const response = await get_carreras(formData.institucion);
          setcarrera(response);
        } catch (error) {
          console.error("Error fetching carreras:", error);
          setcarrera([]);
        }
      };
      fetchCarreras();
    }
  }, [formData.institucion]);

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    const fieldValue = type === "file" ? files[0] : value;


    //console.log(name , value)


    if (name == "codigoestado2" && value) {
      try {
        const response = await get_Uner(value);
        setUner(response);
      } catch (error) {
        console.error("Error fetching municipios:", error);
      }
    }

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
          "fechaNacimiento",
          "genero",
          "nacionalidad",
          "correo",
          "telefonoPrincipal",
          "comuna",
          "direccion",
          "codigoestado",
          "codigomunicipio",
          "codigoparroquia",
        ],
        2: [
          "institucion",
          "programaEstudio",
          "anioIngreso",
          "semestreActual",
          "nivel_academico",
          "turnoEstudio",
          "modalidadEstudio",
          //"constancia_semestre"
        ],
        3: ["programaBeca", "estadoBeca", "tipoTarea", "dependencia"],
        4: ["anexoCedula", "anexoConstancia", "anexoResidencia", "anexoFoto"  ],
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
        programaBeca: data.programaBeca,
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
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generado: ${dateStr}`, pageWidth - margin, margin + 25, { align: 'right' });
      // Línea divisoria
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.line(margin, margin + headerHeight + 15, pageWidth - margin, margin + headerHeight + 15);
    };

    //agregar un foto de perfil del becario con un tamaño de 100x100

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


     // agregar los campos de estado, municipio y parroquia si están disponibles
     const estadoInfo = [
      `Estado: ${data.estado || "No especificado"}`,
      `municipio: ${data.municipio || "No especificado"}`,
      `parroquia: ${data.parroquia || "No especificado"}`,
    ].join('\n');
    
    addSection("Datos de la Ubicación", estadoInfo);



    // Agregar información académica
    const academicInfo = [
      `Institución: ${data.uner || "No especificada"}`,
      `Programa: ${data.programaEstudio || "No especificado"}`,
      `Año de Ingreso: ${data.anioIngreso || "No especificado"}`,
      `Semestre Actual: ${data.semestreActual || "No especificado"}`,
      `Nivel academico: ${data.nivel_academico || "No especificado"}`
  
    ].join('\n');
    
    addSection("Información Académica", academicInfo);

    // Agregar información de la beca
    const scholarshipInfo = [
      `Programa: ${data.programaBeca || "No especificado"}`,
      `Estado: ${data.estadoBeca || "No especificado"}`,
      `Tipo de Tarea: ${data.tipoTarea || "No especificado"}`
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

      const response = await saveBecario(formDataToSend);

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

    setFormData({
      ...formData,
      codigoestado: estadoId,
      codigomunicipio: "02",
      codigoparroquia: "",
      latitud: latitud || "",
      longitud: longitud || "",
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
     //const responseAnexoCedula = await get_anexo_cedula(response.cedula);
      
  
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
          telefonoPrincipal: response.telefono_principal || "",
          telefonoAlternativo: response.telefono_alternativo || "",
          comuna: response.comuna || "",
          direccion: response.direccion || "",
          institucion: response.institucion || "",
          programaEstudio: response.programa_estudio || "",
          anioIngreso: anioIngresoFormateada || "",
          semestreActual: response.semestre_actual || "",
          turnoEstudio: response.turno_estudio || "",
          modalidadEstudio: response.modalidad_estudio || "",
          programaBeca: response.programa_beca || "",
          estadoBeca: response.estado_beca || "",
          tipoTarea: response.tipo_tarea || "",
          dependencia: response.dependencia || "",
          anexoCedula: response.anexoCedula || "",
          anexoConstancia: response.anexo_constancia || "",
          anexoResidencia: response.anexo_residencia || "",
          anexoFoto: response.anexoFoto || "",
          codigoestado: response.codigo_estado || "",
          codigomunicipio: response.codigo_municipio || "",
          codigoparroquia: response.codigo_parroquia || "",
          latitud: response.latitud || "",
          longitud: response.longitud || "",
          fechaNacimiento: fechaNacimientoFormateada || "",
          uner: response.uner,
          codigoestado2: response.codigoestado2 || "",
          nivel_academico: response.nivel_academico || "",
          estado: response.estado || "",
          municipio: response.municipio || "",
          parroquia: response.parroquia || "",
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

        if(response){
           if (response.codigo_estado) {
          try {
            const datos = await get_Uner(response.codigo_estado);
            setUner(datos);
            if (datos) {
              try {
                const todasLasCarreras = [];
                for (let index = 0; index < datos.length; index++) {
                  const element = datos[index];
                  const response2 = await get_carreras(element.codigo);
                  element.carreras = response2;
                  todasLasCarreras.push(...response2);
                }
                setcarrera(todasLasCarreras);
              } catch (error) {
                console.error("Error fetching carreras:", error);
                setcarrera([]);
              }
            }
          } catch (error) {
            console.error("Error fetching municipios:", error);
            setUner([]);
            setcarrera([]);
          }
        }

        }
       
      }
    } catch (error) {
      console.error("Error fetching municipios:", error);
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
        <h1>Formulario de Registro </h1>
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

              <div className="form-field">
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

              <div className="form-field">
                <label>
                  Territorio Comuna: Comuna, Consejo Comunal de su dirección
                </label>
                <input
                  type="text"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.comuna && touched.comuna && (
                  <div className="error-message">{errors.comuna}</div>
                )}
              </div>
              <div className="form-field full-width">
                <label>Dirección Exacta de Habitación</label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.direccion && touched.direccion && (
                  <div className="error-message">{errors.direccion}</div>
                )}
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
              <div className="form-field full-width">
                <label htmlFor="">Estado de la Universidad </label>

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





            <div className="form-grid">
              <div className="form-field full-width">
                <label>
                  Institución de Educación Universitaria de adscripción
                </label>
                <select
                  name="institucion"
                  value={formData.institucion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  {uner.map((u) => (
                    <option key={u.id} value={u.codigo}>
                      {u.nombre_uner}
                    </option>
                  ))}
                </select>
                {errors.institucion && touched.institucion && (
                  <div className="error-message">{errors.institucion}</div>
                )}
              </div>
              <div className="form-field">
                <label>Programa de Estudio (Carrera)</label>
                <select
                  name="programaEstudio"
                  value={formData.programaEstudio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  {carrera.map((u) => (
                    <option key={u.id} value={u.codigo}>
                      {u.carreras}
                    </option>
                  ))}
                </select>
                {errors.programaEstudio && touched.programaEstudio && (
                  <div className="error-message">{errors.programaEstudio}</div>
                )}
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
                <label>Tipo de nivel académico </label>
                <select
                  name="nivel_academico"
                  value={formData.nivel_academico}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="trimestres">trimestres</option>
                  <option value="semestre ">semestre </option>
                  <option value="año_cursando">año cursando</option>
             
                </select>
                {errors.nivel_academico && touched.nivel_academico && (
                  <div className="error-message">{errors.nivel_academico}</div>
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
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                   <option value="7">7</option>
                    <option value="8">8</option>
                      <option value="9">9</option>
                       <option value="10">10</option>
                        <option value="11">11</option>
                         <option value="12">12</option>
                </select>
                {errors.semestreActual && touched.semestreActual && (
                  <div className="error-message">{errors.semestreActual}</div>
                )}
              </div>
              <div className="form-field">
                <label>Turno de Estudio</label>
                <select
                  name="turnoEstudio"
                  value={formData.turnoEstudio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="diurno">Diurno</option>
                  <option value="nocturno">Nocturno</option>
                  <option value="mixto">Mixto</option>
                  <option value="mixto">VESPERTINO</option>
                </select>
                {errors.turnoEstudio && touched.turnoEstudio && (
                  <div className="error-message">{errors.turnoEstudio}</div>
                )}
              </div>
              <div className="form-field">
                <label>Modalidad de Estudio</label>
                <select
                  name="modalidadEstudio"
                  value={formData.modalidadEstudio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="presencial">Presencial</option>
                  <option value="a_distancia">A Distancia</option>
                </select>
                {errors.modalidadEstudio && touched.modalidadEstudio && (
                  <div className="error-message">{errors.modalidadEstudio}</div>
                )}
              </div>

          {/* <div className="form-field">
                <label>Constancia Semestre Actual Aprobado </label>
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
              </div> */}
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
              <div className="form-field">
                <label>Nombre del Programa de Becas</label>
                <select
                  name="programaBeca"
                  value={formData.programaBeca}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>Constancia Semestre Actual Aprobado

                  <option value="auto postulacion">Auto postulación</option>
                  <option value="circuitos comunales">
                    Circuitos Comunales
                  </option>
                  <option value="instituciones convenios">
                    Instituciones y Convenios
                  </option>
                  <option value="motores productivos">
                    Motores Productivos
                  </option>
                  <option value="universidad">Universidad</option>
                </select>
                {errors.programaBeca && touched.programaBeca && (
                  <div className="error-message">{errors.programaBeca}</div>
                )}
              </div>
              <div className="form-field">
                <label>Estado Actual de la Beca</label>
                <select
                  name="estadoBeca"
                  value={formData.estadoBeca}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="nuevo_becario">Nuevo ingreso</option>
                  <option value="actualizacion">Actualización</option>
                  <option value="culminada">Culminada</option>
                  <option value="suspendida">Suspendida</option>
                </select>
                {errors.estadoBeca && touched.estadoBeca && (
                  <div className="error-message">{errors.estadoBeca}</div>
                )}
              </div>
              <div className="form-field full-width">
                <label>Tipo de Tarea/Contraprestación que realiza</label>
                <select
                  name="tipoTarea"
                  value={formData.tipoTarea}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="apoyo academico">
                    Apoyo Académico (Preparadores)
                  </option>
                  <option value="apoyo investigacion">
                    Apoyo a la Investigación
                  </option>
                  <option value="apoyo administrativo">
                    Apoyo Administrativo
                  </option>
                  <option value="servicio comunitario">
                    Servicio Comunitario en Circuito Comunal
                  </option>
                  <option value="proyecto productivo">
                    Proyecto Productivo
                  </option>
                  <option value="otro">Otro</option>
                </select>
                {errors.tipoTarea && touched.tipoTarea && (
                  <div className="error-message">{errors.tipoTarea}</div>
                )}
              </div>
              <div className="form-field full-width">
                <label>Dependencia o Comunidad de Adscripción</label>
                <input
                  type="text"
                  name="dependencia"
                  value={formData.dependencia}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.dependencia && touched.dependencia && (
                  <div className="error-message">{errors.dependencia}</div>
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

              {/* <div className="form-field">
                <label>Contrato convenio</label>
                <div className="file-upload-container">
                  <input
                    disabled
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
              </div> */}
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

export default BecarioView;
