import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EgoGraphComponent } from './ego-graph.component';

describe('EgoGraphComponent', () => {
  let component: EgoGraphComponent;
  let fixture: ComponentFixture<EgoGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EgoGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EgoGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
