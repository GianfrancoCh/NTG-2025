import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Ionic stand-alone */
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  NavController,
  ModalController,
  IonIcon,
  IonButton,
  IonText,
  IonList,
  IonItem,
  IonCard,
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';

import { EncuestaClienteComponent } from 'src/app/components/encuesta-cliente/encuesta-cliente.component';
import { EncuestaCliente } from 'src/app/clases/encuestas/encuesta-cliente';
import { addIcons } from 'ionicons';
import { home, statsChart, star, clipboardOutline } from 'ionicons/icons';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { RouterLink } from '@angular/router';
import { RangeEstrellasComponent } from 'src/app/components/range-estrellas/range-estrellas.component';

@Component({
  selector: 'app-lista-encuestas-cliente',
  templateUrl: './lista-encuestas-cliente.page.html',
  styleUrls: ['./lista-encuestas-cliente.page.scss'],
  standalone: true,
  imports: [
    /* Ionic */
    IonBadge,
    IonLabel,
    IonCardTitle,
    IonCardContent,
    IonCardHeader,
    IonButtons,
    IonBackButton,
    IonAvatar,
    IonCard,
    IonItem,
    IonList,
    IonText,
    IonButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    /* Angular */
    CommonModule,
    FormsModule,
    RouterLink,
    /* Componentes propios */
    RangeEstrellasComponent,
  ],
  providers: [ModalController],
})
export class ListaEncuestasClientePage implements OnInit {
  /** Lista principal que ya usabas */
  lista: EncuestaCliente[] = [];

  /** Alias para que el template siga funcionando */
  encuestas: EncuestaCliente[] = [];

  /** Array de longitud fija para *ngFor de estrellas */
  stars = Array.from({ length: 5 });

    defaultAvatar = 'assets/default.png';

  constructor(
    private modalCtrl: ModalController,
    protected navCtrl: NavController,
    private db: DatabaseService
  ) {
    addIcons({ clipboardOutline, star, home, statsChart });
  }

  /* ─────────── Ciclo de vida ─────────── */
  async ngOnInit() {
    try {
      this.lista = await this.db.traerColeccion<EncuestaCliente>(
        Colecciones.EncuestasCliente,
        'fecha'
      );
      this.encuestas = this.lista; // alias
      console.log('Encuestas cliente:', this.encuestas);
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
    }
  }

  /* ─────────── Métodos auxiliares ─────────── */
  maxEstrellas = (cantidad: number) => Math.ceil(cantidad);

  /** Devuelve 0-5 valorando distintos campos posibles */
  rating(enc: EncuestaCliente): number {
    const r =
      (enc as any).puntuacionGeneral ??
      (enc as any).promedio ??
      (enc as any).puntaje ??
      0;
    return Math.max(0, Math.min(5, Math.round(r)));
  }

  /** TrackBy simple para *ngFor */
  trackById(_: number, enc: EncuestaCliente) {
    return enc.id;
  }

  /** Vuelve un array de 5 posiciones (si prefieres usarlo) */
  getStars(total: number): number[] {
    return Array(5).fill(0);
  }

  /* ─────────── Modal detalle ─────────── */
  async mostrarEncuesta(encuesta: EncuestaCliente) {
    const modal = await this.modalCtrl.create({
      component: EncuestaClienteComponent,
      id: 'encuesta-modal',
      cssClass: 'modal-transparente',
      componentProps: { encuesta },
    });

    modal.present();
  }

  fotoDe(enc: EncuestaCliente): string {
  const e:any = enc;
  return (
    e.foto ||
    e.fotoCliente ||
    e.img_url ||
    e.imgUrl ||
    this.defaultAvatar
  );
}

/* Devuelve el nombre del cliente */
nombreDe(enc: EncuestaCliente): string {
  const e:any = enc;
  return (
    e.nombre ||
    e.nombreCliente ||
    e.clienteNombre ||
    'Cliente'
  );
}
}


