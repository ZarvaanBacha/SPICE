import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  standalone: true,
  selector: 'app-selection-screen',
  imports: [CommonModule],
  templateUrl: './selection-screen.component.html',
  styleUrls: ['./selection-screen.component.css']
})
export class SelectionScreenComponent {
  constructor(private router: Router, private http: HttpClient) {}

  goToManualSpiceDispense() {
    this.router.navigate(['/spice-select']);
  }

  goToRecipes() {
    this.router.navigate(['/recipes']);
  }

  goLowSpice() {
    this.router.navigate(['/low-spice']);
  }

  //TODO: the data is not instantly displayed on other pages. deal with pulling data from db here to pass to other pages?
  // example 1: the spice choices arent instantly displayed on the spice select page
  // example 2: the low spice containers arent instantly displayed on the low spice page
}
