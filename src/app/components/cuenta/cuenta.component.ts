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
import { AuthService } from 'src/app/services/auth.service';
import { Cliente } from 'src/app/clases/cliente';

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
  tieneDescuentoJuego: boolean = false;
  protected usuario!: Cliente;
  descuentoTotal: number = 0;
  precioOriginal: number = 0;

  constructor(
    protected modalCtrl: ModalController,
    private db: DatabaseService,
    private auth: AuthService,
  ) {}

  async ngOnInit() {
    if (!this.pedido) throw new Error('Campo `pedido` no existe.');

    const productos = await this.db.traerColeccion<Producto>(Colecciones.Productos);
    productos.map((prod) => {
      const pedido = this.pedido.pedidoProd.find(
        (p) => p.nombre === prod.nombre
      );
      if (pedido)
        this.pedidoProds.push({ producto: prod, cantidad: pedido.cantidad });
    });

    if (this.auth.UsuarioEnSesion?.rol === 'cliente') {
      this.usuario = this.auth.UsuarioEnSesion as Cliente;
    }

    this.tieneDescuentoJuego = await this.db.verificarDescuentoJugador(this.usuario.id);
    console.log('Tiene descuento de juego:', this.tieneDescuentoJuego);

    this.precioOriginal = this.pedido.precio; 
    let subtotal = this.precioOriginal;

    if (this.tieneDescuentoJuego) {
      this.descuentoTotal = this.precioOriginal * 0.15;
      subtotal = this.precioOriginal - this.descuentoTotal;
    }

    this.propinaTotal = (subtotal * this.pedido.porcPropina) / 100;
    this.valorTotal = subtotal + this.propinaTotal;
  }

  fechaHoy = () => new Date();
}
