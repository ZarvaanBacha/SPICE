import { Component } from '@angular/core';
import { ViewMyRecipesComponent } from "../view-my-recipes/view-my-recipes.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ViewMyRecipesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
}
