export class Mesa {
  id: string;
  nroMesa: number;
  cantComensales: number;
  tipo: TipoMesa;
  fotoUrl: string | undefined;
  codigoQr: string;
  estado: EstadoMesa;

  constructor(nroMesa: number, cantComensales: number, tipo: TipoMesa, fotoUrl: string | undefined, codigoQr: string) {
    this.id = '';
    this.nroMesa = nroMesa;
    this.cantComensales = cantComensales;
    this.tipo = tipo;
    this.fotoUrl = fotoUrl;
    this.codigoQr = codigoQr;
    this.estado = EstadoMesa.Disponible;
  }
}

export type TipoMesa = 'VIP' | 'discapacitados' | 'estandar';
export enum EstadoMesa {
  Disponible = 'Disponible',
  Asignada = 'Asignada',
  SinPedido = 'SinPedido',
  PidiendoComida = 'PidiendoComida',
  EsperandoComida = 'EsperandoComida',
  Comiendo = 'Comiendo',
  Pagando = 'Pagando',
  Pago = 'Pago'
}

export const parseEstadoMesa = (estado: EstadoMesa): string => {
  const mapa: Record<EstadoMesa, string> = {
    [EstadoMesa.Disponible]: 'Mesa Disponible',
    [EstadoMesa.Asignada]: 'Mesa Asignada',
    [EstadoMesa.SinPedido]: 'Cliente sin pedido',
    [EstadoMesa.PidiendoComida]: 'Cliente pidiendo comida',
    [EstadoMesa.EsperandoComida]: 'Cliente esperando comida',
    [EstadoMesa.Comiendo]: 'Cliente comiendo',
    [EstadoMesa.Pagando]: 'Cliente pagando',
    [EstadoMesa.Pago]: 'Cliente ya pagó',
  };

  return mapa[estado];
};
