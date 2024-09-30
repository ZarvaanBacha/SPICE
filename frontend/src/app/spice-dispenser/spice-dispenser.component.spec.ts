import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiceDispenserComponent } from './spice-dispenser.component';

describe('SpiceDispenserComponent', () => {
  let component: SpiceDispenserComponent;
  let fixture: ComponentFixture<SpiceDispenserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpiceDispenserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpiceDispenserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
