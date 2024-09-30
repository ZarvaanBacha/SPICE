import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Ensure this points to the right config
import { AppComponent } from './app/app.component'; // Ensure this points to the right component

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));