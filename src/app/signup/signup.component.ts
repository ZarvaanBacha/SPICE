import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignUpModel } from '../shared/signUpModel';
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
    const newUser: SignUpModel = {name: name, email: email, password: password}

    this.firebasesigninsignup.signupUser(name, email, password)


  } //TODO: either make the user login on submit, or make a toast to tell user it was successful and to now login.
}
