export interface RentalPeriod {
  id: string
  carVin: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  userId: string
  orderId: string
  status: "active" | "completed" | "cancelled"
}
