

import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc } from '@angular/fire/firestore';
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
  
  updateRecipe(recipeId: string, data: Partial<any>): Promise<void> {
    const recipeRef = doc(this.firestore, `recipes/${recipeId}`);
    return updateDoc(recipeRef, data);
  }

  deleteRecipe(recipeId: string): Promise<void> {
    const recipeRef = doc(this.firestore, `recipes/${recipeId}`);
    return deleteDoc(recipeRef);
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
