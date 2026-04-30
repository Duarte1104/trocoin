import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoAnuncioPage } from './novo-anuncio.page';

describe('NovoAnuncioPage', () => {
  let component: NovoAnuncioPage;
  let fixture: ComponentFixture<NovoAnuncioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoAnuncioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
