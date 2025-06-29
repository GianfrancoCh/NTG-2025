import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';

/* Ionic (stand-alone) */
import {
  IonContent,
  IonButtons,
  IonToolbar,
  IonBackButton,
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
  standalone: true,
  imports: [
    /* Ionic */
    IonContent,
    IonButtons,
    IonToolbar,
    IonBackButton,
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
    /* Angular */
    CommonModule,
  ],
})
export class MenuMesaComponent implements OnInit {
  /* ────────────── Entradas ────────────── */
  @Input() mesa!: Mesa;
  @Input() cliente!: Cliente;
  /** Puede venir undefined si aún no se generó el pedido */
  @Input() pedido?: Pedido;

  /* ────────────── Propiedades auxiliares ────────────── */
  estados: EstadoMesa[] = Object.values(EstadoMesa);
  /** True ↔ el cliente ya completó una encuesta para este pedido */
  hizoEncuesta = false;

  constructor(
    protected modalCtrl: ModalController,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    /* Si todavía no hay pedido, no hay nada que verificar */
    if (!this.pedido) return;

    /* Comprobar si existe encuesta asociada al pedido */
    const encuestas = await this.db.traerCoincidencias<EncuestaCliente>(
      Colecciones.EncuestasCliente,
      {
        campo: 'idPedido',
        operacion: 'eq',
        valor: this.pedido.id,
      }
    );
    this.hizoEncuesta = encuestas.length > 0;
  }
}
