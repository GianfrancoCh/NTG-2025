import { Persona } from './persona';

export class Jefe extends Persona {
  tipo: TipoJefe;
  cuil: number;

  constructor(nombre: string, apellido: string, dni: number, cuil: number, email: string, foto_url: string, tipo: TipoJefe) {
    super('jefe', nombre, apellido, dni, foto_url, email);
    this.tipo = tipo;
    this.cuil = cuil;
  }
}
export type TipoJefe = 'dueño' | 'supervisor';
