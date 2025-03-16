import { Component,OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpiceContainer, Recipe } from '../models/recipe.model';
import { HttpClient } from '@angular/common/http';

import { Subscription } from 'rxjs';
import { SocketService } from '../socket-service/socket.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-spice-dispenser',
  templateUrl: './spice-dispenser.component.html',
  styleUrls: ['./spice-dispenser.component.css'],
})
export class SpiceDispenserComponent implements OnDestroy, OnInit {
  //TODO: (FOR NOAH) we dont need socket service anymore? remove if not needed
  private messageSubscription: Subscription; // HTTP fields
  messages: number = 0;
  newMessage: number = this.messages;
  isFinished : boolean = false;

  //TODO: fix measurements? 
  public measurement = 0; // Start with 0
  public selectedStep = 0.125; // Default to 1/8 teaspoon
  public incrementOptions = [0.125, 0.25, 3]; // 1/8 tsp, 1/4 tsp, 1 tbsp

  selectedSpice!: SpiceContainer; // Selected spice from the spice select page

  constructor(private router: Router, private socketService: SocketService, private route: ActivatedRoute, private http: HttpClient) {
    this.messageSubscription = this.socketService//constructor to recieve messages from serverr
    .on('message')
    .subscribe((data) => {
        this.messages = data; // Sending data to server
        this.isFinished = false;
    });
    this.messageSubscription = this.socketService.on('finished').subscribe((data) => {
      console.log(data);
      this.isFinished = data; 
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['selectedSpice']) {
        this.selectedSpice = JSON.parse(params['selectedSpice']);
        console.log('Selected Spice:', this.selectedSpice);
      }
    });
  }

  dispenseSpice() {
    // map this.selectedSpice to a Recipe object
    const recipe: Recipe = {
      recipeName: this.selectedSpice.spiceName, // Use the spiceName as the recipeName
      spices: [
        {
          spiceName: this.selectedSpice.spiceName,
          spiceMeasurement: '', // empty string for now, would be formatMeasurement()
          spiceQuantityInEighthTsp: this.measurement, // current selected measurement
        },
      ],
    };
    
    // make the payload
    const payload = {
      recipe,
      FromSingleDispense: true, // Flag to indicate single spice dispensing
    };

    this.http.post('http://localhost:4000/dispenseRecipe', payload).subscribe(
      (response: any) => {
        if (response) {
          console.log('Dispense output:', response);
      
        } else {
          console.log('no response');
        }
      },
      (error) => {
        console.error('Error dispensing recipe:', error);
      }
    );
  }

  sendMessage() {//Function to allow sending to server
    this.newMessage = this.toAbsolute(this.measurement);
    this.socketService.emit('message', this.newMessage);
    console.log(this.newMessage);
    this.newMessage = this.messages;
  }

  ngOnDestroy(): void {//Closes subscription while window not active
    this.messageSubscription.unsubscribe();
  }

  //TODO: this needs to exit properly after dispensing is complete.
  loading(){
    this.router.navigate(['/loading']);
  }

  goBack() {
    this.router.navigate(['/spice-select']); // Navigate back to the spice select page
  }


  //TODO: add more increment options
  // Function to increment the measurement
  increment() {
    this.measurement += this.selectedStep;
  }

  // Function to decrement the measurement (minimum 0)
  decrement() {
    if (this.measurement >= this.selectedStep) {
      this.measurement -= this.selectedStep;
    } else {
      // Set to zero if less than selected step
      this.measurement = 0;
    }
  }

  // Function to reset the measurement to 0
  reset() {
    this.measurement = 0;
  }

  // Function to set the increment size
  setIncrement(value: number) {
    this.selectedStep = value;
  }

  // Function to format measurement and display as tablespoons and teaspoons
  formatMeasurement(): string {
    const teaspoonsPerTablespoon = 3;
    const tablespoons = Math.floor(this.measurement / teaspoonsPerTablespoon);
    const remainingTeaspoons = this.measurement % teaspoonsPerTablespoon;

    // Check if there are no tablespoons and no teaspoons
    if (tablespoons === 0 && remainingTeaspoons === 0) {
      return ''; // Return empty string if nothing to display
    }

    let result = '';

    if (tablespoons > 0) {
      result += `${tablespoons} tablespoon${tablespoons !== 1 ? 's' : ''}`;
    }

    if (remainingTeaspoons > 0) {
      const fraction = this.toFractionTeaspoon(remainingTeaspoons);
      result += `${result ? ' ' : ''}${fraction} teaspoon${remainingTeaspoons !== 1 ? 's' : ''}`;
    }

    return result.trim();
  }

  // Function to convert decimals to fractions for teaspoons
  toFractionTeaspoon(value: number): string {
    const fractions: { [key: string]: string } = {
      '0.125': '1/8',
      '0.250': '1/4',
      '0.333': '1/3',
      '0.375': '3/8',
      '0.500': '1/2',
      '0.625': '5/8',
      '0.750': '3/4',
      '0.833': '5/6',
      '0.875': '7/8',
      '1': '1'
    };

    const whole = Math.floor(value);
    let decimalPart = (value - whole).toFixed(3);
    let fraction = fractions[decimalPart] || '';

    // Return only the simplest fractions or whole numbers
    if (value % 1 === 0) {
      return `${whole}`; // Return the whole number
    }

    // Check if the current fraction is valid
    if (fraction) {
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }

    // If no valid fraction is found, return the decimal representation
    return value.toFixed(3); // Return the decimal value
  }

  toAbsolute(value:number): number{ //Returns the necessary amount of presses to match selected spice amount
    return value/0.125;
  }

  // New method to convert measurement string to 1/8th teaspoons
  convertToEighthTeaspoons(measurement: string): number { //TODO: move to service or backend?
    const regex = /(\d+)\s*(tablespoon|teaspoon|tbsp|tsp)/i;
    const match = measurement.match(regex);

    if (!match) {
      throw new Error('Invalid measurement format');
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    let teaspoons = 0;

    if (unit === 'tablespoon' || unit === 'tbsp') {
      teaspoons = value * 3; // 1 tablespoon = 3 teaspoons
    } else if (unit === 'teaspoon' || unit === 'tsp') {
      teaspoons = value;
    }

    return Math.round(teaspoons / 0.125); // Convert to 1/8th teaspoons
  }

}













