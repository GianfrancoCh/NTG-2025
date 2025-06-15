import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { NgxSpinnerModule } from 'ngx-spinner';
import OneSignal from 'onesignal-cordova-plugin';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NgxSpinnerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  constructor(
    public router: Router,
    private platform: Platform,
    private pushService: PushNotificationService
  ) {
    this.initializeApp();
    // this.showSplashScreen();
  }

  async initializeApp() {
    await this.platform.ready().then(() => {
      StatusBar.setOverlaysWebView({ overlay: false });

      OneSignal.Debug.setLogLevel(6);
      // Initialize with your OneSignal App ID
      OneSignal.initialize('78c810c4-14fe-45d1-9c58-b5fb9cd914b4');

      // Use this method to prompt for push notifications.
      // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
      OneSignal.Notifications.requestPermission(false).then(
        (accepted: boolean) => {
          console.log('User accepted notifications: ' + accepted);
        }
      );

      
      setTimeout(async () => {
        try {
          const playerId = await OneSignal.User.pushSubscription.getIdAsync();
          console.log('Player ID obtenido:', playerId);

          if (playerId) {
            this.pushService.setPlayerId(playerId);
            console.log('✅ Player ID:', playerId);
          } else {
            console.warn('⚠️ No se pudo obtener el Player ID');
          }
        } catch (error) {
          console.error('❌ Error al obtener Player ID:', error);
        }
      }, 3000);

      this.router.navigateByUrl('splash');
    });
  }
}
