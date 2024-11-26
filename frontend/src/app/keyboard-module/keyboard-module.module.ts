//Using angular-touch-keyboard from github.com/mohsen77sk/angular-touch-keyboard/tree/master

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxTouchKeyboardModule } from 'ngx-touch-keyboard';
import { RecipeComponent } from '../recipe/recipe.component';


@NgModule({
  declarations: [
    RecipeComponent
  ],
  imports: [
    CommonModule,
    NgxTouchKeyboardModule
  ],
  bootstrap: [RecipeComponent],
})
export class KeyboardModuleModule { }
