import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignUpModel } from '../shared/signUpModel';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  constructor(private http: HttpClient){}

  onSubmit(name: string, email: string, password: string){
    const newUser: SignUpModel = {name: name, email: email, password: password}
    console.log(newUser)

    this.http.post("http://localhost:3000/signup",newUser).subscribe(res => {
      console.log(res)
    })
  }
}
