import { Routes } from '@angular/router';
import { SelectionScreenComponent } from './selection-screen/selection-screen.component';
import { SpiceSelectComponent } from './spice-select/spice-select.component';
import { SpiceDispenserComponent } from './spice-dispenser/spice-dispenser.component';
import { RecipeComponent } from './recipe/recipe.component';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { LowSpiceComponent } from './low-spice/low-spice.component';

export const appRoutes: Routes = [
  { path: '', component: SelectionScreenComponent },
  { path: 'spice-select', component: SpiceSelectComponent },
  { path: 'dispense', component: SpiceDispenserComponent },
  { path: 'recipes', component: RecipeComponent },
  { path: 'loading', component: LoadingScreenComponent },
  { path: 'low-spice', component: LowSpiceComponent}
];