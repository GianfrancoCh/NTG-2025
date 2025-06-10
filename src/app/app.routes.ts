import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/altas/alta-supervisor/alta-supervisor.page').then( m => m.AltaSupervisorPage)
  },
  {
    path: 'alta-empleado',
    loadComponent: () => import('./pages/altas/alta-empleado/alta-empleado.page').then( m => m.AltaEmpleadoPage)
  },
  {
    path: 'alta-producto',
    loadComponent: () => import('./pages/altas/alta-producto/alta-producto.page').then( m => m.AltaProductoPage)
  },  
  {
    path: 'alta-mesa',
    loadComponent: () => import('./pages/altas/alta-mesa/alta-mesa.page').then( m => m.AltaMesaPage)
  }

];
