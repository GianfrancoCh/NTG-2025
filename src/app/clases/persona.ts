export abstract class Persona {
  id: string;
  perfil: RolUsuario;
  nombre: string;
  apellido: string;
  dni: number;
  foto_url: string;
  email: string;

  constructor(
    perfil: RolUsuario,
    nombre: string,
    apellido: string,
    dni: number,
    foto_url: string,
    email: string
  ) {
    this.id = '';
    this.perfil = perfil;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.foto_url = foto_url;
    this.email = email;
  }
}

export type RolUsuario = 'cliente' | 'empleado' | 'jefe';
