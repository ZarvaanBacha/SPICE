import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { SpicesToRefill, SpiceContainer } from '../models/recipe.model';

@Component({
  selector: 'app-low-spice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './low-spice.component.html',
  styleUrl: './low-spice.component.css'
})
export class LowSpiceComponent implements OnInit{

  lowSpiceContainers: SpiceContainer[] = [];
  spicesToRefill: SpicesToRefill = { spices: []}; //passed from the dispensing page

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.getLowSpiceContainers(() => {
      this.route.queryParams.subscribe((params) => {
        if (params['spices']) {
          const parsedData = JSON.parse(params['spices']);
          this.spicesToRefill = { spices: parsedData.spices };
          //console.log('Spices to Refill:', this.spicesToRefill);
        }
      });
  
      const fromDispense = this.route.snapshot.data['fromDispense'] || this.route.snapshot.queryParams['fromDispense'];
  
      if (fromDispense) {
        // Call refillLowSpiceContainers only after lowSpiceContainers is populated
        this.refillLowSpiceContainers(this.spicesToRefill, fromDispense);
      }
    });
  }

  getLowSpiceContainers(callback?: () => void) {
    this.http.get<SpiceContainer[]>('http://localhost:4000/low-spices').subscribe(
      (response) => {
        this.lowSpiceContainers = response;
        console.log('Low spice containers fetched from backend:', this.lowSpiceContainers);
  
        // Execute the callback if provided
        if (callback) {
          callback();
        }
      },
      (error) => {
        console.error('Error fetching low spice containers:', error);
      }
    );

    // add threshold check? shouldnt be necessary if backend is handling it
  }

  goBack() {
    this.router.navigate(["/"])
  }

  refillLowSpiceContainers(spicesToRefill: SpicesToRefill, fromDispense: boolean = false) {
    console.log('spicesToRefill:', spicesToRefill.spices);
  
    this.http.post('http://localhost:4000/refill-spices', spicesToRefill).subscribe(
      async (response: any) => {
        console.log('Backend response:', response);
  
        // Process each container sequentially
        for (const container of response.spicesToRefill) {
          const userResponse = confirm(
            `You can now refill container ${container.containerNumber} for spice "${container.spiceName}".\nDo you want to mark it as done or cancel?`
          );
  
          if (userResponse) {
            // User chose "done"
            await this.http.post('http://localhost:4000/refill-spices', {
              spices: [container],
              userResponse: 'done',
            }).toPromise();
  
            console.log(`Container ${container.containerNumber} refilled successfully.`);
  
            // Remove the refilled container from the lowSpiceContainers list
            this.lowSpiceContainers = this.lowSpiceContainers.filter(
              (c) => c.containerNumber !== container.containerNumber
            );
          } else {
            // User chose "cancel"
            console.log(`Refilling of container ${container.containerNumber} was canceled.`);
          }
        }
  
        // Calculate remaining containers after all asynchronous operations are complete
        const remainingContainers = spicesToRefill.spices.filter((refillContainer) =>
          this.lowSpiceContainers.some(
            (lowContainer) => lowContainer.containerNumber === refillContainer.containerNumber
          )
        );
  
        console.log(`lowSpiceContainers:`, this.lowSpiceContainers);
        console.log(`Remaining containers to refill:`, remainingContainers);
  
        if (fromDispense && remainingContainers.length === 0) {
          this.router.navigate(['/recipes']); // TODO: use AutomatedRoute to go back to recipes page and start dispense routine for correct recipe?
        }
      },
      (error) => {
        console.error('Error during refill process:', error);
      }
    );
  }

  refillSingleLowSpiceContainer(container: SpiceContainer) {
    console.log('Refilling single low spice container:', container); 
    
    const spicesToRefill: SpicesToRefill = { spices: [container] }; // Initialize with the single container

    this.refillLowSpiceContainers(spicesToRefill);
  }

}
