import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view-device',
  standalone: true,
  imports: [],
  templateUrl: './view-device.component.html',
  styleUrl: './view-device.component.css'
})
export class ViewDeviceComponent {
  product: String;

  constructor(private http: HttpClient){}

  getProductID(): Observable<any>{
    return this.http.get("http://localhost:3000/viewDevice")
  }
  
  
  ngOnInit() {
    this.getProductID().subscribe(res => {
      this.product = res.productID
    })
  }  


}
