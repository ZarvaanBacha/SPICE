import { HttpHandler, HttpInterceptor, HttpRequest, HttpClient } from "@angular/common/http";
import { SigninComponent } from "../signin/signin.component";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{
    
    constructor(private signIn: SigninComponent, private http: HttpClient){}

    intercept(req: HttpRequest<any>, next: HttpHandler){
        const token = this.signIn.getToken();
        
        if(!token){
            return next.handle(req);
        }

        const authRequest = req.clone({
            headers: req.headers.set("Authorization", token)
        })
        return next.handle(authRequest);
    }

}