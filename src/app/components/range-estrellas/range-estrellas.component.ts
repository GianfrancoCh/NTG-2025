import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-range-estrellas',
  templateUrl: './range-estrellas.component.html',
  styleUrls: ['./range-estrellas.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RangeEstrellasComponent implements AfterViewInit {
  @Input() titulo?: string;
  /**
   * Si el componente se va a usar múltiples veces en un mismo display, el id de los input deben ser diferentes.
   */
  @Input({ required: true }) idEstrellas!: string;
  @Input() min: number = 0;
  @Input() max: number = 5;
  @Input() step: number = 0.5;
  @Input() valor: number = 5;
  @Input() readonly: boolean = false;
  @Output() cambioValor = new EventEmitter<number>();

  private estrellasEl!: HTMLElement;
  ngAfterViewInit() {
    this.estrellasEl = document.getElementById(this.idEstrellas)!;

    this.estrellasEl.style.setProperty('--value', `${this.valor}`);
    this.estrellasEl.style.setProperty('--stars', `${this.max}`);
  }

  cambiarValor($ev: any) {
    const nuevoValor = $ev.target.value;
    this.estrellasEl.style.setProperty('--value', nuevoValor);
    this.cambioValor.emit(nuevoValor);
  }
}
