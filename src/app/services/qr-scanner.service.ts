import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Injectable({
    providedIn: 'root'
})
export class QrScannerService {
    // Abre la cámara nativa, escanea un QR y devuelve su contenido de texto.
    public async scanQRCode(): Promise<string | undefined> {
        let qrContent: string | undefined = undefined;

        try {
            // 1. Pedimos permiso para usar la cámara
            const status = await BarcodeScanner.checkPermission({ force: true });

            if (status.granted) {
                // 2. Ocultamos el fondo de la app para que se vea la cámara
                document.body.classList.add('qrscanner-active');
                await BarcodeScanner.hideBackground();

                // 3. Iniciamos el escaneo
                const result = await BarcodeScanner.startScan();

                await this.stopScanner(); // llamamos al método auxiliar de limpieza

                // 4. Si ha leído algo, guardamos el contenido
                if (result.hasContent && result.content) {
                    qrContent = result.content;
                }
            } else {
                console.warn('Permiso de cámara denegado para el escáner QR');
            }

        } catch (error) {
            console.error('Error al usar el escáner QR', error);
            await this.stopScanner();
        }

        return qrContent;
    }

    // se asegura de detener la cámara y restaurar el fondo de la app
    private async stopScanner(): Promise<void> {
        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();
        
        document.body.classList.remove('qrscanner-active');
    }

}