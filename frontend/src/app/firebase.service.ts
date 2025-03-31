import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService { //TODO: fix this service to work for user-specific recipes
  constructor(private firestore: Firestore) {}
  userName: string = 'demo@spice.com';


  getRecipes(): Observable<any[]> {
    const recipesRef = collection(this.firestore, `users/${this.userName}/recipes`);
    return collectionData(recipesRef, { idField: 'id' });
  }

  async addRecipe(recipe: any) {
    try {
      const recipesRef = collection(this.firestore, `users/${this.userName}/recipes`);

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
      const recipeToDelete = doc(this.firestore, `users/${this.userName}/recipes`, RecipeId);
      await deleteDoc(recipeToDelete);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }

}
