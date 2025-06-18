import { Persona } from "./persona"

export class Empleado extends Persona {
  tipo: TipoEmpleado;
  cuil: number;

  constructor(nombre: string, apellido: string, dni: number, cuil: number, email: string, foto_url: string, tipo: TipoEmpleado) {
    super('empleado', nombre, apellido, dni, foto_url, email);
    this.tipo = tipo;
    this.cuil = cuil;
  }

}
export type TipoEmpleado = 'metre' | 'mozo' | 'cocinero' | 'bartender';
export type TurnoEmpleado = 'mañana' | 'tarde' | 'noche';