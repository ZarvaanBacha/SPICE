import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpiceSelectComponent } from './spice-select.component';
import { CommonModule } from '@angular/common';

describe('SpiceSelectComponent', () => {
  let component: SpiceSelectComponent;
  let fixture: ComponentFixture<SpiceSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpiceSelectComponent,CommonModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpiceSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
