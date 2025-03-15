
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
export class ViewMyRecipesComponent implements OnInit {
  recipes: any[] = [];
  recipeForms: { [key: string]: FormGroup } = {};
  isPublic: boolean

  spiceMeasurements: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 and 1/8 teaspoon', '1 and 1/4 teaspoon',
    '1 and 1/2 teaspoon', '1 and 3/4 teaspoon', '2 teaspoon'
  ];

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
            spiceMeasurement: [spice.spiceMeasurement]
          }))),
          togglePublic: this.isPublic
        });
      });
    });
  }

  toggle(recipeId: string) {
    this.isPublic = !this.isPublic;
    console.log('Toggle Switch is now:', this.isPublic ? 'ON' : 'OFF');
    this.firebaseRecipeService.toggleRecipePublic(this.isPublic, recipeId)
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

  saveRecipe(recipe: any) {
    const updatedRecipe = this.recipeForms[recipe.id].value;

    this.firebaseRecipeService.updateRecipe(recipe.id, updatedRecipe)
      .then(() => {
        recipe.recipeName = updatedRecipe.recipeName;
        recipe.spices = updatedRecipe.spices;
        recipe.editing = false;
      })
      .catch(error => console.error('Error updating recipe:', error));
  }

  addSpice(recipeId: string) {
    this.getSpices(recipeId).push(this.fb.group({
      spiceName: [''],
      spiceMeasurement: ['']
    }));
  }

  removeSpice(recipeId: string, index: number) {
    this.getSpices(recipeId).removeAt(index);
  }
}
