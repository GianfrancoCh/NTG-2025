// push-notification.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private oneSignalApiUrl = 'https://onesignal.com/api/v1/notifications';
  private oneSignalAppId = '78c810c4-14fe-45d1-9c58-b5fb9cd914b4';
  private oneSignalApiKey = 'os_v2_app_pdebbrau7zc5dhcywx5zzwiuwtj42klu4usea2f3bcslpqafet4dmdpeea4b4uelzl5ohi3mh2s4jt3m4xvsgtipeofylup7zyjzgsy'; 

  constructor(private http: HttpClient) {}

  enviarNotificacion(heading: string, content: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.oneSignalApiKey}`, 
    });

    const body = {
      app_id: this.oneSignalAppId,
      headings: { en: heading },
      contents: { en: content },
      included_segments: ['All'],
    };

    return this.http.post(this.oneSignalApiUrl, body, { headers });
  }
}
