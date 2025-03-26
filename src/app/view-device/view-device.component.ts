import { Component, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-device',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './view-device.component.html',
  styleUrl: './view-device.component.css'
})
export class ViewDeviceComponent implements OnInit{
  deviceInfo: any = {};

  spiceContainerAnalytics: any[] = [];
  lowSpiceThreshold: number = 10;

  toastVisible: boolean = false;
  toastText: string = "An error occured.";

  constructor(private firebaseRecipeService: FirebaseRecipeService, private router: Router){}

  ngOnInit() {
    this.firebaseRecipeService.getDeviceInfo()
      .then(deviceInfo => {
        this.deviceInfo = deviceInfo;
        console.log('Device Info retrieved:', deviceInfo);
      })
      .catch(error => {
        console.error('Error retrieving device info:', error);
      });

    this.fetchAndLogAnalytics();
  }

  /**
   * Fetches analytics data from Firebase and output to the console.
   */
  async fetchAndLogAnalytics(): Promise<void> {
    try {
      const analyticsData = await this.firebaseRecipeService.getAnalytics();
      this.spiceContainerAnalytics = analyticsData.spiceContainerAnalytics;
      console.log('Analytics Data:', this.spiceContainerAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }

  removeDevice() {
    this.firebaseRecipeService.removeDeviceToDatabase(this.deviceInfo.productID)
      .then(() => {
        //console.log('Device added successfully.');
        this.showToast('Device removed successfully.');
        this.deviceInfo = {}; //reset device info
        this.spiceContainerAnalytics = []; //reset analytics
      })
      .catch((err) => {
        //console.error('Error adding device:', err);
        this.showToast('An error occured.');
      });
  }

  showToast(toastText: string) {
    
    this.toastText = toastText;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  hasLowSpices(): boolean {
    return this.spiceContainerAnalytics.some(spice => spice.spiceQuantity < this.lowSpiceThreshold);
  }

  goToAddDevice() {
    this.router.navigate(['/authenticated/addDevice']); // Redirect to the "add device" page
  }
}
