import { Component } from '@angular/core';
import { AuthInterceptor } from '../shared/authInterceptor';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet } from '@angular/router';
import { SigninComponent } from '../signin/signin.component';

@Component({
  selector: 'app-authenticated',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './authenticated.component.html',
  styleUrl: './authenticated.component.css'
})
export class AuthenticatedComponent {
  // private authenticatedEmail;
  // private authenticatedId;
  // private signedInUser: SigninComponent

  // constructor(){
  //   this.authenticatedId = this.signedInUser.getAuthenticatedId()
  //   this.authenticatedEmail = this.signedInUser.getAuthenticatedEmail()
  // }

  // setAuthenticatedEmail(email: string) {
  //   this.authenticatedEmail = email
  // }

  // setAuthenticatedId(id: Object) {
  //   this.authenticatedId = id
  // }

  // getAuthenticatedEmail() {
  //   return this.authenticatedEmail
  // }

  // getAuthenticatedId() {
  //   return this.authenticatedId
  // }



  
}
