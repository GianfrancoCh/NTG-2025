import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonRow, IonText, IonCol, IonGrid, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-juego',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.scss'],
  standalone: true,
  imports: [IonImg, IonGrid, IonCol, IonText, IonRow, IonButton, IonContent, IonHeader, IonTitle, IonRow, IonToolbar, CommonModule, FormsModule]
})
export class JuegoPage implements OnInit {

  palabra: string = ''; 
  palabraOculta: string = ''; 
  intentos: number = 0; 
  letrasFalladas: string[] = []; 
  letrasAdivinadas: string[] = []; 
  juegoTerminado: boolean = false; 
  puntaje: number = 0; // Nueva variable para el puntaje

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

  constructor() { }

   async ngOnInit(): Promise<void> {
    // await this.cargarPuntaje(); // Cargar el puntaje al iniciar
    this.iniciarJuego();
  }

  // async cargarPuntaje() {
  //   this.puntaje = await this.puntajeService.obtenerPuntaje('ahorcado');
  // }

  iniciarJuego() {
    this.intentos = 0;
    this.letrasFalladas = [];
    this.letrasAdivinadas = [];
    this.juegoTerminado = false;

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
      console.log('Has perdido');
      // await this.actualizarPuntaje(-5);
    }

    if (!this.palabraOculta.includes('_')) {
      this.juegoTerminado = true;
      console.log('¡Has ganado!');
      // await this.actualizarPuntaje(10); // Aumentar puntaje si gana
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

  // async actualizarPuntaje(puntos: number) {
  //   this.puntaje += puntos;
  //   await this.puntajeService.guardarPuntaje('ahorcado', this.puntaje);
  //   console.log('Puntaje actualizado:', this.puntaje);
  // }

}
