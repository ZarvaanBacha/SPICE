import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { ViewMyRecipesComponent } from './view-my-recipes/view-my-recipes.component';
import { HttpClient } from '@angular/common/http';
import { RecipesComponent } from './recipes/recipes.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { AuthenticatedComponent } from './authenticated/authenticated.component';
import { AddDeviceComponent } from './add-device/add-device.component';
import { ViewDeviceComponent } from './view-device/view-device.component';

export const routes: Routes = [
    {path:"", component:WelcomepageComponent},
    {path:"signin", component: SigninComponent},
    {path:"signup", component: SignupComponent},
    {path:"authenticated", component: AuthenticatedComponent, 
        children: [
            {path:"home", component: HomeComponent},
            {path:"viewRecipes", component: ViewMyRecipesComponent},  
            {path:"recipes", component: RecipesComponent},
            {path:"deviceView",component: ViewDeviceComponent},
            {path:"addDevice", component: AddDeviceComponent}
        ]
    },
];