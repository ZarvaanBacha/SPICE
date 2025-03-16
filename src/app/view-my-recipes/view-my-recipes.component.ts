
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

  publicRecipes: any[] = []; //TODO: move to shared recipe page

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
          isPublic: this.isPublic
        });
      });
    });

    this.loadPublicRecipes(5); //TODO: move to shared recipe page
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

  saveRecipe(recipe: any) {
    
    this.recipeForms[recipe.id].value.isPublic = recipe.isPublic;
    const updatedRecipe = this.recipeForms[recipe.id].value;

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
      spiceMeasurement: ['']
    }));
  }

  removeSpice(recipeId: string, index: number) {
    this.getSpices(recipeId).removeAt(index);
  }

  async loadPublicRecipes(n: number) { //TODO: move to shared recipe page
    try {
      this.publicRecipes = await this.firebaseRecipeService.getPublicRecipes(n);
      console.log('Public Recipes:', this.publicRecipes);
    } catch (error) {
      console.error('Error loading public recipes:', error);
    }
  }
}
