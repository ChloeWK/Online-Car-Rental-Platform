import { v4 as uuidv4 } from "uuid"

// Define the type for a rental period
interface RentalPeriod {
  id: string;
  carVin: string;
  startDate: string;
  endDate: string;
  userId: string;
  orderId: string;
  status: "active" | "cancelled" | "completed";
}

// Mock data (replace with actual database calls)
const rentalPeriods: RentalPeriod[] = []

export async function getCarRentalPeriods(carVin: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return rentalPeriods.filter((period) => period.carVin === carVin)
}

export async function createRentalPeriod(
  carVin: string,
  startDate: Date,
  endDate: Date,
  userId: string,
  orderId: string,
) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newRentalPeriod: RentalPeriod = {
    id: uuidv4(),
    carVin,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    userId,
    orderId,
    status: "active",
  }

  rentalPeriods.push(newRentalPeriod)
  return newRentalPeriod
}

export async function cancelRentalPeriod(rentalId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  const rentalPeriod = rentalPeriods.find((period) => period.id === rentalId)

  if (!rentalPeriod) {
    return false
  }

  rentalPeriod.status = "cancelled"
  return true
}

export async function completeRentalPeriod(rentalId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  const rentalPeriod = rentalPeriods.find((period) => period.id === rentalId)

  if (!rentalPeriod) {
    return false
  }

  rentalPeriod.status = "completed"
  return true
}
