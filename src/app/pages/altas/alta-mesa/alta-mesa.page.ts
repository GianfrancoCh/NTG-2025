import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonRadioGroup, IonButton, IonSelectOption, IonInput, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonIcon, IonRadio, IonSelect } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Colecciones, DatabaseService, } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';
import { MySwal, ToastError, ToastSuccess, ToastInfo } from 'src/app/utils/alerts';
import { Mesa, TipoMesa } from 'src/app/clases/mesa';
import { NgxSpinnerService } from 'ngx-spinner';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { QrCodeComponent  } from 'ng-qrcode';
import { FotosService } from 'src/app/services/fotos.service';
import { NavController } from '@ionic/angular/standalone';
import { ErrorCodes, Exception } from 'src/app/clases/exception';

/*
QR de la mesa
● Para poder verificar la disponibilidad de una mesa.
● Para relacionar al cliente con una mesa.
● Para que el cliente pueda 'consultar' al mozo.
● Para que el cliente pueda acceder al menú.
● Para poder ver el estado del pedido.
● Para acceder a la encuesta de satisfacción.
● Para acceder a los juegos.
*/

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
  standalone: true,
  imports: [IonRadio, IonIcon, IonCardContent, IonCardTitle, IonCard, IonCardHeader,  IonButton, IonRadioGroup, IonItem, IonContent, 
    IonHeader, IonTitle, IonToolbar, IonSelectOption, IonInput, CommonModule, FormsModule, ReactiveFormsModule, QrCodeComponent, IonSelect],
})
export class AltaMesaPage {

  frmMesa: FormGroup;
  picture: File | null = null;
  QRs: string = "";
  mesaCreada: boolean = false;
  mesaImg:string = "";
  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private fotosServ: FotosService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    protected navCtrl: NavController,
  ) {
    this.frmMesa = this.formBuilder.group({
      nroMesa: new FormControl('', [Validators.required, Validators.min(1)]),
      cantComensales: new FormControl('', [Validators.required, Validators.min(1)]),
      tipoMesaControl: new FormControl('', [Validators.required]),
      foto: new FormControl('', [Validators.required]),
    });

    addIcons({ search });
  }

  async takePic() {
    const foto = await this.fotosServ.tomarFoto();
    if (foto) {
      this.picture = foto;
      this.frmMesa.controls['foto'].setValue('valid');
      (document.getElementById('btn-tomarFoto')! as HTMLIonButtonElement).disabled = true;
    }
  }

  async uploadPicture(image: File) {
    this.spinner.show();
    const nombreFoto: string = `mesa-${this.frmMesa.controls['nroMesa'].value}`;
    try {
      const url = await this.storage.subirArchivo(image,`${Colecciones.Mesas}/${nombreFoto}`);
      this.spinner.hide();
      ToastSuccess.fire('Imagen subida con éxito!');
      return url;
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Hubo un problema al subir la imagen.');
      return null;
    }
  }

  async manejarNroMesa() {
    let nroMesaExiste = false;
    this.spinner.show();

    await this.db.traerColeccion<Mesa>(Colecciones.Mesas).then( mesas => {
      mesas.forEach( (m, index) => {
        if(m.nroMesa == Number(this.frmMesa.controls['nroMesa'].value)){
          nroMesaExiste = true;
          ToastError.fire('Este Numero de mesa ya se encuentra registrado.');
        }
      });
      if(!nroMesaExiste){
        document.getElementById('nroMesa')!.classList.add('deshabilitado');
        (document.getElementById('input-nroMesa')! as HTMLIonInputElement).disabled = true;
        (document.getElementById('btn-nroMesa')! as HTMLIonButtonElement).style.display = 'none';
          
        document.getElementById('cantComensales')!.classList.remove('deshabilitado');
        document.getElementById('tipoMesa')!.classList.remove('deshabilitado');

        ToastSuccess.fire('El numero de mesa no está en uso.');
      }
    })

    this.spinner.hide();
  }

  async subirMesa() {
    try {
      if (!this.picture) throw new Exception(ErrorCodes.FotoFaltante, 'Debe subir una imagen de la mesa.');
      this.uploadPicture(this.picture).then(async (url) => {
        if (url !== null) {
          this.mesaImg = url;
          const nroMesa = this.frmMesa.controls['nroMesa'].value;
          const cantComensales = this.frmMesa.controls['cantComensales'].value;
          const tipoMesaControl = this.frmMesa.controls['tipoMesaControl'].value;
  
          let mesa = new Mesa(
            nroMesa,
            cantComensales,
            tipoMesaControl,
            url,
            this.QRs
          );
  
          // const mesaId = await this.db.subirDoc(Colecciones.Mesas, mesa, true);
          const mesaId = await this.db.subirMesa(mesa);
          if(mesaId){
            this.generateQRData(mesaId);
            this.mesaCreada = true;
          }
  
        }
        this.spinner.hide();
      });
    } catch (error: any) {
      console.error(error);
      ToastError.fire('Ups...', error.message)
    }
  }

  selecTipo($ev: CustomEvent) {
    this.frmMesa.controls['tipoMesaControl'].setValue($ev.detail.value);
  }

  private generateQRData(mesaId:string) {
    const QRid = `mesa-${mesaId}`;
    console.log(QRid);

    this.db.actualizarDoc(Colecciones.Mesas, mesaId, {'codigo_qr':QRid})
  }

  nuevaMesa() {
    document.getElementById('nroMesa')!.classList.remove('deshabilitado');
    (document.getElementById('input-nroMesa')! as HTMLIonInputElement).disabled = false;
    document.getElementById('btn-nroMesa')!.style.display = 'block';
    document.getElementById('cantComensales')!.classList.add('deshabilitado');
    document.getElementById('tipoMesa')!.classList.add('deshabilitado');
    this.picture = null;
    this.QRs = '';

    this.frmMesa.reset();
  }
}
