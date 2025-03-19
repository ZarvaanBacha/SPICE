import { Component,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [],
  templateUrl: './loading-screen.component.html',
  styleUrl: './loading-screen.component.css'
})
export class LoadingScreenComponent {
  messages: number = 0;
  newMessage: number = this.messages;
  isFinished : boolean = false;


  constructor(private router: Router) {
  }
  goBack() {
    this.router.navigate(['/dispense']); // Navigate back to the spice select page
  }


}
