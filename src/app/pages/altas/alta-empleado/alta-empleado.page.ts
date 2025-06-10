import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular/standalone';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonFab, IonFabButton, IonFabList, IonIcon, IonCard, IonCardContent, IonButton, IonItem, IonInputPasswordToggle, IonCardHeader, IonCardTitle, IonRadioGroup, IonRadio, IonText } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Colecciones, DatabaseService } from 'src/app/services/database.service';
import { ErrorCodes, Exception } from 'src/app/clases/exception';
import { MySwal, ToastError, ToastSuccess } from 'src/app/utils/alerts';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { Empleado, TipoEmpleado } from 'src/app/clases/empleado';
import { ScannerService } from 'src/app/services/scanner.service';
import { StorageService } from 'src/app/services/storage.service';
import { BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { FotosService } from 'src/app/services/fotos.service';



@Component({
  selector: 'app-alta-empleado',
  templateUrl: './alta-empleado.page.html',
  styleUrls: ['./alta-empleado.page.scss'],
  standalone: true,
  imports: [IonText, IonRadio, IonRadioGroup, IonCardTitle, IonCardHeader, IonCard, IonItem, IonButton, IonCardContent, IonCard, IonIcon, IonFabList, IonFabButton, IonFab, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonInputPasswordToggle, FormsModule, ReactiveFormsModule, CommonModule],
})
export class AltaEmpleadoPage {
  empleadoFrm: FormGroup;

  constructor(protected navCtrl: NavController, private auth: AuthService, private spinner: NgxSpinnerService, private db: DatabaseService, private scanner: ScannerService, private storage: StorageService, private fotosServ: FotosService) {
    this.empleadoFrm = inject(FormBuilder).group({
      tipoEmpleado: [
        null, [
          Validators.required,
        ]
      ],
      correo: [
        '', [
          Validators.required,
          Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
        ]
      ],
      dni: [
        '', [
          Validators.required,
          Validators.pattern(/^\b[\d]{1,3}(\.|\-|\/| )?[\d]{3}(\.|\-|\/| )?[\d]{3}$/),
        ]
      ],
      cuil: [
        '', [
          Validators.required,
          this.verificarCuil,
        ]
      ],
      nombre: [
        '', [
          Validators.required,
          Validators.pattern(/[\p{L}\p{M}]+/u),
        ]
      ],
      apellido: [
        '', [
          Validators.required,
          Validators.pattern(/[\p{L}\p{M}]+/u),
        ]
      ],
      contra: [
        '', [
          Validators.required,
        ]
      ],
      reContra: [
        '',
        [
          Validators.required,
          this.contraseñasCoinciden
        ]
      ]
    });

    addIcons({ search });
  }

  private verificarCuil = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const dni = (<string>control.parent?.value.dni).replace(/[-. ]/g, '');
    const cuil = (<string>control.value).replace(/[-. ]/g, '');
    const dniEnCuil = cuil.slice(2, cuil.length - 1);

    if (!cuil.match(/^(20|23|24|27|30|33|34)(\D)?[0-9]{7,9}(\D)?[0-9]$/g))
      return { patron: true };
    else if (dniEnCuil !== dni)
      return { dniNoEncontrado: true };

    return null;
  }

  private contraseñasCoinciden = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const contra = control.parent?.value.contra;
    const reContra = <string>control.value;

    if (contra !== reContra) {
      return { noCoinciden: true };
    }

    return null;
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
    this.empleadoFrm.controls['tipoEmpleado'].setValue($ev.detail.value);
    console.log('Tipo de empleado seleccionado:', $ev.detail.value);
  }

  async buscarCorreo() {
    this.spinner.show();

    await this.db.buscarUsuarioPorCorreo(this.empleadoFrm.controls['correo'].value)
      .then((pers) => ToastError.fire('Este correo ya se encuentra registrado.'))
      .catch((error: any) => {
        if (error instanceof Exception && error.code === ErrorCodes.CorreoNoRegistrado) {
          document.getElementById('dni')!.classList.remove('deshabilitado');
          document.getElementById('correo')!.classList.add('deshabilitado');
          (document.getElementById('input-correo')! as HTMLIonInputElement).disabled = true;
          (document.getElementById('input-dni')! as HTMLIonInputElement).disabled = false;
          (document.getElementById('btn-correo')! as HTMLIonButtonElement).style.display = 'none';
          (document.getElementById('btn-dni')! as HTMLIonButtonElement).style.display = 'block';
          ToastSuccess.fire('El correo no está en uso.');
        } else ToastError.fire('Ocurrió un erorr.', error.message);
      });

    this.spinner.hide();
  }

  async buscarDni(): Promise<boolean> {
    this.spinner.show();
    const dniValue = <string>this.empleadoFrm.controls['dni'].value;
    const dni = dniValue.replace(/[-. ]/g, '');

    let existe: boolean = true;
    await this.db.buscarUsuarioPorDni(Number(dni))
      .then((pers) => ToastError.fire('Este DNI ya se encuentra registrado.'))
      .catch((error: any) => {
        if (error instanceof Exception && error.code === ErrorCodes.DniNoRegistrado) {
          existe = false;
          ToastSuccess.fire('El DNI no está registrado.');
          document.getElementById('datos-personales')!.classList.remove('deshabilitado');
          document.getElementById('dni')!.classList.add('deshabilitado');
          (document.getElementById('input-dni')! as HTMLIonInputElement).disabled = true;
          (document.getElementById('btn-dni')! as HTMLIonButtonElement).style.display = 'none';
        } else ToastError.fire('Ocurrió un erorr.', error.message);
      });

    this.spinner.hide();
    return existe;
  }

  async escanearDni() {
    try {
      this.spinner.show();

      const valorCrudo = await this.scanner.escanear([BarcodeFormat.Pdf417]);
      // console.log('Valor crudo escaneado:', valorCrudo);

      const datosDni = this.scanner.extraerDatosDni(valorCrudo);
      // console.log('Datos extraídos del DNI:', datosDni);

      this.empleadoFrm.patchValue({
        dni: datosDni.dni.toString(),
        cuil: datosDni.cuil.toString(),
        nombre: datosDni.nombre,
        apellido: datosDni.apellido,
      });
      for (const campo of ['dni', 'nombre', 'apellido', 'cuil']) {
        this.empleadoFrm.controls[campo].markAsDirty();
        this.empleadoFrm.controls[campo].markAsTouched();
        this.empleadoFrm.controls[campo].updateValueAndValidity();
      }
      this.empleadoFrm.updateValueAndValidity();
      this.spinner.hide();
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Ups...', error.message);
      // ToastError.fire('Ups...', 'escaneo cancelado o fallido.');
    }
  }
  
  verificarCoincid() {
    const contraCtrl = this.empleadoFrm.controls['contra'];
    const reContraCtrl = this.empleadoFrm.controls['reContra'];

    if (reContraCtrl.dirty) {
      if (contraCtrl.value !== reContraCtrl.value)
        reContraCtrl.setErrors({ noCoinciden: true });
      else
        reContraCtrl.setErrors(null);
    }
  }


  async subirEmpleado() {
    try {
      let fotoUrl = '';
      await MySwal.fire({
        title: '¿Desea subir foto del empleado?',
        showConfirmButton: true,
        confirmButtonText: 'Sí',
        confirmButtonColor: '#a5dc86',
        showDenyButton: true,
        denyButtonText: 'No',
        denyButtonColor: '#f0ec0d',
      }).then(async (res) => {
        if (res.isConfirmed)
          fotoUrl = await this.tomarFotoEmpleado();
      });

      this.spinner.show();
      const nombre = this.empleadoFrm.controls['nombre'].value;
      const apellido = this.empleadoFrm.controls['apellido'].value;
      const dni = Number((this.empleadoFrm.controls['dni'].value).replace(/[-. ]/g, ''));
      const cuil = Number((this.empleadoFrm.controls['cuil'].value).replace(/[-. ]/g, ''));
      const correo = this.empleadoFrm.controls['correo'].value;
      const contra = this.empleadoFrm.controls['contra'].value;
      const tipoEmpleado = this.empleadoFrm.controls['tipoEmpleado'].value as TipoEmpleado;

      const empleado = new Empleado(nombre, apellido, dni, cuil, correo, fotoUrl, tipoEmpleado);
      await this.auth.registrarEmpleado(empleado, contra);
      this.resetForm();

      this.spinner.hide();
      ToastSuccess.fire('Empleado creado!');
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Ocurrió un error.', error.message);
    }
  }

  async tomarFotoEmpleado() {
    const foto = await this.fotosServ.tomarFoto();
    let fotoUrl = '';

    if (foto) {
      this.spinner.show();
      const dni = <string>this.empleadoFrm.controls['dni'].value;

      fotoUrl = await this.storage.subirArchivo(foto, `${Colecciones.Usuarios}/empleado-${dni}`);
      this.spinner.hide();
    }

    return fotoUrl;
  }

  private resetForm() {
    this.empleadoFrm.reset();
    document.getElementById('correo')!.classList.remove('deshabilitado');
    document.getElementById('dni')!.classList.add('deshabilitado');
    (document.getElementById('input-correo')! as HTMLIonInputElement).disabled = false;
    (document.getElementById('btn-correo')! as HTMLIonButtonElement).style.display = 'block';
    (document.getElementById('btn-dni')! as HTMLIonButtonElement).style.display = 'none';
    document.getElementById('datos-personales')!.classList.add('deshabilitado');
    (document.getElementById('tipo-radio')! as HTMLIonRadioGroupElement).value = null;
  }
}
