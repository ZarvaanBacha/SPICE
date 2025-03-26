import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule} from "@angular/forms"
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, NgIf],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent {
  productForm: FormGroup;  
  spiceOptions: string[] = [];
  
  // AI Recipe Suggestion Variables
  aiRecipeDescription: string = '';
  maxAiDescriptionLength = 30; // Set the character limit for AI recipe suggestion
  aiRemainingCharacters = this.maxAiDescriptionLength;

  // Store AI recipe suggestions
  aiRecipeSuggestions: any[] = [];
  waitingOnResponse: boolean = false;

  toastVisible: boolean = false;
  toastText: string = "An error occured.";

  constructor(private fb:FormBuilder, private firebaseRecipeService: FirebaseRecipeService, private http: HttpClient) {  
     
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
     
  async onSubmit() {
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
    this.showToast(`${this.productForm.value.recipeName} saved successfully.`);
    
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

  // Update remaining characters for AI recipe suggestion
  updateAiRemainingCharacters() {
    this.aiRemainingCharacters = this.maxAiDescriptionLength - (this.aiRecipeDescription?.length || 0);
  }

  // Handle AI Recipe Suggestion Submission
  submitAiRecipe() {
    if (this.aiRecipeDescription.trim().length === 0) {
      alert('Please enter a description for your AI recipe suggestion.');
      return;
    }

    const quantitySuggestion = 3; // query 3 suggestions from the model
    const payload = { userInput: this.aiRecipeDescription, quantitySuggestion: quantitySuggestion };
    
    this.waitingOnResponse = true;

    this.http.post("http://localhost:3000/getModelSuggestions", payload).subscribe(
      (response: any) => {
        //console.log('Server response:', response);

        this.waitingOnResponse = false;

        // Process the suggestions and map spices
        this.aiRecipeSuggestions = (response.suggestions || []).map((suggestion: any) => ({
          recipeName: suggestion.recipeName,
          spices: suggestion.spices.map((spice: any) => ({
            spiceName: spice.spiceName,
            spiceMeasurement: this.convertFromEighthTeaspoons(spice.spiceQuantity),
            spiceQuantityInEighthTsp: spice.spiceQuantity,
          })),
        }));
      },
      error => {
        this.waitingOnResponse = false;
        console.error('Error connecting to server:', error);
      }
    );

    // Reset the text box and remaining characters
    this.aiRecipeDescription = '';
    this.aiRemainingCharacters = this.maxAiDescriptionLength;
  }

  showToast(toastText: string) {
      
    this.toastText = toastText;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  async addAiRecipe(suggestion: any) {
  
    await this.firebaseRecipeService.addRecipe(suggestion);

    // console.log('Recipe added:', newRecipe);
    this.showToast(`${suggestion.recipeName} saved successfully.`);
    this.aiRecipeSuggestions = []; // reset suggestion
  }

  convertFromEighthTeaspoons(eighthTeaspoons: number): string {
    const teaspoons = eighthTeaspoons * 0.125; // Convert to teaspoons
    const tablespoons = Math.floor(teaspoons / 3); // 1 tbsp = 3 tsp
    let remainingTeaspoons = teaspoons % 3; // Remaining teaspoons after extracting tbsp

    let result = [];

    if (tablespoons > 0) {
        result.push(`${tablespoons} tablespoon`);
    }

    if (remainingTeaspoons > 0) {
        const wholeTeaspoons = Math.floor(remainingTeaspoons);
        const fraction = remainingTeaspoons - wholeTeaspoons;

        let fractionStr = "";
        if (fraction === 0.125) fractionStr = "1/8";
        else if (fraction === 0.25) fractionStr = "1/4";
        else if (fraction === 0.375) fractionStr = "3/8";
        else if (fraction === 0.5) fractionStr = "1/2";
        else if (fraction === 0.625) fractionStr = "5/8";
        else if (fraction === 0.75) fractionStr = "3/4";
        else if (fraction === 0.875) fractionStr = "7/8";

        let teaspoonStr = "";

        if (wholeTeaspoons > 0) {
            teaspoonStr += `${wholeTeaspoons}`;
        }

        if (fractionStr) {
            teaspoonStr += (wholeTeaspoons > 0 ? " and " : "") + fractionStr;
        }

        teaspoonStr += " teaspoon";
        result.push(teaspoonStr);
    }

    return result.join(" ");
  }
}