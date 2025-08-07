import { useState } from 'react';

const COUNTRIES = [
  { value: 'V', label: 'Venezolano' },
  { value: 'E', label: 'Extranjero' },
];

function SearchForm({ onSearch, loading }) {
  const [nationality, setNationality] = useState('');
  const [idNumber, setIdNumber] = useState('');
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
      className={`row g-1 needs-validation ${validated ? 'was-validated' : ''}  `}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Nacionalidad */}
      <div className="col-12">
        <label htmlFor="nationality" className="form-label">
          Nacionalidad
        </label>
        <select
          className={`form-select ${validated && !nationality ? 'is-invalid' : ''}`}
          id="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          required
        >
          <option value="">Seleccione una nacionalidad</option>
          {COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">
          Por favor seleccione una nacionalidad
        </div>
      </div>

      {/* Cédula */}
      <div className="col-12">
        <label htmlFor="idNumber" className="form-label">
          Cédula
        </label>
        <input
          type="text"
          className={`form-control ${validated && !idNumber ? 'is-invalid' : ''}`}
          id="idNumber"
          placeholder="Ingrese su número de identificación"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
        />
        <div className="invalid-feedback">
          Por favor ingrese su número de identificación
        </div>
      </div>

      {/* Botón de búsqueda */}
      <div className="col-12 ">
        <button
          className="btn btn-primary w-100"
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
            'Buscar'
          )}
        </button>
      </div>
    </form>
  );
}

export default SearchForm;