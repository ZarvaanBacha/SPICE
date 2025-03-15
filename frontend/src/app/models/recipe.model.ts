export interface SpiceMeasurement {
    spiceName: string;
    spiceMeasurement: string;
    spiceQuantityInEighthTsp: number;
}
  
export interface Recipe {
  id?: number;
  recipeName: string;
  spices: SpiceMeasurement[];
}

export interface SpicesToRefill {
  spices: SpiceContainer[];
}

export interface SpiceContainer {
  containerNumber: number
  spiceName: string
  spiceQuantity: number
  isLow: boolean
}