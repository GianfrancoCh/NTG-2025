import { Cliente, TipoCliente } from 'src/app/clases/cliente';
import { TipoEmpleado } from 'src/app/clases/empleado';
import { TipoJefe } from 'src/app/clases/jefe';
// import { RolUsuario } from 'src/app/clases/persona';

export interface Foto {
  id: string;
  name: string;
  date: Date;
  url: string;
}

export interface Roles_Tipos {
  rol: string;
  tipo?: TipoCliente | TipoEmpleado | TipoJefe;
}

export interface ClienteEnEspera {
  id: string;
  fecha: Date;
  id_cliente: string;
}
