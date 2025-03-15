import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule} from "@angular/forms"
import { HttpClient } from '@angular/common/http';
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
     
  constructor(private fb:FormBuilder, private http: HttpClient, private firebaseRecipeService: FirebaseRecipeService) {  
     
    this.productForm = this.fb.group({  
      recipeName: '',  
      spices: this.fb.array([]) ,  
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
      togglePublic: false,
    };

    await this.firebaseRecipeService.addRecipe(newRecipe);
    console.log('Recipe added:', newRecipe);

    this.productForm.reset()

  }
}