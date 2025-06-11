import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaPedidoPage } from './alta-pedido.page';

describe('AltaPedidoPage', () => {
  let component: AltaPedidoPage;
  let fixture: ComponentFixture<AltaPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
