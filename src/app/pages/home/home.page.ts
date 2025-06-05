import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonText,
  IonIcon,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonFabButton,
    IonFab,
    IonIcon,
    IonText,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    RouterModule,
    IonButton,
    CommonModule,
    IonButtons,
  ],
})
export class HomePage implements OnInit {
  user: User | null = null;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    protected navCtrl: NavController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.user = user;
      console.log('Usuario en home:', user);
    });
  }

  goToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }

  logout() {
    this.authService.signOut();
    this.navCtrl.navigateRoot('/login');
  }
}
