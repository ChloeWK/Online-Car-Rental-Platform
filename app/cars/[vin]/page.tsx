"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Car } from "@/types/car"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCarByVin } from "@/lib/data"
import { AlertCircle, Check, Info, Loader2 } from "lucide-react"
import CarAvailabilityDisplay from "@/components/car-availability-display"
import { useAuth } from "@/lib/auth-context"
import { Suspense } from "react"
import CarDetails from "@/components/car-details"
import ReservationForm from "@/components/reservation-form"
import { Skeleton } from "@/components/ui/skeleton"
import { handleReservationSubmit } from "@/app/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CarPageProps {
  params: {
    vin: string
  }
  searchParams: {
    startDate?: string
    endDate?: string
  }
}

export default function CarPage({ params, searchParams }: CarPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [car, setCar] = useState<Car | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRenting, setIsRenting] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [reservationError, setReservationError] = useState<string | null>(null)

  useEffect(() => {
    const loadCar = async () => {
      try {
        const carData = await fetchCarByVin(params.vin)
        setCar(carData)
      } catch (err) {
        setError("Failed to load car details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCar()
  }, [params.vin])

  const handleRentClick = async () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login page if not logged in
      router.push("/login")
      return
    }

    setIsRenting(true)

    try {
      // Simulate AJAX request to check availability and prepare reservation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store the selected car VIN in localStorage
      localStorage.setItem("selectedCarVin", params.vin)

      // Navigate to the reservation page
      router.push("/reservation")
    } catch (error) {
      console.error("Error preparing reservation:", error)
      alert("Failed to prepare reservation. Please try again.")
    } finally {
      setIsRenting(false)
    }
  }

  const onSubmitReservation = async (formData: any) => {
    if (!car) return
    setReservationError(null)

    try {
      // Call the server action with the form data and car
      const result = await handleReservationSubmit({
        ...formData,
        car,
        userId: user?.id || "guest",
      })

      if (result.success) {
        // Redirect to payment page
        router.push(`/payment/${result.orderId}`)
      } else {
        // Handle error
        setReservationError(result.error || "Failed to create reservation")
      }
    } catch (error) {
      console.error("Error submitting reservation:", error)
      setReservationError("Failed to submit reservation. Please try again.")
    }
  }

  // Check car availability for the current dates
  useEffect(() => {
    const checkAvailability = async () => {
      if (!car) return

      // Parse dates from search params or use current date
      const startDate = searchParams.startDate ? new Date(searchParams.startDate) : new Date()
      const endDate = searchParams.endDate ? new Date(searchParams.endDate) : new Date(startDate)

      // Add one day if start and end dates are the same
      if (startDate.getTime() === endDate.getTime()) {
        endDate.setDate(endDate.getDate() + 1)
      }

      try {
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

        const data = await response.json()
        setIsAvailable(data.available)
      } catch (error) {
        console.error("Error checking availability:", error)
      }
    }

    checkAvailability()
  }, [car, searchParams.startDate, searchParams.endDate])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Loading car details...</h1>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error || "Could not load car details"}</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    )
  }

  // Parse dates from search params or use current date
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : new Date()
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : new Date()

  // Add one day if start and end dates are the same
  if (startDate.getTime() === endDate.getTime()) {
    endDate.setDate(endDate.getDate() + 1)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <CarDetails car={car} />
          </Suspense>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Reserve This Car</h2>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ReservationForm car={car} onSubmit={onSubmitReservation} />
          </Suspense>
        </div>
      </div>

      <Tabs defaultValue="features" className="mt-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="policies">Rental Policies</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="p-4 border rounded-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Air Conditioning</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Bluetooth Connectivity</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Backup Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Navigation System</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>USB Charging Ports</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Cruise Control</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="p-4 border rounded-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Engine & Performance</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Engine Type</span>
                  <span>2.5L 4-Cylinder</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Horsepower</span>
                  <span>203 hp @ 6600 rpm</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Transmission</span>
                  <span>8-Speed Automatic</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Drivetrain</span>
                  <span>Front-Wheel Drive</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Dimensions</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Length</span>
                  <span>192.1 inches</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Width</span>
                  <span>72.4 inches</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Height</span>
                  <span>56.9 inches</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Cargo Volume</span>
                  <span>15.1 cubic feet</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="policies" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Fuel Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Full to Full. Vehicle must be returned with the same amount of fuel as when rented.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Mileage Policy</h3>
                <p className="text-sm text-muted-foreground">Unlimited mileage included in the rental price.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Cancellation Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Free cancellation up to 24 hours before pickup. After that, a fee of one day rental may apply.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
