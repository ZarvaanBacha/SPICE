import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowSpiceComponent } from './low-spice.component';

describe('LowSpiceComponent', () => {
  let component: LowSpiceComponent;
  let fixture: ComponentFixture<LowSpiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowSpiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowSpiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
