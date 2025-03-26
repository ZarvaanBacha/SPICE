import { Component } from '@angular/core';
import { FirebasesigninsignupService } from '../firebasesigninsignup.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [NgIf],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  toastVisible: boolean = false;
  toastText: string = "An error occured.";
  
  emailErrorFlag: boolean = false;
  passwordErrorFlag: boolean = false;

  constructor(private firebasesigninsignup: FirebasesigninsignupService){}  

  onSubmit(email: string, password: string) {
    this.firebasesigninsignup.signinUser(email, password)
      .then((message: string) => {
        // Set errorFlag based on the message content
        if (message.toLowerCase().includes('incorrect password')) {
          this.passwordErrorFlag = true;
          this.emailErrorFlag = false;
        } else if (message.toLowerCase().includes('email address you entered is not associated to an account')) {
          this.passwordErrorFlag = false;
          this.emailErrorFlag = true;
        }

        // Call showToast with the returned message
        this.showToast(message);
      })
      .catch((error: any) => {
        // Handle any unexpected errors
        console.error('Error during sign-in:', error);
        this.showToast('An unexpected error occurred. Please try again.');
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
