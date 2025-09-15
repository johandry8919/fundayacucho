import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './context/AuthContext';

// Import global styles first
import './styles/App.css';
import './styles/main.css';
import './index.css';

// Clear any existing styles that might be causing conflicts
const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
styleTags.forEach(tag => {
  if (tag.href && !tag.href.includes('App.css') && 
      !tag.href.includes('main.css') && 
      !tag.href.includes('index.css')) {
    tag.remove();
  }
});

// Ensure body has proper styling
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    color: var(--text-color);
    background-color: var(--background-color);
  }
  
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;
document.head.appendChild(style);

// Initialize the app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);