import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonTitle,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonFooter,
} from '@ionic/angular/standalone';
import {
  AlertController,
  NavController,
  ModalController,
} from '@ionic/angular/standalone';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { Pedido, PedidoProd } from 'src/app/clases/pedido';
import { Producto } from 'src/app/clases/producto';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonTitle,
    IonCard,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonFooter,
  ],
  providers: [ModalController],
})
export class CuentaComponent implements OnInit {
  pedido!: Pedido;
  pedidoProds: PedidoProd[] = [];
  valorTotal: number = 0;
  propinaTotal: number = 0;

  constructor(
    protected modalCtrl: ModalController,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    if (!this.pedido) throw new Error('Campo `pedido` no existe.');
    this.db.traerColeccion<Producto>(Colecciones.Productos).then((prods) => {
      prods.map((prod) => {
        const pedido = this.pedido.pedidoProd.find(
          (p) => p.nombre === prod.nombre
        );
        if (pedido)
          this.pedidoProds.push({ producto: prod, cantidad: pedido.cantidad });
      });
    });

    this.propinaTotal = (this.pedido.precio * this.pedido.porcPropina) / 100;
    this.valorTotal = this.pedido.precio + this.propinaTotal;
  }

  fechaHoy = () => new Date();
}
