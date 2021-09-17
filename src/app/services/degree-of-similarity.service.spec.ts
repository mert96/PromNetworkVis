import { TestBed } from '@angular/core/testing';

import { DegreeOfSimilarityService } from './degree-of-similarity.service';

describe('DegreeOfSimilarityService', () => {
  let service: DegreeOfSimilarityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DegreeOfSimilarityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
