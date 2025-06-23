import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCardHeader,
  IonCard,
  IonList,
  IonButton,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { ToastError, ToastInfo, ToastSuccess } from 'src/app/utils/alerts';
import { ClienteEnEspera } from 'src/app/utils/interfaces/interfaces';
import { EstadoMesa, Mesa } from 'src/app/clases/mesa';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { NgxSpinnerService } from 'ngx-spinner';
import { delay } from 'rxjs';
import { Cliente } from 'src/app/clases/cliente';
import { MesasDisponiblesComponent } from 'src/app/components/mesas-disponibles/mesas-disponibles.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-espera',
  templateUrl: './lista-espera.page.html',
  styleUrls: ['./lista-espera.page.scss'],
  standalone: true,
  imports: [
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonList,
    IonCard,
    IonCardHeader,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ModalController],
})
export class ListaEsperaPage implements OnInit {
  listaDeEspera: ClienteEnEspera[] = [];
  clientesEsperando: Cliente[] = [];
  mesasDisp: Mesa[] = [];

  constructor(
    private db: DatabaseService,
    protected navCtrl: NavController,
    private spinner: NgxSpinnerService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.spinner.show();

    try {
      // Paso 1: Traer la lista de espera
      this.listaDeEspera = await this.db.traerColeccion<ClienteEnEspera>(
        Colecciones.ListaDeEspera,
        'fecha' 
      );

      // Paso 2: Por cada id_cliente, traer datos del cliente desde 'usuarios'
      const clientes: Cliente[] = [];

      for (const item of this.listaDeEspera) {
        const cliente = await this.db.traerDoc<Cliente>(
          Colecciones.Usuarios,
          item.id_cliente
        );
        if (cliente) {
          clientes.push(cliente);
        }
      }

      this.clientesEsperando = clientes;
      console.log('Clientes en espera:', this.clientesEsperando);

      //traer las mesas disponibles y cargarlas en mesasDisp
      this.mesasDisp = await this.db.traerCoincidencias<Mesa>(
        Colecciones.Mesas,
        { campo: 'estado', operacion: 'eq', valor: 'Disponible' }
      );
      console.log('Mesas disponibles:', this.mesasDisp);
    } catch (error) {
      console.error('Error al cargar lista de espera:', error);
    }

    await delay(3000);
    this.spinner.hide();
  }

  // private timestampParse = async (cliEspera: ClienteEnEspera) => {
  //   cliEspera.fecha =
  //     cliEspera.fecha instanceof Timestamp
  //       ? cliEspera.fecha.toDate()
  //       : cliEspera.fecha;
  //   return cliEspera;
  // };

  // async selecCliente(cliente: ClienteEnEspera) {
  async selecCliente(cliente: Cliente) {
    try {
      const mesasModal = await this.modalCtrl.create({
        component: MesasDisponiblesComponent,
        componentProps: {
          mesas: this.mesasDisp,
          clienteEspera: cliente,
        },
        id: 'mesas-modal',
      });

      await mesasModal.present();

      const modalDismiss = await mesasModal.onDidDismiss();

      switch (modalDismiss.role) {
        case 'success':
          ToastSuccess.fire('Cliente asignado!');
          break;
        case 'cancel':
          ToastInfo.fire('Operación cancelada.');
          break;
        case 'error':
          ToastError.fire('Ups...', modalDismiss.data);
          break;
      }
    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }
}
