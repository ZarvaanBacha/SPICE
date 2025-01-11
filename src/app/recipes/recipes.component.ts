import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule} from "@angular/forms"
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent {
    
  productForm: FormGroup;  
     
  constructor(private fb:FormBuilder, private http: HttpClient) {  
     
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
     
  onSubmit() {     
    console.log(this.productForm.value.spices.length)
    this.http.post("http://localhost:3000/addRecipe", this.productForm.value).subscribe(res => {
      console.log(res)
    })
  }  
}