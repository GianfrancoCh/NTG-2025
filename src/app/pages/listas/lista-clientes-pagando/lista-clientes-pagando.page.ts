import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonLabel,
  IonCardTitle,
  IonCardHeader,
  IonButton,
  IonItem,
  IonCardContent,
  IonList,
  IonAvatar,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  receiptOutline,
  removeCircleOutline,
} from 'ionicons/icons';
import { NgxSpinnerService } from 'ngx-spinner';
import { delay } from 'rxjs';
import {
  DatabaseService,
  Colecciones,
} from 'src/app/services/database.service';
import { ModalController } from '@ionic/angular/standalone';
import { PedidoComponent } from 'src/app/components/pedido/pedido.component';
import { AuthService } from 'src/app/services/auth.service';
import { ToastSuccess } from 'src/app/utils/alerts';
import { Cliente } from 'src/app/clases/cliente';
import { Mesa, EstadoMesa } from 'src/app/clases/mesa';
import { Pedido, PedidoProd } from 'src/app/clases/pedido';
import { Producto } from 'src/app/clases/producto';

@Component({
  selector: 'app-lista-clientes-pagando',
  templateUrl: './lista-clientes-pagando.page.html',
  styleUrls: ['./lista-clientes-pagando.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonAvatar,
    IonList,
    IonCardContent,
    IonItem,
    IonButton,
    IonCardHeader,
    IonCardTitle,
    IonLabel,
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
export class ListaClientesPagandoPage implements OnInit {
  protected pedidos: Pedido[] = [];
  protected mesas: Mesa[] = [];
  protected clientes: Cliente[] = [];
  protected productos: Producto[] = [];

  constructor(
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    private modalCtrl: ModalController,
    private auth: AuthService
  ) {
    addIcons({ checkmarkCircleOutline, removeCircleOutline, receiptOutline });
  }

  async ngOnInit() {
    this.spinner.show();

    [this.productos, this.clientes] = await Promise.all([
      this.db.traerColeccion<Producto>(Colecciones.Productos),
      this.db.traerCoincidencias<Cliente>(Colecciones.Usuarios, {
        campo: 'rol',
        operacion: 'eq',
        valor: 'cliente',
      }),
    ]);

    this.db.escucharColeccion<Pedido>(
      Colecciones.Pedidos,
      this.pedidos,
      (pedido) => pedido.estado == 'entregado'
    );

    this.db.escucharColeccion<Mesa>(
      Colecciones.Mesas,
      this.mesas,
      (mesa) => mesa.estado === EstadoMesa.Pago
    );
    this.spinner.hide();
  }

  async manejarEstadoMesa(pedido: Pedido) {
    this.spinner.show();

    const cliente = this.clientes.filter(
      (cliente) => cliente.id == pedido.idCliente
    )[0];
    const mesa = this.mesas.filter((mesa) => mesa.id == cliente.idMesa)[0];

    await Promise.all([
      this.db.actualizarDoc(Colecciones.Mesas, mesa.id, {
        estado: EstadoMesa.Disponible,
      }),
      this.db.actualizarDoc(Colecciones.Usuarios, cliente.id, { idMesa: null }),
    ]);

    this.spinner.hide();
    ToastSuccess.fire('La mesa ya está disponible');
  }

  async mostrarPedido(pedido: Pedido) {
    let productosCant: PedidoProd[] = [];

    this.productos.map((prod) => {
      const ped = pedido.pedidoProd.find((p) => p.nombre === prod.nombre);
      if (ped) productosCant.push({ producto: prod, cantidad: ped.cantidad });
    });

    const modal = await this.modalCtrl.create({
      component: PedidoComponent,
      id: 'pedido-modal',
      componentProps: { pedido: productosCant },
    });
    await modal.present();
  }
}
