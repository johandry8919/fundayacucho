import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  return (
    <div className="app-layout ">
      <Header />
      <main className="main-content">
        <div className="container ">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;