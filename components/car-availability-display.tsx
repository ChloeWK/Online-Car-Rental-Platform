"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"

interface CarAvailabilityDisplayProps {
  carVin: string
}

export default function CarAvailabilityDisplay({ carVin }: CarAvailabilityDisplayProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [nextAvailableDate, setNextAvailableDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAvailability = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data
        const mockIsAvailable = Math.random() < 0.8 // 80% chance of being available
        setIsAvailable(mockIsAvailable)

        if (!mockIsAvailable) {
          // Mock next available date (7 days from now)
          setNextAvailableDate(addDays(new Date(), 7))
        }
      } catch (error) {
        console.error("Error checking availability:", error)
        setIsAvailable(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAvailability()
  }, [carVin])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Availability
          {isLoading ? (
            <Badge variant="outline" className="ml-2">
              Checking...
            </Badge>
          ) : isAvailable === null ? (
            <Badge variant="outline" className="ml-2">
              Unknown
            </Badge>
          ) : isAvailable ? (
            <Badge variant="default" className="ml-2">
              Available
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">
              Unavailable
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Check the availability calendar</CardDescription>
      </CardHeader>
      <CardContent>
        {isAvailable === false && nextAvailableDate && (
          <div className="mb-4">
            <p className="text-sm font-medium">Next Available Date:</p>
            <p className="text-lg font-bold">{format(nextAvailableDate, "MMMM d, yyyy")}</p>
          </div>
        )}
        <Calendar mode="single" disabled={(date) => date < new Date()} className="rounded-md border" />
      </CardContent>
    </Card>
  )
}
