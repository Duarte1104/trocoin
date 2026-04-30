import { TestBed } from '@angular/core/testing';

import { Moedas } from './moedas';

describe('Moedas', () => {
  let service: Moedas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Moedas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
