import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  useMediaQuery,
  useTheme,
  styled,
  alpha,
  Avatar,
  Menu,
  MenuItem,
  ListItemAvatar
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 260;

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      marginLeft: 0,
    },
  }),
);

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
    navigate('/Admin');
  };

  // Cerrar menú al cambiar de vista en móviles
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location, isMobile]);

  // Ajustar el drawer cuando cambia el tamaño de la pantalla
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.grey[100] }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            FundaYacucho
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Configuración">
              <IconButton
                size="large"
                aria-label="configuración"
                color="inherit"
                onClick={handleMenu}
                sx={{ p: 1 }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
      >
        <DrawerHeader sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          minHeight: '64px !important',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 32,
                height: 32,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              FY
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              FundaYacucho
            </Typography>
          </Box>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        
        <Box sx={{ 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          py: 1
        }}>
          <List sx={{ flexGrow: 1 }}>
            <ListItemButton 
              component={Link} 
              to="."
              selected={location.pathname.endsWith('/dashboard') || location.pathname.endsWith('/dashboard/')}
              sx={{
                borderRadius: 2,
                mx: 1.5,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  fontWeight: 500,
                  variant: 'body2',
                }}
              />
            </ListItemButton>

            <ListItemButton 
              component={Link} 
              to="reporte"
              selected={location.pathname.includes('reporte')}
              sx={{
                borderRadius: 2,
                mx: 1.5,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Reportes" 
                primaryTypographyProps={{
                  fontWeight: 500,
                  variant: 'body2',
                }}
              />
            </ListItemButton>

            <ListItemButton 
              component={Link} 
              to="mapa"
              selected={location.pathname.includes('mapa') && !location.pathname.includes('internacional')}
              sx={{
                borderRadius: 2,
                mx: 1.5,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <MapIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Mapa Nacional" 
                primaryTypographyProps={{
                  fontWeight: 500,
                  variant: 'body2',
                }}
              />
            </ListItemButton>

            <ListItemButton 
              component={Link} 
              to="mapa_internacional"
              selected={location.pathname.includes('internacional')}
              sx={{
                borderRadius: 2,
                mx: 1.5,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <MapIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Mapa Internacional" 
                primaryTypographyProps={{
                  fontWeight: 500,
                  variant: 'body2',
                }}
              />
            </ListItemButton>
          </List>

          {/* User Profile Section */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  mr: 2
                }}
              >
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.nombre || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.rol || 'Administrador'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                py: 0.8,
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Main open={open}>
        <Toolbar />
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 100px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default Dashboard;

