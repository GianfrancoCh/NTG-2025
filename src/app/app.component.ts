import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(public router: Router, private platform: Platform) {
    this.initializeApp();
    // this.showSplashScreen();
  }

  async initializeApp() {
    await this.platform.ready().then(() => {
      StatusBar.setOverlaysWebView({ overlay: false });

      this.router.navigateByUrl('splash');
    });
  }
}
