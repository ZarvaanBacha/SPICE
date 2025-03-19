import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceModel } from '../shared/deviceModel'
import { FirebaseRecipeService } from '../firebase-recipe.service';


@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [],
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
  }

}
