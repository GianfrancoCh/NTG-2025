import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
} from '@ionic/angular/standalone';
import { EncuestaClienteComponent } from 'src/app/components/encuesta-cliente/encuesta-cliente.component';
import { EncuestaCliente } from 'src/app/clases/encuestas/encuesta-cliente';
import { addIcons } from 'ionicons';
import { home, statsChart } from 'ionicons/icons';
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
    CommonModule,
    FormsModule,
    RouterLink,
    RangeEstrellasComponent,
  ],
  providers: [ModalController],
})
export class ListaEncuestasClientePage implements OnInit {
  lista: Array<EncuestaCliente> = [];

  constructor(
    private modalCtrl: ModalController,
    protected navCtrl: NavController,
    private db: DatabaseService
  ) {
    addIcons({ home, statsChart });
  }

  async ngOnInit() {
    try {
      this.lista = await this.db.traerColeccion<EncuestaCliente>(
        Colecciones.EncuestasCliente,
        'fecha' // si querés que se ordene por fecha
      );
      console.log('Encuestas cliente:', this.lista);
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
    }
  }

  maxEstrellas = (cantidad: number) => Math.ceil(cantidad);

  async mostrarEncuesta(encuesta: EncuestaCliente) {
    const modal = await this.modalCtrl.create({
      component: EncuestaClienteComponent,
      id: 'encuesta-modal',
      cssClass: 'modal-transparente', 
      componentProps: { encuesta: encuesta },
    });

    modal.present();
  }
}
