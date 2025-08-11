// pages/Home.jsx
import { useState } from "react";
import SearchForm from "../components/SearchForm";
import DataModal from "../components/DataModal";
import { searchUser, submitForm } from "../services/api";
import "../../src/styles/App.css";
import Swal from "sweetalert2";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [nacio ,  setNacionalida] = useState('')
   const [cedula ,  setCedula] = useState('')

  const handleSearch = async (nationality, idNumber) => {

      
    setNacionalida(nationality)
    setCedula(idNumber)
    setLoading(true);
    setError(null);
    try {
      const response = await searchUser(nationality, idNumber);
      setUserData(response.data);
      setShowModal(true);
    } catch (err) {
      setError(
        err.message ||
          "Error al buscar los datos. Por favor intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      let data = await submitForm(formData);
      setShowModal(false);
      if (data.status == 500) {
        Swal.fire({
          title: "La cédula ya se encuentra Registrada",
          icon: "error",
          draggable: true,
        });
      } else {
        Swal.fire({
          title: "¡Registrado con éxito!",
          icon: "success",
          draggable: true,
        });
      }
    } catch (err) {
      setError(err.message || "Error al enviar el formulario.");
    } finally {
      setLoading(false);
    }
  };

  let codigoEstado = 0;

  if (userData) codigoEstado = userData.cod_estado;
  else codigoEstado;

  return (
    <>
      <div className="home">
        <div className="card">
          <div className="card-title">
            <div className="text-center titulo">
            
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card-body">
            <SearchForm onSearch={handleSearch} loading={loading} />

            <DataModal
              show={showModal}
              onHide={() => setShowModal(false)}
              initialData={userData}
              onSubmit={handleSubmit}
              loading={loading}
              cedulax={cedula}
             nacio={nacio}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;