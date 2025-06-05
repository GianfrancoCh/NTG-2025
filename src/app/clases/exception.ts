export class Exception extends Error {
  code: ErrorCodes;

  constructor(code: ErrorCodes, message?: string) {
    super(message);
    this.code = code;
  }
}
export enum ErrorCodes {
  LargoInputInvalido = 101,
  CaracInputInvalido,
  TipoInputInvalido,
  InputInvalido,
  QrInvalido,
  CorreoNoRegistrado,
  DniNoRegistrado,
  ActualizarDocError,
  EscanerIncompatible,
  PermisosCamaraDenegada,
  CodigoNoDni,
  MesaEquivocada,
  FotoCancelada,
  FotoFaltante,
  DocInexistente,
  TipoUsuarioIncorrecto,
  ClienteYaTieneMesa,
  ClienteEnEspera,
  ClienteSinMesa,
  MesaInexistente,
}
