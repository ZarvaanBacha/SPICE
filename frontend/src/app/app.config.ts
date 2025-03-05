import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXXuWYYuJgBGBE3rOayZmAfncfaeNuY_Y",
  authDomain: "spicedb-84047.firebaseapp.com",
  databaseURL: "https://spicedb-84047-default-rtdb.firebaseio.com",
  projectId: "spicedb-84047",
  storageBucket: "spicedb-84047.firebasestorage.app",
  messagingSenderId: "532594839779",
  appId: "1:532594839779:web:a13c771d36867f1e63f5d6"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(appRoutes), provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
};
