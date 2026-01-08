"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Car } from "@/types/car"

interface SearchBoxProps {
  onSearch: (term: string) => void
  cars: Car[]
}

export default function SearchBox({ onSearch, cars }: SearchBoxProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate unique keywords from cars data
  useEffect(() => {
    if (inputValue.length > 0) {
      setIsLoading(true)

      // Simulate AJAX delay
      const timer = setTimeout(() => {
        const keywords = new Set<string>()

        cars.forEach((car) => {
          keywords.add(car.carType)
          keywords.add(car.brand)
          keywords.add(car.carModel)

          // Add individual words from description
          if (car.description) {
            const words = car.description.split(/\s+/).filter((word) => word.length > 3)
            words.forEach((word) => keywords.add(word))
          }
        })

        // Filter suggestions based on input
        const filtered = Array.from(keywords)
          .filter((keyword) => keyword.toLowerCase().includes(inputValue.toLowerCase()))
          .slice(0, 5) // Limit to 5 suggestions

        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
        setIsLoading(false)
      }, 300) // Simulate network delay

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, cars])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSearch = () => {
    onSearch(inputValue)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by car type, brand, model, or description..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-2 w-full bg-white/90 backdrop-blur-sm border-white/30 focus:border-white"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          onClick={handleSearch}
        />
      </div>

      {showSuggestions && (
        <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {isLoading && inputValue.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center">
          <div className="animate-pulse">Searching...</div>
        </div>
      )}
    </div>
  )
}
