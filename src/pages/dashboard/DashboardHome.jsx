import * as React from "react";
import {
  get_becarios,
  estado,
  get_municipios,
  get_parroquias,
  delete_becario
} from "../../services/api";
import * as XLSX from "xlsx";
import BecarioDetailsModal from "../../components/BecarioDetailsModal";
import ConfirmationModal from "../../components/ConfirmationModal";


export default function Dashboard() {
  const [becarios, setBecarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [initialLoadDone, setInitialLoadDone] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [estados, setEstados] = React.useState(null);
  const [municipios, setMunicipios] = React.useState(null);
  const [parroquias, setParroquias] = React.useState(null);
  const [selectedBecario, setSelectedBecario] = React.useState(null);
  const [becarioToDelete, setBecarioToDelete] = React.useState(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);


  console.log(becarios)


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

  const handleDelete = async () => {
    if (!becarioToDelete) return;

    try {
      await delete_becario(becarioToDelete.id);
      setBecarios(becarios.filter((b) => b.id !== becarioToDelete.id));
      setShowConfirmModal(false);
      setBecarioToDelete(null);
    } catch (err) {
      console.error("Error al eliminar becario:", err);
      setError("Error al eliminar el becario. Por favor, intente de nuevo.");
    }
  };

  const openConfirmModal = (becario) => {
    setBecarioToDelete(becario);
    setShowConfirmModal(true);
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
    <div className="container-fluid mt-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Consulta de Egresados Fundayacucho.</h2>
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
          <div className="row ">
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

            <div className="col-md-4 ">
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

        <div className="col-md-12 col-12 mt-4">
       <div className="table-responsive" style={{overflowX: "auto"}}>
         {error && <div className="alert alert-danger">{error}</div>}
  <table className="table table-striped table-bordered">
    <thead className="thead-dark">
      <tr>
        <th style={{width: "10%"}}>Acciones</th>
        <th style={{width: "10%"}}>Nombre</th>
        <th style={{width: "7%"}}>Cédula</th>
        <th style={{width: "8%"}}>Teléfono</th>
        <th style={{width: "8%"}}>Correo</th>
        <th style={{width: "10%"}}>Es militar</th>
        <th style={{width: "8%"}}>Tipo de beca</th>
        <th style={{width: "10%"}}>Universidad</th>
        <th style={{width: "10%"}}>Tipo de becario</th>
        <th style={{width: "10%"}}>Carrera cursada</th>
        <th style={{width: "7%"}}>Estado</th>
        <th style={{width: "7%"}}>Municipio</th>
        <th style={{width: "7%"}}>Parroquia</th>
        <th style={{width: "10%"}}>Dirección</th>
        
      </tr>
    </thead>
    <tbody>
      {becarios.length > 0 ? (
        becarios.map((becario) => (
          <tr key={becario.id}>
             <td className="d-flex"> 
              <button 
                className="btn btn-primary btn-sm me-1"
                onClick={() => setSelectedBecario(becario)}>
                Detalles
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => openConfirmModal(becario)}>
                Eliminar
              </button>
            </td>
            <td className="text-truncate" title={becario.nombre_completo}>{becario.nombre_completo}</td>
            <td>{becario.cedula}</td>
            <td>{becario.telefono_celular}</td>
            <td className="text-truncate" title={becario.correo}>{becario.correo}</td>
            <td>{becario.es_militar}</td>
            <td>{becario.tipo_beca}</td>
            <td className="text-truncate" title={becario.universidad}>{becario.universidad}</td>
            <td>{becario.becario_tipo}</td>
            <td className="text-truncate" title={becario.carrera_cursada}>{becario.carrera_cursada}</td>
            <td>{becario.estado}</td>
            <td>{becario.municipio}</td>
            <td>{becario.parroquia}</td>
            <td className="text-truncate" title={becario.direccion}>{becario.direccion}</td>
           
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="14" className="text-center">
            {!loading && "No se encontraron becarios"}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
            </div>
          </div>




        </div>
      </div>

      {loading && <div className="text-center my-4">Cargando becarios...</div>}
     

      {selectedBecario && (
        <BecarioDetailsModal 
          becario={selectedBecario} 
          onClose={() => setSelectedBecario(null)} 
        />
      )}

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Está seguro de que desea eliminar a ${becarioToDelete?.nombre_completo}?`}
      />
    </div>
  );
}