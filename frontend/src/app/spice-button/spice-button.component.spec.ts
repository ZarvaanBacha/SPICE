import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiceButtonComponent } from './spice-button.component';

describe('SpiceButtonComponent', () => {
  let component: SpiceButtonComponent;
  let fixture: ComponentFixture<SpiceButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpiceButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpiceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
