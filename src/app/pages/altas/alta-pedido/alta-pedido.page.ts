import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonPopover,
  IonFooter,
  IonCardSubtitle,
  IonText,
  IonBadge,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { ModalController, NavController } from '@ionic/angular/standalone';
import { PedidoComponent } from 'src/app/components/pedido/pedido.component';
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  addCircleOutline,
  removeCircleOutline,
  chatboxEllipsesOutline,
  caretDownOutline,
  chatbubbleEllipsesOutline,
} from 'ionicons/icons';
import { NgxSpinnerService } from 'ngx-spinner';
import { Cliente } from 'src/app/clases/cliente';
import { EstadoMesa } from 'src/app/clases/mesa';
import { Pedido } from 'src/app/clases/pedido';
import { Producto } from 'src/app/clases/producto';
import { AuthService } from 'src/app/services/auth.service';
import {
  DatabaseService,
  Colecciones,
} from 'src/app/services/database.service';
import { ToastSuccess } from 'src/app/utils/alerts';
import { each } from 'chart.js/dist/helpers/helpers.core';

@Component({
  selector: 'app-alta-pedido',
  templateUrl: './alta-pedido.page.html',
  styleUrls: ['./alta-pedido.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonBadge,
    IonText,
    IonCardSubtitle,
    IonFooter,
    IonPopover,
    IonButton,
    IonAccordionGroup,
    IonAccordion,
    IonIcon,
    IonList,
    IonLabel,
    IonItem,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    NgOptimizedImage,
  ],
  providers: [ModalController],
})
export class AltaPedidoPage {
  precio: number = 0;
  productosElegidos: { [id: string]: number } = {};
  productos: Producto[] = [];
  constructor(
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    private modalCtrl: ModalController,
    protected navCtrl: NavController,
    private auth: AuthService
  ) {
    this.spinner.show();

    this.db.traerColeccion<Producto>(Colecciones.Productos).then((prods) => {
      this.productos = prods;
      this.spinner.hide();

      this.productos.forEach((prod) => {
        if (typeof prod.fotos_url === 'string') {
          try {
            prod.fotos_url = JSON.parse(prod.fotos_url);
            console.log('Fotos URL parseadas:', prod.fotos_url);
          } catch (e) {
            console.error('Error al parsear fotos_url:', prod.fotos_url);
            prod.fotos_url = []; // fallback vacío si hay error
          }
        }
      });
      
    });

    addIcons({
      chatbubbleEllipsesOutline,
      receiptOutline,
      caretDownOutline,
      removeCircleOutline,
      addCircleOutline,
      chatboxEllipsesOutline,
    });
  }

  restarProd(prod: Producto) {
    if (this.productosElegidos[prod.id]) {
      this.precio -= this.precio > 0 ? prod.precio : 0;

      if (this.productosElegidos[prod.id] > 1)
        this.productosElegidos[prod.id]--;
      else delete this.productosElegidos[prod.id];
    }
  }

  manejarProdCant(prod: Producto, inputEv: CustomEvent) {
    const cant: number = Number(inputEv.detail.value ?? '');
    if (cant === 0) delete this.productosElegidos[prod.id];
    else this.productosElegidos[prod.id] = cant;
  }

  sumarProd(prod: Producto) {
    this.productosElegidos[prod.id] =
      (this.productosElegidos[prod.id] || 0) + 1;
    if (this.productosElegidos[prod.id]) this.precio += prod.precio;
  }

  readonly Object = Object;

  async mostrarPedido() {
    const pedido = this.productos
      .filter((prod) => !!this.productosElegidos[prod.id])
      .map((prod) => {
        const cant = this.productosElegidos[prod.id];
        return { producto: prod, cantidad: cant };
      });
    const modal = await this.modalCtrl.create({
      component: PedidoComponent,
      id: 'pedido-modal',
      componentProps: { pedido: pedido },
    });

    await modal.present();
    const modalDismiss = await modal.onDidDismiss();
    if (modalDismiss.role === 'confirm') {
      const pedidoHecho: Pedido = modalDismiss.data;
      pedidoHecho.idCliente = this.auth.UsuarioEnSesion!.id;

      // Evitar subir el id vacío
      const { id, ...pedidoSinId } = pedidoHecho;

      // Subir el pedido
      // const idGenerado = await this.db.subirDoc(
      //   Colecciones.Pedidos,
      //   pedidoSinId
      // );

      // if (idGenerado) {
      //   pedidoHecho.id = idGenerado; // ahora el objeto tiene el id correcto
      // }
      this.spinner.show();
      this.db.subirDoc(Colecciones.Pedidos, pedidoHecho).then(() => {
        console.log('pedidoHecho:', pedidoHecho);

        this.db.actualizarDoc(
          Colecciones.Mesas,
          (<Cliente>this.auth.UsuarioEnSesion).idMesa!,
          { estado: EstadoMesa.EsperandoComida }
        );
        this.spinner.hide();
        ToastSuccess.fire('En instantes un mozo le confirmará su pedido');
        this.navCtrl.navigateRoot('home');
      });
    }
  }
}
