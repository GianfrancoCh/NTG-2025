import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonText,
  IonIcon,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonMenu,
  IonMenuButton,
  IonFooter,
  IonItem,
  IonList,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import {
  AlertController,
  NavController,
  ModalController,
} from '@ionic/angular/standalone';
import { ScannerService } from 'src/app/services/scanner.service';
import { Cliente } from 'src/app/clases/cliente';
import { ErrorCodes, Exception } from 'src/app/clases/exception';
import {
  MySwal,
  Toast,
  ToastError,
  ToastInfo,
  ToastSuccess,
} from 'src/app/utils/alerts';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { ClienteEnEspera } from 'src/app/utils/interfaces/interfaces';
import { EstadoMesa, Mesa } from 'src/app/clases/mesa';
import { NgxSpinnerService } from 'ngx-spinner';
import { Persona } from 'src/app/clases/persona';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { MenuMesaComponent } from 'src/app/components/menu-mesa/menu-mesa.component';
import { Pedido, PorcPropina } from 'src/app/clases/pedido';
import { CuentaComponent } from 'src/app/components/cuenta/cuenta.component';
import { RealtimeChannel } from '@supabase/supabase-js';          // ⬅️ NUEVO


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonList,
    IonItem,
    IonFooter,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonFabButton,
    IonFab,
    IonIcon,
    IonText,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    RouterModule,
    IonButton,
    CommonModule,
    IonButtons,
    IonMenu,
    IonMenuButton,
  ],
})
export class HomePage implements OnInit {
  user: User | null = null;
  
  isLoggedIn = false;
  usuarioActual: Persona | null = null;
  mensajeMesa = 'Sin mesa asignada';
  private mesaSub!: RealtimeChannel; 
  private canalUsuario!: RealtimeChannel;


  constructor(
    private router: Router,
    public authService: AuthService,
    protected navCtrl: NavController,
    private scanner: ScannerService,
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    private pushService: PushNotificationService,
    protected modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(async (user) => {
  this.user = user;
  this.usuarioActual = this.authService.UsuarioEnSesion;

  if (user && this.usuarioActual?.rol === 'cliente') {
    /* 1) Mensaje inicial (puede que el metre ya haya asignado) */
    this.setMensajeMesa((this.usuarioActual as any).idMesa ?? null);

    /* 2) Suscripción realtime usando la MISMA función del otro componente */
    this.canalUsuario = this.db.escucharUsuario(
      user.id,                                // id numérico de la tabla
      (clienteActualizado: Cliente) => {
        this.setMensajeMesa(clienteActualizado.idMesa ?? null);

        /* Mantén sincronizado el objeto en memoria */
        (this.usuarioActual as any).idMesa = clienteActualizado.idMesa;
      }
    );
  } else {
    /* no es cliente → oculta cartel */
    this.setMensajeMesa(null);
  }
});



  }
private setMensajeMesa(idMesa: string | null) {
  this.mensajeMesa = idMesa
    ? `Mesa asignada Nº ${idMesa}`
    : 'Sin mesa asignada';
}

  ngOnDestroy(): void {
    this.mesaSub?.unsubscribe();
  }

