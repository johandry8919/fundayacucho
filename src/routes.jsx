
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import About from './pages/About';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import Admin from './pages/Admin';
import HomeAdministrador from './pages/HomeAdministrador';
import Reporte from './pages/dashboard/Reporte';
import Mapa from './pages/dashboard/Mapa';
import Consultas from './pages/dashboard/Consultas';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },

     
    ],
  },
  {
    path: "/admin",
    element: <Admin/>,
    children: []
  },
  {
    path: "/homeadministrador",
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
        element: <Consultas />,
      },
    ]
  },
]);

export default router;

