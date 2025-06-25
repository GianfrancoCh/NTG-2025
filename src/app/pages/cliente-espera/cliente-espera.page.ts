import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular/standalone';
import { NgxSpinnerService } from 'ngx-spinner';
import { Cliente } from 'src/app/clases/cliente';
import { Mesa } from 'src/app/clases/mesa';
import { ToastSuccess } from 'src/app/utils/alerts';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cliente-espera',
  templateUrl: './cliente-espera.page.html',
  styleUrls: ['./cliente-espera.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class ClienteEsperaPage implements OnInit {
  canalUsuario!: RealtimeChannel;

  constructor(
    private db: DatabaseService,
    private auth: AuthService,
    private navCtrl: NavController,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
    const usuario = this.auth.UsuarioEnSesion!;
    this.canalUsuario = this.db.escucharUsuario(
      usuario.id,
      async (cliente: Cliente) => {
        console.log('Cambio en cliente:', cliente);
        if (!cliente.idMesa) return;

        this.spinner.show();
        const mesa = await this.db.traerDoc<Mesa>('mesas', cliente.idMesa);
        this.spinner.hide();

        ToastSuccess.fire({
          title: `Se le ha asignado la mesa N°${mesa?.nroMesa}`,
          timer: 15000, // aumento duracion del toast
        });
        this.navCtrl.navigateRoot('home');

        // Opcional: cerrar canal
        this.db.supabase.removeChannel(this.canalUsuario);
      }
    );
  }

  salirDeListaEspera() {
    //quitar de la db lista-espera el cliente
    this.navCtrl.navigateRoot('home');

    // Opcional: cerrar canal
    this.db.supabase.removeChannel(this.canalUsuario);
  }
}
