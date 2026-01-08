"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Loader2, Calendar, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLocationById } from "@/lib/locations"
import type { CompletedReservationRecord } from "@/lib/reservations"

export default function MyReservationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [reservations, setReservations] = useState<CompletedReservationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to login if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    const fetchReservations = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/reservations`)
        if (!response.ok) {
          throw new Error("Failed to fetch reservations")
        }
        const data = await response.json()
        setReservations(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching reservations:", error)
        setError("Failed to load your reservations. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [user, router])

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Loading your reservations...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Reservations</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {Array.isArray(reservations) && reservations.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">You don't have any reservations yet</h2>
          <p className="text-muted-foreground mb-6">Browse our cars and make your first reservation!</p>
          <Button onClick={() => router.push("/cars")}>Browse Cars</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(reservations) && reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReservationCard({ reservation }: { reservation: CompletedReservationRecord }) {
  const [carDetails, setCarDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`/api/cars/${reservation.carVin}`)
        if (response.ok) {
          const data = await response.json()
          setCarDetails(data)
        }
      } catch (error) {
        console.error("Error fetching car details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCarDetails()
  }, [reservation.carVin])

  const pickupLocation = getLocationById(reservation.pickupLocationId)
  const returnLocation = getLocationById(reservation.returnLocationId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {isLoading ? (
              <span className="animate-pulse bg-gray-200 h-6 w-32 inline-block rounded"></span>
            ) : carDetails ? (
              `${carDetails.brand} ${carDetails.carModel}`
            ) : (
              "Car Details"
            )}
          </span>
          <span className={`text-sm px-2 py-1 rounded ${getStatusColor(reservation.status || 'unknown')}`}>
            {reservation.status ? formatStatus(reservation.status) : 'Unknown'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Rental Period</p>
            <p className="text-sm">
              {format(new Date(reservation.startDate), "MMM dd, yyyy")} -{" "}
              {format(new Date(reservation.endDate), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Pickup Location</p>
            <p className="text-sm">{pickupLocation?.name || "Unknown location"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Return Location</p>
            <p className="text-sm">{returnLocation?.name || "Unknown location"}</p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-medium">Total Price:</span>
          <span className="font-bold">${reservation.totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(`/cars/${reservation.carVin}`, "_blank")}
        >
          View Car Details
        </Button>
      </CardFooter>
    </Card>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
