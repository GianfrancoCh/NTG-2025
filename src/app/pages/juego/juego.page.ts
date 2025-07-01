import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonRow, IonText, IonCol, IonGrid, IonImg } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Cliente } from 'src/app/clases/cliente';
import { Colecciones, DatabaseService } from 'src/app/services/database.service';
import { ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-juego',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.scss'],
  standalone: true,
  imports: [IonImg, IonGrid, IonCol, IonText, IonRow, IonButton, IonContent, IonHeader, IonTitle, IonRow, IonToolbar, CommonModule, FormsModule],
  providers: [ModalController]
})
export class JuegoPage implements OnInit {

  palabra: string = ''; 
  palabraOculta: string = ''; 
  intentos: number = 0; 
  letrasFalladas: string[] = []; 
  letrasAdivinadas: string[] = []; 
  juegoTerminado: boolean = false; 
  puntaje: number = 0; // Nueva variable para el puntaje
  ganoConDescuento: boolean = false;
  yaJugoConDescuento: boolean = false;
  protected usuario!: Cliente;
  jugado: boolean = false;

  palabras: string[] = [
    'pizza', 'pancho', 'fernet', 'asado','hamburguesa','cocacola', 'asado'
  ];
  maxIntentos: number = 6; 

  imagenesAhorcado: string[] = [
    'assets/ahorcado/ahorcado0.jpg', 'assets/ahorcado/ahorcado1.jpg',
    'assets/ahorcado/ahorcado2.jpg', 'assets/ahorcado/ahorcado3.jpg',
    'assets/ahorcado/ahorcado4.jpg', 'assets/ahorcado/ahorcado5.jpg',
    'assets/ahorcado/ahorcado6.jpg'
  ];

  constructor(private auth: AuthService, private db: DatabaseService, protected modalCtrl: ModalController, private router: Router) { }


  async ngOnInit(): Promise<void> {
    if (this.auth.UsuarioEnSesion?.rol === 'cliente') {
      this.usuario = this.auth.UsuarioEnSesion as Cliente;
    }

    console.log('Usuario Agorcado:', this.usuario);

    if (this.usuario.id) {
      this.yaJugoConDescuento = await this.db.verificarDescuentoJugador(this.usuario.id);
      console.log('Ya jugó con descuento:', this.yaJugoConDescuento);
    }
    this.iniciarJuego();
  }
  


  iniciarJuego() {
    this.intentos = 0;
    this.letrasFalladas = [];
    this.letrasAdivinadas = [];
    this.juegoTerminado = false;
    this.ganoConDescuento = false;
    this.palabra = this.palabras[Math.floor(Math.random() * this.palabras.length)];
    this.palabraOculta = '_ '.repeat(this.palabra.length).trim();
  }

  async comprobarLetra(letra: string) {
    letra = letra.toLowerCase();

    if (this.juegoTerminado) {
      return;
    }

    if (this.palabra.includes(letra)) {
      this.letrasAdivinadas.push(letra);
      this.revelarPalabra();
    } else {
      if (!this.letrasFalladas.includes(letra)) {
        this.letrasFalladas.push(letra);
        this.intentos++;
      }
    }

    if (this.intentos >= this.maxIntentos) {
      this.juegoTerminado = true;
      this.jugado = true; // ⚠️ marcamos que ya jugó
      console.log('Has perdido');
    }

    if (!this.palabraOculta.includes('_')) {
      this.juegoTerminado = true;

      if (this.intentos < this.maxIntentos) {
        this.ganoConDescuento = true;
      }

      // ✅ Solo damos descuento si:
      //  - No lo recibió antes (yaJugoConDescuento === false)
      //  - Es su primer intento (jugado === false)
      if (!this.yaJugoConDescuento && this.ganoConDescuento && !this.jugado) {
        const id = this.auth.UsuarioEnSesion?.id;
        if (id) {
          await this.db.guardarDescuentoJugador(id);
          this.yaJugoConDescuento = true;
          console.log('Descuento otorgado en el primer intento');
        }
      }

      this.jugado = true; // Marcar como jugado también si ganó
    }
  }

  revelarPalabra() {
    this.palabraOculta = this.palabra
      .split('')
      .map(letra => (this.letrasAdivinadas.includes(letra) ? letra : '_'))
      .join(' ');
  }

  reiniciar() {
    this.iniciarJuego();
  }

  obtenerImagenAhorcado(): string {
    return this.imagenesAhorcado[this.intentos]; 
  }

  cerrar() {
    this.router.navigate(['/home']); // o a donde quieras ir
  }



}
