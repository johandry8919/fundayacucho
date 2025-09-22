import React from 'react';
import { Marker, Popup } from 'react-leaflet';

const BecarioMarker = ({ latitud, longitud, markerRef, markerEventHandlers }) => {
  if (!latitud || !longitud) return null;
  return (
    <Marker
      draggable={true}
      eventHandlers={markerEventHandlers}
      position={[parseFloat(latitud), parseFloat(longitud)]}
      ref={markerRef}
    >
      <Popup closeButton={false}>
        <div style={{ textAlign: 'center' }}>
          <p>Ubicación seleccionada</p>
          <small>Arrastra para ajustar</small>
        </div>
      </Popup>
    </Marker>
  );
};

export default BecarioMarker;
