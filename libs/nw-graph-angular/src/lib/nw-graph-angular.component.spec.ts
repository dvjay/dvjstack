import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NwGraphAngularComponent } from './nw-graph-angular.component';

describe('NwGraphAngularComponent', () => {
  let component: NwGraphAngularComponent;
  let fixture: ComponentFixture<NwGraphAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NwGraphAngularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NwGraphAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
