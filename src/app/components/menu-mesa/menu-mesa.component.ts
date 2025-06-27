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
})
export class MenuMesaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
