import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-spice-dispenser',
  templateUrl: './spice-dispenser.component.html',
  styleUrls: ['./spice-dispenser.component.css']
})
export class SpiceDispenserComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']); // Navigate back to the spice select page
  }


  public measurement = 0; // Start with 0
  public selectedStep = 0.125; // Default to 1/8 teaspoon
  public incrementOptions = [0.125, 0.25, 3]; // 1/8 tsp, 1/4 tsp, 1 tbsp

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
}













