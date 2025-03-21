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
import { NgIf } from '@angular/common';
import { ActivatedRoute} from '@angular/router';

@Component({
  
  standalone: false,
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css'],
})
export class RecipeComponent {
  recipes: any[] = [];// TODO-minor : this should be of type Recipe[]
  lowSpicesList: string = '';
  currentRecipe: any = { recipeName: '', spices: [] }; // TODO-minor: change to be a Recipe object
  newSpice: SpiceMeasurement = { spiceName: '', spiceMeasurement: '', spiceQuantityInEighthTsp: 0 };
  isEditing = false;
  requiresRefill = false; // Add a flag to indicate if refill is required
  showButton = false;
  selectedRecipeForDispense: Recipe | null = null; // Add this property

  toastVisible: boolean = false;

  lowSpiceContainers: SpiceContainer[] = [];
 
  spiceOptions: string[] = []; // Initialize as an empty array
  measurementOptions: string[] = [
    '1/8 teaspoon', '1/4 teaspoon', '1/2 teaspoon', '3/4 teaspoon',
    '1 teaspoon', '1 1/2 teaspoons', '1 tablespoon'
  ];

  constructor(private route: ActivatedRoute,private recipeService: RecipeService, private router: Router, private http: HttpClient, private firebaseService: FirebaseService) {} // Inject Router
  
  
 
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

  dispenseRecipe(recipe: Recipe) {
    // make the payload
    const payload = {
      recipe,
      FromSingleDispense: false, // Flag to indicate single spice dispensing
    };

    if (this.checkLowSpicesInRecipe(recipe)) { // check if recipe can be dispensed
      this.router.navigate(['/loading']); // Navigate to the loading page before starting the dispensing process
      
      this.http.post('http://localhost:4000/dispenseRecipe', payload).subscribe(
        (response: any) => {
          if (response) {
            console.log('Dispense output:', response);
    
            this.router.navigate(['/recipes'], { queryParams: { toast: 'dispense-success' } }); //TODO-minor: add a message for the user to indicate that dispensing is complete
          } else {
            console.log('No response from backend.');
          }
        },
        (error) => {
          console.error('Error dispensing recipe:', error);
    
          this.router.navigate(['/recipes']); // navigate back to spice-select on error
        }
      );
    }
  }

  Cancel(recipe: Recipe){
    this.selectedRecipeForDispense = null; // Reset the selected recipe
    //User chose to Cancel
    //doesnt need to call api, just stop button show
    this.showButton = false;
    this.requiresRefill = false;
  }

  Refill(recipe: Recipe){
    this.selectedRecipeForDispense = null; // Reset the selected recipe
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
    this.getLowSpiceContainers(); // Fetch low spice containers on initialization

    this.firebaseService.getRecipes().subscribe(recipes => {
      this.recipes = recipes
      console.log('Recipes:', this.recipes);
    })

    this.route.queryParams.subscribe(params => {
      if (params['toast'] === 'dispense-success') {
        this.showToast();
      }
    });

  }

  showToast() {
    
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  fetchSpiceOptions() {
    this.http.get<SpiceContainer[]>('http://localhost:4000/getSpiceContainers').subscribe(
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
    this.http.post<SpiceContainer[]>('http://localhost:4000/getSpicesToRefillFromRecipe', recipe).subscribe(
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
  convertToEighthTeaspoons(measurement: string): number {
    const regex = /(\d+\s*\d*\/?\d*)\s*(tablespoon|teaspoon|tbsp|tsp)/gi;
    let match;
    let totalTeaspoons = 0;
  
    while ((match = regex.exec(measurement)) !== null) {
      let valueStr = match[1].trim();
      let unit = match[2].toLowerCase();
      let value: number;
  
      //Handle mixed fractions (e.g., "2 3/4")
      if (valueStr.includes(' ')) {
        const [whole, fraction] = valueStr.split(' ');
        const [numerator, denominator] = fraction.split('/').map(Number);
        value = parseInt(whole) + numerator / denominator;
      } 
      //Handle proper fractions (e.g., "3/4")
      else if (valueStr.includes('/')) {
        const [numerator, denominator] = valueStr.split('/').map(Number);
        value = numerator / denominator;
      } 
      //Handle whole numbers (e.g., "2")
      else {
        value = parseInt(valueStr);
      }
  
      //Convert to teaspoons
      if (unit === 'tablespoon' || unit === 'tbsp') {
        totalTeaspoons += value * 3; //1 tablespoon = 3 teaspoons
      } else if (unit === 'teaspoon' || unit === 'tsp') {
        totalTeaspoons += value;
      }
    }
  
    return Math.round(totalTeaspoons / 0.125); // Convert to 1/8th teaspoons
  }


  getLowSpiceContainers() {
    this.http.get<SpiceContainer[]>('http://localhost:4000/getLowSpices').subscribe(
      (response) => {
        this.lowSpiceContainers = response;
        console.log('Low spice containers fetched from backend:', this.lowSpiceContainers);
      },
      (error) => {
        console.error('Error fetching low spice containers:', error);
      }
    );
  }

  /**
   * Checks if any spices in the recipe are in the lowSpiceContainers list.
   * @param recipe The recipe to check.
   * @returns a boolean indicating if the recipe can be dispensed
   */
  checkLowSpicesInRecipe(recipe: Recipe): boolean {
    const lowSpicesInRecipe = recipe.spices.filter((spice) =>
      this.lowSpiceContainers.some(
        (lowSpice) => lowSpice.spiceName === spice.spiceName
      )
    );

    if (lowSpicesInRecipe.length > 0) {
      this.selectedRecipeForDispense = recipe; // Set the selected recipe
      this.lowSpicesList = lowSpicesInRecipe.map((spice: SpiceMeasurement) => spice.spiceName).join(', ');
      this.showButton = true;
      this.requiresRefill = true;
      return false;
    } else {
      return true;
    }
  }
}
