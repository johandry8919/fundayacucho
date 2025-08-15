import * as React from 'react';
import {
  Toolbar,
  Typography,
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
import { Link, Outlet} from 'react-router-dom';

const drawerWidth = 240;

export default function Dashboard() {


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Drawer lateral */}
    

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
  );
}
