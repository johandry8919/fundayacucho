import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import "../src/styles/App.css";

function App() {
  return (
    <>
      <Header />
      <div className="sesion p-2">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export default App;