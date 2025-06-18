import { Persona } from './persona';

export class Cliente extends Persona {
  tipo: TipoCliente;
  estadoCliente: EstadoCliente;
  idMesa: string | null;

  constructor(
    nombre: string,
    apellido: string,
    dni: number,
    email: string,
    foto_url: string,
    tipo: TipoCliente
  ) {
    super('cliente', nombre, apellido, dni, foto_url, email);
    this.tipo = tipo;
    this.idMesa = null;
    this.estadoCliente = 'pendiente';
  }

  static crearClienteAnon(nombre: string, foto_url: string) {
    const anon = new Cliente(nombre, '', 0, '', foto_url, 'anonimo');
    anon.estadoCliente = 'no necesita';
    return anon;
  }
}
export type TipoCliente = 'registrado' | 'anonimo';
export type EstadoCliente =
  | 'no necesita'
  | 'pendiente'
  | 'aceptado'
  | 'rechazado';
