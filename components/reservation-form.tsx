"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { Car } from "@/types/car"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, differenceInDays } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { getLocationById } from "@/lib/locations"

interface ReservationFormProps {
  car: Car
  onSubmit: (formData: any) => Promise<void>
  onCancel?: () => void
}

export default function ReservationForm({ car }: ReservationFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 3))
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [error, setError] = useState<string | null>(null)

  const pickupLocation = getLocationById(car.currentLocationId)

  // Calculate rental duration and total price
  const rentalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0
  const totalPrice = rentalDays * car.pricePerDay

  useEffect(() => {
    // Fetch unavailable dates for this car
    const fetchUnavailableDates = async () => {
      try {
        const response = await fetch(`/api/cars/${car.vin}/unavailable-dates`)

        if (!response.ok) {
          throw new Error(`Failed to fetch unavailable dates: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Add proper null checking
        if (data && Array.isArray(data.dates)) {
          setUnavailableDates(data.dates.map((dateStr: string) => new Date(dateStr)))
        } else {
          console.warn("Unexpected response format for unavailable dates:", data)
          setUnavailableDates([])
        }
      } catch (error) {
        console.error("Error fetching unavailable dates:", error)
        setUnavailableDates([])
      }
    }

    fetchUnavailableDates()
  }, [car.vin])

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!startDate || !endDate) return

      setIsCheckingAvailability(true)
      setError(null)

      try {
        // 使用 POST 请求而不是 GET 请求
        const response = await fetch("/api/cars/availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            carVin: car.vin,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setIsAvailable(data.available)

        if (!data.available && data.conflictingReservation) {
          setError(
            `Car is not available for the selected dates. Already booked from ${format(
              new Date(data.conflictingReservation.startDate),
              "MMM dd, yyyy",
            )} to ${format(new Date(data.conflictingReservation.endDate), "MMM dd, yyyy")}`,
          )
        } else if (!data.available) {
          setError("Car is not available for the selected dates")
        }
      } catch (error) {
        console.error("Error checking availability:", error)
        setIsAvailable(false)
        setError(error instanceof Error ? error.message : "An unknown error occurred during availability check.")
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    if (startDate && endDate) {
      checkAvailability()
    }
  }, [startDate, endDate, car.vin])

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login?redirect=/cars/" + car.vin)
      return
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    if (!isAvailable) {
      setError("Car is not available for the selected dates")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          car: car,
          userId: user.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          pickupLocationId: car.currentLocationId,
          returnLocationId: car.currentLocationId,
          totalPrice,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create reservation")
      }

      const result = await response.json()

      console.log("Order creation API response:", result);

      // Redirect to payment page
      router.push(`/payment/${result.orderId}`)
    } catch (error) {
      console.error("Error creating reservation:", error)
      setError("Failed to create reservation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date)
                      setEndDate(addDays(date, 1))
                    }
                  }}
                  initialFocus
                  disabled={(date) =>
                    date < new Date() ||
                    unavailableDates.some((unavailableDate) => unavailableDate.toDateString() === date.toDateString())
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Return Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) =>
                    date < (startDate || new Date()) ||
                    unavailableDates.some((unavailableDate) => unavailableDate.toDateString() === date.toDateString())
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pickup & Return Location</label>
            <div className="border rounded-md p-3">
              {pickupLocation ? (
                <p>
                  {pickupLocation.name} - {pickupLocation.address}, {pickupLocation.city}
                </p>
              ) : (
                <p>Unknown location</p>
              )}
            </div>
          </div>

          {isCheckingAvailability ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Checking availability...</p>
            </div>
          ) : (
            <>
              {isAvailable === true && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md">
                  Car is available for the selected dates!
                </div>
              )}
              {isAvailable === false && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md">
                  {error || "Car is not available for the selected dates. Please select different dates."}
                </div>
              )}
            </>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span>Daily Rate:</span>
              <span>${car.pricePerDay}/day</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Duration:</span>
              <span>{rentalDays} days</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${totalPrice}</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!isAvailable || isSubmitting || isCheckingAvailability}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>

          {!user && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              You'll need to log in before completing your reservation.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
