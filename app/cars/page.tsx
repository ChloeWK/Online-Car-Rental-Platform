"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import CarGrid from "@/components/car-grid"
import FilterSection from "@/components/filter-section"
import type { Car } from "@/types/car"
import { Button } from "@/components/ui/button"
import { Loader2, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

// Import the new SearchBar component
import SearchBar from "@/components/search-bar"

export default function CarsPage() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type")
  const initialBrand = searchParams.get("brand")

  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(initialType)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand)
  const [isLoading, setIsLoading] = useState(true)
  const [carTypes, setCarTypes] = useState<string[]>([])
  const [carBrands, setCarBrands] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())

  // Initial data load
  useEffect(() => {
    const loadCars = async () => {
      setIsLoading(true)
      try {
        // Fetch cars from API which now includes real-time availability based on selected dates
        const queryParams = new URLSearchParams();
        if (startDate) {
          queryParams.append('startDate', startDate.toISOString());
        }
        if (endDate) {
          queryParams.append('endDate', endDate.toISOString());
        }
        const url = `/api/cars?${queryParams.toString()}`;

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch cars: ${response.status} ${response.statusText}`)
        }
        const allCars = await response.json()

        setCars(allCars)
        setFilteredCars(allCars)

        // Extract unique car types and brands
        setCarTypes(Array.from(new Set(allCars.map((car: Car) => car.carType))))
        setCarBrands(Array.from(new Set(allCars.map((car: Car) => car.brand))))
      } catch (error) {
        console.error("Error loading cars:", error)
        // Set empty arrays as fallback
        setCars([])
        setFilteredCars([])
        setCarTypes([])
        setCarBrands([])
      } finally {
        setIsLoading(false)
      }
    }
    loadCars()

    // Set up an interval to refresh car availability every minute (optional)
    // const intervalId = setInterval(() => {
    //   loadCars()
    // }, 60000) // Check every minute

    // return () => clearInterval(intervalId)
  }, [startDate, endDate]) // Refetch cars when dates change

  // Filter cars based on search term, filters, and date range (availability handled by backend)
  const filterCars = useCallback(() => {
    setIsLoading(true)

    // Simulate AJAX delay
    setTimeout(async () => {
      let result = cars

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        result = result.filter(
          (car) =>
            car.carType.toLowerCase().includes(term) ||
            car.brand.toLowerCase().includes(term) ||
            car.carModel.toLowerCase().includes(term) ||
            (car.features && car.features.some((feature) => feature.toLowerCase().includes(term))),
        )
      }

      // Apply type filter
      if (selectedType) {
        result = result.filter((car) => car.carType === selectedType)
      }

      // Apply brand filter
      if (selectedBrand) {
        result = result.filter((car) => car.brand === selectedBrand)
      }

      setFilteredCars(result)
      setIsLoading(false)
    }, 300) // Simulate network delay
  }, [searchTerm, selectedType, selectedBrand, cars])

  // Apply filters when dependencies change
  useEffect(() => {
    filterCars()
  }, [searchTerm, selectedType, selectedBrand, filterCars])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type)
  }

  const handleBrandFilter = (brand: string | null) => {
    setSelectedBrand(brand)
  }

  // Add localStorage for selected dates when they change
  useEffect(() => {
    if (startDate) {
      localStorage.setItem("selectedStartDate", startDate.toISOString())
    }
    if (endDate) {
      localStorage.setItem("selectedEndDate", endDate.toISOString())
    }
  }, [startDate, endDate])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Vehicles</h1>

      <div className="bg-muted/30 p-4 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            onSearch={(term) => {
              handleSearch(term)
              // Category filtering is now handled by separate state and effects
              // if (category) {
              //   handleTypeFilter(category)
              // }
            }}
            categories={carTypes || []}
            cars={cars || []}
            brands={carBrands || []}
          />

          <div className="flex gap-2 mt-4 md:mt-0">
            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date)
                      // If end date is before start date, update end date
                      if (date > endDate) {
                        setEndDate(date)
                      }
                    }
                  }}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>

            {/* End Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                  disabled={(date) => date < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Vehicles</h2>
        <FilterSection
          carTypes={carTypes || []}
          carBrands={carBrands || []}
          selectedType={selectedType}
          selectedBrand={selectedBrand}
          onTypeChange={handleTypeFilter}
          onBrandChange={handleBrandFilter}
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vehicles...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {filteredCars.length} vehicles{selectedType ? ` - ${selectedType}` : ""}
              {selectedBrand ? ` - ${selectedBrand}` : ""}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedType(null)
                setSelectedBrand(null)
                setSearchTerm("")
                setStartDate(new Date())
                setEndDate(new Date())
              }}
              disabled={!selectedType && !selectedBrand && !searchTerm}
            >
              Clear Filters
            </Button>
          </div>
          <CarGrid cars={filteredCars} />
        </>
      )}
    </div>
  )
}
