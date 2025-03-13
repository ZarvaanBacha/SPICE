import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, SpiceMeasurement } from '../models/recipe.model';
import { RecipeService } from '../recipe-service/recipe.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeyboardModuleModule } from '../keyboard-module/keyboard-module.module';
import { FirebaseService } from '../firebase.service';

@Component({
  standalone: false,
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css'],
})
export class RecipeComponent {
  recipes: any[] = [];
  currentRecipe: any = { recipeName: '', spices: [] };
  newSpice: SpiceMeasurement = { spiceName: '', spiceMeasurement: '' };
  isEditing = false;
 
  spiceOptions: string[] = ['Salt', 'Pepper', 'Paprika', 'Cumin', 'Cinnamon'];
  measurementOptions: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 1/2 teaspoons', '1 tablespoon'
  ];

  constructor(private recipeService: RecipeService, private router: Router, private http: HttpClient, private firebaseService: FirebaseService) {} // Inject Router
  

 
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
        this.firebaseService.addRecipe(this.currentRecipe)
      }
      this.resetCurrentRecipe();
    }
  }

  editRecipe(recipe: Recipe) {
    this.isEditing = true;
    this.currentRecipe = { ...recipe, spices: [...recipe.spices] };
  }

  deleteRecipe(recipe: Recipe) {
    this.firebaseService.deleteRecipe(String(recipe.id));
  }

  shareRecipe(recipe: Recipe) {

  }

  dispenseRecipe(recipe: Recipe) {
    this.http.post('http://localhost:4000/dispenseRecipe', recipe).subscribe(
      (response: any) => {
        if (response.lowSpices) {
          const lowSpicesList = response.lowSpices.map((spice: SpiceMeasurement) => spice.spiceName).join(', ');
          const userResponse = confirm(`The following spice containers must be refilled in order to dispense the recipe: ${lowSpicesList}\nDo you want to refill or cancel?`); //TODO: change to be custom modal?
  
          if (userResponse) {
            // User chose to refill
            this.http.post('http://localhost:4000/dispenseRecipe', { ...recipe, userResponse: 'refill' }).subscribe(
              (response) => {
                console.log('Dispense output:', response);
              },
              (error) => {
                console.error('Error dispensing recipe:', error);
              }
            );
          } else {
            // User chose to cancel
            this.http.post('http://localhost:4000/dispenseRecipe', { ...recipe, userResponse: 'cancel' }).subscribe(
              (response) => {
                console.log('Dispense output:', response);
              },
              (error) => {
                console.error('Error dispensing recipe:', error);
              }
            );
          }
        } else {
          console.log('Dispense output:', response);
        }
      },
      (error) => {
        console.error('Error dispensing recipe:', error);
      }
    );
  }

  resetCurrentRecipe() {
    this.currentRecipe = { recipeName: '', spices: [] };
    this.isEditing = false;
    this.newSpice = { spiceName: '', spiceMeasurement: '' };
  }

  ngOnInit() {

    this.firebaseService.getRecipes().subscribe(recipes => {
      this.recipes = recipes
    })
  }

  goBack() {
    this.router.navigate(['/']);
  }
  
}
