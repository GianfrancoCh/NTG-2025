import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonItem,
  IonList,
  IonMenu,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatabaseService } from 'src/app/services/database.service';
import { ToastError, ToastSuccess } from 'src/app/utils/alerts';
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonTitle,
    IonButtons,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonButton,
    RouterModule,
    ReactiveFormsModule,
    IonHeader,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage {
  loginForm: FormGroup;
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private databaseService: DatabaseService,
    private emailService: EmailService
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
    });
  }

  async login() {
    this.spinner.show();
    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await this.authService.signIn(email, password);

      if (error) {
        this.errorMessage = error.message.includes('Invalid')
          ? 'Correo o contraseña incorrectos.'
          : error.message.includes('missing')
          ? 'Falta correo o contraseña.'
          : error.message;

        this.spinner.hide();
        return;
      }

      const cliente = await this.authService.obtenerUsuarioCliente();

      if (cliente) {
        if (cliente.estadoCliente === 'rechazado') {
          await this.authService.signOut();
          this.spinner.hide();
          this.loginForm.reset();
          ToastError.fire('Su registro fue rechazado.'); 
          return;
        }

        if (cliente.estadoCliente === 'pendiente') {
          await this.authService.signOut();
          this.spinner.hide();
          this.loginForm.reset();
          ToastError.fire('Su registro aún no fue aprobado.'); 
          return;
        }
      }

      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/home']);
      });

      setTimeout(() => {
        this.spinner.hide();
      }, 1500);

      ToastSuccess.fire('Inicio de sesión exitoso'); 
      console.log('Login exitoso:', data.user);
    } catch (err) {
      this.spinner.hide();
      this.errorMessage = 'Error al iniciar sesión.';
      ToastError.fire(this.errorMessage); 
    }
  }

  async autocompletarLogin(numUser: number) {
    switch (numUser) {
      case 1:
        this.email = 'dueno@dueno.com';
        this.password = '111111';
        break;
      case 2:
        this.email = 'supervisor@supervisor.com';
        this.password = '222222';
        break;
      case 3:
        this.email = 'maitre@maitre.com';
        this.password = '333333';
        break;
      case 4:
        this.email = 'mozo@mozo.com';
        this.password = '444444';
        break;
      case 5:
        this.email = 'cocinero@cocinero.com';
        this.password = '555555';
        break;
      case 6:
        this.email = 'bartender@bartender.com';
        this.password = '666666';
        break;
      case 7:
        this.email = 'uregistrado@uregistrado.com';
        this.password = '777777';
        break;
      case 8:
        this.email = 'uanonimo@uanonimo.com';
        this.password = '888888';
        break;
      default:
        break;
    }

    this.loginForm.patchValue({
      email: this.email,
      password: this.password,
    });
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  limpiarInputs() {
    this.loginForm.reset();
    this.errorMessage = '';
  }

  
}
