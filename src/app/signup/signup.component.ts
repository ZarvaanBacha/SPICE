import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { FirebasesigninsignupService } from '../firebasesigninsignup.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  constructor(private http: HttpClient, private firebasesigninsignup: FirebasesigninsignupService){}

  onSubmit(name: string, email: string, password: string){

    this.firebasesigninsignup.signupUser(name, email, password)
  }
}
