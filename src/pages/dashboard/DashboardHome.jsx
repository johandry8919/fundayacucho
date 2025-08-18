import * as React from 'react';
import {
<<<<<<< HEAD
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export default function Dashboard() {
  const [open, setOpen] = React.useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
=======
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

>>>>>>> origin/main

  const toggleDrawer = () => {
    setOpen(!open);
  };

const handleLogout = () => {
    logout();
    navigate('/Admin');
  };
<<<<<<< HEAD
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="menu"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Dashboard MUI
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          },
        }}      >
        <Box>
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {[
                { text: 'Inicio', icon: <HomeIcon />, path: '.' },
                { text: 'Mapas', icon: <BarChartIcon />, path: 'mapa' },
                { text: 'Reportes', icon: <BarChartIcon />, path: 'reporte' },
                { text: 'Consultas', icon: <SettingsIcon />, path: 'consultas' },
              ].map((item, index) => (
                <ListItem button
                 key={index}
                 component={Link}
                 to={item.path}

                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
=======
>>>>>>> origin/main

        {/* Botón de cerrar sesión abajo */}
        <Box>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: 'margin 0.3s',
        }}
      >
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Bienvenido al Dashboard
        </Typography>

<<<<<<< HEAD
        {/* Grid de tarjetas */}
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tarjeta {item}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Esta es una tarjeta de ejemplo dentro del dashboard.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Ver más</Button>
                  <Button size="small" variant="contained" color="primary">
                    Acción
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
=======
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
>>>>>>> origin/main
  );
}