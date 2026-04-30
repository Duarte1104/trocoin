import { TestBed } from '@angular/core/testing';

import { Mensagens } from './mensagens';

describe('Mensagens', () => {
  let service: Mensagens;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mensagens);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
