export interface Car {
  vin: string
  brand: string
  yearOfManufacture: number
  carType: string
  color: string
  fuelType: string
  transmission: string
  seats: number
  pricePerDay: number
  image: string
  features: string[]
  currentLocationId: string
  mileage: string
  description: string
  isAvailable?: boolean
  inventory?: number
  carModel: string
}
