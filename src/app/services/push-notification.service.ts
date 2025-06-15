// push-notification.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Colecciones, DatabaseService } from './database.service';
import OneSignal from 'onesignal-cordova-plugin';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private oneSignalApiUrl = 'https://onesignal.com/api/v1/notifications';
  private oneSignalAppId = '78c810c4-14fe-45d1-9c58-b5fb9cd914b4';
  private oneSignalApiKey =
    'os_v2_app_pdebbrau7zc5dhcywx5zzwiuwtj42klu4usea2f3bcslpqafet4dmdpeea4b4uelzl5ohi3mh2s4jt3m4xvsgtipeofylup7zyjzgsy';

  private db = inject(DatabaseService);

  constructor(private http: HttpClient) {}

  ///////
  private playerId: string | null = null;

  async loadPlayerId(): Promise<string | null> {
    try {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      this.playerId = id ?? null;
      return this.playerId;
    } catch (error) {
      console.error('❌ Error al obtener el playerId:', error);
      this.playerId = null;
      return null;
    }
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  setPlayerId(id: string) {
    this.playerId = id;
  }
  //////

  enviarNotificacion(heading: string, content: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${this.oneSignalApiKey}`,
    });

    const body = {
      app_id: this.oneSignalAppId,
      headings: { en: heading },
      contents: { en: content },
      included_segments: ['All'],
    };

    return this.http.post(this.oneSignalApiUrl, body, { headers });
  }

  // async notificarJefesNuevoUsuario() {
  //   try {
  //     const jefes: any[] = await this.db.traerCoincidencias(
  //       Colecciones.Usuarios,
  //       {
  //         campo: 'rol',
  //         operacion: 'eq',
  //         valor: 'jefe',
  //       }
  //     );

  //     const playerIds = jefes.map((j) => j.player_id).filter((id) => !!id); // quitamos los vacíos

  //     if (playerIds.length === 0) {
  //       console.warn('No hay jefes con player_id para enviar notificaciones.');
  //       return;
  //     }

  //     await this.enviarNotificacion(
  //       'Nuevo usuario',
  //       'Un nuevo usuario se a registrado!',
  //       playerIds
  //     );

  //     console.log('Notificación enviada a jefes.');
  //   } catch (error) {
  //     console.error('Error al notificar a jefes:', error);
  //   }
  // }
}
