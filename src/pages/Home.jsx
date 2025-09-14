// pages/Home.jsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, CssBaseline, Button, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const drawerWidth = 240;

function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = () => setOpen(!open);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Panel de Usuario
          </Typography>
          <Tooltip title="Cerrar sesión">
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Cerrar sesión
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>
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
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton component={Link} to=".">
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
           
            <ListItemButton component={Link} to="/home/becario">
              <ListItemIcon><AccountBoxIcon /></ListItemIcon>
              <ListItemText primary="Formulario de Registro" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Home;