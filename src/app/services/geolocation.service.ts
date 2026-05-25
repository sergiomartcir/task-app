import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Coordinates } from '../interfaces/coordinates.interface';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  // obtiene las coordenadas GPS actuales del dispositivo
  public async getCurrentLocation(): Promise<Coordinates | null> {
    let finalLocation: Coordinates | null = null;

    try {
      let hasPermission = false;
      // Verificamos y solicitamos permisos de localización al sistema operativo
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location === 'granted') {
        hasPermission = true;
      
      } else {
        const requestStatus = await Geolocation.requestPermissions();
        
        if (requestStatus.location === 'granted') {
          hasPermission = true;
        } else {
          console.warn('Permisos de geolocalización denegados por el usuario.');
        }
      }

      // Si obtuvimos permiso, pedimos las coordenadas
      if (hasPermission) {
        const position: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });

        finalLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      }

    } catch (error) {
      console.error('Error al obtener la localización del dispositivo:', error);
    }

    return finalLocation;
  }
  
}