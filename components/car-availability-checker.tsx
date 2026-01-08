"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isCarAvailableForDates } from "@/lib/reservations"
import { Loader2 } from "lucide-react"

interface CarAvailabilityCheckerProps {
  carVin: string
  onAvailabilityConfirmed?: (startDate: Date, endDate: Date) => void
}

export function CarAvailabilityChecker({ carVin, onAvailabilityConfirmed }: CarAvailabilityCheckerProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    if (endDate < startDate) {
      setError("End date must be after start date")
      return
    }

    try {
      setIsChecking(true)
      setError(null)

      const available = await isCarAvailableForDates(carVin, startDate, endDate)
      setIsAvailable(available)

      if (available && onAvailabilityConfirmed) {
        onAvailabilityConfirmed(startDate, endDate)
      }
    } catch (err) {
      console.error("Error checking availability:", err)
      setError("Failed to check availability. Please try again.")
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Check Availability</CardTitle>
        <CardDescription>Select your rental dates to check if this car is available</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Pickup Date</h3>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Return Date</h3>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) => date < (startDate ? startDate : new Date())}
              className="rounded-md border"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {isAvailable !== null && !isChecking && (
          <div className={`p-3 rounded-md ${isAvailable ? "bg-green-100" : "bg-red-100"}`}>
            <p className={`text-sm font-medium ${isAvailable ? "text-green-800" : "text-red-800"}`}>
              {isAvailable
                ? "Great news! This car is available for your selected dates."
                : "Sorry, this car is not available for the selected dates. Please try different dates."}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCheckAvailability} disabled={isChecking || !startDate || !endDate} className="w-full">
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Availability...
            </>
          ) : (
            "Check Availability"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
