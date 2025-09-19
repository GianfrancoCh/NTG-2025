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
    console.log('Correo aprobacion enviado ');
    return emailjs.send(this.serviceID, this.templateID, data, this.userID);
  }

  enviarCorreoRechazado(data: any) {
    console.log('Correo rechazo enviado');
    return emailjs.send(
      this.serviceID,
      this.templateIDRechazado,
      data,
      this.userID
    );
  }

  
}
