import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Persona } from '../clases/persona';

export enum Colecciones {
  Usuarios = 'users',
  Mesas = 'mesas',
  Productos = 'productos',
  EncuestasCliente = 'encuestas-clientes',
  EncuestasEmpleado = 'encuestas-empleado',
  EncuestasSupervisor = 'encuestas-supervisor',
  ListaDeEspera = 'lista-de-espera',
  Pedidos = 'pedidos',
  Mensajes = 'mensajes',
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async traerColeccion<T>(
    coleccion: string,
    ordenarPorCampo?: string
  ): Promise<Array<T>> {
    let query = this.supabase.from(coleccion).select('*');
    if (ordenarPorCampo)
      query = query.order(ordenarPorCampo, { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.error('Error al traer la colección:', error.message);
      return [];
    }

    return data as T[];
  }

  async traerDoc<T>(coleccion: string, docId: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(coleccion)
      .select('*')
      .eq('id', docId)
      .single();

    if (error) {
      console.error('Error al traer el documento:', error.message);
      return null;
    }

    return data as T;
  }

  async traerCoincidencias<T>(
    coleccion: string,
    constraint: { campo: string; operacion: any; valor: any }
  ): Promise<Array<T>> {
    const { data, error } = await this.supabase
      .from(coleccion)
      .select('*')
      .filter(constraint.campo, constraint.operacion, constraint.valor);

    if (error) {
      console.error('Error al traer coincidencias:', error.message);
      return [];
    }

    return data as T[];
  }

  async subirDoc(coleccion: string, data: any): Promise<string | null> {
    const { data: result, error } = await this.supabase
      .from(coleccion)
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.error('Error al subir documento:', error.message);
      return null;
    }

    return result.id;
  }

  async actualizarDoc(
    coleccion: string,
    docId: string,
    data: any
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from(coleccion)
      .update(data)
      .eq('id', docId);

    if (error) {
      console.error('Error al actualizar documento:', error.message);
      return false;
    }

    return true;
  }

  async borrarDoc(coleccion: string, docId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(coleccion)
      .delete()
      .eq('id', docId);

    if (error) {
      console.error('Error al borrar documento:', error.message);
      return false;
    }

    return true;
  }

  async buscarUsuarioPorCorreo(correo: string): Promise<Persona | null> {
    const { data, error } = await this.supabase
      .from(Colecciones.Usuarios)
      .select('*')
      .eq('correo', correo)
      .single();

    if (error) {
      console.error('Correo no registrado:', error.message);
      return null;
    }

    return data as Persona;
  }

  async buscarUsuarioPorDni(dni: number): Promise<Persona | null> {
    const { data, error } = await this.supabase
      .from(Colecciones.Usuarios)
      .select('*')
      .eq('dni', dni)
      .single();

    if (error) {
      console.error('DNI no registrado:', error.message);
      return null;
    }

    return data as Persona;
  }
}
