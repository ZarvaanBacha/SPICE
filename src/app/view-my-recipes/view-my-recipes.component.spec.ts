import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMyRecipesComponent } from './view-my-recipes.component';

describe('ViewMyRecipesComponent', () => {
  let component: ViewMyRecipesComponent;
  let fixture: ComponentFixture<ViewMyRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMyRecipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMyRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
