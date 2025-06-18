// push-notification.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Colecciones, DatabaseService } from './database.service';
import OneSignal from 'onesignal-cordova-plugin';
import { firstValueFrom } from 'rxjs';

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
      console.error('Error al obtener el playerId:', error);
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

  async notificarJefesNuevoUsuario(nombre: string, apellido: string) {
    try {
      // 1. Obtener todos los jefes que tengan player_id registrado
      const { data, error } = await this.db.supabase
        .from('usuarios')
        .select('player_id')
        .eq('rol', 'jefe')
        .not('player_id', 'is', null);

      if (error) {
        console.error('Error al obtener jefes:', error.message);
        return;
      }

      const playerIds = data
        .map((j: any) => j.player_id)
        .filter((id: string) => !!id);

      if (playerIds.length === 0) {
        console.log('No se encontraron jefes con player_id.');
        return;
      }

      // 2. Enviar notificación
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.oneSignalApiKey}`,
      });

      const body = {
        app_id: this.oneSignalAppId,
        include_player_ids: playerIds,
        headings: { en: 'Nuevo usuario registrado' },
        contents: {
          en: `${nombre} ${apellido} se ha registrado!`,
        },
      };

      const response = await firstValueFrom(
        this.http.post(this.oneSignalApiUrl, body, { headers })
      );

      console.log('Notificación enviada a jefes:', response);
    } catch (err) {
      console.error('Error al enviar notificación a jefes:', err);
    }
  }
}
