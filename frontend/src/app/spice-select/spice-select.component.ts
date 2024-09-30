import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spice } from '../spice';
import { SpiceButtonComponent } from '../spice-button/spice-button.component';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spice-select',
  standalone: true,
  imports: [SpiceButtonComponent, CommonModule, FormsModule],
  templateUrl: './spice-select.component.html',
  styleUrl: './spice-select.component.css'
})
export class SpiceSelectComponent {

      

  // url = 'http://localhost:3000/spice';  
  selectSpice : FormControl = new FormControl('');
  selectedSpice: string = "Choose Spice";
  spiceList: Spice[] = [
        {      
          id: 0,      
          name: 'Salt',      
          quantity: 10 
        }
        ,{      
          id: 1,      
          name: 'pepper',      
          quantity: 10 
        }
        ,{      
          id: 2,      
          name: 'papryika',      
          quantity: 10 
        }
        ,{      
          id: 3,      
          name: 'thyme',      
          quantity: 10 
        },
        ];

        constructor(private router: Router) {}

        goToDispense() {
          this.router.navigate(['/dispense']); // Navigate to the spice dispenser page
        } 
        ngOnInit() {
          console.log('SpiceSelectComponent initialized'); // Log to confirm initialization
        }
    



  // async getSpiceList(): Promise<Spice[]> {
  //   const data = await fetch(this.url);
  //   return (await data.json()) ?? [];
  // }

  // constructor() {
  //   this.spiceList.getSpiceList().then((spiceList: Spice[]) => {
  //     this.spiceList = spiceList;
  //   });
  // }
}
