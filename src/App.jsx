import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="app-layout">
      {!isLoginPage && <Header />}
      <main className={`main-content ${isLoginPage ? 'login-page' : ''}`}>
        <div className={isLoginPage ? '' : 'container-fluid'}>
          <Outlet />
        </div>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;