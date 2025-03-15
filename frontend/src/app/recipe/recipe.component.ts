import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Recipe, SpiceMeasurement, SpiceContainer } from '../models/recipe.model';
import { RecipeService } from '../recipe-service/recipe.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeyboardModuleModule } from '../keyboard-module/keyboard-module.module';
import { FirebaseService } from '../firebase.service';


@Component({
  standalone: false,
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css'],
})
export class RecipeComponent {
  recipes: any[] = [];// TODO : this should be of type Recipe[]
  lowSpicesList: string = '';
  currentRecipe: any = { recipeName: '', spices: [] }; // TODO: change to be a Recipe object
  newSpice: SpiceMeasurement = { spiceName: '', spiceMeasurement: '', spiceQuantityInEighthTsp: 0 };
  isEditing = false;
  requiresRefill = false; // Add a flag to indicate if refill is required
  showButton = false;
 
  spiceOptions: string[] = []; // Initialize as an empty array
  measurementOptions: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 1/2 teaspoons', '1 tablespoon'
  ];

  constructor(private recipeService: RecipeService, private router: Router, private http: HttpClient, private firebaseService: FirebaseService) {} // Inject Router
  
  
 
  setRecipeName(event: Event) {
    this.currentRecipe.recipeName = (event.target as HTMLInputElement).value;
  }

 
  selectSpice(event: Event) {
    this.newSpice.spiceName = (event.target as HTMLSelectElement).value;
  }


  selectMeasurement(event: Event) {
    this.newSpice.spiceMeasurement = (event.target as HTMLSelectElement).value;
    this.newSpice.spiceQuantityInEighthTsp = this.convertToEighthTeaspoons(this.newSpice.spiceMeasurement); // Convert measurement to 1/8th teaspoons
  }

  addIngredient() {
    if (this.newSpice.spiceName && this.newSpice.spiceMeasurement) {
      this.currentRecipe.spices.push({ ...this.newSpice });
      this.newSpice = { spiceName: '', spiceMeasurement: '', spiceQuantityInEighthTsp: 0 }; 
      this.currentRecipe = { ...this.currentRecipe };
    }
  }

  removeIngredient(index: number) {
    this.currentRecipe.spices.splice(index, 1);

    this.currentRecipe = { ...this.currentRecipe };
  }

  saveOrUpdateRecipe() {
    if (this.currentRecipe.recipeName && this.currentRecipe.spices.length > 0) {
      if (this.isEditing) {
        this.recipeService.updateRecipe({ ...this.currentRecipe });
      } else {
        this.firebaseService.addRecipe(this.currentRecipe)
      }
      this.resetCurrentRecipe();
    }
  }

  editRecipe(recipe: Recipe) {
    this.isEditing = true;
    this.currentRecipe = { ...recipe, spices: [...recipe.spices] };
  }

  deleteRecipe(recipe: Recipe) {
    this.firebaseService.deleteRecipe(String(recipe.id));
  }

  shareRecipe(recipe: Recipe) {

  }

  // dispenseRecipe(recipe: Recipe) { //TODO change to redirect user to lowspice page if user needs to refill
  //   this.http.post('http://localhost:4000/dispenseRecipe', recipe).subscribe(
  //     (response: any) => {
  //       if (response.lowSpices) { // If there are low spices that need to be refilled before dispensing
  //         const lowSpicesList = response.lowSpices.map((spice: SpiceMeasurement) => spice.spiceName).join(', ');
  //         const userResponse = confirm(`The following spice containers must be refilled in order to dispense the recipe: ${lowSpicesList}\nDo you want to refill or cancel?`); //TODO: change to be custom modal?
  
  //         if (userResponse) {
  //           // User chose to refill
  //           this.http.post('http://localhost:4000/dispenseRecipe', { ...recipe, userResponse: 'refill' }).subscribe(
  //             (response) => {
  //               console.log('Dispense output:', response);
  //             },
  //             (error) => {
  //               console.error('Error dispensing recipe:', error);
  //             }
  //           ); //TODO: replace by gotolowspice function call
  //         } else {
  //           // User chose to cancel
  //           this.http.post('http://localhost:4000/dispenseRecipe', { ...recipe, userResponse: 'cancel' }).subscribe(
  //             (response) => {
  //               console.log('Dispense output:', response);
  //             },
  //             (error) => {
  //               console.error('Error dispensing recipe:', error);
  //             }
  //           ); //TODO: remove the refill prompt buttons, dont call the endpoint
  //         }
  //       } else {
  //         console.log('Dispense output:', response); //TODO: make it go to dispensing animation page
  //       }
  //     },
  //     (error) => {
  //       console.error('Error dispensing recipe:', error);
  //     }
  //   );
  // }

  dispenseRecipe(recipe: Recipe) {
    this.http.post('http://localhost:4000/dispenseRecipe', recipe).subscribe(
      (response: any) => {
        if (response.lowSpices) {
          this.lowSpicesList = response.lowSpices.map((spice: SpiceMeasurement) => spice.spiceName).join(', '); //TODO : remove? not sure if this is needed
          this.showButton = true;
          this.requiresRefill = true;
      
        } else {
          console.log('Dispense output:', response);
        }
      },
      (error) => {
        console.error('Error dispensing recipe:', error);
      }
    );
  }

  Cancel(recipe: Recipe){
    //User chose to Cancel
    //doesnt need to call api, just stop button show
    this.showButton = false;
    this.requiresRefill = false;
    this.http.post('http://localhost:4000/dispenseRecipe', { ...recipe, userResponse: 'cancel' }).subscribe(
      (response) => {
        console.log('Dispense output:', response);
      },
      (error) => {
        console.error('Error dispensing recipe:', error);
      }
    );
    
  }

  Refill(recipe: Recipe){
    // User chose to refill
    this.requiresRefill = false;
    this.showButton = false;
    this.goLowSpice(recipe)


  }

  resetCurrentRecipe() {
    this.currentRecipe = { recipeName: '', spices: [] };
    this.isEditing = false;
    this.newSpice = { spiceName: '', spiceMeasurement: '', spiceQuantityInEighthTsp: 0 };
  }

  ngOnInit() {
    this.fetchSpiceOptions(); // Fetch spice options on initialization

    this.firebaseService.getRecipes().subscribe(recipes => {
      this.recipes = recipes
      console.log('Recipes:', this.recipes);
    })
  }

  fetchSpiceOptions() {
    this.http.get<SpiceContainer[]>('http://localhost:4000/api/getSpiceContainers').subscribe(
      (response) => {
        // Extract spice names from the response and populate spiceOptions
        this.spiceOptions = response.map(container => container.spiceName);
        //console.log('Spice options fetched:', this.spiceOptions);
      },
      (error) => {
        console.error('Error fetching spice options:', error);
      }
    );
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goLowSpice(recipe: Recipe) {
    this.http.post<SpiceContainer[]>('http://localhost:4000/api/getSpicesToRefillFromRecipe', recipe).subscribe(
      (spicesToRefill) => {
        this.router.navigate(['/low-spice'], {
          queryParams: { spices: JSON.stringify({ spices: spicesToRefill }), fromDispense: true },
        });
      },
      (error) => {
        console.error('Error fetching spices to refill:', error);
      }
    );
  }
  
  // New method to convert measurement string to 1/8th teaspoons
  convertToEighthTeaspoons(measurement: string): number { //TODO: this has a duplicate in spice-dispenser.component.ts, to fix
    const regex = /(\d+)\s*(tablespoon|teaspoon|tbsp|tsp)/i;
    const match = measurement.match(regex);

    if (!match) {
      throw new Error('Invalid measurement format');
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    let teaspoons = 0;

    if (unit === 'tablespoon' || unit === 'tbsp') {
      teaspoons = value * 3; // 1 tablespoon = 3 teaspoons
    } else if (unit === 'teaspoon' || unit === 'tsp') {
      teaspoons = value;
    }

    return Math.round(teaspoons / 0.125); // Convert to 1/8th teaspoons
  }

}
