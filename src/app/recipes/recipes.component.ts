import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule} from "@angular/forms"
import { FirebaseRecipeService } from '../firebase-recipe.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
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
      //console.error('Error fetching spice options:', error);
    });
  }  
    
  spices() : FormArray {  
    return this.productForm.get("spices") as FormArray  
  }  
     
  newSpice(): FormGroup {  
    return this.fb.group({  
      spiceName: '',  
      spiceMeasurement: '',  
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

    const newRecipe = {
      recipeName: this.productForm.value.recipeName,
      spices: this.productForm.value.spices,
      isPublic: false,
    };

    await this.firebaseRecipeService.addRecipe(newRecipe);
    console.log('Recipe added:', newRecipe);

    this.productForm.reset()

  }

  //TODO: get spices from db
}