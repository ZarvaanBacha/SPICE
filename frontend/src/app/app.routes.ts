import {  Routes } from '@angular/router';
import { SpiceSelectComponent } from './spice-select/spice-select.component'; 
import { SpiceDispenserComponent } from './spice-dispenser/spice-dispenser.component'; 

export const routes: Routes = [
  { path: '', component: SpiceSelectComponent }, // Default route to spice select
  { path: 'dispense', component: SpiceDispenserComponent } // Route to spice dispenser
];
