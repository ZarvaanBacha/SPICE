import { Component, OnInit } from '@angular/core';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { NgFor, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-find-recipes',
  standalone: true,
  imports: [NgFor, AsyncPipe],
  templateUrl: './find-recipes.component.html',
  styleUrls: ['./find-recipes.component.css']
})
export class FindRecipesComponent implements OnInit {
  publicRecipes: any[] = [];

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
    console.log('Recipe added:', newRecipe);
  }
}