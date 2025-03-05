import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-view-my-recipes',
  standalone: true,
  imports: [NgFor],
  templateUrl: './view-my-recipes.component.html',
  styleUrl: './view-my-recipes.component.css'
})
export class ViewMyRecipesComponent implements OnInit{
  recipes: any[] = [];
  
  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.firebaseService.getRecipes().subscribe(recipes => {
      this.recipes = recipes;
      console.log('Fetched Recipes:', this.recipes);
    });
  }

  shareRecipe(){

  }

  editRecipe(){

  }

  deleteRecipe(idToDelete: string){
    this.firebaseService.deleteRecipe(idToDelete)
  }
}