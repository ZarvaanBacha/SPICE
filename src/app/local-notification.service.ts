import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/* 
*Service used to manage notifications locally, without mutating server data.
*/
export class LocalNotificationService {
  
  constructor() { }
  lowSpiceNotification = new BehaviorSubject(true);
  
  public setNotification(set:boolean){
    this.lowSpiceNotification.next(set);
  }

}
