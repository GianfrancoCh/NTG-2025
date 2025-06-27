import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { ModalController } from '@ionic/angular/standalone';
import { Cliente } from 'src/app/clases/cliente';
import { EncuestaCliente } from 'src/app/clases/encuestas/encuesta-cliente';
import { EstadoMesa, Mesa } from 'src/app/clases/mesa';
import { Pedido } from 'src/app/clases/pedido';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';

@Component({
  selector: 'app-menu-mesa',
  templateUrl: './menu-mesa.component.html',
  styleUrls: ['./menu-mesa.component.scss'],
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
})
export class MenuMesaComponent implements OnInit {
  protected mesa!: Mesa;
  protected cliente!: Cliente;
  protected pedido!: Pedido;

  estados: EstadoMesa[] = [
    EstadoMesa.Disponible,
    EstadoMesa.Asignada,
    EstadoMesa.SinPedido,
    EstadoMesa.PidiendoComida,
    EstadoMesa.EsperandoComida,
    EstadoMesa.Comiendo,
    EstadoMesa.Pagando,
    EstadoMesa.Pago,
  ];
  hizoEncuesta: boolean = false;
  constructor(
    protected modalCtrl: ModalController,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    this.db
      .traerCoincidencias<EncuestaCliente>(Colecciones.EncuestasCliente, {
        campo: 'idPedido',
        operacion: 'eq',
        valor: this.pedido.id,
      })
      .then((res) => {
        console.log(res);
        this.hizoEncuesta = res.length > 0;
      });
  }
}
