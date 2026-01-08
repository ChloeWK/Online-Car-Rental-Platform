"use client"

import { useEffect, useState, useCallback } from "react"
import CarGrid from "@/components/car-grid"
import FilterSection from "@/components/filter-section"
import HeroBanner from "@/components/hero-banner"
import type { Car } from "@/types/car"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import SearchBar from "@/components/search-bar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function Home() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [carTypes, setCarTypes] = useState<string[]>([])
  const [carBrands, setCarBrands] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())

  const router = useRouter()

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
          throw new Error("Failed to fetch cars")
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

    // Set up an interval to refresh car availability every minute (optional, can be removed if only depending on date picker)
    // const intervalId = setInterval(() => {
    //   loadCars()
    // }, 60000) // Check every minute

    // return () => clearInterval(intervalId)
  }, [startDate, endDate]) // Refetch cars when dates change

  // Filter cars based on search term, filters, and date range
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
    }, 500) // Simulate network delay
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
    <div>
      {/* Hero Banner with Search */}
      <HeroBanner>
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
            Find Your Perfect Rental Car
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
            Explore our premium selection of vehicles for any journey, from city commutes to scenic adventures
          </p>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 mb-6">
            <div className="flex flex-col gap-4">
              <SearchBar
                onSearch={(term) => {
                  setSearchTerm(term)
                  // Category filtering is now handled by separate state and useEffect
                  // if (category) {
                  //   setSelectedType(category)
                  // }
                }}
                categories={carTypes || []}
                cars={cars || []}
                brands={carBrands || []}
              />

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <div className="text-white text-sm font-medium mb-1 sm:mb-0 sm:mr-2 sm:self-center">Select Dates:</div>
                {/* Start Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/90 text-gray-800 border-white/30 hover:bg-white w-full sm:w-auto justify-start"
                    >
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
                    <Button
                      variant="outline"
                      className="bg-white/90 text-gray-800 border-white/30 hover:bg-white w-full sm:w-auto justify-start"
                    >
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary/90 hover:bg-primary" onClick={() => router.push("/cars")}>
              Browse All Cars
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white hover:bg-white/20"
              onClick={() => router.push("/special-offers")}
            >
              Special Offers
            </Button>
          </div>
        </div>
      </HeroBanner>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Find Cars by Category</h2>
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
          <div className="py-12">
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CarGrid cars={filteredCars} />
        )}
      </div>
    </div>
  )
}
