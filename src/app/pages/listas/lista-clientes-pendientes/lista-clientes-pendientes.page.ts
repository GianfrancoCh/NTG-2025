import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonIcon,
  IonLabel,
  IonList,
  IonAvatar,
  IonItem,
} from '@ionic/angular/standalone';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Cliente } from 'src/app/clases/cliente';
import { delay } from 'rxjs';
import { ToastSuccess } from 'src/app/utils/alerts';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, removeCircleOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-lista-clientes-pendientes',
  templateUrl: './lista-clientes-pendientes.page.html',
  styleUrls: ['./lista-clientes-pendientes.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonAvatar,
    IonList,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class ListaClientesPendientesPage implements OnInit {
  protected clientes: Cliente[] = [];

  constructor(
    protected db: DatabaseService,
    private spinner: NgxSpinnerService,
    // private push: PushService,
    protected navCtrl: NavController
  ) {
    addIcons({ checkmarkCircleOutline, removeCircleOutline });
  }

  async ngOnInit() {
    this.spinner.show();

    try {
      const clientesFiltrados = await this.db.traerCoincidencias<Cliente>(
        Colecciones.Usuarios,
        {
          campo: '', 
          operacion: '',
          valor: { rol: 'cliente', estado: 'pendiente' },
        }
      );
      this.clientes = clientesFiltrados;
    } catch (error) {
      console.error('Error al traer clientes pendientes:', error);
    }

    await delay(2500);
    this.spinner.hide();
  }

  async manejarCliente(cliente: Cliente, estado: 'aceptado' | 'rechazado') {
    this.spinner.show();
    await this.db.actualizarDoc(Colecciones.Usuarios, cliente.id, {
      estado: estado,
    });
    ToastSuccess.fire(`Cliente ${estado}!`);

    // this.push.sendMail(estado === 'aceptado', cliente.nombre, cliente.correo);
    console.log('Enviando correo al cliente:', cliente.correo);

    this.spinner.hide();
  }
}
