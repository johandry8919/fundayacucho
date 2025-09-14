import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import "../src/styles/App.css";

function App() {
  return (
    <>
      <div className="app ">
            <Outlet />
      </div>
     
    </>
  );
}

export default App;