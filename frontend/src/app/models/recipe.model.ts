export interface SpiceMeasurement {
    spice: string;
    measurement: string;
  }
  
  export interface Recipe {
    id?: number;
    name: string;
    ingredients: SpiceMeasurement[];
  }