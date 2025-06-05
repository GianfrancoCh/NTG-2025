export abstract class Persona {
  id: string;
  perfil: PerfilUsuario;
  nombre: string;
  apellido: string;
  dni: number;
  fotoUrl: string;
  correo: string;

  constructor(
    perfil: PerfilUsuario,
    nombre: string,
    apellido: string,
    dni: number,
    fotoUrl: string,
    correo: string
  ) {
    this.id = '';
    this.perfil = perfil;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.fotoUrl = fotoUrl;
    this.correo = correo;
  }
}

export type PerfilUsuario = 'cliente' | 'empleado' | 'jefe';
