import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

const COUNTRIES = [
  { value: "V", label: "Venezolano" },
  { value: "E", label: "Extranjero" },
];

function SearchForm({ onSearch, loading }) {
  const [nationality, setNationality] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [validated, setValidated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    onSearch(nationality, idNumber);
  };

  return (
    <form
      className={`needs-validation ${validated ? "was-validated" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-globe"></i>
          </span>
          <select
            className={`form-select ${
              validated && !nationality ? "is-invalid" : ""
            }`}
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            required
          >
            <option value="">Nacionalidad</option>
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">
            Por favor seleccione una nacionalidad.
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-person-vcard"></i>
          </span>
          <input
            type="text"
            className={`form-control ${
              validated && !idNumber ? "is-invalid" : ""
            }`}
            id="idNumber"
            placeholder="Número de Cédula o Pasaporte"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
            onKeyPress={(e) => {
              if (!/[0-9-]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                e.preventDefault();
              }
            }}
             style={{ 
              MozAppearance: 'textfield',
              WebkitAppearance: 'none',
              margin: 0
            }}
          />
          <div className="invalid-feedback">
            Por favor ingrese su número de identificación.
          </div>
        </div>
      </div>

      <div className="d-grid">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span className="ms-2">Buscando...</span>
            </>
          ) : (
            <>
              <i className="bi bi-search me-2"></i>
              Buscar
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
