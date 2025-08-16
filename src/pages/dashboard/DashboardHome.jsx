import * as React from "react";
import {
  get_becarios,
  estado,
  get_municipios,
  get_parroquias,
} from "../../services/api";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const [becarios, setBecarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [initialLoadDone, setInitialLoadDone] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [estados, setEstados] = React.useState(null);
  const [municipios, setMunicipios] = React.useState(null);
  const [parroquias, setParroquias] = React.useState(null);

  const [filters, setFilters] = React.useState({
    codigoestado: "",
    codigomunicipio: "",
    codigoparroquia: "",
  });

  const exportToExcel = () => {
    if (becarios.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const dataToExport = becarios.map((becario) => ({
      ID: becario.id,
      "Nombre Completo": becario.nombre_completo,
      Cédula: becario.cedula,
      Carrera: becario.carrera_cursada,
      Estado: becario.estado,
      Municipio: becario.municipio,
      Parroquia: becario.parroquia,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Becarios");

    XLSX.writeFile(
      wb,
      `becarios_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  React.useEffect(() => {
    const cargarEstados = async () => {
      try {
        const data = await estado();
        setEstados(data);
      } catch (err) {
        console.error("Error al cargar estados:", err);
        setEstados(null);
      }
    };
    cargarEstados();
  }, []);

  React.useEffect(() => {
    if (initialLoadDone) return;

    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const response = await get_becarios();

        if (response.success) {
          setBecarios(response.data || []);
          setError(null);
        } else {
          throw new Error(response.message || "Error al cargar becarios");
        }

        setInitialLoadDone(true);
      } catch (err) {
        console.error("Error al cargar becarios:", err);
        setError(err.message || "Error al cargar los datos");
        setBecarios([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, [initialLoadDone]);

  const cargarMunicipios = async (codigoestado) => {
    try {
      setMunicipios(null);
      const response = await get_municipios(codigoestado);
      setMunicipios(response.data);
    } catch (err) {
      console.error("Error al obtener municipios:", err);
      setMunicipios(null);
    }
  };

  const cargarParroquias = async (codigomunicipio) => {
    try {
      setParroquias(null);
      const data = await get_parroquias(codigomunicipio);
      setParroquias(data);
    } catch (err) {
      console.error("Error al obtener parroquias:", err);
      setParroquias(null);
    }
  };

  const cargarBecariosFiltrados = async () => {
    try {
      setLoading(true);
      const response = await get_becarios(
        filters.codigoestado || undefined,
        filters.codigomunicipio || undefined,
        filters.codigoparroquia || undefined
      );

      if (response?.success) {
        setBecarios(response.data || []);
        setError(null);
      } else {
        throw new Error(
          response?.message || "Error al cargar becarios filtrados"
        );
      }
    } catch (err) {
      console.error("Error al cargar becarios filtrados:", err);
      setError(err.message || "Error al cargar los datos filtrados");
      setBecarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,

        ...(name === "codigoestado" && {
          codigomunicipio: "",
          codigoparroquia: "",
        }),
        ...(name === "codigomunicipio" && {
          codigoparroquia: "",
        }),
      };

      return newFilters;
    });

    if (name === "codigoestado") {
      if (value) {
        cargarMunicipios(value);
      } else {
        setMunicipios(null);
      }
    }

    if (name === "codigomunicipio" && value) {
      cargarParroquias(value);
    }
  };

  React.useEffect(() => {
    if (
      filters.codigoestado ||
      filters.codigomunicipio ||
      filters.codigoparroquia
    ) {
      cargarBecariosFiltrados();
    } else if (initialLoadDone) {
      return;
    }
  }, [filters]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Consulta de Becarios</h2>
        <button
          onClick={exportToExcel}
          className="btn btn-success"
          disabled={becarios.length === 0 || loading}
        >
          <i className="bi bi-file-excel me-2"></i>Exportar a Excel
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
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
                  value={filters.codigoestado}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {estados?.data?.map((stad) => (
                    <option key={stad.codigoestado} value={stad.codigoestado}>
                      {stad.nombre}
                    </option>
                  ))}
                </select>
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
                  value={filters.codigomunicipio}
                  onChange={handleChange}
                  disabled={!filters.codigoestado}
                >
                  <option value="">Seleccione...</option>
                  {!municipios ? (
                    <option value="" disabled>
                      Cargando municipios...
                    </option>
                  ) : municipios.length > 0 ? (
                    municipios.map((muni) => (
                      <option
                        key={muni.codigomunicipio}
                        value={muni.codigomunicipio}
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
            </div>

            <div className="col-md-4">
              <label htmlFor="parroquia" className="form-label">
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
                  value={filters.codigoparroquia}
                  onChange={handleChange}
                  disabled={!filters.codigomunicipio}
                >
                  <option value="">Seleccione...</option>
                  {!parroquias ? (
                    <option value="" disabled>
                      Cargando parroquias...
                    </option>
                  ) : parroquias.data?.length > 0 ? (
                    parroquias.data.map((parr) => (
                      <option
                        key={parr.codigoparroquia}
                        value={parr.codigoparroquia}
                      >
                        {parr.nombre}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No hay parroquias disponibles
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center my-4">Cargando becarios...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Carrera</th>
              <th>Estado</th>
              <th>Municipio</th>
              <th>Parroquia</th>
            </tr>
          </thead>
          <tbody>
            {becarios.length > 0 ? (
              becarios.map((becario) => (
                <tr key={becario.id}>
                  <td>{becario.nombre_completo}</td>
                  <td>{becario.cedula}</td>
                  <td>{becario.carrera_cursada}</td>
                  <td>{becario.estado}</td>
                  <td>{becario.municipio}</td>
                  <td>{becario.parroquia}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  {!loading && "No se encontraron becarios"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
