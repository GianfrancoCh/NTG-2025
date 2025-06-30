import { Component, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonRadio,
  IonRadioGroup,
  IonCardContent,
  IonButton,
  IonText,
  IonChip,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RangeEstrellasComponent } from '../range-estrellas/range-estrellas.component';
import { Cliente } from 'src/app/clases/cliente';
import { EncuestaCliente } from 'src/app/clases/encuestas/encuesta-cliente';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.component.html',
  styleUrls: ['./encuesta-cliente.component.scss'],
  standalone: true,
  imports: [
    IonChip,
    IonText,
    IonButton,
    IonCardContent,
    IonRadioGroup,
    IonRadio,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonList,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    RangeEstrellasComponent,
  ],
})
export class EncuestaClienteComponent implements OnInit {
  @Input() encuesta!: EncuestaCliente;
  protected cliente!: Cliente;
  fotosParseadas: string[] = [];

  constructor() {}

  ngOnInit() {
    if (!this.encuesta) throw new Error('Campo `encuesta` no existe.');
    this.cliente = <Cliente>this.encuesta.autor;

    console.log(
      'EncuestaClienteComponent: encuesta selecionada ',
      this.encuesta
    );

    if (typeof this.encuesta.fotoUrls === 'string') {
      try {
        this.fotosParseadas = JSON.parse(this.encuesta.fotoUrls);
        console.log('Fotos URL parseadas:', this.fotosParseadas);
      } catch (e) {
        console.error('Error al parsear fotos_url:', this.encuesta.fotoUrls);
        this.fotosParseadas = []; // fallback vacío si hay error
      }
    } else {
      console.log('fotosUrls:', this.encuesta.fotoUrls);
    }

  }
}
