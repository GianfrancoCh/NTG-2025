import { Encuesta } from './encuesta';
import { Cliente } from '../cliente';

export class EncuestaCliente extends Encuesta {
  idPedido: string;
  puntuacionGeneral: number;
  atencion: TipoAtencion;
  comida: number;
  recomendacion: boolean;
  fotoUrls: string[];
  comentarios: string;

  constructor(
    autor: Cliente,
    idPedido: string,
    puntuacionGeneral: number,
    comida: number,
    atencion: TipoAtencion,
    recomendacion: boolean,
    fotoUrls: string[],
    comentarios: string
  ) {
    super(autor);
    this.idPedido = idPedido;
    this.puntuacionGeneral = puntuacionGeneral;
    this.comida = comida;
    this.atencion = atencion;
    this.recomendacion = recomendacion;
    this.fotoUrls = fotoUrls;
    this.comentarios = comentarios;
  }
}
export type TipoAtencion = 'muy mala' | 'mala' | 'buena' | 'excelente';
