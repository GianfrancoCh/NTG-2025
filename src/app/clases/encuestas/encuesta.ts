import { Cliente } from '../cliente';
import { Empleado } from '../empleado';
import { Jefe } from '../jefe';

export abstract class Encuesta {
  id: string;
  autor: Cliente | Empleado | Jefe;
  fecha: Date;

  constructor(autor: Cliente | Empleado | Jefe) {
    this.id = '';
    this.autor = autor;
    this.fecha = new Date();
  }
}
