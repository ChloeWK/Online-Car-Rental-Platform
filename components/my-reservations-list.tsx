"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format, addDays } from "date-fns"
import { Car, Calendar, MapPin, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getLocationById } from "@/lib/locations"
import type { Order } from "@/types/order"

interface MyReservationsListProps {
  userId: string
}

export default function MyReservationsList({ userId }: MyReservationsListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      // In a real application, you would fetch orders from an API
      const response = await fetch(`/api/users/${userId}/orders`)

      if (!response.ok) {
        throw new Error("Failed to fetch reservations")
      }

      const data = await response.json()
      setOrders(data)
      setError(null)
    } catch (err) {
      setError("Failed to load reservations")
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (!userId) return
    fetchOrders()

    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      fetchOrders()
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(intervalId)
  }, [userId])

  // Manual refresh function
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchOrders()
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Loading your reservations...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Error</h2>
        <p className="mb-6">{error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No reservations found</h2>
        <p className="text-muted-foreground mt-2">You haven't made any reservations yet.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Browse Cars
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Reservations</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {orders.map((order) => (
        <ReservationCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function ReservationCard({ order }: { order: Order }) {
  const router = useRouter()
  const startDate = new Date(order.rental.startDate)
  const endDate = addDays(startDate, order.rental.rentalPeriod)

  const pickupLocation = order.rental.pickupLocationId ? getLocationById(order.rental.pickupLocationId) : null
  const returnLocation = order.rental.returnLocationId ? getLocationById(order.rental.returnLocationId) : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {order.car.brand} {order.car.model}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="relative h-40 rounded-md overflow-hidden">
              <Image
                src={order.car.image || "/placeholder.svg"}
                alt={`${order.car.brand} ${order.car.model}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Rental Period</h3>
                  <p>
                    {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.rental.rentalPeriod} days</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Vehicle</h3>
                  <p>
                    {order.car.brand} {order.car.model}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.car.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Pickup Location</h3>
                  {pickupLocation ? (
                    <>
                      <p>{pickupLocation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pickupLocation.city}, {pickupLocation.state}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Return Location</h3>
                  {returnLocation ? (
                    <>
                      <p>{returnLocation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {returnLocation.city}, {returnLocation.state}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Total Price:</span>
                <span className="ml-2 font-bold">${order.rental.totalPrice}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Booked on {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {order.status === "pending" && (
          <Button variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Cancel Reservation
          </Button>
        )}
        <Button onClick={() => router.push(`/confirmation/${order.id}`)}>View Details</Button>
      </CardFooter>
    </Card>
  )
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "confirmed":
      return "default"
    case "pending":
      return "secondary"
    case "completed":
      return "outline"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}
