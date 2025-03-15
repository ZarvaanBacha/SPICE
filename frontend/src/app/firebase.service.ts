import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  getRecipes(): Observable<any[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    return collectionData(recipesRef, { idField: 'id' });
  }

  async addRecipe(recipe: any) { //TODO: change any to Recipe object
    try {
      const recipesRef = collection(this.firestore, 'recipes');

      // to add custom fields to recipes
      const recipeWithCustomFields = {
        ...recipe,
        timesUsed: 0, // Initialize timesUsed to 0
        usageHistory: [], // Initialize usageHistory as an empty array
        isPublic: false, // Initialize isPublic to false
      };

      await addDoc(recipesRef, recipeWithCustomFields);
      console.log('Recipe added successfully!');
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  }

  async deleteRecipe(RecipeId: string) {
    try {
      const recipeToDelete = doc(this.firestore, 'recipes',RecipeId)
      await deleteDoc(recipeToDelete)
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }

}
