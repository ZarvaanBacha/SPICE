import { Component } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FirebaseRecipeService } from '../firebase-recipe.service';

@Component({
  selector: 'app-view-device',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './view-device.component.html',
  styleUrl: './view-device.component.css'
})
export class ViewDeviceComponent {
  deviceInfo: any;

  constructor(private firebaseRecipeService: FirebaseRecipeService){}

  ngOnInit() {
    this.firebaseRecipeService.getDeviceInfo()
      .then(deviceInfo => {
        this.deviceInfo = deviceInfo;
        console.log('Device Info retrieved:', deviceInfo);
      })
      .catch(error => {
        console.error('Error retrieving device info:', error);
      });
  }

}
