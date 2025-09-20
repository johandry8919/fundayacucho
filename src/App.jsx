import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  return (
    <div className="app-layout ">
      
      <main className="main-content">
        <Header />
        <div className="container ">
          <Outlet />
        </div>
        <Footer />
      </main>
      
    </div>
  );
}

export default App;