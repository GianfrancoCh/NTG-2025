import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';
import {
  MySwal,
  ToastError,
  ToastSuccess,
  ToastInfo,
} from 'src/app/utils/alerts';
import { AuthService } from 'src/app/services/auth.service';
import {
  Colecciones,
  DatabaseService,
} from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';
import { Jefe, TipoJefe } from 'src/app/clases/jefe';
import { NgxSpinnerService } from 'ngx-spinner';
import { Exception, ErrorCodes } from 'src/app/clases/exception';
import { addIcons } from 'ionicons';
import { search, scanOutline, scanCircleOutline } from 'ionicons/icons';
import { Barcode, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { ScannerService } from 'src/app/services/scanner.service';
import { FotosService } from 'src/app/services/fotos.service';

@Component({
  selector: 'app-alta-supervisor',
  templateUrl: './alta-supervisor.page.html',
  styleUrls: ['./alta-supervisor.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonRadio,
    IonRadioGroup,
    IonItem,
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonInputPasswordToggle,
  ],
})
export class AltaSupervisorPage {
  picture!: File;
  tempImg: string = '';

  isSupported = false;

  frmSupervisor: FormGroup;
  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private scanner: ScannerService,
    private fotosServ: FotosService
  ) {
    this.frmSupervisor = this.formBuilder.group({
      nombre: new FormControl('', [Validators.required]),
      apellido: new FormControl('', [Validators.required]),
      DNI: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^\b[\d]{1,3}(\.|\-|\/| )?[\d]{3}(\.|\-|\/| )?[\d]{3}$/
        ),
      ]),
      CUIL: new FormControl('', [Validators.required, this.verificarCuil]),
      correo: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
      ]),
      foto: new FormControl('', [Validators.required]),
      contra: new FormControl('', [Validators.required]),
      reContra: new FormControl('', [
        Validators.required,
        this.contraseñasCoinciden,
      ]),
      supervisorDueno: [null, [Validators.required]],
    });

    addIcons({ search, scanOutline, scanCircleOutline });
  }

  async takePic() {
    const foto = await this.fotosServ.tomarFoto();
    if (foto) this.picture = foto;
    this.frmSupervisor.controls['foto'].setValue('valid');
    this.frmSupervisor.updateValueAndValidity();
  }

  async uploadPicture(image: File) {
    try {
      this.spinner.show();
      const dni = <string>this.frmSupervisor.controls['DNI'].value;

      const url = await this.storage.subirArchivo(
        image,
        `${Colecciones.Usuarios}/jefe-${dni}`
      );
      this.spinner.hide();
      ToastSuccess.fire('Imagen subida con éxito!');
      return url;
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Hubo un problema al subir la imagen.');
      return null;
    }
  }

  async subirSupervisor() {
    const fotoUrl = await this.uploadPicture(this.picture);
    if (fotoUrl) {
      const nombre = this.frmSupervisor.controls['nombre'].value;
      const apellido = this.frmSupervisor.controls['apellido'].value;
      const DNI = Number(
        this.frmSupervisor.controls['DNI'].value.replace(/[-. ]/g, '')
      );
      const CUIL = Number(
        this.frmSupervisor.controls['CUIL'].value.replace(/[-. ]/g, '')
      );
      const correo = this.frmSupervisor.controls['correo'].value;
      const contra = this.frmSupervisor.controls['contra'].value;
      const supervisorDueno = this.frmSupervisor.controls['supervisorDueno']
        .value as TipoJefe;

      let jefe = new Jefe(
        nombre,
        apellido,
        DNI,
        CUIL,
        correo,
        fotoUrl,
        supervisorDueno
      );
      console.log('Jefe a registrar:', jefe);
      this.auth.registrarSupervisor(jefe, contra);
    }
  }

  async manejarCorreo() {
    this.spinner.show();

    await this.db
      .buscarUsuarioPorCorreo(this.frmSupervisor.controls['correo'].value)
      .then((pers) =>
        ToastError.fire('Este correo ya se encuentra registrado.')
      )
      .catch((error: any) => {
        if (
          error instanceof Exception &&
          error.code === ErrorCodes.CorreoNoRegistrado
        ) {
          document.getElementById('correo')!.classList.add('deshabilitado');
          (
            document.getElementById('input-correo')! as HTMLIonInputElement
          ).disabled = true;
          (
            document.getElementById('btn-correo')! as HTMLIonButtonElement
          ).style.display = 'none';

          document.getElementById('DNI')!.classList.remove('deshabilitado');
          (
            document.getElementById('btn-DNI')! as HTMLIonButtonElement
          ).style.display = 'block';
          (
            document.getElementById('btn-scan-DNI')! as HTMLIonButtonElement
          ).style.display = 'block';

          // (document.getElementById('btn-scan-DNI')! as HTMLIonButtonElement).classList.remove('deshabilitado');

          ToastSuccess.fire('El correo no está en uso.');
        } else ToastError.fire('Ocurrió un erorr.', error.message);
      });

    this.spinner.hide();
  }

  private verificarCuil = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control.value) return null;

    const DNI = (<string>control.parent?.value.DNI).replace(/[-. ]/g, '');
    const cuil = (<string>control.value).replace(/[-. ]/g, '');
    const dniEnCuil = cuil.slice(2, cuil.length - 1);

    if (!cuil.match(/^(20|23|24|27|30|33|34)(\D)?[0-9]{7,9}(\D)?[0-9]$/g))
      return { patron: true };
    else if (dniEnCuil !== DNI) return { dniNoEncontrado: true };

    return null;
  };

  private contraseñasCoinciden = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control.value) return null;

    const contra = control.parent?.value.contra;
    const reContra = <string>control.value;

    if (contra !== reContra) {
      return { noCoinciden: true };
    }

    return null;
  };

  verificarCoincid() {
    const contraCtrl = this.frmSupervisor.controls['contra'];
    const reContraCtrl = this.frmSupervisor.controls['reContra'];

    if (reContraCtrl.dirty) {
      if (contraCtrl.value !== reContraCtrl.value)
        reContraCtrl.setErrors({ noCoinciden: true });
      else reContraCtrl.setErrors(null);
    }
  }

  async buscarDni(): Promise<boolean> {
    this.spinner.show();
    const dniCtrl = this.frmSupervisor.controls['DNI'];

    let existe: boolean = true;
    await this.db
      .buscarUsuarioPorDni(Number(dniCtrl.value.replace(/[-. ]/g, '')))
      .then((pers) => ToastError.fire('Este DNI ya se encuentra registrado.'))
      .catch((error: any) => {
        if (
          error instanceof Exception &&
          error.code === ErrorCodes.DniNoRegistrado
        ) {
          existe = false;
          ToastSuccess.fire('El DNI no está registrado.');
          document
            .getElementById('datos-personales')!
            .classList.remove('deshabilitado');
          document.getElementById('DNI')!.classList.add('deshabilitado');
          (
            document.getElementById('input-DNI')! as HTMLIonInputElement
          ).disabled = true;
          (
            document.getElementById('btn-DNI')! as HTMLIonButtonElement
          ).style.display = 'none';
        } else ToastError.fire('Ocurrió un erorr.', error.message);
      });

    this.spinner.hide();
    return existe;
  }

  filtrarInputDoc($ev: any) {
    const patron = /^[0-9 .\-\ ]*$/gm;
    const inputChar = String.fromCharCode($ev.charCode);
    if (!patron.test(inputChar)) {
      $ev.preventDefault();
    }
    return true;
  }

  selecTipo($ev: CustomEvent) {
    this.frmSupervisor.controls['supervisorDueno'].setValue($ev.detail.value);
    this.frmSupervisor.updateValueAndValidity();
  }

  async escanearDni() {
    try {
      this.spinner.show();

      const valorCrudo = await this.scanner.escanear([BarcodeFormat.Pdf417]);
      // console.log('Valor crudo escaneado:', valorCrudo);

      const datosDni = this.scanner.extraerDatosDni(valorCrudo);
      // console.log('Datos extraídos del DNI:', datosDni);

      this.frmSupervisor.patchValue({
        DNI: datosDni.dni.toString(),
        CUIL: datosDni.cuil.toString(),
        nombre: datosDni.nombre,
        apellido: datosDni.apellido,
      });
      for (const campo of ['DNI', 'nombre', 'apellido', 'CUIL']) {
        this.frmSupervisor.controls[campo].markAsDirty();
        this.frmSupervisor.controls[campo].markAsTouched();
        this.frmSupervisor.controls[campo].updateValueAndValidity();
      }
      this.frmSupervisor.updateValueAndValidity();
      this.spinner.hide();
    } catch (error: any) {
      this.spinner.hide();
      // ToastError.fire('Ups...', error.message);
      ToastError.fire('Ups...', 'escaneo cancelado o fallido.');
    }
  }
}
