import * as L from 'leaflet';

// Coordenadas por defecto (Madrid) por si el GPS está denegado en el navegador
export const DEFAULT_MAP_COORDS = { latitude: 40.4168, longitude: -3.7038 };

// Círculo ubicación usuario
export const USER_MARKER_STYLE: L.CircleMarkerOptions = {
  radius: 8,
  fillColor: '#007bff',
  color: '#ffffff',
  weight: 2,
  opacity: 1,
  fillOpacity: 0.8
};

// icono chincheta en SVG (para que no falle la ruta ni pierda calidad)
export const DESTINATION_PIN_ICON = L.divIcon({
  className: 'custom-pin-wrapper',
  // SVG de un pin típico de mapa en rojo oscuro
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a00430" width="36px" height="36px">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
         </svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36], // Anclamos la punta exacta del pin al centro de la coordenada
  popupAnchor: [0, -36] // Hacemos que el mensajito salga justo por encima del pin
});