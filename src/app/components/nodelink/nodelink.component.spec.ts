import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodelinkComponent } from './nodelink.component';

describe('NodelinkComponent', () => {
  let component: NodelinkComponent;
  let fixture: ComponentFixture<NodelinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodelinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodelinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
