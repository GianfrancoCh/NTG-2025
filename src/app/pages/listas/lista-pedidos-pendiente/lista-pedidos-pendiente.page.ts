import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonCardContent,
  IonItem,
  IonButton,
  IonIcon,
  IonLabel,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { EstadoPedido, Pedido, PedidoProd } from 'src/app/clases/pedido';
import { EstadoMesa, Mesa } from 'src/app/clases/mesa';
import { Cliente } from 'src/app/clases/cliente';
import { Producto } from 'src/app/clases/producto';
import { Empleado } from 'src/app/clases/empleado';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  receiptOutline,
  removeCircleOutline,
} from 'ionicons/icons';
import { ToastSuccess } from 'src/app/utils/alerts';
import { PedidoComponent } from 'src/app/components/pedido/pedido.component';

@Component({
  selector: 'app-lista-pedidos-pendiente',
  templateUrl: './lista-pedidos-pendiente.page.html',
  styleUrls: ['./lista-pedidos-pendiente.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonBackButton,
    IonLabel,
    IonIcon,
    IonButton,
    IonItem,
    IonCardContent,
    IonList,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
  providers: [ModalController],
})
export class ListaPedidosPendientePage implements OnInit {
  protected pedidos: Pedido[] = [];
  protected mesas: Mesa[] = [];
  protected clientes: Cliente[] = [];
  protected productos: Producto[] = [];
  protected empleado!: Empleado;

  protected pedidosPendientes: Pedido[] = [];
  protected pedidosListos: Pedido[] = [];

  constructor(
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private push: PushNotificationService
  ) {
    this.empleado = <Empleado>this.auth.UsuarioEnSesion;
    addIcons({ checkmarkCircleOutline, removeCircleOutline, receiptOutline });
  }
  async ngOnInit() {
    this.spinner.show();

    [this.productos, this.mesas, this.clientes] = await Promise.all([
      this.db.traerColeccion<Producto>(Colecciones.Productos),
      this.db.traerColeccion<Mesa>(Colecciones.Mesas),
      this.db.traerCoincidencias<Cliente>(Colecciones.Usuarios, {
        campo: 'rol',
        operacion: 'eq',
        valor: 'cliente',
      }),
    ]);

    // 👇 Carga inicial de pedidos con filtro
    const pedidosTotales = await this.db.traerColeccion<Pedido>(
      Colecciones.Pedidos
    );
    this.pedidos = pedidosTotales.filter((item) => {
      if (this.empleado.tipo === 'mozo')
        return item.estado === 'pendiente' || item.estado === 'listo';
      else {
        const sector = this.empleado.tipo === 'cocinero' ? 'cocina' : 'barra';
        return item.estado === 'en proceso' && !item.confirmaciones[sector];
      }
    });

    // 👇 Activar escucha en tiempo real para mantener sincronizado
    this.db.escucharColeccion<Pedido>(
      Colecciones.Pedidos,
      this.pedidos,
      (item) => {
        if (this.empleado.tipo === 'mozo')
          return item.estado === 'pendiente' || item.estado === 'listo';
        else {
          const sector = this.empleado.tipo === 'cocinero' ? 'cocina' : 'barra';
          return item.estado === 'en proceso' && !item.confirmaciones[sector];
        }
      }
    );

    this.spinner.hide();
  }

  async manejarEstadoPedido(pedido: Pedido) {
    this.spinner.show();
    let nuevoEstado: EstadoPedido;
    let nuevaConfirm: {
      cocina: boolean;
      barra: boolean;
    } = pedido.confirmaciones;
    let msj: string;

    if (this.empleado.rol === 'mozo') {
      [nuevoEstado, msj] =
        pedido.estado === 'pendiente'
          ? ['en proceso', 'Pedido en preparación.']
          : ['entregado', 'Pedido listo!'];

      this.push.notificarCocinero();
      this.push.notificarBartender();
    } else {
      const sector = this.empleado.tipo === 'cocinero' ? 'cocina' : 'barra';
      nuevaConfirm[sector] = true;
      nuevoEstado = 'en proceso';
      msj = `Pedido en ${sector} listo!`;

      if (pedido.confirmaciones.cocina && pedido.confirmaciones.barra) {
        nuevoEstado = 'listo';
        msj = 'Pedido listo para entrega!';

        this.push.notificarMozo(); // Notificar al mozo que el pedido está listo
      }
    }

    await this.db.actualizarDoc(Colecciones.Pedidos, pedido.id, {
      confirmaciones: nuevaConfirm,
      estado: nuevoEstado,
    });

    // await this.cargarPedidos();

    this.spinner.hide();
    ToastSuccess.fire(msj);
  }

  readonly accionPedido = (pedido: Pedido) => {
    if (this.empleado.tipo === 'mozo') {
      if (pedido.estado === 'pendiente') return 'Enviar pedido a preparar';
      else if (pedido.estado === 'listo') return 'Llevar pedido a la mesa';

      return;
    } else {
      return 'Pedido listo?';
    }
  };

  async mostrarPedido(pedido: Pedido) {
    let productosCant: PedidoProd[] = [];

    pedido.pedidoProd.forEach((pedidoProd) => {
      this.productos.forEach((prod) => {
        if (prod.nombre === pedidoProd.nombre) {
          if (
            (this.empleado.tipo === 'bartender' && prod.sector !== 'barra') ||
            (this.empleado.tipo === 'cocinero' && prod.sector !== 'cocina')
          )
            return;

          let prodPed: PedidoProd = {
            producto: prod,
            cantidad: pedidoProd.cantidad,
          };
          productosCant.push(prodPed);
        }
      });
    });

    const modal = await this.modalCtrl.create({
      component: PedidoComponent,
      id: 'pedido-modal',
      componentProps: { pedido: productosCant },
      cssClass: 'modal-transparente',
    });
    await modal.present();
  }

  private async cargarPedidos() {
    this.pedidos = await this.db.traerColeccion<Pedido>(Colecciones.Pedidos);
  }

  async entregarPedido(pedido: Pedido) {
    this.spinner.show();

    console.log('Entregando pedido:', pedido);

    try {
      await this.db.actualizarDoc(Colecciones.Pedidos, pedido.id, {
        estado: 'entregado',
      });

      this.pedidosListos = this.pedidosListos.filter((p) => p.id !== pedido.id); //actualizar visualmente la lista

      ToastSuccess.fire('Pedido entregado con éxito!');
    } catch (error) {
      console.error('Error al entregar el pedido:', error);
    }

    this.spinner.hide();
  }
}
