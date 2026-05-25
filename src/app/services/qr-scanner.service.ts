import { Injectable } from '@angular/core';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';

@Injectable({
    providedIn: 'root'
})
export class QrScannerService {
    // Abre la cámara nativa, escanea un QR y devuelve su contenido de texto.
    public async scanQRCode(): Promise<string | undefined> {
        let scannedText: string | undefined = undefined;

        try {
            // maneja los permisos y la interfaz nativa automáticamente
            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: CapacitorBarcodeScannerTypeHint.ALL 
            });
        
            if (result && result.ScanResult) {
                scannedText = result.ScanResult;
            }

        } catch (error) {
            console.error('Error al usar el escáner QR o el usuario canceló', error);
        }
        
        return scannedText;
    }

}