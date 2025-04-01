import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { LocalNotificationService } from '../local-notification.service';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,AsyncPipe],
  providers: [FirebaseRecipeService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  lowSpiceNotif: boolean = false; //Stores server low Spice Status
  lowSpiceThreshold: number = 10; // %
  localSpiceNotif:BehaviorSubject<Boolean>; //Stores local low spice status
  viewDev: string = 'View Device'

  constructor(private firebaseRecipeService: FirebaseRecipeService, private localNotificationService: LocalNotificationService) {};

  async ngOnInit()  {
    try {
        this.firebaseRecipeService.GetLowSpice(this.lowSpiceThreshold).then((lowSpiceFound) => {
        this.lowSpiceNotif = lowSpiceFound;
        this.localSpiceNotif = this.localNotificationService.lowSpiceNotification;
        this.localNotificationService.setNotification(this.lowSpiceNotif);
        //console.log("this.lowSpiceNotif: ", this.lowSpiceNotif);
      })
    } catch (error) {
      console.error('Error fetching low spices: ', error);
      this.lowSpiceNotif = false; // Set to false if there's an error
      throw error;
    }
  }
}
