export interface Order {
  id: string
  car: {
    vin: string
    brand?: string
    carModel?: string
    carType?: string
    image?: string
    pricePerDay?: number
    yearOfManufacture?: number
    mileage?: string
    fuelType?: string
    description?: string
    inventory?: number
    currentLocationId?: string
    color?: string
    transmission?: string
    seats?: number
    features?: string[]
  }
  userId: string
  startDate: Date | string
  endDate: Date | string
  pickupLocationId: string
  returnLocationId: string
  totalPrice: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
  paymentStatus?: "pending" | "completed" | "failed" | "paid" | undefined
  paymentDetails?: {
    method?: string
    lastFour?: string
    processedAt?: string
    paymentMethod?: string
    cardholderName?: string
    cardNumber?: string
    expiryDate?: string
    cvv?: string
  }
}
