import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { Camera } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-task-camera',
  templateUrl: './task-camera.component.html',
  styleUrls: ['./task-camera.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class TaskCameraComponent {
  // Recibe la imagen actual (si estamos editando y ya había una)
  @Input() image: string | undefined = undefined;
  
  // Emite la nueva imagen (o undefined si se borra) al componente padre
  @Output() imageChange = new EventEmitter<string | undefined>();

  constructor() {
    addIcons({ 
      cameraOutline,
      trashOutline
    });
  }

  // -- FUNCIONALIDAD DE CAMERA --

  // transforma el webPath nativo a Base64 para poder guardarlo (por la nueva version de Camera)
  private async getBase64FromWebPath(webPath: string): Promise<string> {
    const response = await fetch(webPath);
    const blob = await response.blob();

    // Almacenamos la lógica en una constante esperando su resolución
    const base64Result = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    return base64Result;
  }

  public async takePicture(): Promise<void> {
    try {
      // Abre directamente la cámara
      const photo = await Camera.takePhoto({
        quality: 70
      });

      // Si la foto se ha tomado correctamente, obtenemos su ruta
      if (photo.webPath) {
        // Usamos nuestra función auxiliar para convertirla y la guardamos en la señal
        const base64String = await this.getBase64FromWebPath(photo.webPath);
        // lo emitimos al componente padre
        this.imageChange.emit(base64String);
      }
    } catch (error) {
      console.error('El usuario canceló o hubo un error con la cámara', error);
    }
  }

  public removePicture(): void {
    this.imageChange.emit(undefined);
  }

}
