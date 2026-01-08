"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CheckCircle, Calendar, Car, CreditCard, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { locations } from "@/lib/locations"

export default function ConfirmationPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const router = useRouter()
  const [reservation, setReservation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        const response = await fetch(`/api/reservations/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch reservation details")
        }

        const data = await response.json()
        console.log("Fetched reservation details:", data)
        setReservation(data)
      } catch (err) {
        console.error("Error fetching reservation details:", err)
        setError("Could not load reservation details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservationDetails()
  }, [orderId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading reservation details...</h1>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error || "Could not load reservation details"}</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    )
  }

  const startDate = new Date(reservation.startDate)
  const endDate = new Date(reservation.endDate)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="text-muted-foreground mt-2">
            Your booking has been confirmed and a confirmation email has been sent to your email address.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Reservation #{orderId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Car Details</h3>
                    <p>
                      {reservation.car?.brand} {reservation.car?.carModel}
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.car?.carType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Rental Period</h3>
                    <p>
                      {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Pickup & Return</h3>
                    <p>
                      Pickup:{" "}
                      {locations.find((loc) => loc.id === reservation.pickupLocationId)?.name ||
                        "Unknown location"}
                    </p>
                    <p>
                      Return:{" "}
                      {locations.find((loc) => loc.id === reservation.returnLocationId)?.name ||
                        "Unknown location"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Payment Details</h3>
                    <p>
                      {reservation.paymentDetails?.method === "credit"
                        ? "Credit Card"
                        : reservation.paymentDetails?.method === "debit"
                          ? "Debit Card"
                          : "PayPal"}
                    </p>
                    <p className="text-sm text-muted-foreground">Ending in {reservation.paymentDetails?.lastFour}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span>${reservation.car?.pricePerDay}/day</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Period:</span>
                <span>{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${reservation.totalPrice}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
