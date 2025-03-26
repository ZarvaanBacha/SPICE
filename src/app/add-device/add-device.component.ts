import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceModel } from '../shared/deviceModel'
import { FirebaseRecipeService } from '../firebase-recipe.service';

import { NgIf } from '@angular/common';
import { FirebaseMainService } from '../firebase-main.service';

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [NgIf],
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.css'
})
export class AddDeviceComponent {

  constructor(private firebaseRecipeService: FirebaseRecipeService){}
  toastVisible: boolean = false;
  toastText: string = "An error occured.";

  onSubmit(productID: string) {
    if (productID == "") {
      this.showToast("An error occured.");
      return;
    }

    this.firebaseRecipeService.addDeviceToDatabase(productID)
      .then(() => {
        console.log('Device added successfully.');
        this.showToast('Device added successfully.');
      })
      .catch((err) => {
        console.error('Error adding device:', err);
        this.showToast('Device was not added.');
      });
  }

  showToast(toastText: string) {
    
    this.toastText = toastText;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

}
