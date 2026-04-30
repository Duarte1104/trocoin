import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnuncioPublicadoPage } from './anuncio-publicado.page';

describe('AnuncioPublicadoPage', () => {
  let component: AnuncioPublicadoPage;
  let fixture: ComponentFixture<AnuncioPublicadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnuncioPublicadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
