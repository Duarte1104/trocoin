import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversaPage } from './conversa.page';

describe('ConversaPage', () => {
  let component: ConversaPage;
  let fixture: ComponentFixture<ConversaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