  /* -------- SUSCRIPCIÓN REALTIME -------- */
  private subscribeMesaRealtime(idUsuario: string) {
    /* Cancela previa (por seguridad en hot-reload) */
    this.mesaSub?.unsubscribe();

    this.mesaSub = this.db.supabase
      .channel(`mesa-updates-${idUsuario}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usuarios',
          filter: `id=eq.${idUsuario}`,
        },
        (payload) => {
          // La fila actualizada viene en payload.new
          const fila = payload.new as { idMesa: number | null };
          this.actualizarMensajeMesa({ ...this.usuarioActual!, idMesa: fila.idMesa } as Persona);
        }
      )
      .subscribe();
  }

  

  /* -------- MENSAJE -------- */
  private actualizarMensajeMesa(usuario?: Persona | null) {
    if (!usuario || usuario.rol !== 'cliente') {
      this.mensajeMesa = '';
      return;
    }

    const idMesa = (usuario as any).idMesa; // Cliente extiende Persona
    this.mensajeMesa = idMesa
      ? `Mesa asignada Nº ${idMesa}`
      : 'Sin mesa asignada';
  }

  // ► ELIMINA o ignora subscribeMesaRealtime()
// ► AGREGA esta nueva versión:
private subscribeMesaRealtimeMesas(idUsuario: string) {
  /* Cancela previa (útil en hot-reload) */
  this.mesaSub?.unsubscribe();

  this.mesaSub = this.db.supabase
    .channel(`mesas-asign-${idUsuario}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mesas',
        filter: `id_cliente=eq.${idUsuario}`,   // 👍 escucha SOLO las filas del cliente
      },
      (payload) => {
        const mesa = payload.new as any;        // nroMesa o nro_mesa según tu esquema
        const nroMesa = mesa.nroMesa ?? mesa.nro_mesa ?? null;
        this.setMensajeMesa(nroMesa);
      }
    )
    .subscribe();
}


  goToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }

  logout() {
    this.authService.signOut();
    this.navCtrl.navigateRoot('/login');
  }

  async escanearQr() {
    console.log('Iniciando escaneo de QR...');
    console.log('usuario en sesión:', this.authService.UsuarioEnSesion);

    if (!this.authService.UsuarioEnSesion) {
      console.log('Usuario no autenticado, redirigiendo a login...');
      return;
    }
    try {
      const QR: string = await this.scanner.escanear();
      console.log('QR Escaneado:', QR);

      const qrSeparado = QR.split('-');

      switch (qrSeparado[0]) {
        case 'entrada': //Código de entrada
          if (this.authService.UsuarioEnSesion.rol !== 'cliente')
            throw new Exception(
              ErrorCodes.TipoUsuarioIncorrecto,
              'Solo los clientes aceptados pueden acceder a la lista de espera.'
            );

          if ((this.authService.UsuarioEnSesion as Cliente).idMesa !== null)
            throw new Exception(
              ErrorCodes.ClienteYaTieneMesa,
              'No puede entrar a la lista de espera, ya tiene una mesa asignada!'
            );

          this.accederListaDeEspera();
          break;
        case 'mesa':
          if (this.authService.UsuarioEnSesion?.rol !== 'cliente')
            throw new Exception(
              ErrorCodes.TipoUsuarioIncorrecto,
              'Solo los clientes pueden acceder a las mesas.'
            );

          this.escanearQrMesa(qrSeparado[1]);
          break;
        default:
          throw new Exception(
            ErrorCodes.QrInvalido,
            'El código escaneado no es reconocido.'
          );
      }
    } catch (error: any) {
      ToastError.fire('Ups...', error.message);
    }
  }

  accederListaDeEspera() {
    MySwal.fire({
      icon: 'question',
      title:
        '¿Desea ver las encuestas de los clientes o acceder a la lista de espera?',
      showConfirmButton: true,
      confirmButtonText: 'Acceder a la lista',
      showDenyButton: true,
      denyButtonText: 'Ver encuestas',
    }).then(async (res) => {
      let url = 'lista-encuestas-cliente';

      if (res.isConfirmed) {
        if (
          await this.clienteEstaEnEspera(this.authService.UsuarioEnSesion!.id)
        )
          throw new Exception(
            ErrorCodes.ClienteEnEspera,
            'Ya se encuentra en la lista de espera!'
          );

        const clienteEnEspera: ClienteEnEspera = {
          id: '',
          fecha: new Date(),
          id_cliente: this.authService.UsuarioEnSesion!.id,
        };

        await this.db.subirDoc(Colecciones.ListaDeEspera, {
          fecha: clienteEnEspera.fecha.toISOString(),
          id_cliente: clienteEnEspera.id_cliente,
        });

        url = 'cliente-espera';

        this.pushService.notificarMaitreClienteEspera(
          this.authService.UsuarioEnSesion?.nombre ?? '',
          this.authService.UsuarioEnSesion?.apellido ?? ''
        );
      }

      // this.navCtrl.navigateRoot(url);
      this.router.navigateByUrl(url);
    });
  }

  private async clienteEstaEnEspera(idCliente: string): Promise<boolean> {
    this.spinner.show();

    console.log('Verificando si el cliente está en la lista de espera...');

    const col = await this.db.traerColeccion<ClienteEnEspera>(
      Colecciones.ListaDeEspera
    );

    console.log('Clientes en espera:', col);

    const existe = col.some((v) => v.id === idCliente);

    this.spinner.hide();
    return existe;
  }

  async escanearQrMesa(nroMesaEscaneado: string) {
    try {
      this.spinner.show();
      //traigo el usuario actualizado con el idMesa
      const cliente = await this.db.traerDoc<Cliente>(
        Colecciones.Usuarios,
        this.authService.UsuarioEnSesion!.id
      );

      if (!cliente) return;

      console.log('cliente.idMesa', cliente.idMesa);

      if (!cliente.idMesa)
        throw new Exception(
          ErrorCodes.ClienteSinMesa,
          'Debe entrar a la lista de espera y esperar a que le asignen una mesa.'
        );

      const nroMesaCliente = (
        await this.db.traerDoc<Mesa>(Colecciones.Mesas, cliente.idMesa)
      )?.nroMesa;

      if (nroMesaEscaneado !== nroMesaCliente?.toString()) {
        throw new Exception(
          ErrorCodes.MesaEquivocada,
          `Su mesa es la Numero ${nroMesaCliente}`
        );
      }

      const mesaEscan = await this.db.traerDoc<Mesa>(
        Colecciones.Mesas,
        cliente.idMesa
      );

      if (!mesaEscan)
        throw new Exception(
          ErrorCodes.MesaInexistente,
          'Este QR no pertenece a una de nuestras mesas.'
        );
        
        console.log('Estado de la mesa escaneada:', mesaEscan.estado);
      switch (mesaEscan.estado) {
        case EstadoMesa.Disponible:
          ToastInfo.fire(
            'Para acceder a esta mesa, se le debe ser asignada por el metre.'
          );
          break;
        case EstadoMesa.Asignada:
          this.spinner.hide();

          this.mostrarMenu(mesaEscan).then((rta) => {
            this.spinner.show();
            if (rta === 'pedir-comida') {
              mesaEscan.estado = EstadoMesa.PidiendoComida;
              this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
                estado: EstadoMesa.PidiendoComida,
              });
              this.navCtrl.navigateRoot('alta-pedido');
            } else {
              mesaEscan.estado = EstadoMesa.SinPedido;
              this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
                estado: EstadoMesa.SinPedido,
              });
            }
            this.spinner.hide();
          });
          break;
        case EstadoMesa.SinPedido:
          this.spinner.hide();

          this.mostrarMenu(mesaEscan).then((rta) => {
            this.spinner.show();

            if (rta === 'pedir-comida')
              this.navCtrl.navigateRoot('alta-pedido');
            else if (rta === 'consultar')
              this.navCtrl.navigateForward('consulta-mozo');

            this.spinner.hide();
          });
          break;
        case EstadoMesa.EsperandoComida:
          const ped = (
            await this.db.traerCoincidencias<Pedido>(Colecciones.Pedidos, {
              campo: 'idCliente',
              operacion: 'eq',
              valor: cliente.id,
            })
          )[0];
          this.spinner.hide();
          if (ped.estado == 'entregado') {
            await this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
              estado: EstadoMesa.Comiendo,
            });
            ToastSuccess.fire('Pedido recibido.');
          } else {
            this.mostrarMenu(mesaEscan, ped);
          }
          break;
        case EstadoMesa.Comiendo:
          const pedido = (
            await this.db.traerCoincidencias<Pedido>(Colecciones.Pedidos, {
              campo: 'idCliente',
              operacion: 'eq',
              valor: cliente.id,
            })
          )[0];
          this.spinner.hide();

          this.mostrarMenu(mesaEscan, pedido).then(async (rta) => {
            if (rta === 'jugar')
              ToastInfo.fire('Modalidad en proceso.'); //TODO: Pendiente
            else if (rta === 'alta-encuesta')
              this.navCtrl.navigateRoot('alta-encuesta-cliente', {
                state: { idPedido: pedido.id },
              });
            else if (rta === 'lista-encuestas')
              this.navCtrl.navigateRoot('lista-encuestas-cliente');
            else if (rta === 'cuenta') {
              this.pushService.notificarMozoCuenta(mesaEscan.nroMesa);

              this.spinner.show();
              mesaEscan.estado = EstadoMesa.Pagando;
              this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
                estado: EstadoMesa.Pagando,
              });
              this.spinner.hide();

              pedido.porcPropina = await this.escanearPropina();
              const cuentaModal = await this.modalCtrl.create({
                component: CuentaComponent,
                id: 'cuenta-modal',
                cssClass: 'modal-transparente',
                backdropDismiss: false,
                componentProps: { pedido: pedido },
              });
              cuentaModal.present();

              const dismiss = await cuentaModal.onDidDismiss();
              if (dismiss.role === 'success') {
                this.spinner.show();
                await this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
                  estado: EstadoMesa.Pago,
                });
                this.spinner.hide();
                ToastSuccess.fire(
                  'Pago registrado!',
                  'Espere a que el mozo confirme el pago.'
                );
              }
            }
          });
          break;
        case EstadoMesa.Pagando:
          this.spinner.hide();
          const pedidoPagado = (
            await this.db.traerCoincidencias<Pedido>(Colecciones.Pedidos, {
              campo: 'idCliente',
              operacion: 'eq',
              valor: cliente.id,
            })
          )[0];
          this.spinner.hide();
          this.mostrarMenu(mesaEscan, pedidoPagado).then(async (rta) => {
            if (rta === 'jugar')
              ToastInfo.fire('Modalidad en proceso.'); //TODO: Pendiente
            else if (rta === 'alta-encuesta')
              this.navCtrl.navigateRoot('alta-encuesta-cliente', {
                state: { idPedido: pedido.id },
              });
            else if (rta === 'lista-encuestas')
              this.navCtrl.navigateRoot('lista-encuestas-cliente');
            else if (rta === 'cuenta') {
              this.pushService.notificarMozoCuenta(mesaEscan.nroMesa);

              this.spinner.show();
              mesaEscan.estado = EstadoMesa.Pagando;
              this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
                estado: EstadoMesa.Pagando,
              });
              this.spinner.hide();

              pedido.porcPropina = await this.escanearPropina();
              const cuentaModal = await this.modalCtrl.create({
                component: CuentaComponent,
                id: 'cuenta-modal',
                cssClass: 'modal-transparente',
                backdropDismiss: false,
                componentProps: { pedido: pedido },
              });
              cuentaModal.present();

              const dismiss = await cuentaModal.onDidDismiss();
              if (dismiss.role === 'success') {
                this.spinner.show();
                await this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
                  estado: EstadoMesa.Pago,
                });
                this.spinner.hide();
                ToastSuccess.fire(
                  'Pago registrado!',
                  'Espere a que el mozo confirme el pago.'
                );
              }
            }
          });

          ToastInfo.fire(
            'Ya se solicitó la cuenta. Por favor, espere al mozo para finalizar el pago.'
          );
          break;
    
      }

      this.spinner.hide();
    } catch (error: any) {
      this.spinner.hide();
      console.error(error);
      ToastError.fire('Ups...', error.message);
    }
  }

  protected async mostrarMenu(mesa: Mesa, pedido?: Pedido) {
    const modal = await this.modalCtrl.create({
      component: MenuMesaComponent,
      id: 'menu-mesa-modal',
      cssClass: 'modal-transparente',
      componentProps: {
        mesa: mesa,
        cliente: <Cliente>this.authService.UsuarioEnSesion,
        pedido: pedido,
      },
    });

    await modal.present();
    const modalDismiss = await modal.onDidDismiss();

    return modalDismiss.data;
  }

  async escanearPropina() {
    const qrValidos = [
      'propina-0',
      'propina-5',
      'propina-10',
      'propina-15',
      'propina-20',
    ];
    let QR: string;

    let invalido: boolean;
    do {
      invalido = false;
      QR = await this.scanner.escanear();

      if (!qrValidos.includes(QR)) {
        invalido = true;
        await MySwal.fire(
          'El código escaneado no pertenece a una de nuestras propinas.',
          'Escanee nuevamente.',
          'error'
        );
      }
    } while (invalido);

    const porcentaje = Number(QR.split('-')[1]);
    return porcentaje as PorcPropina;
  }
  //BORRAR ESTO PRUEBA
  async pruebaMesa() {
    console.log('pruebaMesa');
    const mesaEscan = await this.db.traerDoc<Mesa>(Colecciones.Mesas, '2');
    const cliente = await this.db.traerDoc<Cliente>(
        Colecciones.Usuarios,
        this.authService.UsuarioEnSesion!.id
    );
    if (!cliente) return;
    if(!mesaEscan) return;
    this.mostrarMenu(mesaEscan).then((rta) => {
            this.spinner.show();

            if (rta === 'pedir-comida')
              this.navCtrl.navigateRoot('alta-pedido');
            else if (rta === 'consultar')
              this.navCtrl.navigateForward('consulta-mozo');

            this.spinner.hide();
          });
        
    // const pedidooo = (
    //         await this.db.traerCoincidencias<Pedido>(Colecciones.Pedidos, {
    //           campo: 'idCliente',
    //           operacion: 'eq',
    //           valor: cliente.id,
    //         })
    //       )[0];
    // if (mesaEscan !== null) {
    //   this.mostrarMenu(mesaEscan, pedidooo).then(async (rta) => {
    //         if (rta === 'jugar')
    //           ToastInfo.fire('Modalidad en proceso.'); //TODO: Pendiente
    //         else if (rta === 'alta-encuesta')
    //           this.navCtrl.navigateRoot('alta-encuesta-cliente', {
    //             state: { idPedido: pedidooo.id },
    //           });
    //         else if (rta === 'lista-encuestas')
    //           this.navCtrl.navigateRoot('lista-encuestas-cliente');
    //         else if (rta === 'cuenta') {
    //           this.pushService.notificarMozoCuenta(mesaEscan.nroMesa);

    //           this.spinner.show();
    //           mesaEscan.estado = EstadoMesa.Pagando;
    //           this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
    //             estado: EstadoMesa.Pagando,
    //           });
    //           this.spinner.hide();

    //           // pedidooo.porcPropina = await this.escanearPropina();
    //           let valor = 10; // o lo que venga de otro lado
    //           let porcPropinaTest = valor as PorcPropina;
    //           pedidooo.porcPropina = porcPropinaTest;
    //           const cuentaModal = await this.modalCtrl.create({
    //             component: CuentaComponent,
    //             id: 'cuenta-modal',
    //             cssClass: 'modal-transparente',
    //             backdropDismiss: false,
    //             componentProps: { pedido: pedidooo },
    //           });
    //           cuentaModal.present();

    //           const dismiss = await cuentaModal.onDidDismiss();
    //           if (dismiss.role === 'success') {
    //             this.spinner.show();
    //             await this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
    //               estado: EstadoMesa.Pago,
    //             });
    //             this.spinner.hide();
    //             ToastSuccess.fire(
    //               'Pago registrado!',
    //               'Espere a que el mozo confirme el pago.'
    //             );
    //           }
    //         }
    //       });

          ToastInfo.fire(
            'Ya se solicitó la cuenta. Por favor, espere al mozo para finalizar el pago.'
          );
        
    
  }

  private async obtenerMesaAsignada(idUsuario: string): Promise<number | null> {
  const mesas = await this.db.traerCoincidencias<Mesa>(Colecciones.Mesas, {
    campo: 'idCliente',       // ← tu campo FK
    operacion: 'eq',
    valor: idUsuario,
  });
  return mesas.length ? mesas[0].nroMesa : null;
}

}
