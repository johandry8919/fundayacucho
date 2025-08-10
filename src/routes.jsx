import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import About from './pages/About';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import Admin from './pages/Admin';

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

      {
        path: "Admin",
        element: <Admin />,
      },
    ],
  },
]);

export default router;
