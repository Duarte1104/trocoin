import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProporCompraPage } from './propor-compra.page';

describe('ProporCompraPage', () => {
  let component: ProporCompraPage;
  let fixture: ComponentFixture<ProporCompraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProporCompraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
