import { TestBed } from '@angular/core/testing';

import { CospobreService } from './cospobre.service';

describe('CospobreService', () => {
  let service: CospobreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CospobreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
