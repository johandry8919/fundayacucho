// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

// Icons (you can replace these with your own icon components or SVGs)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

const AccountBoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close sidebar when clicking on a link in mobile view
  const handleNavigation = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Check if current route matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <button className="menu-button" onClick={toggleSidebar} aria-label="Toggle menu">
          <MenuIcon />
        </button>
        <h1 className="header-title text-white"></h1>
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">
            <LogoutIcon />
          </span>
          Cerrar sesión
        </button>
      </header>

      {/* Sidebar */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-list">
          <li>
            <Link 
              to="." 
              className={`sidebar-link ${isActive('/home') ? 'active' : ''}`}
              onClick={handleNavigation}
            >
              <span className="sidebar-icon">
                <DashboardIcon />
              </span>
              Inicio
            </Link>
          </li>
          <li>
            <Link 
              to="/home/becario" 
              className={`sidebar-link ${isActive('/home/becario') ? 'active' : ''}`}
              onClick={handleNavigation}
            >
              <span className="sidebar-icon">
                <AccountBoxIcon />
              </span>
              Formulario de Registro
            </Link>
          </li>
        </ul>
      </nav>

      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="overlay visible" 
          onClick={toggleSidebar}
          role="button"
          tabIndex="0"
          aria-label="Close menu"
          onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
        />
      )}

      {/* Main content */}
      <main className={`main-content  ${!isMobile && isSidebarOpen ? 'shifted' : ''}`}>
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Home;