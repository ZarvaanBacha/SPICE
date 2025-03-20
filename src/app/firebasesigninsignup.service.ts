import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc, query, where, limit, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebasesigninsignupService {

  constructor(private firestore: Firestore) {}

  async signupUser(name: string, email: string, password: string) {
    const userToAdd = {name: name, email: email, password: password}

    const credentialsRef = doc(this.firestore, `users/${email}`)
    await setDoc(credentialsRef, userToAdd)


    const deviceRef = doc(this.firestore, `users/${email}/device/deviceInfo`)
    await setDoc(deviceRef, {productID: null})

    // TODO: create spiceLog doc in deviceInfo
    // TODO: create notificationLog doc in deviceInfo
    
    //TODO: NEED TO IMPLEMENT CONTAINERS, ask ludo for container function!!!
    // const containersRef = doc(this.firestore, `users/${email}/containers/`)


    //DO NOT NEED RECIPE HERE
    // const recipeRef = doc(this.firestore, `users/${email}/recipes/null`)
    // await setDoc(recipeRef, {initialized: true})


  }

  async signinUser(email: string, password: string) {
    const userRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data(); // Returns document data
    } else {
      console.log("No such document!");
      return null;
    }
  }

}
