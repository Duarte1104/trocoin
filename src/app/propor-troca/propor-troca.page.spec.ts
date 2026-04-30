import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProporTrocaPage } from './propor-troca.page';

describe('ProporTrocaPage', () => {
  let component: ProporTrocaPage;
  let fixture: ComponentFixture<ProporTrocaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProporTrocaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
