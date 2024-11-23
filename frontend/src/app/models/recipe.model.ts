export interface SpiceMeasurement {
    spiceName: string;
    spiceMeasurement: string;
  }
  
  export interface Recipe {
    id?: number;
    recipeName: string;
    spices: SpiceMeasurement[];
  }