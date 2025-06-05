import { Injectable } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { MySwal, ToastError, ToastInfo, ToastSuccess } from '../utils/alerts';

export const formatosDeImagen = ['jpg', 'jpeg', 'png', 'avif'];
@Injectable({
  providedIn: 'root',
})
export class FotosService {
  constructor() {}

  async tomarFoto(): Promise<File | undefined> {
    let archivoImagen: File | undefined;
    let tomarOtra: boolean;

    try {
      do {
        archivoImagen = undefined;
        tomarOtra = false;

        const imagen = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
        });
        if (!formatosDeImagen.includes(imagen.format)) {
          throw new Error('El archivo debe ser de formato .JPG, .JPEG o .PNG');
        }

        await MySwal.fire({
          text: '¿Subir fotografía?',
          imageUrl: imagen.webPath,
          imageWidth: '75vw',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: true,
          confirmButtonText: 'Sí',
          confirmButtonColor: '#a5dc86',
          showDenyButton: true,
          denyButtonText: 'Tomar otra',
          denyButtonColor: '#f0ec0d',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          cancelButtonColor: '#f27474',
        }).then(async (res) => {
          if (res.isConfirmed)
            archivoImagen = await this.archivoDesdeUri(
              imagen.webPath!,
              imagen.format
            );
          else if (res.isDenied) tomarOtra = true;
        });
      } while (tomarOtra);
    } catch (er: any) {
      if (er.message === 'User cancelled photos app')
        ToastInfo.fire('Operación cancelada.');
      else await MySwal.fire('Algo salió mal.', er.message, 'error');
    }

    return archivoImagen;
  }

  private async archivoDesdeUri(
    fileUri: string,
    fileFormat: string
  ): Promise<File> {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    return new File([blob], `photo.${fileFormat}`, {
      type: `image/${fileFormat}`,
    });
  }

  /**
   * Permite tomar desde `min` hasta `max` cantidad de fotos, dando la posibilidad de:
   * #### `arrayPointer` vacío:
   * - Subir fotos, con una alerta si se quiere cancelar antes de llegar a `min`.
   * #### `arrayPointer` con elementos:
   * - Sobreescribir las imágenes guardadas si ya se llegó al límite `max`.
   * - Agregar imágenes si no se llegó al límite `max`.
   * - Cancelar la acción si ya se llegó al límite `max`.
   *
   * @async
   * @param arrayPointer - El Array que guardará los archivos.
   * @param min - Cantidad mínima de fotos (default 0).
   * @param max - Cantidad máxima de fotos (puede no existir).
   */
  async tomarMultiplesFotos(
    arrayPointer: Array<File>,
    min: number = 0,
    max?: number
  ) {
    if (arrayPointer.length > 0) {
      //En caso que se hayan subido las mínimas y quieran subirse más.
      if (max) {
        const { continuar, fotos } = await this.manejarNuevasFotos(
          arrayPointer,
          max
        );
        arrayPointer.length = 0;
        arrayPointer.push(...fotos);

        if (!continuar) {
          ToastInfo.fire('Las imágenes anteriores no se modificaron.');
          return;
        }

        ToastSuccess.fire('Prosiga con las nuevas fotos.');
      }
    }

    do {
      const file = await this.tomarFoto();
      if (!file) {
        if (arrayPointer.length >= min) break;

        const { cancelar, fotos } = await this.manejarFotosInsuficientes(
          arrayPointer,
          min
        );
        arrayPointer.length = 0;
        arrayPointer.push(...fotos);

        if (cancelar) break;
      } else {
        arrayPointer.push(file);
        ToastSuccess.fire('Imagen guardada!');
      }
    } while (!max || arrayPointer.length < max);
  }

  /**
   * Dispara un Sweet Alert que pide seleccionar si desea sobreescribir o agregar imágenes a las ya existentes.
   * Si ya se alcanzó el límite de imágenes (`max`), se da la opción de cancelar.
   *
   * @async
   * @param fotosArray - El Array de fotos que se usa para leer su cantidad y copiar sus elementos.
   * @param max - Cantidad máxima de fotos.
   * @returns Si el usuario desea continuar con la subida de fotos y el nuevo valor del array.
   */
  private async manejarNuevasFotos(fotosArray: Array<File>, max: number) {
    let swal = MySwal.mixin({
      icon: 'info',
      title: `Parece que ya hay fotos guardadas.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      confirmButtonText: 'Sobreescribir',
      confirmButtonColor: '#f0ec0d',
    });

    if (max && fotosArray.length < max) {
      //Sobreescribir fotos o agregar
      swal = swal.mixin({
        text: `¿Desea sobreescribir las imágenes guardadas (${fotosArray.length})
        o continuar con las que le faltan (Máximo ${max})?`,
        showDenyButton: true,
        denyButtonText: 'Agregar las que faltan',
        denyButtonColor: '#a5dc86',
      });
    } else {
      //Sobreescribir fotos o cancelar
      swal = swal.mixin({
        text: `Ha alcanzado el límite de imágenes. ¿Desea sobreescribir las imágenes existentes?`,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#a5dc86',
      });
    }

    return await swal.fire().then((res) => {
      return {
        continuar: !res.isDismissed,
        fotos: res.isConfirmed ? [] : [...fotosArray],
      };
    });
  }

  /**
   * Dispara un Sweet Alert que pide seleccionar si desea sobreescribir o agregar imágenes a las ya existentes.
   * Si ya se alcanzó el límite de imágenes (`max`), se da la opción de cancelar.
   *
   * @async
   * @param fotosArray - El Array de fotos que se usa para leer su cantidad y copiar sus elementos.
   * @param min - Cantidad mínima de fotos.
   * @returns Si el usuario desea continuar con la subida de fotos y el nuevo valor del array.
   */
  private async manejarFotosInsuficientes(
    fotosArray: Array<File>,
    min: number
  ) {
    return await MySwal.fire({
      icon: 'warning',
      title: `Debe subir al menos ${min} fotos.`,
      text: '¿Desea cancelar esta acción? Si ya subió imágenes, serán eliminadas.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      confirmButtonText: 'Sí, cancelar',
      confirmButtonColor: '#f27474',
      showDenyButton: true,
      denyButtonText: 'Continuar con las fotos',
      denyButtonColor: '#a5dc86',
    }).then((res) => {
      if (res.isConfirmed) ToastInfo.fire('No se han guardado imágenes.');

      return {
        cancelar: res.isConfirmed,
        fotos: res.isConfirmed ? [] : [...fotosArray],
      };
    });
  }
}
