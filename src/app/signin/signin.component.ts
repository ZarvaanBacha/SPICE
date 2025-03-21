import { Component } from '@angular/core';
import { FirebasesigninsignupService } from '../firebasesigninsignup.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  constructor(private firebasesigninsignup: FirebasesigninsignupService){}  

  onSubmit(email: string, password: string) {
    
    this.firebasesigninsignup.signinUser(email, password)
    
  }
  
}
