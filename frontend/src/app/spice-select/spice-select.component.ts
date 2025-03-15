import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiceContainer } from '../models/recipe.model';
import { SpiceButtonComponent } from '../spice-button/spice-button.component';
import { FormControl, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-spice-select',
  standalone: true,
  imports: [SpiceButtonComponent, CommonModule, FormsModule],
  templateUrl: './spice-select.component.html',
  styleUrl: './spice-select.component.css'
})
export class SpiceSelectComponent implements OnInit {
  selectSpice: FormControl = new FormControl('');
  selectedSpice: string = "Choose a Spice";
  spiceSelected: boolean = false;
  spiceList: SpiceContainer[] = []; // Initialize as an empty array

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    console.log('SpiceSelectComponent initialized');
    this.fetchSpiceList(); // Fetch the spice list on initialization
  }

  fetchSpiceList() {
    this.http.get<SpiceContainer[]>('http://localhost:4000/api/getSpiceContainers').subscribe(
      (response) => {
        this.spiceList = response; // Populate the spice list with the response
        console.log('Spice list fetched:', this.spiceList);
      },
      (error) => {
        console.error('Error fetching spice list:', error);
      }
    );

    //TODO: set isLow boolean for each spice container
  }

  isSpiceSelected() {
    this.spiceSelected = true;
  }

  goToDispense() {
    this.router.navigate(['/dispense']); // Navigate to the spice dispenser page
  }

  goBack() {
    this.router.navigate(['/']);
  }
}