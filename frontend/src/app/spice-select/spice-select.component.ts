import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiceContainer } from '../models/recipe.model';
import { SpiceButtonComponent } from '../spice-button/spice-button.component';
import { FormControl, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-spice-select',
  standalone: true,
  imports: [SpiceButtonComponent, CommonModule, FormsModule, NgIf],
  templateUrl: './spice-select.component.html',
  styleUrl: './spice-select.component.css'
})
export class SpiceSelectComponent implements OnInit {
  selectSpice: FormControl = new FormControl('');
  toastVisible: boolean = false;
  selectedSpice: SpiceContainer = { containerNumber: 0, spiceName: 'Choose a Spice', spiceQuantity: 0, isLow: false };

  spiceSelected: boolean = false;
  spiceList: SpiceContainer[] = []; // Initialize as an empty array

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    console.log('SpiceSelectComponent initialized');
    this.fetchSpiceList(); // Fetch the spice list on initialization

    this.route.queryParams.subscribe(params => {
      if (params['toast'] === 'dispense-success') {
        this.showToast();
      }
    });
  }

  fetchSpiceList() {
    this.http.get<SpiceContainer[]>('http://localhost:4000/getSpiceContainers').subscribe(
      (response) => {
        this.spiceList = response; // Populate the spice list with the response
        console.log('Spice list fetched:', this.spiceList);
      },
      (error) => {
        console.error('Error fetching spice list:', error);
      }
    );
  }

  isSpiceSelected(spice: SpiceContainer) {
    this.spiceSelected = true;
    this.selectedSpice = spice;
  }

  goToDispense() {
    this.router.navigate(['/dispense'], {
      queryParams: { selectedSpice: JSON.stringify(this.selectedSpice) },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  showToast() {
    
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}