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

  onSubmit(productID: string) {
    this.firebaseRecipeService.addDeviceToDatabase(productID)
      .then(() => {
        console.log('Device added successfully.');
      })
      .catch((err) => {
        console.error('Error adding device:', err);
      });



  // onSubmit(productID: string){
  //   this.Firebasemain.setProductID(productID)
  // }

  // resetDevice() {
  //   this.Firebasemain.setProductID(this.userId, null)
  //     .then(() => {
  //       console.log('Device reset successfully');
  //       this.productID = null;
  //     })
  //     .catch(error => console.error('Error resetting device:', error));
  // }
  }

}
