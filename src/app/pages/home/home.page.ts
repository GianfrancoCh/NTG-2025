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
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
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

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
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

  constructor(
    private router: Router,
    public authService: AuthService,
    protected navCtrl: NavController,
    private scanner: ScannerService,
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    private pushService: PushNotificationService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.user = user;
      console.log('Usuario en home:', user);
    });

    this.usuarioActual = this.authService.UsuarioEnSesion;
    console.log('Usuario actual:', this.usuarioActual);
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

  async escanearQrEntrada() {
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

          // this.escanearQrMesa(qrSeparado[1]);
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

        url = 'clientes-espera';

        // push notification a metre
        // this.push.sendNotificationToType(
        //   'Nuevo cliente',
        //   `${clienteEnEspera.cliente.nombre} ${clienteEnEspera.cliente.apellido} se sumó a la lista de espera`,
        //   'metre'
        // );
        this.pushService.notificarMaitreClienteEspera(
          this.authService.UsuarioEnSesion?.nombre ?? '',
          this.authService.UsuarioEnSesion?.apellido ?? ''
        );
      }

      this.navCtrl.navigateRoot(url);
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

  // async escanearQrMesa(idMesa: string) {
  //   try {
  //     this.spinner.show();
  //     const cliente = this.authService.UsuarioEnSesion as Cliente;
  //     if (!cliente) return;

  //     if (!cliente.idMesa)
  //       throw new Exception(
  //         ErrorCodes.ClienteSinMesa,
  //         'Debe entrar a la lista de espera y esperar a que le asignen una mesa.'
  //       );

  //     const nroMesaCliente = (
  //       await this.db.traerDoc<Mesa>(Colecciones.Mesas, cliente.idMesa)
  //     ).nroMesa;
  //     if (idMesa !== cliente.idMesa) {
  //       throw new Exception(
  //         ErrorCodes.MesaEquivocada,
  //         `Su mesa es la Nro${nroMesaCliente}`
  //       );
  //     }

  //     const mesaEscan = await this.db.traerDoc<Mesa>(Colecciones.Mesas, idMesa);
  //     if (!mesaEscan)
  //       throw new Exception(
  //         ErrorCodes.MesaInexistente,
  //         'Este QR no pertenece a una de nuestras mesas.'
  //       );

  //     switch (mesaEscan.estado) {
  //       case EstadoMesa.Disponible:
  //         ToastInfo.fire(
  //           'Para acceder a esta mesa, se le debe ser asignada por el metre.'
  //         );
  //         break;
  //       case EstadoMesa.Asignada:
  //         this.spinner.hide();

  //         this.mostrarMenu(mesaEscan).then((rta) => {
  //           this.spinner.show();
  //           if (rta === 'pedir-comida') {
  //             mesaEscan.estado = EstadoMesa.PidiendoComida;
  //             this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
  //               estado: EstadoMesa.PidiendoComida,
  //             });
  //             this.navCtrl.navigateRoot('alta-pedido');
  //           } else {
  //             mesaEscan.estado = EstadoMesa.SinPedido;
  //             this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
  //               estado: EstadoMesa.SinPedido,
  //             });
  //           }
  //           this.spinner.hide();
  //         });
  //         break;
  //       case EstadoMesa.SinPedido:
  //         this.spinner.hide();

  //         this.mostrarMenu(mesaEscan).then((rta) => {
  //           this.spinner.show();

  //           if (rta === 'pedir-comida')
  //             this.navCtrl.navigateRoot('alta-pedido');
  //           else if (rta === 'consultar')
  //             this.navCtrl.navigateForward('consulta-mozo');

  //           this.spinner.hide();
  //         });
  //         break;
  //       case EstadoMesa.EsperandoComida:
  //         const ped = (
  //           await this.db.traerCoincidencias<Pedido>(Colecciones.Pedidos, {
  //             campo: 'idCliente',
  //             operacion: '==',
  //             valor: cliente.id,
  //           })
  //         )[0];
  //         this.spinner.hide();
  //         if (ped.estado == 'entregado') {
  //           await this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
  //             estado: EstadoMesa.Comiendo,
  //           });
  //           Toast.Success.fire('Pedido recibido.');
  //         } else {
  //           this.mostrarMenu(mesaEscan, ped);
  //         }
  //         break;
  //       case EstadoMesa.Comiendo:
  //         const pedido = (
  //           await this.db.traerCoincidencias<Pedido>(Colecciones.Pedidos, {
  //             campo: 'idCliente',
  //             operacion: '==',
  //             valor: cliente.id,
  //           })
  //         )[0];
  //         this.spinner.hide();

  //         this.mostrarMenu(mesaEscan, pedido).then(async (rta) => {
  //           if (rta === 'jugar')
  //             ToastInfo.fire('Modalidad en proceso.'); //TODO: Pendiente
  //           else if (rta === 'alta-encuesta')
  //             this.navCtrl.navigateRoot('alta-encuesta-cliente', {
  //               state: { idPedido: pedido.id },
  //             });
  //           else if (rta === 'lista-encuestas')
  //             this.navCtrl.navigateRoot('lista-encuestas-cliente');
  //           else if (rta === 'cuenta') {
  //             this.push.sendNotificationToType(
  //               'Pedido de cuenta',
  //               `La mesa número ${mesaEscan.nroMesa} pidió la cuenta`,
  //               'mozo'
  //             );
  //             this.spinner.show();
  //             mesaEscan.estado = EstadoMesa.Pagando;
  //             this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
  //               estado: EstadoMesa.Pagando,
  //             });
  //             this.spinner.hide();

  //             pedido.porcPropina = await this.escanearPropina();
  //             const cuentaModal = await this.modalCtrl.create({
  //               component: CuentaComponent,
  //               id: 'cuenta-modal',
  //               backdropDismiss: false,
  //               componentProps: { pedido: pedido },
  //             });
  //             cuentaModal.present();

  //             const dismiss = await cuentaModal.onDidDismiss();
  //             if (dismiss.role === 'success') {
  //               this.spinner.show();
  //               await this.db.actualizarDoc(Colecciones.Mesas, mesaEscan.id, {
  //                 estado: EstadoMesa.Pago,
  //               });
  //               this.spinner.hide();
  //               ToastSuccess.fire(
  //                 'Pago registrado!',
  //                 'Espere a que el mozo confirme el pago.'
  //               );
  //             }
  //           }
  //         });
  //         break;
  //     }

  //     this.spinner.hide();
  //   } catch (error: any) {
  //     this.spinner.hide();
  //     console.error(error);
  //     ToastError.fire('Ups...', error.message);
  //   }
  // }
}
