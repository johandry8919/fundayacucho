//import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import About from './pages/About';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import Admin from './pages/Admin';
import HomeAdministrador from './pages/dashboard/Dashboard';
import Reporte from './pages/dashboard/Reporte';
import Mapa from './pages/dashboard/Mapa';
import Consultas from './pages/dashboard/Consultas';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProtectedRoute from './components/ProtectedRoute';
import Mapa_internacional from './pages/dashboard/Mapa_internacional';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Welcome from './pages/Welcome'; // Import Welcome
import UserDashboard from './pages/dashboard/UserDashboard'; // Import UserDashboard
import BecarioRouteHandler from './components/BecarioRouteHandler'; // Import BecarioRouteHandler
import { createHashRouter } from 'react-router-dom';


const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Welcome />, // Welcome page at root
      },
      {
        path: "home",
        element: <ProtectedRoute><Home /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <UserDashboard />,
          },
          {
            path: "becario",
            element: <BecarioRouteHandler />,
          },
        ],
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "registro",
        element: <Registro />,
      }
    ],
  },

  
  {
    path: "/admin/dashboard",
    element: <ProtectedRoute><HomeAdministrador /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <DashboardHome />
      },
      {
        path: "reporte",
        element: <Reporte />,
      },
      {
        path: "mapa",
        element: <Mapa />,
      },
      {
        path: "consultas",
        element: <Consultas />
      },
      {
        path: "mapa_internacional",
        element: <Mapa_internacional />
      },

    
    ]
  },
]);

export default router;