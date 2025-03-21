import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule} from "@angular/forms"
import { FirebaseRecipeService } from '../firebase-recipe.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent {
  productForm: FormGroup;  
  spiceOptions: string[] = [];
  

  constructor(private fb:FormBuilder, private firebaseRecipeService: FirebaseRecipeService) {  
     
    this.productForm = this.fb.group({  
      recipeName: '',  
      spices: this.fb.array([]) ,  
    });  

    this.firebaseRecipeService.getSpiceOptions()
    .then(spiceOptions => {
      this.spiceOptions = spiceOptions;
      //console.log('Spice Options:', spiceOptions);
    })
    .catch(error => {
      console.error('Error fetching spice options:', error);
    });
  }  
    
  spices() : FormArray {  
    return this.productForm.get("spices") as FormArray  
  }  
     
  newSpice(): FormGroup {  
    return this.fb.group({  
      spiceName: '',  
      spiceMeasurement: '', 
      //spiceQuantityInEighthTsp: 0,
    })  
  }
     
  addSpice() {  
    this.spices().push(this.newSpice());  
  }  
     
  removeSpice(i:number) {  
    this.spices().removeAt(i);  
  }  
     
  async onSubmit() {  //TODO: toast to tell user recipe was added    
    if (!this.productForm.value.recipeName || this.productForm.value.spices.length === 0) {
      alert('Please enter a recipe name and at least one spice.');
      return;
    }
  
    // Filter out invalid spices and convert measurements to eighth teaspoons
    const validSpices = this.productForm.value.spices
      .filter((spice: any) => spice.spiceName && spice.spiceMeasurement) // Remove spices with null/empty fields
      .map((spice: any) => ({
        ...spice,
        spiceQuantityInEighthTsp: this.convertToEighthTeaspoons(spice.spiceMeasurement), // Convert measurement
      }));
    
    //console.log(validSpices);

    if (validSpices.length === 0) {
      alert('All spices were invalid. Please add valid spices.');
      return;
    }
  
    const newRecipe = {
      recipeName: this.productForm.value.recipeName,
      spices: validSpices,
      isPublic: false,
    };
  
    await this.firebaseRecipeService.addRecipe(newRecipe);

    // console.log('Recipe added:', newRecipe);
  
    this.productForm.reset();
  }

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
}