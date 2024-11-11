import { Routes } from '@angular/router';
import { SelectionScreenComponent } from './selection-screen/selection-screen.component';
import { SpiceSelectComponent } from './spice-select/spice-select.component';
import { SpiceDispenserComponent } from './spice-dispenser/spice-dispenser.component';

export const appRoutes: Routes = [
  { path: '', component: SelectionScreenComponent },
  { path: 'spice-select', component: SpiceSelectComponent },
  { path: 'dispense', component: SpiceDispenserComponent },
];