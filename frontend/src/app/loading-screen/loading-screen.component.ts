import { Component,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../socket-service/socket.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [],
  templateUrl: './loading-screen.component.html',
  styleUrl: './loading-screen.component.css'
})
export class LoadingScreenComponent {
  private messageSubscription: Subscription; // HTTP fields
  messages: number = 0;
  newMessage: number = this.messages;
  isFinished : boolean = false;


  constructor(private router: Router, private socketService: SocketService) {
    this.messageSubscription = this.socketService//constructor to recieve messages from serverr
    .on('message')
    .subscribe((data) => {
        this.messages = data; // Sending data to server
        this.isFinished = false;
    });
    this.messageSubscription = this.socketService.on('finished').subscribe((data) => {
      console.log(data);
      this.isFinished = data; 
      this.goBack();
    });
  }
  goBack() {
    this.router.navigate(['/dispense']); // Navigate back to the spice select page
  }


}
