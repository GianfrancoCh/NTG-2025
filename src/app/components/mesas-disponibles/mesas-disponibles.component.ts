import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonRadio,
  IonRadioGroup,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { MySwal } from 'src/app/utils/alerts';
import { EstadoMesa, Mesa } from 'src/app/clases/mesa';
import { Cliente } from 'src/app/clases/cliente';

@Component({
  selector: 'app-mesas-disponibles',
  templateUrl: './mesas-disponibles.component.html',
  styleUrls: ['./mesas-disponibles.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCardContent,
    IonRadioGroup,
    IonRadio,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonList,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
  ],
})
export class MesasDisponiblesComponent implements OnInit {
  @Input({ required: true }) mesas!: Mesa[];
  // @Input({ required: true }) clienteEspera!: ClienteEnEspera;
  @Input({ required: true }) clienteEspera!: Cliente;
  constructor(
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
    protected modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    if (!this.mesas) throw new Error('Campo `mesasDisp` no existe.');
    if (!this.clienteEspera) throw new Error('Campo `cliente` no existe.');
  }

  selecMesa(mesa: Mesa) {
    MySwal.fire({
      title: `¿Confirmar mesa #${mesa.nroMesa} para ${this.clienteEspera.nombre}?`,
      imageUrl: mesa.foto_url,
      showConfirmButton: true,
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    })
      .then(async (res) => {
        if (res.isConfirmed) {
          this.spinner.show();
          await Promise.all([
            this.db.borrarDoc(
              Colecciones.ListaDeEspera,
              this.clienteEspera!.id
            ),
            this.db.actualizarDoc(Colecciones.Mesas, mesa.id, {
              estado: EstadoMesa.Asignada,
            }),
            this.db.actualizarDoc(
              Colecciones.Usuarios,
              this.clienteEspera!.id,
              { idMesa: mesa.id }
            ),
          ]);
          this.modalCtrl.dismiss({}, 'success');
          this.spinner.hide();
        } else this.modalCtrl.dismiss({}, 'cancel');
      })
      .catch((error: any) => {
        console.error(error);
        this.modalCtrl.dismiss(error, 'error');
      });
  }
}
