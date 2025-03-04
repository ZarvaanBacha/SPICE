import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch} from "@angular/common/http";
import { AuthInterceptor } from './shared/authInterceptor';

const firebaseConfig = {
  apiKey: "AIzaSyDXXuWYYuJgBGBE3rOayZmAfncfaeNuY_Y",
  authDomain: "spicedb-84047.firebaseapp.com",
  projectId: "spicedb-84047",
  storageBucket: "spicedb-84047.firebasestorage.app",
  messagingSenderId: "532594839779",
  appId: "1:532594839779:web:a13c771d36867f1e63f5d6"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideHttpClient(withFetch()),
    {provide: HTTP_INTERCEPTORS,useClass:AuthInterceptor, multi:true},
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ]
};
