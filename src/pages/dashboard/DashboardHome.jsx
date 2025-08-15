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
} from '@mui/material';



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

        <Typography variant="h4" gutterBottom>
          Bienvenido al Dashboard
        </Typography>

      
      </Box>
    </Box>
  );
}
