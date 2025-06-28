import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonProgressBar,
  IonHeader,
} from '@ionic/angular/standalone';
import { DatabaseService } from 'src/app/services/database.service';
import { Pedido } from 'src/app/clases/pedido';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-estado-pedido',
  templateUrl: './estado-pedido.page.html',
  styleUrls: ['./estado-pedido.page.scss'],
  imports: [IonHeader, IonContent, IonProgressBar, CommonModule],
})
export class EstadoPedidoPage implements OnInit, OnDestroy {
  pedido?: Pedido;
  canal?: RealtimeChannel;

  constructor(private route: ActivatedRoute, private db: DatabaseService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.canal = this.db.escucharPedido(id, (p) => (this.pedido = p));
  }

  ngOnDestroy(): void {
    if (this.canal) this.db.supabase.removeChannel(this.canal);
  }
}
