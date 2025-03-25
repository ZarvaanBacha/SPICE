import { Component, OnInit } from '@angular/core';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { NgFor, AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-find-recipes',
  standalone: true,
  imports: [NgFor, AsyncPipe, NgIf],
  templateUrl: './find-recipes.component.html',
  styleUrls: ['./find-recipes.component.css']
})
export class FindRecipesComponent implements OnInit {
  publicRecipes: any[] = [];

  toastVisible: boolean = false;
  toastText: string = "An error occured.";

  constructor(private firebaseRecipeService: FirebaseRecipeService) {}

  async ngOnInit() {
    try {
      this.publicRecipes = await this.firebaseRecipeService.getPublicRecipes(20, 4);
      console.log('Public recipes:', this.publicRecipes);
    } catch (error) {
      console.error('Error fetching public recipes:', error);
    }
  }

  async saveRecipe(recipe: any) {
    const newRecipe = {
      recipeName: recipe.recipeName,
      spices: recipe.spices,
      isPublic: false,
    };

    await this.firebaseRecipeService.addRecipe(newRecipe);
    //console.log('Recipe added:', newRecipe);
    this.showToast(`${recipe.recipeName} saved successfully.`);
  }

  showToast(toastText: string) {
    
    this.toastText = toastText;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}