import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmacaoTrocaPage } from './confirmacao-troca.page';

describe('ConfirmacaoTrocaPage', () => {
  let component: ConfirmacaoTrocaPage;
  let fixture: ComponentFixture<ConfirmacaoTrocaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmacaoTrocaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
