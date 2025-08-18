
import * as React from "react";
import "../../src/styles/modal.css";

export default function BecarioDetailsModal({ becario, onClose }) {
  if (!becario) {
    return null;
  }

  return (
    <div className="modal fade show d-block mt-5" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles del Becario</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Nombre Completo:</strong> {becario.nombre_completo}</p>
                <p><strong>Cédula:</strong> {becario.cedula}</p>
                <p><strong>Teléfono:</strong> {becario.telefono_celular}</p>
                <p><strong>Correo:</strong> {becario.correo}</p>
                <p><strong>Es Militar:</strong> {becario.es_militar}</p>
                <p><strong>Tipo de Beca:</strong> {becario.tipo_beca}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Universidad:</strong> {becario.universidad}</p>
                <p><strong>Tipo de Becario:</strong> {becario.becario_tipo}</p>
                <p><strong>Carrera:</strong> {becario.carrera_cursada}</p>
                <p><strong>Estado:</strong> {becario.estado}</p>
                <p><strong>Municipio:</strong> {becario.municipio}</p>
                <p><strong>Parroquia:</strong> {becario.parroquia}</p>
              </div>
            </div>
            <p><strong>Dirección:</strong> {becario.direccion}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
