import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusterGraphComponent } from './cluster-graph.component';

describe('ClusterGraphComponent', () => {
  let component: ClusterGraphComponent;
  let fixture: ComponentFixture<ClusterGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClusterGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
