import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc, query, where, limit, getDocs, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseRecipeService { //TODO: fix this service to work for user-specific recipes
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
        //TODO-minor: possibly add a counter to how many times the recipe was added by other users
      }));

      return publicRecipes;
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      throw error;
    }
  }

  async getAnalytics() {
    try {
      // Fetch all recipes from the database
      const recipesRef = collection(this.firestore, 'recipes');
      const recipesSnapshot = await getDocs(recipesRef);
      const recipes = recipesSnapshot.docs.map(doc => ({
        id: doc.id, // Include the document ID
        ...doc.data(), // Include all fields in the recipe document
      }));
  
      // Fetch all spice containers from the database
      const containersRef = collection(this.firestore, 'containers');
      const containersSnapshot = await getDocs(containersRef);
      const containers = containersSnapshot.docs.map(doc => ({
        id: doc.id, // Include the document ID
        ...doc.data(), // Include all fields in the container document
      }));
  
      return {
        recipeAnalytics: recipes,
        spiceContainerAnalytics: containers,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  async addDeviceToDatabase(productID: string): Promise<void> {
    try {
      // Get a reference to the 'deviceInfo' document in the 'device' subcollection
      const userId = 'test@spice.com'; // Replace with the actual user ID
      const deviceInfoRef = doc(this.firestore, `users/${userId}/device/deviceInfo`);
  
      // Update the 'productID' field in the 'deviceInfo' document
      await updateDoc(deviceInfoRef, { productID: productID });
      console.log(`Product ID ${productID} successfully added to the database.`);
    } catch (error) {
      console.error('Error adding product ID to the database:', error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<any> {
    try {
      const userId = 'test@spice.com'; // Replace with the actual user ID
  
      // References to the required documents
      const deviceInfoRef = doc(this.firestore, `users/${userId}/device/deviceInfo`);
      const spiceLogRef = doc(this.firestore, `users/${userId}/device/spiceLog`);
      const notificationLogRef = doc(this.firestore, `users/${userId}/device/notificationLog`);
  
      // Fetch the deviceInfo document
      const deviceInfoSnap = await getDoc(deviceInfoRef);
      if (!deviceInfoSnap.exists()) {
        throw new Error('DeviceInfo document does not exist.');
      }
      const productID = deviceInfoSnap.data()['productID'];
  
      // Fetch the spiceLog document
      const spiceLogSnap = await getDoc(spiceLogRef);
      if (!spiceLogSnap.exists()) {
        throw new Error('SpiceLog document does not exist.');
      }
      const spiceLogData = spiceLogSnap.data();
    
      // Combine all the data into a single JSON object
      const result = {
        productID,
        spiceLog: spiceLogData,
      };
  
      return result;
    } catch (error) {
      console.error('Error retrieving device info:', error);
      throw error;
    }
  }
}
