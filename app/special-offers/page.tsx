"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Car } from "@/types/car"

interface SpecialOffer {
  id: string
  title: string
  description: string
  discountPercentage: number
  validUntil: string
  carVin: string
  car?: Car
  image: string
  minDays: number
  code: string
}

export default function SpecialOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<SpecialOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cars, setCars] = useState<Car[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch cars
        const carsResponse = await fetch("/api/cars")
        const carsData = await carsResponse.json()
        setCars(carsData)

        // Create mock special offers based on cars
        const mockOffers: SpecialOffer[] = [
          {
            id: "offer-1",
            title: "Weekend Special",
            description: "Enjoy special discounts on weekend rentals for all luxury vehicles",
            discountPercentage: 15,
            validUntil: "2025-06-30",
            carVin: carsData.find((c: Car) => c.carType === "Luxury")?.vin || "",
            image: "/special-offer-weekend.png",
            minDays: 2,
            code: "WEEKEND15",
          },
          {
            id: "offer-2",
            title: "Long-Term Rental Discount",
            description: "Get an extra discount for rentals longer than 7 days",
            discountPercentage: 20,
            validUntil: "2025-07-15",
            carVin: carsData.find((c: Car) => c.carType === "Sedan")?.vin || "",
            image: "/special-offer-longterm.png",
            minDays: 7,
            code: "LONG20",
          },
          {
            id: "offer-3",
            title: "SUV Family Package",
            description: "Rent an SUV and get a free roof rack and GPS navigation",
            discountPercentage: 10,
            validUntil: "2025-08-31",
            carVin: carsData.find((c: Car) => c.carType === "SUV")?.vin || "",
            image: "/special-offer-suv.png",
            minDays: 3,
            code: "FAMILY10",
          },
          {
            id: "offer-4",
            title: "First-Time Renter Discount",
            description: "Special discount for first-time customers",
            discountPercentage: 25,
            validUntil: "2025-12-31",
            carVin: carsData.find((c: Car) => c.carType === "Hatchback")?.vin || "",
            image: "/special-offer-first.png",
            minDays: 1,
            code: "FIRST25",
          },
        ]

        // Attach car details to offers
        const offersWithCars = mockOffers.map((offer) => ({
          ...offer,
          car: carsData.find((car: Car) => car.vin === offer.carVin),
        }))

        setOffers(offersWithCars)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleViewOffer = (offer: SpecialOffer) => {
    if (offer.car) {
      router.push(`/cars/${offer.car.vin}?offer=${offer.code}`)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading special offers...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Special Offers</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our limited-time special offers to save more on your journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <div className="relative h-64 w-full">
              <Image
                src={offer.image || "/placeholder.svg?height=400&width=600&query=special offer"}
                alt={offer.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-white text-lg px-3 py-1">{offer.discountPercentage}% OFF</Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>
              <p className="text-muted-foreground mb-4">{offer.description}</p>

              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    Minimum rental: {offer.minDays} day{offer.minDays > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <span>
                    Promo code: <span className="font-mono font-semibold">{offer.code}</span>
                  </span>
                </div>
              </div>

              {offer.car && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={offer.car.image || "/placeholder.svg"}
                        alt={`${offer.car.brand} ${offer.car.carModel}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {offer.car?.brand} {offer.car?.carModel}
                      </h3>
                      <p className="text-sm text-muted-foreground">{offer.car?.carType}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button className="w-full" onClick={() => handleViewOffer(offer)}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
