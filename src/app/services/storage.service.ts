import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  /**
   * Sube un archivo a `Supabase Storage` y retorna su link de descarga.
   *
   * @param archivo - El archivo a subir.
   * @param ruta - La ruta donde se guardará el archivo (ej: 'clientes/imagen.png').
   * @returns El link de descarga del archivo.
   */
  async subirArchivo(archivo: File, ruta: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('fotos') // 👈 reemplazá 'tu-bucket' con el nombre real de tu bucket en Supabase
      .upload(ruta, archivo, {
        upsert: true, // opcional: reemplaza si ya existe
      });

    if (error) {
      console.error(error);
      throw new Error('Hubo un problema al subir el archivo.');
    }

    return this.obtenerLinkPublico(ruta);
  }

  /**
   * Genera un link público del archivo en Supabase Storage.
   *
   * @param ruta - La ruta del archivo (ej: 'clientes/imagen.png').
   * @returns El link público del archivo.
   */
  obtenerLinkPublico(ruta: string): string {
    const resultado = this.supabase.storage.from('fotos').getPublicUrl(ruta);

    return resultado.data.publicUrl;
  }

  /**
   * Lista todos los archivos dentro de una ruta específica.
   *
   * @param ruta - Carpeta donde están los archivos (ej: 'clientes').
   * @returns Un array con los archivos encontrados.
   */
  async traerTodosLosArchivos(ruta: string): Promise<any[]> {
    const { data, error } = await this.supabase.storage
      .from('fotos') // 👈 reemplazá 'tu-bucket' con el nombre real
      .list(ruta);

    if (error) {
      console.error(error);
      throw new Error('No se pudieron traer los archivos.');
    }

    return data;
  }
}
