import { Injectable } from '@angular/core';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipes: Recipe[] = [];

  constructor() {}

  getRecipes(): Recipe[] {
    return this.recipes;
  }

  addRecipe(recipe: Recipe): void {
  
    if (!recipe.id) {
      recipe.id = this.recipes.length > 0 ? Math.max(...this.recipes.map(r => r.id || 0)) + 1 : 1;
    }
    this.recipes.push(recipe);
  }

  updateRecipe(updatedRecipe: Recipe): void {

    const index = this.recipes.findIndex(recipe => recipe.id === updatedRecipe.id);
    if (index !== -1) {
    
      this.recipes[index] = updatedRecipe;
    }
  }

  deleteRecipe(recipeToDelete: Recipe): void {
    this.recipes = this.recipes.filter(recipe => recipe.id !== recipeToDelete.id);
  }
}
