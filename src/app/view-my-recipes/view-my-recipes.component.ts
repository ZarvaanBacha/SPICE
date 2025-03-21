import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-view-my-recipes',
  standalone: true,
  imports:[ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './view-my-recipes.component.html',
  styleUrls: ['./view-my-recipes.component.css']
})
export class ViewMyRecipesComponent implements OnInit { //TODO:if editing is on, disable all other edit buttons. its buggy when users click 2 edit buttons.
  recipes: any[] = [];
  recipeForms: { [key: string]: FormGroup } = {};
  isPublic: boolean;

  spiceMeasurements: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 and 1/8 teaspoon', '1 and 1/4 teaspoon',
    '1 and 1/2 teaspoon', '1 and 3/4 teaspoon', '2 teaspoon'
  ]; //TODO: add tablespoon measurements?

  spiceOptions: string[] = [];

  constructor(private fb: FormBuilder, private firebaseRecipeService: FirebaseRecipeService) {}

  ngOnInit() {
    this.firebaseRecipeService.getRecipes().subscribe((recipes) => {
      this.recipes = recipes.map(recipe => ({
        ...recipe,
        editing: false 
      }));

      this.recipes.forEach(recipe => {
        this.recipeForms[recipe.id] = this.fb.group({
          recipeName: [recipe.recipeName],
          spices: this.fb.array(recipe.spices.map(spice => this.fb.group({
            spiceName: [spice.spiceName],
            spiceMeasurement: [spice.spiceMeasurement],
            spiceQuantityInEighthTsp: [this.convertToEighthTeaspoons(spice.spiceMeasurement)],
          }))),
          isPublic: this.isPublic
        });
      });
    });

    this.firebaseRecipeService.getSpiceOptions()
    .then(spiceOptions => {
      this.spiceOptions = spiceOptions;
      //console.log('Spice Options:', spiceOptions);
    })
    .catch(error => {
      console.error('Error fetching spice options:', error);
    });
  }

  toggle(recipeId: string) {
    // Find the recipe by ID
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (recipe) {
      recipe.isPublic = !recipe.isPublic; // Toggle the isPublic property
  
      // update the backend
      this.firebaseRecipeService.toggleRecipePublic(recipe.isPublic, recipeId)
        .then(() => console.log('Recipe public state updated successfully'))
        .catch(error => console.error('Error updating recipe public state:', error));
    }
  }

  getSpices(recipeId: string) {
    return this.recipeForms[recipeId].get('spices') as FormArray;
  }

  editRecipe(recipe: any) {
    recipe.editing = true;
  }

  deleteRecipe(recipeId: string) {
    this.firebaseRecipeService.deleteRecipe(recipeId);
  }

  // TODO: fix the view-my-recipes. when edit is clicked, the spice measurements are all 1/8 teaspoon.
  //TODO: deal with empty spices (either empty name, empty measurement, or both)
  saveRecipe(recipe: any) {
    
    this.recipeForms[recipe.id].value.isPublic = recipe.isPublic;
    const updatedRecipe = this.recipeForms[recipe.id].value;

    // Convert spice measurements to eighth teaspoons
    updatedRecipe.spices = updatedRecipe.spices.map((spice: any) => ({
      ...spice,
      spiceQuantityInEighthTsp: this.convertToEighthTeaspoons(spice.spiceMeasurement),
    }));

    console.log('Updated Recipe:', updatedRecipe);


    this.firebaseRecipeService.updateRecipe(recipe.id, updatedRecipe)
      .then(() => {
        recipe.recipeName = updatedRecipe.recipeName;
        recipe.spices = updatedRecipe.spices;
        recipe.editing = false;
        recipe.isPublic = updatedRecipe.isPublic;
      })
      .catch(error => console.error('Error updating recipe:', error));
  }

  addSpice(recipeId: string) {
    this.getSpices(recipeId).push(this.fb.group({
      spiceName: [''],
      spiceMeasurement: [''],
      spiceQuantityInEighthTsp: [0],
    }));
  }

  removeSpice(recipeId: string, index: number) {
    this.getSpices(recipeId).removeAt(index);
  }

  convertToEighthTeaspoons(measurement: string): number {
    const regex = /(\d+\s*\d*\/?\d*)\s*(tablespoon|teaspoon|tbsp|tsp)/gi;
    let match;
    let totalTeaspoons = 0;
  
    while ((match = regex.exec(measurement)) !== null) {
      let valueStr = match[1].trim();
      let unit = match[2].toLowerCase();
      let value: number;
  
      //Handle mixed fractions (e.g., "2 3/4")
      if (valueStr.includes(' ')) {
        const [whole, fraction] = valueStr.split(' ');
        const [numerator, denominator] = fraction.split('/').map(Number);
        value = parseInt(whole) + numerator / denominator;
      } 
      //Handle proper fractions (e.g., "3/4")
      else if (valueStr.includes('/')) {
        const [numerator, denominator] = valueStr.split('/').map(Number);
        value = numerator / denominator;
      } 
      //Handle whole numbers (e.g., "2")
      else {
        value = parseInt(valueStr);
      }
  
      //Convert to teaspoons
      if (unit === 'tablespoon' || unit === 'tbsp') {
        totalTeaspoons += value * 3; //1 tablespoon = 3 teaspoons
      } else if (unit === 'teaspoon' || unit === 'tsp') {
        totalTeaspoons += value;
      }
    }
  
    return Math.round(totalTeaspoons / 0.125); // Convert to 1/8th teaspoons
  }
}
