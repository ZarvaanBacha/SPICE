import { TestBed } from '@angular/core/testing';

import { FirebaseMainService } from './firebase-main.service';

describe('FirebaseMainService', () => {
  let service: FirebaseMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
