import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc, query, where, limit, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseRecipeService {
  constructor(private firestore: Firestore) {}

  getRecipes(): Observable<any[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    return collectionData(recipesRef, { idField: 'id' });
  }
  
  updateRecipe(recipeId: string, data: Partial<any>): Promise<void> {
    const recipeRef = doc(this.firestore, `recipes/${recipeId}`);
    return updateDoc(recipeRef, data);
  }

  deleteRecipe(recipeId: string): Promise<void> {
    const recipeRef = doc(this.firestore, `recipes/${recipeId}`);
    return deleteDoc(recipeRef);
  }

  async toggleRecipePublic(change: boolean, recipeId: string) {
    const recipeRef = doc(this.firestore, `recipes/${recipeId}`);
    await updateDoc(recipeRef, { isPublic: change });

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

  /**
   * Retrieves the first `n` public recipes from all users.
   * @param n The number of public recipes to retrieve.
   * @returns A Promise that resolves to an array of public recipes.
   */
  async getPublicRecipes(n: number): Promise<any[]> {
    try {
      const recipesRef = collection(this.firestore, 'recipes');
      const publicRecipesQuery = query(
        recipesRef,
        where('isPublic', '==', true), // Filter for public recipes
        limit(n) // Limit the number of results to `n`
      );

      const querySnapshot = await getDocs(publicRecipesQuery);
      const publicRecipes = querySnapshot.docs.map((doc) => ({ //change the fields collected here:
        recipeName: doc.data()['recipeName'],
        spices: doc.data()['spices'],
        //TODO: possibly add a counter to how many times the recipe was added by other users
      }));

      return publicRecipes;
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      throw error;
    }
  }
}
