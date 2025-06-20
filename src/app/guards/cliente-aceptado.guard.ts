import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastError } from '../utils/alerts';
import { Cliente } from '../clases/cliente';

export const clienteAceptadoGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const cliente = await auth.obtenerUsuarioCliente();
  console.log('Cliente obtenido:', cliente);
  if (!cliente) {
    ToastError.fire('Solo clientes aprobados pueden ingresar.');
    router.navigate(['/home']);
    return false;
  }

  if (cliente.estado === 'aceptado' || cliente.estado === 'no necesita') {
    return true;
  } else {
    ToastError.fire(
      `Acceso denegado: su registro ${
        cliente.estado === 'rechazado'
          ? 'fue rechazado.'
          : 'todavía no fue aprobado.'
      }`
    );
    router.navigate(['/alta-pedido']);
    return false;
  }
};
