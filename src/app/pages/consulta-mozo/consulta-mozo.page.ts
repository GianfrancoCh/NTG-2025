import { ChangeDetectorRef, Component, DoCheck, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonItem, IonSpinner, IonIcon, IonInput, IonText, IonButton } from '@ionic/angular/standalone';
import { Colecciones, DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { chevronBackCircleOutline, sendOutline } from 'ionicons/icons';
import { NgxSpinnerService } from 'ngx-spinner';
import { NavController } from '@ionic/angular/standalone';
import { Cliente } from 'src/app/clases/cliente';
import { Empleado } from 'src/app/clases/empleado';
import { Mesa } from 'src/app/clases/mesa';
import { Persona } from 'src/app/clases/persona';
// import { Timestamp } from '@angular/fire/firestore';
import { PushNotificationService } from 'src/app/services/push-notification.service';

declare interface chatMsg {
  id: string,
  mensaje: string,
  fecha: Date,
  autor: Empleado | Cliente,
  nroMesa: number | null
}
@Component({
  selector: 'app-consulta-mozo',
  templateUrl: './consulta-mozo.page.html',
  styleUrls: ['./consulta-mozo.page.scss'],
  standalone: true,
  imports: [IonButton, IonText, IonInput, IonIcon, IonSpinner, IonItem, IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, CommonModule]
})
export class ConsultaMozoPage implements OnInit, DoCheck {
  nroMesa: number | null = null;
  mensajes: chatMsg[] = [];
  protected nuevoMensaje: string = '';
  protected usuario!: Empleado | Cliente;
  private cantMsjPrev: number = 0;

  constructor(private db: DatabaseService, private auth: AuthService, private spinner: NgxSpinnerService, protected navCtrl: NavController, private push: PushNotificationService, private cdr: ChangeDetectorRef) {
    addIcons({ chevronBackCircleOutline, sendOutline });
  }

  async ngOnInit() {
    this.spinner.show();
    this.usuario = this.auth.UsuarioEnSesion!.rol === 'cliente' ?
      this.auth.UsuarioEnSesion! as Cliente : this.auth.UsuarioEnSesion! as Empleado;

      if (this.usuario.rol === 'cliente') {
        this.db.traerDoc<Mesa>(Colecciones.Mesas, (<Cliente>this.usuario).idMesa!)
          .then(mesa => {
            if (mesa) {
              this.nroMesa = mesa.nroMesa;
            } else {
              console.warn('Mesa no encontrada para el cliente');
            }
          });
      }

    this.db.escucharColeccion<chatMsg>(
      Colecciones.Mensajes,
      this.mensajes,
      undefined,
      (a: chatMsg, b: chatMsg) => a.fecha.getTime() - b.fecha.getTime(),
      this.timestampParse
    );

    // await delay(3500);
    this.cantMsjPrev = this.mensajes.length;
    this.spinner.hide();
  }

  private timestampParse = async (msg: chatMsg) => {
    // msg.fecha = msg.fecha instanceof Timestamp ? msg.fecha.toDate() : msg.fecha;
    return msg;
  }

  @ViewChild('mensajesDiv') mensajesDiv!: ElementRef;
  trackByFn(index: number, item: any) {
    return item.id;
  }

  enviarMensaje() {
    const textoMensaje = this.nuevoMensaje.trim();
    if (textoMensaje == '') return;

    const fechaActual = new Date();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const fechaFormateada = `${hora}:${minutos}`;

    const mensajeNotificacion = `Mesa ${this.nroMesa} - ${fechaFormateada}: ${textoMensaje}`;

    let msg: chatMsg = {
      id: this.usuario.id,
      mensaje: textoMensaje,
      fecha: fechaActual,
      autor: this.usuario,
      nroMesa: this.nroMesa
    };
    this.nuevoMensaje = '';

    if (this.usuario.rol === 'cliente') {
      this.push.notificarMozoConsulta(mensajeNotificacion);
    }

    this.db.subirDoc(Colecciones.Mensajes, msg);
  }

  ngDoCheck() {
    if (this.mensajes.length !== this.cantMsjPrev) {
      console.log('Array de mensajes ha cambiado');
      this.cantMsjPrev = this.mensajes.length;
      this.scrollUltimoMensaje();
    }
  }

  scrollUltimoMensaje() {
    try {
      setTimeout(() => {
        this.mensajesDiv.nativeElement.scrollTop = this.mensajesDiv.nativeElement.scrollHeight;
      }, 100);
    } catch (err) {
      console.error('Error al desplazar al fondo', err);
    }
  }
}
