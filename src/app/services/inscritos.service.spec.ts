import { TestBed } from '@angular/core/testing';

import { InscritosService } from './inscritos.service';

describe('InscritosService', () => {
  let service: InscritosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InscritosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
