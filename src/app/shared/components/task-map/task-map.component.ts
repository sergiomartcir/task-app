import { Component, AfterViewInit, inject, signal, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { Geocoder, geocoders } from 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { Coordinates } from 'src/app/interfaces/coordinates.interface';
import { TaskLocation } from 'src/app/interfaces/task-location.interface';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { addIcons } from 'ionicons';
import { mapOutline, locationOutline, trashOutline } from 'ionicons/icons';

import { DEFAULT_MAP_COORDS, USER_MARKER_STYLE, DESTINATION_PIN_ICON } from '../../config/map.constants';

@Component({
  selector: 'app-task-map',
  templateUrl: './task-map.component.html',
  styleUrls: ['./task-map.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class TaskMapComponent implements AfterViewInit, OnChanges {
  private geolocationService = inject(GeolocationService);
  
  private map!: L.Map;
  // Variable para guardar el marcador que crea el usuario y poder moverlo
  private customMarker: L.Marker | null = null;
  // guarda la ruta altual por si se borrara
  private routingControl: L.Routing.Control | null = null;

  // Entrada de datos (desde el task-detail)
  @Input() savedLocation: TaskLocation | undefined = undefined;
  @Input() isVisible: boolean = false;  // el task-detail nos dirá si el mapa es visible o no

  // salida de datos (hacia el task-detail)
  @Output() locationSelect = new EventEmitter<TaskLocation>();
  @Output() toggleVisibility = new EventEmitter<void>(); // Emitimos para abrir/cerrar
  @Output() clearLocation = new EventEmitter<void>(); // Emitimos para borrar

  // Guardamos la posición en una señal por si en el futuro la necesitamos
  public userCoords = signal<Coordinates | null>(null);

  constructor() {
    addIcons({ 
      mapOutline, 
      locationOutline,
      trashOutline
    });
  }

  async ngAfterViewInit(): Promise<void> {
    // Obtenemos la localización real del dispositivo mediante el servicio
    const coords = await this.geolocationService.getCurrentLocation();

    // Si no conseguimos ubicación (ej: sin permisos en PC), ponemos Madrid por defecto para que no se bloquee.
    const finalCoords = coords || DEFAULT_MAP_COORDS;

    this.userCoords.set(finalCoords);
    this.initializeMap(finalCoords);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleMapResize(changes);
    this.handleLocationRemoval(changes);
  }

  // Se encarga de redimensionar el tamaño del mapa
  private handleMapResize(changes: SimpleChanges): void {
    const visibilityChanged = changes['isVisible'] && this.isVisible;
    const locationLoaded = changes['savedLocation'] && this.savedLocation;

    if ((visibilityChanged || locationLoaded) && this.map) {
      // Damos 100ms para que Angular le quite el display:none antes de repintar Leaflet
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }


  // Elimina la ubicación que haya en el mapa
  private handleLocationRemoval(changes: SimpleChanges): void {
    // si se elimina la ubicación, se elimina la "chincheta" del mapa y su ruta óptima
    if (changes['savedLocation'] && !changes['savedLocation'].currentValue) {
      if (this.customMarker) {
        this.customMarker.remove(); // Borramos el dibujo de la chincheta del lienzo de Leaflet
        this.customMarker = null;   // Reseteamos nuestra variable
      }

      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
        this.routingControl = null;
      }
    }
  }

  private initializeMap(coords: Coordinates): void {
    const userPosition: L.LatLngExpression = [coords.latitude, coords.longitude];

    // Determinamos el centro inicial del mapa (si ya hay ubicación guardada, centramos a medio camino o en el destino)
    const initialCenter: L.LatLngExpression = this.savedLocation 
      ? [this.savedLocation.latitude, this.savedLocation.longitude]
      : userPosition;

    // Inicializamos el mapa centrado en el usuario con un zoom de 15
    this.map = L.map('task-map-canvas').setView(initialCenter, 15);

    // cargamos la capa de mapas gratuita de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Dibujamos el marcador del usuario
    L.circleMarker(userPosition, USER_MARKER_STYLE)
      .addTo(this.map)
      .bindPopup('<b>Tu ubicación actual</b>');
    
    this.setupGeocoder();

    // Evento de clic derecho / mantener pulsado
    this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      this.placeCustomMarker(e.latlng, 'Ubicación personalizada');
    });

    // si había una ubicación guardada, dibuja el pin y la ruta
    if (this.savedLocation) {
      const savedPos: L.LatLngExpression = [this.savedLocation.latitude, this.savedLocation.longitude];
      
      this.customMarker = L.marker(savedPos, { icon: DESTINATION_PIN_ICON })
        .addTo(this.map)
        .bindPopup('<b>Destino asignado</b>')
        .openPopup();

      this.drawRoute(L.latLng(this.savedLocation.latitude, this.savedLocation.longitude));
    }
  }

  private setupGeocoder(): void {
    // Inicializamos el buscador del mapa del plugin
    const geocoder = new Geocoder({
      geocoder: new geocoders.Nominatim(),
      position: 'topright', // Lo ponemos a la derecha para que no pise el zoom
      defaultMarkGeocode: false, // Evitamos que ponga su chincheta predeterminada
      placeholder: 'Buscar lugar o dirección...'
    }).addTo(this.map);
    
    // Escuchamos cuando el buscador encuentra un resultado
    geocoder.on('markgeocode', (e: any) => {
      const center = e.geocode.center; // Coordenadas del resultado
      // Limpiamos un poco el nombre para que no sea larguísimo
      const placeName = e.geocode.name.split(',')[0]; 

      // Usamos nuestra función unificada para colocar nuestra chincheta roja
      this.placeCustomMarker(center, placeName);
    });
  }

  // se ejecuta cuando el usuario mantiene pulsado en el mapa
  private placeCustomMarker(latlng: L.LatLng, placeName: string): void {
    // Si el marcador ya existe, lo movemos a la nueva posición
    if (this.customMarker) {
      this.customMarker.setLatLng(latlng);
      this.customMarker.openPopup();
    
    } else {
      // Si no existe, lo creamos por primera vez
      this.customMarker = L.marker(latlng, { icon: DESTINATION_PIN_ICON })
        .addTo(this.map)
        .bindPopup('<b>Destino asignado</b>')
        .openPopup();
    }

    this.drawRoute(latlng);

    // estructuramos la información y la enviamos hacia el task-detail
    const newLocation: TaskLocation = {
      name: placeName,
      latitude: latlng.lat,
      longitude: latlng.lng
    };

    // Avisamos al padre (task-detail)
    this.locationSelect.emit(newLocation);
  }

  // Traza la ruta óptima entre el usuario y el destino
  private drawRoute(destination: L.LatLng): void {
    const userCoords = this.userCoords();
    
    // Solo procedemos si tenemos las coordenadas de inicio
    if (userCoords) {
      // limpiamos la ruta anterior si existiese
      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
      }

      // Trazamos la nueva ruta (usando L.Routing.plan para cumplir con los tipos estrictos)
      this.routingControl = L.Routing.control({
        plan: L.Routing.plan(
          [
            L.latLng(userCoords.latitude, userCoords.longitude), // Inicio
            destination // Fin
          ],
          {
            // ocultamos los marcadores predeterminados de la ruta (ya tenemos los nuestros)
            createMarker: () => null as any 
          }
        ),
        show: false,          // Oculta el panel de texto
        addWaypoints: false,  // Evita interacciones indeseadas
        fitSelectedRoutes: true,  // Ajusta el zoom para que se vea toda la ruta
        lineOptions: {
          styles: [{ color: '#2c9e90', opacity: 0.8, weight: 5 }], 
          extendToWaypoints: true,
          missingRouteTolerance: 0
        }
      }).addTo(this.map);
    }
  }

  // Pequeña función para que el botón emita al padre
  public onClearClicked(): void {
    this.clearLocation.emit();
  }

}
