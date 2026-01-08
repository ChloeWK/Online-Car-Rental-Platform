"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Car } from "@/types/car"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPinIcon } from "lucide-react"
import { getLocationById } from "@/lib/locations"

interface CarCardProps {
  car: Car
}

export default function CarCard({ car }: CarCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const location = getLocationById(car.currentLocationId)

  const handleDetailsClick = () => {
    router.push(`/cars/${car.vin}`)
  }

  const handleRentClick = async () => {
    setIsLoading(true)
    try {
      router.push(`/cars/${car.vin}`)
    } catch (error) {
      console.error("Error navigating to car details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${car.brand} ${car.carModel}`}
          fill
          className="object-cover"
        />
        <Badge variant={car.isAvailable ? "default" : "destructive"} className="absolute top-2 left-2">
          {car.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="font-bold text-lg">
            {car.brand} {car.carModel}
          </h3>
          <p className="text-muted-foreground text-sm">{car.carType}</p>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPinIcon className="h-4 w-4" />
          <span>{location ? location.name : "Unknown location"}</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Price per day</p>
              <p className="font-bold">${car.pricePerDay}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDetailsClick}>
              Details
            </Button>
            <Button onClick={handleRentClick} disabled={isLoading || (car.inventory !== undefined && car.inventory <= 0) || !car.isAvailable}>
              {isLoading ? "Loading..." : car.isAvailable ? "Rent Now" : "Unavailable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 flex flex-col flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="mt-auto pt-4">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
