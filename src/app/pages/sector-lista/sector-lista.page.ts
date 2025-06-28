import { Component, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { DatabaseService } from 'src/app/services/database.service';
import { Pedido, sectorPendiente } from 'src/app/clases/pedido';

@Component({
  standalone: true,
  selector: 'app-sector-lista',
  templateUrl: './sector-lista.page.html',
  styleUrls: ['./sector-lista.page.scss'],
  imports: [
    IonProgressBar,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    IonCard,
    IonButton,
    IonContent,
  ],
})
export class SectorListaPage implements OnInit {
  sector!: 'cocina' | 'barra';
  pedidos: Signal<Pedido[]> = signal([]);

  constructor(private route: ActivatedRoute, private db: DatabaseService) {}

  ngOnInit(): void {
    this.sector = this.route.snapshot.paramMap.get('tipo') as
      | 'cocina'
      | 'barra';

    /* Suscripción en tiempo real a los pedidos “en proceso” */
    this.db.escucharColeccion(
      'pedidos',
      this.pedidos(),
      (p) =>
        p.estado === 'en proceso' &&
        sectorPendiente(p, this.sector) &&
        p.pedidoProd.some((prod: any) => prod.sector === this.sector)
    );
  }

  async marcarListo(p: Pedido) {
    await this.db.actualizarDoc('pedidos', p.id, {
      confirmaciones: { ...p.confirmaciones, [this.sector]: true },
    });
  }
}
