import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceModel } from '../shared/deviceModel'

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [],
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.css'
})
export class AddDeviceComponent {

  constructor(private http: HttpClient){}

  onSubmit(productID: number){
    const addDevice: DeviceModel = {productID: productID}

    this.http.post("http://localhost:3000/addDevice",addDevice).subscribe(res => {
      console.log(res)
    })
  }

}
