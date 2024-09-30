import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpiceSelectComponent } from './spice-select/spice-select.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpiceSelectComponent,CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  currentView: string = 'home';  // Default to the home view

  navigate(view: string) {
    this.currentView = view;
  }
}
