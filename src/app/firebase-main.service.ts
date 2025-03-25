import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc, query, where, limit, getDocs, docData, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMainService { //TODO-minor: remove completely? its not used anywhere.

  constructor(private firestore: Firestore) {}

  getProductID(userId: string): Observable<any> {
    const deviceRef = doc(this.firestore, `users/test/device/deviceInfo`);
    return docData(deviceRef);
  }

  async setProductID(productID: string | null) {
    const deviceRef = doc(this.firestore, `users/test/device/deviceInfo`);
    return setDoc(deviceRef, { productID }, { merge: true });
  }
}
