import { TestBed } from '@angular/core/testing';

import { NwGraphAngularService } from './nw-graph-angular.service';

describe('NwGraphAngularService', () => {
  let service: NwGraphAngularService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NwGraphAngularService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
