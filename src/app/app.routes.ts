import { Routes } from '@angular/router';
import { clienteAceptadoGuard } from './guards/cliente-aceptado.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'alta-cliente',
    loadComponent: () =>
      import('./pages/altas/alta-cliente/alta-cliente.page').then(
        (m) => m.AltaClientePage
      ),
  },
  {
    path: 'alta-supervisor',
    loadComponent: () =>
      import('./pages/altas/alta-supervisor/alta-supervisor.page').then(
        (m) => m.AltaSupervisorPage
      ),
  },
  {
    path: 'alta-empleado',
    loadComponent: () =>
      import('./pages/altas/alta-empleado/alta-empleado.page').then(
        (m) => m.AltaEmpleadoPage
      ),
  },
  {
    path: 'alta-producto',
    loadComponent: () =>
      import('./pages/altas/alta-producto/alta-producto.page').then(
        (m) => m.AltaProductoPage
      ),
  },
  {
    path: 'alta-mesa',
    loadComponent: () =>
      import('./pages/altas/alta-mesa/alta-mesa.page').then(
        (m) => m.AltaMesaPage
      ),
  },
  {
    path: 'lista-clientes-pendientes',
    loadComponent: () =>
      import(
        './pages/listas/lista-clientes-pendientes/lista-clientes-pendientes.page'
      ).then((m) => m.ListaClientesPendientesPage),
  },
  {
    path: 'alta-cliente-anon',
    loadComponent: () =>
      import('./pages/altas/alta-cliente-anon/alta-cliente-anon.page').then(
        (m) => m.AltaClienteAnonPage
      ),
  },
  {
    path: 'lista-espera',
    loadComponent: () =>
      import('./pages/listas/lista-espera/lista-espera.page').then(
        (m) => m.ListaEsperaPage
      ),
  },
  {
    path: 'cliente-espera',
    loadComponent: () => import('./pages/cliente-espera/cliente-espera.page').then( m => m.ClienteEsperaPage)
  },
  {
    path: 'lista-encuestas-cliente',
    loadComponent: () => import('./pages/encuestas/lista-encuestas-cliente/lista-encuestas-cliente.page').then( m => m.ListaEncuestasClientePage)
  },
];
