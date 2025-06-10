import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonIcon, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { Colecciones, DatabaseService } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';
import { MySwal, ToastSuccess } from 'src/app/utils/alerts';
import { Producto } from 'src/app/clases/producto';
import { QrCodeComponent  } from 'ng-qrcode';
import { NgxSpinnerService } from 'ngx-spinner';
import { addIcons } from 'ionicons';
import { helpCircleOutline } from 'ionicons/icons';
import { FotosService } from 'src/app/services/fotos.service';

@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.page.html',
  styleUrls: ['./alta-producto.page.scss'],
  standalone: true,
  imports: [IonRadio, IonRadioGroup, IonIcon, IonCardContent, IonCardTitle, IonCard, IonCardHeader, IonButton, IonLabel, IonItem, IonContent,
    IonHeader, IonTitle, IonToolbar, CommonModule, IonInput, ReactiveFormsModule, QrCodeComponent ]
})
export class AltaProductoPage {
  frmProducto: FormGroup;
  fotos: { archivo: File | null, url: string | null }[] = [];
  qrData: string | null = null; // 

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private db: DatabaseService,
    private storage: StorageService,
    private fotosServ: FotosService
  ) {
    this.frmProducto = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      minutos: [0, [Validators.required, Validators.min(0)]],
      sector: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
    });

    addIcons({ helpCircleOutline });
  }

  private async tomarFotos(): Promise<void> {
    try {
      let continuarTomando = true;
      while (continuarTomando || this.fotos.length < 3) {
        const foto = await this.fotosServ.tomarFoto();
        if (foto) {
          this.fotos.push({ archivo: foto, url: URL.createObjectURL(foto) });
        }
        // Pregunta al usuario si desea tomar otra foto, excepto cuando tienen menos de 3 fotos
        if (this.fotos.length >= 3) {
          const resultado = await MySwal.fire({
            title: '¿Desea tomar otra foto?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
          });
          continuarTomando = resultado.isConfirmed;
        }
      }
    } catch (er: any) {
      await MySwal.fire('Algo salió mal.', er.message, 'error');
    }
  }

  private async subirFotos(): Promise<void> {
    try {
      this.spinner.show();
      const promesas = this.fotos.map(async (foto, indice) => {
        if (foto.archivo) {
          const nombreFotoBase = `${this.frmProducto.value.nombre}-foto-${indice + 1}`;
          const url = await this.storage.subirArchivo(foto.archivo, `${Colecciones.Productos}/${nombreFotoBase}`);
          foto.url = url;
        }
      });
      await Promise.all(promesas);
    } catch (error: any) {
      console.error("Error al subir fotos:", error);
    } finally {
      this.spinner.hide();
    }
  }

  selecSector($ev: CustomEvent) {
    this.frmProducto.controls['sector'].setValue($ev.detail.value);
  }

  async subirProducto() {
    try {
      await this.tomarFotos();

      this.spinner.show();
      await this.subirFotos();

      const producto = new Producto(
        this.frmProducto.value.nombre,
        this.frmProducto.value.descripcion,
        this.frmProducto.value.minutos,
        this.frmProducto.value.precio,
        this.frmProducto.value.sector,
        this.fotos.filter(f => f.url !== null).map(f => f.url as string),
      );
      await this.db.subirProducto(producto);
      this.qrData = `Producto: ${producto.nombre}\nDescripción: ${producto.descripcion}\nPrecio: ${producto.precio}`;
      ToastSuccess.fire('Producto agregado con éxito');
      this.frmProducto.reset({
        nombre: '',
        descripcion: '',
        minutos: 0,
        sector: '',
        precio: 0
      });
      this.fotos = [];
      const radio = document.getElementById('sector-radio')! as HTMLIonRadioGroupElement;
      radio.value = '';

      this.spinner.hide();
    } catch (error: any) {
      this.spinner.hide();
      console.error("Error al subir producto:", error);
    }
  }
}
