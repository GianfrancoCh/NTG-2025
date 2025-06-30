import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonRadio,
  IonButton,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';
import { MySwal, ToastError, ToastSuccess } from 'src/app/utils/alerts';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RangeEstrellasComponent } from 'src/app/components/range-estrellas/range-estrellas.component';
import { NavController } from '@ionic/angular/standalone';
import { FotosService } from 'src/app/services/fotos.service';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/clases/cliente';
import { EncuestaCliente } from 'src/app/clases/encuestas/encuesta-cliente';
import { Exception, ErrorCodes } from 'src/app/clases/exception';

@Component({
  selector: 'app-alta-encuesta-cliente',
  templateUrl: './alta-encuesta-cliente.page.html',
  styleUrls: ['./alta-encuesta-cliente.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonRadio,
    IonLabel,
    IonItem,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RangeEstrellasComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AltaEncuestaClientePage {
  frmEncuesta: FormGroup;
  fotos: { archivo: File | null; url: string | null }[] = [];
  idPedido: string;

  constructor(
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private db: DatabaseService,
    private storage: StorageService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private fotosServ: FotosService
  ) {
    this.frmEncuesta = this.formBuilder.group({
      puntuacionGeneral: [
        5,
        [Validators.required, Validators.min(0), Validators.max(5)],
      ],
      comida: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      atencion: ['buena', [Validators.required]],
      recomendacion: [false, [Validators.required]],
      comentarios: ['', [Validators.required]],
    });

    const navigation = inject(Router).getCurrentNavigation();
    this.idPedido = navigation?.extras?.state?.['idPedido'];
    if (!this.idPedido) throw new Error('Falta idPedido.');
  }

  onComidaChange(event: any) {
    this.frmEncuesta.controls['comida'].setValue(event.detail.value);
  }

  onAtencionChange(event: any) {
    this.frmEncuesta.controls['atencion'].setValue(event.detail.value);
  }
  onRecomendacionChange(event: any) {
    this.frmEncuesta.controls['recomendacion'].setValue(event.detail.checked);
  }
  async tomarFoto(): Promise<void> {
    try {
      while (this.fotos.length < 3) {
        const foto: any = await this.fotosServ.tomarFoto();
        if (!foto)
          throw new Exception(
            ErrorCodes.FotoCancelada,
            'Debe tomar por lo menos una foto.'
          );

        if (foto) {
          this.fotos.push({ archivo: foto, url: URL.createObjectURL(foto) });
        }
        if (this.fotos.length < 3) {
          const { isConfirmed } = await MySwal.fire({
            title: '¿Desea tomar otra foto?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            icon: 'question',
          });
          if (!isConfirmed) break;
        }
      }
    } catch (error: any) {
      ToastError.fire('Ups...', error.message);
      console.log(error);
    }
  }

  async subirFotos(): Promise<void> {
    try {
      this.spinner.show();
      const promesas = this.fotos.map(async (foto, indice) => {
        if (foto.archivo) {
          const cliente = this.auth.UsuarioEnSesion as Cliente;
          const nombreFotoBase = `${cliente.id}-${new Date().getTime()}-${
            indice + 1
          }`;
          const url = await this.storage.subirArchivo(
            foto.archivo,
            `${Colecciones.EncuestasCliente}/${nombreFotoBase}`
          );
          foto.url = url;
        }
      });
      await Promise.all(promesas);
    } catch (error: any) {
      ToastError.fire('Ups...', error.message);
    } finally {
      this.spinner.hide();
    }
  }

  async subirEncuesta() {
    try {
      await this.tomarFoto();
      if (this.fotos.length === 0) {
        throw new Exception(
          ErrorCodes.FotoFaltante,
          'Debe adjuntar al menos una foto.'
        );
      }

      await this.subirFotos();

      const cliente = this.auth.UsuarioEnSesion as Cliente;
      const nuevaEncuesta = new EncuestaCliente(
        cliente,
        this.idPedido,
        this.frmEncuesta.value.puntuacionGeneral,
        this.frmEncuesta.value.comida,
        this.frmEncuesta.value.atencion,
        this.frmEncuesta.value.recomendacion,
        this.fotos.map((f) => f.url as string),
        this.frmEncuesta.value.comentarios
      );
      const encuestaObj = {
        autor: nuevaEncuesta.autor,
        idPedido: String(nuevaEncuesta.idPedido),
        puntuacionGeneral: Number(nuevaEncuesta.puntuacionGeneral),
        comida: Number(nuevaEncuesta.comida),
        atencion: nuevaEncuesta.atencion,
        recomendacion: nuevaEncuesta.recomendacion,
        fotoUrls: JSON.stringify(nuevaEncuesta.fotoUrls),
        comentarios: nuevaEncuesta.comentarios,
      };

      await this.db.subirDoc(Colecciones.EncuestasCliente, encuestaObj);
      // await this.db.subirDoc(Colecciones.EncuestasCliente, nuevaEncuesta);
      this.navCtrl.navigateRoot('home');
      ToastSuccess.fire('Encuesta subida!');
    } catch (error: any) {
      ToastError.fire('Ups...', error.message);
    }
  }
}
