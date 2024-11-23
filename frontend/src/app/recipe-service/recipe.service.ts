import { Injectable } from '@angular/core';
import { Recipe } from '../models/recipe.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  constructor(private http: HttpClient) {}

  addRecipe(recipe: Recipe): void {

    this.http.post("http://localhost:4000/addRecipe",recipe).subscribe(res => {
    })
  }

  updateRecipe(updatedRecipe: Recipe): void {

    this.http.post("http://localhost:4000/updateRecipe", updatedRecipe).subscribe(res => {
    })
  }

  deleteRecipe(recipeToDelete: Recipe): void {
    
    this.http.post("http://localhost:4000/deleteRecipe",recipeToDelete).subscribe(res => {
    })
  }
}
