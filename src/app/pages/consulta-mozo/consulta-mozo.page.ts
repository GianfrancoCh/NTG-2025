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
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { RealtimeChannel } from '@supabase/supabase-js';
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
  canalMensajes!: RealtimeChannel;

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

    this.canalMensajes = this.db.escucharMensajes<chatMsg>(
      Colecciones.Mensajes,
      this.mensajes, // ya no se modificará directamente, solo para la firma
      undefined,
      (a, b) => a.fecha.getTime() - b.fecha.getTime(),
      this.timestampParse,
      (nuevosDatos) => {
        this.mensajes = nuevosDatos;
        this.cdr.detectChanges();
        this.scrollUltimoMensaje();
      }
    );  

    // setTimeout(() => {
    // }, 3000);
    this.cantMsjPrev = this.mensajes.length;
    this.spinner.hide();
  }

  ngOnDestroy() {
    if (this.canalMensajes) {
      this.canalMensajes.unsubscribe();
    }
  }

  private timestampParse = async (msg: chatMsg): Promise<chatMsg> => {
    if (msg.autor && typeof msg.autor === 'string') {
      try {
        msg.autor = JSON.parse(msg.autor);
      } catch (e) {
        console.warn('No se pudo parsear autor:', e);
      }
    }

    if (msg.nroMesa && typeof msg.nroMesa === 'string') {
      try {
        msg.nroMesa = JSON.parse(msg.nroMesa);
      } catch (e) {
        console.warn('No se pudo parsear nroMesa:', e);
      }
    }

    if (!(msg.fecha instanceof Date)) {
      msg.fecha = new Date(msg.fecha);
    }

    // 🔁 Forzar detección de cambios
    this.cdr.detectChanges();

    return msg;
  };

  

  getRolAutor(msg: chatMsg): string {
    if (!msg.autor) return '';
    if (typeof msg.autor === 'string') {
      try {
        const autorObj = JSON.parse(msg.autor);
        return autorObj.rol;
      } catch {
        return '';
      }
    }
    return (msg.autor as any).rol || '';
  }

  getNombreAutor(msg: chatMsg): string {
    if (!msg.autor) return '';
    if (typeof msg.autor === 'string') {
      try {
        const autorObj = JSON.parse(msg.autor);
        return autorObj.nombre;
      } catch {
        return '';
      }
    }
    return (msg.autor as any).nombre || '';
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
    this.db.subirDoc(Colecciones.Mensajes, msg).then(() => {
         this.recargarMensajes();
    });
  };

  async recargarMensajes() {
      const { data, error } = await this.db.supabase
      .from(Colecciones.Mensajes)
      .select('*');

    if (error) {
      console.error('Error al recargar mensajes:', error.message);
      return;
    }

    if (data) {
      // Parsear y transformar fechas y autor (usamos tu timestampParse)
      const mensajesTransformados = await Promise.all(data.map(this.timestampParse));

      // Ordenar mensajes por fecha
      mensajesTransformados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

      // Actualizar el array mensajes con una nueva referencia
      this.mensajes = mensajesTransformados;

      // Forzar la detección de cambios
      this.cdr.detectChanges();

      // Scroll al último mensaje
      this.scrollUltimoMensaje();
    }
  }

  ngDoCheck() {
    if (this.mensajes.length !== this.cantMsjPrev) {
      this.cantMsjPrev = this.mensajes.length;

      // 🔁 Reemplazar con una nueva referencia para asegurar actualización
      this.mensajes = [...this.mensajes];
      this.scrollUltimoMensaje();

      this.cdr.detectChanges();
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
