import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MesaService {
  private mensajeMesaSubject = new BehaviorSubject<string>('Sin mesa asignada');
  mensajeMesa$ = this.mensajeMesaSubject.asObservable();

  actualizarMensaje(nuevoMensaje: string) {
    this.mensajeMesaSubject.next(nuevoMensaje);
  }
}
