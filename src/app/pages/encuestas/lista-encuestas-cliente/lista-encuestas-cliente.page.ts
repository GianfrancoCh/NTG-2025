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
  ],
})
export class ListaEncuestasClientePage {
  lista: Array<EncuestaCliente> = [];

  constructor(
    private modalCtrl: ModalController,
    protected navCtrl: NavController
  ) {
    addIcons({ home, statsChart });
    // inject(DatabaseService).escucharColeccion(
    //   Colecciones.EncuestasCliente,
    //   this.lista,
    //   undefined,
    //   undefined,
    // this.timestampParse
    // );
  }

  // private timestampParse = async (encuesta: EncuestaCliente) => {
  //   encuesta.fecha =
  //     encuesta.fecha instanceof Timestamp
  //       ? encuesta.fecha.toDate()
  //       : encuesta.fecha;
  //   return encuesta;
  // };

  maxEstrellas = (cantidad: number) => Math.ceil(cantidad);

  async mostrarEncuesta(encuesta: EncuestaCliente) {
    const modal = await this.modalCtrl.create({
      component: EncuestaClienteComponent,
      id: 'encuesta-modal',
      componentProps: { encuesta: encuesta },
    });

    modal.present();
  }
}
