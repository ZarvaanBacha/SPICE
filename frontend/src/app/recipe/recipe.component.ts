import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, SpiceMeasurement } from '../models/recipe.model';
import { RecipeService } from '../recipe-service/recipe.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-recipe',
  imports: [CommonModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css']
})
export class RecipeComponent {
  recipes: Recipe[] = [];
  currentRecipe: Recipe = { name: '', ingredients: [] };
  newSpice: SpiceMeasurement = { spice: '', measurement: '' };
  isEditing = false;

 
  spiceOptions: string[] = ['Salt', 'Pepper', 'Paprika', 'Cumin', 'Cinnamon'];
  measurementOptions: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 1/2 teaspoons', '1 tablespoon'
  ];

  constructor(private recipeService: RecipeService, private router: Router) { // Inject Router
    this.recipes = this.recipeService.getRecipes();
  }

 
  setRecipeName(event: Event) {
    this.currentRecipe.name = (event.target as HTMLInputElement).value;
  }

 
  selectSpice(event: Event) {
    this.newSpice.spice = (event.target as HTMLSelectElement).value;
  }


  selectMeasurement(event: Event) {
    this.newSpice.measurement = (event.target as HTMLSelectElement).value;
  }

  addIngredient() {
    if (this.newSpice.spice && this.newSpice.measurement) {
      this.currentRecipe.ingredients.push({ ...this.newSpice });
      this.newSpice = { spice: '', measurement: '' }; 
      this.currentRecipe = { ...this.currentRecipe };
    }
  }

  removeIngredient(index: number) {
    this.currentRecipe.ingredients.splice(index, 1);

    this.currentRecipe = { ...this.currentRecipe };
  }

  saveOrUpdateRecipe() {
    if (this.currentRecipe.name && this.currentRecipe.ingredients.length > 0) {
      if (this.isEditing) {
        this.recipeService.updateRecipe({ ...this.currentRecipe });
      } else {
        this.recipeService.addRecipe({ ...this.currentRecipe });
      }
      this.recipes = this.recipeService.getRecipes();
      this.resetCurrentRecipe();
    }
  }

  editRecipe(recipe: Recipe) {
    this.isEditing = true;
    this.currentRecipe = { ...recipe, ingredients: [...recipe.ingredients] };
  }

  deleteRecipe(recipe: Recipe) {
    this.recipeService.deleteRecipe(recipe);
    this.recipes = this.recipeService.getRecipes();
  }

  resetCurrentRecipe() {
    this.currentRecipe = { name: '', ingredients: [] };
    this.isEditing = false;
    this.newSpice = { spice: '', measurement: '' };
  }
  goBack() {
    this.router.navigate(['/']);
  }
  
}
