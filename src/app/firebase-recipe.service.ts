import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc, query, where, limit, getDocs, getDoc } from '@angular/fire/firestore';
import { Observable, timer, from , firstValueFrom} from 'rxjs'
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class FirebaseRecipeService {
  constructor(private firestore: Firestore, private http: HttpClient) {}

  getAuthEmail(): Observable<string> {
    return this.http.get<{ email: string }>('http://localhost:3000/recipeService')
      .pipe(map(res => res.email));
  } 
  
  getRecipes(): Observable<any[]> {
    return this.getAuthEmail().pipe(
      switchMap(email => {
        const recipesRef = collection(this.firestore, `users/${email}/recipes`);
        return collectionData(recipesRef, { idField: 'id' });
      })
    );
  }
  
  updateRecipe(recipeId: string, data: Partial<any>): void {
    this.getAuthEmail().pipe(
      switchMap(email => {
        const recipeRef = doc(this.firestore, `users/${email}/recipes/${recipeId}`);
        return from(updateDoc(recipeRef, data));
      })
    ).subscribe({
      next: () => {
        console.log('Recipe updated successfully!');
      },
      error: (err) => {
        console.error('Error updating recipe:', err);
      }
    });
  }

  deleteRecipe(recipeId: string): void {
    this.getAuthEmail().pipe(
      switchMap(email => {
        const recipeRef = doc(this.firestore, `users/${email}/recipes/${recipeId}`);
        return from(deleteDoc(recipeRef));
      })
    ).subscribe({
      next: () => {
        console.log('Recipe deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting recipe:', err);
      }
    });
  }

  async toggleRecipePublic(change: boolean, recipeId: string) {
    this.getAuthEmail().pipe(
      switchMap(email => {
        const recipeRef = doc(this.firestore, `users/${email}/recipes/${recipeId}`);
        return from(updateDoc(recipeRef, { isPublic: change }));
      })
    ).subscribe({
      next: () => {
        console.log('Recipe updated successfully!');
      },
      error: (err) => {
        console.error('Error updating recipe:', err);
      }
    });
}

  async addRecipe(recipe: any): Promise<any> {
    this.getAuthEmail().pipe(
      switchMap(email => {
        const recipeToAdd = collection(this.firestore, `users/${email}/recipes`);

        // to add custom fields to recipes
        const recipeWithCustomFields = {
          ...recipe,
          timesUsed: 0, // Initialize timesUsed to 0
          usageHistory: [], // Initialize usageHistory as an empty array
          isPublic: false, // Initialize isPublic to false
        };

        return from(addDoc(recipeToAdd, recipeWithCustomFields));
      })
    ).subscribe({
      next: () => {
        console.log('Recipe added successfully!');
      },
      error: (err) => {
        console.error('Error adding recipe:', err);
      }
    });
  }

  /**
   * Retrieves the first `n` public recipes from all users.
   * @param n The number of public recipes to retrieve.
   * @param m The maximum number of public recipes to retrieve per user.
   * @returns A Promise that resolves to an array of public recipes.
   */
  async getPublicRecipes(n: number, m: number): Promise<any[]> {
    try {
      const usersRef = collection(this.firestore, 'users'); // Reference to the users collection
      const usersSnapshot = await getDocs(usersRef); // Get all user documents
  
      const publicRecipes: any[] = [];
  
      // Iterate through each user document
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id; // Get the user document ID
        const userName = userDoc.data()['name'];

        // check if userDoc refers to the user currently searching
        const email = await firstValueFrom(this.getAuthEmail());
        if (email == userDoc.id) {
          continue; // skip this user
        }

        const recipesRef = collection(this.firestore, `users/${userId}/recipes`); // Reference to the user's recipes collection

        // Query public recipes in the user's recipes collection
        const publicRecipesQuery = query(
          recipesRef,
          where('isPublic', '==', true), // Filter for public recipes
          limit(m) // Limit the number of results to remaining slots
        );
  
        const recipesSnapshot = await getDocs(publicRecipesQuery);
  
        // Add public recipes to the result array, including the userId
        recipesSnapshot.docs.forEach((doc) => {
          publicRecipes.push({
            userName: userName, // Include the username
            recipeName: doc.data()['recipeName'], // Recipe name
            spices: doc.data()['spices'], // Recipe spices
          });
        });
  
        // Stop if we've reached the desired number of public recipes
        if (publicRecipes.length >= n) {
          break;
        }
      }
  
      return publicRecipes;
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const email = await firstValueFrom(this.getAuthEmail());

      // Fetch all recipes from the database
      const recipesRef = collection(this.firestore, `users/${email}/recipes`);
      const recipesSnapshot = await getDocs(recipesRef);
      const recipes = recipesSnapshot.docs.map(doc => ({
        id: doc.id, // Include the document ID
        ...doc.data(), // Include all fields in the recipe document
      }));
  
      // Fetch all spice containers from the database
      const containersRef = collection(this.firestore, `users/${email}/containers`);
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
      // Convert the Observable to a Promise and await the email
      const email = await firstValueFrom(this.getAuthEmail());

      // Get a reference to the 'deviceInfo' document in the 'device' subcollection
      const deviceInfoRef = doc(this.firestore, `users/${email}/device/deviceInfo`);
  
      // Update the 'productID' field in the 'deviceInfo' document
      await updateDoc(deviceInfoRef, { productID: productID });
  
      console.log(`Product ID ${productID} successfully added to the database.`);
    } catch (error) {
      console.error('Error adding product ID to the database:', error);
      throw error;
    }
  }

  async removeDeviceToDatabase(productID: string): Promise<void> {
    try {
      // Convert the Observable to a Promise and await the email
      const email = await firstValueFrom(this.getAuthEmail());

      // Get a reference to the 'deviceInfo' document in the 'device' subcollection
      const deviceInfoRef = doc(this.firestore, `users/${email}/device/deviceInfo`);
  
      // Update the 'productID' field in the 'deviceInfo' document
      await updateDoc(deviceInfoRef, { productID: null });
  
      console.log(`Product ID ${productID} successfully removed from the database.`);
    } catch (error) {
      console.error('Error removing product ID from the database:', error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<any> {
    try {
      // Convert the Observable to a Promise and await the email
      const email = await firstValueFrom(this.getAuthEmail());
  
      // References to the required documents
      const deviceInfoRef = doc(this.firestore, `users/${email}/device/deviceInfo`);
      const spiceLogRef = doc(this.firestore, `users/${email}/device/spiceLog`);
      const notificationLogRef = doc(this.firestore, `users/${email}/device/notificationLog`);
  
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

  async getSpiceOptions() {
    try {
      // Convert the Observable to a Promise and await the email
      const email = await firstValueFrom(this.getAuthEmail());  

      // References to the required documents
      const spiceLogRef = doc(this.firestore, `users/${email}/device/spiceLog`);
      
      // Fetch the spiceLog document
      const spiceLogSnap = await getDoc(spiceLogRef);
      if (!spiceLogSnap.exists()) {
        throw new Error('SpiceLog document does not exist.');
      }

      // Extract fields 1 to 8 and map them into a string array
      const spiceLogData = spiceLogSnap.data();
      const spiceOptions: string[] = [];
      for (let i = 1; i <= 8; i++) {
        const spice = spiceLogData[i.toString()]; // Access fields as strings ("1", "2", ..., "8")
        if (spice) {
          spiceOptions.push(spice); // Add the spice name to the array if it exists
        }
      }

      return spiceOptions;
    } catch (error) {
      console.error('Error fetching spice options:', error);
      throw new Error('Failed to fetch spice options');
    }
  }

  async GetLowSpice(threshold: number): Promise<boolean> {
    try {
      const email = await firstValueFrom(this.getAuthEmail());

      
      // get all spice levels from the database and check for low spices
      const containersRef = collection(this.firestore, `users/${email}/containers`);
      const containersSnapshot = await getDocs(containersRef);
      
      for (const containerDoc of containersSnapshot.docs) {
        const containerData = containerDoc.data(); 
        const spiceQuantity = containerData['spiceQuantity']; // get spiceQuantity

        // return true as soon as a low spice is found
        if (spiceQuantity < threshold) {
          //console.log(containerData['spiceName']);
          return true;
        }
      }
    
      return false;
    } catch (error) { // in case of error, just return false. no notifs shown, no harm done. right?
      console.error('Error fetching low spices:', error);
      return false;
    }
  }
}
