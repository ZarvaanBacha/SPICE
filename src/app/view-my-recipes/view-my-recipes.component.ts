// // import { Component, OnInit } from '@angular/core';
// // import { NgFor } from '@angular/common';
// // import { FirebaseService } from '../firebase.service';

// // @Component({
// //   selector: 'app-view-my-recipes',
// //   standalone: true,
// //   imports: [NgFor],
// //   templateUrl: './view-my-recipes.component.html',
// //   styleUrl: './view-my-recipes.component.css'
// // })
// // export class ViewMyRecipesComponent implements OnInit{
// //   recipes: any[] = [];
  
// //   constructor(private firebaseService: FirebaseService) {}

// //   ngOnInit() {
// //     this.loadRecipes();
// //   }

// //   loadRecipes() {
// //     this.firebaseService.getRecipes().subscribe(recipes => {
// //       this.recipes = recipes;
// //       console.log('Fetched Recipes:', this.recipes);
// //     });
// //   }

// //   shareRecipe(){

// //   }

// //   editRecipe(){

// //   }

// //   deleteRecipe(idToDelete: string){
// //     this.firebaseService.deleteRecipe(idToDelete)
// //   }
// // }

// import { Component, OnInit } from '@angular/core';
// import { FirebaseService } from '../firebase.service';
// import { FormsModule } from '@angular/forms';
// import { NgFor, NgIf } from '@angular/common';

// @Component({
//   selector: 'app-view-my-recipes',
//   standalone: true,
//   imports: [FormsModule, NgIf, NgFor],
//   templateUrl: './view-my-recipes.component.html',
//   styleUrls: ['./view-my-recipes.component.css']
// })
// export class ViewMyRecipesComponent implements OnInit {
//   recipes: any[] = [];

//   constructor(private firebaseService: FirebaseService) {}

//   ngOnInit() {
//     this.firebaseService.getRecipes().subscribe((recipes) => {
//       this.recipes = recipes.map(recipe => ({
//         ...recipe,
//         editing: false,  // Toggle edit mode
//         newName: recipe.recipeName,  // Store editable recipe name
//         newSpices: recipe.spices ? [...recipe.spices] : [] // Clone spices array for editing
//       }));
//     });
//   }

//   // Enable editing mode
//   editRecipe(recipe: any) {
//     recipe.editing = true;
//   }

//   // Save the edited recipe (name and spices)
//   saveRecipe(recipe: any) {
//     if (!recipe.newName.trim()) return;

//     const updatedData = {
//       recipeName: recipe.newName,
//       spices: recipe.newSpices
//     };

//     this.firebaseService.updateRecipe(recipe.id, updatedData)
//       .then(() => {
//         recipe.recipeName = recipe.newName;  // Update UI
//         recipe.spices = [...recipe.newSpices];  // Update UI with new spices
//         recipe.editing = false; // Exit editing mode
//       })
//       .catch(error => console.error('Error updating recipe:', error));
//   }

//   // Add a new spice field
//   addSpice(recipe: any) {
//     recipe.newSpices.push({ spiceName: '', spiceMeasurement: '' });
//   }

//   // Remove a spice
//   removeSpice(recipe: any, index: number) {
//     recipe.newSpices.splice(index, 1);
//   }

//   deleteRecipe(recipeId: string) {
//     this.firebaseService.deleteRecipe(recipeId);
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
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
  recipeForms: { [key: string]: FormGroup } = {}; // Stores forms for each recipe

  spiceMeasurements: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 and 1/8 teaspoon', '1 and 1/4 teaspoon',
    '1 and 1/2 teaspoon', '1 and 3/4 teaspoon', '2 teaspoon'
  ];

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.firebaseService.getRecipes().subscribe((recipes) => {
      this.recipes = recipes.map(recipe => ({
        ...recipe,
        editing: false // Track edit mode
      }));

      // Initialize form for each recipe
      this.recipes.forEach(recipe => {
        this.recipeForms[recipe.id] = this.fb.group({
          recipeName: [recipe.recipeName],
          spices: this.fb.array(recipe.spices.map(spice => this.fb.group({
            spiceName: [spice.spiceName],
            spiceMeasurement: [spice.spiceMeasurement]
          })))
        });
      });
    });
  }

  getSpices(recipeId: string) {
    return this.recipeForms[recipeId].get('spices') as FormArray;
  }

  editRecipe(recipe: any) {
    recipe.editing = true;
  }

  deleteRecipe(recipeId: string) {
    this.firebaseService.deleteRecipe(recipeId);
  }

  saveRecipe(recipe: any) {
    const updatedRecipe = this.recipeForms[recipe.id].value;

    this.firebaseService.updateRecipe(recipe.id, updatedRecipe)
      .then(() => {
        recipe.recipeName = updatedRecipe.recipeName;
        recipe.spices = updatedRecipe.spices;
        recipe.editing = false; // Exit edit mode
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
