import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Roles_Tipos } from '../utils/interfaces/interfaces';

export const rolTipoGuard: CanActivateFn = (route, state) => {
  const roles_tipos = route.data['roles_tipos'] as Array<Roles_Tipos>;
  const permitirAnon = route.data['permitirAnon'] as boolean;

  // if (!CheckRolTipo(inject(AuthService), roles_tipos, permitirAnon)) {
  //   inject(Router).navigate(['acceso-denegado']);
  //   return false;
  // }

  return true;
};
