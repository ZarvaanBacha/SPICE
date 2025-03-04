import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  async deleteRecipe(RecipeId: string): Promise<void> {
    try {
      const recipeToDelete = doc(this.firestore, 'recipes',RecipeId)
      await deleteDoc(recipeToDelete)
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }

  getRecipes(): Observable<any[]> {
    const recipesRef = collection(this.firestore, 'recipes'); 
    return collectionData(recipesRef, { idField: 'id'}); 
  }

  async addRecipe(recipe: any): Promise<void> {
    try {
      const recipeToAdd = collection(this.firestore, 'recipes'); 
      await addDoc(recipeToAdd, recipe);
      console.log('Recipe added successfully!');
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  }
}
