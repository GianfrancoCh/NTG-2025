export class Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tiempoElab: number;
  precio: number;
  sector: 'cocina' | 'barra';
  fotosUrl: string[];

  constructor(nombre: string, descripcion: string, tiempoElab: number, precio: number, sector: 'cocina' | 'barra', fotosUrl: string[]) {
    this.id = '';
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tiempoElab = tiempoElab;
    this.precio = precio;
    this.sector = sector;
    this.fotosUrl = fotosUrl;
  }
}
