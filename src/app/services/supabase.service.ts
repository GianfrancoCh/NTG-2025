import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { User } from '../interfaces';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  protected supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  constructor() {}

  get storage() {
    return this.supabase.storage;
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  listFilesFromFolder(bucket: string, folder: string) {
    return this.supabase.storage.from(bucket).list(folder, {
      sortBy: { column: 'name', order: 'desc' },
    });
  }

  getPublicUrl(bucket: string, path: string) {
    return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  // Obtener datos de una tabla
  async getData<T>(
    tableName: string,
    fieldOrderBy?: string
  ): Promise<Array<T>> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .order(fieldOrderBy || 'id'); // Ordenar por el campo especificado

    if (error) {
      throw new Error(error.message);
    }

    return data as Array<T>;
  }

  // Obtener datos de un registro específico
  async getDataFromDoc<T>(tableName: string, docId: string): Promise<T> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .eq('id', docId)
      .single(); // Obtener un solo registro

    if (error) {
      throw new Error(error.message);
    }

    return data as T;
  }

  // Agregar datos a una tabla
  async addData(tableName: string, data: any): Promise<string> {
    const { data: insertData, error } = await this.supabase
      .from(tableName)
      .insert([data])
      .select(); // IMPORTANTE: agrega `.select()` para que Supabase devuelva el nuevo registro.

    if (error) {
      throw new Error('Hubo un problema al subir los datos: ' + error.message);
    }

    if (!insertData || insertData.length === 0) {
      throw new Error('No se recibió el nuevo dato insertado.');
    }

    return insertData[0].id; // Ahora sí es seguro acceder
  }

  // Actualizar datos de un registro
  async updateDoc(tableName: string, docId: string, data: any): Promise<void> {
    const { error } = await this.supabase
      .from(tableName)
      .update(data)
      .eq('id', docId);

    if (error) {
      throw new Error(
        'Hubo un problema al actualizar los datos: ' + error.message
      );
    }
  }

  // Buscar usuario por email
  // async searchUserByEmail(email: string): Promise<User> {
  //   const { data: users, error } = await this.supabase
  //     .from('users')
  //     .select('*')
  //     .eq('email', email);

  //   if (error) {
  //     throw new Error(
  //       'Hubo un problema al buscar el usuario: ' + error.message
  //     );
  //   }

  //   if (users.length === 0) {
  //     throw new Error('Esta dirección de correo no está registrada.');
  //   }

  //   return users[0] as User;
  // }
}
