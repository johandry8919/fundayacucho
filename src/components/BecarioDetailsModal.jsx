
import * as React from "react";
import { X } from 'react-bootstrap-icons';
import "../../src/styles/modal.css";

export default function BecarioDetailsModal({ becario, onClose }) {
  if (!becario) {
    return null;
  }

  // Función para formatear el valor booleano
  const formatBoolean = (value) => {
    if (value === true || value === 'true' || value === 'Sí') return 'Sí';
    if (value === false || value === 'false' || value === 'No') return 'No';
    return value || 'No especificado';
  };

  // Función para formatear texto (primera letra mayúscula)
  const formatText = (text) => {
    if (!text) return 'No especificado';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Detalles del Becario</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="info-section">
            <h3>Información Personal</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre Completo:</span>
                <span className="info-value">{formatText(becario.nombre_completo)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cédula:</span>
                <span className="info-value">{becario.cedula || 'No especificado'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Teléfono:</span>
                <span className="info-value">{becario.telefono_celular || 'No especificado'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Correo:</span>
                <span className="info-value">
                  {becario.correo ? (
                    <a href={`mailto:${becario.correo}`} className="email-link">
                      {becario.correo}
                    </a>
                  ) : 'No especificado'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Es Militar:</span>
                <span className="info-value">{formatBoolean(becario.es_militar)}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Información Académica</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Tipo de Beca:</span>
                <span className="info-value">{formatText(becario.tipo_beca)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Universidad:</span>
                <span className="info-value">{formatText(becario.universidad)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Carrera:</span>
                <span className="info-value">{formatText(becario.carrera_cursada)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo de Becario:</span>
                <span className="info-value">{formatText(becario.becario_tipo)}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Ubicación</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Estado:</span>
                <span className="info-value">{formatText(becario.estado)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Municipio:</span>
                <span className="info-value">{formatText(becario.municipio)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Parroquia:</span>
                <span className="info-value">{formatText(becario.parroquia)}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Dirección:</span>
                <span className="info-value">{formatText(becario.direccion)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
