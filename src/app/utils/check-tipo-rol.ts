import { Cliente } from '../clases/cliente';
import { Empleado } from '../clases/empleado';
import { Jefe } from '../clases/jefe';
import { AuthService } from '../services/auth.service';
import { Roles_Tipos } from './interfaces/interfaces';

/**
 * Valida si el usuario actual tiene un rol y tipo permitidos.
 * @param auth Servicio de autenticación (AuthService).
 * @param roles_tipos Arreglo de objetos con rol y tipo permitidos.
 * @param permitirAnon Si se permite acceso a usuarios no logueados.
 * @returns Promise<boolean>
 */
// export async function CheckRolTipo(
//   auth: AuthService,
//   roles_tipos: Roles_Tipos[] = [],
//   permitirAnon: boolean = false
// ): Promise<boolean> {
//   const usuario = await auth.obtenerUsuarioExtendido(); // obtenés el usuario real

//   if (!usuario) return !!permitirAnon;
//   if (!roles_tipos || roles_tipos.length === 0) return true;

//   let rol: string | undefined;
//   let tipo: string | undefined;

//   if (isCliente(usuario)) {
//     rol = 'cliente';
//     tipo = usuario.tipo;
//   } else if (isEmpleado(usuario)) {
//     rol = 'empleado';
//     tipo = usuario.tipo;
//   } else if (isJefe(usuario)) {
//     rol = 'jefe';
//     tipo = usuario.perfil;
//   }

//   return roles_tipos.some((rt) => {
//     if (!rt.tipo) {
//       return rt.rol === rol;
//     } else {
//       return rt.rol === rol && rt.tipo === tipo;
//     }
//   });
// }

// // Type guards
// function isCliente(usuario: any): usuario is Cliente {
//   return 'dni' in usuario && 'tipo' in usuario;
// }

// function isEmpleado(usuario: any): usuario is Empleado {
//   return 'cuil' in usuario && 'tipo' in usuario;
// }

// function isJefe(usuario: any): usuario is Jefe {
//   return 'cuil' in usuario && 'perfil' in usuario;
// }
