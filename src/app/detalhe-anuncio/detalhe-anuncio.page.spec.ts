import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalheAnuncioPage } from './detalhe-anuncio.page';

describe('DetalheAnuncioPage', () => {
  let component: DetalheAnuncioPage;
  let fixture: ComponentFixture<DetalheAnuncioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalheAnuncioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
