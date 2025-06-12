// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private serviceID = 'service_pj10ocg';
  private templateID = 'template_jiqozek';
  private templateIDRechazado = 'template_2wayyvb';
  private userID = 'T2YeHPvVNxnvWWeac';

  constructor() {}

  enviarCorreoAprobado(data: any) {
    return emailjs.send(this.serviceID, this.templateID, data, this.userID);
  }

  enviarCorreoRechazado(data: any) {
    return emailjs.send(this.serviceID, this.templateIDRechazado, data, this.userID);
  };

  //Como Mandar correo aprobado

  // async enviarCorreo() {
  //   const templateData = {
  //     nombre: 'Gianfranco',
  //     email: 'gianfrancochiarizia@gmail.com',
  //   };

  //   try {
  //     await this.emailService.enviarCorreoAprobado(templateData);
  //     ToastSuccess.fire('Correo enviado con éxito');
  //   } catch (error) {
  //     console.error('Error al enviar correo:', error);
  //     ToastError.fire('Error al enviar correo');
  //   }
  // }


  //Como Mandar correo rechazado

  // async enviarCorreo() {
  //   const templateData = {
  //     nombre: 'Gianfranco',
  //     email: 'gianfrancochiarizia@gmail.com',
  //   };

  //   try {
  //     await this.emailService.enviarCorreoRechazado(templateData);
  //     ToastSuccess.fire('Correo enviado con éxito');
  //   } catch (error) {
  //     console.error('Error al enviar correo:', error);
  //     ToastError.fire('Error al enviar correo');
  //   }
  // }
}
