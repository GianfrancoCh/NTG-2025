export class Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tiempoElab: number;
  precio: number;
  sector: 'cocina' | 'barra';
  fotos_url: string[];
  tipo?: 'bebida' | 'comida' | 'postre';

  constructor(
    nombre: string,
    descripcion: string,
    tiempoElab: number,
    precio: number,
    sector: 'cocina' | 'barra',
    fotos_url: string[],
    tipo?: 'bebida' | 'comida' | 'postre'
  ) {
    this.id = '';
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tiempoElab = tiempoElab;
    this.precio = precio;
    this.sector = sector;
    this.fotos_url = fotos_url;
    this.tipo = tipo;
  }
}
