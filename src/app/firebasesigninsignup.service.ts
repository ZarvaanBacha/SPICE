import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FirebasesigninsignupService {

  constructor(private firestore: Firestore, private http: HttpClient) {}

  private async getSpicesFromDatabase(email: string): Promise<string[]> {
    const spiceLogRef = doc(this.firestore, `users/${email}/device/spiceLog`);
    const spiceSnap = await getDoc(spiceLogRef);

    if (spiceSnap.exists()) {
      const spiceData = spiceSnap.data();
      return Object.values(spiceData) as string[];
    } else {
      console.error('No spice log found in Firestore!');
      return [];
    }
  }

  async autofillContainers(email: string): Promise<void> {
    try {
      const spices = await this.getSpicesFromDatabase(email);

      if (spices.length === 0) {
        console.error('No spices found. Cannot autofill containers.');
        return;
      }

      for (let i = 0; i < 8; i++) {
        const qrCodeId = i+1;
        const containerId = `container_${i + 1}`;
        const spiceName = spices[i % spices.length]; 
        const spiceQuantity = 100;
        const timesUsed = 0;
        const totalQuantityUsed = 0;
        const isLow = false;
        const lastRefilled = new Date().toISOString();
        const usageHistory = [];

        const containerData = {
          qrCodeId,
          containerId,
          spiceName,
          spiceQuantity,
          isLow,
          location: i + 1,
          timesUsed,
          totalQuantityUsed,
          lastRefilled,
          usageHistory
        };

        const containerRef = doc(this.firestore, `users/${email}/containers/${containerId}`);
        await setDoc(containerRef, containerData);
      }

      console.log('Containers successfully added using spices from Firestore!');
    } catch (error) {
      console.error('Error autofilling containers:', error);
    }
  }

  async signupUser(name: string, email: string, password: string) {
    
    // create user document
    const userToAdd = {name: name, email: email, password: password};
    const credentialsRef = doc(this.firestore, `users/${email}`);
    await setDoc(credentialsRef, userToAdd);

    // create deviceInfo document
    const deviceRefInfo = doc(this.firestore, `users/${email}/device/deviceInfo`);
    await setDoc(deviceRefInfo, {productID: null});

    // create spiceLog document
    const spices = {
      1: 'Pepper',
      2: 'Salt',
      3: 'Paprika',
      4: 'Cumin',
      5: 'Cinnamon',
      6: 'Parsley',
      7: 'Italian seasoning',
      8: 'Oregano'
    };

    const deviceRefSpiceLog = doc(this.firestore, `users/${email}/device/spiceLog`);
    await setDoc(deviceRefSpiceLog, spices);

    // create notificationLog document
    const deviceRefNotificationLog = doc(this.firestore, `users/${email}/device/notificationLog`);
    await setDoc(deviceRefNotificationLog, {log: []});

    this.autofillContainers(email);
  }

  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  async signinUser(email: string, password: string) {
    const userRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      if (userSnap.data()['password']==password) {
        console.log("Authentication Successful")
        this.http.post("http://localhost:3000/login", { email }).subscribe(
          response => {
            console.log('Server response:', response);
          },
          error => {
            console.error('Error connecting to server:', error);
          });
        location.assign("authenticated/home")
      }
      else {
        console.log("Incorrect Password")
      }
    } 
    else {
        console.log("No such document!") //TODO: toast to tell user that the email is not registered
    }
  }

}
