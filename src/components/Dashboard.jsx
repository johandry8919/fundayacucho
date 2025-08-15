import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Material UI
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = () => setOpen(!open);

  const handleLogout = () => {
    logout();
    navigate('/Admin');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          {/* empuja el resto a la derecha */}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Panel de Administración
          </Typography>

          {/* Botón Cerrar Sesión en AppBar */}
          <Tooltip title="Cerrar sesión">
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ textTransform: 'none' }}
            >
              Cerrar sesión
            </Button>
          </Tooltip>
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
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List sx={{ flexGrow: 1 }}>
            <ListItemButton component={Link} to=".">
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            <ListItemButton component={Link} to="reporte">
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Reportes" />
            </ListItemButton>

            <ListItemButton component={Link} to="mapa">
              <ListItemIcon><MapIcon /></ListItemIcon>
              <ListItemText primary="Mapa" />
            </ListItemButton>

            <ListItemButton component={Link} to="consultas">
              <ListItemIcon><SearchIcon /></ListItemIcon>
              <ListItemText primary="Consultas" />
            </ListItemButton>
          </List>

          <Divider />

          {/* Botón Cerrar Sesión en Drawer (opcional) */}
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              fullWidth
            >
              Cerrar sesión
            </Button>
          </Box>
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
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;

