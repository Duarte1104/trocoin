import { TestBed } from '@angular/core/testing';

import { Anuncios } from './anuncios';

describe('Anuncios', () => {
  let service: Anuncios;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Anuncios);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
