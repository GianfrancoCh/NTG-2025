export class Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tiempoElab: number;
  precio: number;
  sector: 'cocina' | 'barra';
  foto_url: string[];

  constructor(
    nombre: string,
    descripcion: string,
    tiempoElab: number,
    precio: number,
    sector: 'cocina' | 'barra',
    foto_url: string[]
  ) {
    this.id = '';
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tiempoElab = tiempoElab;
    this.precio = precio;
    this.sector = sector;
    this.foto_url = foto_url;
  }
}
