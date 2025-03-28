import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration,ChartOptions } from 'chart.js';
import { FirebaseRecipeService } from '../firebase-recipe.service';
import { OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

import { ChartData, ChartType } from 'chart.js';



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
  gotData: boolean = false;

  dataAnalytics:any = {}; //Entry point for analytics
  recipeAnalytics:any = {};//Entry point for recipe portion of analytics
  spiceContainerAnalytics:any = {};//Entry point for spice containers portion of analytics
  
  recipeLabels:string[] = [];
  recipeData:number[] = [];

  spiceLabels:string[] = [];
  spiceData:number[] = [];

  
  //Sorting arrays
  spiceTotalQuantity:number[][] = [[]];
  recipeUsage:any[][] = [[]];
  spiceSortedArray:any[][] = [[]];
  recipeSortedArray:any[][] = [[]];
  //Total Spice used arrays
  fillPercentageArray:number[] = [];
  fillLabelArray:string[] = [];
  fillSpiceQuantityArray:number[] = [];
  //charts
  //recipe chart
  public recipeChartData: ChartConfiguration<'radar'>['data'];
  public recipeChartOptions: ChartOptions<'radar'>;
  public recipeChartLegend;
  //spice Chart
  public radarChartOptions: ChartConfiguration['options'];
  public radarChartLabels: string[];
  public radarChartData: ChartData<'radar'>;
  public radarChartType: ChartType;

  //Angular functions
  constructor(private firebaseReicpeService: FirebaseRecipeService, @Inject(PLATFORM_ID) private platformId: unknown){}
  
  async ngOnInit()  {
    this.isBrowser = isPlatformBrowser(this.platformId);//SSR fix  
    try {
      //Fetching
      this.dataAnalytics = await this.firebaseReicpeService.getAnalytics();
      this.gotData = true;
      this.recipeAnalytics = this.dataAnalytics.recipeAnalytics.sort();//Entry point for recipe portion of analytics
      this.spiceContainerAnalytics = this.dataAnalytics.spiceContainerAnalytics.sort();//Entry point for spice containers portion of analytics
      //Chart Arrays
      this.recipeLabels= this.recipeAnalytics.map(item => item.recipeName);
      this.recipeData = this.recipeAnalytics.map(item => item.timesUsed);
  
      this.spiceLabels = this.spiceContainerAnalytics.map(item => item.spiceName);
      this.spiceData = this.spiceContainerAnalytics.map(item => item.timesUsed);
  
      
      //sorting Arrays
      this.spiceTotalQuantity = [this.spiceContainerAnalytics.map(item => item.totalQuantityUsed), this.spiceContainerAnalytics.map(item => item.spiceName), this.spiceContainerAnalytics.map(item => item.totalQuantityUsed)];
      this.recipeUsage = [this.recipeAnalytics.map(item => item.timesUsed), this.recipeAnalytics.map(item => item.recipeName), this.recipeAnalytics.map(item => item.usageHistory), this.recipeAnalytics.map(item => item.spices)];
      
      //sorting Algorithms
      this.spiceSortedArray = this.spiceTotalQuantity.map(//Sorts all the arrays stored in spiceSortedArray by spiceTotalQuantity
        (indices => a => indices.map(i => a[i]))
        ([...this.spiceTotalQuantity[0].keys()].sort((a, b) => this.spiceTotalQuantity[0][a] - this.spiceTotalQuantity[0][b]))
      );
      
      this.recipeSortedArray = this.recipeUsage.map(//Sorts all the arrays stored in recipeSortedArray by timesUsed
        (indices => a => indices.map(i => a[i]))
        ([...this.recipeUsage[0].keys()].sort((a, b) => this.recipeUsage[0][a] - this.recipeUsage[0][b]))
      );
  
      this.fillSpiceQuantityArray = this.spiceSortedArray[2];
      this.fillPercentageArray = this.setFillPercentageArr(this.spiceSortedArray[0]);
      this.fillLabelArray  = this.spiceSortedArray[1];
      //recipe chart
      this.recipeChartData = {
      
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
      this.recipeChartOptions = {
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
      this.recipeChartLegend = false;
      //spice Chart
      this.radarChartOptions = {
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
      this.radarChartLabels = this.spiceLabels;
  
      this.radarChartData = {
        labels: this.radarChartLabels,
        datasets: [
          { data: this.spiceData }
        ]
      };
      this.radarChartType = 'radar';
      console.log(this.recipeSortedArray[1].at(-2));

    } catch (error) {
      console.error('Error fetching analytics', error);
    }
  }
  //setup methods
  setFillPercentage(num:number, largest:number){//Function to determine fillPercentage
    if(num/largest == 1){
      return 1;
    } else if(Math.round(((num/largest)*100))/100 < 1 && Math.round(((num/largest)*100))/100  >= 0.9) {
      return 0.6;
    } else if(Math.round(((num/largest)*100))/100  <= 0.89 && Math.round(((num/largest)*100))/100  >= 0.70) {
      return 0.55;
    } else if(Math.round(((num/largest)*100))/100 <= 0.69 && Math.round(((num/largest)*100))/100  >= 0.60) {
      return 0.45;
    } else if(Math.round(((num/largest)*100))/100  <= 0.59 && Math.round(((num/largest)*100))/100  >= 0.50) {
      return 0.36;
    } else if(Math.round(((num/largest)*100))/100  <= 0.49 && Math.round(((num/largest)*100))/100  >= 0.40){
      return 0.32;
    } else if(Math.round(((num/largest)*100))/100  <= 0.39 && Math.round(((num/largest)*100))/100  >= 0.30){
      return 0.30;
    } else{
      return Math.round(((num/largest)*100))/100 ;
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
  
  /**
   * Fetches analytics data from Firebase and output to the console.
   */
  async fetchAndLogAnalytics(): Promise<void> {
    try {
      const analyticsData = await this.firebaseReicpeService.getAnalytics();
      console.log('Analytics Data:', analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }

}
