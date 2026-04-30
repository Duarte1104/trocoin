import { TestBed } from '@angular/core/testing';

import { Utilizadores } from './utilizadores';

describe('Utilizadores', () => {
  let service: Utilizadores;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Utilizadores);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
