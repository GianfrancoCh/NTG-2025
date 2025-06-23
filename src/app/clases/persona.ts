export abstract class Persona {
  id: string;
  rol: string; // RolUsuario
  nombre: string;
  apellido: string;
  dni: number;
  foto_url: string;
  email: string;

  constructor(
    rol: string,
    nombre: string,
    apellido: string,
    dni: number,
    foto_url: string,
    email: string
  ) {
    this.id = '';
    this.rol = rol;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.foto_url = foto_url;
    this.email = email;
  }
}

// export type RolUsuario = 'cliente' | 'empleado' | 'jefe';
