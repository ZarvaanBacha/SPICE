import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { FirebaseRecipeService } from '../firebase-recipe.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  providers: [FirebaseRecipeService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  lowSpiceNotif: boolean = false;
  lowSpiceThreshold: number = 10; // %

  constructor(private firebaseRecipeService: FirebaseRecipeService) {};

  async ngOnInit()  {
    try {
      this.firebaseRecipeService.GetLowSpice(this.lowSpiceThreshold).then((lowSpiceFound) => {
        this.lowSpiceNotif = lowSpiceFound;
        //console.log("this.lowSpiceNotif: ", this.lowSpiceNotif);
      })
    } catch (error) {
      console.error('Error fetching low spices: ', error);
      this.lowSpiceNotif = false; // Set to false if there's an error
      throw error;
    }
  }
}
