// App.jsx
import { useState } from 'react';
import SearchForm from './components/SearchForm';
import DataModal from './components/DataModal';
import Footer from './components/Footer';
import { searchUser, submitForm } from './services/api';
import '../src/styles/App.css';
import Header from './components/Header';



function App() {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (nationality, idNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchUser(nationality, idNumber);
      setUserData(response.data);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Error al buscar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      await submitForm(formData);
      setShowModal(false);
      // Puedes mostrar un mensaje de éxito aquí
      alert('¡Formulario enviado con éxito!');
    } catch (err) {
      setError(err.message || 'Error al enviar el formulario.');
    } finally {
      setLoading(false);
    }
  };

  let codigoEstado = 0;

  if(userData) codigoEstado = userData.cod_estado ; else codigoEstado




  return (
   <>

    <Header/>

   <div className='sesion'>
     <div className="card app">

    

         <div className='card-header'>
          <h1 className="mb-4">Sistema de Registro de Becarios</h1>
         </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
     <div className='card-body'>
       <SearchForm 
        onSearch={handleSearch} 
        loading={loading}
      />


       <DataModal
        show={showModal}
        onHide={() => setShowModal(false)}
        initialData={userData}
        onSubmit={handleSubmit}
        loading={loading}
        idEstadoFiltro={codigoEstado}
      />
     </div>
      
     

     
     
    </div>
     <Footer/>
   </div>
   </>
  );
}

export default App;