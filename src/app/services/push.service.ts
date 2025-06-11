import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import {
  PushNotifications,
  Token,
  PushNotificationActionPerformed,
  PushNotificationSchema,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class PushService {
  // constructor(private db: DatabaseService) {}

  // async init() {
  //   const perm = await PushNotifications.requestPermissions();
  //   if (perm.receive !== 'granted')
  //     return console.warn('Push permiso denegado');

  //   await PushNotifications.register();

  //   PushNotifications.addListener('registration', async (token: Token) => {
  //     console.log('📱 Token:', token.value);
  //     // Guardar token en Supabase
  //     await this.db.subirDoc(Colecciones.Mensajes, {
  //       token: token.value,
  //       plataforma: Capacitor.getPlatform(),
  //       created_at: new Date().toISOString(),
  //     });
  //   });

  //   PushNotifications.addListener('registrationError', (err) => {
  //     console.error('Error push registro', err);
  //   });

  //   PushNotifications.addListener(
  //     'pushNotificationReceived',
  //     (notif: PushNotificationSchema) => {
  //       console.log('Push recibido', notif);
  //     }
  //   );

  //   PushNotifications.addListener(
  //     'pushNotificationActionPerformed',
  //     (notif: PushNotificationActionPerformed) => {
  //       console.log('Push activado', notif);
  //     }
  //   );
  // }
}
