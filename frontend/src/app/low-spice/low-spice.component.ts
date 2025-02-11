import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"

interface SpiceContainer {
  containerNumber: number
  spice: string
  percentageLeft: number
}

@Component({
  selector: 'app-low-spice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './low-spice.component.html',
  styleUrl: './low-spice.component.css'
})
export class LowSpiceComponent implements OnInit{

  lowSpiceContainers: SpiceContainer[] = []

  constructor(private router: Router) {}

  ngOnInit() {
    this.lowSpiceContainers = this.getLowSpiceContainers()
    console.log("Low spice containers:", this.lowSpiceContainers) // Debugging log
  }

  getLowSpiceContainers(): SpiceContainer[] {
    const allContainers: SpiceContainer[] = [
      { containerNumber: 1, spice: "Cinnamon", percentageLeft: 50 },
      { containerNumber: 2, spice: "Cumin", percentageLeft: 10 },
      { containerNumber: 3, spice: "Paprika", percentageLeft: 60 },
      { containerNumber: 4, spice: "Turmeric", percentageLeft: 5 },
      { containerNumber: 5, spice: "Oregano", percentageLeft: 25 },
      { containerNumber: 6, spice: "Basil", percentageLeft: 15 },
      { containerNumber: 7, spice: "Thyme", percentageLeft: 80 },
      { containerNumber: 8, spice: "Rosemary", percentageLeft: 8 },
    ]

    // Filter containers with less than 20% remaining
    return allContainers.filter((container) => container.percentageLeft < 10)
  }

  goBack() {
    this.router.navigate(["recipes"])
  }

}
