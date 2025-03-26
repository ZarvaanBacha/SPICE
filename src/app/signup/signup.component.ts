import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { FirebasesigninsignupService } from '../firebasesigninsignup.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  toastVisible: boolean = false;
  toastText: string = "An error occured.";
  
  emailErrorFlag: boolean = false;
  
  constructor(private http: HttpClient, private firebasesigninsignup: FirebasesigninsignupService, private router: Router){}

  onSubmit(name: string, email: string, password: string) {
    // basic checks
    if (!name || !email || !password || email == "" || password == "" || name == "") {
      this.showToast("Invalid input. Please try again.");
      return;
    }

    this.firebasesigninsignup.isEmailAlreadyUsed(email).then((isUsed) => {
      if (isUsed) {
        this.emailErrorFlag = true;
        this.showToast("The email address you entered is already associated to an account.");
      } else {
        this.firebasesigninsignup.signupUser(name, email, password).then(() => {
          this.showToast("Account successfully created");
          this.router.navigate(['/signin']); // Redirect to the sign-in page
        }).catch((error) => {
          console.error('Error during signup:', error);
          this.showToast('An error occurred during signup. Please try again.');
        });
      }
    }).catch((error) => {
      console.error('Error checking email:', error);
      this.showToast('An error occurred while checking the email. Please try again.');
    });
  }

  showToast(toastText: string) {
      
    this.toastText = toastText;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}
