import { Persona } from './persona';

export class Jefe extends Persona {
  tipo: TipoJefe;
  cuil: number;

  constructor(nombre: string, apellido: string, dni: number, cuil: number, correo: string, fotoUrl: string, tipo: TipoJefe) {
    super('jefe', nombre, apellido, dni, fotoUrl, correo);
    this.tipo = tipo;
    this.cuil = cuil;
  }
}
export type TipoJefe = 'dueño' | 'supervisor';
