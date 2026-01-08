"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import type { Car } from "@/types/car"
import Image from "next/image"

interface SearchBarProps {
  onSearch: (query: string) => void
  cars: Car[]
  categories: string[]
  brands: string[]
  className?: string
}

export default function SearchBar({ onSearch, cars, categories, brands, className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter cars based on search query
  const filteredCars = query
    ? cars.filter(
        (car) =>
          car.brand.toLowerCase().includes(query.toLowerCase()) ||
          car.carModel.toLowerCase().includes(query.toLowerCase()) ||
          car.carType.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  // Get unique brands that match the query
  const matchingBrands = Array.from(
    new Set(cars.filter((car) => car.brand.toLowerCase().includes(query.toLowerCase())).map((car) => car.brand)),
  ).sort()

  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query)
      setShowSuggestions(false)
    }
  }

  // Handle key navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredCars.length === 0) return

    // Calculate the total number of items (brands + cars)
    const totalItems = matchingBrands.length + filteredCars.length

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0) {
        if (selectedIndex < matchingBrands.length) {
          // Selected a brand
          const brand = matchingBrands[selectedIndex]
          setQuery(brand)
          onSearch(brand)
        } else {
          // Selected a car
          const carIndex = selectedIndex - matchingBrands.length
          const car = filteredCars[carIndex]
          setQuery(`${car.brand} ${car.carModel}`)
          router.push(`/cars/${car.vin}`)
        }
        setShowSuggestions(false)
      } else {
        handleSearch()
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get brand logo
  const getBrandLogo = (brand: string) => {
    return `/brand-logos/${brand.toLowerCase()}.png`
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by brand, model, or type..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => {
                setQuery("")
                setShowSuggestions(false)
                inputRef.current?.focus()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} className="ml-2">
          Search
        </Button>
      </div>

      {showSuggestions && query.length > 0 && (filteredCars.length > 0 || matchingBrands.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Brand suggestions */}
          {matchingBrands.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-muted-foreground mb-1 px-2">Brands</h3>
              <div className="space-y-1">
                {matchingBrands.map((brand, index) => (
                  <div
                    key={brand}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
                      selectedIndex === index ? "bg-muted" : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setQuery(brand)
                      onSearch(brand)
                      setShowSuggestions(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        src={getBrandLogo(brand) || "/placeholder.svg"}
                        alt={brand}
                        width={24}
                        height={24}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                        }}
                      />
                    </div>
                    <span className="font-medium">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Car suggestions */}
          {filteredCars.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-muted-foreground mb-1 px-2">Cars</h3>
              <div className="space-y-1">
                {filteredCars.slice(0, 8).map((car, index) => (
                  <div
                    key={car.vin}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
                      selectedIndex === index + matchingBrands.length ? "bg-muted" : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      router.push(`/cars/${car.vin}`)
                      setShowSuggestions(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(index + matchingBrands.length)}
                  >
                    <div className="relative w-10 h-10 bg-muted rounded overflow-hidden">
                      <Image
                        src={car.image || "/placeholder.svg"}
                        alt={`${car.brand} ${car.carModel}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {car.brand} {car.carModel}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>{car.carType}</span>
                        <span>•</span>
                        <span>${car.pricePerDay}/day</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
