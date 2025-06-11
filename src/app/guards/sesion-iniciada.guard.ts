import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sesionIniciadaGuard: CanActivateFn = (route, state) => {
  // const enSesion = !!inject(AuthService).UsuarioEnSesion;

  // if (!enSesion) inject(Router).navigate(['acceso-denegado']);

  // return enSesion;
  return true
};
