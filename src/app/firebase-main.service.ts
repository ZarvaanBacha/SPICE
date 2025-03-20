import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, collection, collectionData, deleteDoc, addDoc, query, where, limit, getDocs, docData, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMainService {

  constructor(private firestore: Firestore) {}

  getProductID(userId: string): Observable<any> {
    const deviceRef = doc(this.firestore, `users/test/device/deviceInfo`); //TODO: change test to userEmail
    return docData(deviceRef);
  }

  async setProductID(productID: string | null) {
    const deviceRef = doc(this.firestore, `users/test/device/deviceInfo`); //TODO: change test to userEmail
    return setDoc(deviceRef, { productID }, { merge: true });
  }
}
