export const cn = (...inputs: (string | undefined | null)[]) => {
  return inputs.filter(Boolean).join(" ")
}

export const checkCarAvailability = async (vin: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/cars/availability?vin=${vin}`)
    const data = await response.json()
    return !data.isCurrentlyRented
  } catch (error) {
    console.error("Error checking car availability:", error)
    return false
  }
}

export const isCarAvailable = async (car: any): Promise<boolean> => {
  // First check the car's available property
  if (!car.available) return false

  // Then double-check with the API
  try {
    const isAvailable = await checkCarAvailability(car.vin)
    return isAvailable
  } catch (error) {
    console.error("Error checking car availability:", error)
    return false
  }
}
