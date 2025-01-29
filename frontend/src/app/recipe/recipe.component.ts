import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, SpiceMeasurement } from '../models/recipe.model';
import { RecipeService } from '../recipe-service/recipe.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeyboardModuleModule } from '../keyboard-module/keyboard-module.module';
@Component({
  standalone: false,
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css'],
})
export class RecipeComponent {
  recipes: Recipe[] = [];
  currentRecipe: Recipe = { recipeName: '', spices: [] };
  newSpice: SpiceMeasurement = { spiceName: '', spiceMeasurement: '' };
  isEditing = false;
 
  spiceOptions: string[] = ['Salt', 'Pepper', 'Paprika', 'Cumin', 'Cinnamon'];
  measurementOptions: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 1/2 teaspoons', '1 tablespoon'
  ];

  constructor(private recipeService: RecipeService, private router: Router, private http: HttpClient) {} // Inject Router
  

 
  setRecipeName(event: Event) {
    this.currentRecipe.recipeName = (event.target as HTMLInputElement).value;
  }

 
  selectSpice(event: Event) {
    this.newSpice.spiceName = (event.target as HTMLSelectElement).value;
  }


  selectMeasurement(event: Event) {
    this.newSpice.spiceMeasurement = (event.target as HTMLSelectElement).value;
  }

  addIngredient() {
    if (this.newSpice.spiceName && this.newSpice.spiceMeasurement) {
      this.currentRecipe.spices.push({ ...this.newSpice });
      this.newSpice = { spiceName: '', spiceMeasurement: '' }; 
      this.currentRecipe = { ...this.currentRecipe };
    }
  }

  removeIngredient(index: number) {
    this.currentRecipe.spices.splice(index, 1);

    this.currentRecipe = { ...this.currentRecipe };
  }

  saveOrUpdateRecipe() {
    if (this.currentRecipe.recipeName && this.currentRecipe.spices.length > 0) {
      if (this.isEditing) {
        this.recipeService.updateRecipe({ ...this.currentRecipe });
      } else {
        this.recipeService.addRecipe({ ...this.currentRecipe });
      }
      this.resetCurrentRecipe();
      window.location.reload()
    }
  }

  editRecipe(recipe: Recipe) {
    this.isEditing = true;
    this.currentRecipe = { ...recipe, spices: [...recipe.spices] };
  }

  deleteRecipe(recipe: Recipe) {
    this.recipeService.deleteRecipe(recipe);
    window.location.reload()
  }

  shareRecipe(recipe: Recipe) {

  }

  resetCurrentRecipe() {
    this.currentRecipe = { recipeName: '', spices: [] };
    this.isEditing = false;
    this.newSpice = { spiceName: '', spiceMeasurement: '' };
  }

  getRecipes(): Observable<any> {    
    return this.http.get("http://localhost:4000/getRecipes");
  }

  ngOnInit() {
    this.getRecipes().subscribe((data) => {
      console.log(data)
      this.recipes = data;
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
  
}
