import { TestBed } from '@angular/core/testing';

import { EgoGraphService } from './ego-graph.service';

describe('EgoGraphService', () => {
  let service: EgoGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EgoGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
