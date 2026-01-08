import Image from "next/image"
import type { Car } from "@/types/car"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { getLocationById } from "@/lib/locations"

interface CarDetailsProps {
  car: Car
}

export default function CarDetails({ car }: CarDetailsProps) {
  // Get the current location name
  const currentLocation = getLocationById(car.currentLocationId)

  return (
    <Card className="overflow-hidden">
      <div className="relative h-64 w-full">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${car.brand} ${car.carModel}`}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-bold text-2xl">
              {car.brand} {car.carModel}
            </h2>
            <p className="text-muted-foreground">{car.carType}</p>
          </div>
          <Badge variant={car.isAvailable ? "default" : "destructive"} className="absolute top-2 left-2 text-sm">
            {car.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>

        {/* Current Location */}
        <div className="flex items-start gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Current Location</p>
            {currentLocation ? (
              <p className="text-sm text-muted-foreground">
                {currentLocation.name} - {currentLocation.city}, {currentLocation.state}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Unknown location</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Year</p>
            <p className="font-medium">{car.yearOfManufacture}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mileage</p>
            <p className="font-medium">{car.mileage}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fuel Type</p>
            <p className="font-medium">{car.fuelType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price Per Day</p>
            <p className="font-medium text-lg">${car.pricePerDay}</p>
          </div>
        </div>

        {car.description && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1">{car.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
