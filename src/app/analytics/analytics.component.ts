import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration,ChartOptions } from 'chart.js';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { OnInit } from '@angular/core';

import { ChartData, ChartType } from 'chart.js';

import * as dataAnalytics from '../../../public/analytics.json';//Right now is an import convert to Firebase service request

import { Inject, PLATFORM_ID } from "@angular/core";//Used to resolve SSR issues with <canvas>
import { isPlatformBrowser } from "@angular/common";//Used to resolve SSR issues with <canvas>
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [ BaseChartDirective],
  providers: [FirebaseRecipeService],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit{
  
  isBrowser: boolean;//ssr fix
  
  recipeAnalytics:any = dataAnalytics.recipeAnalytics.sort(this.compareTimesUsed);//Entry point for recipe portion of analytics
  spiceContainerAnalytics:any = dataAnalytics.spiceContainerAnalytics.sort(this.compareTimesUsed);//Entry point for spice containers portion of analytics
  
  recipeLabels:string[] = this.recipeAnalytics.map(item => item.recipeName);
  recipeData:number[] = this.recipeAnalytics.map(item => item.timesUsed);

  spiceLabels:string[] = this.spiceContainerAnalytics.map(item => item.spiceName);
  spiceData:number[] = this.spiceContainerAnalytics.map(item => item.timesUsed);

  spiceQuantity:number[] = this.spiceContainerAnalytics.map(item => item.totalQuantityUsed);
  spiceTotalQuantity:number[][] = [this.spiceContainerAnalytics.map(item => item.totalQuantityUsed), this.spiceContainerAnalytics.map(item => item.spiceName)];
  
  sorted:any[][] = this.spiceTotalQuantity.map(
    (indices => a => indices.map(i => a[i]))
    ([...this.spiceTotalQuantity[0].keys()].sort((a, b) => this.spiceTotalQuantity[0][a] - this.spiceTotalQuantity[0][b]))
);

  fillPercentageArray:number[] = this.setFillPercentageArr(this.sorted[0]);
  fillLabelArray:string[] = this.sorted[1];
  //charts
  //recipe chart
  public recipeChartData: ChartConfiguration<'radar'>['data'] = {
    
    labels: this.recipeLabels,
    datasets: [{
      data: this.recipeData,
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)',
      spanGaps: true
    }
  ]

  };
  public recipeChartOptions: ChartOptions<'radar'> = {
    elements:{
      line:{
         borderWidth:5
        }
    },
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r:{
        angleLines:{
          color: 'black'
        },
        grid: {
          color: 'gray'
        },
        ticks:{
          font: {
            size: 12
          }
        }
      }
    },
    plugins:{
      title:{
        display:false,
        align: 'center',
        position: 'top',
        text : "Most Used Spices",
        font:{
          size: 36,
          family: "Arial', sans-serif"
        }
      },
      legend:{
        display:false
      }
    }

  };
  public recipeChartLegend = false;

   //spice Chart
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    scales:{
      r:{
        angleLines:{
          color: 'black'
        },
        grid: {
          color: 'gray'
        },
        ticks:{
          font: {
            size: 12
          }
        }
      }
    },
    plugins:{
      title:{
        display:false,
        align: 'center',
        position: 'top',
        text : "Most Used Recipes",
        font:{
          size: 36,
          family: "Arial', sans-serif"
        }
      },
      legend:{
        display:false
      }
    }
  };
  public radarChartLabels: string[] = this.spiceLabels;

  public radarChartData: ChartData<'radar'> = {
    labels: this.radarChartLabels,
    datasets: [
      { data: this.spiceData }
    ]
  };
  public radarChartType: ChartType = 'radar';

  //Angular functions
  constructor(private firebaseReicpeService: FirebaseRecipeService, @Inject(PLATFORM_ID) private platformId: unknown){}
  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);  
    //test code
    //console.log(this.recipeAnalytics);
    // console.log(this.spiceContainerAnalytics);
    // console.log(this.recipeLabels);
    // console.log(this.recipeData);
    // console.log(this.spiceLabels);
    // console.log(this.spiceData);
    //console.log(this.spiceTotalQuantity[0][0]);
    // console.log(this.sorted);
    // console.log(this.fillPercentageArray);
    // console.log(this.fillPercentageArray[this.fillPercentageArray.length - 1]);
    // console.log(this.sorted);
  }
  //setup methods
  setFillPercentage(num:number, largest:number){//Function to determine fillPercentage
    if(num/largest == 1){
      return 1;
    } else if(num/largest < 1 && num/largest >= 0.9) {
      return 0.6;
    } else if(num/largest <= 0.89 && num/largest >= 0.70) {
      return 0.55;
    } else if(num/largest <= 0.69 && num/largest >= 0.60) {
      return 0.45;
    } else if(num/largest <= 0.59 && num/largest >= 0.50) {
      return 0.36;
    } else if(num/largest <= 0.49 && num/largest >= 0.40){
      return 0.32;
    } else if(num/largest <= 0.39 && num/largest >= 0.30){
      return 0.30;
    } else{
      return num/largest;
    }
  }
   setFillPercentageArr(fillArr:number[]):number[]{//Wrapper function that converts an array of spiceQuantities into an array of fill quantities
    
    fillArr.forEach((val,ind,arr)=>{
      arr[ind] = this.setFillPercentage(val,arr[arr.length - 1]);
    });
    return fillArr;
  }
  compareTimesUsed(comparator:any,comparison:any){ //function used for sorting
    if(comparator.timesUsed > comparison.timesUsed){
      return 1;
    } else if(comparator.timesUsed < comparison.timesUsed){
      return -1;
    }else {
      return 0; 
    }
  }
  
}
