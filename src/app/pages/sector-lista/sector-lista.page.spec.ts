import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectorListaPage } from './sector-lista.page';

describe('SectorListaPage', () => {
  let component: SectorListaPage;
  let fixture: ComponentFixture<SectorListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SectorListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
