import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindRecipesComponent } from './find-recipes.component';

describe('FindRecipesComponent', () => {
  let component: FindRecipesComponent;
  let fixture: ComponentFixture<FindRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindRecipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
