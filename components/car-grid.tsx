import type { Car } from "@/types/car"
import CarCard from "./car-card"
import { cn } from "@/lib/utils"

interface CarGridProps {
  cars: Car[]
  className?: string
}

export default function CarGrid({ cars, className }: CarGridProps) {
  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No cars found</h2>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {cars.map((car) => (
        <CarCard key={car.vin} car={car} />
      ))}
    </div>
  )
}
