import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData} from '@angular/fire/firestore';
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
}
