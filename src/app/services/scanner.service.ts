import { Injectable } from '@angular/core';
import { ErrorCodes, Exception } from '../clases/exception';
import {
  BarcodeScanner,
  BarcodeFormat,
  GoogleBarcodeScannerModuleInstallState,
} from '@capacitor-mlkit/barcode-scanning';
import { ToastInfo } from '../utils/alerts';

export interface DatosDni {
  dni: number;
  nombre: string;
  apellido: string;
  // cuil: number;
}
@Injectable({
  providedIn: 'root',
})
export class ScannerService {
  /**
   * Prepara el dispositivo y realiza el escaneo de códigos.
   *
   * @param formatos - Los formatos de código de barras que debe buscar el escáner. Si no se indica un formato, buscará todos los disponibles.
   * @returns El valor crudo del código escaneado.
   */
  async escanear(formatos?: BarcodeFormat[]): Promise<string> {
    if (!(await this.escanerEsCompatible()))
      throw new Exception(
        ErrorCodes.EscanerIncompatible,
        'El escáner es incompatible con su dispositivo.'
      );

    if (!(await this.pedirPermisos()))
      throw new Exception(
        ErrorCodes.PermisosCamaraDenegada,
        'Conceda permiso para usar la cámara y poder utilizar el escáner.'
      );

    await this.manejarModuloEscanerGoogle();
    const { barcodes } = await BarcodeScanner.scan({
      formats: formatos,
    });

    return barcodes[0].rawValue;
  }

  /**
   * Verifica si el escáner es compatible con el dispositivo.
   *
   * @returns Si el escáner es compatible o no.
   */
  private async escanerEsCompatible(): Promise<boolean> {
    const result = await BarcodeScanner.isSupported();
    return result.supported;
  }

  /**
   * Solicita permisos para usar la cámara.
   *
   * @returns Si los permisos fueron concedidos o no.
   */
  private async pedirPermisos(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  /**
   * Revisa si el módulo de escáner de Google está instalado en el dispositivo.
   * Si no lo está, se encarga de instalarlo y notificar cuando termine.
   */
  private async manejarModuloEscanerGoogle(): Promise<void> {
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule().then(
        async () => {
          await BarcodeScanner.addListener(
            'googleBarcodeScannerModuleInstallProgress',
            (ev) => {
              if (
                ev.state === GoogleBarcodeScannerModuleInstallState.COMPLETED
              ) {
                ToastInfo.fire('Módulo de escáner instalado.');
                BarcodeScanner.removeAllListeners();
              }
            }
          );
        }
      );
    }
  }

  /**
   * Extrae datos del DNI de un valor crudo del código de barras.
   *
   * @param valorCrudo - El valor crudo que devuelve el código de barras escaneado.
   * @returns Un objeto conteniendo los datos del DNI (dni, nombre, apellido y cuil).
   */
  extraerDatosDni(valorCrudo: string): DatosDni {
    let datos: DatosDni;

    const partes = valorCrudo.split('@');
    if (partes.length <= 10) {
      //DNI nuevo
      const dni = partes[4].replace(/[-. ]/g, '');
      console.log('dni:', dni);

      // const digitosCuil = partes[8];
      // const cuil = [digitosCuil.slice(0, 2), dni, digitosCuil.slice(2)].join(
      //   ''
      // );

      datos = {
        dni: Number(dni),
        nombre: this.capitalizarPalabras(partes[2]),
        apellido: this.capitalizarPalabras(partes[1]),
        // cuil: Number(cuil),
      };
    } else if (partes.length === 17) {
      //DNI viejo
      const dni = partes[1].replace(/[-. ]/g, '');

      datos = {
        dni: Number(dni),
        nombre: this.capitalizarPalabras(partes[5]),
        apellido: this.capitalizarPalabras(partes[4]),
        // cuil: 0,
      };
    } else
      throw new Exception(
        ErrorCodes.CodigoNoDni,
        'El código escaneado no pertenece a un DNI.'
      );

    return datos;
  }

  /**
   * Capitaliza la primera letra de cada palabra y convierte el resto a minúsculas.
   *
   * @param texto - El texto a modificar.
   * @returns El texto modificado.
   */
  private capitalizarPalabras(texto: string): string {
    return texto.replace(
      /\b\w+\b/g,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    );
  }
}
