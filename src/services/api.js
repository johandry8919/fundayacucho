import { Password } from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "https://backend-becarios.fundayacucho.gob.ve/api";
//const API_BASE_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    let errorObj = {
      status: null,
      message: "Error desconocido",
      originalError: error,
    };

    if (error.response) {
      // Error de servidor (4xx, 5xx)
      errorObj = {
        status: error.response.status,
        message: error.response.data?.message || "Error en la solicitud",
        data: error.response.data,
      };
      console.error("Error de API:", errorObj);
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      errorObj.message = "No se pudo conectar con el servidor";
      console.error("No hubo respuesta del servidor");
    } else {
      // Error al configurar la solicitud
      errorObj.message = `Error al configurar la solicitud: ${error.message}`;
      console.error("Error al configurar la solicitud:", error.message);
    }

    return Promise.reject(errorObj);
  }
);

export const searchUser = async (nacionalidad, cedula) => {
  const response = await api.get("/cedula", {
    params: { nacionalidad, cedula },
  });
  return response.data;
};

export const estado = async () => {
  const response = await api.get("/std/estado");
  return response.data;
};

export const get_municipios = async (codigomunicipio) => {
  const response = await api.get("/std/municipio", {
    params: { codigomunicipio },
  });
  return response.data;
};

export const get_parroquias = async (codigomunicipio) => {
  const response = await api.get("/std/parroquia", {
    params: { codigomunicipio },
  });
  return response.data;
};

export const get_egresado = async (id) => {
  const response = await api.get("/egresado/get_egresado", {
    params: { id },
  });
  return response.data;
};

export const get_becario = async (id) => {
  const response = await api.get("/becarios/get_becario", {
    params: { id },
  });
  return response.data;
};

export const get_becarios = async (
  estado = "",
  municipio = "",
  parroquia = ""
) => {
  const response = await api.get("becarios/becarios", {
    params: { estado, municipio, parroquia },
  });
  return response.data;
};

export const submitForm = async (formData) => {
  const response = await api.post("/egresado/register", formData);

  if (response.data.status == 500) {
    return response.data;
  } else return response.data;
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Error en la función login:", error);
    return {
      success: false,
      message: error.message || "Credenciales inválidas",
    };
  }
};

export const delete_becario = async (id) => {
  const response = await api.delete(`/becarios/${id}`);
  return response.data;
};

export const registro_usuario = async (
  cedula,
  nacionalidad,
  email,
  tipo_usuario,
  password,
  id_rol,
) => {
  const response = await api.post("/auth/register", {
    cedula,
    nacionalidad,
    email,
    tipo_usuario,
    password,
    id_rol
  });
  return response.data;
};

export const saveBecario = async (formData) => {
  const response = await api.post("/becarios/registro", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const get_Uner = async (estado = "") => {
  const response = await api.get("becarios/uner", {
    params: { estado },
  });
  return response.data;
};

export const get_carreras = async (codigo = "") => {
  const response = await api.get("becarios/carreras", {
    params: { codigo },
  });
  return response.data;
};

export const get_anexo_cedula = async (cedula) => {
  const response = await api.get("/becarios/anexo_cedula", {
    params: { cedula },
  });
  return response.data;
};

export const recuperar_clave = async (email) => {
  const response = await api.post("/auth/recuperar_clave", { email });
  return response.data;
};