import { Component } from '@angular/core';

import { FirebasesigninsignupService } from '../firebasesigninsignup.service';
import { UserAuthenticationService } from '../user-authentication.service';
import { __assign } from 'tslib';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  constructor(private firebasesigninsignup: FirebasesigninsignupService, private userauth: UserAuthenticationService){}  

  onSubmit(email: string, password: string) {
    this.firebasesigninsignup.signinUser(email, password).then(() => {
      if(this.userauth.isLoggedIn()) {
        location.assign("authenticated/home")
      }
      else {
        console.log("Incorrect email or pass")
      }
    });
  }

}
